# Máy chủ ISTT (server)

Backend Express + Prisma + MySQL cho trang quản trị.

## Yêu cầu

- Node.js 22 trở lên
- Docker (để chạy MySQL khi phát triển)

## Chạy môi trường phát triển

1. Cài gói: `npm install`
2. Khởi động MySQL: `docker compose up -d --wait` (cổng `127.0.0.1:3307`, mật khẩu root `istt-dev`).
3. Tạo file `.env` từ mẫu: `cp .env.example .env`, rồi sửa:
   - `DATABASE_URL` trỏ tới một database đã tạo trong MySQL, ví dụ `mysql://root:istt-dev@127.0.0.1:3307/istt`
     (tạo database: `docker compose exec mysql mysql -uroot -pistt-dev -e "CREATE DATABASE istt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"`).
   - `ADMIN_GATEWAY_SECRET`: sinh bằng `openssl rand -hex 32`.
   - `MEDIA_DIR`: thư mục lưu ảnh tải lên (mặc định mẫu `./media`).
   - `WEBSITE_INDEX_PATH`: đường dẫn `index.html` của website (mẫu `../public/index.html`); API thoát với mã 1 nếu không đọc được file này.
   - `PUBLIC_SITE_ORIGIN`: địa chỉ công khai của website (dùng cho canonical và Open Graph).
   - Không đưa `.env` lên git.
4. Áp dụng migration: `npm run db:migrate`
5. Nhập nội dung trang và ảnh hiện có của website (chỉ một lần): `npm run content:import`. Lệnh từ chối nếu đã có trang; `npm run content:import -- --force` tạo phiên bản mới và ghi đè bản nháp.
6. Tạo quản trị viên đầu tiên: `npm run create-admin` (hỏi email, họ tên, mật khẩu tối thiểu 10 ký tự và nhập lại mật khẩu). Hệ thống không có tài khoản mặc định.
7. Chạy dev: `npm run dev` (lắng nghe `127.0.0.1:4000`).

Kiểm tra nhanh: `curl -s http://127.0.0.1:4000/api/public/health` trả `{"status":"ok"}`.

## Kiểm thử và chất lượng mã

- `npm test`: chạy test (cần MySQL dev đang chạy; mỗi lần chạy tạo và xóa một database riêng)
- `npm run typecheck`
- `npm run lint`

## Build và chạy production

```
npm run build
npm run db:migrate
npm start
```

Production cần thư mục ảnh ghi được bởi tài khoản chạy API và file `index.html` của website đã tồn tại trước khi khởi động; Nginx phục vụ `/media/` và chuyển đường dẫn trang tới `/api/public/render` (xem `../docs/deploy/server-setup.md`).

Server chỉ lắng nghe `127.0.0.1`, đặt sau reverse proxy. Thiếu hoặc sai biến môi trường thì server in tên biến lỗi và thoát với mã 1. Mỗi giờ server xóa các phiên đã hết hạn.

## Thêm quyền mới

Thêm quyền vào `PERMISSIONS` trong `src/modules/permissions/catalog.ts` (mã quyền và nhãn tiếng Việt). Danh mục quyền được đồng bộ vào database mỗi lần server khởi động, không cần migration.

## Quy tắc truy cập

1. Chỉ quản trị viên (vai trò hệ thống) mới được gán vai trò quản trị viên, hoặc sửa, vô hiệu hóa, đặt lại mật khẩu của tài khoản quản trị viên.
2. Quyền `roles.manage` thực chất ngang cấp quản trị viên, vì có thể cấp mọi quyền cho mọi vai trò không phải vai trò hệ thống. Chỉ cấp cho người đáng tin cậy.
