/* ================================================================
   educatIA - Lesson View
   Coursera-like learning workspace with real backend progress
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Leccion = {
    isAleEnabled: function () {
        return window.EducatIA.Features?.ale === true;
    },

    stripSectionNumbering: function (value) {
        return this.stripLessonSectionLabels(value)
            .replace(/^\s*(?:unidad|tema|secci[oó]n|seccion|apartado)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/i, '')
            .replace(/^\s*\d+(?:\.\d+)+\s*[:.)-]?\s*/g, '')
            .trim();
    },

    stripLessonSectionLabels: function (value) {
        return String(value || '')
            .replace(/^\s*(?:#{1,6}\s*)?(?:secci[oó]n|seccion)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/i, '')
            .trim();
    },

    stripDecorativeLessonGlyphs: function (value) {
        return String(value || '')
            .replace(/(?:\u2705|\u274c|\u2714|\u26a0\ufe0f?|\ud83d\udca1|\ud83d\udccc|\ud83c\udfaf|\ud83e\udde0|\ud83d\udc49)/g, '')
            .replace(/[ \t]{2,}/g, ' ');
    },

    sanitizeLessonText: function (value) {
        return this.stripDecorativeLessonGlyphs(String(value || '')
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/!\[[^\]]*]\([^)]+\)(?:\{[^}]+\})?/g, '')
            .replace(/\[AUDIO_CLASE:[^\]]+\]/gi, '')
            // Acepta el marcador canónico y la variante antigua sin corchetes.
            // Algunas clases publicadas antes del importador actual conservan
            // `EDUCATIA_PRACTICE:...`; nunca debe mostrarse al estudiante.
            .replace(/\[?EDUCATIA_PRACTICE:[A-Za-z0-9_-]+\]?/g, ' ')
            .replace(/^#{1,6}\s*(?:secci[oó]n|seccion)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/gim, '')
            .replace(/^\s*(?:secci[oó]n|seccion)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/gim, '')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/^>\s*/gm, '')
            .replace(/^\s*[-*]\s+/gm, '')
            .replace(/^\s*\d+(?:\.\d+)+\s*/gm, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/https?:\/\/\S+/g, ' '))
            .replace(/\s+/g, ' ')
            .trim();
    },

    getLessonSummary: function (lesson) {
        const content = this.sanitizeLessonText(lesson.contenido);
        if (!content) {
            return 'Revisa esta lección, consulta el material y continúa con el siguiente bloque del curso.';
        }
        return content.length > 180 ? `${content.slice(0, 177)}...` : content;
    },

    contentLooksLikeHtml: function (content) {
        return /<(?:p|br|h[1-6]|ul|ol|li|blockquote|figure|figcaption|img|div|span|strong|b|em|i|u|a|table|thead|tbody|tr|th|td|pre|code|section|audio|source)\b/i.test(String(content || ''));
    },

    containsMarkdownLessonBlocks: function (content) {
        return /(?:!\[[^\]]*\]\([^\n)]+\)(?:\{[^}\n]+\})?|\[EDUCATIA_PRACTICE:[A-Za-z0-9_-]+\]|^\s*#{2,4}\s+|^```)/m.test(String(content || ''));
    },

    mapOutsideFencedCode: function (content, transform) {
        return String(content || '').split(/(```[\s\S]*?```)/g)
            .map((block) => block.startsWith('```') && block.endsWith('```') ? block : transform(block))
            .join('');
    },

    safeContentUrl: function (url, options = {}) {
        const raw = String(url || '').trim();
        if (!raw) {
            return '';
        }

        if (options.forStorage) {
            const origin = window.EducatIA.API?.getBackendOrigin?.() || '';
            if (origin && raw.startsWith(origin)) {
                return raw.slice(origin.length) || '/';
            }
            return raw;
        }

        if (/^data:image\//i.test(raw)) {
            return raw;
        }

        if (/^https?:\/\//i.test(raw)) {
            return window.EducatIA.Utils.safeUrl ? window.EducatIA.Utils.safeUrl(raw) : raw;
        }

        if (raw.startsWith('assets/')) {
            return raw;
        }

        if (raw.startsWith('/')) {
            return window.EducatIA.API?.resolveAssetUrl ? window.EducatIA.API.resolveAssetUrl(raw) : raw;
        }

        return window.EducatIA.API?.resolveAssetUrl ? window.EducatIA.API.resolveAssetUrl(raw) : `/${raw.replace(/^\.?\//, '')}`;
    },

    isSafeLessonAudioUrl: function (url) {
        const raw = String(url || '').trim();
        if (raw.startsWith('assets/lesson-audio/')) {
            return true;
        }
        try {
            const parsed = new URL(raw, window.location.origin);
            return parsed.protocol === 'https:'
                && parsed.hostname === 'media.educatia.test'
                && parsed.pathname.startsWith('/lesson-audio/');
        } catch (_error) {
            return false;
        }
    },

    sanitizeRichLessonHtml: function (html, options = {}) {
        const template = document.createElement('template');
        template.innerHTML = String(html || '');

        const allowedTags = new Set([
            'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
            'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE',
            'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'SECTION',
            'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
            'PRE', 'CODE', 'DIV', 'SPAN', 'SUP', 'SUB',
            'AUDIO', 'SOURCE',
        ]);
        const allowedClasses = new Set([
            'lesson-reading-figure',
            'lesson-reading-figure--small',
            'lesson-reading-figure--medium',
            'lesson-reading-figure--wide',
            'lesson-reading-figure--full',
            'lesson-reading-figure--left',
            'lesson-reading-figure--center',
            'lesson-reading-figure--right',
            'lesson-reading-callout',
            'lesson-reading-list',
            'lesson-reading-list--ordered',
            'lesson-reading-heading',
            'lesson-reading-heading--sub',
            'lesson-code-block',
            'lesson-math',
            'lesson-math--inline',
            'lesson-math--block',
            'lesson-math__frac',
            'lesson-math__frac-num',
            'lesson-math__frac-den',
            'lesson-math__nuclide',
            'lesson-reading-table',
            'lesson-reading-table__scroll',
            'lesson-audio-card',
            'lesson-audio-card__copy',
            'lesson-audio-card__eyebrow',
            'lesson-audio-card__player',
        ]);

        const unwrap = (node) => {
            const fragment = document.createDocumentFragment();
            while (node.firstChild) {
                fragment.appendChild(node.firstChild);
            }
            node.replaceWith(fragment);
        };

        const cleanElement = (element) => {
            if (!allowedTags.has(element.tagName)) {
                unwrap(element);
                return;
            }

            Array.from(element.attributes).forEach((attr) => {
                const name = attr.name.toLowerCase();
                const value = attr.value;

                if (name.startsWith('on') || name === 'style') {
                    element.removeAttribute(attr.name);
                    return;
                }

                if (name === 'class') {
                    const safeClasses = value.split(/\s+/).filter((className) => allowedClasses.has(className));
                    if (safeClasses.length) {
                        element.setAttribute('class', safeClasses.join(' '));
                    } else {
                        element.removeAttribute('class');
                    }
                    return;
                }

                if (element.tagName === 'A' && name === 'href') {
                    const safeUrl = this.safeContentUrl(value, options);
                    if (/^javascript:/i.test(safeUrl)) {
                        element.removeAttribute('href');
                    } else {
                        element.setAttribute('href', safeUrl);
                        // Los navegadores embebidos bloquean ventanas nuevas.
                        // Mantener el recurso en esta pestaña hace el enlace utilizable.
                        element.removeAttribute('target');
                        element.removeAttribute('rel');
                    }
                    return;
                }

                if (element.tagName === 'IMG' && name === 'src') {
                    const safeUrl = this.safeContentUrl(value, options);
                    if (!safeUrl || /^javascript:/i.test(safeUrl)) {
                        element.removeAttribute('src');
                    } else {
                        element.setAttribute('src', safeUrl);
                    }
                    return;
                }

                if (element.tagName === 'SOURCE' && name === 'src') {
                    const safeUrl = this.safeContentUrl(value, options);
                    if (!safeUrl || /^javascript:/i.test(safeUrl) || !this.isSafeLessonAudioUrl(safeUrl)) {
                        element.removeAttribute('src');
                    } else {
                        element.setAttribute('src', safeUrl);
                    }
                    return;
                }

                if (element.tagName === 'SOURCE' && name === 'type') {
                    if (/^audio\/(?:mpeg|mp3)$/i.test(value)) {
                        element.setAttribute('type', 'audio/mpeg');
                    } else {
                        element.removeAttribute(attr.name);
                    }
                    return;
                }

                if (element.tagName === 'AUDIO' && ['controls', 'preload', 'aria-label'].includes(name)) {
                    if (name === 'preload') {
                        element.setAttribute('preload', ['none', 'metadata', 'auto'].includes(value) ? value : 'metadata');
                    } else if (name === 'aria-label') {
                        element.setAttribute('aria-label', value);
                    } else {
                        element.setAttribute('controls', '');
                    }
                    return;
                }

                if (element.tagName === 'SECTION' && name === 'aria-label') {
                    element.setAttribute('aria-label', value);
                    return;
                }

                if (['alt', 'title'].includes(name) && ['IMG', 'A'].includes(element.tagName)) {
                    element.setAttribute(name, value);
                    return;
                }

                element.removeAttribute(attr.name);
            });

            if (element.tagName === 'FIGURE') {
                const classes = new Set((element.getAttribute('class') || '').split(/\s+/).filter(Boolean));
                classes.add('lesson-reading-figure');
                if (![...classes].some((className) => className.startsWith('lesson-reading-figure--'))) {
                    classes.add('lesson-reading-figure--medium');
                    classes.add('lesson-reading-figure--center');
                }
                element.setAttribute('class', [...classes].filter((className) => allowedClasses.has(className)).join(' '));
            }

            if (element.tagName === 'IMG' && !options.forStorage) {
                element.setAttribute('loading', 'lazy');
            }

            if (element.tagName === 'AUDIO') {
                element.setAttribute('controls', '');
                if (!element.getAttribute('preload')) {
                    element.setAttribute('preload', 'metadata');
                }
            }
        };

        const walk = (root) => {
            Array.from(root.children).forEach((child) => {
                cleanElement(child);
                walk(child);
            });
        };

        walk(template.content);
        Array.from(template.content.querySelectorAll('p, li, blockquote, div, span')).forEach((element) => {
            const text = String(element.textContent || '').trim();
            if (/^https:\/\/educatia\.nyc3\.digitaloceanspaces\.com\/[^\s]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s]*)?$/i.test(text)) {
                element.remove();
            }
        });
        Array.from(template.content.querySelectorAll('h2, h3, h4, p, li')).forEach((element) => {
            const firstTextNode = Array.from(element.childNodes).find((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
            if (firstTextNode) {
                firstTextNode.textContent = firstTextNode.textContent.replace(
                    /^\s*(?:secci[oó]n|seccion)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/i,
                    '',
                );
            }
            if (element.children.length === 0) {
                element.textContent = this.stripSectionNumbering(element.textContent || '');
            }
        });
        return template.innerHTML.trim();
    },

    decodeHtmlEntities: function (value) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = String(value || '');
        return textarea.value;
    },

    renderMathExpression: function (rawExpression, options = {}) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const block = Boolean(options.block);
        const tokens = [];
        const hold = (html) => {
            const token = `@@EDUMATH${tokens.length}@@`;
            tokens.push(html);
            return token;
        };
        const restore = (value) => String(value || '').replace(/@@EDUMATH(\d+)@@/g, (_, index) => tokens[Number(index)] || '');
        let source = this.decodeHtmlEntities(rawExpression)
            .replace(/^\s*\$\$|\$\$\s*$/g, '')
            .replace(/^\s*\\\[|\\\]\s*$/g, '')
            .replace(/^\s*\\\(|\\\)\s*$/g, '')
            .replace(/\\(?:left|right)\s*/g, '')
            .replace(/\\text\{([^{}]*)\}/g, '$1')
            .trim();

        source = source.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, numerator, denominator) => hold(`<span class="lesson-math__frac"><span class="lesson-math__frac-num">${this.renderMathExpression(numerator, { inlineOnly: true })}</span><span class="lesson-math__frac-den">${this.renderMathExpression(denominator, { inlineOnly: true })}</span></span>`));

        source = source.replace(/_\{([^{}]+)\}\^\{([^{}]+)\}\s*([A-Za-z][A-Za-z0-9]*)/g, (_, atomic, mass, symbol) => hold(`<span class="lesson-math__nuclide"><sup>${escapeHtml(mass)}</sup><sub>${escapeHtml(atomic)}</sub>${escapeHtml(symbol)}</span>`));

        source = source.replace(/\^\{([^{}]+)\}_\{([^{}]+)\}\s*([A-Za-z][A-Za-z0-9]*)/g, (_, mass, atomic, symbol) => hold(`<span class="lesson-math__nuclide"><sup>${escapeHtml(mass)}</sup><sub>${escapeHtml(atomic)}</sub>${escapeHtml(symbol)}</span>`));

        let rendered = escapeHtml(source)
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\Delta/g, 'Δ')
            .replace(/\\delta/g, 'δ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\lambda/g, 'λ')
            .replace(/\\pi/g, 'π')
            .replace(/\\theta/g, 'θ')
            .replace(/\\pm/g, '±')
            .replace(/\\times/g, '×')
            .replace(/\\cdot/g, '·')
            .replace(/\\approx/g, '≈')
            .replace(/\\neq/g, '≠')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\infty/g, '∞')
            .replace(/\\sum/g, '∑')
            .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
            .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
            .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
            .replace(/\^([+\-]?\d+|[+\-]|[A-Za-z])/g, '<sup>$1</sup>')
            .replace(/_([+\-]?\d+|[A-Za-z])/g, '<sub>$1</sub>')
            .replace(/\\,/g, ' ')
            .replace(/\\/g, '');

        rendered = restore(rendered);
        if (options.inlineOnly) {
            return rendered;
        }

        return `<span class="lesson-math ${block ? 'lesson-math--block' : 'lesson-math--inline'}">${rendered}</span>`;
    },

    renderInlineMath: function (escapedText) {
        const tokens = [];
        const hold = (html) => {
            const token = `@@EDUINLINE${tokens.length}@@`;
            tokens.push(html);
            return token;
        };
        let rendered = String(escapedText || '')
            .replace(/\$\$([\s\S]+?)\$\$/g, (_, expression) => hold(this.renderMathExpression(expression, { block: true })))
            .replace(/\\\[([\s\S]+?)\\\]/g, (_, expression) => hold(this.renderMathExpression(expression, { block: true })))
            .replace(/\\\(([\s\S]+?)\\\)/g, (_, expression) => hold(this.renderMathExpression(expression)))
            .replace(/\b([A-Za-z])\^([+\-]|\d+)/g, '<span class="lesson-math lesson-math--inline">$1<sup>$2</sup></span>')
            .replace(/\b([A-Za-z])_(\d+)\b/g, '<span class="lesson-math lesson-math--inline">$1<sub>$2</sub></span>');

        return rendered.replace(/@@EDUINLINE(\d+)@@/g, (_, index) => tokens[Number(index)] || '');
    },

    isMarkdownTable: function (lines) {
        if (!Array.isArray(lines) || lines.length < 2) {
            return false;
        }
        const separator = lines[1].trim();
        return lines[0].includes('|')
            && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(separator)
            && lines.slice(2).some((line) => line.includes('|'));
    },

    splitMarkdownTableRow: function (row) {
        return String(row || '')
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());
    },

    renderMarkdownTable: function (lines, renderInline) {
        const headers = this.splitMarkdownTableRow(lines[0]);
        const rows = lines.slice(2)
            .map((line) => this.splitMarkdownTableRow(line))
            .filter((row) => row.some(Boolean));

        return `
            <div class="lesson-reading-table">
                <div class="lesson-reading-table__scroll">
                    <table>
                        <thead>
                            <tr>${headers.map((header) => `<th>${renderInline(header)}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${rows.map((row) => `
                                <tr>
                                    ${headers.map((_, index) => `<td>${renderInline(row[index] || '')}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    resolvePlaceholderVisual: function (description) {
        void description;
        return null;
    },

    fallbackVisualTitle: function (alt) {
        const clean = this.stripSectionNumbering(String(alt || ''))
            .replace(/^imagen\s+de\s+referencia\s+de\s+/i, '')
            .replace(/^recurso\s+visual\s+de\s+/i, '')
            .trim();
        return clean || 'Recurso visual de la lección';
    },

    renderGeneratedLessonVisual: function () {
        return '';
    },

    getLessonAudioUrl: function (lesson) {
        const candidates = [
            lesson?.audio_url,
            lesson?.audioUrl,
            lesson?.audio_clase_url,
            lesson?.audioClaseUrl,
            lesson?.audio,
        ];
        return candidates.map((value) => this.safeContentUrl(value)).find((value) => value && this.isSafeLessonAudioUrl(value)) || '';
    },

    renderLessonAudioCard: function (src, escapeHtml) {
        const safeSrc = this.safeContentUrl(src);
        if (!safeSrc || !this.isSafeLessonAudioUrl(safeSrc)) {
            return '';
        }
        return `
            <section class="lesson-audio-card" aria-label="Audio de clase">
                <div class="lesson-audio-card__copy">
                    <span class="lesson-audio-card__eyebrow">Audio de clase</span>
                    <h3>Escucha esta explicación</h3>
                    <p>Reproduce el audio para repasar esta lección a tu ritmo.</p>
                    <small class="lesson-audio-card__duration" data-lesson-audio-duration>Duración: cargando…</small>
                </div>
                <audio class="lesson-audio-card__player" controls preload="metadata" aria-label="Reproductor de audio de la clase">
                    <source src="${escapeHtml(safeSrc)}" type="audio/mpeg">
                    Tu navegador no puede reproducir este audio.
                </audio>
            </section>
        `;
    },

    decodePracticePayload: function (encodedPayload) {
        try {
            const normalized = String(encodedPayload || '').replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
            const binary = atob(padded);
            const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
            const json = typeof TextDecoder !== 'undefined'
                ? new TextDecoder('utf-8').decode(bytes)
                : decodeURIComponent(Array.from(bytes).map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join(''));
            return JSON.parse(json);
        } catch (error) {
            console.warn('No se pudo leer la práctica de clase', error);
            return null;
        }
    },

    renderPracticeBlock: function (encodedPayload, escapeHtml) {
        const payload = this.decodePracticePayload(encodedPayload);
        if (!payload) {
            return '';
        }
        const paragraph = (value) => escapeHtml(value || '').replace(/\n/g, '<br>');
        return `
            <section class="lesson-practice-block" data-lesson-practice data-practice-id="${escapeHtml(payload.id || `practice-${payload.source_index || ''}`)}">
                <div class="lesson-practice-block__head">
                    <span>${escapeHtml(payload.level || 'Práctica')} · ${escapeHtml(payload.type || 'Ejercicio')}</span>
                    <h3>${escapeHtml(payload.title || 'Práctica de clase')}</h3>
                </div>
                <p class="lesson-practice-block__prompt">${paragraph(payload.prompt)}</p>
                <label class="lesson-practice-block__answer">
                    <span>Tu respuesta</span>
                    <textarea rows="4" data-practice-answer placeholder="Escribe tu procedimiento o conclusión breve"></textarea>
                </label>
                <div class="lesson-practice-block__actions">
                    <button type="button" class="btn btn--outline btn--sm" data-practice-reveal>Ver guía</button>
                    <button type="button" class="btn btn--primary btn--sm" data-practice-save>Guardar práctica</button>
                </div>
                <div class="lesson-practice-block__guide" data-practice-guide hidden>
                    <strong>Respuesta esperada</strong>
                    <p>${paragraph(payload.expected || 'Compara tu procedimiento con la guía y corrige cualquier paso que no puedas justificar.')}</p>
                    ${payload.implementation ? `<small>${paragraph(payload.implementation)}</small>` : ''}
                </div>
                <p class="lesson-practice-block__status" data-practice-status aria-live="polite"></p>
            </section>
        `;
    },

    prepareEditorHtml: function (content) {
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const rendered = this.renderBodyContent(content, escapeHtml);
        return this.sanitizeRichLessonHtml(rendered);
    },

    renderBodyContent: function (content, escapeHtml) {
        const trimmed = this.mapOutsideFencedCode(content, (block) => this.stripDecorativeLessonGlyphs(block)).trim();
        if (!trimmed) {
            return '<p class="lesson-stage__empty">Esta lección aún no tiene contenido escrito cargado.</p>';
        }

        const renderAudio = (src) => this.renderLessonAudioCard(src, escapeHtml);

        const renderAudioMarkers = (value) => String(value || '')
            .replace(
                /<!--\s*educatia-[a-z0-9-]+-lesson-audio:start\s*-->\s*\[AUDIO_CLASE:\s*([^\]]+?)\s*\]\s*<!--\s*educatia-[a-z0-9-]+-lesson-audio:end\s*-->/gi,
                (_match, src) => renderAudio(src),
            )
            .replace(/^\s*\[AUDIO_CLASE:\s*([^\]]+?)\s*\]\s*$/gim, (_match, src) => renderAudio(src));

        // Algunas lecciones históricas mezclan un bloque HTML mínimo con Markdown
        // editorial (figuras, encabezados y prácticas). En esos casos el contenido
        // debe pasar por el lector Markdown: renderizarlo como HTML dejaría visibles
        // caracteres como "![…]", "###" y "[EDUCATIA_PRACTICE:…]".
        if (this.contentLooksLikeHtml(trimmed) && !this.containsMarkdownLessonBlocks(trimmed)) {
            return this.sanitizeRichLessonHtml(this.renderInlineMath(renderAudioMarkers(trimmed)));
        }

        const stripSectionNumbering = (value) => this.stripSectionNumbering(value);
        const renderInline = (value, options = {}) => this.renderInlineMath(escapeHtml(options.keepNumbering ? String(value || '') : stripSectionNumbering(value)))
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, encodedUrl) => {
                const url = encodedUrl.replace(/&amp;/g, '&');
                const safeUrl = window.EducatIA.Utils.safeUrl?.(url) || '';
                return safeUrl ? `<a href="${escapeHtml(safeUrl)}">${label}</a>` : label;
            });

        const renderParagraph = (paragraph) => {
            const cleanParagraph = String(paragraph || '')
                .replace(/^>\s*/gm, '')
                .replace(/^#{1,6}\s*/gm, '')
                .trim();
            const cleanVisibleParagraph = stripSectionNumbering(cleanParagraph);

            const blockMath = cleanVisibleParagraph.match(/^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])$/);
            if (blockMath) {
                return this.renderMathExpression(blockMath[1] || blockMath[2], { block: true });
            }

            return `<p>${renderInline(cleanVisibleParagraph).replace(/\n/g, '<br>')}</p>`;
        };

        const parseImageMeta = (rawMeta) => {
            const meta = { size: 'wide', align: 'center' };
            String(rawMeta || '').replace(/^\{|\}$/g, '').split(/\s+/).forEach((part) => {
                const [key, value] = part.split('=');
                if (key === 'size' && ['small', 'medium', 'wide', 'full'].includes(value)) {
                    meta.size = value;
                }
                if (key === 'align' && ['left', 'center', 'right'].includes(value)) {
                    meta.align = value;
                }
            });
            return meta;
        };

        const renderFigure = (src, alt, meta = { size: 'wide', align: 'center' }) => `
            <figure class="lesson-reading-figure lesson-reading-figure--${escapeHtml(meta.size)} lesson-reading-figure--${escapeHtml(meta.align)}" data-lesson-figure>
                <img src="${escapeHtml(this.safeContentUrl(src))}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" data-lesson-image>
                <div class="lesson-reading-figure__fallback" hidden>
                    Imagen pendiente de sincronización.
                </div>
            </figure>
        `;

        const markdownContent = this.mapOutsideFencedCode(trimmed, (text) => text
            .replace(/<!--[\s\S]*?-->/g, '\n\n')
            // Normaliza el formato legado al marcador que entiende el visor.
            // El contenido se mantiene intacto y la práctica se renderiza como
            // bloque interactivo, no como una cadena codificada.
            .replace(/(^|\n)\s*EDUCATIA_PRACTICE:([A-Za-z0-9_-]+)\s*(?=\n|$)/g, '$1[EDUCATIA_PRACTICE:$2]')
            .replace(/(^|\n)(\s*#{1,6}\s*)?(?:secci[oó]n|seccion)\s+\d+(?:\.\d+)*\s*(?:[:.)-]|[—–]|&mdash;|&ndash;)?\s*/gi, '$1$2'));

        return markdownContent
            .split(/(```[\s\S]*?```)/g)
            .filter(Boolean)
            .map((block) => {
                if (block.startsWith('```') && block.endsWith('```')) {
                    const code = block.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();
                    return `<pre class="lesson-code-block"><code>${escapeHtml(code)}</code></pre>`;
                }

                return block
                    .split(/\n{2,}/)
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph) => {
                        const lines = paragraph.split(/\n/).map((line) => line.trim()).filter(Boolean);

                        const audioMatch = paragraph.trim().match(/^\[AUDIO_CLASE:\s*([^\]]+?)\s*\]$/i);
                        if (audioMatch) {
                            return renderAudio(audioMatch[1]);
                        }

                        const practiceMatch = paragraph.trim().match(/^\[EDUCATIA_PRACTICE:([A-Za-z0-9_-]+)\]$/);
                        if (practiceMatch) {
                            return this.renderPracticeBlock(practiceMatch[1], escapeHtml);
                        }

                        const placeholderMatch = paragraph.trim().match(/^\[IMAGEN:\s*(.+?)\]$/i);
                        if (placeholderMatch) {
                            const visual = this.resolvePlaceholderVisual(placeholderMatch[1]);
                            if (visual) {
                                return renderFigure(visual.path, visual.alt);
                            }
                            return `<aside class="lesson-reading-callout">${renderParagraph(placeholderMatch[1])}</aside>`;
                        }

                        const imageMatch = paragraph.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(\{[^}]+\})?$/);
                        if (imageMatch) {
                            const alt = stripSectionNumbering(imageMatch[1] || 'Recurso visual de la lección');
                            const rawSrc = String(imageMatch[2] || '').trim();
                            const meta = parseImageMeta(imageMatch[3]);
                            return renderFigure(rawSrc, alt, meta);
                        }

                        // Una URL aislada de Spaces es un detalle de almacenamiento,
                        // no contenido de lectura. Las imágenes válidas se procesan
                        // arriba con la sintaxis ![alt](url).
                        if (/^https:\/\/educatia\.nyc3\.digitaloceanspaces\.com\/[^\s]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s]*)?$/i.test(paragraph.trim())) {
                            return '';
                        }

                        if (lines.length && lines.every((line) => /^>\s*/.test(line))) {
                            const quote = lines.map((line) => line.replace(/^>\s*/, '')).join('\n');
                            return `<aside class="lesson-reading-callout">${renderParagraph(quote)}</aside>`;
                        }

                        if (this.isMarkdownTable(lines)) {
                            return this.renderMarkdownTable(lines, (value) => renderInline(value, { keepNumbering: true }));
                        }

                        if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
                            return `
                                <ul class="lesson-reading-list">
                                    ${lines.map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}
                                </ul>
                            `;
                        }

                        const firstLine = lines[0] || '';
                        if (lines.length === 1 && /^\d+\.\s+/.test(firstLine)) {
                            return renderParagraph(firstLine.replace(/^\d+\.\s+/, ''));
                        }

                        if (lines.length && lines.every((line) => /^\d+\.\s+/.test(line))) {
                            return `
                                <ol class="lesson-reading-list lesson-reading-list--ordered">
                                    ${lines.map((line) => `<li>${renderInline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}
                                </ol>
                            `;
                        }

                        if (/^#{2,4}\s+/.test(firstLine)) {
                            const levelClass = firstLine.startsWith('####') ? ' lesson-reading-heading--sub' : '';
                            const rest = lines.slice(1).join('\n');
                            return `<h2 class="lesson-reading-heading${levelClass}">${renderInline(firstLine.replace(/^#{2,4}\s+/, ''))}</h2>${rest ? renderParagraph(rest) : ''}`;
                        }

                        if (lines.length === 1 && /^\d+(?:\.\d+)+\s+/.test(firstLine)) {
                            return `<h2 class="lesson-reading-heading">${renderInline(firstLine)}</h2>`;
                        }

                        return renderParagraph(paragraph);
                    })
                    .join('');
            })
            .join('');
    },

    getLessonGoals: function (lesson, currentSection) {
        const content = this.sanitizeLessonText(lesson.contenido);
        const sentences = content.split(/(?<=[.!?])\s+/).filter(Boolean);
        const goals = [];

        if (currentSection?.titulo) {
            goals.push(`Ubicar esta lección dentro del módulo ${currentSection.titulo}.`);
        }

        sentences.slice(0, 2).forEach((sentence) => {
            goals.push(sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence);
        });

        while (goals.length < 3) {
            goals.push([
                'Identificar los conceptos clave antes de resolver práctica.',
                'Construir una explicación breve con tus propias palabras.',
                'Aplicar el tema en un ejercicio corto al final de la lectura.',
            ][goals.length]);
        }

        return goals.slice(0, 3);
    },

    getStudyTips: function (lesson) {
        const title = String(lesson.titulo || 'esta lección').trim();
        return [
            `Lee ${title} en bloques cortos y anota dudas concretas.`,
            'Convierte cada definición en un ejemplo propio antes de avanzar.',
            'Si una parte no queda clara, vuelve al ejemplo y comprueba la idea con un ejercicio breve.',
        ];
    },

    getVisualNodes: function (lesson, currentSection) {
        const source = [
            lesson.titulo,
            currentSection?.titulo,
            lesson.descripcion,
        ].filter(Boolean).join(' ');
        const stop = new Set(['para', 'como', 'desde', 'donde', 'entre', 'sobre', 'tema', 'clase', 'modulo', 'unidad', 'leccion']);
        const words = source
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 4 && !stop.has(word));
        const unique = Array.from(new Set(words)).slice(0, 3);
        const fallback = ['concepto', 'ejemplo', 'práctica'];
        return [
            { label: unique[0] || fallback[0], hint: 'Idea base' },
            { label: unique[1] || fallback[1], hint: 'Aplicación' },
            { label: unique[2] || fallback[2], hint: 'Verificación' },
        ];
    },

    mountLessonResources: async function (lessonId, API, escapeHtml) {
        const panel = document.getElementById('lesson-resources');
        if (!panel) return;
        try {
            const files = await API.getLessonResources(lessonId);
            if (!panel.isConnected || !files.length) return;
            panel.hidden = false;
            panel.innerHTML = `<h2 class="lesson-reading-heading">Recursos de la lección</h2><p>Descarga los archivos para realizar la práctica en tu entorno.</p>`;
            for (const file of files) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn--outline btn--sm';
                button.textContent = file.nombre;
                button.addEventListener('click', async () => {
                    button.disabled = true;
                    try {
                        const blob = await API.downloadLessonResource(lessonId, file.nombre);
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = file.nombre;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch (error) {
                        const message = panel.querySelector('[role="status"]');
                        message.textContent = error.message || 'No se pudo descargar el recurso.';
                    } finally { button.disabled = false; }
                });
                panel.appendChild(button);
            }
            const message = document.createElement('p');
            message.setAttribute('role', 'status');
            panel.appendChild(message);
        } catch (error) {
            if (!panel.isConnected) return;
            panel.hidden = false;
            panel.innerHTML = `<p role="status">${escapeHtml(error.message || 'No se pudieron cargar los recursos.')}</p>`;
        }
    },

    renderReadingTools: function ({ lesson, currentSection, escapeHtml }) {
        return '';
        const goals = this.getLessonGoals(lesson, currentSection);
        const tips = this.getStudyTips(lesson);
        const labPrompt = lesson.titulo
            ? `Bill te hará preguntas sobre "${lesson.titulo}" hasta comprobar que puedes explicar la idea, resolver un ejemplo y detectar tus errores.`
            : 'Bill te hará preguntas hasta comprobar que puedes explicar la idea, resolver un ejemplo y detectar tus errores.';

        return `
            <section class="lesson-reader-grid">
                <article class="lesson-reader-panel">
                    <div class="lesson-stage__section-title"></div>
                    <ul class="lesson-reader-checklist">
                        ${goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}
                    </ul>
                </article>

                <article class="lesson-reader-panel lesson-reader-panel--accent">
                    <div class="lesson-stage__section-title"></div>
                    <ul class="lesson-reader-checklist">
                        ${tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
                    </ul>
                </article>
            </section>

            <section class="lesson-lab lesson-lab--coach">
                <div class="lesson-lab__head">
                    <div>
                        <div class="lesson-stage__section-title">Laboratorio de práctica</div>
                        <h2>Practica este tema con Bill</h2>
                    </div>
                    <span>Aprendizaje guiado</span>
                </div>
                <div class="lesson-lab__workspace">
                    <div class="lesson-lab__prompt">
                        <strong>Objetivo de aprendizaje</strong>
                        <p>${escapeHtml(labPrompt)}</p>
                    </div>
                    <div class="lesson-lab__coach-plan">
                        <p>Bill empezará con una pregunta simple, subirá la dificultad y no dará por terminado el bloque hasta que expliques el tema con claridad.</p>
                        <button type="button" class="btn btn--primary btn--sm" data-lesson-coach-prompt="Inicia una práctica guiada estricta sobre esta lección. Hazme una pregunta a la vez, espera mi respuesta y corrígeme hasta que domine el objetivo.">
                            Iniciar práctica guiada
                        </button>
                    </div>
                </div>
            </section>
        `;
    },

    renderAdaptiveLessonForm: function ({ lesson, escapeHtml }) {
        return `
            <section class="lesson-adaptive-form" id="lesson-adaptive-form" data-lesson-id="${escapeHtml(lesson.id)}">
                <div class="lesson-adaptive-form__head">
                    <span>Evaluación de la clase</span>
                    <h2>Comprueba lo que aprendiste</h2>
                    <p>Responde 10 reactivos relacionados con esta lección. Necesitas al menos 9/10 para acreditarla.</p>
                </div>
                <div class="lesson-adaptive-form__body" id="lesson-adaptive-body">
                    ${window.EducatIA.Components.renderLoading({ label: 'Preparando pregunta', compact: true })}
                </div>
            </section>
        `;
    },

    bindAdaptiveLessonForm: async function ({ lesson }) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const body = document.getElementById('lesson-adaptive-body');
        if (!body || !API?.getAdaptiveLessonQuestion) return;

        let currentQuestion = null;

        const submitAnswer = async () => {
            const selected = document.querySelector('input[name="lesson-adaptive-answer"]:checked')?.value;
            if (!selected || !currentQuestion) return;
            const button = document.getElementById('lesson-adaptive-submit');
            if (button) {
                button.disabled = true;
                button.textContent = 'Revisando...';
            }
            try {
                const result = await API.answerAdaptiveLessonQuestion(lesson.id, {
                    variant: currentQuestion.variant,
                    prompt: currentQuestion.prompt,
                    selected_answer: selected,
                });
                if (result.correct) {
                    body.innerHTML = `
                        <div class="lesson-adaptive-form__feedback is-correct">${escapeHtml(result.explanation)}</div>
                        <p class="lesson-adaptive-form__done">Listo. Puedes marcar la lección como completada y continuar con el siguiente bloque.</p>
                    `;
                } else if (result.next_question) {
                    paintQuestion(result.next_question, { correct: false, text: result.explanation });
                } else {
                    body.innerHTML = `<div class="lesson-adaptive-form__feedback is-wrong">${escapeHtml(result.explanation)}</div>`;
                }
            } catch (error) {
                body.insertAdjacentHTML('afterbegin', `<div class="lesson-adaptive-form__feedback is-wrong">${escapeHtml(error.message || 'No se pudo revisar la respuesta.')}</div>`);
                if (button) {
                    button.disabled = false;
                    button.textContent = 'Responder';
                }
            }
        };

        function paintQuestion(question, feedback) {
            currentQuestion = question;
            body.innerHTML = `
                ${feedback ? `<div class="lesson-adaptive-form__feedback ${feedback.correct ? 'is-correct' : 'is-wrong'}">${escapeHtml(feedback.text)}</div>` : ''}
                <fieldset class="lesson-adaptive-form__question">
                    <legend>${escapeHtml(question.prompt)}</legend>
                    ${(question.options || []).map((option, index) => `
                        <label>
                            <input type="radio" name="lesson-adaptive-answer" value="${escapeHtml(option)}" ${index === 0 ? 'required' : ''}>
                            <span>${escapeHtml(option)}</span>
                        </label>
                    `).join('')}
                </fieldset>
                <button class="btn btn--primary btn--sm" type="button" id="lesson-adaptive-submit">Responder</button>
            `;
            document.getElementById('lesson-adaptive-submit')?.addEventListener('click', submitAnswer);
        }

        try {
            paintQuestion(await API.getAdaptiveLessonQuestion(lesson.id));
        } catch (error) {
            body.innerHTML = `<p class="lesson-adaptive-form__done">${escapeHtml(error.message || 'El formulario de sesión no está disponible en este momento.')}</p>`;
        }
    },

    bindReadingToolInteractions: async function () {
        // El laboratorio textual anterior fue reemplazado por la práctica guiada de Bill.
    },

    bindLessonAssessment: async function ({ lesson }) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const body = document.getElementById('lesson-adaptive-body');
        const completeButton = document.getElementById('complete-lesson-btn');
        if (!body || !API?.getAdaptiveLessonQuestion) return;

        let assessment = null;
        let currentIndex = 0;
        const answers = {};

        const setCompletionAvailability = (passed) => {
            if (!completeButton) return;
            completeButton.disabled = !passed;
            completeButton.title = passed
                ? 'Evaluación acreditada'
                : 'Obtén al menos 9/10 en la evaluación para completar la clase';
        };

        const renderResult = (result) => {
            const passed = Boolean(result.passed);
            setCompletionAvailability(passed);
            body.innerHTML = `
                <div class="lesson-assessment-result ${passed ? 'is-pass' : 'is-review'}">
                    <span>${passed ? 'Clase acreditada' : 'Repasa e inténtalo de nuevo'}</span>
                    <strong>${escapeHtml(result.score)}/10</strong>
                    <p>${passed
                        ? 'Demostraste dominio del tema. Ya puedes marcar la clase como completada.'
                        : `Acertaste ${escapeHtml(result.correct_count)} de ${escapeHtml(result.total_questions)}. Necesitas 9 respuestas correctas.`}</p>
                </div>
                <details class="lesson-assessment-review">
                    <summary>Revisar respuestas y explicaciones</summary>
                    <div class="lesson-assessment-review__list">
                        ${(result.results || []).map((item, index) => `
                            <article class="${item.correct ? 'is-correct' : 'is-wrong'}">
                                <span>Reactivo ${index + 1}</span>
                                <h3>${escapeHtml(item.prompt)}</h3>
                                <p><strong>${item.correct ? 'Respuesta correcta:' : 'Tu respuesta:'}</strong> ${escapeHtml(item.selected_answer || 'Sin respuesta')}</p>
                                ${item.correct ? '' : `<p><strong>Respuesta correcta:</strong> ${escapeHtml(item.correct_answer)}</p>`}
                                <p>${escapeHtml(item.explanation)}</p>
                            </article>
                        `).join('')}
                    </div>
                </details>
                <div class="lesson-assessment-actions">
                    ${passed
                        ? '<button type="button" class="btn btn--primary btn--sm" data-scroll-complete>Continuar</button>'
                        : '<button type="button" class="btn btn--primary btn--sm" id="lesson-assessment-retry">Intentar de nuevo</button>'}
                    <span>Mejor calificación: ${escapeHtml(result.best_score)}/10</span>
                </div>
            `;
            document.getElementById('lesson-assessment-retry')?.addEventListener('click', () => {
                Object.keys(answers).forEach((key) => delete answers[key]);
                currentIndex = 0;
                paintQuestion();
            });
            body.querySelector('[data-scroll-complete]')?.addEventListener('click', () => {
                completeButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                completeButton?.focus();
            });
        };

        const submitAssessment = async () => {
            if (!assessment || Object.keys(answers).length !== assessment.total_questions) return;
            const submit = document.getElementById('lesson-assessment-submit');
            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Calificando...';
            }
            try {
                renderResult(await API.answerAdaptiveLessonQuestion(lesson.id, { answers }));
            } catch (error) {
                body.insertAdjacentHTML(
                    'afterbegin',
                    `<div class="lesson-adaptive-form__feedback is-wrong">${escapeHtml(error.message || 'No se pudo calificar el intento.')}</div>`,
                );
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = 'Enviar evaluación';
                }
            }
        };

        const paintQuestion = () => {
            const question = assessment?.questions?.[currentIndex];
            if (!question) return;
            const selected = answers[String(question.id)];
            const answeredCount = Object.keys(answers).length;
            body.innerHTML = `
                <div class="lesson-assessment-meta">
                    <div>
                        <span>Reactivo ${currentIndex + 1} de ${assessment.total_questions}</span>
                        <strong>${answeredCount}/${assessment.total_questions} respondidos</strong>
                    </div>
                    <div class="lesson-assessment-progress" aria-label="Progreso de la evaluación">
                        <i style="width:${Math.round(((currentIndex + 1) / assessment.total_questions) * 100)}%"></i>
                    </div>
                    <small>Mejor intento: ${escapeHtml(assessment.best_score)}/10 · Acreditación: 9/10</small>
                </div>
                <fieldset class="lesson-adaptive-form__question lesson-assessment-question">
                    <legend>${escapeHtml(question.prompt)}</legend>
                    ${(question.options || []).map((option, index) => `
                        <label class="${selected === option.id ? 'is-selected' : ''}">
                            <input type="radio" name="lesson-adaptive-answer" value="${option.id}" ${selected === option.id ? 'checked' : ''}>
                            <b>${String.fromCharCode(65 + index)}</b>
                            <span>${escapeHtml(option.text)}</span>
                        </label>
                    `).join('')}
                </fieldset>
                <div class="lesson-assessment-nav">
                    <button class="btn btn--outline btn--sm" type="button" id="lesson-assessment-prev" ${currentIndex === 0 ? 'disabled' : ''}>Anterior</button>
                    ${currentIndex < assessment.total_questions - 1
                        ? '<button class="btn btn--primary btn--sm" type="button" id="lesson-assessment-next" disabled>Siguiente</button>'
                        : `<button class="btn btn--primary btn--sm" type="button" id="lesson-assessment-submit" ${Object.keys(answers).length === assessment.total_questions ? '' : 'disabled'}>Enviar evaluación</button>`}
                </div>
            `;
            body.querySelectorAll('input[name="lesson-adaptive-answer"]').forEach((input) => {
                input.addEventListener('change', () => {
                    answers[String(question.id)] = Number(input.value);
                    paintQuestion();
                });
            });
            const next = document.getElementById('lesson-assessment-next');
            if (next) {
                next.disabled = answers[String(question.id)] === undefined;
                next.addEventListener('click', () => {
                    currentIndex += 1;
                    paintQuestion();
                });
            }
            document.getElementById('lesson-assessment-prev')?.addEventListener('click', () => {
                currentIndex = Math.max(0, currentIndex - 1);
                paintQuestion();
            });
            document.getElementById('lesson-assessment-submit')?.addEventListener('click', submitAssessment);
        };

        try {
            assessment = await API.getAdaptiveLessonQuestion(lesson.id);
            setCompletionAvailability(Boolean(assessment.passed));
            paintQuestion();
        } catch (error) {
            setCompletionAvailability(false);
            body.innerHTML = `<p class="lesson-adaptive-form__done">${escapeHtml(error.message || 'La evaluación no está disponible por ahora.')}</p>`;
        }
    },

    bindLessonAudioMetadata: function () {
        const formatDuration = (seconds) => {
            const total = Math.max(0, Math.round(Number(seconds) || 0));
            const minutes = Math.floor(total / 60);
            const rest = total % 60;
            return minutes ? `${minutes}:${String(rest).padStart(2, '0')} min` : `${rest} seg`;
        };

        document.querySelectorAll('.lesson-audio-card audio').forEach((audio) => {
            const duration = audio.closest('.lesson-audio-card')?.querySelector('[data-lesson-audio-duration]');
            if (!duration) return;
            const updateDuration = () => {
                duration.textContent = Number.isFinite(audio.duration)
                    ? `Duración: ${formatDuration(audio.duration)}`
                    : 'Duración: no disponible';
            };
            audio.addEventListener('loadedmetadata', updateDuration, { once: true });
            audio.addEventListener('error', () => { duration.textContent = 'Audio no disponible.'; }, { once: true });
            if (audio.readyState >= 1) updateDuration();
        });
    },

    bindPracticeBlocks: function ({ lesson }) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const blocks = Array.from(document.querySelectorAll('[data-lesson-practice]'));

        blocks.forEach((block) => {
            const practiceId = String(block.dataset.practiceId || '').trim().toLowerCase();
            const answer = block.querySelector('[data-practice-answer]');
            const guide = block.querySelector('[data-practice-guide]');
            const reveal = block.querySelector('[data-practice-reveal]');
            const save = block.querySelector('[data-practice-save]');
            const status = block.querySelector('[data-practice-status]');

            reveal?.addEventListener('click', () => {
                if (!guide) return;
                guide.hidden = !guide.hidden;
                reveal.textContent = guide.hidden ? 'Ver guía' : 'Ocultar guía';
            });

            save?.addEventListener('click', async () => {
                if (!practiceId || !API?.saveLessonInteraction) return;
                const response = String(answer?.value || '').trim();
                if (!response) {
                    if (status) status.textContent = 'Escribe tu respuesta antes de guardar.';
                    answer?.focus();
                    return;
                }
                const previous = save.textContent;
                save.disabled = true;
                save.textContent = 'Guardando...';
                if (status) status.textContent = '';
                try {
                    const result = await API.saveLessonInteraction(lesson.id, practiceId, {
                        tipo: 'practice',
                        respuesta: response,
                        completado: true,
                    });
                    block.classList.add('is-saved');
                    if (status) status.innerHTML = escapeHtml(result.retroalimentacion || 'Práctica guardada.');
                } catch (error) {
                    if (status) status.textContent = error.message || 'No se pudo guardar la práctica.';
                } finally {
                    save.disabled = false;
                    save.textContent = previous;
                }
            });
        });

        if (!API?.getLessonInteractions || !blocks.length) return;
        API.getLessonInteractions(lesson.id).then((savedInteractions) => {
            const interactionsByKey = new Map(
                (Array.isArray(savedInteractions) ? savedInteractions : []).map((item) => [
                    String(item.interaction_key || '').trim().toLowerCase(),
                    item,
                ])
            );
            blocks.forEach((block) => {
                if (!block.isConnected) return;
                const practiceId = String(block.dataset.practiceId || '').trim().toLowerCase();
                const saved = interactionsByKey.get(practiceId);
                if (!saved) return;
                const answer = block.querySelector('[data-practice-answer]');
                const status = block.querySelector('[data-practice-status]');
                if (answer && saved.respuesta && !String(answer.value || '').trim()) {
                    answer.value = saved.respuesta;
                }
                block.classList.toggle('is-saved', Boolean(saved.completado));
                if (status && !status.textContent) {
                    status.textContent = saved.retroalimentacion || 'Práctica guardada.';
                }
            });
        }).catch(() => {
            // La práctica sigue operativa aunque el estado previo no esté disponible.
        });
    },

    getLessonOutline: function (lesson) {
        const content = String(lesson.contenido || '');
        const headings = [];

        if (this.contentLooksLikeHtml(content) && !this.containsMarkdownLessonBlocks(content)) {
            const template = document.createElement('template');
            template.innerHTML = this.sanitizeRichLessonHtml(content);

            Array.from(template.content.querySelectorAll('h2, h3, h4')).forEach((heading) => {
                const title = this.stripSectionNumbering(heading.textContent || '').trim();
                if (title && !headings.some((item) => item.toLowerCase() === title.toLowerCase())) {
                    headings.push(title);
                }
            });
        }

        content.split(/\r?\n/).forEach((line) => {
            const cleanLine = line.trim();
            let title = '';

            const markdownHeading = cleanLine.match(/^#{2,4}\s+(.+)$/);
            if (markdownHeading) {
                title = markdownHeading[1];
            } else if (/^\d+(?:\.\d+)+\s+/.test(cleanLine)) {
                title = cleanLine;
            }

            title = this.stripSectionNumbering(title)
                .replace(/\*\*/g, '')
                .replace(/`/g, '')
                .trim();

            if (title && !headings.some((item) => item.toLowerCase() === title.toLowerCase())) {
                headings.push(title);
            }
        });

        const fallback = [
            'Introducción',
            'Conceptos clave',
            'Ejemplo guiado',
            'Práctica',
            'Cierre',
        ];

        return (headings.length ? headings : fallback).slice(0, 7);
    },

    renderLessonOutline: function ({ lesson, escapeHtml }) {
        const outlineItems = this.getLessonOutline(lesson);

        return `
            <aside class="lesson-outline" aria-label="Índice interno de la lección">
                <div class="lesson-outline__title">En esta lección</div>
                <nav class="lesson-outline__list">
                    ${outlineItems.map((item) => `
                        <span class="lesson-outline__item">
                            <span class="lesson-outline__dot" aria-hidden="true"></span>
                            ${escapeHtml(item)}
                        </span>
                    `).join('')}
                </nav>
            </aside>
        `;
    },

    renderLessonRail: function ({ course, sections, lessonId, isStudent, completedLessonIds, passedQuizIds, completedChatingModuleIds, unlockedModuleIds, escapeHtml, totalItems, completedItems }) {
        const completedChating = completedChatingModuleIds || new Set();
        const unlockedModules = unlockedModuleIds || new Set(sections.map((section) => Number(section.id)));

        return `
            <aside class="lesson-rail" aria-label="Navegacion del curso">
                <div class="lesson-rail__header">
                    <div class="lesson-rail__eyebrow">Ruta del curso</div>
                    <h2>${escapeHtml(course.titulo)}</h2>
                    <p>${completedItems}/${totalItems || 0} elementos completados</p>
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
                        const sectionLocked = false;
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

                        const sectionIsCurrent = section.lecciones.some((entry) => Number(entry.id) === Number(lessonId));
                        const initiallyCollapsed = !sectionIsCurrent;

                        const moduleMarkup = `
                            <section class="lesson-rail__module ${sectionLocked ? 'is-locked' : ''} ${initiallyCollapsed ? 'is-collapsed' : ''}">
                                <div class="lesson-rail__module-head">
                                    <div class="lesson-rail__module-heading">
                                        <div class="lesson-rail__module-meta">Módulo ${sectionIndex + 1}</div>
                                        <h3>${escapeHtml(section.titulo)}</h3>
                                    </div>
                                    <button type="button" class="lesson-rail__module-toggle" data-lesson-module-toggle aria-expanded="${String(!initiallyCollapsed)}">${initiallyCollapsed ? 'Mostrar' : 'Ocultar'}</button>
                                </div>
                                <div class="lesson-rail__module-body">
                                    ${sectionLocked ? '<p class="lesson-rail__module-lock">Completa todas las actividades del módulo anterior para desbloquear este bloque.</p>' : ''}
                                    ${section.descripcion ? `<p>${escapeHtml(section.descripcion)}</p>` : ''}
                                    <div class="lesson-rail__items">
                                        ${entries.map((entry) => {
                                            const isChating = entry.tipo === 'chating';
                                            const isCurrent = entry.tipo === 'leccion' && Number(entry.id) === Number(lessonId);
                                            const isCompleted = entry.tipo === 'leccion'
                                                ? completedLessonIds.has(Number(entry.id))
                                                : entry.tipo === 'quiz'
                                                    ? passedQuizIds.has(Number(entry.id))
                                                    : completedChating.has(Number(entry.moduleId));
                                            const href = entry.tipo === 'leccion'
                                                ? window.EducatIA.Router.toUrl(window.EducatIA.Utils.lessonUrl(course, entry))
                                                : window.EducatIA.Router.toUrl(window.EducatIA.Utils.quizUrl(course, entry));
                                            // A completed item must remain visible under "Completados"
                                            // even when it is also the lesson currently open.
                                            const state = sectionLocked ? 'locked' : isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
                                            const statusLabel = sectionLocked
                                                ? 'Bloqueado'
                                                : isCompleted
                                                    ? (entry.tipo === 'quiz' ? 'Aprobado' : isChating ? 'Validado' : 'Listo')
                                                    : isCurrent
                                                        ? 'Actual'
                                                        : (isChating ? 'Cierre IA' : 'Pendiente');
                                            const itemMarkup = `
                                                <span class="lesson-rail__item-body">
                                                    <small>${entry.tipo === 'leccion' ? 'Lectura' : entry.tipo === 'quiz' ? 'Evaluación' : 'Chating'}</small>
                                                    <strong>${escapeHtml(entry.titulo)}</strong>
                                                </span>
                                                ${isStudent ? `<span class="lesson-rail__item-state">${statusLabel}</span>` : ''}
                                            `;
                                            const itemClass = `lesson-rail__item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${sectionLocked ? 'is-locked' : ''}`;

                                            if (sectionLocked) {
                                                return `<span class="${itemClass}" data-lesson-rail-item data-state="${state}" aria-disabled="true">${itemMarkup}</span>`;
                                            }

                                            if (isChating) {
                                                return `
                                                    <button type="button" class="${itemClass} lesson-rail__item--button" data-inline-open-chating="${entry.moduleId}" data-lesson-rail-item data-state="${state}">
                                                        ${itemMarkup}
                                                    </button>
                                                `;
                                            }

                                            return `
                                                <a href="${href}" class="${itemClass}" data-lesson-rail-item data-state="${state}">
                                                    ${itemMarkup}
                                                </a>
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

    bindLessonRailControls: function () {
        const rail = document.querySelector('.lesson-rail');
        if (!rail) {
            return;
        }

        const searchInput = rail.querySelector('#lesson-rail-search');
        const filterButtons = Array.from(rail.querySelectorAll('[data-lesson-rail-filter]'));
        const modules = Array.from(rail.querySelectorAll('.lesson-rail__module'));
        const emptyMessage = rail.querySelector('[data-lesson-rail-empty]');
        const moduleToggleButtons = Array.from(rail.querySelectorAll('[data-lesson-module-toggle]'));

        const normalizeText = (value) => String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const getActiveFilter = () => {
            const activeButton = filterButtons.find((button) => button.classList.contains('active'));
            return activeButton?.dataset.lessonRailFilter || 'all';
        };

        const setModuleCollapsed = (module, collapsed) => {
            const toggle = module.querySelector('[data-lesson-module-toggle]');
            module.classList.toggle('is-collapsed', collapsed);
            if (toggle) {
                toggle.setAttribute('aria-expanded', String(!collapsed));
                toggle.textContent = collapsed ? 'Mostrar' : 'Ocultar';
            }
        };

        const matchesFilter = (state, filter) => {
            if (filter === 'completed') {
                return state === 'completed';
            }
            if (filter === 'pending') {
                return state === 'pending' || state === 'current';
            }
            return true;
        };

        const applyFilters = () => {
            const query = normalizeText(searchInput?.value || '').trim();
            const filter = getActiveFilter();
            let visibleModules = 0;

            modules.forEach((module) => {
                let visibleItems = 0;
                const items = Array.from(module.querySelectorAll('[data-lesson-rail-item]'));
                const moduleText = normalizeText(module.querySelector('.lesson-rail__module-head')?.textContent || '');
                const moduleMatches = Boolean(query && moduleText.includes(query));

                items.forEach((item) => {
                    const itemText = normalizeText(item.textContent);
                    const shouldShow = (!query || moduleMatches || itemText.includes(query)) && matchesFilter(item.dataset.state, filter);
                    item.hidden = !shouldShow;
                    if (shouldShow) {
                        visibleItems += 1;
                    }
                });

                const moduleVisible = visibleItems > 0;
                module.hidden = !moduleVisible;
                if (moduleVisible) {
                    visibleModules += 1;
                }
                if (query && moduleVisible) {
                    setModuleCollapsed(module, false);
                }
            });

            if (emptyMessage) {
                emptyMessage.hidden = visibleModules > 0;
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                filterButtons.forEach((filterButton) => filterButton.classList.remove('active'));
                button.classList.add('active');
                applyFilters();
            });
        });

        moduleToggleButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const module = button.closest('.lesson-rail__module');
                if (!module) {
                    return;
                }
                setModuleCollapsed(module, !module.classList.contains('is-collapsed'));
            });
        });

        applyFilters();
    },

    renderCoachPanel: function ({ course, lesson, userName, escapeHtml }) {
        if (!this.isAleEnabled()) return '';
        const firstName = String(userName || 'Alumno').trim().split(' ')[0] || 'Alumno';

        return `
            <aside class="lesson-coach" id="lesson-coach">
                <button type="button" class="lesson-coach__launcher" id="lesson-coach-toggle" aria-expanded="false" aria-controls="lesson-coach-panel">
                    <span class="lesson-coach__avatar" aria-hidden="true"><img src="assets/ale_icono/icono_ale.png" alt="" loading="lazy" decoding="async"></span>
                    <span>Abrir Bill</span>
                </button>

                <button type="button" class="lesson-coach__backdrop" id="lesson-coach-backdrop" aria-label="Cerrar Bill" hidden></button>

                <div class="lesson-coach__panel" id="lesson-coach-panel" role="dialog" aria-label="Asistente de estudio Bill" tabindex="-1" hidden>
                    <div class="lesson-coach__header">
                        <div class="lesson-coach__identity">
                            <span class="lesson-coach__avatar" aria-hidden="true"><img src="assets/ale_icono/icono_ale.png" alt="" loading="lazy" decoding="async"></span>
                            <span>
                                <strong>Bill</strong>
                                <small>Esta lección</small>
                            </span>
                        </div>
                        <div class="lesson-coach__header-actions">
                            <button type="button" class="lesson-coach__header-action" id="lesson-coach-task">Tarea</button>
                            <button type="button" class="lesson-coach__header-action" id="lesson-coach-clear" aria-label="Iniciar una conversación nueva">Nuevo chat</button>
                            <button type="button" class="lesson-coach__close" id="lesson-coach-close" aria-label="Ocultar Bill"><span aria-hidden="true">×</span></button>
                        </div>
                    </div>

                    <div class="lesson-coach__body">
                        <div class="lesson-coach__intro">
                            <span class="lesson-coach__spark" aria-hidden="true">✦</span>
                            <p class="lesson-coach__greeting">Hola, ${escapeHtml(firstName)}.</p>
                            <h3>¿Cómo puedo ayudarte?</h3>
                            <p class="lesson-coach__context">Puedo trabajar contigo sobre <strong>${escapeHtml(lesson.titulo)}</strong> sin salir de ${escapeHtml(course.titulo)}.</p>
                        </div>

                        <div class="lesson-coach__quick-actions" aria-label="Formas rápidas de estudiar esta lección">
                            <button type="button" class="lesson-coach__quick-btn" data-lesson-coach-prompt="Explica esta lección de forma sencilla."><span aria-hidden="true">✦</span><strong>Explica este tema de forma sencilla</strong></button>
                            <button type="button" class="lesson-coach__quick-btn" data-lesson-coach-prompt="Hazme un resumen de esta lección."><span aria-hidden="true">✦</span><strong>Hazme un resumen</strong></button>
                            <button type="button" class="lesson-coach__quick-btn" data-lesson-coach-guided="true" data-lesson-coach-prompt="Inicia una práctica guiada estricta sobre esta lección. Hazme una pregunta a la vez, espera mi respuesta y corrígeme hasta que domine el objetivo."><span aria-hidden="true">✦</span><strong>Quiero preguntas de práctica</strong></button>
                            <button type="button" class="lesson-coach__quick-btn" data-lesson-coach-prompt="Dame ejemplos de la vida real relacionados con esta lección."><span aria-hidden="true">✦</span><strong>Dame ejemplos de la vida real</strong></button>
                        </div>

                        <div class="lesson-coach__messages" id="lesson-coach-messages" aria-live="polite" aria-label="Conversación con Bill"></div>
                    </div>

                    <div class="lesson-coach__composer">
                        <div class="lesson-coach__composer-box">
                            <textarea id="lesson-coach-input" rows="1" maxlength="1800" aria-label="Escribe tu pregunta para Bill" placeholder="Pregúntame lo que quieras"></textarea>
                            <button type="button" id="lesson-coach-send" aria-label="Enviar pregunta"><span aria-hidden="true">↑</span></button>
                        </div>
                        <p class="lesson-coach__privacy">Bill usa el contenido de esta lección para orientarte. Verifica la información importante y no compartas datos confidenciales.</p>
                    </div>
                </div>
            </aside>
        `;
    },

    bindCoachInteractions: function ({ course, lesson }) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const messages = document.getElementById('lesson-coach-messages');
        const input = document.getElementById('lesson-coach-input');
        const sendButton = document.getElementById('lesson-coach-send');
        const clearButton = document.getElementById('lesson-coach-clear');
        const coach = document.getElementById('lesson-coach');
        const coachPanel = document.getElementById('lesson-coach-panel');
        const coachToggle = document.getElementById('lesson-coach-toggle');
        const coachClose = document.getElementById('lesson-coach-close');
        const coachBackdrop = document.getElementById('lesson-coach-backdrop');
        const promptButtons = document.querySelectorAll('[data-lesson-coach-prompt]');
        const inlineAleButton = document.getElementById('lesson-stage-ale-btn');
        const toolbarAleButton = document.getElementById('lesson-toolbar-ale-btn');
        const taskButton = document.getElementById('lesson-coach-task');
        const desktopCoachMedia = window.matchMedia('(min-width: 1280px)');
        let guidedState = null;
        let requestGeneration = 0;
        let requestPending = false;
        let focusBeforeOpen = null;

        if (!messages || !input || !sendButton) {
            return;
        }

        const setCoachOpen = (isOpen, { focusInput = false } = {}) => {
            if (!coach || !coachPanel || !coachToggle) {
                return;
            }
            const isModal = isOpen && !desktopCoachMedia.matches;
            if (isOpen && !coach.classList.contains('is-open')) {
                focusBeforeOpen = document.activeElement instanceof HTMLElement ? document.activeElement : coachToggle;
            }
            coach.classList.toggle('is-open', isOpen);
            coachPanel.hidden = !isOpen;
            coachPanel.setAttribute('aria-modal', String(isModal));
            if (coachBackdrop) {
                coachBackdrop.hidden = !isModal;
            }
            coachToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('is-lesson-coach-modal', isModal);
            if (isOpen && focusInput) {
                window.setTimeout(() => input.focus(), 40);
            } else if (!isOpen && focusBeforeOpen instanceof HTMLElement) {
                window.setTimeout(() => focusBeforeOpen?.focus(), 0);
            }
        };

        const setRequestPending = (isPending) => {
            requestPending = isPending;
            sendButton.disabled = isPending;
            taskButton && (taskButton.disabled = isPending);
            promptButtons.forEach((button) => {
                button.disabled = isPending;
            });
            coachPanel?.toggleAttribute('aria-busy', isPending);
            const previousIndicator = document.getElementById('lesson-coach-thinking');
            if (isPending && !previousIndicator) {
                messages.insertAdjacentHTML('beforeend', `
                    <div class="lesson-coach__thinking" id="lesson-coach-thinking" role="status" aria-live="polite">
                        <span class="lesson-coach__thinking-avatar" aria-hidden="true"><img src="assets/ale_icono/icono_ale.png" alt=""></span>
                        <span class="lesson-coach__thinking-copy">Bill está pensando<span class="lesson-coach__thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span></span>
                    </div>
                `);
                messages.scrollTop = messages.scrollHeight;
            } else if (!isPending) {
                previousIndicator?.remove();
            }
            if (isPending) {
                sendButton.textContent = '…';
                sendButton.setAttribute('aria-label', 'Bill está pensando');
            } else {
                sendButton.innerHTML = '<span aria-hidden="true">↑</span>';
                sendButton.setAttribute('aria-label', 'Enviar pregunta');
            }
        };

        const renderMessage = (role, text) => {
            const cleanText = String(text || '')
                .replace(/!\[[^\]]*]\([^)]+\)(?:\{[^}]+\})?/g, '')
                .replace(/\[([^\]]+)]\(https?:\/\/[^)]+\)/g, '$1')
                .replace(/https?:\/\/\S+/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            const copyButton = role === 'bot'
                ? '<button type="button" class="lesson-coach__message-copy" data-lesson-coach-copy>Copiar</button>'
                : '';
            return `
                <div class="lesson-coach__message lesson-coach__message--${role} is-entering" data-coach-message-text="${escapeHtml(cleanText)}">
                    <div class="lesson-coach__message-text">${escapeHtml(cleanText).replace(/\n/g, '<br>')}</div>
                    ${copyButton}
                </div>
            `;
        };

        const appendMessage = (role, text) => {
            if (role === 'user') {
                coach?.classList.add('has-conversation');
            }
            messages.insertAdjacentHTML(
                'beforeend',
                renderMessage(role, text)
            );
            messages.scrollTop = messages.scrollHeight;
        };

        const resetMessages = () => {
            requestGeneration += 1;
            setRequestPending(false);
            messages.innerHTML = '';
            coach?.classList.remove('has-conversation');
            guidedState = null;
        };

        const resizeComposer = () => {
            input.style.height = 'auto';
            input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
        };

        const friendlyCoachError = (error) => {
            const message = String(error?.message || '').toLowerCase();
            if (message.includes('inscrib') || message.includes('curso comprado') || message.includes('suscrip')) {
                return 'Tu acceso premium no pudo confirmarse en este instante. Actualiza la página e inténtalo de nuevo; si continúa, vuelve a iniciar sesión.';
            }
            return error?.message || 'No pude responder en este momento. Intenta de nuevo en unos segundos.';
        };

        const copyTextToClipboard = async (text) => {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        };

        const sendPrompt = async (prompt, options = {}) => {
            const cleanPrompt = String(prompt || '').trim();
            if (!cleanPrompt || requestPending) {
                return;
            }
            const guidedMode = options.guided === true || guidedState?.active === true;
            const currentRequest = ++requestGeneration;

            appendMessage('user', cleanPrompt);
            input.value = '';
            resizeComposer();
            setRequestPending(true);

            try {
                const response = await API.chat(
                    cleanPrompt,
                    course.id,
                    {
                        lessonId: lesson.id,
                        modo: guidedMode ? 'practica_guiada' : undefined,
                        guided_state: guidedMode ? guidedState : undefined,
                    }
                );
                if (currentRequest !== requestGeneration) {
                    return;
                }
                if (response?.metadata?.guided_state) {
                    guidedState = response.metadata.guided_state;
                }
                if (guidedState?.objective_met) {
                    guidedState = null;
                }
                appendMessage('bot', response.respuesta || 'No tengo una respuesta lista ahora mismo.');
            } catch (error) {
                if (currentRequest === requestGeneration) {
                    appendMessage('bot', friendlyCoachError(error));
                }
            } finally {
                if (currentRequest === requestGeneration) {
                    setRequestPending(false);
                    input.focus();
                }
            }
        };

        sendButton.addEventListener('click', () => {
            sendPrompt(input.value);
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendPrompt(input.value);
            }
        });

        input.addEventListener('input', resizeComposer);
        resizeComposer();

        promptButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setCoachOpen(true, { focusInput: false });
                const startsGuidedPractice = button.dataset.lessonCoachGuided === 'true';
                if (startsGuidedPractice) {
                    guidedState = null;
                }
                sendPrompt(button.dataset.lessonCoachPrompt || '', { guided: startsGuidedPractice });
            });
        });

        if (clearButton) {
            clearButton.addEventListener('click', resetMessages);
        }

        messages.addEventListener('click', async (event) => {
            const copyButton = event.target.closest('[data-lesson-coach-copy]');
            if (!copyButton) {
                return;
            }
            const message = copyButton.closest('.lesson-coach__message');
            const text = message?.dataset.coachMessageText || message?.querySelector('.lesson-coach__message-text')?.textContent || '';
            if (!text.trim()) {
                return;
            }

            copyButton.disabled = true;
            try {
                await copyTextToClipboard(text);
                copyButton.textContent = 'Copiado';
                window.setTimeout(() => {
                    copyButton.textContent = 'Copiar';
                    copyButton.disabled = false;
                }, 1400);
            } catch (error) {
                copyButton.textContent = 'No se copio';
                window.setTimeout(() => {
                    copyButton.textContent = 'Copiar';
                    copyButton.disabled = false;
                }, 1400);
            }
        });

        if (coachToggle) {
            coachToggle.addEventListener('click', () => {
                setCoachOpen(!coach?.classList.contains('is-open'), { focusInput: true });
            });
        }

        [inlineAleButton, toolbarAleButton].filter(Boolean).forEach((button) => {
            button.addEventListener('click', () => {
                setCoachOpen(true, { focusInput: true });
            });
        });

        if (coachClose) {
            coachClose.addEventListener('click', () => {
                setCoachOpen(false);
            });
        }

        coachBackdrop?.addEventListener('click', () => {
            setCoachOpen(false);
        });

        coachPanel?.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setCoachOpen(false);
                return;
            }
            if (event.key !== 'Tab' || desktopCoachMedia.matches) {
                return;
            }
            const focusable = Array.from(coachPanel.querySelectorAll('button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter((element) => !element.hidden && element.getClientRects().length > 0);
            if (!focusable.length) {
                event.preventDefault();
                coachPanel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        taskButton?.addEventListener('click', async () => {
            if (requestPending) {
                return;
            }
            setCoachOpen(true, { focusInput: false });
            const currentRequest = ++requestGeneration;
            appendMessage('user', 'Bill, asígname una tarea breve de esta lección.');
            setRequestPending(true);
            try {
                const assignment = await API.createAleAssignment({
                    lesson_id: lesson.id,
                    course_id: course.id,
                    focus: lesson.titulo,
                });
                if (currentRequest === requestGeneration) {
                    appendMessage('bot', `${assignment.title}\n\n${assignment.instructions}`);
                }
            } catch (error) {
                if (currentRequest === requestGeneration) {
                    appendMessage('bot', error.message || 'No pude crear la tarea ahora mismo.');
                }
            } finally {
                if (currentRequest === requestGeneration) {
                    setRequestPending(false);
                }
            }
        });

        desktopCoachMedia.addEventListener('change', (event) => {
            setCoachOpen(event.matches, { focusInput: false });
        });
        setCoachOpen(desktopCoachMedia.matches, { focusInput: false });
    },

    bindLessonFigureFallbacks: function () {
        document.querySelectorAll('[data-lesson-image]').forEach((image) => {
            const figure = image.closest('[data-lesson-figure]');
            const fallback = figure?.querySelector('.lesson-reading-figure__fallback');
            if (!figure || !fallback) {
                return;
            }

            const showFallback = () => {
                image.hidden = true;
                fallback.hidden = true;
                figure.hidden = true;
                figure.classList.add('is-missing-asset');
            };

            image.addEventListener('error', showFallback, { once: true });
            if (image.complete && image.naturalWidth === 0) {
                showFallback();
            }
        });
    },

    renderAdminLessonEditor: function ({ lesson, escapeHtml }) {
        return `
            <section class="lesson-admin-editor" id="lesson-admin-editor" hidden>
                <div class="lesson-admin-editor__head">
                    <div>
                        <div class="lesson-stage__section-title">Editor de administrador</div>
                        <h2>Editar esta clase como documento</h2>
                        <p>Los cambios se guardan en esta lección y se reflejan para los estudiantes.</p>
                    </div>
                    <div class="lesson-admin-editor__actions">
                        <button type="button" class="btn btn--outline btn--sm" id="lesson-admin-cancel">Cancelar</button>
                        <button type="button" class="btn btn--primary btn--sm" id="lesson-admin-save">Guardar cambios</button>
                    </div>
                </div>

                <label class="lesson-admin-editor__field">
                    <span>Titulo de la clase</span>
                    <input id="lesson-admin-title" type="text" value="${escapeHtml(lesson.titulo || '')}" maxlength="180">
                </label>

                <div class="lesson-admin-editor__toolbar" aria-label="Herramientas de edicion">
                    <select id="lesson-admin-block" aria-label="Tipo de bloque">
                        <option value="p">Parrafo</option>
                        <option value="h2">Titulo</option>
                        <option value="h3">Subtitulo</option>
                        <option value="blockquote">Nota destacada</option>
                    </select>
                    <button type="button" data-admin-format="bold">Negrita</button>
                    <button type="button" data-admin-format="italic">Cursiva</button>
                    <button type="button" data-admin-format="underline">Subrayado</button>
                    <button type="button" data-admin-format="insertUnorderedList">Lista</button>
                    <button type="button" data-admin-format="insertOrderedList">Numeracion</button>
                    <button type="button" id="lesson-admin-link">Enlace</button>
                    <span class="lesson-admin-editor__separator" aria-hidden="true"></span>
                    <select id="lesson-admin-image-size" aria-label="Tamaño de imagen">
                        <option value="wide">Imagen ancha</option>
                        <option value="medium">Imagen mediana</option>
                        <option value="small">Imagen pequeña</option>
                        <option value="full">Imagen completa</option>
                    </select>
                    <select id="lesson-admin-image-align" aria-label="Posición de imagen">
                        <option value="center">Centrada</option>
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                    </select>
                    <button type="button" id="lesson-admin-image">Agregar imagen</button>
                    <button type="button" id="lesson-admin-apply-image">Aplicar a imagen</button>
                    <input type="file" id="lesson-admin-image-input" accept="image/*" hidden>
                </div>

                <div id="lesson-admin-richtext" class="lesson-admin-richtext" contenteditable="true" spellcheck="true">
                    ${this.prepareEditorHtml(lesson.contenido)}
                </div>

                <div class="lesson-admin-editor__foot">
                    <div id="lesson-admin-status" class="lesson-admin-status">Selecciona una imagen dentro del editor para cambiar su tamaño o posición.</div>
                    <div class="lesson-admin-editor__actions">
                        <button type="button" class="btn btn--outline btn--sm" id="lesson-admin-cancel-bottom">Cancelar</button>
                        <button type="button" class="btn btn--primary btn--sm" id="lesson-admin-save-bottom">Guardar cambios</button>
                    </div>
                </div>
            </section>
        `;
    },

    bindAdminLessonEditor: function ({ lesson, autoOpen = false }) {
        const API = window.EducatIA.API;
        const Components = window.EducatIA.Components;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const stageCard = document.getElementById('lesson-stage-card');
        const editorPanel = document.getElementById('lesson-admin-editor');
        const editor = document.getElementById('lesson-admin-richtext');
        const titleInput = document.getElementById('lesson-admin-title');
        const status = document.getElementById('lesson-admin-status');
        const editButton = document.getElementById('lesson-admin-edit-btn');
        const imageInput = document.getElementById('lesson-admin-image-input');
        const imageSize = document.getElementById('lesson-admin-image-size');
        const imageAlign = document.getElementById('lesson-admin-image-align');

        if (!stageCard || !editorPanel || !editor || !titleInput || !editButton) {
            return;
        }

        let savedRange = null;
        let selectedFigure = null;

        const setStatus = (message, type = '') => {
            if (!status) {
                return;
            }
            status.dataset.state = type;
            if (type === 'loading') {
                status.innerHTML = Components.renderLoading({
                    label: String(message || 'Cargando').replace(/\.+$/, ''),
                    compact: true
                });
                return;
            }
            status.textContent = message;
        };

        const saveSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount && editor.contains(selection.anchorNode)) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }
        };

        const restoreSelection = () => {
            if (!savedRange) {
                editor.focus();
                return;
            }
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        };

        const setEditing = (isEditing) => {
            stageCard.classList.toggle('is-admin-editing', isEditing);
            editorPanel.hidden = !isEditing;
            editButton.textContent = isEditing ? 'Editando clase' : 'Editar clase';
            editButton.disabled = isEditing;
            if (isEditing) {
                window.setTimeout(() => {
                    titleInput.focus();
                    editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 40);
            }
        };

        const clearImageSelection = () => {
            if (selectedFigure) {
                selectedFigure.classList.remove('is-selected');
            }
            selectedFigure = null;
        };

        const selectFigure = (figure) => {
            clearImageSelection();
            selectedFigure = figure;
            selectedFigure.classList.add('is-selected');
            setStatus('Imagen seleccionada. Puedes cambiar tamaño y posición.', 'ok');
        };

        const updateSelectedImageClasses = (figure, size, align) => {
            if (!figure) {
                return;
            }
            figure.className = [
                'lesson-reading-figure',
                `lesson-reading-figure--${size || 'medium'}`,
                `lesson-reading-figure--${align || 'center'}`,
            ].join(' ');
            figure.classList.add('is-selected');
        };

        const exec = (command, value = null) => {
            restoreSelection();
            document.execCommand(command, false, value);
            saveSelection();
            editor.focus();
        };

        const insertHtml = (html) => {
            restoreSelection();
            document.execCommand('insertHTML', false, html);
            saveSelection();
            editor.focus();
        };

        editButton.addEventListener('click', () => setEditing(true));

        document.querySelectorAll('#lesson-admin-cancel, #lesson-admin-cancel-bottom').forEach((button) => {
            button.addEventListener('click', () => {
                titleInput.value = lesson.titulo || '';
                editor.innerHTML = this.prepareEditorHtml(lesson.contenido);
                clearImageSelection();
                setEditing(false);
            });
        });

        editor.addEventListener('keyup', saveSelection);
        editor.addEventListener('mouseup', saveSelection);
        editor.addEventListener('focus', saveSelection);
        editor.addEventListener('click', (event) => {
            const figure = event.target.closest?.('figure.lesson-reading-figure');
            if (figure && editor.contains(figure)) {
                selectFigure(figure);
                return;
            }
            clearImageSelection();
        });

        document.querySelectorAll('[data-admin-format]').forEach((button) => {
            button.addEventListener('click', () => exec(button.dataset.adminFormat));
        });

        const blockSelect = document.getElementById('lesson-admin-block');
        if (blockSelect) {
            blockSelect.addEventListener('change', () => {
                const value = blockSelect.value;
                if (value === 'blockquote') {
                    exec('formatBlock', 'blockquote');
                } else {
                    exec('formatBlock', value);
                }
            });
        }

        const linkButton = document.getElementById('lesson-admin-link');
        if (linkButton) {
            linkButton.addEventListener('click', () => {
                const url = window.prompt('Pega el enlace que quieres agregar');
                if (!url) {
                    return;
                }
                exec('createLink', url.trim());
            });
        }

        const imageButton = document.getElementById('lesson-admin-image');
        if (imageButton && imageInput) {
            imageButton.addEventListener('click', () => {
                saveSelection();
                imageInput.click();
            });
            imageInput.addEventListener('change', async () => {
                const file = imageInput.files && imageInput.files[0];
                if (!file) {
                    return;
                }

                const alt = window.prompt('Texto alternativo de la imagen', file.name) || file.name;
                const size = imageSize?.value || 'wide';
                const align = imageAlign?.value || 'center';
                imageButton.disabled = true;
                setStatus('Subiendo imagen...', 'loading');

                try {
                    const upload = await API.uploadLessonImage(lesson.id, file, { alt, size, align });
                    const src = this.safeContentUrl(upload.url || upload.markdown || '');
                    const safeAlt = escapeHtml(alt);
                    const figureHtml = `
                        <figure class="lesson-reading-figure lesson-reading-figure--${escapeHtml(size)} lesson-reading-figure--${escapeHtml(align)}">
                            <img src="${escapeHtml(src)}" alt="${safeAlt}" loading="lazy" decoding="async">
                        </figure>
                        <p><br></p>
                    `;
                    insertHtml(figureHtml);
                    setStatus('Imagen agregada. Guarda los cambios para publicarla en la lección.', 'ok');
                } catch (error) {
                    setStatus(error.message || 'No se pudo subir la imagen.', 'error');
                } finally {
                    imageButton.disabled = false;
                    imageInput.value = '';
                }
            });
        }

        const applyImageButton = document.getElementById('lesson-admin-apply-image');
        if (applyImageButton) {
            applyImageButton.addEventListener('click', () => {
                if (!selectedFigure) {
                    setStatus('Selecciona primero una imagen dentro del editor.', 'error');
                    return;
                }
                updateSelectedImageClasses(selectedFigure, imageSize?.value || 'wide', imageAlign?.value || 'center');
                setStatus('Formato de imagen actualizado. Guarda los cambios para publicarlo.', 'ok');
            });
        }

        const save = async (button) => {
            const title = titleInput.value.trim();
            if (!title) {
                setStatus('El titulo de la clase no puede quedar vacio.', 'error');
                titleInput.focus();
                return;
            }

            const cleanContent = this.sanitizeRichLessonHtml(editor.innerHTML, { forStorage: true });
            if (!cleanContent) {
                setStatus('La clase necesita contenido antes de guardarse.', 'error');
                editor.focus();
                return;
            }

            const previousText = button.textContent;
            button.disabled = true;
            button.textContent = 'Guardando...';
            setStatus('Guardando cambios...', 'loading');

            try {
                const savedLesson = await API.updateLesson(lesson.id, {
                    titulo: title,
                    contenido: cleanContent,
                });

                lesson.titulo = savedLesson.titulo || title;
                lesson.contenido = savedLesson.contenido || cleanContent;

                const titleDisplay = document.getElementById('lesson-title-display');
                const summaryDisplay = document.getElementById('lesson-summary-display');
                const bodyDisplay = document.getElementById('lesson-body-display');
                const activeRailTitle = document.querySelector('.lesson-rail__item.active strong');
                const outlineDisplay = document.querySelector('.lesson-outline');
                if (titleDisplay) {
                    titleDisplay.textContent = lesson.titulo;
                }
                if (activeRailTitle) {
                    activeRailTitle.textContent = lesson.titulo;
                }
                if (summaryDisplay) {
                    summaryDisplay.textContent = this.getLessonSummary(lesson);
                }
                if (bodyDisplay) {
                    bodyDisplay.innerHTML = this.renderBodyContent(lesson.contenido, escapeHtml);
                    this.bindLessonFigureFallbacks();
                }
                if (outlineDisplay) {
                    outlineDisplay.outerHTML = this.renderLessonOutline({ lesson, escapeHtml });
                }

                editor.innerHTML = this.prepareEditorHtml(lesson.contenido);
                setEditing(false);
                setStatus('Cambios guardados correctamente.', 'ok');
            } catch (error) {
                setStatus(error.message || 'No se pudieron guardar los cambios.', 'error');
            } finally {
                button.disabled = false;
                button.textContent = previousText;
            }
        };

        document.querySelectorAll('#lesson-admin-save, #lesson-admin-save-bottom').forEach((button) => {
            button.addEventListener('click', () => save(button));
        });

        if (autoOpen) {
            window.setTimeout(() => setEditing(true), 80);
        }
    },

    render: async function (params) {
        const Components = window.EducatIA.Components;
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const app = document.getElementById('app');
        const lessonId = Number(params?.id);
        const isStudent = Components.canAccessStudentViews?.() || Components.userState.role === 'alumno';
        const canEditLesson = Components.isAdminRole?.() || Components.userState.role === 'admin';

        if (!Components.requireAuth()) {
            return;
        }

        app.innerHTML = `
            <div class="lesson-workspace lesson-workspace--loading">
                <div class="lesson-workspace__loading-card">${Components.renderLoading('Cargando lección')}</div>
            </div>
        `;

        try {
            const preloadedCourse = params?.preloadedCourse || null;
            const preloadedLessons = Array.isArray(params?.preloadedLessons) ? params.preloadedLessons : null;
            const lessonPromise = params?.preloadedLessonPromise || API.getLesson(lessonId);
            const prefetchedContext = preloadedCourse?.id
                ? Promise.all([
                    Promise.resolve(preloadedCourse),
                    API.getModules(preloadedCourse.id).catch(() => []),
                    preloadedLessons
                        ? Promise.resolve(preloadedLessons)
                        : API.getLessons(preloadedCourse.id).catch(() => []),
                    API.getQuizzes(preloadedCourse.id).catch(() => []),
                    isStudent
                        ? API.getCourseProgress(preloadedCourse.id).catch(() => ({ lecciones_completadas: [] }))
                        : Promise.resolve({ lecciones_completadas: [] }),
                    Promise.resolve({ nombre: Components.userState.name || 'Mi cuenta' }),
                ])
                : null;
            const lesson = await lessonPromise;
            const [
                course,
                modules,
                lessons,
                quizzes,
                progressData,
                me,
            ] = await (prefetchedContext || Promise.all([
                API.getCourse(lesson.curso_id),
                API.getModules(lesson.curso_id).catch(() => []),
                API.getLessons(lesson.curso_id).catch(() => [lesson]),
                API.getQuizzes(lesson.curso_id).catch(() => []),
                isStudent
                    ? API.getCourseProgress(lesson.curso_id).catch(() => ({ lecciones_completadas: [] }))
                    : Promise.resolve({ lecciones_completadas: [] }),
                Promise.resolve({ nombre: Components.userState.name || 'Mi cuenta' }),
            ]));

            const sections = window.EducatIA.Pages.Curso.buildLearningSections(modules, lessons, quizzes);
            const orderedLearningItems = sections.flatMap((section) => {
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
            const orderedLessons = sections.flatMap((section) => [...section.lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.id - b.id));
            const currentLessonIndex = orderedLessons.findIndex((entry) => entry.id === lesson.id);
            const currentLearningIndex = orderedLearningItems.findIndex((entry) => entry.tipo === 'leccion' && entry.id === lesson.id);
            const previousLesson = currentLessonIndex > 0 ? orderedLessons[currentLessonIndex - 1] : null;
            const nextLearningItem = currentLearningIndex >= 0 && currentLearningIndex < orderedLearningItems.length - 1
                ? orderedLearningItems[currentLearningIndex + 1]
                : null;
            const nextLesson = nextLearningItem?.tipo === 'leccion' ? nextLearningItem : null;
            const currentSection = sections.find((section) => section.lecciones.some((entry) => entry.id === lesson.id)) || null;
            const completedLessonIds = new Set((progressData.lecciones_completadas || []).map((completedLessonId) => Number(completedLessonId)));
            const passedQuizIds = new Set((progressData.quizzes_aprobados || []).map((quizId) => Number(quizId)));
            const completedChatingModuleIds = new Set((progressData.modulos_chating_completados || []).map((moduleId) => Number(moduleId)));
            const unlockedModuleIds = new Set((progressData.modulos || []).filter((item) => item.desbloqueado).map((item) => Number(item.modulo_id)));
            if (course.acceso_revision) sections.forEach(section => unlockedModuleIds.add(Number(section.id)));
            const chatingModules = sections.filter((section) => section.chating_habilitado && section.id != null);
            const lessonCompleted = completedLessonIds.has(Number(lesson.id));
            const totalTrackableItems = Number(progressData.total_actividades ?? (orderedLessons.length + quizzes.length + chatingModules.length));
            const completedTrackableItems = Number(progressData.actividades_completadas ?? (completedLessonIds.size + passedQuizIds.size + completedChatingModuleIds.size));
            const progressPercent = Number(progressData.porcentaje || 0);
            const routeUrl = (path) => window.EducatIA.Router.toUrl(path);
            const courseReaderHref = routeUrl(window.EducatIA.Utils.courseUrl(course));
            const lessonHref = (entry) => routeUrl(window.EducatIA.Utils.lessonUrl(course, entry));
            const quizHref = (entry) => routeUrl(window.EducatIA.Utils.quizUrl(course, entry));
            const nextCompletionCopy = nextLearningItem
                ? nextLearningItem.tipo === 'quiz'
                    ? `Ya puedes resolver ${escapeHtml(nextLearningItem.titulo)}.`
                    : nextLearningItem.tipo === 'chating'
                        ? 'Cierra este módulo con Chating para habilitar el siguiente bloque.'
                        : `Ya puedes continuar con ${escapeHtml(nextLearningItem.titulo)}.`
                : 'Ya completaste esta parte del recorrido.';
            const nextCompletionAction = nextLearningItem
                ? nextLearningItem.tipo === 'quiz'
                    ? `<a href="${quizHref(nextLearningItem)}" class="btn btn--primary">Ir al formulario</a>`
                    : nextLearningItem.tipo === 'chating'
                        ? `<button type="button" class="btn btn--primary" data-inline-open-chating="${nextLearningItem.moduleId}">Abrir Chating</button>`
                        : `<a href="${lessonHref(nextLearningItem)}" class="btn btn--primary">Ir a la siguiente lección</a>`
                : `<a href="${courseReaderHref}" class="btn btn--primary">Volver al curso</a>`;
            const nextInlineAction = nextLearningItem
                ? nextLearningItem.tipo === 'quiz'
                    ? `<a href="${quizHref(nextLearningItem)}" class="btn btn--primary btn--sm">Continuar</a>`
                    : nextLearningItem.tipo === 'chating'
                        ? `<button type="button" class="btn btn--primary btn--sm" data-inline-open-chating="${nextLearningItem.moduleId}">Abrir Chating</button>`
                        : `<a href="${lessonHref(nextLearningItem)}" class="btn btn--primary btn--sm">Continuar</a>`
                : `<a href="${courseReaderHref}" class="btn btn--primary btn--sm">Volver al curso</a>`;
            const lessonQueryParams = window.EducatIA.Router?.getQueryParams?.() || new URLSearchParams(window.location.search || '');
            const shouldAutoOpenEditor = canEditLesson && ['1', 'true', 'yes'].includes(String(lessonQueryParams.get('edit') || lessonQueryParams.get('adminEdit') || '').toLowerCase());
            const courseBackHref = canEditLesson ? `#/maestro/curso/${lesson.curso_id}` : courseReaderHref;
            const courseBackLabel = canEditLesson ? 'Volver al panel del curso' : 'Volver al curso';

            app.innerHTML = `
                <div class="lesson-workspace lesson-workspace--textual">
                    <div class="lesson-workspace__top course-reader__topbar">
                        <a href="#/dashboard" class="course-reader__brand" aria-label="Ir a mi aprendizaje">
                            <span class="course-reader__brand-logo" aria-hidden="true"><img src="assets/new_logo/new_logo.png" alt=""></span>
                            <span class="sr-only">educatIA</span>
                        </a>
                        <div class="course-reader__daily-goal" aria-label="Objetivo del día">
                            <span>Objetivo del día</span>
                            <strong>${escapeHtml(lesson.titulo)}</strong>
                        </div>
                        <div class="lesson-workspace__toolbar" aria-label="Herramientas de lectura">
                            <a href="${courseReaderHref}" class="lesson-workspace__tool">Vista del curso</a>
                            ${canEditLesson ? `<a href="#/maestro/curso/${lesson.curso_id}" class="lesson-workspace__tool">Panel admin</a>` : ''}
                            <button type="button" class="lesson-workspace__tool" data-focus-course-index>Índice</button>
                            ${this.isAleEnabled() ? '<button type="button" class="lesson-workspace__tool" id="lesson-toolbar-ale-btn">Preguntar a Bill</button>' : ''}
                            ${canEditLesson ? '<button type="button" class="lesson-workspace__tool lesson-workspace__tool--admin" id="lesson-admin-edit-btn">Editar clase</button>' : ''}
                        </div>
                        <div class="lesson-workspace__progress">
                            <span>${completedTrackableItems}/${totalTrackableItems || 0} elementos completados - ${progressPercent}% completado</span>
                            <div class="lesson-workspace__progress-bar"><span style="width:${progressPercent}%"></span></div>
                        </div>
                    </div>

                    <div class="lesson-workspace__grid">
                        ${this.renderLessonRail({
                            course,
                            sections,
                            lessonId: lesson.id,
                            isStudent,
                            completedLessonIds,
                            passedQuizIds,
                            completedChatingModuleIds,
                            unlockedModuleIds,
                            escapeHtml,
                            totalItems: totalTrackableItems,
                            completedItems: completedTrackableItems,
                        })}

                        <main class="lesson-stage">
                            <article class="lesson-stage__card" id="lesson-stage-card">
                                <nav class="lesson-breadcrumb" aria-label="Ubicación de la lección">
                                    <a href="#/dashboard">Mi aprendizaje</a>
                                    <span>${escapeHtml(course.titulo)}</span>
                                    <span>${escapeHtml(lesson.titulo)}</span>
                                </nav>

                                <div class="lesson-stage__eyebrow">${escapeHtml(currentSection ? currentSection.titulo : course.titulo)}</div>
                                <div class="lesson-stage__header">
                                    <div>
                                        <div class="lesson-stage__meta">Lección ${currentLessonIndex >= 0 ? currentLessonIndex + 1 : (lesson.orden || 0) + 1} de ${orderedLessons.length || 1}</div>
                                        <h1 id="lesson-title-display">${escapeHtml(lesson.titulo)}</h1>
                                        <p class="lesson-stage__summary" id="lesson-summary-display">${escapeHtml(this.getLessonSummary(lesson))}</p>
                                    </div>
                                    ${canEditLesson ? '<span class="lesson-stage__status lesson-stage__status--admin">Admin puede editar</span>' : isStudent ? `<span class="lesson-stage__status ${lessonCompleted ? 'completed' : ''}">${lessonCompleted ? 'Lección completada' : 'Pendiente'}</span>` : ''}
                                </div>

                                ${canEditLesson ? this.renderAdminLessonEditor({ lesson, escapeHtml }) : ''}

                                <section class="lesson-reader-banner" hidden aria-hidden="true">
                                    <div>
                                        <span></span>
                                        <strong>Lectura guiada, práctica y evaluación textual.</strong>
                                    </div>
                                    <p>educatIA está diseñado para aprender leyendo, resolviendo ejercicios y comprobando cada idea con práctica inmediata.</p>
                                </section>

                                <section class="lesson-stage__content">
                                    <div class="lesson-stage__body" id="lesson-body-display">
                                        ${this.renderBodyContent(lesson.contenido, escapeHtml)}
                                        ${!/\[AUDIO_CLASE:/i.test(String(lesson.contenido || '')) ? this.renderLessonAudioCard(this.getLessonAudioUrl(lesson), escapeHtml) : ''}
                                    </div>
                                </section>

                                <section class="lesson-stage__content" id="lesson-resources" hidden></section>
                                ${isStudent ? this.renderAdaptiveLessonForm({ lesson, escapeHtml }) : ''}

                                ${this.renderReadingTools({ lesson, currentSection, escapeHtml })}

                                <div class="lesson-stage__actions">
                                    ${previousLesson ? `<a href="${lessonHref(previousLesson)}" class="btn btn--outline btn--sm">Anterior</a>` : ''}
                                    ${this.isAleEnabled() ? '<button type="button" class="btn btn--outline btn--sm" id="lesson-stage-ale-btn">Preguntar a Bill</button>' : ''}
                                    ${isStudent && !lessonCompleted ? `<button class="btn btn--primary btn--sm" id="complete-lesson-btn" disabled title="Obtén al menos 9/10 en la evaluación para completar la clase">Marcar como completada</button>` : ''}
                                    ${isStudent && lessonCompleted ? nextInlineAction : ''}
                                    ${!isStudent ? nextInlineAction : ''}
                                    ${this.isAleEnabled() && isStudent && currentSection?.chating_habilitado && currentSection.id != null ? `<button type="button" class="btn btn--outline btn--sm" id="open-module-chating-btn">Abrir Chating del módulo</button>` : ''}
                                </div>

                                ${this.isAleEnabled() && isStudent && currentSection?.chating_habilitado && currentSection.id != null ? `
                                    <div class="lesson-stage__notice" style="margin-top:16px;">
                                        <strong>Bill en el módulo</strong>
                                        <span>Cuando termines la lectura, abre Chating para recibir retroalimentación y validar los criterios clave definidos por el maestro.</span>
                                    </div>
                                ` : ''}

                                <div id="lesson-chating-panel" style="display:grid; gap:16px; margin-top:16px;"></div>

                                ${isStudent && lessonCompleted ? `
                                    <div class="lesson-stage__completion-box">
                                        <div>
                                            <strong>Lección completada.</strong>
                                            <p>${nextCompletionCopy}</p>
                                        </div>
                                        ${nextCompletionAction}
                                    </div>
                                ` : ''}
                            </article>
                        </main>

                        ${this.renderCoachPanel({
                            course,
                            lesson,
                            userName: me.nombre,
                            escapeHtml,
                        })}
                    </div>
                </div>
            `;

            const completeLessonBtn = document.getElementById('complete-lesson-btn');
            this.mountLessonResources(lesson.id, API, escapeHtml);
            if (completeLessonBtn) {
                completeLessonBtn.addEventListener('click', async () => {
                    completeLessonBtn.disabled = true;
                    completeLessonBtn.textContent = 'Guardando...';
                    try {
                        const result = await API.completeLesson(lesson.id);
                        const updatedProgress = result?.progreso_curso || {};
                        const updatedCompleted = Number(
                            updatedProgress.actividades_completadas
                            ?? completedTrackableItems + 1
                        );
                        const updatedTotal = Number(
                            updatedProgress.total_actividades
                            ?? totalTrackableItems
                        );
                        const updatedPercent = Number(
                            updatedProgress.porcentaje
                            ?? (updatedTotal ? Math.round((updatedCompleted / updatedTotal) * 1000) / 10 : 0)
                        );

                        const progressLabel = document.querySelector('.lesson-workspace__progress > span');
                        const progressBar = document.querySelector('.lesson-workspace__progress-bar > span');
                        if (progressLabel) {
                            progressLabel.textContent = `${updatedCompleted}/${updatedTotal} elementos completados - ${updatedPercent}% completado`;
                        }
                        if (progressBar) {
                            progressBar.style.width = `${updatedPercent}%`;
                        }

                        const railProgressLabel = document.querySelector('.lesson-rail__header > p');
                        if (railProgressLabel) {
                            railProgressLabel.textContent = `${updatedCompleted}/${updatedTotal} elementos completados`;
                        }

                        const statusBadge = document.querySelector('.lesson-stage__status');
                        if (statusBadge) {
                            statusBadge.classList.add('completed');
                            statusBadge.textContent = 'Lección completada';
                        }

                        const currentRailItem = document.querySelector('[data-lesson-rail-item][data-state="current"]');
                        if (currentRailItem) {
                            currentRailItem.classList.add('completed');
                            currentRailItem.dataset.state = 'completed';
                            const railState = currentRailItem.querySelector('.lesson-rail__item-state');
                            if (railState) railState.textContent = 'Listo';
                        }

                        const actions = completeLessonBtn.closest('.lesson-stage__actions');
                        completeLessonBtn.outerHTML = nextInlineAction;
                        if (actions && !document.querySelector('.lesson-stage__completion-box')) {
                            actions.insertAdjacentHTML('afterend', `
                                <div class="lesson-stage__completion-box" aria-live="polite">
                                    <div>
                                        <strong>Lección completada.</strong>
                                        <p>${nextCompletionCopy}</p>
                                    </div>
                                    ${nextCompletionAction}
                                </div>
                            `);
                        }
                        document.querySelectorAll(
                            '.lesson-stage__actions [data-inline-open-chating], .lesson-stage__completion-box [data-inline-open-chating]'
                        ).forEach((button) => {
                            button.addEventListener('click', async (event) => {
                                event.preventDefault();
                                button.disabled = true;
                                try {
                                    await this.openInlineModuleChating(
                                        Number(button.dataset.inlineOpenChating)
                                    );
                                } catch (error) {
                                    Components.showWebNotice('Chating no disponible', error.message || 'No fue posible abrir Chating para este módulo.', 'error');
                                } finally {
                                    button.disabled = false;
                                }
                            }, { once: true });
                        });
                        if (Components.showWebNotice) {
                            Components.showWebNotice('Lección completada', 'Tu avance se guardó correctamente en Mi aprendizaje.', 'success');
                        }
                    } catch (error) {
                        completeLessonBtn.disabled = false;
                        completeLessonBtn.textContent = 'Marcar como completada';
                        if (Components.showWebNotice) {
                            Components.showWebNotice('No se pudo guardar', error.message || 'No se pudo marcar la lección como completada.', 'error');
                        }
                    }
                });
            }

            const openModuleChatingBtn = document.getElementById('open-module-chating-btn');
            if (openModuleChatingBtn && currentSection?.id != null) {
                openModuleChatingBtn.addEventListener('click', async () => {
                    openModuleChatingBtn.disabled = true;
                    openModuleChatingBtn.textContent = 'Abriendo Chating...';
                    try {
                        await this.openInlineModuleChating(currentSection.id);
                    } catch (error) {
                        Components.showWebNotice('Chating no disponible', error.message || 'No fue posible abrir Chating para este módulo.', 'error');
                    } finally {
                        openModuleChatingBtn.disabled = false;
                        openModuleChatingBtn.textContent = 'Abrir Chating del módulo';
                    }
                });
            }

            document.querySelectorAll('[data-inline-open-chating]').forEach((button) => {
                button.addEventListener('click', async (event) => {
                    event.preventDefault();
                    const moduleId = Number(button.dataset.inlineOpenChating);
                    if (!moduleId) {
                        return;
                    }
                    button.disabled = true;
                    try {
                        await this.openInlineModuleChating(moduleId);
                    } catch (error) {
                        Components.showWebNotice('Chating no disponible', error.message || 'No fue posible abrir Chating para este módulo.', 'error');
                    } finally {
                        button.disabled = false;
                    }
                });
            });

            this.bindLessonRailControls();
            this.bindLessonFigureFallbacks();
            this.bindLessonAudioMetadata();
            this.bindCoachInteractions({ course, lesson });
            if (isStudent) {
                this.bindLessonAssessment({ lesson });
                this.bindReadingToolInteractions({ lesson });
                this.bindPracticeBlocks({ lesson });
            }
            if (canEditLesson) {
                this.bindAdminLessonEditor({ lesson, course, autoOpen: shouldAutoOpenEditor });
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

            const restoreRaw = window.sessionStorage.getItem('educatia_lesson_scroll_restore');
            if (restoreRaw) {
                try {
                    const restore = JSON.parse(restoreRaw);
                    if (Number(restore.lessonId) === Number(lesson.id)) {
                        window.sessionStorage.removeItem('educatia_lesson_scroll_restore');
                        const y = Math.max(0, Number(restore.y) || 0);
                        window.requestAnimationFrame(() => {
                            window.requestAnimationFrame(() => {
                                window.scrollTo({ top: y, left: 0, behavior: 'auto' });
                            });
                        });
                    }
                } catch {
                    window.sessionStorage.removeItem('educatia_lesson_scroll_restore');
                }
            }
        } catch (error) {
            app.innerHTML = `
                <div class="lesson-workspace lesson-workspace--loading">
                    <div class="lesson-workspace__loading-card lesson-workspace__loading-card--error">
                        <h1 class="empty-state__title">No se pudo cargar la lección</h1>
                        <p class="empty-state__desc">${escapeHtml(error.message || 'La lección no existe o el backend no está disponible.')}</p>
                        <a href="#/dashboard" class="btn btn--primary">Volver a mi aprendizaje</a>
                    </div>
                </div>
            `;
        }
    },

    openInlineModuleChating: async function (moduleId) {
        const API = window.EducatIA.API;
        const escapeHtml = window.EducatIA.Utils.escapeHtml;
        const panel = document.getElementById('lesson-chating-panel');
        if (!panel) {
            return;
        }

        panel.innerHTML = `<div class="analytics-card" style="min-height:96px;padding:20px;display:grid;place-items:center;">${window.EducatIA.Components.renderLoading({ label: 'Cargando Chating', compact: true })}</div>`;

        const [module, session] = await Promise.all([
            API.getModule(moduleId),
            API.startModuleChatingSession(moduleId),
        ]);

        panel.innerHTML = `
            <div class="analytics-card" style="padding: 24px; display:grid; gap:18px;">
                <div class="flex-between" style="gap:16px; align-items:flex-start;">
                    <div>
                        <div class="lesson-stage__meta">Bill en el módulo</div>
                        <h3 style="font-size:18px; font-weight:700; margin-bottom:6px;">Chating - ${escapeHtml(module.titulo)}</h3>
                        <p class="text-small" style="color: var(--text-secondary); margin:0;">Esta sesión retroalimenta y valida si realmente dominaste el bloque que acabas de revisar.</p>
                    </div>
                    <button class="btn btn--ghost btn--sm" type="button" onclick="document.getElementById('lesson-chating-panel').innerHTML=''">Cerrar</button>
                </div>

                <div style="padding:14px 16px; border-radius:14px; background:rgba(0,86,210,0.05); border:1px solid rgba(0,86,210,0.12);">
                    <div style="font-size:12px; font-weight:700; color:var(--electric-blue); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Criterios del módulo</div>
                    <div style="font-size:14px; color:var(--text-secondary); line-height:1.6;">El maestro definió procesos clave que la IA irá marcando como completados conforme respondas con precisión.</div>
                </div>

                <div id="module-chating-progress" style="display:flex; gap:10px; flex-wrap:wrap;"></div>

                <div id="module-chating-messages" style="display:grid; gap:10px; max-height:280px; overflow:auto; padding-right:4px;"></div>

                <div style="display:flex; gap:10px; align-items:flex-end;">
                    <textarea id="module-chating-input" class="fi" rows="3" placeholder="Responde con tu propio razonamiento y demuestra dominio del módulo." style="min-height:88px;"></textarea>
                    <button id="module-chating-send" type="button" class="btn btn--primary">Enviar</button>
                </div>
            </div>
        `;

        if (window.EducatIA.Pages.Curso?.bindModuleChatingSession) {
            window.EducatIA.Pages.Curso.bindModuleChatingSession(module, session, { refreshCourseOnComplete: false });
        }
    }
};
