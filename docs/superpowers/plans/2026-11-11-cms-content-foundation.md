# Kế hoạch triển khai: Nền tảng nội dung CMS (Dự án con 2a)

> **Cho agent thực thi:** BẮT BUỘC dùng superpowers:subagent-driven-development (khuyên dùng) hoặc superpowers:executing-plans để làm từng task. Các bước dùng checkbox (`- [ ]`) để theo dõi.

**Mục tiêu:** Nội dung các trang website được lưu dưới dạng khối trong MySQL. Nhân viên sửa, xem trước, xuất bản và khôi phục nội dung từ trang quản trị. Website hiển thị đúng như hiện tại nhưng đọc nội dung từ API, có bản dự phòng, có thẻ SEO theo trang.

**Kiến trúc:**
- `server/`: thêm module `content` (khuôn khối, trang, bản nháp, phiên bản, xuất bản), `media` (thư viện ảnh) và API công khai (`pages`, `preview`, `render`).
- `admin/`: thêm màn hình Trang, Sửa trang, Lịch sử và Thư viện ảnh.
- Website: thêm lớp `src/cms/` lấy nội dung trang và hiển thị từng khối bằng component section hiện có. Các component được sửa để nhận nội dung qua tham số. Chuyển dần từng trang, mỗi trang được kiểm bằng so sánh ảnh chụp trước và sau, trong thư mục mới `site-e2e/`.

**Công nghệ** (thêm vào những gì dự án con 1 đã có):
- `server/`: multer 2.5.0, file-type 22.3.0, image-size 2.1.0, dompurify 3.4.17 + jsdom.
- `admin/`: @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0.
- `site-e2e/`: @playwright/test 1.56.1, pixelmatch, pngjs.

Phiên bản thư viện mới nào chưa ghi ở trên (jsdom, @dnd-kit/utilities, pixelmatch, pngjs…) thì chọn bản ổn định mới nhất tương thích, rồi khóa chính xác.

**Đặc tả:** [docs/superpowers/specs/2026-11-11-cms-content-foundation-design.md](../specs/2026-11-11-cms-content-foundation-design.md). Đặc tả là căn cứ; kế hoạch này ghi các quyết định mà đặc tả chưa chốt. Xem thêm [đặc tả dự án con 1](../specs/2026-11-10-backend-foundation-design.md) cho các quy ước dùng chung.

## Ràng buộc chung

- **Không viết comment trong mã nguồn** (`.ts`, `.tsx`, `.js`, `.prisma`, migration viết tay, `.conf`, `.service`, `.sh`; dòng `#!` được phép). Giải thích nằm trong Markdown.
- Không sửa `package.json`, `package-lock.json`, `tsconfig.json` ở gốc và `.gitlab-ci.yml`. Website không được thêm thư viện. `npm ci` ở gốc để cài thư viện thì được.
- `server/`, `admin/`, `site-e2e/` và website không import code của nhau. Đọc file dữ liệu JSON của thư mục khác thì được.
- Khóa phiên bản chính xác (không `^`) cho mọi thư viện mới trong `server/`, `admin/`, `site-e2e/`.
- TypeScript `strict`. Thời gian UTC `DATETIME(3)`. `utf8mb4_unicode_ci`. ID trong JSON là `number`.
- Chữ hiển thị là `LocalizedText = { vi: string; en: string }`, trong đó `vi` có ít nhất 1 ký tự sau khi `trim`, còn `en` có thể rỗng. Website chọn `en` khi đang ở tiếng Anh và `en.trim()` khác rỗng, ngược lại dùng `vi`.
- Ảnh trong nội dung đã lưu là `{ mediaId: number }`. Ảnh trong file seed là `{ src: "/img/..." }`.
- Liên kết (`href`) phải khớp `^(/[^\s]*|#[A-Za-z][\w-]*|https://[^\s]+)$`.
- Giới hạn: ảnh tối đa 5 MB (5 × 1024 × 1024 byte) và 8000 × 8000 điểm ảnh; nội dung một trang tối đa 1 MB khi serialize JSON; token xem trước hết hạn sau 30 phút; cache công khai `max-age=60`; website chờ API tối đa 5 giây; khóa `localStorage` là `istt_content:<path>`.
- Thông báo cho người dùng bằng tiếng Việt, theo đúng đặc tả.

## Trọng tâm review

1. **Nội dung chưa dịch và chuỗi chỉ có khoảng trắng.** Khi `en` là `"   "` hoặc rỗng, website tiếng Anh hiện bản `vi`, đếm "chưa dịch" vẫn tính chỗ đó, và thẻ SEO tiếng Anh dùng `vi`. Test ở Task 2 (`pick`, `countUntranslated`), Task 6 (`render`) và Task 11 (`pick` phía website).
2. **Lưu đồng thời trong lúc xuất bản.** Một người bấm Xuất bản đúng lúc người khác Lưu nháp: phiên bản xuất bản phải là một bản nháp trọn vẹn (bản trước hoặc bản sau khi lưu), không trộn lẫn; số phiên bản không trùng khi xuất bản đồng thời hai lần. Test ở Task 4.
3. **Ảnh bị xóa khỏi thư viện trong lúc bản nháp vẫn đang dùng.** Xóa bị chặn với `409`. Nếu một bản cũ trong lịch sử dùng ảnh đã xóa, thì khôi phục bản đó báo `400` chỉ rõ trường ảnh không tồn tại, không lưu dữ liệu hỏng. Test ở Task 3 và Task 4.
4. **Đường dẫn có dấu `/` ở cuối, chữ hoa, hoặc `?lang=xx` lạ** (`/about/`, `/About`, `?lang=fr`). API công khai và `render` chuẩn hóa đường dẫn (bỏ `/` cuối trừ `/`, chữ thường, `/home` coi là `/`), và coi `lang` khác `en` là `vi`. Test ở Task 5 và Task 6.
5. **Website có bản lưu `localStorage` cũ hoặc hỏng** (JSON sai, khác khuôn, của phiên bản cũ). Website bỏ qua bản hỏng, dùng bản đóng gói sẵn, không lỗi trắng trang. Test ở Task 11.

---

## Cấu trúc file

```
server/
  prisma/schema.prisma, prisma/migrations/<ts>_content/migration.sql
  content-seed/<slug>.json              nguồn nhập dữ liệu ban đầu, mỗi trang một file
  src/modules/content/
    localized.ts                        LocalizedText, Heading, MediaRef, Link, pick, countUntranslated
    blocks/<type>.ts                    khuôn Zod của từng loại khối
    blocks/index.ts                     BLOCK_SCHEMAS, BlockType, blockSchema, pageContentSchema
    pages.service.ts, pages.routes.ts, pages.schemas.ts
    versions.service.ts
    preview.service.ts
    public.routes.ts, render.service.ts
    media-refs.ts                       collectMediaIds, resolveMedia
  src/modules/media/
    media.service.ts, media.routes.ts, media.storage.ts, svg-sanitize.ts
  src/cli/content-import.ts
  test/fixtures/block-samples.json      một mẫu hợp lệ cho mỗi loại khối, dùng chung 3 bên
admin/src/
  api/content.ts                        kiểu và hàm gọi API nội dung, thư viện ảnh
  content/blockForms.ts                 mô tả form cho từng loại khối
  content/FieldEditor.tsx, LocalizedInput.tsx, MediaPicker.tsx, BlockList.tsx
  pages/content/PagesPage.tsx, PageEditorPage.tsx, HistoryTab.tsx, SeoTab.tsx
  pages/media/MediaPage.tsx
src/cms/                                website
  types.ts, pick.ts, useCmsPage.ts, BlockRenderer.tsx, CmsPage.tsx, cmsPaths.ts, PreviewBanner.tsx
src/content/cms-fallback.json           bản đóng gói sẵn, do lệnh nhập dữ liệu tạo ra
site-e2e/
  package.json, playwright.config.ts, scripts/baseline.mjs, scripts/compare.mjs
  tests/visual.spec.ts, tests/fallback.spec.ts, tests/preview.spec.ts
docs/deploy/                            bổ sung media, render, sao lưu ảnh
```

## Mô hình khối đã chốt

