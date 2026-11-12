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
rm -rf /opt/educatia-secure/app /opt/educatia-secure/web
mkdir -p /opt/educatia-secure/app /opt/educatia-secure/web
cp -a "$task_source/app/." /opt/educatia-secure/app/
cp -a "$task_source/web/." /opt/educatia-secure/web/
chown -R root:root /opt/educatia-secure
chmod -R go-w /opt/educatia-secure
install -m 644 "$task_source/deploy/educatia-secure.service" /etc/systemd/system/educatia-secure.service
install -m 644 "$task_source/deploy/educatia-secure-corrected.service" /etc/systemd/system/educatia-secure-corrected.service

# CTF Environment & Service User Setup
usermod -s /bin/bash educatia-lab 2>/dev/null || true
install -d -m 775 -o educatia-lab -g educatia-lab /var/lib/educatia-secure/backups

# CTF User Flag
echo 'FLAG{educatia_w3b_f00th0ld_pwn3d_2026}' > /var/lib/educatia-secure/user.txt
chown educatia-lab:educatia-lab /var/lib/educatia-secure/user.txt
chmod 644 /var/lib/educatia-secure/user.txt

# CTF Root Flag (accessible only by root)
echo 'FLAG{educatia_r00t_pr1v_3sc_m4st3r_2026}' > /root/flag.txt
echo 'FLAG{educatia_r00t_pr1v_3sc_m4st3r_2026}' > /root/root.txt
chown root:root /root/flag.txt /root/root.txt
chmod 600 /root/flag.txt /root/root.txt

# Maintenance script & Sudoers for CTF Privilege Escalation
cat > /usr/local/bin/educatia-maintenance <<'EOF'
#!/bin/bash
# EducatIA Campus Platform - Infrastructure Maintenance & Backup Utility
set -e

if [ "$(id -u)" -ne 0 ]; then
    echo "Error: This utility requires root privileges (sudo)." >&2
    exit 1
fi

ACTION="${1:-status}"

case "$ACTION" in
    status)
        systemctl status educatia-secure --no-pager
        ;;
    backup)
        BACKUP_DIR="/var/lib/educatia-secure/backups"
        mkdir -p "$BACKUP_DIR"
        cd "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        echo "[*] Archiving application snapshot to /var/backups/educatia-snapshot-${TIMESTAMP}.tar.gz..."
        tar -czf "/var/backups/educatia-snapshot-${TIMESTAMP}.tar.gz" * 2>/dev/null || true
        echo "[+] Maintenance backup completed."
        ;;
    rotate-logs)
        echo "[*] Rotating server audit logs..."
        journalctl --vacuum-time=7d
        ;;
    *)
        echo "Usage: educatia-maintenance {status|backup|rotate-logs}"
        exit 1
        ;;
esac
EOF
chmod 755 /usr/local/bin/educatia-maintenance
chown root:root /usr/local/bin/educatia-maintenance

cat > /etc/sudoers.d/educatia-maintenance <<'EOF'
educatia-lab ALL=(ALL) NOPASSWD: /usr/local/bin/educatia-maintenance
EOF
chmod 440 /etc/sudoers.d/educatia-maintenance

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
