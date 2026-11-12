/* ================================================================
   educatIA — Calificaciones (v2)
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Calificaciones = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const toUrl = (path) => window.EducatIA.Router.toUrl(path);

    function courseLink(grade) {
        const title = grade.curso_titulo || grade.curso || '';
        if (!title && !grade.curso_id) return '';
        const href = toUrl(window.EducatIA.Utils.courseUrl({
            id: grade.curso_id,
            titulo: title,
        }));
        return `<a href="${href}" class="edu-inline-link">${esc(title || 'Ver curso')}</a>`;
    }

    async function render() {
        if (!C().requireAuth('alumno')) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando calificaciones');

        try {
            const grades = await API().getMyGrades();
            const items = Array.isArray(grades) ? grades : (grades?.items || []);

            app.innerHTML = `
            <div class="page-wrap">
                <div class="page-hd">
                    <h1>Calificaciones</h1>
                    <p>Historial de evaluaciones y resultados.</p>
                </div>

                ${items.length === 0 ? `
                <div class="empty">
                    <h3>Sin calificaciones</h3>
                    <p>Aún no has completado ninguna evaluación. Inscríbete en un curso y completa sus evaluaciones para consultar tus resultados aquí.</p>
                    <a href="${toUrl('/explorar')}" class="btn btn--out">Explorar cursos</a>
                </div>` : `
                <table class="dt">
                    <thead>
                        <tr>
                            <th>Evaluación</th>
                            <th>Curso</th>
                            <th>Calificación</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(g => {
                            const cal = Number(g.calificacion ?? g.score ?? 0);
                            const passed = typeof g.aprobado === 'boolean' ? g.aprobado : cal >= 9;
                            return `
                            <tr>
                                <td>${esc(g.evaluacion || g.quiz_titulo || 'Evaluación')}</td>
                                <td>${courseLink(g)}</td>
                                <td><strong>${cal.toFixed(1)}</strong> / 10</td>
                                <td><span class="badge ${passed ? 'badge--ok' : 'badge--err'}">${passed ? 'Aprobado' : 'Reprobado'}</span></td>
                                <td class="text-sm text-muted">${g.fecha ? new Date(g.fecha).toLocaleDateString('es-MX') : '-'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>`}
            </div>`;
        } catch (e) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">No fue posible cargar tus calificaciones. ${esc(e.message)}</div></div>`;
        }
    }

    return { render };
})();
