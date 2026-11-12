#!/bin/sh
set -eu
test "$(id -u)" = 0 || { echo 'Ejecuta con sudo.' >&2; exit 1; }
task_source=$(CDPATH= cd -- "${1:-.}" && pwd -P)
id educatia-lab >/dev/null 2>&1 || useradd --system --home-dir /var/lib/educatia-secure --shell /usr/sbin/nologin educatia-lab

install -d -m 755 -o root -g root /opt/educatia-secure /opt/educatia-secure/app /opt/educatia-secure/web
install -d -m 750 -o educatia-lab -g educatia-lab /var/lib/educatia-secure /var/lib/educatia-secure-corrected

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
        print(f'{folder}: inicializado con {total} cuentas.')
PY

if [ -f /etc/caddy/Caddyfile ] && ! grep -q 'educatia-secure-api.136-118-8-128.sslip.io' /etc/caddy/Caddyfile; then
  cp -a /etc/caddy/Caddyfile "/var/backups/Caddyfile.secure.$(date +%s).bak"
  cat >> /etc/caddy/Caddyfile <<'CADDY'

educatia-secure-api.136-118-8-128.sslip.io, educatia-secure.136-118-8-128.sslip.io {
    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }
    @forbidden {
        path */.* *.key *.pem *.env *.sqlite3 *.bak *.conf
        path /backups/*
    }
    respond @forbidden 403 {
        body "Access denied by Web Server Security Policy"
    }
    reverse_proxy 127.0.0.1:8088
}
CADDY
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
  systemctl reload caddy
fi

systemctl daemon-reload
systemctl enable --now educatia-secure.service educatia-secure-corrected.service
systemctl show educatia-secure educatia-secure-corrected caddy --no-pager --property=Id,ActiveState,SubState