Dùng các kiểu ở Task 2:
- `L` = `LocalizedText`.
- `H` = `Heading = { lead: L; emphasis: L }`. `emphasis` có thể có `vi` rỗng; khi đó website không hiện phần nhấn mạnh.
- `M` = `MediaRef`.
- `A` = `Link = { label: L; href: string }`.

Giới hạn số phần tử ghi trong ngoặc. Các chữ giao diện cố định ("Learn more", nhãn form, nhãn trợ năng, số thứ tự 01-03) **vẫn ở file dịch**, không nằm trong khối.

| `type` | `data` |
|---|---|
| `home-hero` | `eyebrow: L, title: L, slides: { image: M, tagline: L }[] (1–6), primaryCta: A, secondaryCta: A` |
| `solution-banner` | `image: M, eyebrow: L, title: L, subtitle: L, buttonLabel: L` |
| `about-banner` | `image: M, title: L, subtitle: L, eyebrow: L, headingLevel: 1 \| 2` |
| `home-about` | `image: M, foundedLabel: L, foundedYear: string (1–10), eyebrow: L, heading: H, lead: L, stats: { value: string (1–10), label: L }[] (0–4), cta: A` |
| `business-areas` | `eyebrow: L, heading: H, buttonLabel: L, areas: { title: L, description: L, href, image: M, imagePosition: string (0–30) }[] (1–6)` |
| `home-services` | `eyebrow: L, heading: H, allLink: A, items: { title: L, description: L, href, image: M }[] (1–6)` |
| `home-values` | `eyebrow: L, heading: H, philosophy: L, items: { name: L, description: L }[] (1–6)` |
| `partners` | `eyebrow: L, heading: L, intro: L, initialCount: int (1–50), items: { name: string (1–100), logo: M }[] (1–80)` |
| `customers` | `eyebrow: L, heading: L, intro: L, items: { name: L, logo: M }[] (1–80)` |
| `home-contact` | `eyebrow: L, heading: H, cta: A` |
| `overview` | `eyebrow: L, heading: H, images: M[] (1–3), paragraphs: L[] (1–6), yearBadge: L` |
| `mission` | `image: M, eyebrow: L, heading: H, points: L[] (1–6)` |
| `vision` | `image: M, eyebrow: L, heading: H, body: L` |
| `core-values` | `eyebrow: L, heading: H, items: { icon: M, title: L, description: L }[] (1–6)` |
| `core-values-system` | `eyebrow: L, title: L, items: { title: L, bullets: L[] (1–6), image: M, icon: M \| null }[] (1–8)` |
| `services-list` | `pageTitle: L, sectionTitle: L, text: L, image: M` |
| `our-services` | `eyebrow: L, heading: H, buttonLabel: L, items: { title: L, description: L, icon: M, href, categories: { name: L, bullets: L[] (1–6) }[] (1–6) }[] (1–6)` |
| `opportunity` | `image: M, subtitle: L, title: L, description: L, stats: { value: string, label: L }[] (0–4)` |
| `office-map` | `offices: { name: L, shortName: L }[]` (đúng 2 phần tử; bản đồ và tọa độ vẫn cố định trong code theo thứ tự) |
| `contact-form` | `variant: "page" \| "inline", eyebrow: L, heading: H, tagline: L, formEyebrow: L, formHeading: H` (thông tin liên hệ, nhãn ô nhập và địa chỉ nhận email vẫn ở file dịch và code) |

Các trang và đường dẫn được nhập:

| Đường dẫn | Tên trang |
|---|---|
| `/` | Trang chủ |
| `/about` | Giới thiệu |
| `/services` | Dịch vụ |
| `/contact` | Liên hệ |
| `/information-communication-technology` | Giải pháp ICT |
| `/secure-defense` | An ninh & Quốc phòng |
| `/digital-transformation` | Chuyển đổi số |
| `/integration` | Tích hợp hệ thống |
| `/software` | Phát triển phần mềm |
| `/support` | Hỗ trợ kỹ thuật |

`/home` là bí danh của `/`.

**Khác với đặc tả mục 5:**
- **Bỏ loại khối `premium`:** trang Premium không có route và không truy cập được (`router/config.ts`), nên không nhập.
- **Thêm cột `media.source_path`**, chứa đường dẫn gốc `/img/...` của ảnh được nhập. Website tra kích thước logo đối tác trong `logoMetrics.ts` theo `sourcePath`. Logo mới, không có `sourcePath`, dùng kích thước mặc định của component `Logo`.

---

### Task 1: Migration nội dung, quyền mới và cấp quyền mặc định

**Files:**
- Modify: `server/prisma/schema.prisma`, `server/src/modules/permissions/catalog.ts`, `server/src/modules/permissions/sync.ts`, `server/src/modules/audit/audit.service.ts`
- Create: `server/prisma/migrations/<timestamp>_content/migration.sql`
- Test: `server/test/content-schema.test.ts`, `server/test/permissions-sync.test.ts` (sửa)

**Interfaces:**
- Produces: các model Prisma `Page`, `PageDraft`, `PageVersion`, `Media`, `PreviewToken`, với các bảng và cột theo đặc tả mục 4 và 7.2. Thêm:
  - `media.source_path VARCHAR(255) NULL`;
  - `preview_tokens(id, token_hash CHAR(64) UNIQUE, page_id, expires_at, created_by_user_id NULL, created_at)`.
- Ràng buộc và chỉ mục:
  - `page_versions` có `@@unique([pageId, number])`;
  - `pages.published_version_id` là khóa ngoại tới `page_versions`, `ON DELETE SET NULL`;
  - xóa `pages` thì xóa dây chuyền `page_drafts`, `page_versions`, `preview_tokens`;
  - `media.file_name` duy nhất, kèm chỉ mục `media(sha256)` qua cột `sha256 CHAR(64) UNIQUE`.
- Produces: `PermissionKey` thêm `"content.view" | "content.edit" | "content.publish" | "media.manage"`.
  - Mỗi mục trong `PERMISSIONS` có thêm trường tùy chọn `defaultRoles?: string[]`. Bốn quyền mới có `defaultRoles: [EDITOR_ROLE_NAME]`.
  - Module và nhãn theo đặc tả mục 6.
- Produces: `syncPermissions` chỉ cấp `defaultRoles` cho quyền **vừa được tạo mới** trong lần đồng bộ đó. Quyền đã có thì không tự cấp lại, kể cả khi quản trị viên đã bỏ.
- Produces: `AuditAction` thêm `content.draft_save`, `content.publish`, `content.restore`, `media.upload`, `media.update`, `media.delete`. Admin hiển thị nhãn cho các hành động này ở Task 10.
- Produces: kiểm tra quyền trong `auth.middleware`: `content.edit` và `content.publish` đều bao gồm `content.view`, theo cùng cách `users.manage` bao gồm `users.view`.

- [ ] **Step 1: Viết test thất bại**
  - `content-schema.test.ts`: sau migrate có đủ 5 bảng mới. Tạo 2 `PageVersion` cùng `pageId` và cùng `number` thì lỗi `P2002`. Xóa `Page` thì xóa luôn bản nháp, phiên bản và token.
  - `permissions-sync.test.ts`:
    - trên DB vừa reset, sync xong thì `Biên tập viên` có đúng 4 quyền mới;
    - bỏ `content.edit` khỏi Biên tập viên rồi sync lại thì quyền đó **không** được cấp lại.
  - `auth.test.ts`: người có `content.publish` gọi được một route chỉ yêu cầu `content.view`. Dùng route Task 4 nếu đã có; nếu chưa, kiểm trực tiếp bằng hàm `hasPermission` của middleware.
- [ ] **Step 2:** `npm test -- content-schema permissions-sync` → FAIL.
- [ ] **Step 3:** Viết schema và migration. Sửa catalog, sync, audit và middleware.
- [ ] **Step 4:** `npm test`, `npm run typecheck`, `npm run lint` → PASS.
- [ ] **Step 5:** Commit `feat(server): add content tables, content permissions and default editor grants`.

### Task 2: Kiểu song ngữ và khuôn dữ liệu 20 loại khối

**Files:**
- Create: `server/src/modules/content/localized.ts`, `server/src/modules/content/blocks/*.ts` (mỗi loại khối một file) và `server/src/modules/content/blocks/index.ts`
- Create: `server/test/fixtures/block-samples.json`
- Test: `server/test/blocks.test.ts`, `server/test/localized.test.ts`

