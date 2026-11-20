# site-e2e: kiểm thử website CMS

Thư mục này chứa hai việc:

1. Bộ kiểm thử Playwright cho lớp `src/cms` của website (bản đóng gói sẵn, xem trước, `?lang=`).
2. Công cụ so sánh ảnh chụp trước và sau khi chuyển một trang sang dạng khối.

Cổng cần trống: `3100` (website), `3101` (website bản gốc khi chụp ảnh gốc), `4000` (API).

## Cài đặt

```bash
cd site-e2e
npm ci
```

Ở gốc repo cũng cần `npm ci` (website). Trình duyệt Playwright đã có sẵn trên máy; không chạy `playwright install`.

## Chuẩn bị API (cho `fallback.spec.ts` và `preview.spec.ts`)

Hai bộ kiểm thử này cần API chạy ở cổng 4000 với cơ sở dữ liệu đã có 10 trang thật.

```bash
cd server
docker compose up -d --wait

export DATABASE_URL=mysql://root:istt-dev@127.0.0.1:3307/istt_e2e
export PORT=4000
export ADMIN_ORIGIN=http://localhost:5173
export PUBLIC_SITE_ORIGIN=http://localhost:3100
export ADMIN_GATEWAY_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
export COOKIE_SECURE=false
export MEDIA_DIR=/tmp/istt-e2e-media
export WEBSITE_INDEX_PATH=../public/index.html
export NODE_ENV=development

npm run e2e:seed
npx tsx src/cli/content-import.ts --force --fallback-out /tmp/istt-site-fallback.json
npm run dev
```

- `e2e:seed` tạo cơ sở dữ liệu `istt_e2e`, tài khoản `admin@istt.vn` / `Matkhau@12345` và vài trang thử.
- Lệnh `content:import --force` thêm 10 trang thật. Tham số `--fallback-out` trỏ ra file tạm để không ghi đè `src/content/cms-fallback.json` của repo.
- Có thể đổi địa chỉ API, nguồn gốc trang quản trị, khóa gateway và tài khoản bằng các biến `SITE_E2E_API`, `SITE_E2E_ADMIN_ORIGIN`, `SITE_E2E_GATEWAY_SECRET`, `SITE_E2E_ADMIN_EMAIL`, `SITE_E2E_ADMIN_PASSWORD`.

## Chạy kiểm thử

```bash
cd site-e2e
npx playwright test
```

Playwright tự chạy website (`react-scripts start`, cổng 3100) với `REACT_APP_CMS_PATHS_OVERRIDE=/contact`, nghĩa là trang `/contact` được hiển thị bằng `CmsPage`. Biến này chỉ có tác dụng khi `NODE_ENV` khác `production`. Website dev chuyển `/api` và `/media` sang `http://127.0.0.1:4000` qua `src/setupProxy.js` (đổi đích bằng `CMS_API_TARGET`).

Nếu đã có website chạy sẵn ở cổng 3100, Playwright dùng lại. Hãy chắc rằng website đó được khởi động với biến `REACT_APP_CMS_PATHS_OVERRIDE=/contact`, nếu không các kiểm thử sẽ lỗi.

## Ảnh chụp so sánh

Ảnh chụp toàn trang cho 10 đường dẫn, 3 độ rộng (1440, 834, 390) và 2 ngôn ngữ (`vi`, `en`). Trình duyệt dùng `reducedMotion: "reduce"` (slider trang chủ đứng yên), chặn mọi yêu cầu ra ngoài `localhost`, chờ font và mạng rảnh, cuộn qua toàn trang để kích hoạt hiệu ứng hiện dần rồi cuộn về đầu trang.

1. Tạo ảnh gốc từ một commit (chỉ làm một lần, hoặc khi cần làm mới):

   ```bash
   node scripts/baseline.mjs d1b0193
   ```

   Lệnh tạo git worktree của commit trong `.baseline-src`, chạy `npm ci`, khởi động website ở cổng 3101, chụp ảnh vào `.baseline/`, rồi tắt website.

2. So sánh website hiện tại (cổng 3100) với ảnh gốc:

   ```bash
   node scripts/compare.mjs
   node scripts/compare.mjs --paths /contact,/about
   ```

   Nếu cổng 3100 chưa có website, script tự khởi động (không có `REACT_APP_CMS_PATHS_OVERRIDE`). Dùng pixelmatch với `threshold 0.1`; một ảnh đạt khi số điểm ảnh khác không quá 0,1%. Ảnh khác biệt của các ảnh không đạt được ghi vào `.diff/`.

3. `tests/visual.spec.ts` đọc `src/cms/cmsPaths.ts` và chạy bước 2 cho mọi đường dẫn đã chuyển (danh sách rỗng thì bỏ qua). Cần có `.baseline/` trước.

Các thư mục `.baseline`, `.baseline-src`, `.current`, `.diff`, `test-results` và `playwright-report` không được commit.
