# Kế hoạch triển khai: Nền tảng backend, MySQL và trang quản trị (Dự án con 1)

> **Cho agent thực thi:** BẮT BUỘC dùng superpowers:subagent-driven-development (khuyên dùng) hoặc superpowers:executing-plans để làm từng task. Các bước dùng checkbox (`- [ ]`) để theo dõi.

**Mục tiêu:** Thêm API Node.js + MySQL và trang quản trị nội bộ có đăng nhập, phân quyền theo vai trò cấu hình được và nhật ký hoạt động, không thay đổi website hiện tại.

**Kiến trúc:** Hai thư mục độc lập trong repo: `server/` (Express 5 + Prisma 7 + MySQL 8.4) và `admin/` (Vite + React 18 + Ant Design 5). API chỉ nghe ở `127.0.0.1:4000`; Nginx phục vụ website ở cổng 80 và trang quản trị kèm `/api/admin` ở cổng 8080 chỉ cho IP nội bộ.

**Công nghệ:** Node.js 22, TypeScript 5.9, Express 5.3, Prisma 7.10 + `@prisma/adapter-mariadb` 7.10, Zod 4, argon2 0.45, pino 10, Vitest 3.2, Supertest 7, React 18.3, React Router 6.30, Ant Design 5.29, TanStack Query 5, Vite 7.3, Playwright 1.56.1, MySQL 8.4.

**Đặc tả:** [docs/superpowers/specs/2026-11-10-backend-foundation-design.md](../specs/2026-11-10-backend-foundation-design.md). Đọc đặc tả trước; kế hoạch này chỉ ghi các quyết định mà đặc tả chưa chốt.

## Ràng buộc chung

- **Không viết comment trong mã nguồn** (`.ts`, `.tsx`, `.prisma`, `.sql` do người viết, `.yml`, `.conf`, `.service`, `.sh`). Giải thích nằm trong tài liệu Markdown.
- Không sửa thư mục `src/`, `public/`, `package.json`, `package-lock.json`, `tsconfig.json` ở gốc, và `.gitlab-ci.yml`.
- `server/` và `admin/` không import mã của nhau hay của website. Mỗi thư mục có `package.json`, `package-lock.json`, `tsconfig.json`, ESLint riêng.
- Khóa phiên bản chính xác (không `^`) cho mọi gói trong `server/package.json` và `admin/package.json`.
- Không dùng `prisma init` (lệnh này sinh thêm thư mục `.claude/`, `.agents/`, `.windsurf/`); viết file Prisma bằng tay.
- TypeScript `strict: true`; ES module (`"type": "module"`).
- Không đưa `.env` lên git; chỉ có `.env.example` không chứa giá trị thật.
- Thời gian lưu UTC, `DATETIME(3)`; bảng mã `utf8mb4`, collation `utf8mb4_unicode_ci`.
- ID trong JSON của API là `number` (chuyển từ `bigint` ở tầng serialize).
- Thông báo hiển thị cho người dùng và nhãn quyền bằng tiếng Việt, đúng như đặc tả.
- Tham số phiên và khóa: phiên hết hạn sau 8 giờ không hoạt động, tối đa 7 ngày; `last_seen_at` cập nhật tối đa mỗi phút một lần; khóa 15 phút sau 5 lần sai liên tiếp; mật khẩu tối thiểu 10 ký tự; token phiên 32 byte, lưu SHA-256 hex; cookie `istt_admin_session`.
- Phân trang: `page` từ 1, `pageSize` mặc định 20, tối đa 100, trả `{ items, total, page, pageSize }`.

## Trọng tâm review

1. Email nhập có chữ hoa hoặc khoảng trắng đầu/cuối (`" Admin@ISTT.vn "`): đăng nhập, tạo và sửa người dùng đều chuẩn hóa về chữ thường, bỏ khoảng trắng, và trùng email phải báo `409` dù khác hoa thường. Test ở Task 4 và Task 5.
2. Hai request đồng thời cùng vô hiệu hóa hai quản trị viên cuối cùng: kiểm tra "quản trị viên cuối cùng" và cập nhật phải nằm trong một transaction có khóa hàng (`SELECT ... FOR UPDATE` trên các user vai trò hệ thống), để không còn lại 0 quản trị viên. Test ở Task 5.
3. Họ tên và tên vai trò tiếng Việt có dấu (`"Biên tập viên nội dung"`, `"Nguyễn Thị Ánh"`): lưu và trả lại đúng nguyên văn, tìm kiếm `q=ánh` tìm được `"Nguyễn Thị Ánh"` (collation `utf8mb4_unicode_ci` không phân biệt dấu và hoa thường). Test ở Task 5.
4. Người dùng đang mở trang quản trị bị vô hiệu hóa hoặc bị bỏ quyền: request tiếp theo nhận `401` (phiên đã xóa) hoặc `403`, và trang quản trị chuyển về `/login` hoặc trang không có quyền thay vì hiện lỗi trắng. Test ở Task 5 (API) và Task 10 (giao diện).
5. `id` trên đường dẫn không phải số hoặc quá lớn (`/users/abc`, `/users/99999999999999999999`): trả `404 NOT_FOUND` chứ không phải `500`. Test ở Task 5 và Task 6.

---

## Cấu trúc file

