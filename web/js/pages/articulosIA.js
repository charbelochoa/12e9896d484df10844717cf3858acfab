window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.ArticulosIA = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;

    let articles = [];

    async function render() {
        if (!C().requireAuth('maestro')) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando artículos IA');

        try {
            articles = await API().getManageAIArticles();
            draw();
        } catch (error) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">${esc(error.message || 'No fue posible cargar los artículos IA.')}</div></div>`;
        }
    }

    function draw() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page-wrap">
                <div class="page-hd" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
                    <div>
                        <a href="#/${C().userState.role === 'admin' ? '' : 'dashboard-maestro'}" class="text-sm text-muted" style="display:inline-block;margin-bottom:8px;">Volver</a>
                        <h1>Artículos IA</h1>
                        <p>Publica lecturas premium para alumnos con suscripción activa, promociones vigentes o cuentas docentes aprobadas.</p>
                    </div>
                    <button class="btn btn--pri" id="create-ai-article-btn">Nuevo artículo IA</button>
                </div>

                ${articles.length ? `
                    <div style="display:grid;gap:16px;">
                        ${articles.map((article) => renderArticleCard(article)).join('')}
                    </div>
                ` : `
                    <div class="empty">
                        <h3>Aún no hay artículos publicados</h3>
                        <p>Crea el primer artículo para la sección premium de la plataforma.</p>
                    </div>
                `}
            </div>
        `;

        document.getElementById('create-ai-article-btn')?.addEventListener('click', () => showArticleModal(null));
        document.querySelectorAll('[data-edit-ai-article]').forEach((button) => {
            button.addEventListener('click', () => {
                const article = articles.find((item) => String(item.id) === String(button.dataset.editAiArticle));
                if (article) {
                    showArticleModal(article);
                }
            });
        });
        document.querySelectorAll('[data-delete-ai-article]').forEach((button) => {
            button.addEventListener('click', async () => {
                const confirmed = await C().confirmAction({
                    title: 'Eliminar artículo',
                    message: 'El artículo dejará de estar disponible y esta acción no se puede deshacer.',
                    confirmLabel: 'Eliminar artículo',
                    tone: 'danger'
                });
                if (!confirmed) return;
                try {
                    await API().deleteAIArticle(button.dataset.deleteAiArticle);
                    C().showWebNotice('Artículo eliminado', 'La publicación se retiró del catálogo premium.', 'success');
                    await reload();
                } catch (error) {
                    C().showWebNotice('Artículo no eliminado', error.message || 'No fue posible retirar el artículo.', 'error');
                }
            });
        });
    }

    function renderArticleCard(article) {
        const excerpt = String(article.resumen || article.contenido || '');
        const preview = excerpt.length > 220 ? excerpt.slice(0, 217) + '...' : excerpt;
        return `
            <article style="padding:24px;border:1px solid var(--border-light);border-radius:20px;background:#fff;box-shadow:var(--shadow-card);display:grid;gap:16px;">
                <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;">
                    <div style="display:grid;gap:8px;max-width:780px;">
                        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                            <span class="badge ${article.publicado ? 'badge--ok' : 'badge--mute'}">${article.publicado ? 'Publicado' : 'Borrador'}</span>
                            <span class="text-xs text-muted">Actualizado ${new Date(article.updated_at).toLocaleDateString('es-MX')}</span>
                        </div>
                        <h2 style="font-size:22px;line-height:1.3;">${esc(article.titulo)}</h2>
                        <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">${esc(preview)}</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
                        <button type="button" class="btn btn--out btn--sm" data-edit-ai-article="${article.id}">Editar</button>
                        <button type="button" class="btn btn--danger btn--sm" data-delete-ai-article="${article.id}">Eliminar</button>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                    <span class="text-sm text-muted">Autor: ${esc(article.autor_nombre || 'educatIA')}</span>
                    <span class="text-sm text-muted">Visible en landing premium cuando esta publicado.</span>
                </div>
            </article>
        `;
    }

    function showArticleModal(article) {
        const isEdit = !!article;
        const overlay = document.createElement('div');
        overlay.className = 'mo';
        overlay.innerHTML = `
            <div class="modal" style="max-width:760px;">
                <div class="modal__hd">
                    <h2>${isEdit ? 'Editar artículo de IA' : 'Nuevo artículo de IA'}</h2>
                    <button class="modal__x" id="close-modal">X</button>
                </div>
                <form id="ai-article-form">
                    <div class="fg">
                        <label class="fl">Titulo</label>
                        <input class="fi" type="text" name="titulo" value="${esc(article?.titulo || '')}" required>
                    </div>
                    <div class="fg">
                        <label class="fl">Resumen</label>
                        <textarea class="fi" name="resumen" rows="3" placeholder="Resumen corto para la tarjeta premium de la landing.">${esc(article?.resumen || '')}</textarea>
                    </div>
                    <div class="fg">
                        <label class="fl">Contenido</label>
                        <textarea class="fi" name="contenido" rows="12" placeholder="Escribe aquí el artículo completo.">${esc(article?.contenido || '')}</textarea>
                    </div>
                    <div class="fg">
                        <label class="fl">URL de portada (opcional)</label>
                        <input class="fi" type="url" name="portada_url" value="${esc(article?.portada_url || '')}" placeholder="https://...">
                    </div>
                    <div class="fg" style="padding:14px 16px;border:1px solid var(--border-light);border-radius:12px;background:rgba(0,86,210,0.03);">
                        <label style="display:flex;align-items:center;gap:10px;font-weight:600;color:var(--text-primary);">
                            <input type="checkbox" name="publicado" ${article?.publicado ? 'checked' : ''}>
                            Publicar en la landing premium
                        </label>
                    </div>
                    <div style="display:flex;gap:8px;justify-content:flex-end;">
                        <button type="button" class="btn btn--out" id="cancel-modal">Cancelar</button>
                        <button type="submit" class="btn btn--pri">${isEdit ? 'Guardar cambios' : 'Crear artículo'}</button>
                    </div>
                    <div id="ai-article-msg" style="margin-top:12px"></div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('#close-modal').addEventListener('click', close);
        overlay.querySelector('#cancel-modal').addEventListener('click', close);
        overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });

        overlay.querySelector('#ai-article-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const payload = {
                titulo: form.titulo.value.trim(),
                resumen: form.resumen.value.trim() || null,
                contenido: form.contenido.value.trim(),
                portada_url: form.portada_url.value.trim() || null,
                publicado: !!form.publicado.checked,
            };
            const msgEl = overlay.querySelector('#ai-article-msg');

            try {
                if (isEdit) {
                    await API().updateAIArticle(article.id, payload);
                } else {
                    await API().createAIArticle(payload);
                }
                close();
                C().showWebNotice('Artículo guardado', 'La publicación de IA está actualizada.', 'success');
                await reload();
            } catch (error) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = error.message || 'No se pudo guardar el artículo de IA.';
            }
        });
    }

    async function reload() {
        articles = await API().getManageAIArticles();
        draw();
    }

    return { render };
})();
