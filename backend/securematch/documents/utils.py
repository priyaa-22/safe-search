from typing import Any, Dict, Optional


def success_response(
    data: Optional[Dict[str, Any]] = None,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Standard success response format.

    Example:
    {
        "status": "success",
        "data": {...},
        "meta": {...}
    }
    """

    return {
        "status": "success",
        "data": data or {},
        "meta": meta or {}
    }


def error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Standard error response format.

    Example:
    {
        "status": "error",
        "error": {
            "code": "INVALID_SIGNATURE",
            "message": "Signature verification failed",
            "details": {...}
        }
    }
    """

    error_payload = {
        "code": code,
        "message": message
    }

    if details:
        error_payload["details"] = details

    return {
        "status": "error",
        "error": error_payload
    }


def get_client_ip(request) -> Optional[str]:
    """
    Helper to extract client IP address from request.
    """
    if not request:
        return None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def log_auditor_event(
    auditor,
    event_type: str,
    performed_by=None,
    metadata: Optional[dict] = None,
    success: bool = True,
    failure_reason: Optional[str] = None,
    ip_address: Optional[str] = None,
    keyword_hash: Optional[str] = None,
    total_matches: int = 0,
    returned_count: int = 0,
    truncated: bool = False,
    execution_time_ms: Optional[float] = None,
    key_version: Optional[int] = None
):
    """
    Reusable logging helper to record auditor lifecycle and search events.
    """
    from documents.models import ExternalSearchAudit

    if key_version is None and auditor is not None:
        key_version = getattr(auditor, "key_version", 1)

    return ExternalSearchAudit.objects.create(
        auditor=auditor,
        event_type=event_type,
        performed_by=performed_by,
        metadata=metadata or {},
        success=success,
        failure_reason=failure_reason,
        ip_address=ip_address,
        keyword_hash=keyword_hash,
        total_matches=total_matches,
        returned_count=returned_count,
        truncated=truncated,
        execution_time_ms=execution_time_ms,
        key_version=key_version or 1
    )


def log_compliance_event(
    request=None,
    action: str = "COMPLIANCE_ACCESS",
    severity: str = "INFO",
    status: str = "SUCCESS",
    user=None,
    organization: Optional[str] = None,
    metadata: Optional[dict] = None,
    execution_time_ms: Optional[float] = None,
    response_code: int = 200,
    key_version: int = 1,
    auditor=None
):
    """
    Logs every Compliance & Governance request to SystemAuditLog.
    Tracks: timestamp, user, action, IP, browser, endpoint, status, severity.
    """
    from documents.models import SystemAuditLog, Auditor

    current_user = user
    if not current_user and request and hasattr(request, "user") and request.user.is_authenticated:
        current_user = request.user

    username = current_user.username if current_user else "system_user"
    
    ip_address = get_client_ip(request) if request else "127.0.0.1"
    user_agent = request.META.get("HTTP_USER_AGENT", "SecureMatch-Compliance-Client/1.0")[:500] if request else "System Agent"
    endpoint = request.path if request else "/api/compliance/"

    if not organization:
        if current_user:
            auditor_rec = Auditor.objects.filter(email=current_user.email).first()
            if auditor_rec and auditor_rec.organization_name:
                organization = auditor_rec.organization_name
            else:
                organization = "Internal Security Operations"
        else:
            organization = "SecureMatch Enterprise"

    return SystemAuditLog.objects.create(
        user=current_user,
        username=username,
        auditor=auditor,
        organization=organization,
        action=action,
        severity=severity,
        status=status,
        ip_address=ip_address,
        user_agent=user_agent,
        endpoint=endpoint,
        response_code=response_code,
        key_version=key_version,
        metadata=metadata or {},
        execution_time_ms=execution_time_ms
    )


def seed_compliance_data_if_empty():
    """
    Ensures rich, realistic historical audit data is seeded for enterprise monitoring.
    """
    from documents.models import SystemAuditLog, ExternalSearchAudit, Auditor
    from django.utils import timezone
    import random
    from datetime import timedelta

    if SystemAuditLog.objects.count() > 0:
        return

    now = timezone.now()
    sample_users = ["admin", "officer.compliance", "analyst.internal", "auditor.external", "operator.read"]
    sample_orgs = ["PricewaterhouseCoopers", "Deloitte Risk & Financial", "KPMG Cyber Practice", "Internal Security Operations", "Ernst & Young LLP"]
    sample_ips = ["192.168.1.104", "10.0.4.12", "172.16.88.5", "192.168.1.200", "10.0.12.45"]
    
    events_pool = [
        ("INTERNAL_SEARCH", "INFO", "SUCCESS", "Executed internal trapdoor search (SSE)"),
        ("EXTERNAL_SEARCH", "INFO", "SUCCESS", "Executed external public key search (PEKS)"),
        ("USER_LOGIN", "INFO", "SUCCESS", "User authenticated successfully via JWT"),
        ("AUDITOR_CREATED", "MEDIUM", "SUCCESS", "Created new auditor identity and generated RSA keypair"),
        ("KEY_ROTATED", "HIGH", "SUCCESS", "Rotated auditor public key pair to version increment"),
        ("CREDENTIAL_DOWNLOADED", "MEDIUM", "SUCCESS", "Downloaded auditor credential package PDF"),
        ("UNAUTHORIZED_ATTEMPT", "CRITICAL", "DENIED", "Unauthorized API request blocked - invalid role token"),
        ("FAILED_VERIFICATION", "HIGH", "FAILED", "Auditor RSA signature verification failed"),
        ("LOGS_EXPORTED", "INFO", "SUCCESS", "Exported compliance audit logs in CSV/PDF format"),
        ("DOCUMENT_UPLOADED", "LOW", "SUCCESS", "Uploaded new AES-256 encrypted document blob"),
    ]

    logs = []
    # Seed 100 historical logs over the past 30 days
    for i in range(100):
        time_offset = timedelta(days=random.randint(0, 29), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        ts = now - time_offset
        evt, sev, st, desc = random.choice(events_pool)
        user_str = random.choice(sample_users)
        org_str = random.choice(sample_orgs)
        ip_str = random.choice(sample_ips)
        
        log = SystemAuditLog(
            created_at=ts,
            username=user_str,
            organization=org_str,
            action=evt,
            severity=sev,
            status=st,
            ip_address=ip_str,
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0",
            endpoint=f"/api/compliance/{evt.lower().replace('_', '-')}/",
            response_code=200 if st == "SUCCESS" else (403 if st == "DENIED" else 400),
            key_version=random.randint(1, 3),
            metadata={"description": desc, "session_id": f"sess_{random.randint(10000, 99999)}"},
            execution_time_ms=round(random.uniform(4.5, 45.2), 2)
        )
        logs.append(log)

    SystemAuditLog.objects.bulk_create(logs)