```
server/
  package.json, package-lock.json, tsconfig.json, eslint.config.js, vitest.config.ts
  docker-compose.yml            MySQL 8.4 cho dev và test, cổng 127.0.0.1:3307
  .env.example
  prisma.config.ts
  prisma/schema.prisma
  prisma/migrations/<timestamp>_init/migration.sql
  src/
    main.ts                     đọc config, tạo app, listen, chạy dọn phiên mỗi giờ
    app.ts                      createApp(deps)
    config.ts                   loadConfig(env)
    db.ts                       createPrisma(databaseUrl)
    logger.ts                   createLogger(nodeEnv)
    http/errors.ts              AppError, errorHandler, notFoundHandler
    http/request-id.ts          requestId middleware
    http/guards.ts              adminGateway, originCheck
    http/params.ts              parseId
    http/pagination.ts          paginationSchema, toPage
    modules/permissions/catalog.ts       PERMISSIONS, PermissionKey
    modules/permissions/sync.ts          syncPermissions
    modules/permissions/permissions.routes.ts
    modules/audit/audit.service.ts       recordAudit, AuditAction
    modules/audit/audit.routes.ts
    modules/auth/password.ts             hashPassword, verifyPassword, verifyDummyPassword
    modules/auth/session.service.ts      createSession, resolveSession, revokeUserSessions, deleteExpiredSessions
    modules/auth/auth.middleware.ts      requireAuth, requirePermission, AuthContext
    modules/auth/auth.routes.ts
    modules/auth/auth.schemas.ts
    modules/users/users.routes.ts, users.service.ts, users.schemas.ts
    modules/roles/roles.routes.ts, roles.service.ts, roles.schemas.ts
    cli/create-admin.ts
  test/
    global-setup.ts             tạo database test riêng, migrate, xóa sau khi xong
    helpers.ts                  makeTestApp, resetDb, createUser, loginAs, testClock
    *.test.ts
admin/
  package.json, package-lock.json, tsconfig.json, eslint.config.js, vite.config.ts, index.html
  playwright.config.ts
  src/
    main.tsx, App.tsx
    api/client.ts               apiFetch, ApiError
    api/types.ts                kiểu dữ liệu trả về của API
    auth/AuthProvider.tsx       AuthProvider, useAuth
    auth/RequireAuth.tsx, auth/RequirePermission.tsx
    layout/AppLayout.tsx
    pages/login/, pages/change-password/, pages/dashboard/, pages/users/,
    pages/roles/, pages/audit-logs/, pages/account/, pages/forbidden/
  e2e/
    fixtures.ts                 khởi tạo dữ liệu qua API test
    *.spec.ts
docs/deploy/
  server-setup.md, nginx.conf, istt-api.service, backup-mysql.sh
server/README.md, admin/README.md
```

---

### Task 1: Khung `server/`, cấu hình và môi trường test với MySQL

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/eslint.config.js`, `server/vitest.config.ts`, `server/docker-compose.yml`, `server/.env.example`, `server/.gitignore`
- Create: `server/src/config.ts`, `server/test/global-setup.ts`
- Test: `server/test/config.test.ts`

**Interfaces:**
- Produces: `type Config = { databaseUrl: string; port: number; adminOrigin: string; adminGatewaySecret: string; cookieSecure: boolean; nodeEnv: "development" | "test" | "production" }`; `loadConfig(env: NodeJS.ProcessEnv): Config` ném `Error` có message liệt kê tên các biến thiếu hoặc sai.
- Produces: biến môi trường test `TEST_DATABASE_ADMIN_URL` (mặc định `mysql://root:istt-dev@127.0.0.1:3307`); `global-setup.ts` đặt `process.env.DATABASE_URL` trỏ tới database `istt_test_<pid>_<timestamp>`.

- [ ] **Step 1:** Tạo `package.json` (`"type": "module"`, `"engines": { "node": ">=22" }`), scripts: `dev` = `tsx watch src/main.ts`, `build` = `tsc -p tsconfig.json`, `start` = `node dist/main.js`, `test` = `vitest run`, `typecheck` = `tsc --noEmit`, `lint` = `eslint .`, `db:migrate` = `prisma migrate deploy`, `db:generate` = `prisma generate`, `create-admin` = `tsx src/cli/create-admin.ts`. Cài đúng phiên bản: express 5.3.0, zod 4.6.7, pino 10.4.0, argon2 0.45.2, @prisma/client 7.10.1, @prisma/adapter-mariadb 7.10.1, mariadb, cookie-parser, dotenv; dev: prisma 7.10.1, typescript 5.9.3, tsx 4.23.15, vitest 3.2.7, supertest 7.3.2, các gói `@types/*`, eslint + typescript-eslint.
- [ ] **Step 2:** `docker-compose.yml`: service `mysql`, image `mysql:8.4`, `MYSQL_ROOT_PASSWORD: istt-dev`, cổng `127.0.0.1:3307:3306`, lệnh `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`, healthcheck `mysqladmin ping`. Chỉ dùng cho dev và test.
- [ ] **Step 3: Viết test thất bại** `config.test.ts`:
  - `loadConfig` với đủ biến trả `port: 4000` khi không có `PORT`, `cookieSecure: false` khi `COOKIE_SECURE` không phải `"true"`.
  - Thiếu `DATABASE_URL` và `ADMIN_GATEWAY_SECRET` thì ném lỗi chứa cả hai tên.
  - `ADMIN_GATEWAY_SECRET` ngắn hơn 32 ký tự thì ném lỗi.
  - `ADMIN_ORIGIN` không phải URL `http(s)://` thì ném lỗi.
- [ ] **Step 4:** Chạy `npm test -- config` → FAIL (chưa có `config.ts`).
- [ ] **Step 5:** Viết `loadConfig` bằng một schema Zod.
- [ ] **Step 6:** Viết `global-setup.ts`: kết nối `TEST_DATABASE_ADMIN_URL` bằng driver `mariadb`, `CREATE DATABASE`, chạy `prisma migrate deploy` với `DATABASE_URL` mới, trả hàm teardown `DROP DATABASE`. Khi chưa có thư mục `prisma/migrations` (trước Task 2) thì bỏ qua bước migrate. `vitest.config.ts`: `globalSetup`, `fileParallelism: false`.
- [ ] **Step 7:** `docker compose up -d --wait` rồi `npm test` → PASS; `npm run typecheck` và `npm run lint` sạch.
- [ ] **Step 8:** Commit `feat(server): scaffold API package with config and MySQL test setup`.

### Task 2: Schema Prisma, migration, dữ liệu khởi tạo và đồng bộ quyền

**Files:**
- Create: `server/prisma.config.ts`, `server/prisma/schema.prisma`, `server/prisma/migrations/<timestamp>_init/migration.sql`
- Create: `server/src/db.ts`, `server/src/modules/permissions/catalog.ts`, `server/src/modules/permissions/sync.ts`, `server/test/helpers.ts` (chỉ `resetDb` ở task này)
- Test: `server/test/permissions-sync.test.ts`