**Interfaces:**
- Produces trong `localized.ts`:
  - `localizedText`, `heading`, `mediaRef`, `link`, `href` (Zod);
  - `type LocalizedText`, `Heading`, `MediaRef`, `Link`;
  - `pick(text: LocalizedText, lang: "vi" | "en"): string`;
  - `countUntranslated(value: unknown): number`, đệ quy, đếm mọi `LocalizedText` có `vi` khác rỗng nhưng `en.trim()` rỗng.
- Produces trong `blocks/index.ts`:
  - `BLOCK_TYPES` (20 loại, theo thứ tự bảng ở trên) và `type BlockType`;
  - `BLOCK_SCHEMAS: Record<BlockType, ZodType>`;
  - `blockSchema`, là union phân biệt theo `type`: `{ id: string (6–32, [a-z0-9]), type, hidden: boolean, data }`;
  - `pageContentSchema = { seo: { title: L, description: L, image: M | null }, blocks: blockSchema[] (0–40) }`, kèm `refine` kiểm tra `id` khối không trùng trong trang;
  - `type PageContent`, `type Block`.
- Produces `block-samples.json`: `{ "<type>": { …data hợp lệ, ảnh dạng { mediaId: 1 } } }` cho cả 20 loại khối. Admin (Task 9) và website (Task 11) đọc file này để test kiểu dữ liệu của mình.

- [ ] **Step 1: Viết test thất bại**
  - `localized.test.ts`:
    - `pick({vi:"A",en:""},"en")` → `"A"`;
    - `pick({vi:"A",en:"  "},"en")` → `"A"`;
    - `pick({vi:"A",en:"B"},"en")` → `"B"`;
    - `countUntranslated` trên đối tượng lồng nhau có 2 chỗ thiếu `en` → `2`;
    - `localizedText` từ chối `vi: " "`;
    - `href` nhận `/about`, `#solutions`, `https://istt.com.vn`, và từ chối `javascript:alert(1)`, `http://x`, `//evil.com`.
  - `blocks.test.ts`:
    - mỗi mẫu trong `block-samples.json` hợp lệ theo khuôn của loại đó (một test cho mỗi loại, tạo bằng `it.each`);
    - với mỗi loại, xóa một trường bắt buộc thì lỗi có `path` chứa đúng tên trường;
    - `office-map` có 1 hoặc 3 văn phòng thì bị từ chối;
    - `pageContentSchema` từ chối hai khối trùng `id` và từ chối 41 khối;
    - `type` lạ thì bị từ chối.
- [ ] **Step 2:** `npm test -- blocks localized` → FAIL.
- [ ] **Step 3:** Viết các khuôn đúng như bảng "Mô hình khối đã chốt". Chuỗi đều `trim`. Giới hạn độ dài: chữ một dòng tối đa 300 ký tự mỗi ngôn ngữ, đoạn văn tối đa 5000.
- [ ] **Step 4:** `npm test`, `npm run typecheck`, `npm run lint` → PASS.
- [ ] **Step 5:** Commit `feat(server): add localized types and block schemas`.

### Task 3: Thư viện ảnh

**Files:**
- Create: `server/src/modules/media/media.storage.ts`, `svg-sanitize.ts`, `media.service.ts`, `media.routes.ts`; `server/src/modules/content/media-refs.ts`
- Modify: `server/src/config.ts` (biến `MEDIA_DIR`, bắt buộc), `server/.env.example`, `server/src/app.ts`, `server/src/http/errors.ts` (mã `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`)
- Test: `server/test/media.test.ts`, `server/test/svg-sanitize.test.ts`

**Interfaces:**
- Produces: `MediaDto = { id, fileName, originalName, mimeType, sizeBytes, width, height, alt: L, url: "/media/<fileName>", sourcePath: string | null, createdAt }`.
- Produces: `storeMedia(prisma, config, file: { buffer: Buffer; originalName: string }, actorUserId: bigint | null, sourcePath?: string): Promise<MediaDto>`, dùng chung cho route upload và cho lệnh nhập dữ liệu (Task 7).
  - Định dạng xác định bằng `file-type` theo nội dung. SVG nhận diện bằng phần đầu file có `<svg`.
  - Kích thước ảnh đọc bằng `image-size`.
  - SVG được làm sạch bằng `sanitizeSvg(input: string): string` (DOMPurify + jsdom, profile `svg`, cấm `script`, `foreignObject`, thuộc tính `on*` và `href` không bắt đầu bằng `#`).
  - `file_name = sha256(buffer đã làm sạch).slice(0,16) + "." + đuôi`. Nếu trùng `sha256` thì trả bản ghi cũ.
  - Ghi file bằng cách ghi ra file tạm rồi `rename`.
- Produces: `collectMediaIds(content: PageContent): Set<number>`, tìm mọi `mediaId` trong toàn bộ cây nội dung, gồm cả `seo.image`.
- Produces: `assertMediaExist(db, content): Promise<void>`. Nếu thiếu ảnh thì ném `AppError(400, "VALIDATION_ERROR")`, với `fields[<đường dẫn tới trường>] = "Ảnh không tồn tại"`.
- Produces các route `GET /media`, `POST /media`, `PATCH /media/:id`, `DELETE /media/:id`, `GET /media/:id/usage`, với quyền theo đặc tả mục 7.1.
  - Ảnh được coi là "đang dùng" khi nằm trong `page_drafts.content` hoặc trong phiên bản đang xuất bản (`pages.published_version_id`).
  - `usage` trả `{ pages: { id, path, name }[] }`.
- Produces: ở môi trường khác `production`, `createApp` phục vụ `/media` bằng `express.static(config.mediaDir, { immutable: true, maxAge: "1y" })`.

- [ ] **Step 1: Viết test thất bại**
  - `svg-sanitize.test.ts`: SVG có `<script>`, `onload=`, `<foreignObject>`, `href="javascript:…"`, `href="https://x"` thì đều bị loại bỏ. Hình `<path>` vẫn còn nguyên.
  - `media.test.ts` (MEDIA_DIR là thư mục tạm cho mỗi file test):
    - upload PNG nhỏ → `201`, file tồn tại, `width`/`height` đúng, audit `media.upload`;
    - upload cùng file lần hai → cùng `id`;
    - file `.png` thực ra là text → `415 UNSUPPORTED_MEDIA_TYPE`;
    - file lớn 5 MB + 1 byte → `413 PAYLOAD_TOO_LARGE`;
    - ảnh 8001 × 10 → `400`;
    - không có `media.manage` → `403`. Người chỉ đăng nhập vẫn `GET /media` được;
    - `PATCH` alt → lưu đúng, audit `media.update`;
    - `DELETE` ảnh chưa dùng → `204`, file bị xóa, audit `media.delete`;
    - `DELETE` ảnh đang dùng trong bản nháp (tạo trực tiếp bằng prisma) → `409`, body `fields.pages` liệt kê trang;
    - `GET /media?q=` tìm theo `originalName` và `alt.vi` không phân biệt dấu;
    - `GET /media/:id/usage` đúng danh sách.
- [ ] **Step 2:** `npm test -- media svg-sanitize` → FAIL.
- [ ] **Step 3:** Viết code. Multer dùng `memoryStorage` với `limits.fileSize = 5 MB + 1`. Lỗi `LIMIT_FILE_SIZE` chuyển thành `413`.
- [ ] **Step 4:** `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` → PASS.
- [ ] **Step 5:** Commit `feat(server): add media library with upload validation and SVG sanitizing`.

### Task 4: API quản trị trang: bản nháp, xuất bản, lịch sử, khôi phục

**Files:**
- Create: `server/src/modules/content/pages.service.ts`, `pages.routes.ts`, `pages.schemas.ts`, `versions.service.ts`
- Modify: `server/src/app.ts`
- Test: `server/test/pages.test.ts`, `server/test/pages-concurrency.test.ts`

