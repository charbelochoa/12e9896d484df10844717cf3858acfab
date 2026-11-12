#!/bin/sh
set -eu
test "$(id -u)" = 0 || { echo 'Ejecuta con sudo.' >&2; exit 1; }
task_source=$(CDPATH= cd -- "${1:-.}" && pwd -P)
test -f "$task_source/app/server.py"
test -f "$task_source/web/index.html"
test -f "$task_source/deploy/educatia-secure.service"
test -f "$task_source/deploy/educatia-secure-corrected.service"

if [ ! -d /opt/educatia-secure ]; then
  exec sh "$task_source/deploy/install.sh" "$task_source"
fi

task_backup=$(mktemp -d /var/backups/educatia-secure-update.XXXXXXXX)
cp -a /opt/educatia-secure "$task_backup/code"
cp -a /var/lib/educatia-secure /var/lib/educatia-secure-corrected "$task_backup/"

systemctl stop educatia-secure educatia-secure-corrected
cp -a "$task_source/app/." /opt/educatia-secure/app/
cp -a "$task_source/web/." /opt/educatia-secure/web/
chown -R root:root /opt/educatia-secure
chmod -R go-w /opt/educatia-secure
install -m 644 "$task_source/deploy/educatia-secure.service" /etc/systemd/system/educatia-secure.service
install -m 644 "$task_source/deploy/educatia-secure-corrected.service" /etc/systemd/system/educatia-secure-corrected.service

runuser -u educatia-lab -- env PYTHONPATH=/opt/educatia-secure python3 - <<'PY'
from app.seed import connect, initialize
for folder in ('/var/lib/educatia-secure', '/var/lib/educatia-secure-corrected'):
    db_path = initialize(folder)
    with connect(db_path) as db:
        total = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        print(f'{folder}: actualizado con {total} cuentas.')
PY

systemctl daemon-reload
systemctl start educatia-secure educatia-secure-corrected
printf 'Actualización terminada. Respaldo conservado: %s\n' "$task_backup"
systemctl show educatia-secure educatia-secure-corrected caddy --no-pager --property=Id,ActiveState,SubState
