# Đặc tả: Nền tảng backend, MySQL và trang quản trị (Dự án con 1)

- Ngày: 2026-11-10
- Trạng thái: Đã duyệt thiết kế, chờ lập kế hoạch triển khai
- Phạm vi: Dự án con 1 trong lộ trình 4 dự án con

## 1. Bối cảnh

Website ISTT hiện là ứng dụng React tĩnh (Create React App, TypeScript, styled-components, Ant Design 4, i18next song ngữ VI/EN). Nội dung đang nằm cứng trong mã nguồn và trong `src/locales/{en,vn}/translation.json`. Form liên hệ gửi tới API bên ngoài `https://istt.com.vn/api/sendMail`. Bản build tĩnh được GitLab CI triển khai lên một máy chủ Linux nội bộ khi có thay đổi trên nhánh `main`.

Mục tiêu dài hạn là biến website thành một hệ thống có cơ sở dữ liệu riêng (MySQL) và trang quản trị, để nhân viên tự quản lý nội dung, khách hàng và một phần giao diện mà không cần lập trình viên.

## 2. Lộ trình 4 dự án con

Mỗi dự án con có đặc tả, kế hoạch và đợt triển khai riêng, làm lần lượt:

| # | Dự án con | Nội dung chính |
|---|---|---|
| 1 | **Nền tảng backend + MySQL** (tài liệu này) | API server, cơ sở dữ liệu, đăng nhập, phân quyền theo vai trò, trang quản trị khung |
| 2 | Quản trị nội dung (CMS) | Sửa chữ, ảnh, banner, dịch vụ, đối tác song ngữ; website đọc nội dung từ API |
| 3 | CRM khách hàng | Lưu liên hệ từ form website, quản lý khách hàng tiềm năng, trạng thái, ghi chú, người phụ trách |
| 4 | Tùy chỉnh giao diện | Bật/tắt, sắp xếp section; tùy chỉnh trong giới hạn an toàn của thiết kế |

## 3. Yêu cầu đã chốt cho dự án con 1

- Backend và MySQL chạy **cùng máy chủ Linux nội bộ** với website. Máy chủ hiện là Linux mới cài, chưa có phần mềm.
- Công nghệ: **Node.js + TypeScript**, tự xây (không dùng CMS có sẵn như Strapi/Directus, không dùng PHP).
- Có trang quản trị với **phân quyền theo vai trò (RBAC)**:
  - Mặc định có 2 vai trò: **Quản trị viên** và **Biên tập viên**.
  - Quản trị viên tạo được vai trò mới và bật/tắt **từng quyền theo chức năng** cho mỗi vai trò.
  - Mỗi người dùng có đúng một vai trò.
- Trang quản trị **chỉ truy cập trong mạng nội bộ**.
- Website công khai **không thay đổi** trong dự án con 1.

## 4. Kiến trúc

### 4.1. Cấu trúc thư mục

```
/            Website hiện tại (CRA). Không đổi trong dự án con 1.
/server      API: Node.js, TypeScript, Express, Prisma, MySQL
/admin       Trang quản trị: React, TypeScript, Vite, Ant Design
/docs        Tài liệu, gồm đặc tả và hướng dẫn cài đặt máy chủ
```

- `server/` và `admin/` có `package.json`, `package-lock.json`, `tsconfig.json` riêng. `package.json` và lockfile ở thư mục gốc không bị thay đổi.
- `tsconfig.json` gốc chỉ `include` thư mục `src`, nên hai thư mục mới không ảnh hưởng tới build website.
- Trang quản trị là ứng dụng tách riêng khỏi website, để chặn truy cập ở tầng Nginx và để bản build website công khai không chứa mã quản trị.
- Website, `server/` và `admin/` nằm chung một repo nhưng độc lập hoàn toàn: không import mã chéo giữa các thư mục, mỗi thư mục có cấu hình, lệnh build và lệnh test riêng. Nhờ vậy về sau mỗi phần có pipeline CI/CD riêng, chạy theo thư mục có thay đổi (`rules: changes`), và có thể tách sang repo riêng mà vẫn giữ lịch sử commit.

### 4.2. Công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Runtime | Node.js 22 LTS |
| Web framework | Express 5 |
| Truy cập cơ sở dữ liệu | Prisma (schema, migration, kiểu TypeScript sinh tự động) |
| Kiểm tra dữ liệu vào | Zod |
| Mã hóa mật khẩu | Argon2id (gói `argon2`) |
| Log | pino, ghi ra stdout để systemd/journald thu |
| Cơ sở dữ liệu | MySQL 8, bảng mã `utf8mb4`, collation `utf8mb4_unicode_ci` |
| Trang quản trị | React 18, Vite, Ant Design 5, React Router, TanStack Query |
| Kiểm thử API | Vitest + Supertest trên MySQL thật |
| Kiểm thử trang quản trị | Playwright |

