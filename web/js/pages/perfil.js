/* ================================================================
   educatIA — Perfil (v3)
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Perfil = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;

    const VISIBILITY_OPTIONS = [
        { value: 'privado', label: 'Privado' },
        { value: 'publico', label: 'Público' }
    ];

    let draft = null;
    let profileMessage = null;
    let promoMessage = null;
    let promoCodeValue = '';
    let promoSubmitting = false;

    function normalizeTagList(values) {
        return Array.isArray(values)
            ? values.map((item) => String(item || '').trim()).filter(Boolean)
            : [];
    }

    function normalizeCollection(items, mapper) {
        return Array.isArray(items) ? items.map(mapper) : [];
    }

    function normalizeUser(user) {
        return {
            id: user.id,
            nombre: user.nombre || '',
            email: user.email || '',
            rol: user.rol || '',
            aprobado: Boolean(user.aprobado),
            avatar_url: user.avatar_url || '',
            oauth_provider: user.oauth_provider || '',
            suscripcion_hasta: user.suscripcion_hasta || null,
            perfil_titulo: user.perfil_titulo || '',
            perfil_visibilidad: user.perfil_visibilidad === 'publico' ? 'publico' : 'privado',
            perfil_rol_deseado: user.perfil_rol_deseado || '',
            perfil_resumen: user.perfil_resumen || '',
            perfil_habilidades: normalizeTagList(user.perfil_habilidades),
            perfil_enlaces: normalizeCollection(user.perfil_enlaces, (item) => ({
                titulo: item?.titulo || '',
                url: item?.url || ''
            })),
            perfil_proyectos: normalizeCollection(user.perfil_proyectos, (item) => ({
                titulo: item?.titulo || '',
                descripcion: item?.descripcion || '',
                enlace: item?.enlace || '',
                etiquetas: normalizeTagList(item?.etiquetas)
            })),
            perfil_experiencia: normalizeCollection(user.perfil_experiencia, (item) => ({
                organizacion: item?.organizacion || '',
                rol: item?.rol || '',
                periodo: item?.periodo || '',
                descripcion: item?.descripcion || ''
            })),
            perfil_educacion: normalizeCollection(user.perfil_educacion, (item) => ({
                institucion: item?.institucion || '',
                credencial: item?.credencial || '',
                nivel: item?.nivel || '',
                periodo: item?.periodo || ''
            })),
            perfil_cursos: normalizeCollection(user.perfil_cursos, (item) => ({
                proveedor: item?.proveedor || '',
                nombre: item?.nombre || '',
                areas: normalizeTagList(item?.areas),
                estado: item?.estado || '',
                tipo: item?.tipo || ''
            }))
        };
    }

    function renderAvatarBlock(user) {
        if (C().renderUserAvatar) {
            return C().renderUserAvatar('profile-hero__avatar', {
                name: user.nombre,
                avatar_url: user.avatar_url || ''
            });
        }
        return `<div class="profile-hero__avatar">${esc(user.nombre).charAt(0).toUpperCase() || 'U'}</div>`;
    }

    function formatRole(role) {
        if (role === 'alumno') return 'Alumno';
        if (role === 'maestro') return 'Docente';
        if (role === 'admin') return 'Administrador';
        return role || 'Usuario';
    }

    function isApprovedTeacher() {
        return draft?.rol === 'maestro' && Boolean(draft?.aprobado);
    }

    function isStudentAccount() {
        return draft?.rol === 'alumno';
    }

    function hasActivePremium() {
        if (isApprovedTeacher()) {
            return true;
        }
        if (!draft?.suscripcion_hasta) {
            return false;
        }
        const subscriptionDate = new Date(draft.suscripcion_hasta);
        return !Number.isNaN(subscriptionDate.getTime()) && subscriptionDate.getTime() > Date.now();
    }

    function formatSubscriptionDate(value) {
        if (!value) {
            return 'Sin suscripción activa';
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return 'Fecha no disponible';
        }
        return parsed.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    function formatVisibility(value) {
        const option = VISIBILITY_OPTIONS.find((item) => item.value === value);
        return option ? option.label : 'Privado';
    }

    function getStats() {
        return [
            { value: draft.perfil_habilidades.length, label: 'Fortalezas registradas' },
            { value: draft.perfil_proyectos.length, label: 'Evidencias de aprendizaje' },
            { value: draft.perfil_cursos.length + draft.perfil_educacion.length, label: 'Cursos y estudios' }
        ];
    }

    function renderInlineMessage(message) {
        if (!message) return '';
        return `<div class="smsg smsg--${message.type === 'ok' ? 'ok' : 'err'}">${esc(message.text)}</div>`;
    }

    function renderBadges() {
        const labels = [
            formatRole(draft.rol),
            draft.oauth_provider ? `Acceso con ${draft.oauth_provider}` : 'Acceso con correo',
            formatVisibility(draft.perfil_visibilidad),
            draft.perfil_rol_deseado || 'Sin meta de ingreso registrada'
        ];

        if (isApprovedTeacher()) {
            labels.push('Docente aprobado');
        } else if (isStudentAccount()) {
            labels.push(hasActivePremium() ? 'Premium activo' : 'Premium inactivo');
        }

        return labels.map((label) => `<span class="profile-badge">${esc(label)}</span>`).join('');
    }

    function renderPremiumPanel() {
        if (isApprovedTeacher()) {
            return `
                <section class="profile-card">
                    <div class="profile-card__header">
                        <div>
                            <h2>Acceso premium</h2>
                            <p class="profile-card__subtle">Tu cuenta docente aprobada ya está excluida del pago premium y no necesita códigos promocionales.</p>
                        </div>
                    </div>
                    <div class="smsg smsg--ok">Ya puedes usar las funciones premium disponibles para docentes aprobados.</div>
                </section>`;
        }

        if (!isStudentAccount()) {
            return '';
        }

        const premiumLabel = hasActivePremium() ? 'Suscripción activa' : 'Sin suscripción activa';
        const premiumMessage = hasActivePremium()
            ? `Tu acceso premium está activo hasta ${formatSubscriptionDate(draft.suscripcion_hasta)}.`
            : 'Ingresa un código promocional válido para activar o extender tu acceso premium.';

        return `
            <section class="profile-card">
                <div class="profile-card__header">
                    <div>
                        <h2>Acceso premium</h2>
                        <p class="profile-card__subtle">Canjea aquí tu código promocional de acceso.</p>
                    </div>
                </div>
                <div class="profile-editor-grid profile-editor-grid--2">
                    <div class="fg">
                        <label class="fl">Estado actual</label>
                        <input class="fi" type="text" value="${esc(premiumLabel)}" disabled>
                        <div class="fh">${esc(premiumMessage)}</div>
                    </div>
                    <div class="fg">
                        <label class="fl">Vigencia</label>
                        <input class="fi" type="text" value="${esc(formatSubscriptionDate(draft.suscripcion_hasta))}" disabled>
                        <div class="fh">Si ya tienes premium, el código suma tiempo adicional al vencimiento actual.</div>
                    </div>
                </div>
                <form id="promo-code-form">
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Código promocional</label>
                            <input class="fi" type="text" name="promo_code" value="${esc(promoCodeValue)}" maxlength="32" placeholder="Ej. EDUC-370CA9E0" autocomplete="off" ${promoSubmitting ? 'disabled' : ''}>
                        </div>
                        <div class="profile-savebar profile-savebar--start">
                            <button class="btn btn--pri" type="submit" ${promoSubmitting ? 'disabled' : ''}>${promoSubmitting ? 'Canjeando...' : 'Validar código'}</button>
                        </div>
                    </div>
                    <div id="promo-msg" class="profile-inline-message">${renderInlineMessage(promoMessage)}</div>
                </form>
            </section>`;
    }

    function renderSkillChips() {
        if (!draft.perfil_habilidades.length) {
            return '<p class="profile-card__muted">Agrega las materias o habilidades académicas que consideras fortalezas.</p>';
        }

        return `
        <div class="profile-chip-list">
            ${draft.perfil_habilidades.map((skill, index) => `
                <span class="profile-chip" data-skill-chip="${index}">
                    ${esc(skill)}
                    <button type="button" class="profile-chip__remove" data-remove-skill="${index}" aria-label="Eliminar habilidad">×</button>
                </span>
            `).join('')}
        </div>`;
    }

    function renderLinks() {
        return `
        <div class="profile-repeater">
            ${draft.perfil_enlaces.length ? draft.perfil_enlaces.map((item, index) => `
                <div class="profile-repeater__item" data-collection="perfil_enlaces" data-index="${index}">
                    <div class="profile-repeater__toolbar">
                        <strong>Enlace ${index + 1}</strong>
                        <button type="button" class="btn btn--ghost btn--sm" data-remove-collection="perfil_enlaces" data-index="${index}">Eliminar</button>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Etiqueta</label>
                            <input class="fi" type="text" data-field="titulo" value="${esc(item.titulo)}" placeholder="LinkedIn, GitHub, portafolio...">
                        </div>
                        <div class="fg">
                            <label class="fl">URL</label>
                            <input class="fi" type="url" data-field="url" value="${esc(item.url)}" placeholder="https://...">
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="profile-card__muted">Todavía no agregas enlaces de referencia.</p>'}
        </div>
        <button type="button" class="btn btn--out btn--sm" data-add-collection="perfil_enlaces">Agregar enlace</button>`;
    }

    function renderProjects() {
        return `
        <div class="profile-repeater">
            ${draft.perfil_proyectos.length ? draft.perfil_proyectos.map((item, index) => `
                <div class="profile-repeater__item" data-collection="perfil_proyectos" data-index="${index}">
                    <div class="profile-repeater__toolbar">
                        <strong>Proyecto ${index + 1}</strong>
                        <button type="button" class="btn btn--ghost btn--sm" data-remove-collection="perfil_proyectos" data-index="${index}">Eliminar</button>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Título</label>
                            <input class="fi" type="text" data-field="titulo" value="${esc(item.titulo)}" placeholder="Reforzar álgebra esta semana">
                        </div>
                        <div class="fg">
                            <label class="fl">Enlace</label>
                            <input class="fi" type="url" data-field="enlace" value="${esc(item.enlace)}" placeholder="https://...">
                        </div>
                    </div>
                    <div class="fg">
                        <label class="fl">Descripción</label>
                        <textarea class="fi" rows="4" data-field="descripcion" placeholder="Qué aprendiste, qué dificultad resolviste y qué evidencia obtuviste.">${esc(item.descripcion)}</textarea>
                    </div>
                    <div class="fg">
                        <label class="fl">Etiquetas</label>
                        <input class="fi" type="text" data-field="etiquetas" value="${esc(item.etiquetas.join(', '))}" placeholder="FastAPI, SQL, NLP">
                    </div>
                </div>
            `).join('') : '<p class="profile-card__muted">Destaca proyectos, retos, laboratorios o entregables importantes.</p>'}
        </div>
        <button type="button" class="btn btn--out btn--sm" data-add-collection="perfil_proyectos">Agregar proyecto</button>`;
    }

    function renderExperience() {
        return `
        <div class="profile-repeater">
            ${draft.perfil_experiencia.length ? draft.perfil_experiencia.map((item, index) => `
                <div class="profile-repeater__item" data-collection="perfil_experiencia" data-index="${index}">
                    <div class="profile-repeater__toolbar">
                        <strong>Experiencia ${index + 1}</strong>
                        <button type="button" class="btn btn--ghost btn--sm" data-remove-collection="perfil_experiencia" data-index="${index}">Eliminar</button>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Organización</label>
                            <input class="fi" type="text" data-field="organizacion" value="${esc(item.organizacion)}" placeholder="EducatIA, laboratorio, empresa...">
                        </div>
                        <div class="fg">
                            <label class="fl">Rol</label>
                            <input class="fi" type="text" data-field="rol" value="${esc(item.rol)}" placeholder="Desarrollador, analista, mentor...">
                        </div>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Periodo</label>
                            <input class="fi" type="text" data-field="periodo" value="${esc(item.periodo)}" placeholder="2024 - Actualidad">
                        </div>
                        <div class="fg">
                            <label class="fl">Resumen</label>
                            <textarea class="fi" rows="3" data-field="descripcion" placeholder="Responsabilidades, entregables o impacto.">${esc(item.descripcion)}</textarea>
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="profile-card__muted">Puedes registrar tutorías, concursos, voluntariado o actividades académicas relevantes.</p>'}
        </div>
        <button type="button" class="btn btn--out btn--sm" data-add-collection="perfil_experiencia">Agregar experiencia</button>`;
    }

    function renderEducation() {
        return `
        <div class="profile-repeater">
            ${draft.perfil_educacion.length ? draft.perfil_educacion.map((item, index) => `
                <div class="profile-repeater__item" data-collection="perfil_educacion" data-index="${index}">
                    <div class="profile-repeater__toolbar">
                        <strong>Formación ${index + 1}</strong>
                        <button type="button" class="btn btn--ghost btn--sm" data-remove-collection="perfil_educacion" data-index="${index}">Eliminar</button>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Institución</label>
                            <input class="fi" type="text" data-field="institucion" value="${esc(item.institucion)}" placeholder="Coursera, Google, OpenAI...">
                        </div>
                        <div class="fg">
                            <label class="fl">Credencial</label>
                            <input class="fi" type="text" data-field="credencial" value="${esc(item.credencial)}" placeholder="Licenciatura, diploma, certificación...">
                        </div>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Nivel</label>
                            <input class="fi" type="text" data-field="nivel" value="${esc(item.nivel)}" placeholder="Superior, especialidad, curso corto...">
                        </div>
                        <div class="fg">
                            <label class="fl">Periodo</label>
                            <input class="fi" type="text" data-field="periodo" value="${esc(item.periodo)}" placeholder="2022 - 2025">
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="profile-card__muted">Ordena tu formación académica y credenciales verificables.</p>'}
        </div>
        <button type="button" class="btn btn--out btn--sm" data-add-collection="perfil_educacion">Agregar formación</button>`;
    }

    function renderCourses() {
        return `
        <div class="profile-repeater">
            ${draft.perfil_cursos.length ? draft.perfil_cursos.map((item, index) => `
                <div class="profile-repeater__item" data-collection="perfil_cursos" data-index="${index}">
                    <div class="profile-repeater__toolbar">
                        <strong>Curso ${index + 1}</strong>
                        <button type="button" class="btn btn--ghost btn--sm" data-remove-collection="perfil_cursos" data-index="${index}">Eliminar</button>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Proveedor</label>
                            <input class="fi" type="text" data-field="proveedor" value="${esc(item.proveedor)}" placeholder="EducatIA, escuela o institución">
                        </div>
                        <div class="fg">
                            <label class="fl">Curso</label>
                            <input class="fi" type="text" data-field="nombre" value="${esc(item.nombre)}" placeholder="Biología, Pensamiento matemático...">
                        </div>
                    </div>
                    <div class="profile-editor-grid profile-editor-grid--2">
                        <div class="fg">
                            <label class="fl">Áreas</label>
                            <input class="fi" type="text" data-field="areas" value="${esc(item.areas.join(', '))}" placeholder="Salud, Matemáticas, Comprensión lectora">
                        </div>
                        <div class="fg">
                            <label class="fl">Estado</label>
                            <input class="fi" type="text" data-field="estado" value="${esc(item.estado)}" placeholder="En curso, finalizado, certificado">
                        </div>
                    </div>
                    <div class="fg">
                        <label class="fl">Tipo</label>
                        <input class="fi" type="text" data-field="tipo" value="${esc(item.tipo)}" placeholder="Curso, taller, preparación o certificación">
                    </div>
                </div>
            `).join('') : '<p class="profile-card__muted">Registra cursos y rutas de preparación que apoyen tu objetivo de ingreso.</p>'}
        </div>
        <button type="button" class="btn btn--out btn--sm" data-add-collection="perfil_cursos">Agregar curso</button>`;
    }

    function draw() {
        const app = document.getElementById('app');
        const stats = getStats();

        app.innerHTML = `
        <div class="profile-page">
            <div class="profile-page__inner">
                <section class="profile-hero">
                    <div>
                        <div class="profile-hero__identity">
                            ${renderAvatarBlock(draft)}
                            <div>
                                <div class="profile-hero__eyebrow">Mi perfil</div>
                                <h1>${esc(draft.nombre || 'Completa tu perfil')}</h1>
                                <p>${esc(draft.perfil_titulo || 'Organiza tu objetivo académico, fortalezas y preparación para el examen de admisión.')}</p>
                                <div class="profile-inline-meta">${renderBadges()}</div>
                                <div class="profile-hero__actions">
                                    <button class="btn btn--pri" type="submit" form="profile-editor-form">Guardar perfil</button>
                                    ${isStudentAccount() ? '' : '<button class="btn btn--out" type="button" id="share-profile">Compartir perfil</button>'}
                                </div>
                                <div id="profile-msg" class="profile-inline-message">${renderInlineMessage(profileMessage)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="profile-hero__stats">
                        ${stats.map((item) => `
                            <div class="profile-stat">
                                <strong>${esc(item.value)}</strong>
                                <span>${esc(item.label)}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <nav class="account-shortcuts account-shortcuts--profile" aria-label="Apartados de la cuenta">
                    <a class="is-current" href="#/perfil"><span>${window.EducatIA.Icons.user}</span><strong>Mi perfil</strong><small>Información académica y personal</small></a>
                    <a href="#/compras"><span>${window.EducatIA.Icons.grid}</span><strong>Mis compras</strong><small>Plan, pagos y facturación</small></a>
                    <a href="#/configuracion"><span>${window.EducatIA.Icons.settings}</span><strong>Configuración de mi cuenta</strong><small>Seguridad, sesiones y accesibilidad</small></a>
                    <a href="#/certificados"><span>${window.EducatIA.Icons.award}</span><strong>Mis certificados</strong><small>Documentos oficiales verificables</small></a>
                </nav>

                <form id="profile-editor-form">
                    <div class="profile-grid">
                        <div class="profile-stack">
                            <section class="profile-card">
                                <div class="profile-card__header">
                                    <div>
                                        <h2>Información personal</h2>
                                        <p class="profile-card__subtle">Define tu objetivo de ingreso y la preparación que quieres construir.</p>
                                    </div>
                                </div>
                                <div class="profile-editor-grid profile-editor-grid--2">
                                    <div class="fg">
                                        <label class="fl">Nombre completo</label>
                                        <input class="fi" type="text" name="nombre" value="${esc(draft.nombre)}" required>
                                    </div>
                                    <div class="fg">
                                        <label class="fl">Correo electrónico</label>
                                        <input class="fi" type="email" value="${esc(draft.email)}" disabled>
                                        <div class="fh">Se mantiene sincronizado con tu cuenta.</div>
                                    </div>
                                </div>
                                <div class="profile-editor-grid profile-editor-grid--2">
                                    <div class="fg">
                                        <label class="fl">Objetivo académico</label>
                                        <input class="fi" type="text" name="perfil_titulo" value="${esc(draft.perfil_titulo)}" placeholder="Ej. Aspirante a Medicina con enfoque en Biología">
                                    </div>
                                    <div class="fg">
                                        <label class="fl">Meta de ingreso</label>
                                        <input class="fi" type="text" name="perfil_rol_deseado" value="${esc(draft.perfil_rol_deseado)}" placeholder="Ej. Ingresar a Médico Cirujano">
                                    </div>
                                </div>
                                <div class="profile-editor-grid profile-editor-grid--2">
                                    <div class="fg">
                                        <label class="fl">Rol actual</label>
                                        <input class="fi" type="text" value="${esc(formatRole(draft.rol))}" disabled>
                                    </div>
                                    <div class="fg">
                                        <label class="fl">Visibilidad</label>
                                        <select class="fi" name="perfil_visibilidad">
                                            ${VISIBILITY_OPTIONS.map((option) => `<option value="${esc(option.value)}" ${draft.perfil_visibilidad === option.value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="fg">
                                    <label class="fl">Resumen</label>
                                    <textarea class="fi" name="perfil_resumen" rows="5" placeholder="Describe tu meta, las materias que estás reforzando y el tiempo que dedicarás al estudio.">${esc(draft.perfil_resumen)}</textarea>
                                </div>
                            </section>

                            <section class="profile-card">
                                <div class="profile-card__header">
                                    <div>
                                        <h2>Fortalezas y recursos</h2>
                                        <p class="profile-card__subtle">Registra materias dominadas y enlaces académicos que apoyan tu preparación.</p>
                                    </div>
                                </div>
                                ${renderSkillChips()}
                                <div class="profile-skill-adder">
                                    <input class="fi" type="text" id="profile-skill-input" placeholder="Agregar habilidad clave">
                                    <button type="button" class="btn btn--out" id="add-skill">Agregar</button>
                                </div>
                                <div class="profile-divider"></div>
                                ${renderLinks()}
                            </section>
                        </div>

                        <div class="profile-stack">
                            <section class="profile-card">
                                <div class="profile-card__header">
                                    <div>
                                        <h2>Evidencias y actividades</h2>
                                        <p class="profile-card__subtle">Concentra proyectos escolares, retos, concursos o experiencias de aprendizaje.</p>
                                    </div>
                                </div>
                                ${renderProjects()}
                                <div class="profile-divider"></div>
                                ${renderExperience()}
                            </section>

                            <section class="profile-card">
                                <div class="profile-card__header">
                                    <div>
                                        <h2>Educación y cursos</h2>
                                        <p class="profile-card__subtle">Concentra tus estudios, cursos y preparación complementaria.</p>
                                    </div>
                                </div>
                                ${renderEducation()}
                                <div class="profile-divider"></div>
                                ${renderCourses()}
                            </section>
                        </div>
                    </div>

                    <div class="profile-savebar">
                        <button class="btn btn--pri" type="submit">Guardar cambios</button>
                    </div>
                </form>

                <section class="profile-card">
                    <div class="profile-card__header">
                        <div>
                            <h2>Seguridad</h2>
                            <p class="profile-card__subtle">Mantén actualizada tu contraseña si no inicias sesión con un proveedor externo.</p>
                        </div>
                    </div>
                    <form id="password-form">
                        <div class="profile-editor-grid profile-editor-grid--2">
                            <div class="fg">
                                <label class="fl">Contraseña actual</label>
                                <input class="fi" type="password" name="current_password" required autocomplete="current-password">
                            </div>
                            <div class="fg">
                                <label class="fl">Nueva contraseña</label>
                                <input class="fi" type="password" name="new_password" required minlength="15" autocomplete="new-password">
                                <div class="fh">Mínimo 15 caracteres.</div>
                            </div>
                        </div>
                        <div class="profile-savebar profile-savebar--start">
                            <button class="btn btn--out" type="submit">Cambiar contraseña</button>
                        </div>
                        <div id="pw-msg"></div>
                    </form>
                </section>

                ${renderPremiumPanel()}
            </div>
        </div>`;

        bindEvents();
    }

    function splitTags(value) {
        return String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function readCollection(collection, reader) {
        return Array.from(document.querySelectorAll(`.profile-repeater__item[data-collection="${collection}"]`))
            .map(reader)
            .filter((item) => Object.values(item).some((value) => Array.isArray(value) ? value.length : value));
    }

    function syncDraftFromDom() {
        const form = document.getElementById('profile-editor-form');
        if (!form || !draft) return;

        draft.nombre = (form.nombre.value || '').trim();
        draft.perfil_titulo = (form.perfil_titulo.value || '').trim();
        draft.perfil_visibilidad = form.perfil_visibilidad.value || 'privado';
        draft.perfil_rol_deseado = (form.perfil_rol_deseado.value || '').trim();
        draft.perfil_resumen = (form.perfil_resumen.value || '').trim();

        draft.perfil_enlaces = readCollection('perfil_enlaces', (node) => ({
            titulo: (node.querySelector('[data-field="titulo"]')?.value || '').trim(),
            url: (node.querySelector('[data-field="url"]')?.value || '').trim()
        }));
        draft.perfil_proyectos = readCollection('perfil_proyectos', (node) => ({
            titulo: (node.querySelector('[data-field="titulo"]')?.value || '').trim(),
            descripcion: (node.querySelector('[data-field="descripcion"]')?.value || '').trim(),
            enlace: (node.querySelector('[data-field="enlace"]')?.value || '').trim(),
            etiquetas: splitTags(node.querySelector('[data-field="etiquetas"]')?.value || '')
        }));
        draft.perfil_experiencia = readCollection('perfil_experiencia', (node) => ({
            organizacion: (node.querySelector('[data-field="organizacion"]')?.value || '').trim(),
            rol: (node.querySelector('[data-field="rol"]')?.value || '').trim(),
            periodo: (node.querySelector('[data-field="periodo"]')?.value || '').trim(),
            descripcion: (node.querySelector('[data-field="descripcion"]')?.value || '').trim()
        }));
        draft.perfil_educacion = readCollection('perfil_educacion', (node) => ({
            institucion: (node.querySelector('[data-field="institucion"]')?.value || '').trim(),
            credencial: (node.querySelector('[data-field="credencial"]')?.value || '').trim(),
            nivel: (node.querySelector('[data-field="nivel"]')?.value || '').trim(),
            periodo: (node.querySelector('[data-field="periodo"]')?.value || '').trim()
        }));
        draft.perfil_cursos = readCollection('perfil_cursos', (node) => ({
            proveedor: (node.querySelector('[data-field="proveedor"]')?.value || '').trim(),
            nombre: (node.querySelector('[data-field="nombre"]')?.value || '').trim(),
            areas: splitTags(node.querySelector('[data-field="areas"]')?.value || ''),
            estado: (node.querySelector('[data-field="estado"]')?.value || '').trim(),
            tipo: (node.querySelector('[data-field="tipo"]')?.value || '').trim()
        }));
    }

    function getEmptyItem(collection) {
        if (collection === 'perfil_enlaces') return { titulo: '', url: '' };
        if (collection === 'perfil_proyectos') return { titulo: '', descripcion: '', enlace: '', etiquetas: [] };
        if (collection === 'perfil_experiencia') return { organizacion: '', rol: '', periodo: '', descripcion: '' };
        if (collection === 'perfil_educacion') return { institucion: '', credencial: '', nivel: '', periodo: '' };
        if (collection === 'perfil_cursos') return { proveedor: '', nombre: '', areas: [], estado: '', tipo: '' };
        return {};
    }

    async function saveProfile(event) {
        event.preventDefault();
        syncDraftFromDom();

        try {
            const updatedUser = await API().updateMe({
                nombre: draft.nombre,
                perfil_titulo: draft.perfil_titulo,
                perfil_visibilidad: draft.perfil_visibilidad,
                perfil_rol_deseado: draft.perfil_rol_deseado,
                perfil_resumen: draft.perfil_resumen,
                perfil_habilidades: draft.perfil_habilidades,
                perfil_enlaces: draft.perfil_enlaces,
                perfil_proyectos: draft.perfil_proyectos,
                perfil_experiencia: draft.perfil_experiencia,
                perfil_educacion: draft.perfil_educacion,
                perfil_cursos: draft.perfil_cursos
            });
            draft = normalizeUser(updatedUser);
            profileMessage = { type: 'ok', text: 'Perfil actualizado.' };
            C().setLoggedIn(updatedUser.rol, updatedUser);
            draw();
        } catch (error) {
            profileMessage = { type: 'err', text: error.message || 'No se pudo guardar el perfil.' };
            draw();
        }
    }

    async function shareProfile() {
        const shareUrl = `${window.location.origin}${window.location.pathname}#/perfil`;
        const shareData = {
            title: 'Mi perfil en EducatIA',
            text: `${draft.nombre} compartió su perfil de EducatIA.`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                throw new Error('Tu navegador no soporta compartir este perfil directamente.');
            }
            profileMessage = { type: 'ok', text: 'Enlace del perfil listo para compartir.' };
        } catch (error) {
            profileMessage = { type: 'err', text: error.message || 'No se pudo compartir el perfil.' };
        }
        draw();
    }

    async function redeemPromoCode(event) {
        event.preventDefault();
        syncDraftFromDom();

        const form = event.currentTarget;
        promoCodeValue = String(form?.promo_code?.value || promoCodeValue || '').trim().toUpperCase();

        if (!promoCodeValue) {
            promoMessage = { type: 'err', text: 'Ingresa un código promocional para validarlo.' };
            draw();
            return;
        }

        promoSubmitting = true;
        promoMessage = null;
        draw();

        try {
            await API().redeemPromoCode(promoCodeValue);
            const updatedUser = await API().getMe();
            draft = normalizeUser(updatedUser);
            promoMessage = {
                type: 'ok',
                text: `Código aplicado correctamente. Tu acceso premium ahora está activo hasta ${formatSubscriptionDate(draft.suscripcion_hasta)}.`
            };
            promoCodeValue = '';
        } catch (error) {
            promoMessage = { type: 'err', text: error.message || 'No se pudo validar el código promocional.' };
        } finally {
            promoSubmitting = false;
            draw();
        }
    }

    function bindEvents() {
        document.getElementById('profile-editor-form')?.addEventListener('submit', saveProfile);
        document.getElementById('promo-code-form')?.addEventListener('submit', redeemPromoCode);

        document.getElementById('share-profile')?.addEventListener('click', shareProfile);

        document.getElementById('add-skill')?.addEventListener('click', function () {
            syncDraftFromDom();
            const input = document.getElementById('profile-skill-input');
            const value = String(input?.value || '').trim();
            if (!value) return;
            if (!draft.perfil_habilidades.includes(value)) {
                draft.perfil_habilidades.push(value);
            }
            profileMessage = null;
            draw();
        });

        document.querySelectorAll('[data-remove-skill]').forEach((button) => {
            button.addEventListener('click', function () {
                syncDraftFromDom();
                draft.perfil_habilidades.splice(Number(button.dataset.removeSkill), 1);
                draw();
            });
        });

        document.querySelectorAll('[data-add-collection]').forEach((button) => {
            button.addEventListener('click', function () {
                syncDraftFromDom();
                const collection = button.dataset.addCollection;
                draft[collection].push(getEmptyItem(collection));
                draw();
            });
        });

        document.querySelectorAll('[data-remove-collection]').forEach((button) => {
            button.addEventListener('click', function () {
                syncDraftFromDom();
                const collection = button.dataset.removeCollection;
                draft[collection].splice(Number(button.dataset.index), 1);
                draw();
            });
        });

        document.getElementById('password-form')?.addEventListener('submit', async function (event) {
            event.preventDefault();
            const form = event.currentTarget;
            const current_password = form.current_password.value;
            const new_password = form.new_password.value;
            const msgEl = document.getElementById('pw-msg');

            if (new_password.length < 15) {
                msgEl.innerHTML = '<div class="smsg smsg--err">La nueva contraseña debe tener al menos 15 caracteres.</div>';
                return;
            }

            try {
                await API().changePassword({ current_password, new_password });
                form.reset();
                msgEl.innerHTML = '<div class="smsg smsg--ok">Contraseña actualizada.</div>';
            } catch (error) {
                msgEl.innerHTML = `<div class="smsg smsg--err">${esc(error.message || 'No se pudo cambiar la contraseña.')}</div>`;
            }
        });
    }

    async function render() {
        if (!C().requireAuth()) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando perfil');

        try {
            draft = normalizeUser(await API().getMe());
            profileMessage = null;
            promoMessage = null;
            draw();
        } catch (error) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">No fue posible cargar tu perfil. ${esc(error.message)}</div></div>`;
        }
    }

    return { render };
})();
