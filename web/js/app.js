/* ================================================================
   educatIA — App Initialization
   Registers all routes and initializes the SPA
   ================================================================ */

(function () {
    const Router = window.EducatIA.Router;
    const Pages = window.EducatIA.Pages;
    const Components = window.EducatIA.Components;

    async function resolveCourseBySlug(courseSlug) {
        const API = window.EducatIA.API;
        const slugify = window.EducatIA.Utils.slugify;
        const rawSlug = String(courseSlug || '').trim();
        const numericId = Number(rawSlug);
        if (Number.isFinite(numericId) && numericId > 0) {
            return API.getCourse(numericId);
        }

        const courses = await API.getCourses({ activo: true }).catch(() => API.getCourses());
        const normalizedSlug = slugify(rawSlug);
        const course = courses.find((item) => (
            slugify(item.titulo || item.title || item.id) === normalizedSlug
            || String(item.id) === rawSlug
        ));
        if (!course) {
            throw new Error('No encontramos el curso solicitado.');
        }
        return API.getCourse(course.id);
    }

    function findBySlug(items, slug, fallbackIdField) {
        const slugify = window.EducatIA.Utils.slugify;
        const normalizedSlug = slugify(slug);
        return items.find((item) => (
            slugify(item.titulo || item.title || item[fallbackIdField] || item.id) === normalizedSlug
            || String(item.id) === String(slug)
        ));
    }

    function clearLessonChrome() {
        const header = document.getElementById('site-header');
        if (header) {
            header.innerHTML = '';
            header.className = '';
        }
        const footer = document.getElementById('site-footer');
        if (footer) {
            footer.innerHTML = '';
            footer.className = '';
        }
    }

    async function renderCourseBySlug(params) {
        Components.renderNav();
        const course = await resolveCourseBySlug(params.courseSlug);
        await Pages.Curso.renderPublished({ id: course.id, preloadedCourse: course });
        Components.renderFooter();
    }

    async function renderLessonBySlug(params) {
        const course = await resolveCourseBySlug(params.courseSlug);
        const lessons = await window.EducatIA.API.getLessons(course.id);
        const lesson = findBySlug(lessons, params.lessonSlug, 'id');
        if (!lesson) {
            throw new Error('No encontramos la lección solicitada.');
        }
        const lessonPromise = window.EducatIA.API.getLesson(lesson.id);
        clearLessonChrome();
        await Pages.Leccion.render({
            id: lesson.id,
            preloadedCourse: course,
            preloadedLessons: lessons,
            preloadedLessonPromise: lessonPromise,
        });
    }

    async function renderQuizBySlug(params) {
        Components.renderNav();
        const course = await resolveCourseBySlug(params.courseSlug);
        const quizzes = await window.EducatIA.API.getQuizzes(course.id);
        const quiz = findBySlug(quizzes, params.quizSlug, 'id');
        if (!quiz) {
            throw new Error('No encontramos la evaluación solicitada.');
        }
        await Pages.Curso.renderPublished({ id: course.id, quizId: quiz.id, preloadedCourse: course });
        Components.renderFooter();
    }

    async function renderModuleBySlug(params) {
        Components.renderNav();
        const course = await resolveCourseBySlug(params.courseSlug);
        await Pages.Curso.renderPublished({ id: course.id, moduleSlug: params.moduleSlug, preloadedCourse: course });
        Components.renderFooter();
    }

    window.EducatIA.enhanceAccessibility = function () {
        document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(function (control, index) {
            if (!control.id) {
                const base = control.name || control.type || 'field';
                control.id = `educatia-${base}-${index}`;
            }

            if (control.closest('label')) {
                return;
            }

            const previousLabel = control.previousElementSibling;
            if (previousLabel && previousLabel.tagName === 'LABEL') {
                previousLabel.setAttribute('for', control.id);
                return;
            }

            const container = control.closest('.fg, .form-group, .auth-card__form, .landing-register-modal__form, .page-wrap, .card');
            const label = container ? container.querySelector('label') : null;
            if (label && !label.closest('label')) {
                label.setAttribute('for', control.id);
                return;
            }

            if (!control.getAttribute('aria-label') && control.placeholder) {
                control.setAttribute('aria-label', control.placeholder);
            }
        });

        document.querySelectorAll('.landing-home__hero-points').forEach(function (list) {
            list.setAttribute('role', 'list');
            list.querySelectorAll('.landing-home__hero-point').forEach(function (item) {
                item.setAttribute('role', 'listitem');
            });
        });

        document.querySelectorAll('img').forEach(function (image) {
            if (!image.hasAttribute('decoding')) image.setAttribute('decoding', 'async');
            if (!image.hasAttribute('loading') && !image.closest('.explore-hero, .landing-home__hero, .checkout-summary')) {
                image.setAttribute('loading', 'lazy');
            }
        });
    };

    window.EducatIA.initAccessibilityControls = function () {
        const STORAGE_KEY = 'educatia_accessibility_preferences';
        const root = document.documentElement;
        const saved = (() => {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            } catch {
                return {};
            }
        })();

        const preferences = {
            font: saved.font || 'normal',
            contrast: !!saved.contrast,
            dark: !!saved.dark,
            minimized: !!saved.minimized
        };

        function persist() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        }

        function applyPreferences() {
            root.dataset.fontScale = preferences.font;
            root.classList.toggle('a11y-contrast', preferences.contrast);
            root.classList.toggle('a11y-dark', preferences.dark);
            const panel = document.getElementById('a11y-panel');
            panel?.classList.toggle('is-minimized', preferences.minimized);
            document.querySelectorAll('[data-a11y-action]').forEach(function (button) {
                const action = button.dataset.a11yAction;
                const pressed = (
                    (action === 'font-normal' && preferences.font === 'normal') ||
                    (action === 'font-large' && preferences.font === 'large') ||
                    (action === 'font-xl' && preferences.font === 'xl') ||
                    (action === 'contrast' && preferences.contrast) ||
                    (action === 'dark' && preferences.dark) ||
                    (action === 'minimize' && preferences.minimized)
                );
                button.setAttribute('aria-pressed', String(pressed));
            });
        }

        window.EducatIA.Accessibility = {
            getPreferences() {
                return { ...preferences };
            },
            update(nextPreferences = {}) {
                if (['normal', 'large', 'xl'].includes(nextPreferences.font)) {
                    preferences.font = nextPreferences.font;
                }
                if (typeof nextPreferences.contrast === 'boolean') {
                    preferences.contrast = nextPreferences.contrast;
                }
                if (typeof nextPreferences.dark === 'boolean') {
                    preferences.dark = nextPreferences.dark;
                }
                if (typeof nextPreferences.minimized === 'boolean') {
                    preferences.minimized = nextPreferences.minimized;
                }
                persist();
                applyPreferences();
                document.dispatchEvent(new CustomEvent('educatia:a11y-updated', { detail: { ...preferences } }));
            },
            reset() {
                preferences.font = 'normal';
                preferences.contrast = false;
                preferences.dark = false;
                preferences.minimized = true;
                persist();
                applyPreferences();
                document.dispatchEvent(new CustomEvent('educatia:a11y-updated', { detail: { ...preferences } }));
            }
        };

        if (window.EducatIA.SHOW_FLOATING_A11Y === true && !document.getElementById('a11y-panel')) {
            const panel = document.createElement('aside');
            panel.id = 'a11y-panel';
            panel.className = 'a11y-panel';
            panel.setAttribute('aria-label', 'Controles de accesibilidad');
            panel.innerHTML = `
                <button type="button" class="a11y-panel__toggle" aria-expanded="false" aria-controls="a11y-panel-options">Accesibilidad</button>
                <div class="a11y-panel__options" id="a11y-panel-options" hidden>
                    <span class="a11y-panel__label">Lectura</span>
                    <button type="button" data-a11y-action="font-normal">A</button>
                    <button type="button" data-a11y-action="font-large">A+</button>
                    <button type="button" data-a11y-action="font-xl">A++</button>
                    <button type="button" data-a11y-action="contrast">Contraste</button>
                    <button type="button" data-a11y-action="dark">Modo oscuro</button>
                    <button type="button" data-a11y-action="minimize">Ocultar</button>
                </div>
            `;
            document.body.appendChild(panel);

            const toggle = panel.querySelector('.a11y-panel__toggle');
            const options = panel.querySelector('.a11y-panel__options');
            toggle?.addEventListener('click', function () {
                if (preferences.minimized) {
                    preferences.minimized = false;
                    persist();
                    applyPreferences();
                }
                const open = options.hasAttribute('hidden');
                options.toggleAttribute('hidden', !open);
                toggle.setAttribute('aria-expanded', String(open));
            });

            panel.querySelectorAll('[data-a11y-action]').forEach(function (button) {
                button.addEventListener('click', function () {
                    const action = button.dataset.a11yAction;
                    if (action === 'font-normal') preferences.font = 'normal';
                    if (action === 'font-large') preferences.font = 'large';
                    if (action === 'font-xl') preferences.font = 'xl';
                    if (action === 'contrast') preferences.contrast = !preferences.contrast;
                    if (action === 'dark') preferences.dark = !preferences.dark;
                    if (action === 'minimize') {
                        preferences.minimized = true;
                        options.setAttribute('hidden', '');
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                    persist();
                    applyPreferences();
                });
            });
        }

        applyPreferences();
    };

    // ===== REGISTER ROUTES =====

    // Landing
    Router.register('/', async function () {
        const API = window.EducatIA.API;
        const user = API?.getUser?.();
        const role = user?.rol || Components.userState.role;

        if (API?.getToken?.() && user) {
            Components.renderNav();
            if (role === 'maestro' && Pages.DashboardMaestro) {
                await Pages.DashboardMaestro.render();
            } else if (Pages.Dashboard?.renderPersonalHome) {
                if (role === 'alumno' && Pages.Onboarding?.render && API.getOnboarding) {
                    try {
                        const onboarding = await API.getOnboarding();
                        if (!onboarding) {
                            Router.navigate('/onboarding', { replace: true });
                            return;
                        }
                    } catch {
                        // The personal home remains available if the gate endpoint is unreachable.
                    }
                }
                await Pages.Dashboard.renderPersonalHome();
            } else {
                await Pages.Dashboard.render();
            }
            Components.renderFooter();
            return;
        }

        Components.renderNav();
        Pages.Landing.render();
        Components.renderFooter();
    });

    // Auth
    Router.register('/login', function () {
        Components.renderNav();
        Pages.Auth.renderLogin();
        Components.renderFooter();
    });

    Router.register('/recuperar-contrasena', function () {
        Components.renderNav();
        Pages.Auth.renderPasswordResetRequest();
        Components.renderFooter();
    });

    Router.register('/restablecer-contrasena', function () {
        Components.renderNav();
        Pages.Auth.renderPasswordResetConfirm();
        Components.renderFooter();
    });

    Router.register('/confirmar-correo', function () {
        Components.renderNav();
        Pages.Auth.renderEmailChangeConfirm();
        Components.renderFooter();
    });

    Router.register('/registro-alumno', function () {
        Components.renderNav();
        Pages.Auth.renderRegistroAlumno();
        Components.renderFooter();
    });

    // OAuth Callback (receives token from backend redirect)
    Router.register('/oauth-callback', function () {
        const params = Router.getQueryParams();
        const token = params.get('token');
        const error = params.get('error');
        const provider = params.get('provider');
        const popupOpener = window.opener && !window.opener.closed ? window.opener : null;
        const finishPopup = function (payload) {
            if (!popupOpener) return false;
            // The public frontend is available on the custom domain and its
            // GitHub Pages origin. No token is sent; the opener validates both
            // this origin and the exact popup window before refreshing cookies.
            popupOpener.postMessage({ type: 'educatia:oauth-complete', ...payload }, '*');
            const app = document.getElementById('app');
            if (app) app.innerHTML = Components.renderLoadingBlock('Acceso confirmado');
            window.setTimeout(function () { window.close(); }, 260);
            return true;
        };

        if (provider && provider !== 'google' && provider !== 'github') {
            if (finishPopup({ error: 'oauth_provider_mismatch' })) return;
            window.sessionStorage.setItem('educatia_oauth_error', 'Proveedor OAuth no soportado.');
            Router.navigate('/login');
            return;
        }

        if (error) {
            if (finishPopup({ error: error })) return;
            const messages = {
                google_auth_failed: 'No se pudo completar la autenticación con Google. Intenta de nuevo.',
                google_no_profile: 'Google no proporcionó información de perfil.',
                google_no_email: 'Google no proporcionó un correo electrónico.',
                google_unverified_email: 'Google no confirmo que el correo este verificado.',
                github_auth_failed: 'No se pudo completar la autenticación con GitHub. Intenta de nuevo.',
                github_no_profile: 'GitHub no proporcionó información de perfil suficiente.',
                github_no_email: 'GitHub no proporcionó un correo verificado.',
                oauth_link_required: 'Esta cuenta ya existe. Inicia sesión con contraseña y vincula el proveedor desde tu perfil.',
                oauth_provider_mismatch: 'La cuenta ya esta vinculada con otro proveedor de acceso.',
                account_disabled: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
                teacher_pending: 'Tu cuenta docente aún no ha sido aprobada.'
            };
            window.sessionStorage.setItem('educatia_oauth_error', messages[error] || 'Error de autenticación.');
            Router.navigate('/login');
            return;
        }

        if (provider) {
            if (finishPopup({ provider: provider })) return;
            // Scrub the OAuth callback fragment; the API already set HttpOnly cookies.
            try {
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) { /* replaceState unavailable — non-fatal */ }

            const app = document.getElementById('app');
            app.innerHTML = Components.renderLoadingBlock('Autenticando');

            window.EducatIA.API.loginWithOAuthToken(token)
                .then(function (user) {
                    const role = user.rol || 'alumno';
                    Components.setLoggedIn(role, user);
                    Router.navigate(Pages.Auth.getPostLoginPath(role));
                })
                .catch(function () {
                    window.EducatIA.API.clearToken();
                    window.sessionStorage.setItem('educatia_oauth_error', 'No se pudo verificar la sesión. Intenta de nuevo.');
                    Router.navigate('/login');
                });
            return;
        }

        Router.navigate('/login');
    });

    // Student Dashboard
    Router.register('/dashboard', function () {
        Components.renderNav();
        if (Pages.Dashboard.renderPersonalHome) {
            Pages.Dashboard.renderPersonalHome();
        } else {
            Pages.Dashboard.render();
        }
        Components.renderFooter();
    });

    Router.register('/onboarding', function () {
        Components.renderNav();
        Pages.Onboarding.render();
        Components.renderFooter();
    });

    Router.register('/personalizacion', function () {
        Components.renderNav();
        Pages.Onboarding.render({ premiumFlow: true });
        Components.renderFooter();
    });

    Router.register('/diagnostico', function () {
        Components.renderNav();
        Pages.Assessment.renderDiagnostic();
        Components.renderFooter();
    });

    Router.register('/simulacros', function () {
        Router.navigate(window.EducatIA.Utils.exaniSimulatorUrl(), { replace: true });
    });

    Router.register('/simuladores-exani', function () {
        Components.renderNav();
        Pages.ExaniSimulator.renderHome();
        Components.renderFooter();
    });

    Router.register('/simuladores-exani/examen-real', function () {
        Components.renderNav();
        Pages.ExaniSimulator.renderHome();
        Components.renderFooter();
    });

    Router.register('/simuladores-exani/racha-diaria', function () {
        Components.renderNav();
        Pages.Dashboard.render({ focus: 'daily-exani' });
        Components.renderFooter();
    });

    Router.register('/simuladores-exani/practica-por-modulos', function () {
        Components.renderNav();
        Pages.PracticeExams.render();
        Components.renderFooter();
    });

    Router.register('/simulacro-exani/:sessionId/reactivo/:order', function (params) {
        Router.navigate(window.EducatIA.Utils.exaniQuestionUrl(params.sessionId, params.order), { replace: true });
    });

    Router.register('/simuladores-exani/sesiones/:sessionId/reactivos/:order', function (params) {
        Pages.ExaniSimulator.renderReactiveRoute(params);
    });

    Router.register('/simuladores-exani/racha-diaria/sesiones/:sessionId/reactivos/:order', function (params) {
        Pages.ExaniSimulator.renderReactiveRoute({ ...params, daily: true });
    });

    Router.register('/precios', function () {
        Components.renderNav();
        Pages.Pricing.render();
        Components.renderFooter();
    });

    Router.register('/pricing', function () {
        Components.renderNav();
        Pages.Pricing.render();
        Components.renderFooter();
    });

    Router.register('/laboratorio-aprendizaje', function () {
        Components.renderNav();
        Pages.LearningLab.render();
        Components.renderFooter();
    });

    Router.register('/laboratorio-aprendizaje/:subjectId/:simulationId', function (params) {
        Components.renderNav();
        Pages.LearningLab.renderSimulation(params);
        Components.renderFooter();
    });

    Router.register('/laboratorio-aprendizaje/experimento/:subjectId/:simulationId', function (params) {
        Pages.LearningLab.renderExternalSimulation(params);
    });

    Router.register('/examenes-practica', function () {
        Router.navigate(window.EducatIA.Utils.exaniPracticeUrl(), { replace: true });
    });

    Router.register('/checkout', function () {
        Components.renderNav();
        Pages.Checkout.render();
        Components.renderFooter();
    });

    Router.register('/verificar', function () {
        Components.renderNav();
        Pages.Certificados.renderVerify();
        Components.renderFooter();
    });

    Router.register('/certificados', function () {
        Components.renderNav();
        Pages.Certificados.renderMine();
        Components.renderFooter();
    });

    Router.register('/compras', function () {
        Components.renderNav();
        Pages.Configuracion.renderPurchases();
        Components.renderFooter();
    });

    Router.register('/tareas', function () {
        Components.renderNav();
        Pages.SchoolAssignments.renderBoard();
        Components.renderFooter();
    });
    Router.register('/tareas/revision', function () {
        Components.renderNav();
        Pages.SchoolAssignments.renderBoard(true);
        Components.renderFooter();
    });

    // Explore
    Router.register('/tareas/curso/:id', function (params) {
        Components.renderNav();
        Pages.SchoolAssignments.render(params);
        Components.renderFooter();
    });

    Router.register('/explorar', function () {
        Components.renderNav();
        if (window.innerWidth <= 768 && Pages.ExplorarMobile) {
            Pages.ExplorarMobile.render();
            Components.renderFooter();
        } else {
            Pages.Explorar.render();
            Components.renderFooter();
        }
    });

    // Individual editorial pages were retired. Preserve previously shared
    // links without keeping a duplicate public destination.
    Router.register('/materia/:id', function () {
        Router.navigate('/explorar', { replace: true });
    });

    // Clean published course URLs
    Router.register('/cursos/:courseSlug', renderCourseBySlug);

    Router.register('/cursos/:courseSlug/evaluaciones/:quizSlug', renderQuizBySlug);

    Router.register('/cursos/:courseSlug/modulos/:moduleSlug', renderModuleBySlug);

    Router.register('/cursos/:courseSlug/:lessonSlug', renderLessonBySlug);

    // Published Course View
    Router.register('/curso/:id', function (params) {
        Components.renderNav();
        Pages.Curso.renderPublished(params);
        Components.renderFooter();
    });

    // Lesson View
    Router.register('/leccion/:id', function (params) {
        clearLessonChrome();
        Pages.Leccion.render(params);
    });

    // Grades
    Router.register('/calificaciones', function () {
        Components.renderNav();
        Pages.Calificaciones.render();
        Components.renderFooter();
    });

    // Profile
    Router.register('/perfil', function () {
        Components.renderNav();
        Pages.Perfil.render();
        Components.renderFooter();
    });

    // Notifications
    Router.register('/notificaciones', function () {
        Components.renderNav();
        Pages.Notificaciones.render();
        Components.renderFooter();
    });

    // Settings
    Router.register('/configuracion', function () {
        Components.renderNav();
        Pages.Configuracion.render();
        Components.renderFooter();
    });

    // Teacher Dashboard
    Router.register('/dashboard-maestro', function () {
        Components.renderNav();
        Pages.DashboardMaestro.render();
        Components.renderFooter();
    });

    Router.register('/articulos-ia', function () {
        Components.renderNav();
        Pages.ArticulosIA.render();
        Components.renderFooter();
    });

    // Info Pages (footer links)
    Router.register('/info/:topic', function (params) {
        Components.renderNav();
        Pages.Info.render(params);
        Components.renderFooter();
    });

    // Teacher Course Management
    Router.register('/maestro/curso/:id', function (params) {
        Components.renderNav();
        Pages.GestionCurso.render(params);
        Components.renderFooter();
    });

    Router.register('/gestion-curso/:id', function (params) {
        Components.renderNav();
        Pages.GestionCurso.render(params);
        Components.renderFooter();
    });

    // One-segment unknown paths are treated as possible private admin routes.
    // The view renders only after the backend confirms both admin role and a
    // recent password step-up; every other visitor receives the normal 404.
    Router.register('/:privateAdminPath', function () {
        return Pages.AdminPanel.renderPrivateRoute();
    });

    // Add smooth transitions to app container
    const appEl = document.getElementById('app');
    if (appEl) {
        appEl.style.transition = 'opacity 0.15s ease';
    }

    const BOOTSTRAP_SESSION_TIMEOUT_MS = 20000;

    async function waitForSessionBootstrap(task) {
        let timeoutId = null;
        try {
            return await Promise.race([
                Promise.resolve(task).catch(function (error) {
                    console.warn('Session bootstrap failed; continuing with the cached state.', error);
                    return null;
                }),
                new Promise(function (resolve) {
                    timeoutId = window.setTimeout(function () {
                        console.warn('Session bootstrap timed out; continuing with the cached state.');
                        resolve(null);
                    }, BOOTSTRAP_SESSION_TIMEOUT_MS);
                }),
            ]);
        } finally {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        }
    }

    async function bootstrap() {
        const redirectedPath = window.sessionStorage.getItem('educatia_redirect_path');
        if (redirectedPath) {
            window.sessionStorage.removeItem('educatia_redirect_path');
            const normalizedRedirect = String(redirectedPath || '').replace(/\/+$/, '') || '/';
            const basePath = Router.getBasePath?.() || '';
            const redirectRoute = basePath && normalizedRedirect.startsWith(`${basePath}/`)
                ? normalizedRedirect.slice(basePath.length) || '/'
                : normalizedRedirect;
            const opensRegistration = redirectRoute === '/registro-alumno' || redirectRoute.startsWith('/registro-alumno?');
            if (!opensRegistration) {
                window.history.replaceState({}, '', redirectedPath);
            }
        }

        Pages.Auth.installLoginInterception?.();
        Router.init();
        window.EducatIA.initAccessibilityControls();

        if (Router.getPath && Router.getPath() === '/auth/github/callback') {
            Components.renderNav();
            Pages.Auth.renderGitHubCallback();
            Components.renderFooter();
            window.EducatIA.enhanceAccessibility();
            return;
        }

        const currentPath = Router.getPath?.() || '/';
        const canRenderBeforeSession = (
            currentPath === '/explorar' ||
            currentPath === '/precios' ||
            currentPath === '/pricing' ||
            currentPath.startsWith('/info/')
        );

        if (window.EducatIA.API) {
            if (canRenderBeforeSession) {
                window.EducatIA.API.restoreSession().catch(() => null);
            } else {
                await waitForSessionBootstrap((async function () {
                    await window.EducatIA.API.restoreSession();
                    await Components.refreshAleEntitlement?.();
                })());
            }
        }

        Router.handleRoute();
        window.EducatIA.enhanceAccessibility();
        console.log('educatIA initialized successfully');
    }

    bootstrap().catch(function (error) {
        console.error('App bootstrap failed:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = '<div class="page-wrap"><div class="card"><h1>No se pudo iniciar la aplicación</h1><p class="text-muted" style="margin-top:12px;">Recarga la página o vuelve al inicio para reintentar.</p><div style="margin-top:24px;"><a href="#/" class="btn btn--pri">Volver al inicio</a></div></div></div>';
        }
    });
})();
