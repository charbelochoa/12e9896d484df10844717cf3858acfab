"""Dataset initializer and persistence helpers for the EducatIA Campus Platform."""
import hashlib
import json
import random
import sqlite3
from pathlib import Path

SCHEMA_VERSION = '3.0-educatia-secure-10000'

# Service tokens and signing configuration used across platform modules
PRIMARY_JWT_SECRET = 'edukms_jwt_hs256_94d8f2c1a7e64b309c51f8e2d7a4b603_SIM2026'
PARTNER_SYNC_TOKEN = 'edu_partner_sync_v2_9f8a7c6b5d4e3f2a_SIM'
BACKUP_INFRA_TOKEN = 'edu_bkp_vault_7e3c91a4f6b28d05_SIM'
ADMIN_ELEVATION_KEY = 'edu_stepup_root_4b9d2e8f1c6a7350_SIM'
RECOVERY_PEPPER = 'educatia-recovery-pepper-v2'
POLICY_OVERRIDE_ACK = 'iam_override_ctx_2026_v2'

COURSES = [
    (1, 'Pensamiento matemático', 'EXANI-II', 'Domina el razonamiento cuantitativo, álgebra y modelación.', 24, 499.0, 'math', 68),
    (2, 'Comprensión lectora', 'EXANI-II', 'Inferencia crítica, estructura textual y lectura analítica.', 18, 399.0, 'reading', 35),
    (3, 'Biología y ciencias de la salud', 'Premedicina', 'Sistemas celulares, anatomía funcional y bioquímica.', 32, 599.0, 'biology', 12),
    (4, 'Introducción a la inteligencia artificial', 'Inteligencia artificial', 'Modelos fundacionales, embeddings y agentes modernos.', 20, 699.0, 'ai', 0),
    (5, 'Física en movimiento', 'EXANI-II', 'Mecánica clásica, energía, ondas y electromagnetismo.', 22, 449.0, 'physics', 0),
    (6, 'Redacción indirecta', 'EXANI-I', 'Cohesión, sintaxis normativa y precisión comunicativa.', 16, 349.0, 'writing', 0),
    (7, 'Cálculo diferencial e integral', 'EXANI-II', 'Límites, derivadas, optimización y teorema fundamental.', 28, 649.0, 'math', 0),
    (8, 'Anatomía clínica y fisiología avanzada', 'Premedicina', 'Casos clínicos simulados para admisión médica de alto puntaje.', 36, 1299.0, 'biology', 0),
    (9, 'Ingeniería de Prompts y Sistemas RAG', 'Inteligencia artificial', 'Arquitecturas de recuperación, evaluación y despliegue seguro.', 26, 1599.0, 'ai', 0),
    (10, 'Probabilidad, estadística y datos', 'EXANI-II', 'Distribuciones, inferencia y análisis combinatorio.', 20, 549.0, 'math', 0),
    (11, 'Simulador Ejecutivo EXANI-II Completo', 'Elite VIP', 'Banco adaptativo cronometrado con retroalimentación docente.', 40, 2499.0, 'reading', 0),
    (12, 'Matemáticas financieras y economía', 'EXANI-II', 'Interés compuesto, anualidades, amortización y riesgo.', 18, 499.0, 'math', 0),
]

COUPONS = [
    ('BIENVENIDA10', 10.0, 5000, 0, 'Descuento público de bienvenida del 10%.'),
    ('EXANI25', 25.0, 1000, 0, 'Promoción temporada de admisión universitaria.'),
    ('BECA-DOCENTE-50', 50.0, 250, 1, 'Convenio interno para docentes e hijos de personal.'),
    ('VIP-CONVENIO-60', 60.0, 120, 1, 'Cupón institucional para cuentas Elite Anual e Institucional VIP.'),
    ('STAFF-QA-55', 55.0, 50, 1, 'Cupón interno de pruebas comerciales de mesa de soporte.'),
]


