/* ================================================================
   educatIA — Course View
   Published courses and legacy catalog fallback
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

const MODULE_EDITORIAL_PROFILES = {
    administracion: {
        purpose: 'Comprende cómo se coordinan personas, recursos y decisiones para que una organización alcance objetivos medibles.',
        exam: 'Analizar funciones administrativas, estructuras organizacionales, liderazgo, control y situaciones de emprendimiento.',
        result: 'Podrás distinguir cada etapa del proceso administrativo y justificar la decisión adecuada en casos organizacionales.'
    },
    aritmetica: {
        purpose: 'Fortalece el razonamiento numérico que sostiene porcentajes, proporciones, operaciones y problemas cotidianos.',
        exam: 'Traducir enunciados a operaciones, reconocer relaciones numéricas y comprobar si un resultado tiene sentido.',
        result: 'Resolverás problemas aritméticos con un procedimiento verificable, sin depender de cálculos hechos por intuición.'
    },
    biologia: {
        purpose: 'Relaciona estructura, función y cambio en los seres vivos desde la célula hasta los ecosistemas.',
        exam: 'Interpretar procesos celulares, herencia, evolución, diversidad biológica y relaciones ecológicas.',
        result: 'Explicarás fenómenos biológicos mediante relaciones causales y reconocerás la evidencia relevante en cada reactivo.'
    },
    calculo: {
        purpose: 'Construye una base sólida de funciones, cambio y acumulación para resolver problemas de cálculo con significado.',
        exam: 'Leer representaciones algebraicas y gráficas, trabajar con límites, derivadas, integrales y sus aplicaciones.',
        result: 'Elegirás el procedimiento de cálculo correcto y podrás interpretar el resultado dentro del problema planteado.'
    },
    salud: {
        purpose: 'Integra prevención, proceso salud-enfermedad y factores biológicos, psicológicos, sociales y ambientales.',
        exam: 'Reconocer determinantes de salud, niveles de prevención, promoción, riesgos y decisiones de atención.',
        result: 'Analizarás casos de salud con una mirada integral y distinguirás acciones preventivas, diagnósticas y de intervención.'
    },
    'ciencias-experimentales': {
        purpose: 'Aprende a formular preguntas, identificar variables y evaluar evidencia mediante el razonamiento experimental.',
        exam: 'Distinguir hipótesis, controles, variables, mediciones, resultados y conclusiones válidas.',
        result: 'Podrás reconstruir la lógica de un experimento y detectar conclusiones que no están respaldadas por los datos.'
    },
    derecho: {
        purpose: 'Comprende las normas, instituciones y principios que organizan la convivencia y protegen derechos.',
        exam: 'Aplicar fuentes del derecho, ramas jurídicas, garantías y conceptos normativos a situaciones concretas.',
        result: 'Clasificarás problemas jurídicos y justificarás qué norma, principio o autoridad resulta pertinente.'
    },
    economia: {
        purpose: 'Interpreta decisiones de consumo, producción y política económica a partir de conceptos y datos.',
        exam: 'Analizar oferta, demanda, mercados, indicadores macroeconómicos y efectos de decisiones públicas.',
        result: 'Relacionarás cambios económicos con sus causas y consecuencias, y leerás indicadores sin confundirlos.'
    },
    filosofia: {
        purpose: 'Desarrolla lectura conceptual y argumentación para distinguir problemas, posturas y razones filosóficas.',
        exam: 'Reconocer corrientes, conceptos éticos, problemas del conocimiento y estructura de argumentos.',
        result: 'Compararás posturas filosóficas y evaluarás la coherencia de una conclusión a partir de sus premisas.'
    },
    fisica: {
        purpose: 'Modela fenómenos de movimiento, energía, ondas, electricidad y óptica con conceptos y relaciones cuantitativas.',
        exam: 'Elegir leyes físicas, interpretar diagramas, operar con unidades y predecir el comportamiento de un sistema.',
        result: 'Traducirás una situación física a un modelo y verificarás que el resultado sea consistente con sus unidades.'
    },
    historia: {
        purpose: 'Organiza procesos históricos de México y del mundo mediante temporalidad, causalidad y cambio social.',
        exam: 'Relacionar periodos, actores, ideas, instituciones y consecuencias sin reducir el análisis a fechas aisladas.',
        result: 'Ubicarás procesos en su contexto y distinguirás causas, detonantes y consecuencias de larga duración.'
    },
    literatura: {
        purpose: 'Lee obras y fragmentos con herramientas para reconocer género, recursos, voz, contexto e intención estética.',
        exam: 'Identificar corrientes literarias, géneros, figuras, estructuras narrativas y relaciones entre forma y sentido.',
        result: 'Sustentarás una interpretación con elementos visibles del texto y descartarás opciones basadas solo en impresiones.'
    },
    'matematicas-financieras': {
        purpose: 'Comprende el valor del dinero en el tiempo para analizar intereses, descuentos, créditos y amortizaciones.',
        exam: 'Identificar variables financieras, elegir fórmulas y comparar alternativas de pago o inversión.',
        result: 'Resolverás situaciones financieras con unidades y periodos consistentes, e interpretarás el costo real de cada opción.'
    },
    premedicina: {
        purpose: 'Integra bases de anatomía, fisiología, bioquímica y salud para razonar sobre el funcionamiento humano.',
        exam: 'Relacionar estructuras, procesos, regulación y alteraciones en casos biomédicos de distinta complejidad.',
        result: 'Explicarás cómo se conectan los sistemas corporales y reconocerás la evidencia decisiva en un caso clínico básico.'
    },
    'probabilidad-estadistica': {
        purpose: 'Aprende a organizar datos, describir distribuciones y cuantificar la incertidumbre con procedimientos claros.',
        exam: 'Interpretar tablas y gráficas, calcular medidas estadísticas, aplicar conteo y resolver eventos probabilísticos.',
        result: 'Seleccionarás la herramienta estadística o probabilística adecuada y explicarás qué significa el resultado.'
    },
    psicologia: {
        purpose: 'Comprende la conducta y los procesos mentales desde sus bases biológicas, cognitivas, sociales y del desarrollo.',
        exam: 'Analizar casos, reconocer procesos psicológicos, comparar teorías y relacionar conceptos con evidencia observable.',
        result: 'Distinguirás explicaciones psicológicas y elegirás la que mejor corresponda a los datos de cada situación.'
    },
    quimica: {
        purpose: 'Relaciona estructura de la materia, transformaciones y cantidades para explicar fenómenos químicos.',
        exam: 'Interpretar modelos, ecuaciones, unidades, enlaces, soluciones, reacciones y relaciones estequiométricas.',
        result: 'Resolverás problemas químicos con un modelo explícito y comprobarás la coherencia de cantidades y unidades.'
    },
    'ciencias-sociales': {
        purpose: 'Analiza la construcción del conocimiento social, las instituciones, los derechos y los cambios colectivos.',
        exam: 'Interpretar fenómenos sociales, relaciones de poder, participación, diversidad y marcos de derechos.',
        result: 'Diferenciarás conceptos sociales cercanos y aplicarás cada uno al contexto concreto del reactivo.'
    }
};

window.EducatIA.Pages.Curso = {
    renderAssignmentProgress: function (context) {
        const total = Number(context.requiredAssignmentCount || 0);
        const passed = Number(context.passedAssignmentCount || 0);
        if (!Number.isSafeInteger(total) || total <= 0 || !Number.isSafeInteger(passed) || passed < 0 || passed > total) return '';
        const pending = total - passed;
        return `<span>${passed}/${total} tareas aprobadas${pending ? `; ${pending} pendientes de aprobación docente para obtener el certificado` : '; requisito de tareas completado'}</span>`;
    },
    antiCheatState: {
        cleanup: null,
        quizId: null,
        violations: 0,
    },

    getCatalogCourse: function (courseId) {
        const courses = window.EducatIA.Pages.Explorar?.modules || window.EducatIA.ExaniModules || [];
        return courses.find((course) => String(course.id) === String(courseId));
    },

    renderCatalog: async function (params) {
        const Components = window.EducatIA.Components;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const app = document.getElementById('app');
        const module = this.getCatalogCourse(params?.id);
        const isLoggedIn = Components.userState.loggedIn;
        if (!module) {
            app.innerHTML = `
                <main class="module-editorial module-editorial--empty">
                    <div class="module-editorial__empty">
                        <span>Catálogo EXANI-II</span>
                        <h1>No encontramos este programa</h1>
                        <p>Regresa al catálogo para elegir una materia disponible.</p>
                        <a href="${window.EducatIA.Router.toUrl('/explorar')}" class="btn btn--blue">Explorar programas</a>
                    </div>
                </main>
            `;
            return;
        }

        const normalize = (value) => String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
        const moduleKey = normalize(module.title);
        let publishedCourse = window.EducatIA.Pages.Explorar?.findPublishedCourse?.(module.id) || null;
        if (!publishedCourse) {
            try {
                const response = await window.EducatIA.API.getCourses({ activo: true });
                const courses = Array.isArray(response) ? response : (response?.items || []);
                publishedCourse = courses.find((course) => {
                    const titleKey = normalize(course.titulo || course.title || course.nombre);
                    return titleKey === moduleKey || titleKey.includes(moduleKey) || moduleKey.includes(titleKey);
                }) || null;
            } catch {
                publishedCourse = null;
            }
        }

        const editorial = window.EducatIA.Pages.Explorar?.editorial?.[module.id] || {};
        const accent = editorial.color || '#0B4A7B';
        const image = editorial.image || 'assets/explorar/banner-exani-hero.webp';
        const topics = module.subareas.flatMap((subarea) => subarea.topics);
        const profile = MODULE_EDITORIAL_PROFILES[module.id] || {
            purpose: module.summary,
            exam: `Comprender y aplicar los conceptos principales de ${module.title} en situaciones tipo EXANI-II.`,
            result: `Resolverás reactivos de ${module.title} con un procedimiento claro y una revisión final.`
        };
        const describeTopics = (subarea, limit = 4) => {
            const selected = subarea.topics.slice(0, limit);
            if (!selected.length) return `los conceptos centrales de ${subarea.title}`;
            if (selected.length === 1) return selected[0];
            return `${selected.slice(0, -1).join(', ')} y ${selected.at(-1)}`;
        };
        const courseHref = publishedCourse
            ? window.EducatIA.Router.toUrl(window.EducatIA.Utils.courseUrl(publishedCourse))
            : window.EducatIA.Router.toUrl(isLoggedIn ? '/dashboard' : '/registro-alumno?plan=premium');
        const actionLabel = publishedCourse ? 'Comenzar preparación' : (isLoggedIn ? 'Ir a mi aprendizaje' : 'Crear cuenta para comenzar');

        document.title = `${module.title} | educatIA`;
        app.innerHTML = `
            <main class="module-editorial" data-module-page="${escapeHtml(module.id)}" style="--module-accent:${escapeHtml(accent)}">
                <section class="module-editorial__hero">
                    <div class="module-editorial__hero-shell">
                        <div class="module-editorial__hero-copy">
                            <a href="${window.EducatIA.Router.toUrl('/explorar')}" class="module-editorial__back">← Todas las materias</a>
                            <span class="module-editorial__eyebrow">${escapeHtml(module.group)} · Preparación EXANI-II</span>
                            <h1>${escapeHtml(module.title)}</h1>
                            <p>${escapeHtml(module.summary)}</p>
                            <div class="module-editorial__actions">
                                <a href="${courseHref}" class="module-editorial__primary">${escapeHtml(actionLabel)} <span aria-hidden="true">→</span></a>
                                <a href="#module-editorial-syllabus" class="module-editorial__secondary">Revisar temario</a>
                            </div>
                        </div>
                        <div class="module-editorial__hero-media">
                            <img src="${escapeHtml(image)}" alt="Programa de ${escapeHtml(module.title)} en educatIA" fetchpriority="high" decoding="async">
                        </div>
                    </div>
                </section>

                <div class="module-editorial__body">
                    <nav class="module-editorial__quick-nav" aria-label="Contenido de la página">
                        <a href="#module-editorial-about">Descripción</a>
                        <a href="#module-editorial-objectives">Objetivos</a>
                        <a href="#module-editorial-method">Cómo estudiarás</a>
                        <a href="#module-editorial-syllabus">Temario</a>
                        <a href="#module-editorial-references">Referencias</a>
                    </nav>

                    <section class="module-editorial__intro" aria-labelledby="module-editorial-about">
                        <div>
                            <span class="module-editorial__section-label">De qué trata</span>
                            <h2 id="module-editorial-about">Una ruta para comprender y practicar ${escapeHtml(module.title)}</h2>
                        </div>
                        <div class="module-editorial__intro-copy">
                            <p>${escapeHtml(profile.purpose)}</p>
                            <p>${escapeHtml(module.summary)} La ruta conecta explicación, ejemplos guiados, formularios por clase y evaluaciones de bloque para que cada avance pueda comprobarse.</p>
                        </div>
                    </section>

                    <section class="module-editorial__facts" aria-label="Datos del programa">
                        <article><strong>${module.subareas.length}</strong><span>subáreas organizadas</span></article>
                        <article><strong>${topics.length}</strong><span>temas de preparación</span></article>
                        <article><strong>Clase a clase</strong><span>explicación y formulario</span></article>
                        <article><strong>Por bloques</strong><span>evaluación y refuerzo</span></article>
                    </section>

                    <section class="module-editorial__objectives" aria-labelledby="module-editorial-objectives">
                        <div class="module-editorial__section-head">
                            <span class="module-editorial__section-label">Objetivos</span>
                            <h2 id="module-editorial-objectives">Lo que desarrollarás</h2>
                            <p>${escapeHtml(profile.result)}</p>
                        </div>
                        <div class="module-editorial__objective-grid">
                            ${module.subareas.map((subarea, index) => `
                                <article>
                                    <span>${String(index + 1).padStart(2, '0')}</span>
                                    <h3>${escapeHtml(subarea.title)}</h3>
                                    <p>Trabajarás ${escapeHtml(describeTopics(subarea))} mediante explicación, análisis y ejercicios de aplicación.</p>
                                </article>
                            `).join('')}
                            <article>
                                <span>${String(module.subareas.length + 1).padStart(2, '0')}</span>
                                <h3>Decisión y comprobación</h3>
                                <p>${escapeHtml(profile.exam)} Después revisarás el procedimiento y los distractores que requieren atención.</p>
                            </article>
                        </div>
                    </section>

                    <section class="module-editorial__method" id="module-editorial-method" aria-labelledby="module-editorial-method-title">
                        <div class="module-editorial__section-head">
                            <span class="module-editorial__section-label">Método de estudio</span>
                            <h2 id="module-editorial-method-title">Una secuencia que convierte contenido en dominio</h2>
                            <p>No se trata de recorrer textos rápidamente. Cada bloque te pide comprender, aplicar, comprobar y volver sobre el punto exacto que todavía falla.</p>
                        </div>
                        <ol class="module-editorial__route">
                            <li><span>01</span><div><h3>Comprende</h3><p>Lee la explicación central y relaciona los conceptos antes de memorizar fórmulas o definiciones.</p></div></li>
                            <li><span>02</span><div><h3>Aplica</h3><p>Resuelve ejemplos y casos de ${escapeHtml(module.title)} con un procedimiento que puedas explicar.</p></div></li>
                            <li><span>03</span><div><h3>Comprueba</h3><p>Contesta el formulario de la clase y revisa por qué cada distractor resulta incorrecto.</p></div></li>
                            <li><span>04</span><div><h3>Refuerza</h3><p>Usa la evaluación del bloque y tu avance para decidir qué clase conviene repasar antes de continuar.</p></div></li>
                        </ol>
                    </section>

                    <section class="module-editorial__exam-focus" aria-labelledby="module-editorial-exam-title">
                        <div class="module-editorial__exam-copy">
                            <span class="module-editorial__section-label">Aplicación en el examen</span>
                            <h2 id="module-editorial-exam-title">Qué aprenderás a reconocer en un reactivo</h2>
                            <p>${escapeHtml(profile.exam)}</p>
                        </div>
                        <div class="module-editorial__exam-list">
                            ${module.subareas.map((subarea, index) => `
                                <article>
                                    <span>${String(index + 1).padStart(2, '0')}</span>
                                    <div>
                                        <h3>${escapeHtml(subarea.title)}</h3>
                                        <p>Identifica la relación que existe entre ${escapeHtml(describeTopics(subarea, 3))} y úsala para descartar respuestas incompatibles con la consigna.</p>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </section>

                    <section class="module-editorial__syllabus" id="module-editorial-syllabus" aria-labelledby="module-editorial-syllabus-title">
                        <div class="module-editorial__section-head">
                            <span class="module-editorial__section-label">Temario</span>
                            <h2 id="module-editorial-syllabus-title">Cobertura académica</h2>
                            <p>Consulta la organización completa del programa. Los temas se desarrollan dentro del curso en lecciones y actividades, no como una lista aislada.</p>
                        </div>
                        <div class="module-editorial__syllabus-grid">
                            ${module.subareas.map((subarea, index) => `
                                <article>
                                    <div class="module-editorial__syllabus-title">
                                        <span>${String(index + 1).padStart(2, '0')}</span>
                                        <h3>${escapeHtml(subarea.title)}</h3>
                                    </div>
                                    <ul>
                                        ${subarea.topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}
                                    </ul>
                                </article>
                            `).join('')}
                        </div>
                    </section>

                    <section class="module-editorial__included" aria-labelledby="module-editorial-included-title">
                        <div>
                            <span class="module-editorial__section-label">Qué incluye</span>
                            <h2 id="module-editorial-included-title">Recursos para estudiar con orden</h2>
                        </div>
                        <div class="module-editorial__included-grid">
                            <article><span aria-hidden="true">A</span><h3>Lecciones guiadas</h3><p>Explicaciones progresivas con conceptos, relaciones, ejemplos y estrategias de resolución.</p></article>
                            <article><span aria-hidden="true">B</span><h3>Práctica por clase</h3><p>Formularios para comprobar el aprendizaje inmediatamente después de estudiar cada tema.</p></article>
                            <article><span aria-hidden="true">C</span><h3>Evaluaciones de bloque</h3><p>Reactivos para integrar contenidos y localizar con precisión los temas que requieren refuerzo.</p></article>
                            <article><span aria-hidden="true">D</span><h3>Seguimiento de avance</h3><p>Progreso guardado y una ruta clara para retomar desde el siguiente elemento disponible.</p></article>
                        </div>
                    </section>

                    <section class="module-editorial__reference" id="module-editorial-references">
                        <div>
                            <span class="module-editorial__section-label">Referencias de estudio</span>
                            <h2>Contenido organizado con una referencia académica clara</h2>
                        </div>
                        <div class="module-editorial__reference-list">
                            <p><strong>Guía para el sustentante del EXANI-II.</strong> La ruta toma como referencia la organización temática y las habilidades esperadas para la preparación del examen de admisión.</p>
                            <p><strong>Programas y bibliografía disciplinar.</strong> Las explicaciones se construyen con conceptos académicos propios de ${escapeHtml(module.title)} y se presentan al nivel necesario para esta preparación.</p>
                            <p><strong>Banco de práctica de educatIA.</strong> Los formularios y evaluaciones vinculan cada reactivo con la clase y el bloque que corresponde reforzar.</p>
                            <p><strong>Criterio de uso.</strong> El curso es una herramienta de preparación; las convocatorias, requisitos y características de aplicación deben confirmarse siempre con la institución y con Ceneval.</p>
                        </div>
                    </section>

                    <section class="module-editorial__faq" aria-labelledby="module-editorial-faq-title">
                        <div class="module-editorial__section-head">
                            <span class="module-editorial__section-label">Preguntas frecuentes</span>
                            <h2 id="module-editorial-faq-title">Antes de comenzar</h2>
                        </div>
                        <div class="module-editorial__faq-list">
                            <details open><summary>¿Necesito dominar la materia antes de entrar?</summary><p>No. La ruta está organizada para construir base, practicar y avanzar por bloques. Si ya tienes experiencia, las evaluaciones te ayudarán a ubicar qué conviene repasar.</p></details>
                            <details><summary>¿Cómo sé si realmente aprendí un tema?</summary><p>Completa la clase, responde su formulario sin apoyo externo y revisa la evaluación del bloque. El objetivo es explicar tu procedimiento, no solo reconocer una respuesta.</p></details>
                            <details><summary>¿Este curso sustituye la guía oficial?</summary><p>No. La complementa con explicación, práctica y seguimiento. Conserva la guía y la convocatoria vigentes como referencia formal para tu aplicación.</p></details>
                        </div>
                    </section>

                    <section class="module-editorial__cta">
                        <div>
                            <span>Tu siguiente paso</span>
                            <h2>Empieza ${escapeHtml(module.title)} con una ruta ordenada.</h2>
                        </div>
                        <a href="${courseHref}" class="module-editorial__primary">${escapeHtml(actionLabel)} <span aria-hidden="true">→</span></a>
                    </section>
                </div>
            </main>
        `;
    },

    buildLearningSections: function (modules, lessons, quizzes) {
        const sections = new Map();
        const aleEnabled = window.EducatIA.Features?.ale === true;
        const orderedModules = [...modules].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id);

        orderedModules.forEach((module) => {
            sections.set(String(module.id), {
                id: module.id,
                titulo: module.titulo,
                descripcion: module.descripcion,
                orden: module.orden || 0,
                lecciones: [],
                quizzes: [],
                chating_habilitado: aleEnabled && !!module.chating_habilitado,
                chating_procesos_totales: Number(module.chating_procesos_totales || 0),
            });
        });

        const fallbackTitle = orderedModules.length ? 'Contenido adicional' : 'Ruta principal del curso';
        const ensureFallback = () => {
            if (!sections.has('general')) {
                sections.set('general', {
                    id: null,
                    titulo: fallbackTitle,
                    descripcion: orderedModules.length
                        ? 'Contenido todavía no asignado a un módulo específico.'
                        : 'Contenido principal del curso organizado en una sola ruta.',
                    orden: 9999,
                    lecciones: [],
                    quizzes: [],
                });
            }
            return sections.get('general');
        };

        lessons.forEach((lesson) => {
            const section = lesson.modulo_id != null ? sections.get(String(lesson.modulo_id)) : ensureFallback();
            (section || ensureFallback()).lecciones.push(lesson);
        });

        quizzes.forEach((quiz) => {
            const section = quiz.modulo_id != null ? sections.get(String(quiz.modulo_id)) : ensureFallback();
            (section || ensureFallback()).quizzes.push(quiz);
        });

        return [...sections.values()]
            .filter((section) => section.lecciones.length || section.quizzes.length || section.chating_habilitado || section.id !== null)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0) || String(a.titulo).localeCompare(String(b.titulo)));
    },

    renderLearningItem: function (item, context) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const course = context.course || { id: context.courseId, titulo: context.courseTitle || 'curso' };
        const isLesson = item.tipo === 'leccion';
        const badgeColor = isLesson ? '#0056D2' : '#0F766E';
        const isCompleted = isLesson
            ? context.completedLessonIds?.has(item.id)
            : context.passedQuizIds?.has(item.id);
        const metaLabel = isLesson
            ? 'Lectura'
            : `Evaluación ${item.preguntas.length ? 'activa' : 'sin preguntas'}`;

        let actionHtml = `<span class="btn btn--outline btn--sm" style="pointer-events:none; opacity:0.6;">Vista previa</span>`;
        if (isLesson) {
            actionHtml = `<a href="${window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(course, item))}" class="btn btn--outline btn--sm">Abrir</a>`;
        } else if (context.isStudent && context.enrolled) {
            actionHtml = `<button class="btn btn--outline btn--sm" onclick="window.EducatIA.Router.navigate('${window.EducatIA.Utils.quizUrl(course, item)}')">Responder</button>`;
        } else if (context.isOwner) {
            actionHtml = `<a href="#/maestro/curso/${context.courseId}" class="btn btn--outline btn--sm">Gestionar</a>`;
        } else if (!context.isLoggedIn) {
            actionHtml = `<a href="#/login" class="btn btn--outline btn--sm">Iniciar sesión</a>`;
        }

        return `
            <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; padding:16px; border:1px solid var(--border-light); border-radius:12px; background:var(--white);">
                <div style="display:flex; gap:14px; align-items:flex-start; min-width:0;">
                    <div style="min-width:0;">
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:6px;">
                            <span style="font-size:11px; font-weight:700; color:${badgeColor}; text-transform:uppercase; letter-spacing:0.5px;">${metaLabel}</span>
                            ${context.isStudent && context.enrolled ? `<span style="font-size:11px; font-weight:700; color:${isCompleted ? '#059669' : '#6B7280'}; background:${isCompleted ? '#ECFDF3' : '#F3F4F6'}; padding:4px 8px; border-radius:999px;">${isCompleted ? (isLesson ? 'Completada' : 'Aprobada') : 'Pendiente'}</span>` : ''}
                        </div>
                        <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">${escapeHtml(item.titulo)}</div>
                        <div style="font-size:13px; color:var(--text-secondary); line-height:1.5;">${isLesson
                            ? escapeHtml(item.contenido ? item.contenido.slice(0, 140) + (item.contenido.length > 140 ? '...' : '') : 'Lección lista para revisión del alumno.')
                            : escapeHtml(item.descripcion || 'Responde esta evaluación al finalizar el bloque correspondiente.')}</div>
                    </div>
                </div>
                <div style="flex-shrink:0;">${actionHtml}</div>
            </div>
        `;
    },

    getSuggestedLevel: function (modules, lessons, quizzes) {
        const density = modules.length + lessons.length + quizzes.length;
        return density >= 12 ? 'Intermedio' : 'Principiante';
    },

    getSuggestedSchedule: function (lessons, quizzes) {
        const totalActivities = Math.max(1, lessons.length + quizzes.length);
        const weeks = Math.max(1, Math.ceil(totalActivities / 3));
        return `${weeks} semana${weeks === 1 ? '' : 's'}`;
    },

    getCourseOutcomes: function ({ course, learningSections, lessons, quizzes, materials }) {
        const outcomes = [];

        learningSections.slice(0, 3).forEach((section) => {
            outcomes.push(`Comprenderas ${section.titulo.toLowerCase()} dentro de una ruta modular y secuencial.`);
        });

        if (lessons.length) {
            outcomes.push(`Avanzarás por ${lessons.length} lección${lessons.length === 1 ? '' : 'es'} con seguimiento real de progreso.`);
        }

        if (quizzes.length) {
            outcomes.push(`Resolverás ${quizzes.length} evaluación${quizzes.length === 1 ? '' : 'es'} para validar tus avances.`);
        }

        if (materials.length) {
            outcomes.push(`Tendras ${materials.length} material${materials.length === 1 ? '' : 'es'} complementario${materials.length === 1 ? '' : 's'} para profundizar.`);
        }

        if (!outcomes.length) {
            outcomes.push(`Explorarás ${course.titulo} con una ruta guiada lista para crecer con nuevos módulos.`);
        }

        return outcomes.slice(0, 6);
    },

    getCourseBenefits: function ({ lessons, quizzes, materials }) {
        const benefits = [];

        benefits.push(`Seguirás una ruta guiada con ${lessons.length} lección${lessons.length === 1 ? '' : 'es'} y progreso visible en cada módulo.`);
        benefits.push('Tendras apoyo contextual dentro del curso para repasar conceptos, aclarar dudas y mantener continuidad de estudio.');

        if (quizzes.length) {
            benefits.push(`Validarás tu avance con ${quizzes.length} evaluación${quizzes.length === 1 ? '' : 'es'} distribuidas en la ruta.`);
        }

        if (materials.length) {
            benefits.push(`Accederás a ${materials.length} recurso${materials.length === 1 ? '' : 's'} complementario${materials.length === 1 ? '' : 's'} para reforzar la práctica.`);
        }

        return benefits.slice(0, 6);
    },

    getEditableSectionItems: function (value, fallbackItems) {
        const items = String(value || '')
            .split(/\r?\n/)
            .map((item) => item.replace(/^[\s\-•*\d.)]+/, '').trim())
            .filter(Boolean);

        return items.length ? items : fallbackItems;
    },

    normalizeCourseText: function (value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    },

    getCourseVisual: function (course) {
        if (course?.imagen_url) {
            return window.EducatIA.API.resolveAssetUrl(course.imagen_url);
        }

        const title = this.normalizeCourseText(course?.titulo);
        const base = 'assets/lessons_photo/webp/';
        const pairs = [
            ['matematicas financieras', base + 'matematicas-financieras.webp'],
            ['calculo diferencial', base + 'calculo-diferencial.webp'],
            ['ciencias experimentales', base + 'ciencias-experimentales.webp'],
            ['ciencias de la salud', base + 'ciencias-de-la-salud.webp'],
            ['pensamiento matematico', base + 'aritmetica.webp'],
            ['redaccion indirecta', base + 'literatura.webp'],
            ['comprension lectora', 'assets/images/landing-courses/reading-writing.jpg'],
            ['ciencias sociales', 'assets/images/explore-courses/social-sciences.jpg'],
            ['administracion', base + 'administracion.webp'],
            ['aritmetica', base + 'aritmetica.webp'],
            ['biologia', base + 'biologia.webp'],
            ['calculo', base + 'calculo-diferencial.webp'],
            ['derecho', base + 'derecho.webp'],
            ['economia', base + 'economia.webp'],
            ['filosofia', base + 'filosofia.webp'],
            ['fisica', base + 'fisica.webp'],
            ['historia', base + 'historia.webp'],
            ['literatura', base + 'literatura.webp'],
            ['premedicina', base + 'premedicina.webp'],
            ['probabilidad', base + 'probabilidad.webp'],
            ['psicologia', base + 'psicologia.webp'],
            ['quimica', base + 'quimica.webp'],
            ['exani', 'assets/explorar/banner-exani-hero.webp'],
        ];
        return pairs.find(([needle]) => title.includes(needle))?.[1] || 'assets/explorar/banner-exani-hero.webp';
    },

    getEnrollmentStartLabel: function () {
        const months = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'];
        const today = new Date();
        return `Comienza el ${today.getDate()} de ${months[today.getMonth()]}`;
    },

    getCommitmentDeadline: function (suggestedSchedule) {
        const estimatedWeeks = Number.parseInt(String(suggestedSchedule || ''), 10) || 8;
        const plannedWeeks = Math.min(16, Math.max(4, estimatedWeeks));
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (plannedWeeks * 7));
        return new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(deadline);
    },

    showCourseCommitment: function (context) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const deadline = this.getCommitmentDeadline(context.suggestedSchedule);
        const courseTitle = context.course?.titulo || 'este curso';
        const overlay = document.createElement('section');
        overlay.className = 'course-commitment';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'course-commitment-title');
        overlay.innerHTML = `
            <header class="course-commitment__header">
                <span class="course-commitment__brand" aria-label="educatIA">
                    <span class="course-commitment__brand-clip" aria-hidden="true"><img src="assets/new_logo/new_logo.png" alt=""></span>
                </span>
                <button type="button" class="course-commitment__close" data-course-commitment-close>Cerrar <span aria-hidden="true">×</span></button>
            </header>
            <div class="course-commitment__canvas">
                <div class="course-commitment__decoration" aria-hidden="true"><span></span><i></i></div>
                <article class="course-commitment__card">
                    <span class="course-commitment__eyebrow">Tu plan de aprendizaje</span>
                    <h1 id="course-commitment-title">Mi compromiso</h1>
                    <p><strong>Estudiaré para comprender.</strong> Daré mi máximo esfuerzo para prepararme con seriedad para ingresar a la universidad o preparatoria.</p>
                    <p><strong>Practicaré con honestidad.</strong> No haré trampa, no usaré inteligencia artificial para responder actividades y resolveré los simulacros en condiciones reales.</p>
                    <p>Comienzo mi preparación en <strong>${escapeHtml(courseTitle)}</strong>.</p>
                    <p>Con un ritmo constante, mi meta es completar este curso antes del <strong>${escapeHtml(deadline)}</strong>.</p>
                    <p>Sé que aprender requiere paciencia. Me comprometo a estudiar con determinación, registrar mis avances y volver a intentarlo cuando un tema sea difícil.</p>
                    <div class="course-commitment__support">
                        <p>Cuando encuentre una dificultad, puedo:</p>
                        <ul>
                            <li>Revisar la explicación</li>
                            <li>Dividir la práctica en pasos</li>
                            <li>Consultar los recursos del curso</li>
                            <li>Registrar mis dudas</li>
                            <li>Volver a intentarlo</li>
                            <li>Ajustar mi ritmo de estudio</li>
                        </ul>
                    </div>
                    <label class="course-commitment__check">
                        <input type="checkbox" data-course-commitment-check>
                        <span>Acepto este compromiso de esfuerzo, honestidad y práctica responsable.</span>
                    </label>
                    <div class="course-commitment__note">
                        <span aria-hidden="true">i</span>
                        <p>Podrás ajustar tu ritmo desde Mi aprendizaje. Tu progreso se guardará automáticamente.</p>
                    </div>
                    <button type="button" class="course-commitment__continue" data-course-commitment-continue disabled>Ir al primer elemento</button>
                </article>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.classList.add('course-commitment-open');
        window.requestAnimationFrame(() => overlay.classList.add('is-visible'));

        const checkbox = overlay.querySelector('[data-course-commitment-check]');
        const continueButton = overlay.querySelector('[data-course-commitment-continue]');
        checkbox?.addEventListener('change', () => {
            if (continueButton) continueButton.disabled = !checkbox.checked;
        });

        return new Promise((resolve) => {
            let finished = false;
            const finish = (accepted) => {
                if (finished) return;
                finished = true;
                if (accepted) {
                    try {
                        const key = `educatia:course-commitment:${window.EducatIA.Components?.userState?.id || 'student'}:${context.course?.id || ''}`;
                        window.localStorage.setItem(key, JSON.stringify({ accepted_at: new Date().toISOString(), deadline }));
                    } catch {
                        // Acceptance still works if storage is unavailable.
                    }
                }
                overlay.classList.remove('is-visible');
                window.setTimeout(() => {
                    overlay.remove();
                    document.body.classList.remove('course-commitment-open');
                    resolve(accepted);
                }, 180);
            };

            overlay.querySelector('[data-course-commitment-close]')?.addEventListener('click', () => finish(false));
            continueButton?.addEventListener('click', () => {
                if (!checkbox?.checked) return;
                finish(true);
            });
            overlay.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') finish(false);
            });
            window.setTimeout(() => checkbox?.focus(), 80);
        });
    },

    renderCourseRail: function ({ course, sections, focusItem, completedLessonIds, passedQuizIds, completedChatingModuleIds, unlockedModuleIds, escapeHtml }) {
        const completedChating = completedChatingModuleIds || new Set();
        const unlockedModules = unlockedModuleIds || new Set(sections.map((section) => Number(section.id)));

        return `
            <aside class="lesson-rail">
                <div class="lesson-rail__header">
                    <div class="lesson-rail__eyebrow">Índice del curso</div>
                    <h2>${escapeHtml(course.titulo)}</h2>
                    <p>Recorre los módulos, completa cada lección y aprueba sus evaluaciones para avanzar al siguiente bloque.</p>
                    <label class="lesson-rail__search">
                        <span>Buscar en este curso</span>
                        <input id="lesson-rail-search" type="search" placeholder="Buscar en este curso" autocomplete="off">
                    </label>
                    <div class="lesson-rail__filters" role="group" aria-label="Filtrar elementos del curso">
                        <button type="button" class="active" data-lesson-rail-filter="all">Todos</button>
                        <button type="button" data-lesson-rail-filter="pending">Pendientes</button>
                        <button type="button" data-lesson-rail-filter="completed">Completados</button>
                    </div>
                    <p class="lesson-rail__empty" data-lesson-rail-empty hidden>No se encontraron elementos con ese filtro.</p>
                </div>

                <div class="lesson-rail__modules">
                    ${sections.map((section, sectionIndex) => {
                        const sectionLocked = section.id != null && !unlockedModules.has(Number(section.id));
                        const entries = [
                            ...section.lecciones.map((entry) => ({ ...entry, tipo: 'leccion' })),
                            ...section.quizzes.map((entry) => ({ ...entry, tipo: 'quiz' })),
                        ].sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.tipo === 'leccion' ? -1 : 1));

                        if (section.chating_habilitado && section.id != null) {
                            entries.push({
                                id: `chating-${section.id}`,
                                moduleId: section.id,
                                titulo: 'Chating',
                                descripcion: `Sesión evaluativa con ${section.chating_procesos_totales || 0} proceso${section.chating_procesos_totales === 1 ? '' : 's'} clave.`,
                                tipo: 'chating',
                            });
                        }

                        const sectionIsCurrent = entries.some((entry) => (
                            focusItem
                            && entry.tipo === focusItem.tipo
                            && (entry.tipo === 'chating'
                                ? Number(entry.moduleId) === Number(focusItem.moduleId)
                                : Number(entry.id) === Number(focusItem.id))
                        ));
                        const initiallyCollapsed = focusItem ? !sectionIsCurrent : sectionIndex > 0;

                        const moduleHref = window.EducatIA.Router.toUrl(window.EducatIA.Utils.moduleUrl(course, section));
                        const moduleMarkup = `
                            <section class="lesson-rail__module ${sectionLocked ? 'is-locked' : ''} ${initiallyCollapsed ? 'is-collapsed' : ''}" data-course-module-slug="${window.EducatIA.Utils.slugify(section.titulo)}">
                                <div class="lesson-rail__module-head">
                                    <div class="lesson-rail__module-heading">
                                        <div class="lesson-rail__module-meta">Módulo ${sectionIndex + 1}</div>
                                        <h3><a href="${moduleHref}" class="lesson-rail__module-link">${escapeHtml(section.titulo)}</a></h3>
                                    </div>
                                    <button type="button" class="lesson-rail__module-toggle" data-lesson-module-toggle aria-expanded="${String(!initiallyCollapsed)}">${initiallyCollapsed ? 'Mostrar' : 'Ocultar'}</button>
                                </div>
                                <div class="lesson-rail__module-body">
                                    ${sectionLocked ? '<p class="lesson-rail__module-lock">Completa todas las actividades del módulo anterior para desbloquear este bloque.</p>' : ''}
                                    ${section.descripcion ? `<p>${escapeHtml(section.descripcion)}</p>` : ''}
                                    <div class="lesson-rail__items">
                                        ${entries.map((entry) => {
                                            const isChating = entry.tipo === 'chating';
                                            const isCurrent = isChating
                                                ? focusItem && focusItem.tipo === 'chating' && Number(focusItem.moduleId) === Number(entry.moduleId)
                                                : focusItem && focusItem.tipo === entry.tipo && Number(focusItem.id) === Number(entry.id);
                                            const isCompleted = entry.tipo === 'leccion'
                                                ? completedLessonIds.has(Number(entry.id))
                                                : entry.tipo === 'quiz'
                                                    ? passedQuizIds.has(Number(entry.id))
                                                    : completedChating.has(Number(entry.moduleId));
                                            const isLocked = sectionLocked;
                                            const state = isLocked ? 'locked' : isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
                                            const metaLabel = entry.tipo === 'leccion'
                                                ? 'Lectura'
                                                : entry.tipo === 'quiz'
                                                    ? 'Evaluación'
                                                    : 'Chating';
                                            const statusLabel = isLocked
                                                ? 'Bloqueado'
                                                : isCompleted
                                                    ? (entry.tipo === 'quiz' ? 'Aprobado' : entry.tipo === 'chating' ? 'Validado' : 'Listo')
                                                    : isCurrent
                                                        ? 'Actual'
                                                        : (entry.tipo === 'chating' ? 'Cierre IA' : 'Pendiente');
                                            const itemClasses = `lesson-rail__item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'is-locked' : ''}`;
                                            const itemMarkup = `
                                                <span class="lesson-rail__item-body">
                                                    <small>${metaLabel}</small>
                                                    <strong>${escapeHtml(entry.titulo)}</strong>
                                                </span>
                                                <span class="lesson-rail__item-state">${statusLabel}</span>
                                            `;

                                            if (isLocked) {
                                                return `<span class="${itemClasses}" data-lesson-rail-item data-state="${state}" aria-disabled="true">${itemMarkup}</span>`;
                                            }

                                            if (entry.tipo === 'leccion') {
                                                return `
                                                    <a href="${window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(course, entry))}" class="${itemClasses}" data-lesson-rail-item data-state="${state}">
                                                        ${itemMarkup}
                                                    </a>
                                                `;
                                            }

                                            if (isChating) {
                                                return `
                                                    <button type="button" class="${itemClasses} lesson-rail__item--button" data-open-chating="${entry.moduleId}" data-lesson-rail-item data-state="${state}">
                                                        ${itemMarkup}
                                                    </button>
                                                `;
                                            }

                                            return `
                                                <button type="button" class="${itemClasses} lesson-rail__item--button" data-open-quiz="${entry.id}" data-lesson-rail-item data-state="${state}">
                                                    ${itemMarkup}
                                                </button>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </section>
                        `;
                        return moduleMarkup;
                    }).join('')}
                </div>
            </aside>
        `;
    },

    renderPublicDetailPage: function (context) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;

        const {
            course,
            learningSections,
            lessons,
            quizzes,
            materials,
            isLoggedIn,
            isStudent,
            isOwner,
            nextLesson,
            aboutItems,
            benefitItems,
            suggestedLevel,
            suggestedSchedule,
            hasPremiumAccess,
        } = context;
        const courseVisual = this.getCourseVisual(course);
        const startLabel = this.getEnrollmentStartLabel();

        let primaryAction = `
            <a href="#/explorar" class="course-enroll__primary">
                <span>Explorar cursos</span>
                <small>Ver más opciones</small>
            </a>
        `;
        let secondaryAction = `<a href="#course-detail-modules" class="course-enroll__text-link">Ver módulos</a>`;

        if (!isLoggedIn) {
            primaryAction = `
                <a href="#/login" class="course-enroll__primary">
                    <span>Crear cuenta</span>
                    <small>${startLabel}</small>
                </a>
            `;
            secondaryAction = `<a href="#/explorar" class="course-enroll__text-link">Seguir explorando</a>`;
        } else if (isOwner) {
            primaryAction = `
                <a href="#/maestro/curso/${course.id}" class="course-enroll__primary">
                    <span>Gestionar curso</span>
                    <small>Vista docente</small>
                </a>
            `;
            secondaryAction = nextLesson
                ? `<a href="${window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(course, nextLesson))}" class="course-enroll__text-link">Ver primera lección</a>`
                : `<a href="#/dashboard-maestro" class="course-enroll__text-link">Volver al panel docente</a>`;
        } else if (isStudent) {
            primaryAction = `
                <button type="button" class="course-enroll__primary" id="enroll-course-btn">
                    <span>${hasPremiumAccess ? 'Comenzar preparación' : 'Activar acceso'}</span>
                    <small>${hasPremiumAccess ? ((course.programa || 'exani') === 'exani' ? 'Acceso incluido con tu suscripción' : 'Acceso autorizado a este curso') : ((course.programa || 'exani') === 'exani' ? startLabel : 'Requiere acceso específico')}</small>
                </button>
            `;
            secondaryAction = `<a href="#course-detail-results" class="course-enroll__text-link">Explorar el temario</a>`;
        }

        const program = (window.EducatIA.AcademicCatalog?.programs || []).find(p => p.programa === course.programa);
        if (program && !isOwner && !hasPremiumAccess) {
            primaryAction = `<a class="course-enroll__primary" href="${window.EducatIA.ProgramCatalog.checkoutUrl(course.programa, course.id)}"><span>Inscribirme al curso</span><small>Consultar precio y acceso</small></a>`;
            secondaryAction = `<a href="#course-detail-modules" class="course-enroll__text-link">Ver módulos y lecciones</a>`;
        }

        const stats = [
            { value: `${learningSections.length}`, label: program ? 'módulos' : `${learningSections.length === 1 ? 'serie' : 'series'} de cursos`, meta: 'Ruta de estudio por tema' },
            { value: `${lessons.length + quizzes.length}`, label: 'actividades', meta: 'Lecturas, práctica y evaluaciones del programa' },
            { value: program ? 'Con requisitos' : suggestedLevel, label: 'Nivel de entrada', meta: 'Consulta las recomendaciones' },
            { value: program ? '12 meses' : suggestedSchedule, label: program ? 'de acceso' : 'para completar', meta: program ? 'Desde la confirmación del pago' : 'en 3 horas a la semana' },
            { value: 'Flexible', label: 'Cronograma', meta: 'Aprende a tu propio ritmo' },
        ];

        return `
            <div class="course-detail-page course-enroll">
                <section class="course-enroll__band">
                    <div class="course-enroll__shell">
                        <nav class="course-detail__breadcrumbs course-enroll__breadcrumbs">
                            <a href="#/explorar">Explorar</a>
                            <span>educatIA</span>
                            <span>${escapeHtml(course.titulo)}</span>
                        </nav>

                        <div class="course-enroll__hero">
                            <div class="course-enroll__copy">
                                <div class="course-enroll__provider">
                                    <span class="course-enroll__brand-mark">educatIA</span>
                                </div>
                                <h1>Programa especializado: ${escapeHtml(course.titulo)}</h1>
                                <p class="course-enroll__lead">${escapeHtml(course.descripcion || 'Curso publicado con una ruta estructurada, coach de apoyo y evaluaciones secuenciales.')}</p>
                                ${program ? `<p class="course-enroll__lead"><strong>Requisitos:</strong> ${escapeHtml(program.requisitos)}</p>` : ''}
                                <div class="course-enroll__signals" aria-label="Características de la ruta">
                                    <span>Ruta guiada</span>
                                    <span>Práctica aplicada</span>
                                    <span>Retroalimentación</span>
                                </div>
                                <div class="course-enroll__instructor">
                                    <span class="course-enroll__avatar" aria-hidden="true">E</span>
                                    <span>Instructor: <a href="#/explorar">educatIA</a></span>
                                </div>

                                <div class="course-enroll__actions">
                                    ${primaryAction}
                                </div>

                                <p class="course-enroll__trial">${(course.programa || 'exani') === 'exani' ? (hasPremiumAccess ? 'Tu suscripción Premium permite activar este curso y entrar a la primera actividad sin checkout adicional.' : 'Elige un plan para activar este curso y avanzar con acceso completo.') : (hasPremiumAccess ? 'Tienes acceso autorizado a este curso y puedes comenzar sus actividades.' : 'Este programa requiere acceso independiente. Los planes EXANI no lo incluyen.')}</p>
                                <p class="course-enroll__included">
                                    <strong>Ruta publicada</strong> para inscripción
                                </p>
                                <p class="course-enroll__plus">
                                    ${(course.programa || 'exani') === 'exani' ? 'Incluido con <strong>educatIA Premium</strong>' : 'Acceso independiente a <strong>este programa</strong>'}
                                    <span aria-hidden="true">.</span>
                                    ${secondaryAction}
                                </p>
                            </div>

                            <div class="course-enroll__visual ${course.imagen_url ? 'course-enroll__visual--custom' : ''} course-enroll__visual--${escapeHtml(course.imagen_tamano || 'cover')} course-enroll__visual--${escapeHtml(course.imagen_posicion || 'center')}" aria-hidden="true">
                                <img src="${escapeHtml(courseVisual)}" alt="${escapeHtml(course.imagen_alt || '')}">
                                <div class="course-enroll__arc course-enroll__arc--large"></div>
                                <div class="course-enroll__arc course-enroll__arc--small"></div>
                            </div>

                            <div class="course-enroll__ask">
                                <span>Pregunta a educatIA</span>
                                <a href="#course-detail-recommendations">¿Es este curso adecuado para mí?</a>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="course-enroll__shell">
                    <section class="course-detail__stats">
                        ${stats.map((stat) => `
                            <article class="course-detail__stat">
                                <strong>${escapeHtml(stat.value)}</strong>
                                <span>${escapeHtml(stat.label)}</span>
                                <small>${escapeHtml(stat.meta)}</small>
                            </article>
                        `).join('')}
                    </section>

                    <nav class="course-detail__tabs">
                        <a href="#course-detail-about" class="active" data-course-detail-tab>Acerca de</a>
                        <a href="#course-detail-results" data-course-detail-tab>Resultados</a>
                        <a href="#course-detail-modules" data-course-detail-tab>Módulos</a>
                        <a href="#course-detail-recommendations" data-course-detail-tab>Recomendaciones</a>
                        <a href="#course-detail-reviews" data-course-detail-tab>Reseñas</a>
                    </nav>

                    <section class="course-detail__section" id="course-detail-about">
                        <div class="course-detail__section-head">
                            <div>
                                <div class="course-detail__section-kicker">Acerca de</div>
                                <h2>Qué aprenderás</h2>
                            </div>
                            ${isStudent ? `<span class="course-detail__section-badge">${learningSections.length} módulos</span>` : ''}
                        </div>
                        <div class="course-detail__outcomes">
                            ${aboutItems.map((outcome) => `
                                <div class="course-detail__outcome">
                                    <p>${escapeHtml(outcome)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="course-detail__section" id="course-detail-results">
                        <div class="course-detail__section-head">
                            <div>
                                <div class="course-detail__section-kicker">Resultados</div>
                                <h2>Lo que obtendrás al completar la ruta</h2>
                            </div>
                        </div>
                        <div class="course-detail__outcomes">
                            ${benefitItems.map((benefit) => `
                                <div class="course-detail__outcome">
                                    <p>${escapeHtml(benefit)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="course-detail__section" id="course-detail-modules">
                        <div class="course-detail__section-head">
                            <div>
                                <div class="course-detail__section-kicker">Módulos</div>
                                <h2>Temario publicado</h2>
                            </div>
                        </div>
                        ${learningSections.length ? `
                            <div class="course-detail__modules">
                                ${learningSections.map((section, index) => `
                                    <details class="course-detail__module-card course-detail__module-card--fold" ${index === 0 ? 'open' : ''}>
                                        <summary>
                                            <span class="course-detail__module-meta">Módulo ${index + 1}</span>
                                            <strong>${escapeHtml(section.titulo)}</strong>
                                            <small>${section.lecciones.length + section.quizzes.length + (section.chating_habilitado ? 1 : 0)} actividades</small>
                                        </summary>
                                        <p>${escapeHtml(section.descripcion || 'Bloque estructurado con lecciones y actividades.')}</p>
                                        <ul class="course-detail__module-lessons">
                                            ${section.lecciones.slice(0, 6).map((lesson) => `<li>${escapeHtml(lesson.titulo)}</li>`).join('')}
                                            ${section.quizzes.slice(0, 3).map((quiz) => `<li>${escapeHtml(quiz.titulo)}</li>`).join('')}
                                            ${section.chating_habilitado ? `<li>Chating evaluativo del módulo</li>` : ''}
                                        </ul>
                                    </details>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="course-detail__empty-card">
                                <strong>Este curso aún no tiene módulos visibles.</strong>
                                <p>La estructura aparecerá aquí cuando el docente termine de publicarla.</p>
                            </div>
                        `}
                    </section>

                    <section class="course-detail__section" id="course-detail-recommendations">
                        <div class="course-detail__section-head">
                            <div>
                                <div class="course-detail__section-kicker">Recomendaciones</div>
                                <h2>Antes de inscribirte</h2>
                            </div>
                        </div>
                        <div class="course-detail__info-grid">
                            <article class="course-detail__info-card">
                                <strong>Tiempo sugerido</strong>
                                <p>${program ? 'Organiza sesiones de estudio y programación cada semana. El tiempo necesario depende de tus bases y del trabajo en cada proyecto.' : `Reserva al menos ${escapeHtml(suggestedSchedule)} para completar el curso con margen para revisar actividades y materiales.`}</p>
                            </article>
                            <article class="course-detail__info-card">
                                <strong>Modalidad</strong>
                                <p>Podrás seguir el contenido desde lecciones, coach de apoyo, evaluaciones y recursos descargables en una sola ruta.</p>
                            </article>
                            <article class="course-detail__info-card">
                                <strong>Material complementario</strong>
                                <p>${program ? 'Cada lección reúne sus recursos de código y práctica dentro del lector del curso.' : materials.length ? `Ya hay ${materials.length} recurso${materials.length === 1 ? '' : 's'} complementario${materials.length === 1 ? '' : 's'} publicado${materials.length === 1 ? '' : 's'}.` : 'El curso se puede estudiar aunque todavía no tenga materiales descargables adicionales.'}</p>
                            </article>
                        </div>
                    </section>

                    <section class="course-detail__section" id="course-detail-reviews">
                        <div class="course-detail__section-head">
                            <div>
                                <div class="course-detail__section-kicker">Reseñas</div>
                                <h2>Confianza y señales del curso</h2>
                            </div>
                        </div>
                        <div class="course-detail__review-placeholder">
                            <strong>Este curso aún no muestra reseñas publicas.</strong>
                            <p>Mientras tanto, puedes evaluar su alcance con el temario publicado, la cantidad de lecciones, las evaluaciones activas y la estructura modular del recorrido.</p>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    renderStudentCourseWorkspace: function (context) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const lessonPage = window.EducatIA.Pages.Leccion;
        const aleEnabled = window.EducatIA.Features?.ale === true;

        const {
            course,
            learningSections,
            completedLessonIds,
            passedQuizIds,
            completedChatingModuleIds,
            unlockedModuleIds,
            lessons,
            quizzes,
            modules,
            materials,
            certificates,
            completedTrackableItems,
            totalTrackableItems,
            courseProgressPercent,
            nextLesson,
            nextPendingQuiz,
            nextLearningItem,
            canRequestCertificate,
            userName,
        } = context;

        const routeUrl = (path) => window.EducatIA.Router.toUrl(path);
        const courseReaderHref = routeUrl(window.EducatIA.Utils.courseUrl(course));
        const lessonHref = (entry) => routeUrl(window.EducatIA.Utils.lessonUrl(course, entry));
        const focusQuizId = Number(context.focusQuizId || 0);
        const focusQuiz = focusQuizId
            ? quizzes.find((quiz) => Number(quiz.id) === focusQuizId) || null
            : null;
        const requestedModuleSlug = window.EducatIA.Utils.slugify(context.focusModuleSlug || '');
        const focusSection = requestedModuleSlug
            ? learningSections.find((section) => window.EducatIA.Utils.slugify(section.titulo) === requestedModuleSlug) || null
            : null;
        const visibleSections = focusSection ? [focusSection] : learningSections;
        const focusItem = focusQuiz
            ? { tipo: 'quiz', id: focusQuiz.id }
            : nextLearningItem
            ? { tipo: nextLearningItem.tipo, id: nextLearningItem.id, moduleId: nextLearningItem.moduleId }
            : null;

        const completedChating = completedChatingModuleIds || new Set();
        const pendingQuizzes = quizzes.filter((quiz) => !passedQuizIds.has(Number(quiz.id)));
        const chatingModules = aleEnabled ? modules.filter((module) => module.chating_habilitado) : [];
        const pendingChatingModules = chatingModules.filter((module) => !completedChating.has(Number(module.id)));
        const coachLesson = focusQuiz || nextLearningItem || nextLesson || { titulo: nextPendingQuiz ? nextPendingQuiz.titulo : course.titulo };
        const coachPanel = aleEnabled && lessonPage?.renderCoachPanel
            ? lessonPage.renderCoachPanel({ course, lesson: coachLesson, userName, escapeHtml })
            : '';

        let primaryNextAction = `<a href="#/dashboard" class="btn btn--outline">Volver a mi aprendizaje</a>`;
        if (nextLearningItem?.tipo === 'leccion') {
            primaryNextAction = `<a href="${window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(course, nextLearningItem))}" class="btn btn--primary">Continuar</a>`;
        } else if (nextLearningItem?.tipo === 'quiz') {
            primaryNextAction = `<button type="button" class="btn btn--primary" id="go-next-quiz-btn" data-open-quiz="${nextLearningItem.id}">Continuar</button>`;
        } else if (nextLearningItem?.tipo === 'chating') {
            primaryNextAction = `<button type="button" class="btn btn--primary" id="go-next-chating-btn" data-open-chating="${nextLearningItem.moduleId}">Validar módulo</button>`;
        } else if (canRequestCertificate) {
            primaryNextAction = `<button type="button" class="btn btn--primary" id="request-certificate-btn">Solicitar certificado</button>`;
        }
        const nextItemTitle = nextLearningItem ? nextLearningItem.titulo : 'Ruta completada';

        const welcomeLessons = focusSection
            ? [...focusSection.lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id)
            : learningSections.flatMap((section) => [...section.lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id));
        const welcomeQuizzes = focusSection
            ? [...focusSection.quizzes].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id)
            : quizzes;
        const focusModuleNumber = focusSection
            ? Math.max(1, learningSections.findIndex((section) => Number(section.id) === Number(focusSection.id)) + 1)
            : null;
        const focusSectionDisplayTitle = focusSection
            ? String(focusSection.titulo || '').replace(/^m[oó]dulo\s+\d+\s*[.:–—-]?\s*/i, '').trim()
            : '';
        const focusSectionLocked = Boolean(focusSection?.id != null && !unlockedModuleIds.has(Number(focusSection.id)));
        const welcomeTitle = focusSection
            ? `Módulo ${focusModuleNumber}. ${focusSectionDisplayTitle || focusSection.titulo}`
            : course.titulo;
        const welcomeDescriptionSource = focusSection
            ? (focusSection.descripcion || `En este módulo estudiarás ${focusSection.titulo.toLowerCase()} mediante lecciones, práctica guiada y evaluación formativa.`)
            : (course.descripcion || 'Recorre una ruta ordenada de estudio, practica cada tema y comprueba tu dominio antes de avanzar.');
        const welcomeDescriptionText = String(welcomeDescriptionSource || '').replace(/\s+/g, ' ').trim();
        const welcomeDescription = welcomeDescriptionText.length > 280
            ? `${welcomeDescriptionText.slice(0, 277).trimEnd()}...`
            : welcomeDescriptionText;
        const courseObjectives = this.getEditableSectionItems(course.que_aprenderas, []);
        const welcomeObjectiveTitles = (focusSection || !courseObjectives.length
            ? welcomeLessons.map((lesson) => lesson.titulo)
            : courseObjectives)
            .filter(Boolean)
            .slice(0, 4);
        const welcomeVisualUrl = this.getCourseVisual(course);
        const visibleQuizIds = new Set(visibleSections.flatMap((section) => section.quizzes.map((quiz) => Number(quiz.id))));
        const visiblePendingQuizzes = focusSection
            ? pendingQuizzes.filter((quiz) => visibleQuizIds.has(Number(quiz.id)))
            : pendingQuizzes;
        const visibleChatingModules = focusSection
            ? chatingModules.filter((module) => Number(module.id) === Number(focusSection.id))
            : chatingModules;
        const visiblePendingChatingModules = focusSection
            ? pendingChatingModules.filter((module) => Number(module.id) === Number(focusSection.id))
            : pendingChatingModules;
        const moduleNextItem = focusSection
            ? [
                ...welcomeLessons.map((entry) => ({ ...entry, tipo: 'leccion' })),
                ...welcomeQuizzes.map((entry) => ({ ...entry, tipo: 'quiz' })),
              ]
                .sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.tipo === 'leccion' ? -1 : 1))
                .find((entry) => entry.tipo === 'leccion'
                    ? !completedLessonIds.has(Number(entry.id))
                    : !passedQuizIds.has(Number(entry.id)))
            : null;
        const welcomeNextTitle = focusSection
            ? (moduleNextItem?.titulo || (completedChating.has(Number(focusSection.id)) ? 'Módulo acreditado' : 'Cierre del módulo'))
            : nextItemTitle;
        let welcomePrimaryAction = primaryNextAction;
        if (focusSectionLocked) {
            welcomePrimaryAction = '<span class="course-welcome__locked">Completa el módulo anterior para comenzar</span>';
        } else if (moduleNextItem?.tipo === 'leccion') {
            welcomePrimaryAction = `<a href="${lessonHref(moduleNextItem)}" class="btn btn--primary">Comenzar este módulo</a>`;
        } else if (moduleNextItem?.tipo === 'quiz') {
            welcomePrimaryAction = `<button type="button" class="btn btn--primary" data-open-quiz="${moduleNextItem.id}">Responder evaluación</button>`;
        } else if (aleEnabled && focusSection?.chating_habilitado && !completedChating.has(Number(focusSection.id))) {
            welcomePrimaryAction = `<button type="button" class="btn btn--primary" data-open-chating="${focusSection.id}">Completar cierre del módulo</button>`;
        }

        if (focusQuiz) {
            const focusQuizPassed = passedQuizIds.has(Number(focusQuiz.id));
            return `
                <div class="lesson-workspace lesson-workspace--textual course-workspace course-workspace--reader course-workspace--quiz-focus">
                    <div class="lesson-workspace__top course-reader__topbar">
                        <a href="#/dashboard" class="course-reader__brand" aria-label="Ir a mi aprendizaje"><span class="course-reader__brand-logo" aria-hidden="true"><img src="assets/new_logo/new_logo.png" alt=""></span><span class="sr-only">educatIA</span></a>
                        <div class="course-reader__daily-goal" aria-label="Objetivo del día">
                            <span>Objetivo del día</span>
                            <strong>${escapeHtml(focusQuiz.titulo)}</strong>
                        </div>
                        <div class="lesson-workspace__toolbar" aria-label="Herramientas del formulario">
                            <a href="${courseReaderHref}" class="lesson-workspace__tool">Vista del curso</a>
                            <button type="button" class="lesson-workspace__tool" data-focus-course-index>Índice</button>
                            ${aleEnabled ? '<button type="button" class="lesson-workspace__tool" id="lesson-toolbar-ale-btn">Preguntar a Bill</button>' : ''}
                        </div>
                        <div class="lesson-workspace__progress">
                            <span>${completedTrackableItems}/${totalTrackableItems || 0} elementos completados - ${courseProgressPercent}% completado</span>
                            ${this.renderAssignmentProgress(context)}
                            <div class="lesson-workspace__progress-bar"><span style="width:${courseProgressPercent}%"></span></div>
                        </div>
                    </div>

                    <div class="lesson-workspace__grid">
                        ${this.renderCourseRail({
                            course,
                            sections: learningSections,
                            focusItem,
                            completedLessonIds,
                            passedQuizIds,
                            completedChatingModuleIds: completedChating,
                            unlockedModuleIds,
                            escapeHtml,
                        })}

                        <main class="lesson-stage">
                            <article class="lesson-stage__card course-workspace__document course-reader__document course-reader__document--quiz-focus">
                                <nav class="lesson-breadcrumb" aria-label="Ubicacion del formulario">
                                    <a href="#/dashboard">Mi aprendizaje</a>
                                    <a href="${courseReaderHref}">${escapeHtml(course.titulo)}</a>
                                    <span>${escapeHtml(focusQuiz.titulo)}</span>
                                </nav>

                                <div class="lesson-stage__header course-quiz-focus__header">
                                    <div>
                                        <div class="lesson-stage__meta">Formulario formativo</div>
                                        <h1>${escapeHtml(focusQuiz.titulo)}</h1>
                                        <p class="lesson-stage__summary">${escapeHtml(focusQuiz.descripcion || 'Responde con calma. Al enviar, revisarás tu resultado y la retroalimentación de aprendizaje.')}</p>
                                    </div>
                                    <span class="lesson-stage__status ${focusQuizPassed ? 'completed' : ''}">${focusQuizPassed ? 'Aprobado' : 'Pendiente'}</span>
                                </div>

                                <div id="quiz-attempt-panel" class="course-workspace__quiz-panel course-workspace__quiz-panel--focus" aria-live="polite"></div>

                                <div class="lesson-stage__actions course-reader__actions course-reader__actions--quiz">
                                    ${aleEnabled ? '<button type="button" class="btn btn--outline btn--sm" id="lesson-stage-ale-btn">Preguntar a Bill</button>' : ''}
                                </div>
                            </article>
                        </main>

                        ${coachPanel}
                    </div>
                </div>
            `;
        }

        return `
            <div class="lesson-workspace course-workspace course-workspace--reader">
                <div class="lesson-workspace__top course-reader__topbar">
                    <a href="#/dashboard" class="course-reader__brand" aria-label="Ir a mi aprendizaje"><span class="course-reader__brand-logo" aria-hidden="true"><img src="assets/new_logo/new_logo.png" alt=""></span><span class="sr-only">educatIA</span></a>
                    <div class="course-reader__daily-goal" aria-label="Objetivo del día">
                        <span>Objetivo del día</span>
                        <strong>${escapeHtml(welcomeNextTitle)}</strong>
                    </div>
                    <div class="lesson-workspace__toolbar" aria-label="Herramientas del curso">
                        <a href="${courseReaderHref}" class="lesson-workspace__tool">Vista del curso</a>
                        ${['machine_learning', 'deep_learning', 'transformers_multimodal'].includes(course.programa) ? `<a href="${routeUrl('/tareas/curso/' + course.id)}" class="lesson-workspace__tool">Tareas y proyectos</a>` : ''}
                        <button type="button" class="lesson-workspace__tool" data-focus-course-index>Índice</button>
                    </div>
                    <div class="lesson-workspace__progress">
                        <span>${completedTrackableItems}/${totalTrackableItems || 0} elementos completados - ${courseProgressPercent}% completado</span>
                        ${this.renderAssignmentProgress(context)}
                        <div class="lesson-workspace__progress-bar"><span style="width:${courseProgressPercent}%"></span></div>
                    </div>
                </div>

                <div class="lesson-workspace__grid">
                    ${this.renderCourseRail({
                        course,
                        sections: learningSections,
                        focusItem: moduleNextItem
                            ? { tipo: moduleNextItem.tipo, id: moduleNextItem.id, moduleId: focusSection?.id }
                            : focusItem,
                        completedLessonIds,
                        passedQuizIds,
                        completedChatingModuleIds: completedChating,
                        unlockedModuleIds,
                        escapeHtml,
                    })}

                    <main class="lesson-stage">
                        <article class="lesson-stage__card course-workspace__document course-reader__document course-reader__document--brief">
                            <nav class="lesson-breadcrumb" aria-label="Ubicacion del curso">
                                <a href="#/dashboard">Mi aprendizaje</a>
                                ${focusSection ? `<a href="${courseReaderHref}">${escapeHtml(course.titulo)}</a>` : `<span>${escapeHtml(course.titulo)}</span>`}
                                <span>${focusSection ? escapeHtml(focusSection.titulo) : 'Bienvenida'}</span>
                            </nav>

                            <section class="course-welcome" id="course-reader-welcome">
                                <header class="course-welcome__header">
                                    <div>
                                        <div class="lesson-stage__eyebrow">${focusSection ? 'Bienvenida al módulo' : 'Bienvenida al curso'}</div>
                                        <div class="lesson-stage__meta">${focusSection ? `Parte ${focusModuleNumber} de ${learningSections.length}` : 'Descripción general'}</div>
                                        <h1>${escapeHtml(welcomeTitle)}</h1>
                                        <p>${escapeHtml(welcomeDescription)}</p>
                                    </div>
                                    <span class="lesson-stage__status ${courseProgressPercent === 100 ? 'completed' : ''}">${courseProgressPercent}% completado</span>
                                </header>

                                <div class="course-welcome__brief">
                                    <figure class="course-welcome__visual">
                                        <img src="${escapeHtml(welcomeVisualUrl)}" alt="Portada de ${escapeHtml(course.titulo)}" loading="eager" decoding="async">
                                    </figure>
                                    <div class="course-welcome__content">
                                        <div class="course-detail__section-kicker">${focusSection ? 'En este módulo podrás' : 'En este curso podrás'}</div>
                                        <ul class="course-welcome__brief-objectives">
                                            ${welcomeObjectiveTitles.length
                                                ? welcomeObjectiveTitles.map((title) => `<li>${escapeHtml(title)}</li>`).join('')
                                                : '<li>Comprender los conceptos principales y aplicarlos en ejercicios semejantes al examen.</li>'}
                                        </ul>
                                        <div class="course-welcome__assessment-note">
                                            <strong>Evaluación por clase</strong>
                                            <span>10 reactivos · mínimo 9/10 · reintentos permitidos</span>
                                        </div>
                                        <div class="course-welcome__next ${focusSectionLocked ? 'is-locked' : ''}">
                                            <span>
                                                <small>${focusSectionLocked ? 'Acceso pendiente' : 'Siguiente elemento'}</small>
                                                <strong>${escapeHtml(welcomeNextTitle)}</strong>
                                            </span>
                                            <div class="course-workspace__next-actions">${welcomePrimaryAction}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="course-reader__section course-welcome__objectives" id="course-reader-objectives">
                                <div class="lesson-stage__section-title">Objetivos de aprendizaje</div>
                                <h2>${focusSection ? 'Al terminar este módulo podrás' : 'Lo que construirás durante el curso'}</h2>
                                <ul class="course-welcome__objective-list">
                                    ${welcomeObjectiveTitles.length
                                        ? welcomeObjectiveTitles.map((title) => `<li><span>${escapeHtml(title)}</span></li>`).join('')
                                        : '<li><span>Explicar los conceptos principales del curso y aplicarlos en ejercicios semejantes al examen.</span></li>'}
                                </ul>
                            </section>

                            <section class="course-reader__section" id="course-reader-evaluation">
                                <div class="lesson-stage__section-title">Evaluación y políticas</div>
                                <h2>Acredita demostrando dominio</h2>
                                <div class="course-welcome__policy-grid">
                                    <article>
                                        <strong>Evaluación</strong>
                                        <p>Cada lección cierra con 10 reactivos específicos. Necesitas al menos 9 respuestas correctas para marcarla como completada y avanzar.</p>
                                    </article>
                                    <article>
                                        <strong>Reintentos para aprender</strong>
                                        <p>Si todavía no alcanzas 9/10, revisa la retroalimentación y vuelve a intentarlo. Se conserva tu mejor resultado.</p>
                                    </article>
                                    <article>
                                        <strong>Trabajo propio</strong>
                                        <p>Responde con base en lo estudiado. No compartas respuestas ni soluciones de actividades evaluables.</p>
                                    </article>
                                    <article>
                                        <strong>Progreso verificable</strong>
                                        <p>Solo las actividades acreditadas cuentan para tu avance, estadísticas y disponibilidad de certificado.</p>
                                    </article>
                                </div>
                            </section>

                            <section class="course-reader__section" id="course-reader-content">
                                <div class="lesson-stage__section-title">Contenido del curso</div>
                                <h2>${focusSection ? 'Contenido del módulo' : 'Ruta de aprendizaje'}</h2>
                                <p>${focusSection
                                    ? 'Aquí tienes las lecciones y evaluaciones que forman este bloque. El avance se registra únicamente al acreditar cada actividad.'
                                    : 'Avanza por las lecturas y evaluaciones en orden. Cada módulo conserva tu progreso para que puedas salir, volver y continuar desde el siguiente elemento pendiente.'}</p>

                                <div class="course-reader__modules">
                                    ${visibleSections.map((section) => {
                                        const sectionIndex = Math.max(0, learningSections.findIndex((candidate) => Number(candidate.id) === Number(section.id)));
                                        const sectionLocked = section.id != null && !unlockedModuleIds.has(Number(section.id));
                                        const entries = [
                                            ...section.lecciones.map((entry) => ({ ...entry, tipo: 'leccion' })),
                                            ...section.quizzes.map((entry) => ({ ...entry, tipo: 'quiz' })),
                                        ].sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.tipo === 'leccion' ? -1 : 1));
                                        if (section.chating_habilitado && section.id != null) {
                                            entries.push({
                                                id: `chating-${section.id}`,
                                                moduleId: section.id,
                                                titulo: 'Chating del módulo',
                                                tipo: 'chating',
                                            });
                                        }

                                        const moduleHref = routeUrl(window.EducatIA.Utils.moduleUrl(course, section));
                                        const moduleMarkup = `
                                            <article class="course-reader__module ${sectionLocked ? 'is-locked' : ''}" data-course-module-slug="${window.EducatIA.Utils.slugify(section.titulo)}">
                                                <div class="course-reader__module-head">
                                                    <span>Módulo ${sectionIndex + 1}</span>
                                                    <strong><a href="${moduleHref}" class="course-reader__module-link">${escapeHtml(section.titulo)}</a></strong>
                                                </div>
                                                ${sectionLocked ? '<p class="lesson-rail__module-lock">Bloqueado hasta completar todas las actividades del módulo anterior.</p>' : ''}
                                                ${section.descripcion ? `<p>${escapeHtml(section.descripcion)}</p>` : ''}
                                                <div class="course-reader__items">
                                                    ${entries.map((entry) => {
                                                        const isCompleted = entry.tipo === 'leccion'
                                                            ? completedLessonIds.has(Number(entry.id))
                                                            : entry.tipo === 'quiz'
                                                                ? passedQuizIds.has(Number(entry.id))
                                                                : completedChating.has(Number(entry.moduleId));
                                                        const stateLabel = sectionLocked
                                                            ? 'Bloqueado'
                                                            : isCompleted
                                                                ? (entry.tipo === 'quiz' ? 'Aprobado' : entry.tipo === 'chating' ? 'Validado' : 'Listo')
                                                                : (entry.tipo === 'chating' ? 'Cierre IA' : 'Pendiente');
                                                        const itemMarkup = `
                                                            <span class="course-reader__item-type">${entry.tipo === 'leccion' ? 'Lectura' : entry.tipo === 'quiz' ? 'Evaluación' : 'Chating'}</span>
                                                            <strong>${escapeHtml(entry.titulo)}</strong>
                                                            <span class="course-reader__item-state ${isCompleted ? 'completed' : ''}">${stateLabel}</span>
                                                        `;

                                                        if (sectionLocked) {
                                                            return `<span class="course-reader__item is-locked" aria-disabled="true">${itemMarkup}</span>`;
                                                        }

                                                        if (entry.tipo === 'leccion') {
                                                            return `<a href="${lessonHref(entry)}" class="course-reader__item">${itemMarkup}</a>`;
                                                        }

                                                        if (entry.tipo === 'chating') {
                                                            return `<button type="button" class="course-reader__item" data-open-chating="${entry.moduleId}">${itemMarkup}</button>`;
                                                        }

                                                        return `<button type="button" class="course-reader__item" data-open-quiz="${entry.id}">${itemMarkup}</button>`;
                                                    }).join('')}
                                                </div>
                                            </article>
                                        `;
                                        return moduleMarkup;
                                    }).join('')}
                                </div>
                            </section>

                            <section class="course-reader__section" id="course-reader-resources">
                                <div class="lesson-stage__section-title">Recursos y evaluación</div>
                                <h2>Materiales de apoyo</h2>
                                ${materials.length ? `
                                    <div class="course-reader__resource-list">
                                        ${materials.slice(0, 6).map((material) => `
                                            <a href="${window.EducatIA.Utils.safeUrl(window.EducatIA.API.getBackendOrigin() + material.url_archivo)}" class="course-reader__resource">
                                                <strong>${escapeHtml(material.nombre_archivo)}</strong>
                                                <span>Descargar recurso</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : `<p>Este curso por ahora se apoya en lecturas, formularios y evaluaciones publicadas dentro de la plataforma.</p>`}

                                ${visiblePendingQuizzes.length ? `
                                    <h2>Evaluaciones pendientes</h2>
                                    <div class="course-reader__resource-list">
                                        ${visiblePendingQuizzes.slice(0, 6).map((quiz) => `
                                            <button type="button" class="course-reader__resource" data-open-quiz="${quiz.id}">
                                                <strong>${escapeHtml(quiz.titulo)}</strong>
                                                <span>Abrir evaluación</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                ` : `<p>No tienes evaluaciones pendientes en este momento.</p>`}

                                ${visibleChatingModules.length ? `
                                    <h2>Sesiones con IA</h2>
                                    <div class="course-reader__resource-list">
                                        ${visibleChatingModules.map((module) => `
                                            <button type="button" class="course-reader__resource" data-open-chating="${module.id}">
                                                <strong>${escapeHtml(module.titulo)}</strong>
                                                <span>${completedChating.has(Number(module.id)) ? 'Cierre validado' : 'Pendiente de validación'} - ${Number(module.chating_procesos_totales || 0)} procesos clave</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${visiblePendingChatingModules.length ? `<p>El siguiente módulo se desbloquea cuando Chating valida el cierre pendiente.</p>` : ''}
                            </section>

                            <section class="course-reader__section" id="course-reader-feedback">
                                <div class="lesson-stage__section-title">Feedback continuo</div>
                                <h2>Ayúdanos a mejorar esta ruta</h2>
                                <p>Después de estudiar un módulo o resolver una evaluación, deja una calificación breve. Esto ayuda a detectar lecciones confusas y ajustar el contenido.</p>
                                <form id="course-feedback-form" class="course-feedback-form" style="display:grid;gap:12px;margin-top:12px;">
                                    <div class="lesson-checkpoint__options" role="radiogroup" aria-label="Calificación del curso">
                                        ${[1, 2, 3, 4, 5].map((rating) => `<button type="button" data-course-rating="${rating}" aria-pressed="false">${rating} estrella${rating === 1 ? '' : 's'}</button>`).join('')}
                                    </div>
                                    <textarea id="course-feedback-comment" class="fi" rows="3" maxlength="4000" placeholder="Que fue claro, que fue confuso o que agregarias?"></textarea>
                                    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                        <button type="submit" class="btn btn--primary btn--sm">Enviar feedback</button>
                                        <span id="course-feedback-message" class="text-small" aria-live="polite"></span>
                                    </div>
                                </form>
                            </section>

                            <div id="quiz-attempt-panel" class="course-workspace__quiz-panel"></div>

                            <div class="lesson-stage__actions course-reader__actions">
                                ${welcomePrimaryAction}
                            </div>
                        </article>
                    </main>

                    <aside class="lesson-outline course-reader__outline" aria-label="Índice de la vista del curso">
                        <div class="lesson-outline__title">En este curso</div>
                        <nav class="lesson-outline__list">
                            <a class="lesson-outline__item" href="#course-reader-welcome"><span class="lesson-outline__dot" aria-hidden="true"></span>Bienvenida</a>
                            <a class="lesson-outline__item" href="#course-reader-objectives"><span class="lesson-outline__dot" aria-hidden="true"></span>Objetivos</a>
                            <a class="lesson-outline__item" href="#course-reader-evaluation"><span class="lesson-outline__dot" aria-hidden="true"></span>Evaluación</a>
                            <a class="lesson-outline__item" href="#course-reader-content"><span class="lesson-outline__dot" aria-hidden="true"></span>Contenido</a>
                            <a class="lesson-outline__item" href="#course-reader-resources"><span class="lesson-outline__dot" aria-hidden="true"></span>Recursos y evaluación</a>
                            <a class="lesson-outline__item" href="#course-reader-feedback"><span class="lesson-outline__dot" aria-hidden="true"></span>Feedback</a>
                        </nav>
                    </aside>

                </div>
            </div>
        `;
    },

    focusModuleBySlug: function (moduleSlug) {
        if (!moduleSlug) {
            return;
        }
        const slug = window.EducatIA.Utils.slugify(moduleSlug);
        const target = document.querySelector(`[data-course-module-slug="${slug}"]`);
        if (!target) {
            return;
        }
        target.classList.add('is-focused');
        window.setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    },

    bindPublishedActions: function (context) {
        const API = window.EducatIA.API;
        const lessonPage = window.EducatIA.Pages.Leccion;

        if (lessonPage?.bindLessonRailControls) {
            lessonPage.bindLessonRailControls();
        }

        const focusIndexButton = document.querySelector('[data-focus-course-index]');
        if (focusIndexButton) {
            focusIndexButton.addEventListener('click', () => {
                const rail = document.querySelector('.lesson-rail');
                const searchInput = document.getElementById('lesson-rail-search');
                if (rail) {
                    rail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                window.setTimeout(() => searchInput?.focus(), 250);
            });
        }

        const detailTabs = Array.from(document.querySelectorAll('[data-course-detail-tab]'));
        if (detailTabs.length) {
            const setActiveTab = (activeTab) => {
                detailTabs.forEach((tab) => tab.classList.toggle('active', tab === activeTab));
            };

            detailTabs.forEach((tab) => {
                tab.addEventListener('click', (event) => {
                    const target = document.querySelector(tab.getAttribute('href'));
                    if (!target) {
                        return;
                    }
                    event.preventDefault();
                    setActiveTab(tab);
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        }

        let selectedCourseRating = 0;
        document.querySelectorAll('[data-course-rating]').forEach((button) => {
            button.addEventListener('click', () => {
                selectedCourseRating = Number(button.dataset.courseRating || 0);
                document.querySelectorAll('[data-course-rating]').forEach((item) => {
                    const active = Number(item.dataset.courseRating || 0) === selectedCourseRating;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-pressed', String(active));
                });
            });
        });

        const feedbackForm = document.getElementById('course-feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const message = document.getElementById('course-feedback-message');
                if (!selectedCourseRating) {
                    if (message) message.textContent = 'Elige una calificación de 1 a 5.';
                    return;
                }
                const submit = feedbackForm.querySelector('button[type="submit"]');
                if (submit) {
                    submit.disabled = true;
                    submit.textContent = 'Enviando...';
                }
                try {
                    await API.submitCourseFeedback(context.course.id, {
                        rating: selectedCourseRating,
                        comentario: document.getElementById('course-feedback-comment')?.value || '',
                    });
                    if (message) message.textContent = 'Gracias. Tu feedback quedo guardado.';
                    feedbackForm.reset();
                    selectedCourseRating = 0;
                    document.querySelectorAll('[data-course-rating]').forEach((item) => {
                        item.classList.remove('active');
                        item.setAttribute('aria-pressed', 'false');
                    });
                } catch (error) {
                    if (message) message.textContent = error.message || 'No se pudo enviar el feedback.';
                } finally {
                    if (submit) {
                        submit.disabled = false;
                        submit.textContent = 'Enviar feedback';
                    }
                }
            });
        }

        ['enroll-course-btn', 'enroll-course-btn-secondary'].forEach((buttonId) => {
            const enrollBtn = document.getElementById(buttonId);
            if (!enrollBtn) {
                return;
            }

            enrollBtn.addEventListener('click', async () => {
                if ((context.course.programa || 'exani') !== 'exani' && !context.hasPremiumAccess) {
                    window.EducatIA.Router.navigate(`/checkout?programa=${encodeURIComponent(context.course.programa)}&course_id=${context.course.id}`);
                    return;
                }
                const idleLabel = enrollBtn.textContent || 'Inscribirme ya';
                enrollBtn.disabled = true;
                enrollBtn.textContent = 'Inscribiendo...';
                let transitionClosed = false;
                const transition = window.EducatIA.Components?.showExperienceTransition?.({
                    label: 'Personalizando experiencia',
                    detail: 'Estamos preparando tu curso, avance y recomendaciones de estudio.'
                });
                try {
                    await API.enroll(context.course.id);
                    await transition?.close?.(320);
                    transitionClosed = true;
                    const accepted = await this.showCourseCommitment(context);
                    if (accepted && context.firstLesson) {
                        window.EducatIA.Router.navigate(window.EducatIA.Utils.lessonUrl(context.course, context.firstLesson));
                        return;
                    }
                    await this.renderPublished({ id: context.course.id });
                } catch (error) {
                    if ((context.course.programa || 'exani') === 'exani' && (error.message || '').toLowerCase().includes('suscrip')) {
                        const shouldStartCheckout = await window.EducatIA.Components.confirmAction({
                            title: 'Activa tu acceso premium',
                            message: 'Este curso requiere una suscripción activa. Puedes consultar los planes disponibles antes de continuar.',
                            confirmLabel: 'Ver planes'
                        });
                        if (shouldStartCheckout) {
                            window.EducatIA.Router.navigate(`/precios?course_id=${encodeURIComponent(context.course.id)}`);
                            return;
                        }
                        enrollBtn.disabled = false;
                        enrollBtn.textContent = idleLabel;
                        return;
                    }
                    enrollBtn.disabled = false;
                    enrollBtn.textContent = idleLabel;
                    window.EducatIA.Components.showWebNotice(
                        'Inscripción no completada',
                        error.message || 'No fue posible inscribirte en este curso.',
                        'error'
                    );
                } finally {
                    if (!transitionClosed) {
                        await transition?.close?.(760);
                    }
                }
            });
        });

        ['request-certificate-btn', 'request-certificate-btn-secondary'].forEach((buttonId) => {
            const certificateBtn = document.getElementById(buttonId);
            if (!certificateBtn) {
                return;
            }

            certificateBtn.addEventListener('click', async () => {
                certificateBtn.disabled = true;
                certificateBtn.textContent = 'Solicitando...';
                try {
                    await API.requestCertificate(context.course.id);
                    await this.renderPublished({ id: context.course.id });
                } catch (error) {
                    certificateBtn.disabled = false;
                    certificateBtn.textContent = 'Solicitar certificado';
                    window.EducatIA.Components.showWebNotice(
                        'Certificado no disponible',
                        error.message || 'No fue posible emitir el certificado en este momento.',
                        'error'
                    );
                }
            });
        });

        document.querySelectorAll('[data-open-quiz]').forEach((element) => {
            element.addEventListener('click', (event) => {
                if (element.tagName === 'BUTTON') {
                    event.preventDefault();
                }
                const quizId = Number(element.dataset.openQuiz);
                if (quizId) {
                    const quiz = (context.quizzes || []).find((item) => Number(item.id) === quizId) || { id: quizId, titulo: `evaluacion-${quizId}` };
                    window.EducatIA.Router.navigate(window.EducatIA.Utils.quizUrl(context.course, quiz));
                }
            });
        });

        document.querySelectorAll('[data-open-chating]').forEach((element) => {
            element.addEventListener('click', (event) => {
                if (element.tagName === 'BUTTON') {
                    event.preventDefault();
                }
                const moduleId = Number(element.dataset.openChating);
                if (moduleId) {
                    this.openModuleChating(context.course.id, moduleId);
                }
            });
        });

        if (context.isStudent && context.enrolled && lessonPage?.bindCoachInteractions) {
            lessonPage.bindCoachInteractions({
                course: context.course,
                lesson: context.nextLesson || { titulo: context.nextPendingQuiz ? context.nextPendingQuiz.titulo : context.course.titulo },
            });
        }

    },

    renderPublished: async function (params) {
        const Components = window.EducatIA.Components;
        const API = window.EducatIA.API;
        const app = document.getElementById('app');
        const courseId = Number(params?.id);
        const isLoggedIn = Components.userState.loggedIn;

        this.stopExamGuard();

        app.innerHTML = `
            <div class="course-detail-page course-detail-page--loading">
                <div class="course-detail__shell">
                    <div class="course-detail__loading">${Components.renderLoading('Cargando curso')}</div>
                </div>
            </div>
        `;

        try {
            const [course, materials, lessons, quizzes, modules] = await Promise.all([
                params?.preloadedCourse
                    ? Promise.resolve(params.preloadedCourse)
                    : API.getCourse(courseId),
                API.getMaterials(courseId),
                API.getLessons(courseId),
                API.getQuizzes(courseId),
                API.getModules(courseId),
            ]);

            let enrolled = false;
            let certificates = [];
            let courseProgress = { lecciones_completadas: [] };
            const isAdmin = Components.isAdminRole?.() || Components.userState.role === 'admin';
            const isOwner = isLoggedIn && (isAdmin || (Components.canAccessTeacherViews?.() && course.maestro_id === Components.userState.id));
            const isStudent = isLoggedIn && (Components.canAccessStudentViews?.() || Components.userState.role === 'alumno');
            const hasPremiumAccess = course.acceso_autorizado === true;
            if (String(course.titulo || '').trim().toLowerCase() === 'simuladores exani-ii' && !isOwner && !isAdmin) {
                window.EducatIA.Router.navigate(window.EducatIA.Utils.exaniSimulatorUrl());
                return;
            }

            if (isStudent) {
                const enrollments = await API.getMyEnrollments();
                enrolled = enrollments.some((item) => item.curso_id === course.id);
                if (enrolled && hasPremiumAccess) {
                    const [myCertificates, progress] = await Promise.all([
                        API.getMyCertificates(),
                        API.getCourseProgress(course.id),
                    ]);
                    certificates = myCertificates.filter((item) => item.curso_id === course.id);
                    courseProgress = progress;
                }
            }

            const attemptedQuizIds = new Set((courseProgress.quizzes_intentados || []).map((quizId) => Number(quizId)));
            const passedQuizIds = new Set((courseProgress.quizzes_aprobados || []).map((quizId) => Number(quizId)));
            const completedLessonIds = new Set((courseProgress.lecciones_completadas || []).map((lessonId) => Number(lessonId)));
            const completedChatingModuleIds = new Set((courseProgress.modulos_chating_completados || []).map((moduleId) => Number(moduleId)));
            const unlockedModuleIds = new Set((courseProgress.modulos || []).filter((item) => item.desbloqueado).map((item) => Number(item.modulo_id)));
            const learningSections = this.buildLearningSections(modules, lessons, quizzes);
            if (course.acceso_revision) learningSections.forEach(section => unlockedModuleIds.add(Number(section.id)));
            const chatingModules = learningSections.filter((section) => section.chating_habilitado && section.id != null);
            const totalTrackableItems = Number(courseProgress.total_actividades ?? (lessons.length + quizzes.length + chatingModules.length));
            const completedTrackableItems = Number(courseProgress.actividades_completadas ?? (completedLessonIds.size + passedQuizIds.size + completedChatingModuleIds.size));
            const courseProgressPercent = Number(courseProgress.porcentaje || 0);
            const orderedLearningItems = learningSections.flatMap((section) => {
                const entries = [
                    ...section.lecciones.map((entry) => ({ ...entry, tipo: 'leccion' })),
                    ...section.quizzes.map((entry) => ({ ...entry, tipo: 'quiz' })),
                ].sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.tipo === 'leccion' ? -1 : 1));
                if (section.chating_habilitado && section.id != null) {
                    entries.push({
                        id: `chating-${section.id}`,
                        moduleId: section.id,
                        titulo: `Chating del módulo: ${section.titulo}`,
                        tipo: 'chating',
                    });
                }
                return entries;
            });
            const orderedLessons = learningSections.flatMap((section) => [...section.lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id));
            const firstLesson = orderedLessons[0] || null;
            const nextLesson = orderedLessons.find((lesson) => !completedLessonIds.has(Number(lesson.id))) || firstLesson;
            const nextPendingQuiz = quizzes.find((quiz) => !passedQuizIds.has(Number(quiz.id))) || quizzes[0] || null;
            const fallbackNextLearningItem = orderedLearningItems.find((item) => (
                item.tipo === 'leccion'
                    ? !completedLessonIds.has(Number(item.id))
                    : item.tipo === 'quiz'
                        ? !passedQuizIds.has(Number(item.id))
                        : !completedChatingModuleIds.has(Number(item.moduleId))
            )) || null;
            const progressNextActivity = courseProgress.siguiente_actividad;
            const nextLearningItem = progressNextActivity
                ? {
                    ...progressNextActivity,
                    moduleId: progressNextActivity.modulo_id,
                }
                : fallbackNextLearningItem;
            const canRequestCertificate = isStudent && enrolled && Boolean(courseProgress.certificado_disponible);
            const outcomes = this.getCourseOutcomes({ course, learningSections, lessons, quizzes, materials });
            const requestedQuizId = isStudent && enrolled ? this.getRequestedQuizId(params) : null;
            const context = {
                course,
                requiredAssignmentCount: Number(courseProgress.total_tareas_requeridas || 0),
                passedAssignmentCount: new Set(courseProgress.tareas_aprobadas || []).size,
                materials,
                lessons,
                quizzes,
                modules,
                learningSections,
                completedLessonIds,
                passedQuizIds,
                completedChatingModuleIds,
                unlockedModuleIds,
                attemptedQuizIds,
                completedTrackableItems,
                totalTrackableItems,
                courseProgressPercent,
                nextLesson,
                nextPendingQuiz,
                nextLearningItem,
                firstLesson,
                enrolled,
                certificates,
                canRequestCertificate,
                isStudent,
                isOwner,
                isLoggedIn,
                hasPremiumAccess,
                userName: Components.userState.name || 'Alumno',
                aboutItems: this.getEditableSectionItems(course.que_aprenderas, outcomes),
                benefitItems: this.getEditableSectionItems(course.lo_que_obtendras, this.getCourseBenefits({ lessons, quizzes, materials })),
                suggestedLevel: this.getSuggestedLevel(modules, lessons, quizzes),
                suggestedSchedule: this.getSuggestedSchedule(lessons, quizzes),
                focusQuizId: requestedQuizId,
                focusModuleSlug: params?.moduleSlug || null,
            };

            app.innerHTML = isStudent && enrolled && hasPremiumAccess
                ? this.renderStudentCourseWorkspace(context)
                : this.renderPublicDetailPage(context);

            if (course.acceso_revision) {
                app.insertAdjacentHTML('afterbegin', `<div class="course-enroll__shell"><div class="course-detail__info-card"><strong>Acceso de revisión</strong><p>${course.activo ? 'Puedes inspeccionar todos los módulos. Tu avance y calificaciones conservan sus valores reales.' : 'Vista previa privada de un curso en preparación. Solo se muestra el contenido disponible; aún faltan módulos y el calendario de clases.'}</p></div></div>`);
            }

            this.bindPublishedActions({
                ...context,
                course,
            });

            if (requestedQuizId && isStudent && enrolled) {
                window.setTimeout(() => {
                    this.openQuiz(course.id, requestedQuizId, course);
                }, 0);
            }
        } catch (error) {
            app.innerHTML = `
                <div class="course-detail-page course-detail-page--loading">
                    <div class="course-detail__shell">
                        <div class="course-detail__loading course-detail__loading--error">
                            <h3 class="empty-state__title">No se pudo cargar el curso</h3>
                            <p class="empty-state__desc">${window.EducatIA.Utils.escapeHtml(error.message || 'Verifica que el backend este funcionando.')}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    getRequestedQuizId: function (params) {
        const routeQuizId = Number(params?.quizId || 0);
        if (Number.isFinite(routeQuizId) && routeQuizId > 0) {
            return routeQuizId;
        }
        const candidates = [];
        if (window.location.search) {
            candidates.push(window.location.search.slice(1));
        }
        const hash = window.location.hash || '';
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
            candidates.push(hash.slice(queryIndex + 1));
        }

        for (const query of candidates) {
            const params = new URLSearchParams(query);
            const quizId = Number(params.get('quiz'));
            if (Number.isFinite(quizId) && quizId > 0) {
                return quizId;
            }
        }
        return null;
    },

    openModuleChating: async function (courseId, moduleId) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const panel = document.getElementById('quiz-attempt-panel');
        if (!panel) {
            return;
        }

        this.stopExamGuard();
        panel.innerHTML = `<div class="analytics-card" style="min-height:96px;padding:20px;display:grid;place-items:center;">${window.EducatIA.Components.renderLoading({ label: 'Cargando Chating', compact: true })}</div>`;

        try {
            const [module, session] = await Promise.all([
                API.getModule(moduleId),
                API.startModuleChatingSession(moduleId),
            ]);

            panel.innerHTML = `
                <div class="analytics-card" style="padding: 24px; display:grid; gap:18px;">
                    <div class="flex-between" style="gap:16px; align-items:flex-start;">
                        <div>
                            <div class="lesson-stage__meta">Sesión evaluativa</div>
                            <h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">Chating · ${escapeHtml(module.titulo)}</h3>
                            <p class="text-small" style="color: var(--text-secondary); margin:0;">Aquí no recibes respuestas resueltas. Debes demostrar dominio real del módulo para cerrar la sesión.</p>
                        </div>
                        <button class="btn btn--ghost btn--sm" type="button" onclick="document.getElementById('quiz-attempt-panel').innerHTML=''">Cerrar</button>
                    </div>

                    <div style="padding:14px 16px; border-radius:14px; background:rgba(0,86,210,0.05); border:1px solid rgba(0,86,210,0.12);">
                        <div style="font-size:12px; font-weight:700; color:var(--electric-blue); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Regla de la sesión</div>
                        <div style="font-size:14px; color:var(--text-secondary); line-height:1.6;">Chating evalúa, plantea desafíos y concluye cuando cubres todos los procesos clave del módulo.</div>
                    </div>

                    <div id="module-chating-progress" style="display:flex; gap:10px; flex-wrap:wrap;"></div>

                    <div id="module-chating-messages" style="display:grid; gap:10px; max-height:280px; overflow:auto; padding-right:4px;"></div>

                    <div style="display:flex; gap:10px; align-items:flex-end;">
                        <textarea id="module-chating-input" class="fi" rows="3" placeholder="Responde sin pedir ayuda. Explica tu razonamiento con tus palabras." style="min-height:88px;"></textarea>
                        <button id="module-chating-send" type="button" class="btn btn--primary">Enviar</button>
                    </div>
                </div>
            `;

            this.bindModuleChatingSession(module, session);
        } catch (error) {
            panel.innerHTML = `
                <div class="analytics-card" style="padding: 20px; text-align:center;">
                    <p class="text-small" style="color: var(--text-secondary);">${escapeHtml(error.message || 'No se pudo abrir Chating.')}</p>
                </div>
            `;
        }
    },

    bindModuleChatingSession: function (module, initialSession, options = {}) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const progress = document.getElementById('module-chating-progress');
        const messages = document.getElementById('module-chating-messages');
        const input = document.getElementById('module-chating-input');
        const sendButton = document.getElementById('module-chating-send');

        if (!progress || !messages || !input || !sendButton) {
            return;
        }

        let completionHandled = !!initialSession.completado;

        const renderProgress = (session) => {
            const covered = Array.isArray(session.procesos_cubiertos) ? session.procesos_cubiertos : [];
            const pending = Array.isArray(session.procesos_pendientes) ? session.procesos_pendientes : [];
            progress.innerHTML = [
                ...covered.map((item) => `<span class="badge badge--ok">Cubierto: ${escapeHtml(item)}</span>`),
                ...pending.map((item) => `<span class="badge badge--mute">Pendiente: ${escapeHtml(item)}</span>`),
            ].join('');
        };

        const appendMessage = (role, text) => {
            messages.insertAdjacentHTML(
                'beforeend',
                `<div style="padding:12px 14px; border-radius:14px; background:${role === 'user' ? 'rgba(0,86,210,0.1)' : '#fff'}; border:1px solid ${role === 'user' ? 'rgba(0,86,210,0.1)' : 'var(--border-light)'}; color:var(--text-secondary); line-height:1.6;">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`
            );
            messages.scrollTop = messages.scrollHeight;
        };

        const setCompletedState = (completed) => {
            input.disabled = completed;
            sendButton.disabled = completed;
            if (completed) {
                input.placeholder = 'Sesion completada.';
                if (!completionHandled) {
                    completionHandled = true;
                    window.EducatIA.Components.showWebNotice?.('Módulo validado', 'Chating confirmó el dominio suficiente. Ya puedes avanzar al siguiente módulo.', 'success');
                    if (typeof options.onComplete === 'function') {
                        options.onComplete(module);
                    }
                    const courseId = Number(module?.curso_id || 0);
                    if (options.refreshCourseOnComplete !== false && courseId) {
                        window.setTimeout(() => this.renderPublished({ id: courseId }), 900);
                    }
                }
            }
        };

        renderProgress(initialSession);
        appendMessage('bot', initialSession.mensaje || 'Chating listo.');
        setCompletedState(!!initialSession.completado);

        const sendPrompt = async () => {
            const prompt = String(input.value || '').trim();
            if (!prompt || sendButton.disabled) {
                return;
            }

            appendMessage('user', prompt);
            input.value = '';
            sendButton.disabled = true;

            try {
                const session = await API.sendModuleChatingMessage(module.id, initialSession.session_id, prompt);
                renderProgress(session);
                appendMessage('bot', session.mensaje || 'Sin respuesta disponible.');
                setCompletedState(!!session.completado);
            } catch (error) {
                appendMessage('bot', error.message || 'No pude continuar la sesión de Chating en este momento.');
            } finally {
                if (!input.disabled) {
                    sendButton.disabled = false;
                    input.focus();
                }
            }
        };

        sendButton.addEventListener('click', sendPrompt);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendPrompt();
            }
        });
    },

    openQuiz: async function (courseId, quizId, course) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const panel = document.getElementById('quiz-attempt-panel');
        const courseHref = course
            ? window.EducatIA.Router.toUrl(window.EducatIA.Utils.courseUrl(course))
            : window.EducatIA.Router.toUrl(`/cursos/${courseId}`);
        if (!panel) {
            return;
        }

        const sampleQuestions = (quiz) => {
            const questions = Array.isArray(quiz.preguntas) ? [...quiz.preguntas] : [];
            const target = Number(quiz.objetivo_preguntas || 0);
            if (!target || target >= questions.length) {
                return questions;
            }
            return questions
                .map((question) => ({ question, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .slice(0, target)
                .sort((a, b) => (a.question.orden || 0) - (b.question.orden || 0) || Number(a.question.id) - Number(b.question.id))
                .map((item) => item.question);
        };

        const formatDuration = (minutes) => {
            const value = Number(minutes || 30);
            return value >= 60 ? `${Math.floor(value / 60)} h ${value % 60 ? `${value % 60} min` : ''}`.trim() : `${value} min`;
        };

        const renderFeedback = (items) => {
            if (!items.length) {
                return '<p class="text-small">No hay comentarios disponibles para este intento.</p>';
            }
            return items.map((item, index) => `
                <article class="course-quiz-feedback__item ${item.correcta ? 'is-correct' : 'is-wrong'}">
                    <div>
                        <strong>Pregunta ${index + 1}: ${item.correcta ? 'correcta' : 'por repasar'}</strong>
                        <p>${escapeHtml(item.pregunta || '')}</p>
                    </div>
                    <dl>
                        <div><dt>Tu respuesta</dt><dd>${escapeHtml(item.selected_option || 'Sin respuesta')}</dd></div>
                        <div><dt>Respuesta esperada</dt><dd>${escapeHtml(item.correct_option || 'No disponible')}</dd></div>
                    </dl>
                    ${item.retroalimentacion ? `<p class="course-quiz-feedback__note">${escapeHtml(item.retroalimentacion).replace(/\n/g, '<br>')}</p>` : ''}
                </article>
            `).join('');
        };

        const renderOverview = (quiz) => {
            const questionCount = Number(quiz.objetivo_preguntas || quiz.preguntas?.length || 0);
            panel.innerHTML = `
                <section class="course-quiz-assignment">
                    <div class="course-quiz-assignment__hero">
                        <div>
                            <span class="course-quiz-assignment__kicker">Tarea calificable</span>
                            <h2>${escapeHtml(quiz.titulo)}</h2>
                            <p>${escapeHtml(quiz.descripcion || 'Cierra este tema con una evaluación breve. Necesitas 9/10 para aprobar y avanzar con confianza.')}</p>
                            <button type="button" class="btn btn--primary" id="course-quiz-start-btn">Iniciar evaluación</button>
                        </div>
                        <div class="course-quiz-assignment__visual" aria-hidden="true">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div class="course-quiz-assignment__details">
                        <article>
                            <strong>Para aprobar</strong>
                            <span>9/10 mínimo requerido</span>
                        </article>
                        <article>
                            <strong>Duración</strong>
                            <span>${escapeHtml(formatDuration(quiz.duracion_minutos))}</span>
                        </article>
                        <article>
                            <strong>Intentos</strong>
                            <span>3 intentos cada 8 horas</span>
                        </article>
                        <article>
                            <strong>Preguntas</strong>
                            <span>${questionCount} por intento</span>
                        </article>
                    </div>
                </section>
            `;
            document.getElementById('course-quiz-start-btn')?.addEventListener('click', () => renderAttempt(quiz));
        };

        const renderAttempt = (quiz) => {
            const questions = sampleQuestions(quiz);
            const questionCount = questions.length;
            panel.innerHTML = `
                <section class="course-quiz-attempt">
                    <header class="course-quiz-attempt__top">
                        <div>
                            <a href="${courseHref}" class="course-quiz-attempt__back">Curso</a>
                            <h2>${escapeHtml(quiz.titulo)}</h2>
                            <p>Todas las preguntas valen 1 punto. Selecciona una respuesta por pregunta antes de enviar.</p>
                        </div>
                        <span>${questionCount} pregunta${questionCount === 1 ? '' : 's'}</span>
                    </header>
                    <div class="anti-cheat-banner" id="anti-cheat-banner">
                        <strong>Modo supervisado activo.</strong> Cambiar de pestaña, copiar, pegar o abrir el menú contextual genera alertas para el docente.
                    </div>
                    <form id="quiz-attempt-form" class="course-quiz-attempt__form">
                        ${questions.map((question, index) => `
                            <fieldset class="course-quiz-question">
                                <legend>
                                    <span>${index + 1}</span>
                                    <strong>${escapeHtml(question.texto)}</strong>
                                    <em>1 punto</em>
                                </legend>
                                <div class="course-quiz-question__options">
                                    ${(question.opciones || []).map((option, optionIndex) => `
                                        <label>
                                            <input type="radio" name="question-${question.id}" value="${optionIndex}">
                                            <span>${escapeHtml(option.texto || '')}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </fieldset>
                        `).join('')}
                        <div class="course-quiz-attempt__submit">
                            <button type="submit" class="btn btn--primary">Enviar evaluación</button>
                        </div>
                    </form>
                    ${window.EducatIA.Features?.ale === true && quiz.ai_teacher_enabled ? `
                        <aside class="course-quiz-teacher">
                            <div>
                                <strong>Bill en esta evaluación</strong>
                                <span>Solo responde sobre este tema y no resuelve por ti.</span>
                            </div>
                            <div id="quiz-teacher-messages" class="course-quiz-teacher__messages">
                                <div>Puedo darte una pista, explicar un concepto o ayudarte a descartar distractores sin revelar la respuesta directa.</div>
                            </div>
                            <div class="course-quiz-teacher__composer">
                                <input id="quiz-teacher-input" type="text" class="fi" placeholder="Pregunta sobre esta evaluación">
                                <button id="quiz-teacher-send" type="button" class="btn btn--outline btn--sm">Enviar</button>
                            </div>
                        </aside>
                    ` : ''}
                </section>
            `;

            this.startExamGuard(quizId);
            if (window.EducatIA.Features?.ale === true && quiz.ai_teacher_enabled) {
                this.bindQuizTeacherChat(quiz);
            }

            const form = document.getElementById('quiz-attempt-form');
            form?.addEventListener('submit', async (event) => {
                event.preventDefault();
                const answers = {};
                questions.forEach((question) => {
                    const checked = form.querySelector(`input[name="question-${question.id}"]:checked`);
                    if (checked) {
                        answers[String(question.id)] = Number(checked.value);
                    }
                });

                if (Object.keys(answers).length !== questions.length) {
                    window.EducatIA.Components.showWebNotice(
                        'Evaluación incompleta',
                        `Responde las ${questions.length} preguntas antes de enviar tu intento.`,
                        'info'
                    );
                    return;
                }

                try {
                    const result = await API.submitQuizAttempt(quizId, answers);
                    this.stopExamGuard();
                    const progress = await API.getCourseProgress(courseId).catch(() => null);
                    renderResult(quiz, result, progress);
                    syncQuizProgress(quiz, result, progress);
                } catch (error) {
                    window.EducatIA.Components.showWebNotice(
                        'Intento no enviado',
                        error.message || 'No fue posible enviar la evaluación. Conserva esta pantalla e inténtalo nuevamente.',
                        'error'
                    );
                }
            });
        };

        const nextAction = (progress, passed) => {
            if (!passed) {
                return { markup: `<a href="${courseHref}" class="btn btn--primary">Volver al curso</a>` };
            }

            const next = progress?.siguiente_actividad;
            if (next?.tipo === 'leccion') {
                const href = window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(
                    course || { id: courseId, titulo: `curso-${courseId}` },
                    next
                ));
                return { markup: `<a href="${href}" class="btn btn--primary">Ir a la siguiente lección</a>` };
            }
            if (next?.tipo === 'quiz') {
                const href = window.EducatIA.Router.toUrl(window.EducatIA.Utils.quizUrl(
                    course || { id: courseId, titulo: `curso-${courseId}` },
                    next
                ));
                return { markup: `<a href="${href}" class="btn btn--primary">Ir a la siguiente evaluación</a>` };
            }
            if (next?.tipo === 'chating') {
                return {
                    markup: '<button type="button" class="btn btn--primary" id="course-quiz-next-chating">Completar cierre del módulo</button>',
                    moduleId: Number(next.modulo_id || next.id),
                };
            }
            return { markup: `<a href="${courseHref}" class="btn btn--primary">Volver al curso</a>` };
        };

        const syncQuizProgress = (quiz, result, progress) => {
            if (!progress) return;
            const passed = typeof result.aprobado === 'boolean'
                ? result.aprobado
                : Number(result.calificacion || 0) >= 9;
            const completed = Number(progress.actividades_completadas || 0);
            const total = Number(progress.total_actividades || 0);
            const percent = Number(progress.porcentaje || 0);

            document.querySelectorAll('.lesson-workspace__progress').forEach((container) => {
                const label = container.querySelector(':scope > span');
                const bar = container.querySelector('.lesson-workspace__progress-bar > span');
                if (label) label.textContent = `${completed}/${total} elementos completados - ${percent}% completado`;
                if (bar) bar.style.width = `${percent}%`;
            });

            if (!passed) return;
            const status = document.querySelector('.lesson-stage__status');
            if (status) {
                status.classList.add('completed');
                status.textContent = 'Aprobado';
            }
            document.querySelectorAll(`[data-open-quiz="${quiz.id}"]`).forEach((item) => {
                item.dataset.state = 'completed';
                item.classList.add('completed');
                item.querySelector('.lesson-rail__item-state')?.replaceChildren('Aprobado');
            });
        };

        const renderResult = (quiz, result, progress) => {
            const score = Number(result.calificacion || 0);
            const percent = Math.round(score * 10);
            const passed = typeof result.aprobado === 'boolean' ? result.aprobado : score >= 9;
            const feedbackItems = Array.isArray(result.retroalimentacion) ? result.retroalimentacion : [];
            const action = nextAction(progress, passed);
            panel.innerHTML = `
                <section class="course-quiz-result">
                    <div class="course-quiz-result__hero">
                        <span>${passed ? 'Aprobaste' : 'Necesita repaso'}</span>
                        <h2>${escapeHtml(quiz.titulo)}</h2>
                        <p>${passed ? 'Buen cierre de tema. Revisa los comentarios y sigue al siguiente elemento.' : 'Necesitas al menos 9/10 para acreditar. Revisa los comentarios y vuelve a intentarlo cuando estés listo.'}</p>
                    </div>
                    <div class="course-quiz-result__score ${passed ? 'is-pass' : 'is-review'}">
                        <strong>${percent}%</strong>
                        <span>Calificación ${score}/10</span>
                    </div>
                    <div class="course-quiz-result__actions">
                        <button type="button" class="btn btn--outline" id="course-quiz-feedback-btn">Ver comentarios</button>
                        <button type="button" class="btn btn--outline" id="course-quiz-retry-btn">Probar de nuevo</button>
                        ${action.markup}
                    </div>
                    <div id="course-quiz-feedback-list" class="course-quiz-feedback" hidden>
                        ${renderFeedback(feedbackItems)}
                    </div>
                </section>
            `;
            document.getElementById('course-quiz-feedback-btn')?.addEventListener('click', () => {
                const list = document.getElementById('course-quiz-feedback-list');
                if (!list) {
                    return;
                }
                list.hidden = !list.hidden;
            });
            document.getElementById('course-quiz-retry-btn')?.addEventListener('click', () => renderAttempt(quiz));
            document.getElementById('course-quiz-next-chating')?.addEventListener('click', () => {
                if (action.moduleId) this.openModuleChating(courseId, action.moduleId);
            });
        };

        this.stopExamGuard();
        panel.innerHTML = `<div class="analytics-card" style="min-height:96px;padding:20px;display:grid;place-items:center;">${window.EducatIA.Components.renderLoading({ label: 'Cargando evaluación', compact: true })}</div>`;

        try {
            const quiz = await API.getQuiz(quizId);
            renderOverview(quiz);
        } catch (error) {
            this.stopExamGuard();
            panel.innerHTML = `
                <div class="analytics-card" style="padding: 20px; text-align:center;">
                    <p class="text-small" style="color: var(--text-secondary);">${escapeHtml(error.message || 'No se pudo cargar la evaluación.')}</p>
                </div>
            `;
        }
    },

    bindQuizTeacherChat: function (quiz) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const messages = document.getElementById('quiz-teacher-messages');
        const input = document.getElementById('quiz-teacher-input');
        const sendButton = document.getElementById('quiz-teacher-send');
        const history = [];

        if (!messages || !input || !sendButton) {
            return;
        }

        const appendMessage = (role, text) => {
            messages.insertAdjacentHTML(
                'beforeend',
                `<div style="padding:10px 12px; border-radius:12px; background:${role === 'user' ? 'rgba(0,86,210,0.1)' : '#fff'}; color:var(--text-secondary);">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`
            );
            messages.scrollTop = messages.scrollHeight;
        };

        const sendPrompt = async () => {
            const prompt = String(input.value || '').trim();
            if (!prompt) {
                return;
            }

            appendMessage('user', prompt);
            history.push(`Alumno: ${prompt}`);
            input.value = '';
            sendButton.disabled = true;

            try {
                const response = await API.quizTeacherChat(quiz.id, prompt, history.slice(-6));
                const answer = response.respuesta || 'No tengo una respuesta lista ahora mismo.';
                history.push(`Bill: ${answer}`);
                appendMessage('bot', answer);
            } catch (error) {
                appendMessage('bot', error.message || 'No pude responder sobre esta evaluación en este momento.');
            } finally {
                sendButton.disabled = false;
                input.focus();
            }
        };

        sendButton.addEventListener('click', sendPrompt);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendPrompt();
            }
        });
    },

    startExamGuard: function (quizId) {
        const form = document.getElementById('quiz-attempt-form');
        const banner = document.getElementById('anti-cheat-banner');
        const API = window.EducatIA.API;

        if (!form || !banner) {
            return;
        }

        const updateBanner = (message, danger) => {
            const count = this.antiCheatState.violations;
            banner.classList.toggle('anti-cheat-banner--danger', !!danger);
            banner.innerHTML = `<strong>${count ? count + ' alerta' + (count === 1 ? '' : 's') + ' registrada' + (count === 1 ? '' : 's') + '.</strong>' : '<strong>Modo supervisado activo.</strong>'} ${message}`;
        };

        const reportEvent = async (evento, detalles) => {
            this.antiCheatState.violations += 1;
            updateBanner(detalles, true);
            try {
                await API.reportAntiCheat({ quiz_id: quizId, evento, detalles });
            } catch (error) {
                console.warn('No se pudo registrar evento anti-cheat', error);
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                reportEvent('tab_switch', 'Se detectó un cambio de pestaña o minimización durante el examen.');
            }
        };
        const onCopy = (event) => {
            event.preventDefault();
            reportEvent('copy_attempt', 'Se bloqueó un intento de copiar contenido del examen.');
        };
        const onCut = (event) => {
            event.preventDefault();
            reportEvent('cut_attempt', 'Se bloqueó un intento de cortar contenido del examen.');
        };
        const onPaste = (event) => {
            event.preventDefault();
            reportEvent('paste_attempt', 'Se bloqueó un intento de pegar contenido en el examen.');
        };
        const onContextMenu = (event) => {
            event.preventDefault();
            reportEvent('context_menu', 'Se bloqueó la apertura del menú contextual durante el examen.');
        };
        const onSelectStart = (event) => {
            event.preventDefault();
        };
        const onKeyDown = (event) => {
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(key)) {
                event.preventDefault();
                reportEvent('shortcut_blocked', `Se bloqueó el atajo ${(event.ctrlKey || event.metaKey) ? 'Ctrl/Cmd+' : ''}${key.toUpperCase()} durante el examen.`);
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        document.addEventListener('keydown', onKeyDown);
        form.addEventListener('copy', onCopy);
        form.addEventListener('cut', onCut);
        form.addEventListener('paste', onPaste);
        form.addEventListener('contextmenu', onContextMenu);
        form.addEventListener('selectstart', onSelectStart);

        this.antiCheatState = {
            quizId,
            violations: 0,
            cleanup: () => {
                document.removeEventListener('visibilitychange', onVisibilityChange);
                document.removeEventListener('keydown', onKeyDown);
                form.removeEventListener('copy', onCopy);
                form.removeEventListener('cut', onCut);
                form.removeEventListener('paste', onPaste);
                form.removeEventListener('contextmenu', onContextMenu);
                form.removeEventListener('selectstart', onSelectStart);
            },
        };
    },

    stopExamGuard: function () {
        if (this.antiCheatState.cleanup) {
            this.antiCheatState.cleanup();
        }
        this.antiCheatState = { cleanup: null, quizId: null, violations: 0 };
    }
};
