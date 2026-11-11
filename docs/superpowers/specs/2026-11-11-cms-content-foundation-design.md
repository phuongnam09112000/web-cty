# Đặc tả: Nền tảng nội dung CMS (Dự án con 2a)

- Ngày: 2026-11-11
- Trạng thái: Đã duyệt thiết kế, chờ lập kế hoạch triển khai
- Phạm vi: Phần 2a của dự án con 2 (CMS)
- Dựa trên: [Đặc tả dự án con 1](2026-11-10-backend-foundation-design.md). Server, trang quản trị, phân quyền và nhật ký của dự án con 1 được dùng lại nguyên vẹn.

## 1. Bối cảnh

Nội dung website hiện nằm ở ba nơi:

- File dịch `src/locales/vn/translation.json` và `src/locales/en/translation.json`.
- Các file `src/content/*.json` (trang Software, Support, Premium, sản phẩm).
- Chữ và danh sách viết cứng trong các component (đối tác, khách hàng, giá trị cốt lõi…).

Muốn sửa nội dung thì phải sửa code và build lại. Dự án con 2 cho phép nhân viên tự sửa nội dung, viết tin tức và tạo trang mới từ trang quản trị.

## 2. Chia nhỏ dự án con 2

| Phần | Nội dung |
|---|---|
| **2a. Nền tảng nội dung** (tài liệu này) | Mô hình "trang = danh sách khối", chuyển các trang hiện có sang dạng khối, sửa nội dung, bản nháp, xem trước, xuất bản, lịch sử, thư viện ảnh, website đọc nội dung từ API, thẻ SEO |
| 2b. Tin tức/Bài viết | Danh mục, bài viết, trang danh sách và chi tiết bài |
| 2c. Trình tạo trang | Thêm khối mới, tạo trang mới, gắn trang vào menu |

Phần 2c thay cho phần "bật/tắt, sắp xếp section" của dự án con 4. Dự án con 4 chỉ còn phần màu sắc và logo.

## 3. Yêu cầu đã chốt

- **Trang hiện có chuyển sang dạng khối.** Mỗi section đã thiết kế trở thành một loại khối. Nội dung hiện tại được nhập sẵn, nên website trông giống hệt trước khi chuyển.
- **Quy trình đăng:** mọi chỉnh sửa lưu ở bản nháp và xem trước được. Người có quyền xuất bản bấm Xuất bản thì nội dung mới lên website. Mỗi lần xuất bản lưu một phiên bản và khôi phục được.
- **SEO:** website vẫn là ứng dụng React chạy trên trình duyệt như hiện nay. Riêng thẻ tiêu đề, mô tả và ảnh chia sẻ của từng trang được chèn sẵn vào HTML trước khi gửi cho trình duyệt (xem mục 8).
- **Song ngữ:** chữ có bản tiếng Việt và tiếng Anh. Bản tiếng Anh còn trống thì website hiện bản tiếng Việt. Trang quản trị đánh dấu rõ những chỗ "chưa dịch".
- **Lưu trữ:** hướng A — trang là danh sách khối dạng JSON, mỗi loại khối có một khuôn dữ liệu riêng được kiểm tra khi lưu.

## 4. Mô hình dữ liệu

Các bảng mới, theo quy ước của dự án con 1: `snake_case`, `id` kiểu `BIGINT UNSIGNED AUTO_INCREMENT`, thời gian UTC `DATETIME(3)`, `utf8mb4_unicode_ci`.

### 4.1. `pages`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `path` | VARCHAR(191) | Duy nhất, ví dụ `/`, `/about`, `/information-communication-technology` |
| `name` | VARCHAR(191) | Tên hiển thị trong trang quản trị |
| `published_version_id` | BIGINT NULL | Phiên bản đang hiện trên website |
| `created_at`, `updated_at` | DATETIME | |

### 4.2. `page_drafts`