**Interfaces:**
- Produces: `createPrisma(databaseUrl: string): PrismaClient`, dùng `PrismaMariaDb` tạo từ URL. Prisma client sinh ra ở `server/src/generated/prisma` (đưa vào `.gitignore`; script `postinstall` chạy `prisma generate`).
- Produces: model Prisma `User`, `Role`, `Permission`, `RolePermission`, `Session`, `AuditLog`, ánh xạ `@@map` sang tên bảng và cột `snake_case` như đặc tả mục 5.
- Produces: `PERMISSIONS: readonly { key: PermissionKey; module: string; label: string }[]` với đúng 4 quyền ở đặc tả mục 6.1; `type PermissionKey = "users.view" | "users.manage" | "roles.manage" | "audit.view"`.
- Produces: `syncPermissions(prisma: PrismaClient): Promise<void>`.
- Produces: `resetDb(prisma)` xóa dữ liệu mọi bảng trừ `roles` có tên `Quản trị viên` và `Biên tập viên`, rồi gọi `syncPermissions`.
- Produces: hằng `SYSTEM_ROLE_NAME = "Quản trị viên"`, `EDITOR_ROLE_NAME = "Biên tập viên"` trong `catalog.ts`.

- [ ] **Step 1:** Viết `schema.prisma` theo đặc tả mục 5: `@db.DateTime(3)`, `users.email @unique @db.VarChar(191)`, `sessions.id @db.Char(64)`, `audit_logs` có `@@index([actorUserId, createdAt])` và `@@index([createdAt])`, `role_permissions` khóa ghép và `onDelete: Cascade`, `users.role_id` `onDelete: Restrict`.
- [ ] **Step 2:** Sinh migration bằng `prisma migrate dev --name init --create-only` trên database dev, rồi thêm vào cuối `migration.sql` hai lệnh `INSERT` tạo vai trò `Quản trị viên` (`is_system = 1`, mô tả `Toàn quyền quản trị hệ thống`) và `Biên tập viên` (`is_system = 0`, mô tả `Biên tập nội dung website`).
- [ ] **Step 3: Viết test thất bại** `permissions-sync.test.ts`:
  - Sau migrate có đúng 2 vai trò, chỉ `Quản trị viên` có `is_system = true`.
  - `syncPermissions` trên bảng rỗng tạo đúng 4 quyền với nhãn của đặc tả.
  - Đổi nhãn một quyền trong DB rồi sync thì nhãn trở về như catalog.
  - Thêm quyền `legacy.old` có gán cho `Biên tập viên` rồi sync thì quyền và dòng `role_permissions` của nó bị xóa.
  - Gọi sync hai lần liên tiếp không lỗi, vẫn 4 quyền.
- [ ] **Step 4:** `npm test -- permissions-sync` → FAIL.
- [ ] **Step 5:** Viết `syncPermissions` trong một transaction: upsert theo `key`, xóa các `key` không còn trong catalog.
- [ ] **Step 6:** `npm test` → PASS; typecheck, lint sạch.
- [ ] **Step 7:** Commit `feat(server): add Prisma schema, initial migration and permission sync`.

### Task 3: Khung Express, định dạng lỗi, request id, guard cổng quản trị, health, ghi nhật ký

**Files:**
- Create: `server/src/app.ts`, `server/src/logger.ts`, `server/src/http/errors.ts`, `server/src/http/request-id.ts`, `server/src/http/guards.ts`, `server/src/http/params.ts`, `server/src/http/pagination.ts`, `server/src/modules/audit/audit.service.ts`
- Modify: `server/test/helpers.ts`
- Test: `server/test/app.test.ts`, `server/test/audit-service.test.ts`

**Interfaces:**
- Produces: `type AppDeps = { prisma: PrismaClient; config: Config; logger: Logger; clock: () => Date }`; `createApp(deps: AppDeps): express.Express`. Mount: `/api/public` (không guard), `/api/admin` (qua `adminGateway` rồi `originCheck`). Router của các module sau được gắn vào `/api/admin` bên trong `createApp`.
- Produces: `class AppError extends Error { constructor(status: number, code: ErrorCode, message: string, fields?: Record<string, string>) }`; `type ErrorCode = "VALIDATION_ERROR" | "UNAUTHENTICATED" | "INVALID_CREDENTIALS" | "FORBIDDEN" | "PASSWORD_CHANGE_REQUIRED" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR"`. `errorHandler` chuyển `ZodError` thành `400 VALIDATION_ERROR` với `fields` theo đường dẫn trường, lỗi khác thành `500 INTERNAL_ERROR` message `Đã xảy ra lỗi, vui lòng thử lại`.
- Produces: `parseId(value: string): bigint` ném `AppError(404, "NOT_FOUND", "Không tìm thấy")` nếu không phải số nguyên dương ≤ `18446744073709551615`.
- Produces: `paginationSchema` (Zod) và `toPage<T>(items: T[], total: number, page: number, pageSize: number)` trong `http/pagination.ts`.
- Produces: `type AuditAction` gồm đúng 13 hành động ở đặc tả mục 5.6; `recordAudit(db: PrismaClient | Prisma.TransactionClient, entry: { actorUserId: bigint | null; action: AuditAction; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; ip: string }): Promise<void>`. Hàm xóa mọi khóa `password`, `newPassword`, `currentPassword`, `temporaryPassword`, `token` ở mọi cấp trong `metadata` trước khi lưu.
- Produces (helpers): `makeTestApp(options?: { now?: Date })` trả `{ app, prisma, config, clock }` với `clock` là đồng hồ giả có `clock.advance(ms)`; header `X-Admin-Gateway` và `Origin` hợp lệ được gắn sẵn qua `adminRequest(app)` trả về agent Supertest.

- [ ] **Step 1: Viết test thất bại** `app.test.ts`:
  - `GET /api/public/health` → `200 { status: "ok" }`, có header `X-Request-Id`.
  - `GET /api/public/health` khi Prisma không kết nối được (truyền client trỏ sai cổng) → `503 { status: "error" }`.
  - Request tới `/api/admin/anything` thiếu hoặc sai `X-Admin-Gateway` → `403 FORBIDDEN`.
  - `POST /api/admin/anything` có gateway đúng nhưng `Origin` khác `adminOrigin` hoặc thiếu `Origin` → `403 FORBIDDEN`; `GET` không cần `Origin`.
  - Đường dẫn không tồn tại dưới `/api/admin` → `404 NOT_FOUND` theo định dạng lỗi chung.
  - Body JSON hỏng → `400 VALIDATION_ERROR`.
  - Lỗi bất ngờ từ một route test → `500 INTERNAL_ERROR`, body không chứa stack.
  - `parseId("abc")` và `parseId("99999999999999999999")` ném `AppError` 404; `parseId("42")` trả `42n`.
