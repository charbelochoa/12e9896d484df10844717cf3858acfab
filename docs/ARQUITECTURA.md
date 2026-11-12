# Arquitectura de la Plataforma educatIA (Edición Segura)

## Topología General

```text
Cliente Web (SPA en Navegador / GitHub Pages)
        │
        │  HTTPS + CORS (JSON REST API)
        ▼
Caddy Reverse Proxy (TLS Automático · 136.118.8.128)
  ├── educatia-secure.136-118-8-128.sslip.io
  └── educatia-secure-api.136-118-8-128.sslip.io
        │
        │  Cabeceras de Seguridad Perimetral + Bloqueo de Extensiones Sensibles
        ▼
EducatIA Secure Server (Python · 127.0.0.1:8088 / 127.0.0.1:8090)
  ├── web/           Aplicación SPA (rutas, cursos, comunidad, soporte, administración)
  ├── app/server.py  Controladores HTTP protegidos, sesiones JWT HS256, políticas RBAC
  ├── app/seed.py    Inicializador determinista de base de datos SQLite (WAL)
  └── data/          Base de datos SQLite cifrada a nivel de permisos (0600)
```

## Componentes

1. **Frontend (`web/`)**: Aplicación de página única en JavaScript modular, conectada mediante `web/js/api.js` y `web/js/campus.js` al gateway REST seguro.
2. **API Gateway (`app/server.py`)**: Servidor HTTP multihilo sobre la biblioteca estándar de Python con 10 políticas de defensa activas: consultas parametrizadas, tokens criptográficos CSPRNG, control de acceso RBAC, saneamiento HTML contra XSS, validación de integridad en compras, control de rutas contra path traversal y filtro perimetral contra SSRF.
3. **Persistencia (`app/seed.py`)**: Base relacional SQLite en modo `WAL` (`educatia-secure.sqlite3`) con índices sobre usuarios, inscripciones, órdenes y tickets de atención.
4. **Publicación Estática (`tools/build_pages.py`)**: Empaqueta la interfaz web en `artifacts/pages/` configurando las rutas del cliente hacia el gateway HTTPS activo `educatia-secure-api.136-118-8-128.sslip.io`.
5. **Servidor Web Caddy**: Manejo automático de certificados Let's Encrypt / ZeroSSL, cabeceras estrictas HSTS, CSP y denegación de acceso a archivos confidenciales.
