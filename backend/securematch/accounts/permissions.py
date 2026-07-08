from rest_framework.permissions import BasePermission

def get_user_role(user):
    """
    Retrieves the primary group name for the user to be used as 'role'.
    Follows the same alphabetical ordering logic as the serializer.
    """
    if not user or not user.is_authenticated:
        return None
    group = user.groups.all().order_by("name").first()
    return group.name if group else None

class BaseRolePermission(BasePermission):
    """
    Base class for role-based authorization to avoid duplicated role-checking logic.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = get_user_role(request.user)
        return role in self.allowed_roles

class IsSuperAdministrator(BaseRolePermission):
    allowed_roles = ["Super Administrator"]

class IsInternalAnalyst(BaseRolePermission):
    allowed_roles = ["Internal Analyst"]

class IsComplianceOfficer(BaseRolePermission):
    allowed_roles = ["Compliance Officer"]

class IsExternalAuditor(BaseRolePermission):
    allowed_roles = ["External Auditor"]

class IsReadOnlyAnalyst(BaseRolePermission):
    allowed_roles = ["Read Only Analyst"]

# Reusable helper permissions
class IsInternalUser(BaseRolePermission):
    """
    Allows Internal Analyst, Compliance Officer, and Super Administrator.
    """
    allowed_roles = ["Internal Analyst", "Compliance Officer", "Super Administrator"]

class IsAdministrator(BaseRolePermission):
    """
    Allows Super Administrator only.
    """
    allowed_roles = ["Super Administrator"]
