# Dữ liệu nội dung ban đầu

Mỗi trang là một file `content-seed/<slug>.json` có dạng:

```json
{ "path": "/gioi-thieu", "name": "Giới thiệu", "content": { "seo": {}, "blocks": [] } }
```

- `path` phải ở dạng đã chuẩn hóa (bắt đầu bằng `/`, chữ thường, không có `/` ở cuối, trang chủ là `/`).
- `content` theo đúng khuôn của trang (`seo` và `blocks`). Ảnh được ghi dạng `{ "src": "/img/..." }` thay cho `mediaId`; `src` là đường dẫn tuyệt đối bên trong thư mục `public` của website.
- Lệnh nhập: `npm run content:import -- [--force] [--seed ./content-seed] [--public ../public] [--fallback-out ../src/content/cms-fallback.json]`.
- Khi DB đã có trang, phải thêm `--force`; mỗi lần nhập tạo thêm một phiên bản đã xuất bản, không xóa phiên bản cũ.
- `--force` ghi đè bản nháp hiện tại của từng trang được nhập.
- Lệnh cũng ghi file bản dự phòng cho website (khóa được sắp xếp, ổn định giữa các lần chạy).
