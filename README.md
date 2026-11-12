# educatIA — Plataforma Académica y Formación en IA (Edición Segura)

Plataforma web y API Gateway de **educatIA** para preparación académica (**EXANI-I**, **EXANI-II**, **Premedicina**) y formación aplicada en **Inteligencia Artificial**, con cursos interactivos, directorio institucional, comunidad colaborativa, mesa de soporte y consola administrativa protegida por políticas de seguridad en servidor.

## Accesos de la Plataforma

- **Portal Web (GitHub Pages)**: `https://charbelochoa.github.io/12e9896d484df10844717cf3858acfab/`
- **Campus Web Directo (HTTPS)**: `https://educatia-secure.136-118-8-128.sslip.io/`
- **API Gateway (HTTPS)**: `https://educatia-secure-api.136-118-8-128.sslip.io/api`
- **Estado de Políticas de Seguridad**: `https://educatia-secure-api.136-118-8-128.sslip.io/api/system/security-status`

## Módulos Principales

- **Catálogo y Aprendizaje**: Programas estructurados de pensamiento matemático, comprensión lectora, premedicina, física e ingeniería de sistemas de IA, con seguimiento de avance por lección.
- **Comunidad y Directorio**: Espacio de publicación académica con saneamiento HTML, descarga de materiales protegida contra path traversal y directorio institucional con control de acceso por roles (RBAC).
- **Mesa de Soporte**: Registro y seguimiento de tickets restringido al propietario del caso o al personal administrativo autorizado (`/soporte`).
- **Comercio y Matrícula**: Validación de catálogo en servidor, verificación de integridad en precios de cupones y límite máximo de descuento.
- **Consola Administrativa**: Consulta restringida con autenticación reforzada y bloqueo de comandos destructivos.

## Políticas de Seguridad Implementadas en Servidor

1. **Consultas Parametrizadas y Detección de Inyecciones**: Todas las consultas a base de datos utilizan sentencias preparadas con parámetros tipados; las anomalías en credenciales son auditadas sin filtrar información técnica.
2. **Tokens Criptográficos Seguros (CSPRNG)**: Generación de tokens de restablecimiento mediante `secrets.token_urlsafe(32)`, persistencia de huella SHA-256 en base de datos y vigencia acotada a 15 minutos sin exposición en encabezados HTTP.
3. **Control de Acceso Basado en Roles (RBAC) y Whitelisting de Perfil**: El endpoint de actualización de perfil valida estrictamente atributos permitidos (`name`, `bio`, `city`), previniendo elevación indebida a roles de staff o modificación de saldos.
4. **Aislamiento de Expedientes y Mesa de Soporte**: Verificación obligatoria de propiedad de registro antes de retornar información personal o tickets de atención.
5. **Mitigación de Cross-Site Scripting (XSS)**: Codificación de entidades HTML y filtrado estricto en comentarios y publicaciones de la comunidad académica.
6. **Integridad de Transacciones Comerciales**: El backend valida los precios contra el catálogo oficial; las promociones se calculan en servidor con tope máximo de descuento (50%).
7. **Control de Acceso a Archivos (Anti Path-Traversal)**: Resolución canónica con `pathlib.Path.resolve()` y validación estricta de jerarquía relativa al directorio autorizado de materiales.
8. **Protección Perimetral contra SSRF**: Resolución de nombres de dominio previa a la conexión, descartando rangos privados (RFC 1918), bucle local (127.0.0.0/8), enlaces locales (169.254.0.0/16) y direcciones de metadatos de proveedores en la nube.
9. **Restricción de Ejecución en Base de Datos**: Bloqueo de invocación a extensiones arbitrarias y comandos destructivos en la consola administrativa.
10. **Aislamiento de Servidor Web (Caddy)**: Bloqueo de extensiones sensibles (`.env`, `.key`, `.pem`, `.sqlite3`, `.bak`), cabeceras HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` y revocación de encabezado `Server`.

## Cuenta de Acceso Estudiantil

| Perfil | Correo | Contraseña |
|---|---|---|
| Estudiante (Plan Plus) | `alumno@educatia.test` | `Aprender123!` |

El formulario de registro (`/registro-alumno`) permite registrar nuevas cuentas estudiantiles en la plataforma.

## Ejecución Local

Requiere **Python 3.11+** (biblioteca estándar, sin dependencias externas):

```powershell
.\start-server.ps1
```

El servidor local queda disponible en `http://127.0.0.1:8088`.

## Compilación de Frontend y Pruebas

```powershell
python tools/build_pages.py
python -m unittest discover -s tests -v
```

Consulta la documentación técnica adicional en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) y [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).
