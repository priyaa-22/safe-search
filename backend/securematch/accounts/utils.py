from accounts.constants import Roles

def get_primary_role(user) -> str:
    """
    Retrieves the primary role for a user.
    Django Superusers resolve to Roles.ADMINISTRATOR regardless of group membership.
    Otherwise, returns the name of the user's alphabetically first group (primary group).
    If no group exists, returns Roles.NO_ROLE.
    Results are cached on the user instance.
    """
    if not user or not user.is_authenticated:
        return Roles.NO_ROLE

    if not hasattr(user, "_cached_primary_role"):
        if user.is_superuser:
            user._cached_primary_role = Roles.ADMINISTRATOR
        else:
            group = user.groups.all().order_by("name").first()
            user._cached_primary_role = group.name if group else Roles.NO_ROLE

    return user._cached_primary_role


def has_role(user, role: str) -> bool:
    """
    Checks if the user has the specified primary role.
    """
    if not user or not user.is_authenticated:
        return False
    return get_primary_role(user) == role


def has_any_role(user, roles: list[str]) -> bool:
    """
    Checks if the user's primary role matches any of the specified roles.
    """
    if not user or not user.is_authenticated:
        return False
    return get_primary_role(user) in roles


def is_administrator(user) -> bool:
    """
    Checks if the user has the Administrator role (either as superuser or group member).
    """
    return has_role(user, Roles.ADMINISTRATOR)


def is_internal_user(user) -> bool:
    """
    Checks if the user has an internal analyst, compliance officer, or administrative role.
    """
    return has_any_role(user, Roles.internal_roles() + Roles.administrative_roles())


def is_external_auditor(user) -> bool:
    """
    Checks if the user has an external auditor role.
    """
    return has_any_role(user, Roles.auditor_roles())
