import { Roles } from "../constants/roles";
import { Features } from "../constants/features";

export const RolePermissions = {
  [Roles.ADMINISTRATOR]: [
    Features.CONTROL_CENTER,
    Features.IAM,
    Features.AUDITOR_MANAGEMENT,
    Features.ENCRYPTED_DOCUMENTS,
    Features.SEARCH_OPERATIONS,
    Features.SECURITY_ANALYTICS,
    Features.SYSTEM_SETTINGS,
    Features.PROFILE,
  ],
  [Roles.INTERNAL_ANALYST]: [
    Features.ENCRYPTED_DOCUMENTS,
    Features.SEARCH_OPERATIONS,
    Features.SECURITY_ANALYTICS,
    Features.PROFILE,
  ],
  [Roles.COMPLIANCE_OFFICER]: [
    Features.SEARCH_OPERATIONS,
    Features.SECURITY_ANALYTICS,
    Features.PROFILE,
  ],
  [Roles.EXTERNAL_AUDITOR]: [
    Features.SEARCH_OPERATIONS,
    Features.SECURITY_ANALYTICS,
    Features.PROFILE,
  ],
  [Roles.READ_ONLY_ANALYST]: [
    Features.SEARCH_OPERATIONS,
    Features.SECURITY_ANALYTICS,
    Features.PROFILE,
  ],
};

export function getRoleFromUser(user) {
  if (!user) return Roles.NO_ROLE;
  if (user.is_superuser) return Roles.ADMINISTRATOR;
  const role = user.role;
  if (role === "Super Administrator") return Roles.ADMINISTRATOR;
  return role || Roles.NO_ROLE;
}

export function hasRole(user, role) {
  return getRoleFromUser(user) === role;
}

export function hasAnyRole(user, roles = []) {
  const userRole = getRoleFromUser(user);
  return roles.includes(userRole);
}

export function canAccess(user, feature) {
  const userRole = getRoleFromUser(user);
  if (userRole === Roles.ADMINISTRATOR || user?.is_superuser) {
    return true;
  }
  const allowedFeatures = RolePermissions[userRole] || [];
  return allowedFeatures.includes(feature);
}
