/* ================================================================
   educatIA - Dashboard alumno personalizado
   Inspired by Coursera learner home: continue, goals, courses, recs.
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Dashboard = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const R = () => window.EducatIA.Router;
    const Icons = window.EducatIA.Icons;

    let currentTab = 'en-curso';
    let calendarDate = new Date();

    const fallbackOffers = [
        {
            title: 'Curso EXANI-II para aspirantes UAEM',
            area: 'Programa principal',
            level: 'Ruta completa',
            desc: 'Diagnóstico, teoría breve, práctica por habilidad, simulacros y seguimiento semanal.',
            img: 'assets/lessons_photo/webp/ciencias-experimentales.webp'
        },
        {
            title: 'Pensamiento matemático desde cero',
            area: 'Matemáticas',
            level: 'Módulo base',
            desc: 'Aritmética, álgebra, razones, porcentajes y problemas explicados paso a paso.',
            img: 'assets/lessons_photo/webp/aritmetica.webp'
        },
        {
            title: 'Comprensión lectora y redacción',
            area: 'Lectura y lenguaje',
            level: 'Módulo clave',
            desc: 'Estrategias de lectura, inferencias, ortografía, puntuación y coherencia textual.',
            img: 'assets/lessons_photo/webp/literatura.webp'
        },
        {
            title: 'Simulacros EXANI-II con tiempo',
            area: 'Práctica real',
            level: 'Evaluación',
            desc: 'Entrenamiento con tiempo, revisión de errores y decisiones de respuesta.',
            img: 'assets/lessons_photo/webp/probabilidad.webp'
        }
    ];

    function toUrl(path) {
        return R()?.toUrl ? R().toUrl(path) : ('#' + path);
    }

    function pct(value) {
        const n = Number(value || 0);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
    }

    function greeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Buenos días';
        if (h < 18) return 'Buenas tardes';
        return 'Buenas noches';
    }

    function initials(name) {
        const parts = String(name || 'Estudiante').trim().split(/\s+/).filter(Boolean);
        return (parts[0]?.[0] || 'E').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
    }

    function requireLearnerAccess() {
        if (!C().requireAuth()) return false;
        const user = API().getUser ? API().getUser() : null;
        const role = C().userState.role || user?.rol;
        if (role === 'maestro') {
            R().navigate('/dashboard-maestro');
            return false;
        }
        return true;
    }

    function courseTitle(enrollment) {
        return enrollment.curso_titulo || enrollment.curso?.titulo || 'Curso educatIA';
    }

    function courseDescription(enrollment) {
        return enrollment.curso_descripcion || enrollment.curso?.descripcion || 'Lecturas guiadas, práctica y seguimiento.';
    }

    function courseTeacher(enrollment) {
        const value = String(enrollment.maestro_nombre || enrollment.curso?.maestro_nombre || '').trim();
        if (!value || /admin\s*full\s*access|full\s*access|acceso\s+total\s+de\s+admin/i.test(value)) {
            return 'educatIA';
        }
        return value;
    }

    function courseId(enrollment) {
        return enrollment.curso_id || enrollment.curso?.id || '';
    }

    function courseHref(enrollment) {
        const nextType = enrollment.siguiente_actividad_tipo;
        const nextId = enrollment.siguiente_actividad_id;
        const id = courseId(enrollment);
        const course = { id, titulo: courseTitle(enrollment) };
        if (nextType === 'leccion' && nextId) {
            return toUrl(window.EducatIA.Utils.lessonUrl(course, {
                id: nextId,
                titulo: enrollment.siguiente_actividad_titulo || nextId,
            }));
        }
        if (nextType === 'tarea' && nextId && id) return toUrl('/tareas/curso/' + id + '?tarea=' + nextId);
        if (nextType === 'quiz' && nextId && id) {
            return toUrl(window.EducatIA.Utils.quizUrl(course, {
                id: nextId,
                titulo: enrollment.siguiente_actividad_titulo || nextId,
            }));
        }
        const progress = pct(enrollment.progreso);
        const lastLessonId = enrollment.ultima_leccion_id || enrollment['última_leccion_id'];
        if (progress > 0 && progress < 100 && lastLessonId) {
            return toUrl(window.EducatIA.Utils.lessonUrl(course, { id: lastLessonId }));
        }
        return id ? toUrl(window.EducatIA.Utils.courseUrl(course)) : toUrl('/explorar');
    }

    function courseCta(enrollment) {
        const progress = pct(enrollment.progreso);
        if (progress >= 100) return 'Revisar';
        if (progress > 0) return 'Continuar';
        return 'Comenzar';
    }

    function nextActivity(enrollment) {
        const progress = pct(enrollment.progreso);
        if (progress >= 100) {
            return { title: 'Curso completado', meta: 'Repasa materiales o solicita tu certificado.' };
        }
        if (progress > 0) {
            return {
                title: enrollment.siguiente_actividad_titulo || 'Siguiente actividad',
                meta: 'Retoma desde el siguiente paso disponible de tu ruta.'
            };
        }
        return {
            title: enrollment.siguiente_actividad_titulo || 'Primera actividad',
            meta: 'Abre el módulo inicial y fija tu punto de partida.'
        };
    }

    function lessonProgress(enrollment) {
        const total = Number(enrollment.total_actividades || enrollment.total_lecciones || 0);
        const done = Number(enrollment.actividades_completadas || enrollment.lecciones_completadas || 0);
        if (!total) return 'Contenido textual disponible';
        return done + ' de ' + total + ' actividades';
    }

    function averageProgress(items) {
        if (!items.length) return 0;
        return pct(items.reduce((sum, item) => sum + pct(item.progreso), 0) / items.length);
    }

    function hasPremiumAccess(user) {
        if (!user) return false;
        if (user.rol === 'admin' || user.rol === 'maestro') return true;
        if (user.suscripcion_activa || user.premium_activo) return true;
        if (!user.suscripcion_hasta) return false;
        return new Date(user.suscripcion_hasta).getTime() > Date.now();
    }

    function formatSubscriptionDate(rawDate) {
        if (!rawDate) return '';
        const date = new Date(rawDate);
        if (!Number.isFinite(date.getTime())) return '';
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function renderSubscriptionStatus(user, premium) {
        const until = formatSubscriptionDate(user?.suscripcion_hasta);
        const label = premium ? 'Suscripción EducatIA Premium activa' : 'Cuenta gratuita';
        const detail = premium
            ? (until ? 'Acceso completo activo hasta ' + until + '.' : 'Acceso completo activo para cursos, formularios y ruta personalizada.')
            : 'Aún no tienes una suscripción activa. Puedes continuar explorando y activar EducatIA Premium cuando estés listo.';

        return `
            <section class="lh-subscription ${premium ? 'lh-subscription--premium' : 'lh-subscription--free'}" aria-label="Estado de suscripción">
                <div class="lh-subscription__mark" aria-hidden="true">
                    ${premium ? '<img src="assets/premium/premium-transparent.png" alt="">' : Icons.award}
                </div>
                <div class="lh-subscription__copy">
                    <span>${premium ? 'Premium' : 'Plan actual'}</span>
                    <strong>${esc(label)}</strong>
                    <p>${esc(detail)}</p>
                </div>
                ${premium ? '' : `
                    <div class="lh-subscription__actions">
                        <button type="button" class="btn btn--blue" data-premium-checkout>Acceder a EducatIA Premium</button>
                        <button type="button" class="btn btn--outline" data-view-pricing>Registrarme gratis</button>
                    </div>
                `}
            </section>
        `;
    }

    function profileGoal(user, focusCourse) {
        const explicitGoal = user?.perfil_rol_deseado || user?.perfil_titulo || user?.perfil_resumen;
        if (explicitGoal) return explicitGoal;
        if (focusCourse) return 'Avanzar en ' + courseTitle(focusCourse);
        return 'Construir una ruta de aprendizaje clara';
    }

    function daysOfWeek() {
        return ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
    }

    function monthName(date) {
        return date.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
    }

    function sameCalendarDay(left, right) {
        return left.getFullYear() === right.getFullYear()
            && left.getMonth() === right.getMonth()
            && left.getDate() === right.getDate();
    }

    function buildCalendar(date, sessions) {
        const plannedSessions = Array.isArray(sessions) ? sessions : [];
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = (firstDay.getDay() + 6) % 7;
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        let cells = '';

        for (let i = 0; i < startWeekday; i++) {
            cells += '<span class="lh-cal__day lh-cal__day--empty"></span>';
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const isToday = isCurrentMonth && d === today.getDate();
            const day = new Date(year, month, d);
            const hasPlan = plannedSessions.some((session) => {
                const scheduled = new Date(session.scheduled_for);
                return Number.isFinite(scheduled.getTime()) && sameCalendarDay(day, scheduled);
            });
            cells += '<span class="lh-cal__day' + (isToday ? ' lh-cal__day--today' : '') + (hasPlan ? ' lh-cal__day--planned' : '') + '">' + d + (hasPlan ? '<i></i>' : '') + '</span>';
        }
        return cells;
    }

    function updateCalendar(sessions) {
        const monthEl = document.getElementById('lh-cal-month');
        const gridEl = document.getElementById('lh-cal-grid');
        if (monthEl) monthEl.textContent = monthName(calendarDate);
        if (gridEl) gridEl.innerHTML = buildCalendar(calendarDate, sessions);
    }

    function splitEnrollments(enrollments) {
        const inProgress = enrollments.filter((e) => pct(e.progreso) > 0 && pct(e.progreso) < 100);
        const notStarted = enrollments.filter((e) => pct(e.progreso) === 0);
        const completed = enrollments.filter((e) => pct(e.progreso) >= 100);
        return { inProgress, notStarted, completed };
    }

    function chooseFocus(groups) {
        return groups.inProgress[0] || groups.notStarted[0] || groups.completed[0] || null;
    }

    function inferArea(title) {
        const t = String(title || '').toLowerCase();
        if (t.includes('mate') || t.includes('calculo') || t.includes('arit')) return 'Matemáticas';
        if (t.includes('lect') || t.includes('liter') || t.includes('redac')) return 'Lectura';
        if (t.includes('salud') || t.includes('biolog')) return 'Ciencias de la salud';
        if (t.includes('fisica') || t.includes('quimica')) return 'Ciencias experimentales';
        if (t.includes('historia') || t.includes('derecho') || t.includes('social')) return 'Ciencias sociales';
        if (t.includes('ia') || t.includes('inteligencia') || t.includes('program')) return 'Tecnologia';
        return 'Curso educatIA';
    }

    function courseCover(title, fallback) {
        const value = normalizeCourseTitle(title);
        const base = 'assets/lessons_photo/webp/';
        const covers = [
            ['matematicas financieras', 'matematicas-financieras.webp'],
            ['calculo diferencial', 'calculo-diferencial.webp'],
            ['ciencias experimentales', 'ciencias-experimentales.webp'],
            ['ciencias de la salud', 'ciencias-de-la-salud.webp'],
            ['pensamiento matematico', 'aritmetica.webp'],
            ['redaccion indirecta', 'literatura.webp'],
            ['comprension lectora', 'assets/images/landing-courses/reading-writing.jpg'],
            ['ciencias sociales', 'assets/images/explore-courses/social-sciences.jpg'],
            ['administracion', 'administracion.webp'],
            ['aritmetica', 'aritmetica.webp'],
            ['biologia', 'biologia.webp'],
            ['calculo', 'calculo-diferencial.webp'],
            ['derecho', 'derecho.webp'],
            ['economia', 'economia.webp'],
            ['filosofia', 'filosofia.webp'],
            ['fisica', 'fisica.webp'],
            ['historia', 'historia.webp'],
            ['literatura', 'literatura.webp'],
            ['premedicina', 'premedicina.webp'],
            ['probabilidad', 'probabilidad.webp'],
            ['psicologia', 'psicologia.webp'],
            ['quimica', 'quimica.webp'],
            ['matematicas', 'aritmetica.webp']
        ];
        const match = covers.find(([needle]) => value.includes(needle));
        if (match) return match[1].startsWith('/') ? match[1] : base + match[1];
        return fallback || 'assets/explorar/banner-exani-hero.webp';
    }

    function normalizeOffer(course, index) {
        const fallback = fallbackOffers[index % fallbackOffers.length];
        if (!course || !course.id) return fallback;
        return {
            id: course.id,
            title: course.titulo || fallback.title,
            area: course.categoria || course.area || inferArea(course.titulo),
            level: course.nivel || 'Curso textual',
            desc: course.descripcion || fallback.desc,
            img: course.imagen_url || courseCover(course.titulo, fallback.img)
        };
    }

    function buildRecommendationSource(catalog, enrollments) {
        const enrolledIds = new Set(enrollments.map((e) => String(courseId(e))).filter(Boolean));
        const fresh = Array.isArray(catalog)
            ? catalog.filter((course) => course?.id && !enrolledIds.has(String(course.id))).slice(0, 4)
            : [];
        if (fresh.length >= 4) return fresh;
        return fresh.concat(fallbackOffers).slice(0, 4);
    }

    function renderAvatar(name, user) {
        const avatar = C().renderUserAvatar ? C().renderUserAvatar('lh-top__avatar', user || undefined) : '';
        if (avatar) return avatar;
        return '<div class="lh-top__avatar">' + esc(initials(name)) + '</div>';
    }

    function renderStat(label, value, helper) {
        return `
            <div class="lh-stat">
                <span>${esc(label)}</span>
                <strong>${esc(value)}</strong>
                <small>${esc(helper)}</small>
            </div>
        `;
    }

    function renderGoals(enrollments, groups) {
        const hasCourses = enrollments.length > 0;
        const activitiesToday = enrollments.reduce((sum, item) => sum + Number(item.actividades_hoy || 0), 0);
        const goals = hasCourses ? [
            {
                title: 'Continuar tu curso principal',
                desc: groups.inProgress.length ? 'Tienes una lectura lista para retomar.' : 'Elige un curso pendiente para empezar.',
                count: groups.inProgress.length ? '1/1' : '0/1',
                done: groups.inProgress.length > 0
            },
            {
                title: 'Completar una actividad',
                desc: 'Una sesión breve mantiene activa tu ruta.',
                count: Math.min(activitiesToday, 1) + '/1',
                done: activitiesToday > 0
            },
            {
                title: 'Revisar tu avance',
                desc: 'Usa el progreso para decidir el siguiente módulo.',
                count: averageProgress(enrollments) + '%',
                done: averageProgress(enrollments) >= 50
            }
        ] : [
            {
                title: 'Elegir tu primer programa',
                desc: 'Empieza con el curso principal o explora el catálogo.',
                count: '0/1',
                done: false
            },
            {
                title: 'Preparar una sesión corta',
                desc: 'Reserva de 10 a 15 minutos para iniciar.',
                count: 'hoy',
                done: false
            },
            {
                title: 'Crear tu ruta personal',
                desc: 'Tu panel se llenara conforme te inscribas.',
                count: 'lista',
                done: false
            }
        ];

        return goals.map((goal) => `
            <div class="lh-goal ${goal.done ? 'is-done' : ''}">
                <span class="lh-goal__icon">${goal.done ? Icons.checkCircle : Icons.target}</span>
                <span class="lh-goal__body">
                    <strong>${esc(goal.title)}</strong>
                    <small>${esc(goal.desc)}</small>
                </span>
                <em>${esc(goal.count)}</em>
            </div>
        `).join('');
    }

    function gamificationSummary(enrollments, planSessions) {
        const activities = enrollments.reduce((sum, item) => (
            sum + Number(item.actividades_completadas || item.lecciones_completadas || 0)
        ), 0);
        const quizzes = enrollments.reduce((sum, item) => sum + Number(item.quizzes_aprobados || 0), 0);
        const completedCourses = enrollments.filter((item) => pct(item.progreso) >= 100).length;
        const completedSessions = (Array.isArray(planSessions) ? planSessions : []).filter((session) => !!session.completado).length;
        const activitiesToday = enrollments.reduce((sum, item) => sum + Number(item.actividades_hoy || 0), 0);
        const points = (activities * 20) + (quizzes * 30) + (completedCourses * 150) + (completedSessions * 15);
        const level = points >= 900 ? 'Mentor constante' : points >= 450 ? 'Explorador avanzado' : points >= 150 ? 'Aprendiz activo' : 'Primer impulso';
        const nextLevelPoints = points >= 900 ? 1200 : points >= 450 ? 900 : points >= 150 ? 450 : 150;
        const levelProgress = pct((points / nextLevelPoints) * 100);
        const achievements = [
            {
                title: 'Primer paso',
                desc: activities > 0 ? 'Ya completaste tu primera actividad.' : 'Completa una actividad para activar este logro.',
                done: activities > 0
            },
            {
                title: 'Práctica validada',
                desc: quizzes > 0 ? 'Ya aprobaste evaluaciones.' : 'Aprueba un quiz para reforzar tu ruta.',
                done: quizzes > 0
            },
            {
                title: 'Ritmo semanal',
                desc: completedSessions > 0 ? 'Ya cerraste sesiones programadas.' : 'Marca una sesión del plan como completada.',
                done: completedSessions > 0
            },
            {
                title: 'Curso cerrado',
                desc: completedCourses > 0 ? 'Tienes cursos finalizados.' : 'Termina una ruta para liberar certificado.',
                done: completedCourses > 0
            }
        ];
        return { points, level, nextLevelPoints, levelProgress, achievements, activeToday: activitiesToday > 0 };
    }

    function renderFocusCard(focusCourse, average, completedLessons, totalLessons, premium) {
        const progress = focusCourse ? pct(focusCourse.progreso) : 0;
        const href = focusCourse ? courseHref(focusCourse) : toUrl('/explorar');
        const next = focusCourse ? nextActivity(focusCourse) : {
            title: 'Elige un programa',
            meta: 'Cuando te inscribas, verás aquí tu siguiente actividad.'
        };
        const title = focusCourse ? courseTitle(focusCourse) : 'Tu ruta está lista para empezar';
        const teacher = focusCourse ? courseTeacher(focusCourse) : 'educatIA';
        const lessons = focusCourse ? lessonProgress(focusCourse) : 'Catálogo listo para personalizar';
        const cta = focusCourse ? courseCta(focusCourse) : 'Explorar cursos';
        const lessonPct = totalLessons ? pct((completedLessons / totalLessons) * 100) : average;

        return `
            <section class="lh-continue" aria-label="Continuar aprendizaje">
                <div class="lh-continue__main">
                    <h2>${esc(title)}</h2>
                    <p>${esc(teacher)} - ${esc(lessons)}</p>
                    <div class="lh-progress" aria-label="Progreso ${progress}%">
                        <span style="width:${progress}%"></span>
                    </div>
                    <div class="lh-continue__meta">
                        <span><strong>${progress}%</strong> avance del curso</span>
                        <span><strong>${lessonPct}%</strong> avance total</span>
                    </div>
                    <div class="lh-continue__actions">
                        <a href="${href}" class="btn btn--blue">${esc(cta)}</a>
                        <a href="${toUrl('/explorar')}" class="btn btn--outline">Explorar catálogo</a>
                    </div>
                </div>
                <aside class="lh-next-step">
                    <span>${premium ? 'Suscripción activa' : 'Cuenta gratuita'}</span>
                    <h3>${esc(next.title)}</h3>
                    <p>${esc(next.meta)}</p>
                    <div class="lh-ring" style="--progress:${average}%">
                        <strong>${average}%</strong>
                    </div>
                    ${premium ? '' : `
                        <div class="lh-next-step__actions">
                            <button type="button" class="btn btn--white" data-premium-checkout>Acceder a Premium</button>
                            <button type="button" class="btn btn--ghost-light" data-view-pricing>Registrarme gratis</button>
                        </div>
                    `}
                </aside>
            </section>
        `;
    }

    function nextDateTimeLocal() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(18, 0, 0, 0);
        return toDateTimeLocalValue(date);
    }

    function toDateTimeLocalValue(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (!Number.isFinite(date.getTime())) return '';
        const pad = (value) => String(value).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function formatPlanDate(value) {
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) return 'Fecha por definir';
        return date.toLocaleString('es-MX', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatLabSessionDate(value) {
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) return 'Fecha reciente';
        return date.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function labSessionDuration(seconds) {
        const value = Number(seconds || 0);
        if (!value) return 'Sin duracion';
        if (value < 60) return Math.max(1, Math.round(value)) + ' seg';
        return Math.round(value / 60) + ' min';
    }

    function labSessionHref(session) {
        if (!session?.subject_id || !session?.simulation_id || !session?.id) {
            return toUrl('/laboratorio-aprendizaje');
        }
        return toUrl(
            '/laboratorio-aprendizaje/'
            + encodeURIComponent(session.subject_id)
            + '/'
            + encodeURIComponent(session.simulation_id)
            + '?session_id='
            + encodeURIComponent(session.id)
        );
    }

    function renderLabSessionHistory(labSessions, premium) {
        const sessions = Array.isArray(labSessions) ? labSessions.slice(0, 6) : [];
        return `
            <section class="lh-panel lh-lab-history" aria-label="Mis sesiones de laboratorio">
                <div class="lh-panel__head">
                    <div>
                        <h2>Mis sesiones de laboratorio</h2>
                        <p>Experimenta con simuladores HTML5 de Física, cambia variables y observa resultados en tiempo real. Aquí también puedes retomar las sesiones que ya guardaste.</p>
                    </div>
                    <a href="${toUrl('/laboratorio-aprendizaje')}" class="lh-link">Abrir laboratorio</a>
                </div>
                ${!premium ? `
                    <div class="lh-lab-empty">
                        <strong>Laboratorio disponible con EducatIA Premium</strong>
                        <p>Al activar tu plan se guardaran tus simulaciones, intentos y avances.</p>
                        <button type="button" class="btn btn--blue btn--sm" data-view-pricing>Registrarme gratis</button>
                    </div>
                ` : sessions.length ? `
                    <div class="lh-lab-grid">
                        ${sessions.map((session) => `
                            <article class="lh-lab-card ${session.status === 'completed' ? 'is-completed' : 'is-active'}">
                                <div>
                                    <span>${esc(session.status === 'completed' ? 'Cerrada' : 'Activa')}</span>
                                    <strong>${esc(session.titulo || 'Sesión de laboratorio')}</strong>
                                    <small>${esc(session.subject_id)} / ${esc(session.simulation_id)}</small>
                                </div>
                                <p>${esc(session.results?.main || 'Parametros guardados para continuar.')}</p>
                                <dl>
                                    <div>
                                        <dt>Ultima actividad</dt>
                                        <dd>${esc(formatLabSessionDate(session.updated_at || session.started_at))}</dd>
                                    </div>
                                    <div>
                                        <dt>Duracion</dt>
                                        <dd>${esc(labSessionDuration(session.duration_seconds))}</dd>
                                    </div>
                                </dl>
                                <a href="${labSessionHref(session)}" class="btn btn--outline btn--sm">Ver registro</a>
                            </article>
                        `).join('')}
                    </div>
                ` : `
                    <div class="lh-lab-empty">
                        <strong>Aún no tienes sesiones guardadas</strong>
                        <p>Abre un simulador, mueve parámetros y EducatIA guardará tu progreso automáticamente.</p>
                        <a href="${toUrl('/laboratorio-aprendizaje')}" class="btn btn--blue btn--sm">Crear primera sesión</a>
                    </div>
                `}
            </section>
        `;
    }

    function exaniSessionHref(session) {
        if (!session?.id) return toUrl(window.EducatIA.Utils.exaniSimulatorUrl());
        const order = session.siguiente_reactivo || session.current_order || 1;
        return toUrl(window.EducatIA.Utils.exaniQuestionUrl(session.id, order));
    }

    function renderDashboardNavigation(groups) {
        return `
            <nav class="lh-dashboard-nav" aria-label="Secciones de Mi aprendizaje">
                <a class="is-active" href="#learning-courses" data-dashboard-home>Mi aprendizaje</a>
                <a href="${toUrl('/tareas')}">Tareas</a>
                <a href="${toUrl('/certificados')}">Certificados</a>
                <a href="${toUrl(window.EducatIA.Utils.exaniSimulatorUrl())}">Simulacros</a>
                <a href="${toUrl('/laboratorio-aprendizaje')}">Laboratorio</a>
            </nav>
        `;
    }

    function renderCertificateCallout(completedCount) {
        return `
            <section class="lh-certificate-callout" aria-labelledby="lh-certificates-title">
                <div class="lh-certificate-callout__icon" aria-hidden="true">${Icons.award}</div>
                <div>
                    <span class="lh-kicker">Certificación educatIA</span>
                    <h2 id="lh-certificates-title">Tus logros, en un documento verificable</h2>
                    <p>${completedCount
                        ? `Tienes ${completedCount} curso${completedCount === 1 ? '' : 's'} completado${completedCount === 1 ? '' : 's'}. Consulta tus certificados y emite los que estén disponibles.`
                        : 'Al completar una ruta académica podrás emitir un certificado digital con folio público de verificación.'}</p>
                </div>
                <a class="btn btn--outline" href="${toUrl('/certificados')}">Mis certificados</a>
            </section>
        `;
    }

    function renderContinuousAssessment(profile) {
        if (!profile) return '';
        const evidenceCount = Math.max(0, Number(profile.evidence_count || 0));
        const mastery = pct(profile.mastery_score);
        const confidence = pct(profile.confidence_score);
        const trendScore = Number(profile.trend_score || 0);
        const levelLabels = {
            sin_evidencia: 'Línea base pendiente',
            requiere_refuerzo: 'Requiere refuerzo',
            en_desarrollo: 'En desarrollo',
            competente: 'Desempeño competente',
            dominio: 'Dominio consolidado'
        };
        const trendLabels = {
            ascendente: 'Tendencia ascendente',
            estable: 'Tendencia estable',
            descendente: 'Tendencia descendente'
        };
        const level = levelLabels[profile.level] || 'Seguimiento activo';
        const trend = trendLabels[profile.trend] || 'Tendencia estable';
        const distribution = profile.adaptive_plan?.area_distribution || {};
        const areaPlan = Object.entries(distribution)
            .map(([area, count]) => `<span><strong>${esc(count)}</strong> ${esc(area)}</span>`)
            .join('');
        const trendValue = evidenceCount >= 4
            ? `${trendScore > 0 ? '+' : ''}${Math.round(trendScore * 10) / 10} pts`
            : 'En observación';

        return `
            <section class="lh-continuous" aria-label="Evaluación continua del desempeño">
                <div class="lh-continuous__summary">
                    <div>
                        <span class="lh-kicker">Seguimiento académico</span>
                        <h2>Evaluación continua</h2>
                        <p>${esc(profile.recommendation || 'Completa una evaluación para establecer tu línea base académica.')}</p>
                    </div>
                    <span class="lh-continuous__level lh-continuous__level--${esc(profile.level || 'sin_evidencia')}">${esc(level)}</span>
                </div>
                <div class="lh-continuous__metrics">
                    <div class="lh-continuous__score" style="--mastery:${mastery}">
                        <span>Dominio estimado</span>
                        <strong>${evidenceCount ? mastery + '%' : '—'}</strong>
                        <div class="lh-continuous__bar" aria-label="Dominio estimado ${mastery}%"><i></i></div>
                    </div>
                    <div>
                        <span>Confianza del indicador</span>
                        <strong>${confidence}%</strong>
                        <small>${esc(evidenceCount)} ${evidenceCount === 1 ? 'evaluación considerada' : 'evaluaciones consideradas'}</small>
                    </div>
                    <div>
                        <span>${esc(trend)}</span>
                        <strong>${esc(trendValue)}</strong>
                        <small>Compara el bloque reciente con el anterior</small>
                    </div>
                </div>
                ${areaPlan ? `
                    <div class="lh-continuous__plan">
                        <div>
                            <span>Próxima práctica adaptativa</span>
                            <p>${esc(profile.adaptive_plan?.reason || '')}</p>
                        </div>
                        <div class="lh-continuous__areas">${areaPlan}</div>
                    </div>
                ` : ''}
                <small class="lh-continuous__note">Este indicador se actualiza con evaluaciones y simulacros; no sustituye la calificación ni los requisitos de acreditación de cada clase.</small>
            </section>
        `;
    }

    function renderRealExamPractice(dailyPractice, premium) {
        const active = dailyPractice?.active_session || null;
        const completedToday = Boolean(dailyPractice?.completed_today);
        const total = Number(dailyPractice?.total_reactivos || 15);
        const answered = Number(active?.reactivos_contestados || 0);
        const progress = total ? pct((answered / total) * 100) : 0;
        const buttonLabel = completedToday ? 'Completada hoy' : 'Continuar';
        const disabled = completedToday || !premium;

        return `
            <section class="lh-exam-practice ${completedToday ? 'is-complete' : ''}" id="exani-daily-practice" aria-label="Practica simulador examen real">
                <div class="lh-exam-practice__main">
                    <span class="lh-kicker">Simulador real</span>
                    <h2>Práctica simulador examen real</h2>
                    <p>${esc(dailyPractice?.description || 'Práctica diaria con cobertura de las tres áreas generales y refuerzo según tu desempeño reciente.')}</p>
                    <div class="lh-exam-practice__meta">
                        <span><strong>${esc(answered)}/${esc(total)}</strong> reactivos hoy</span>
                        <span><strong>${esc(dailyPractice?.duracion_minutos || 35)} min</strong> práctica corta</span>
                    </div>
                    <div class="lh-progress" aria-label="Progreso de la práctica ${progress}%">
                        <span style="width:${progress}%"></span>
                    </div>
                </div>
                <div class="lh-exam-practice__actions">
                    ${premium ? `
                        <button type="button" class="btn btn--blue" data-daily-exani="${active?.id ? 'continue' : 'start'}" ${disabled ? 'disabled aria-disabled="true"' : ''}>
                            ${esc(buttonLabel)}
                        </button>
                        <a href="${toUrl(window.EducatIA.Utils.exaniSimulatorUrl())}" class="btn btn--outline">Simulacros completos</a>
                    ` : `
                        <a href="${toUrl('/precios')}" class="btn btn--blue">Activar acceso</a>
                        <a href="${toUrl(window.EducatIA.Utils.exaniSimulatorUrl())}" class="btn btn--outline">Ver simuladores</a>
                    `}
                </div>
            </section>
        `;
    }

    function normalizeCourseTitle(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function findCourseByTitle(items, title) {
        const needle = normalizeCourseTitle(title);
        return (items || []).find((item) => normalizeCourseTitle(courseTitle(item) || item?.titulo).includes(needle));
    }

    function renderRequiredCoreCourses(catalog, enrollments) {
        const required = [
            { title: 'Comprensión lectora', desc: 'Lectura, inferencia, tono, idea central y estructura textual.' },
            { title: 'Redacción indirecta', desc: 'Coherencia, puntuación, conectores, ortografía y mejora de textos.' },
            { title: 'Pensamiento matemático', desc: 'Problemas, funciones, proporcionalidad, datos y razonamiento numérico.' },
        ];
        const all = [...(enrollments || []), ...(catalog || [])];
        const available = required
            .map((item) => ({ ...item, course: findCourseByTitle(all, item.title) }))
            .filter((item) => item.course);
        if (!available.length) {
            return '';
        }
        return `
            <section class="lh-core-courses" aria-label="Cursos obligatorios del examen general">
                <div class="lh-panel__head">
                    <div>
                        <span class="lh-kicker">Base obligatoria</span>
                        <h2>Cursos generales del EXANI</h2>
                        <p>Estos tres módulos forman la base del examen para universidad y preparatoria.</p>
                    </div>
                </div>
                <div class="lh-core-grid">
                    ${available.map((item) => {
                        const href = courseHref(item.course);
                        return `
                            <article class="lh-core-card">
                                <span>${esc(item.title)}</span>
                                <p>${esc(item.desc)}</p>
                                <a href="${href}" class="lh-link">Abrir módulo</a>
                            </article>
                        `;
                    }).join('')}
                </div>
            </section>
        `;
    }

    function renderStudyPlan(planSessions, focusCourse) {
        const sessions = Array.isArray(planSessions) ? planSessions : [];
        const ordered = [...sessions].sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
        const upcoming = ordered.filter((session) => !session.completado).slice(0, 6);
        const completed = ordered.filter((session) => session.completado).slice(-3).reverse();
        const defaultTitle = focusCourse
            ? 'Estudiar ' + courseTitle(focusCourse)
            : 'Sesión de estudio EducatIA';

        return `
            <div class="lh-plan" id="study-plan">
                <form id="lh-plan-form" class="lh-plan__form">
                    <input type="hidden" id="lh-plan-session-id" value="">
                    <label>
                        <span>Sesión</span>
                        <input class="fi" id="lh-plan-title" type="text" value="${esc(defaultTitle)}" maxlength="255">
                    </label>
                    <label>
                        <span>Fecha y hora</span>
                        <input class="fi" id="lh-plan-date" type="datetime-local" value="${nextDateTimeLocal()}">
                    </label>
                    <label>
                        <span>Duracion</span>
                        <select class="fi" id="lh-plan-duration">
                            <option value="15">15 min</option>
                            <option value="25" selected>25 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                        </select>
                    </label>
                    <label class="lh-plan__notes">
                        <span>Notas</span>
                        <textarea class="fi" id="lh-plan-notes" rows="2" maxlength="2000" placeholder="Qué vas a repasar o resolver en esta sesión?"></textarea>
                    </label>
                    <div class="lh-plan__form-actions">
                        <button type="submit" class="btn btn--blue btn--sm" id="lh-plan-submit">Programar</button>
                        <button type="button" class="btn btn--outline btn--sm" id="lh-plan-cancel" hidden>Cancelar</button>
                    </div>
                    <p id="lh-plan-message" class="text-small" aria-live="polite"></p>
                </form>

                <div class="lh-plan__list">
                    ${upcoming.length ? upcoming.map((session) => `
                        <article class="lh-plan__item">
                            <button type="button" class="lh-plan__item-main" data-plan-complete="${session.id}" data-plan-complete-value="true" title="Marcar como completada">
                                <strong>${esc(session.titulo)}</strong>
                                <span>${esc(formatPlanDate(session.scheduled_for))} - ${esc(session.duracion_minutos)} min</span>
                                ${session.notas ? `<small>${esc(session.notas)}</small>` : ''}
                            </button>
                            <div class="lh-plan__item-actions">
                                <button type="button" data-plan-edit="${session.id}" aria-label="Editar ${esc(session.titulo)}">Editar</button>
                                <button type="button" data-plan-delete="${session.id}" aria-label="Eliminar ${esc(session.titulo)}">Eliminar</button>
                            </div>
                        </article>
                    `).join('') : '<p class="text-small">Aún no tienes sesiones programadas. Agenda una para que aparezca en tu calendario.</p>'}
                    ${completed.length ? `
                        <div class="lh-plan__completed">
                            <strong>Completadas recientes</strong>
                            ${completed.map((session) => `
                                <article class="lh-plan__item lh-plan__item--done">
                                    <button type="button" class="lh-plan__item-main" data-plan-complete="${session.id}" data-plan-complete-value="false" title="Marcar como pendiente">
                                        <strong>${esc(session.titulo)}</strong>
                                        <span>${esc(formatPlanDate(session.scheduled_for))} - ${esc(session.duracion_minutos)} min</span>
                                    </button>
                                    <div class="lh-plan__item-actions">
                                        <button type="button" data-plan-delete="${session.id}" aria-label="Eliminar ${esc(session.titulo)}">Eliminar</button>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderTabs(groups) {
        const counts = {
            'en-curso': groups.inProgress.length,
            'sin-iniciar': groups.notStarted.length,
            completado: groups.completed.length
        };

        return `
            <div class="lh-tabs" role="tablist" aria-label="Mis cursos">
                <button type="button" class="lh-tab ${currentTab === 'en-curso' ? 'is-active' : ''}" data-learning-tab="en-curso" role="tab" aria-selected="${currentTab === 'en-curso'}">En progreso <span>${counts['en-curso']}</span></button>
                <button type="button" class="lh-tab ${currentTab === 'sin-iniciar' ? 'is-active' : ''}" data-learning-tab="sin-iniciar" role="tab" aria-selected="${currentTab === 'sin-iniciar'}">Por iniciar <span>${counts['sin-iniciar']}</span></button>
                <button type="button" class="lh-tab ${currentTab === 'completado' ? 'is-active' : ''}" data-learning-tab="completado" role="tab" aria-selected="${currentTab === 'completado'}">Completados <span>${counts.completado}</span></button>
            </div>
        `;
    }

    function renderEmptyState(tab, groups) {
        const hasOtherCourses = groups.inProgress.length || groups.notStarted.length || groups.completed.length;
        let title = 'Todavia no tienes cursos en progreso';
        let desc = 'Inscribete a un curso para que este panel se vuelva tu punto de partida diario.';
        let href = toUrl('/explorar');
        let label = 'Explorar catálogo';

        if (tab === 'sin-iniciar' && hasOtherCourses) {
            title = 'No hay cursos pendientes por iniciar';
            desc = 'Tus cursos disponibles aparecerán aquí antes de tu primera lección.';
        } else if (tab === 'completado') {
            title = 'Aún no has completado cursos';
            desc = 'Cuando cierres una ruta, la verás aquí con su avance final.';
            href = toUrl('/dashboard');
            label = 'Volver a mi aprendizaje';
        } else if (tab === 'en-curso' && groups.notStarted.length) {
            title = 'Tienes cursos listos para comenzar';
            desc = 'Abre la pestaña Por iniciar para arrancar tu siguiente módulo.';
            href = '#';
            label = 'Ver cursos por iniciar';
        }

        return `
            <div class="lh-empty">
                <div class="lh-empty__icon">${Icons.book}</div>
                <h3>${esc(title)}</h3>
                <p>${esc(desc)}</p>
                <a href="${href}" class="btn btn--blue" ${tab === 'en-curso' && groups.notStarted.length ? 'data-learning-tab-shortcut="sin-iniciar"' : ''}>${esc(label)}</a>
            </div>
        `;
    }

    function renderCourseRow(enrollment, index) {
        const progress = pct(enrollment.progreso);
        const title = courseTitle(enrollment);
        const id = courseId(enrollment);
        const href = courseHref(enrollment);
        const next = nextActivity(enrollment);
        const cta = courseCta(enrollment);
        const status = progress >= 100 ? 'Completado' : progress > 0 ? 'En progreso' : 'Pendiente';
        const mark = initials(title);

        return `
            <article class="lh-course-row" style="--delay:${index * 60}ms">
                <div class="lh-course-row__details">
                    <span>${esc(status)}</span>
                    <h3><a href="${href}">${esc(title)}</a></h3>
                    <p>${esc(courseTeacher(enrollment))} · ${progress}% completado</p>
                    <div class="lh-progress" aria-label="Progreso ${progress}%">
                        <span style="width:${progress}%"></span>
                    </div>
                    <small>${esc(lessonProgress(enrollment))}</small>
                </div>
                <div class="lh-course-row__next">
                    <span>Próximo paso</span>
                    <strong>${esc(next.title)}</strong>
                    <small>${esc(next.meta)}</small>
                <div class="lh-course-row__action">
                    <a href="${href}" class="btn btn--blue">${esc(cta)}</a>
                    ${id ? '<button type="button" class="lh-more" data-course-menu="' + esc(id) + '" aria-label="Más opciones"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>' : ''}
                </div></div>
            </article>
        `;
    }

    function renderCourseList(groups) {
        const container = document.getElementById('lh-course-list');
        if (!container) return;

        const items = currentTab === 'sin-iniciar'
            ? groups.notStarted
            : currentTab === 'completado'
                ? groups.completed
                : groups.inProgress;

        container.innerHTML = items.length
            ? items.map(renderCourseRow).join('')
            : renderEmptyState(currentTab, groups);

        container.querySelectorAll('[data-learning-tab-shortcut]').forEach((link) => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                currentTab = link.dataset.learningTabShortcut;
                document.querySelectorAll('[data-learning-tab]').forEach((button) => {
                    const active = button.dataset.learningTab === currentTab;
                    button.classList.toggle('is-active', active);
                    button.setAttribute('aria-selected', String(active));
                });
                renderCourseList(groups);
            });
        });

        container.querySelectorAll('[data-course-menu]').forEach((button) => {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                const course = button.dataset.courseMenu;
                const enrollment = [
                    ...groups.inProgress,
                    ...groups.notStarted,
                    ...groups.completed,
                ].find((item) => String(courseId(item)) === String(course));
                const coursePageHref = enrollment
                    ? toUrl(window.EducatIA.Utils.courseUrl({
                        id: courseId(enrollment),
                        titulo: courseTitle(enrollment),
                    }))
                    : toUrl('/explorar');
                const existing = document.querySelector('.lh-menu');
                if (existing) existing.remove();

                const menu = document.createElement('div');
                menu.className = 'lh-menu';
                menu.innerHTML = `
                    <a href="${coursePageHref}" class="lh-menu__item">Ver curso</a>
                    <a href="${toUrl('/calificaciones')}" class="lh-menu__item">Ver calificaciones</a>
                    <button type="button" class="lh-menu__item lh-menu__item--danger" data-unenroll="${esc(course)}">Desinscribirse</button>
                `;
                button.parentElement.appendChild(menu);

                const unenroll = menu.querySelector('[data-unenroll]');
                if (unenroll) {
                    unenroll.addEventListener('click', async function () {
                        const confirmed = await C().confirmAction({
                            title: 'Salir de este curso',
                            message: 'El curso dejará de aparecer en tu ruta activa. Tu historial de avance se conservará.',
                            confirmLabel: 'Salir del curso',
                            tone: 'danger'
                        });
                        if (!confirmed) return;
                        try {
                            await API().unenroll(course);
                            await renderLearnerHome();
                        } catch (err) {
                            C().showWebNotice('No fue posible salir del curso', err.message || 'Vuelve a intentarlo en unos minutos.', 'error');
                        }
                    });
                }

                const closeMenu = function (ev) {
                    if (!menu.contains(ev.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeMenu), 0);
            });
        });
    }

    function renderOfferCard(course, index) {
        const offer = normalizeOffer(course, index);
        const href = offer.id ? toUrl(window.EducatIA.Utils.courseUrl({ id: offer.id, titulo: offer.title })) : toUrl('/explorar');
        return `
            <a href="${href}" class="lh-offer-card" style="--delay:${index * 70}ms">
                <div class="lh-offer-card__media">
                    <img src="${esc(offer.img)}" alt="${esc(offer.title)}" loading="lazy" onerror="this.remove();">
                    <span>${esc(offer.area)}</span>
                </div>
                <div class="lh-offer-card__body">
                    <small>${esc(offer.level)}</small>
                    <h3>${esc(offer.title)}</h3>
                    <p>${esc(offer.desc)}</p>
                    <strong>Lecturas guiadas - práctica - evaluación</strong>
                </div>
            </a>
        `;
    }

    function renderDiscoveryRail(courses) {
        const items = (courses || []).slice(0, 4);
        if (!items.length) return '';

        return `
            <section class="lh-discovery" aria-labelledby="lh-discovery-title">
                <div class="lh-discovery__head">
                    <div>
                        <span class="lh-kicker">Sigue descubriendo</span>
                        <h2 id="lh-discovery-title">Amplía tu preparación</h2>
                        <p>Rutas que complementan lo que ya estudias y te ayudan a llegar mejor preparado al EXANI-II.</p>
                    </div>
                    <a href="${toUrl('/explorar')}" class="lh-link">Ver todo el catálogo</a>
                </div>
                <div class="lh-discovery__rail">
                    ${items.map((course, index) => {
                        const offer = normalizeOffer(course, index);
                        const href = offer.id ? toUrl(window.EducatIA.Utils.courseUrl({ id: offer.id, titulo: offer.title })) : toUrl('/explorar');
                        return `
                            <a href="${href}" class="lh-discovery-card" style="--delay:${index * 70}ms">
                                <span class="lh-discovery-card__media">
                                    <img src="${esc(offer.img)}" alt="${esc(offer.title)}" loading="lazy" decoding="async" onerror="this.remove();">
                                </span>
                                <span class="lh-discovery-card__body">
                                    <span class="lh-discovery-card__meta">${esc(offer.area)}</span>
                                    <strong>${esc(offer.title)}</strong>
                                    <small>${esc(offer.level)} <span aria-hidden="true">→</span></small>
                                </span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </section>
        `;
    }

    function setupInteractions(groups, planSessions, focusCourse) {
        const setLearningTab = (tabName, shouldScroll = false) => {
            currentTab = tabName;
            document.querySelectorAll('[data-learning-tab]').forEach((tab) => {
                const active = tab.dataset.learningTab === currentTab;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', String(active));
            });
            document.querySelectorAll('[data-dashboard-tab]').forEach((tab) => {
                tab.classList.toggle('is-active', tab.dataset.dashboardTab === currentTab);
            });
            document.querySelector('[data-dashboard-home]')?.classList.remove('is-active');
            renderCourseList(groups);
            if (shouldScroll) {
                document.getElementById('learning-courses')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        };

        document.querySelectorAll('[data-learning-tab]').forEach((button) => {
            button.addEventListener('click', function () {
                setLearningTab(button.dataset.learningTab);
            });
        });

        document.querySelectorAll('[data-dashboard-tab]').forEach((button) => {
            button.addEventListener('click', function () {
                setLearningTab(button.dataset.dashboardTab, true);
            });
        });

        document.querySelector('[data-dashboard-home]')?.addEventListener('click', function () {
            document.querySelectorAll('[data-dashboard-tab]').forEach((tab) => tab.classList.remove('is-active'));
            document.querySelector('[data-dashboard-home]')?.classList.add('is-active');
        });

        const prev = document.getElementById('lh-cal-prev');
        const next = document.getElementById('lh-cal-next');
        if (prev) prev.addEventListener('click', function () {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            updateCalendar(planSessions);
        });
        if (next) next.addEventListener('click', function () {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            updateCalendar(planSessions);
        });

        const planForm = document.getElementById('lh-plan-form');
        const resetPlanForm = () => {
            const idInput = document.getElementById('lh-plan-session-id');
            const titleInput = document.getElementById('lh-plan-title');
            const dateInput = document.getElementById('lh-plan-date');
            const durationInput = document.getElementById('lh-plan-duration');
            const notesInput = document.getElementById('lh-plan-notes');
            const submitButton = document.getElementById('lh-plan-submit');
            const cancelButton = document.getElementById('lh-plan-cancel');
            if (idInput) idInput.value = '';
            if (titleInput) titleInput.value = focusCourse ? 'Estudiar ' + courseTitle(focusCourse) : 'Sesión de estudio EducatIA';
            if (dateInput) dateInput.value = nextDateTimeLocal();
            if (durationInput) durationInput.value = '25';
            if (notesInput) notesInput.value = '';
            if (submitButton) submitButton.textContent = 'Programar';
            if (cancelButton) cancelButton.hidden = true;
        };

        if (planForm) {
            planForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const message = document.getElementById('lh-plan-message');
                const id = document.getElementById('lh-plan-session-id')?.value || '';
                const title = document.getElementById('lh-plan-title')?.value?.trim();
                const scheduled = document.getElementById('lh-plan-date')?.value;
                const duration = Number(document.getElementById('lh-plan-duration')?.value || 25);
                const notes = document.getElementById('lh-plan-notes')?.value?.trim() || null;
                if (!title || !scheduled) {
                    if (message) message.textContent = 'Completa titulo y fecha.';
                    return;
                }
                try {
                    const payload = {
                        titulo: title,
                        curso_id: focusCourse ? Number(courseId(focusCourse)) || null : null,
                        scheduled_for: new Date(scheduled).toISOString(),
                        duracion_minutos: duration,
                        notas: notes,
                    };
                    if (id) {
                        await API().updateStudyPlanSession(id, payload);
                    } else {
                        await API().createStudyPlanSession(payload);
                    }
                    C().showWebNotice?.('Plan semanal', id ? 'Sesión actualizada.' : 'Sesión programada y agregada a tu calendario.', 'success');
                    await renderLearnerHome();
                } catch (error) {
                    if (message) message.textContent = error.message || 'No se pudo programar la sesión.';
                }
            });
        }

        document.getElementById('lh-plan-cancel')?.addEventListener('click', resetPlanForm);

        document.querySelectorAll('[data-plan-edit]').forEach((button) => {
            button.addEventListener('click', function () {
                const session = planSessions.find((item) => String(item.id) === String(button.dataset.planEdit));
                if (!session) return;
                const idInput = document.getElementById('lh-plan-session-id');
                const titleInput = document.getElementById('lh-plan-title');
                const dateInput = document.getElementById('lh-plan-date');
                const durationInput = document.getElementById('lh-plan-duration');
                const notesInput = document.getElementById('lh-plan-notes');
                const submitButton = document.getElementById('lh-plan-submit');
                const cancelButton = document.getElementById('lh-plan-cancel');
                if (idInput) idInput.value = session.id;
                if (titleInput) titleInput.value = session.titulo || '';
                if (dateInput) dateInput.value = toDateTimeLocalValue(session.scheduled_for);
                if (durationInput) durationInput.value = String(session.duracion_minutos || 25);
                if (notesInput) notesInput.value = session.notas || '';
                if (submitButton) submitButton.textContent = 'Guardar cambios';
                if (cancelButton) cancelButton.hidden = false;
                document.getElementById('study-plan')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
                window.setTimeout(() => titleInput?.focus(), 220);
            });
        });

        document.querySelectorAll('[data-plan-complete]').forEach((button) => {
            button.addEventListener('click', async function () {
                try {
                    await API().updateStudyPlanSession(button.dataset.planComplete, {
                        completado: button.dataset.planCompleteValue !== 'false'
                    });
                    await renderLearnerHome();
                } catch (error) {
                    C().showWebNotice?.('Plan semanal', error.message || 'No se pudo actualizar la sesión.', 'error');
                }
            });
        });

        document.querySelectorAll('[data-plan-delete]').forEach((button) => {
            button.addEventListener('click', async function () {
                const session = planSessions.find((item) => String(item.id) === String(button.dataset.planDelete));
                const ok = await C().confirmAction({
                    title: 'Eliminar sesión del plan',
                    message: `Se eliminará “${session?.titulo || 'esta sesión'}” de tu planificación semanal.`,
                    confirmLabel: 'Eliminar sesión',
                    tone: 'danger'
                });
                if (!ok) return;
                try {
                    await API().deleteStudyPlanSession(button.dataset.planDelete);
                    C().showWebNotice?.('Plan semanal', 'Sesión eliminada.', 'success');
                    await renderLearnerHome();
                } catch (error) {
                    C().showWebNotice?.('Plan semanal', error.message || 'No se pudo eliminar la sesión.', 'error');
                }
            });
        });

        document.querySelectorAll('[data-view-pricing]').forEach((button) => {
            button.addEventListener('click', function () {
                const user = API().getUser?.();
                window.EducatIA.Router.navigate(user ? '/precios' : '/registro-alumno');
            });
        });

        document.querySelectorAll('[data-premium-checkout]').forEach((button) => {
            button.addEventListener('click', async function () {
                window.EducatIA.Router.navigate('/precios');
            });
        });

        document.querySelectorAll('[data-daily-exani]').forEach((button) => {
            button.addEventListener('click', async function () {
                if (button.disabled) return;
                button.disabled = true;
                const original = button.textContent;
                button.textContent = 'Preparando...';
                try {
                    const session = await API().startDailyExaniPractice();
                    window.EducatIA.Router.navigate(window.EducatIA.Utils.exaniQuestionUrl(session.id, session.current_order || 1, { daily: true }));
                } catch (error) {
                    button.disabled = false;
                    button.textContent = original;
                    C().showWebNotice?.('Racha diaria', error.message || 'No se pudo iniciar la práctica diaria.', 'error');
                }
            });
        });

        setupAnimations();
        renderCourseList(groups);
    }

    function setupAnimations() {
        const items = document.querySelectorAll('.lh-course-row, .lh-offer-card, .lh-lab-card, .lh-lab-empty, .lh-stat, .lh-panel, .lh-continue, .lh-subscription, .lh-exam-practice, .lh-core-courses');
        if (!items.length || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('lh-anim-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        items.forEach(function (item) {
            item.classList.add('lh-anim-wait');
            observer.observe(item);
        });
    }

    async function renderLearnerHome(options = {}) {
        if (!requireLearnerAccess()) return;

        const app = document.getElementById('app');
        const user = API().getUser ? API().getUser() : null;
        const name = C().userState.name || user?.nombre || 'Estudiante';

        app.innerHTML = C().renderLoadingBlock({
            label: 'Preparando tu panel',
            containerClass: 'learning-home learning-home--loading'
        });

        let enrollments = [];
        let catalog = [];
        let planSessions = [];
        let labSessions = [];
        let dailyPractice = null;
        let continuousAssessment = null;
        let certificates = [];
        let taskBoard = null;
        const results = await Promise.allSettled([
            API().getMyEnrollments(),
            API().getCourses({ activo: true }),
            API().getStudyPlanSessions ? API().getStudyPlanSessions() : Promise.resolve([]),
            API().getLabSimulationSessions ? API().getLabSimulationSessions() : Promise.resolve([]),
            API().getDailyExaniPractice ? API().getDailyExaniPractice() : Promise.resolve(null),
            API().getContinuousAssessment ? API().getContinuousAssessment() : Promise.resolve(null),
            API().getMyCertificates(),
            API().getSchoolBoard({ limit: 3 })
        ]);

        if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
            enrollments = results[0].value;
        }
        if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
            catalog = results[1].value;
        }
        if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
            planSessions = results[2].value;
        }
        if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
            labSessions = results[3].value;
        }
        if (results[4]?.status === 'fulfilled' && results[4].value) {
            dailyPractice = results[4].value;
        }
        if (results[5]?.status === 'fulfilled' && results[5].value) {
            continuousAssessment = results[5].value;
        }

        certificates = results[6]?.status === 'fulfilled' ? results[6].value : [];
        taskBoard = results[7]?.status === 'fulfilled' ? results[7].value : null;
        const groups = splitEnrollments(enrollments);
        if (currentTab === 'en-curso' && !groups.inProgress.length && groups.notStarted.length) {
            currentTab = 'sin-iniciar';
        }
        if (currentTab === 'sin-iniciar' && !groups.notStarted.length && groups.inProgress.length) {
            currentTab = 'en-curso';
        }

        const focusCourse = chooseFocus(groups);
        const recommendations = buildRecommendationSource(catalog, enrollments);
        const totalLessons = enrollments.reduce((sum, e) => sum + Number(e.total_lecciones || 0), 0);
        const completedLessons = enrollments.reduce((sum, e) => sum + Number(e.lecciones_completadas || 0), 0);
        const average = averageProgress(enrollments);
        const premium = hasPremiumAccess(user);
        const todayIdx = (new Date().getDay() + 6) % 7;

        app.innerHTML = `
            <div class="learning-home learning-home--school">
                <div class="lh-shell">
                    <header class="lh-top">
                        <div class="lh-top__identity">
                            ${renderAvatar(name, user)}
                            <div>
                                <span class="lh-kicker">Mi aprendizaje</span>
                                <h1>${esc(greeting())},<span class="lh-student-name">${esc(name)}</span></h1>
                                <p>Tus cursos, entregas y próximos pasos en un solo lugar.</p>
                            </div>
                        </div>
                        <div class="lh-top__actions">
                            <a href="${toUrl('/explorar')}" class="btn btn--outline">Explorar</a>
                            <a href="${focusCourse ? courseHref(focusCourse) : toUrl('/explorar')}" class="btn btn--blue">${focusCourse ? 'Continuar' : 'Empezar'}</a>
                        </div>
                    </header>

                    ${renderDashboardNavigation(groups)}

                    <div class="lh-layout">
                        <main class="lh-main">
                            <section class="lh-panel lh-panel--courses" id="learning-courses">
                                <div class="lh-panel__head">
                                    <div>
                                        <h2>Tu aprendizaje</h2>
                                    </div>
                                    <a href="${toUrl('/calificaciones')}" class="lh-link">Ver calificaciones</a>
                                </div>
                                ${renderTabs(groups)}
                                <div id="lh-course-list" class="lh-course-list"></div>
                            </section>
                            ${renderLabSessionHistory(labSessions, premium)}
                        </main>

                        <aside class="lh-side" aria-label="Plan personalizado">
                            <section class="lh-panel lh-school-summary"><div class="lh-panel__head"><h2>Tareas y proyectos</h2></div><div class="lh-school-summary__body">${taskBoard ? (taskBoard.items.length ? taskBoard.items.map((item) => `<a class="lh-task-link" href="${toUrl('/tareas/curso/' + item.tarea.curso_id + '?tarea=' + item.tarea.id)}"><strong>${esc(item.tarea.titulo)}</strong><span>${esc(item.curso_titulo)} · ${esc(item.entrega ? ({entregada:'En revisión', revisada:'Calificada', cambios_solicitados:'Corregir entrega'}[item.entrega.estado]) : 'Por entregar')}</span></a>`).join('') : '<p>Las tareas publicadas de ML, DL y Transformers aparecerán aquí.</p>') : '<p>No pudimos cargar tus tareas. Abre la bandeja para volver a intentarlo.</p>'}<a class="lh-link" href="${toUrl('/tareas')}">Ver todas las tareas</a></div></section>
                            <section class="lh-panel">
                                <div class="lh-panel__head">
                                    <div>
                                        <span class="lh-kicker">Plan semanal</span>
                                        <h2>Ritmo de estudio</h2>
                                    </div>
                                </div>
                                <div class="lh-cal">
                                    <div class="lh-cal__top">
                                        <button type="button" id="lh-cal-prev" aria-label="Mes anterior">${Icons.chevronLeft}</button>
                                        <strong id="lh-cal-month">${esc(monthName(calendarDate))}</strong>
                                        <button type="button" id="lh-cal-next" aria-label="Mes siguiente">${Icons.chevronRight}</button>
                                    </div>
                                    <div class="lh-cal__labels">${daysOfWeek().map((day) => '<span>' + day + '</span>').join('')}</div>
                                    <div class="lh-cal__grid" id="lh-cal-grid">${buildCalendar(calendarDate, planSessions)}</div>
                                </div>
                                ${renderStudyPlan(planSessions, focusCourse)}
                            </section>

                            <section class="lh-panel lh-school-summary"><div class="lh-panel__head"><h2>Certificados recientes</h2></div><div class="lh-school-summary__body">${certificates.length ? certificates.slice(0, 3).map((cert) => `<a class="lh-task-link" href="${toUrl('/certificados')}"><strong>${esc(cert.curso_titulo)}</strong><span>Emitido el ${esc(new Date(cert.fecha_emision).toLocaleDateString('es-MX'))}</span></a>`).join('') : '<p>Al completar todas las actividades y aprobar las tareas requeridas podrás emitir tu certificado.</p>'}<a class="lh-link" href="${toUrl('/certificados')}">Mis certificados</a></div></section>
                        </aside>
                    </div>

                    ${renderContinuousAssessment(continuousAssessment)}
                    ${renderRealExamPractice(dailyPractice, premium)}
                    ${renderDiscoveryRail(recommendations)}

                    ${renderRequiredCoreCourses(catalog, enrollments)}

                    ${renderCertificateCallout(groups.completed.length)}
                </div>
            </div>
        `;

        setupInteractions(groups, planSessions, focusCourse);

        const focusTarget = options.focus || window.EducatIA.Router?.getQueryParams?.().get('focus');
        if (focusTarget === 'plan') {
            window.setTimeout(() => {
                document.getElementById('study-plan')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }, 120);
        } else if (focusTarget === 'daily-exani') {
            window.setTimeout(() => {
                document.getElementById('exani-daily-practice')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }, 120);
        }
    }

    async function renderPersonalHome() {
        await renderLearnerHome();

        const root = document.querySelector('.learning-home');
        if (!root) return;

        root.classList.add('learning-home--personal');

        const kicker = root.querySelector('.lh-top .lh-kicker');
        if (kicker) kicker.remove();

        const primaryAction = root.querySelector('.lh-top__actions .btn--blue');
        if (primaryAction && primaryAction.textContent.trim() === 'Empezar') {
            primaryAction.textContent = 'Elegir programa';
        }
    }

    return {
        render: renderLearnerHome,
        renderPersonalHome
    };
})();
