# ISTT Admin

Giao diện quản trị (React, Vite, Ant Design) cho API trong `../server`. Thư mục này độc lập: không import mã từ `server/` hay từ website ở thư mục gốc.

## Chạy môi trường phát triển

1. Khởi động MySQL và API (xem `../server`): API lắng nghe ở cổng `4000`.
2. Cài đặt và chạy giao diện:

```bash
npm ci
ADMIN_GATEWAY_SECRET=<chuỗi bí mật> npm run dev
```

Giao diện chạy tại `http://localhost:5173`. Vite chuyển tiếp mọi yêu cầu `/api` tới `http://127.0.0.1:4000` và gắn header `X-Admin-Gateway` bằng giá trị `ADMIN_GATEWAY_SECRET`. Giá trị này phải trùng với `ADMIN_GATEWAY_SECRET` của API, nếu không API sẽ từ chối yêu cầu.

## Biến môi trường

| Biến | Dùng ở | Ý nghĩa |
| --- | --- | --- |
| `ADMIN_GATEWAY_SECRET` | Vite dev server | Giá trị gắn vào header `X-Admin-Gateway` khi chuyển tiếp `/api`; phải trùng với cấu hình của API |

Các biến của API (`DATABASE_URL`, `PORT`, `ADMIN_ORIGIN`, `COOKIE_SECURE`, ...) được mô tả trong `../server/.env.example`. Khi chạy dev, `ADMIN_ORIGIN` của API phải là `http://localhost:5173`.

## Build

```bash
npm run build
```

Kết quả nằm trong `admin/dist` (tệp tĩnh). Khi triển khai, máy chủ web phục vụ thư mục này và chuyển tiếp `/api` tới API kèm header `X-Admin-Gateway`.

## Kiểm thử e2e

Cần MySQL đang chạy (ví dụ `docker compose up -d --wait` trong `../server`, cổng `3307`) và đã cài trình duyệt Playwright (`npx playwright install chromium`).

```bash
npx playwright test
```

Playwright tự khởi động API và Vite. Trước khi chạy API, nó nạp dữ liệu mẫu vào cơ sở dữ liệu `istt_e2e` bằng `npm --prefix ../server run e2e:seed`. Tài khoản quản trị mẫu và mật khẩu được định nghĩa trong `e2e/fixtures.ts`.

## Kiểm tra mã

```bash
npm run typecheck
npm run lint
```

## Ghi chú về thời gian

Giao diện hiển thị thời gian theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, định dạng `dd/MM/yyyy HH:mm`). Bộ lọc khoảng ngày của trang Nhật ký hoạt động tính theo ngày UTC, `Đến ngày` bao gồm hết ngày đó.
