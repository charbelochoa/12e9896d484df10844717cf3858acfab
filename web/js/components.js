/* ================================================================
   educatIA — Shared Components
   Navigation, Footer, Sidebar, Icons, Chat Widget
   ================================================================ */

window.EducatIA = window.EducatIA || {};

window.EducatIA.Icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    messageCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7l3 3 3-3c2-1.5 4-4 4-7a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

window.EducatIA.Components = (function () {
    const Icons = window.EducatIA.Icons;

    function appUrl(path) {
        return window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    }

    function renderTeacherAvatar() {
        return `
            <div class="teacher-avatar" aria-hidden="true">
                <svg class="teacher-avatar__svg" viewBox="0 0 64 64" fill="none">
                    <path d="M32 8 8 18l24 10 24-10-24-10Z" fill="#1F1F1F"></path>
                    <path d="M18 24v10c0 6 6.3 11 14 11s14-5 14-11V24" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round"></path>
                    <circle cx="32" cy="35" r="13" fill="#FFD9B3"></circle>
                    <circle cx="26.5" cy="34.5" r="4.5" stroke="#1F1F1F" stroke-width="2.5"></circle>
                    <circle cx="37.5" cy="34.5" r="4.5" stroke="#1F1F1F" stroke-width="2.5"></circle>
                    <path d="M31 34.5h2" stroke="#1F1F1F" stroke-width="2.5" stroke-linecap="round"></path>
                    <path d="M27 43c1.7 1.4 3.4 2 5 2s3.3-.6 5-2" stroke="#0056D2" stroke-width="2.5" stroke-linecap="round"></path>
                    <path d="M14 18v10" stroke="#1F1F1F" stroke-width="2.5" stroke-linecap="round"></path>
                    <circle cx="14" cy="30.5" r="2.5" fill="#0056D2"></circle>
                </svg>
            </div>
        `;
    }

    function renderBrandLogo(extraClass = '') {
        return `
            <span class="site-nav__logo-clip ${extraClass}" aria-hidden="true">
                <img src="assets/new_logo/new_logo.png" alt="">
            </span>
            <span class="sr-only">educatIA</span>
        `;
    }

    function normalizeLoadingOptions(options) {
        if (typeof options === 'string') {
            return { label: options };
        }
        return options || {};
    }

    function renderLoading(options = {}) {
        const config = normalizeLoadingOptions(options);
        const esc = window.EducatIA.Utils?.escapeHtml || ((value) => String(value ?? ''));
        const label = esc(config.label || 'Cargando');
        const compactClass = config.compact ? ' educatia-loader--compact' : '';
        const className = config.className ? ` ${config.className}` : '';

        return `
            <div class="educatia-loader${compactClass}${className}" role="status" aria-label="${label}">
                <span class="educatia-loader__media" aria-hidden="true">
                    <video class="educatia-loader__video" autoplay muted playsinline loop preload="metadata">
                        <source src="assets/load_screen/load_screen.mp4" type="video/mp4">
                    </video>
                </span>
                <span class="sr-only">${label}</span>
            </div>
        `;
    }

    function renderLoadingBlock(options = {}) {
        const config = normalizeLoadingOptions(options);
        const esc = window.EducatIA.Utils?.escapeHtml || ((value) => String(value ?? ''));
        const containerClass = esc(config.containerClass || 'loading');
        return `<div class="${containerClass}">${renderLoading(config)}</div>`;
    }

    function showExperienceTransition(options = {}) {
        const esc = window.EducatIA.Utils?.escapeHtml || ((value) => String(value ?? ''));
        const label = esc(options.label || 'Preparando tu experiencia');
        const detail = esc(options.detail || 'Estamos dejando lista tu ruta de estudio.');
        const visualOnly = options.visualOnly === true;
        document.getElementById('educatia-experience-transition')?.remove();

        const overlay = document.createElement('section');
        overlay.id = 'educatia-experience-transition';
        overlay.className = `experience-transition${visualOnly ? ' experience-transition--visual-only' : ''}`;
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'assertive');
        overlay.innerHTML = visualOnly
            ? renderLoading({ label, className: 'educatia-loader--transition' })
            : `
            <div class="experience-transition__card">
                ${renderLoading({ label, className: 'educatia-loader--transition' })}
                <div>
                    <span class="experience-transition__eyebrow">educatIA · EXANI-II</span>
                    <strong>${label}</strong>
                    <p>${detail}</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        window.requestAnimationFrame(() => overlay.classList.add('is-visible'));

        return {
            async close(minimumMs = 0) {
                if (minimumMs > 0) {
                    await new Promise((resolve) => window.setTimeout(resolve, minimumMs));
                }
                overlay.classList.remove('is-visible');
                window.setTimeout(() => overlay.remove(), 230);
            }
        };
    }

    async function logoutWithTransition() {
        const transition = showExperienceTransition({
            label: 'Cerrando sesión',
            visualOnly: true
        });
        try {
            await window.EducatIA.API?.logout?.();
        } finally {
            setLoggedOut({ remote: false });
            await transition.close(780);
            window.EducatIA.Router?.navigate('/');
        }
    }

    // Current app user state
    const userState = {
        loggedIn: false,
        role: null, // 'alumno' or 'maestro'
        name: '',
        id: null,
        email: '',
        avatarUrl: '',
        subscriptionActive: false,
        subscriptionUntil: null,
        premiumActive: false,
        aleEnabled: false,
        registeredAt: null
    };

    const deferredActions = {
        homeScroll: 'educatia_home_scroll_target',
        openRegister: 'educatia_open_register_modal'
    };

    const footerInfoContent = {
        proyecto: {
            title: 'Proyecto educatIA',
            body: 'educatIA es una plataforma independiente de preparación para EXANI-I y EXANI-II. Reúne cursos por materia, diagnóstico, práctica, simulacros y laboratorio interactivo.'
        },
        oferta: {
            title: 'Oferta académica',
            body: 'La oferta actual reúne rutas guiadas, cursos publicados y proyectos dentro de educatIA. Desde aquí puedes pasar a Explorar para revisar fundamentos, áreas avanzadas y contenido docente activo.'
        },
        vinculacion: {
            title: 'Vinculación',
            body: 'Esta sección resume el enfoque de vinculación académica de educatIA: conectar aprendizaje, proyectos y aplicación práctica. Usa las colecciones de la pantalla principal para entrar a proyectos, rutas y experiencias orientadas a resultados.'
        },
        ayuda: {
            title: 'Centro de ayuda',
            body: 'Si algo no se comporta como esperas, usa la búsqueda superior para ir al curso correcto o entra a Explorar para iniciar una búsqueda nueva. También puedes abrir la pantalla principal y navegar por categorías, rutas o proyectos prácticos.'
        },
        accesibilidad: {
            title: 'Accesibilidad',
            body: 'La interfaz está diseñada para mantener navegación consistente con enlaces claros, botones reales y búsqueda operativa. Este panel sirve como punto funcional para revisar acciones institucionales sin dejar enlaces muertos en la experiencia.'
        },
        privacidad: {
            title: 'Privacidad',
            body: 'educatIA usa navegación local de SPA y almacenamiento de sesión para mejorar búsqueda, scroll dirigido y continuidad de experiencia. Este acceso reemplaza enlaces vacíos para que la sección legal sea accionable dentro de la interfaz actual.'
        },
        terminos: {
            title: 'Términos',
            body: 'Los términos operativos del prototipo se presentan aquí como acceso funcional. La plataforma prioriza navegación clara, autenticación, inscripción, revisión de cursos y exploración estructurada de contenido académico.'
        },
        cookies: {
            title: 'Cookies',
            body: 'En esta versión se usa almacenamiento de sesión para recordar búsquedas, scroll pendiente hacia secciones de inicio y apertura diferida del modal de registro. Se evita dejar controles de interfaz que no respondan al usuario.'
        },
        legal: {
            title: 'Legal',
            body: 'Este acceso legal se resolvió como panel informativo funcional para evitar links muertos. Desde aquí puedes volver al inicio, continuar explorando contenido o abrir rutas y áreas con navegación interna consistente.'
        }
    };

    function normalizeActionText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function isAdminRole(role = userState.role) {
        return role === 'admin';
    }

    function canAccessStudentViews(role = userState.role) {
        return role === 'alumno' || role === 'soporte' || role === 'mantenimiento' || isAdminRole(role);
    }

    function hasPremiumAccess(data = userState) {
        const source = data || {};
        const role = source.role || source.rol;
        if (role === 'admin' || role === 'maestro') {
            return true;
        }

        if (source.subscriptionActive || source.suscripcion_activa || source.premiumActive || source.premium_activo) {
            return true;
        }

        const rawUntil = source.subscriptionUntil || source.suscripcion_hasta;
        if (!rawUntil) {
            return false;
        }

        const until = new Date(rawUntil).getTime();
        return Number.isFinite(until) && until > Date.now();
    }

    function isRecentlyCreatedAccount(data = userState) {
        const source = data || {};
        const rawDate = source.registeredAt || source.fecha_registro || source.created_at;
        if (!rawDate) {
            return false;
        }

        const createdAt = new Date(rawDate).getTime();
        if (!Number.isFinite(createdAt)) {
            return false;
        }

        return Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
    }

    function canAccessTeacherViews(role = userState.role) {
        return role === 'maestro' || isAdminRole(role);
    }

    function navigateToExplore(query) {
        const cleanQuery = String(query || '').trim();
        window.sessionStorage.setItem('educatia_explore_query', cleanQuery);
        const suffix = cleanQuery ? `?q=${encodeURIComponent(cleanQuery)}` : '';
        window.EducatIA.Router.navigate(`/explorar${suffix}`);
    }

    function navigateToHomeSection(sectionId) {
        if (!sectionId) {
            return;
        }

        const currentPath = window.EducatIA.Router?.getPath?.() || window.location.hash.slice(1) || '/';
        if (currentPath === '/') {
            const target = document.getElementById(sectionId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }

        window.sessionStorage.setItem(deferredActions.homeScroll, sectionId);
        window.EducatIA.Router.navigate('/');
    }

    function requestRegisterFlow() {
        window.sessionStorage.removeItem(deferredActions.openRegister);
        window.EducatIA.Router.navigate('/registro-alumno');
    }

    function resolveExploreQueryFromLabel(label) {
        const normalized = normalizeActionText(label);
        const mapping = {
            'periodo 1 fundamentos': 'programacion',
            'periodo 2 estructuras': 'estructuras de datos',
            'periodo 3 paradigmas': 'paradigmas de programacion',
            'periodo 4 sistemas': 'distributed systems',
            'periodo 5 machine learning': 'machine learning',
            'periodo 6 nlp datos': 'nlp',
            'periodo 7 nube xai': 'nube',
            'periodo 8 proyecto final': 'artificial intelligence project',
            'machine learning i': 'machine learning',
            'natural language processing': 'nlp',
            'ciencia de los datos': 'data science',
            'digital image processing': 'digital image processing',
            'knowledge representation': 'knowledge representation',
            'seguridad cibernetica': 'ciberseguridad',
            'embedded systems iot': 'iot',
            'reinforcement learning': 'reinforcement learning',
            'generative ai': 'generative artificial intelligence',
            'deep learning neural networks': 'deep learning',
            'computer vision': 'computer vision',
            'big data': 'big data',
            'robot programming': 'robot programming',
            'pattern recognition': 'pattern recognition',
            'python': 'programacion',
            'inteligencia artificial': 'inteligencia artificial',
            'algebra lineal': 'algebra lineal',
            'probabilidad y estadistica': 'probabilidad',
            'bases de datos': 'bases de datos',
            'redes y ciberseguridad': 'redes',
            'gestion de proyectos ti': 'gestion'
        };

        return mapping[normalized] || normalized;
    }

    function renderFooterInfoModal() {
        return `
            <div id="footer-info-modal" class="landing-register-modal" aria-hidden="true" hidden inert>
                <div class="landing-register-modal__dialog footer-info-modal__dialog">
                    <button type="button" class="landing-register-modal__close" data-close-footer-info>${Icons.x}</button>
                    <h2 id="footer-info-title">Información</h2>
                    <div id="footer-info-body" class="footer-info-modal__body"></div>
                    <div class="footer-info-modal__actions">
                        <button type="button" class="btn btn--outline" data-close-footer-info>Cerrar</button>
                        <button type="button" class="btn btn--primary" data-home-section="nosotros">Ir al inicio</button>
                    </div>
                </div>
            </div>
        `;
    }

    function closeFooterInfoModal() {
        const modal = document.getElementById('footer-info-modal');
        if (!modal) {
            return;
        }

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.hidden = true;
        modal.setAttribute('inert', '');
    }

    function openFooterInfoModal(topicKey) {
        const modal = document.getElementById('footer-info-modal');
        const title = document.getElementById('footer-info-title');
        const body = document.getElementById('footer-info-body');
        const content = footerInfoContent[topicKey];

        if (!modal || !title || !body || !content) {
            return;
        }

        title.textContent = content.title;
        body.innerHTML = `<p>${content.body}</p>`;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modal.hidden = false;
        modal.removeAttribute('inert');
    }

    function setLoggedIn(role, userData) {
        userState.loggedIn = true;
        userState.role = role;
        if (userData) {
            const premiumAccess = hasPremiumAccess({ ...userData, role });
            userState.name = userData.nombre || '';
            userState.id = userData.id || null;
            userState.email = userData.email || '';
            userState.avatarUrl = userData.avatar_url || '';
            userState.subscriptionActive = premiumAccess;
            userState.subscriptionUntil = userData.suscripcion_hasta || null;
            userState.premiumActive = premiumAccess;
            userState.registeredAt = userData.fecha_registro || userData.created_at || null;
        }
        renderNav();
        renderFooter();
        refreshAleEntitlement();
    }

    async function refreshAleEntitlement() {
        const features = window.EducatIA.Features;
        if (!features?.setAleAccess) return false;
        if (!userState.loggedIn || userState.role !== 'alumno' || !window.EducatIA.API?.getCurrentSubscription) {
            userState.aleEnabled = false;
            features.setAleAccess(false);
            return false;
        }
        try {
            const subscription = await window.EducatIA.API.getCurrentSubscription();
            const enabled = Boolean(
                subscription?.active
                && subscription?.plan_id === 'educatia-6-meses'
                && subscription?.ai_tutor_enabled === true
            );
            userState.aleEnabled = enabled;
            features.setAleAccess(enabled);
            return enabled;
        } catch {
            userState.aleEnabled = false;
            features.setAleAccess(false);
            return false;
        }
    }

    function setLoggedOut(options) {
        const shouldLogoutRemotely = !options || options.remote !== false;
        userState.loggedIn = false;
        userState.role = null;
        userState.name = '';
        userState.id = null;
        userState.email = '';
        userState.avatarUrl = '';
        userState.subscriptionActive = false;
        userState.subscriptionUntil = null;
        userState.premiumActive = false;
        userState.aleEnabled = false;
        userState.registeredAt = null;
        if (window.EducatIA.API) {
            if (shouldLogoutRemotely && window.EducatIA.API.logout) {
                window.EducatIA.API.logout().catch(() => {});
            }
            window.EducatIA.API.clearToken();
            window.EducatIA.API.clearUser();
        }
        window.EducatIA.Features?.setAleAccess?.(false);
        renderNav();
        renderFooter();
    }

    function requireAuth(requiredRole) {
        if (!userState.loggedIn) {
            const router = window.EducatIA.Router;
            const path = router.getPath ? router.getPath() : '/';
            const search = window.location.search || '';
            const next = `${path}${search}`;
            if (window.EducatIA.Pages?.Auth?.openLoginModal) {
                window.EducatIA.Pages.Auth.openLoginModal({ next });
            } else {
                router.navigate(`/login?next=${encodeURIComponent(next)}`);
            }
            return false;
        }

        if (requiredRole && userState.role !== requiredRole && userState.role !== 'admin') {
            window.EducatIA.Router.navigate(userState.role === 'maestro' ? '/dashboard-maestro' : '/dashboard');
            return false;
        }

        return true;
    }

    function getUserInitial(name) {
        return (String(name || 'U').trim().charAt(0) || 'U').toUpperCase();
    }

    function renderUserAvatar(className, userData) {
        const data = userData || userState;
        const avatarUrl = String(data.avatarUrl || data.avatar_url || '').trim();
        const displayName = String(data.name || data.nombre || 'usuario');
        const initial = getUserInitial(displayName);
        const esc = window.EducatIA.Utils && window.EducatIA.Utils.escapeHtml
            ? window.EducatIA.Utils.escapeHtml
            : function (value) { return String(value || ''); };

        if (avatarUrl) {
            return `<span class="${className} ${className}--image"><img src="${esc(avatarUrl)}" alt="Foto de perfil de ${esc(displayName)}"></span>`;
        }

        return `<span class="${className}">${esc(initial)}</span>`;
    }

    function renderPremiumBadge() {
        if (hasPremiumAccess()) {
            return `
                <a href="#/dashboard" class="site-nav__premium-badge" title="Suscripción EducatIA Premium activa" aria-label="Suscripción EducatIA Premium activa">
                    <img src="assets/premium/premium-transparent.png" alt="" aria-hidden="true">
                    <span>Premium activo</span>
                </a>
            `;
        }

        if (!userState.loggedIn || !canAccessStudentViews()) {
            return '';
        }

        return `
            <button type="button" class="site-nav__premium-cta" id="nav-premium-access" data-premium-mode="pricing">
                Mejorar plan
            </button>
        `;
    }

    // ===== NAVIGATION =====
    function renderNav() {
        const header = document.getElementById('site-header');
        if (!header) return;

        const escapeHtml = window.EducatIA.Utils && window.EducatIA.Utils.escapeHtml
            ? window.EducatIA.Utils.escapeHtml
            : function (value) { return String(value || ''); };

        if (renderNav._profileDocHandler) {
            document.removeEventListener('click', renderNav._profileDocHandler);
            renderNav._profileDocHandler = null;
        }

        if (renderNav._dropdownDocHandler) {
            document.removeEventListener('click', renderNav._dropdownDocHandler);
            renderNav._dropdownDocHandler = null;
        }
        if (renderNav._studentMenuDocHandler) {
            document.removeEventListener('click', renderNav._studentMenuDocHandler);
            renderNav._studentMenuDocHandler = null;
        }

        const currentHash = window.EducatIA.Router?.getPath?.() || window.location.hash.slice(1) || '/';
        const isAuth = currentHash.includes('login') || currentHash.includes('registro');

        if (isAuth) {
            header.innerHTML = '';
            header.className = '';
            return;
        }

        header.className = userState.loggedIn ? 'site-nav' : 'site-nav site-nav--coursera-public';
        header.id = 'site-header';

        const isAdmin = isAdminRole();
        const exaniPracticePath = window.EducatIA.Utils?.exaniPracticeUrl?.() || '/simuladores-exani/practica-por-modulos';
        const studentLearningActive = currentHash === '/dashboard' || currentHash.startsWith('/curso') || currentHash.startsWith('/leccion') || currentHash.startsWith('/cursos');
        const studentExploreActive = currentHash.startsWith('/explorar') || currentHash.startsWith('/materia') || currentHash.startsWith('/materias');
        const studentGradesActive = currentHash.startsWith('/calificaciones');
        const studentExamPracticeActive = currentHash.startsWith('/examenes-practica') || currentHash.startsWith(exaniPracticePath);
        const studentSimulacrosActive = (currentHash.startsWith('/simulacros') || currentHash.startsWith('/simuladores-exani')) && !studentExamPracticeActive;
        const studentPracticeActive = studentExamPracticeActive || studentSimulacrosActive;
        const studentLabActive = currentHash.startsWith('/laboratorio-aprendizaje');
        const pricingActive = currentHash.startsWith('/precios') || currentHash.startsWith('/pricing');
        const isStaffRole = userState.role === 'soporte' || userState.role === 'mantenimiento';
        const isStudentShell = userState.loggedIn && (userState.role === 'alumno' || isStaffRole || (isAdmin && (studentLearningActive || studentExploreActive || studentGradesActive || studentPracticeActive || studentLabActive)));
        const profileRoleLabel = userState.role === 'admin' ? 'Administrador' : userState.role === 'maestro' ? 'Docente' : userState.role === 'soporte' ? 'Soporte' : userState.role === 'mantenimiento' ? 'Mantenimiento' : 'Alumno';
        const exaniDropdownGroups = [
            {
                title: 'Materias obligatorias',
                icon: Icons.book,
                description: 'Las áreas base que forman parte de la preparación general.',
                items: [
                    { label: 'Pensamiento matemático', description: 'Razonamiento y resolución de problemas', query: 'Pensamiento matematico' },
                    { label: 'Comprensión lectora', description: 'Lectura, inferencia y propósito', query: 'Comprension lectora' },
                    { label: 'Redacción indirecta', description: 'Gramática, cohesión y escritura', query: 'Redaccion indirecta' },
                    { label: 'Examen general', description: 'Vista completa del formato EXANI', href: '/simuladores-exani' }
                ]
            },
            {
                title: 'Matemáticas y ciencias',
                icon: Icons.layers,
                description: 'Módulos específicos organizados por materia.',
                items: [
                    { label: 'Aritmética', description: 'Operaciones y proporcionalidad', query: 'Aritmetica' },
                    { label: 'Cálculo diferencial', description: 'Límites, derivadas e integrales', query: 'Calculo diferencial' },
                    { label: 'Probabilidad y estadística', description: 'Datos, conteo y probabilidad', query: 'Probabilidad' },
                    { label: 'Matemáticas financieras', description: 'Porcentajes, interés y amortización', query: 'Matematicas financieras' },
                    { label: 'Física', description: 'Movimiento, fuerzas, energía y ondas', query: 'Fisica' },
                    { label: 'Química', description: 'Enlaces, reacciones y soluciones', query: 'Quimica' },
                    { label: 'Biología', description: 'Célula, genética y evolución', query: 'Biologia' }
                ]
            },
            {
                title: 'Sociales, humanidades y salud',
                icon: Icons.compass,
                description: 'Elige el módulo relacionado con tu carrera.',
                items: [
                    { label: 'Administración', description: 'Organización, procesos y gestión', query: 'Administracion' },
                    { label: 'Derecho', description: 'Normas, Estado y ciudadanía', query: 'Derecho' },
                    { label: 'Economía', description: 'Mercados y decisiones económicas', query: 'Economia' },
                    { label: 'Historia', description: 'México y contexto universal', query: 'Historia' },
                    { label: 'Filosofía', description: 'Pensamiento, ética y argumentos', query: 'Filosofia' },
                    { label: 'Literatura', description: 'Géneros, corrientes y análisis', query: 'Literatura' },
                    { label: 'Psicología', description: 'Procesos cognitivos y conducta', query: 'Psicologia' },
                    { label: 'Ciencias de la Salud', description: 'Salud pública y morfofisiología', query: 'Ciencias de la Salud' },
                    { label: 'Premedicina', description: 'Anatomía, microbiología y bioquímica', query: 'Premedicina' }
                ]
            },
            {
                title: 'Práctica y evaluación',
                icon: Icons.target,
                description: 'Convierte el estudio en sesiones medibles.',
                items: [
                    { label: 'Diagnóstico inicial', description: 'Detecta tus áreas de oportunidad', href: '#/onboarding' },
                    { label: 'Práctica por módulos', description: 'Reactivos agrupados por tema', href: '/simuladores-exani/practica-por-modulos' },
                    { label: 'Exámenes simulacro', description: 'Practica con estructura y tiempo', href: '#/examenes-practica' },
                    { label: 'Laboratorio de aprendizaje', description: 'Simuladores HTML5 de Física', href: '#/laboratorio-aprendizaje' }
                ]
            }
        ];
        const renderDropdownGroup = (group) => `
            <section class="explorar-dropdown__group">
                <div class="explorar-dropdown__group-head">
                    <div>
                        <h4>${group.title}</h4>
                        <p>${group.description}</p>
                    </div>
                </div>
                <div class="explorar-dropdown__group-links">
                    ${group.items.map((item) => `
                        <a href="${item.href || '#/explorar'}" class="${item.query ? 'dropdown-link ' : ''}explorar-dropdown__item"${item.query ? ` data-explore-query="${item.query}"` : ''}>
                            <strong>${item.label}</strong>
                            <span>${item.description}</span>
                        </a>
                    `).join('')}
                </div>
            </section>
        `;

        const dropdownHTML = `
            <div class="explorar-dropdown" id="explorar-dropdown">
                <div class="explorar-dropdown__shell">
                    <div class="explorar-dropdown__intro">
                        <div>
                            <span class="explorar-dropdown__eyebrow">Explorar con contexto</span>
                            <h3>Encuentra una ruta, un curso o un área sin perderte en el catálogo.</h3>
                        </div>
                        <p>Empieza por nivel, disciplina o resultado. Cada grupo te lleva a búsquedas ya preparadas para decidir más rápido.</p>
                    </div>
                    <div class="explorar-dropdown__grid">
                        ${exaniDropdownGroups.map(renderDropdownGroup).join('')}
                    </div>
                    <div class="explorar-dropdown__footer">
                        <span>¿No sabes por dónde empezar?</span>
                        <a href="#/explorar" class="explorar-dropdown__footer-link">Ver catálogo completo</a>
                        <a href="#/registro-alumno" class="explorar-dropdown__footer-link">Crear una cuenta</a>
                    </div>
                </div>
            </div>
        `;
        const isTeacherDashboardActive = currentHash.startsWith('/dashboard-maestro') || currentHash.startsWith('/maestro/curso') || currentHash.startsWith('/gestion-curso');
        const isProfileAreaActive = currentHash.startsWith('/perfil') || currentHash.startsWith('/configuracion') || currentHash.startsWith('/compras') || currentHash.startsWith('/certificados') || currentHash.startsWith('/notificaciones');
        const mobilePageLabel = (() => {
            if (studentExploreActive) return 'Explorar';
            if (studentLearningActive) return 'Mi aprendizaje';
            if (studentGradesActive) return 'Calificaciones';
            if (studentExamPracticeActive) return 'Exámenes práctica';
            if (studentSimulacrosActive) return 'Simulacros';
            if (studentLabActive) return 'Laboratorio';
            if (pricingActive) return 'Costos';
            if (isTeacherDashboardActive) return 'Panel docente';
            if (currentHash.startsWith('/perfil')) return 'Mi perfil';
            if (currentHash.startsWith('/compras')) return 'Mis compras';
            if (currentHash.startsWith('/certificados')) return 'Mis certificados';
            if (currentHash.startsWith('/configuracion')) return 'Configuración';
            if (currentHash.startsWith('/notificaciones')) return 'Notificaciones';
            if (currentHash.startsWith('/explorar') || currentHash.startsWith('/materia')) return 'Explorar';
            if (currentHash === '/') return 'Inicio';
            return userState.loggedIn ? 'Mi espacio' : 'educatIA';
        })();

        const renderMobileContext = (kicker, title) => `
            <div class="site-nav__mobile-context" aria-hidden="true">
                <span class="site-nav__mobile-kicker">${escapeHtml(kicker)}</span>
                <strong class="site-nav__mobile-title">${escapeHtml(title)}</strong>
            </div>
        `;

        const renderTabletMenuToggle = () => `
            <button
                class="site-nav__mobile-toggle"
                id="mobile-menu-toggle"
                type="button"
                data-mobile-menu-toggle
                data-mobile-menu-toggle-kind="icon"
                aria-controls="mobile-menu"
                aria-expanded="false"
                aria-label="Abrir menú"
            >
                ${Icons.menu}
            </button>
        `;

        const renderMobileMenuEntry = (item) => {
            if (!item) {
                return '';
            }

            const classes = [
                'mobile-menu__link',
                item.active ? 'active' : '',
                item.variant ? `mobile-menu__link--${item.variant}` : ''
            ].filter(Boolean).join(' ');

            if (item.action === 'logout') {
                return `<button type="button" class="${classes}" data-mobile-action="logout">${escapeHtml(item.label)}</button>`;
            }

            return `<a href="${item.href}" class="${classes}">${escapeHtml(item.label)}</a>`;
        };

        const renderMobileMenuSection = (title, items) => {
            const visibleItems = (items || []).filter(Boolean);
            if (!visibleItems.length) {
                return '';
            }

            return `
                <section class="mobile-menu__section">
                    <div class="mobile-menu__section-label">${escapeHtml(title)}</div>
                    <div class="mobile-menu__links">
                        ${visibleItems.map(renderMobileMenuEntry).join('')}
                    </div>
                </section>
            `;
        };

        const renderMobileMenu = (options) => `
            <div class="mobile-menu" id="mobile-menu" hidden aria-hidden="true">
                <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menú móvil">
                    <div class="mobile-menu__header">
                        <div class="mobile-menu__header-copy">
                            <span class="mobile-menu__eyebrow">${escapeHtml(options.eyebrow)}</span>
                            <span class="mobile-menu__brand">${escapeHtml(options.title)}</span>
                        </div>
                        <button class="mobile-menu__close" id="mobile-menu-close" type="button" aria-label="Cerrar menú">Cerrar</button>
                    </div>
                    ${options.userName ? `
                        <div class="mobile-menu__user-card">
                            ${renderUserAvatar('mobile-menu__user-avatar')}
                            <div class="mobile-menu__user-info">
                                <strong>${escapeHtml(options.userName)}</strong>
                                <span>${escapeHtml(options.userRole || '')}</span>
                            </div>
                        </div>
                    ` : ''}
                    ${options.sections.map((section) => renderMobileMenuSection(section.title, section.items)).join('')}
                </div>
            </div>
        `;

        const renderMobileIsland = (items) => `
            <nav class="mobile-island" aria-label="Atajos del teléfono">
                ${items.map((item) => {
                    if (item.action === 'menu') {
                        return `
                            <button
                                type="button"
                                class="mobile-island__link mobile-island__link--button"
                                data-mobile-menu-toggle
                                data-mobile-menu-toggle-kind="text"
                                data-mobile-menu-toggle-label="${escapeHtml(item.label)}"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                                aria-label="Abrir menú"
                            >${escapeHtml(item.label)}</button>
                        `;
                    }

                    return `<a href="${item.href}" class="mobile-island__link ${item.active ? 'active' : ''}">${escapeHtml(item.label)}</a>`;
                }).join('')}
            </nav>
        `;

        if (userState.loggedIn) {
            const dashLink = userState.role === 'maestro'
                ? '#/dashboard-maestro'
                : '#/dashboard';
            if (isStudentShell) {
                header.innerHTML = `
                    <div class="site-nav__inner site-nav__inner--student">
                        <div class="site-nav__brand">
                            <a href="#/" class="site-nav__logo" aria-label="educatIA, inicio">${renderBrandLogo()}</a>
                            ${renderMobileContext(profileRoleLabel, mobilePageLabel)}
                            <nav class="site-nav__student-links" aria-label="Navegación principal del alumno">
                                <a href="#/explorar" class="site-nav__student-link ${studentExploreActive ? 'active' : ''}">Explorar</a>
                                <a href="#/dashboard" class="site-nav__student-link ${studentLearningActive ? 'active' : ''}">Mi aprendizaje</a>
                                <a href="${exaniPracticePath}" class="site-nav__student-link ${studentExamPracticeActive ? 'active' : ''}">Práctica</a>
                                <a href="${appUrl('/simuladores-exani')}" class="site-nav__student-link ${studentSimulacrosActive ? 'active' : ''}">Simulacros</a>
                                <a href="#/laboratorio-aprendizaje" class="site-nav__student-link ${studentLabActive ? 'active' : ''}">Laboratorio</a>
                                <a href="#/calificaciones" class="site-nav__student-link ${studentGradesActive ? 'active' : ''}">Calificaciones</a>
                            </nav>
                        </div>

                        <div class="site-nav__search site-nav__search--student">
                            <input type="text" id="site-search-input" placeholder="¿Qué deseas aprender?" aria-label="Buscar cursos">
                            <button type="button" class="site-nav__search-button" id="site-search-button" aria-label="Buscar cursos">
                                ${Icons.search}
                            </button>
                        </div>

                        <div class="site-nav__actions site-nav__actions--student">
                            <button class="site-nav__icon-btn" type="button" onclick="window.EducatIA.Router.navigate('/notificaciones')" id="nav-notifications" title="Notificaciones" aria-label="Notificaciones">
                                ${Icons.bell}
                                <span class="site-nav__badge"></span>
                            </button>
                            ${renderPremiumBadge()}
                            <div class="site-nav__profile-menu">
                                <button class="site-nav__icon-btn site-nav__profile-trigger" type="button" id="nav-profile-toggle" title="Cuenta" aria-label="Cuenta" aria-haspopup="menu" aria-expanded="false">
                                    ${renderUserAvatar('site-nav__profile-avatar')}
                                    <span class="site-nav__profile-trigger-caret">${Icons.chevronDown}</span>
                                </button>
                                <div class="site-nav__profile-dropdown" id="nav-profile-dropdown" role="menu" aria-hidden="true">
                                    <div class="site-nav__profile-summary">
                                        ${renderUserAvatar('site-nav__profile-summary-avatar')}
                                        <div>
                                            <strong>${userState.name || 'Mi cuenta'}</strong>
                                            <span>${profileRoleLabel}</span>
                                        </div>
                                    </div>
                                    <a href="#/perfil" class="site-nav__profile-link" role="menuitem">
                                        ${Icons.user}
                                        <span>Mi perfil</span>
                                    </a>
                                    <a href="#/compras" class="site-nav__profile-link" role="menuitem">
                                        ${Icons.grid}
                                        <span>Mis compras</span>
                                    </a>
                                    <a href="#/configuracion" class="site-nav__profile-link" role="menuitem">
                                        ${Icons.settings}
                                        <span>Configuración de mi cuenta</span>
                                    </a>
                                    <a href="#/certificados" class="site-nav__profile-link" role="menuitem">
                                        ${Icons.award}
                                        <span>Mis certificados</span>
                                    </a>
                                    <button class="site-nav__profile-link site-nav__profile-link--button" type="button" id="nav-logout-button" role="menuitem">
                                        ${Icons.lock}
                                        <span>Salir</span>
                                    </button>
                                </div>
                            </div>
                            ${renderTabletMenuToggle()}
                        </div>
                    </div>
                    ${renderMobileMenu({
                        eyebrow: 'educatIA',
                        title: mobilePageLabel,
                        userName: userState.name || 'Mi cuenta',
                        userRole: profileRoleLabel,
                        sections: [
                            {
                                title: 'Navegación',
                                items: [
                                    { href: '#/dashboard', label: 'Mi aprendizaje', active: studentLearningActive },
                                    { href: '#/explorar', label: 'Explorar', active: studentExploreActive },
                                    { href: exaniPracticePath, label: 'Exámenes práctica', active: studentExamPracticeActive },
                                    { href: appUrl('/simuladores-exani'), label: 'Simulacros', active: studentSimulacrosActive },
                                    { href: '#/laboratorio-aprendizaje', label: 'Laboratorio', active: studentLabActive },
                                    { href: '#/calificaciones', label: 'Calificaciones', active: studentGradesActive },
                                ],
                            },
                            {
                                title: 'Cuenta',
                                items: [
                                    { href: '#/notificaciones', label: 'Notificaciones', active: currentHash.startsWith('/notificaciones') },
                                    { href: '#/perfil', label: 'Mi perfil', active: currentHash.startsWith('/perfil') },
                                    { href: '#/compras', label: 'Mis compras', active: currentHash.startsWith('/compras') },
                                    { href: '#/certificados', label: 'Mis certificados', active: currentHash.startsWith('/certificados') },
                                    { href: '#/configuracion', label: 'Configuración', active: currentHash.startsWith('/configuracion') },
                                    { action: 'logout', label: 'Cerrar sesión', variant: 'danger' },
                                ],
                            },
                        ],
                    })}
                    ${renderMobileIsland([
                        { href: '#/explorar', label: 'Explorar', active: studentExploreActive },
                        { href: '#/dashboard', label: 'Aprendizaje', active: studentLearningActive },
                        { href: exaniPracticePath, label: 'Práctica', active: studentExamPracticeActive },
                        { action: 'menu', label: 'Menú' },
                    ])}
                `;
            } else {
                header.innerHTML = `
                    <div class="site-nav__inner">
                        <div class="site-nav__brand site-nav__brand--public">
                            <a href="#/" class="site-nav__logo" aria-label="educatIA, inicio">${renderBrandLogo()}</a>
                            <div class="site-nav__student-menu site-nav__student-menu--brand">
                                <button class="site-nav__student-menu-toggle" type="button" id="student-nav-toggle" aria-haspopup="menu" aria-expanded="false" aria-controls="student-nav-dropdown">
                                    <span>Menu</span>
                                    ${Icons.chevronDown}
                                </button>
                                <nav class="site-nav__student-menu-dropdown" id="student-nav-dropdown" role="menu" aria-hidden="true">
                                    <a href="#/dashboard" class="${studentLearningActive ? 'active' : ''}" role="menuitem">Mi aprendizaje</a>
                                    <a href="#/explorar" class="${studentExploreActive ? 'active' : ''}" role="menuitem">Explorar</a>
                                    <a href="${appUrl('/simuladores-exani')}" class="${studentSimulacrosActive ? 'active' : ''}" role="menuitem">Simulacros</a>
                                    <a href="${exaniPracticePath}" class="${studentExamPracticeActive ? 'active' : ''}" role="menuitem">Práctica</a>
                                    <a href="#/laboratorio-aprendizaje" class="${studentLabActive ? 'active' : ''}" role="menuitem">Laboratorio</a>
                                    <a href="#/calificaciones" class="${studentGradesActive ? 'active' : ''}" role="menuitem">Calificaciones</a>
                                    <a href="#/precios" class="${pricingActive ? 'active' : ''}" role="menuitem">Planes</a>
                                </nav>
                            </div>
                            ${renderMobileContext(profileRoleLabel, mobilePageLabel)}
                            <div class="site-nav__student-menu">
                                <button class="site-nav__student-menu-toggle" type="button" id="student-nav-toggle" aria-haspopup="menu" aria-expanded="false" aria-controls="student-nav-dropdown">
                                    <span>${escapeHtml(mobilePageLabel)}</span>
                                    ${Icons.chevronDown}
                                </button>
                                <nav class="site-nav__student-menu-dropdown" id="student-nav-dropdown" role="menu" aria-hidden="true">
                                    <a href="#/explorar" class="${studentExploreActive ? 'active' : ''}" role="menuitem">Explorar</a>
                                    <a href="#/dashboard" class="${studentLearningActive ? 'active' : ''}" role="menuitem">Mi aprendizaje</a>
                                    <a href="${exaniPracticePath}" class="${studentExamPracticeActive ? 'active' : ''}" role="menuitem">Práctica</a>
                                    <a href="${appUrl('/simuladores-exani')}" class="${studentSimulacrosActive ? 'active' : ''}" role="menuitem">Simulacros</a>
                                    <a href="#/laboratorio-aprendizaje" class="${studentLabActive ? 'active' : ''}" role="menuitem">Laboratorio</a>
                                    <a href="#/calificaciones" class="${studentGradesActive ? 'active' : ''}" role="menuitem">Calificaciones</a>
                                </nav>
                            </div>
                            <button type="button" class="site-nav__explorer-toggle" id="explorar-toggle" aria-expanded="false" aria-controls="explorar-dropdown">Explorar</button>
                            <a href="#/precios" class="site-nav__public-link ${pricingActive ? 'active' : ''}">Costos</a>
                        </div>

                        <div class="site-nav__search site-nav__search--public">
                            <input type="text" id="site-search-input" placeholder="Busca rutas, áreas o cursos" aria-label="Buscar cursos">
                            <button type="button" class="site-nav__search-button" id="site-search-button" aria-label="Buscar cursos">
                                ${Icons.search}
                            </button>
                        </div>

                        <div class="site-nav__actions">
                            <button class="site-nav__icon-btn" onclick="window.EducatIA.Router.navigate('/notificaciones')" id="nav-notifications">
                                ${Icons.bell}
                                <span class="site-nav__badge"></span>
                            </button>
                            ${renderPremiumBadge()}
                            <button class="site-nav__icon-btn" onclick="window.EducatIA.Router.navigate('/perfil')" id="nav-profile">
                                ${Icons.user}
                            </button>
                            <button class="site-nav__icon-btn" onclick="window.EducatIA.Router.navigate('/configuracion')" id="nav-settings">
                                ${Icons.settings}
                            </button>
                            ${renderTabletMenuToggle()}
                        </div>
                    </div>
                    ${dropdownHTML}
                    ${renderMobileMenu({
                        eyebrow: 'educatIA',
                        title: mobilePageLabel,
                        userName: userState.name || 'Mi cuenta',
                        userRole: profileRoleLabel,
                        sections: [
                            {
                                title: 'Principal',
                                items: [
                                    {
                                        href: dashLink,
                                        label: userState.role === 'maestro' ? 'Panel docente' : 'Mi aprendizaje',
                                        active: userState.role === 'maestro' ? isTeacherDashboardActive : studentLearningActive,
                                    },
                                    { href: '#/explorar', label: 'Explorar', active: studentExploreActive },
                                    { href: '#/precios', label: 'Costos', active: pricingActive },
                                    canAccessStudentViews() ? { href: exaniPracticePath, label: 'Exámenes práctica', active: studentExamPracticeActive } : null,
                                    canAccessStudentViews() ? { href: appUrl('/simuladores-exani'), label: 'Simulacros', active: studentSimulacrosActive } : null,
                                    canAccessStudentViews() ? { href: '#/laboratorio-aprendizaje', label: 'Laboratorio', active: studentLabActive } : null,
                                    canAccessStudentViews() ? { href: '#/calificaciones', label: 'Calificaciones', active: studentGradesActive } : null,
                                ],
                            },
                            {
                                title: 'Cuenta',
                                items: [
                                    { href: '#/notificaciones', label: 'Notificaciones', active: currentHash.startsWith('/notificaciones') },
                                    { href: '#/perfil', label: 'Mi perfil', active: currentHash.startsWith('/perfil') },
                                    { href: '#/compras', label: 'Mis compras', active: currentHash.startsWith('/compras') },
                                    { href: '#/certificados', label: 'Mis certificados', active: currentHash.startsWith('/certificados') },
                                    { href: '#/configuracion', label: 'Configuración', active: currentHash.startsWith('/configuracion') },
                                    { action: 'logout', label: 'Cerrar sesión', variant: 'danger' },
                                ],
                            },
                        ],
                    })}
                    ${renderMobileIsland([
                        {
                            href: dashLink,
                            label: userState.role === 'maestro' ? 'Panel' : 'Inicio',
                            active: userState.role === 'maestro' ? isTeacherDashboardActive : studentLearningActive,
                        },
                        { href: '#/explorar', label: 'Explorar', active: studentExploreActive },
                        { href: '#/precios', label: 'Costos', active: pricingActive },
                        { action: 'menu', label: 'Menú' },
                    ])}
                `;
            }
        } else {
            header.innerHTML = `
                <div class="site-nav__inner site-nav__inner--public site-nav__inner--coursera">
                    <div class="site-nav__brand site-nav__brand--public">
                        <a href="#/" class="site-nav__logo site-nav__logo--coursera" aria-label="educatIA, inicio">
                            ${renderBrandLogo('site-nav__logo-clip--public')}
                        </a>
                        ${renderMobileContext('educatIA', mobilePageLabel)}
                        <button type="button" class="site-nav__explorer-toggle ${currentHash.startsWith('/explorar') || currentHash.startsWith('/materia') ? 'active' : ''}" id="explorar-toggle" aria-expanded="false" aria-controls="explorar-dropdown">Explorar</button>
                        <a href="#/precios" class="site-nav__public-link ${pricingActive ? 'active' : ''}">Costos</a>
                    </div>

                    <div class="site-nav__search site-nav__search--public">
                        <input type="text" id="site-search-input" placeholder="¿Qué deseas aprender?" aria-label="Buscar cursos">
                        <button type="button" class="site-nav__search-button" id="site-search-button" aria-label="Buscar cursos">
                            ${Icons.search}
                        </button>
                    </div>

                    <div class="site-nav__actions site-nav__actions--public">
                        <a href="#/login" class="site-nav__link site-nav__link--quiet">Iniciar Sesión</a>
                        <a href="#/registro-alumno" class="btn btn--primary site-nav__cta">Registrarme gratis</a>
                        ${renderTabletMenuToggle()}
                    </div>
                </div>
                ${dropdownHTML}
                ${renderMobileMenu({
                    eyebrow: 'educatIA',
                    title: mobilePageLabel,
                    sections: [
                        {
                            title: 'Navegación',
                            items: [
                                { href: '#/', label: 'Inicio', active: currentHash === '/' },
                                { href: '#/explorar', label: 'Explorar cursos', active: currentHash.startsWith('/explorar') || currentHash.startsWith('/materia') },
                                { href: '#/precios', label: 'Costos', active: pricingActive },
                            ],
                        },
                        {
                            title: 'Acceso',
                            items: [
                                { href: '#/login', label: 'Iniciar sesión', active: currentHash.startsWith('/login') },
                                { href: '#/registro-alumno', label: 'Crear cuenta', variant: 'cta' },
                            ],
                        },
                    ],
                })}
                ${renderMobileIsland([
                    { href: '#/', label: 'Inicio', active: currentHash === '/' },
                    { href: '#/explorar', label: 'Explorar', active: currentHash.startsWith('/explorar') || currentHash.startsWith('/materia') },
                    { href: '#/precios', label: 'Costos', active: pricingActive },
                    { action: 'menu', label: 'Menu' },
                ])}
            `;
        }

        // Mobile menu toggle
        const toggles = header.querySelectorAll('[data-mobile-menu-toggle]');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeBtn = document.getElementById('mobile-menu-close');
        if (toggles.length && mobileMenu) {
            const syncMobileMenuState = (isOpen) => {
                mobileMenu.hidden = !isOpen;
                mobileMenu.setAttribute('aria-hidden', String(!isOpen));
                toggles.forEach((toggle) => {
                    toggle.setAttribute('aria-expanded', String(isOpen));
                    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

                    if (toggle.dataset.mobileMenuToggleKind === 'text') {
                        toggle.textContent = isOpen ? 'Cerrar' : (toggle.dataset.mobileMenuToggleLabel || 'Menu');
                    } else {
                        toggle.innerHTML = isOpen ? Icons.x : Icons.menu;
                    }
                });
                // Lock body scroll when menu is open
                document.body.style.overflow = isOpen ? 'hidden' : '';
                document.body.classList.toggle('mobile-menu-open', isOpen);
            };

            const closeMobileMenu = () => {
                mobileMenu.classList.remove('active');
                syncMobileMenuState(false);
            };

            syncMobileMenuState(mobileMenu.classList.contains('active'));
            toggles.forEach((toggle) => {
                toggle.addEventListener('click', () => {
                    const isOpen = !mobileMenu.classList.contains('active');
                    mobileMenu.classList.toggle('active', isOpen);
                    syncMobileMenuState(isOpen);
                });
            });

            // Close button inside mobile menu
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileMenu);
            }

            mobileMenu.addEventListener('click', (event) => {
                if (event.target === mobileMenu) {
                    closeMobileMenu();
                }
            });

            // Auto-close menu when a link is clicked
            mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
                link.addEventListener('click', () => {
                    closeMobileMenu();
                });
            });

            mobileMenu.querySelectorAll('[data-mobile-action="logout"]').forEach((button) => {
                button.addEventListener('click', () => {
                    closeMobileMenu();
                    logoutWithTransition();
                });
            });
        }

        const siteSearchInput = document.getElementById('site-search-input');
        const siteSearchButton = document.getElementById('site-search-button');
        if (siteSearchInput && siteSearchButton) {
            const submitSearch = () => {
                const query = siteSearchInput.value.trim();
                navigateToExplore(query);
            };

            siteSearchButton.addEventListener('click', submitSearch);
            siteSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    submitSearch();
                }
            });
        }

        const joinFreeButton = document.getElementById('nav-join-free');
        if (joinFreeButton) {
            joinFreeButton.addEventListener('click', requestRegisterFlow);
        }

        const premiumAccessButton = document.getElementById('nav-premium-access');
        if (premiumAccessButton) {
            premiumAccessButton.addEventListener('click', async () => {
                if (!window.EducatIA.Router?.navigate) {
                    window.location.href = '#/precios';
                    return;
                }

                window.EducatIA.Router.navigate('/precios');
            });
        }

        const homeSectionLink = header.querySelector('[data-home-section]');
        if (homeSectionLink) {
            homeSectionLink.addEventListener('click', (event) => {
                event.preventDefault();
                navigateToHomeSection(homeSectionLink.dataset.homeSection);
            });
        }

        const profileToggle = document.getElementById('nav-profile-toggle');
        const profileDropdown = document.getElementById('nav-profile-dropdown');
        const logoutButton = document.getElementById('nav-logout-button');
        if (profileToggle && profileDropdown) {
            const closeProfileDropdown = () => {
                profileDropdown.classList.remove('active');
                profileToggle.setAttribute('aria-expanded', 'false');
                profileDropdown.setAttribute('aria-hidden', 'true');
            };

            profileToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                const willOpen = !profileDropdown.classList.contains('active');
                profileDropdown.classList.toggle('active', willOpen);
                profileToggle.setAttribute('aria-expanded', String(willOpen));
                profileDropdown.setAttribute('aria-hidden', String(!willOpen));
            });

            profileDropdown.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            renderNav._profileDocHandler = (event) => {
                if (!profileDropdown.contains(event.target) && !profileToggle.contains(event.target)) {
                    closeProfileDropdown();
                }
            };

            document.addEventListener('click', renderNav._profileDocHandler);

            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    closeProfileDropdown();
                    logoutWithTransition();
                });
            }
        }

        const studentMenuToggle = document.getElementById('student-nav-toggle');
        const studentMenuDropdown = document.getElementById('student-nav-dropdown');
        if (studentMenuToggle && studentMenuDropdown) {
            const closeStudentMenu = () => {
                studentMenuDropdown.classList.remove('active');
                studentMenuToggle.setAttribute('aria-expanded', 'false');
                studentMenuDropdown.setAttribute('aria-hidden', 'true');
            };

            studentMenuToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                const willOpen = !studentMenuDropdown.classList.contains('active');
                studentMenuDropdown.classList.toggle('active', willOpen);
                studentMenuToggle.setAttribute('aria-expanded', String(willOpen));
                studentMenuDropdown.setAttribute('aria-hidden', String(!willOpen));
            });

            studentMenuDropdown.addEventListener('click', (event) => {
                event.stopPropagation();
                closeStudentMenu();
            });

            renderNav._studentMenuDocHandler = (event) => {
                if (!studentMenuDropdown.contains(event.target) && !studentMenuToggle.contains(event.target)) {
                    closeStudentMenu();
                }
            };
            document.addEventListener('click', renderNav._studentMenuDocHandler);
        }

        // Explorar dropdown toggle
        const explorarToggle = document.getElementById('explorar-toggle');
        const explorarDropdown = document.getElementById('explorar-dropdown');
        if (explorarToggle && explorarDropdown) {
            const closeExploreDropdown = () => {
                explorarDropdown.classList.remove('active');
                explorarToggle.setAttribute('aria-expanded', 'false');
            };

            explorarDropdown.querySelectorAll('.dropdown-link').forEach((link) => {
                link.addEventListener('click', () => {
                    const query = link.dataset.exploreQuery || resolveExploreQueryFromLabel(link.textContent || '');
                    window.sessionStorage.setItem('educatia_explore_query', query);
                    closeExploreDropdown();
                });
            });

            explorarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = explorarDropdown.classList.contains('active');
                explorarDropdown.classList.toggle('active', !isOpen);
                explorarToggle.setAttribute('aria-expanded', String(!isOpen));
            });

            renderNav._dropdownDocHandler = (e) => {
                if (!explorarDropdown.contains(e.target) && !explorarToggle.contains(e.target)) {
                    closeExploreDropdown();
                }
            };

            document.addEventListener('click', renderNav._dropdownDocHandler);
        }
    }


    function updateNav(hash) {
        renderNav();
    }

    // ===== SIDEBAR =====
    function renderSidebar(activeItem) {
        const role = userState.role || 'alumno';
        const practiceHref = window.EducatIA.Utils?.exaniPracticeUrl?.() || '/simuladores-exani/practica-por-modulos';
        const items = role === 'admin' ? [
            { id: 'dashboard', icon: Icons.home, label: 'Mi aprendizaje', href: '#/dashboard' },
            { id: 'explorar', icon: Icons.compass, label: 'Explorar', href: '#/explorar' },
            { id: 'practica', icon: Icons.target, label: 'Exámenes práctica', href: practiceHref },
            { id: 'simuladores', icon: Icons.target, label: 'Simulacros', href: appUrl('/simuladores-exani') },
            { id: 'laboratorio', icon: Icons.cpu, label: 'Laboratorio', href: '#/laboratorio-aprendizaje' },
            { id: 'calificaciones', icon: Icons.star, label: 'Calificaciones', href: '#/calificaciones' },
            { id: 'divider1', divider: true },
            { id: 'notificaciones', icon: Icons.bell, label: 'Notificaciones', href: '#/notificaciones' },
            { id: 'perfil', icon: Icons.user, label: 'Perfil', href: '#/perfil' },
            { id: 'configuracion', icon: Icons.settings, label: 'Configuración', href: '#/configuracion' },
        ] : role === 'maestro' ? [
            { id: 'dashboard', icon: Icons.home, label: 'Panel docente', href: '#/dashboard-maestro' },
            { id: 'cursos', icon: Icons.book, label: 'Cursos creados', href: '#/dashboard-maestro' },
            { id: 'alumnos', icon: Icons.users, label: 'Estudiantes', href: '#/dashboard-maestro' },
            { id: 'analytics', icon: Icons.barChart, label: 'Rendimiento', href: '#/dashboard-maestro' },
            { id: 'explorar', icon: Icons.compass, label: 'Explorar', href: '#/explorar' },
            { id: 'divider1', divider: true },
            { id: 'notificaciones', icon: Icons.bell, label: 'Notificaciones', href: '#/notificaciones' },
            { id: 'perfil', icon: Icons.user, label: 'Perfil', href: '#/perfil' },
            { id: 'configuracion', icon: Icons.settings, label: 'Configuración', href: '#/configuracion' },
        ] : [
            { id: 'dashboard', icon: Icons.home, label: 'Mi aprendizaje', href: '#/dashboard' },
            { id: 'cursos', icon: Icons.book, label: 'Cursos inscritos', href: '#/dashboard' },
            { id: 'explorar', icon: Icons.compass, label: 'Explorar', href: '#/explorar' },
            { id: 'practica', icon: Icons.target, label: 'Exámenes práctica', href: practiceHref },
            { id: 'simuladores', icon: Icons.target, label: 'Simulacros', href: appUrl('/simuladores-exani') },
            { id: 'laboratorio', icon: Icons.cpu, label: 'Laboratorio', href: '#/laboratorio-aprendizaje' },
            { id: 'calificaciones', icon: Icons.star, label: 'Calificaciones', href: '#/calificaciones' },
            { id: 'divider1', divider: true },
            { id: 'notificaciones', icon: Icons.bell, label: 'Notificaciones', href: '#/notificaciones' },
            { id: 'configuracion', icon: Icons.settings, label: 'Configuración', href: '#/configuracion' },
        ];

        let html = '<div class="sidebar__section">';
    html += `<div class="sidebar__section-title">${role === 'maestro' ? 'Docente' : 'Estudiante'}</div>`;

        items.forEach(item => {
            if (item.divider) {
                html += '</div><div class="sidebar__section"><div class="sidebar__section-title">General</div>';
                return;
            }
            const isActive = activeItem === item.id;
            html += `
                <a href="${item.href}" class="sidebar__link ${isActive ? 'active' : ''}" data-sidebar="${item.id}">
                    ${item.icon}
                    <span>${item.label}</span>
                    ${item.badge ? `<span class="sidebar__link-badge">${item.badge}</span>` : ''}
                </a>
            `;
        });

        html += '</div>';
        return html;
    }

    // ===== FOOTER =====
    function renderFooter() {
        const footer = document.getElementById('site-footer');
        if (!footer) return;

        if (renderFooter._footerClickHandler) {
            footer.removeEventListener('click', renderFooter._footerClickHandler);
            renderFooter._footerClickHandler = null;
        }

        const currentHash = window.EducatIA.Router?.getPath?.() || window.location.hash.slice(1) || '/';

        const isFocusedExperience = currentHash.startsWith('/leccion')
            || currentHash.startsWith('/laboratorio-aprendizaje/experimento')
            || currentHash.startsWith('/simuladores-exani');
        const isAuthRoute = currentHash.startsWith('/login') || currentHash.startsWith('/registro') || currentHash.startsWith('/oauth-callback');
        if (isFocusedExperience || isAuthRoute) {
            footer.innerHTML = '';
            footer.className = '';
            return;
        }

        footer.className = 'site-footer';

        const toAppUrl = window.EducatIA.Router?.toUrl || function (path) { return path; };
        const learningLink = userState.loggedIn
            ? userState.role === 'maestro'
                ? toAppUrl('/dashboard-maestro')
                : toAppUrl('/dashboard')
            : toAppUrl('/login');

        footer.innerHTML = `
            <div class="container">
                <div class="footer__grid">
                    <div class="footer__brand">
                        <div class="footer__logo">educatIA</div>
                        <div class="footer__brand-badge">Preparación académica y formación en IA</div>
                        <p class="footer__desc">Preparación EXANI y cursos de formación en inteligencia artificial. Conoce los temarios, las modalidades y tu siguiente etapa de aprendizaje.</p>
                        <div class="footer__meta">
                            <span>Preparación EXANI-I y EXANI-II</span>
                            <span>Programas de ingeniería en IA</span>
                            <span>Estudia a tu ritmo con una ruta clara</span>
                        </div>
                        <div class="footer__social">
                            <a href="#/" class="footer__social-link" data-home-section="nosotros" aria-label="Sobre educatIA">${Icons.globe}</a>
                            <a href="#/" class="footer__social-link" data-home-section="landing-rutas" aria-label="Rutas educatIA">${Icons.users}</a>
                            <a href="mailto:?subject=Consulta%20educatIA&body=Hola%20equipo%20educatIA,%20quisiera%20informacion%20sobre%20la%20plataforma." class="footer__social-link" aria-label="Escríbenos">${Icons.mail}</a>
                        </div>
                    </div>
                    <div>
                        <div class="footer__column-title">Descubrir</div>
                        <a href="${toAppUrl('/explorar')}" class="footer__link">Explorar cursos</a>
                        <a href="${toAppUrl('/info/formacion-ia')}" class="footer__link">Programas de inteligencia artificial</a>
                        <a href="${toAppUrl('/explorar#exm-catalog')}" class="footer__link">Temario EXANI-II</a>
                        <a href="${toAppUrl('/onboarding')}" class="footer__link">Personalizar mi ruta</a>
                        <a href="${toAppUrl('/simuladores-exani')}" class="footer__link">Simulacros</a>
                        <a href="${toAppUrl('/laboratorio-aprendizaje')}" class="footer__link">Laboratorio</a>
                    </div>
                    <div>
                        <div class="footer__column-title">Materias EXANI</div>
                        <a href="${toAppUrl('/explorar?q=aritmetica')}" class="footer__link">Matemáticas</a>
                        <a href="${toAppUrl('/explorar?q=comprension%20lectora')}" class="footer__link">Comprensión lectora</a>
                        <a href="${toAppUrl('/explorar?q=ciencias%20sociales')}" class="footer__link">Ciencias sociales</a>
                        <a href="${toAppUrl('/explorar?q=fisica')}" class="footer__link">Física</a>
                        <a href="${toAppUrl('/explorar?q=quimica')}" class="footer__link">Química</a>
                        <a href="${toAppUrl('/explorar?q=premedicina')}" class="footer__link">Premedicina</a>
                    </div>
                    <div>
                        <div class="footer__column-title">Aprendizaje</div>
                        <a href="${learningLink}" class="footer__link">Mi aprendizaje</a>
                        <a href="${toAppUrl('/onboarding')}" class="footer__link">Personalizar mi ruta</a>
                        <a href="${toAppUrl('/calificaciones')}" class="footer__link">Mis resultados</a>
                        <a href="${toAppUrl('/precios')}" class="footer__link">Planes y precios</a>
                        <a href="${toAppUrl('/login')}" class="footer__link">Iniciar sesión</a>
                    </div>
                    <div>
                        <div class="footer__column-title">Proyecto</div>
                        <a href="${toAppUrl('/info/proyecto')}" class="footer__link">educatIA</a>
                        <a href="${toAppUrl('/info/ayuda')}" class="footer__link">Centro de ayuda</a>
                        <a href="${toAppUrl('/info/accesibilidad')}" class="footer__link">Accesibilidad</a>
                        <a href="${toAppUrl('/info/privacidad')}" class="footer__link">Privacidad</a>
                        <a href="${toAppUrl('/info/terminos')}" class="footer__link">Términos</a>
                        <a href="${toAppUrl('/info/legal')}" class="footer__link">Legal</a>
                    </div>
                </div>
                <div class="footer__bottom">
                    <div class="footer__closing">Elige tu programa y avanza con una ruta de aprendizaje clara.</div>
                    <span class="footer__copyright">© 2026 educatIA · Plataforma de preparación académica.</span>
                    <div class="footer__bottom-links">
                        <a href="${toAppUrl('/info/privacidad')}" class="footer__bottom-link">Privacidad</a>
                        <a href="${toAppUrl('/info/terminos')}" class="footer__bottom-link">Términos</a>
                        <a href="${toAppUrl('/info/cookies')}" class="footer__bottom-link">Cookies</a>
                        <a href="${toAppUrl('/info/legal')}" class="footer__bottom-link">Legal</a>
                    </div>
                </div>
            </div>
            ${renderFooterInfoModal()}
        `;

        renderFooter._footerClickHandler = (event) => {
            const scrollLink = event.target.closest('[data-footer-scroll]');
            if (scrollLink) {
                event.preventDefault();
                navigateToHomeSection(scrollLink.dataset.footerScroll);
                return;
            }

            const queryLink = event.target.closest('[data-explore-query]');
            if (queryLink) {
                event.preventDefault();
                navigateToExplore(queryLink.dataset.exploreQuery || '');
                return;
            }

            const homeLink = event.target.closest('[data-home-section]');
            if (homeLink) {
                event.preventDefault();
                navigateToHomeSection(homeLink.dataset.homeSection);
                return;
            }

            const infoLink = event.target.closest('[data-footer-info]');
            if (infoLink) {
                event.preventDefault();
                openFooterInfoModal(infoLink.dataset.footerInfo);
                return;
            }

            const closeInfo = event.target.closest('[data-close-footer-info]');
            if (closeInfo) {
                event.preventDefault();
                closeFooterInfoModal();
            }
        };

        footer.addEventListener('click', renderFooter._footerClickHandler);

        const infoModal = document.getElementById('footer-info-modal');
        if (infoModal) {
            infoModal.addEventListener('click', (event) => {
                if (event.target === infoModal || event.target.closest('[data-close-footer-info]')) {
                    closeFooterInfoModal();
                }
            });
        }
    }

    // ===== CHAT WIDGET =====
    function renderChatPanel() {
        return `
            <div class="chat-panel open" id="chat-panel">
                <div class="chat-panel__header">
                    <div class="chat-panel__title">
                        ${renderTeacherAvatar()}
                        <div>
                            <div style="font-weight:700; color:var(--text-primary); line-height:1.1;">Bill</div>
                            <div style="font-size:12px; color:var(--text-tertiary); line-height:1.1; margin-top:4px;">Tutor IA del curso</div>
                        </div>
                    </div>
                    <button class="btn btn--ghost btn--sm" onclick="document.getElementById('chat-panel').classList.toggle('open')">
                        ${Icons.x}
                    </button>
                </div>
                <div class="chat-panel__messages" id="chat-messages">
                    <div class="chat-message chat-message--bot">
                        Soy Bill. Cuando este curso tenga materiales procesados, podré responder con base en su contenido, resumir conceptos y ayudarte a estudiar.
                        <div class="chat-message__time">Ahora</div>
                    </div>
                </div>
                <div class="chat-panel__input-area">
                    <input type="text" class="chat-panel__input" id="chat-input" placeholder="Pregúntale a Bill sobre esta lección">
                    <button class="chat-panel__send" id="chat-send-btn">
                        ${Icons.send}
                    </button>
                </div>
            </div>
        `;
    }

    function initChatInteraction(courseId) {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        const messages = document.getElementById('chat-messages');

        if (!input || !sendBtn || !messages) return;

        const sendMessage = async () => {
            const text = input.value.trim();
            if (!text) return;

            // User message
            messages.innerHTML += `
                <div class="chat-message chat-message--user">
                    ${window.EducatIA.Utils.escapeHtml(text)}
                    <div class="chat-message__time">Ahora</div>
                </div>
            `;
            input.value = '';
            messages.scrollTop = messages.scrollHeight;

            // Show typing indicator
            const typingId = 'typing-' + Date.now();
            messages.innerHTML += `
                <div class="chat-message chat-message--bot animate-fade-in" id="${typingId}">
                    Bill está pensando...
                    <div class="chat-message__time">Ahora</div>
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;

            try {
                const API = window.EducatIA.API;
                if (API && courseId) {
                    const res = await API.chat(text, courseId);
                    const typingEl = document.getElementById(typingId);
                    if (typingEl) {
                        typingEl.innerHTML = `
                            ${window.EducatIA.Utils.escapeHtml(res.respuesta).replace(/\n/g, '<br>')}
                            ${res.fuentes && res.fuentes.length ? '<div style="margin-top:8px;font-size:11px;color:var(--text-tertiary);">Fuentes: ' + res.fuentes.map(f => window.EducatIA.Utils.escapeHtml(f.source_name || 'material')).join(', ') + '</div>' : ''}
                            <div class="chat-message__time">Ahora</div>
                        `;
                    }
                } else {
                    throw new Error('Sin contexto');
                }
            } catch (err) {
                const typingEl = document.getElementById(typingId);
                if (typingEl) {
                    typingEl.innerHTML = `
                        Aún no tengo suficiente contexto del curso para responder con precisión. Cuando el docente publique materiales y se procesen, podré ayudarte mejor.
                        <div class="chat-message__time">Ahora</div>
                    `;
                }
            }
            messages.scrollTop = messages.scrollHeight;
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function ensureWebNoticeHost() {
        let host = document.getElementById('web-notice-host');
        if (host) return host;

        host = document.createElement('div');
        host.id = 'web-notice-host';
        host.setAttribute('aria-live', 'polite');
        host.style.position = 'fixed';
        host.style.top = 'calc(var(--nav-height, 84px) + 16px)';
        host.style.right = '16px';
        host.style.zIndex = '1200';
        host.style.display = 'grid';
        host.style.gap = '12px';
        host.style.maxWidth = 'min(380px, calc(100vw - 32px))';
        document.body.appendChild(host);
        return host;
    }

    function showWebNotice(title, message, tone) {
        const palette = {
            success: { border: '#059669', glow: 'rgba(5, 150, 105, 0.16)' },
            error: { border: '#B42318', glow: 'rgba(180, 35, 24, 0.14)' },
            info: { border: '#0056D2', glow: 'rgba(0, 86, 210, 0.14)' }
        };
        const colors = palette[tone] || palette.info;
        const host = ensureWebNoticeHost();
        const notice = document.createElement('div');
        notice.setAttribute('role', 'status');
        notice.style.background = 'rgba(255,255,255,0.98)';
        notice.style.border = '1px solid rgba(15, 23, 42, 0.08)';
        notice.style.borderLeft = `4px solid ${colors.border}`;
        notice.style.borderRadius = '18px';
        notice.style.boxShadow = `0 18px 40px ${colors.glow}`;
        notice.style.padding = '14px 16px';
        notice.style.backdropFilter = 'blur(10px)';
        notice.style.transform = 'translateY(-6px)';
        notice.style.opacity = '0';
        notice.style.transition = 'opacity 180ms ease, transform 180ms ease';

        const titleEl = document.createElement('div');
        titleEl.style.fontSize = '14px';
        titleEl.style.fontWeight = '800';
        titleEl.style.color = 'var(--text-primary)';
        titleEl.textContent = title || 'Aviso';

        const messageEl = document.createElement('div');
        messageEl.style.fontSize = '13px';
        messageEl.style.lineHeight = '1.55';
        messageEl.style.marginTop = '6px';
        messageEl.style.color = 'var(--text-secondary)';
        messageEl.textContent = message || '';

        notice.appendChild(titleEl);
        notice.appendChild(messageEl);
        host.appendChild(notice);

        window.requestAnimationFrame(() => {
            notice.style.opacity = '1';
            notice.style.transform = 'translateY(0)';
        });

        window.setTimeout(() => {
            notice.style.opacity = '0';
            notice.style.transform = 'translateY(-6px)';
            window.setTimeout(() => notice.remove(), 220);
        }, 4200);
    }

    function confirmAction(options = {}) {
        const esc = window.EducatIA.Utils?.escapeHtml || ((value) => String(value ?? ''));
        const title = esc(options.title || 'Confirma esta acción');
        const message = esc(options.message || 'Revisa la información antes de continuar.');
        const confirmLabel = esc(options.confirmLabel || 'Continuar');
        const cancelLabel = esc(options.cancelLabel || 'Cancelar');
        const tone = options.tone === 'danger' ? ' action-dialog__confirm--danger' : '';

        document.getElementById('educatia-action-dialog')?.remove();
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.id = 'educatia-action-dialog';
            overlay.className = 'action-dialog';
            overlay.setAttribute('role', 'presentation');
            overlay.innerHTML = `
                <section class="action-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title" aria-describedby="action-dialog-message">
                    <span class="action-dialog__brand">educatIA</span>
                    <h2 id="action-dialog-title">${title}</h2>
                    <p id="action-dialog-message">${message}</p>
                    <div class="action-dialog__actions">
                        <button type="button" class="btn btn--outline" data-action-dialog-cancel>${cancelLabel}</button>
                        <button type="button" class="btn btn--primary${tone}" data-action-dialog-confirm>${confirmLabel}</button>
                    </div>
                </section>`;
            document.body.appendChild(overlay);

            let settled = false;
            const close = (value) => {
                if (settled) return;
                settled = true;
                document.removeEventListener('keydown', onKeydown);
                overlay.classList.remove('is-visible');
                window.setTimeout(() => overlay.remove(), 180);
                resolve(value);
            };
            const onKeydown = (event) => {
                if (event.key === 'Escape') close(false);
            };
            overlay.querySelector('[data-action-dialog-cancel]')?.addEventListener('click', () => close(false));
            overlay.querySelector('[data-action-dialog-confirm]')?.addEventListener('click', () => close(true));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) close(false);
            });
            document.addEventListener('keydown', onKeydown);
            window.requestAnimationFrame(() => {
                overlay.classList.add('is-visible');
                overlay.querySelector('[data-action-dialog-confirm]')?.focus();
            });
        });
    }

    return {
        renderNav,
        renderFooter,
        renderSidebar,
        renderChatPanel,
        initChatInteraction,
        updateNav,
        requireAuth,
        setLoggedIn,
        setLoggedOut,
        refreshAleEntitlement,
        isAdminRole,
        canAccessStudentViews,
        canAccessTeacherViews,
        hasPremiumAccess,
        renderLoading,
        renderLoadingBlock,
        showExperienceTransition,
        logoutWithTransition,
        renderUserAvatar,
        userState,
        showWebNotice,
        confirmAction,
        Icons
    };
})();
