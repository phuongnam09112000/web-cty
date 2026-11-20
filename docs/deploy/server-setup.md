# Hướng dẫn cài đặt máy chủ

Tài liệu này hướng dẫn triển khai thủ công API quản trị (`server/`) và trang quản trị (`admin/`) trên một máy Ubuntu 24.04 LTS mới, cạnh website hiện có. Mọi lệnh chạy bằng `sudo` hoặc tài khoản root, trừ khi ghi khác.

## 1. Sơ đồ và đường dẫn

| Thành phần | Vị trí |
|---|---|
| Website (do CI hiện tại deploy, không đổi) | `/var/www/webct` |
| Mã nguồn ứng dụng | `/opt/istt/web-cty` |
| Trang quản trị (file tĩnh) | `/var/www/istt-admin` |
| Thư mục ảnh tải lên | `/var/lib/istt/media` |
| Sao lưu MySQL và ảnh | `/var/backups/istt-mysql` |
| Thông tin đăng nhập sao lưu | `/etc/istt/backup.cnf` |
| Người dùng hệ thống chạy API | `istt` |
| Database / tài khoản ứng dụng | `istt` / `istt_app` |

Luồng truy cập:

- Cổng 80: Nginx phục vụ website từ `/var/www/webct`. `/api/public/` được chuyển tới API; `/media/` phục vụ trực tiếp từ `/var/lib/istt/media`; các đường dẫn trang (không phải file thật) được chuyển tới `/api/public/render` để API chèn tiêu đề và thẻ SEO vào `index.html`. Nếu API lỗi hoặc không phản hồi, Nginx trả `index.html` gốc với mã 200.
- Cổng 8080: chỉ IP nội bộ (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`). Nginx phục vụ trang quản trị, phục vụ `/media/` (ảnh hiển thị trong trang quản trị) và chuyển `/api/admin/` tới API, kèm header `X-Admin-Gateway`. Tải ảnh lên tối đa 6 MB.
- API chỉ lắng nghe `127.0.0.1:4000`; MySQL chỉ lắng nghe `127.0.0.1:3306`.

## 2. Cài phần mềm

### 2.1. Gói cơ bản

```bash
apt-get update
apt-get install -y curl git ca-certificates gnupg nginx
```

### 2.2. Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v
```

Kết quả phải là `v22.x`. Đường dẫn `/usr/bin/node` được dùng trong `istt-api.service`.

### 2.3. MySQL 8.4 LTS

Kho mặc định của Ubuntu 24.04 chỉ có MySQL 8.0, nên dùng kho APT chính thức của MySQL. Kiểm tra tên file mới nhất của `mysql-apt-config` tại <https://dev.mysql.com/downloads/repo/apt/> (ví dụ dưới đây dùng 0.8.33-1, hãy thay nếu có bản mới hơn).

```bash
curl -fsSLO https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb
echo "mysql-apt-config mysql-apt-config/select-server select mysql-8.4-lts" | debconf-set-selections
DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_0.8.33-1_all.deb
apt-get update
apt-get install -y mysql-server
mysql --version
```

Mặc định MySQL lắng nghe `127.0.0.1` và không mở ra mạng. Kiểm tra: `ss -ltnp | grep 3306` phải chỉ hiện `127.0.0.1:3306` (hoặc `127.0.0.1:33060`).

Đặt bảng mã mặc định `utf8mb4`: tạo `/etc/mysql/mysql.conf.d/istt.cnf`:

```ini
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
bind-address = 127.0.0.1
```

```bash
systemctl restart mysql
```

## 3. Tạo người dùng hệ thống

```bash
useradd --system --create-home --home-dir /opt/istt --shell /usr/sbin/nologin istt
mkdir -p /opt/istt /etc/istt /var/www/istt-admin /var/backups/istt-mysql
chown istt:istt /opt/istt
install -d -o istt -g istt -m 750 /var/lib/istt/media
chmod 755 /var/lib/istt
```

Thư mục ảnh `/var/lib/istt/media` thuộc `istt`, quyền `750`. Nginx (người dùng `www-data`) cần đọc được thư mục này để phục vụ `/media/`: thêm `www-data` vào nhóm `istt` (`usermod -aG istt www-data`) rồi `systemctl restart nginx`. Nếu không, `/media/<file>` sẽ trả `403`.

## 4. Tạo database và tài khoản MySQL

Sinh mật khẩu cho `istt_app` (lưu lại, sẽ dùng ở bước 6):

```bash
openssl rand -base64 24 | tr -d '/+=' 
```

Vào MySQL bằng root (`sudo mysql`) và chạy, thay `MAT_KHAU_APP` bằng mật khẩu vừa sinh:

```sql
CREATE DATABASE istt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'istt_app'@'localhost' IDENTIFIED BY 'MAT_KHAU_APP';
GRANT ALL PRIVILEGES ON istt.* TO 'istt_app'@'localhost';
```

`istt_app` chỉ có quyền trên `istt.*` (cần quyền tạo/sửa bảng để `prisma migrate deploy` chạy được), không có quyền trên database khác.

Tài khoản riêng cho sao lưu (chỉ đọc), thay `MAT_KHAU_BACKUP`:

```sql
CREATE USER 'istt_backup'@'localhost' IDENTIFIED BY 'MAT_KHAU_BACKUP';
GRANT SELECT, SHOW VIEW, TRIGGER, EVENT ON istt.* TO 'istt_backup'@'localhost';
GRANT SHOW_ROUTINE, PROCESS ON *.* TO 'istt_backup'@'localhost';
```

## 5. Lấy mã nguồn

```bash
sudo -u istt git clone <URL_REPO> /opt/istt/web-cty
```

Thay `<URL_REPO>` bằng địa chỉ repository của dự án.

## 6. Cấu hình và build API

### 6.1. Tạo `.env`

```bash
cd /opt/istt/web-cty/server
SECRET=$(openssl rand -hex 32)
sudo -u istt tee .env >/dev/null <<ENV
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://istt_app:MAT_KHAU_APP@127.0.0.1:3306/istt
ADMIN_ORIGIN=http://192.168.10.148:8080
ADMIN_GATEWAY_SECRET=$SECRET
COOKIE_SECURE=false
PUBLIC_SITE_ORIGIN=https://www.istt.com.vn
MEDIA_DIR=/var/lib/istt/media
WEBSITE_INDEX_PATH=/var/www/webct/index.html
ENV
chmod 600 .env
chown istt:istt .env
```

Lưu ý:

- Thay `MAT_KHAU_APP` bằng mật khẩu ở bước 4. Nếu mật khẩu có ký tự đặc biệt thì phải mã hóa URL; lệnh `openssl rand -base64 24 | tr -d '/+='` ở bước 4 đã tránh được vấn đề này.
- `ADMIN_ORIGIN` phải đúng từng ký tự với địa chỉ người dùng gõ vào trình duyệt, gồm giao thức và cổng (ví dụ `http://192.168.10.148:8080`). API từ chối các request thay đổi dữ liệu có `Origin` khác giá trị này.
- `ADMIN_GATEWAY_SECRET` tối thiểu 32 ký tự. Giá trị này cũng được dán vào Nginx ở bước 8; lệnh ở bước 8 đọc lại giá trị này từ `.env`, không cần in ra màn hình.
- `COOKIE_SECURE=true` chỉ khi truy cập qua HTTPS; trên HTTP nội bộ để `false`, nếu không trình duyệt sẽ không gửi cookie phiên.
- `PUBLIC_SITE_ORIGIN` là địa chỉ công khai của website (gồm giao thức, không có `/` cuối), dùng cho thẻ canonical và Open Graph. Thay giá trị ví dụ bằng địa chỉ thật.
- `MEDIA_DIR` là thư mục lưu ảnh tải lên, phải trùng với `alias` trong Nginx (`/var/lib/istt/media/`) và `ReadWritePaths` trong `istt-api.service`.
- `WEBSITE_INDEX_PATH` phải trỏ tới `/var/www/webct/index.html` (bản build của website). API kiểm tra file này đọc được khi khởi động; nếu không, API thoát với mã 1. Vì vậy phải deploy website trước khi khởi động (hoặc khởi động lại) API.
- API đọc `index.html` làm mẫu và chỉ đọc lại sau khi có trang được xuất bản. Sau mỗi lần website được deploy lại, chạy `systemctl restart istt-api` để API dùng bản `index.html` mới (tên file JS/CSS trong bản build đổi theo từng lần build).
- Biến thiếu hoặc sai khiến API từ chối khởi động.

### 6.2. Cài gói, build, migrate

`npm run db:migrate` dùng `prisma` và `npm run create-admin` dùng `tsx`; hai gói này nằm trong `devDependencies`, vì vậy **phải cài đầy đủ bằng `npm ci`, không dùng `npm ci --omit=dev`** trên máy chủ.

```bash
cd /opt/istt/web-cty/server
sudo -u istt npm ci
sudo -u istt npm run build
sudo -u istt npm run db:migrate
sudo -u istt npm run content:import
sudo -u istt npm run create-admin
```

`npm ci` tự chạy `prisma generate` (script `postinstall`). `npm run create-admin` hỏi email, họ tên, mật khẩu (tối thiểu 10 ký tự) và nhập lại mật khẩu để tạo quản trị viên đầu tiên; hệ thống không có tài khoản mặc định.

`npm run content:import` nhập nội dung các trang hiện có của website (từ `server/content-seed`) và ảnh trong `public/` vào database và `MEDIA_DIR`, rồi xuất bản luôn; chỉ chạy một lần sau `db:migrate`, và `MEDIA_DIR` phải tồn tại, ghi được bởi `istt`. Nếu database đã có trang, lệnh từ chối chạy.

Cảnh báo về `--force` (`npm run content:import -- --force`): lệnh tạo phiên bản mới cho các trang, XUẤT BẢN phiên bản đó (ghi nhật ký `content.publish`), nên thay thế nội dung đang hiển thị trên website và ghi đè bản nháp của người biên tập. Chỉ dùng khi chủ ý nhập lại từ đầu. Vì lệnh chạy ngoài tiến trình API nên bộ nhớ đệm render của API không được làm mới: sau khi chạy (kể cả lần đầu khi API đang chạy) phải `systemctl restart istt-api`.

Lệnh còn ghi file `../src/content/cms-fallback.json` (tính từ `server/`, tức `/opt/istt/web-cty/src/content/cms-fallback.json`) cho website. Trên máy chủ file này không cần dùng: truyền `--fallback-out /tmp/cms-fallback.json` (đường dẫn ghi được, ví dụ `npm run content:import -- --fallback-out /tmp/cms-fallback.json`), hoặc bảo đảm người dùng `istt` ghi được vào thư mục `src/content`, nếu không lệnh sẽ báo lỗi quyền ghi. Không commit file này từ máy chủ.

Nếu lệnh `sudo -u istt npm ...` báo lỗi ghi cache, chạy với `HOME=/opt/istt` (người dùng `istt` có thư mục home là `/opt/istt`).

## 7. Build trang quản trị

Trang quản trị là file tĩnh, bundle không chứa bí mật nào.

```bash
cd /opt/istt/web-cty/admin
sudo -u istt npm ci
sudo -u istt npm run build
rm -rf /var/www/istt-admin/*
cp -r dist/. /var/www/istt-admin/
```

Website phải được deploy vào `/var/www/webct` (có `index.html`) trước khi khởi động API ở bước 9.

## 8. Cài Nginx

```bash
cp /opt/istt/web-cty/docs/deploy/nginx.conf /etc/nginx/conf.d/istt.conf
```

Mở `/etc/nginx/conf.d/istt.conf` và thay `THAY_BANG_ADMIN_GATEWAY_SECRET` bằng đúng giá trị `ADMIN_GATEWAY_SECRET` trong `.env`. Có thể làm bằng lệnh:

```bash
SECRET=$(grep '^ADMIN_GATEWAY_SECRET=' /opt/istt/web-cty/server/.env | cut -d= -f2)
sed -i "s/THAY_BANG_ADMIN_GATEWAY_SECRET/$SECRET/" /etc/nginx/conf.d/istt.conf
chmod 640 /etc/nginx/conf.d/istt.conf
```

Kiểm tra và nạp lại:

```bash
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Lưu ý:

- Nếu website hiện đã có file cấu hình Nginx riêng cho cổng 80 và `/var/www/webct`, hãy gộp các khối `location` (`/api/public/`, `/media/`, `/`, `@render`, `@static_index`) và khối `map` đầu file vào đó thay vì để hai khối `server` cùng lắng nghe cổng 80 (Nginx sẽ cảnh báo trùng `server_name`). Ở cổng 80, file thật trong `/var/www/webct` (`static`, `img`, favicon, manifest, ...) được phục vụ trực tiếp; mọi đường dẫn khác được chuyển tới `/api/public/render` với thời gian chờ kết nối 2 giây và đọc 5 giây, và khi API trả lỗi 500, 502, 503, 504 thì Nginx trả `index.html` gốc.
- Nginx cần đọc được `/var/lib/istt/media` (xem bước 3).
- Nếu máy có firewall (`ufw`), cho phép cổng 8080 chỉ từ dải nội bộ, ví dụ `ufw allow from 192.168.0.0/16 to any port 8080 proto tcp`.
- Khi đổi `ADMIN_GATEWAY_SECRET` trong `.env`, phải sửa cả Nginx rồi `systemctl reload nginx` và `systemctl restart istt-api`.

## 9. Cài dịch vụ systemd

```bash
cp /opt/istt/web-cty/docs/deploy/istt-api.service /etc/systemd/system/istt-api.service
systemctl daemon-reload
systemctl enable --now istt-api
systemctl status istt-api --no-pager
journalctl -u istt-api -n 50 --no-pager
```

Dịch vụ chạy bằng người dùng `istt`, đọc biến môi trường từ `/opt/istt/web-cty/server/.env`, tự khởi động lại khi lỗi, và bị hạn chế quyền ghi hệ thống (`ProtectSystem=strict`, `ProtectHome=true`, `PrivateTmp=true`, `NoNewPrivileges=true`). API ghi ảnh tải lên vào `/var/lib/istt/media`, đường dẫn duy nhất được phép ghi (`ReadWritePaths=/var/lib/istt/media`); thư mục này phải tồn tại trước khi khởi động dịch vụ (bước 3).

## 10. Sao lưu tự động (MySQL và ảnh)

Thông tin đăng nhập cho `mysqldump`:

```bash
install -m 600 /dev/null /etc/istt/backup.cnf
cat > /etc/istt/backup.cnf <<'CNF'
[client]
user=istt_backup
password=MAT_KHAU_BACKUP
host=127.0.0.1
CNF
chmod 600 /etc/istt/backup.cnf
```

Thay `MAT_KHAU_BACKUP` bằng mật khẩu ở bước 4. Cài script và chạy thử một lần:

```bash
install -m 750 /opt/istt/web-cty/docs/deploy/backup-mysql.sh /usr/local/bin/istt-backup-mysql
/usr/local/bin/istt-backup-mysql
ls -l /var/backups/istt-mysql
```

Đặt cron lúc 02:00 hằng ngày (chạy bằng root):

```bash
echo '0 2 * * * root /usr/local/bin/istt-backup-mysql >> /var/log/istt-backup.log 2>&1' > /etc/cron.d/istt-backup
chmod 644 /etc/cron.d/istt-backup
```

Mỗi lần chạy, script tạo hai file cùng dấu thời gian: `istt-YYYYmmdd-HHMMSS.sql.gz` (database) và `istt-media-YYYYmmdd-HHMMSS.tar.gz` (thư mục ảnh), mỗi loại giữ 14 bản mới nhất và xóa các bản cũ hơn. Nếu một bước lỗi, script xóa file `.partial` dở dang rồi thoát với mã khác 0. Các đường dẫn có thể đổi bằng biến môi trường `BACKUP_DIR`, `BACKUP_CNF`, `MEDIA_DIR`, `DB_NAME`, `KEEP` (mặc định lần lượt là `/var/backups/istt-mysql`, `/etc/istt/backup.cnf`, `/var/lib/istt/media`, `istt`, `14`). Các bản sao lưu nằm cùng máy với database; nên định kỳ chép `/var/backups/istt-mysql` sang nơi khác.

## 11. Khôi phục từ bản sao lưu

```bash
systemctl stop istt-api
ls -1t /var/backups/istt-mysql
sudo mysql -e 'DROP DATABASE istt; CREATE DATABASE istt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
gunzip -c /var/backups/istt-mysql/istt-YYYYmmdd-HHMMSS.sql.gz | sudo mysql istt
systemctl start istt-api
```

Thay `istt-YYYYmmdd-HHMMSS.sql.gz` bằng tên bản cần khôi phục. Quyền của `istt_app` trên `istt.*` vẫn giữ nguyên sau khi tạo lại database. Muốn thử trước, khôi phục vào database tạm (ví dụ `istt_restore_test`) thay vì `istt`.

### 11.1. Khôi phục thư mục ảnh

```bash
systemctl stop istt-api
ls -1t /var/backups/istt-mysql/istt-media-*.tar.gz
rm -rf /var/lib/istt/media/* /var/lib/istt/media/.[!.]*
tar -xzf /var/backups/istt-mysql/istt-media-YYYYmmdd-HHMMSS.tar.gz -C /var/lib/istt/media
chown -R istt:istt /var/lib/istt/media
chmod 750 /var/lib/istt/media
systemctl start istt-api
```

Thay `istt-media-YYYYmmdd-HHMMSS.tar.gz` bằng bản cần khôi phục; nên chọn bản có cùng dấu thời gian với bản database đã khôi phục để ảnh khớp với dữ liệu trang. Lệnh `rm` chỉ xóa nội dung, giữ nguyên thư mục.

## 12. Kiểm tra sau cài đặt

```bash
curl -s http://127.0.0.1:4000/api/public/health
curl -s http://127.0.0.1/api/public/health
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4000/api/admin/auth/me
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/admin/auth/me
```

Kết quả mong đợi:

1. và 2. `{"status":"ok"}`.
3. `403`: truy cập thẳng API mà không qua Nginx bị từ chối vì thiếu `X-Admin-Gateway`.
4. `401`: đi qua Nginx thì header được chấp nhận, chỉ thiếu phiên đăng nhập. Nếu nhận `403` thì giá trị secret trong Nginx khác `.env`.

Kiểm tra website, SEO và ảnh:

```bash
curl -s http://127.0.0.1/about | grep '<title>'
systemctl stop istt-api
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1/about
curl -s http://127.0.0.1/about | grep -c '<title>'
systemctl start istt-api
f=$(ls /var/lib/istt/media | head -1)
curl -sI "http://127.0.0.1/media/$f"
```

Kết quả mong đợi:

- Lệnh đầu in `<title>` của trang Giới thiệu (khác tiêu đề mặc định của `index.html`).
- Khi `istt-api` đã dừng, `/about` vẫn trả `200` và nội dung là `index.html` gốc. Nhớ chạy lại `systemctl start istt-api`.
- `/media/<file>` trả `200`, có `Cache-Control: public, max-age=31536000, immutable` và `X-Content-Type-Options: nosniff`. Nhận `403` nghĩa là Nginx chưa đọc được thư mục ảnh (xem bước 3).

Kiểm tra API vẫn kết nối được MySQL sau khi MySQL khởi động lại:

```bash
systemctl restart mysql
systemctl restart istt-api
sleep 3
curl -s http://127.0.0.1:4000/api/public/health
```

Kết quả mong đợi: `{"status":"ok"}`. Nếu nhận `{"status":"error"}`, xem `journalctl -u istt-api -n 50`.

Sau đó, từ một máy trong mạng nội bộ, mở `http://<IP máy chủ>:8080` và đăng nhập bằng quản trị viên vừa tạo. Từ máy ngoài dải nội bộ, cổng 8080 phải trả `403`.

## 13. Cập nhật phiên bản mới

```bash
cd /opt/istt/web-cty
sudo -u istt git pull --ff-only
cd server
sudo -u istt npm ci
sudo -u istt npm run build
sudo -u istt npm run db:migrate
systemctl restart istt-api
cd ../admin
sudo -u istt npm ci
sudo -u istt npm run build
rm -rf /var/www/istt-admin/*
cp -r dist/. /var/www/istt-admin/
```

Sau khi deploy lại website vào `/var/www/webct`, chạy `systemctl restart istt-api` để API đọc lại `index.html`. Nếu nâng cấp từ phiên bản chưa có CMS nội dung, thực hiện thêm: tạo thư mục ảnh và thêm ba biến `PUBLIC_SITE_ORIGIN`, `MEDIA_DIR`, `WEBSITE_INDEX_PATH` vào `.env` (bước 3 và 6.1), chạy `npm run content:import` một lần, và cài lại Nginx, systemd, script sao lưu (bước 8, 9, 10).

Nếu `docs/deploy/nginx.conf` hoặc `istt-api.service` thay đổi, cài lại như bước 8 và 9 (nhớ thay lại secret) rồi `nginx -t && systemctl reload nginx` hoặc `systemctl daemon-reload && systemctl restart istt-api`. Nên chạy sao lưu thủ công (`/usr/local/bin/istt-backup-mysql`) trước khi migrate.

## 14. Lưu ý bảo mật: mật khẩu deploy trong `.gitlab-ci.yml`

File `.gitlab-ci.yml` hiện chứa thông tin đăng nhập deploy dạng chữ thường ngay trong repository. Nên:

1. Tạo các biến trong GitLab: Settings, CI/CD, Variables (bật *Masked* và *Protected*), rồi trong `.gitlab-ci.yml` chỉ tham chiếu bằng tên biến.
2. Đổi mật khẩu đó trên máy chủ, vì giá trị cũ đã nằm trong lịch sử git.
3. Ưu tiên chuyển sang khóa SSH thay cho mật khẩu.

Việc này nằm ngoài phạm vi đợt triển khai này và cần được đồng ý riêng.
