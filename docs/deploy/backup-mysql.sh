#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/istt-mysql}"
BACKUP_CNF="${BACKUP_CNF:-/etc/istt/backup.cnf}"
DB_NAME="${DB_NAME:-istt}"
KEEP="${KEEP:-14}"

mkdir -p "$BACKUP_DIR"
umask 077

stamp="$(date +%Y%m%d-%H%M%S)"
target="$BACKUP_DIR/istt-$stamp.sql.gz"
partial="$target.partial"

mysqldump --defaults-extra-file="$BACKUP_CNF" --single-transaction --routines --triggers "$DB_NAME" | gzip > "$partial"
mv "$partial" "$target"

ls -1t "$BACKUP_DIR"/istt-*.sql.gz | tail -n +"$((KEEP + 1))" | xargs -r rm -f --

echo "$target"