- [ ] **Step 2: Viết test thất bại** `audit-service.test.ts`: `recordAudit` lưu đúng trường; `metadata: { email: "a@b.vn", password: "x", nested: { token: "y", ok: 1 } }` được lưu thành `{ email: "a@b.vn", nested: { ok: 1 } }`.
- [ ] **Step 3:** `npm test` → FAIL.
- [ ] **Step 4:** Viết các module ở mục Files. `adminGateway` so sánh bằng `crypto.timingSafeEqual`. `requestId` dùng `crypto.randomUUID()`. Logger pino ghi `requestId`, `method`, `url`, `status`, `durationMs`; cấu hình `redact` cho `req.headers.cookie`, `req.headers["x-admin-gateway"]`, `res.headers["set-cookie"]`. `app.set("trust proxy", "loopback")` để `req.ip` lấy IP thật từ Nginx.
- [ ] **Step 5:** `npm test` → PASS; typecheck, lint sạch.
- [ ] **Step 6:** Commit `feat(server): add Express app shell, error format, gateway guards and audit service`.

### Task 4: Đăng nhập, phiên, khóa tạm, bắt buộc đổi mật khẩu

**Files:**
- Create: `server/src/modules/auth/password.ts`, `session.service.ts`, `auth.middleware.ts`, `auth.routes.ts`, `auth.schemas.ts`
- Modify: `server/src/app.ts`, `server/test/helpers.ts`
- Test: `server/test/auth.test.ts`, `server/test/session-service.test.ts`

**Interfaces:**
- Produces: `hashPassword(plain: string): Promise<string>` (argon2id, tham số mặc định của gói); `verifyPassword(hash: string, plain: string): Promise<boolean>`; `verifyDummyPassword(plain: string): Promise<void>` so với một hash cố định tạo lúc nạp module.
- Produces: `createSession(prisma, userId: bigint, meta: { ip: string; userAgent: string }, now: Date): Promise<string>` trả token gốc (base64url của 32 byte); `resolveSession(prisma, token: string, now: Date): Promise<{ sessionId: string; user: User & { role: Role } } | null>` trả `null` và xóa phiên nếu đã hết hạn, gia hạn `last_seen_at`/`expires_at` khi đã qua ≥ 60 giây; `revokeUserSessions(db, userId: bigint): Promise<void>`; `deleteExpiredSessions(prisma, now: Date): Promise<number>`.
- Produces: `type AuthContext = { user: User & { role: Role }; permissions: ReadonlySet<PermissionKey>; sessionId: string }` gắn vào `res.locals.auth`; `requireAuth(deps: AppDeps)` (trả `401 UNAUTHENTICATED`; với `must_change_password` chỉ cho qua `GET /auth/me`, `POST /auth/change-password`, `POST /auth/logout`, còn lại `403 PASSWORD_CHANGE_REQUIRED`); `requirePermission(...keys: PermissionKey[])` cho qua nếu có **bất kỳ** quyền nào trong danh sách, với `users.manage` được coi là có cả `users.view`, và vai trò `is_system` có mọi quyền.
- Produces: `GET /auth/me` trả `{ id, email, fullName, mustChangePassword, role: { id, name, isSystem }, permissions: PermissionKey[] }`.
- Produces (helpers): `createUser(prisma, { email, fullName?, password?, roleName?, isActive?, mustChangePassword? }): Promise<User>` (mật khẩu mặc định `Matkhau@12345`); `loginAs(app, email, password?)` trả agent Supertest đã có cookie.

- [ ] **Step 1: Viết test thất bại** `auth.test.ts`:
  - Đăng nhập đúng → `200`, `Set-Cookie` có `istt_admin_session`, `HttpOnly`, `SameSite=Strict`, `Path=/`, không có `Secure` khi `cookieSecure: false`; có `Secure` khi `true`. `last_login_at` được cập nhật; audit `auth.login`.
  - Email `" Admin@ISTT.vn "` đăng nhập được tài khoản `admin@istt.vn`.
  - Sai mật khẩu, email không tồn tại, tài khoản `is_active = false`: cùng `401 INVALID_CREDENTIALS`, message `Email hoặc mật khẩu không đúng`; audit `auth.login_failed` với `metadata.email`.
  - 5 lần sai liên tiếp → lần đúng thứ 6 vẫn `401`; `clock.advance(15 * 60_000)` → đăng nhập đúng được và `failed_login_count` về 0.
  - 4 lần sai rồi 1 lần đúng → bộ đếm về 0.
  - `GET /auth/me` không cookie → `401 UNAUTHENTICATED`; có cookie → đúng cấu trúc ở Interfaces; quản trị viên có đủ 4 quyền.
  - `clock.advance(8 * 3600_000 + 1)` không hoạt động → `401`. Request mỗi 7 giờ liên tục trong 7 ngày → sau mốc 7 ngày kể từ đăng nhập thì `401`.
  - `POST /auth/logout` → phiên bị xóa, cookie bị xóa, audit `auth.logout`; gọi `/auth/me` với cookie cũ → `401`.
  - Người dùng `mustChangePassword: true`: `GET /auth/me` → `200`; `GET /users` → `403 PASSWORD_CHANGE_REQUIRED`.
  - `POST /auth/change-password` sai `currentPassword` → `400 VALIDATION_ERROR` với `fields.currentPassword`; `newPassword` 9 ký tự → `fields.newPassword`; đúng → `200`, `must_change_password = false`, các phiên **khác** của người dùng bị xóa còn phiên hiện tại vẫn dùng được, audit `auth.password_change`.
  - `PATCH /auth/me { fullName: "Nguyễn Thị Ánh" }` → lưu đúng nguyên văn; gửi thêm `email` hoặc `roleId` thì bị bỏ qua.
