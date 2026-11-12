/* IA catalog uses the same cards, course detail and reader as EXANI. */
window.EducatIA = window.EducatIA || {};
window.EducatIA.ProgramCatalog = (function () {
    const E = () => window.EducatIA;
    const esc = value => E().Utils.escapeHtml(String(value ?? ''));
    const url = path => E().Router.toUrl(path);
    const programs = () => E().AcademicCatalog?.programs || [];
    // Display snapshot; checkout always reads the current server-owned offer.
    const prices = { ai_engineer: 12900, machine_learning: 6900, deep_learning: 8900, transformers_multimodal: 24900 };
    const summaries = {
        ai_engineer: 'Construye sistemas de IA: Python, datos, evaluación, APIs y operación de un proyecto completo.',
        machine_learning: 'Modela datos con regresión, clasificación, árboles y métodos no supervisados. Evalúa sin fugas de información.',
        deep_learning: 'Entrena redes neuronales con PyTorch. Comprende gradientes, optimización, visión y modelos de secuencias.',
        transformers_multimodal: 'Estudia modelos de lenguaje, atención y sistemas multimodales con recursos en plataforma y clases por Zoom.'
    };
    const detailUrl = program => url('/info/formacion-ia?programa=' + encodeURIComponent(program));
    const checkoutUrl = (program, courseId) => url('/checkout?programa=' + encodeURIComponent(program) + (courseId ? '&course_id=' + encodeURIComponent(courseId) : ''));
    const money = amount => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount) + ' MXN';
    const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function cards(query = '') {
        return programs().filter(p => normalize([p.titulo, p.objetivo, 'inteligencia artificial IA', ...p.modulos.map(m => m.titulo)].join(' ')).includes(normalize(query.trim()))).map(p => {
            const upcoming = p.modalidad === 'hibrido_zoom';
            return `<article class="cl-course-card">
                <div class="cl-course-card__body">
                    <span class="cl-section-kicker">${upcoming ? 'Próxima cohorte · Zoom' : 'Curso de inteligencia artificial'}</span>
                    <h3><a href="${detailUrl(p.programa)}">${esc(p.titulo)}</a></h3>
                    <p>${esc(summaries[p.programa])}</p>
                    <small>${p.modulos.length} módulos · ${upcoming ? 'Plataforma y clases en vivo' : 'Teoría, código y evaluaciones'}</small>
                    <strong>${money(prices[p.programa])}</strong>
                    <small>${upcoming ? 'Precio previsto · inscripciones próximamente' : 'Pago único · 12 meses de acceso'}</small>
                    <a class="btn btn--outline" href="${detailUrl(p.programa)}">Ver curso y temario</a>
                    ${upcoming ? '' : `<a class="btn btn--blue" href="${checkoutUrl(p.programa)}">Inscribirme</a>`}
                </div>
            </article>`;
        }).join('');
    }

    function section({ query = '', compact = false } = {}) {
        const content = cards(query);
        if (!content) return '';
        return `<section class="${compact ? 'edu-mob-section' : 'cl-section'}" id="cursos-ia" aria-labelledby="cursos-ia-title">
            <div class="${compact ? '' : 'cl-shell'}">
                <div class="cl-section-heading"><div>
                    <span class="cl-section-kicker">Formación profesional</span>
                    <h2 id="cursos-ia-title">Cursos de inteligencia artificial</h2>
                    <p>Elige tu especialidad y consulta el temario antes de inscribirte.</p>
                </div><a href="${url('/info/formacion-ia')}">Conocer los programas</a></div>
                <div class="cl-career-grid">${content}</div>
            </div>
        </section>`;
    }

    function syllabus(program) {
        return `<div class="course-detail__modules">${program.modulos.map((m, i) => `<details class="course-detail__module-card course-detail__module-card--fold" ${i === 0 ? 'open' : ''}>
            <summary><span class="course-detail__module-meta">Módulo ${m.orden}</span><strong>${esc(m.titulo)}</strong><small>${m.temas.length} temas</small></summary>
            <p>${esc(m.objetivo)}</p>
            <ul class="course-detail__module-lessons">${m.temas.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
            <p><strong>Práctica y entrega:</strong> ${esc(m.entrega)}</p>
        </details>`).join('')}</div>`;
    }

    function overview(program) {
        const advanced = !!program;
        const title = advanced ? program.titulo : 'Formación en inteligencia artificial';
        const lead = advanced ? program.objetivo : 'Aprende a construir, evaluar y poner en funcionamiento sistemas de inteligencia artificial. Elige una ruta completa de ingeniería o profundiza en machine learning y deep learning.';
        const sources = E().AcademicCatalog.sources;
        return `<div class="course-detail-page course-enroll">
            <section class="course-enroll__band"><div class="course-enroll__shell">
                <nav class="course-detail__breadcrumbs course-enroll__breadcrumbs"><a href="${url('/')}">Inicio</a><a href="${url('/explorar')}">Explorar</a><span>Inteligencia artificial</span></nav>
                <div class="course-enroll__hero">
                    <div class="course-enroll__copy">
                        <span class="course-enroll__brand-mark">educatIA</span><h1>${esc(title)}</h1>
                        <p class="course-enroll__lead">${esc(lead)}</p>
                        <div class="course-enroll__signals"><span>Teoría y código explicado</span><span>Prácticas y exámenes</span><span>Entregas con rúbrica</span></div>
                        <div class="course-enroll__actions"><a class="course-enroll__primary" href="#${advanced ? 'programa-temario' : 'cursos-ia'}"><span>${advanced ? 'Consultar temario' : 'Elegir mi curso'}</span><small>${advanced ? 'Plataforma y clases por Zoom' : 'Programas con acceso independiente'}</small></a></div>
                    </div>
                    <aside class="course-detail__module-card">
                        <span class="course-detail__module-meta">${advanced ? 'Próxima cohorte' : 'Aprende dentro de educatIA'}</span>
                        <h2>${advanced ? money(prices[program.programa]) : 'De la lección al proyecto'}</h2>
                        <p>${advanced ? 'Precio previsto por el programa. El temario está en desarrollo; publicaremos la fecha y el cupo de las clases antes de abrir inscripciones.' : 'Cada curso reúne módulos ordenados, lecciones, código comentado, prácticas y evaluaciones en tu espacio de aprendizaje.'}</p>
                        <ul class="course-detail__module-lessons"><li>Lee y avanza por tema.</li><li>Practica y comprueba lo aprendido.</li><li>Entrega tareas y archivos para revisión.</li><li>Consulta tu progreso y retroalimentación.</li></ul>
                    </aside>
                </div>
            </div></section>
            ${advanced ? '' : section()}
            <div class="course-enroll__shell">
                <section class="course-detail__section" id="programa-temario">
                    <div class="course-detail__section-head"><div><span class="course-detail__section-kicker">${advanced ? 'Programa académico' : 'Elige una ruta'}</span><h2>${advanced ? 'Temario del programa' : 'Un punto de partida para cada perfil'}</h2></div></div>
                    ${advanced ? `<p><strong>Requisitos:</strong> ${esc(program.requisitos)}</p>${syllabus(program)}` : `<div class="course-detail__outcomes">
                        <div class="course-detail__outcome"><p><strong>AI Engineer.</strong> Para integrar programación, datos, modelos y servicios en un proyecto de ingeniería.</p></div>
                        <div class="course-detail__outcome"><p><strong>Machine Learning For AI.</strong> Para profundizar en modelado estadístico y evaluación de experimentos.</p></div>
                        <div class="course-detail__outcome"><p><strong>Deep Learning For AI.</strong> Para trabajar con redes neuronales y entender su entrenamiento.</p></div>
                        <div class="course-detail__outcome"><p><strong>Transformers and Multi-Modal Models.</strong> Especialización avanzada con clases por Zoom. Requiere bases de ML y DL.</p></div>
                    </div>`}
                </section>
                <section class="course-detail__section">
                    <div class="course-detail__section-head"><div><span class="course-detail__section-kicker">Antes de comenzar</span><h2>${advanced ? 'Recursos y preparación' : 'Cómo se estudia'}</h2></div></div>
                    <div class="course-detail__modules">
                        <details class="course-detail__module-card course-detail__module-card--fold"><summary><strong>Requisitos y equipo</strong></summary><p>${esc(advanced ? program.compute_policy : 'Consulta los requisitos específicos en cada curso. Necesitarás una computadora para programar, conexión a internet y tiempo para resolver las prácticas. Los recursos de cómputo adicionales se indican en cada actividad.')}</p></details>
                        <details class="course-detail__module-card course-detail__module-card--fold"><summary><strong>Lecciones, evaluaciones y entregas</strong></summary><p>Estudia en el lector de educatIA, revisa los ejemplos de código, responde las evaluaciones y entrega tus archivos en el apartado de tareas. La rúbrica de cada entrega explica cómo se revisará el trabajo.</p></details>
                        <details class="course-detail__module-card course-detail__module-card--fold"><summary><strong>Fuentes académicas</strong></summary><p>El contenido de educatIA es propio y se apoya en bibliografía y documentación técnica, incluidas las siguientes referencias. No implica afiliación ni certificación de estas instituciones.</p><ul class="course-detail__module-lessons">${(advanced ? program.fuentes : [...new Set(programs().flatMap(p => p.fuentes))]).map(key => sources[key] ? `<li><a href="${esc(sources[key].url)}" target="_blank" rel="noopener noreferrer">${esc(sources[key].title)}</a></li>` : '').join('')}</ul></details>
                    </div>
                </section>
            </div>
        </div>`;
    }

    async function render() {
        const selected = E().Router.getQueryParams().get('programa');
        const program = programs().find(p => p.programa === selected);
        const app = document.getElementById('app');
        if (program?.modalidad === 'hibrido_zoom' && E().API.getUser?.()) {
            try {
                const response = await E().API.getCourses({ programa: selected });
                const preview = (Array.isArray(response) ? response : response.items || []).find(c => c.programa === selected);
                if (E().Router.getCurrentRoute() !== '/info/formacion-ia' || E().Router.getQueryParams().get('programa') !== selected) return;
                if (preview) { E().Router.navigate('/curso/' + preview.id, { replace: true }); return; }
            } catch { /* The public program remains available if a preview cannot load. */ }
        }
        if (!selected || program?.modalidad === 'hibrido_zoom') {
            app.innerHTML = overview(program);
            app.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener('click', event => {
                    const target = document.getElementById(link.getAttribute('href').slice(1));
                    if (!target) return;
                    event.preventDefault();
                    event.stopPropagation();
                    target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                });
            });
            return;
        }
        app.innerHTML = E().Components.renderLoadingBlock('Cargando curso');
        try {
            if (!program) throw new Error('Este programa no existe.');
            const response = await E().API.getCourses({ programa: selected });
            const course = (Array.isArray(response) ? response : response.items || []).find(c => c.programa === selected && c.publicado);
            if (E().Router.getQueryParams().get('programa') !== selected || E().Router.getCurrentRoute() !== '/info/formacion-ia') return;
            if (!course) throw new Error('El curso no está disponible en este momento. Intenta nuevamente más tarde.');
            E().Router.navigate('/curso/' + course.id, { replace: true });
        } catch (error) {
            if (E().Router.getCurrentRoute() !== '/info/formacion-ia') return;
            app.innerHTML = `<div class="info-page"><h1>No se pudo abrir el curso</h1><p role="alert">${esc(error.message)}</p><a class="btn btn--blue" href="${url('/info/formacion-ia')}">Ver los programas</a></div>`;
        }
    }
    return { section, render, renderOverview: overview, detailUrl, checkoutUrl, money };
})();