Phiên bản cụ thể của từng gói được chọn ở bản ổn định mới nhất lúc triển khai và được khóa trong lockfile của từng thư mục.

### 4.3. Sơ đồ chạy trên máy chủ

```
Nginx
 ├─ cổng 80   /             → file tĩnh website (như hiện tại)
 ├─ cổng 80   /api/public/  → Node API (dùng từ dự án con 2; dự án con 1 chỉ có /api/public/health)
 └─ cổng 8080 (chỉ IP nội bộ)
      ├─ /           → file tĩnh trang quản trị
      └─ /api/admin/ → Node API

Node API   lắng nghe 127.0.0.1:4000, chạy bằng systemd, tự khởi động lại khi lỗi
MySQL 8    lắng nghe 127.0.0.1:3306, không mở ra mạng
```

- Cổng 8080 chỉ cho phép dải IP nội bộ `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, còn lại `deny all`.
- Ngoài lớp Nginx, API cũng từ chối mọi request tới `/api/admin/*` không đi qua cổng quản trị: Nginx gắn header `X-Admin-Gateway` với một giá trị bí mật lấy từ `.env`, và API kiểm tra header này.

## 5. Cơ sở dữ liệu

Tên bảng và cột dùng `snake_case`. Mọi bảng có `id` kiểu `BIGINT UNSIGNED AUTO_INCREMENT`, trừ `sessions` và `role_permissions`. Thời gian lưu theo UTC kiểu `DATETIME(3)`.

### 5.1. `users`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | Khóa chính |
| `email` | VARCHAR(191) | Duy nhất, lưu chữ thường, dùng để đăng nhập |
| `full_name` | VARCHAR(191) | |
| `password_hash` | VARCHAR(255) | Argon2id |
| `role_id` | BIGINT | Khóa ngoại tới `roles.id`, bắt buộc |
| `is_active` | BOOLEAN | Mặc định `true` |
| `must_change_password` | BOOLEAN | `true` sau khi được đặt mật khẩu tạm |
| `failed_login_count` | INT | Số lần sai liên tiếp |
| `locked_until` | DATETIME NULL | Thời điểm hết khóa tạm |
| `last_login_at` | DATETIME NULL | |
| `created_at`, `updated_at` | DATETIME | |

### 5.2. `roles`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `name` | VARCHAR(100) | Duy nhất |
| `description` | VARCHAR(255) NULL | |
| `is_system` | BOOLEAN | `true` chỉ với vai trò Quản trị viên |
| `created_at`, `updated_at` | DATETIME | |

### 5.3. `permissions`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `key` | VARCHAR(100) | Duy nhất, dạng `chức-năng.hành-động` |
| `module` | VARCHAR(50) | Nhóm hiển thị trong bảng tick quyền |
| `label` | VARCHAR(191) | Tên tiếng Việt hiển thị |

### 5.4. `role_permissions`

Khóa chính ghép (`role_id`, `permission_id`), cả hai là khóa ngoại, xóa dây chuyền khi xóa vai trò.

### 5.5. `sessions`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | CHAR(64) | SHA-256 dạng hex của token phiên; token gốc chỉ nằm trong cookie |
| `user_id` | BIGINT | Khóa ngoại, xóa dây chuyền |
| `created_at` | DATETIME | |
| `last_seen_at` | DATETIME | Cập nhật khi có request, tối đa mỗi phút một lần |
| `expires_at` | DATETIME | `last_seen_at + 8 giờ`, không vượt quá `created_at + 7 ngày` |
| `ip` | VARCHAR(45) | |
| `user_agent` | VARCHAR(255) | |

Phiên hết hạn bị xóa khi gặp lại và bởi một tác vụ dọn dẹp chạy mỗi giờ trong tiến trình API.

### 5.6. `audit_logs`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `actor_user_id` | BIGINT NULL | Người thực hiện; `NULL` với sự kiện hệ thống hoặc đăng nhập sai bằng email không tồn tại |
| `action` | VARCHAR(100) | Ví dụ `user.create` |
| `target_type` | VARCHAR(50) NULL | Ví dụ `user`, `role` |
| `target_id` | VARCHAR(64) NULL | |
| `metadata` | JSON NULL | Chi tiết thay đổi, không bao giờ chứa mật khẩu hay token |
| `ip` | VARCHAR(45) | |
| `created_at` | DATETIME | Có chỉ mục cùng `actor_user_id` |

Các `action` ghi trong dự án con 1: `auth.login`, `auth.login_failed`, `auth.logout`, `auth.password_change`, `user.create`, `user.update`, `user.deactivate`, `user.activate`, `user.password_reset`, `role.create`, `role.update`, `role.delete`, `role.permissions_update`.

## 6. Phân quyền

### 6.1. Danh sách quyền

Danh sách quyền được định nghĩa trong mã nguồn `server` tại một nơi duy nhất. Khi API khởi động, nó đồng bộ danh sách này vào bảng `permissions`: thêm quyền mới, cập nhật nhãn, và xóa quyền không còn trong mã nguồn. Các dự án con sau chỉ cần thêm quyền vào danh sách, quyền sẽ tự xuất hiện trong bảng tick quyền.

Quyền của dự án con 1:

| Key | Module | Nhãn |
|---|---|---|
| `users.view` | Người dùng | Xem danh sách người dùng |
| `users.manage` | Người dùng | Thêm, sửa, vô hiệu hóa, đặt lại mật khẩu |
| `roles.manage` | Vai trò | Quản lý vai trò và quyền |
| `audit.view` | Nhật ký | Xem nhật ký hoạt động |

`users.manage` tự động bao gồm `users.view` khi kiểm tra quyền.

### 6.2. Quy tắc

- Mọi kiểm tra quyền thực hiện **ở server**. Trang quản trị ẩn menu và nút theo quyền chỉ để tiện dùng.
- Vai trò có `is_system = true` (Quản trị viên) luôn được coi là có mọi quyền, không sửa được tên, không sửa được quyền, không xóa được.
- Không xóa được vai trò còn người dùng; phải chuyển người dùng sang vai trò khác trước.
- Không được vô hiệu hóa, hoặc đổi sang vai trò khác, **quản trị viên đang hoạt động cuối cùng**.
- Người dùng không tự vô hiệu hóa hay tự đổi vai trò của chính mình.
- Khi người dùng bị vô hiệu hóa, bị đổi vai trò hoặc bị đặt lại mật khẩu, mọi phiên của người đó bị xóa ngay.
- Quyền được đọc lại từ cơ sở dữ liệu ở mỗi request, nên thay đổi quyền có hiệu lực ngay.

### 6.3. Dữ liệu khởi tạo

- Migration tạo sẵn vai trò **Quản trị viên** (`is_system = true`) và **Biên tập viên** (chưa có quyền nào; quyền nội dung thêm ở dự án con 2).
- Tài khoản quản trị đầu tiên tạo bằng lệnh `npm run create-admin` trong `server/`. Lệnh hỏi email, họ tên và mật khẩu qua terminal. Không có tài khoản hay mật khẩu mặc định nào trong mã nguồn.

## 7. Đăng nhập và phiên

- Đăng nhập bằng email và mật khẩu. Mật khẩu tối thiểu 10 ký tự.
- Khi đăng nhập thành công, server tạo token ngẫu nhiên 32 byte, lưu SHA-256 của token vào `sessions`, và gửi token trong cookie `istt_admin_session` với `HttpOnly`, `SameSite=Strict`, `Path=/`; thêm `Secure` khi chạy qua HTTPS.
- Phiên hết hạn sau **8 giờ không hoạt động**, và tối đa 7 ngày kể từ lúc đăng nhập.
- Sai mật khẩu **5 lần liên tiếp** thì tài khoản bị khóa **15 phút**. Đăng nhập đúng đặt lại bộ đếm.
- Email không tồn tại, sai mật khẩu, tài khoản bị khóa hay bị vô hiệu hóa đều trả cùng một thông báo chung, và server vẫn chạy phép so khớp Argon2 với một hash giả để thời gian phản hồi không lộ thông tin.
- Request thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) phải có header `Origin` khớp với địa chỉ trang quản trị cấu hình trong `.env`, để chống CSRF.
- Không gửi email. Quên mật khẩu thì quản trị viên đặt mật khẩu tạm; người dùng có `must_change_password = true` chỉ gọi được `GET /auth/me`, `POST /auth/change-password` và `POST /auth/logout` cho tới khi đổi mật khẩu.

## 8. API

Tiền tố chung `/api/admin`. Request và response dạng JSON. Danh sách có phân trang bằng `page` (từ 1) và `pageSize` (mặc định 20, tối đa 100), trả về `{ items, total, page, pageSize }`.

| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| POST | `/auth/login` | công khai trong mạng nội bộ |
| POST | `/auth/logout` | đã đăng nhập |
| GET | `/auth/me` | đã đăng nhập; trả thông tin người dùng, vai trò và danh sách key quyền |
| POST | `/auth/change-password` | đã đăng nhập; cần mật khẩu hiện tại |
| PATCH | `/auth/me` | đã đăng nhập; chỉ đổi `fullName` |
| GET | `/users` | `users.view`; lọc theo `q`, `roleId`, `isActive` |
| POST | `/users` | `users.manage`; tạo với mật khẩu tạm, `must_change_password = true` |
| GET | `/users/:id` | `users.view` |
| PATCH | `/users/:id` | `users.manage`; đổi `fullName`, `email`, `roleId`, `isActive` |
| POST | `/users/:id/reset-password` | `users.manage` |
| GET | `/roles` | `roles.manage` hoặc `users.view` (để chọn vai trò khi gán) |
| POST | `/roles` | `roles.manage` |
| GET | `/roles/:id` | `roles.manage` |
| PATCH | `/roles/:id` | `roles.manage`; đổi `name`, `description` |
| PUT | `/roles/:id/permissions` | `roles.manage`; thay toàn bộ danh sách quyền |
| DELETE | `/roles/:id` | `roles.manage` |
| GET | `/permissions` | `roles.manage`; nhóm theo module |
| GET | `/audit-logs` | `audit.view`; lọc theo `actorUserId`, `action`, `from`, `to` |

Ngoài ra `GET /api/public/health` trả `{ "status": "ok" }` khi API và MySQL đều hoạt động, dùng cho kiểm tra sau triển khai.

## 9. Trang quản trị

Giao diện tiếng Việt, Ant Design 5, bố cục thanh menu trái và vùng nội dung. Menu chỉ hiện mục người dùng có quyền. Truy cập trực tiếp đường dẫn không có quyền hiện trang "Bạn không có quyền truy cập".

| Màn hình | Đường dẫn | Nội dung |
|---|---|---|
| Đăng nhập | `/login` | Email, mật khẩu, thông báo lỗi chung |
| Đổi mật khẩu bắt buộc | `/change-password` | Hiện khi `must_change_password = true` |
| Tổng quan | `/` | Lời chào, thông tin tài khoản; chỗ dành cho số liệu của dự án con sau |
| Người dùng | `/users` | Bảng có tìm kiếm, lọc vai trò và trạng thái; thêm, sửa, gán vai trò, vô hiệu hóa/kích hoạt, đặt lại mật khẩu (hiện mật khẩu tạm một lần để quản trị viên chuyển cho người dùng) |
| Vai trò & quyền | `/roles`, `/roles/:id` | Danh sách vai trò kèm số người dùng; bảng tick quyền nhóm theo module; vai trò hệ thống chỉ xem |
| Nhật ký hoạt động | `/audit-logs` | Bảng lọc theo người, hành động, khoảng ngày |
| Tài khoản của tôi | `/account` | Đổi họ tên, đổi mật khẩu |

Khi API trả `401`, trang quản trị chuyển về `/login`. Khi trả `403`, hiện trang không có quyền.

## 10. Xử lý lỗi

Mọi lỗi trả về dạng:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ", "fields": { "email": "Email đã tồn tại" } } }
```

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Dữ liệu vào sai; `fields` ghi rõ trường |
| 401 | `UNAUTHENTICATED` | Chưa đăng nhập hoặc phiên hết hạn |
| 401 | `INVALID_CREDENTIALS` | Đăng nhập không thành công |
| 403 | `FORBIDDEN` | Thiếu quyền, sai `Origin`, hoặc thiếu header cổng quản trị |
| 403 | `PASSWORD_CHANGE_REQUIRED` | Phải đổi mật khẩu trước |
| 404 | `NOT_FOUND` | |
| 409 | `CONFLICT` | Trùng email/tên vai trò, xóa vai trò còn người dùng, vi phạm quy tắc quản trị viên cuối cùng |
| 500 | `INTERNAL_ERROR` | Lỗi không lường trước; không lộ chi tiết kỹ thuật |

Mỗi request có `requestId` ghi trong log và trong header `X-Request-Id` của response. Log không bao giờ chứa mật khẩu, token hay cookie.

## 11. Cấu hình

`server/.env` (không đưa lên git; có `server/.env.example` liệt kê tên biến, không có giá trị thật):

| Biến | Ý nghĩa |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối MySQL |
| `PORT` | Mặc định `4000` |
| `ADMIN_ORIGIN` | Địa chỉ trang quản trị, ví dụ `http://192.168.10.148:8080` |
| `ADMIN_GATEWAY_SECRET` | Giá trị header `X-Admin-Gateway` mà Nginx gắn |
| `COOKIE_SECURE` | `true` khi chạy qua HTTPS |
| `NODE_ENV` | `production` trên máy chủ |

API từ chối khởi động nếu thiếu biến bắt buộc.

## 12. Kiểm thử

- **API**: Vitest + Supertest chạy trên MySQL thật. Môi trường dev dùng `docker-compose.yml` trong `server/` để chạy MySQL 8; mỗi lần chạy test dùng một cơ sở dữ liệu riêng, áp migration rồi xóa sau khi xong. Bao phủ tối thiểu:
  - đăng nhập đúng/sai, khóa sau 5 lần, mở khóa sau 15 phút, hết hạn phiên 8 giờ và 7 ngày;
  - bắt buộc đổi mật khẩu;
  - mọi endpoint từ chối khi thiếu quyền và chấp nhận khi có quyền;
  - quy tắc vai trò hệ thống, xóa vai trò còn người dùng, quản trị viên cuối cùng;
  - xóa phiên khi vô hiệu hóa, đổi vai trò, đặt lại mật khẩu;
  - kiểm tra `Origin` và header cổng quản trị;
  - đồng bộ danh sách quyền khi khởi động;
  - nhật ký ghi đúng hành động và không chứa mật khẩu.
- **Trang quản trị**: Playwright với API và MySQL thật, cho các luồng: đăng nhập, đổi mật khẩu bắt buộc, tạo người dùng, tạo vai trò và tick quyền, người không có quyền không thấy menu và bị chặn khi vào đường dẫn trực tiếp.
- **Website**: chạy lại bộ kiểm tra giao diện hiện có để xác nhận website không bị ảnh hưởng.
- `tsc --noEmit` và ESLint sạch ở cả `server/` và `admin/`.

## 13. Triển khai

- Tài liệu `docs/deploy/server-setup.md` hướng dẫn từng bước trên máy Linux mới:
  - cài Node.js 22 LTS, MySQL 8, Nginx;
  - tạo cơ sở dữ liệu và tài khoản MySQL riêng cho ứng dụng với quyền tối thiểu;
  - tạo `server/.env`, chạy `prisma migrate deploy`, chạy `npm run create-admin`;
  - cấu hình Nginx (mẫu ở `docs/deploy/nginx.conf`) và dịch vụ systemd (mẫu ở `docs/deploy/istt-api.service`);
  - sao lưu MySQL tự động mỗi đêm bằng `mysqldump` qua cron, giữ 14 bản gần nhất (mẫu script ở `docs/deploy/backup-mysql.sh`);
  - kiểm tra sau cài đặt bằng `/api/public/health` và đăng nhập trang quản trị.
- Dự án con 1 **không sửa `.gitlab-ci.yml`**. Đợt đầu triển khai thủ công theo tài liệu; tự động hóa CI/CD cho API và trang quản trị là việc riêng, cần đồng ý riêng.
- Khuyến nghị bảo mật: `.gitlab-ci.yml` hiện chứa mật khẩu deploy dạng chữ thường. Nên chuyển sang biến bí mật trong GitLab CI/CD Variables.

## 14. Quy ước mã nguồn

- **Không viết comment trong mã nguồn.** Tên biến, hàm, file phải tự giải thích. Mọi giải thích thiết kế nằm trong tài liệu Markdown ở `docs/`.
- TypeScript chế độ `strict`.
- Mỗi chức năng của API nằm trong một thư mục riêng dưới `server/src/modules/` (ví dụ `auth`, `users`, `roles`, `audit`), gồm route, service và schema Zod của chức năng đó.
- Mỗi màn hình của trang quản trị nằm trong một thư mục riêng dưới `admin/src/pages/`.

## 15. Ngoài phạm vi dự án con 1

- Quản lý nội dung website, đọc nội dung từ API (dự án con 2).
- Lưu liên hệ từ form, quản lý khách hàng (dự án con 3).
- Tùy chỉnh giao diện website (dự án con 4).
- Gửi email, xác thực 2 lớp, đăng nhập một lần (SSO), truy cập trang quản trị từ Internet.
- Thay đổi website công khai và quy trình CI/CD hiện có.
