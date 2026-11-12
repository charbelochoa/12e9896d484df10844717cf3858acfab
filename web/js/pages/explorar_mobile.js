/* ================================================================
   educatIA - Explorar Mobile EXANI-II
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.ExplorarMobile = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const toUrl = (path) => window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    const MODULES = window.EducatIA.ExaniModules || [];
    const GROUPS = ['Todos', 'Matematicas', 'Experimentales', 'Sociales', 'Humanidades', 'Salud', 'Generales'];

    let activeGroup = 'Todos';
    let searchQuery = '';
    let openModuleId = 'aritmetica';

    function allTopics(module) {
        return module.subareas.flatMap((subarea) => subarea.topics);
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function searchable(module) {
        return normalizeSearchText([
            module.title,
            module.group,
            module.type,
            module.summary,
            ...module.subareas.map((subarea) => subarea.title),
            ...allTopics(module)
        ].join(' '));
    }

    function filteredModules() {
        const query = normalizeSearchText(searchQuery.trim());
        return MODULES.filter((module) => {
            const groupOk = activeGroup === 'Todos' || module.group === activeGroup;
            const queryOk = !query || searchable(module).includes(query);
            return groupOk && queryOk;
        });
    }

    function moduleCard(module) {
        const open = module.id === openModuleId;
        return `
            <article class="exani-mob-card exani-mob-card--${esc(module.accent)} ${open ? 'is-open' : ''}">
                <button type="button" class="exani-mob-card__head" data-module-id="${esc(module.id)}">
                    <span>${esc(module.group)}</span>
                    <h3>${esc(module.title)}</h3>
                    <p>${esc(module.summary)}</p>
                    <div>
                        <strong>${module.subareas.length} subareas</strong>
                        <strong>${allTopics(module).length} temas</strong>
                    </div>
                </button>
                ${open ? `
                    <div class="exani-mob-card__body">
                        ${module.subareas.map((subarea) => `
                            <section>
                                <h4>${esc(subarea.title)}</h4>
                                <ul>
                                    ${subarea.topics.slice(0, 4).map((topic) => `<li>${esc(topic)}</li>`).join('')}
                                </ul>
                            </section>
                        `).join('')}
                    </div>
                ` : ''}
            </article>
        `;
    }

    function draw() {
        const app = document.getElementById('app');
        const list = filteredModules();
        const totalTopics = MODULES.reduce((sum, module) => sum + allTopics(module).length, 0);

        if (list.length && !list.some((module) => module.id === openModuleId)) {
            openModuleId = list[0].id;
        }

        app.innerHTML = `
            <div class="edu-mob-layout exani-mob">
                <section class="exani-mob-hero">
                    <span>Explorar EXANI-II</span>
                    <h1>Módulos, subáreas y temas para preparar tu examen.</h1>
                    <p>Elige un módulo y revisa exactamente qué estudiar antes de practicar.</p>
                    <div class="exani-mob-stats">
                        <div><strong>${MODULES.length}</strong><small>módulos</small></div>
                        <div><strong>${totalTopics}</strong><small>temas</small></div>
                    </div>
                </section>

                <section class="exani-mob-search">
                    <input id="exani-mob-search-input" type="search" value="${esc(searchQuery)}" placeholder="Buscar curso, módulo o tema">
                </section>

                <section class="exani-mob-filters" aria-label="Filtros EXANI-II">
                    ${GROUPS.map((group) => `
                        <button type="button" class="${activeGroup === group ? 'is-active' : ''}" data-group="${esc(group)}">${esc(group)}</button>
                    `).join('')}
                </section>

                <section class="exani-mob-list">
                    ${list.length ? list.map(moduleCard).join('') : `
                        <div class="exani-mob-empty">
                            <h3>No encontre coincidencias</h3>
                            <p>Prueba con otro tema o cambia el filtro.</p>
                        </div>
                    `}
                </section>

                <section class="exani-mob-cta">
                    <span>Ruta educatIA</span>
                    <h2>Convierte el temario en práctica guiada.</h2>
                    <p>Diagnóstico, lecciones cortas, ejercicios por habilidad y simulacros.</p>
                    <a href="${signupOrLearningHref()}" class="edu-mob-btn edu-mob-btn--white">Comenzar preparación</a>
                </section>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        let debounce;
        document.getElementById('exani-mob-search-input')?.addEventListener('input', function (event) {
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                searchQuery = event.target.value;
                draw();
            }, 140);
        });

        document.querySelectorAll('[data-group]').forEach((button) => {
            button.addEventListener('click', function () {
                activeGroup = button.dataset.group || 'Todos';
                draw();
            });
        });

        document.querySelectorAll('[data-module-id]').forEach((button) => {
            button.addEventListener('click', function () {
                openModuleId = button.dataset.moduleId || openModuleId;
                draw();
            });
        });
    }

    function render() {
        draw();
    }

    return { render };
})();

/* ================================================================
   educatIA - Explorar Mobile marketplace
   ================================================================ */
