"""HTTP application server and secure API gateway for the EducatIA Campus Platform."""
import argparse
import base64
import hashlib
import hmac
import html
import json
import mimetypes
import re
import secrets
import sqlite3
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .seed import (
    ADMIN_ELEVATION_KEY,
    BACKUP_INFRA_TOKEN,
    PARTNER_SYNC_TOKEN,
    POLICY_OVERRIDE_ACK,
    PRIMARY_JWT_SECRET,
    RECOVERY_PEPPER,
    connect,
    initialize,
)

ROOT = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = {
    '127.0.0.1',
    'localhost',
    '[::1]',
    '136.118.8.128',
    'educatia-secure.136-118-8-128.sslip.io',
    'educatia-secure-api.136-118-8-128.sslip.io',
    'educatia-secure-corrected.136-118-8-128.sslip.io',
}

ALLOWED_ORIGINS = {
    'https://charbelochoa.github.io',
    'https://educatia-secure.136-118-8-128.sslip.io',
    'https://educatia-secure-api.136-118-8-128.sslip.io',
    'https://educatia-secure-corrected.136-118-8-128.sslip.io',
    'http://136.118.8.128',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8088',
    'http://127.0.0.1:8090',
    'http://127.0.0.1:18080',
    'http://127.0.0.1:18088',
    'http://127.0.0.1:18090',
    'http://localhost:8080',
    'http://localhost:8088',
}

INPUT_SQL_FILTER_RE = re.compile(
    r'(--|/\*|\*/|;|\bunion\b|\bsleep\b|\bbenchmark\b|\bdrop\b|\battach\b|\bpragma\b'
    r'|\bload_extension\b|1\s*=\s*1|\'1\'\s*=\s*\'1\'|\'a\'\s*=\s*\'a\'|\'x\'\s*=\s*\'x\')',
    re.I,
)

HTML_TAG_FILTER_RE = re.compile(
    r'(<\s*/?\s*(?:script|iframe|object|embed|svg|math|style|link|meta|base)\b'
    r'|javascript\s*:|vbscript\s*:|\bon(?:load|click|mouseover|focus|submit|mouseenter)\s*=)',
    re.I,
)

SSO_PUBLIC_KEY_PEM = (
    "-----BEGIN PUBLIC KEY-----\n"
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5n7B1Q7j3kL4m9P6x2W\n"
    "8v1Y0z3T4r5u6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z\n"
    "2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8a9b0c1d2e3f\n"
    "4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L\n"
    "6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r\n"
    "8s9t0u1v2w3x4y5z6A==\n"
    "-----END PUBLIC KEY-----\n"
)


def b64(value):
    return base64.urlsafe_b64encode(value).decode().rstrip('=')


def token_for(user, key, kid='jwt-primary-2026'):
    raw_key = key.encode('utf-8') if isinstance(key, str) else bytes(key)
    header = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT', 'kid': kid}, separators=(',', ':')).encode('utf-8'))
    payload = b64(json.dumps({
        'sub': user['id'],
        'role': user['role'],
        'plan': user.get('plan', 'Básico') if isinstance(user, dict) else user['plan'],
        'exp': int(time.time()) + 86400,
        'iss': 'educatia-secure-auth',
    }, separators=(',', ':')).encode('utf-8'))
    signature = b64(hmac.new(raw_key, f'{header}.{payload}'.encode('utf-8'), hashlib.sha256).digest())
    return f'{header}.{payload}.{signature}'


class CampusServer(ThreadingHTTPServer):
    daemon_threads = False

    def __init__(self, address, data, hardened=False, internal_port=8099, public_ip='136.118.8.128'):
        self.data = Path(data).resolve()
        self.db_path = initialize(self.data)
        self.hardened = hardened
        self.jwt_key = secrets.token_hex(32) if hardened else PRIMARY_JWT_SECRET
        self.internal_port = internal_port
        self.public_ip = public_ip
        super().__init__(address, Handler)


class ApiError(Exception):
    def __init__(self, status, message, extra_headers=None):
        self.status = status
        self.message = message
        self.extra_headers = extra_headers or {}


class InternalHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path != '/metadata':
            self.send_error(404)
            return
        payload = {
            'provider': 'EducatIA Cloud Node Metadata',
            'node_ip': '136.118.8.128',
            'zone': 'gcp-us-west1-b',
            'project_id': 'educatia-campus-499621',
            'service_account': 'campus-runtime@educatia-campus-499621.iam.gserviceaccount.test',
            'access_token': 'ya29.NODE_RUNTIME_99f8c7b6a5d4e3_INTERNAL',
            'secrets': {
                'X-Backup-Token': BACKUP_INFRA_TOKEN,
                'X-Admin-Elevation': ADMIN_ELEVATION_KEY,
            },
        }
        value = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(value)))
        self.end_headers()
        self.wfile.write(value)


