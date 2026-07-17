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