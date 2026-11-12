"""Review tracked files before publishing. Never prints matched secret values."""
import re
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
paths=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
patterns=[
    re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
    re.compile(rb'github_pat_[A-Za-z0-9_]{30,}'),
    re.compile(rb'gh[pousr]_[A-Za-z0-9]{30,}'),
    re.compile(rb'sk_live_[A-Za-z0-9]{16,}'),
    re.compile(rb'AKIA[A-Z0-9]{16}'),
]
failures=[]
for item in filter(None,paths):
    p=Path(item)
    if p.suffix.lower() in ('.key','.pem','.db','.sqlite','.sqlite3','.dump') or p.name.startswith('credenciales') or p.parts[0] in ('.local','data','artifacts','node_modules') or p.name=='.env':
        failures.append((item,'protected file type or directory')); continue
    raw=(ROOT/p).read_bytes()
    if any(pattern.search(raw) for pattern in patterns): failures.append((item,'possible real secret'))
    if p.parts[0]=='web' and re.search(rb'(?:api\.educatia\.me|educatia\.nyc3|stripe\.com|googletagmanager\.com)',raw): failures.append((item,'production integration in frontend'))
for item,reason in failures: print(f'BLOCK: {item}: {reason}')
if failures: raise SystemExit(1)
print(f'OK: {len(list(filter(None,paths)))} tracked files reviewed; no protected files or high-signal secrets found.')