**Interfaces:**
- Consumes: `pageContentSchema`, `countUntranslated` (Task 2); `assertMediaExist` (Task 3); `requirePermission`, `recordAudit`, `parseId`.
- Produces: `PageListItem = { id, path, name, hasUnpublishedChanges, untranslatedCount, publishedVersion: { number, publishedAt, publishedBy: { id, fullName } | null } | null, draftUpdatedAt, draftUpdatedBy: { id, fullName } | null }`.
  - `hasUnpublishedChanges` bằng `true` khi chưa có phiên bản xuất bản, hoặc khi JSON bản nháp khác JSON phiên bản đang xuất bản (so bằng chuỗi JSON đã sắp xếp khóa).
- Produces: `PageDetail = { id, path, name, draft: { content, revision, updatedAt }, published: { number, content } | null }`.
- Produces: `PUT /pages/:id/draft` body `{ content, revision }`.
  - Nội dung quá 1 MB → `413`.
  - Lưu bằng `updateMany({ where: { pageId, revision }, data: { content, revision: { increment: 1 } } })`. Nếu `count = 0` thì trả `409 CONFLICT` "Trang đã được người khác sửa".
  - Thành công trả `{ revision }` mới. Audit `content.draft_save` với `metadata { revision }`.
- Produces: `POST /pages/:id/publish` body `{ note?: string (≤500) }`. Toàn bộ trong một transaction:
  1. `SELECT … FOR UPDATE` trên dòng `pages`;
  2. đọc bản nháp;
  3. `number = max + 1`;
  4. tạo `page_versions`;
  5. cập nhật `published_version_id`.
  - Trả `{ number }`. Audit `content.publish`.
  - Gọi hook `onPublished(path)`, để Task 6 xóa cache render.
- Produces: `GET /pages/:id/versions` → `{ items: { number, note, publishedAt, publishedBy }[] }`, mới nhất trước. `GET /pages/:id/versions/:number` → `{ number, content, note, publishedAt, publishedBy }`.
- Produces: `POST /pages/:id/versions/:number/restore`.
  - Kiểm tra ảnh bằng `assertMediaExist`, rồi chép nội dung phiên bản vào bản nháp, tăng `revision`.
  - Trả `{ revision }`. Audit `content.restore` với `metadata { number }`.
- Produces: `createPagesRouter(deps, hooks: { onPublished: (path: string) => void })`. `createApp` truyền hook vào.

- [ ] **Step 1: Viết test thất bại** `pages.test.ts`. Tạo trang trực tiếp bằng prisma, dùng mẫu từ `block-samples.json` với các ảnh có thật.
  - Quyền: `content.view` xem được; `PUT draft` cần `content.edit`; `publish` và `restore` cần `content.publish`; không có quyền → `403`.
  - Khối sai khuôn → `400`, `fields` chứa `blocks.0.data.title.vi`.
  - `mediaId` không tồn tại → `400`.
  - Lưu đúng `revision` → `revision + 1`; lưu bằng `revision` cũ → `409`.
  - Xuất bản lần 1 → `number 1`; sửa nháp rồi xuất bản → `number 2`.
  - `hasUnpublishedChanges` bằng `false` ngay sau xuất bản, `true` sau khi sửa.
  - `untranslatedCount` đúng số chỗ thiếu `en`.
  - Khôi phục bản 1 → nội dung nháp bằng bản 1, phiên bản đang xuất bản vẫn là 2.
  - Khôi phục một bản có ảnh đã bị xóa bằng prisma → `400`, nháp không đổi.
  - Ghi chú dài 501 ký tự → `400`.
  - `/pages/abc` → `404`.
- [ ] **Step 2: Viết test thất bại** `pages-concurrency.test.ts`:
  - hai lần xuất bản đồng thời bằng `Promise.all` cho ra hai số phiên bản 1 và 2, không trùng;
  - xuất bản đồng thời với lưu nháp: nội dung phiên bản vừa xuất bản bằng đúng nội dung nháp trước hoặc sau khi lưu, so sánh `toEqual` với một trong hai.
- [ ] **Step 3:** `npm test -- pages` → FAIL.
- [ ] **Step 4:** Viết service và routes.
- [ ] **Step 5:** `npm test`, typecheck, lint → PASS.
- [ ] **Step 6:** Commit `feat(server): add page drafts, publishing, history and restore`.

### Task 5: Xem trước và API nội dung công khai

**Files:**
- Create: `server/src/modules/content/preview.service.ts`, `server/src/modules/content/public.routes.ts`
- Modify: `server/src/modules/content/media-refs.ts` (thêm `resolveMedia`), `server/src/modules/content/pages.routes.ts`, `server/src/app.ts`, `server/src/config.ts` (biến `PUBLIC_SITE_ORIGIN`, bắt buộc)
- Test: `server/test/public-content.test.ts`, `server/test/preview.test.ts`

**Interfaces:**
- Produces: `normalizePath(input: string): string | null`.
  - Bỏ query và hash, chuyển chữ thường, bỏ `/` cuối (trừ `/`), `/home` → `/`.
  - Trả `null` nếu không bắt đầu bằng `/` hoặc dài hơn 191 ký tự.
- Produces: `resolveMedia(db, content): Promise<ResolvedContent>`. Thay mọi `{ mediaId }` bằng `{ url, width, height, alt: L, sourcePath }`; nếu ảnh không còn thì thay bằng `null`.
- Produces: `POST /api/admin/pages/:id/preview` → `{ url: PUBLIC_SITE_ORIGIN + path + "?preview=" + token }`, cần quyền `content.view`. Token 32 byte dạng base64url, DB lưu SHA-256.
- Produces: `GET /api/public/pages?path=` → `200 { path, version, content: ResolvedContent }`.
  - Header `Cache-Control: public, max-age=60` và `ETag: "W/<page id>-<version number>"`. Request có `If-None-Match` khớp → `304`.
  - Không có trang, chưa xuất bản, hoặc `path` không hợp lệ → `404 NOT_FOUND`.
- Produces: `GET /api/public/preview/:token` → `200 { path, version: null, content }` từ bản nháp, header `Cache-Control: no-store`. Token sai hoặc hết hạn → `404`.
- Produces: `deleteExpiredPreviewTokens(prisma, now)` được gọi trong vòng dọn dẹp mỗi giờ của `main.ts`.

- [ ] **Step 1: Viết test thất bại**
  - `public-content.test.ts`:
    - trang chưa xuất bản → `404`;
    - sau khi xuất bản → `200`, nội dung là bản xuất bản chứ không phải bản nháp đã sửa sau đó;
    - ảnh có `url` dạng `/media/<16 hex>.png` và có `sourcePath`;
    - `ETag` có mặt, gửi lại `If-None-Match` → `304`;
    - `path=/about/`, `/About`, `/about?x=1` đều cho cùng kết quả với `/about`; `/home` ra trang `/`;
    - `path=about` → `404`;
    - không cần cookie hay header gateway.
  - `preview.test.ts`:
    - tạo token cần `content.view`;
    - URL bắt đầu bằng `PUBLIC_SITE_ORIGIN`;
    - token trả bản nháp;
    - `clock.advance(30 * 60_000 + 1)` → `404`;
    - token của trang A không xem được trang khác, vì trả đúng `path` của A;
    - DB không chứa token gốc.
- [ ] **Step 2:** `npm test -- public-content preview` → FAIL.
- [ ] **Step 3:** Viết code.
- [ ] **Step 4:** `npm test`, typecheck, lint → PASS.
- [ ] **Step 5:** Commit `feat(server): add draft preview tokens and public content API`.

### Task 6: Đường dẫn `render` chèn thẻ SEO

**Files:**
- Create: `server/src/modules/content/render.service.ts`
- Modify: `server/src/modules/content/public.routes.ts`, `server/src/app.ts`, `server/src/config.ts` (biến `WEBSITE_INDEX_PATH`, bắt buộc), `server/.env.example`
- Test: `server/test/render.test.ts`

**Interfaces:**
- Produces: `createRenderer(deps): { render(path: string, lang: "vi" | "en"): Promise<string>; invalidate(): void }`.
  - Đọc `WEBSITE_INDEX_PATH` một lần, rồi đọc lại khi `invalidate`.
  - Cache theo `path|lang`, tối đa 500 mục.
  - `invalidate` được gắn vào `onPublished` (Task 4) và vào thao tác khôi phục.
