import { Button, Result } from "antd";
import { Link } from "react-router-dom";

export function ForbiddenPage() {
  return (
    <Result
      status="403"
      title="Bạn không có quyền truy cập"
      subTitle="Vui lòng liên hệ quản trị viên nếu bạn cần quyền xem trang này."
      extra={
        <Link to="/">
          <Button type="primary">Về trang tổng quan</Button>
        </Link>
      }
    />
  );
}
