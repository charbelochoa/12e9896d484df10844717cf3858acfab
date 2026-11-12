/* ================================================================
   educatIA - EXANI full simulator
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.ExaniSimulator = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;
    const MATH_VISUAL_IMAGE_BASE = 'https://media.educatia.test/tests_images/pensamiento_matematico';
    const START_EXAM_ASSET = 'assets/emprezar_examen_asset/empezar_examen.png';
    const PREMEDICINE_SLUG = 'premedicina';
    const GENERAL_MODULE_SLUGS = new Set(['ciencias-experimentales', 'ciencias-sociales']);
    const isAleEnabled = () => window.EducatIA.Features?.ale === true;

    let timerId = null;
    let selectedModuleSlugs = ['', ''];

    function clearTimer() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    function setExamMode(enabled) {
        document.body.classList.toggle('exam-mode', Boolean(enabled));
        const header = document.getElementById('site-header');
        const footer = document.getElementById('site-footer');
        if (header) {
            header.style.display = enabled ? 'none' : '';
        }
        if (footer) {
            footer.style.display = enabled ? 'none' : '';
        }
    }

    function formatTime(seconds) {
        const safe = Math.max(0, Number(seconds || 0));
        const hours = Math.floor(safe / 3600);
        const minutes = Math.floor((safe % 3600) / 60);
        const rest = safe % 60;
        return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(rest).padStart(2, '0')}s`;
    }

    function formatClock(value) {
        if (!value) return '--:--:--';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--:--:--';
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function formatPercent(value) {
        const number = Number(value || 0);
        return `${Number.isInteger(number) ? number : number.toFixed(1)}%`;
    }

    function optionLabel(index) {
        return String.fromCharCode(65 + Number(index || 0));
    }

    function reactivePath(sessionId, order, options = {}) {
        return window.EducatIA.Utils.exaniQuestionUrl(sessionId, order, options);
    }

    function mathVisualImage(question) {
        const match = String(question?.visual_id || '').match(/^PM-(\d{3})$/i);
        if (!match) return '';
        return `${MATH_VISUAL_IMAGE_BASE}/pm-${match[1]}.png`;
    }

    function renderShell(title, subtitle, body) {
        const app = document.getElementById('app');
        setExamMode(false);
        app.innerHTML = `
            <div class="page-wrap assessment-page exani-entry-page">
                <div class="page-hd assessment-page__header">
                    <span class="section__label">Simuladores EXANI-II</span>
                    <h1>${esc(title)}</h1>
                    <p>${esc(subtitle)}</p>
                </div>
                ${body}
            </div>
        `;
    }

    function moduleOptions(summary, selectIndex) {
        const options = Array.isArray(summary.module_options) ? summary.module_options : [];
        const current = selectedModuleSlugs[selectIndex] || '';
        const other = selectedModuleSlugs[selectIndex === 0 ? 1 : 0] || '';
        return [
            `<option value="">Selecciona un m\u00f3dulo</option>`,
            ...options.map((item) => {
                const disabled = item.slug === other ? 'disabled' : '';
                const selected = item.slug === current ? 'selected' : '';
                return `<option value="${esc(item.slug)}" ${selected} ${disabled}>${esc(item.title)}</option>`;
            }),
        ].join('');
    }

    function selectedModuleValues() {
        return selectedModuleSlugs.filter(Boolean);
    }

    function selectionIsValid() {
        const values = selectedModuleValues();
        const selected = new Set(values);
        if (values.length === 1 && values[0] === PREMEDICINE_SLUG) return true;
        if (selected.has(PREMEDICINE_SLUG)) return false;
        if ([...selected].some((slug) => GENERAL_MODULE_SLUGS.has(slug))) {
            return values.length === 2 && [...GENERAL_MODULE_SLUGS].every((slug) => selected.has(slug));
        }
        return values.length === 2 && selected.size === 2;
    }

    function syncModuleSelects() {
        const selects = Array.from(document.querySelectorAll('[data-exani-module-select]'));
        selects.forEach((select, index) => {
            const other = selectedModuleSlugs[index === 0 ? 1 : 0] || '';
            Array.from(select.options).forEach((option) => {
                option.disabled = Boolean(option.value && option.value === other);
            });
        });
        const start = document.querySelector('[data-start-exani]');
        if (start) {
            start.disabled = !selectionIsValid();
        }
    }

    function renderEntry(summary) {
        const active = summary.active_session || null;
        const hasModules = Array.isArray(summary.module_options) && summary.module_options.length >= 2;
        if (!hasModules) selectedModuleSlugs = ['', ''];
        setExamMode(false);
        document.getElementById('app').innerHTML = `
            <div class="page-wrap exani-entry-page exani-entry-page--official">
                <section class="exani-official-intro" aria-labelledby="exani-official-title">
                    <div class="exani-official-intro__body">
                        <span class="section__label">Antes de comenzar</span>
                        <h1 id="exani-official-title">Examen de pr\u00e1ctica completo</h1>
                        <p>En este apartado podr\u00e1s realizar un examen cuantas veces sea necesario. Tu esfuerzo y constancia son importantes para alcanzar un buen resultado el d\u00eda de tu aplicaci\u00f3n.</p>
                        <p>El ejercicio est\u00e1 integrado por <strong>${esc(summary.reactivos_por_simulador || 138)} reactivos</strong>. Resp\u00f3ndelo con cuidado, sin interrupciones ni ayuda externa, en una sola sesi\u00f3n de hasta <strong>${esc(summary.duracion_minutos || 270)} minutos</strong>.</p>
                        <p class="exani-official-intro__lead">Lee con atenci\u00f3n las siguientes instrucciones:</p>
                        <ol>
                            <li>Lee cuidadosamente cada reactivo y elige la opci\u00f3n que consideres correcta.</li>
                            <li>Contesta la totalidad de los reactivos para que la pr\u00e1ctica sea lo m\u00e1s parecida posible a la aplicaci\u00f3n real.</li>
                            <li>Si no conoces una respuesta, contin\u00faa con la siguiente pregunta. Podr\u00e1s regresar mientras el intento permanezca activo.</li>
                            <li>Consulta la barra de avance para distinguir los reactivos contestados, pendientes y el reactivo actual.</li>
                            <li>Revisa constantemente el tiempo disponible y el n\u00famero de pregunta que est\u00e1s respondiendo.</li>
                            <li>Al finalizar recibir\u00e1s tu porcentaje por \u00e1rea y una revisi\u00f3n detallada de aciertos y errores.</li>
                            <li>Procura realizar el simulacro en condiciones tranquilas y reserva el tiempo completo antes de comenzar.</li>
                        </ol>
                        <p class="exani-official-intro__forward"><strong>\u00a1Adelante!</strong></p>
                    </div>
                </section>
            <section class="exani-entry exani-entry--compact">
                <article class="exani-start-card exani-start-card--official">
                    <div class="exani-start-card__media">
                        <img src="${START_EXAM_ASSET}" alt="Alumno iniciando examen EXANI-II" loading="eager" decoding="async">
                    </div>
                    <div class="exani-start-card__content">
                        <h2>Elige tus m\u00f3dulos</h2>
                        <p class="exani-start-card__brief">Tu simulacro incluir\u00e1 90 reactivos transversales y 48 disciplinares.</p>
                        <div class="exani-module-selectors">
                            <label>
                                <span>M\u00f3dulo 1</span>
                                <select data-exani-module-select="0" ${hasModules ? '' : 'disabled'}>
                                    ${moduleOptions(summary, 0)}
                                </select>
                            </label>
                            <label>
                                <span>M\u00f3dulo 2</span>
                                <select data-exani-module-select="1" ${hasModules ? '' : 'disabled'}>
                                    ${moduleOptions(summary, 1)}
                                </select>
                            </label>
                        </div>
                        ${active ? `
                            <div class="exani-entry__active">
                                <strong>Sesi\u00f3n activa</strong>
                                <span>${esc(active.reactivos_contestados)} / ${esc(active.total_reactivos)} contestados &middot; ${formatTime(active.segundos_restantes)} restantes</span>
                            </div>
                        ` : ''}
                        <div class="exani-entry__actions">
                            ${active ? `
                                <button type="button" class="btn btn--outline" data-continue-exani="${active.id}" data-order="${active.siguiente_reactivo || 1}">
                                    Continuar sesi\u00f3n
                                </button>
                            ` : ''}
                            <button type="button" class="btn btn--primary" data-start-exani ${hasModules ? '' : 'disabled'}>Empezar</button>
                        </div>
                    </div>
                </article>
            </section>
            </div>`;

        document.querySelectorAll('[data-exani-module-select]').forEach((select) => {
            select.addEventListener('change', (event) => {
                const index = Number(event.currentTarget.dataset.exaniModuleSelect || 0);
                const value = event.currentTarget.value || '';
                selectedModuleSlugs[index] = value;
                if (value === PREMEDICINE_SLUG) {
                    selectedModuleSlugs = index === 0 ? [PREMEDICINE_SLUG, ''] : ['', PREMEDICINE_SLUG];
                    renderEntry(summary);
                    return;
                }
                const otherIndex = index === 0 ? 1 : 0;
                if (selectedModuleSlugs[otherIndex] === PREMEDICINE_SLUG) {
                    selectedModuleSlugs[otherIndex] = '';
                    renderEntry(summary);
                    return;
                }
                syncModuleSelects();
            });
        });
        syncModuleSelects();

        document.querySelector('[data-start-exani]')?.addEventListener('click', async (event) => {
            const modules = selectedModuleValues();
            if (!selectionIsValid()) return;
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = 'Preparando...';
            try {
                const session = await API().startRandomExaniSimulator(modules);
                Router().navigate(reactivePath(session.id, session.current_order || session.question?.order || 1));
            } catch (error) {
                button.disabled = false;
                button.textContent = 'Empezar';
                C().showWebNotice('Simulacro no iniciado', error.message || 'No fue posible preparar el simulacro.', 'error');
            }
        });

        document.querySelector('[data-continue-exani]')?.addEventListener('click', (event) => {
            Router().navigate(reactivePath(event.currentTarget.dataset.continueExani, event.currentTarget.dataset.order || 1));
        });
    }

    async function renderHome() {
        if (!C().requireAuth('alumno')) return;
        clearTimer();
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando simuladores EXANI');
        try {
            const summary = await API().getExaniSimulatorSummary();
            renderEntry(summary);
        } catch (error) {
            renderShell('Simuladores EXANI-II', error.message || 'No pudimos cargar los simuladores.', `<a href="${Router().toUrl('/dashboard')}" class="btn btn--primary">Volver</a>`);
        }
    }

    function paragraphs(value) {
        const text = esc(sanitizeExamText(value || ''));
        return text.split(/\n{2,}/).filter(Boolean).map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`).join('');
    }

    function sanitizeExamText(value) {
        return String(value || '')
            // Respaldo para respuestas guardadas antes de limpiar el backend.
            .replace(/^\s*reactivo\s+visual:\s*[^\n]+?\.\s*archivo\s+esperado:\s*[^\n]+?\.\s*esta\s+misma\s+imagen\s+debe\s+usarse\s+cada\s+vez\s+que\s+aparezca\s+este\s+reactivo\.?\s*$/gim, '')
            .replace(/\btexto\s+(?:n[uú]mero\s+)?\d{2,}\b/gi, 'texto')
            .replace(/\breactivo\s+(?:n[uú]mero\s+)?\d{2,}\b/gi, 'reactivo')
            .replace(/\b(?:el\s+)?texto\s+(?:n(?:u|ú|u\u0301)mero\s+)?\d{2,}\b/gi, 'el texto')
            .replace(/\b(?:este\s+)?reactivo\s+(?:n(?:u|ú|u\u0301)mero\s+)?\d{2,}\b/gi, 'este reactivo')
            .replace(/\b(?:pregunta|ejercicio)\s+(?:n(?:u|ú|u\u0301)mero\s+)?\d{2,}\b/gi, (match) => match.toLowerCase().startsWith('ejercicio') ? 'ejercicio' : 'pregunta')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
    }

    const ALLOWED_RICH_TAGS = new Set([
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'sup', 'sub', 'span', 'div',
        'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'math', 'mrow', 'mi', 'mn', 'mo', 'mfrac', 'msup', 'msub', 'msqrt',
        'mroot', 'mstyle', 'msubsup', 'munderover', 'munder', 'mover', 'mtable',
        'mtr', 'mtd', 'mfenced', 'ms', 'mtext', 'semantics', 'annotation',
    ]);
    const ALLOWED_RICH_ATTRS = new Set([
        'xmlns', 'display', 'displaystyle', 'mathvariant', 'class', 'colspan',
        'rowspan', 'aria-label', 'encoding',
    ]);

    function hasRichMarkup(value) {
        return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
    }

    function sanitizeRichHtml(value) {
        const template = document.createElement('template');
        template.innerHTML = String(value || '');
        const cleanNode = (node) => {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    child.textContent = sanitizeExamText(child.textContent || '');
                    return;
                }
                if (child.nodeType !== Node.ELEMENT_NODE) {
                    child.remove();
                    return;
                }
                const tag = child.tagName.toLowerCase();
                if (!ALLOWED_RICH_TAGS.has(tag)) {
                    child.replaceWith(document.createTextNode(child.textContent || ''));
                    return;
                }
                Array.from(child.attributes).forEach((attr) => {
                    const name = attr.name.toLowerCase();
                    if (name.startsWith('on') || !ALLOWED_RICH_ATTRS.has(name)) {
                        child.removeAttribute(attr.name);
                    }
                });
                cleanNode(child);
            });
        };
        cleanNode(template.content);
        return template.innerHTML;
    }

    function richBlock(value) {
        const raw = sanitizeExamText(value || '');
        if (!hasRichMarkup(raw)) return paragraphs(raw);
        return sanitizeRichHtml(raw);
    }

    function richInline(value) {
        const raw = sanitizeExamText(value || '');
        if (!hasRichMarkup(raw)) return esc(raw).replace(/\n/g, '<br>');
        return sanitizeRichHtml(raw);
    }

    function contextualPrompt(value, skill) {
        const raw = String(value || '');
        const normalizedSkill = String(skill || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!/nimos contextuales/i.test(normalizedSkill)) return raw;
        const targets = ['hostil', 'precisos', 'viable', 'diligente', 'ambigua', 'pila', 'verosímil', 'contundente', 'obsoletas', 'clara'];
        const target = targets.find((candidate) => new RegExp(`\\b${candidate}\\b`, 'iu').test(raw));
        if (!target) return raw;
        return raw.replace(new RegExp(`\\b(${target})\\b`, 'iu'), '<strong><u>$1</u></strong>');
    }

    function examInstruction(question, hasVisual) {
        if (question?.passage) {
            return 'Lee el texto de referencia y selecciona la opción que responde correctamente.';
        }
        if (hasVisual) {
            return 'Observa el apoyo visual y selecciona la opción correcta.';
        }
        return 'Lee con atención y selecciona la opción que responde correctamente.';
    }

    function isCompactMathPrompt(value, hasPassage, hasVisual) {
        if (hasPassage || hasVisual) return false;
        const plain = sanitizeExamText(String(value || '')).replace(/<[^>]*>/g, ' ');
        return plain.length <= 220 && /(?:\d\s*[+\-×÷*/=]|[√∑∫≤≥≈]|\^|\b(?:serie|ecuaci[oó]n|fracci[oó]n|porcentaje|probabilidad|figura|simetr[ií]a|[áa]ngulo)\b)/iu.test(plain);
    }

    function progressGrid(session) {
        const answered = new Set((session.answered_orders || []).map((item) => Number(item)));
        const total = Number(session.total_reactivos || 0);
        const current = Number(session.current_order || 1);
        return Array.from({ length: total }, (_, index) => {
            const order = index + 1;
            const state = order === current ? 'current' : answered.has(order) ? 'answered' : 'pending';
            const stateLabel = state === 'current' ? 'actual' : state === 'answered' ? 'contestado' : 'pendiente';
            return `<button type="button" class="exani-progress-grid__item is-${state}" data-jump="${order}" aria-label="Reactivo ${order}: ${stateLabel}" ${state === 'current' ? 'aria-current="step"' : ''}>${order}</button>`;
        }).join('');
    }

    function resultAreaRows(result) {
        const areas = Array.isArray(result.area_results) && result.area_results.length
            ? result.area_results
            : Object.entries(result.by_area || {}).map(([area, data]) => ({
                area,
                total: data.total || 0,
                answered: data.answered || 0,
                correct: data.correct || 0,
                incorrect: data.incorrect || Math.max(0, Number(data.total || 0) - Number(data.correct || 0)),
                percentage: Number(data.total || 0) ? (Number(data.correct || 0) / Number(data.total || 0)) * 100 : 0,
            }));
        return areas.map((item) => `
            <tr>
                <td>${esc(item.area || 'EXANI-II')}</td>
                <td>${formatPercent(item.percentage)}</td>
                <td>${esc(item.correct || 0)}</td>
                <td>${esc(item.answered || 0)}</td>
                <td>${esc(item.total || 0)}</td>
            </tr>
        `).join('');
    }

    function resultOverview(result) {
        const total = Number(result.total_reactivos || 0);
        const correct = Number(result.correct_count || 0);
        const incorrect = Number(result.incorrect_count ?? Math.max(0, total - correct));
        const answered = Number(result.answered_count || 0);
        return `
            <section class="exani-result__overview" aria-label="Resumen del resultado">
                <article class="exani-result__metric is-main">
                    <span>Porcentaje total</span>
                    <strong>${formatPercent(result.percentage)}</strong>
                    <small>${correct} de ${total} reactivos correctos</small>
                </article>
                <article class="exani-result__metric is-correct">
                    <span>Correctas</span>
                    <strong>${correct}</strong>
                    <small>Aciertos</small>
                </article>
                <article class="exani-result__metric is-wrong">
                    <span>Incorrectas</span>
                    <strong>${incorrect}</strong>
                    <small>Incluye sin responder</small>
                </article>
                <article class="exani-result__metric">
                    <span>Respondidas</span>
                    <strong>${answered}</strong>
                    <small>De ${total}</small>
                </article>
            </section>
        `;
    }

    function resultTables(result) {
        return `
            <section class="exani-result__tables" aria-label="Tablas de resultados">
                <div class="exani-report-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Área o módulo disciplinar</th>
                                <th>Porcentaje de aciertos (%)</th>
                                <th>Cantidad de aciertos</th>
                                <th>Reactivos respondidos</th>
                                <th>Total de reactivos</th>
                            </tr>
                        </thead>
                        <tbody>${resultAreaRows(result)}</tbody>
                    </table>
                </div>
                <div class="exani-report-table exani-report-table--time">
                    <table>
                        <thead>
                            <tr>
                                <th>Inicio</th>
                                <th>Término</th>
                                <th>Duración</th>
                                <th>Porcentaje total de aciertos (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${esc(formatClock(result.started_at || result.session?.iniciado_at))}</td>
                                <td>${esc(formatClock(result.finished_at || result.session?.enviado_at))}</td>
                                <td>${esc(formatTime(result.duration_seconds || 0))}</td>
                                <td>${formatPercent(result.percentage)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }

    function answerText(item, type) {
        const label = type === 'correct' ? item.correct_label : item.selected_label;
        const text = type === 'correct' ? item.correct_text : item.selected_text;
        if (!text) return type === 'correct' ? 'Sin clave registrada' : 'Sin respuesta';
        return `${label ? `${esc(label)}) ` : ''}${richInline(text)}`;
    }

    function reviewOptions(item) {
        const selected = Number(item.selected_index);
        const correct = Number(item.correct_index);
        return (item.options || []).map((option) => {
            const index = Number(option.index);
            const classes = [
                'exani-review-option',
                index === correct ? 'is-correct' : '',
                index === selected && index !== correct ? 'is-selected-wrong' : '',
            ].filter(Boolean).join(' ');
            return `
                <li class="${classes}">
                    <span>${optionLabel(index)}</span>
                    <div>${richInline(option.text || '')}</div>
                </li>
            `;
        }).join('');
    }

    function wrongReason(item) {
        if (item.feedback) return richBlock(item.feedback);
        if (!item.answered) {
            return '<p>No se registró respuesta para este reactivo; por eso cuenta como incorrecto.</p>';
        }
        return '<p>La opción marcada no coincide con la clave del reactivo. Compara tu selección con la respuesta correcta y revisa el dato, concepto o inferencia que cambia el resultado.</p>';
    }

    function reviewItem(item) {
        const visualImage = mathVisualImage(item);
        return `
            <details class="exani-review-item is-wrong">
                <summary>
                    <span>Reactivo ${esc(item.order)}</span>
                    <strong>${esc(item.area || 'EXANI-II')}</strong>
                    <em>${item.answered ? `${esc(item.selected_label || '')} → ${esc(item.correct_label || '')}` : `Sin respuesta → ${esc(item.correct_label || '')}`}</em>
                </summary>
                <div class="exani-review-item__body">
                    ${item.passage ? `<section class="exani-review-passage">${richBlock(item.passage)}</section>` : ''}
                    <section class="exani-review-question">
                        <strong>Contenido</strong>
                        ${richBlock(contextualPrompt(item.prompt || 'Reactivo no disponible', item.skill))}
                    </section>
                    ${visualImage ? `
                        <figure class="exani-review-visual">
                            <img src="${esc(visualImage)}" alt="Apoyo visual del reactivo ${esc(item.visual_id || '')}" loading="lazy" decoding="async">
                        </figure>
                    ` : ''}
                    <div class="exani-review-answer-grid">
                        <article>
                            <span>Mi respuesta</span>
                            <p>${answerText(item, 'selected')}</p>
                        </article>
                        <article>
                            <span>Respuesta correcta</span>
                            <p>${answerText(item, 'correct')}</p>
                        </article>
                    </div>
                    <div class="exani-review-reason">
                        <strong>Por qué estuvo mal</strong>
                        ${wrongReason(item)}
                    </div>
                    <ol class="exani-review-options">${reviewOptions(item)}</ol>
                </div>
            </details>
        `;
    }

    function correctRows(items) {
        if (!items.length) {
            return '<p class="exani-review-empty">No hubo reactivos correctos en este intento.</p>';
        }
        return `
            <div class="exani-report-table exani-report-table--answers">
                <table>
                    <thead>
                        <tr>
                            <th>Reactivo</th>
                            <th>Área o módulo</th>
                            <th>Mi respuesta</th>
                            <th>Respuesta correcta</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item) => `
                            <tr>
                                <td>${esc(item.order)}</td>
                                <td>${esc(item.area || 'EXANI-II')}</td>
                                <td>${answerText(item, 'selected')}</td>
                                <td>${answerText(item, 'correct')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function resultReview(result) {
        const feedback = Array.isArray(result.feedback) ? result.feedback : [];
        const correct = feedback.filter((item) => item.is_correct);
        const wrong = feedback.filter((item) => !item.is_correct);
        return `
            <section class="exani-result-review" aria-label="Revision de respuestas">
                <div class="exani-result-review__head">
                    <div>
                        <span class="section__label">Respuesta correcta e incorrecta</span>
                        <h2>Revisión del intento</h2>
                    </div>
                    <p>Abre cada reactivo incorrecto para revisar tu respuesta, la clave y la explicación.</p>
                </div>
                <section class="exani-result-review__block">
                    <h3>Incorrectas y sin responder</h3>
                    ${wrong.length ? wrong.map(reviewItem).join('') : '<p class="exani-review-empty">No hay errores en este intento.</p>'}
                </section>
                <section class="exani-result-review__block">
                    <h3>Correctas</h3>
                    ${correctRows(correct)}
                </section>
            </section>
        `;
    }

    function renderReactive(session) {
        const question = session.question || {};
        const total = Number(session.total_reactivos || question.total || 0);
        const current = Number(session.current_order || question.order || 1);
        const selected = question.selected_index;
        const hasSelection = selected !== null && selected !== undefined;
        const visualImage = mathVisualImage(question);
        const visualId = String(question.visual_id || '').toUpperCase();
        const compactMathPrompt = isCompactMathPrompt(question.prompt, Boolean(question.passage), Boolean(visualImage));
        setExamMode(true);
        document.getElementById('app').innerHTML = `
            <section class="exani-simulator">
                <header class="exani-simulator__bar">
                    <strong>educatIA</strong>
                    <span>Tiempo restante: <b id="exani-timer">${formatTime(session.segundos_restantes || 0)}</b></span>
                </header>
                <main class="exani-simulator__body">
                    <div class="exani-simulator__meta">
                        <div>
                            <strong>\u00c1rea: ${esc(question.area || 'EXANI-II')}</strong>
                            ${question.skill ? `<span>${esc(question.skill)}</span>` : ''}
                        </div>
                        <div>
                            <strong>Reactivos contestados: <span id="exani-answered-count">${esc(session.reactivos_contestados)}</span> / ${esc(total)}</strong>
                            <span>Reactivos pendientes: <span id="exani-pending-count">${esc(session.reactivos_pendientes)}</span></span>
                        </div>
                    </div>
                    <button type="button" class="exani-progress-toggle" id="exani-progress-toggle" aria-expanded="false" aria-controls="exani-progress-grid">Mostrar avance de preguntas</button>
                    <div class="exani-progress-grid" id="exani-progress-grid" aria-label="Avance de reactivos" hidden>${progressGrid(session)}</div>
                    <article class="exani-reactive-card ${visualImage ? 'has-visual' : ''}">
                        ${question.passage ? `<section class="exani-passage"><div class="exani-passage__label">Texto de referencia</div><div class="exani-passage__content">${richBlock(question.passage)}</div></section>` : ''}
                        <section class="exani-question ${visualImage ? 'exani-question--with-visual' : ''} ${compactMathPrompt ? 'exani-question--compact-math' : ''}">
                            <div class="exani-question__text">
                                <div class="exani-question__instruction"><span>Indicaciones</span><strong>${examInstruction(question, Boolean(visualImage))}</strong></div>
                                <div class="exani-question__prompt">${richBlock(contextualPrompt(question.prompt || 'Reactivo no disponible', question.skill))}</div>
                            </div>
                            ${visualImage ? `
                                <figure class="exani-visual">
                                    <img src="${esc(visualImage)}" alt="Apoyo visual del reactivo ${esc(visualId)}" loading="eager" decoding="async">
                                    <figcaption>Apoyo visual para resolver el reactivo.</figcaption>
                                </figure>
                            ` : ''}
                        </section>
                        <section class="exani-options" aria-label="Opciones de respuesta">
                            <h2 class="exani-options__title">Selecciona una respuesta</h2>
                            ${(question.options || []).map((option) => `
                                <label class="exani-option ${hasSelection && Number(selected) === Number(option.index) ? 'is-selected' : ''}">
                                    <input type="radio" name="exani-option" value="${esc(option.index)}" ${hasSelection && Number(selected) === Number(option.index) ? 'checked' : ''}>
                                    <span>${optionLabel(option.index)}</span>
                                    <strong>${richInline(option.text)}</strong>
                                </label>
                            `).join('')}
                        </section>
                    </article>
                    ${isAleEnabled() ? `<aside class="exani-ale" id="exani-ale">
                        <div class="exani-ale__head">
                            <strong>Bill contextual</strong>
                            <button type="button" id="exani-ale-toggle">Ocultar</button>
                        </div>
                        <div class="exani-ale__quick">
                            <button type="button" data-ale-prompt="Expl\u00edcame qu\u00e9 concepto eval\u00faa este reactivo.">Concepto</button>
                            <button type="button" data-ale-prompt="Ay\u00fadame a descartar opciones sin decirme la respuesta.">Descartar</button>
                            <button type="button" data-ale-prompt="Dame una pista paso a paso.">Pista</button>
                        </div>
                        <div class="exani-ale__messages" id="exani-ale-messages">
                            <p>Bill solo recibe este reactivo para ayudarte con foco.</p>
                        </div>
                        <div class="exani-ale__composer">
                            <textarea id="exani-ale-input" rows="2" placeholder="Pregunta sobre este reactivo"></textarea>
                            <button type="button" id="exani-ale-send">Enviar</button>
                        </div>
                    </aside>` : ''}
                </main>
                <footer class="exani-simulator__nav">
                    <button type="button" class="btn btn--outline" id="exani-finish">Terminar</button>
                    <div>
                        <button type="button" class="btn btn--outline" id="exani-prev" ${current <= 1 ? 'disabled' : ''}>Anterior</button>
                        <button type="button" class="btn btn--primary" id="exani-next" ${current >= total ? 'disabled' : ''}>Siguiente</button>
                    </div>
                </footer>
            </section>
        `;
    }

    function alePrompt(session, userPrompt) {
        const q = session.question || {};
        const options = (q.options || []).map((option) => `${optionLabel(option.index)}) ${option.text}`).join('\n');
        return [
            'Act\u00faa como Bill, profesor personal de EducatIA en un simulacro EXANI-II.',
            'No des la respuesta final directa; gu\u00eda el razonamiento con pistas y descarte.',
            `\u00c1rea: ${q.area || 'EXANI-II'}`,
            q.skill ? `Habilidad: ${q.skill}` : '',
            q.passage ? `Texto base:\n${q.passage}` : '',
            `Reactivo ${q.order || session.current_order}:\n${q.prompt || ''}`,
            `Opciones:\n${options}`,
            q.selected_index == null ? 'El alumno a\u00fan no seleccion\u00f3 respuesta.' : `El alumno seleccion\u00f3 ${optionLabel(q.selected_index)}.`,
            `Pregunta del alumno: ${userPrompt}`,
        ].filter(Boolean).join('\n\n');
    }

    function bindReactive(session, options = {}) {
        const routeOptions = { daily: Boolean(options.daily) };
        const go = (order) => Router().navigate(reactivePath(session.id, order, routeOptions));
        let remaining = Number(session.segundos_restantes || 0);
        clearTimer();
        timerId = window.setInterval(() => {
            remaining -= 1;
            const timer = document.getElementById('exani-timer');
            if (timer) timer.textContent = formatTime(remaining);
            if (remaining <= 0) {
                clearTimer();
                finish(session.id, routeOptions);
            }
        }, 1000);

        document.getElementById('exani-prev')?.addEventListener('click', () => go(Math.max(1, Number(session.current_order || 1) - 1)));
        document.getElementById('exani-next')?.addEventListener('click', () => go(Math.min(Number(session.total_reactivos || 1), Number(session.current_order || 1) + 1)));
        document.getElementById('exani-finish')?.addEventListener('click', async () => {
            const confirmed = await C().confirmAction({
                title: 'Finalizar simulacro',
                message: 'Se enviarán tus respuestas actuales y podrás consultar el resultado.',
                confirmLabel: 'Ver resultado'
            });
            if (confirmed) finish(session.id, routeOptions);
        });
        document.getElementById('exani-progress-toggle')?.addEventListener('click', (event) => {
            const grid = document.getElementById('exani-progress-grid');
            if (grid) {
                grid.hidden = !grid.hidden;
                event.currentTarget.setAttribute('aria-expanded', String(!grid.hidden));
            }
        });
        document.querySelectorAll('[data-jump]').forEach((button) => {
            button.addEventListener('click', () => go(Number(button.dataset.jump || 1)));
        });
        document.querySelectorAll('.exani-visual img').forEach((image) => {
            image.addEventListener('error', () => image.closest('.exani-visual')?.remove());
        });
        document.querySelectorAll('input[name="exani-option"]').forEach((input) => {
            input.addEventListener('change', async () => {
                document.querySelectorAll('.exani-option').forEach((item) => item.classList.remove('is-selected'));
                input.closest('.exani-option')?.classList.add('is-selected');
                try {
                    const updated = await API().saveExaniSimulatorAnswer(session.id, session.current_order, session.question.id, Number(input.value));
                    const answered = document.getElementById('exani-answered-count');
                    const pending = document.getElementById('exani-pending-count');
                    if (answered) answered.textContent = String(updated.reactivos_contestados ?? '');
                    if (pending) pending.textContent = String(updated.reactivos_pendientes ?? '');
                    if (Number(session.current_order || 1) >= Number(session.total_reactivos || 1)) {
                        document.querySelectorAll('input[name="exani-option"]').forEach((item) => { item.disabled = true; });
                        finish(session.id, routeOptions);
                    }
                } catch (error) {
                    C().showWebNotice('Respuesta no guardada', error.message || 'No fue posible guardar la respuesta. Inténtalo nuevamente.', 'error');
                }
            });
        });

        const messages = document.getElementById('exani-ale-messages');
        const addMessage = (role, text) => {
            if (!messages) return;
            if (messages.querySelector('p')) messages.innerHTML = '';
            const node = document.createElement('div');
            node.className = `exani-ale__message exani-ale__message--${role}`;
            node.textContent = text;
            messages.appendChild(node);
            messages.scrollTop = messages.scrollHeight;
        };
        const sendAle = async (text) => {
            const prompt = String(text || '').trim();
            if (!prompt) return;
            addMessage('user', prompt);
            const send = document.getElementById('exani-ale-send');
            if (send) send.disabled = true;
            try {
                const response = await API().assessmentSessionChat(session.id, prompt, [], {
                    question_id: session.question?.id,
                });
                addMessage('bot', response.respuesta || 'Bill no pudo responder ahora.');
            } catch (error) {
                addMessage('bot', error.message || 'No pude consultar a Bill en este momento.');
            } finally {
                if (send) send.disabled = false;
                const input = document.getElementById('exani-ale-input');
                if (input) input.value = '';
            }
        };
        document.querySelectorAll('[data-ale-prompt]').forEach((button) => {
            button.addEventListener('click', () => sendAle(button.dataset.alePrompt));
        });
        document.getElementById('exani-ale-send')?.addEventListener('click', () => sendAle(document.getElementById('exani-ale-input')?.value || ''));
        document.getElementById('exani-ale-input')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendAle(event.currentTarget.value || '');
            }
        });
        document.getElementById('exani-ale-toggle')?.addEventListener('click', () => {
            document.getElementById('exani-ale')?.classList.toggle('is-collapsed');
        });
    }

    async function renderReactiveRoute(params) {
        if (!C().requireAuth('alumno')) return;
        clearTimer();
        setExamMode(true);
        document.getElementById('app').innerHTML = C().renderLoadingBlock('Cargando reactivo');
        try {
            const routeOptions = { daily: Boolean(params.daily) };
            const session = await API().getExaniSimulatorQuestion(params.sessionId, params.order);
            renderReactive(session);
            bindReactive(session, routeOptions);
        } catch (error) {
            renderShell('No se pudo cargar el reactivo', error.message || 'La sesi\u00f3n no est\u00e1 disponible.', `<a href="${Router().toUrl(window.EducatIA.Utils.exaniSimulatorUrl())}" class="btn btn--primary">Volver a simuladores</a>`);
        }
    }

    async function finish(sessionId, options = {}) {
        clearTimer();
        setExamMode(false);
        document.getElementById('app').innerHTML = C().renderLoadingBlock('Calculando resultado');
        try {
            const result = await API().finishExaniSimulator(sessionId);
            renderShell(
                'Reporte de resultados',
                'Resultado completo del simulacro EXANI-II.',
                `<section class="exani-result">
                    ${resultOverview(result)}
                    ${resultTables(result)}
                    ${resultReview(result)}
                    <div class="exani-result__actions">
                        <a href="${Router().toUrl(options.daily ? window.EducatIA.Utils.exaniStreakUrl() : window.EducatIA.Utils.exaniSimulatorUrl())}" class="btn btn--primary">${options.daily ? 'Volver a racha diaria' : 'Hacer otro simulacro'}</a>
                        <a href="${Router().toUrl('/calificaciones')}" class="btn btn--outline">Ver calificaciones</a>
                        <a href="${Router().toUrl('/dashboard')}" class="btn btn--outline">Mi aprendizaje</a>
                    </div>
                </section>`
            );
        } catch (error) {
            renderShell('No se pudo finalizar', error.message || 'Intenta nuevamente.', `<a href="${Router().toUrl(window.EducatIA.Utils.exaniSimulatorUrl())}" class="btn btn--primary">Volver</a>`);
        }
    }

    return {
        renderHome,
        renderReactiveRoute,
    };
})();
