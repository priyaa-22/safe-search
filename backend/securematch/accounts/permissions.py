from rest_framework.permissions import BasePermission
from accounts.constants import Roles
from accounts.utils import (
    has_role,
    is_administrator,
    is_internal_user,
    is_external_auditor,
)


class IsSuperAdministrator(BasePermission):
    """
    Allows Administrator only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and is_administrator(request.user))


class IsAdministrator(BasePermission):
    """
    Allows Administrator only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and is_administrator(request.user))


class IsInternalAnalyst(BasePermission):
    """
    Allows Internal Analyst only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and has_role(request.user, Roles.INTERNAL_ANALYST))


class IsComplianceOfficer(BasePermission):
    """
    Allows Compliance Officer only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and has_role(request.user, Roles.COMPLIANCE_OFFICER))


class IsExternalAuditor(BasePermission):
    """
    Allows External Auditor only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and is_external_auditor(request.user))


class IsReadOnlyAnalyst(BasePermission):
    """
    Allows Read Only Analyst only.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and has_role(request.user, Roles.READ_ONLY_ANALYST))


class IsInternalUser(BasePermission):
    """
    Allows Internal Analyst, Compliance Officer, Read Only Analyst, and Administrator.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and is_internal_user(request.user))
