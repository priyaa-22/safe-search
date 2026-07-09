import { useAuth } from "../context/AuthContext";
import {
  canAccess as checkAccess,
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
} from "../config/permissions";

export default function usePermissions() {
  const { user } = useAuth();

  return {
    canAccess: (feature) => checkAccess(user, feature),
    hasRole: (role) => checkRole(user, role),
    hasAnyRole: (roles) => checkAnyRole(user, roles),
    user,
  };
}
