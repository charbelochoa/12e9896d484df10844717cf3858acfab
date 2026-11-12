/* ================================================================
   educatIA — Dashboard Maestro (v2)
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.DashboardMaestro = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;

    let currentTab = 'borradores';

    function summarizeDescription(text) {
        const value = String(text || '').trim();
        if (!value) {
            return 'Completa la descripción y después agrega módulos, clases y evaluaciones.';
        }
        return value.length > 140 ? `${value.slice(0, 137)}...` : value;
    }

    async function render() {
        if (!C().requireAuth('maestro')) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando cursos');

        try {
            const courses = await API().getCourses({ maestro_id: C().userState.id });
            const items = Array.isArray(courses) ? courses : (courses?.items || []);

            const published = items.filter((course) => course.publicado || course.estado === 'publicado');
            const drafts = items.filter((course) => !course.publicado && course.estado !== 'publicado');
            const counts = { publicados: published.length, borradores: drafts.length };

            app.innerHTML = `
            <div class="page-wrap">
                <div class="page-hd" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
                    <div>
                        <h1>Mis cursos</h1>
                        <p>${items.length} curso${items.length !== 1 ? 's' : ''} creado${items.length !== 1 ? 's' : ''}. Revisa los borradores y publica únicamente cuando la lista de verificación esté completa.</p>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
                        <a href="#/articulos-ia" class="btn btn--out">Gestionar artículos IA</a>
                        <a href="#/maestro/curso/nuevo" class="btn btn--pri" id="create-course-btn">Crear nuevo curso</a>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${counts.borradores}</strong>
                        <div class="text-sm text-muted">Borradores activos</div>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${counts.publicados}</strong>
                        <div class="text-sm text-muted">Cursos publicados</div>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${items.filter((course) => (course.descripcion || '').trim().length >= 10).length}</strong>
                        <div class="text-sm text-muted">Con descripción completa</div>
                    </div>
                </div>

                <div class="tabs">
                    <button class="tab ${currentTab === 'borradores' ? 'tab--on' : ''}" data-tab="borradores">Borradores (${counts.borradores})</button>
                    <button class="tab ${currentTab === 'publicados' ? 'tab--on' : ''}" data-tab="publicados">Publicados (${counts.publicados})</button>
                </div>

                <div id="teacher-tab-content"></div>
            </div>`;

            document.querySelectorAll('.tab').forEach((tabButton) => {
                tabButton.addEventListener('click', () => {
                    currentTab = tabButton.dataset.tab;
                    document.querySelectorAll('.tab').forEach((button) => button.classList.remove('tab--on'));
                    tabButton.classList.add('tab--on');
                    renderTab(currentTab, { published, drafts });
                });
            });

            renderTab(currentTab, { published, drafts });
        } catch (e) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">No fue posible cargar tus cursos. ${esc(e.message)}</div></div>`;
        }
    }

    function renderTab(tab, data) {
        const container = document.getElementById('teacher-tab-content');
        const items = tab === 'publicados' ? data.published : data.drafts;

        if (items.length === 0) {
            container.innerHTML = `
            <div class="empty">
                <h3>${tab === 'publicados' ? 'Sin cursos publicados' : 'Sin borradores'}</h3>
                <p>${tab === 'publicados' ? 'Los cursos publicados y disponibles para los alumnos aparecerán aquí.' : 'Los cursos que estés editando aparecerán aquí.'}</p>
            </div>`;
            return;
        }

        container.innerHTML = `
        <div class="il">
            ${items.map((course) => `
            <div class="ir">
                <div class="ir__body">
                    <div class="ir__title"><a href="#/maestro/curso/${course.id}">${esc(course.titulo)}</a></div>
                    <div class="ir__meta" style="display:grid;gap:6px">
                        <span class="badge ${course.publicado ? 'badge--ok' : 'badge--mute'}">${course.publicado ? 'Publicado' : 'Borrador'}</span>
                        <span>${esc(summarizeDescription(course.descripcion))}</span>
                        <span>${course.precio != null ? `Precio: $${esc(Number(course.precio).toFixed(2))}` : 'Precio pendiente'}</span>
                    </div>
                </div>
                <div class="ir__acts">
                    <a href="#/maestro/curso/${course.id}" class="btn btn--out btn--sm">Gestionar</a>
                </div>
            </div>`).join('')}
        </div>`;
    }

    return { render };
})();