- Thẻ được chèn:
  - thay nội dung `<title>`;
  - thay hoặc thêm `<meta name="description">`, `og:title`, `og:description`, `og:image` (URL tuyệt đối từ `PUBLIC_SITE_ORIGIN`), `og:url` (`PUBLIC_SITE_ORIGIN + path`, thêm `?lang=en` khi là tiếng Anh), `og:type=website`, `og:locale` (`vi_VN` hoặc `en_US`);
  - đặt `<html lang="vi">` hoặc `"en"`.
  - Mọi giá trị đều được escape HTML (`& < > " '`).
  - Thao tác trên chuỗi HTML bằng thay thế có neo theo thẻ, không dùng thư viện DOM.
- Produces: `GET /api/public/render?path=&lang=` → `200 text/html; charset=utf-8`, `Cache-Control: no-cache`.
  - `lang` khác `en` coi là `vi`.
  - Trang không tồn tại thì trả `index.html` gốc, vẫn `200`, để Nginx không cần xử lý khác.

- [ ] **Step 1: Viết test thất bại** `render.test.ts`, với `WEBSITE_INDEX_PATH` trỏ tới file mẫu tạm (bản sao rút gọn của `public/index.html`):
  - tiếng Việt chèn đúng `<title>`, `description`, `og:image` tuyệt đối, `og:url`, `<html lang="vi">`;
  - `lang=en` với `en` rỗng dùng tiêu đề `vi`, `og:url` có `?lang=en`, `<html lang="en">`;
  - `lang=fr` → `vi`;
  - tiêu đề chứa `"><script>` thì xuất ra dạng đã escape;
  - đường dẫn không có trang → nội dung giống hệt file gốc;
  - sau khi xuất bản tiêu đề mới thì `render` trả tiêu đề mới (cache đã bị xóa);
  - file gốc chỉ được đọc lại sau `invalidate`.
- [ ] **Step 2:** `npm test -- render` → FAIL.
- [ ] **Step 3:** Viết code.
- [ ] **Step 4:** `npm test`, typecheck, lint, build → PASS.
- [ ] **Step 5:** Commit `feat(server): render index.html with per-page SEO tags`.

### Task 7: Lệnh nhập dữ liệu ban đầu và file bản dự phòng

**Files:**
- Create: `server/src/cli/content-import.ts`, `server/content-seed/README.md` (mô tả định dạng seed bằng tiếng Việt)
- Modify: `server/package.json` (script `"content:import": "tsx src/cli/content-import.ts"`)
- Test: `server/test/content-import.test.ts`, `server/test/fixtures/seed-mini/` (2 trang nhỏ, 2 ảnh nhỏ)

**Interfaces:**
- Định dạng seed, mỗi trang một file `server/content-seed/<slug>.json`: `{ path, name, content }`. Trong `content`, ảnh có dạng `{ "src": "/img/..." }` thay cho `mediaId`.
- Produces: `importContent(deps, options: { seedDir: string; publicDir: string; fallbackOut: string; force: boolean; actorUserId: bigint | null }): Promise<{ pages: number; media: number }>`.
  1. Nếu DB đã có trang và không có `force` → ném lỗi "Đã có dữ liệu trang; dùng --force để tạo phiên bản mới".
  2. Với mỗi `src`, đọc `publicDir + src` rồi gọi `storeMedia` với `sourcePath = src`. File không tồn tại → lỗi, ghi rõ trang và đường dẫn.
  3. Đổi `src` thành `mediaId`, kiểm bằng `pageContentSchema`, rồi tạo hoặc cập nhật trang, bản nháp và phiên bản mới đã xuất bản. `--force` không bao giờ xóa phiên bản cũ.
  4. Ghi `fallbackOut`, là JSON `{ "<path>": ResolvedContent }` có ảnh dạng `{ url: src, width, height, alt, sourcePath: src }`, để website dùng `/img/...` hiện có. Các khóa được sắp xếp để file ổn định giữa các lần chạy.
- CLI: `npm run content:import -- [--force] [--seed ./content-seed] [--public ../public] [--fallback-out ../src/content/cms-fallback.json]`. Các giá trị trong ngoặc là mặc định. CLI chạy được khi gọi trực tiếp; khi import trong test thì không tự chạy.

- [ ] **Step 1: Viết test thất bại** `content-import.test.ts`, dùng `seed-mini`:
  - DB rỗng → tạo 2 trang, mỗi trang có phiên bản 1 đã xuất bản;
  - ảnh được lưu kèm `sourcePath`;
  - file fallback có 2 khóa và ảnh trỏ `/img/...`;
  - chạy lại không có `force` → lỗi, DB không đổi;
  - chạy lại có `force` → mỗi trang có phiên bản 2, phiên bản 1 vẫn còn;
  - seed tham chiếu ảnh không tồn tại → lỗi chứa đường dẫn ảnh, DB không đổi (chạy trong transaction);
  - seed sai khuôn → lỗi chứa đường dẫn trường.
- [ ] **Step 2:** `npm test -- content-import` → FAIL.
- [ ] **Step 3:** Viết code.
- [ ] **Step 4:** `npm test`, typecheck, lint → PASS.
- [ ] **Step 5:** Commit `feat(server): add content import command and fallback generation`.

### Task 8: Nhập nội dung thật của 10 trang vào seed

**Files:**
- Create: `server/content-seed/{home,about,services,contact,ict,secure-defense,digital-transformation,integration,software,support}.json`
- Create: `src/content/cms-fallback.json`, tạo bằng cách chạy lệnh nhập dữ liệu trên DB dev
- Test: `server/test/content-seed.test.ts`

**Interfaces:**
- Nội dung lấy **đúng nguyên văn** từ website hiện tại:
  - `vi` lấy từ `src/locales/vn/translation.json`;
  - `en` lấy từ `src/locales/en/translation.json`. Với khóa dạng câu tiếng Anh, chính câu đó là bản `en` (cơ chế fallback hiện tại);
  - chuỗi viết cứng không có trong file dịch lấy nguyên văn cho cả `vi` và `en`.
- Thứ tự khối của từng trang bằng đúng thứ tự component trong `src/pages/*/index.tsx`.
- Ánh xạ đặc biệt:
  - tiêu đề có `<em>` hoặc `<Trans>` (`solutions.subtitle`, `ourservices.title`, `corevalues.heading.*` và tương tự) tách thành `heading.lead` và `heading.emphasis`;
  - eyebrow "ISTT Solutions" của banner giải pháp thành `eyebrow` với `vi` = `en` = "ISTT Solutions";
  - ảnh của từng mục `core-values-system` lấy theo đúng quy tắc hiện tại: `solutions[i].image`, sau đó `images[i % len]`, sau đó `defaultImage`;
  - ICT có `icon` riêng cho từng mục; các trang không có icon thì để `null`;
  - `contact-form` dùng `variant: "page"` ở `/contact` và `"inline"` ở các trang dùng `FormContact`;
  - mô tả SEO lấy từ câu dẫn đầu trang (hero hoặc banner); ảnh SEO lấy ảnh hero hoặc banner.
- Các khóa file dịch đã chuyển vào seed **vẫn giữ trong file dịch**, cho tới khi trang tương ứng được chuyển (Task 12–15). Không xóa khóa nào ở task này.

- [ ] **Step 1: Viết test thất bại** `content-seed.test.ts`:
  - mỗi file trong `content-seed/` có `path` thuộc 10 đường dẫn ở trên;
  - `content` hợp lệ theo `pageContentSchema`, sau khi thay `src` bằng `mediaId` giả;
  - mọi `src` tồn tại trong `../public`;
  - không trang nào trùng `path`;
  - có đủ 10 trang;
  - với mỗi `{ vi, en }`, `vi` không phải câu tiếng Anh dùng làm khóa khi file dịch tiếng Việt có bản dịch. Test đọc file dịch và kiểm cho mọi chuỗi có khóa trong `translation.json` của `vn`.
- [ ] **Step 2:** `npm test -- content-seed` → FAIL.
- [ ] **Step 3:** Viết 10 file seed.
- [ ] **Step 4:** Chạy `npm run content:import` trên DB dev sạch để tạo `src/content/cms-fallback.json`. `npm test` → PASS.
- [ ] **Step 5:** Commit `feat(content): seed current website content for 10 pages`.

