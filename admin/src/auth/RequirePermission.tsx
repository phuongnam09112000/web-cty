import type { ReactNode } from "react";
import type { PermissionKey } from "../api/types";
import { ForbiddenPage } from "../pages/forbidden/ForbiddenPage";
import { useAuth } from "./AuthProvider";

export function RequirePermission({ anyOf, children }: { anyOf: PermissionKey[]; children: ReactNode }) {
  const { can } = useAuth();
  if (!anyOf.some((key) => can(key))) return <ForbiddenPage />;
  return <>{children}</>;
}
