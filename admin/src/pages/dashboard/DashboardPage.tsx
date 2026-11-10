import { Typography } from "antd";
import { useAuth } from "../../auth/AuthProvider";

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <Typography.Title level={3}>Tổng quan</Typography.Title>
      <Typography.Paragraph>Xin chào, {user?.fullName}.</Typography.Paragraph>
    </div>
  );
}