window.EducatIA.Pages.ExplorarMobile = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const toUrl = (path) => window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    const MODULES = window.EducatIA.ExaniModules || [];
    const GROUPS = ['Todos', 'Matemáticas', 'Experimentales', 'Sociales', 'Humanidades', 'Salud', 'Generales'];

    const imageByGroup = {
        Matematicas: 'assets/images/landing-courses/arithmetic.jpg',
        Experimentales: 'assets/images/explore-courses/experimental-sciences.jpg',
        Sociales: 'assets/images/explore-courses/social-sciences.jpg',
        Humanidades: 'assets/images/landing-courses/literature.jpg',
        Salud: 'assets/images/landing-courses/premedicine.jpg',
        Generales: 'assets/images/landing-courses/exani-route.jpg'
    };

    const imageById = {
        administracion: 'assets/banners/administracion.webp',
        aritmetica: 'assets/banners/aritmetica.webp',
        biologia: 'assets/banners/biologia.webp',
        calculo: 'assets/banners/calculo.webp',
        salud: 'assets/banners/ciencias%20de%20la%20salud.webp',
        'ciencias-experimentales': 'assets/banners/ciencias%20experimentales.webp',
        'ciencias-sociales': 'assets/images/explore-courses/social-sciences.jpg',
        derecho: 'assets/banners/derecho.webp',
        economia: 'assets/banners/economia.webp',
        filosofia: 'assets/banners/filosofia.webp',
        fisica: 'assets/banners/fisica.webp',
        historia: 'assets/banners/historia.webp',
        literatura: 'assets/banners/literatura.webp',
        'matematicas-financieras': 'assets/banners/matematicas%20financieras.webp',
        premedicina: 'assets/banners/premedicina.webp',
        'probabilidad-estadistica': 'assets/banners/probabilidad%20y%20estadistica.webp',
        psicologia: 'assets/banners/psicologia.webp',
        quimica: 'assets/banners/quimica.webp'
    };

    let activeGroup = 'Todos';
    let searchQuery = '';
    let openModuleId = 'premedicina';
    let backendCourses = [];

    function topics(module) {
        return module.subareas.flatMap((subarea) => subarea.topics);
    }

    function topicCount(module) {
        return topics(module).length;
    }

    function imageFor(module) {
        return imageById[module.id] || imageByGroup[module.group] || 'assets/images/landing-courses/exani-route.jpg';
    }

    function shortText(text, limit = 92) {
        if (!text || text.length <= limit) return text || '';
        return `${text.slice(0, limit - 3)}...`;
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function searchable(module) {
        return normalizeSearchText([
            module.title,
            module.group,
            module.type,
            module.summary,
            ...module.subareas.map((subarea) => subarea.title),
            ...topics(module)
        ].join(' '));
    }

    function filteredModules() {
        const query = normalizeSearchText(searchQuery.trim());
        return MODULES.filter((module) => {
            const groupOk = activeGroup === 'Todos' || module.group === activeGroup;
            const queryOk = !query || searchable(module).includes(query);
            return groupOk && queryOk;
        });
    }

    function moduleById(id) {
        return MODULES.find((module) => module.id === id);
    }

    function featuredModules() {
        return ['premedicina', 'aritmetica', 'literatura', 'probabilidad-estadistica']
            .map(moduleById)
            .filter(Boolean);
    }

    function statTotals() {
        return {
            modules: MODULES.length,
            topics: MODULES.reduce((sum, module) => sum + topicCount(module), 0)
        };
    }

    function isPublished(course) {
        if (!course) return false;
        if (course.publicado === false || course.visible === false) return false;
        const status = String(course.estado || course.status || '').toLowerCase();
        return !['borrador', 'draft', 'archivado', 'archive'].includes(status);
    }

    function courseTitle(course) {
        return course?.titulo || course?.title || course?.nombre || 'Curso educatIA';
    }

    function normalizeCourseKey(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function userHasSession() {
        const api = API();
        const components = window.EducatIA.Components;
        return Boolean(
            components?.userState?.loggedIn ||
            api?.getToken?.() ||
            api?.getUser?.()
        );
    }

    function signupOrLearningHref() {
        return toUrl(userHasSession() ? '/dashboard' : '/registro-alumno?plan=premium');
    }

    function courseForModule(module) {
        const moduleKey = normalizeCourseKey(module?.title);
        if (!moduleKey) return null;
        return backendCourses
            .filter(isPublished)
            .find((course) => {
                const titleKey = normalizeCourseKey(courseTitle(course));
                return titleKey === moduleKey || titleKey.includes(moduleKey) || moduleKey.includes(titleKey);
            }) || null;
    }

    function moduleCourseHref(module) {
        const course = courseForModule(module);
        if (!course) return signupOrLearningHref();
        return toUrl(window.EducatIA.Utils.courseUrl(course));
    }

    function moduleEditorialHref(module) {
        return moduleCourseHref(module);
    }

    function moduleColor(module) {
        return window.EducatIA.Pages.Explorar?.editorial?.[module.id]?.color || '#0056d2';
    }

    function compactCard(module) {
        return `
            <a class="exm-mob-card" href="${moduleEditorialHref(module)}" style="--module-color:${esc(moduleColor(module))}">
                <div class="exm-mob-card__body">
                    <small class="exm-mob-provider">${esc(module.group)}</small>
                    <h3>${esc(module.title)}</h3>
                    <p>${esc(shortText(module.summary, 86))}</p>
                    <strong>${topicCount(module)} temas · Abrir curso</strong>
                </div>
            </a>
        `;
    }

    function modulePanel(module) {
        return `
            <article class="exm-mob-module">
                <a class="exm-mob-module__head" href="${moduleEditorialHref(module)}">
                    <span>${esc(module.group)}</span>
                    <h3>${esc(module.title)}</h3>
                    <p>${esc(shortText(module.summary, 112))}</p>
                    <div>
                        <strong>${module.subareas.length} subáreas</strong>
                        <strong>${topicCount(module)} temas</strong>
                    </div>
                    <strong class="exm-mob-module__action">Comenzar preparación <span aria-hidden="true">→</span></strong>
                </a>
            </article>
        `;
    }

    function draw() {
        const app = document.getElementById('app');
        const list = filteredModules();
        const totals = statTotals();

        if (list.length && !list.some((module) => module.id === openModuleId)) {
            openModuleId = list[0].id;
        }

        app.innerHTML = `
            <div class="edu-mob-layout exm-mob">
                <section class="exm-mob-hero">
                    <div class="exm-mob-hero__copy">
                        <span>Catálogo de educatIA</span>
                        <h1>Elige tu siguiente curso.</h1>
                        <p>Preparación EXANI-I y EXANI-II y cursos de inteligencia artificial con lecciones, prácticas y evaluaciones.</p>
                    </div>
                    <div class="exm-mob-hero__media">
                        <img src="assets/explorar/banner-exani-hero.webp" data-fallback-src="assets/images/landing-courses/exani-route.jpg" alt="Estudiante preparando el EXANI-II con recursos de educatIA" fetchpriority="high" decoding="async">
                    </div>
                    <div class="exm-mob-hero__stats">
                        <div><strong>${totals.modules}</strong><small>módulos</small></div>
                        <div><strong>${totals.topics}</strong><small>temas</small></div>
                    </div>
                </section>

                <section class="exm-mob-search">
                    <span>${window.EducatIA.Icons?.search || ''}</span>
                    <input id="exm-mob-search-input" type="search" value="${esc(searchQuery)}" placeholder="Buscar curso, módulo o tema">
                </section>

                ${window.EducatIA.ProgramCatalog.section({ query: searchQuery, compact: true })}

                <section class="exm-mob-chip-row" aria-label="Categorías EXANI-II">
                    ${GROUPS.map((group) => `
                        <button type="button" class="${activeGroup === group ? 'is-active' : ''}" data-mobile-group="${esc(group)}" aria-pressed="${activeGroup === group}">${esc(group)}</button>
                    `).join('')}
                </section>

                <section class="exm-mob-section">
                    <div class="exm-mob-section__head">
                        <h2>Módulos populares</h2>
                        <a href="${signupOrLearningHref()}">Comenzar</a>
                    </div>
                    <div class="exm-mob-rail">
                        ${featuredModules().map(compactCard).join('')}
                    </div>
                </section>

                <section class="exm-mob-band">
                    <span>Ruta premium</span>
                    <h2>Diagnostica, estudia, practica y simula.</h2>
                    <p>Un flujo corto para convertir el temario del EXANI-II en sesiones semanales.</p>
                </section>

                <section class="exm-mob-section">
                    <div class="exm-mob-section__head">
                        <h2>Todos los módulos</h2>
                        <small>${list.length} visibles</small>
                    </div>
                    <div class="exm-mob-list">
                        ${list.length ? list.map(modulePanel).join('') : `
                            <div class="exm-mob-empty">
                                <h3>No encontré coincidencias</h3>
                                <p>Prueba con otro tema o cambia el filtro.</p>
                            </div>
                        `}
                    </div>
                </section>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        let debounce;

        document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
            image.addEventListener('error', () => {
                const fallback = image.dataset.fallbackSrc;
                if (!fallback || image.src.endsWith(fallback)) return;
                image.src = fallback;
            }, { once: true });
        });

        document.getElementById('exm-mob-search-input')?.addEventListener('input', function (event) {
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                searchQuery = event.target.value;
                draw();
            }, 140);
        });

        document.querySelectorAll('[data-mobile-group]').forEach((button) => {
            button.addEventListener('click', function () {
                activeGroup = button.dataset.mobileGroup || 'Todos';
                draw();
            });
        });

    }

    function readInitialSearchQuery() {
        const params = window.EducatIA.Router?.getQueryParams?.();
        const queryFromUrl = params?.get('q') || params?.get('buscar') || '';
        const queryFromSession = window.sessionStorage.getItem('educatia_explore_query') || '';
        window.sessionStorage.removeItem('educatia_explore_query');
        return (queryFromUrl || queryFromSession).trim();
    }

    async function render() {
        const initialQuery = readInitialSearchQuery();
        if (initialQuery) {
            searchQuery = initialQuery;
        }
        draw();

        try {
            const res = await API().getCourses();
            backendCourses = Array.isArray(res) ? res : (res?.items || []);
        } catch {
            backendCourses = [];
        }
        if (document.querySelector('.exm-mob')) {
            draw();
        }
    }

    return { render };
})();
