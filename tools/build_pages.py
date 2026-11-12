"""Build the GitHub Pages frontend connected directly to the live EducatIA Secure Campus API."""
import hashlib
import io
import json
import shutil
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'artifacts' / 'pages'
BASE = '/12e9896d484df10844717cf3858acfab/'
LIVE_API_ORIGIN = 'https://educatia-secure-api.136-118-8-128.sslip.io'
LIVE_SERVER_IP = '136.118.8.128'

EXTENSIONS = {
    '.html', '.js', '.map', '.css', '.svg', '.png', '.jpg', '.jpeg',
    '.webp', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.txt',
}
RETIRED_FILES = (
    'app.js', 'styles.css', 'mark.svg', 'lab-site.css', 'js/lab-site.js',
    'practica/index.html', 'lab-frontend.tar.gz', 'frontend-package.json',
    'preview-data.js', 'preview-api.js',
)
ROUTES = (
    'dashboard', 'dashboard-maestro', 'explorar', 'login', 'registro-alumno',
    'perfil', 'comunidad', 'soporte', 'configuracion', 'personalizacion',
    'onboarding', 'diagnostico', 'simulacros', 'simuladores-exani',
    'certificados', 'calificaciones', 'notificaciones', 'precios', 'pricing',
    'checkout', 'compras', 'tareas', 'administracion', 'articulos-ia',
    'laboratorio-aprendizaje', 'examenes-practica', 'recuperar-contrasena',
    'restablecer-contrasena', 'confirmar-correo', 'info/proyecto',
    'info/oferta-academica', 'info/formacion-ia', 'info/contacto',
    'info/privacidad', 'info/terminos',
)


def page_html(text):
    return text.replace('<base href="/">', '<base href="' + BASE + '">')


def build():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name in RETIRED_FILES:
        retired = OUTPUT / name
        if retired.is_file():
            retired.unlink()

    sources = [
        path for path in (ROOT / 'web').rglob('*')
        if path.is_file()
        and path.suffix.lower() in EXTENSIONS
        and path.name not in ('preview-api.js', 'preview-data.js')
    ]
    if any(path.is_symlink() for path in sources):
        raise SystemExit('El frontend contiene enlaces simbólicos; no se publican.')

    for source in sources:
        target = OUTPUT / source.relative_to(ROOT / 'web')
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == '.html':
            target.write_text(page_html(source.read_text(encoding='utf-8')), encoding='utf-8', newline='\n')
        else:
            shutil.copyfile(source, target)

    index = (OUTPUT / 'index.html').read_text(encoding='utf-8')
    for route in ROUTES:
        folder = OUTPUT / route
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.html').write_text(index, encoding='utf-8', newline='\n')
    (OUTPUT / '404.html').write_text(index, encoding='utf-8', newline='\n')

    pages_config = {
        'apiBase': LIVE_API_ORIGIN + '/api',
        'backendOrigin': LIVE_API_ORIGIN,
        'serverIp': LIVE_SERVER_IP,
        'region': 'gcp-us-west1-b',
        'release': '2026.11.11-sec3',
        'oauthEnabled': False,
        'telemetryScript': 'js/educatia-telemetry.js',
    }
    (OUTPUT / 'client-config.js').write_text(
        'window.EDUCATIA_CONFIG = ' + json.dumps(pages_config, ensure_ascii=False) + ';\n',
        encoding='utf-8',
    )
    (OUTPUT / 'robots.txt').write_text(
        'User-agent: *\nDisallow: /api/admin/\nDisallow: /api/maintenance/\nDisallow: /backups/\n'
        f'# Live-Gateway: {LIVE_API_ORIGIN} ({LIVE_SERVER_IP})\n',
        encoding='utf-8',
    )
    (OUTPUT / '.nojekyll').write_text('', encoding='utf-8')

    bundle = OUTPUT / 'educatia-campus.tar.gz'
    with tarfile.open(bundle, 'w:gz', compresslevel=1) as archive:
        for source in sorted(sources, key=lambda path: path.relative_to(ROOT / 'web').as_posix()):
            content = source.read_bytes()
            if source.suffix in {'.html', '.js', '.map', '.css', '.svg', '.txt'}:
                content = content.replace(b'\r\n', b'\n')
            item = tarfile.TarInfo('web/' + source.relative_to(ROOT / 'web').as_posix())
            item.size, item.mode = len(content), 0o644
            archive.addfile(item, io.BytesIO(content))
    metadata = {'file': bundle.name, 'sha256': hashlib.sha256(bundle.read_bytes()).hexdigest()}
    (OUTPUT / 'campus-package.json').write_text(json.dumps(metadata) + '\n', encoding='utf-8')
    print(f'Frontend Pages generado en artifacts/pages -> {LIVE_API_ORIGIN} ({LIVE_SERVER_IP}).')


if __name__ == '__main__':
    build()
