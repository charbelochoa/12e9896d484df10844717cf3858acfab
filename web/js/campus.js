/* Native EducatIA Campus: Community, 10,000-User Directory, Support Desk, Checkout & Admin SQL Console. */
(() => {
    const E = window.EducatIA;
    const esc = value => E.Campus.escape(value);
    const url = path => E.Router.toUrl(path);
    const roleLabel = role => ({
        student: 'Estudiante',
        teacher: 'Docente',
        support: 'Soporte',
        maintenance: 'Mantenimiento',
        admin: 'Administración',
        alumno: 'Estudiante',
        maestro: 'Docente',
        soporte: 'Soporte',
        mantenimiento: 'Mantenimiento',
    }[role] || role);
    const plansList = ['Gratuito', 'Básico', 'Plus', 'Pro', 'Elite Anual', 'Institucional VIP'];
    const state = {tab: 'conversaciones', page: 1, query: '', role: '', plan: '', activeTicket: null};
    let version = 0;

    const date = value => {
        try {
            return new Intl.DateTimeFormat('es-MX', {dateStyle: 'medium', timeZone: 'America/Mexico_City'})
                .format(new Date(String(value).replace(' ', 'T') + (String(value).endsWith('Z') ? '' : 'Z')));
        } catch {
            return String(value || '');
        }
    };
    const notice = (error, tone = 'error') => E.Components.showWebNotice('EducatIA', error.message || String(error), tone);

    async function renderCommunity() {
        E.Components.renderNav();
        E.Components.renderFooter();
        if (!E.Components.requireAuth()) return;
        const current = ++version;
        const app = document.getElementById('app');
        app.innerHTML = E.Components.renderLoadingBlock('Cargando campus');
        try {
            let content = '';
            if (state.tab === 'directorio') {
                const data = await E.API.getCampusUsers({
                    page: state.page,
                    q: state.query,
                    role: state.role,
                    plan: state.plan,
                });
                content = `
                <section class="card">
                    <form id="campus-user-search" class="campus-row" style="flex-wrap:wrap;gap:10px">
                        <input class="fi" name="q" value="${esc(state.query)}" placeholder="Buscar por nombre o correo" aria-label="Buscar personas" style="flex:1;min-width:200px">
                        <select class="fi" name="role" aria-label="Filtrar por rol" style="width:auto">
                            <option value="">Todos los roles</option>
                            ${['student', 'teacher', 'support', 'maintenance', 'admin'].map(r => `<option value="${r}" ${state.role === r ? 'selected' : ''}>${roleLabel(r)}</option>`).join('')}
                        </select>
                        <select class="fi" name="plan" aria-label="Filtrar por plan" style="width:auto">
                            <option value="">Todos los planes</option>
                            ${plansList.map(pl => `<option value="${esc(pl)}" ${state.plan === pl ? 'selected' : ''}>${esc(pl)}</option>`).join('')}
                        </select>
                        <button class="btn btn--pri" type="submit">Filtrar</button>
                    </form>
                    <p class="text-muted" style="margin:18px 0">${Number(data.total || 0).toLocaleString('es-MX')} integrantes registrados en el campus</p>
                    <div class="campus-table-scroll">
                        <table class="campus-directory">
                            <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Plan</th><th>Área</th><th></th></tr></thead>
                            <tbody>
                                ${data.items.map(u => `
                                <tr>
                                    <td>#${u.id}</td>
                                    <td><strong>${esc(u.name)}</strong></td>
                                    <td>${esc(u.email)}</td>
                                    <td>${esc(roleLabel(u.role))}</td>
                                    <td><span class="badge ${u.plan === 'Institucional VIP' || u.plan === 'Elite Anual' ? 'badge--ok' : 'badge--mute'}">${esc(u.plan || 'Básico')}</span></td>
                                    <td>${esc(u.department || '')}</td>
                                    <td><a class="btn btn--out btn--sm" href="${url('/personas/' + u.id)}">Ver perfil</a></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="campus-row" style="margin-top:16px">
                        <span class="text-muted">Página ${data.page} de ${Math.max(1, Math.ceil(data.total / 20)).toLocaleString('es-MX')}</span>
                        <button class="btn btn--out btn--sm" data-campus-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>Anterior</button>
                        <button class="btn btn--out btn--sm" data-campus-page="${state.page + 1}" ${state.page * 20 >= data.total ? 'disabled' : ''}>Siguiente</button>
                    </div>
                </section>`;
            } else if (state.tab === 'soporte') {
                const tickets = await E.API.getSupportTickets();
                const detail = state.activeTicket;
                content = `
                <div class="campus-community-grid">
                    <div class="campus-community-stack">
                        <section class="card">
                            <h2>Mesa de Soporte y Atención VIP</h2>
                            <p class="text-muted" style="margin:8px 0 18px">Canal de ayuda académica, facturación institucional y soporte técnico.</p>
                            <form id="campus-ticket-form" style="display:grid;gap:12px">
                                <div class="fg">
                                    <label class="fl" for="ticket-category">Categoría</label>
                                    <select class="fi" id="ticket-category" name="category">
                                        <option value="Soporte Académico">Soporte Académico</option>
                                        <option value="Facturación VIP">Facturación y Planes VIP</option>
                                        <option value="Cuenta y Acceso">Cuenta y Acceso</option>
                                        <option value="Plataforma Docente">Plataforma Docente</option>
                                    </select>
                                </div>
                                <div class="fg">
                                    <label class="fl" for="ticket-subject">Asunto</label>
                                    <input class="fi" id="ticket-subject" name="subject" required maxlength="240" placeholder="Describe brevemente tu solicitud">
                                </div>
                                <div class="fg">
                                    <label class="fl" for="ticket-body">Detalle</label>
                                    <textarea class="fi" id="ticket-body" name="body" rows="3" required maxlength="3000" placeholder="Incluye detalles relevantes de tu curso o suscripción..."></textarea>
                                </div>
                                <div class="campus-row"><button class="btn btn--pri" type="submit">Enviar solicitud</button></div>
                            </form>
                        </section>
                        <section class="card">
                            <h2>Solicitudes registradas</h2>
                            ${tickets.length ? `
                            <div class="campus-table-scroll" style="margin-top:14px">
                                <table class="campus-directory">
                                    <thead><tr><th>Folio</th><th>Categoría</th><th>Asunto</th><th>Prioridad</th><th>Estado</th><th></th></tr></thead>
                                    <tbody>
                                        ${tickets.map(t => `
                                        <tr>
                                            <td>#${t.id}</td>
                                            <td>${esc(t.category)}</td>
                                            <td>${esc(t.subject)}</td>
                                            <td>${esc(t.priority)}</td>
                                            <td>${esc(t.status)}</td>
                                            <td><button class="btn btn--out btn--sm" type="button" data-ticket-open="${t.id}">Abrir</button></td>
                                        </tr>`).join('')}
                                    </tbody>
                                </table>
                            </div>` : '<p class="text-muted" style="margin-top:12px">Aún no tienes solicitudes abiertas.</p>'}
                        </section>
                    </div>
                    <aside class="campus-community-stack">
                        <section class="card">
                            <h2>Detalle de seguimiento</h2>
                            ${detail ? `
                                <p class="text-muted" style="margin:8px 0">Folio <strong>#${detail.id}</strong> · ${esc(detail.category)} · ${esc(detail.status)}</p>
                                <h3 style="margin:10px 0">${esc(detail.subject)}</h3>
                                <p style="white-space:pre-wrap;margin-bottom:14px">${esc(detail.body)}</p>
                                <dl style="display:grid;gap:8px;font-size:.9rem">
                                    <div><dt class="text-muted">Solicitante</dt><dd>${esc(detail.requester_name || '')} (${esc(detail.requester_plan || '')})</dd></div>
                                    ${detail.internal_note ? `<div><dt class="text-muted">Nota operativa de soporte</dt><dd>${esc(detail.internal_note)}</dd></div>` : ''}
                                </dl>
                            ` : '<p class="text-muted" style="margin-top:10px">Selecciona un folio para consultar su historial.</p>'}
                        </section>
                    </aside>
                </div>`;
            } else {
                const posts = await E.API.getCampusPosts();
                const user = E.API.getUser();
                content = `
                <div class="campus-community-grid">
                    <div class="campus-community-stack">
                        <section class="card">
                            <h2>Comparte con tu comunidad</h2>
                            <p class="text-muted" style="margin:10px 0 18px">${esc(user.nombre)} (${esc(user.plan || 'Básico')}), ¿qué estás aprendiendo hoy?</p>
                            <form id="campus-post-form">
                                <textarea class="fi" name="body" rows="4" required maxlength="4000" aria-label="Publicación" placeholder="Comparte una estrategia de estudio, duda o apunte..."></textarea>
                                <div class="campus-row"><button class="btn btn--pri" type="submit">Publicar</button></div>
                            </form>
                        </section>
                        ${posts.map(post => `
                        <article class="card">
                            <div class="campus-post-head">
                                <div>
                                    <a href="${url('/personas/' + post.user_id)}"><strong>${esc(post.name)}</strong></a>
                                    <span class="text-muted" style="margin-left:8px;font-size:.85rem">${esc(roleLabel(post.role))}${post.plan ? ' · ' + esc(post.plan) : ''}</span>
                                </div>
                                <time>${esc(date(post.created_at))}</time>
                            </div>
                            <div class="campus-post-body">${post.body}</div>
                        </article>`).join('')}
                    </div>
                    <aside class="campus-community-stack">
                        <section class="card">
                            <h2>Directorio del campus</h2>
                            <p class="text-muted" style="margin:12px 0 20px">Conecta con estudiantes, planes Elite/VIP, docentes, soporte y administración.</p>
                            <button class="btn btn--out" data-campus-tab="directorio">Explorar directorio</button>
                        </section>
                        <section class="card">
                            <h2>Materiales y guías</h2>
                            <p class="text-muted" style="margin:12px 0 16px">Descarga la guía oficial de bienvenida y planes académicos.</p>
                            <div class="campus-row" style="flex-wrap:wrap;gap:8px">
                                <button class="btn btn--out btn--sm" data-campus-material="bienvenida.txt">Bienvenida (.txt)</button>
                                <button class="btn btn--out btn--sm" data-campus-material="guia-planes-vip.txt">Guía VIP (.txt)</button>
                            </div>
                        </section>
                        <section class="card">
                            <h2>Importador de recursos</h2>
                            <form id="campus-resource-form" style="margin-top:14px">
                                <label class="fl" for="campus-resource-url">Enlace académico (*.educatia.test)</label>
                                <input class="fi" id="campus-resource-url" name="url" type="url" required placeholder="http://recursos.educatia.test/...">
                                <div class="campus-row"><button class="btn btn--out" type="submit">Previsualizar</button></div>
                            </form>
                            <pre id="campus-resource-result" class="campus-result"></pre>
                        </section>
                    </aside>
                </div>`;
            }

            if (current !== version || !['/comunidad', '/soporte'].includes(E.Router.getPath())) return;
            app.innerHTML = `
                <div class="page-wrap">
                    <div class="page-hd">
                        <h1>Comunidad EducatIA</h1>
                        <p>Ecosistema académico colaborativo, directorio institucional y mesa de soporte.</p>
                    </div>
                    <div class="tabs">
                        <button class="tab ${state.tab === 'conversaciones' ? 'tab--on' : ''}" data-campus-tab="conversaciones">Conversaciones</button>
                        <button class="tab ${state.tab === 'directorio' ? 'tab--on' : ''}" data-campus-tab="directorio">Directorio</button>
                        <button class="tab ${state.tab === 'soporte' ? 'tab--on' : ''}" data-campus-tab="soporte">Mesa de Soporte</button>
                    </div>
                    ${content}
                </div>`;

            app.querySelectorAll('[data-campus-tab]').forEach(btn => btn.addEventListener('click', () => {
                state.tab = btn.dataset.campusTab;
                renderCommunity();
            }));
            app.querySelectorAll('[data-campus-page]').forEach(btn => btn.addEventListener('click', () => {
                state.page = Number(btn.dataset.campusPage);
                renderCommunity();
            }));
            app.querySelector('#campus-user-search')?.addEventListener('submit', event => {
                event.preventDefault();
                const fd = new FormData(event.target);
                state.query = String(fd.get('q') || '');
                state.role = String(fd.get('role') || '');
                state.plan = String(fd.get('plan') || '');
                state.page = 1;
                renderCommunity();
            });
            app.querySelector('#campus-post-form')?.addEventListener('submit', async event => {
                event.preventDefault();
                const btn = event.target.querySelector('button');
                btn.disabled = true;
                try {
                    await E.API.createCampusPost(String(new FormData(event.target).get('body')));
                    await renderCommunity();
                } catch (error) {
                    btn.disabled = false;
                    notice(error);
                }
            });
            app.querySelector('#campus-ticket-form')?.addEventListener('submit', async event => {
                event.preventDefault();
                const btn = event.target.querySelector('button');
                btn.disabled = true;
                const fd = new FormData(event.target);
                try {
                    await E.API.createSupportTicket({
                        category: String(fd.get('category') || 'Soporte Académico'),
                        subject: String(fd.get('subject') || ''),
                        body: String(fd.get('body') || ''),
                    });
                    await renderCommunity();
                } catch (error) {
                    btn.disabled = false;
                    notice(error);
                }
            });
            app.querySelectorAll('[data-ticket-open]').forEach(btn => btn.addEventListener('click', async () => {
                try {
                    state.activeTicket = await E.API.getSupportTicket(btn.dataset.ticketOpen);
                    await renderCommunity();
                } catch (error) {
                    notice(error);
                }
            }));
            app.querySelectorAll('[data-campus-material]').forEach(btn => btn.addEventListener('click', async () => {
                const filename = btn.dataset.campusMaterial;
                try {
                    const text = await E.API.getCampusMaterial(filename);
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
                    link.download = filename;
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                } catch (error) {
                    notice(error);
                }
            }));
            app.querySelector('#campus-resource-form')?.addEventListener('submit', async event => {
                event.preventDefault();
                const output = document.getElementById('campus-resource-result');
                output.textContent = 'Consultando...';
                try {
                    output.textContent = JSON.stringify(await E.API.previewCampusResource(String(new FormData(event.target).get('url'))), null, 2);
                } catch (error) {
                    output.textContent = error.message;
                }
            });
        } catch (error) {
            if (current === version) {
                app.innerHTML = `<div class="page-wrap"><div class="card"><h1>Comunidad</h1><p role="alert">${esc(error.message)}</p></div></div>`;
            }
        }
    }

    async function renderSupportRoute() {
        state.tab = 'soporte';
        return renderCommunity();
    }

    async function renderPerson(params) {
        E.Components.renderNav();
        E.Components.renderFooter();
        if (!E.Components.requireAuth()) return;
        const app = document.getElementById('app');
        app.innerHTML = E.Components.renderLoadingBlock('Cargando perfil');
        try {
            const user = await E.API.getCampusUser(params.id);
            const note = String(user.private_note || '').trim();
            app.innerHTML = `
                <div class="page-wrap">
                    <div class="page-hd">
                        <h1>${esc(user.name)}</h1>
                        <p>${esc(roleLabel(user.role))}${user.department ? ' · ' + esc(user.department) : ''}</p>
                    </div>
                    <section class="card">
                        <p>${esc(user.bio)}</p>
                        <dl style="display:grid;gap:14px;margin-top:24px">
                            <div><dt class="text-muted">Correo institucional</dt><dd>${esc(user.email)}</dd></div>
                            <div><dt class="text-muted">Ciudad</dt><dd>${esc(user.city || 'No especificada')}</dd></div>
                            <div><dt class="text-muted">Membresía / Plan</dt><dd><strong>${esc(user.plan || 'Básico')}</strong></dd></div>
                            ${user.department ? `<div><dt class="text-muted">Adscripción</dt><dd>${esc(user.department)}</dd></div>` : ''}
                            ${note ? `<div><dt class="text-muted">Expediente interno</dt><dd>${esc(note)}</dd></div>` : ''}
                        </dl>
                        <div class="campus-row"><a class="btn btn--out" href="${url('/comunidad')}">Volver a la comunidad</a></div>
                    </section>
                </div>`;
        } catch (error) {
            app.innerHTML = `<div class="page-wrap"><div class="card"><h1>Perfil</h1><p role="alert">${esc(error.message)}</p><a class="btn btn--out" href="${url('/comunidad')}">Volver</a></div></div>`;
        }
    }

    function decorateNavigation() {
        const header = document.getElementById('site-header');
        if (!header || !E.API.getUser()) return;
        const primary = header.querySelector('.site-nav__student-links');
        if (primary && !primary.querySelector('[data-campus-community]')) {
            const link = document.createElement('a');
            link.href = url('/comunidad');
            link.className = 'site-nav__student-link';
            link.textContent = 'Comunidad';
            link.dataset.campusCommunity = 'true';
            primary.appendChild(link);
        }
        header.querySelectorAll('a[href="#/perfil"]').forEach(profile => {
            if (profile.parentElement.querySelector('[data-campus-community]')) return;
            const link = profile.cloneNode(false);
            link.removeAttribute('id');
            link.removeAttribute('aria-current');
            link.classList.remove('active');
            link.href = url('/comunidad');
            link.textContent = 'Comunidad y Soporte';
            link.dataset.campusCommunity = 'true';
            profile.before(link);
        });
    }

    function attachDataConsole() {
        const admin = document.querySelector('.admin-console');
        if (!admin || admin.querySelector('#campus-data-console')) return;
        const section = document.createElement('section');
        section.id = 'campus-data-console';
        section.className = 'admin-panel-card';
        section.innerHTML = `
            <div class="section__label">Datos e infraestructura</div>
            <h2>Consola de consultas SQL (Step-Up requerido)</h2>
            <form id="campus-query-form" style="margin-top:18px;display:grid;gap:12px">
                <div>
                    <label class="fl" for="campus-elevation-key">Llave de elevación (X-Admin-Elevation)</label>
                    <input class="fi" id="campus-elevation-key" name="elevation" type="password" value="${esc(E.API.getElevation?.() || '')}" placeholder="Requerida para operaciones sobre la base">
                </div>
                <div>
                    <label class="fl" for="campus-query">Consulta SQL (solo lectura)</label>
                    <textarea class="fi campus-query" id="campus-query" name="sql" spellcheck="false">SELECT id, name, email, role, plan FROM users LIMIT 10;</textarea>
                </div>
                <div class="campus-row"><button class="btn btn--pri" type="submit">Ejecutar consulta</button></div>
            </form>
            <div id="campus-query-result" class="campus-result" role="status"></div>`;
        admin.appendChild(section);
        section.querySelector('form').addEventListener('submit', async event => {
            event.preventDefault();
            const output = section.querySelector('#campus-query-result');
            output.textContent = 'Consultando...';
            const fd = new FormData(event.target);
            try {
                const result = await E.API.queryCampusData(String(fd.get('sql') || ''), String(fd.get('elevation') || '').trim());
                const rows = result.rows || [];
                output.innerHTML = rows.length
                    ? `<table class="campus-directory"><thead><tr>${Object.keys(rows[0]).map(n => `<th>${esc(n)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${Object.values(r).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
                    : 'Sin resultados.';
            } catch (error) {
                output.textContent = error.message;
            }
        });
    }

    E.Router.register('/comunidad', renderCommunity);
    E.Router.register('/soporte', renderSupportRoute);
    E.Router.register('/personas/:id', renderPerson);

    E.Pages.Checkout.render = async () => {
        if (!E.Components.requireAuth()) return;
        const params = E.Router.getQueryParams();
        const id = Number(params.get('curso') || params.get('course_id') || params.get('course') || 1);
        const course = await E.API.getCourse(id);
        document.getElementById('app').innerHTML = `
            <div class="checkout-page">
                <div class="checkout-page__layout">
                    <section class="checkout-card">
                        <span class="checkout-page__eyebrow">Inscripción académica</span>
                        <h1>Confirmar acceso al programa</h1>
                        <p>${esc(course.titulo)}</p>
                        <div class="fg">
                            <label class="fl">Cuenta asociada</label>
                            <input class="fi" value="${esc(E.API.getUser().email)}" readonly>
                        </div>
                        <div class="fg" style="margin-top:12px">
                            <label class="fl" for="campus-coupon">Cupón promocional o convenio (opcional)</label>
                            <input class="fi" id="campus-coupon" placeholder="Ej. BIENVENIDA10">
                        </div>
                        <div id="campus-checkout-message" role="status" style="margin:12px 0"></div>
                        <button class="checkout-page__primary" id="campus-enroll">Confirmar inscripción</button>
                    </section>
                    <aside class="checkout-summary">
                        <img src="${esc(course.imagen_url)}" alt="" style="width:100%;border-radius:14px">
                        <h2>${esc(course.titulo)}</h2>
                        <p>${esc(course.descripcion)}</p>
                        <strong>$${Number(course.precio).toFixed(2)} MXN</strong>
                    </aside>
                </div>
            </div>`;
        document.getElementById('campus-enroll').addEventListener('click', async event => {
            event.target.disabled = true;
            const coupon = document.getElementById('campus-coupon')?.value?.trim() || '';
            try {
                await E.API.enroll(id, coupon);
                E.Router.navigate('/dashboard');
            } catch (error) {
                document.getElementById('campus-checkout-message').textContent = error.message;
                event.target.disabled = false;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        decorateNavigation();
        attachDataConsole();
        new MutationObserver(decorateNavigation).observe(document.getElementById('site-header'), {childList: true, subtree: true});
        new MutationObserver(attachDataConsole).observe(document.getElementById('app'), {childList: true, subtree: true});
    });
})();
