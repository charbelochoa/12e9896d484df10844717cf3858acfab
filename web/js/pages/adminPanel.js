/* ================================================================
   educatIA - Private administrative console
   The route is provided only after an authenticated password step-up.
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.AdminPanel = (function () {
    const ADMIN_STAGE_TIMEOUT_MS = 20000;

    function API() { return window.EducatIA.API; }
    function Router() { return window.EducatIA.Router; }
    function Components() { return window.EducatIA.Components; }
    function esc(value) {
        const escapeHtml = window.EducatIA.Utils?.escapeHtml;
        if (typeof escapeHtml === 'function') {
            return escapeHtml(String(value ?? ''));
        }
        return String(value ?? '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function renderRouteLoading() {
        const app = document.getElementById('app');
        if (!app) return;
        Components().renderNav();
        app.innerHTML = Components().renderLoadingBlock({
            label: 'Validando acceso administrativo',
            containerClass: 'page-wrap admin-gate'
        });
        Components().renderFooter();
        app.style.opacity = '1';
    }

    function withAdminDeadline(promise, message) {
        let timeoutId;
        const timeout = new Promise((resolve, reject) => {
            timeoutId = window.setTimeout(() => {
                const error = new Error(message || 'La consola tardó demasiado en responder.');
                error.retryable = true;
                reject(error);
            }, ADMIN_STAGE_TIMEOUT_MS);
        });
        return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
    }

    let analyticsFilters = defaultPeriod();

    function inputDate(daysAgo) {
        const value = new Date();
        value.setHours(12, 0, 0, 0);
        value.setDate(value.getDate() - daysAgo);
        return value.toISOString().slice(0, 10);
    }

    function defaultPeriod() {
        return { desde: inputDate(29), hasta: inputDate(0) };
    }

    function inclusivePeriodDays(desde, hasta) {
        const start = Date.parse(`${desde}T00:00:00Z`);
        const end = Date.parse(`${hasta}T00:00:00Z`);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return NaN;
        return Math.floor((end - start) / 86400000) + 1;
    }

    function number(value, maximumFractionDigits) {
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? numeric.toLocaleString('es-MX', { maximumFractionDigits: maximumFractionDigits ?? 2 })
            : '0';
    }

    function percent(value) {
        return `${number(value, 1)}%`;
    }

    function revenueLabel(values) {
        const entries = Object.entries(values || {});
        if (!entries.length) return '$0 MXN';
        return entries.map(([currency, amount]) => {
            const code = String(currency || '').toUpperCase();
            try {
                return new Intl.NumberFormat('es-MX', {
                    style: 'currency', currency: code, maximumFractionDigits: 2,
                }).format(Number(amount) || 0);
            } catch {
                return `${code} ${number(amount, 2)}`;
            }
        }).join(' · ');
    }

    function renderNotFound() {
        Components().renderNav();
        document.getElementById('app').innerHTML = `
            <div class="page-wrap admin-gate">
                <div class="card admin-gate__card">
                    <div class="section__label">Estado de la aplicación</div>
                    <h1>La página que buscas no existe</h1>
                    <p class="text-muted">Revisa el enlace o vuelve al inicio.</p>
                    <a href="#/" class="btn btn--pri">Volver al inicio</a>
                </div>
            </div>`;
        Components().renderFooter();
    }

    function renderVerification(currentPath, message) {
        Components().renderNav();
        document.getElementById('app').innerHTML = `
            <div class="page-wrap admin-gate">
                <section class="card admin-gate__card">
                    <div class="section__label">Verificación administrativa</div>
                    <h1>Confirma tu identidad</h1>
                    <p class="text-muted">
                        Esta área requiere una confirmación reciente de la contraseña administrativa.
                    </p>
                    <form id="admin-step-up-form" class="admin-gate__form">
                        <label class="fg">
                            <span class="fl">Contraseña de administrador</span>
                            <input
                                class="fi"
                                id="admin-step-up-password"
                                type="password"
                                autocomplete="current-password"
                                maxlength="256"
                                required
                            >
                        </label>
                        <button class="btn btn--pri" id="admin-step-up-submit" type="submit">
                            Verificar y abrir
                        </button>
                        <div id="admin-step-up-message" class="admin-status" role="status">${message ? esc(message) : ''}</div>
                    </form>
                </section>
            </div>`;
        Components().renderFooter();

        document.getElementById('admin-step-up-form')?.addEventListener('submit', async function (event) {
            event.preventDefault();
            const password = document.getElementById('admin-step-up-password')?.value || '';
            const button = document.getElementById('admin-step-up-submit');
            const status = document.getElementById('admin-step-up-message');
            button.disabled = true;
            button.textContent = 'Verificando...';
            status.textContent = '';
            try {
                const access = await API().verifyAdminAccess(password);
                const target = String(access.panel_path || '');
                if (target !== currentPath) {
                    Router().navigate(target, { replace: true });
                    return;
                }
                await renderConsole();
            } catch (error) {
                button.disabled = false;
                button.textContent = 'Verificar y abrir';
                status.textContent = error.message || 'No fue posible verificar el acceso.';
                document.getElementById('admin-step-up-password')?.select();
            }
        });
        window.requestAnimationFrame(function () {
            document.getElementById('admin-step-up-password')?.focus();
        });
    }

    function metric(label, value, note, tone) {
        return `
            <article class="admin-kpi ${tone ? `admin-kpi--${esc(tone)}` : ''}">
                <div class="admin-kpi__label">${esc(label)}</div>
                <div class="admin-kpi__value">${esc(value)}</div>
                ${note ? `<p>${esc(note)}</p>` : ''}
            </article>`;
    }

    function table(headers, rows, emptyMessage) {
        if (!rows.length) {
            return `<div class="admin-empty">${esc(emptyMessage || 'Sin registros en el periodo seleccionado.')}</div>`;
        }
        return `
            <div class="admin-table-wrap" tabindex="0" aria-label="Tabla desplazable">
                <table class="admin-table">
                    <thead><tr>${headers.map((item) => `<th>${esc(item.label)}</th>`).join('')}</tr></thead>
                    <tbody>${rows.map((row) => `
                        <tr>${headers.map((item) => `<td>${item.render ? item.render(row) : esc(row[item.key])}</td>`).join('')}</tr>
                    `).join('')}</tbody>
                </table>
            </div>`;
    }

    function renderAnalytics(data) {
        const users = data.usuarios || {};
        const subscriptions = data.suscripciones || {};
        const finance = data.finanzas || {};
        const learning = data.aprendizaje || {};
        const courses = Array.isArray(data.cursos) ? data.cursos.slice(0, 12) : [];
        const questions = Array.isArray(data.reactivos_mayor_error) ? data.reactivos_mayor_error.slice(0, 12) : [];
        const daily = Array.isArray(data.actividad_diaria) ? data.actividad_diaria.slice(-14).reverse() : [];
        const period = data.periodo || {};

        const courseTable = table([
            { label: 'Curso', key: 'curso' },
            { label: 'Inscripciones', render: (row) => esc(number(row.inscripciones_totales, 0)) },
            { label: 'Nuevas', render: (row) => esc(number(row.inscripciones_periodo, 0)) },
            { label: 'Progreso medio', render: (row) => esc(percent(row.progreso_promedio_pct)) },
            { label: 'Finalización', render: (row) => esc(percent(row.tasa_finalizacion_pct)) },
            { label: 'Evaluaciones', render: (row) => esc(number(row.evaluaciones_periodo, 0)) },
            { label: 'Calificación', render: (row) => esc(row.calificacion_promedio == null ? 'Sin datos' : number(row.calificacion_promedio, 2)) },
        ], courses);

        const questionTable = table([
            { label: 'Curso / módulo', render: (row) => `<strong>${esc(row.curso || 'Sin curso')}</strong><br><span class="text-muted">${esc(row.modulo || row.fuente || '')}</span>` },
            { label: 'Reactivo', render: (row) => `<span class="admin-question-text" title="${esc(row.reactivo || '')}">${esc(row.reactivo || '')}</span>` },
            { label: 'Respuestas', render: (row) => esc(number(row.respuestas, 0)) },
            { label: 'Error', render: (row) => `<strong>${esc(percent(row.tasa_error_pct))}</strong>` },
        ], questions, 'Aún no hay suficientes respuestas para detectar reactivos difíciles.');

        const dailyTable = table([
            { label: 'Fecha', key: 'fecha' },
            { label: 'Alumnos activos', render: (row) => esc(number(row.alumnos_con_actividad, 0)) },
            { label: 'Lecciones', render: (row) => esc(number(row.lecciones_completadas, 0)) },
            { label: 'Evaluaciones', render: (row) => esc(number(row.examenes_contestados, 0)) },
            { label: 'Laboratorio', render: (row) => esc(number(row.sesiones_laboratorio, 0)) },
            { label: 'Ingresos', render: (row) => esc(revenueLabel(row.ingresos_por_moneda)) },
        ], daily);

        return `
            <div class="admin-analytics__period">
                Periodo analizado: <strong>${esc(period.desde || '')}</strong> a <strong>${esc(period.hasta || '')}</strong>
                · ${esc(number(period.dias, 0))} días · generado ${esc(data.generated_at || '')}
            </div>
            <div class="admin-kpi-grid">
                ${metric('Alumnos activos', number(users.alumnos_activos_periodo, 0), `${percent(users.tasa_actividad_alumnos_pct)} de la base`, 'blue')}
                ${metric('Usuarios nuevos', number(users.nuevos_periodo, 0), `${number(users.alumnos_nuevos_periodo, 0)} alumnos`, 'blue')}
                ${metric('Conversión', percent(subscriptions.conversion_cohorte_pct), `${number(subscriptions.alumnos_cohorte_pagaron, 0)} alumnos nuevos pagaron`, 'green')}
                ${metric('Ingresos confirmados', revenueLabel(finance.ingresos_completados_por_moneda), 'Sin conversión entre divisas', 'green')}
                ${metric('Evaluaciones', number(learning.evaluaciones_periodo, 0), `${number(learning.reactivos_analizados, 0)} respuestas analizadas`)}
                ${metric('Acierto global', percent(learning.tasa_acierto_global_pct), 'Cuestionarios y evaluaciones de clase')}
                ${metric('Estudio diario', percent(users.tasa_estudio_diario_pct), `${number(users.alumnos_con_actividad_todos_los_dias, 0)} alumnos activos`)}
                ${metric('Laboratorio', number(learning.sesiones_laboratorio, 0), `${number((learning.duracion_laboratorio_segundos || 0) / 3600, 1)} horas registradas`)}
            </div>

            <div class="admin-section-grid admin-section-grid--finance">
                <article class="admin-panel-card">
                    <div class="section__label">Suscripciones</div>
                    <h3>Ciclo comercial</h3>
                    <dl class="admin-stat-list">
                        <div><dt>Renovaciones</dt><dd>${esc(number(subscriptions.renovaciones_periodo, 0))}</dd></div>
                        <div><dt>Cancelaciones</dt><dd>${esc(number(subscriptions.cancelaciones_periodo, 0))}</dd></div>
                        <div><dt>Cancelación programada</dt><dd>${esc(number(subscriptions.cancelaciones_programadas_actuales, 0))}</dd></div>
                        <div><dt>Fallos de pago</dt><dd>${esc(number(subscriptions.fallos_pago_periodo, 0))}</dd></div>
                        <div><dt>Pagos con reembolso (estado actual)</dt><dd>${esc(number(subscriptions.pagos_originados_periodo_con_reembolso_estado_actual, 0))}</dd></div>
                        <div><dt>Pagos con disputa (estado actual)</dt><dd>${esc(number(subscriptions.pagos_originados_periodo_con_disputa_estado_actual, 0))}</dd></div>
                    </dl>
                    <p class="admin-note">Reembolso y disputa clasifican hoy los pagos originados en el periodo; no representan la fecha en que Stripe notificó esos eventos.</p>
                </article>
                <article class="admin-panel-card">
                    <div class="section__label">Decisiones de producto</div>
                    <h3>Lectura rápida</h3>
                    <p class="text-muted">Compara conversión, renovaciones, fallos y cancelaciones con el periodo anterior antes de lanzar una oferta.</p>
                    <p class="admin-note">Los importes permanecen separados por moneda. Las exportaciones incluyen el detalle por plan y estado para análisis histórico.</p>
                </article>
            </div>

            <section class="admin-panel-card">
                <div class="admin-panel-card__heading">
                    <div><div class="section__label">Aprendizaje</div><h3>Rendimiento por curso</h3></div>
                    <span>${esc(number(courses.length, 0))} cursos mostrados</span>
                </div>
                ${courseTable}
            </section>

            <section class="admin-panel-card">
                <div class="admin-panel-card__heading">
                    <div><div class="section__label">Calidad académica</div><h3>Reactivos con mayor tasa de error</h3></div>
                    <span>Máximo 12 en pantalla</span>
                </div>
                ${questionTable}
            </section>

            <section class="admin-panel-card">
                <div class="admin-panel-card__heading">
                    <div><div class="section__label">Tendencia</div><h3>Actividad de los últimos 14 días del periodo</h3></div>
                </div>
                ${dailyTable}
            </section>

            <div class="admin-methodology" role="note">
                <strong>Cómo interpretar los datos:</strong> el tiempo exacto existe para evaluaciones finalizadas y laboratorio.
                Una sesión iniciada no equivale a tiempo activo, por lo que el informe no inventa esa duración. La actividad diaria puede
                subestimar días previos cuando un progreso de lección fue actualizado posteriormente. Consulta la hoja “Metodología” del Excel.
            </div>`;
    }

    async function refreshAnalytics() {
        const target = document.getElementById('admin-analytics-results');
        const status = document.getElementById('admin-analytics-status');
        const submit = document.getElementById('admin-analytics-apply');
        if (!target) return;
        if (submit) submit.disabled = true;
        if (status) status.textContent = 'Actualizando indicadores...';
        target.innerHTML = Components().renderLoadingBlock('Calculando analítica del periodo');
        try {
            const data = await API().getAdminAnalytics(analyticsFilters);
            target.innerHTML = renderAnalytics(data);
            if (status) status.textContent = 'Indicadores actualizados.';
        } catch (error) {
            target.innerHTML = `<div class="admin-error" role="alert">${esc(error.message || 'No fue posible calcular los indicadores.')}</div>`;
            if (status) status.textContent = '';
        } finally {
            if (submit) submit.disabled = false;
        }
    }

    async function downloadAnalytics(format, button) {
        const status = document.getElementById('admin-analytics-status');
        const original = button.textContent;
        button.disabled = true;
        button.textContent = 'Generando...';
        status.textContent = `Preparando archivo ${format === 'txt' ? 'de texto' : 'Excel'}...`;
        try {
            const result = await API().downloadAdminAnalytics(format, analyticsFilters);
            const url = URL.createObjectURL(result.blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = result.filename;
            anchor.hidden = true;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            status.textContent = `Descarga lista: ${result.filename}`;
        } catch (error) {
            status.textContent = error.message || 'No fue posible generar el archivo.';
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    }

    function bindConsoleEvents() {
        document.getElementById('admin-close-access')?.addEventListener('click', async function () {
            await API().closeAdminAccess().catch(function () {});
            Router().navigate('/', { replace: true });
        });
        document.getElementById('admin-analytics-form')?.addEventListener('submit', async function (event) {
            event.preventDefault();
            const desde = document.getElementById('admin-date-from')?.value || '';
            const hasta = document.getElementById('admin-date-to')?.value || '';
            const status = document.getElementById('admin-analytics-status');
            if (!desde || !hasta || desde > hasta) {
                status.textContent = 'Selecciona un periodo válido: la fecha inicial no puede ser posterior a la final.';
                return;
            }
            if (inclusivePeriodDays(desde, hasta) > 366) {
                status.textContent = 'El periodo máximo permitido es de 366 días. Reduce el intervalo e inténtalo de nuevo.';
                return;
            }
            analyticsFilters = { desde, hasta };
            await refreshAnalytics();
        });
        document.querySelectorAll('[data-admin-export]').forEach((button) => {
            button.addEventListener('click', () => downloadAnalytics(button.dataset.adminExport, button));
        });
        document.querySelectorAll('[data-admin-promo-retry]').forEach((button) => {
            button.addEventListener('click', async function () {
                const status = document.getElementById('admin-launch-promo-status');
                const original = button.textContent;
                button.disabled = true;
                button.textContent = 'Encolando...';
                if (status) status.textContent = '';
                try {
                    const result = await API().retryAdminLaunchPromotion(button.dataset.adminPromoRetry);
                    const message = result.dispatched
                        ? 'Reintento encolado. El estado se actualizará cuando responda Stripe.'
                        : 'El reintento quedó guardado para recuperación automática.';
                    await renderConsole();
                    const refreshedStatus = document.getElementById('admin-launch-promo-status');
                    if (refreshedStatus) refreshedStatus.textContent = message;
                } catch (error) {
                    button.disabled = false;
                    button.textContent = original;
                    if (status) status.textContent = error.message || 'No fue posible reintentar la operación.';
                }
            });
        });
    }

    async function renderConsole() {
        const app = document.getElementById('app');
        Components().renderNav();
        app.innerHTML = Components().renderLoadingBlock('Cargando control administrativo');
        Components().renderFooter();
        try {
            const data = await withAdminDeadline(
                API().getAdminConsole(),
                'No fue posible cargar la consola administrativa. Intenta verificar el acceso de nuevo.'
            );
            const users = data.usuarios || {};
            const finance = data.finanzas || {};
            const security = data.seguridad || {};
            const logs = Array.isArray(security.logs_recientes) ? security.logs_recientes.slice(0, 12) : [];
            const launchPromotion = data.promocion_lanzamiento || {};
            const promotionIncidents = Array.isArray(launchPromotion.incidents) ? launchPromotion.incidents : [];
            const promotionIncidentTable = table([
                { label: 'ID', key: 'id' },
                { label: 'Alumno', render: (row) => `<strong>${esc(row.user_name || ('#' + row.user_id))}</strong><br><span class="text-muted">${esc(row.user_email || '')}</span>` },
                { label: 'Operación', render: (row) => esc(row.operation === 'revoke' ? 'Revocar beneficio' : 'Aplicar beneficio') },
                { label: 'Intentos', render: (row) => esc(number(row.attempts, 0)) },
                { label: 'Último error', render: (row) => `<span class="admin-question-text" title="${esc(row.last_error || '')}">${esc(row.last_error || 'Sin detalle')}</span>` },
                { label: 'Actualizado', render: (row) => esc(row.updated_at || '') },
                { label: 'Acción', render: (row) => `<button class="btn btn--out btn--sm" type="button" data-admin-promo-retry="${esc(row.id)}">Reintentar</button>` },
            ], promotionIncidents, 'No hay fallos terminales en la promoción de lanzamiento.');
            app.innerHTML = `
                <main class="page-wrap admin-console">
                    <header class="admin-console__header">
                        <div>
                            <div class="section__label">Operación privada</div>
                            <h1>Centro administrativo</h1>
                            <p class="text-muted">Sesión elevada temporal. Las acciones y descargas quedan registradas en el servidor.</p>
                        </div>
                        <button type="button" class="btn btn--out" id="admin-close-access">Cerrar acceso admin</button>
                    </header>

                    <section class="admin-panel-card school-page" id="admin-school-board" aria-label="Tareas y revisión docente"></section>

                    <section class="admin-console__summary" aria-label="Resumen operativo">
                        ${metric('Usuarios', number(users.total, 0), `${number(users.activos, 0)} activos`)}
                        ${metric('Alumnos', number(users.alumnos, 0), `${number(users.registros_30d, 0)} registros en 30 días`)}
                        ${metric('Suscripciones', number(users.suscripciones_activas, 0), 'Acceso vigente')}
                        ${metric('Ingresos 30 días', `$${number(finance.ingresos_30d, 2)}`, 'MXN registrados')}
                        ${metric('Cuentas bloqueadas', number(users.bloqueados, 0), 'Acceso suspendido')}
                        ${metric('Alertas abiertas', number(security.ia_alertas_abiertas, 0), 'Revisión pendiente')}
                        ${metric('Incidentes promoción', number(launchPromotion.terminal_failure_count, 0), launchPromotion.attention_required ? 'Requiere intervención' : 'Operación normal', launchPromotion.attention_required ? 'red' : 'green')}
                    </section>

                    <section class="admin-panel-card ${launchPromotion.attention_required ? 'admin-panel-card--alert' : ''}">
                        <div class="admin-panel-card__heading">
                            <div>
                                <div class="section__label">Stripe · promoción de lanzamiento</div>
                                <h2>Operaciones que requieren atención</h2>
                                <p class="text-muted">${esc(number(launchPromotion.reserved_redemptions, 0))} de ${esc(number(launchPromotion.max_redemptions, 0))} lugares reservados. Los reintentos reutilizan los identificadores idempotentes originales.</p>
                            </div>
                            <span>${esc(number(launchPromotion.terminal_failure_count, 0))} incidentes</span>
                        </div>
                        <div id="admin-launch-promo-status" class="admin-status" role="status" aria-live="polite"></div>
                        ${promotionIncidentTable}
                    </section>

                    <section class="admin-analytics">
                        <div class="admin-analytics__heading">
                            <div>
                                <div class="section__label">Analítica y exportaciones</div>
                                <h2>Rendimiento académico y comercial</h2>
                                <p class="text-muted">Consulta un periodo y descarga una fotografía en Excel o texto cuando la necesites.</p>
                            </div>
                        </div>
                        <form id="admin-analytics-form" class="admin-analytics-toolbar">
                            <label><span>Desde</span><input class="fi" id="admin-date-from" type="date" value="${esc(analyticsFilters.desde)}" aria-describedby="admin-analytics-limit" required></label>
                            <label><span>Hasta</span><input class="fi" id="admin-date-to" type="date" value="${esc(analyticsFilters.hasta)}" aria-describedby="admin-analytics-limit" required></label>
                            <button class="btn btn--pri" id="admin-analytics-apply" type="submit">Aplicar periodo</button>
                            <button class="btn btn--out" type="button" data-admin-export="xlsx">Descargar Excel</button>
                            <button class="btn btn--out" type="button" data-admin-export="txt">Descargar texto</button>
                            <span class="admin-analytics-toolbar__hint" id="admin-analytics-limit">Intervalo máximo: 366 días.</span>
                        </form>
                        <div id="admin-analytics-status" class="admin-status" role="status" aria-live="polite"></div>
                        <div id="admin-analytics-results"></div>
                    </section>

                    <section class="admin-panel-card">
                        <div class="section__label">Seguridad</div>
                        <h2>Actividad reciente</h2>
                        ${table([
                            { label: 'Fecha', key: 'created_at' },
                            { label: 'Método', key: 'method' },
                            { label: 'Ruta', key: 'path' },
                            { label: 'Estado', key: 'status_code' },
                        ], logs, 'No hay actividad registrada.')}
                    </section>
                </main>`;
            bindConsoleEvents();
            window.EducatIA.Pages.SchoolAssignments.mountBoard(document.getElementById('admin-school-board'), true);
            await refreshAnalytics();
        } catch (error) {
            renderVerification(Router().getPath(), error.message);
        }
    }

    async function renderPrivateRoute() {
        const currentPath = Router().getPath();
        const user = API().getUser();
        if (!user || user.rol !== 'admin') {
            renderNotFound();
            return;
        }
        renderRouteLoading();
        try {
            const access = await withAdminDeadline(
                API().getAdminAccessStatus(),
                'No fue posible validar el acceso administrativo. Intenta verificar tu contraseña de nuevo.'
            );
            if (String(access.panel_path || '') !== currentPath) {
                renderNotFound();
                return;
            }
            await renderConsole();
        } catch (error) {
            try {
                renderVerification(currentPath, error?.message || 'No fue posible validar el acceso administrativo.');
            } catch (renderError) {
                console.error('No fue posible mostrar la verificación administrativa.', renderError);
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = `
                        <main class="page-wrap admin-gate">
                            <section class="card admin-gate__card">
                                <div class="section__label">Acceso administrativo</div>
                                <h1>No fue posible abrir la verificación</h1>
                                <p class="text-muted">Recarga la página para intentarlo nuevamente.</p>
                                <button class="btn btn--pri" type="button" onclick="window.location.reload()">Recargar</button>
                            </section>
                        </main>`;
                    app.style.opacity = '1';
                }
            }
        }
    }

    return { renderPrivateRoute };
})();
