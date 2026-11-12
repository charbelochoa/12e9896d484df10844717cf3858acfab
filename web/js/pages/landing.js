/* ================================================================
   educatIA - Public landing
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Landing = {
    heroImage: 'assets/images/generated/educatia-hero-community.webp',
    peopleImage: 'assets/images/generated/educatia-study-room.webp',
    labImage: 'assets/images/generated/educatia-lab-preview.webp',
    examImage: 'assets/images/generated/educatia-practice-exams.webp',

    courses: [
        {
            title: 'Curso EXANI-II para aspirantes UAEM',
            desc: 'Curso premium',
            img: 'assets/images/landing-courses/exani-route.jpg',
            meta: 'Preparación completa',
            rating: '4.9'
        },
        {
            title: 'Diagnóstico inicial EXANI-II',
            desc: 'Reporte inicial',
            img: 'assets/images/landing-courses/diagnostic.jpg',
            meta: 'Diagnóstico',
            rating: '4.8'
        },
        {
            title: 'Pensamiento matemático desde cero',
            desc: 'Módulo base',
            img: 'assets/lessons_photo/webp/aritmetica.webp',
            meta: 'Matemáticas',
            rating: '4.8'
        },
        {
            title: 'Comprensión lectora y redacción',
            desc: 'Módulo clave',
            img: 'assets/lessons_photo/webp/literatura.webp',
            meta: 'Lectura',
            rating: '4.8'
        },
        {
            title: 'Simulacros EXANI-II con tiempo',
            desc: 'Simulador',
            img: 'assets/images/landing-courses/simulations.jpg',
            meta: 'Simulacros',
            rating: '4.9'
        },
        {
            title: 'Práctica por habilidades EXANI-II',
            desc: 'Entrenamiento dirigido',
            img: 'assets/images/landing-courses/ai-tutor.jpg',
            meta: 'Práctica adaptativa',
            rating: '4.8'
        },
        {
            title: 'Ciencias de la Salud',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/ciencias-de-la-salud.webp',
            meta: 'Salud',
            rating: '4.7'
        },
        {
            title: 'Probabilidad y estadística',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/probabilidad.webp',
            meta: 'Matemáticas',
            rating: '4.8'
        },
        {
            title: 'Premedicina',
            desc: 'Módulo especial',
            img: 'assets/lessons_photo/webp/premedicina.webp',
            meta: 'Salud',
            rating: '4.9'
        },
        {
            title: 'Calendario semanal de estudio',
            desc: 'Plan guiado',
            img: 'assets/images/landing-courses/study-calendar.jpg',
            meta: 'Plan semanal',
            rating: '4.8'
        },
        {
            title: 'Aritmética para EXANI-II',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/aritmetica.webp',
            meta: 'Matemáticas',
            rating: '4.8'
        },
        {
            title: 'Literatura y análisis de textos',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/literatura.webp',
            meta: 'Lectura',
            rating: '4.7'
        },
        {
            title: 'Física para EXANI-II',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/fisica.webp',
            meta: 'Experimentales',
            rating: '4.8'
        },
        {
            title: 'Química para EXANI-II',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/quimica.webp',
            meta: 'Experimentales',
            rating: '4.8'
        },
        {
            title: 'Biología para EXANI-II',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/biologia.webp',
            meta: 'Experimentales',
            rating: '4.8'
        },
        {
            title: 'Historia y ciencias sociales',
            desc: 'Módulo disciplinar',
            img: 'assets/lessons_photo/webp/historia.webp',
            meta: 'Sociales',
            rating: '4.7'
        }
    ],

    metrics: [
        ['75%', 'descuento estudiantil permanente'],
        ['4', 'planes de acceso'],
        ['700', 'versiones de simulacro'],
        ['EXANI-II', 'enfoque de admisión']
    ],

    esc: function (value) {
        return window.EducatIA.Utils?.escapeHtml
            ? window.EducatIA.Utils.escapeHtml(value)
            : String(value || '');
    },

    toUrl: function (path) {
        return window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    },

    providerMark: function () {
        return '<span class="cl-provider-mark"><img src="assets/icons/educatia-icon-192.png" alt="" loading="lazy"></span> educatIA';
    },

    courseByTitle: function (title) {
        return this.courses.find((course) => course.title === title) || this.courses[0];
    },

    courseCard: function (course) {
        const esc = this.esc.bind(this);
        return `
            <a class="cl-course-card" href="${this.toUrl('/explorar')}" aria-label="Explorar ${esc(course.title)}">
                <img src="${esc(course.img)}" alt="${esc(course.title)}" loading="lazy" onerror="this.remove();">
                <div class="cl-course-card__body">
                    <span>${this.providerMark()}</span>
                    <h3>${esc(course.title)}</h3>
                    <p>${esc(course.desc)}</p>
                    <small><span class="cl-star">*</span> ${esc(course.rating)}</small>
                </div>
            </a>
        `;
    },

    miniCourse: function (course) {
        const esc = this.esc.bind(this);
        return `
            <a class="cl-mini-course" href="${this.toUrl('/explorar')}" aria-label="Explorar ${esc(course.title)}">
                <img src="${esc(course.img)}" alt="${esc(course.title)}" loading="lazy" onerror="this.remove();">
                <span class="cl-mini-course__body">
                    <span class="cl-mini-course__provider">${this.providerMark()}</span>
                    <strong>${esc(course.title)}</strong>
                    <small>${esc(course.desc)} <span class="cl-star">*</span> ${esc(course.rating)}</small>
                </span>
            </a>
        `;
    },

    trendPanel: function (title, courseTitles) {
        const esc = this.esc.bind(this);
        return `
            <article class="cl-trend-panel">
                <h2 class="cl-panel-title">${esc(title)} <span aria-hidden="true">-&gt;</span></h2>
                <div class="cl-mini-list">
                    ${courseTitles.map((courseTitle) => this.miniCourse(this.courseByTitle(courseTitle))).join('')}
                </div>
            </article>
        `;
    },

    categoryChips: function () {
        return [
            'Matemáticas',
            'Comprensión lectora',
            'Redacción indirecta',
            'Inglés',
            'Ciencias de la salud',
            'Ciencias sociales',
            'Ciencias experimentales',
            'Humanidades',
            'Simulacros',
            'Práctica por habilidad',
            'Diagnóstico',
            'Plan semanal'
        ].map((label) => `<button type="button" data-landing-query="${this.esc(label)}">${this.esc(label)}</button>`).join('');
    },

    purposeCards: function () {
        const items = [
            ['01', 'Iniciar una nueva preparación'],
            ['02', 'Elegir educatIA premium'],
            ['03', 'Obtener práctica con exámenes'],
            ['04', 'Entrar al laboratorio de aprendizaje']
        ];
        return items.map((item) => `
            <a class="cl-purpose-card" href="${this.toUrl(item[0] === '04' ? '/laboratorio-aprendizaje' : '/precios')}">
                <span>${this.esc(item[0])}</span>
                <h2>${this.esc(item[1])}</h2>
            </a>
        `).join('');
    },

    faqItem: function (question, answer) {
        return `
            <details>
                <summary>${this.esc(question)}</summary>
                <p>${this.esc(answer)}</p>
            </details>
        `;
    },

    render: function () {
        const esc = this.esc.bind(this);
        const app = document.getElementById('app');
        app.innerHTML = `
            <main class="landing-educatia landing-coursera">
                <section class="edu-hero">
                    <div class="edu-hero__media">
                        <img src="${esc(this.heroImage)}" alt="Estudiantes usando educatIA" loading="eager" onerror="this.remove();">
                    </div>
                    <div class="edu-hero__copy">
                        <span class="edu-kicker">Preparación académica y formación en inteligencia artificial</span>
                        <h1>Aprende con una ruta clara en educatIA.</h1>
                        <p>Prepara tu ingreso con EXANI-I y EXANI-II. Fórmate también en ingeniería de IA, machine learning y deep learning con teoría, código y proyectos.</p>
                        <div class="edu-hero__actions">
                            <a href="${this.toUrl('/registro-alumno')}" class="edu-button edu-button--primary">Registrarme gratis</a>
                            <a href="${this.toUrl('/explorar')}" class="edu-button edu-button--secondary">Explorar cursos</a>
                        </div>
                    </div>
                </section>

                ${window.EducatIA.ProgramCatalog.section()}

                <section class="cl-section cl-section--tight">
                    <div class="cl-shell cl-trend-grid">
                        ${this.trendPanel('Más populares', [
                            'Curso EXANI-II para aspirantes UAEM',
                            'Pensamiento matemático desde cero',
                            'Comprensión lectora y redacción'
                        ])}
                        ${this.trendPanel('Destacado semanal', [
                            'Diagnóstico inicial EXANI-II',
                            'Práctica por habilidades EXANI-II',
                            'Calendario semanal de estudio'
                        ])}
                        ${this.trendPanel('Conocimientos EXANI demandados', [
                            'Ciencias de la Salud',
                            'Probabilidad y estadística',
                            'Premedicina'
                        ])}
                    </div>
                </section>

                <section class="cl-section">
                    <div class="cl-shell">
                        <h2 class="cl-section-title">Explorar categorías</h2>
                        <div class="cl-category-chips" aria-label="Categorías de aprendizaje">
                            ${this.categoryChips()}
                        </div>
                    </div>
                </section>

                <section class="cl-news-band">
                    <div class="cl-shell">
                        <div class="cl-news-band__inner">
                            <div class="cl-news-copy">
                                <h2>Prepárate para entrar a la universidad</h2>
                                <p>No necesitas experiencia previa para empezar. Avanza con diagnóstico, sesiones breves, práctica por habilidad y simulacros.</p>
                                <a class="cl-button cl-button--white" href="${this.toUrl('/registro-alumno')}">Registrarme gratis</a>
                            </div>
                            <div class="cl-career-band__content">
                                <div class="cl-tabs" aria-label="Rutas destacadas">
                                    <button type="button" class="is-active">EXANI-II</button>
                                    <button type="button">Matemáticas</button>
                                    <button type="button">Lectura</button>
                                    <button type="button">Salud</button>
                                    <button type="button">Simulacros</button>
                                </div>
                                <div class="cl-news-cards">
                                    ${[
                                        'Curso EXANI-II para aspirantes UAEM',
                                        'Pensamiento matemático desde cero',
                                        'Comprensión lectora y redacción',
                                        'Simulacros EXANI-II con tiempo'
                                    ].map((courseTitle) => this.courseCard(this.courseByTitle(courseTitle))).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="cl-section">
                    <div class="cl-shell">
                        <div class="cl-section-heading">
                            <h2>Los más populares por categoría</h2>
                            <a href="${this.toUrl('/explorar')}">Ver catálogo -&gt;</a>
                        </div>
                        <div class="cl-trend-grid">
                            ${this.trendPanel('Matemáticas', [
                                'Pensamiento matemático desde cero',
                                'Probabilidad y estadística',
                                'Aritmética para EXANI-II'
                            ])}
                            ${this.trendPanel('Lectura y lenguaje', [
                                'Comprensión lectora y redacción',
                                'Literatura y análisis de textos',
                                'Curso EXANI-II para aspirantes UAEM'
                            ])}
                            ${this.trendPanel('Salud y premedicina', [
                                'Ciencias de la Salud',
                                'Premedicina',
                                'Práctica por habilidades EXANI-II'
                            ])}
                        </div>
                    </div>
                </section>

                <section class="cl-section">
                    <div class="cl-shell">
                        <div class="cl-section-heading">
                            <h2>Preparación EXANI por materia</h2>
                            <a href="${this.toUrl('/explorar')}">Explorar todo -&gt;</a>
                        </div>
                        <div class="cl-career-grid">
                            ${[
                                'Curso EXANI-II para aspirantes UAEM',
                                'Diagnóstico inicial EXANI-II',
                                'Pensamiento matemático desde cero',
                                'Comprensión lectora y redacción',
                                'Simulacros EXANI-II con tiempo',
                                'Práctica por habilidades EXANI-II',
                                'Ciencias de la Salud',
                                'Probabilidad y estadística'
                            ].map((courseTitle) => this.courseCard(this.courseByTitle(courseTitle))).join('')}
                        </div>
                    </div>
                </section>

                <section class="cl-section cl-section--subjects">
                    <div class="cl-shell">
                        <div class="cl-section-heading">
                            <div>
                                <span class="cl-section-kicker">Más opciones para tu examen</span>
                                <h2>Continúa por la materia que necesitas reforzar</h2>
                            </div>
                            <a href="${this.toUrl('/explorar')}">Ver todas las materias -&gt;</a>
                        </div>
                        <div class="cl-career-grid cl-career-grid--subjects">
                            ${[
                                'Física para EXANI-II',
                                'Química para EXANI-II',
                                'Biología para EXANI-II',
                                'Historia y ciencias sociales'
                            ].map((courseTitle) => this.courseCard(this.courseByTitle(courseTitle))).join('')}
                        </div>
                    </div>
                </section>

                <section class="cl-section cl-section--programs">
                    <div class="cl-shell">
                        <div class="cl-section-heading cl-section-heading--programs">
                            <div>
                                <span class="cl-section-kicker">Conoce educatIA</span>
                                <h2>Elige tu siguiente etapa de aprendizaje.</h2>
                                <p>Explora la preparación EXANI disponible y la nueva oferta de formación en inteligencia artificial.</p>
                            </div>
                        </div>
                        <div class="cl-program-grid">
                            <a class="cl-program-card cl-program-card--preparatoria" href="${this.toUrl('/explorar')}">
                                <img src="assets/tarjetas_banner/exani_i/exani-i.webp" alt="Estudiantes preparando su ingreso a preparatoria" loading="lazy">
                                <div class="cl-program-card__body">
                                    <span>Preparación académica</span>
                                    <h3>EXANI-I y EXANI-II</h3>
                                    <p>Materias, evaluaciones, práctica y simulacros para preparar tu ingreso a preparatoria o universidad.</p>
                                    <strong>Explorar preparación EXANI →</strong>
                                </div>
                            </a>
                            <a class="cl-program-card cl-program-card--universidad" href="${this.toUrl('/info/formacion-ia')}">
                                <img src="${esc(this.peopleImage)}" alt="Espacio de aprendizaje de educatIA" loading="lazy">
                                <div class="cl-program-card__body">
                                    <span>Formación profesional</span>
                                    <h3>Ingeniería en inteligencia artificial</h3>
                                    <p>AI Engineer, Machine Learning For AI, Deep Learning For AI y Transformers and Multi-Modal Models.</p>
                                    <strong>Conocer los programas →</strong>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <section class="cl-section">
                    <div class="cl-shell cl-purpose-grid">
                        ${this.purposeCards()}
                    </div>
                </section>

                <section class="cl-section cl-section--faq">
                    <div class="cl-shell">
                        <h2 class="cl-section-title">Preguntas frecuentes</h2>
                        <div class="cl-faq-list">
                            ${this.faqItem('¿Qué puedo estudiar en educatIA?', 'Puedes preparar EXANI-I y EXANI-II y estudiar AI Engineer, Machine Learning For AI o Deep Learning For AI. Transformers and Multi-Modal Models se prepara como próxima cohorte con clases por Zoom.')}
                            ${this.faqItem('¿Ya puedo inscribirme a los cursos de inteligencia artificial?', 'Sí. AI Engineer, Machine Learning For AI y Deep Learning For AI tienen inscripción individual. Consulta su temario y precio en las tarjetas de esta página. Transformers abrirá inscripciones cuando se publique su calendario.')}
                            ${this.faqItem('¿Cómo funciona el acceso?', 'Los cursos de IA se compran por separado e incluyen doce meses de acceso mediante pago único. La preparación EXANI mantiene sus planes de suscripción y la vigencia indicada al contratar.')}
                            ${this.faqItem('¿Qué incluye la preparación premium?', 'Incluye cursos, práctica por habilidad, simulacros y acceso al laboratorio de aprendizaje según el plan activo.')}
                            ${this.faqItem('¿El laboratorio de aprendizaje ya está disponible?', 'Sí. La versión actual incluye simuladores HTML5 de Física para observar fenómenos, modificar variables y practicar de forma visual.')}
                        </div>
                    </div>
                </section>
            </main>
        `;
        const hero = app.querySelector('.edu-hero');
        const programs = app.querySelector('.cl-section--programs');
        if (hero && programs) hero.insertAdjacentElement('afterend', programs);
        this.bindCategorySearch();
    },

    bindCategorySearch: function () {
        document.querySelectorAll('[data-landing-query]').forEach((button) => {
            button.addEventListener('click', () => {
                const query = button.dataset.landingQuery || '';
                window.sessionStorage.setItem('educatia_explore_query', query);
                if (window.EducatIA.Router?.navigate) {
                    window.EducatIA.Router.navigate('/explorar');
                } else {
                    window.location.href = this.toUrl('/explorar');
                }
            });
        });
    },

    bindAccordion: function () {},
    bindPremiumCta: function () {},
    startActivityRotation: function () {}
};
