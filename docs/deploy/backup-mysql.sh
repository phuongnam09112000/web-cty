#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/istt-mysql}"
BACKUP_CNF="${BACKUP_CNF:-/etc/istt/backup.cnf}"
MEDIA_DIR="${MEDIA_DIR:-/var/lib/istt/media}"
DB_NAME="${DB_NAME:-istt}"
KEEP="${KEEP:-14}"

mkdir -p "$BACKUP_DIR"
umask 077

stamp="$(date +%Y%m%d-%H%M%S)"
target="$BACKUP_DIR/istt-$stamp.sql.gz"
media_target="$BACKUP_DIR/istt-media-$stamp.tar.gz"

cleanup() {
  rm -f -- "$target.partial" "$media_target.partial"
}
trap cleanup EXIT

mysqldump --defaults-extra-file="$BACKUP_CNF" --single-transaction --routines --triggers "$DB_NAME" | gzip > "$target.partial"
mv "$target.partial" "$target"

tar -czf "$media_target.partial" -C "$MEDIA_DIR" .
mv "$media_target.partial" "$media_target"

ls -1t "$BACKUP_DIR"/istt-[0-9]*.sql.gz | tail -n +"$((KEEP + 1))" | xargs -r rm -f --
ls -1t "$BACKUP_DIR"/istt-media-*.tar.gz | tail -n +"$((KEEP + 1))" | xargs -r rm -f --

echo "$target"
echo "$media_target"
