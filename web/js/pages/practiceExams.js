/* ================================================================
   educatIA - Practice exams
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.PracticeExams = (function () {
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const STORAGE_KEY = 'educatia_practice_exam_history';
    const FALLBACK_MODULES = [
        { id: 'fisica', title: 'Física', skills: ['Newton', 'Energía', 'Electricidad'] },
        { id: 'calculo', title: 'Cálculo', skills: ['Límites', 'Derivadas', 'Integrales'] },
        { id: 'quimica', title: 'Química', skills: ['Balanceo', 'pH', 'Estequiometría'] },
        { id: 'premedicina', title: 'Premedicina', skills: ['Anatomía', 'Sistemas', 'Salud'] },
        { id: 'medicina', title: 'Medicina', skills: ['Signos vitales', 'Casos', 'Razonamiento'] },
        { id: 'pensamiento-matematico', title: 'Pensamiento matemático', skills: ['Aritmética', 'Álgebra', 'Problemas'] },
        { id: 'comprension-lectora', title: 'Comprensión lectora', skills: ['Inferencias', 'Idea central', 'Vocabulario'] },
        { id: 'redaccion-indirecta', title: 'Redacción indirecta', skills: ['Ortografía', 'Puntuación', 'Coherencia'] },
    ];
    const FALLBACK_QUESTION_BANK = {
        fisica: [
            { id: 'fisica-newton-1', prompt: 'Un bloque recibe 50 N hacia la derecha y 12 N de fricción hacia la izquierda. Si su masa es de 4 kg, ¿cuál es la aceleración aproximada?', options: ['9.5 m/s2', '12.5 m/s2', '15.5 m/s2', '38 m/s2'], answer: 0, explanation: 'La fuerza neta es 50 - 12 = 38 N. Con F = m a, a = 38 / 4 = 9.5 m/s2.', skill: 'Leyes de Newton' },
            { id: 'fisica-ohm-1', prompt: 'En un circuito simple hay 12 V y una resistencia de 6 ohm. Que corriente circula?', options: ['0.5 A', '2 A', '6 A', '18 A'], answer: 1, explanation: 'Por ley de Ohm, I = V/R = 12/6 = 2 A.', skill: 'Electricidad' },
            { id: 'fisica-energia-1', prompt: 'Si un objeto duplica su velocidad, ¿qué ocurre con su energía cinética si la masa se mantiene?', options: ['Se duplica', 'Se reduce a la mitad', 'Se cuadruplica', 'No cambia'], answer: 2, explanation: 'La energía cinética depende de v^2. Duplicar v multiplica la energía por 4.', skill: 'Energía' },
        ],
        calculo: [
            { id: 'calculo-derivada-1', prompt: 'Para f(x)=x^2, cual es la pendiente instantanea cuando x=3?', options: ['3', '6', '9', '12'], answer: 1, explanation: 'La derivada de x^2 es 2x. En x=3, la pendiente es 6.', skill: 'Derivadas' },
            { id: 'calculo-integral-1', prompt: '¿Qué representa una integral definida en un intervalo en la interpretación geométrica básica?', options: ['La pendiente en un punto', 'El área acumulada bajo la curva', 'El valor máximo absoluto', 'La raíz de la función'], answer: 1, explanation: 'La integral definida se interpreta como acumulación o área bajo la curva en el intervalo.', skill: 'Integrales' },
            { id: 'calculo-limite-1', prompt: 'Si al acercarse x a 2 por ambos lados f(x) se acerca a 5, ¿qué se concluye?', options: ['El límite es 5', 'La función no existe', 'La derivada es 2', 'El máximo es 5'], answer: 0, explanation: 'Cuando los acercamientos laterales coinciden, el límite existe y toma ese valor.', skill: 'Límites' },
        ],
        quimica: [
            { id: 'quimica-balanceo-1', prompt: 'Al balancear una ecuacion quimica, que se modifica correctamente?', options: ['Subindices', 'Coeficientes', 'Simbolos de elementos', 'Cargas nucleares'], answer: 1, explanation: 'Balancear significa ajustar coeficientes para conservar atomos; no se cambian subindices.', skill: 'Balanceo' },
            { id: 'quimica-ph-1', prompt: 'Una solución con pH 3 se clasifica como:', options: ['Ácida', 'Neutra', 'Básica', 'Saturada'], answer: 0, explanation: 'Un pH menor que 7 indica acidez.', skill: 'pH' },
            { id: 'quimica-mol-1', prompt: 'Si una sustancia tiene masa molar de 18 g/mol, ¿cuántos moles hay en 36 g?', options: ['0.5 mol', '1 mol', '2 mol', '18 mol'], answer: 2, explanation: 'moles = masa / masa molar = 36 / 18 = 2 mol.', skill: 'Estequiometría' },
        ],
        premedicina: [
            { id: 'premed-anatomia-1', prompt: '¿Qué estructura protege principalmente al encéfalo?', options: ['Columna vertebral', 'Cráneo', 'Costillas', 'Diafragma'], answer: 1, explanation: 'El cráneo protege al encéfalo y forma parte del sistema óseo.', skill: 'Anatomía básica' },
            { id: 'premed-respiratorio-1', prompt: 'La funcion central de los pulmones es:', options: ['Filtrar sangre', 'Intercambio de gases', 'Producir insulina', 'Controlar reflejos'], answer: 1, explanation: 'Los pulmones permiten intercambio de oxigeno y dioxido de carbono.', skill: 'Sistema respiratorio' },
            { id: 'premed-nervioso-1', prompt: 'Qué relación describe mejor al sistema nervioso?', options: ['Estímulo, transmisión y respuesta', 'Filtración, reabsorcion y excrecion', 'Digestión, absorcion y eliminacion', 'Contracción, coágulo y anticuerpo'], answer: 0, explanation: 'El sistema nervioso recibe estímulos, transmite información y coordina respuestas.', skill: 'Sistema nervioso' },
        ],
        medicina: [
            { id: 'medicina-vitales-1', prompt: 'Por que se interpretan los signos vitales en conjunto?', options: ['Porque todos miden lo mismo', 'Porque un dato aislado puede ser insuficiente', 'Porque reemplazan la historia clinica', 'Porque solo importan en reposo'], answer: 1, explanation: 'Un signo aislado no basta; se compara con otros datos y con el contexto.', skill: 'Razonamiento clinico' },
            { id: 'medicina-oxigeno-1', prompt: 'En una simulacion respiratoria, una saturacion baja debe relacionarse primero con:', options: ['Intercambio gaseoso y ventilacion', 'pH del estomago', 'Densidad osea', 'Memoria de trabajo'], answer: 0, explanation: 'La saturacion de oxigeno se conecta con ventilacion, intercambio gaseoso y circulacion.', skill: 'Caso respiratorio' },
            { id: 'medicina-caso-1', prompt: 'En un caso educativo, antes de sugerir una hipótesis conviene:', options: ['Ignorar los datos normales', 'Buscar evidencia y datos faltantes', 'Elegir al azar', 'Memorizar solo el diagnóstico'], answer: 1, explanation: 'El razonamiento clínico se apoya en evidencia, datos faltantes y relaciones entre signos.', skill: 'Casos introductorios' },
        ],
        'pensamiento-matematico': [
            { id: 'pm-aritmetica-1', prompt: 'Un producto cuesta $240 y tiene 25% de descuento. Cuanto se paga?', options: ['$60', '$180', '$215', '$300'], answer: 1, explanation: '25% de 240 es 60. Se paga 240 - 60 = 180.', skill: 'Porcentajes' },
            { id: 'pm-razon-1', prompt: 'Si 3 cuadernos cuestan $45, cuanto cuestan 8 al mismo precio unitario?', options: ['$90', '$105', '$120', '$135'], answer: 2, explanation: 'Cada cuaderno cuesta 15. Ocho cuestan 8 x 15 = 120.', skill: 'Proporcionalidad' },
            { id: 'pm-probabilidad-1', prompt: 'En una bolsa hay 4 fichas rojas y 6 azules. Cual es la probabilidad de sacar una roja?', options: ['2/5', '4/6', '6/10', '1/4'], answer: 0, explanation: 'Hay 4 rojas de 10 fichas totales: 4/10 = 2/5.', skill: 'Probabilidad' },
        ],
        'comprension-lectora': [
            { id: 'lectura-idea-1', prompt: 'La idea principal de un texto suele ser:', options: ['Un dato aislado', 'El mensaje central que organiza la información', 'Una palabra difícil', 'La última frase siempre'], answer: 1, explanation: 'La idea principal sostiene y organiza las ideas secundarias.', skill: 'Idea central' },
            { id: 'lectura-inferencia-1', prompt: 'Inferir significa:', options: ['Copiar una frase literal', 'Deducir información a partir de pistas', 'Cambiar el tema', 'Leer solo el título'], answer: 1, explanation: 'La inferencia usa evidencias del texto para llegar a una conclusión no dicha literalmente.', skill: 'Inferencia' },
            { id: 'lectura-tono-1', prompt: 'El tono de un texto se relaciona con:', options: ['La actitud o postura del autor', 'El numero de parrafos', 'El tamano de letra', 'La editorial'], answer: 0, explanation: 'El tono expresa actitud: critica, neutral, ironica, entusiasta, entre otras.', skill: 'Tono' },
        ],
        'redaccion-indirecta': [
            { id: 'redaccion-coma-1', prompt: '¿Qué opción usa coma correctamente?', options: ['Estudiaremos álgebra, física y química.', 'Estudiaremos, álgebra física y química.', 'Estudiaremos álgebra física, y química.', 'Estudiaremos álgebra física y, química.'], answer: 0, explanation: 'La coma separa elementos de una enumeración.', skill: 'Puntuación' },
            { id: 'redaccion-coherencia-1', prompt: 'Un texto coherente se caracteriza por:', options: ['Ideas relacionadas y orden lógico', 'Frases sin conexión', 'Cambios bruscos de tema', 'Solo palabras técnicas'], answer: 0, explanation: 'La coherencia surge cuando las ideas se conectan y avanzan con orden.', skill: 'Coherencia' },
            { id: 'redaccion-conector-1', prompt: '¿Qué conector expresa contraste?', options: ['Además', 'Porque', 'Sin embargo', 'Por ejemplo'], answer: 2, explanation: '"Sin embargo" introduce oposición o contraste.', skill: 'Conectores' },
        ],
    };

    let selected = new Set();
    let data = null;
    let currentExam = null;
    let answers = {};
    let latestResult = null;
    let questionCount = 8;
    let examDifficulty = 'mixta';
    let immediateFeedback = true;

    function renderPaywall(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="practice-page practice-page--paywall">
                <div class="lab-paywall">
                    <span class="pricing-eyebrow">Exámenes práctica premium</span>
                    <h1>Activa EducatIA para generar prácticas por módulo.</h1>
                    <p>${esc(message || 'Necesitas una suscripción activa para entrar a Exámenes práctica.')}</p>
                    <div class="lab-paywall__actions">
                        <a href="${Router().toUrl('/registro-alumno')}" class="btn btn--primary">Registrarme gratis</a>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Volver</a>
                    </div>
                </div>
            </section>
        `;
    }

    function questionBank() {
        const merged = { ...FALLBACK_QUESTION_BANK };
        Object.entries(data?.question_bank || {}).forEach(([id, questions]) => {
            if (Array.isArray(questions) && questions.length) {
                merged[id] = questions;
            }
        });
        return merged;
    }

    function modules() {
        const bank = questionBank();
        const byId = new Map(FALLBACK_MODULES.map((module) => [module.id, { ...module }]));
        (data?.modules || []).forEach((module) => {
            byId.set(module.id, { ...(byId.get(module.id) || {}), ...module });
        });
        return Array.from(byId.values()).map((module) => ({
            ...module,
            available_questions: Math.max(Number(module.available_questions || 0), (bank[module.id] || []).length || 0),
        }));
    }

    function getHistory() {
        try {
            const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveHistory(result) {
        const next = [result, ...getHistory()].slice(0, 8);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    function selectedModules() {
        return modules().filter((item) => selected.has(item.id));
    }

    function normalizeDifficulty(question, index) {
        const raw = String(question.difficulty || question.dificultad || '').toLowerCase();
        if (raw.includes('bas')) return 'basica';
        if (raw.includes('inter')) return 'intermedia';
        if (raw.includes('reto') || raw.includes('avanz')) return 'reto';
        const bucket = index % 3;
        return bucket === 0 ? 'basica' : bucket === 1 ? 'intermedia' : 'reto';
    }

    function moduleCard(module) {
        const active = selected.has(module.id);
        const count = Math.max(Number(module.available_questions || 0), (questionBank()[module.id] || []).length || 0);
        return `
            <button type="button" class="practice-module ${active ? 'is-selected' : ''}" data-practice-module="${esc(module.id)}">
                <span>${active ? 'Seleccionado' : 'Módulo'}</span>
                <strong>${esc(module.title)}</strong>
                <small>${count ? esc(count) + ' preguntas activas' : 'Banco en preparación'}</small>
            </button>
        `;
    }

    function shuffle(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }

    function buildQuestionSet() {
        const modules = selectedModules();
        const bank = questionBank();
        const questions = [];
        const perModule = Math.max(1, Math.ceil(questionCount / Math.max(1, modules.length)));
        modules.forEach((module) => {
            const moduleQuestions = Array.isArray(bank[module.id]) ? bank[module.id] : [];
            let pool = moduleQuestions.map((question, index) => ({
                ...question,
                difficulty: normalizeDifficulty(question, index),
            }));
            if (examDifficulty !== 'mixta') {
                const filtered = pool.filter((question) => question.difficulty === examDifficulty);
                if (filtered.length) pool = filtered;
            }
            shuffle(pool).slice(0, perModule).forEach((question) => {
                questions.push({
                    ...question,
                    module_id: module.id,
                    module_title: module.title,
                });
            });
        });
        return shuffle(questions).slice(0, Math.min(questionCount, Math.max(4, questions.length)));
    }

    function startExam() {
        const questions = buildQuestionSet();
        if (questions.length < 2) {
            C().showWebNotice?.('Exámenes práctica', 'Aún faltan preguntas para esos módulos. Prueba con otras áreas.', 'info');
            return;
        }
        answers = {};
        latestResult = null;
        currentExam = {
            id: 'practice-' + Date.now(),
            created_at: new Date().toISOString(),
            modules: selectedModules(),
            questions,
            question_count: questionCount,
            difficulty: examDifficulty,
        };
        renderContent();
        document.getElementById('practice-exam-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderSelectionSummary() {
        const container = document.getElementById('practice-selection-summary');
        if (!container || !data) return;
        const modules = selectedModules();
        const ready = modules.length >= Number(data.selection_limit || 2);
        const totalQuestions = modules.reduce((sum, module) => sum + Math.max(Number(module.available_questions || 0), (questionBank()[module.id] || []).length || 0), 0);
        container.innerHTML = `
            <span class="pricing-eyebrow">Selección</span>
            <h2>${modules.length ? modules.map((item) => esc(item.title)).join(' + ') : 'Elige dos módulos'}</h2>
            <p>${ready ? esc(totalQuestions) + ' preguntas disponibles para mezclar en un examen aleatorio.' : 'Selecciona dos áreas específicas para crear un examen combinado.'}</p>
            <div class="practice-config">
                <label>
                    <span>Reactivos</span>
                    <select id="practice-question-count">
                        ${[4, 6, 8, 10, 12].map((count) => `<option value="${count}" ${questionCount === count ? 'selected' : ''}>${count} preguntas</option>`).join('')}
                    </select>
                </label>
                <label>
                    <span>Dificultad</span>
                    <select id="practice-difficulty">
                        ${[
                            ['mixta', 'Mixta'],
                            ['basica', 'Básica'],
                            ['intermedia', 'Intermedia'],
                            ['reto', 'Reto'],
                        ].map(([value, label]) => `<option value="${value}" ${examDifficulty === value ? 'selected' : ''}>${label}</option>`).join('')}
                    </select>
                </label>
                <label class="practice-config__toggle">
                    <input id="practice-immediate-feedback" type="checkbox" ${immediateFeedback ? 'checked' : ''}>
                    <span>Tutoría inmediata</span>
                </label>
            </div>
            <button type="button" class="btn btn--primary" ${ready ? '' : 'disabled'} data-generate-practice>
                Preparar examen aleatorio
            </button>
        `;
        container.querySelector('#practice-question-count')?.addEventListener('change', (event) => {
            questionCount = Number(event.target.value || 8);
        });
        container.querySelector('#practice-difficulty')?.addEventListener('change', (event) => {
            examDifficulty = event.target.value || 'mixta';
        });
        container.querySelector('#practice-immediate-feedback')?.addEventListener('change', (event) => {
            immediateFeedback = Boolean(event.target.checked);
        });
        container.querySelector('[data-generate-practice]')?.addEventListener('click', startExam);
    }

    function renderHistory() {
        const history = getHistory();
        if (!history.length) {
            return '<p class="text-small">Aún no hay intentos guardados en este navegador.</p>';
        }
        return `
            <div class="practice-history">
                ${history.map((item) => `
                    <article>
                        <strong>${esc(item.score)}%</strong>
                        <span>${esc(item.modules || 'Práctica')}</span>
                        <small>${esc(item.total || '?')} reactivos - ${esc(item.difficulty || 'mixta')}</small>
                        <small>${esc(new Date(item.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</small>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderExamPanel() {
        if (!currentExam) {
            return `
                <section id="practice-exam-panel" class="practice-exam practice-exam--empty">
                    <div>
                        <span class="pricing-eyebrow">Simulador</span>
                        <h2>Selecciona dos módulos para iniciar.</h2>
                        <p>El examen mezcla preguntas aleatorias, calcula tu resultado y te explica cada respuesta al terminar.</p>
                    </div>
                    <aside>
                        <strong>Historial reciente</strong>
                        ${renderHistory()}
                    </aside>
                </section>
            `;
        }

        if (latestResult) {
            const wrongItems = latestResult.items.filter((item) => !item.correct);
            return `
                <section id="practice-exam-panel" class="practice-exam practice-exam--result">
                    <div class="practice-result-card">
                        <span class="pricing-eyebrow">Resultado</span>
                        <h2>${esc(latestResult.score)}%</h2>
                        <p>${esc(latestResult.correct)} de ${esc(latestResult.total)} respuestas correctas en ${esc(latestResult.modules)}.</p>
                        <div class="practice-result-card__actions">
                            ${wrongItems.length ? '<button type="button" class="btn btn--primary" data-repeat-wrong-practice>Repetir falladas</button>' : ''}
                            <button type="button" class="btn btn--primary" data-repeat-practice>Generar otro examen</button>
                            <button type="button" class="btn btn--outline" data-reset-practice>Elegir otros módulos</button>
                        </div>
                    </div>
                    <div class="practice-feedback-list">
                        ${latestResult.items.map((item, index) => `
                            <article class="${item.correct ? 'is-correct' : 'is-wrong'}">
                                <span>${esc(item.module_title)} - ${item.correct ? 'Correcta' : 'Revisar'}</span>
                                <h3>${index + 1}. ${esc(item.prompt)}</h3>
                                <p><strong>Tu respuesta:</strong> ${esc(item.selectedText || 'Sin respuesta')}</p>
                                <p><strong>Respuesta esperada:</strong> ${esc(item.correctText)}</p>
                                <small>${esc(item.explanation)}</small>
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        return `
            <section id="practice-exam-panel" class="practice-exam">
                <div class="practice-exam__head">
                    <div>
                        <span class="pricing-eyebrow">Examen aleatorio</span>
                        <h2>${esc(currentExam.modules.map((item) => item.title).join(' + '))}</h2>
                        <p>${esc(currentExam.questions.length)} preguntas - dificultad ${esc(currentExam.difficulty)}. ${immediateFeedback ? 'Recibirás retroalimentación al elegir cada respuesta.' : 'La retroalimentación aparecerá al final.'}</p>
                    </div>
                    <button type="button" class="btn btn--outline btn--sm" data-reset-current-exam>Cancelar</button>
                </div>
                <form id="practice-exam-form" class="practice-question-list">
                    ${currentExam.questions.map((question, index) => `
                        <fieldset class="practice-question">
                            <legend>${index + 1}. ${esc(question.prompt)}</legend>
                            <small>${esc(question.module_title)} - ${esc(question.skill || 'Práctica')}</small>
                            ${(question.options || []).map((option, optionIndex) => `
                                <label>
                                    <input type="radio" name="question-${esc(question.id)}" value="${optionIndex}">
                                    <span>${esc(option)}</span>
                                </label>
                            `).join('')}
                            <p class="practice-inline-feedback" id="practice-feedback-${esc(question.id)}" aria-live="polite"></p>
                        </fieldset>
                    `).join('')}
                    <button type="submit" class="btn btn--primary">Enviar respuestas</button>
                </form>
            </section>
        `;
    }

    function evaluateExam() {
        const items = currentExam.questions.map((question) => {
            const selectedIndex = answers[question.id];
            const correct = Number(selectedIndex) === Number(question.answer);
            return {
                ...question,
                correct,
                selectedText: question.options?.[selectedIndex],
                correctText: question.options?.[question.answer],
            };
        });
        const correct = items.filter((item) => item.correct).length;
        const total = items.length || 1;
        latestResult = {
            created_at: new Date().toISOString(),
            modules: currentExam.modules.map((item) => item.title).join(' + '),
            score: Math.round((correct / total) * 100),
            correct,
            total,
            items,
            difficulty: currentExam.difficulty,
        };
        saveHistory({
            created_at: latestResult.created_at,
            modules: latestResult.modules,
            score: latestResult.score,
            correct,
            total,
            difficulty: latestResult.difficulty,
        });
        renderContent();
        document.getElementById('practice-exam-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function repeatWrongQuestions() {
        const wrongItems = latestResult?.items?.filter((item) => !item.correct) || [];
        if (!wrongItems.length) {
            C().showWebNotice?.('Exámenes práctica', 'No hay preguntas falladas para repetir en este intento.', 'success');
            return;
        }

        const modulesById = new Map();
        wrongItems.forEach((item) => {
            modulesById.set(item.module_id, { id: item.module_id, title: item.module_title });
        });

        currentExam = {
            id: 'practice-review-' + Date.now(),
            created_at: new Date().toISOString(),
            modules: Array.from(modulesById.values()),
            questions: wrongItems.map((item) => {
                const { correct, selectedText, correctText, ...question } = item;
                return question;
            }),
            question_count: wrongItems.length,
            difficulty: 'repaso de falladas',
        };
        latestResult = null;
        answers = {};
        renderContent();
        document.getElementById('practice-exam-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function bindModules() {
        document.querySelectorAll('[data-practice-module]').forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.dataset.practiceModule;
                currentExam = null;
                latestResult = null;
                if (selected.has(id)) {
                    selected.delete(id);
                } else {
                    if (selected.size >= Number(data.selection_limit || 2)) {
                        const first = selected.values().next().value;
                        selected.delete(first);
                    }
                    selected.add(id);
                }
                renderContent();
            });
        });
    }

    function bindExam() {
        document.querySelector('[data-reset-current-exam]')?.addEventListener('click', () => {
            currentExam = null;
            answers = {};
            renderContent();
        });
        document.querySelector('[data-repeat-practice]')?.addEventListener('click', startExam);
        document.querySelector('[data-repeat-wrong-practice]')?.addEventListener('click', repeatWrongQuestions);
        document.querySelector('[data-reset-practice]')?.addEventListener('click', () => {
            currentExam = null;
            latestResult = null;
            answers = {};
            selected = new Set();
            renderContent();
        });

        const form = document.getElementById('practice-exam-form');
        if (!form || !currentExam) return;
        form.addEventListener('change', (event) => {
            const input = event.target.closest('input[type="radio"]');
            if (!input) return;
            const questionId = input.name.replace('question-', '');
            answers[questionId] = Number(input.value);
            if (!immediateFeedback) return;
            const question = currentExam.questions.find((item) => String(item.id) === questionId);
            const feedback = document.getElementById('practice-feedback-' + questionId);
            if (!question || !feedback) return;
            const correct = Number(input.value) === Number(question.answer);
            feedback.textContent = `${correct ? 'Correcto.' : 'Todavia no.'} ${question.explanation || ''}`;
            feedback.classList.toggle('is-correct', correct);
            feedback.classList.toggle('is-wrong', !correct);
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            evaluateExam();
        });
    }

    function renderContent() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <main class="practice-page">
                <section class="practice-hero">
                    <div>
                        <span class="pricing-eyebrow">Práctica inteligente</span>
                        <h1>${esc(data.title || 'Exámenes práctica')}</h1>
                        <p>${esc(data.description || 'Selecciona dos módulos para preparar exámenes aleatorios por área.')}</p>
                    </div>
                    <div class="practice-ale">
                        <strong>Retroalimentación por intento</strong>
                        <p>Al terminar podrás revisar aciertos, errores y explicaciones para orientar tu siguiente sesión.</p>
                    </div>
                </section>

                <section class="practice-layout">
                    <div class="practice-module-grid">
                        ${modules().map(moduleCard).join('')}
                    </div>
                    <aside id="practice-selection-summary" class="practice-summary"></aside>
                </section>

                ${renderExamPanel()}
            </main>
        `;
        bindModules();
        renderSelectionSummary();
        bindExam();
    }

    async function render() {
        if (!C().requireAuth('alumno')) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando exámenes práctica');
        selected = new Set();
        currentExam = null;
        latestResult = null;
        answers = {};
        try {
            data = await API().getPracticeExamLab();
        } catch (error) {
            renderPaywall(error.message);
            return;
        }
        renderContent();
    }

    return { render };
})();
