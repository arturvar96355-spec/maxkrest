#!/usr/bin/env bash
# Резервная копия БД и загруженных файлов. Запуск на сервере из каталога проекта:
#   ./scripts/backup.sh            (по cron, например ежедневно в 03:00)
# Хранит последние KEEP копий (по умолчанию 14).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${BACKUP_DIR:-./backups}"; KEEP="${KEEP:-14}"; TS=$(date +%Y%m%d-%H%M%S)
mkdir -p "$OUT"
docker compose exec -T db pg_dump -U snow -Fc snow > "$OUT/db-$TS.dump"
docker run --rm -v "$(docker compose ps -q app | xargs docker inspect -f '{{range .Mounts}}{{if eq .Destination "/data/uploads"}}{{.Name}}{{end}}{{end}}')":/data:ro -v "$(cd "$OUT" && pwd)":/out alpine tar czf "/out/uploads-$TS.tgz" -C /data .
ls -1t "$OUT"/db-*.dump 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm -f
ls -1t "$OUT"/uploads-*.tgz 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm -f
echo "OK: $OUT/db-$TS.dump, $OUT/uploads-$TS.tgz"