### Task 9: Trang quản trị: danh sách trang và màn hình sửa khối

**Files:**
- Create: `admin/src/api/content.ts`, `admin/src/content/blockForms.ts`, `FieldEditor.tsx`, `LocalizedInput.tsx`, `BlockList.tsx`, `MediaPicker.tsx` (bản tối thiểu: chọn từ `GET /media`); `admin/src/pages/content/PagesPage.tsx`, `PageEditorPage.tsx`, `SeoTab.tsx`
- Modify: `admin/src/App.tsx`, `admin/src/layout/AppLayout.tsx`, `admin/src/api/types.ts`, `admin/package.json` (@dnd-kit)
- Test: `admin/e2e/content-editor.spec.ts`, `admin/e2e/block-forms.spec.ts`

**Interfaces:**
- Produces trong `blockForms.ts`:
  - `type FieldSpec = { key: string; label: string; kind: "text" | "textarea" | "localized" | "localizedArea" | "heading" | "media" | "link" | "href" | "number" | "select" | "list"; options?; item?: FieldSpec[]; min?; max? }`;
  - `BLOCK_FORMS: Record<BlockType, { label: string; fields: FieldSpec[] }>`, mô tả đủ 20 loại khối theo bảng mô hình, với nhãn tiếng Việt.
  - `FieldEditor` hiển thị form theo `FieldSpec` một cách tổng quát. Không viết form riêng cho từng loại khối.
- Produces:
  - `LocalizedInput` có ô VI và EN cạnh nhau; khi `en.trim()` rỗng và `vi` khác rỗng thì hiện tag "Chưa dịch".
  - `BlockList` cho kéo thả (dnd-kit sortable) và có nút ẩn/hiện. Khối có chỗ chưa dịch hiện số chỗ chưa dịch.
- Menu: thêm "Trang" (`/pages`, quyền `content.view`).
- `PageEditorPage`:
  - giữ bản nháp đang sửa trong state; nút "Lưu nháp" gửi `{ content, revision }`;
  - lỗi `409` hiện thông báo "Trang đã được người khác sửa", kèm nút "Tải bản mới nhất" (có xác nhận vì sẽ mất thay đổi chưa lưu). Không tự ghi đè;
  - lỗi `400` có `fields` thì đánh dấu khối và trường bị lỗi;
  - cảnh báo khi rời trang mà chưa lưu, qua `beforeunload` và chặn chuyển route của React Router;
  - người không có `content.edit` thấy form ở chế độ chỉ xem;
  - tab SEO sửa `seo.title`, `seo.description`, `seo.image`.

- [ ] **Step 1: Viết test thất bại**
  - `block-forms.spec.ts`: là test Playwright không cần trình duyệt; nếu tiện hơn có thể dùng `node --test`. Với mỗi loại trong `../server/test/fixtures/block-samples.json`, `BLOCK_FORMS[type]` có mặt, và mọi khóa cấp một của mẫu đều có `FieldSpec` tương ứng; ngược lại cũng vậy.
  - `content-editor.spec.ts`, với dữ liệu trang tạo qua `e2e:seed`. **Bổ sung vào `server/test/e2e-seed.ts`:** nhập `seed-mini` và upload ảnh mẫu.
    - danh sách trang hiện trạng thái và số chỗ chưa dịch;
    - mở trang, sửa tiêu đề khối, Lưu nháp → tải lại thấy giá trị mới, trạng thái "Có thay đổi chưa xuất bản";
    - kéo khối 2 lên đầu rồi lưu → thứ tự mới được giữ;
    - ẩn khối rồi lưu → khối có trạng thái ẩn;
    - xóa chữ `vi` bắt buộc rồi lưu → trường lỗi được tô đỏ;
    - hai context cùng sửa: context A lưu xong, context B lưu → B thấy "Trang đã được người khác sửa";
    - người có `content.view` không có `content.edit` → không có nút Lưu nháp, ô nhập bị khóa;
    - rời trang khi chưa lưu → hộp xác nhận xuất hiện.
- [ ] **Step 2:** `npx playwright test e2e/content-editor.spec.ts e2e/block-forms.spec.ts` → FAIL.
- [ ] **Step 3:** Viết code.
- [ ] **Step 4:** Toàn bộ `npx playwright test` chạy 2 lần → PASS; typecheck, lint, build → PASS.
- [ ] **Step 5:** Commit `feat(admin): add pages list and block editor`.

### Task 10: Trang quản trị: xem trước, xuất bản, lịch sử, thư viện ảnh

**Files:**
- Create: `admin/src/pages/content/HistoryTab.tsx`, `admin/src/pages/media/MediaPage.tsx`
- Modify: `admin/src/pages/content/PageEditorPage.tsx`, `admin/src/content/MediaPicker.tsx` (có upload khi có `media.manage`), `admin/src/App.tsx`, `admin/src/layout/AppLayout.tsx`, `admin/src/pages/audit-logs/AuditLogsPage.tsx` (nhãn cho 6 hành động mới)
- Test: `admin/e2e/content-publish.spec.ts`, `admin/e2e/media.spec.ts`

**Interfaces:**
- Nút "Xem trước": lưu nháp nếu còn thay đổi chưa lưu, rồi gọi `POST /pages/:id/preview` và mở `url` ở tab mới.
- Nút "Xuất bản" (quyền `content.publish`):
  - hộp xác nhận có ô "Ghi chú" (tối đa 500 ký tự);
  - nếu còn thay đổi chưa lưu thì lưu trước rồi mới xuất bản.
- Tab "Lịch sử":
  - bảng gồm số phiên bản, người, thời gian (`dd/MM/yyyy HH:mm`, giờ Việt Nam, dùng `admin/src/format/date.ts`), ghi chú;
  - "Xem" mở nội dung chỉ đọc bằng `FieldEditor`;
  - "Khôi phục" (quyền `content.publish`) có xác nhận, sau đó tải lại bản nháp.
- Menu thêm "Thư viện ảnh" (`/media`) cho mọi người đã đăng nhập. Upload, sửa alt và xóa chỉ hiện khi có `media.manage`.
  - Kéo thả để upload, nhiều file thì upload lần lượt.
  - Xóa ảnh bị `409` thì liệt kê các trang đang dùng.
- Nhãn nhật ký:
  - `content.draft_save` → "Lưu nháp trang";
  - `content.publish` → "Xuất bản trang";
  - `content.restore` → "Khôi phục phiên bản";
  - `media.upload` → "Tải ảnh lên";
  - `media.update` → "Cập nhật ảnh";
  - `media.delete` → "Xóa ảnh".

- [ ] **Step 1: Viết test thất bại**
  - `content-publish.spec.ts`:
    - sửa rồi Xuất bản có ghi chú → trạng thái thành "Đã xuất bản", lịch sử có dòng mới với ghi chú;
    - Xem trước mở tab có URL chứa `?preview=`, kiểm bằng `context.waitForEvent("page")`;
    - Khôi phục bản 1 → bản nháp bằng bản 1, trạng thái "Có thay đổi chưa xuất bản";
    - người không có `content.publish` không thấy nút Xuất bản và Khôi phục.
  - `media.spec.ts`:
    - upload PNG → xuất hiện trong lưới;
    - upload file `.txt` → lỗi "định dạng" hiện ra;
    - sửa alt → lưu đúng;
    - xóa ảnh đang dùng → thông báo kèm tên trang;
    - xóa ảnh chưa dùng → biến mất khỏi lưới;
    - trong form khối, chọn ảnh mới bằng `MediaPicker` rồi lưu → ảnh mới được giữ.
- [ ] **Step 2:** Chạy test → FAIL.
- [ ] **Step 3:** Viết code.
- [ ] **Step 4:** Toàn bộ `npx playwright test` chạy 2 lần → PASS; typecheck, lint, build → PASS.
- [ ] **Step 5:** Commit `feat(admin): add preview, publishing, history and media library`.

### Task 11: Website: lớp `src/cms` và hạ tầng so sánh ảnh chụp