Mỗi trang có đúng một bản nháp.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `page_id` | BIGINT | Khóa chính, khóa ngoại tới `pages` |
| `content` | JSON | Nội dung trang (mục 4.5) |
| `revision` | INT | Tăng 1 sau mỗi lần lưu, dùng để phát hiện hai người sửa cùng lúc |
| `updated_by_user_id` | BIGINT NULL | |
| `updated_at` | DATETIME | |

### 4.3. `page_versions`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `page_id` | BIGINT | Khóa ngoại |
| `number` | INT | 1, 2, 3… theo từng trang; duy nhất cùng `page_id` |
| `content` | JSON | Bản chụp đầy đủ nội dung lúc xuất bản |
| `note` | VARCHAR(500) NULL | Ghi chú của người xuất bản |
| `published_by_user_id` | BIGINT NULL | |
| `published_at` | DATETIME | |

### 4.4. `media`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGINT | |
| `file_name` | VARCHAR(191) | Duy nhất; dạng `<sha256 16 ký tự đầu>.<đuôi>` |
| `original_name` | VARCHAR(255) | Tên file gốc khi upload |
| `mime_type` | VARCHAR(50) | `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` |
| `size_bytes` | INT | Tối đa 5 MB |
| `width`, `height` | INT NULL | Đọc từ file ảnh |
| `alt` | JSON | `{ "vi": string, "en": string }` |
| `uploaded_by_user_id` | BIGINT NULL | |
| `created_at` | DATETIME | |

Nếu hai lần upload cùng một nội dung file, hệ thống dùng lại bản ghi đã có.

### 4.5. Cấu trúc nội dung trang

```json
{
  "seo": {
    "title": { "vi": "…", "en": "…" },
    "description": { "vi": "…", "en": "…" },
    "image": { "mediaId": 12 }
  },
  "blocks": [
    {
      "id": "k7f3a1",
      "type": "hero",
      "hidden": false,
      "data": { "…": "theo khuôn của loại khối" }
    }
  ]
}
```

Quy ước:

- Mọi chữ hiển thị có dạng `{ "vi": string, "en": string }`. Bắt buộc có `vi`; `en` có thể rỗng.
- Ảnh luôn có dạng `{ "mediaId": number }` và phải tồn tại trong bảng `media`.
- Đường dẫn liên kết là đường dẫn nội bộ (`/about`) hoặc URL `https://`. Không chấp nhận `javascript:` và các dạng tương tự.
- `id` của khối là chuỗi ngẫu nhiên, duy nhất trong trang, giữ cố định khi sắp xếp lại.

## 5. Các loại khối

Mỗi loại khối tương ứng với một section đã thiết kế trên website. Trường dữ liệu của mỗi loại khối lấy đúng theo nội dung mà component hiện đang hiển thị: tiêu đề, mô tả, ảnh, nút, danh sách mục. Mỗi khối lưu dữ liệu nội dung, không lưu cách trình bày; màu sắc, bố cục và hiệu ứng nằm trong component.

| Nhóm | Loại khối (`type`) | Component hiện tại |
|---|---|---|
| Đầu trang | `home-hero` | `Content1` (slider) |
| | `solution-banner` | `SolutionBanner` |
| | `about-banner` | `AboutBanner` |
| Trang chủ | `home-about` | `Content2` / AboutSection |
| | `business-areas` | `OurSolutions` / BusinessAreas |
| | `home-services` | `HomeServices` |
| | `home-values` | `HomeValues` |
| | `partners` | `Partner` (đối tác) |
| | `customers` | `Partner` (khách hàng) |
| | `home-contact` | `HomeContact` |
| Trang con | `overview` | `OverviewSection` |
| | `mission` | `Mission` |
| | `vision` | `Vision` |
| | `core-values` | `CoreValues` |
| | `core-values-system` | `CoreValuesSystem` |
| | `services-list` | `ServicesPage` |
| | `our-services` | `OurServices` |
| | `opportunity` | `Opportunity` |
| | `premium` | `PremiumPage` |
| | `office-map` | `MapBanner` |
| | `contact-form` | `ContactForm` |

