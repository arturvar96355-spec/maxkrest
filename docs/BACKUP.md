# Резервное копирование и восстановление

Копия: `./scripts/backup.sh` (дамп PostgreSQL + архив загруженных файлов в `./backups`, хранится 14 последних).
Cron (ежедневно в 03:00): `0 3 * * * cd /opt/site && ./scripts/backup.sh >> backups/backup.log 2>&1`
Копии нужно периодически выгружать на внешнее хранилище.

Восстановление БД: `docker compose exec -T db pg_restore -U snow -d snow --clean --if-exists < backups/db-XXXX.dump`
Восстановление файлов: `docker run --rm -v <том uploads>:/data -v $PWD/backups:/in alpine tar xzf /in/uploads-XXXX.tgz -C /data`