- [ ] **Step 2: Viết test thất bại** `session-service.test.ts`: token lưu trong DB là SHA-256 hex 64 ký tự và khác token gốc; `deleteExpiredSessions` chỉ xóa phiên có `expires_at < now`.
- [ ] **Step 3:** `npm test -- auth session` → FAIL.
- [ ] **Step 4:** Viết các module. Đăng nhập: chuẩn hóa email `trim().toLowerCase()`; không tìm thấy hoặc không hoạt động hoặc đang khóa thì gọi `verifyDummyPassword` (hoặc `verifyPassword` thật khi đang khóa) để thời gian tương đương; khi `failed_login_count` đạt 5 thì đặt `locked_until = now + 15 phút` và `failed_login_count = 0`. Cookie đọc bằng `cookie-parser`.
- [ ] **Step 5:** `npm test` → PASS; typecheck, lint sạch.
- [ ] **Step 6:** Commit `feat(server): add login, sessions, lockout and forced password change`.

### Task 5: Quản lý người dùng

**Files:**
- Create: `server/src/modules/users/users.routes.ts`, `users.service.ts`, `users.schemas.ts`
- Modify: `server/src/app.ts`
- Test: `server/test/users.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `requirePermission`, `revokeUserSessions`, `recordAudit`, `parseId`, `hashPassword`.
- Produces: JSON người dùng `UserDto = { id: number; email: string; fullName: string; isActive: boolean; mustChangePassword: boolean; lastLoginAt: string | null; createdAt: string; role: { id: number; name: string; isSystem: boolean } }`.
- Produces: `POST /users` body `{ email, fullName, roleId }` → `201 { user: UserDto, temporaryPassword: string }`; `POST /users/:id/reset-password` → `200 { temporaryPassword: string }`. Mật khẩu tạm 14 ký tự từ bảng chữ `ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789`, sinh bằng `crypto.randomInt`.
- Produces: `PATCH /users/:id` body một phần `{ email?, fullName?, roleId?, isActive? }` → `200 UserDto`.

- [ ] **Step 1: Viết test thất bại** `users.test.ts`:
  - Không có quyền → `403 FORBIDDEN` cho cả 5 endpoint; vai trò có `users.view` xem được `GET /users` và `GET /users/:id` nhưng `POST`/`PATCH`/reset → `403`; vai trò có `users.manage` làm được tất cả.
  - `GET /users` phân trang đúng (`pageSize=2` trên 3 người → `total: 3`, 2 phần tử); `pageSize=101` → `400`; lọc `roleId`, `isActive=false`; `q=ánh` tìm được `"Nguyễn Thị Ánh"`, `q=ISTT` tìm theo email không phân biệt hoa thường.
  - `POST /users` với email `" Moi@ISTT.vn "` → lưu `moi@istt.vn`, `mustChangePassword: true`, trả `temporaryPassword` dài 14 ký tự và dùng được để đăng nhập; audit `user.create` không chứa mật khẩu tạm.
  - Tạo trùng email khác hoa thường → `409 CONFLICT` với `fields.email`; `roleId` không tồn tại → `400` với `fields.roleId`.
  - `PATCH` đổi `roleId` hoặc `isActive: false` hoặc reset mật khẩu → mọi phiên của người đó bị xóa (agent đăng nhập trước đó nhận `401`); audit `user.update`/`user.deactivate`/`user.activate`/`user.password_reset`.
  - Tự vô hiệu hóa hoặc tự đổi vai trò của mình → `409 CONFLICT`.
  - Có 1 quản trị viên đang hoạt động: vô hiệu hóa hoặc đổi vai trò người đó (bởi một người có `users.manage`) → `409 CONFLICT`. Có 2 quản trị viên A, B và người thứ ba C có `users.manage`: gửi đồng thời (`Promise.all`) yêu cầu vô hiệu hóa A và B → đúng một yêu cầu thành công, một yêu cầu `409`, còn lại đúng 1 quản trị viên hoạt động.
  - `GET /users/abc`, `GET /users/99999999999999999999`, `GET /users/999999` → `404 NOT_FOUND`.
- [ ] **Step 2:** `npm test -- users` → FAIL.
- [ ] **Step 3:** Viết module. Kiểm tra "quản trị viên cuối cùng" trong `prisma.$transaction` với `$queryRaw` `SELECT id FROM users WHERE role_id IN (SELECT id FROM roles WHERE is_system = 1) AND is_active = 1 FOR UPDATE`. Bắt lỗi Prisma `P2002` trên `email` thành `409`.
- [ ] **Step 4:** `npm test` → PASS; typecheck, lint sạch.
- [ ] **Step 5:** Commit `feat(server): add user management endpoints`.

### Task 6: Vai trò, quyền và nhật ký hoạt động

**Files:**
- Create: `server/src/modules/roles/roles.routes.ts`, `roles.service.ts`, `roles.schemas.ts`, `server/src/modules/permissions/permissions.routes.ts`, `server/src/modules/audit/audit.routes.ts`
- Modify: `server/src/app.ts`
- Test: `server/test/roles.test.ts`, `server/test/audit-logs.test.ts`

**Interfaces:**
- Produces: `RoleDto = { id: number; name: string; description: string | null; isSystem: boolean; userCount: number; permissions: PermissionKey[] }`; vai trò `is_system` luôn trả đủ mọi quyền trong catalog.
- Produces: `GET /permissions` → `{ modules: { module: string; permissions: { key: PermissionKey; label: string }[] }[] }` theo thứ tự trong catalog.
- Produces: `PUT /roles/:id/permissions` body `{ permissions: PermissionKey[] }` → `200 RoleDto`.
- Produces: `GET /audit-logs` → trang `AuditLogDto = { id: number; action: AuditAction; actor: { id: number; email: string; fullName: string } | null; targetType: string | null; targetId: string | null; metadata: unknown; ip: string; createdAt: string }`, mới nhất trước; `from`/`to` là ngày ISO, `to` tính hết ngày đó theo UTC.

- [ ] **Step 1: Viết test thất bại** `roles.test.ts`:
  - `GET /roles` cho phép người có `roles.manage` hoặc `users.view`; không có cả hai → `403`. Các endpoint còn lại chỉ `roles.manage`.
  - `POST /roles { name: "Biên tập viên nội dung" }` → `201`, tên đúng nguyên văn, audit `role.create`; trùng tên → `409` với `fields.name`.
  - `PUT /roles/:id/permissions` với `["users.view", "audit.view"]` → lưu đúng, audit `role.permissions_update` có `metadata.added` và `metadata.removed`; người dùng của vai trò đó gọi `GET /users` được ngay mà không cần đăng nhập lại; bỏ quyền thì `GET /users` của người đang đăng nhập trả `403` ngay.
  - Key không có trong catalog → `400` với `fields.permissions`.
  - Vai trò hệ thống: `PATCH`, `PUT .../permissions`, `DELETE` → `409 CONFLICT`; `GET` trả đủ 4 quyền.
  - `DELETE` vai trò còn người dùng → `409`; vai trò không còn ai → `204`, audit `role.delete`.
  - `GET /roles/abc` → `404`.
  - `GET /permissions` trả 3 module `Người dùng`, `Vai trò`, `Nhật ký` theo đúng thứ tự.
- [ ] **Step 2: Viết test thất bại** `audit-logs.test.ts`: cần `audit.view`; lọc `actorUserId`, `action`, `from`, `to`; phân trang; không bản ghi nào trong toàn bộ bảng sau một loạt thao tác (tạo người dùng, reset mật khẩu, đổi mật khẩu) chứa chuỗi mật khẩu tạm hay mật khẩu mới (kiểm tra bằng `JSON.stringify` của toàn bộ bảng).
- [ ] **Step 3:** `npm test -- roles audit-logs` → FAIL.
- [ ] **Step 4:** Viết các module.
- [ ] **Step 5:** `npm test` → PASS; typecheck, lint sạch.
- [ ] **Step 6:** Commit `feat(server): add role, permission and audit log endpoints`.

### Task 7: Lệnh tạo quản trị viên, điểm khởi động và dọn phiên

**Files:**
- Create: `server/src/cli/create-admin.ts`, `server/src/main.ts`, `server/README.md`
- Test: `server/test/create-admin.test.ts`

**Interfaces:**
- Produces: `createAdmin(prisma, input: { email: string; fullName: string; password: string }): Promise<User>` gán vai trò hệ thống, `must_change_password = false`, ném `Error` khi email đã tồn tại hoặc mật khẩu ngắn hơn 10 ký tự. Khi chạy trực tiếp, file hỏi email, họ tên, mật khẩu (ẩn ký tự) và nhập lại mật khẩu qua `node:readline`.
- Produces: `main.ts` gọi `loadConfig(process.env)` (sau `dotenv/config`), `syncPermissions`, `createApp`, `listen(port, "127.0.0.1")`, `setInterval(deleteExpiredSessions, 3600_000)`, và đóng gọn khi nhận `SIGTERM`/`SIGINT`.

- [ ] **Step 1: Viết test thất bại** `create-admin.test.ts`: tạo thành công thì đăng nhập được và `GET /auth/me` có `role.isSystem: true`; email trùng hoặc mật khẩu 9 ký tự thì ném lỗi và không tạo bản ghi.
- [ ] **Step 2:** `npm test -- create-admin` → FAIL.
- [ ] **Step 3:** Viết `createAdmin`, phần hỏi đáp và `main.ts`.
- [ ] **Step 4:** `npm test` → PASS. Kiểm tra tay: tạo `server/.env` từ `.env.example` trỏ database dev, `npm run db:migrate`, `npm run dev`, `curl -s http://127.0.0.1:4000/api/public/health` → `{"status":"ok"}`; `curl` tới `/api/admin/auth/me` không header gateway → `403`.
- [ ] **Step 5:** `server/README.md`: cách chạy MySQL dev, migrate, tạo quản trị viên, chạy dev, chạy test, thêm quyền mới vào catalog.
- [ ] **Step 6:** Commit `feat(server): add create-admin command and server entry point`.