Quy tắc:

- Khuôn dữ liệu của mỗi loại khối được định nghĩa bằng Zod ở một nơi trong `server/`. Server từ chối lưu dữ liệu sai khuôn với lỗi `400 VALIDATION_ERROR`, kèm đường dẫn tới trường sai trong `fields`.
- `office-map` và `contact-form` chỉ cho sửa phần chữ. Tọa độ bản đồ, địa chỉ văn phòng và nơi nhận email liên hệ giữ nguyên như hiện nay, không sửa qua CMS.
- Trang quản trị và website không import code của `server/`. Mỗi bên định nghĩa kiểu dữ liệu riêng theo đúng tài liệu này. Test so khớp dữ liệu mẫu của mọi loại khối giữa ba bên.

## 6. Phân quyền

Thêm vào danh sách quyền của dự án con 1:

| Key | Module | Nhãn |
|---|---|---|
| `content.view` | Nội dung | Xem trang, bản nháp và lịch sử |
| `content.edit` | Nội dung | Sửa bản nháp |
| `content.publish` | Nội dung | Xuất bản và khôi phục phiên bản |
| `media.manage` | Thư viện ảnh | Upload, sửa và xóa ảnh |

- `content.edit` và `content.publish` đều bao gồm `content.view` khi kiểm tra quyền.
- Mọi người đã đăng nhập đều xem và chọn được ảnh trong thư viện khi sửa khối. `media.manage` chỉ cần cho upload, sửa chữ thay thế và xóa ảnh.
- Migration bật sẵn cả 4 quyền cho vai trò **Biên tập viên**.

## 7. API

### 7.1. API quản trị (`/api/admin`, cần đăng nhập)

