/* ================================================================
   educatIA - Timed assessments
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Assessment = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const aleEnabled = () => window.EducatIA.Features?.ale === true;

    let currentAnswers = {};
    let currentQuestionIndex = 0;
    let timerId = null;
    let saveTimerId = null;
    let aleHistory = [];

    function clearTimer() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
        if (saveTimerId) {
            window.clearTimeout(saveTimerId);
            saveTimerId = null;
        }
    }

    function formatTime(seconds) {
        const safe = Math.max(0, Number(seconds || 0));
        const hours = Math.floor(safe / 3600);
        const minutes = Math.floor((safe % 3600) / 60);
        const rest = safe % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
    }

    function answeredCount() {
        return Object.keys(currentAnswers || {}).length;
    }

    function optionLabel(index) {
        return String.fromCharCode(65 + Number(index || 0));
    }

    function renderShell(title, subtitle, body) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page-wrap assessment-page">
                <div class="page-hd assessment-page__header">
                    <span class="section__label">Simuladores EXANI</span>
                    <h1>${esc(title)}</h1>
                    <p>${esc(subtitle)}</p>
                </div>
                ${body}
            </div>
        `;
    }

    function renderEmpty(kind) {
        renderShell(
            kind === 'diagnostico' ? 'Diagnóstico inicial' : 'Simuladores EXANI',
            'Aún no hay evaluaciones publicadas para esta sección.',
            `<div class="empty">
                <h3>Contenido pendiente</h3>
                <p>Cuando el equipo publique un ${kind}, aparecerá aquí con tiempo, preguntas y resultado final.</p>
                <a href="#/dashboard" class="btn btn--out">Volver a mi aprendizaje</a>
            </div>`
        );
    }

    function renderAssessmentCard(quiz, kind) {
        const title = kind === 'diagnostico' ? 'Diagnóstico inicial' : 'Simulacro EXANI-II';
        const duration = quiz.duracion_minutos || (kind === 'simulacro' ? 180 : 30);
        return `
            <article class="assessment-card">
                <div>
                    <span class="section__label">${esc(title)}</span>
                    <h2>${esc(quiz.titulo)}</h2>
                    <p>${esc(quiz.descripcion || 'Responde con calma. Al finalizar verás tu resultado y quedará guardado en calificaciones.')}</p>
                </div>
                <div class="assessment-card__stats" aria-label="Resumen de evaluación">
                    <div><span>Reactivos</span><strong>${esc(quiz.preguntas?.length || quiz.objetivo_preguntas || 0)}</strong></div>
                    <div><span>Tiempo</span><strong>${esc(duration)} min</strong></div>
                    <div><span>Modo</span><strong>${kind === 'simulacro' ? 'General' : 'Inicial'}</strong></div>
                </div>
                <div class="assessment-card__note">
                    <strong>Antes de iniciar</strong>
                    <p>El simulador se responde reactivo por reactivo. Tendrás ${esc(duration)} minutos; trabaja sin interrupciones y revisa los reactivos pendientes antes de finalizar.</p>
                </div>
                <button type="button" class="btn btn--pri" data-start-assessment="${quiz.id}">Iniciar simulador</button>
            </article>
        `;
    }

    async function startAssessment(quizId) {
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Preparando evaluación');
        const session = await API().startAssessmentSession(quizId);
        currentAnswers = { ...(session.respuestas || {}) };
        currentQuestionIndex = firstUnansweredIndex(session.quiz?.preguntas || []);
        aleHistory = [];
        renderSession(session);
    }

    function firstUnansweredIndex(questions) {
        const index = questions.findIndex((question) => currentAnswers[String(question.id)] === undefined);
        return index >= 0 ? index : 0;
    }

    function scheduleAnswerSave(sessionId) {
        if (saveTimerId) window.clearTimeout(saveTimerId);
        saveTimerId = window.setTimeout(() => {
            API().saveAssessmentAnswers(sessionId, currentAnswers).catch(() => {});
        }, 500);
    }

    function renderAleMessages() {
        const slot = document.getElementById('assessment-ale-messages');
        if (!slot) return;
        if (!aleHistory.length) {
            slot.innerHTML = '<p class="assessment-ale__empty">Bill puede ayudarte a razonar esta pregunta sin resolverla por ti.</p>';
            return;
        }
        slot.innerHTML = aleHistory.map((item) => `
            <div class="assessment-ale__message assessment-ale__message--${esc(item.role)}">
                ${esc(item.text).replace(/\n/g, '<br>')}
            </div>
        `).join('');
        slot.scrollTop = slot.scrollHeight;
    }

    function buildAlePrompt(session, userPrompt) {
        const questions = session.quiz?.preguntas || [];
        const question = questions[currentQuestionIndex] || {};
        const selected = currentAnswers[String(question.id)];
        const options = (question.opciones || []).map((option, index) => `${optionLabel(index)}) ${option.texto}`).join('\n');
        const selectedLine = selected === undefined ? 'El alumno aún no seleccionó respuesta.' : `El alumno seleccionó ${optionLabel(selected)}.`;
        return [
            'Ayuda como profesor personal de EducatIA.',
            'No des la respuesta final directa. Guía el razonamiento, explica el concepto y propón cómo descartar opciones.',
            `Examen: ${session.quiz?.titulo || 'Simulacro EXANI-II'}`,
            `Reactivo ${currentQuestionIndex + 1}: ${question.texto || ''}`,
            `Opciones:\n${options}`,
            selectedLine,
            `Pregunta del alumno: ${userPrompt}`,
        ].join('\n\n');
    }

    async function sendAleMessage(session, text) {
        const prompt = String(text || '').trim();
        if (!prompt) return;
        const input = document.getElementById('assessment-ale-input');
        const send = document.getElementById('assessment-ale-send');
        aleHistory.push({ role: 'user', text: prompt });
        renderAleMessages();
        if (input) input.value = '';
        if (send) send.disabled = true;
        try {
            const response = await API().assessmentSessionChat(
                session.id,
                buildAlePrompt(session, prompt),
                aleHistory.slice(-6).map((item) => `${item.role}: ${item.text}`)
            );
            aleHistory.push({ role: 'bot', text: response.respuesta || 'Bill no pudo responder en este momento.' });
        } catch (error) {
            aleHistory.push({ role: 'bot', text: error.message || 'No pude consultar a Bill ahora. Intenta de nuevo en un momento.' });
        } finally {
            if (send) send.disabled = false;
            renderAleMessages();
        }
    }

    function renderCurrentQuestion(session) {
        const questions = session.quiz?.preguntas || [];
        const question = questions[currentQuestionIndex];
        const slot = document.getElementById('assessment-question-slot');
        if (!slot || !question) return;
        const selected = currentAnswers[String(question.id)];
        slot.innerHTML = `
            <div class="assessment-question__meta">
                <span>Reactivo ${currentQuestionIndex + 1} de ${questions.length}</span>
                <strong>${selected === undefined ? 'Sin responder' : 'Respondido'}</strong>
            </div>
            <fieldset class="assessment-question">
                <legend>${esc(question.texto)}</legend>
                <div class="assessment-options">
                    ${(question.opciones || []).map((option, optionIndex) => `
                        <label class="assessment-option ${Number(selected) === optionIndex ? 'is-selected' : ''}">
                            <input type="radio" name="q-${question.id}" value="${optionIndex}" data-question-option ${Number(selected) === optionIndex ? 'checked' : ''}>
                            <span class="assessment-option__letter">${optionLabel(optionIndex)}</span>
                            <span>${esc(option.texto)}</span>
                        </label>
                    `).join('')}
                </div>
            </fieldset>
        `;

        document.getElementById('assessment-current-index').textContent = String(currentQuestionIndex + 1);
        document.getElementById('assessment-answered-count').textContent = String(answeredCount());
        document.getElementById('assessment-prev').disabled = currentQuestionIndex === 0;
        document.getElementById('assessment-next').disabled = currentQuestionIndex >= questions.length - 1;
        document.querySelectorAll('[data-question-option]').forEach((input) => {
            input.addEventListener('change', () => {
                currentAnswers[String(question.id)] = Number(input.value);
                scheduleAnswerSave(session.id);
                renderCurrentQuestion(session);
            });
        });
        renderAleMessages();
    }

    function bindAssessmentControls(session) {
        const questions = session.quiz?.preguntas || [];
        document.getElementById('assessment-prev')?.addEventListener('click', () => {
            currentQuestionIndex = Math.max(0, currentQuestionIndex - 1);
            aleHistory = [];
            renderCurrentQuestion(session);
        });
        document.getElementById('assessment-next')?.addEventListener('click', () => {
            currentQuestionIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
            aleHistory = [];
            renderCurrentQuestion(session);
        });
        document.getElementById('assessment-finish')?.addEventListener('click', async () => {
            const button = document.getElementById('assessment-finish');
            button.disabled = true;
            button.textContent = 'Enviando...';
            try {
                const result = await API().finishAssessmentSession(session.id, currentAnswers);
                clearTimer();
                renderResult(result);
            } catch (error) {
                button.disabled = false;
                button.textContent = 'Finalizar simulador';
                C().showWebNotice('Evaluación no finalizada', error.message || 'No fue posible enviar tus respuestas.', 'error');
            }
        });
        document.querySelectorAll('[data-assessment-ale-prompt]').forEach((button) => {
            button.addEventListener('click', () => sendAleMessage(session, button.dataset.assessmentAlePrompt));
        });
        document.getElementById('assessment-ale-send')?.addEventListener('click', () => {
            sendAleMessage(session, document.getElementById('assessment-ale-input')?.value || '');
        });
        document.getElementById('assessment-ale-input')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendAleMessage(session, event.currentTarget.value || '');
            }
        });
    }

    function renderSession(session) {
        const quiz = session.quiz || {};
        const questions = quiz.preguntas || [];
        let remaining = Number(session.segundos_restantes || 0);
        renderShell(
            quiz.titulo || 'Simulador EXANI-II',
            'Responde reactivo por reactivo. Tus respuestas se guardan durante la sesión y se califican al finalizar.',
            `
            <section class="assessment-runner">
                <div class="assessment-runner__top">
                    <div>
                        <span class="section__label">${esc(quiz.tipo || 'simulacro')}</span>
                        <h2>${esc(quiz.titulo || 'Simulador EXANI-II')}</h2>
                    </div>
                    <div class="assessment-runner__status">
                        <strong id="assessment-timer">${formatTime(remaining)}</strong>
                        <span><b id="assessment-answered-count">${answeredCount()}</b> / ${questions.length} contestados</span>
                        <span>Reactivo <b id="assessment-current-index">${currentQuestionIndex + 1}</b></span>
                    </div>
                </div>

                <div class="assessment-runner__layout ${aleEnabled() ? '' : 'assessment-runner__layout--solo'}">
                    <article class="assessment-question-card">
                        <div id="assessment-question-slot"></div>
                        <div class="assessment-nav">
                            <button type="button" class="btn btn--outline" id="assessment-prev">Anterior</button>
                            <button type="button" class="btn btn--outline" id="assessment-next">Siguiente</button>
                            <button type="button" class="btn btn--primary" id="assessment-finish">Finalizar simulador</button>
                        </div>
                    </article>

                    ${aleEnabled() ? `<aside class="assessment-ale" aria-label="Bill para el reactivo actual">
                        <span class="section__label">Bill contextual</span>
                        <h3>Apoyo para este reactivo</h3>
                        <p>Bill solo recibirá esta pregunta y tus dudas para mantener el contexto de estudio.</p>
                        <div class="assessment-ale__quick">
                            <button type="button" data-assessment-ale-prompt="Explícame qué concepto evalúa esta pregunta.">Concepto</button>
                            <button type="button" data-assessment-ale-prompt="Ayúdame a descartar opciones sin decirme la respuesta.">Descartar opciones</button>
                            <button type="button" data-assessment-ale-prompt="Dame una pista paso a paso.">Pista</button>
                        </div>
                        <div class="assessment-ale__messages" id="assessment-ale-messages"></div>
                        <div class="assessment-ale__composer">
                            <textarea id="assessment-ale-input" rows="2" placeholder="Pregúntale a Bill sobre este reactivo"></textarea>
                            <button type="button" id="assessment-ale-send">Enviar</button>
                        </div>
                    </aside>` : ''}
                </div>
            </section>`
        );

        clearTimer();
        timerId = window.setInterval(() => {
            remaining -= 1;
            const timer = document.getElementById('assessment-timer');
            if (timer) timer.textContent = formatTime(remaining);
            if (remaining <= 0) {
                clearTimer();
                document.getElementById('assessment-finish')?.click();
            }
        }, 1000);
        bindAssessmentControls(session);
        renderCurrentQuestion(session);
    }

    function renderResult(session) {
        const score = Number(session.calificacion || 0);
        const quiz = session.quiz || {};
        const total = quiz.preguntas?.length || 0;
        renderShell(
            'Evaluación finalizada',
            'Tu resultado quedó guardado en calificaciones.',
            `<section class="assessment-result">
                <span class="section__label">Resultado</span>
                <h2>${score.toFixed(1)} / 10</h2>
                <p>Contestaste ${answeredCount()} de ${total} reactivos. Usa este resultado para decidir qué temas reforzar en tu siguiente sesión.</p>
                <div class="assessment-result__actions">
                    <a href="#/calificaciones" class="btn btn--pri">Ver calificaciones</a>
                    <a href="/simuladores-exani" class="btn btn--out">Elegir otro simulador</a>
                    <a href="#/dashboard" class="btn btn--out">Volver a mi aprendizaje</a>
                </div>
            </section>`
        );
    }

    async function renderDiagnostic() {
        if (!C().requireAuth('alumno')) return;
        clearTimer();
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando diagnóstico');
        const quiz = await API().getDiagnostic();
        if (!quiz) {
            renderEmpty('diagnostico');
            return;
        }
        renderShell('Diagnóstico inicial', 'Mide tu punto de partida antes de elegir ritmo y prioridades.', renderAssessmentCard(quiz, 'diagnostico'));
        document.querySelector('[data-start-assessment]')?.addEventListener('click', () => startAssessment(quiz.id));
    }

    async function renderMockExams() {
        if (!C().requireAuth('alumno')) return;
        clearTimer();
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando simuladores');
        const quizzes = await API().getMockExams();
        if (!Array.isArray(quizzes) || !quizzes.length) {
            renderEmpty('simulacro');
            return;
        }
        renderShell(
            'Simuladores EXANI-II',
            'Entrena con exámenes generales temporizados, reactivo por reactivo, y revisa tus resultados por habilidad.',
            `<div class="assessment-list">${quizzes.map((quiz) => renderAssessmentCard(quiz, 'simulacro')).join('')}</div>`
        );
        document.querySelectorAll('[data-start-assessment]').forEach((button) => {
            button.addEventListener('click', () => startAssessment(Number(button.dataset.startAssessment)));
        });
    }

    return {
        renderDiagnostic,
        renderMockExams,
    };
})();