### Task 8: Khung `admin/`, đăng nhập, đổi mật khẩu bắt buộc, bố cục và chặn quyền

**Files:**
- Create: `admin/package.json`, `tsconfig.json`, `eslint.config.js`, `vite.config.ts`, `index.html`, `playwright.config.ts`, `.gitignore`
- Create: `admin/src/main.tsx`, `App.tsx`, `api/client.ts`, `api/types.ts`, `auth/AuthProvider.tsx`, `auth/RequireAuth.tsx`, `auth/RequirePermission.tsx`, `layout/AppLayout.tsx`, `pages/login/LoginPage.tsx`, `pages/change-password/ChangePasswordPage.tsx`, `pages/dashboard/DashboardPage.tsx`, `pages/forbidden/ForbiddenPage.tsx`
- Create: `admin/e2e/fixtures.ts`, `admin/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: các DTO và endpoint của Task 4–6.
- Produces: `class ApiError extends Error { status: number; code: string; fields?: Record<string, string> }`; `apiFetch<T>(path: string, init?: { method?: string; body?: unknown; query?: Record<string, string | number | boolean | undefined> }): Promise<T>` gọi `/api/admin${path}` với `credentials: "same-origin"`; khi `401` ở bất kỳ endpoint nào trừ `/auth/login` thì xóa cache TanStack Query và chuyển `/login`.
- Produces: `useAuth(): { user: Me | null; loading: boolean; can: (key: PermissionKey) => boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> }`; `can` áp dụng cùng quy tắc với server (vai trò hệ thống có mọi quyền, `users.manage` gồm `users.view`).
- Produces: `<RequirePermission anyOf={PermissionKey[]}>` hiện `ForbiddenPage` khi không đủ quyền; `ForbiddenPage` hiện tiêu đề `Bạn không có quyền truy cập`.
- Produces: menu trái trong `AppLayout` theo thứ tự `Tổng quan` (`/`), `Người dùng` (`/users`, `users.view`), `Vai trò & quyền` (`/roles`, `roles.manage`), `Nhật ký hoạt động` (`/audit-logs`, `audit.view`); góc phải có tên người dùng, `Tài khoản của tôi` (`/account`), `Đăng xuất`.
- Produces (e2e): `fixtures.ts` khởi động API trên database test riêng qua `server` (`npm --prefix ../server run dev` với biến môi trường test), tạo quản trị viên `admin@istt.vn` / `Matkhau@12345`, và hàm `seedUser(...)` gọi API bằng phiên quản trị viên.

- [ ] **Step 1:** Tạo `package.json` khóa phiên bản: react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.6, antd 5.29.3, @tanstack/react-query 5.107.1; dev: vite 7.3.8, @vitejs/plugin-react, typescript 5.9.3, @playwright/test 1.56.1, eslint + typescript-eslint. `vite.config.ts`: dev server cổng 5173, proxy `/api` tới `http://127.0.0.1:4000` và gắn header `X-Admin-Gateway` từ biến môi trường `ADMIN_GATEWAY_SECRET` của tiến trình dev. Ant Design dùng `ConfigProvider` với `locale` `vi_VN` và màu chủ đạo `#0E5D95`.
- [ ] **Step 2:** `playwright.config.ts`: Chromium, `webServer` khởi động API test và `vite`; chạy được trong môi trường có `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
- [ ] **Step 3: Viết test thất bại** `auth.spec.ts`:
  - Chưa đăng nhập vào `/users` → chuyển `/login`.
  - Sai mật khẩu → hiện `Email hoặc mật khẩu không đúng`.
  - Quản trị viên đăng nhập → vào `/`, thấy đủ 4 mục menu.
  - Người dùng có `mustChangePassword` đăng nhập → bị đưa tới `/change-password`; đổi xong → vào `/`.
  - Người dùng vai trò `Biên tập viên` (không quyền) chỉ thấy mục `Tổng quan`; mở thẳng `/roles` → thấy `Bạn không có quyền truy cập`.
  - Đang mở `/` thì phiên bị xóa (quản trị viên vô hiệu hóa người đó qua API); chuyển sang mục khác → về `/login`.
  - `Đăng xuất` → về `/login`; nút Back của trình duyệt không mở lại được trang quản trị.
- [ ] **Step 4:** `npx playwright test e2e/auth.spec.ts` → FAIL.
- [ ] **Step 5:** Viết các file ở mục Files.
- [ ] **Step 6:** `npx playwright test e2e/auth.spec.ts` → PASS; `npm run typecheck`, `npm run lint`, `npm run build` sạch.
- [ ] **Step 7:** Commit `feat(admin): scaffold admin app with login, forced password change and permission-aware layout`.

### Task 9: Màn hình Người dùng

**Files:**
- Create: `admin/src/pages/users/UsersPage.tsx`, `UserFormModal.tsx`, `TemporaryPasswordModal.tsx`
- Modify: `admin/src/App.tsx`
- Test: `admin/e2e/users.spec.ts`

**Interfaces:**
- Consumes: `GET/POST /users`, `PATCH /users/:id`, `POST /users/:id/reset-password`, `GET /roles`.

- [ ] **Step 1: Viết test thất bại** `users.spec.ts`:
  - Bảng có cột Họ tên, Email, Vai trò, Trạng thái, Đăng nhập lần cuối; ô tìm kiếm `ánh` lọc ra `Nguyễn Thị Ánh`; lọc theo vai trò và trạng thái.
  - Thêm người dùng → modal hiện mật khẩu tạm kèm nút sao chép và cảnh báo `Mật khẩu này chỉ hiển thị một lần`; người mới xuất hiện trong bảng.
  - Email trùng → lỗi hiện ngay dưới ô Email.
  - Sửa vai trò, vô hiệu hóa (có hộp xác nhận), kích hoạt lại, đặt lại mật khẩu đều cập nhật bảng.
  - Thao tác bị `409` (vô hiệu hóa quản trị viên cuối cùng) hiện thông báo lỗi của server.
  - Người chỉ có `users.view` thấy bảng nhưng không thấy nút Thêm, Sửa, Vô hiệu hóa, Đặt lại mật khẩu.
- [ ] **Step 2:** Chạy test → FAIL. **Step 3:** Viết màn hình. **Step 4:** Chạy test → PASS; typecheck, lint, build sạch.
- [ ] **Step 5:** Commit `feat(admin): add user management screen`.

### Task 10: Màn hình Vai trò & quyền

**Files:**
- Create: `admin/src/pages/roles/RolesPage.tsx`, `RoleDetailPage.tsx`, `RoleFormModal.tsx`
- Modify: `admin/src/App.tsx`
- Test: `admin/e2e/roles.spec.ts`

**Interfaces:**
- Consumes: `GET/POST /roles`, `GET/PATCH/DELETE /roles/:id`, `PUT /roles/:id/permissions`, `GET /permissions`.

- [ ] **Step 1: Viết test thất bại** `roles.spec.ts`:
  - Danh sách hiện tên, mô tả, số người dùng; vai trò hệ thống có nhãn `Hệ thống`.
  - Tạo vai trò `Biên tập viên nội dung` → mở trang chi tiết; bảng tick quyền nhóm theo `Người dùng`, `Vai trò`, `Nhật ký`; tick `Xem danh sách người dùng` rồi `Lưu` → thông báo thành công, tải lại trang vẫn giữ.
  - Một người dùng thuộc vai trò đó, đang đăng nhập ở context trình duyệt thứ hai, sau khi được bật `users.view` thì tải lại trang thấy mục `Người dùng`; sau khi bị bỏ quyền thì mở `/users` thấy `Bạn không có quyền truy cập`.
  - Vai trò hệ thống: các ô tick bị khóa và tick sẵn, không có nút Sửa, Xóa.
  - Xóa vai trò còn người dùng → hiện lỗi của server; xóa vai trò trống (có xác nhận) → biến khỏi danh sách.
- [ ] **Step 2:** Chạy test → FAIL. **Step 3:** Viết màn hình. **Step 4:** Chạy test → PASS; typecheck, lint, build sạch.
- [ ] **Step 5:** Commit `feat(admin): add roles and permissions screen`.

### Task 11: Màn hình Nhật ký hoạt động và Tài khoản của tôi

**Files:**
- Create: `admin/src/pages/audit-logs/AuditLogsPage.tsx`, `admin/src/pages/account/AccountPage.tsx`, `admin/README.md`
- Modify: `admin/src/App.tsx`
- Test: `admin/e2e/audit-account.spec.ts`

**Interfaces:**
- Consumes: `GET /audit-logs`, `GET /users` (chọn người lọc khi có `users.view`), `PATCH /auth/me`, `POST /auth/change-password`.
- Produces: bảng ánh xạ `AuditAction` sang nhãn tiếng Việt trong `AuditLogsPage.tsx`, ví dụ `auth.login` → `Đăng nhập`, `user.password_reset` → `Đặt lại mật khẩu`, đủ 13 hành động.

- [ ] **Step 1: Viết test thất bại** `audit-account.spec.ts`:
  - Sau khi tạo một người dùng, nhật ký hiện dòng `Tạo người dùng` với người thực hiện và thời gian theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, định dạng `dd/MM/yyyy HH:mm`).
  - Lọc theo hành động và khoảng ngày thu hẹp kết quả.
  - Tài khoản của tôi: đổi họ tên → tên mới hiện ở góc phải; đổi mật khẩu sai mật khẩu hiện tại → lỗi dưới ô; đúng → thông báo thành công, đăng nhập lại bằng mật khẩu mới được.
- [ ] **Step 2:** Chạy test → FAIL. **Step 3:** Viết màn hình và `admin/README.md` (cách chạy dev, biến môi trường, chạy e2e, build). **Step 4:** Chạy toàn bộ `npx playwright test` → PASS; typecheck, lint, build sạch.
- [ ] **Step 5:** Commit `feat(admin): add audit log and account screens`.

### Task 12: Tài liệu và cấu hình triển khai máy chủ

**Files:**
- Create: `docs/deploy/server-setup.md`, `docs/deploy/nginx.conf`, `docs/deploy/istt-api.service`, `docs/deploy/backup-mysql.sh`

**Interfaces:**
- Consumes: scripts `build`, `start`, `db:migrate`, `create-admin` của `server/`; `build` của `admin/` (ra `admin/dist`).
- Produces: đường dẫn trên máy chủ: website `/var/www/webct` (như CI hiện tại), mã nguồn ứng dụng `/opt/istt/web-cty`, trang quản trị `/var/www/istt-admin`, sao lưu `/var/backups/istt-mysql`, người dùng hệ thống `istt` chạy API, database `istt`, tài khoản MySQL `istt_app`.

- [ ] **Step 1:** `nginx.conf`: server cổng 80 phục vụ `/var/www/webct` với `try_files $uri /index.html`, `location /api/public/` proxy tới `127.0.0.1:4000`; server cổng 8080 có `allow 10.0.0.0/8; allow 172.16.0.0/12; allow 192.168.0.0/16; allow 127.0.0.1; deny all;`, phục vụ `/var/www/istt-admin` với `try_files $uri /index.html`, `location /api/admin/` proxy tới `127.0.0.1:4000` kèm `proxy_set_header X-Admin-Gateway <thay bằng ADMIN_GATEWAY_SECRET>`, `X-Forwarded-For`, `Host`; `client_max_body_size 1m`.
- [ ] **Step 2:** Kiểm tra cú pháp: `docker run --rm -v $PWD/docs/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:1.28 nginx -t` → `syntax is ok`.
- [ ] **Step 3:** `istt-api.service`: `User=istt`, `WorkingDirectory=/opt/istt/web-cty/server`, `EnvironmentFile=/opt/istt/web-cty/server/.env`, `ExecStart=/usr/bin/node dist/main.js`, `Restart=on-failure`, `NoNewPrivileges=true`, `ProtectSystem=strict`, `ProtectHome=true`, `PrivateTmp=true`. Kiểm tra: `systemd-analyze verify` nếu có, nếu không thì đối chiếu thủ công.
- [ ] **Step 4:** `backup-mysql.sh`: `set -euo pipefail`, `mysqldump --single-transaction --routines --triggers istt | gzip` ra `/var/backups/istt-mysql/istt-YYYYmmdd-HHMMSS.sql.gz`, đọc thông tin đăng nhập từ `/etc/istt/backup.cnf` (`chmod 600`), xóa các bản cũ chỉ giữ 14 bản mới nhất. Kiểm tra bằng `bash -n` và chạy thật một lần với container MySQL dev.
- [ ] **Step 5:** `server-setup.md` bằng tiếng Việt, từng bước có lệnh cụ thể cho Ubuntu 24.04 LTS: cài Node.js 22 LTS, MySQL 8.4, Nginx; tạo người dùng `istt`; tạo database và `istt_app` chỉ có quyền trên `istt.*`; clone repo vào `/opt/istt/web-cty`; tạo `.env` (sinh `ADMIN_GATEWAY_SECRET` bằng `openssl rand -hex 32`); `npm ci`, `npm run build`, `npm run db:migrate`, `npm run create-admin`; build trang quản trị và copy `admin/dist` vào `/var/www/istt-admin`; cài Nginx và systemd; cron sao lưu lúc 02:00; cách khôi phục từ bản sao lưu; kiểm tra sau cài (`curl` health, mở `http://<IP>:8080`); quy trình cập nhật phiên bản mới; mục lưu ý chuyển mật khẩu deploy trong `.gitlab-ci.yml` sang GitLab CI/CD Variables.
- [ ] **Step 6:** Commit `docs(deploy): add server setup guide, Nginx, systemd and backup configs`.

