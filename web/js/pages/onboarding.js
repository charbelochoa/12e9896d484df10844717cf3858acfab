/* ================================================================
   educatIA - Student onboarding
   Personalizes the first learning experience before diagnostic work.
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Onboarding = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const Components = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;
    const UAEMEX_CAREERS = [
        'Licenciatura en Administración',
        'Licenciatura en Administración y Promoción de la Obra Urbana',
        'Licenciatura en Antropología Social',
        'Licenciatura en Arqueología',
        'Licenciatura en Arquitectura',
        'Licenciatura en Arte Digital',
        'Licenciatura en Artes Plásticas',
        'Licenciatura en Biología',
        'Licenciatura en Biotecnología',
        'Licenciatura en Ciencias Ambientales',
        'Licenciatura en Ciencias de la Información Documental',
        'Licenciatura en Ciencias Políticas y Administración Pública',
        'Licenciatura en Comunicación',
        'Licenciatura en Contaduría',
        'Licenciatura en Cultura Física y Deporte',
        'Licenciatura en Derecho',
        'Licenciatura en Diseño Gráfico',
        'Licenciatura en Diseño Industrial',
        'Licenciatura en Economía',
        'Licenciatura en Educación',
        'Licenciatura en Enfermería',
        'Licenciatura en Enseñanza de Inglés',
        'Licenciatura en Estudios Cinematográficos',
        'Licenciatura en Filosofía',
        'Licenciatura en Física',
        'Licenciatura en Gastronomía',
        'Licenciatura en Geografía',
        'Licenciatura en Geología Ambiental y Recursos Hídricos',
        'Licenciatura en Gerontología',
        'Licenciatura en Gestión de la Información en Redes Sociales',
        'Licenciatura en Historia',
        'Licenciatura en Informática Administrativa',
        'Licenciatura en Lenguas',
        'Licenciatura en Letras Latinoamericanas',
        'Licenciatura en Logística',
        'Licenciatura en Medios Alternos de Solución de Conflictos',
        'Licenciatura en Mercadotecnia',
        'Licenciatura en Música',
        'Licenciatura en Negocios Internacionales',
        'Licenciatura en Nutrición',
        'Licenciatura en Planeación Territorial',
        'Licenciatura en Psicología',
        'Licenciatura en Química',
        'Licenciatura en Relaciones Económicas Internacionales',
        'Licenciatura en Seguridad Ciudadana',
        'Licenciatura en Sociología',
        'Licenciatura en Terapia Física',
        'Licenciatura en Terapia Ocupacional',
        'Licenciatura en Trabajo Social',
        'Licenciatura en Turismo',
        'Médico Cirujano',
        'Cirujano Dentista',
        'Ingeniería Agronómica Industrial',
        'Ingeniería Civil',
        'Ingeniería en Computación',
        'Ingeniería en Electrónica',
        'Ingeniería en Inteligencia Artificial',
        'Ingeniería en Plásticos',
        'Ingeniería en Producción Industrial',
        'Ingeniería en Sistemas Energéticos Sustentables',
        'Ingeniería en Sistemas y Comunicaciones',
        'Ingeniería en Software',
        'Ingeniería Industrial',
        'Ingeniería Mecánica',
        'Ingeniería Petroquímica',
        'Químico Farmacéutico Biólogo',
        'Químico en Alimentos'
    ];

    function fieldValue(id) {
        return String(document.getElementById(id)?.value || '').trim();
    }

    function selectedValue(name) {
        return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
    }

    function careerOptions(selected) {
        return UAEMEX_CAREERS.map((career) => {
            const isSelected = career === selected ? ' selected' : '';
            return `<option value="${esc(career)}"${isSelected}>${esc(career)}</option>`;
        }).join('');
    }

    function cssEscape(value) {
        if (window.CSS?.escape) {
            return window.CSS.escape(value);
        }
        return String(value).replace(/"/g, '\\"');
    }

    async function render() {
        if (!Components().requireAuth('alumno')) {
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = Components().renderLoadingBlock('Preparando tu experiencia');

        let existing = null;
        try {
            existing = await API().getOnboarding().catch(() => null);
        } catch {
            existing = null;
        }

        const locked = false;
        const name = Components().userState.name || 'Estudiante';
        const extras = existing?.respuestas_extra || {};

        app.innerHTML = `
            <div class="onboarding-page">
                <section class="onboarding-banner">
                    <div class="onboarding-banner__copy">
                        <span class="course-detail__section-kicker">Inicio personalizado</span>
                        <h1>Tu ruta EXANI-II empieza con contexto.</h1>
                        <p>Responde unas preguntas breves para ordenar tu objetivo, tu carrera UAEMex y el ritmo con el que quieres estudiar.</p>
                        <div class="onboarding-banner__metrics" aria-label="Proceso inicial">
                            <span><strong>1</strong> Perfil</span>
                            <span><strong>2</strong> Diagnóstico</span>
                            <span><strong>3</strong> Plan</span>
                        </div>
                    </div>
                    <div class="onboarding-banner__media" aria-hidden="true">
                        <img src="assets/images/generated/educatia-study-room.webp" alt="">
                    </div>
                </section>

                <section class="onboarding-shell">
                    <form class="onboarding-card" id="student-onboarding-form">
                        <div class="onboarding-card__head">
                            <span>Bienvenido, ${esc(name.split(' ')[0] || name)}.</span>
                            <h2>Personaliza tu ruta</h2>
                            <p>${locked ? 'Para guardar tu ruta necesitas activar tu suscripción. Puedes revisar el formulario y continuar cuando tengas acceso premium.' : 'Responde con calma. Puedes editar estas respuestas después desde tu perfil.'}</p>
                        </div>

                        <div class="onboarding-grid">
                            <label>
                                <span>Que eres?</span>
                                <select id="ob-perfil" required ${locked ? 'disabled' : ''}>
                                    <option value="">Selecciona una opción</option>
                                    <option value="estudiante" ${extras.perfil === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                                    <option value="trabajador" ${extras.perfil === 'trabajador' ? 'selected' : ''}>Trabajador</option>
                                    <option value="estudiante y trabajador" ${extras.perfil === 'estudiante y trabajador' ? 'selected' : ''}>Estudiante y trabajador</option>
                                    <option value="aspirante independiente" ${extras.perfil === 'aspirante independiente' ? 'selected' : ''}>Aspirante independiente</option>
                                </select>
                            </label>

                            <label>
                                <span>Objetivo principal</span>
                                <select id="ob-objetivo" required ${locked ? 'disabled' : ''}>
                                    <option value="">Selecciona una opción</option>
                                    <option value="ingresar a la universidad">Ingresar a la universidad</option>
                                    <option value="mejorar mi puntaje">Mejorar mi puntaje</option>
                                    <option value="ordenar mi estudio">Ordenar mi estudio</option>
                                    <option value="reforzar materias difíciles">Reforzar materias difíciles</option>
                                </select>
                            </label>

                            <label>
                                <span>Carrera que quieres estudiar en UAEMex</span>
                                <select id="ob-carrera" required ${locked ? 'disabled' : ''}>
                                    <option value="">Selecciona una carrera</option>
                                    ${careerOptions(existing?.carrera_interes || '')}
                                </select>
                            </label>

                            <label>
                                <span>Universidad objetivo</span>
                                <input id="ob-universidad" type="text" value="${esc(existing?.universidad_objetivo || 'UAEMex')}" ${locked ? 'disabled' : ''}>
                            </label>

                            <label>
                                <span>Área que más te preocupa</span>
                                <select id="ob-area" ${locked ? 'disabled' : ''}>
                                    <option value="">Selecciona una opción</option>
                                    <option value="pensamiento matemático">Pensamiento matemático</option>
                                    <option value="comprensión lectora">Comprensión lectora</option>
                                    <option value="redacción indirecta">Redacción indirecta</option>
                                    <option value="módulos disciplinares">Módulos disciplinares</option>
                                    <option value="tiempo de examen">Administrar el tiempo del examen</option>
                                </select>
                            </label>
                        </div>

                        <fieldset class="onboarding-choice">
                            <legend>¿Cuánto tiempo puedes estudiar por semana?</legend>
                            <label><input type="radio" name="ob-ritmo" value="3 a 5 horas" ${locked ? 'disabled' : ''}> 3 a 5 horas</label>
                            <label><input type="radio" name="ob-ritmo" value="6 a 9 horas" ${locked ? 'disabled' : ''}> 6 a 9 horas</label>
                            <label><input type="radio" name="ob-ritmo" value="10 horas o más" ${locked ? 'disabled' : ''}> 10 horas o más</label>
                        </fieldset>

                        <fieldset class="onboarding-choice">
                            <legend>¿Cómo prefieres aprender?</legend>
                            <label><input type="radio" name="ob-formato" value="explicación breve y práctica" ${locked ? 'disabled' : ''}> Explicación breve y práctica</label>
                            <label><input type="radio" name="ob-formato" value="ejemplos paso a paso" ${locked ? 'disabled' : ''}> Ejemplos paso a paso</label>
                            <label><input type="radio" name="ob-formato" value="lectura completa y resumen" ${locked ? 'disabled' : ''}> Lectura completa y resumen</label>
                        </fieldset>

                        <label class="onboarding-notes">
                            <span>Cuéntanos algo que debamos considerar</span>
                            <textarea id="ob-meta" rows="4" placeholder="Ej. Trabajo por las tardes, me cuestan las fracciones, quiero entrar a Medicina..." ${locked ? 'disabled' : ''}>${esc(existing?.meta_estudio || '')}</textarea>
                        </label>

                        <div id="onboarding-msg" class="onboarding-msg"></div>

                        <div class="onboarding-actions">
                            <a href="#/explorar" class="btn btn--outline">Explorar cursos</a>
                            ${locked
                                ? '<a href="#/explorar" class="btn btn--primary">Ver acceso premium</a>'
                                : '<button type="submit" class="btn btn--primary" id="onboarding-submit">Guardar y continuar</button>'}
                        </div>
                    </form>
                </section>
            </div>
        `;

        if (existing?.objetivo) {
            const objetivo = document.getElementById('ob-objetivo');
            if (objetivo) objetivo.value = existing.objetivo;
        }
        if (existing?.area_interes) {
            const area = document.getElementById('ob-area');
            if (area) area.value = existing.area_interes;
        }
        if (extras.ritmo) {
            const input = document.querySelector(`input[name="ob-ritmo"][value="${cssEscape(extras.ritmo)}"]`);
            if (input) input.checked = true;
        }
        if (extras.formato) {
            const input = document.querySelector(`input[name="ob-formato"][value="${cssEscape(extras.formato)}"]`);
            if (input) input.checked = true;
        }

        const form = document.getElementById('student-onboarding-form');
        const msg = document.getElementById('onboarding-msg');
        const submit = document.getElementById('onboarding-submit');
        if (!form || locked) {
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Guardando...';
            }
            if (msg) msg.textContent = '';

            try {
                await API().saveOnboarding({
                    objetivo: fieldValue('ob-objetivo'),
                    carrera_interes: fieldValue('ob-carrera'),
                    universidad_objetivo: fieldValue('ob-universidad') || 'UAEMex',
                    area_interes: fieldValue('ob-area'),
                    meta_estudio: fieldValue('ob-meta'),
                    respuestas_extra: {
                        perfil: fieldValue('ob-perfil'),
                        ritmo: selectedValue('ob-ritmo'),
                        formato: selectedValue('ob-formato'),
                    },
                });
                Router().navigate('/dashboard');
            } catch (error) {
                if (msg) msg.textContent = error.message || 'No se pudo guardar tu personalización.';
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = 'Guardar y continuar';
                }
            }
        });
    }

    const PROGRAMS = {
        'EXANI-I y EXANI-II': 'exani',
        'AI Engineer': 'ai_engineer',
        'Machine Learning For AI': 'machine_learning',
        'Deep Learning For AI': 'deep_learning',
        'Transformers and Multi-Modal Models': 'transformers_multimodal',
    };

    function questionsForProgram(questions, answers) {
        const selected = PROGRAMS[answers.programa];
        if (!selected || selected === 'exani') return questions;
        return questions.filter(q => q.id !== 'carrera').map(q => {
            if (q.id === 'objetivo') return {...q, options: ['Aprender fundamentos de IA', 'Desarrollar proyectos', 'Aplicar IA en mi trabajo', 'Profundizar mi formación']};
            if (q.id === 'materias_dificiles') return {...q, options: ['Python', 'Álgebra lineal', 'Probabilidad y estadística', 'Machine Learning', 'Deep Learning', 'Evaluación de modelos']};
            if (q.id === 'enfoque') return {...q, options: ['Teoría', 'Práctica con código', 'Proyectos', 'Evaluación y reproducibilidad']};
            return q;
        });
    }

    function localQuestionFlow() {
        return [
            { id: 'programa', type: 'multiple', label: '¿Qué programa quieres estudiar?', options: Object.keys(PROGRAMS) },
            { id: 'objetivo', type: 'multiple', label: '¿Cuál es tu objetivo principal?', options: ['Entrar a la universidad', 'Subir mi puntaje', 'Ordenar mi estudio', 'Reforzar materias difíciles'] },
            { id: 'perfil', type: 'multiple', label: '¿Qué opción describe mejor tu situación actual?', options: ['Estudiante', 'Trabajador', 'Estudiante y trabajador', 'Aspirante independiente'] },
            { id: 'carrera', type: 'select', label: '¿Qué carrera quieres estudiar?', options: UAEMEX_CAREERS },
            { id: 'materias_dificiles', type: 'multiselect', label: '¿Qué áreas te gustaría reforzar primero?', options: ['Administración', 'Aritmética', 'Biología', 'Cálculo', 'Ciencias de la Salud', 'Ciencias experimentales', 'Ciencias sociales', 'Comprensión lectora', 'Derecho', 'Economía', 'Filosofía', 'Física', 'Historia', 'Literatura', 'Matemáticas financieras', 'Pensamiento matemático', 'Premedicina', 'Probabilidad y estadística', 'Psicología', 'Química', 'Redacción indirecta'] },
            { id: 'enfoque', type: 'multiselect', label: '¿Qué tipo de preparación quieres priorizar?', options: ['EXANI-II', 'Medicina', 'Ingeniería', 'Salud', 'Lectura', 'Matemáticas', 'Simulacros'] },
            { id: 'ritmo', type: 'multiple', label: '¿Cuánto tiempo puedes dedicar al estudio cada semana?', options: ['3 a 5 horas', '6 a 9 horas', '10 horas o más'] },
        ];
    }

    const QUESTION_ORDER = ['programa', 'objetivo', 'perfil', 'carrera', 'materias_dificiles', 'enfoque', 'ritmo'];
    const QUESTION_COPY = {
        programa: { label: '¿Qué programa quieres estudiar?', help: 'Elegiremos preguntas y recursos acordes con tu formación.' },
        objetivo: {
            label: '¿Cuál es tu objetivo principal?',
            help: 'Elegiremos una ruta inicial que responda a la meta que quieres alcanzar.',
        },
        perfil: {
            label: '¿Qué opción describe mejor tu situación actual?',
            help: 'Esto nos ayuda a proponerte un ritmo compatible con tus responsabilidades.',
        },
        carrera: {
            label: '¿Qué carrera quieres estudiar?',
            help: 'Usaremos tu elección para destacar los módulos disciplinares más relevantes.',
        },
        materias_dificiles: {
            label: '¿Qué áreas te gustaría reforzar primero?',
            help: 'Puedes elegir más de una. Comenzaremos por las que requieren mayor atención.',
        },
        enfoque: {
            label: '¿Qué tipo de preparación quieres priorizar?',
            help: 'Puedes combinar intereses para construir una ruta más precisa.',
        },
        ritmo: {
            label: '¿Cuánto tiempo puedes dedicar al estudio cada semana?',
            help: 'Elige un compromiso realista; podrás ajustar tu ritmo más adelante.',
        },
    };

    function iconSvg(name) {
        const paths = {
            rocket: '<path d="M14 14 5 19l5-5m4-4 5-5c3-3 6-2 6-2s1 3-2 6l-5 5m-4-4 4 4m-8 2-2 5 5-2"/><circle cx="19" cy="7" r="1.5"/>',
            trend: '<path d="M4 20 11 13l5 5 8-10"/><path d="M17 8h7v7"/>',
            route: '<circle cx="6" cy="20" r="2"/><circle cx="22" cy="6" r="2"/><path d="M8 20c8 0 3-12 12-12"/>',
            focus: '<circle cx="14" cy="14" r="9"/><circle cx="14" cy="14" r="4"/><path d="M14 2v3m0 18v3M2 14h3m18 0h3"/>',
            student: '<path d="m3 10 11-5 11 5-11 5-11-5Z"/><path d="M7 13v6c4 3 10 3 14 0v-6"/>',
            briefcase: '<rect x="4" y="8" width="20" height="15" rx="2"/><path d="M10 8V5h8v3m-14 7h20M12 14h4"/>',
            split: '<path d="M6 4v6c0 3 2 5 5 5h11"/><path d="m18 11 4 4-4 4"/><path d="M6 24v-5"/>',
            compass: '<circle cx="14" cy="14" r="11"/><path d="m18 9-3 7-7 3 3-7 7-3Z"/>',
            clock: '<circle cx="14" cy="14" r="11"/><path d="M14 8v7l5 3"/>',
            layers: '<path d="m4 10 10-6 10 6-10 6L4 10Z"/><path d="m4 15 10 6 10-6M4 20l10 6 10-6"/>',
            book: '<path d="M4 5h8c2 0 3 1 3 3v16c0-2-1-3-3-3H4V5Z"/><path d="M24 5h-8c-1 0-1 .5-1 2v17c0-2 1-3 3-3h6V5Z"/>',
            spark: '<path d="m14 3 2.2 6.8L23 12l-6.8 2.2L14 21l-2.2-6.8L5 12l6.8-2.2L14 3Z"/>',
        };
        return `<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">${paths[name] || paths.spark}</svg>`;
    }

    function optionIcon(questionId, index) {
        const icons = {
            objetivo: ['rocket', 'trend', 'route', 'focus'],
            perfil: ['student', 'briefcase', 'split', 'compass'],
            ritmo: ['clock', 'layers', 'spark'],
            materias_dificiles: ['book', 'focus', 'layers', 'spark'],
            enfoque: ['compass', 'route', 'focus', 'rocket'],
        };
        const choices = icons[questionId] || ['book', 'focus', 'route', 'spark'];
        return iconSvg(choices[index % choices.length]);
    }

    function prepareQuestions(rawQuestions) {
        const questions = (Array.isArray(rawQuestions) && rawQuestions.length ? rawQuestions : localQuestionFlow())
            .filter((question) => window.EducatIA.Features?.ale === true || question.id !== 'profesor')
            .map((question) => ({
                ...question,
                id: question.id === 'materias_difíciles' ? 'materias_dificiles' : question.id,
            }));
        if (!questions.some((question) => question.id === 'programa')) questions.push(localQuestionFlow()[0]);
        if (!questions.some((question) => question.id === 'carrera')) {
            questions.push({ id: 'carrera', type: 'select', label: '¿Qué carrera quieres estudiar?', options: UAEMEX_CAREERS });
        }
        return questions.sort((left, right) => {
            const leftOrder = QUESTION_ORDER.indexOf(left.id);
            const rightOrder = QUESTION_ORDER.indexOf(right.id);
            return (leftOrder < 0 ? 99 : leftOrder) - (rightOrder < 0 ? 99 : rightOrder);
        });
    }

    function normalizeAnswer(value) {
        if (Array.isArray(value)) return value;
        return String(value || '').trim();
    }

    function renderQuestionInput(question, answers) {
        const current = answers[question.id] || (question.type === 'multiselect' ? [] : '');
        const options = question.options || [];
        if (options.length <= 9) {
            const isMultiple = question.type === 'multiselect';
            const isFeatured = !isMultiple && options.length <= 4;
            return `
                <div class="personalization-stage__options ${isFeatured ? 'personalization-stage__options--featured' : 'personalization-stage__options--compact'}" role="group" aria-label="Opciones de respuesta">
                    ${options.map((option, index) => {
                        const selected = isMultiple ? Array.isArray(current) && current.includes(option) : current === option;
                        return `
                            <button class="personalization-stage__option${isFeatured ? ' personalization-stage__option--featured' : ''}${selected ? ' is-selected' : ''}" type="button" data-personalization-option="${esc(option)}" aria-pressed="${selected}">
                                <span class="personalization-stage__option-art">${question.id === 'programa' ? '' : optionIcon(question.id, index)}</span>
                                <span class="personalization-stage__option-copy">
                                    <strong>${esc(option)}</strong>
                                    <small>${isMultiple ? 'Puedes combinar esta opción' : 'Seleccionar esta respuesta'}</small>
                                </span>
                                <span class="personalization-stage__option-check" aria-hidden="true">✓</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
        }
        return `
            <label class="personalization-stage__select-wrap" for="personalization-answer">
                <span>Selecciona una carrera</span>
                <select class="personalization-stage__select" id="personalization-answer" data-personalization-select aria-label="Selecciona una respuesta">
                <option value="">Selecciona una opción</option>
                ${options.map((option) => `<option value="${esc(option)}"${current === option ? ' selected' : ''}>${esc(option)}</option>`).join('')}
                </select>
            </label>
        `;
    }

    function renderRecommendations(app, recommendations, program = null) {
        const programLabel = Object.keys(PROGRAMS).find(label => PROGRAMS[label] === program);
        const isAi = Boolean(programLabel && program !== 'exani');
        const cards = (recommendations || []).slice(0, 6).map((course) => `
            <article class="personalization-recommendation">
                ${course.image_url ? `<img src="${esc(API().resolveAssetUrl(course.image_url))}" alt="" loading="lazy" decoding="async">` : ''}
                <div>
                    <span>${isAi ? 'Programa elegido' : `${Number(course.score || 0)}% afinidad`}</span>
                    <h3>${esc(course.titulo)}</h3>
                    <p>${esc((course.reasons || []).join(' · ') || 'Curso recomendado para tu ruta.')}</p>
                    <a href="${Router().toUrl(window.EducatIA.Utils.courseUrl({ id: course.course_id, titulo: course.titulo }))}">Ver curso</a>
                </div>
            </article>
        `).join('');
        app.innerHTML = `
            <div class="personalization-page">
                <section class="personalization-complete">
                    <span class="course-detail__section-kicker">Ruta personalizada</span>
                    <h1>Listo. Ya tenemos tu primer mapa de estudio.</h1>
                    <p>Usaremos estas respuestas para priorizar los cursos y prácticas que mejor corresponden a tu objetivo.</p>
                    <div class="personalization-recommendations">
                        ${cards || (isAi ? `<p>Guardamos tu interés en ${esc(programLabel)}. Este programa todavía no tiene cursos publicados. Puedes consultar su temario y modalidad mientras completamos la revisión del contenido.</p>` : '<p>Aún no hay recomendaciones disponibles, pero tu ruta quedó guardada.</p>')}
                    </div>
                    <div class="personalization-actions">
                        <a class="btn btn--primary" href="${Router().toUrl('/dashboard')}">Ir a mi aprendizaje</a>
                        <a class="btn btn--outline" href="${Router().toUrl(isAi ? '/info/formacion-ia' : '/explorar')}">${isAi ? 'Consultar programas de IA' : 'Explorar catálogo'}</a>
                    </div>
                </section>
            </div>
        `;
    }

    function renderPlanOffer(app, recommendations) {
        app.innerHTML = `
            <div class="personalization-page personalization-page--offer">
                <section class="personalization-offer" aria-labelledby="personalization-offer-title">
                    <span class="personalization-offer__brand">educatIA · TU RUTA ESTÁ LISTA</span>
                    <div class="personalization-offer__hero">
                        <div>
                            <span class="course-detail__section-kicker">Siguiente paso</span>
                            <h1 id="personalization-offer-title">Elige cómo quieres continuar tu preparación.</h1>
                            <p>Activa tu acceso para estudiar con cursos, práctica y seguimiento. Puedes continuar sin plan y explorar primero.</p>
                        </div>
                        <div class="personalization-offer__visual" aria-hidden="true"><span>EXANI</span><i>II</i></div>
                    </div>
                    <ul class="personalization-offer__benefits">
                        <li>Ruta recomendada según tus respuestas</li>
                        <li>Práctica guiada, simulacros y resultados</li>
                        <li>Acceso desde cualquier dispositivo</li>
                    </ul>
                    <div class="personalization-offer__actions">
                        <a class="btn btn--outline" href="${Router().toUrl('/checkout?plan_id=prepa-basico')}">Plan Básico Preparatoria</a>
                        <a class="btn btn--primary" href="${Router().toUrl('/checkout?plan_id=educatia-mensual')}">Plan EXANI-II · $399 MXN/mes</a>
                    </div>
                    <button type="button" class="personalization-offer__decline" data-personalization-decline>No, gracias. Quiero explorar primero.</button>
                </section>
            </div>
        `;
        document.querySelector('[data-personalization-decline]')?.addEventListener('click', () => renderRecommendations(app, recommendations));
    }

    async function renderFlow() {
        if (!Components().requireAuth('alumno')) return;

        const app = document.getElementById('app');
        app.innerHTML = Components().renderLoadingBlock('Preparando preguntas');
        const state = { index: 0, answers: {}, questions: localQuestionFlow(), recommendations: [] };
        const firstName = String(Components().userState.name || 'Estudiante').trim().split(/\s+/)[0] || 'Estudiante';

        try {
            const remote = await API().getPersonalizationQuestions();
            if (Array.isArray(remote?.questions) && remote.questions.length) {
                state.questions = prepareQuestions(remote.questions);
            }
            state.recommendations = remote?.recommendations || [];
        } catch {
            // If the user is still waiting for the webhook, keep the experience available locally.
        }
        state.questions = prepareQuestions(state.questions);

        function persistCurrent() {
            const question = state.questions[state.index];
            if (!question) return;
            if (question.type === 'multiselect' || (question.options || []).length <= 8) return;
            state.answers[question.id] = normalizeAnswer(document.getElementById('personalization-answer')?.value);
        }

        const baseQuestions = state.questions;
        function paint() {
            state.questions = questionsForProgram(baseQuestions, state.answers);
            for (const item of state.questions) {
                const answer = state.answers[item.id];
                if (Array.isArray(answer)) state.answers[item.id] = answer.filter(value => item.options.includes(value));
                else if (answer && !item.options.includes(answer)) delete state.answers[item.id];
            }
            const question = state.questions[state.index];
            const progress = Math.round((state.index / state.questions.length) * 100);
            const copy = QUESTION_COPY[question.id] || {
                label: question.label,
                help: 'Tu respuesta nos ayudará a personalizar las recomendaciones iniciales.',
            };
            const value = state.answers[question.id];
            const answerIsEmpty = Array.isArray(value) ? value.length === 0 : !value;
            app.innerHTML = `
                <div class="personalization-stage">
                    <header class="personalization-stage__header">
                        <a class="personalization-stage__brand" href="${Router().toUrl('/')}" aria-label="educatIA, inicio">
                            <span class="personalization-stage__brand-clip" aria-hidden="true"><img src="assets/new_logo/new_logo.png" alt=""></span>
                        </a>
                        <button type="button" class="personalization-stage__exit" data-personalization-exit>Salir</button>
                    </header>

                    <main class="personalization-stage__main">
                        <section class="personalization-stage__intro">
                            <p>Hola, ${esc(firstName)}:</p>
                            <h1>Cuéntanos un poco sobre ti para preparar una ruta acorde a tu objetivo.</h1>
                        </section>

                        <section class="personalization-stage__question" aria-labelledby="personalization-question-title">
                            <span class="personalization-stage__step">Pregunta ${state.index + 1} de ${state.questions.length}</span>
                            <h2 id="personalization-question-title">${esc(copy.label || question.label)}</h2>
                            <p>${esc(copy.help)}</p>
                            ${renderQuestionInput(question, state.answers)}
                            <p class="personalization-stage__message" id="personalization-message" role="alert"></p>
                        </section>
                    </main>

                    <footer class="personalization-stage__footer">
                        <div class="personalization-stage__progress" aria-label="${progress}% completado"><span style="width:${progress}%"></span></div>
                        <div class="personalization-stage__footer-inner">
                            <span>${state.index + 1} de ${state.questions.length}</span>
                            <div>
                                <button class="personalization-stage__button personalization-stage__button--secondary" type="button" data-personalization-prev ${state.index === 0 ? 'disabled' : ''}>Anterior</button>
                                <button class="personalization-stage__button personalization-stage__button--primary" type="button" data-personalization-next ${answerIsEmpty ? 'disabled' : ''}>${state.index === state.questions.length - 1 ? 'Crear mi ruta' : 'Siguiente'} <span aria-hidden="true">→</span></button>
                            </div>
                        </div>
                    </footer>
                </div>
            `;

            document.querySelectorAll('[data-personalization-option]').forEach((button) => {
                button.addEventListener('click', () => {
                    const value = button.dataset.personalizationOption;
                    if (question.type !== 'multiselect') {
                        state.answers[question.id] = value;
                        paint();
                        return;
                    }
                    const current = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
                    state.answers[question.id] = current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value];
                    paint();
                });
            });

            document.querySelector('[data-personalization-select]')?.addEventListener('change', (event) => {
                state.answers[question.id] = normalizeAnswer(event.target.value);
                paint();
            });

            document.querySelector('[data-personalization-exit]')?.addEventListener('click', () => {
                Router().navigate('/explorar');
            });

            document.querySelector('[data-personalization-prev]')?.addEventListener('click', () => {
                persistCurrent();
                state.index = Math.max(0, state.index - 1);
                paint();
            });

            document.querySelector('[data-personalization-next]')?.addEventListener('click', async () => {
                persistCurrent();
                const value = state.answers[question.id];
                const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
                if (isEmpty) {
                    const message = document.getElementById('personalization-message');
                    if (message) message.textContent = 'Elige una respuesta para continuar.';
                    return;
                }
                if (state.index < state.questions.length - 1) {
                    state.index += 1;
                    paint();
                    return;
                }

                const answers = state.answers;
                app.innerHTML = Components().renderLoadingBlock('Guardando tu ruta');
                try {
                    await API().saveOnboarding({
                        objetivo: answers.objetivo || 'Entrar a la universidad',
                        carrera_interes: PROGRAMS[answers.programa] === 'exani' ? answers.carrera || 'UAEMex' : answers.programa,
                        universidad_objetivo: PROGRAMS[answers.programa] === 'exani' ? 'UAEMex' : null,
                        area_interes: Array.isArray(answers.enfoque) ? answers.enfoque.join(', ') : answers.enfoque || '',
                        meta_estudio: Array.isArray(answers.materias_dificiles)
                            ? `Áreas prioritarias: ${answers.materias_dificiles.join(', ')}.`
                            : '',
                        respuestas_extra: {...answers, programa: PROGRAMS[answers.programa] || 'exani'},
                    });
                    if (window.EducatIA.Features?.ale === true) {
                        await API().saveAlePreferences({
                            preferred_name: (Components().userState.name || 'Estudiante').split(' ')[0],
                            tone: String(answers.profesor || 'Amigable').toLowerCase().replace(/\s+/g, '_'),
                            teaching_style: String(answers.profesor || 'Paso a paso').toLowerCase().replace(/\s+/g, '_'),
                        }).catch(() => null);
                    }
                    const recommendations = await API().getCourseRecommendations().catch(() => state.recommendations);
                    const hasAccess = Components().hasPremiumAccess?.(Components().userState);
                    if (PROGRAMS[answers.programa] && PROGRAMS[answers.programa] !== 'exani') {
                        renderRecommendations(app, recommendations, PROGRAMS[answers.programa]);
                    } else if (hasAccess) {
                        renderRecommendations(app, recommendations);
                    } else {
                        renderPlanOffer(app, recommendations);
                    }
                } catch (error) {
                    app.innerHTML = `
                        <div class="personalization-page">
                            <section class="personalization-card">
                                <h1>No se pudo guardar tu ruta</h1>
                                <p>${esc(error.message || 'Intenta de nuevo en unos minutos.')}</p>
                                <button class="btn btn--primary" type="button" data-personalization-retry>Reintentar</button>
                            </section>
                        </div>
                    `;
                    document.querySelector('[data-personalization-retry]')?.addEventListener('click', paint);
                }
            });
        }

        paint();
    }

    return { render: renderFlow, questionsForProgram, prepareQuestions, renderRecommendations };
})();