| Phương thức | Đường dẫn | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/pages` | `content.view` | Danh sách: `id`, `path`, `name`, `hasUnpublishedChanges`, `untranslatedCount`, thông tin xuất bản và sửa cuối |
| GET | `/pages/:id` | `content.view` | Trang, bản nháp (kèm `revision`), phiên bản đang xuất bản |
| PUT | `/pages/:id/draft` | `content.edit` | Body `{ content, revision }`. Nếu `revision` khác bản trong DB thì trả `409 CONFLICT` "Trang đã được người khác sửa" |
| POST | `/pages/:id/preview` | `content.view` | Tạo token xem trước, hạn 30 phút; trả `{ url }` |
| POST | `/pages/:id/publish` | `content.publish` | Body `{ note? }`. Chép bản nháp thành phiên bản mới và đặt làm phiên bản đang xuất bản |
| GET | `/pages/:id/versions` | `content.view` | Danh sách phiên bản, mới nhất trước |
| GET | `/pages/:id/versions/:number` | `content.view` | Nội dung một phiên bản |
| POST | `/pages/:id/versions/:number/restore` | `content.publish` | Chép phiên bản đó về bản nháp. Chưa xuất bản cho tới khi bấm Xuất bản |
| GET | `/media` | đã đăng nhập | Phân trang, tìm theo tên file gốc và chữ thay thế |
| POST | `/media` | `media.manage` | Upload `multipart/form-data`, một file mỗi lần |
| PATCH | `/media/:id` | `media.manage` | Sửa `alt` |
| DELETE | `/media/:id` | `media.manage` | Nếu ảnh còn được dùng trong bản nháp hoặc phiên bản đang xuất bản của bất kỳ trang nào thì trả `409 CONFLICT`, kèm danh sách trang |
| GET | `/media/:id/usage` | đã đăng nhập | Danh sách trang đang dùng ảnh |

Nhật ký hoạt động ghi thêm các hành động `content.draft_save`, `content.publish`, `content.restore`, `media.upload`, `media.update`, `media.delete`.

### 7.2. API công khai (`/api/public`, không cần đăng nhập)

| Phương thức | Đường dẫn | Ghi chú |
|---|---|---|
| GET | `/pages?path=/about` | Chỉ trả phiên bản đang xuất bản: `{ path, version, content }`, trong đó ảnh đã được thay bằng `{ url, width, height, alt }`. Trả `404` nếu đường dẫn không có trang đã xuất bản. Có header `Cache-Control: public, max-age=60` và `ETag` |
| GET | `/preview/:token` | Trả bản nháp của đúng trang gắn với token, cùng định dạng như trên. Token sai hoặc hết hạn thì trả `404`. Có header `Cache-Control: no-store` |
| GET | `/render?path=/about&lang=vi` | `lang` lấy từ tham số `lang` trên đường dẫn trang (`/about?lang=en`); không có thì dùng `vi`, vì website không có ngôn ngữ trong đường dẫn và trình thu thập của Google/Facebook không có `localStorage`. Trả `index.html` của website, với `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url` và `<html lang>` theo trang và ngôn ngữ. Đường dẫn không có trang thì trả `index.html` gốc |

- Token xem trước là chuỗi ngẫu nhiên 32 byte, lưu dạng SHA-256 trong bảng `preview_tokens` (`token_hash`, `page_id`, `expires_at`, `created_by_user_id`).
- `render` đọc `index.html` từ đường dẫn cấu hình `WEBSITE_INDEX_PATH`, và cache kết quả trong bộ nhớ theo `path` + `lang`. Cache bị xóa mỗi khi có lần xuất bản hoặc khôi phục.
- Mọi giá trị chèn vào HTML đều được escape.

## 8. Website

- Các đường dẫn hiện tại giữ nguyên.
- Mỗi trang đã chuyển sang dạng khối được hiển thị bằng một component chung. Component này lấy nội dung trang rồi hiển thị từng khối bằng component section tương ứng, bỏ qua các khối `hidden`.
- Các component section được sửa để nhận nội dung qua tham số, thay vì đọc file dịch hoặc dùng dữ liệu viết cứng. Bố cục, màu sắc và hiệu ứng giữ nguyên.
- Chữ giao diện cố định (menu, nút chung, chân trang, nhãn form) vẫn ở trong file dịch.
- **Chọn ngôn ngữ:** website dùng ngôn ngữ i18next đang chọn (`vi` hoặc `en`). Với mỗi chữ, ngôn ngữ đang chọn trống thì dùng `vi`.
- **Thứ tự lấy nội dung:**
  1. Hiện ngay bằng bản lưu trong `localStorage` (khóa `istt_content:<path>`). Nếu không có, dùng bản đóng gói sẵn trong website.
  2. Gọi `GET /api/public/pages?path=…`. Nếu khác bản đang hiện thì thay bằng bản mới và lưu vào `localStorage`.
  3. API lỗi hoặc quá 5 giây thì giữ nguyên bản đang hiện, không báo lỗi cho người xem.
- **Bản đóng gói sẵn** là file `src/content/cms-fallback.json`, tạo bởi lệnh nhập dữ liệu và commit vào repo. Ảnh trong bản này trỏ tới đường dẫn `public/img/...` hiện có, nên không phụ thuộc vào API.
- **Xem trước:** đường dẫn có dạng `/<path>?preview=<token>`. Website gọi `/api/public/preview/:token`, hiển thị một dải thông báo "Đang xem bản nháp", và không ghi vào `localStorage`.
- Khi chuyển ngôn ngữ, `<title>` và `<meta description>` được cập nhật trên trình duyệt theo nội dung trang.
- Khi mở trang có `?lang=en` hoặc `?lang=vi`, website chuyển sang ngôn ngữ đó, để liên kết chia sẻ bản tiếng Anh hiện đúng.

## 9. Trang quản trị

| Màn hình | Đường dẫn | Nội dung |
|---|---|---|
| Trang | `/pages` | Bảng trang: tên, đường dẫn, trạng thái ("Đã xuất bản" / "Có thay đổi chưa xuất bản"), số chỗ chưa dịch, người và giờ sửa cuối |
| Sửa trang | `/pages/:id` | Bên trái: danh sách khối, kéo thả để sắp xếp, nút ẩn/hiện, dấu hiệu khối có chỗ chưa dịch. Bên phải: form của khối đang chọn, với ô VI và EN cạnh nhau; ô EN trống có nhãn "Chưa dịch". Tab SEO cho tiêu đề, mô tả, ảnh chia sẻ. Các nút Lưu nháp, Xem trước, Xuất bản (có hộp xác nhận và ô ghi chú). Cảnh báo khi rời trang mà chưa lưu |
| Lịch sử | tab trong Sửa trang | Danh sách phiên bản (số, người, thời gian, ghi chú), xem nội dung, khôi phục (có xác nhận) |
| Thư viện ảnh | `/media` | Lưới ảnh có tìm kiếm và phân trang; upload kéo thả; sửa chữ thay thế; xóa ảnh (báo các trang đang dùng nếu không xóa được) |

- Menu thêm hai mục: **Trang** (`content.view`) và **Thư viện ảnh** (đã đăng nhập).
- Khi bị lỗi `409` do hai người sửa cùng lúc, trang quản trị giữ nguyên nội dung đang sửa, báo lỗi và cho tải bản mới nhất. Không tự ghi đè.
- Ở phần 2a, trang quản trị chưa có nút thêm khối mới, xóa khối hay tạo trang mới.

## 10. Thư viện ảnh và lưu file

- Ảnh lưu tại thư mục cấu hình `MEDIA_DIR` (mặc định trên máy chủ `/var/lib/istt/media`) và được phục vụ tại `/media/<file_name>`.
- Nginx phục vụ thư mục này trực tiếp với `Cache-Control: public, max-age=31536000, immutable`. Trong lúc phát triển, API phục vụ thay.
- Upload được kiểm tra theo **nội dung file**, không tin phần đuôi tên file:
  - chỉ JPG, PNG, WebP, SVG;
  - tối đa 5 MB;
  - kích thước ảnh tối đa 8000 × 8000.
- File SVG được làm sạch trước khi lưu: loại bỏ `<script>`, thuộc tính `on*`, `javascript:`, `<foreignObject>` và tham chiếu tới URL bên ngoài.
- Lệnh nhập dữ liệu chép các ảnh đang dùng từ `public/img/` vào thư viện ảnh.

## 11. Nhập dữ liệu ban đầu

Lệnh `npm run content:import` trong `server/`:

1. Đọc nội dung hiện tại của từng trang từ các file dịch, `src/content/*.json` và dữ liệu đang viết cứng trong component. Phần dữ liệu viết cứng được trích một lần, bằng tay, thành file nguồn `server/content-seed/*.json` commit vào repo.
2. Tạo trang, bản nháp và phiên bản 1 đã xuất bản cho từng đường dẫn.
3. Chép ảnh vào thư viện ảnh.
4. Ghi `src/content/cms-fallback.json` cho website.

Lệnh chỉ chạy được khi chưa có trang nào trong cơ sở dữ liệu, trừ khi thêm `--force`. `--force` không bao giờ xóa phiên bản đã có; nó chỉ tạo phiên bản mới.

## 12. Chuyển đổi từng trang

- Thứ tự chuyển: Liên hệ, Giới thiệu, Dịch vụ, các trang giải pháp (ICT, An ninh, Chuyển đổi số, Tích hợp, Phần mềm, Hỗ trợ, Premium), cuối cùng Trang chủ.
- Đường dẫn chưa chuyển vẫn hiển thị bằng code cũ.
- **Một trang chỉ được coi là chuyển xong khi:**
  - ảnh chụp trước và sau khi chuyển giống nhau ở 1440, 834 và 390 px, cho cả `vi` và `en`, sai khác điểm ảnh tối đa 0,1% (cho phép khác biệt do khử răng cưa chữ);
  - các bộ kiểm tra giao diện hiện có vẫn đạt.

## 13. Xử lý lỗi

Dùng định dạng lỗi chung của dự án con 1. Bổ sung:

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Nội dung sai khuôn; `fields` dùng đường dẫn như `blocks.3.data.title.vi` |
| 409 | `CONFLICT` | Sai `revision` khi lưu nháp; xóa ảnh đang được dùng |
| 413 | `PAYLOAD_TOO_LARGE` | File upload quá 5 MB, hoặc nội dung trang quá 1 MB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | File không phải ảnh được phép |

## 14. Kiểm thử

- **Server** (Vitest + MySQL thật):
  - khuôn dữ liệu của từng loại khối, với một mẫu hợp lệ và các mẫu sai;
  - lưu nháp và xung đột `revision`, kể cả hai lần lưu đồng thời;
  - xuất bản, lịch sử, khôi phục;
  - quyền theo từng API;
  - token xem trước hết hạn sau 30 phút;
  - API công khai chỉ trả bản đã xuất bản, có `ETag` và trả `304`;
  - `render` chèn và escape đúng thẻ, dùng bản `vi` khi `en` trống, cache bị xóa khi xuất bản;
  - upload: sai định dạng, file giả đuôi, quá dung lượng, SVG chứa script bị làm sạch, file trùng nội dung;
  - không xóa được ảnh đang dùng;
  - lệnh nhập dữ liệu chạy được trên cơ sở dữ liệu rỗng và từ chối chạy lại khi không có `--force`.
- **Trang quản trị** (Playwright): sửa chữ và ảnh của khối, kéo thả sắp xếp, ẩn khối, xem trước, xuất bản, khôi phục, cảnh báo xung đột, thư viện ảnh (upload, sửa alt, xóa bị chặn), người không có quyền.
- **Website** (Playwright):
  - so sánh ảnh chụp trước và sau cho mỗi trang đã chuyển (mục 12);
  - website vẫn hiện đầy đủ nội dung khi API bị tắt;
  - nội dung mới xuất bản xuất hiện sau khi tải lại;
  - chế độ xem trước hiện bản nháp và dải thông báo.
- `tsc`, ESLint sạch ở `server/`, `admin/` và website. Các bộ kiểm tra giao diện hiện có của website vẫn đạt.

## 15. Triển khai

Bổ sung vào `docs/deploy/`:

- Tạo thư mục `/var/lib/istt/media`, chủ sở hữu là người dùng `istt`. Thêm `ReadWritePaths=/var/lib/istt/media` vào dịch vụ systemd.
- Biến môi trường mới cho server: `MEDIA_DIR`, `WEBSITE_INDEX_PATH` (mặc định `/var/www/webct/index.html`), `PUBLIC_SITE_ORIGIN` (dùng cho `og:url`).
- Nginx cổng 80:
  - `location /media/` phục vụ thẳng thư mục ảnh;
  - yêu cầu mở trang (không phải file tĩnh) được chuyển tới `/api/public/render`, có `proxy_intercept_errors` và `error_page` trả `index.html` gốc khi API lỗi;
  - `client_max_body_size 6m` trên cổng 8080 để upload ảnh.
- Sao lưu thêm thư mục ảnh mỗi đêm cùng bản sao lưu MySQL, giữ 14 bản.
- Chạy `npm run content:import` một lần sau `npm run db:migrate`.
- Không sửa `.gitlab-ci.yml`.

## 16. Quy ước mã nguồn

Theo đúng dự án con 1:

- **Không viết comment trong mã nguồn.**
- TypeScript `strict`.
- Khóa phiên bản chính xác.
- `server/` và `admin/` không import code lẫn nhau hay của website.

Code mới trong website theo cấu trúc hiện có của `src/`.

## 17. Ngoài phạm vi 2a

- Tin tức/Bài viết (2b).
- Thêm khối mới, xóa khối, tạo trang mới, sửa menu (2c).
- Chỉnh màu sắc, logo (dự án con 4).
- Hẹn giờ xuất bản, bước duyệt, sửa ảnh (cắt, xoay), tự tạo nhiều kích thước ảnh.
- CRM (dự án con 3).
