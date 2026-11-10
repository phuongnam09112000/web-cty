import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { AppLayout } from "./layout/AppLayout";
import { AccountPage } from "./pages/account/AccountPage";
import { AuditLogsPage } from "./pages/audit-logs/AuditLogsPage";
import { ChangePasswordPage } from "./pages/change-password/ChangePasswordPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ForbiddenPage } from "./pages/forbidden/ForbiddenPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RoleDetailPage } from "./pages/roles/RoleDetailPage";
import { RolesPage } from "./pages/roles/RolesPage";
import { UsersPage } from "./pages/users/UsersPage";
import { RequirePermission } from "./auth/RequirePermission";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="users"
            element={
              <RequirePermission anyOf={["users.view"]}>
                <UsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="roles"
            element={
              <RequirePermission anyOf={["roles.manage"]}>
                <RolesPage />
              </RequirePermission>
            }
          />
          <Route
            path="roles/:id"
            element={
              <RequirePermission anyOf={["roles.manage"]}>
                <RoleDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="audit-logs"
            element={
              <RequirePermission anyOf={["audit.view"]}>
                <AuditLogsPage />
              </RequirePermission>
            }
          />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<ForbiddenPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
