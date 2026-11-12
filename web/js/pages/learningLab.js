/* ================================================================
   educatIA - Learning laboratory
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.LearningLab = (function () {
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const aleEnabled = () => window.EducatIA.Features?.ale === true;
    const LAB_EXTERNAL_ONLY = true;
    const VISIBLE_LAB_SUBJECTS = new Set(['fisica']);

    let labData = null;
    let labSessions = [];
    let activeSubjectId = 'fisica';
    let activeSimulationId = 'ondas-mecanicas-parametros';
    let activeDetail = null;
    let sliderValues = {};
    let activeSession = null;
    let sessionStartedAt = 0;
    let sessionBaseDuration = 0;
    let sessionSaveTimer = null;
    let animationFrame = null;
    let fullscreenListenerBound = false;
    let fallbackFullscreenActive = false;
    let externalFullscreenActive = false;
    let externalFullscreenListenerBound = false;
    let externalFrame = null;
    let externalFrameLoadHandler = null;
    let externalReadinessTimer = null;
    let externalLoaderFallbackTimer = null;
    let externalRenderGeneration = 0;

    const EXTERNAL_SIMULATIONS = [
        { id: 'balancing-act', subjectId: 'fisica', title: 'Balancing Act', label: 'Equilibrio de fuerzas', summary: 'Ajusta masas y torques para estudiar equilibrio y palancas.' },
        { id: 'bending-light', subjectId: 'fisica', title: 'Bending Light', label: 'Desviación de la luz', summary: 'Explora refracción, reflexión y el cambio de medio.' },
        { id: 'buoyancy', subjectId: 'fisica', title: 'Buoyancy', label: 'Flotación y empuje', summary: 'Relaciona densidad, volumen y fuerza de empuje.' },
        { id: 'calculus-grapher', subjectId: 'fisica', title: 'Calculus Grapher', label: 'Gráficas y cálculo', summary: 'Visualiza funciones, pendientes y acumulación.' },
        { id: 'coulombs-law', subjectId: 'fisica', title: "Coulomb's Law", label: 'Ley de Coulomb', summary: 'Observa cómo cambian la fuerza y el campo entre cargas.' },
        { id: 'curve-fitting', subjectId: 'fisica', title: 'Curve Fitting', label: 'Ajuste de curvas', summary: 'Compara datos experimentales con modelos matemáticos.' },
        { id: 'density', subjectId: 'quimica', title: 'Density', label: 'Densidad de materiales', summary: 'Mide masa, volumen y densidad con materiales interactivos.' },
        { id: 'energy-skate-park', subjectId: 'fisica', title: 'Energy Skate Park', label: 'Energía mecánica', summary: 'Sigue la energía cinética, potencial y su conservación.' },
        { id: 'faradays-electromagnetic-lab', subjectId: 'fisica', title: "Faraday's Electromagnetic Lab", label: 'Laboratorio electromagnético', summary: 'Conecta bobinas, imanes y corriente inducida.' },
        { id: 'faradays-law', subjectId: 'fisica', title: "Faraday's Law", label: 'Ley de Faraday', summary: 'Relaciona flujo magnético y fuerza electromotriz inducida.' },
        { id: 'forces-and-motion-basics', subjectId: 'fisica', title: 'Forces and Motion: Basics', label: 'Fuerzas y movimiento', summary: 'Experimenta con fuerza neta, masa, fricción y aceleración.' },
        { id: 'fourier-making-waves', subjectId: 'fisica', title: 'Fourier: Making Waves', label: 'Fourier y ondas', summary: 'Construye ondas a partir de armónicos y frecuencias.' },
        { id: 'gas-properties', subjectId: 'quimica', title: 'Gas Properties', label: 'Propiedades de los gases', summary: 'Relaciona presión, volumen, temperatura y partículas.' },
        { id: 'geometric-optics-basics', subjectId: 'fisica', title: 'Geometric Optics: Basics', label: 'Óptica geométrica', summary: 'Traza rayos, lentes, espejos e imágenes.' },
        { id: 'gravity-force-lab-basics', subjectId: 'fisica', title: 'Gravity Force Lab: Basics', label: 'Fuerza gravitacional', summary: 'Compara masa, distancia y fuerza de gravedad.' },
        { id: 'keplers-laws', subjectId: 'fisica', title: "Kepler's Laws", label: 'Leyes de Kepler', summary: 'Observa órbitas, periodos y áreas barridas.' },
        { id: 'magnet-and-compass', subjectId: 'fisica', title: 'Magnet and Compass', label: 'Campo magnético', summary: 'Visualiza líneas de campo y la orientación de una brújula.' },
        { id: 'magnets-and-electromagnets', subjectId: 'fisica', title: 'Magnets and Electromagnets', label: 'Imanes y electroimanes', summary: 'Construye electroimanes y compara sus campos.' },
        { id: 'masses-and-springs-basics', subjectId: 'fisica', title: 'Masses and Springs: Basics', label: 'Masas y resortes', summary: 'Relaciona masa, constante elástica, periodo y energía.' },
        { id: 'ohms-law', subjectId: 'fisica', title: "Ohm's Law", label: 'Ley de Ohm', summary: 'Ajusta voltaje y resistencia para entender la corriente.' },
        { id: 'projectile-data-lab', subjectId: 'fisica', title: 'Projectile Data Lab', label: 'Datos de proyectiles', summary: 'Registra datos y compara alcance, altura y tiempo.' },
        { id: 'projectile-motion', subjectId: 'fisica', title: 'Projectile Motion', label: 'Movimiento de proyectiles', summary: 'Controla ángulo, velocidad y gravedad en una trayectoria.' },
        { id: 'sound-waves', subjectId: 'fisica', title: 'Sound Waves', label: 'Ondas sonoras', summary: 'Explora frecuencia, amplitud, tono e intensidad.' },
        { id: 'under-pressure', subjectId: 'fisica', title: 'Under Pressure', label: 'Presión en fluidos', summary: 'Observa presión, profundidad y densidad en fluidos.' },
        { id: 'vector-addition', subjectId: 'fisica', title: 'Vector Addition', label: 'Suma de vectores', summary: 'Suma vectores y lee componentes, magnitud y dirección.' },
        { id: 'wave-interference', subjectId: 'fisica', title: 'Wave Interference', label: 'Interferencia de ondas', summary: 'Combina ondas y distingue interferencia constructiva y destructiva.' },
        { id: 'wave-on-a-string', subjectId: 'fisica', title: 'Wave on a String', label: 'Onda en una cuerda', summary: 'Modifica tensión, frecuencia y amortiguamiento en una cuerda.' },
    ];

    function externalSimulationsForSubject(subjectId) {
        return EXTERNAL_SIMULATIONS.filter((simulation) => simulation.subjectId === subjectId);
    }

    function firstVisibleExternalSimulation() {
        const subject = subjectList()[0];
        return subject ? externalSimulationsForSubject(subject.id)[0] : null;
    }

    function externalSimulationUrl(subjectId, simulationId) {
        return Router().toUrl(`/laboratorio-aprendizaje/experimento/${encodeURIComponent(subjectId)}/${encodeURIComponent(simulationId)}`);
    }

    function anatomyLabUrl() {
        return `${Router().toUrl('/laboratorio-aprendizaje/premedicina/anatomia')}/`;
    }

    function externalSimulationMeta(subjectId, simulationId) {
        return EXTERNAL_SIMULATIONS.find((simulation) => simulation.subjectId === subjectId && simulation.id === simulationId) || null;
    }

    function labBrandLogoUrl() {
        return `${Router().toUrl('assets/new_logo/new_logo.png')}?v=20260712visual2`;
    }

    function subjectList() {
        const subjects = labData?.subjects || labData?.areas || [];
        return subjects.filter((subject) => VISIBLE_LAB_SUBJECTS.has(subject.id));
    }

    function activeSubject() {
        return subjectList().find((subject) => subject.id === activeSubjectId) || subjectList()[0] || {};
    }

    function activeSimulation() {
        return activeDetail?.simulation || (activeSubject().simulations || [])[0] || {};
    }

    function totalSimulationCount() {
        // Anatomy is a self-contained practice environment in addition to the
        // physics simulations listed in the external catalogue.
        return subjectList().reduce((total, subject) => total + subjectSimulationCount(subject), 0) + 1;
    }

    function subjectSimulationCount(subject) {
        if (LAB_EXTERNAL_ONLY) return externalSimulationsForSubject(subject.id).length;
        return Number(subject.simulation_count || (subject.simulations || []).length) + externalSimulationsForSubject(subject.id).length;
    }

    function subjectIcon(subjectId) {
        const paths = {
            fisica: `
                <path d="M5 13c2.3-6 4.7-6 7 0s4.7 6 7 0"/>
                <path d="M4 18h16"/>
                <circle cx="7" cy="7" r="2"/>
            `,
            quimica: `
                <path d="M9 3h6M10 3v6l-5 9.1A2 2 0 0 0 6.8 21h10.4a2 2 0 0 0 1.8-2.9L14 9V3"/>
                <path d="M7.5 16h9M9 13h6"/>
            `,
            premedicina: `
                <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/>
                <path d="M3 13h4l1.4-3 2.2 6 1.8-4H21"/>
            `,
        };
        return `
            <span class="lab-subject__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[subjectId] || paths.fisica}</svg>
            </span>
        `;
    }

    function simulationUrl(subjectId, simulationId, sessionId) {
        const path = '/laboratorio-aprendizaje/' + encodeURIComponent(subjectId) + '/' + encodeURIComponent(simulationId);
        const query = sessionId ? '?session_id=' + encodeURIComponent(sessionId) : '';
        return Router().toUrl(path + query);
    }

    function parameterValue(parameter) {
        return Number(sliderValues[parameter.id] ?? parameter.default ?? parameter.min ?? 0);
    }

    function parameterStep(parameter) {
        if (parameter.step != null) return Number(parameter.step) || 1;
        const range = Number(parameter.max) - Number(parameter.min);
        if (['functional_group', 'layer', 'rectangles', 'oxygen', 'fuel', 'monomers'].includes(parameter.id)) return 1;
        if (range > 20) return 1;
        if (range > 5) return 0.5;
        return 0.1;
    }

    function formatParameterValue(parameter) {
        const value = parameterValue(parameter);
        const step = parameterStep(parameter);
        const formatted = step >= 1 ? String(Math.round(value)) : value.toFixed(step < 0.1 ? 2 : 1);
        return `${formatted}${parameter.unit ? ' ' + parameter.unit : ''}`;
    }

    function resetSliderValues(simulation) {
        sliderValues = {};
        (simulation?.parameters || []).forEach((parameter) => {
            sliderValues[parameter.id] = Number(parameter.default ?? parameter.min ?? 0);
        });
    }

    function applySessionState(session) {
        const saved = session?.state?.parameters || {};
        if (!saved || typeof saved !== 'object') return;
        (activeSimulation().parameters || []).forEach((parameter) => {
            const value = Number(saved[parameter.id]);
            if (Number.isFinite(value)) {
                sliderValues[parameter.id] = clamp(value, Number(parameter.min ?? value), Number(parameter.max ?? value));
            }
        });
    }

    function getRequestedSessionId() {
        const params = Router().getQueryParams ? Router().getQueryParams() : new URLSearchParams(window.location.search || '');
        return params.get('session_id') || params.get('sesión') || '';
    }

    function formatSessionDate(rawDate) {
        const date = new Date(rawDate);
        if (!Number.isFinite(date.getTime())) return 'Fecha reciente';
        return date.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function formatSessionDuration(seconds) {
        const value = Number(seconds || 0);
        if (!value) return 'Sin duracion';
        if (value < 60) return `${Math.max(1, Math.round(value))} seg`;
        return `${Math.round(value / 60)} min`;
    }

    function formatSavedAt(date = new Date()) {
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function stopAnimation() {
        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function disposeExternalSimulator({ invalidate = true } = {}) {
        if (invalidate) externalRenderGeneration += 1;
        if (externalReadinessTimer) {
            window.clearTimeout(externalReadinessTimer);
            externalReadinessTimer = null;
        }
        if (externalLoaderFallbackTimer) {
            window.clearTimeout(externalLoaderFallbackTimer);
            externalLoaderFallbackTimer = null;
        }

        const frame = externalFrame || document.getElementById('lab-external-frame');
        if (frame && externalFrameLoadHandler) {
            frame.removeEventListener('load', externalFrameLoadHandler);
        }
        externalFrameLoadHandler = null;
        externalFrame = null;

        if (frame) {
            try {
                frame.src = 'about:blank';
            } catch (error) {
                // The frame may already have been detached by the router.
            }
            frame.remove();
        }
    }

    function setSimulatorMode(enabled) {
        document.body.classList.toggle('is-lab-simulator', Boolean(enabled));
        if (!enabled) {
            fallbackFullscreenActive = false;
            document.body.classList.remove('is-lab-fallback-fullscreen');
        }
    }

    function setExternalSimulatorMode(enabled) {
        document.body.classList.toggle('is-lab-external-simulator', Boolean(enabled));
        if (!enabled) {
            disposeExternalSimulator();
            externalFullscreenActive = false;
            document.body.classList.remove('is-lab-external-fallback-fullscreen');
        }
    }

    function updateFullscreenButton() {
        const button = document.querySelector('[data-lab-fullscreen]');
        if (!button) return;
        const active = Boolean(document.fullscreenElement) || fallbackFullscreenActive;
        button.classList.toggle('is-active', active);
        const label = button.querySelector('span');
        if (label) label.textContent = active ? 'Salir de pantalla completa' : 'Pantalla completa';
        button.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Entrar en pantalla completa');
    }

    function renderPaywall(message) {
        stopAnimation();
        setSimulatorMode(false);
        setExternalSimulatorMode(false);
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="lab-page lab-page--paywall">
                <div class="lab-paywall">
                    <span class="pricing-eyebrow">Laboratorio premium</span>
                    <h1>Activa EducatIA para entrar al laboratorio.</h1>
                    <p>${esc(message || 'El laboratorio de aprendizaje está disponible para alumnos con suscripción activa.')}</p>
                    <div class="lab-paywall__actions">
                        <a href="${Router().toUrl('/registro-alumno')}" class="btn btn--primary">Registrarme gratis</a>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Volver</a>
                    </div>
                </div>
            </section>
        `;
    }

    function renderLabError(message) {
        stopAnimation();
        setSimulatorMode(false);
        setExternalSimulatorMode(false);
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="lab-page lab-page--paywall">
                <div class="lab-paywall">
                    <span class="pricing-eyebrow">Laboratorio</span>
                    <h1>No pudimos cargar el laboratorio.</h1>
                    <p>${esc(message || 'Revisa tu conexión e inténtalo de nuevo.')}</p>
                    <div class="lab-paywall__actions">
                        <button type="button" class="btn btn--primary" data-lab-retry>Reintentar</button>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Volver</a>
                    </div>
                </div>
            </section>
        `;
        document.querySelector('[data-lab-retry]')?.addEventListener('click', () => {
            const route = Router().getCurrentRoute?.() || '';
            if (/^\/laboratorio-aprendizaje\/experimento\/[^/]+\/[^/]+/.test(route)) {
                const [, , , subjectId, simulationId] = route.split('/');
                renderExternalSimulation({ subjectId, simulationId });
                return;
            }
            if (/^\/laboratorio-aprendizaje\/[^/]+\/[^/]+/.test(route)) {
                const [, , subjectId, simulationId] = route.split('/');
                renderSimulation({ subjectId, simulationId });
                return;
            }
            render();
        });
    }

    function isAccessError(error) {
        return /suscripci[oó]n|premium|acceso/i.test(String(error?.message || error || ''));
    }

    function renderHero() {
        const firstSimulation = firstVisibleExternalSimulation();
        const primaryHref = firstSimulation
            ? externalSimulationUrl('fisica', firstSimulation.id)
            : Router().toUrl('/laboratorio-aprendizaje');
        return `
            <section class="lab-hero lab-hero--workspace">
                <img class="lab-hero__image" src="assets/laboratorio/learning-lab-hero-illustrated.webp?v=20260727labvisual1" alt="Ilustración de fenómenos interactivos de Física" decoding="async" fetchpriority="high">
                <div class="lab-hero__copy">
                    <span class="pricing-eyebrow">Experimentos interactivos</span>
                    <h1>${esc(labData?.title || 'Laboratorio de aprendizaje')}</h1>
                    <p>Simuladores HTML5 de Física con animaciones, variables y controles para observar cada fenómeno directamente.</p>
                    <div class="lab-hero__actions">
                        <a href="${primaryHref}" class="btn btn--primary">Abrir primer simulador</a>
                        <a href="${anatomyLabUrl()}" class="btn btn--outline" data-full-navigation>Explorar anatom\u00eda</a>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Mi aprendizaje</a>
                    </div>
                    <div class="lab-hero__metrics" aria-label="Resumen del laboratorio">
                        <article><strong>${subjectList().length + 1}</strong><span>materias</span></article>
                        <article><strong>${totalSimulationCount()}</strong><span>simuladores</span></article>
                        <article><strong>100%</strong><span>interactivo</span></article>
                    </div>
                </div>
            </section>
        `;
    }

    function renderPremedicalAnatomyFeature() {
        return `
            <section class="lab-anatomy-feature" aria-labelledby="lab-anatomy-title">
                <div class="lab-anatomy-feature__copy">
                    <span class="pricing-eyebrow">Premedicina · laboratorio 3D</span>
                    <h2 id="lab-anatomy-title">Explora anatom\u00eda humana por sistemas</h2>
                    <p>Ubica estructuras, observa modelos en tres dimensiones y relaciona cada \u00f3rgano con su funci\u00f3n antes de resolver los reactivos de Premedicina.</p>
                    <ul class="lab-anatomy-feature__list">
                        <li>Modelos interactivos de coraz\u00f3n, cerebro, pulmones, h\u00edgado y otros \u00f3rganos.</li>
                        <li>Vista libre, capas anat\u00f3micas y fichas de estudio para repasar con claridad.</li>
                    </ul>
                    <a href="${anatomyLabUrl()}" class="btn btn--primary" data-full-navigation>Abrir laboratorio de anatom\u00eda <span aria-hidden="true">&rarr;</span></a>
                </div>
                <div class="lab-anatomy-feature__visual" aria-hidden="true">
                    <span class="lab-anatomy-feature__ring lab-anatomy-feature__ring--one"></span>
                    <span class="lab-anatomy-feature__ring lab-anatomy-feature__ring--two"></span>
                    <strong>ANATOM\u00cdA<br>HUMANA</strong>
                    <small>exploraci\u00f3n 3D</small>
                </div>
            </section>
        `;
    }

    function renderSubjectRail() {
        return `
            <aside class="lab-subject-rail" aria-label="Materias del laboratorio">
                <div class="lab-subject-rail__head">
                    <span class="pricing-eyebrow">Materias</span>
                    <strong>Elige un laboratorio</strong>
                </div>
                ${subjectList().map((subject) => `
                    <button type="button" class="lab-subject lab-subject--${esc(subject.accent || 'blue')} ${subject.id === activeSubjectId ? 'is-active' : ''}" data-lab-subject="${esc(subject.id)}">
                        ${subjectIcon(subject.id)}
                        <span class="lab-subject__copy">
                            <strong>${esc(subject.title)}</strong>
                            <small>${esc(subject.subtitle || subject.description || '')}</small>
                        </span>
                        <em>${subjectSimulationCount(subject)} experiencias</em>
                    </button>
                `).join('')}
            </aside>
        `;
    }

    function renderSimulationTabs(subject) {
        return `
            <div class="lab-sim-tabs" aria-label="Simuladores de ${esc(subject.title)}">
                ${(subject.simulations || []).map((simulation) => `
                    <a class="${simulation.id === activeSimulationId ? 'is-active' : ''}" href="${simulationUrl(subject.id, simulation.id)}">
                        ${esc(simulation.title)}
                    </a>
                `).join('')}
            </div>
        `;
    }

    function externalSimulationVisualKey(simulationId) {
        const visuals = {
            'balancing-act': 'balance',
            'bending-light': 'light',
            buoyancy: 'balance',
            'calculus-grapher': 'graph',
            'coulombs-law': 'field',
            'curve-fitting': 'graph',
            density: 'balance',
            'energy-skate-park': 'balance',
            'faradays-electromagnetic-lab': 'circuit',
            'faradays-law': 'circuit',
            'forces-and-motion-basics': 'balance',
            'fourier-making-waves': 'wave',
            'gas-properties': 'fluid',
            'geometric-optics-basics': 'light',
            'gravity-force-lab-basics': 'field',
            'keplers-laws': 'orbit',
            'magnet-and-compass': 'circuit',
            'magnets-and-electromagnets': 'circuit',
            'masses-and-springs-basics': 'balance',
            'ohms-law': 'circuit',
            'projectile-data-lab': 'orbit',
            'projectile-motion': 'orbit',
            'sound-waves': 'wave',
            'under-pressure': 'fluid',
            'vector-addition': 'graph',
            'wave-interference': 'wave',
            'wave-on-a-string': 'wave'
        };
        return visuals[simulationId] || 'graph';
    }

    function renderExternalSimulationVisual(simulation, subject) {
        const visual = externalSimulationVisualKey(simulation.id);
        return `
            <span class="lab-external-card__preview" data-visual="${visual}" aria-hidden="true">
                <img src="${Router().toUrl(`assets/laboratorio-simuladores/portadas/${visual}.webp`)}?v=20260727labvisual1" alt="" loading="lazy" decoding="async">
                <span class="lab-external-card__preview-label">${esc(subject.title)} · simulador</span>
                <span class="lab-external-card__preview-state">Explorar</span>
            </span>
        `;
    }

    function renderExternalSimulationSection(subject) {
        const simulations = externalSimulationsForSubject(subject.id);
        if (!simulations.length) return '';
        return `
            <section class="lab-external-catalog" aria-labelledby="lab-external-title-${esc(subject.id)}">
                <div class="lab-external-catalog__head">
                    <div>
                        <span class="pricing-eyebrow">Experimentos inmersivos</span>
                        <h2 id="lab-external-title-${esc(subject.id)}">Explora simuladores</h2>
                        <p>Elige una práctica visual, cambia variables y abre su entorno de pantalla completa.</p>
                    </div>
                    <span class="lab-external-catalog__count">${simulations.length} simuladores</span>
                </div>
                <div class="lab-external-catalog__grid">
                    ${simulations.map((simulation) => `
                        <a class="lab-external-card" href="${externalSimulationUrl(subject.id, simulation.id)}">
                            ${renderExternalSimulationVisual(simulation, subject)}
                            <span class="lab-external-card__body">
                                <strong>${esc(simulation.label)}</strong>
                                <small>${esc(simulation.summary)}</small>
                            </span>
                            <span class="lab-external-card__footer">
                                <span>Variables y controles</span>
                                <span class="lab-external-card__source">Abrir <b aria-hidden="true">→</b></span>
                            </span>
                        </a>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderParameters(simulation) {
        return `
            <div class="lab-parameter-grid">
                ${(simulation.parameters || []).map((parameter) => `
                    <label class="lab-parameter">
                        <span>${esc(parameter.label)} <strong data-lab-param-value="${esc(parameter.id)}">${esc(formatParameterValue(parameter))}</strong></span>
                        <input type="range"
                            min="${esc(parameter.min)}"
                            max="${esc(parameter.max)}"
                            step="${esc(parameterStep(parameter))}"
                            value="${esc(parameterValue(parameter))}"
                            aria-label="${esc(parameter.label)}"
                            data-lab-param="${esc(parameter.id)}">
                        <small>Rango: ${esc(parameter.min)}–${esc(parameter.max)}${parameter.unit ? ` ${esc(parameter.unit)}` : ''}</small>
                    </label>
                `).join('')}
            </div>
        `;
    }

    function renderConceptList(simulation) {
        return `
            <div class="lab-chip-list">
                ${(simulation.concepts || []).map((concept) => `<span>${esc(concept)}</span>`).join('')}
            </div>
        `;
    }

    function renderInsightPanel(simulation) {
        return `
            <section class="lab-insight-panel">
                <div>
                    <span class="pricing-eyebrow">Observa</span>
                    <ul>
                        ${(simulation.observations || []).map((item) => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <span class="pricing-eyebrow">Práctica guiada</span>
                    <ol>
                        ${(simulation.practice || []).map((item) => `<li>${esc(item)}</li>`).join('')}
                    </ol>
                </div>
            </section>
        `;
    }

    function renderChallengePanel(simulation) {
        const challenges = simulation.challenges || [];
        const questions = simulation.mini_questions || [];
        const achievement = simulation.achievement || null;
        const feedback = simulation.feedback_rules || [];
        return `
            <section class="lab-control-panel lab-challenge-panel">
                <span class="pricing-eyebrow">Retos por nivel</span>
                <div class="lab-challenge-list">
                    ${challenges.map((challenge) => `
                        <article>
                            <span>${esc(challenge.level || 'Reto')}</span>
                            <strong>${esc(challenge.title || 'Explora')}</strong>
                            <p>${esc(challenge.prompt || '')}</p>
                        </article>
                    `).join('')}
                </div>
                ${questions.length ? `
                    <div class="lab-mini-questions" aria-label="Mini preguntas del simulador">
                        <strong>Mini preguntas</strong>
                        ${questions.slice(0, 2).map((question, questionIndex) => `
                            <article class="lab-mini-question" data-lab-question="${questionIndex}">
                                <p>${esc(question.prompt)}</p>
                                <div>
                                    ${(question.options || []).map((option, optionIndex) => `
                                        <button type="button" data-lab-question-choice="${questionIndex}" data-lab-question-answer="${optionIndex}">
                                            ${esc(option)}
                                        </button>
                                    `).join('')}
                                </div>
                                <small id="lab-question-feedback-${questionIndex}" aria-live="polite"></small>
                            </article>
                        `).join('')}
                    </div>
                ` : ''}
                ${achievement ? `
                    <div class="lab-achievement-card">
                        <span>Logro</span>
                        <strong>${esc(achievement.title)}</strong>
                        <p>${esc(achievement.description || '')}</p>
                        <small>${esc(achievement.criteria || '')}</small>
                    </div>
                ` : ''}
                ${feedback.length ? `
                    <div class="lab-feedback-rules">
                        ${feedback.map((rule) => `<span>${esc(rule)}</span>`).join('')}
                    </div>
                ` : ''}
            </section>
        `;
    }

    function renderAlePanel(subject, simulation) {
        if (!aleEnabled()) return '';
        return `
            <aside class="lab-ale-panel">
                <div class="lab-ale-panel__head">
                    <img src="assets/ale_icono/icono_ale.png" alt="" loading="lazy">
                    <div>
                        <span class="pricing-eyebrow">Bill contextual</span>
                        <strong>${esc(subject.title)} - ${esc(simulation.title)}</strong>
                    </div>
                </div>
                <p>El tutor virtual contextual para el laboratorio está en desarrollo.</p>
                <div class="lab-ale-panel__prompt">Mientras tanto, usa los retos, observaciones y mini preguntas de esta simulación.</div>
            </aside>
        `;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function renderFormulaPreview(type) {
        const values = sliderValues;
        if (type === 'wave-lab') {
            const frequency = Number(values.frequency || 2.4);
            const wavelength = Number(values.wavelength || 4);
            return { main: `${(frequency * wavelength).toFixed(2)} m/s`, note: 'Velocidad de onda = frecuencia x longitud de onda.' };
        }
        if (type === 'pendulum-mas') {
            const length = Number(values.length || 1.2);
            const gravity = Math.max(0.1, Number(values.gravity || 9.8));
            const period = 2 * Math.PI * Math.sqrt(length / gravity);
            return { main: `${period.toFixed(2)} s`, note: 'Periodo ideal: T = 2*pi*raiz(L/g).' };
        }
        if (type === 'human-anatomy') {
            const layers = ['Sistema óseo', 'Sistema muscular', 'Órganos internos', 'Sistema nervioso', 'Sistema cardiovascular'];
            const layer = clamp(Math.round(Number(values.layer || 3)), 1, layers.length);
            return { main: layers[layer - 1], note: 'Explora la ubicación y selecciona una estructura para relacionarla con su función.' };
        }
        if (type === 'optics-lens') {
            const objectDistance = Number(values.object_distance || 120);
            const focal = -Math.max(1, Number(values.focal || 70));
            const imageDistance = 1 / ((1 / focal) - (1 / objectDistance));
            const magnification = -imageDistance / objectDistance;
            return { main: `${Math.abs(imageDistance).toFixed(1)} cm`, note: `Imagen virtual derecha, aumento ${magnification.toFixed(2)}x.` };
        }
        if (type === 'force-equilibrium') {
            const mass = Number(values.mass || 10);
            const angle = Number(values.angle || 28) * Math.PI / 180;
            const mu = Number(values.friction || 0.28);
            const parallel = mass * 9.8 * Math.sin(angle);
            const normal = mass * 9.8 * Math.cos(angle);
            const tension = Math.max(0, parallel - (mu * normal));
            return { main: `${tension.toFixed(1)} N`, note: `Tension minima contra deslizamiento; N = ${normal.toFixed(1)} N.` };
        }
        if (type === 'rotation-torque') {
            const mass = Number(values.mass || 4);
            const radius = Number(values.radius || 1.4);
            const force = Number(values.force || 32);
            const inertia = mass * radius * radius;
            const torque = force * radius;
            return { main: `${torque.toFixed(1)} N*m`, note: `I = ${inertia.toFixed(2)} kg*m2; alpha = ${(torque / Math.max(0.1, inertia)).toFixed(2)} rad/s2.` };
        }
        if (type === 'electromagnetism-lorentz') {
            const q = Number(values.charge || 2);
            const v = Number(values.velocity || 36);
            const b = Number(values.magnetic || 1.2);
            return { main: `${(q * v * b).toFixed(1)} uN`, note: 'Fuerza de Lorentz simulada: F = q v B.' };
        }
        if (type === 'inelastic-collision') {
            const ma = Number(values.mass_a || 4);
            const mb = Number(values.mass_b || 7);
            const va = Number(values.velocity_a || 9);
            const vf = (ma * va) / (ma + mb);
            return { main: `${vf.toFixed(2)} m/s`, note: 'Velocidad final unida por conservacion de momentum.' };
        }
        if (type === 'calculus-slope') {
            const x = Number(values.x || 1);
            const h = Math.max(0.05, Number(values.h || 0.8));
            const slope = 0.75 * x * x - 0.8;
            const secant = (((0.25 * Math.pow(x + h, 3)) - 0.8 * (x + h)) - ((0.25 * Math.pow(x, 3)) - 0.8 * x)) / h;
            return { main: `m ${slope.toFixed(2)}`, note: `Secante con h=${h.toFixed(1)}: ${secant.toFixed(2)}. Al bajar h se acerca a la tangente.` };
        }
        if (type === 'calculus-area') {
            const rectangles = Math.round(Number(values.rectangles || 12));
            const width = Number(values.width || 6);
            const area = width + Math.pow(width, 3) / 24;
            return { main: `${area.toFixed(2)} u2`, note: `${rectangles} rectangulos en ${width.toFixed(1)} u de ancho; compara suma y area real.` };
        }
        if (type === 'calculus-optimization') {
            const constraint = Number(values.constraint || 12);
            const shape = Number(values.shape || 50) / 100;
            const x = constraint * shape;
            const y = Math.max(0.1, constraint - x);
            const area = x * y;
            return { main: `${area.toFixed(1)} u2`, note: `Proporcion ${Math.round(shape * 100)}%; el máximo aparece cerca de repartir la restriccion.` };
        }
        if (type === 'chem-balance') {
            const a = Math.round(Number(values.reactant_a || 2));
            const b = Math.round(Number(values.reactant_b || 3));
            return { main: `${a}:${b}`, note: 'Ajusta coeficientes, no subindices, para conservar atomos.' };
        }
        if (type === 'chem-ph') {
            const hydrogen = Number(values.hydrogen || 7);
            const dilution = Number(values.dilution || 2);
            const ph = clamp(hydrogen + Math.log10(Math.max(1, dilution)), 0, 14);
            return { main: `pH ${ph.toFixed(1)}`, note: ph < 6.8 ? 'Acida' : ph > 7.2 ? 'Basica' : 'Casi neutra' };
        }
        if (type === 'chem-stoichiometry') {
            const mass = Number(values.mass || 36);
            const molarMass = Math.max(0.1, Number(values.molar_mass || 18));
            return { main: `${(mass / molarMass).toFixed(2)} mol`, note: 'moles = masa / masa molar; desde ahí se usa la proporción.' };
        }
        if (type === 'molecular-geometry') {
            const gap = Number(values.electronegativity_gap || 1.9);
            const angle = Number(values.bond_angle || 120);
            return { main: gap >= 1.7 ? 'Ionico' : 'Covalente', note: angle > 110 && angle < 130 ? 'Carbono central compatible con sp2 trigonal plana.' : 'Ajusta hacia 120 grados para eteno sp2.' };
        }
        if (type === 'cis-trans-organic') {
            const gap = Number(values.substituent_gap || 35);
            const group = Number(values.functional_group || 1);
            const names = ['ester', 'acido carboxilico', 'cetona'];
            return { main: `${gap < 50 ? 'Cis' : 'Trans'} / ${names[clamp(Math.round(group) - 1, 0, 2)]}`, note: `Grupo funcional mostrado: ${names[clamp(Math.round(group) - 1, 0, 2)]}; mueve separacion para cambiar cis/trans.` };
        }
        if (type === 'chemical-equilibrium') {
            const reactants = Math.max(0.01, Number(values.reactants || 1.6));
            const products = Math.max(0.01, Number(values.products || 1.2));
            return { main: `Kc ${Math.pow(products, 2).toFixed(2)}/${reactants.toFixed(2)}`, note: `Kc aproximada = ${(products * products / reactants).toFixed(2)}.` };
        }
        if (type === 'solution-solubility') {
            const solute = Number(values.solute || 1.2);
            const volume = Math.max(0.01, Number(values.volume || 1));
            const temperature = Number(values.temperature || 30);
            const molarity = solute / volume;
            const limit = 2 + (temperature / 60);
            return { main: `${molarity.toFixed(2)} M`, note: solute > limit ? 'Solucion saturada: queda soluto sin disolver.' : 'Solucion insaturada: el soluto se dispersa.' };
        }
        if (type === 'stoichiometry-balancing') {
            const oxygen = Number(values.oxygen || 2);
            return { main: oxygen >= 2 ? 'Balance viable' : 'Falta O2', note: 'Combustion base: CH4 + 2O2 -> CO2 + 2H2O.' };
        }
        if (type === 'biochemistry-structure') {
            const monomers = Number(values.monomers || 5);
            const folding = Number(values.folding || 45);
            return { main: `${Math.round(monomers)} unidades`, note: `Plegamiento visual ${folding.toFixed(0)}%; busca el enlace peptidico.` };
        }
        if (type === 'human-3d') {
            const layer = Math.round(Number(values.layer || 3));
            const depth = Number(values.marker_depth || 70);
            const layers = ['oseo', 'muscular', 'organos', 'nervioso', 'cardiovascular'];
            return { main: `Capa ${layer}`, note: `${layers[clamp(layer - 1, 0, 4)]}; marcadores al ${depth.toFixed(0)}% de profundidad visual.` };
        }
        if (type === 'human-system') {
            const speed = Number(values.signal_speed || 72);
            const stimulus = Number(values.stimulus || 45);
            return { main: `${speed.toFixed(0)}% señal`, note: `Estímulo ${stimulus.toFixed(0)}%; mayor intensidad activa más respuesta.` };
        }
        if (type === 'medicine-vitals') {
            const hr = Number(values.heart_rate || 78);
            const temp = Number(values.temperature || 37);
            const respiration = Number(values.respiration || 16);
            const alert = hr > 110 || temp >= 38 || respiration > 24 || respiration < 10;
            const findings = [
                hr < 60 ? 'bradicardia' : hr > 100 ? 'taquicardia' : '',
                temp < 36 ? 'temperatura baja' : temp >= 38 ? 'fiebre' : '',
                respiration < 12 ? 'bradipnea' : respiration > 20 ? 'taquipnea' : '',
            ].filter(Boolean);
            return {
                main: alert ? 'Vigilar' : 'Estable',
                note: `FC ${hr.toFixed(0)} lpm, Temp ${temp.toFixed(1)} C, Resp ${respiration.toFixed(0)} rpm. ${findings.length ? `Atención educativa: ${findings.join(', ')}.` : 'Valores de referencia de adulto en reposo.'}`,
            };
        }
        if (type === 'medicine-case') {
            const oxygen = Number(values.oxygen || 92);
            const respiration = Number(values.respiration || 20);
            const severity = oxygen < 90 || respiration > 28 ? 'Prioridad alta' : oxygen < 94 ? 'Observacion' : 'Estable';
            const oxygenNote = oxygen < 90
                ? 'Una saturación baja reduce el oxígeno disponible para la sangre; observa el cambio visual alveolar y relaciona ventilación con intercambio gaseoso.'
                : 'Relaciona ventilación, saturación e intercambio gaseoso antes de decidir la prioridad.';
            return { main: severity, note: `SpO2 ${oxygen.toFixed(0)}%, respiracion ${respiration.toFixed(0)} rpm. ${oxygenNote}` };
        }
        if (type === 'physics-trajectory') {
            const v = Number(values.velocity || 42);
            const angle = Number(values.angle || 38);
            const g = Number(values.gravity || 9.8);
            const rad = angle * Math.PI / 180;
            const range = (v * v * Math.sin(2 * rad) / g).toFixed(1);
            const height = ((v * Math.sin(rad)) ** 2 / (2 * g)).toFixed(1);
            return { main: `${range} m`, note: `Altura maxima aproximada: ${height} m.` };
        }
        if (type === 'force-lab') {
            const force = Number(values.force || 48);
            const mass = Number(values.mass || 8);
            const friction = Number(values.friction || 10);
            return { main: `${Math.max(0, (force - friction) / mass).toFixed(2)} m/s2`, note: `Fuerza neta: ${Math.max(0, force - friction).toFixed(1)} N.` };
        }
        if (type === 'circuit-lab') {
            const voltage = Number(values.voltage || 12);
            const resistance = Math.max(0.1, Number(values.resistance || 8));
            return { main: `${(voltage / resistance).toFixed(2)} A`, note: 'Modelo base: I = V / R.' };
        }
        return { main: 'Simulacion activa', note: 'Ajusta parametros y explica el cambio.' };
    }

    function renderGenericStage(simulation) {
        const preview = renderFormulaPreview(simulation.type);
        return `
            <div class="lab-visual lab-visual--canvas lab-visual--${esc(simulation.type || 'generic')}">
                <canvas id="lab-sim-canvas" aria-label="Simulador 2D de ${esc(simulation.title)}"></canvas>
                <div class="lab-visual__readout">
                    <span>${esc(simulation.type || 'simulacion')}</span>
                    <strong id="lab-preview-main">${esc(preview.main)}</strong>
                    <small id="lab-preview-note">${esc(preview.note)}</small>
                </div>
            </div>
        `;
    }

    function drawRoundRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    function fillText(ctx, text, x, y, color, size, weight) {
        ctx.fillStyle = color || '#243047';
        ctx.font = `${weight || 800} ${size || 14}px Inter, Arial, sans-serif`;
        ctx.fillText(text, x, y);
    }

    function drawArrow(ctx, x1, y1, x2, y2, color, label) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 12 * Math.cos(angle - Math.PI / 6), y2 - 12 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - 12 * Math.cos(angle + Math.PI / 6), y2 - 12 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
        if (label) {
            fillText(ctx, label, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, color, 13);
        }
    }

    function drawBackground(ctx, w, h) {
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#f8fbff');
        gradient.addColorStop(1, '#e9f6ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(33, 95, 154, .08)';
        ctx.lineWidth = 1;
        for (let x = 32; x < w; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 32; y < h; y += 48) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    function drawScene(ctx, w, h, simulation, time) {
        const type = simulation.type;
        const v = sliderValues;
        drawBackground(ctx, w, h);
        if (type === 'wave-lab') return drawWave(ctx, w, h, v, time);
        if (type === 'pendulum-mas') return drawPendulum(ctx, w, h, v, time);
        if (type === 'optics-lens') return drawOptics(ctx, w, h, v);
        if (type === 'force-equilibrium') return drawForces(ctx, w, h, v);
        if (type === 'rotation-torque') return drawRotation(ctx, w, h, v, time);
        if (type === 'electromagnetism-lorentz') return drawElectromag(ctx, w, h, v, time);
        if (type === 'inelastic-collision') return drawCollision(ctx, w, h, v, time);
        if (type === 'calculus-slope') return drawCalculusSlope(ctx, w, h, v);
        if (type === 'calculus-area') return drawCalculusArea(ctx, w, h, v);
        if (type === 'calculus-optimization') return drawCalculusOptimization(ctx, w, h, v);
        if (type === 'chem-balance') return drawChemBalance(ctx, w, h, v);
        if (type === 'chem-ph') return drawChemPh(ctx, w, h, v);
        if (type === 'chem-stoichiometry') return drawChemStoichiometry(ctx, w, h, v);
        if (type === 'molecular-geometry') return drawMolecular(ctx, w, h, v, time);
        if (type === 'cis-trans-organic') return drawCisTrans(ctx, w, h, v);
        if (type === 'chemical-equilibrium') return drawEquilibrium(ctx, w, h, v, time);
        if (type === 'solution-solubility') return drawSolution(ctx, w, h, v, time);
        if (type === 'stoichiometry-balancing') return drawStoich(ctx, w, h, v, time);
        if (type === 'biochemistry-structure') return drawBio(ctx, w, h, v, time);
        if (type === 'human-system') return drawHumanSystem(ctx, w, h, v, time);
        if (type === 'medicine-vitals') return drawVitals(ctx, w, h, v, time);
        if (type === 'medicine-case') return drawRespiratoryCase(ctx, w, h, v, time);
        return drawDefault(ctx, w, h, v, time);
    }

    function drawWave(ctx, w, h, v, time) {
        const amp = Number(v.amplitude || 42) * (h / 520);
        const freq = Number(v.frequency || 2.4);
        const wave = Number(v.wavelength || 4);
        const mid = h * 0.52;
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let x = 40; x <= w - 40; x += 5) {
            const y = mid + amp * Math.sin((x / (wave * 34)) + time * freq * 1.8);
            if (x === 40) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        for (let i = 0; i < 13; i += 1) {
            const x = 70 + i * ((w - 140) / 12);
            const y = mid + amp * Math.sin((x / (wave * 34)) + time * freq * 1.8);
            ctx.fillStyle = i % 2 ? '#ffb545' : '#22a06b';
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        drawArrow(ctx, 62, h * 0.22, w - 78, h * 0.22, '#ef6c35', 'energia');
        fillText(ctx, 'partículas oscilan', 62, h - 42, '#275071', 15);
    }

    function drawPendulum(ctx, w, h, v, time) {
        const length = Number(v.length || 1.2);
        const gravity = Math.max(0.1, Number(v.gravity || 9.8));
        const angleMax = Number(v.angle || 18) * Math.PI / 180;
        const period = 2 * Math.PI * Math.sqrt(length / gravity);
        const angle = angleMax * Math.cos((time * 2 * Math.PI) / period);
        const pivotX = w * 0.5;
        const pivotY = h * 0.16;
        const rod = Math.min(h * 0.58, 140 + length * 72);
        const bobX = pivotX + Math.sin(angle) * rod;
        const bobY = pivotY + Math.cos(angle) * rod;
        ctx.strokeStyle = 'rgba(39, 80, 113, .24)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, rod, Math.PI / 2 - angleMax, Math.PI / 2 + angleMax);
        ctx.stroke();
        ctx.strokeStyle = '#243047';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        ctx.fillStyle = '#ff6f61';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#243047';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
        ctx.fill();
        drawArrow(ctx, bobX, bobY, bobX, bobY + 70, '#d94841', 'peso');
        fillText(ctx, 'equilibrio', pivotX - 34, pivotY + rod + 42, '#275071', 14);
    }

    function drawOptics(ctx, w, h, v) {
        const axisY = h * 0.52;
        const lensX = w * 0.52;
        const objDist = Number(v.object_distance || 120);
        const focal = Number(v.focal || 70);
        const objX = lensX - clamp(objDist * 1.65, 120, lensX - 50);
        const objH = 92;
        const imgX = lensX - clamp((focal * objDist) / (objDist + focal) * 1.65, 36, 120);
        const imgH = objH * (Math.abs(imgX - lensX) / Math.max(80, objDist * 1.65));
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(34, axisY);
        ctx.lineTo(w - 34, axisY);
        ctx.stroke();
        ctx.fillStyle = 'rgba(29, 111, 214, .22)';
        drawRoundRect(ctx, lensX - 13, axisY - 150, 26, 300, 13);
        ctx.fill();
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 4;
        ctx.stroke();
        drawArrow(ctx, objX, axisY, objX, axisY - objH, '#22a06b', 'objeto');
        ctx.setLineDash([8, 7]);
        drawArrow(ctx, imgX, axisY, imgX, axisY - imgH, '#ef6c35', 'imagen virtual');
        ctx.setLineDash([]);
        ctx.strokeStyle = '#e4572e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(objX, axisY - objH);
        ctx.lineTo(lensX, axisY - objH);
        ctx.lineTo(w - 58, axisY - objH - 54);
        ctx.stroke();
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.moveTo(lensX, axisY - objH);
        ctx.lineTo(imgX, axisY - imgH);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawForces(ctx, w, h, v) {
        const angle = Number(v.angle || 28) * Math.PI / 180;
        const baseX = w * 0.18;
        const baseY = h * 0.74;
        const planeLen = w * 0.62;
        const topX = baseX + Math.cos(angle) * planeLen;
        const topY = baseY - Math.sin(angle) * planeLen;
        ctx.strokeStyle = '#55657a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(topX, topY);
        ctx.stroke();
        const bx = baseX + (topX - baseX) * 0.48;
        const by = baseY + (topY - baseY) * 0.48;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-angle);
        ctx.fillStyle = '#ffb545';
        drawRoundRect(ctx, -38, -38, 76, 62, 8);
        ctx.fill();
        ctx.restore();
        drawArrow(ctx, bx, by, bx, by + 105, '#d94841', 'mg');
        drawArrow(ctx, bx, by, bx - Math.sin(angle) * 95, by - Math.cos(angle) * 95, '#1d6fd6', 'N');
        drawArrow(ctx, bx, by, bx - Math.cos(angle) * 95, by + Math.sin(angle) * 95, '#22a06b', 'friccion');
        drawArrow(ctx, bx, by, bx + Math.cos(angle) * 110, by - Math.sin(angle) * 110, '#ef6c35', 'tension');
    }

    function drawRotation(ctx, w, h, v, time) {
        const cx = w * 0.48;
        const cy = h * 0.52;
        const radius = Number(v.radius || 1.4);
        const force = Number(v.force || 32);
        const arm = clamp(radius * 86, 60, Math.min(w, h) * 0.36);
        const a = time * (0.5 + force / 120);
        const x = cx + Math.cos(a) * arm;
        const y = cy + Math.sin(a) * arm;
        ctx.strokeStyle = 'rgba(36, 48, 71, .24)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, arm, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#243047';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = '#1d6fd6';
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6f61';
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, Math.PI * 2);
        ctx.fill();
        drawArrow(ctx, x, y, x - Math.sin(a) * 72, y + Math.cos(a) * 72, '#ef6c35', 'F');
    }

    function drawElectromag(ctx, w, h, v, time) {
        const b = Number(v.magnetic || 1.2);
        const radius = clamp(180 / b, 58, 190);
        const cx = w * 0.48;
        const cy = h * 0.52;
        for (let x = 60; x < w - 60; x += 54) {
            for (let y = 72; y < h - 72; y += 54) {
                fillText(ctx, 'x', x, y, 'rgba(29, 111, 214, .42)', 18, 900);
            }
        }
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        const a = time * (0.75 + b / 4);
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;
        ctx.fillStyle = '#ffb545';
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();
        fillText(ctx, '+', px - 6, py + 7, '#243047', 22, 900);
        drawArrow(ctx, px, py, px - Math.sin(a) * 80, py + Math.cos(a) * 80, '#d94841', 'F');
        drawArrow(ctx, w - 190, h - 72, w - 70, h - 72, '#22a06b', 'solenoide B');
    }

    function drawCollision(ctx, w, h, v, time) {
        const ma = Number(v.mass_a || 4);
        const mb = Number(v.mass_b || 7);
        const va = Number(v.velocity_a || 9);
        const p = (time * (0.12 + va / 80)) % 1;
        const y = h * 0.56;
        const leftStart = w * 0.16;
        const hitX = w * 0.52;
        const rightX = w * 0.7;
        const merged = p > 0.58;
        const ax = merged ? hitX + (p - 0.58) * 180 : leftStart + p * (hitX - leftStart) / 0.58;
        const bx = merged ? ax + 44 : rightX;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(48, y + 42);
        ctx.lineTo(w - 48, y + 42);
        ctx.stroke();
        ctx.fillStyle = '#1d6fd6';
        ctx.beginPath();
        ctx.arc(ax, y, 18 + ma, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef6c35';
        ctx.beginPath();
        ctx.arc(bx, y, 18 + mb, 0, Math.PI * 2);
        ctx.fill();
        drawArrow(ctx, 80, y - 86, 210, y - 86, '#22a06b', 'momentum inicial');
        drawArrow(ctx, hitX, y + 100, hitX + 120, y + 100, '#d94841', 'después, unidos');
    }

    function drawAxes(ctx, w, h, left, top, width, height) {
        ctx.strokeStyle = 'rgba(15, 23, 42, .42)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left, top + height);
        ctx.lineTo(left + width, top + height);
        ctx.moveTo(left + width / 2, top + height);
        ctx.lineTo(left + width / 2, top);
        ctx.stroke();
    }

    function drawCalculusSlope(ctx, w, h, v) {
        const x0 = Number(v.x || 1);
        const delta = Math.max(0.05, Number(v.h || 0.8));
        const left = 70;
        const top = 58;
        const width = w - 140;
        const height = h - 138;
        const fx = (x) => 0.25 * Math.pow(x, 3) - 0.8 * x;
        const px = (x) => left + ((x + 4) / 8) * width;
        const py = (y) => top + height - ((y + 4) / 8) * height;
        drawAxes(ctx, w, h, left, top, width, height);
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let x = -4; x <= 4.01; x += 0.08) {
            const cx = px(x);
            const cy = py(fx(x));
            if (x <= -3.99) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        const x1 = clamp(x0, -4, 4);
        const x2 = clamp(x0 + delta, -4, 4);
        const y1 = fx(x1);
        const y2 = fx(x2);
        drawArrow(ctx, px(x1), py(y1), px(x2), py(y2), '#ef6c35', 'secante');
        const tangentSlope = 0.75 * x1 * x1 - 0.8;
        const tx1 = clamp(x1 - 1.2, -4, 4);
        const tx2 = clamp(x1 + 1.2, -4, 4);
        ctx.strokeStyle = '#22a06b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px(tx1), py(y1 + tangentSlope * (tx1 - x1)));
        ctx.lineTo(px(tx2), py(y1 + tangentSlope * (tx2 - x1)));
        ctx.stroke();
        [[x1, y1, '#243047'], [x2, y2, '#ffb545']].forEach(([x, y, color]) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px(x), py(y), 10, 0, Math.PI * 2);
            ctx.fill();
        });
        fillText(ctx, `h = ${delta.toFixed(1)}`, left + 12, top + 28, '#275071', 15);
    }

    function drawCalculusArea(ctx, w, h, v) {
        const rectangles = Math.round(Number(v.rectangles || 12));
        const widthValue = Number(v.width || 6);
        const left = 74;
        const top = 62;
        const width = w - 148;
        const height = h - 142;
        const start = -widthValue / 2;
        const end = widthValue / 2;
        const f = (x) => 1 + (x * x) / 8;
        const xToPx = (x) => left + ((x - start) / widthValue) * width;
        const yToPx = (y) => top + height - (y / 4.4) * height;
        drawAxes(ctx, w, h, left, top, width, height);
        const dx = widthValue / rectangles;
        for (let i = 0; i < rectangles; i += 1) {
            const x = start + i * dx;
            const y = f(x + dx / 2);
            const rx = xToPx(x);
            const rw = Math.max(2, xToPx(x + dx) - rx - 1);
            const ry = yToPx(y);
            ctx.fillStyle = i % 2 ? 'rgba(29,111,214,.30)' : 'rgba(239,108,53,.28)';
            ctx.fillRect(rx, ry, rw, top + height - ry);
            ctx.strokeStyle = 'rgba(15, 23, 42, .28)';
            ctx.strokeRect(rx, ry, rw, top + height - ry);
        }
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let x = start; x <= end + 0.01; x += widthValue / 110) {
            const cx = xToPx(x);
            const cy = yToPx(f(x));
            if (x === start) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        fillText(ctx, `${rectangles} rectangulos`, left + 12, top + 28, '#275071', 15);
        fillText(ctx, `ancho total ${widthValue.toFixed(1)} u`, left + 12, top + 52, '#275071', 13);
    }

    function drawCalculusOptimization(ctx, w, h, v) {
        const constraint = Number(v.constraint || 12);
        const shape = Number(v.shape || 50) / 100;
        const x = constraint * shape;
        const y = constraint - x;
        const area = x * y;
        const maxSide = Math.max(x, y, 1);
        const boxW = clamp((x / maxSide) * (w * 0.48), 72, w * 0.48);
        const boxH = clamp((y / maxSide) * (h * 0.42), 72, h * 0.42);
        const boxX = w * 0.28;
        const boxY = h * 0.55 - boxH / 2;
        ctx.fillStyle = 'rgba(29,111,214,.20)';
        drawRoundRect(ctx, boxX, boxY, boxW, boxH, 10);
        ctx.fill();
        ctx.strokeStyle = '#1d6fd6';
        ctx.lineWidth = 5;
        ctx.stroke();
        drawArrow(ctx, boxX, boxY + boxH + 34, boxX + boxW, boxY + boxH + 34, '#ef6c35', `x ${x.toFixed(1)}`);
        drawArrow(ctx, boxX + boxW + 34, boxY + boxH, boxX + boxW + 34, boxY, '#22a06b', `y ${y.toFixed(1)}`);
        ctx.strokeStyle = 'rgba(36,48,71,.22)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= 20; i += 1) {
            const p = i / 20;
            const a = (constraint * p) * (constraint * (1 - p));
            const px = w * 0.12 + p * w * 0.76;
            const py = h * 0.22 - (a / Math.max(1, constraint * constraint / 4)) * h * 0.12;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        fillText(ctx, `Area ${area.toFixed(1)} u2`, w * 0.12, h * 0.18, '#275071', 16);
        fillText(ctx, `proporcion ${Math.round(shape * 100)}%`, w * 0.12, h - 42, '#275071', 14);
    }

    function drawChemBalance(ctx, w, h, v) {
        const a = Math.round(Number(v.reactant_a || 2));
        const b = Math.round(Number(v.reactant_b || 3));
        const balanced = a * 2 === b || Math.abs(a - b) <= 1;
        const y = h * 0.36;
        fillText(ctx, `${a} A`, w * 0.12, y, '#243047', 30, 900);
        fillText(ctx, '+', w * 0.25, y, '#55657a', 28, 900);
        fillText(ctx, `${b} B2`, w * 0.32, y, '#243047', 30, 900);
        drawArrow(ctx, w * 0.46, y - 8, w * 0.64, y - 8, balanced ? '#22a06b' : '#d94841', balanced ? 'conserva' : 'ajusta');
        fillText(ctx, 'AB', w * 0.7, y, '#243047', 30, 900);
        const count = clamp(a + b, 3, 16);
        for (let i = 0; i < count; i += 1) {
            const x = w * 0.18 + (i % 8) * 64;
            const yy = h * 0.62 + Math.floor(i / 8) * 54;
            ctx.fillStyle = i < a ? '#1d6fd6' : '#ef6c35';
            ctx.beginPath();
            ctx.arc(x, yy, 20, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, i < a ? 'A' : 'B', x - 7, yy + 6, '#fff', 16, 900);
        }
    }

    function drawChemPh(ctx, w, h, v) {
        const hydrogen = Number(v.hydrogen || 7);
        const dilution = Number(v.dilution || 2);
        const ph = clamp(hydrogen + Math.log10(Math.max(1, dilution)), 0, 14);
        const barX = w * 0.16;
        const barY = h * 0.56;
        const barW = w * 0.68;
        const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#22a06b');
        gradient.addColorStop(1, '#1d6fd6');
        ctx.fillStyle = gradient;
        drawRoundRect(ctx, barX, barY, barW, 36, 18);
        ctx.fill();
        const markerX = barX + (ph / 14) * barW;
        drawArrow(ctx, markerX, barY - 90, markerX, barY - 8, '#243047', `pH ${ph.toFixed(1)}`);
        fillText(ctx, 'acido', barX, barY + 68, '#d94841', 15);
        fillText(ctx, 'neutro', barX + barW * 0.46, barY + 68, '#166534', 15);
        fillText(ctx, 'base', barX + barW - 44, barY + 68, '#1d4ed8', 15);
    }

    function drawChemStoichiometry(ctx, w, h, v) {
        const mass = Number(v.mass || 36);
        const molarMass = Math.max(0.1, Number(v.molar_mass || 18));
        const mol = mass / molarMass;
        const scale = clamp(mol / 5, 0.15, 1);
        drawRoundRect(ctx, w * 0.14, h * 0.22, w * 0.28, h * 0.46, 14);
        ctx.fillStyle = 'rgba(29,111,214,.16)';
        ctx.fill();
        drawRoundRect(ctx, w * 0.58, h * 0.22, w * 0.28, h * 0.46, 14);
        ctx.fillStyle = 'rgba(34,160,107,.16)';
        ctx.fill();
        fillText(ctx, `${mass.toFixed(0)} g`, w * 0.2, h * 0.34, '#243047', 28, 900);
        drawArrow(ctx, w * 0.43, h * 0.45, w * 0.57, h * 0.45, '#ef6c35', 'divide');
        fillText(ctx, `${mol.toFixed(2)} mol`, w * 0.63, h * 0.34, '#243047', 28, 900);
        for (let i = 0; i < 12; i += 1) {
            ctx.fillStyle = i / 12 < scale ? '#22a06b' : 'rgba(148,163,184,.35)';
            ctx.beginPath();
            ctx.arc(w * 0.64 + (i % 4) * 38, h * 0.5 + Math.floor(i / 4) * 38, 13, 0, Math.PI * 2);
            ctx.fill();
        }
        fillText(ctx, `masa molar ${molarMass.toFixed(0)} g/mol`, w * 0.18, h - 42, '#275071', 14);
    }

    function drawMolecular(ctx, w, h, v, time) {
        const angle = Number(v.bond_angle || 120) * Math.PI / 180;
        const gap = Number(v.electronegativity_gap || 1.9);
        const cx = w * 0.5;
        const cy = h * 0.5;
        const bond = 112;
        const atoms = [
            [cx, cy, 'C', '#243047'],
            [cx - bond, cy, 'C', '#243047'],
            [cx + Math.cos(angle) * bond, cy - Math.sin(angle) * bond, 'H', '#22a06b'],
            [cx - bond + Math.cos(Math.PI - angle) * bond, cy - Math.sin(Math.PI - angle) * bond, 'H', '#22a06b'],
        ];
        ctx.strokeStyle = '#55657a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx - bond, cy - 8);
        ctx.lineTo(cx, cy - 8);
        ctx.moveTo(cx - bond, cy + 8);
        ctx.lineTo(cx, cy + 8);
        ctx.moveTo(cx, cy);
        ctx.lineTo(atoms[2][0], atoms[2][1]);
        ctx.moveTo(cx - bond, cy);
        ctx.lineTo(atoms[3][0], atoms[3][1]);
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 108, 53, .18)';
        ctx.beginPath();
        ctx.ellipse(cx - bond / 2, cy - 48, 112, 34 + Math.sin(time) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
        atoms.forEach(([x, y, label, color]) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, label === 'C' ? 28 : 21, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, label, x - 8, y + 6, '#fff', 18, 900);
        });
        fillText(ctx, gap >= 1.7 ? 'transferencia electronica probable' : 'comparticion covalente', 56, h - 42, '#275071', 15);
    }

    function drawCisTrans(ctx, w, h, v) {
        const gap = Number(v.substituent_gap || 35);
        const rotation = Number(v.rotation || 35) * Math.PI / 180;
        const functionalGroup = clamp(Math.round(Number(v.functional_group || 1)) - 1, 0, 2);
        const groupLabels = ['COOR', 'COOH', 'C=O'];
        const groupColors = ['#ef6c35', '#d94841', '#1d6fd6'];
        const cis = gap < 50;
        const cx = w * 0.5;
        const cy = h * 0.52;
        const left = cx - 80;
        const right = cx + 80;
        ctx.strokeStyle = '#243047';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(left, cy - 8);
        ctx.lineTo(right, cy - 8);
        ctx.moveTo(left, cy + 8);
        ctx.lineTo(right, cy + 8);
        ctx.stroke();
        [[left, cy, 'C'], [right, cy, 'C']].forEach(([x, y, label]) => {
            ctx.fillStyle = '#243047';
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, label, x - 8, y + 7, '#fff', 18, 900);
        });
        const topA = [left - 70, cy - 100];
        const topB = cis ? [right + 70, cy - 100] : [right + 70, cy + 100];
        const botA = [left - 70, cy + 100];
        const botB = cis ? [right + 70, cy + 100] : [right + 70, cy - 100];
        const rotatePoint = (point, origin) => {
            const dx = point[0] - origin[0];
            const dy = point[1] - origin[1];
            return [
                origin[0] + dx * Math.cos(rotation * 0.28) - dy * Math.sin(rotation * 0.28),
                origin[1] + dx * Math.sin(rotation * 0.28) + dy * Math.cos(rotation * 0.28),
            ];
        };
        [[left, cy, rotatePoint(topA, [left, cy]), groupLabels[functionalGroup], groupColors[functionalGroup]], [right, cy, rotatePoint(topB, [right, cy]), groupLabels[functionalGroup], groupColors[functionalGroup]], [left, cy, rotatePoint(botA, [left, cy]), 'H', '#22a06b'], [right, cy, rotatePoint(botB, [right, cy]), 'H', '#22a06b']].forEach(([x, y, p, label, color]) => {
            ctx.strokeStyle = '#55657a';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(p[0], p[1]);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p[0], p[1], label.length > 1 ? 28 : 22, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, label, p[0] - (label.length > 1 ? 18 : 7), p[1] + 6, '#fff', label.length > 1 ? 12 : 17, 900);
        });
        fillText(ctx, `${cis ? 'CIS: grupos del mismo lado' : 'TRANS: grupos opuestos'} / ${groupLabels[functionalGroup]}`, 56, h - 42, '#275071', 15);
    }

    function drawEquilibrium(ctx, w, h, v, time) {
        const reactants = Number(v.reactants || 1.6);
        const products = Number(v.products || 1.2);
        const forward = Number(v.forward_rate || 55);
        const leftCount = clamp(Math.round(reactants * 8), 3, 30);
        const rightCount = clamp(Math.round(products * 8), 3, 30);
        drawRoundRect(ctx, 52, 80, w * 0.36, h - 160, 18);
        ctx.fillStyle = 'rgba(34, 160, 107, .12)';
        ctx.fill();
        drawRoundRect(ctx, w * 0.58, 80, w * 0.36, h - 160, 18);
        ctx.fillStyle = 'rgba(239, 108, 53, .12)';
        ctx.fill();
        for (let i = 0; i < leftCount; i += 1) {
            const x = 82 + (i % 6) * 42 + Math.sin(time + i) * 4;
            const y = 120 + Math.floor(i / 6) * 42;
            ctx.fillStyle = '#22a06b';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        for (let i = 0; i < rightCount; i += 1) {
            const x = w * 0.61 + 30 + (i % 6) * 42 + Math.cos(time + i) * 4;
            const y = 120 + Math.floor(i / 6) * 42;
            ctx.fillStyle = '#ef6c35';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        drawArrow(ctx, w * 0.42, h * 0.47, w * 0.56, h * 0.47, '#1d6fd6', `directa ${forward.toFixed(0)}%`);
        drawArrow(ctx, w * 0.56, h * 0.57, w * 0.42, h * 0.57, '#d94841', 'inversa');
        fillText(ctx, `productos ${products.toFixed(1)} M`, w * 0.62, h - 42, '#8a3b12', 14);
    }

    function drawSolution(ctx, w, h, v, time) {
        const solute = Number(v.solute || 1.2);
        const volume = Number(v.volume || 1);
        const temp = Number(v.temperature || 30);
        const beakerX = w * 0.28;
        const beakerY = h * 0.18;
        const beakerW = w * 0.44;
        const beakerH = h * 0.68;
        ctx.strokeStyle = '#275071';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(beakerX, beakerY);
        ctx.lineTo(beakerX + 28, beakerY + beakerH);
        ctx.lineTo(beakerX + beakerW - 28, beakerY + beakerH);
        ctx.lineTo(beakerX + beakerW, beakerY);
        ctx.stroke();
        ctx.fillStyle = 'rgba(29, 111, 214, .22)';
        ctx.fillRect(beakerX + 24, beakerY + beakerH * 0.28, beakerW - 48, beakerH * 0.68);
        const count = clamp(Math.round(solute * 9), 3, 46);
        for (let i = 0; i < count; i += 1) {
            const x = beakerX + 52 + (i * 41) % (beakerW - 104);
            const y = beakerY + beakerH * 0.36 + ((i * 29) % (beakerH * 0.54));
            ctx.fillStyle = temp > 50 ? '#ef6c35' : '#22a06b';
            ctx.beginPath();
            ctx.arc(x + Math.sin(time + i) * 4, y + Math.cos(time + i) * 4, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 17 + volume * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function drawStoich(ctx, w, h, v, time) {
        const oxygen = Number(v.oxygen || 2);
        const fuel = Number(v.fuel || 1);
        const ok = oxygen >= 2 * fuel;
        fillText(ctx, 'CH4', w * 0.16, h * 0.25, '#243047', 28, 900);
        fillText(ctx, '+', w * 0.28, h * 0.25, '#55657a', 28, 900);
        fillText(ctx, `${oxygen.toFixed(0)} O2`, w * 0.34, h * 0.25, '#243047', 28, 900);
        drawArrow(ctx, w * 0.48, h * 0.24, w * 0.65, h * 0.24, ok ? '#22a06b' : '#d94841', ok ? 'balance' : 'falta O');
        fillText(ctx, 'CO2 + 2H2O', w * 0.7, h * 0.25, '#243047', 28, 900);
        const atoms = [
            ['C', '#243047'], ['H', '#22a06b'], ['H', '#22a06b'], ['H', '#22a06b'], ['H', '#22a06b'],
            ['O', '#ef6c35'], ['O', '#ef6c35'], ['O', '#ef6c35'], ['O', '#ef6c35']
        ];
        atoms.forEach((atom, index) => {
            const side = index < 5 ? w * 0.22 : w * 0.72;
            const x = side + Math.cos(time + index) * 70 + (index % 3) * 20;
            const y = h * 0.58 + Math.sin(time * 1.4 + index) * 55;
            ctx.fillStyle = atom[1];
            ctx.beginPath();
            ctx.arc(x, y, 19, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, atom[0], x - 7, y + 6, '#fff', 17, 900);
        });
    }

    function drawBio(ctx, w, h, v, time) {
        const monomers = Math.round(Number(v.monomers || 5));
        const folding = Number(v.folding || 45) / 100;
        const startX = w * 0.18;
        const startY = h * 0.52;
        let last = null;
        for (let i = 0; i < monomers; i += 1) {
            const x = startX + i * ((w * 0.64) / Math.max(1, monomers - 1));
            const y = startY + Math.sin(i * 1.3 + time) * 86 * folding;
            if (last) {
                ctx.strokeStyle = '#55657a';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(last[0], last[1]);
                ctx.lineTo(x, y);
                ctx.stroke();
                fillText(ctx, 'peptido', (last[0] + x) / 2 - 22, (last[1] + y) / 2 - 10, '#ef6c35', 11, 800);
            }
            ctx.fillStyle = i % 2 ? '#22a06b' : '#1d6fd6';
            ctx.beginPath();
            ctx.arc(x, y, 24, 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, i % 2 ? 'AA' : 'CHO', x - 14, y + 5, '#fff', 13, 900);
            last = [x, y];
        }
    }

    function drawHumanSystem(ctx, w, h, v, time) {
        const speed = Number(v.signal_speed || 72);
        const stimulus = Number(v.stimulus || 45);
        const intensity = clamp(stimulus / 100, 0.05, 1);
        const pulse = (time * (0.8 + speed / 70)) % 1;
        const nodes = [
            [w * 0.18, h * 0.55, 'Estímulo'],
            [w * 0.38, h * 0.42, 'Medula'],
            [w * 0.58, h * 0.30, 'Cerebro'],
            [w * 0.78, h * 0.56, 'Respuesta'],
        ];
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        nodes.forEach(([x, y], index) => {
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        for (let i = 0; i < nodes.length - 1; i += 1) {
            const [x1, y1] = nodes[i];
            const [x2, y2] = nodes[i + 1];
            const local = Math.max(0, Math.min(1, pulse * 1.8 - i * 0.35));
            const px = x1 + (x2 - x1) * local;
            const py = y1 + (y2 - y1) * local;
            ctx.fillStyle = '#ffb545';
            ctx.beginPath();
            ctx.arc(px, py, 8 + intensity * 14, 0, Math.PI * 2);
            ctx.fill();
        }
        nodes.forEach(([x, y, label], index) => {
            ctx.fillStyle = index === 2 ? '#1d6fd6' : '#243047';
            ctx.beginPath();
            ctx.arc(x, y, 24 + (index === 0 ? intensity * 12 : 0), 0, Math.PI * 2);
            ctx.fill();
            fillText(ctx, label, x - 42, y + 54, '#275071', 13, 800);
        });
        fillText(ctx, `intensidad ${stimulus.toFixed(0)}%`, 58, h - 42, '#275071', 15);
    }

    function drawVitals(ctx, w, h, v, time) {
        const hr = Number(v.heart_rate || 78);
        const temp = Number(v.temperature || 37);
        const respiration = Number(v.respiration || 16);
        const baseline = h * 0.52;
        ctx.strokeStyle = '#123a63';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 48; x <= w - 48; x += 8) {
            const beat = Math.sin((x / 26) + time * (hr / 12));
            const breath = Math.sin((x / 80) + time * (respiration / 6));
            const fever = (temp - 37) * 5;
            const y = baseline + breath * 34 - (beat > 0.88 ? 64 : beat * 8) - fever;
            if (x === 48) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const cards = [
            [`FC`, `${hr.toFixed(0)} lpm`, hr > 110 ? '#d94841' : '#1d6fd6'],
            [`Resp`, `${respiration.toFixed(0)} rpm`, respiration > 24 || respiration < 10 ? '#d94841' : '#22a06b'],
            [`Temp`, `${temp.toFixed(1)} C`, temp >= 38 ? '#d94841' : '#ef6c35'],
        ];
        cards.forEach(([label, value, color], index) => {
            const x = 64 + index * Math.min(190, (w - 128) / 3);
            drawRoundRect(ctx, x, h * 0.14, 150, 86, 12);
            ctx.fillStyle = 'rgba(255,255,255,.82)';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
            fillText(ctx, label, x + 18, h * 0.14 + 30, color, 14, 900);
            fillText(ctx, value, x + 18, h * 0.14 + 62, '#243047', 19, 900);
        });
        fillText(ctx, 'onda respiratoria + pulso', 58, h - 42, '#275071', 15);
    }

    function drawRespiratoryCase(ctx, w, h, v, time) {
        const oxygen = Number(v.oxygen || 92);
        const respiration = Number(v.respiration || 20);
        const cough = Number(v.cough || 35);
        const expansion = clamp(respiration / 34, 0.25, 1);
        const cx = w * 0.5;
        const cy = h * 0.48;
        ctx.fillStyle = 'rgba(29,111,214,.18)';
        ctx.beginPath();
        ctx.ellipse(cx - 62, cy, 48 + expansion * 18, 116, -0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 62, cy, 48 + expansion * 18, 116, 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = oxygen < 90 ? '#d94841' : '#1d6fd6';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = '#243047';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 148);
        ctx.lineTo(cx, cy - 32);
        ctx.moveTo(cx, cy - 32);
        ctx.lineTo(cx - 54, cy + 26);
        ctx.moveTo(cx, cy - 32);
        ctx.lineTo(cx + 54, cy + 26);
        ctx.stroke();
        const particleCount = clamp(Math.round((100 - oxygen) / 2 + cough / 10), 4, 28);
        for (let i = 0; i < particleCount; i += 1) {
            const side = i % 2 ? -1 : 1;
            const x = cx + side * (48 + (i % 5) * 13 + Math.sin(time + i) * 5);
            const y = cy - 18 + ((i * 31) % 150);
            ctx.fillStyle = oxygen < 90 ? '#ef4444' : '#ffb545';
            ctx.beginPath();
            ctx.arc(x, y, 6 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
        }
        drawArrow(ctx, w * 0.18, h * 0.2, w * 0.36, h * 0.2, oxygen < 90 ? '#d94841' : '#22a06b', `SpO2 ${oxygen.toFixed(0)}%`);
        fillText(ctx, `respiracion ${respiration.toFixed(0)} rpm`, 58, h - 42, '#275071', 15);
    }

    function drawDefault(ctx, w, h, v, time) {
        const cx = w * 0.5;
        const cy = h * 0.52;
        ctx.fillStyle = '#1d6fd6';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(time) * 120, cy + Math.sin(time) * 62, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb545';
        ctx.beginPath();
        ctx.arc(cx - Math.cos(time * 1.1) * 90, cy - Math.sin(time * 1.1) * 48, 26, 0, Math.PI * 2);
        ctx.fill();
        fillText(ctx, 'simulador activo', 56, h - 42, '#275071', 16);
    }

    function mountCanvasSimulator(simulation) {
        stopAnimation();
        const host = document.getElementById('lab-visual-stage');
        if (!host) return;
        host.innerHTML = renderGenericStage(simulation);
        const canvas = document.getElementById('lab-sim-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const scale = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(640, Math.floor(rect.width * scale));
            canvas.height = Math.max(420, Math.floor(rect.height * scale));
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        };
        resize();
        const animate = (stamp) => {
            const rect = canvas.parentElement.getBoundingClientRect();
            drawScene(ctx, rect.width, rect.height, simulation, stamp / 1000);
            animationFrame = window.requestAnimationFrame(animate);
        };
        window.addEventListener('resize', resize, { passive: true, once: true });
        animationFrame = window.requestAnimationFrame(animate);
    }

    function renderHumanAnatomy(simulation) {
        const markers = simulation.markers || [];
        const depth = Number(sliderValues.marker_depth || 70);
        const layer = Math.round(Number(sliderValues.layer || 3));
        const layerNames = ['Sistema óseo', 'Sistema muscular', 'Órganos internos', 'Sistema nervioso', 'Sistema cardiovascular'];
        return `
            <div class="human-anatomy" aria-label="Modelo anatómico interactivo del cuerpo humano" data-human-layer="${esc(layer)}" style="--anatomy-opacity:${(0.55 + depth / 220).toFixed(2)}">
                <div class="human-anatomy__layer-readout">
                    <span data-human-layer-label>${esc(layerNames[clamp(layer - 1, 0, 4)])}</span>
                    <strong data-human-depth-label>${esc(depth.toFixed(0))}% profundidad</strong>
                </div>
                <div class="human-anatomy__viewport">
                    <svg viewBox="0 0 720 860" role="img" aria-label="Vista frontal del cuerpo humano con cinco capas anatómicas">
                        <defs>
                            <linearGradient id="anatomy-skin" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stop-color="#f2c9b5"/><stop offset="1" stop-color="#c98f7d"/>
                            </linearGradient>
                            <linearGradient id="anatomy-muscle" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stop-color="#cf554f"/><stop offset="1" stop-color="#8f2f39"/>
                            </linearGradient>
                            <radialGradient id="anatomy-organ" cx="40%" cy="30%">
                                <stop offset="0" stop-color="#ff8a7d"/><stop offset="1" stop-color="#a82f45"/>
                            </radialGradient>
                            <filter id="anatomy-shadow" x="-40%" y="-40%" width="180%" height="180%">
                                <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#07182b" flood-opacity=".28"/>
                            </filter>
                        </defs>

                        <g class="anatomy-silhouette" filter="url(#anatomy-shadow)">
                            <ellipse cx="360" cy="76" rx="49" ry="58"/>
                            <path d="M334 126 L327 155 C292 166 259 184 245 222 L218 394 C213 422 236 430 248 405 L282 249 L294 398 C297 446 281 511 286 564 L304 811 C307 839 333 839 339 813 L360 598 L381 813 C387 839 413 839 416 811 L434 564 C439 511 423 446 426 398 L438 249 L472 405 C484 430 507 422 502 394 L475 222 C461 184 428 166 393 155 L386 126 Z"/>
                        </g>

                        <g class="anatomy-layer ${layer === 1 ? 'is-active' : ''}" data-anatomy-layer="1">
                            <g class="anatomy-bone">
                                <ellipse cx="360" cy="76" rx="36" ry="43" data-anatomy-structure="brain"/>
                                <path d="M340 105 Q360 118 380 105 M360 119 V552"/>
                                <path d="M321 171 Q360 145 399 171 M310 194 Q360 164 410 194 M304 219 Q360 187 416 219 M302 245 Q360 210 418 245 M307 271 Q360 239 413 271"/>
                                <path d="M320 283 Q360 311 400 283 L388 340 Q360 360 332 340 Z"/>
                                <path d="M326 166 L273 213 L239 392 M394 166 L447 213 L481 392"/>
                                <path d="M330 348 L315 564 L321 804 M390 348 L405 564 L399 804"/>
                                <circle cx="239" cy="397" r="10"/><circle cx="481" cy="397" r="10"/>
                                <circle cx="315" cy="568" r="12"/><circle cx="405" cy="568" r="12"/>
                            </g>
                        </g>

                        <g class="anatomy-layer ${layer === 2 ? 'is-active' : ''}" data-anatomy-layer="2">
                            <g class="anatomy-muscle">
                                <path d="M330 151 Q360 137 390 151 L402 198 Q360 224 318 198 Z"/>
                                <path d="M318 201 Q342 184 358 207 L353 283 Q329 282 311 251 Z"/>
                                <path d="M402 201 Q378 184 362 207 L367 283 Q391 282 409 251 Z"/>
                                <path d="M323 288 Q360 270 397 288 L391 352 Q360 375 329 352 Z"/>
                                <path d="M285 193 Q253 216 250 276 L237 378 Q253 388 265 356 L292 230 Z"/>
                                <path d="M435 193 Q467 216 470 276 L483 378 Q467 388 455 356 L428 230 Z"/>
                                <path d="M315 363 Q342 390 343 553 L326 795 Q305 772 306 704 L299 565 Z"/>
                                <path d="M405 363 Q378 390 377 553 L394 795 Q415 772 414 704 L421 565 Z"/>
                            </g>
                        </g>

                        <g class="anatomy-layer ${layer === 3 ? 'is-active' : ''}" data-anatomy-layer="3">
                            <path class="anatomy-brain" data-anatomy-structure="brain" d="M332 72c0-25 18-41 39-39 20 2 31 18 28 37 12 12 4 35-14 38-8 12-29 13-38 2-19 2-31-18-21-33-1-2-1-3-1-5 0-13 7-24 19-28"/>
                            <g class="anatomy-lungs" data-anatomy-structure="lungs">
                                <path d="M350 176 C322 163 297 190 300 237 C303 276 325 294 352 272 Z"/>
                                <path d="M370 176 C398 163 423 190 420 237 C417 276 395 294 368 272 Z"/>
                            </g>
                            <path class="anatomy-heart" data-anatomy-structure="heart" d="M360 251 C340 228 316 245 320 270 C324 294 360 315 360 315 C360 315 398 292 400 266 C402 240 376 231 360 251 Z"/>
                            <path class="anatomy-liver" d="M312 310 Q357 288 404 308 L394 355 Q348 367 309 345 Z"/>
                            <path class="anatomy-stomach" data-anatomy-structure="digestive" d="M374 340 C411 333 416 374 395 389 C379 400 373 422 389 438 C350 438 336 404 353 379 C364 363 362 348 374 340 Z"/>
                            <g class="anatomy-kidneys"><path d="M325 359c-20 3-25 38-8 49 14 8 27-6 25-23-2-17-4-28-17-26Z"/><path d="M395 359c20 3 25 38 8 49-14 8-27-6-25-23 2-17 4-28 17-26Z"/></g>
                            <g class="anatomy-intestines" data-anatomy-structure="digestive">
                                <rect x="319" y="420" width="82" height="105" rx="31"/>
                                <path d="M337 438 C386 438 386 461 339 461 S337 486 383 486 S384 509 339 509"/>
                            </g>
                        </g>

                        <g class="anatomy-layer ${layer === 4 ? 'is-active' : ''}" data-anatomy-layer="4">
                            <path class="anatomy-brain anatomy-brain--nervous" data-anatomy-structure="brain" d="M332 72c0-25 18-41 39-39 20 2 31 18 28 37 12 12 4 35-14 38-8 12-29 13-38 2-19 2-31-18-21-33-1-2-1-3-1-5 0-13 7-24 19-28"/>
                            <g class="anatomy-nerves">
                                <path class="anatomy-nerve-pulse" d="M360 113 V555 M360 178 L286 220 L245 390 M360 178 L434 220 L475 390 M360 347 L319 560 L323 805 M360 347 L401 560 L397 805"/>
                                <path d="M360 205 L319 250 M360 245 L402 285 M360 308 L315 345 M360 390 L405 440"/>
                            </g>
                        </g>

                        <g class="anatomy-layer ${layer === 5 ? 'is-active' : ''}" data-anatomy-layer="5">
                            <path class="anatomy-heart" data-anatomy-structure="heart" d="M360 251 C340 228 316 245 320 270 C324 294 360 315 360 315 C360 315 398 292 400 266 C402 240 376 231 360 251 Z"/>
                            <g class="anatomy-vessels anatomy-vessels--artery">
                                <path d="M360 247 V142 M360 168 L292 207 L251 394 M360 172 L428 207 L469 394 M360 302 V523 M360 355 L321 565 L323 805 M360 355 L399 565 L397 805"/>
                            </g>
                            <g class="anatomy-vessels anatomy-vessels--vein">
                                <path d="M374 249 V150 M374 184 L307 225 L266 392 M374 186 L443 225 L484 392 M374 303 V526 M374 367 L337 568 L338 806 M374 367 L415 568 L412 806"/>
                            </g>
                        </g>
                    </svg>
                    <div class="human-anatomy__markers">
                        ${(markers.length ? markers : [
                            { id: 'brain', label: 'Cerebro' },
                            { id: 'lungs', label: 'Pulmones' },
                            { id: 'heart', label: 'Corazón' },
                            { id: 'digestive', label: 'Digestivo' },
                        ]).map((marker, index) => {
                            const coords = [['52%', '12%'], ['46%', '27%'], ['56%', '34%'], ['48%', '53%'], ['50%', '72%']][index] || ['50%', '50%'];
                            const markerScale = 0.82 + (depth / 100) * 0.3;
                            return `<button type="button" data-human-marker data-human-marker-id="${esc(marker.id || '')}" data-human-marker-label="${esc(marker.label)}" data-human-marker-hint="${esc(marker.hint || 'Selecciona una estructura para revisar su función.')}" aria-pressed="false" style="--x:${coords[0]};--y:${coords[1]};--marker-scale:${markerScale.toFixed(2)};--marker-opacity:${(0.68 + depth / 320).toFixed(2)};" title="${esc(marker.hint || '')}"><i></i><span>${esc(marker.label)}</span></button>`;
                        }).join('')}
                    </div>
                </div>
                <p class="human-anatomy__marker-detail" data-human-marker-detail hidden aria-live="polite"></p>
            </div>
        `;
    }

    function updateHumanAnatomy() {
        const human = document.querySelector('.human-anatomy');
        if (!human) return;
        const depth = Number(sliderValues.marker_depth || 70);
        const layer = Math.round(Number(sliderValues.layer || 3));
        const layerNames = ['Sistema óseo', 'Sistema muscular', 'Órganos internos', 'Sistema nervioso', 'Sistema cardiovascular'];
        human.dataset.humanLayer = String(layer);
        human.style.setProperty('--anatomy-opacity', (0.55 + depth / 220).toFixed(2));
        const layerLabel = human.querySelector('[data-human-layer-label]');
        const depthLabel = human.querySelector('[data-human-depth-label]');
        if (layerLabel) layerLabel.textContent = layerNames[clamp(layer - 1, 0, 4)];
        if (depthLabel) depthLabel.textContent = `${depth.toFixed(0)}% profundidad`;
        human.querySelectorAll('[data-anatomy-layer]').forEach((layerNode) => {
            layerNode.classList.toggle('is-active', Number(layerNode.dataset.anatomyLayer) === layer);
        });
        human.querySelectorAll('[data-human-marker]').forEach((marker, index) => {
            const offset = (depth - 60) * (index % 2 ? -0.08 : 0.08);
            marker.style.setProperty('--marker-scale', (0.82 + (depth / 100) * 0.3).toFixed(2));
            marker.style.setProperty('--marker-opacity', (0.68 + depth / 320).toFixed(2));
            marker.style.transform = `translate(-50%, -50%) translateY(${offset.toFixed(1)}px) scale(var(--marker-scale))`;
        });
    }

    function mountVisual(simulation) {
        const host = document.getElementById('lab-visual-stage');
        if (!host) return;
        if (simulation.type === 'human-anatomy') {
            stopAnimation();
            host.innerHTML = renderHumanAnatomy(simulation);
            return;
        }
        mountCanvasSimulator(simulation);
    }

    function renderRecentSessions() {
        if (!labSessions.length) {
            return `
                <section class="lab-session-list">
                    <div>
                        <span class="pricing-eyebrow">Historial</span>
                        <strong>Aún no hay sesiones guardadas</strong>
                        <p>Abre un simulador y EducatIA guardara parametros y resultados.</p>
                    </div>
                </section>
            `;
        }
        return `
            <section class="lab-session-list">
                <div class="lab-session-list__head">
                    <span class="pricing-eyebrow">Historial reciente</span>
                    <strong>${labSessions.length} sesiones guardadas</strong>
                </div>
                <div class="lab-session-list__items">
                    ${labSessions.slice(0, 5).map((session) => `
                        <article>
                            <span>${esc(session.status === 'completed' ? 'cerrada' : 'activa')}</span>
                            <strong>${esc(session.titulo)}</strong>
                            <small>${esc(session.subject_id)} / ${esc(session.simulation_id)}</small>
                            <small>${esc(formatSessionDate(session.updated_at || session.started_at))} - ${esc(formatSessionDuration(session.duration_seconds))}</small>
                            <a href="${simulationUrl(session.subject_id, session.simulation_id, session.id)}">Continuar esta sesión</a>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderWorkspace() {
        const subject = activeSubject();
        if (LAB_EXTERNAL_ONLY) {
            return `
                <main class="lab-page lab-page--v1 lab-page--external-only">
                    ${renderHero()}
                    <section class="lab-workbench lab-workbench--external-only">
                        <div class="lab-workbench__main">
                            ${renderPremedicalAnatomyFeature()}
                            ${renderExternalSimulationSection(subject)}
                        </div>
                    </section>
                </main>
            `;
        }
        const simulation = activeSimulation();
        return `
            <main class="lab-page lab-page--v1">
                ${renderHero()}
                <section class="lab-workbench">
                    ${renderSubjectRail()}
                    <div class="lab-workbench__main">
                        <section class="lab-subject-overview lab-accent--${esc(subject.accent || 'blue')}">
                            <div>
                                <span class="pricing-eyebrow">${esc(subject.title || 'Materia')}</span>
                                <h2>${esc(subject.subtitle || subject.description || '')}</h2>
                                <p>${esc(subject.description || '')}</p>
                                ${renderConceptList({ concepts: subject.skills || [] })}
                            </div>
                            <div class="lab-subject-overview__meta">
                                <strong>${Number(subject.estimated_minutes || 30)} min</strong>
                                <span>sesión sugerida</span>
                            </div>
                        </section>

                        ${renderSimulationTabs(subject)}
                        ${renderExternalSimulationSection(subject)}

                        <section class="lab-simulation-panel">
                            <div class="lab-simulation-panel__copy">
                                <span class="pricing-eyebrow">${esc(simulation.type || 'simulacion')}</span>
                                <h2>${esc(simulation.title || 'Simulacion')}</h2>
                                <p>${esc(simulation.summary || '')}</p>
                                ${renderConceptList(simulation)}
                                <a href="${simulationUrl(subject.id, simulation.id)}" class="btn btn--primary lab-open-sim">Abrir simulador</a>
                            </div>
                            <div id="lab-visual-stage" class="human-lab__stage lab-visual-stage"></div>
                        </section>

                        ${renderInsightPanel(simulation)}
                        ${renderRecentSessions()}
                    </div>
                    ${renderAlePanel(subject, simulation)}
                </section>
            </main>
        `;
    }

    function renderSessionBadge() {
        if (!activeSession) {
            return `
                <span id="lab-session-status" class="lab-session-pill">Creando sesión...</span>
                <small id="lab-session-save-state" class="lab-session-save-state">Preparando autoguardado</small>
            `;
        }
        return `
            <span id="lab-session-status" class="lab-session-pill">Sesión #${esc(activeSession.id)} - ${esc(activeSession.status)}</span>
            <small id="lab-session-save-state" class="lab-session-save-state">Autoguardado activo</small>
        `;
    }

    function renderSimulatorWorkspace() {
        const subject = activeSubject();
        const simulation = activeSimulation();
        const preview = renderFormulaPreview(simulation.type);
        return `
            <main class="lab-page lab-page--simulator">
                <header class="lab-simulator-top">
                    <div>
                        <a href="${Router().toUrl('/laboratorio-aprendizaje')}" class="lab-back-link">Volver al laboratorio</a>
                        <span class="pricing-eyebrow">${esc(subject.title)} / ${esc(simulation.type)}</span>
                        <h1>${esc(simulation.title)}</h1>
                        <p>${esc(simulation.summary || '')}</p>
                    </div>
                    <div class="lab-simulator-top__meta">
                        ${renderSessionBadge()}
                        <button type="button" class="lab-fullscreen-button" data-lab-fullscreen aria-label="Entrar en pantalla completa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
                            <span>Pantalla completa</span>
                        </button>
                        <button type="button" class="btn btn--primary" data-lab-complete-session>Guardar y cerrar</button>
                    </div>
                </header>
                <section class="lab-simulator-shell">
                    <div class="lab-simulator-main">
                        <div id="lab-visual-stage" class="human-lab__stage lab-visual-stage"></div>
                        <section class="lab-sim-readout-grid">
                            <article>
                                <span>Resultado principal</span>
                                <strong id="lab-side-main">${esc(preview.main)}</strong>
                            </article>
                            <article>
                                <span>Interpretacion</span>
                                <strong id="lab-side-note">${esc(preview.note)}</strong>
                            </article>
                        </section>
                        ${renderInsightPanel(simulation)}
                    </div>
                    <aside class="lab-simulator-controls">
                        <section class="lab-control-panel">
                            <span class="pricing-eyebrow">Controles</span>
                            <h2>Manipula variables</h2>
                            ${renderParameters(simulation)}
                        </section>
                        <section class="lab-control-panel">
                            <span class="pricing-eyebrow">Conceptos</span>
                            ${renderConceptList(simulation)}
                        </section>
                        ${renderChallengePanel(simulation)}
                        ${renderAlePanel(subject, simulation)}
                    </aside>
                </section>
            </main>
        `;
    }

    function updateExternalFullscreenButton() {
        const button = document.querySelector('[data-external-fullscreen]');
        if (!button) return;
        const active = Boolean(document.fullscreenElement) || externalFullscreenActive;
        const label = button.querySelector('span');
        if (label) label.textContent = active ? 'Salir de pantalla completa' : 'Pantalla completa';
        button.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Entrar en pantalla completa');
        button.classList.toggle('is-active', active);
    }

    function renderExternalLoader(label = 'Configurando tu práctica') {
        return `
            <div class="lab-external-loader" data-external-loader role="status" aria-live="polite">
                <video class="lab-external-loader__video" autoplay muted playsinline loop preload="auto" aria-hidden="true">
                    <source src="${Router().toUrl('assets/load_screen/load_screen.mp4')}" type="video/mp4">
                </video>
                <span class="sr-only">${esc(label)}</span>
            </div>
        `;
    }

    function renderExternalSimulatorWorkspace(meta, subject) {
        const assetUrl = `${Router().toUrl(`assets/laboratorio-simuladores/${meta.id}_all.html`)}?locale=es&v=20260727labshell1`;
        return `
            <main class="lab-external-page" aria-busy="true">
                <header class="lab-external-topbar">
                    <div class="lab-external-brand">
                        <a href="${Router().toUrl('/laboratorio-aprendizaje')}" class="lab-external-back" aria-label="Volver al laboratorio">‹</a>
                        <img src="${labBrandLogoUrl()}" alt="educatIA">
                        <span class="lab-external-divider" aria-hidden="true"></span>
                        <span class="lab-external-subject">${esc(subject.title)} · Laboratorio</span>
                    </div>
                    <div class="lab-external-meta">
                        <strong>${esc(meta.label)}</strong>
                        <a class="lab-external-attribution" href="https://phet.colorado.edu" target="_blank" rel="noopener noreferrer">Simulación de PhET Interactive Simulations, University of Colorado Boulder, bajo licencia CC BY-NC 4.0</a>
                        <button type="button" class="lab-fullscreen-button lab-fullscreen-button--external" data-external-fullscreen aria-label="Entrar en pantalla completa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
                            <span>Pantalla completa</span>
                        </button>
                    </div>
                </header>
                <section class="lab-external-viewport">
                    <iframe id="lab-external-frame" src="${esc(assetUrl)}" title="${esc(meta.label)}" lang="es" allow="fullscreen; autoplay" referrerpolicy="no-referrer"></iframe>
                    ${renderExternalLoader(meta.label)}
                </section>
            </main>
        `;
    }

    function bindExternalSimulatorEvents(renderGeneration) {
        const frame = document.getElementById('lab-external-frame');
        const loader = document.querySelector('[data-external-loader]');
        if (frame && loader) {
            externalFrame = frame;
            let loaderClosed = false;
            let readinessStarted = false;
            let readinessStartedAt = 0;
            const hideLoader = () => {
                if (loaderClosed || frame !== externalFrame || renderGeneration !== externalRenderGeneration) return;
                loaderClosed = true;
                if (externalReadinessTimer) {
                    window.clearTimeout(externalReadinessTimer);
                    externalReadinessTimer = null;
                }
                if (externalLoaderFallbackTimer) {
                    window.clearTimeout(externalLoaderFallbackTimer);
                    externalLoaderFallbackTimer = null;
                }
                loader.classList.add('is-hidden');
                document.querySelector('.lab-external-page')?.setAttribute('aria-busy', 'false');
            };
            const waitForSimulationReady = () => {
                externalReadinessTimer = null;
                if (frame !== externalFrame || renderGeneration !== externalRenderGeneration) return;
                let simulationRoot = null;
                try {
                    const root = frame.contentDocument?.getElementById('sim');
                    simulationRoot = root?.querySelector('svg') ? root : null;
                } catch (error) {
                    // The local assets share this origin; preserve the timed fallback if that ever changes.
                }
                if (simulationRoot) {
                    externalReadinessTimer = window.setTimeout(hideLoader, 220);
                    return;
                }
                if (Date.now() - readinessStartedAt < 13500) {
                    externalReadinessTimer = window.setTimeout(waitForSimulationReady, 120);
                }
            };
            externalFrameLoadHandler = () => {
                if (readinessStarted || frame !== externalFrame || renderGeneration !== externalRenderGeneration) return;
                readinessStarted = true;
                readinessStartedAt = Date.now();
                waitForSimulationReady();
            };
            frame.addEventListener('load', externalFrameLoadHandler, { once: true });
            externalLoaderFallbackTimer = window.setTimeout(hideLoader, 14000);
            try {
                if (frame.contentDocument?.readyState === 'complete') {
                    window.queueMicrotask(externalFrameLoadHandler);
                }
            } catch (error) {
                // A future cross-origin asset will still be covered by the load event and fallback timer.
            }
        }
        const button = document.querySelector('[data-external-fullscreen]');
        if (!button) return;
        button.addEventListener('click', async () => {
            if (externalFullscreenActive) {
                externalFullscreenActive = false;
                document.body.classList.remove('is-lab-external-fallback-fullscreen');
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
                    try {
                        await document.documentElement.requestFullscreen();
                    } catch {
                        // Embedded browsers may block the native API after a user gesture.
                    }
                }
                if (!document.fullscreenElement) {
                    externalFullscreenActive = true;
                    document.body.classList.add('is-lab-external-fallback-fullscreen');
                }
            }
            updateExternalFullscreenButton();
        });
        if (!externalFullscreenListenerBound) {
            document.addEventListener('fullscreenchange', updateExternalFullscreenButton);
            externalFullscreenListenerBound = true;
        }
        updateExternalFullscreenButton();
    }

    function currentStatePayload() {
        return {
            parameters: { ...sliderValues },
            subject_id: activeSubjectId,
            simulation_id: activeSimulationId,
            route: Router().getCurrentRoute ? Router().getCurrentRoute() : '',
        };
    }

    function currentResultsPayload() {
        const preview = renderFormulaPreview(activeSimulation().type);
        return {
            main: preview.main,
            note: preview.note,
            achievement: activeSimulation().achievement?.title || null,
            challenge_count: (activeSimulation().challenges || []).length,
            updated_at: new Date().toISOString(),
        };
    }

    function updatePreview() {
        const simulation = activeSimulation();
        const preview = renderFormulaPreview(simulation.type);
        const ids = ['lab-preview-main', 'lab-side-main'];
        ids.forEach((id) => {
            const node = document.getElementById(id);
            if (node) node.textContent = preview.main;
        });
        const noteIds = ['lab-preview-note', 'lab-side-note'];
        noteIds.forEach((id) => {
            const node = document.getElementById(id);
            if (node) node.textContent = preview.note;
        });
        (simulation.parameters || []).forEach((parameter) => {
            const value = document.querySelector(`[data-lab-param-value="${parameter.id}"]`);
            if (value) value.textContent = formatParameterValue(parameter);
        });
        if (simulation.type === 'human-anatomy') updateHumanAnatomy();
    }

    async function persistSession(completed) {
        if (!activeSession?.id || !API().updateLabSimulationSession) return false;
        const elapsed = sessionStartedAt ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0;
        try {
            activeSession = await API().updateLabSimulationSession(activeSession.id, {
                state: currentStatePayload(),
                results: currentResultsPayload(),
                duration_seconds: sessionBaseDuration + elapsed,
                completed: completed === true,
            });
            const badge = document.getElementById('lab-session-status');
            if (badge) badge.textContent = `Sesión #${activeSession.id} - ${activeSession.status}`;
            const saveState = document.getElementById('lab-session-save-state');
            if (saveState) saveState.textContent = `Ultimo guardado ${formatSavedAt()}`;
            return true;
        } catch (error) {
            const badge = document.getElementById('lab-session-status');
            if (badge) badge.textContent = error.message || 'No se pudo guardar';
            const saveState = document.getElementById('lab-session-save-state');
            if (saveState) saveState.textContent = 'Guardado pendiente';
            return false;
        }
    }

    function scheduleSessionSave() {
        if (sessionSaveTimer) {
            window.clearTimeout(sessionSaveTimer);
        }
        sessionSaveTimer = window.setTimeout(() => persistSession(false), 650);
    }

    async function startSession() {
        activeSession = null;
        sessionBaseDuration = 0;
        sessionStartedAt = Date.now();
        const badge = document.getElementById('lab-session-status');
        if (badge) badge.textContent = 'Creando sesión...';
        activeSession = await API().startLabSimulationSession(activeSubjectId, activeSimulationId, {
            state: currentStatePayload(),
        });
        if (badge) badge.textContent = `Sesión #${activeSession.id} - ${activeSession.status}`;
        const saveState = document.getElementById('lab-session-save-state');
        if (saveState) saveState.textContent = `Autoguardado iniciado ${formatSavedAt()}`;
    }

    function bindCommonEvents() {
        document.querySelectorAll('[data-lab-param]').forEach((input) => {
            const updateParameter = () => {
                sliderValues[input.dataset.labParam] = Number(input.value);
                updatePreview();
                scheduleSessionSave();
            };
            input.addEventListener('input', updateParameter);
            input.addEventListener('change', updateParameter);
        });

        document.querySelectorAll('[data-human-marker]').forEach((button) => {
            button.addEventListener('click', () => {
                const anatomy = button.closest('.human-anatomy');
                const detail = anatomy?.querySelector('[data-human-marker-detail]');
                if (!detail) return;
                anatomy.querySelectorAll('[data-human-marker]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
                anatomy.querySelectorAll('[data-anatomy-structure]').forEach((item) => item.classList.remove('is-selected'));
                button.setAttribute('aria-pressed', 'true');
                const structureId = button.dataset.humanMarkerId || '';
                if (structureId) {
                    anatomy.querySelectorAll(`[data-anatomy-structure="${structureId}"]`).forEach((item) => item.classList.add('is-selected'));
                }
                detail.textContent = `${button.dataset.humanMarkerLabel || 'Marcador'}: ${button.dataset.humanMarkerHint || ''}`;
                detail.hidden = false;
            });
        });

        document.querySelectorAll('[data-lab-question-choice]').forEach((button) => {
            button.addEventListener('click', () => {
                const simulation = activeSimulation();
                const questionIndex = Number(button.dataset.labQuestionChoice || 0);
                const answerIndex = Number(button.dataset.labQuestionAnswer || 0);
                const question = (simulation.mini_questions || [])[questionIndex];
                const feedback = document.getElementById('lab-question-feedback-' + questionIndex);
                if (!question || !feedback) return;
                const correct = answerIndex === Number(question.answer);
                button.closest('.lab-mini-question')?.querySelectorAll('button').forEach((item) => {
                    item.classList.remove('is-correct', 'is-wrong');
                });
                button.classList.add(correct ? 'is-correct' : 'is-wrong');
                feedback.textContent = (correct ? 'Correcto. ' : 'Revisa de nuevo. ') + (question.explanation || '');
                feedback.classList.toggle('is-correct', correct);
                scheduleSessionSave();
            });
        });
    }

    function bindOverviewEvents() {
        document.querySelectorAll('[data-lab-subject]').forEach((button) => {
            button.addEventListener('click', async () => {
                activeSubjectId = button.dataset.labSubject;
                const subject = activeSubject();
                activeSimulationId = subject.featured_simulation || (subject.simulations || [])[0]?.id || '';
                await loadActiveSimulation();
                renderContent();
            });
        });
        bindCommonEvents();
    }

    function bindSimulatorEvents() {
        bindCommonEvents();
        const fullscreenButton = document.querySelector('[data-lab-fullscreen]');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', async () => {
                if (fallbackFullscreenActive) {
                    fallbackFullscreenActive = false;
                    document.body.classList.remove('is-lab-fallback-fullscreen');
                } else if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else {
                    if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
                        try {
                            await document.documentElement.requestFullscreen();
                        } catch {
                            // Some embedded browsers block the native API even after a user gesture.
                        }
                    }
                    if (!document.fullscreenElement) {
                        fallbackFullscreenActive = true;
                        document.body.classList.add('is-lab-fallback-fullscreen');
                    }
                }
                updateFullscreenButton();
            });
            if (!fullscreenListenerBound) {
                document.addEventListener('fullscreenchange', updateFullscreenButton);
                fullscreenListenerBound = true;
            }
            updateFullscreenButton();
        }
        document.querySelector('[data-lab-complete-session]')?.addEventListener('click', async () => {
            const button = document.querySelector('[data-lab-complete-session]');
            if (button) {
                button.disabled = true;
                button.textContent = 'Guardando...';
            }
            const saved = await persistSession(true);
            if (saved) {
                C().showWebNotice?.('Laboratorio', 'Sesión guardada en tu historial.', 'success');
                Router().navigate('/laboratorio-aprendizaje');
                return;
            }
            C().showWebNotice?.('Laboratorio', 'No se pudo cerrar la sesión. Intenta guardarla de nuevo.', 'error');
            if (button) {
                button.disabled = false;
                button.textContent = 'Guardar y cerrar';
            }
        });
    }

    async function loadActiveSimulation() {
        const subject = activeSubject();
        const simulationId = activeSimulationId || subject.featured_simulation || (subject.simulations || [])[0]?.id;
        if (!subject.id || !simulationId) return;
        activeSimulationId = simulationId;
        activeDetail = await API().getLearningLabSimulation(subject.id, simulationId);
        resetSliderValues(activeDetail.simulation);
    }

    function renderContent() {
        stopAnimation();
        setSimulatorMode(false);
        setExternalSimulatorMode(false);
        const app = document.getElementById('app');
        app.innerHTML = renderWorkspace();
        mountVisual(activeSimulation());
        bindOverviewEvents();
    }

    async function render() {
        if (!C().requireAuth('alumno')) return;
        stopAnimation();
        setExternalSimulatorMode(false);
        activeSession = null;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando laboratorio');
        try {
            const results = await Promise.allSettled([
                API().getLearningLab(),
                API().getLabSimulationSessions ? API().getLabSimulationSessions() : Promise.resolve([]),
            ]);
            if (results[0].status !== 'fulfilled') {
                throw results[0].reason;
            }
            labData = results[0].value;
            labSessions = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
            activeSubjectId = LAB_EXTERNAL_ONLY ? 'fisica' : (labData.default_subject_id || activeSubjectId);
            activeSimulationId = labData.default_simulation_id || activeSimulationId;
            if (!LAB_EXTERNAL_ONLY) await loadActiveSimulation();
            renderContent();
        } catch (error) {
            if (isAccessError(error)) renderPaywall(error.message);
            else renderLabError(error.message);
        }
    }

    async function renderSimulation(params) {
        if (LAB_EXTERNAL_ONLY) {
            const requestedSessionId = getRequestedSessionId();
            if (requestedSessionId) {
                if (!C().requireAuth('alumno')) return;
                stopAnimation();
                setSimulatorMode(false);
                setExternalSimulatorMode(false);
                const app = document.getElementById('app');
                app.innerHTML = C().renderLoadingBlock('Cargando registro de laboratorio');
                try {
                    const session = await API().getLabSimulationSession(requestedSessionId);
                    app.innerHTML = `
                        <section class="lab-page lab-page--paywall">
                            <div class="lab-paywall">
                                <span class="pricing-eyebrow">Registro de laboratorio</span>
                                <h1>${esc(session.titulo || 'Sesión guardada')}</h1>
                                <p>Esta sesión pertenece a una versión anterior del laboratorio. Conservamos su registro, pero no puede reanudarse con los simuladores actuales.</p>
                                <p><strong>Última actividad:</strong> ${esc(formatSessionDate(session.updated_at || session.started_at))} &middot; <strong>Duración:</strong> ${esc(formatSessionDuration(session.duration_seconds))}</p>
                                <div class="lab-paywall__actions">
                                    <a href="${Router().toUrl('/laboratorio-aprendizaje')}" class="btn btn--primary">Abrir laboratorio actual</a>
                                    <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Volver a mi aprendizaje</a>
                                </div>
                            </div>
                        </section>
                    `;
                } catch (error) {
                    renderLabError(error.message);
                }
                return;
            }
            Router().navigate('/laboratorio-aprendizaje');
            return;
        }
        if (!C().requireAuth('alumno')) return;
        stopAnimation();
        setExternalSimulatorMode(false);
        setSimulatorMode(true);
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Preparando simulador');
        try {
            labData = await API().getLearningLab();
            const requestedSessionId = getRequestedSessionId();
            if (requestedSessionId && API().getLabSimulationSession) {
                activeSession = await API().getLabSimulationSession(requestedSessionId);
                activeSubjectId = activeSession.subject_id || decodeURIComponent(params?.subjectId || labData.default_subject_id || 'fisica');
                activeSimulationId = activeSession.simulation_id || decodeURIComponent(params?.simulationId || labData.default_simulation_id || 'ondas-mecanicas-parametros');
                await loadActiveSimulation();
                applySessionState(activeSession);
                sessionBaseDuration = Number(activeSession.duration_seconds || 0);
                sessionStartedAt = Date.now();
            } else {
                activeSession = null;
                sessionBaseDuration = 0;
                activeSubjectId = decodeURIComponent(params?.subjectId || labData.default_subject_id || 'fisica');
                activeSimulationId = decodeURIComponent(params?.simulationId || labData.default_simulation_id || 'ondas-mecanicas-parametros');
                await loadActiveSimulation();
            }
            app.innerHTML = renderSimulatorWorkspace();
            mountVisual(activeSimulation());
            bindSimulatorEvents();
            if (!activeSession) {
                await startSession();
            }
        } catch (error) {
            if (isAccessError(error)) renderPaywall(error.message);
            else renderLabError(error.message);
        }
    }

    async function renderExternalSimulation(params) {
        if (!C().requireAuth('alumno')) return;
        stopAnimation();
        disposeExternalSimulator();
        const renderGeneration = externalRenderGeneration;
        setSimulatorMode(false);
        setExternalSimulatorMode(true);
        const app = document.getElementById('app');
        app.innerHTML = `<main class="lab-external-page lab-external-page--boot" aria-busy="true">${renderExternalLoader()}</main>`;
        try {
            labData = await API().getLearningLab();
            if (renderGeneration !== externalRenderGeneration) return;
            const subjectId = decodeURIComponent(params?.subjectId || 'fisica');
            const simulationId = decodeURIComponent(params?.simulationId || '');
            const meta = externalSimulationMeta(subjectId, simulationId);
            const subject = subjectList().find((item) => item.id === subjectId);
            if (!meta || !subject) throw new Error('Este simulador externo no esta disponible.');
            app.innerHTML = renderExternalSimulatorWorkspace(meta, subject);
            bindExternalSimulatorEvents(renderGeneration);
        } catch (error) {
            if (renderGeneration !== externalRenderGeneration) return;
            renderLabError(error.message);
        }
    }

    return {
        render,
        renderSimulation,
        renderExternalSimulation,
    };
})();