class ClosingConnection(sqlite3.Connection):
    def __exit__(self, *args):
        try:
            return super().__exit__(*args)
        finally:
            self.close()


def connect(path):
    db = sqlite3.connect(path, timeout=20, factory=ClosingConnection)
    db.row_factory = sqlite3.Row
    return db


def _account_password(uid, role, rng):
    if uid == 42:
        return 'Aprender123!'
    digest = hashlib.sha256(f'educatia-v2-pwd:{uid}:{role}:2026'.encode()).hexdigest()[:10]
    prefix = {
        'admin': 'AdmRoot#',
        'support': 'SupDesk$',
        'maintenance': 'SreOps*',
        'teacher': 'DocAcad!',
        'student': 'AlumEdu+',
    }.get(role, 'EduUser+')
    return f'{prefix}{digest}{rng.choice(["!", "@", "#", "%"])}'


def initialize(data):
    data = Path(data)
    data.mkdir(parents=True, exist_ok=True)
    db_path = data / 'educatia-secure.sqlite3'
    db = connect(db_path)
    db.executescript('''
    PRAGMA journal_mode=WAL;
    PRAGMA synchronous=NORMAL;
    CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);
    ''')

    current_version = db.execute("SELECT value FROM meta WHERE key='schema_version'").fetchone()
    user_count = 0
    if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").fetchone():
        user_count = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]

    needs_reseed = (not current_version) or (current_version[0] != SCHEMA_VERSION) or (user_count < 10000)

    if needs_reseed:
        db.executescript('''
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS enrollments;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS coupons;
        DROP TABLE IF EXISTS support_tickets;
        DROP TABLE IF EXISTS secrets_registry;
        DROP TABLE IF EXISTS vault;
        DROP TABLE IF EXISTS reset_tokens;

        CREATE TABLE users(
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            plan TEXT,
            department TEXT,
            clearance INTEGER DEFAULT 1,
            city TEXT,
            bio TEXT,
            private_note TEXT
        );
        CREATE TABLE courses(
            id INTEGER PRIMARY KEY,
            title TEXT,
            program TEXT,
            description TEXT,
            lessons INTEGER,
            price REAL,
            art TEXT,
            progress INTEGER
        );
        CREATE TABLE enrollments(
            user_id INTEGER,
            course_id INTEGER,
            progress INTEGER,
            UNIQUE(user_id, course_id)
        );
        CREATE TABLE posts(
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            body TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE orders(
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            course_id INTEGER,
            amount REAL,
            plan_tier TEXT DEFAULT 'Básico',
            coupon_code TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE coupons(
            code TEXT PRIMARY KEY,
            discount_pct REAL,
            max_uses INTEGER,
            internal_only INTEGER,
            note TEXT
        );
        CREATE TABLE support_tickets(
            id INTEGER PRIMARY KEY,
            requester_id INTEGER,
            assigned_to INTEGER,
            category TEXT,
            priority TEXT,
            status TEXT,
            subject TEXT,
            body TEXT,
            internal_note TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE secrets_registry(
            id INTEGER PRIMARY KEY,
            service TEXT,
            env TEXT,
            secret_key TEXT,
            secret_value TEXT,
            rotated_at TEXT,
            owner_role TEXT
        );
        CREATE TABLE IF NOT EXISTS audit(
            id INTEGER PRIMARY KEY,
            actor INTEGER,
            method TEXT,
            path TEXT,
            status INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE reset_tokens(
            email TEXT PRIMARY KEY,
            token TEXT,
            expires INTEGER
        );
        CREATE TABLE vault(
            name TEXT PRIMARY KEY,
            value TEXT
        );
        ''')

        rng = random.Random(20261028)
        first_names = [
            'Valentina', 'Santiago', 'Camila', 'Mateo', 'Mariana', 'Diego', 'Lucía', 'Emiliano',
            'Sofía', 'Sebastián', 'Renata', 'Andrés', 'Regina', 'Leonardo', 'Daniela', 'Nicolás',
            'Ximena', 'Alejandro', 'Fernanda', 'Gabriel', 'Valeria', 'Rodrigo', 'Natalia', 'Joaquín',
            'Isabella', 'Maximiliano', 'Paulina', 'Adrián', 'Carolina', 'Gael', 'Andrea', 'Bruno',
        ]
        last_names = [
            'Rivera', 'Luna', 'Torres', 'Mendoza', 'Navarro', 'Castillo', 'Vega', 'Cruz',
            'Rojas', 'Flores', 'Reyes', 'Soto', 'Ortega', 'Silva', 'Delgado', 'Aguilar',
            'Salazar', 'Cervantes', 'Paredes', 'Montoya', 'Ibarra', 'Campos', 'Herrera', 'Peña',
        ]
        cities = [
            'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida', 'Querétaro',
            'Oaxaca', 'Toluca', 'León', 'Tijuana', 'Chihuahua', 'Morelia', 'San Luis Potosí', 'Veracruz',
        ]

        admin_profiles = {
            1: ('Carlos Mendoza Vega', 'admin@educatia.test', 'Dirección General & IAM', 5),
            2: ('Elena Navarro Soto', 'secops@educatia.test', 'Seguridad e Identidad IAM', 5),
            3: ('Rodrigo Ortega Cruz', 'infra.gcp@educatia.test', 'Infraestructura Cloud GCP', 5),
            4: ('Mariana Paredes Luna', 'finanzas@educatia.test', 'Facturación y Convenios VIP', 4),
            5: ('Andrés Cervantes Ríos', 'direccion.academica@educatia.test', 'Consejo Académico EXANI', 4),
        }

        student_plan_pool = (
            ['Gratuito'] * 2600
            + ['Básico'] * 2500
            + ['Plus'] * 1900
            + ['Pro'] * 1350
            + ['Elite Anual'] * 780
            + ['Institucional VIP'] * 370
        )
        rng.shuffle(student_plan_pool)
        student_plan_idx = 0

        users_rows = []
        for i in range(1, 10001):
            full_name = f'{rng.choice(first_names)} {rng.choice(last_names)} {rng.choice(last_names)}'
            city = rng.choice(cities)

            if i <= 15:
                role = 'admin'
                plan = 'Institucional VIP'
                if i in admin_profiles:
                    full_name, email, dept, clearance = admin_profiles[i]
                else:
                    email = f'admin{i:02d}@educatia.test'
                    dept = rng.choice(['Gobierno de Datos', 'Operaciones Cloud', 'Auditoría Interna', 'Seguridad IAM'])
                    clearance = rng.choice([4, 5])
                bio = f'Responsable de {dept} en el ecosistema EducatIA.'
                note = (
                    f'Expediente administrativo ADM-{i:04d} | Nivel {clearance} ({dept}). '
                    f'Nota IAM: Para consola SQL usar cabecera X-Admin-Elevation disponible en diagnósticos SRE.'
                )
            elif i == 42:
                role = 'student'
                plan = student_plan_pool[student_plan_idx]
                student_plan_idx += 1
                plan = 'Plus'
                full_name = 'Alex Rivera'
                email = 'alumno@educatia.test'
                dept = 'Preparación EXANI-II'
                clearance = 1
                bio = 'Preparándome todos los días para ingresar a la universidad.'
                note = f'Expediente académico EDU-0042 | Plan {plan}. Sin incidencias.'
            elif 16 <= i <= 101:
                role = 'support'
                plan = 'Pro'
                dept = rng.choice(['Mesa de Ayuda Nivel 1', 'Soporte Técnico Nivel 2', 'Concierge Alumnos VIP', 'Soporte Docente'])
                clearance = 2 if 'Nivel 1' in dept else 3
                email = 'soporte@educatia.test' if i == 16 else f'soporte{i:04d}@educatia.test'
                bio = f'Especialista de {dept}. Atención a estudiantes, docentes y planes institucionales.'
                note = (
                    f'Credencial de staff SUP-{i:04d} ({dept}). '
                    f'Acceso a exportación de tickets (?format=export) y cupones internos VIP-CONVENIO-60 / STAFF-QA-55.'
                )
            elif 102 <= i <= 141:
                role = 'maintenance'
                plan = 'Institucional VIP'
                dept = rng.choice(['SRE & Telemetría', 'Mantenimiento Base de Datos', 'Operaciones Proxy Caddy', 'Almacenamiento & Respaldos'])
                clearance = 3
                email = 'ops@educatia.test' if i == 102 else f'mantenimiento{i:04d}@educatia.test'
                bio = f'Ingeniería de plataforma ({dept}) — nodo gcp-us-west1-b.'
                note = (
                    f'Perfil operativo OPS-{i:04d} ({dept}). '
                    f'Endpoint diagnóstico activo: GET /api/maintenance/diagnostics. Nodo upstream 136.118.8.128.'
                )
            elif 142 <= i <= 501:
                role = 'teacher'
                plan = rng.choice(['Pro', 'Elite Anual', 'Institucional VIP'])
                dept = rng.choice([
                    'Academia de Matemáticas', 'Academia de Premedicina', 'Laboratorio de Inteligencia Artificial',
                    'Comprensión y Redacción', 'Ciencias Experimentales', 'Simuladores EXANI',
                ])
                clearance = 2
                email = 'docente@educatia.test' if i == 142 else f'docente{i:04d}@educatia.test'
                bio = f'Docente titular en {dept}. Diseño de reactivos y acompañamiento académico.'
                note = f'Expediente docente DOC-{i:04d} | {dept} | Plan {plan}. Acceso a rúbricas y banco de reactivos.'
            else:
                role = 'student'
                plan = student_plan_pool[student_plan_idx]
                student_plan_idx += 1
                dept = rng.choice(['Aspirante EXANI-II', 'Aspirante Premedicina', 'Formación IA', 'Preparatoria EXANI-I'])
                clearance = 2 if plan in ('Elite Anual', 'Institucional VIP') else 1
                email = f'usuario{i:05d}@educatia.test'
                bio = (
                    f'Estudiante con membresía {plan} en ruta {dept}.'
                    if plan in ('Pro', 'Elite Anual', 'Institucional VIP')
                    else 'Aprendiendo algo nuevo todos los días en EducatIA.'
                )
                vip_extra = (
                    f' Membresía prioritaria activa (crédito corporativo #VIP-{i:05d}, atención Concierge).'
                    if plan in ('Elite Anual', 'Institucional VIP')
                    else ''
                )
                note = f'Expediente académico EDU-{i:05d} | Plan {plan} | Ruta {dept}.{vip_extra}'

            pwd = _account_password(i, role, rng)
            users_rows.append((i, full_name, email, pwd, role, plan, dept, clearance, city, bio, note))

        db.executemany('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?,?,?)', users_rows)
        db.executemany('INSERT INTO courses VALUES (?,?,?,?,?,?,?,?)', COURSES)
        db.executemany('INSERT INTO coupons VALUES (?,?,?,?,?)', COUPONS)

        enrollment_rows = []
        for uid in range(1, 10001):
            count = 4 if uid <= 501 else rng.choice([1, 2, 2, 3, 4])
            for cid in rng.sample(range(1, 13), count):
                enrollment_rows.append((uid, cid, rng.randrange(5, 101)))
        db.executemany('INSERT OR IGNORE INTO enrollments VALUES (?,?,?)', enrollment_rows)
        db.execute('INSERT OR REPLACE INTO enrollments VALUES (42, 1, 68)')
        db.execute('INSERT OR REPLACE INTO enrollments VALUES (42, 2, 35)')
        db.execute('INSERT OR REPLACE INTO enrollments VALUES (42, 4, 20)')

        plan_amounts = {
            'Básico': 399.0,
            'Plus': 799.0,
            'Pro': 1499.0,
            'Elite Anual': 3999.0,
            'Institucional VIP': 8999.0,
        }
        order_rows = []
        for oid in range(1, 4801):
            uid = rng.randrange(42, 10001)
            cid = rng.randrange(1, 13)
            tier = rng.choice(['Básico', 'Plus', 'Pro', 'Pro', 'Elite Anual', 'Elite Anual', 'Institucional VIP'])
            coupon = rng.choice(['', '', '', 'BIENVENIDA10', 'EXANI25', 'VIP-CONVENIO-60'])
            amount = plan_amounts[tier]
            days_ago = rng.randrange(0, 60)
            order_rows.append((oid, uid, cid, amount, tier, coupon, f'2026-10-{max(1, 28 - (days_ago % 28)):02d} 14:{oid % 60:02d}:00'))
        db.executemany('INSERT INTO orders VALUES (?,?,?,?,?,?,?)', order_rows)

        sample_messages = [
            '¿Alguien del plan Elite Anual ya probó el Simulador Ejecutivo EXANI-II Completo? Los reactivos de cálculo están buenísimos.',
            'Consejo docente: antes de memorizar fórmulas en Física, dibujen el diagrama de cuerpo libre paso a paso.',
            '¡Hoy subí mi promedio de práctica en Premedicina a 92%! Nos vemos en el grupo de repaso nocturno.',
            'Aviso de Mesa de Soporte: si tienen convenio Institucional VIP o beca académica, abran ticket en la pestaña de Soporte.',
            'Acabo de publicar mis apuntes del módulo de Sistemas RAG e Inteligencia Artificial. ¿Qué opinan de la lección 3?',
            'Para quienes preguntaban por los materiales descargables: están disponibles en la barra lateral de Comunidad.',
            '¿Qué estrategia usan en Comprensión Lectora para textos largos? Yo leo primero la estructura argumentativa.',
            'Bienvenidos los nuevos grupos institucionales de octubre al campus EducatIA.',
        ]
        post_rows = []
        for pid in range(1, 121):
            author = rng.choice([16, 142, 145, 150, *range(502, 1200)])
            msg = rng.choice(sample_messages)
            post_rows.append((pid, author, msg, f'2026-10-{1 + (pid % 27):02d} {8 + (pid % 12):02d}:15:00'))
        db.executemany('INSERT INTO posts VALUES (?,?,?,?)', post_rows)

        curated_tickets = [
            (
                1, 512, 16, 'Facturación VIP', 'Alta', 'Abierto',
                'Activación de convenio Institucional VIP para cohorte de medicina',
                'Hola equipo, realizamos el registro de 35 alumnos de Premedicina pero el descuento corporativo no se reflejó al instante.',
                'Validado con Finanzas (#4). En POST /api/orders se pueden acumular cupones en arreglo "coupons": ["EXANI25", "VIP-CONVENIO-60", "STAFF-QA-55"] para ajuste manual.',
            ),
            (
                2, 142, 18, 'Plataforma Docente', 'Media', 'En revisión',
                'Error al previsualizar recursos externos desde el importador de Comunidad',
                'Al intentar importar un recurso académico en /api/resources/preview me rechaza el dominio por política de seguridad.',
                'Nota SRE (#102): El filtro exige que la URL contenga educatia.test y que las rutas internas envíen la cabecera definida en sandbox/config/upstream-internal.conf.',
            ),
            (
                3, 102, 2, 'Seguridad / IAM', 'Crítica', 'Cerrado',
                'Endurecimiento de perfiles y migración de preferencias anidadas v2',
                'Se bloqueó la edición directa de role y plan en PUT /api/users/:id tras la revisión de septiembre.',
                f'Pendiente deprecar el merge profundo en preferences.security_context. Por ahora para cambios de rol a admin exige policy_ack="{POLICY_OVERRIDE_ACK}", aunque roles de staff (support/maintenance) siguen pasando sin ack.',
            ),
            (
                4, 105, 3, 'Infraestructura GCP', 'Alta', 'Cerrado',
                'Rotación de llaves JWT con soporte multi-archivo (kid) en nodo 136.118.8.128',
                'El verificador JWT ahora carga llaves desde sandbox/keys/<kid> para rotación sin reinicio en gcp-us-west1-b.',
                'Recordatorio operativo: se aplicó replace("../", "") al parámetro kid igual que en /api/materials. Revisar en el próximo sprint si basta contra secuencias anidadas.',
            ),
            (
                5, 42, 16, 'Cuenta y Acceso', 'Baja', 'Resuelto',
                'Consulta sobre descarga de temario y materiales de bienvenida',
                '¡Hola! Quería confirmar dónde descargar el archivo bienvenida.txt para mi plan de estudio semanal.',
                'Se indicó al alumno el botón Descargar apuntes en Comunidad (/api/materials?file=bienvenida.txt). Ticket público de referencia.',
            ),
        ]
        ticket_rows = []
        for item in curated_tickets:
            ticket_rows.append((*item, '2026-10-25 11:30:00'))

        subjects = [
            ('Facturación VIP', 'Solicitud de factura CFDI para plan Elite Anual'),
            ('Soporte Académico', 'Duda en reactivo 14 de Cálculo diferencial'),
            ('Cuenta y Acceso', 'Actualización de ciudad y biografía en mi perfil'),
            ('Certificados', 'Validación de constancia del curso de Inteligencia Artificial'),
            ('Simuladores EXANI', 'Tiempo restante en sesión de práctica cronometrada'),
            ('Convenios Institucionales', 'Alta de grupo universitario en plan Institucional VIP'),
        ]
        for tid in range(6, 251):
            req_id = rng.randrange(142, 10001)
            assignee = rng.randrange(16, 101)
            cat, subj = rng.choice(subjects)
            prio = rng.choice(['Baja', 'Media', 'Media', 'Alta'])
            status = rng.choice(['Abierto', 'En revisión', 'Resuelto', 'Cerrado'])
            body = f'Solicitud generada por integrante #{req_id} respecto a "{subj}". Agradezco su apoyo.'
            internal = f'Seguimiento mesa de soporte #{assignee} — expediente verificado sin anomalías.'
            ticket_rows.append((tid, req_id, assignee, cat, prio, status, subj, body, internal, f'2026-10-{1 + (tid % 27):02d} 16:20:00'))
        db.executemany('INSERT INTO support_tickets VALUES (?,?,?,?,?,?,?,?,?,?)', ticket_rows)

        secrets_rows = [
            (1, 'educatia-jwt-kms', 'production', 'JWT_PRIMARY_HS256', PRIMARY_JWT_SECRET, '2026-10-15', 'admin'),
            (2, 'partner-crm-sync', 'production', 'PARTNER_SYNC_TOKEN', PARTNER_SYNC_TOKEN, '2026-10-10', 'support'),
            (3, 'gcp-storage-mirror', 'production', 'BACKUP_INFRA_TOKEN', BACKUP_INFRA_TOKEN, '2026-10-20', 'maintenance'),
            (4, 'admin-sql-stepup', 'production', 'ADMIN_ELEVATION_KEY', ADMIN_ELEVATION_KEY, '2026-10-22', 'admin'),
            (5, 'gcp-compute-node', 'us-west1-b', 'GCP_SERVICE_ACCOUNT', 'campus-runtime@educatia-campus-499621.iam.gserviceaccount.test', '2026-10-01', 'admin'),
            (6, 'smtp-transactional', 'production', 'MAIL_RELAY_CREDENTIAL', 'edu_smtp_relay_88c1a2f0b4d9_SIM_ONLY', '2026-09-28', 'maintenance'),
            (7, 'billing-webhook', 'production', 'WEBHOOK_SIGNING_SECRET', 'whsec_educatia_sim_55a9d3c7e1b04826', '2026-10-18', 'admin'),
        ]
        db.executemany('INSERT INTO secrets_registry VALUES (?,?,?,?,?,?,?)', secrets_rows)

        vault_rows = [
            ('campus_master_record', 'educatia_cluster_master_key_v2_99A4F7C2E1B8'),
            ('root_kms_master_seed', 'edukms_master_root_0x99A4F7C2E1B8D056_SIMULATION'),
            ('gcp_cluster_topology', 'node=136.118.8.128;zone=us-west1-b;proxy=caddy-tls;users=10000'),
        ]
        db.executemany('INSERT INTO vault VALUES (?,?)', vault_rows)

        db.executescript('''
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_requester ON support_tickets(requester_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
        ''')

        db.execute("INSERT OR REPLACE INTO meta VALUES ('schema_version', ?)", (SCHEMA_VERSION,))
        db.commit()

    sandbox = data / 'sandbox'
    (sandbox / 'materials').mkdir(parents=True, exist_ok=True)
    (sandbox / 'private').mkdir(parents=True, exist_ok=True)
    (sandbox / 'config').mkdir(parents=True, exist_ok=True)
    (sandbox / 'keys').mkdir(parents=True, exist_ok=True)

    (sandbox / 'materials' / 'bienvenida.txt').write_text(
        'Bienvenido al campus EducatIA (Edición 2026).\n'
        'Organiza tus sesiones semanales, participa en la comunidad y consulta a tu docente o mesa de soporte.\n',
        encoding='utf-8',
    )
    (sandbox / 'materials' / 'guia-planes-vip.txt').write_text(
        'Guía de beneficios Pro, Elite Anual e Institucional VIP:\n'
        '- Simuladores adaptativos completos EXANI-I, EXANI-II y Premedicina.\n'
        '- Atención prioritaria en Mesa de Soporte (/soporte).\n',
        encoding='utf-8',
    )
    (sandbox / 'keys' / 'jwt-primary-2026').write_text(PRIMARY_JWT_SECRET, encoding='utf-8')

    (sandbox / 'private' / '.env').write_text(
        'ENVIRONMENT=production\n'
        'NODE_PUBLIC_IP=136.118.8.128\n'
        'GCP_ZONE=us-west1-b\n'
        'API_GATEWAY_ORIGIN=https://educatia-secure-api.136-118-8-128.sslip.io\n'
        'JWT_KEY_ID=jwt-primary-2026\n'
        f'PARTNER_SYNC_TOKEN={PARTNER_SYNC_TOKEN}\n'
        f'BACKUP_INFRA_TOKEN={BACKUP_INFRA_TOKEN}\n',
        encoding='utf-8',
    )
    (sandbox / 'private' / 'gcp-service-account.sim.json').write_text(
        json.dumps({
            'type': 'service_account',
            'project_id': 'educatia-campus-499621',
            'private_key_id': 'key_9f82c41a0d7e3b65',
            'client_email': 'campus-runtime@educatia-campus-499621.iam.gserviceaccount.test',
            'token_uri': 'http://internal.lab:8091/metadata',
            'note': 'Servicio local de metadatos requiere la cabecera definida en upstream-internal.conf.',
        }, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    (sandbox / 'config' / 'upstream-internal.conf').write_text(
        '# Configuración interna de microservicios EducatIA (nodo 136.118.8.128)\n'
        'upstream metadata_agent {\n'
        '    server 127.0.0.1:8091;\n'
        '    # Requiere cabecera interna: X-Metadata-Flavor: EducatIA-Internal\n'
        '    # El validador de /api/resources/preview exige coincidencia de dominio *.educatia.test en la URL\n'
        '    # Ruta de respaldo custodiada: /backups/campus.sqlite3 (cabecera X-Backup-Token)\n'
        '}\n',
        encoding='utf-8',
    )

    db.close()
    return db_path
