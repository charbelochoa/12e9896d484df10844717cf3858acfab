/* ================================================================
   educatIA - Public certificate verification
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Certificados = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const Router = () => window.EducatIA.Router;

    function formatDate(value) {
        const date = new Date(value);
        return Number.isFinite(date.getTime())
            ? date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
            : '';
    }

    function certificatePreview(cert) {
        return `
            <article class="certificate-card" data-certificate-id="${esc(cert.id)}">
                <div class="certificate-card__brand" aria-label="educatIA">
                    <img src="assets/new_logo/new_logo.png" alt="">
                </div>
                <span class="certificate-card__eyebrow">Certificado oficial de finalización</span>
                <p>educatIA certifica que</p>
                <h2>${esc(cert.alumno_nombre || 'Estudiante educatIA')}</h2>
                <i></i>
                <p>completó satisfactoriamente la ruta académica</p>
                <h3>${esc(cert.curso_titulo || 'Curso educatIA')}</h3>
                <footer>
                    <span>Emitido el ${esc(formatDate(cert.fecha_emision))}</span>
                    <strong>Folio ${esc(cert.codigo)}</strong>
                </footer>
            </article>
        `;
    }

    async function renderMine() {
        const C = window.EducatIA.Components;
        if (!C.requireAuth()) return;
        const app = document.getElementById('app');
        app.innerHTML = C.renderLoadingBlock('Cargando certificados');

        let certificates, enrollments;
        try {
            [certificates, enrollments] = await Promise.all([API().getMyCertificates(), API().getMyEnrollments()]);
        } catch (error) {
            app.innerHTML = `<main class="page-wrap"><h1>Mis certificados</h1><p class="smsg smsg--err" role="alert">${esc(error.message || 'No fue posible cargar tus certificados.')}</p><button class="btn btn--pri" id="retry-certificates">Reintentar</button></main>`;
            document.getElementById('retry-certificates').onclick = renderMine;
            return;
        }
        const certifiedCourseIds = new Set(certificates.map((item) => String(item.curso_id)));
        const eligible = enrollments.filter((item) => (
            item.certificado_disponible === true
            && !certifiedCourseIds.has(String(item.curso_id || item.curso?.id || ''))
        ));

        app.innerHTML = `
            <main class="account-page certificate-page">
                <header class="account-page__header">
                    <span class="account-page__eyebrow">Logros académicos</span>
                    <h1>Mis certificados</h1>
                    <p>Consulta y descarga documentos verificables de los cursos que completaste en educatIA.</p>
                </header>
                ${certificates.length ? `
                    <section class="certificate-list">
                        ${certificates.map((cert) => `
                            <div class="certificate-entry">
                                ${certificatePreview(cert)}
                                <div class="certificate-entry__actions">
                                    <button type="button" class="btn btn--primary" data-certificate-download="${esc(cert.id)}" data-certificate-code="${esc(cert.codigo)}">Descargar PDF</button>
                                    <a class="btn btn--outline" href="${Router().toUrl('/verificar?codigo=' + encodeURIComponent(cert.codigo))}">Verificar folio</a>
                                </div>
                            </div>
                        `).join('')}
                    </section>
                ` : `
                    <section class="account-empty">
                        <span aria-hidden="true">${window.EducatIA.Icons.award}</span>
                        <h2>Tu primer certificado aparecerá aquí</h2>
                        <p>Completa todas las actividades de un curso para habilitar su emisión.</p>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--primary">Continuar aprendiendo</a>
                    </section>
                `}
                ${eligible.length ? `
                    <section class="account-panel">
                        <div>
                            <span class="account-page__eyebrow">Listos para emitir</span>
                            <h2>Cursos completados</h2>
                        </div>
                        <div class="certificate-eligible-list">
                            ${eligible.map((item) => `
                                <article>
                                    <div>
                                        <strong>${esc(item.curso_titulo || item.curso?.titulo || 'Curso educatIA')}</strong>
                                        <span>Ruta académica completada</span>
                                    </div>
                                    <button type="button" class="btn btn--outline btn--sm" data-certificate-issue="${esc(item.curso_id || item.curso?.id)}">Emitir certificado</button>
                                </article>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
            </main>
        `;

        document.querySelectorAll('[data-certificate-download]').forEach((button) => {
            button.addEventListener('click', async () => {
                const original = button.textContent;
                button.disabled = true;
                button.textContent = 'Preparando PDF...';
                try {
                    const blob = await API().downloadCertificatePdf(button.dataset.certificateDownload);
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `certificado_${button.dataset.certificateCode}.pdf`;
                    link.click();
                    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
                } catch (error) {
                    C.showWebNotice('Certificado', error.message || 'No fue posible descargar el PDF.', 'error');
                } finally {
                    button.disabled = false;
                    button.textContent = original;
                }
            });
        });

        document.querySelectorAll('[data-certificate-issue]').forEach((button) => {
            button.addEventListener('click', async () => {
                button.disabled = true;
                button.textContent = 'Emitiendo...';
                try {
                    await API().requestCertificate(button.dataset.certificateIssue);
                    await renderMine();
                } catch (error) {
                    button.disabled = false;
                    button.textContent = 'Emitir certificado';
                    C.showWebNotice('Certificado', error.message || 'No fue posible emitirlo.', 'error');
                }
            });
        });
    }

    async function renderVerify() {
        const app = document.getElementById('app');
        const params = Router().getQueryParams();
        const code = (params.get('codigo') || '').trim().toUpperCase();

        app.innerHTML = `
            <div class="page-wrap">
                <div class="page-hd">
                    <h1>Verificar certificado</h1>
                    <p>Comprueba si un código de certificado fue emitido por EducatIA.</p>
                </div>
                <section class="card" style="display:grid;gap:16px;">
                    <form id="certificate-verify-form" style="display:flex;gap:10px;flex-wrap:wrap;">
                        <input class="fi" id="certificate-code" type="text" value="${esc(code)}" placeholder="Código de certificado" style="max-width:360px;text-transform:uppercase;">
                        <button type="submit" class="btn btn--pri">Verificar</button>
                    </form>
                    <div id="certificate-result" aria-live="polite"></div>
                </section>
            </div>
        `;

        const result = document.getElementById('certificate-result');
        const form = document.getElementById('certificate-verify-form');
        async function verify(value) {
            if (!value) {
                result.innerHTML = '<p class="text-muted">Ingresa un código para verificarlo.</p>';
                return;
            }
            result.innerHTML = '<p class="text-muted">Verificando...</p>';
            try {
                const cert = await API().verifyCertificate(value);
                result.innerHTML = `
                    <div class="smsg smsg--ok">
                        <strong>Certificado valido.</strong><br>
                        ${esc(cert.alumno_nombre)}<br>${esc(cert.curso_titulo)}<br>Folio: ${esc(cert.codigo)} · Emitido: ${esc(formatDate(cert.fecha_emision))}
                    </div>
                `;
            } catch (error) {
                result.innerHTML = `<div class="smsg smsg--err">${esc(error.message || 'Certificado no encontrado')}</div>`;
            }
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            verify(document.getElementById('certificate-code')?.value?.trim().toUpperCase());
        });
        if (code) {
            verify(code);
        }
    }

    return { renderMine, renderVerify };
})();
