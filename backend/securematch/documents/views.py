import time
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from crypto_engine.peks import generate_rsa_keypair
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounts.permissions import (
    IsSuperAdministrator,
    IsInternalAnalyst,
    IsComplianceOfficer,
    IsExternalAuditor,
    IsReadOnlyAnalyst,
    IsInternalUser,
    IsAdministrator
)


from crypto_engine.peks import hash_keyword, verify_signature
from crypto_engine.sse import (
    encrypt_document,
    generate_token,
    generate_trapdoor,
    decrypt_document
)

from documents.models import (
    Auditor,
    EncryptedDocument,
    SearchTokenIndex,
    ExternalSearchAudit
)

from .constants import SEARCHABLE_FIELDS
from .utils import success_response, error_response, log_auditor_event, get_client_ip


MAX_EXTERNAL_RESULTS = 50
MAX_INTERNAL_RESULTS = 50


# ---------------------------------------------------
#  Upload & Index
# ---------------------------------------------------

class UploadDocumentView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator | IsInternalAnalyst]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def post(self, request):
        try:
            data = request.data

            if not isinstance(data, dict):
                return Response(
                    error_response("INVALID_JSON", "Invalid JSON object"),
                    status=status.HTTP_400_BAD_REQUEST
                )

            encrypted_blob = encrypt_document(data)

            doc = EncryptedDocument.objects.create(
                encrypted_blob=encrypted_blob
            )

            for field in SEARCHABLE_FIELDS:
                if field in data and data[field] is not None:

                    value = str(data[field]).strip()
                    if not value:
                        continue

                    token = generate_token(field, value)
                    external_token = hash_keyword(value)

                    SearchTokenIndex.objects.create(
                        token=token,
                        external_token=external_token,
                        document=doc
                    )

            return Response(
                success_response(
                    data={"message": "Document encrypted and indexed"}
                ),
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                error_response("UPLOAD_FAILED", "Upload failed"),
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
#  Internal Secure Search (SSE)
# ---------------------------------------------------

class InternalSearchView(APIView):
    permission_classes = [IsAuthenticated, IsInternalUser | IsReadOnlyAnalyst]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def post(self, request):
        try:
            query_data = request.data

            if not isinstance(query_data, dict) or not query_data:
                return Response(
                    error_response("INVALID_QUERY", "Invalid search query"),
                    status=status.HTTP_400_BAD_REQUEST
                )

            start_time = time.perf_counter()
            matching_doc_ids = None

            for field, value in query_data.items():
                trapdoor = generate_trapdoor(field, str(value))

                token_matches = SearchTokenIndex.objects.filter(
                    token=trapdoor
                ).values_list("document_id", flat=True)

                token_doc_ids = set(token_matches)

                if matching_doc_ids is None:
                    matching_doc_ids = token_doc_ids
                else:
                    matching_doc_ids = matching_doc_ids.intersection(token_doc_ids)

            if not matching_doc_ids:
                execution_time = round((time.perf_counter() - start_time) * 1000, 2)

                return Response(
                    success_response(
                        data={"results": []},
                        meta={
                            "total_matches": 0,
                            "returned_count": 0,
                            "truncated": False,
                            "execution_time_ms": execution_time
                        }
                    ),
                    status=status.HTTP_200_OK
                )

            total_matches = len(matching_doc_ids)
            truncated = total_matches > MAX_INTERNAL_RESULTS

            limited_ids = list(matching_doc_ids)[:MAX_INTERNAL_RESULTS]

            encrypted_docs = EncryptedDocument.objects.filter(
                id__in=limited_ids
            )

            results = [
                decrypt_document(doc.encrypted_blob)
                for doc in encrypted_docs
            ]

            execution_time = round((time.perf_counter() - start_time) * 1000, 2)

            return Response(
                success_response(
                    data={"results": results},
                    meta={
                        "total_matches": total_matches,
                        "returned_count": len(results),
                        "truncated": truncated,
                        "execution_time_ms": execution_time
                    }
                ),
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                error_response("INTERNAL_SEARCH_FAILED", "Search failed"),
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
#  External Public-Key Search (Hardened)
# ---------------------------------------------------

class ExternalSearchView(APIView):
    permission_classes = [IsAuthenticated, IsExternalAuditor | IsSuperAdministrator]

    def post(self, request):
        total_start = time.perf_counter()

        auditor_id = request.data.get("auditor_id")
        request_key_version = request.data.get("key_version")
        keyword_hash = request.data.get("keyword_hash")
        signature = request.data.get("signature")

        if not auditor_id or not keyword_hash or not signature:
            return Response(
                error_response("MISSING_FIELDS", "Required fields missing"),
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        current_key_version = getattr(auditor, "key_version", 1)
        if request_key_version is not None and str(request_key_version) != str(current_key_version):
            log_auditor_event(
                auditor=auditor,
                event_type="EXTERNAL_SEARCH",
                performed_by=request.user,
                ip_address=get_client_ip(request),
                success=False,
                failure_reason="KEY_VERSION_MISMATCH",
                keyword_hash=keyword_hash,
                key_version=current_key_version,
                execution_time_ms=round(
                    (time.perf_counter() - total_start) * 1000, 2
                )
            )

            return Response(
                error_response("KEY_VERSION_MISMATCH", "Auditor key version mismatch"),
                status=status.HTTP_403_FORBIDDEN
            )

        # Signature Verification
        verify_start = time.perf_counter()
        is_valid = verify_signature(
            keyword_hash,
            signature,
            auditor.public_key
        )
        verify_time = (time.perf_counter() - verify_start) * 1000

        if not is_valid:
            log_auditor_event(
                auditor=auditor,
                event_type="EXTERNAL_SEARCH",
                performed_by=request.user,
                ip_address=get_client_ip(request),
                success=False,
                failure_reason="INVALID_SIGNATURE",
                keyword_hash=keyword_hash,
                key_version=getattr(auditor, "key_version", 1),
                execution_time_ms=round(
                    (time.perf_counter() - total_start) * 1000, 2
                )
            )

            return Response(
                error_response("INVALID_SIGNATURE", "Signature verification failed"),
                status=status.HTTP_403_FORBIDDEN
            )

        # Fetch Matches
        matches = SearchTokenIndex.objects.filter(
            external_token=keyword_hash
        ).select_related("document")

        total_matches = matches.count()
        limited_matches = matches[:MAX_EXTERNAL_RESULTS]

        encrypted_results = [
            {
                "nonce": m.document.encrypted_blob["nonce"],
                "ciphertext": m.document.encrypted_blob["ciphertext"]
            }
            for m in limited_matches
        ]

        # RESULT PADDING (Fixed Size)
        if len(encrypted_results) < MAX_EXTERNAL_RESULTS:
            padding_needed = MAX_EXTERNAL_RESULTS - len(encrypted_results)

            for _ in range(padding_needed):
                encrypted_results.append({
                    "nonce": "0" * 24,
                    "ciphertext": "0" * 64,
                    "padded": True
                })

        total_time = (time.perf_counter() - total_start) * 1000

        # Frequency Monitoring
        one_hour_ago = timezone.now() - timedelta(hours=1)

        recent_search_count = ExternalSearchAudit.objects.filter(
            auditor=auditor,
            created_at__gte=one_hour_ago
        ).count()

        # Audit Log
        audit_entry = log_auditor_event(
            auditor=auditor,
            event_type="EXTERNAL_SEARCH",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            keyword_hash=keyword_hash,
            total_matches=total_matches,
            returned_count=min(total_matches, MAX_EXTERNAL_RESULTS),
            truncated=total_matches > MAX_EXTERNAL_RESULTS,
            execution_time_ms=round(total_time, 2),
            key_version=getattr(auditor, "key_version", 1)
        )

        return Response(
            success_response(
                data={
                    "results": encrypted_results
                },
                meta={
                    "total_matches": total_matches,
                    "returned_count": min(total_matches, MAX_EXTERNAL_RESULTS),
                    "truncated": total_matches > MAX_EXTERNAL_RESULTS,
                    "execution_time_ms": round(total_time, 2),
                    "signature_verification_ms": round(verify_time, 2),
                    "audit_log_id": audit_entry.id,
                    "searches_last_hour": recent_search_count,
                    "key_version_used": getattr(auditor, "key_version", 1),
                    "response_padded": total_matches < MAX_EXTERNAL_RESULTS
                }
            ),
            status=status.HTTP_200_OK
        )

class RotateAuditorKeyView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def post(self, request):
        auditor_id = request.data.get("auditor_id")
        new_public_key = request.data.get("new_public_key")

        if not auditor_id or not new_public_key:
            return Response(
                error_response("MISSING_FIELDS", "auditor_id and new_public_key required"),
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        # Simulated key version increment
        current_version = getattr(auditor, "key_version", 1)
        auditor.public_key = new_public_key
        auditor.key_version = current_version + 1
        auditor.save()

        return Response(
            success_response(
                data={
                    "auditor_id": auditor.id,
                    "new_key_version": auditor.key_version
                }
            ),
            status=status.HTTP_200_OK
        )


class VerifyAuditorCredentialsView(APIView):
    permission_classes = [IsAuthenticated, IsExternalAuditor | IsSuperAdministrator]

    def post(self, request):
        auditor_id = request.data.get("auditor_id")
        signature = request.data.get("signature")

        if not auditor_id or not signature:
            return Response(
                error_response("MISSING_FIELDS", "auditor_id and signature required"),
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        probe = f"auditor-probe:{auditor.id}"
        probe_hash = hashlib.sha256(probe.encode()).hexdigest()
        is_valid = verify_signature(probe_hash, signature, auditor.public_key)

        if not is_valid:
            log_auditor_event(
                auditor=auditor,
                event_type="CREDENTIAL_DOWNLOADED",
                performed_by=request.user,
                ip_address=get_client_ip(request),
                success=False,
                failure_reason="INVALID_SIGNATURE",
                metadata={"action": "verify"}
            )
            return Response(
                error_response("INVALID_SIGNATURE", "Private key does not match selected auditor"),
                status=status.HTTP_403_FORBIDDEN
            )

        log_auditor_event(
            auditor=auditor,
            event_type="CREDENTIAL_DOWNLOADED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"action": "verify"}
        )

        return Response(
            success_response(
                data={
                    "auditor_id": auditor.id,
                    "name": auditor.name,
                    "active_key_version": auditor.key_version,
                    "created_at": auditor.created_at.isoformat()
                }
            ),
            status=status.HTTP_200_OK
        )

class AuditorLogsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator | IsComplianceOfficer]

    def get(self, request, auditor_id):

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        logs = ExternalSearchAudit.objects.filter(
            auditor=auditor
        )[:100]

        data = [
            {
                "id": log.id,
                "keyword_hash": log.keyword_hash,
                "success": log.success,
                "total_matches": log.total_matches,
                "returned_count": log.returned_count,
                "execution_time_ms": log.execution_time_ms,
                "created_at": log.created_at,
                "key_version": getattr(log, "key_version", 1)
            }
            for log in logs
        ]

        return Response(
            success_response(
                data={"logs": data}
            ),
            status=status.HTTP_200_OK
        )
    
class InternalMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator | IsComplianceOfficer]

    def get(self, request):
        try:
            now = timezone.now()
            last_24h = now - timedelta(hours=24)

            total_documents = EncryptedDocument.objects.count()
            total_tokens = SearchTokenIndex.objects.count()

            external_tokens = SearchTokenIndex.objects.exclude(
                external_token__isnull=True
            ).count()

            avg_external = ExternalSearchAudit.objects.filter(
                success=True
            ).aggregate(avg=Avg("execution_time_ms"))["avg"] or 0

            external_24h = ExternalSearchAudit.objects.filter(
                created_at__gte=last_24h
            ).count()

            failed_24h = ExternalSearchAudit.objects.filter(
                created_at__gte=last_24h,
                success=False
            ).count()

            last_doc = EncryptedDocument.objects.order_by("-created_at").first()
            last_index_update = (
                last_doc.created_at.isoformat()
                if last_doc else None
            )

            # 🔑 Multi-Auditor Key Info
            auditors = Auditor.objects.all().order_by("id")

            auditor_data = [
                {
                    "auditor_id": a.id,
                    "name": a.name,
                    "public_key": a.public_key,
                    "active_key_version": a.key_version,
                    "created_at": a.created_at.isoformat()
                }
                for a in auditors
            ]

            return Response({
                "data": {
                    "system_metrics": {
                        "total_documents": total_documents,
                        "total_tokens": total_tokens,
                        "external_tokens": external_tokens,
                        "avg_external_search_ms": round(avg_external, 2),
                        "external_searches_last_24h": external_24h,
                        "failed_external_searches_last_24h": failed_24h,
                        "last_index_update": last_index_update
                    },
                    "auditors": auditor_data
                }
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )      

    def head(self, request):
        """Respond to HEAD checks (UptimeRobot friendly).

        Returns 200 with no body so external uptime monitors can verify service availability.
        """
        return Response(status=status.HTTP_200_OK)

class ExternalMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            total_documents = EncryptedDocument.objects.count()

            return Response({
                "data": {
                    "total_documents": total_documents
                }
            })

        except Exception:
            return Response(
                {"error": "Failed to fetch metrics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RotateAuditorKeyView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def post(self, request):
        auditor_id = request.data.get("auditor_id")

        if not auditor_id:
            return Response(
                error_response("MISSING_AUDITOR_ID", "Auditor ID required"),
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate new keypair
        private_key, public_key = generate_rsa_keypair()

        old_key_version = auditor.key_version
        # Rotate
        auditor.public_key = public_key
        auditor.key_version += 1
        auditor.save()

        log_auditor_event(
            auditor=auditor,
            event_type="KEY_ROTATED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"old_key_version": old_key_version, "new_key_version": auditor.key_version}
        )
        log_auditor_event(
            auditor=auditor,
            event_type="KEY_GENERATED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"key_version": auditor.key_version}
        )
        log_auditor_event(
            auditor=auditor,
            event_type="CREDENTIAL_DOWNLOADED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"key_version": auditor.key_version, "action": "rotate_download"}
        )

        return Response(
            success_response(
                data={
                    "new_private_key": private_key,
                    "new_public_key": public_key,
                    "new_key_version": auditor.key_version
                }
            ),
            status=status.HTTP_200_OK
        )
    
class CreateAuditorView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def post(self, request):
        name = request.data.get("name")

        if not name:
            return Response(
                error_response("MISSING_NAME", "Auditor name required"),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate keypair
        private_key, public_key = generate_rsa_keypair()

        auditor = Auditor.objects.create(
            name=name,
            public_key=public_key,
            key_version=1
        )

        log_auditor_event(
            auditor=auditor,
            event_type="AUDITOR_CREATED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"name": auditor.name}
        )
        log_auditor_event(
            auditor=auditor,
            event_type="KEY_GENERATED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"key_version": auditor.key_version}
        )
        log_auditor_event(
            auditor=auditor,
            event_type="CREDENTIAL_DOWNLOADED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"key_version": auditor.key_version, "action": "create_download"}
        )

        return Response(
            success_response(
                data={
                    "auditor_id": auditor.id,
                    "name": auditor.name,
                    "public_key": public_key,
                    "private_key": private_key,  # Return only once
                    "key_version": auditor.key_version
                }
            ),
            status=status.HTTP_201_CREATED
        )

class DeleteAuditorView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def delete(self, request, auditor_id):
        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        log_auditor_event(
            auditor=auditor,
            event_type="ACCOUNT_DELETED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"auditor_id": auditor.id, "name": auditor.name}
        )

        auditor.delete()

        return Response(
            success_response(
                data={"message": "Auditor deleted successfully"}
            ),
            status=status.HTTP_200_OK
        )


class UpdateAuditorView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def patch(self, request, auditor_id):
        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        name = request.data.get("name")
        if not name:
            return Response(
                error_response("MISSING_NAME", "Auditor name required"),
                status=status.HTTP_400_BAD_REQUEST
            )

        old_name = auditor.name
        auditor.name = name
        auditor.save()

        log_auditor_event(
            auditor=auditor,
            event_type="ACCOUNT_UPDATED",
            performed_by=request.user,
            ip_address=get_client_ip(request),
            success=True,
            metadata={"old_name": old_name, "new_name": name}
        )

        return Response(
            success_response(
                data={
                    "auditor_id": auditor.id,
                    "name": auditor.name,
                    "key_version": auditor.key_version
                }
            ),
            status=status.HTTP_200_OK
        )


from rest_framework.pagination import PageNumberPagination

class AuditorTimelinePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

class AuditorTimelineView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator | IsComplianceOfficer]

    def get(self, request):
        logs = ExternalSearchAudit.objects.all().order_by("-created_at")

        paginator = AuditorTimelinePagination()
        paginated_logs = paginator.paginate_queryset(logs, request, view=self)

        data = []
        for log in paginated_logs:
            performed_by_data = None
            if log.performed_by:
                performed_by_data = {
                    "id": log.performed_by.id,
                    "username": log.performed_by.username,
                    "full_name": f"{log.performed_by.first_name} {log.performed_by.last_name}".strip() or log.performed_by.username,
                }

            auditor_data = None
            if log.auditor:
                auditor_data = {
                    "id": log.auditor.id,
                    "name": log.auditor.name,
                }

            data.append({
                "id": log.id,
                "event_type": log.event_type,
                "auditor": auditor_data,
                "performed_by": performed_by_data,
                "timestamp": log.created_at.isoformat(),
                "success": log.success,
                "failure_reason": log.failure_reason,
                "metadata": log.metadata,
                "keyword_hash": log.keyword_hash,
                "total_matches": log.total_matches,
                "returned_count": log.returned_count,
                "truncated": log.truncated,
                "execution_time_ms": log.execution_time_ms,
                "key_version": log.key_version,
                "ip_address": log.ip_address,
            })

        return Response(
            success_response(
                data={
                    "results": data,
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                }
            ),
            status=status.HTTP_200_OK
        )


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = "up"
            db_healthy = True
        except Exception as e:
            db_status = "down"
            db_healthy = False
            error_details = str(e)

        if db_healthy:
            return Response(
                success_response(
                    data={
                        "status": "healthy",
                        "database": db_status
                    }
                ),
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                error_response(
                    code="DATABASE_UNAVAILABLE",
                    message="Database connection failed",
                    details={"error": error_details}
                ),
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