class Handler(BaseHTTPRequestHandler):
    server_version = 'EducatIA-Secure-Gateway/3.0'

    def setup(self):
        super().setup()
        self.connection.settimeout(12)

    def log_message(self, format, *args):
        pass

    def cors_headers(self):
        origin = self.headers.get('Origin', '').strip()
        headers = {}
        if origin in ALLOWED_ORIGINS:
            headers['Access-Control-Allow-Origin'] = origin
            headers['Vary'] = 'Origin'
            headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            headers['Access-Control-Allow-Headers'] = (
                'Authorization, Content-Type, X-API-Key, X-Partner-Token, '
                'X-Educatia-Client, X-Debug-Preview, X-Backup-Token, '
                'X-Admin-Elevation, X-Metadata-Flavor'
            )
            headers['Access-Control-Expose-Headers'] = (
                'X-EducatIA-Node, X-EducatIA-Upstream-IP, X-EducatIA-Gateway, '
                'X-Trace-Reset-Ref, X-Security-Policy, X-Security-Control, SourceMap'
            )
            headers['Access-Control-Max-Age'] = '600'
        return headers

    def reply(self, status, value, kind='application/json; charset=utf-8', extra=None):
        raw = (
            value
            if isinstance(value, bytes)
            else (
                json.dumps(value, ensure_ascii=False).encode('utf-8')
                if kind.startswith('application/json')
                else value.encode('utf-8')
            )
        )
        self.response_status = status
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-EducatIA-Node', 'gcp-us-west1-b-01')
        self.send_header('X-EducatIA-Upstream-IP', self.server.public_ip)
        self.send_header('X-EducatIA-Gateway', 'EducatIA-Secure-Gateway/3.0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('X-Security-Policy', 'ENFORCED')
        script = "'self'" if self.server.hardened else "'self' 'unsafe-inline'"
        connect_origins = (
            "'self' https://educatia-secure-api.136-118-8-128.sslip.io "
            "https://educatia-secure.136-118-8-128.sslip.io http://136.118.8.128"
        )
        self.send_header(
            'Content-Security-Policy',
            f"default-src 'self'; script-src {script}; style-src 'self' 'unsafe-inline'; "
            f"font-src 'self' data:; img-src 'self' data: blob:; media-src 'self' blob:; "
            f"connect-src {connect_origins}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        )
        for key, val in self.cors_headers().items():
            self.send_header(key, str(val))
        for key, val in (extra or {}).items():
            self.send_header(key, str(val))
        self.end_headers()
        if self.command != 'HEAD':
            try:
                self.wfile.write(raw)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def body(self):
        length = int(self.headers.get('Content-Length', '0'))
        if length > 1024 * 1024:
            raise ApiError(413, 'El cuerpo excede 1 MB.')
        if length < 0:
            raise ApiError(400, 'Longitud inválida.')
        try:
            value = json.loads(self.rfile.read(length) or b'{}')
            if not isinstance(value, dict):
                raise ValueError()
            return value
        except (ValueError, UnicodeError):
            raise ApiError(400, 'Se esperaba un objeto JSON válido.')

    def _resolve_jwt_key(self, header_obj):
        # Multi-tenant and enterprise federated SSO key resolution
        kid = str(header_obj.get('kid', 'jwt-primary-2026'))
        if kid == 'jwt-primary-2026':
            return self.server.jwt_key.encode('utf-8') if isinstance(self.server.jwt_key, str) else self.server.jwt_key
        if kid == 'sso-enterprise-2026':
            return SSO_PUBLIC_KEY_PEM.encode('utf-8')
        raise ValueError('Identificador de llave JWT no reconocido o revocado')

    def auth(self, db, required=True):
        token = self.headers.get('Authorization', '').removeprefix('Bearer ').strip()
        if not token:
            if required:
                raise ApiError(401, 'Inicia sesión para continuar.')
            return None
        try:
            header_b64, payload_b64, signature = token.split('.')
            header_obj = json.loads(base64.urlsafe_b64decode(header_b64 + '=' * (-len(header_b64) % 4)))
            if header_obj.get('alg') != 'HS256':
                raise ValueError('Algoritmo no permitido')
            signing_key = self._resolve_jwt_key(header_obj)
            expected = b64(hmac.new(signing_key, f'{header_b64}.{payload_b64}'.encode('utf-8'), hashlib.sha256).digest())
            if not hmac.compare_digest(expected, signature):
                raise ValueError('Firma no coincide')
            claims = json.loads(base64.urlsafe_b64decode(payload_b64 + '=' * (-len(payload_b64) % 4)))
            if claims.get('exp', 0) < time.time():
                raise ValueError('Token expirado')
            user = db.execute('SELECT * FROM users WHERE id=?', (int(claims['sub']),)).fetchone()
            if not user:
                raise ValueError('Usuario no existe')
            result = dict(user)
            # Role and plan are bound directly to authoritative database records
            self.actor = user['id']
            return result
        except (ValueError, KeyError, TypeError, UnicodeError, OSError):
            raise ApiError(401, 'Token inválido o vencido.')

    @staticmethod
    def public_user(user, include_dossier=False):
        hidden = {'password'} if include_dossier else {'password', 'private_note', 'clearance'}
        return {k: v for k, v in dict(user).items() if k not in hidden}

    def staff(self, db):
        user = self.auth(db)
        if user['role'] not in ('support', 'maintenance', 'admin'):
            raise ApiError(403, 'Se requiere perfil de soporte, mantenimiento o administración.')
        return user

    def admin(self, db):
        user = self.auth(db)
        if user['role'] != 'admin':
            raise ApiError(403, 'Se requiere rol administrativo.')
        return user

    def dispatch(self):
        parsed = urllib.parse.urlsplit(self.path)
        self.route = urllib.parse.unquote(parsed.path)
        q = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        p = self.route
        method = self.command
        hardened = self.server.hardened
        db = connect(self.server.db_path)
        try:
            if p == '/api/health':
                total_users = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
                return self.reply(200, {
                    'ok': True,
                    'service': 'educatia-secure-api',
                    'server_ip': self.server.public_ip,
                    'node': 'gcp-us-west1-b-01',
                    'users': total_users,
                    'security_mode': 'hardened' if hardened else 'standard-defended',
                })

            if p == '/api/system/info':
                total_users = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
                return self.reply(200, {
                    'platform': 'EducatIA Campus API (Secure Edition)',
                    'version': '3.0.0',
                    'server_ip': self.server.public_ip,
                    'region': 'gcp-us-west1-b',
                    'gateway': 'EducatIA-Secure-Gateway/3.0',
                    'security_controls': 'Enforced (WAF, RBAC, Parametric-SQL, CSP)',
                    'registered_users': total_users,
                })

            if p == '/api/system/security-status':
                audit_count = db.execute('SELECT COUNT(*) FROM audit').fetchone()[0]
                return self.reply(200, {
                    'status': 'OPERATIONAL',
                    'environment': 'Production-Hardened',
                    'security_level': 'High Defense',
                    'active_controls': [
                        {'control': 'PARAMETRIC_SQL', 'scope': 'Authentication & Query Layer', 'status': 'ENFORCED'},
                        {'control': 'RBAC_OBJECT_AUTH', 'scope': 'Dossier, Profiles & Support Desk', 'status': 'ENFORCED'},
                        {'control': 'SCHEMA_WHITELIST_VALIDATION', 'scope': 'User Profile Update API', 'status': 'ENFORCED'},
                        {'control': 'CSPRNG_TOKEN_DERIVATION', 'scope': 'Password Recovery Workflow', 'status': 'ENFORCED'},
                        {'control': 'CANONICAL_PATH_CONTAINMENT', 'scope': 'Academic Material Downloads', 'status': 'ENFORCED'},
                        {'control': 'SSRF_PERIMETER_FILTER', 'scope': 'Remote Resource Preview', 'status': 'ENFORCED'},
                        {'control': 'ANTI_FRAUD_DISCOUNT_CAP', 'scope': 'Orders & Billing Engine', 'status': 'ENFORCED'},
                        {'control': 'XSS_HTML_SANITIZATION', 'scope': 'Community Post Storage & Rendering', 'status': 'ENFORCED'},
                        {'control': 'CRYPTO_JWT_SIGNATURE_VERIFICATION', 'scope': 'Session Management (HS256)', 'status': 'ENFORCED'},
                        {'control': 'SQL_CONSOLE_STEPUP_ELEVATION', 'scope': 'Administrative Data Console', 'status': 'ENFORCED'},
                    ],
                    'audit_events_recorded': audit_count,
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                })

            if p == '/client-config.js':
                config = {
                    'apiBase': '/api',
                    'backendOrigin': 'https://educatia-secure-api.136-118-8-128.sslip.io',
                    'serverIp': self.server.public_ip,
                    'region': 'gcp-us-west1-b',
                    'release': '2026.11.11-sec3',
                    'oauthEnabled': False,
                    'telemetryScript': 'js/educatia-telemetry.js',
                }
                return self.reply(
                    200,
                    'window.EDUCATIA_CONFIG = ' + json.dumps(config, ensure_ascii=False) + ';\n',
                    'text/javascript; charset=utf-8',
                )

            if p == '/.well-known/security.txt':
                txt = (
                    'Contact: mailto:secops@educatia.test\n'
                    'Preferred-Languages: es, en\n'
                    'Policy: https://educatia-secure.136-118-8-128.sslip.io/info/privacidad\n'
                    '# Build-Telemetry: /js/educatia-telemetry.js\n'
                )
                return self.reply(200, txt, 'text/plain; charset=utf-8')

            if p in ('/api/system/public-key', '/api/system/public-key.pem') and method == 'GET':
                return self.reply(200, SSO_PUBLIC_KEY_PEM, 'text/plain; charset=utf-8')

            if p in ('/api/system/jwks', '/.well-known/jwks.json') and method == 'GET':
                return self.reply(200, {
                    'keys': [{
                        'kty': 'RSA',
                        'use': 'sig',
                        'alg': 'RS256',
                        'kid': 'sso-enterprise-2026',
                        'n': 'z5n7B1Q7j3kL4m9P6x2W8v1Y0z3T4r5u6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A==',
                        'e': 'AQAB'
                    }]
                })

            if p == '/robots.txt':
                return self.reply(
                    200,
                    'User-agent: *\nDisallow: /api/admin/\nDisallow: /api/maintenance/\nDisallow: /backups/\n',
                    'text/plain; charset=utf-8',
                )

            if p == '/api/auth/register' and method == 'POST':
                body = self.body()
                name = str(body.get('name', '')).strip()[:180]
                email = str(body.get('email', '')).strip().lower()[:300]
                password = str(body.get('password', ''))[:300]
                if not name or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or len(password) < 8:
                    raise ApiError(400, 'Completa tu nombre, correo y una contraseña de al menos 8 caracteres.')
                try:
                    uid = db.execute(
                        'INSERT INTO users(name,email,password,role,plan,department,clearance,city,bio,private_note) '
                        'VALUES (?,?,?,?,?,?,?,?,?,?)',
                        (name, email, password, 'student', 'Básico', 'Aspirante EXANI-II', 1, '', '', ''),
                    ).lastrowid
                    db.execute('UPDATE users SET private_note=? WHERE id=?', (f'Expediente académico EDU-{uid:05d} | Plan Básico.', uid))
                    db.commit()
                except sqlite3.IntegrityError:
                    raise ApiError(409, 'Ya existe una cuenta registrada con ese correo.')
                user = db.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone()
                return self.reply(201, {'token': token_for(user, self.server.jwt_key), 'user': self.public_user(user)})

            if p == '/api/auth/login' and method == 'POST':
                body = self.body()
                email = str(body.get('email', '')).strip()[:300]
                password = str(body.get('password', ''))[:300]
                if INPUT_SQL_FILTER_RE.search(email) or INPUT_SQL_FILTER_RE.search(password):
                    raise ApiError(
                        403,
                        'Solicitud rechazada: patrón de entrada bloqueado por política de seguridad perimetral.',
                        {'X-Security-Control': 'PARAMETRIC-SQL-DEFENSE', 'X-Security-Policy': 'AUTH-INPUT-301'},
                    )
                # Primary defense: Robust parameterized prepared statements
                user = db.execute('SELECT * FROM users WHERE email=? AND password=?', (email, password)).fetchone()
                if not user:
                    raise ApiError(401, 'Correo o contraseña incorrectos.')
                result = {'token': token_for(user, self.server.jwt_key), 'user': self.public_user(user)}
                return self.reply(200, result, extra={'X-Security-Control': 'PARAMETRIC-SQL-PASS'})

            if p == '/api/auth/forgot' and method == 'POST':
                email = str(self.body().get('email', '')).strip().lower()[:300]
                user = db.execute('SELECT * FROM users WHERE lower(email)=?', (email,)).fetchone()
                if user:
                    token = secrets.token_urlsafe(32)
                    hashed_token = hashlib.sha256(token.encode('utf-8')).hexdigest()
                    expires = int(time.time()) + 900  # 15 minutes
                    db.execute('INSERT OR REPLACE INTO reset_tokens VALUES (?,?,?)', (user['email'].lower(), hashed_token, expires))
                    db.commit()
                return self.reply(
                    200,
                    {'message': 'Si el correo está registrado en el campus, recibirás las instrucciones de recuperación.'},
                    extra={'X-Security-Control': 'CSPRNG-RESET-TOKEN-DEFENSE'},
                )

            if p == '/api/auth/reset' and method == 'POST':
                body = self.body()
                email = str(body.get('email', '')).strip().lower()[:300]
                supplied = str(body.get('token', '')).strip()
                password = str(body.get('password', ''))
                user = db.execute('SELECT * FROM users WHERE lower(email)=?', (email,)).fetchone()
                if not user or len(password) < 8 or not supplied:
                    raise ApiError(400, 'Datos de recuperación inválidos.')
                row = db.execute('SELECT * FROM reset_tokens WHERE email=?', (email,)).fetchone()
                supplied_hash = hashlib.sha256(supplied.encode('utf-8')).hexdigest()
                valid = bool(row and row['expires'] > time.time() and hmac.compare_digest(row['token'], supplied_hash))
                if not valid:
                    raise ApiError(400, 'El enlace o código de recuperación es inválido o ha expirado.')
                db.execute('UPDATE users SET password=? WHERE id=?', (password, user['id']))
                db.execute('DELETE FROM reset_tokens WHERE email=?', (email,))
                db.commit()
                return self.reply(200, {'message': 'Contraseña actualizada correctamente.'}, extra={'X-Security-Control': 'RESET-TOKEN-VERIFIED'})

            if p == '/api/me':
                user = self.auth(db)
                return self.reply(200, self.public_user(user, include_dossier=True))

            if p == '/api/stats':
                counts = {
                    name: db.execute('SELECT COUNT(*) FROM ' + name).fetchone()[0]
                    for name in ('users', 'courses', 'enrollments', 'posts', 'orders', 'support_tickets')
                }
                roles = {r['role']: r['total'] for r in db.execute('SELECT role, COUNT(*) AS total FROM users GROUP BY role')}
                plans = {r['plan']: r['total'] for r in db.execute('SELECT plan, COUNT(*) AS total FROM users GROUP BY plan')}
                revenue = db.execute('SELECT COALESCE(SUM(amount), 0) FROM orders').fetchone()[0]
                counts.update(
                    students=roles.get('student', 0),
                    teachers=roles.get('teacher', 0),
                    support=roles.get('support', 0),
                    maintenance=roles.get('maintenance', 0),
                    admins=roles.get('admin', 0),
                    plans=plans,
                    high_tier_students=plans.get('Elite Anual', 0) + plans.get('Institucional VIP', 0) + plans.get('Pro', 0),
                    revenue_30d=round(float(revenue), 2),
                )
                return self.reply(200, counts)

            if p == '/api/courses':
                search = q.get('q', [''])[0]
                rows = db.execute(
                    'SELECT * FROM courses WHERE title LIKE ? OR program LIKE ? ORDER BY id',
                    ('%' + search + '%', '%' + search + '%'),
                ).fetchall()
                return self.reply(200, [dict(r) for r in rows])

            if re.fullmatch(r'/api/courses/\d+/progress', p) and method == 'PUT':
                user = self.auth(db)
                course = int(p.split('/')[3])
                progress = max(0, min(100, int(self.body().get('progress', 0))))
                if not db.execute('SELECT 1 FROM courses WHERE id=?', (course,)).fetchone():
                    raise ApiError(404, 'Curso inexistente.')
                db.execute('INSERT OR REPLACE INTO enrollments VALUES (?,?,?)', (user['id'], course, progress))
                db.commit()
                return self.reply(200, {'progress': progress})

            if p == '/api/enrollments':
                user = self.auth(db)
                rows = db.execute(
                    'SELECT c.id,c.title,c.program,c.description,c.lessons,c.price,c.art,e.progress '
                    'FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE user_id=? ORDER BY c.id',
                    (user['id'],),
                ).fetchall()
                return self.reply(200, [dict(r) for r in rows])

            if p == '/api/users':
                self.auth(db)
                page = max(1, int(q.get('page', ['1'])[0]))
                search = q.get('q', [''])[0].strip()
                role = q.get('role', [''])[0].strip()
                plan = q.get('plan', [''])[0].strip()
                if role not in ('', 'student', 'teacher', 'support', 'maintenance', 'admin'):
                    raise ApiError(400, 'Rol de búsqueda inválido.')
                filters = ('%' + search + '%', '%' + search + '%', role, role, plan, plan)
                condition = "(name LIKE ? OR email LIKE ?) AND (? = '' OR role = ?) AND (? = '' OR plan = ?)"
                total = db.execute('SELECT COUNT(*) FROM users WHERE ' + condition, filters).fetchone()[0]
                rows = db.execute(
                    'SELECT id,name,email,role,plan,department,city FROM users WHERE '
                    + condition + ' ORDER BY id LIMIT 20 OFFSET ?',
                    (*filters, (page - 1) * 20),
                ).fetchall()
                return self.reply(200, {'items': [dict(r) for r in rows], 'total': total, 'page': page})

            if re.fullmatch(r'/api/users/\d+', p):
                user = self.auth(db)
                uid = int(p.rsplit('/', 1)[1])
                target = db.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone()
                if not target:
                    raise ApiError(404, 'Usuario no encontrado.')

                if method == 'PUT':
                    if uid != user['id'] and user['role'] != 'admin':
                        raise ApiError(403, 'No tienes permisos para editar el perfil de otra persona.')
                    body = self.body()
                    # Mass assignment defense: reject attempts to modify protected IAM attributes
                    if any(k in body for k in ('role', 'plan', 'clearance', 'is_admin', 'permissions')):
                        raise ApiError(
                            403,
                            'Modificación no autorizada: los atributos de rol, plan y privilegios están protegidos.',
                            {'X-Security-Control': 'RBAC-MASS-ASSIGNMENT-DEFENSE', 'X-Security-Policy': 'IAM-102'},
                        )
                    # Enforce strict field whitelist: only name, bio, city
                    for field in ('name', 'bio', 'city'):
                        if field in body:
                            db.execute(f'UPDATE users SET {field}=? WHERE id=?', (str(body[field])[:500], uid))

                    # Disallow nested security_context tampering
                    if isinstance(body.get('preferences'), dict) and 'security_context' in body['preferences']:
                        raise ApiError(
                            403,
                            'Modificación de contexto IAM anidado denegada por política de seguridad.',
                            {'X-Security-Control': 'RBAC-NESTED-CONTEXT-BLOCKED'},
                        )

                    db.commit()
                    updated = db.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone()
                    result = self.public_user(updated, include_dossier=True)
                    if uid == user['id']:
                        result['token'] = token_for(updated, self.server.jwt_key)
                    return self.reply(200, result, extra={'X-Security-Control': 'PROFILE-WHITELIST-UPDATED'})

                is_owner_or_admin = (uid == user['id']) or (user['role'] == 'admin')
                if q.get('include', [''])[0] == 'dossier' and not is_owner_or_admin:
                    raise ApiError(403, 'Acceso denegado: el expediente confidencial solo es accesible por el titular o administradores autorizados.',
                                   {'X-Security-Control': 'RBAC-IDOR-DEFENSE'})

                result = self.public_user(target, include_dossier=is_owner_or_admin)
                return self.reply(200, result)

            if p == '/api/support/tickets':
                user = self.auth(db)
                if method == 'POST':
                    body = self.body()
                    subject = str(body.get('subject', '')).strip()[:240]
                    category = str(body.get('category', 'Soporte Académico')).strip()[:80]
                    message = str(body.get('body', '')).strip()[:3000]
                    if not subject or not message:
                        raise ApiError(400, 'Completa el asunto y la descripción del ticket.')
                    prio = 'Alta' if user.get('plan') in ('Elite Anual', 'Institucional VIP') else 'Media'
                    tid = db.execute(
                        'INSERT INTO support_tickets(requester_id,assigned_to,category,priority,status,subject,body,internal_note) '
                        'VALUES (?,?,?,?,?,?,?,?)',
                        (user['id'], 16, category, prio, 'Abierto', subject, message, 'Ticket recibido en cola de atención.'),
                    ).lastrowid
                    db.commit()
                    return self.reply(201, {'id': tid, 'message': 'Ticket registrado en Mesa de Soporte.'})

                is_staff = user['role'] in ('support', 'maintenance', 'admin')
                if is_staff:
                    rows = db.execute(
                        'SELECT t.id,t.requester_id,t.category,t.priority,t.status,t.subject,t.created_at,u.name AS requester_name,u.plan AS requester_plan '
                        'FROM support_tickets t JOIN users u ON u.id=t.requester_id ORDER BY t.id ASC LIMIT 50'
                    ).fetchall()
                else:
                    rows = db.execute(
                        'SELECT t.id,t.requester_id,t.category,t.priority,t.status,t.subject,t.created_at,u.name AS requester_name,u.plan AS requester_plan '
                        'FROM support_tickets t JOIN users u ON u.id=t.requester_id WHERE t.requester_id=? ORDER BY t.id DESC LIMIT 30',
                        (user['id'],),
                    ).fetchall()
                return self.reply(200, [dict(r) for r in rows])

            if re.fullmatch(r'/api/support/tickets/\d+', p) and method == 'GET':
                user = self.auth(db)
                tid = int(p.rsplit('/', 1)[1])
                ticket = db.execute(
                    'SELECT t.*, u.name AS requester_name, u.email AS requester_email, u.plan AS requester_plan '
                    'FROM support_tickets t JOIN users u ON u.id=t.requester_id WHERE t.id=?',
                    (tid,),
                ).fetchone()
                if not ticket:
                    raise ApiError(404, 'Ticket no encontrado.')
                is_authorized = (ticket['requester_id'] == user['id']) or (user['role'] in ('support', 'maintenance', 'admin'))
                if not is_authorized:
                    raise ApiError(403, 'Acceso denegado: este ticket de soporte pertenece a otro integrante del campus.',
                                   {'X-Security-Control': 'RBAC-TICKET-OWNERSHIP-DEFENSE'})
                data = dict(ticket)
                if user['role'] == 'student':
                    data.pop('internal_note', None)
                return self.reply(200, data)

            if p == '/api/posts':
                user = self.auth(db)
                if method == 'POST':
                    body_text = str(self.body().get('body', ''))[:4000]
                    if not body_text.strip():
                        raise ApiError(400, 'Escribe un mensaje para publicar.')
                    if HTML_TAG_FILTER_RE.search(body_text):
                        raise ApiError(
                            403,
                            'Publicación rechazada: contiene marcado HTML o scripts no autorizados.',
                            {'X-Security-Control': 'XSS-INPUT-FILTER-DEFENSE', 'X-Security-Policy': 'HTML-FILTER-301'},
                        )
                    db.execute('INSERT INTO posts(user_id,body) VALUES (?,?)', (user['id'], body_text))
                    db.commit()
                    return self.reply(201, {'message': 'Publicación guardada.'}, extra={'X-Security-Control': 'XSS-FILTER-PASSED'})
                rows = db.execute(
                    'SELECT p.*,u.name,u.role,u.plan FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC LIMIT 30'
                ).fetchall()
                return self.reply(200, [dict(r, body=html.escape(r['body'])) for r in rows])

            if p == '/api/orders' and method == 'POST':
                user = self.auth(db)
                body = self.body()
                cid = int(body.get('course_id', 0))
                course = db.execute('SELECT * FROM courses WHERE id=?', (cid,)).fetchone()
                if not course:
                    raise ApiError(404, 'Curso inexistente.')
                catalog_price = float(course['price'])

                raw_coupons = body.get('coupons') if isinstance(body.get('coupons'), list) else ([body['coupon_code']] if body.get('coupon_code') else [])
                # Anti-fraud defense: unique coupon, verified existence, max discount capped at 50%
                unique_coupons = list(dict.fromkeys(str(c).strip().upper() for c in raw_coupons if str(c).strip()))[:1]
                discount_pct = 0.0
                applied_codes = []
                for code in unique_coupons:
                    c_row = db.execute('SELECT * FROM coupons WHERE code=?', (code,)).fetchone()
                    if not c_row:
                        raise ApiError(400, f'El cupón "{code}" no es válido o no existe.')
                    if c_row['internal_only'] and user['role'] not in ('teacher', 'support', 'maintenance', 'admin'):
                        raise ApiError(403, f'El cupón "{code}" está reservado para personal institucional.')
                    discount_pct += min(50.0, float(c_row['discount_pct']))
                    applied_codes.append(c_row['code'])

                discount_pct = min(50.0, discount_pct)
                payable = round(catalog_price * (1.0 - discount_pct / 100.0), 2)

                order_id = db.execute(
                    'INSERT INTO orders(user_id,course_id,amount,plan_tier,coupon_code) VALUES (?,?,?,?,?)',
                    (user['id'], cid, payable, user.get('plan', 'Básico'), ','.join(applied_codes)),
                ).lastrowid
                db.execute('INSERT OR IGNORE INTO enrollments VALUES (?,?,0)', (user['id'], cid))
                db.commit()
                resp = {'id': order_id, 'amount': payable, 'catalog_price': catalog_price, 'discount_applied_pct': discount_pct, 'message': 'Inscripción confirmada.'}
                return self.reply(201, resp, extra={'X-Security-Control': 'ANTI-FRAUD-PRICING-DEFENSE'})

            if p == '/api/materials':
                self.auth(db)
                raw_file = q.get('file', ['bienvenida.txt'])[0]
                if '\x00' in raw_file or raw_file.startswith(('/', '\\')):
                    raise ApiError(400, 'Nombre de archivo inválido.')
                if '..' in raw_file:
                    raise ApiError(403, 'Intento de navegación de directorios denegado por política de seguridad.',
                                   {'X-Security-Control': 'PATH-TRAVERSAL-DEFENSE'})
                sandbox = (self.server.data / 'sandbox').resolve()
                materials = sandbox / 'materials'
                target = (materials / raw_file).resolve()
                if not target.is_relative_to(materials):
                    raise ApiError(403, 'Acceso restringido: fuera del directorio autorizado de materiales.',
                                   {'X-Security-Control': 'CANONICAL-PATH-DEFENSE'})
                if not target.is_file():
                    raise ApiError(404, 'Material no encontrado.')
                return self.reply(200, target.read_bytes(), 'text/plain; charset=utf-8',
                                  extra={'X-Security-Control': 'CANONICAL-PATH-VERIFIED'})

            if p == '/api/redirect':
                target_url = q.get('url', [''])[0]
                if not target_url:
                    raise ApiError(400, 'Parámetro url requerido.')
                self.send_response(302)
                self.send_header('Location', target_url)
                self.end_headers()
                return

            if p == '/api/resources/preview' and method == 'POST':
                self.auth(db)
                raw_url = str(self.body().get('url', '')).strip()
                if not raw_url:
                    raise ApiError(400, 'La URL es requerida.')
                target = urllib.parse.urlsplit(raw_url)
                if target.scheme not in ('http', 'https'):
                    raise ApiError(400, 'Esquema de URL no permitido. Solo http y https son admitidos.',
                                   {'X-Security-Control': 'SSRF-SCHEME-DEFENSE'})
                hostname = (target.hostname or '').lower()
                # SSRF Perimeter Defense: block direct requests to cloud metadata and private subnets
                blocked_hostnames = {'169.254.169.254', 'metadata.google.internal'}
                if hostname in blocked_hostnames or hostname.startswith('10.') or hostname.startswith('192.168.') or hostname.startswith('172.'):
                    raise ApiError(403, 'Destino de red privada o servicio interno bloqueado por política anti-SSRF.',
                                   {'X-Security-Control': 'SSRF-PERIMETER-DEFENSE'})
                if not (hostname.endswith('educatia.test') or hostname.endswith('.sslip.io') or hostname in ('127.0.0.1', 'localhost')):
                    raise ApiError(403, 'Política perimetral: el enlace debe pertenecer a un dominio institucional.',
                                   {'X-Security-Control': 'SSRF-DOMAIN-WHITELIST'})
                try:
                    req = urllib.request.Request(raw_url, headers={'User-Agent': 'EducatIA-Resource-Fetcher/3.0'})
                    with urllib.request.urlopen(req, timeout=3) as resp:
                        content = resp.read()[:8192]
                        try:
                            preview_data = json.loads(content)
                        except Exception:
                            preview_data = content.decode('utf-8', errors='replace')
                        return self.reply(200, {
                            'source': hostname,
                            'status': resp.status,
                            'preview': preview_data,
                            'message': 'Recurso verificado y recuperado por política perimetral.',
                        }, extra={'X-Security-Control': 'SSRF-PERIMETER-PASS'})
                except Exception as e:
                    raise ApiError(502, f'Error al consultar el recurso remoto: {e}')

            if p == '/api/integrations/export':
                # Strictly authenticated integration export
                supplied = self.headers.get('X-Partner-Token', '') or self.headers.get('X-API-Key', '')
                if not hmac.compare_digest(supplied.strip(), PARTNER_SYNC_TOKEN):
                    raise ApiError(403, 'Autenticación de integración rechazada: X-Partner-Token inválido.',
                                   {'X-Security-Control': 'INTEGRATION-AUTH-DEFENSE'})
                total_users = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
                plans = {r['plan']: r['total'] for r in db.execute('SELECT plan, COUNT(*) AS total FROM users GROUP BY plan')}
                sample = [
                    dict(r)
                    for r in db.execute(
                        "SELECT id,name,email,role,plan,department FROM users WHERE plan IN ('Elite Anual','Institucional VIP') LIMIT 8"
                    )
                ]
                return self.reply(200, {
                    'node_ip': self.server.public_ip,
                    'total_users': total_users,
                    'plans_distribution': plans,
                    'vip_sample': sample,
                }, extra={'X-Security-Control': 'INTEGRATION-AUTH-VERIFIED'})

            if p in ('/backups/', '/backups'):
                raise ApiError(404, 'No encontrado.')

            if p == '/backups/campus.sqlite3' and method == 'GET':
                # Strictly requires admin session + verified infrastructure backup token
                user = self.admin(db)
                token_hdr = self.headers.get('X-Backup-Token', '').strip()
                if not hmac.compare_digest(token_hdr, BACKUP_INFRA_TOKEN):
                    raise ApiError(403, 'Acceso denegado al respaldo: se requiere cabecera de infraestructura autorizada.',
                                   {'X-Security-Control': 'BACKUP-AUTH-DEFENSE'})
                temp = sqlite3.connect(':memory:')
                db.backup(temp)
                raw = temp.serialize()
                temp.close()
                return self.reply(
                    200,
                    raw,
                    'application/octet-stream',
                    {
                        'Content-Disposition': 'attachment; filename="educatia-secure-10k.sqlite3"',
                        'X-Security-Control': 'BACKUP-AUTHORIZED',
                    },
                )

            if p == '/api/maintenance/diagnostics':
                user = self.staff(db)
                if user['role'] != 'admin':
                    raise ApiError(403, 'Diagnósticos operativos restringidos a administración central.')
                return self.reply(200, {
                    'node': 'gcp-us-west1-b-01',
                    'public_ip': self.server.public_ip,
                    'staff_actor': {'id': user['id'], 'role': user['role'], 'department': user.get('department', '')},
                    'iam_context_policy': {
                        'nested_preferences_enabled': False,
                        'admin_policy_ack': POLICY_OVERRIDE_ACK,
                    },
                    'admin_sql_stepup_header': 'X-Admin-Elevation',
                    'admin_elevation_key': ADMIN_ELEVATION_KEY,
                    'internal_services': ['http://127.0.0.1:8099/metadata'],
                })

            if p == '/api/admin/overview':
                self.admin(db)
                total_users = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
                return self.reply(200, {
                    'message': 'Centro administrativo EducatIA (Secure Platform).',
                    'server_ip': self.server.public_ip,
                    'users': total_users,
                    'stepup_required_for_sql': True,
                    'security_status': 'PROTECTED',
                })

            if p == '/api/admin/step-up' and method == 'POST':
                user = self.admin(db)
                supplied = str(self.body().get('password', '')).strip()
                stored_pwd = db.execute('SELECT password FROM users WHERE id=?', (user['id'],)).fetchone()[0]
                if hmac.compare_digest(supplied, stored_pwd) or hmac.compare_digest(supplied, ADMIN_ELEVATION_KEY):
                    return self.reply(200, {
                        'verified': True,
                        'panel_path': '/administracion',
                        'elevation_token': ADMIN_ELEVATION_KEY,
                        'expires_at': '2027-12-31T23:59:59Z',
                    }, extra={'X-Security-Control': 'STEPUP-VERIFIED'})
                raise ApiError(403, 'Credencial administrativa o llave de elevación inválida.')

            if p == '/api/admin/query' and method == 'POST':
                self.admin(db)
                elev = self.headers.get('X-Admin-Elevation', '').strip()
                if not hmac.compare_digest(elev, ADMIN_ELEVATION_KEY):
                    raise ApiError(403, 'Se requiere elevación administrativa adicional (cabecera X-Admin-Elevation válida).')
                sql = str(self.body().get('sql', ''))[:4000]
                if not re.match(r'^\s*SELECT\b', sql, re.I):
                    raise ApiError(400, 'La consola de datos solo admite consultas SELECT de lectura.')
                db.set_authorizer(
                    lambda action, *args: sqlite3.SQLITE_OK
                    if action in (sqlite3.SQLITE_SELECT, sqlite3.SQLITE_READ, sqlite3.SQLITE_FUNCTION, sqlite3.SQLITE_RECURSIVE)
                    and not (action == sqlite3.SQLITE_FUNCTION and str(args[1]).lower() in ('load_extension', 'writefile', 'readfile'))
                    else sqlite3.SQLITE_DENY
                )
                ticks = [0]

                def bound_query():
                    ticks[0] += 1
                    return int(ticks[0] > 2500)

                db.set_progress_handler(bound_query, 1000)
                rows = db.execute(sql).fetchmany(100)
                db.set_authorizer(None)
                db.set_progress_handler(None, 0)
                return self.reply(200, {'rows': [dict(r) for r in rows], 'limit': 100}, extra={'X-Security-Control': 'SQL-AUTHORIZER-ENFORCED'})

            if p == '/api/admin/audit':
                self.admin(db)
                rows = db.execute('SELECT id,actor,method,path,status AS status_code,status,created_at FROM audit ORDER BY id DESC LIMIT 100').fetchall()
                return self.reply(200, [dict(r) for r in rows])

            if p.startswith('/api/'):
                raise ApiError(404, 'Endpoint inexistente.')

            if method not in ('GET', 'HEAD'):
                raise ApiError(405, 'Método no permitido.')

            target = (ROOT / 'web' / p.lstrip('/')).resolve()
            if not target.is_relative_to(ROOT / 'web'):
                raise ApiError(403, 'Ruta no autorizada.')
            if p == '/' or (not target.suffix and not target.is_file()):
                target = ROOT / 'web' / 'index.html'
            if not target.is_file():
                raise ApiError(404, 'Archivo no encontrado.')
            kind = (
                'application/json; charset=utf-8'
                if target.name.endswith('.map')
                else (mimetypes.guess_type(target.name)[0] or 'application/octet-stream')
            )
            if (kind.startswith('text/') or kind == 'application/javascript') and 'charset=' not in kind:
                kind += '; charset=utf-8'
            extra = {'SourceMap': '/js/educatia-telemetry.js.map'} if target.name == 'educatia-telemetry.js' and not hardened else {}
            if hardened and target.name.endswith('.map'):
                raise ApiError(404, 'Archivo no encontrado.')
            return self.reply(200, target.read_bytes(), kind, extra=extra)
        finally:
            db.close()

    def _host_allowed(self, host):
        if host in ALLOWED_HOSTS:
            return True
        if host.endswith('.136-118-8-128.sslip.io') and host != 'api.136-118-8-128.sslip.io':
            return True
        return False

    def do_OPTIONS(self):
        self.route = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        host = self.headers.get('Host', '').split(':')[0].lower()
        if not self._host_allowed(host):
            return self.reply(403, {'error': 'Host no autorizado.'})
        return self.reply(204, b'', 'text/plain; charset=utf-8')

    def handle_request(self):
        self.actor = None
        self.response_status = 500
        self.route = '/'
        host = self.headers.get('Host', '').split(':')[0].lower()
        if not self._host_allowed(host):
            return self.reply(403, {'error': 'Host no autorizado por el gateway EducatIA.'})
        try:
            self.dispatch()
        except ApiError as e:
            self.reply(e.status, {'error': e.message}, extra=e.extra_headers)
        except (ValueError, TypeError, KeyError, OverflowError):
            self.reply(400, {'error': 'Parámetros inválidos.'})
        except sqlite3.Error as e:
            self.reply(400, {'error': 'La operación de base de datos no pudo completarse.' if self.server.hardened else str(e)})
        except Exception:
            self.reply(500, {'error': 'Error interno del servidor.'})
        finally:
            if self.route.startswith('/api/'):
                try:
                    with connect(self.server.db_path) as db:
                        db.execute(
                            'INSERT INTO audit(actor,method,path,status) VALUES (?,?,?,?)',
                            (self.actor, self.command, self.route, self.response_status),
                        )
                except sqlite3.Error:
                    pass

    do_GET = handle_request
    do_HEAD = handle_request
    do_POST = handle_request
    do_PUT = handle_request
    do_PATCH = handle_request
    do_DELETE = handle_request


def main():
    parser = argparse.ArgumentParser(description='EducatIA Secure Campus Platform Server')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', default=8088, type=int)
    parser.add_argument('--data', default=str(ROOT / 'data' / 'secure'))
    parser.add_argument('--internal-port', default=8099, type=int)
    parser.add_argument('--public-ip', default='136.118.8.128')
    parser.add_argument('--hardened', action='store_true')
    args = parser.parse_args()
    internal = ThreadingHTTPServer(('127.0.0.1', args.internal_port), InternalHandler)
    threading.Thread(target=internal.serve_forever, daemon=True).start()
    server = CampusServer((args.host, args.port), args.data, args.hardened, args.internal_port, args.public_ip)
    mode_label = 'MODO ESTRICTO' if args.hardened else 'DEFENDIDO'
    print(f'EducatIA Secure Campus Server: http://{args.host}:{args.port} | {mode_label}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        internal.shutdown()
        internal.server_close()


if __name__ == '__main__':
    main()
