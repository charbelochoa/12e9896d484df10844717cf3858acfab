/* ================================================================
   educatIA — Notificaciones (v3)
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Notificaciones = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;

    let items = [];
    let activeFilter = 'todas';

    function formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    function getFilters() {
        const typedFilters = Array.from(new Set(items.map((item) => item.tipo).filter(Boolean))).slice(0, 4);
        return [
            { key: 'todas', label: 'Todas', count: items.length },
            { key: 'no_leidas', label: 'No leídas', count: items.filter((item) => !item.leida).length },
            ...typedFilters.map((type) => ({ key: type, label: type, count: items.filter((item) => item.tipo === type).length }))
        ];
    }

    function getFilteredItems() {
        if (activeFilter === 'todas') return items;
        if (activeFilter === 'no_leidas') return items.filter((item) => !item.leida);
        return items.filter((item) => item.tipo === activeFilter);
    }

    function getSummary() {
        return [
            { value: items.length, label: 'Total' },
            { value: items.filter((item) => !item.leida).length, label: 'Pendientes' },
            { value: Array.from(new Set(items.map((item) => item.tipo).filter(Boolean))).length, label: 'Categorías' }
        ];
    }

    function renderNotification(item) {
        const badge = item.tipo || 'sistema';
        const iconLabel = String(badge).charAt(0).toUpperCase();
        return `
        <article class="notification-item ${!item.leida ? 'notification-item--unread' : ''}">
            <div class="notification-item__icon notification-item__icon--blue">${esc(iconLabel)}</div>
            <div class="notification-item__content">
                <div class="notification-item__top">
                    <div>
                        <div class="notification-item__title">${esc(item.titulo || 'Notificación')}</div>
                        <div class="notification-item__body">${esc(item.mensaje || item.contenido || '')}</div>
                    </div>
                    <span class="notification-item__badge">${esc(badge)}</span>
                </div>
                <div class="notification-item__time">${esc(formatDate(item.fecha))}</div>
            </div>
            <div class="notification-item__actions">
                ${!item.leida ? `<button type="button" class="btn btn--ghost btn--sm mark-read" data-id="${item.id}">Marcar leída</button>` : '<span class="notification-item__done">Leída</span>'}
            </div>
        </article>`;
    }

    function draw() {
        const app = document.getElementById('app');
        const filters = getFilters();
        const filteredItems = getFilteredItems();
        const summary = getSummary();

        app.innerHTML = `
        <div class="student-content-page notifications-page">
            <div class="student-content-page__inner student-content-page__inner--wide">
                <section class="notifications-hero">
                    <div>
                        <span class="explore-context__eyebrow">Notificaciones</span>
                        <h1>Todo lo que cambia en tu actividad, sin perder el hilo.</h1>
                        <p>Pagos, cursos, certificados, avisos del sistema y progreso reciente en una sola bandeja filtrable.</p>
                    </div>
                    ${items.length ? '<button class="btn btn--out" id="mark-all-read">Marcar todas como leídas</button>' : ''}
                </section>

                <div class="notifications-layout">
                    <aside class="notifications-panel" aria-label="Resumen de notificaciones">
                        <section class="notifications-summary">
                            ${summary.map((item) => `
                                <div class="notifications-summary__card">
                                    <strong>${esc(item.value)}</strong>
                                    <span>${esc(item.label)}</span>
                                </div>
                            `).join('')}
                        </section>

                        <section class="notifications-filter-row" aria-label="Filtros de notificaciones">
                            ${filters.map((filter) => `
                                <button type="button" class="notifications-filter ${activeFilter === filter.key ? 'notifications-filter--active' : ''}" data-filter="${esc(filter.key)}">
                                    ${esc(filter.label)}
                                    <span>${esc(filter.count)}</span>
                                </button>
                            `).join('')}
                        </section>
                    </aside>

                    <main class="notifications-feed">
                        ${filteredItems.length ? `
                        <section class="notifications-list">
                            ${filteredItems.map(renderNotification).join('')}
                        </section>` : `
                        <section class="notifications-empty">
                            <h3>Sin notificaciones en esta vista</h3>
                            <p>Ajusta el filtro o espera a que lleguen nuevos eventos del sistema.</p>
                        </section>`}
                    </main>
                </div>
            </div>
        </div>`;

        bindEvents();
    }

    function bindEvents() {
        document.querySelectorAll('[data-filter]').forEach((button) => {
            button.addEventListener('click', function () {
                activeFilter = button.dataset.filter || 'todas';
                draw();
            });
        });

        document.querySelectorAll('.mark-read').forEach((button) => {
            button.addEventListener('click', async function () {
                try {
                    await API().markNotificationRead(button.dataset.id);
                    items = items.map((item) => String(item.id) === String(button.dataset.id) ? { ...item, leida: true } : item);
                    draw();
                } catch {}
            });
        });

        document.getElementById('mark-all-read')?.addEventListener('click', async function () {
            try {
                await API().markAllNotificationsRead();
                items = items.map((item) => ({ ...item, leida: true }));
                activeFilter = 'todas';
                draw();
            } catch {}
        });
    }

    async function render() {
        if (!C().requireAuth()) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando notificaciones');

        try {
            const response = await API().getNotifications();
            items = Array.isArray(response) ? response : (response?.items || []);
            draw();
        } catch (error) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">No fue posible cargar tus notificaciones. ${esc(error.message)}</div></div>`;
        }
    }

    return { render };
})();