**Files:**
- Create: `src/cms/types.ts`, `pick.ts`, `useCmsPage.ts`, `BlockRenderer.tsx`, `CmsPage.tsx`, `cmsPaths.ts`, `PreviewBanner.tsx`
- Modify: `src/router/index.tsx` (hoặc nơi khai báo route): đường dẫn có trong `CMS_PATHS` thì dùng `CmsPage`; `src/translation.ts` đọc `?lang=`
- Create: `site-e2e/package.json`, `playwright.config.ts`, `scripts/baseline.mjs`, `scripts/compare.mjs`, `tests/fallback.spec.ts`, `tests/preview.spec.ts`, `tests/visual.spec.ts`, `.gitignore`, `README.md` (tiếng Việt)
- Test: `site-e2e/tests/*.spec.ts`

**Interfaces:**
- Produces trong `src/cms/types.ts`: các kiểu `ResolvedImage = { url; width; height; alt: LocalizedText; sourcePath: string | null }`, `Heading`, `Link`, kiểu `data` của 20 loại khối (bản đã thay ảnh), `CmsBlock`, `CmsContent`. Các kiểu này viết lại theo bảng mô hình, không import từ `server/`.
- Produces: `pick(text, lang)` và `useLang(): "vi" | "en"`, lấy từ i18next (`vi` khi ngôn ngữ bắt đầu bằng `vi`).
- Produces: `useCmsPage(path: string): { content: CmsContent; isPreview: boolean }`, theo đặc tả mục 8:
  - lấy ngay từ `localStorage[istt_content:<path>]`; nếu JSON hỏng hoặc khác khuôn cơ bản (`blocks` không phải mảng) thì bỏ qua và xóa khóa đó;
  - nếu không có thì lấy `cms-fallback.json[path]`;
  - sau đó gọi `/api/public/pages?path=` với `AbortSignal.timeout(5000)`, kèm `If-None-Match` lấy từ bản lưu;
  - có `?preview=<token>` thì gọi `/api/public/preview/<token>`, không đọc và không ghi `localStorage`;
  - API lỗi thì giữ nguyên bản đang có, không ghi log ra màn hình.
- Produces: `BLOCK_COMPONENTS: Partial<Record<BlockType, React.ComponentType<{ data; lang }>>>` trong `BlockRenderer.tsx`. Loại khối chưa có component thì không hiển thị gì, và `console.warn` một lần ở môi trường dev.
- Produces: `CMS_PATHS: string[]` trong `cmsPaths.ts`. Ở task này danh sách **rỗng**; các task 12–15 thêm đường dẫn khi chuyển xong trang.
- Produces: `CmsPage` hiển thị các khối không `hidden` theo thứ tự, cập nhật `document.title` và `meta[name=description]` theo ngôn ngữ, và hiện `PreviewBanner` ("Đang xem bản nháp") khi ở chế độ xem trước.
- `?lang=en` hoặc `?lang=vi` trên URL đổi ngôn ngữ i18next khi mở trang.
- `site-e2e/`:
  - `scripts/baseline.mjs <commit>` tạo git worktree của `<commit>` trong `site-e2e/.baseline-src` (đã gitignore), chạy `npm ci` và `BROWSER=none PORT=3101 npx react-scripts start`, rồi chụp ảnh toàn trang cho 10 đường dẫn × (1440, 834, 390) × (vi, en) vào `site-e2e/.baseline/`;
  - `scripts/compare.mjs` chụp cùng bộ ảnh từ website hiện tại (cổng 3100), so bằng pixelmatch (`threshold 0.1`), đạt khi số điểm ảnh khác ≤ 0,1%, và ghi ảnh khác biệt vào `site-e2e/.diff/`;
  - cả hai script đặt `localStorage.i18nextLng`, dùng `reducedMotion: "reduce"`, chờ `document.fonts.ready` và chờ mạng rảnh, rồi cuộn qua toàn trang để kích hoạt hiệu ứng hiện dần trước khi chụp;
  - `tests/visual.spec.ts` chạy so sánh cho mọi đường dẫn trong `CMS_PATHS` (đọc file `src/cms/cmsPaths.ts` dạng văn bản).

- [ ] **Step 1:** `npm ci` ở gốc repo (không đổi lockfile; kiểm bằng `git status`). Tạo `site-e2e/`. Chạy `node scripts/baseline.mjs d1b0193` để có ảnh gốc của website hiện tại.
- [ ] **Step 2: Viết test thất bại**, chạy với API dev trên cổng 4000 và website `npm start` trên cổng 3100:
  - `fallback.spec.ts`: thêm tạm `"/contact"` vào `CMS_PATHS` qua biến môi trường `REACT_APP_CMS_PATHS_OVERRIDE` (chỉ đọc khi `NODE_ENV !== "production"`). Chặn `/api/public/**` bằng `page.route(…, r => r.abort())` → trang vẫn hiện tiêu đề lấy từ fallback. Ghi `localStorage[istt_content:/contact] = "{hỏng"` → trang vẫn hiện, khóa hỏng bị xóa.
  - `preview.spec.ts`: tạo token qua API admin → mở `/contact?preview=<token>` → thấy "Đang xem bản nháp" cùng tiêu đề nháp, và `localStorage` không có khóa `istt_content:/contact`.
  - Một test cho `pick` chạy trong trình duyệt qua `page.evaluate` trên trang thử: `en` chỉ có khoảng trắng → dùng `vi`.
- [ ] **Step 3:** Chạy test → FAIL.
- [ ] **Step 4:** Viết `src/cms/*` và sửa router, `translation.ts`. Thêm component khối tạm cho `contact-form` nếu cần để test fallback chạy được; Task 12 sẽ thay bằng bản thật.
- [ ] **Step 5:** Test → PASS. `npx tsc --noEmit -p tsconfig.json` và `npx eslint --ext .ts,.tsx src` ở gốc: không thêm cảnh báo mới so với hiện tại.
- [ ] **Step 6:** Commit `feat(site): add CMS runtime with fallback, preview and visual comparison harness`.

### Task 12: Chuyển trang Liên hệ và Giới thiệu

**Files:**
- Modify: `src/components/ContactForm/index.tsx`, `src/components/FormContact/index.tsx`, `src/components/Contact/index.tsx` (MapBanner), `src/components/AboutBanner/index.tsx`, `src/components/OverviewSection/index.tsx`, `src/components/Vision/index.tsx`, `src/components/Mission/index.tsx`, `src/components/CoreValues/index.tsx`
- Modify: `src/cms/BlockRenderer.tsx`, `src/cms/cmsPaths.ts` (thêm `/contact`, `/about`)

**Interfaces:**
- Mỗi component nhận nội dung qua tham số: `data` theo kiểu ở `src/cms/types.ts`, và `lang`.
  - Bố cục, styled-components và hiệu ứng giữ nguyên.
  - Chữ giao diện cố định vẫn dùng `t()`.
  - Component nào còn được dùng ở trang chưa chuyển thì giữ được cả cách gọi cũ, bằng cách để `data` là tham số tùy chọn và dùng dữ liệu cũ khi thiếu, cho tới khi mọi trang dùng nó đã chuyển xong.
- `contact-form` với `variant: "page"` dùng `ContactForm`, với `"inline"` dùng `FormContact`.
- Nút cuộn tới form liên hệ của banner giải pháp (dùng ở Task 14) tìm phần tử form theo `id="contact-form"`; component form đặt `id` này.

- [ ] **Step 1:** Thêm `/contact` và `/about` vào `CMS_PATHS`, chạy `npx playwright test tests/visual.spec.ts` trong `site-e2e/` → FAIL (component chưa có).
- [ ] **Step 2:** Sửa các component và đăng ký vào `BLOCK_COMPONENTS`.
- [ ] **Step 3:** `visual.spec.ts` PASS cho `/contact` và `/about` ở 3 cỡ × 2 ngôn ngữ (sai khác ≤ 0,1%). `fallback.spec.ts` PASS. Typecheck và eslint ở gốc không thêm cảnh báo.
- [ ] **Step 4:** Commit `feat(site): render contact and about pages from CMS blocks`.

### Task 13: Chuyển trang Dịch vụ, Tích hợp hệ thống, Phần mềm, Hỗ trợ