### Task 13: Kiểm tra toàn bộ và xác nhận website không bị ảnh hưởng

**Files:** không tạo file mới, chỉ sửa nếu kiểm tra phát hiện lỗi.

- [ ] **Step 1:** `git diff --stat origin/main -- src public package.json package-lock.json tsconfig.json .gitlab-ci.yml` → rỗng.
- [ ] **Step 2:** `grep -rnE "^\s*(//|/\*|\*|#)" server/src server/prisma/schema.prisma server/test admin/src admin/e2e docs/deploy/*.conf docs/deploy/*.service` → không có comment (ngoại trừ dòng shebang `#!` của `backup-mysql.sh`).
- [ ] **Step 3:** `server/`: `npm ci && npm run typecheck && npm run lint && npm test` → tất cả PASS. `admin/`: `npm ci && npm run typecheck && npm run lint && npm run build && npx playwright test` → tất cả PASS.
- [ ] **Step 4:** Website: chạy dev server của website và bộ kiểm tra giao diện hiện có (header/hero, Business Areas, toàn trang chủ, đối tác/khách hàng, sáu trang con, typography toàn site) → kết quả như trước khi bắt đầu dự án con 1.
- [ ] **Step 5:** Kiểm tra không có bí mật: `git grep -nIE "(password|secret|token)\s*[:=]\s*['\"][^'\"]{6,}"` chỉ ra các giá trị dùng trong test và `docker-compose.yml` dev; `.env` không nằm trong `git ls-files`.
- [ ] **Step 6:** Commit các sửa chữa nếu có, đẩy nhánh `claude/epic-thompson-fjrmm7`.
