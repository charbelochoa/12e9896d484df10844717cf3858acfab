/* ================================================================
   educatIA - Landing Page Mobile View
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.LandingMobile = {
    render: function () {
        var toUrl = function (path) {
            return window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
        };

        var courses = [
            {
                title: 'Curso EXANI-II para aspirantes UAEM',
                label: 'Ruta premium',
                img: 'assets/images/generated/educatia-lab-preview.webp'
            },
            {
                title: 'Pensamiento matemático desde cero',
                label: 'Módulo base',
                img: 'assets/images/generated/educatia-study-room.webp'
            },
            {
                title: 'Comprensión lectora y redacción',
                label: 'Módulo clave',
                img: 'assets/images/generated/educatia-hero-community.webp'
            },
            {
                title: 'Simulacros EXANI-II con tiempo',
                label: 'Práctica real',
                img: 'assets/images/generated/educatia-practice-exams.webp'
            }
        ];

        var app = document.getElementById('app');
        app.innerHTML = `
        <div class="edu-mob-layout edu-mob-market">
            <header class="edu-mob-market__top">
                <a href="${toUrl('/')}" class="edu-mob-market__brand">educatIA</a>
                <nav class="edu-mob-market__nav">
                    <a href="${toUrl('/explorar')}">Ruta</a>
                    <a href="${toUrl('/login')}">Ingresar</a>
                </nav>
            </header>

            <section class="edu-mob-section edu-mob-hero-market">
                <div class="edu-mob-hero-market__copy">
                    <span>Preparación académica e inteligencia artificial</span>
                    <h1>Aprende con una ruta clara en educatIA.</h1>
                    <p>Prepara el EXANI-I y EXANI-II y fórmate en inteligencia artificial con teoría, código y proyectos.</p>
                    <a href="${toUrl('/info/formacion-ia')}" class="edu-mob-btn edu-mob-btn--blue">Conocer formación en IA</a>
                </div>
                <img src="assets/images/generated/educatia-hero-community.webp" alt="Aspirante educatIA">
            </section>

            ${window.EducatIA.ProgramCatalog.section({ compact: true })}

            <section class="edu-mob-section">
                <div class="edu-mob-market__stats">
                    <div><strong>EXANI-II</strong><span>ruta principal</span></div>
                    <div><strong>4 áreas</strong><span>habilidades clave</span></div>
                    <div><strong>Práctica guiada</strong><span>avance por habilidad</span></div>
                </div>
            </section>

            <section class="edu-mob-section">
                <div class="edu-mob-title edu-mob-title--row">
                    <h2>Preparación EXANI</h2>
                    <a href="${toUrl('/explorar')}">Ver todos</a>
                </div>
                <div class="edu-mob-course-rail">
                    ${courses.map(function (course) {
                        return `
                            <a href="${toUrl('/explorar')}" class="edu-mob-course-card">
                                <img src="${course.img}" alt="${course.title}" loading="lazy">
                                <span>${course.label}</span>
                                <h3>${course.title}</h3>
                                <p>educatIA Premium</p>
                            </a>
                        `;
                    }).join('')}
                </div>
            </section>

            <section class="edu-mob-section edu-mob-section--gray">
                <div class="edu-mob-boxed-list">
                    <h2 class="edu-mob-boxed-list__title">¿Qué vas a practicar?</h2>
                    <div class="edu-mob-chip-cloud">
                        <a href="${toUrl('/explorar')}">Pensamiento matemático</a>
                        <a href="${toUrl('/explorar')}">Comprensión lectora</a>
                        <a href="${toUrl('/explorar')}">Redacción indirecta</a>
                        <a href="${toUrl('/explorar')}">Inglés esencial</a>
                        <a href="${toUrl('/explorar')}">Simulacros</a>
                        <a href="${toUrl('/simuladores-exani')}">Simulacros</a>
                    </div>
                </div>
            </section>

            <section class="edu-mob-section">
                <div class="edu-mob-title">
                    <h2>Tu flujo de preparación</h2>
                </div>
                <div class="edu-mob-list-items">
                    <a href="${toUrl('/explorar')}" class="edu-mob-list-btn">
                        <div class="edu-mob-list-icon">1</div>
                        <span class="edu-mob-list-text">Diagnóstico inicial</span>
                    </a>
                    <a href="${toUrl('/explorar')}" class="edu-mob-list-btn">
                        <div class="edu-mob-list-icon">2</div>
                        <span class="edu-mob-list-text">Lecciones cortas por habilidad</span>
                    </a>
                    <a href="${toUrl('/explorar')}" class="edu-mob-list-btn">
                        <div class="edu-mob-list-icon">3</div>
                        <span class="edu-mob-list-text">Reactivos con explicación</span>
                    </a>
                    <a href="${toUrl('/explorar')}" class="edu-mob-list-btn">
                        <div class="edu-mob-list-icon">4</div>
                        <span class="edu-mob-list-text">Simulacros con tiempo</span>
                    </a>
                </div>
            </section>

            <section class="edu-mob-section">
                <div class="edu-mob-premium-panel">
                    <span>Plan EXANI-II</span>
                    <h2>Curso EXANI-II Premium</h2>
                    <p>Empieza con una ruta ordenada para llegar mejor preparado al examen.</p>
                    <a href="${toUrl('/registro-alumno?plan=premium')}" class="edu-mob-btn edu-mob-btn--white">Accede a EducatIA premium</a>
                </div>
            </section>
        </div>
        `;
    }
};