**Files:**
- Modify: `src/components/OurServices/index.tsx`, `src/components/Opportunity/index.tsx`, `src/components/Integration/index.tsx` (ServicesPage), `src/components/CoreValuesSystem/index.tsx`, `src/cms/BlockRenderer.tsx`, `src/cms/cmsPaths.ts` (thêm `/services`, `/integration`, `/software`, `/support`)

**Interfaces:**
- `our-services` hiển thị `categories` thay cho kiểu `full_des` có khóa cố định.
- `core-values-system` dùng `image` và `icon` của từng mục, thay cho cơ chế `images`/`icons`/`defaultImage`.
- Chữ "Go to slide N" chuyển sang `t()`, với khóa mới thêm vào cả hai file dịch. Đây là thay đổi file dịch duy nhất được phép, chỉ để thêm khóa.

- [ ] **Step 1:** Thêm 4 đường dẫn vào `CMS_PATHS` → `visual.spec.ts` FAIL.
- [ ] **Step 2:** Sửa component và đăng ký.
- [ ] **Step 3:** `visual.spec.ts` PASS cho 6 trang đã chuyển; các test cũ PASS.
- [ ] **Step 4:** Commit `feat(site): render services and service detail pages from CMS blocks`.

### Task 14: Chuyển các trang giải pháp ICT, An ninh, Chuyển đổi số

**Files:**
- Modify: `src/components/SolutionBanner/index.tsx`, `src/cms/BlockRenderer.tsx`, `src/cms/cmsPaths.ts` (thêm 3 đường dẫn)

**Interfaces:**
- `solution-banner` nhận `eyebrow` từ dữ liệu.
- Bỏ các tham số `overlayColor`, `titleColor`, `subtitleColor` không còn dùng.
- Nút trên banner cuộn tới `#contact-form` nếu có trên trang. Hành vi này cũng áp dụng cho `/integration` (trước đây nút không làm gì); ảnh chụp không đổi vì chỉ khác hành vi khi bấm.

- [ ] **Step 1:** Thêm đường dẫn → FAIL.
- [ ] **Step 2:** Sửa component.
- [ ] **Step 3:** `visual.spec.ts` PASS cho 9 trang. Thêm test bấm nút banner ở `/integration` → cuộn tới form, hoặc không lỗi khi trang không có form.
- [ ] **Step 4:** Commit `feat(site): render solution pages from CMS blocks`.

### Task 15: Chuyển Trang chủ

**Files:**
- Modify: `src/components/Content1/index.tsx`, `Content2/index.tsx`, `OurSolutions/index.tsx`, `HomeServices/index.tsx`, `HomeValues/index.tsx`, `Partner/index.tsx` và `Partner/Logo.tsx`, `HomeContact/index.tsx`, `src/pages/Home/index.tsx`, `src/cms/BlockRenderer.tsx`, `src/cms/cmsPaths.ts` (thêm `/`)

**Interfaces:**
- `partners` và `customers` tra `logoMetrics` theo `image.sourcePath`. Nếu không có thì dùng kích thước mặc định của `Logo`.
- `home-hero` giữ nguyên slider, nút tạm dừng, thời gian chuyển 6000 ms và nhãn trợ năng.
- Nút "Khám phá giải pháp" dùng `href` `#solutions` và cuộn tới khối `business-areas`. Khối này đặt `id="solutions"` như hiện nay.
- Sau khi cả 10 trang đã chuyển:
  - xóa nhánh dữ liệu cũ (tham số tùy chọn và dữ liệu viết cứng) trong các component đã chuyển;
  - xóa `Partner/data.js`, `CoreValues/data.js` và hằng dữ liệu viết cứng nếu không còn ai dùng;
  - **không xóa khóa file dịch** (để dành cho việc dọn dẹp sau).

- [ ] **Step 1:** Thêm `/` → FAIL.
- [ ] **Step 2:** Sửa component, rồi dọn nhánh dữ liệu cũ.
- [ ] **Step 3:** `visual.spec.ts` PASS cho 10 trang × 3 cỡ × 2 ngôn ngữ; `fallback.spec.ts` và `preview.spec.ts` PASS. Typecheck và eslint ở gốc không thêm cảnh báo. Chạy thêm một trang trên `/home` để chắc chắn bí danh hoạt động.
- [ ] **Step 4:** Commit `feat(site): render home page from CMS blocks`.

### Task 16: Triển khai: Nginx, thư mục ảnh, sao lưu, tài liệu

**Files:**
- Modify: `docs/deploy/nginx.conf`, `docs/deploy/istt-api.service` (`ReadWritePaths=/var/lib/istt/media`), `docs/deploy/backup-mysql.sh` (thêm bản sao lưu thư mục ảnh `istt-media-YYYYmmdd-HHMMSS.tar.gz`, giữ 14 bản, có `trap` xóa file `.partial`), `docs/deploy/server-setup.md`, `server/README.md`, `admin/README.md`, `server/.env.example`

**Interfaces:**
- Nginx cổng 80:
  - `location /media/ { alias /var/lib/istt/media/; add_header Cache-Control "public, max-age=31536000, immutable"; }`;
  - `location /static/` và các file có đuôi tĩnh: phục vụ từ `/var/www/webct` như cũ;
  - `location = /index.html` và `location /` (yêu cầu mở trang): `proxy_pass` tới `http://127.0.0.1:4000/api/public/render?path=$uri&lang=$arg_lang`, kèm `proxy_intercept_errors on; error_page 502 503 504 = @static_index;`, trong đó `@static_index` trả `/var/www/webct/index.html`;
  - thời gian chờ ngắn: `proxy_connect_timeout 2s; proxy_read_timeout 5s;`.
- Nginx cổng 8080: `client_max_body_size 6m` cho `/api/admin/`.
- `server-setup.md` bổ sung:
  - biến `MEDIA_DIR`, `WEBSITE_INDEX_PATH`, `PUBLIC_SITE_ORIGIN`;
  - tạo thư mục ảnh với chủ sở hữu `istt`;
  - chạy `npm run content:import` một lần sau `db:migrate`;
  - kiểm tra sau cài: `curl -s http://127.0.0.1/about | grep '<title>'` ra tiêu đề trang Giới thiệu; tắt `istt-api` thì `curl` vẫn ra `index.html`;
  - khôi phục thư mục ảnh từ bản sao lưu.

- [ ] **Step 1:** Sửa các file.
- [ ] **Step 2:** `nginx -t` bằng docker `nginx:1.28` → `syntax is ok`.
- [ ] **Step 3:** Kiểm tra thật bằng docker nginx với host network và API dev:
  - `/about` có `<title>` của trang Giới thiệu;
  - `/media/<file>` trả ảnh, có header cache;
  - dừng API thì `/about` vẫn trả `index.html` gốc với mã 200.
- [ ] **Step 4:** `bash -n` script sao lưu. Chạy thật một lần với MySQL dev và một thư mục ảnh tạm: có cả file `.sql.gz` và `.tar.gz`, xoay vòng giữ 14 bản.
- [ ] **Step 5:** Commit `docs(deploy): serve media, render SEO tags and back up media`.

### Task 17: Kiểm tra toàn bộ

**Files:** không tạo file mới; chỉ sửa khi có kiểm tra thất bại.

- [ ] **Step 1:** `git diff --stat origin/main -- package.json package-lock.json tsconfig.json .gitlab-ci.yml` → rỗng.
- [ ] **Step 2:** Quét comment như Task 13 của dự án con 1, cho `server/src`, `server/test`, `admin/src`, `admin/e2e`, `site-e2e/{scripts,tests}`, `src/cms` và các component website đã sửa (so với `origin/main`) → không có comment mới.
- [ ] **Step 3:** `server/`: `npm ci && npm run typecheck && npm run lint && npm test && npm run build`. `admin/`: `npm ci && npm run typecheck && npm run lint && npm run build && npx playwright test`. `site-e2e/`: `npx playwright test`. Tất cả PASS.
- [ ] **Step 4:** Website: `npx tsc --noEmit -p tsconfig.json`, và eslint không thêm cảnh báo so với `origin/main`.
- [ ] **Step 5:** Quét bí mật như dự án con 1.
- [ ] **Step 6:** Nếu sửa gì thì commit `fix: <nội dung>`. Đẩy nhánh `claude/epic-thompson-fjrmm7`.
