/* EducatIA Frontend API Client → Connected to live EducatIA Gateway API (136.118.8.128). */
window.EducatIA = window.EducatIA || {};
window.EducatIA.API = (() => {
    const config = window.EDUCATIA_CONFIG || {};
    const preview = config.preview === true && Boolean(window.EDUCATIA_PREVIEW_API);
    const apiBase = String(config.apiBase || '/api').replace(/\/+$/, '');
    const backendOrigin = String(config.backendOrigin || location.origin).replace(/\/+$/, '');
    const prefix = preview ? `educatia-preview:${new URL('.', document.baseURI).pathname}:` : '';
    const key = name => prefix + name;
    const storage = sessionStorage;
    const roles = {
        student: 'alumno',
        teacher: 'maestro',
        support: 'soporte',
        maintenance: 'mantenimiento',
        admin: 'admin',
    };
    const images = {
        math: 'lessons_photo/webp/aritmetica.webp',
        reading: 'lessons_photo/webp/literatura.webp',
        biology: 'lessons_photo/webp/ciencias-de-la-salud.webp',
        ai: 'images/landing-courses/ai-tutor.jpg',
        physics: 'images/generated/educatia-lab-preview.webp',
        writing: 'lessons_photo/webp/literatura.webp',
    };

    const read = (name, fallback) => {
        try { return JSON.parse(storage.getItem(key(name))) ?? fallback; }
        catch { return fallback; }
    };
    const store = (name, value) => storage.setItem(key(name), JSON.stringify(value));
    const getToken = () => storage.getItem(key('edu-token')) || '';
    const getElevation = () => storage.getItem(key('edu-admin-elevation')) || '';
    const setElevation = val => val ? storage.setItem(key('edu-admin-elevation'), val) : storage.removeItem(key('edu-admin-elevation'));
    const getUser = () => read('educatia-user', null);
    const setUser = user => store('educatia-user', user);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const unsupported = () => { throw new Error('Esta función no está habilitada en esta instancia.'); };

    async function request(path, options = {}) {
        const token = getToken();
        if (preview) {
            return window.EDUCATIA_PREVIEW_API.request(path, {...options, token});
        }
        const extraHeaders = options.headers || {};
        const response = await fetch(apiBase + path, {
            method: options.method || 'GET',
            headers: {
                ...(token ? {Authorization: 'Bearer ' + token} : {}),
                ...(options.body ? {'Content-Type': 'application/json'} : {}),
                ...extraHeaders,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();
        if (!response.ok) {
            const msg = (data && typeof data === 'object' && data.error) ? data.error : 'No se pudo completar la operación.';
            throw new Error(msg);
        }
        return data;
    }

    function userShape(user) {
        const plan = user.plan || 'Básico';
        const isPaid = plan !== 'Gratuito';
        return {
            ...user,
            nombre: user.name,
            rol: roles[user.role] || user.role,
            ciudad: user.city || '',
            biografia: user.bio || '',
            departamento: user.department || '',
            plan_nombre: plan,
            avatar_url: '',
            email_verificado: true,
            suscripcion_activa: isPaid,
            premium_activo: plan in {'Plus':1, 'Pro':1, 'Elite Anual':1, 'Institucional VIP':1},
            suscripcion_hasta: '2027-12-31T23:59:59Z',
            fecha_registro: '2026-10-01T12:00:00Z',
            created_at: '2026-10-01T12:00:00Z',
            perfil_titulo: user.department || 'Integrante del campus',
            perfil_resumen: user.bio || '',
        };
    }

    function sync(user) {
        const mapped = userShape(user);
        setUser(mapped);
        const components = window.EducatIA.Components;
        if (components) {
            Object.assign(components.userState, {
                loggedIn: true,
                role: mapped.rol,
                name: mapped.nombre,
                id: mapped.id,
                email: mapped.email,
                avatarUrl: '',
                premiumActive: mapped.premium_activo,
                subscriptionActive: mapped.suscripcion_activa,
            });
        }
        return mapped;
    }

    function session(result) {
        storage.setItem(key('edu-token'), result.token);
        return {...result, user: sync(result.user)};
    }

    async function getMe() {
        if (!getUser() || !getToken()) throw new Error('Inicia sesión para continuar.');
        return sync(await request('/me'));
    }

    function clearUser() { storage.removeItem(key('educatia-user')); }
    function clearToken() { storage.removeItem(key('edu-token')); setElevation(''); }

    async function restoreSession() {
        if (!getUser() || !getToken()) return null;
        try { return await getMe(); }
        catch { clearUser(); clearToken(); return null; }
    }

    async function login(email, password) {
        return session(await request('/auth/login', {method: 'POST', body: {email, password}}));
    }

    async function updateMe(data) {
        const user = getUser();
        const body = {};
        if ('nombre' in data) body.name = data.nombre;
        if ('name' in data) body.name = data.name;
        if ('ciudad' in data || 'city' in data) body.city = data.ciudad ?? data.city;
        if ('biografia' in data || 'bio' in data || 'perfil_resumen' in data) body.bio = data.biografia ?? data.bio ?? data.perfil_resumen;
        const result = await request('/users/' + user.id, {method: 'PUT', body});
        if (result.token) storage.setItem(key('edu-token'), result.token);
        return sync({...result, ...body});
    }

    async function register(nombre, email, password) {
        return session(await request('/auth/register', {method: 'POST', body: {name: nombre, email, password}}));
    }

    function courseShape(course) {
        const image = 'assets/' + (images[course.art] || images.math);
        return {
            ...course,
            titulo: course.title,
            descripcion: course.description,
            descripcion_corta: course.description,
            precio: course.price,
            imagen_url: image,
            portada_url: image,
            thumbnail_url: image,
            programa: course.program === 'EXANI-I' ? 'preparatoria' : course.program === 'Inteligencia artificial' ? 'ai_engineer' : 'universidad',
            categoria: course.program,
            nivel: course.price >= 1200 ? 'Avanzado' : 'Intermedio',
            publicado: true,
            activo: true,
            estado: 'publicado',
            maestro_id: 142,
            maestro_nombre: 'Claustro Académico EducatIA',
            total_lecciones: 4,
            total_modulos: 1,
            duracion_horas: Math.max(2, Math.round((course.lessons || 16) / 6)),
            es_premium: course.price >= 1200,
            requiere_suscripcion: false,
            inscrito: false,
            objetivos: [
                'Dominar los fundamentos teóricos y prácticos del módulo.',
                'Resolver reactivos tipo examen con retroalimentación estructurada.',
                'Aplicar estrategias de razonamiento bajo condiciones reales.',
            ],
            requisitos: 'Compromiso de práctica semanal constante.',
        };
    }

    async function getCourses(params = {}) {
        const qStr = params.q ? ('?q=' + encodeURIComponent(params.q)) : '';
        return (await request('/courses' + qStr)).map(courseShape);
    }

    async function getCourse(id) {
        const course = (await getCourses()).find(item => item.id === Number(id));
        if (!course) throw new Error('Curso no encontrado.');
        const own = getUser() ? await request('/enrollments').catch(() => []) : [];
        const enrollment = own.find(item => item.id === course.id);
        return {...course, inscrito: !!enrollment, progreso: enrollment?.progress || 0, modulos: await getModules(course.id)};
    }

    function lessonsFor(id) {
        return ['Ideas fundamentales', 'Del concepto a la práctica', 'Resuelve y comprueba', 'Conecta lo aprendido'].map((titulo, index) => ({
            id: Number(id) * 100 + index + 1,
            curso_id: Number(id),
            modulo_id: Number(id) * 10 + 1,
            titulo,
            orden: index + 1,
            tipo: 'texto',
            tipo_contenido: 'texto',
            publicado: true,
            duracion_minutos: 15,
            contenido: `<h2>${titulo}</h2><p>Analiza el planteamiento, identifica las variables clave y desarrolla cada etapa de tu razonamiento.</p><h3>Ejercicio guiado</h3><p>Sintetiza tres principios centrales del tema y redacta un caso aplicado propio antes de avanzar.</p>`,
            video_url: null,
            audio_url: null,
            recursos: [],
            imagen_url: '',
        }));
    }

    async function getLessons(id) { return lessonsFor(id); }
    async function getLesson(id) {
        const lesson = lessonsFor(Math.floor(Number(id) / 100)).find(item => item.id === Number(id));
        if (!lesson) throw new Error('Lección no encontrada.');
        return lesson;
    }
    async function getModules(id) {
        return [{
            id: Number(id) * 10 + 1,
            curso_id: Number(id),
            titulo: 'Fundamentos y evaluación aplicada',
            descripcion: 'Recorrido académico estructurado.',
            orden: 1,
            publicado: true,
            lecciones: lessonsFor(id),
            quizzes: [],
            evaluaciones: [],
            total_lecciones: 4,
        }];
    }
    async function getModule(id) { return (await getModules(Math.floor(Number(id) / 10)))[0]; }

    async function getMyEnrollments() {
        return (await request('/enrollments')).map(course => ({
            id: course.id,
            curso_id: course.id,
            curso_titulo: course.title,
            curso_descripcion: course.description,
            curso: courseShape(course),
            progreso: course.progress,
            total_lecciones: 4,
            total_actividades: 4,
            lecciones_completadas: Math.floor(course.progress / 25),
            actividades_completadas: Math.floor(course.progress / 25),
            imagen_url: 'assets/' + (images[course.art] || images.math),
            maestro_nombre: 'Claustro Académico EducatIA',
            siguiente_actividad_tipo: 'leccion',
            siguiente_actividad_id: course.id * 100 + Math.min(4, Math.floor(course.progress / 25) + 1),
            siguiente_actividad_titulo: 'Continúa tu próxima lección',
            fecha_inscripcion: '2026-10-01T12:00:00Z',
        }));
    }

    async function enroll(id, couponCode = '') {
        const course = await getCourse(id);
        const body = {course_id: Number(id), amount: course.precio};
        if (couponCode) body.coupon_code = String(couponCode).trim();
        return request('/orders', {method: 'POST', body});
    }

    async function getCourseProgress(id) {
        const own = (await request('/enrollments')).find(course => course.id === Number(id));
        const progress = own?.progress || 0;
        const completed = lessonsFor(id).slice(0, Math.floor(progress / 25)).map(lesson => lesson.id);
        return {
            curso_id: Number(id),
            porcentaje: progress,
            progreso: progress,
            lecciones_completadas: completed,
            actividades_completadas: completed.length,
            total_actividades: 4,
            total_lecciones: 4,
            quizzes_aprobados: [],
            modulos_completados: [],
        };
    }

    async function completeLesson(id) {
        const course = Math.floor(Number(id) / 100);
        const progress = await getCourseProgress(course);
        return request(`/courses/${course}/progress`, {
            method: 'PUT',
            body: {progress: Math.max(progress.porcentaje, Math.min(100, (Number(id) % 100) * 25))},
        });
    }

    const localList = name => read(name + ':' + getUser()?.id, []);
    const writeList = (name, rows) => { store(name + ':' + getUser()?.id, rows); return rows; };

    async function createStudyPlanSession(data) {
        const row = {...data, id: Date.now(), estado: 'pendiente'};
        writeList('plan', [...localList('plan'), row]);
        return row;
    }
    async function updateStudyPlanSession(id, data) {
        writeList('plan', localList('plan').map(row => row.id === Number(id) ? {...row, ...data} : row));
        return {...data, id: Number(id)};
    }
    async function deleteStudyPlanSession(id) {
        writeList('plan', localList('plan').filter(row => row.id !== Number(id)));
        return {ok: true};
    }

    async function adminStatus() {
        await request('/admin/overview');
        return {panel_path: '/administracion', authorized: true, verified: true, expires_at: '2027-12-31T23:59:59Z'};
    }

    async function verifyAdminAccess(password) {
        const res = await request('/admin/step-up', {method: 'POST', body: {password}});
        if (res.elevation_token) setElevation(res.elevation_token);
        return {panel_path: res.panel_path || '/administracion', authorized: true, verified: true, expires_at: res.expires_at};
    }

    async function getAdminConsole() {
        await adminStatus();
        const stats = await request('/stats');
        return {
            usuarios: {
                total: stats.users,
                activos: stats.users,
                alumnos: stats.students,
                maestros: stats.teachers,
                soporte: stats.support || 0,
                mantenimiento: stats.maintenance,
                administradores: stats.admins,
                registros_30d: 1420,
                suscripciones_activas: stats.high_tier_students || stats.users,
                bloqueados: 0,
            },
            finanzas: {ingresos_30d: stats.revenue_30d || 0},
            seguridad: {ia_alertas_abiertas: 3, logs_recientes: await request('/admin/audit')},
            promocion_lanzamiento: {incidents: [], terminal_failure_count: 0, max_redemptions: 500, reserved_redemptions: 370},
        };
    }

    async function getAdminAnalytics(filters = {}) {
        const overview = await getAdminConsole();
        return {
            ...overview,
            suscripciones: {
                conversion_cohorte_pct: 26.3,
                alumnos_cohorte_pagaron: 2500,
                renovaciones_periodo: 1120,
                cancelaciones_periodo: 18,
                cancelaciones_programadas_actuales: 9,
                fallos_pago_periodo: 4,
            },
            aprendizaje: {
                evaluaciones_periodo: 14820,
                reactivos_analizados: 189400,
                tasa_acierto_global_pct: 78.4,
                sesiones_laboratorio: 3290,
                duracion_laboratorio_segundos: 4120000,
            },
            cursos: (await getCourses()).map(c => ({
                curso: c.titulo,
                inscripciones_totales: 1850 + c.id * 97,
                inscripciones_periodo: 210 + c.id * 13,
                progreso_promedio_pct: 64.2,
                tasa_finalizacion_pct: 41.8,
                evaluaciones_periodo: 940,
                calificacion_promedio: 8.6,
            })),
            reactivos_mayor_error: [],
            actividad_diaria: [],
            periodo: {desde: filters.desde, hasta: filters.hasta, dias: 30},
            generated_at: new Date().toISOString(),
        };
    }

    async function getProgramOffers() {
        return (await getCourses()).map(course => ({
            ...course,
            course_id: course.id,
            titulo: course.titulo,
            programa: course.programa,
            amount: course.precio * 100,
            price: course.precio,
            precio: course.precio,
            currency: 'mxn',
            access_months: 6,
            available: true,
        }));
    }

    function requestPasswordReset(email) {
        store('reset-email', email);
        return request('/auth/forgot', {method: 'POST', body: {email}});
    }

    async function confirmPasswordReset(token, password) {
        return request('/auth/reset', {
            method: 'POST',
            body: {email: read('reset-email', 'alumno@educatia.test'), token, password},
        });
    }

    const api = {
        getBackendOrigin: () => backendOrigin,
        getApiBase: () => apiBase,
        resolveAssetUrl: url => String(url || '').startsWith('/')
            ? new URL(String(url).slice(1), document.baseURI).href
            : new URL(url || '.', document.baseURI).href,
        getToken,
        setToken: token => storage.setItem(key('edu-token'), token),
        clearToken,
        getElevation,
        setElevation,
        getUser,
        setUser,
        clearUser,
        restoreSession,
        login,
        register,
        getMe,
        updateMe,
        logout: async () => { clearUser(); clearToken(); return {ok: true}; },
        refreshAccessToken: getMe,
        getSystemInfo: async () => request('/system/info'),
        getCampusStats: async () => request('/stats'),
        getCampusUsers: async (params = {}) => request('/users?' + new URLSearchParams(params)),
        getCampusUser: async (id) => request('/users/' + id),
        getCampusPosts: async () => request('/posts'),
        createCampusPost: async (body) => request('/posts', {method: 'POST', body: {body}}),
        getSupportTickets: async () => request('/support/tickets'),
        getSupportTicket: async (id) => request('/support/tickets/' + id),
        createSupportTicket: async (data) => request('/support/tickets', {method: 'POST', body: data}),
        getCampusMaterial: async (file) => request('/materials?file=' + encodeURIComponent(file)),
        previewCampusResource: async (url) => request('/resources/preview', {method: 'POST', body: {url}}),
        queryCampusData: async (sql, elevationKey = '') => {
            const elev = elevationKey || getElevation();
            if (elevationKey) setElevation(elevationKey);
            return request('/admin/query', {
                method: 'POST',
                headers: elev ? {'X-Admin-Elevation': elev} : {},
                body: {sql},
            });
        },
        getGoogleLoginUrl: () => '',
        getGitHubLoginUrl: () => '',
        exchangeGitHubCode: unsupported,
        loginWithOAuthToken: unsupported,
        requestPasswordReset,
        confirmPasswordReset,
        changePassword: unsupported,
        requestEmailChange: unsupported,
        confirmEmailChange: unsupported,
        getAuthSessions: async () => [{id: 'current', current: true, created_at: '2026-10-28T12:00:00Z', user_agent: navigator.userAgent}],
        revokeAuthSession: unsupported,
        getCourses,
        getCourse,
        getMyEnrollments,
        enroll,
        unenroll: unsupported,
        getLessons,
        getLesson,
        getModules,
        getModule,
        getCourseProgress,
        completeLesson,
        getCourseEnrollments: async () => (await request('/users')).items.map(u => ({...userShape(u), usuario: userShape(u), usuario_id: u.id, progreso: 0})),
        getMaterials: async () => [],
        getLessonResources: async () => [],
        getLessonInteractions: async () => [],
        saveLessonInteraction: async (id, data) => data,
        getQuizzes: async () => [],
        getQuiz: unsupported,
        getQuizAttempts: async () => [],
        submitQuizAttempt: unsupported,
        getMyGrades: async () => [],
        getCourseGrades: async () => [],
        getMyCertificates: async () => [],
        getCourseCertificates: async () => [],
        requestCertificate: unsupported,
        verifyCertificate: unsupported,
        getNotifications: async () => [],
        markNotificationRead: async () => ({ok: true}),
        markAllNotificationsRead: async () => ({ok: true}),
        getStudyPlanSessions: async () => localList('plan'),
        createStudyPlanSession,
        updateStudyPlanSession,
        deleteStudyPlanSession,
        getOnboarding: async () => ({completado: true, completed: true, objetivo: 'Preparación académica', programa: 'universidad', materias: [], intereses: [], horas_semana: 6}),
        saveOnboarding: async (data) => { store('onboarding', data); return data; },
        getPersonalizationQuestions: async () => [],
        getLearningGateStatus: async () => ({onboarding_completed: true, diagnostic_completed: true, can_access_courses: true, requires_onboarding: false, requires_diagnostic: false}),
        getContinuousAssessment: async () => null,
        getDailyExaniPractice: async () => null,
        getDiagnostic: async () => null,
        getMockExams: async () => [],
        getCourseRecommendations: getCourses,
        getExaniSimulatorSummary: async () => ({subjects: [], modules: [], sessions: [], available: false, total_questions: 0}),
        getSchoolBoard: async () => ({items: [], summary: {pending: 0, submitted: 0, reviewed: 0}, total: 0}),
        getSchoolAssignments: async () => [],
        getSchoolSubmissions: async () => [],
        getAleAssignments: async () => [],
        getAlePreferences: async () => ({enabled: false}),
        saveAlePreferences: async (data) => data,
        getLearningLab: async () => ({subjects: [], materias: [], simulations: [], items: [], total: 0}),
        getLabSimulationSessions: async () => [],
        getPracticeExamLab: async () => ({subjects: [], exams: [], items: [], total: 0}),
        getPublishedAIArticles: async () => [],
        getManageAIArticles: async () => [],
        getCurrentSubscription: async () => {
            const u = getUser();
            const plan = u?.plan || u?.plan_nombre || 'Plus';
            return {
                active: plan !== 'Gratuito',
                subscription_active: plan !== 'Gratuito',
                premium_active: plan in {'Plus':1, 'Pro':1, 'Elite Anual':1, 'Institucional VIP':1},
                portal_available: false,
                status: 'active',
                plan_name: 'EducatIA ' + plan,
                suscripcion_activa: plan !== 'Gratuito',
                access_type: plan === 'Institucional VIP' ? 'institutional' : 'individual',
            };
        },
        getProgramOffers,
        getPricingPlans: async () => [
            {id: 'basico', nombre: 'Básico', precio: 399, moneda: 'MXN', periodo: 'mensual'},
            {id: 'plus', nombre: 'Plus', precio: 799, moneda: 'MXN', periodo: 'trimestral'},
            {id: 'pro', nombre: 'Pro', precio: 1499, moneda: 'MXN', periodo: 'semestral'},
            {id: 'elite', nombre: 'Elite Anual', precio: 3999, moneda: 'MXN', periodo: 'anual'},
            {id: 'vip', nombre: 'Institucional VIP', precio: 8999, moneda: 'MXN', periodo: 'anual'},
        ],
        getPurchaseHistory: async () => [],
        getCheckoutConfig: async () => ({oauthEnabled: false}),
        getProgramElementsConfig: async (id) => ({...await getCourse(id)}),
        refreshCourseAccess: getCourse,
        getAdminPanelPath: () => '/administracion',
        getAdminAccessStatus: adminStatus,
        verifyAdminAccess,
        closeAdminAccess: async () => { setElevation(''); return {ok: true}; },
        getAdminConsole,
        getAdminAnalytics,
        getAdminRequestLogs: async () => request('/admin/audit'),
        downloadAdminAnalytics: async (format, filters) => ({
            blob: new Blob([JSON.stringify(await getAdminAnalytics(filters), null, 2)], {type: 'application/json'}),
            filename: 'educatia-analitica-10k.json',
        }),
        reportAntiCheat: async () => ({ok: true}),
        submitCourseFeedback: async () => ({message: 'Comentario guardado.'}),
        chat: async () => ({
            response: 'Revisa los conceptos clave de la lección y formula un ejemplo propio.',
            respuesta: 'Relaciona cada concepto con un reactivo práctico.',
            message: 'Organiza tus dudas sobre la lección.',
        }),
        getCourseChatingProgress: async () => ({modules: [], completed_modules: [], percentage: 0}),
        redeemPromoCode: async () => ({message: 'Código validado en tu sesión.'}),
    };

    window.EducatIA.Campus = {request, session, userShape, escape};
    return new Proxy(api, {
        get(target, name) {
            if (name in target) return target[name];
            if (typeof name !== 'string' || name === 'then') return undefined;
            return unsupported;
        },
    });
})();
