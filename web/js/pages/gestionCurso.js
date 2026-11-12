/* ================================================================
   educatIA — Gestión de Curso (v2)
   Full CRUD: modules, lessons, quizzes, materials
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.GestionCurso = (function () {
    const esc = (v) => window.EducatIA.Utils.escapeHtml(String(v ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const aleEnabled = () => window.EducatIA.Features?.ale === true;

    let course = null;
    let courseId = null;

    function courseClassification(prefix, current = {}) {
        const programs = [
            ['exani', 'Preparación EXANI'], ['ai_engineer', 'AI Engineer'],
            ['machine_learning', 'Machine Learning For AI'], ['deep_learning', 'Deep Learning For AI'],
            ['transformers_multimodal', 'Transformers and Multi-Modal Models'],
        ];
        return `<div>
            <label class="fl" for="${prefix}-program">Programa</label>
            <select class="fi" id="${prefix}-program" name="programa">${programs.map(([value, label]) => `<option value="${value}" ${(current.programa || 'exani') === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>
            <label class="fl" for="${prefix}-modality">Modalidad</label>
            <select class="fi" id="${prefix}-modality" name="modalidad"><option value="autonomo" ${(current.modalidad || 'autonomo') === 'autonomo' ? 'selected' : ''}>Estudio autónomo en plataforma</option><option value="hibrido_zoom" ${current.modalidad === 'hibrido_zoom' ? 'selected' : ''}>Plataforma y clases por Zoom</option></select>
        </div>`;
    }

    function renderTextBlock(text) {
        return esc((text || '').trim());
    }

    function getChatingProcessCount(module) {
        const explicitCount = Number(module?.chating_procesos_totales || 0);
        if (explicitCount > 0) {
            return explicitCount;
        }

        return String(module?.chating_procesos_clave || '')
            .split(/\r?\n/)
            .map((line) => line.replace(/^[\s\-•*\d.)]+/, '').trim())
            .filter(Boolean)
            .length;
    }

    function parsePriceValue(rawValue) {
        const trimmed = String(rawValue ?? '').trim();
        if (!trimmed) {
            return null;
        }

        const normalized = trimmed.replace(',', '.');
        const parsed = Number(normalized);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return null;
        }

        return parsed;
    }

    function assetUrl(url) {
        return window.EducatIA.API.resolveAssetUrl(url || '');
    }

    function sortByOrder(items) {
        return [...(items || [])].sort((left, right) => {
            return ((left?.orden || 0) - (right?.orden || 0)) || ((left?.id || 0) - (right?.id || 0));
        });
    }

    function moduleHasTrackableContent(module) {
        return Boolean((module?.lecciones || []).length || (module?.quizzes || []).length);
    }

    function attachCourseContent(baseCourse, modules, lessons, quizzes) {
        const moduleMap = new Map();

        sortByOrder(modules).forEach((module) => {
            moduleMap.set(String(module.id), {
                ...module,
                lecciones: [],
                quizzes: [],
            });
        });

        sortByOrder(lessons).forEach((lesson) => {
            const module = moduleMap.get(String(lesson.modulo_id || ''));
            if (module) {
                module.lecciones.push(lesson);
            }
        });

        sortByOrder(quizzes).forEach((quiz) => {
            const module = moduleMap.get(String(quiz.modulo_id || ''));
            if (module) {
                module.quizzes.push(quiz);
            }
        });

        const mergedModules = sortByOrder(Array.from(moduleMap.values()).map((module) => ({
            ...module,
            lecciones: sortByOrder(module.lecciones),
            quizzes: sortByOrder(module.quizzes),
        })));

        return {
            ...baseCourse,
            modulos: mergedModules,
            total_lecciones: lessons.length,
            total_quizzes: quizzes.length,
            total_chating: mergedModules.filter((module) => module.chating_habilitado).length,
        };
    }

    function buildPublicationChecklist(currentCourse) {
        const modules = currentCourse?.modulos || [];
        const modulesWithContent = modules.filter(moduleHasTrackableContent).length;

        return [
            {
                label: 'Titulo completo',
                done: (currentCourse?.titulo || '').trim().length >= 3,
                detail: 'Mínimo 3 caracteres.',
            },
            {
                label: 'Descripcion detallada',
                done: (currentCourse?.descripcion || '').trim().length >= 10,
                detail: 'Mínimo 10 caracteres.',
            },
            {
                label: 'Que aprenderas',
                done: Boolean((currentCourse?.que_aprenderas || '').trim()),
                detail: 'Define resultados concretos del curso.',
            },
            {
                label: 'Lo que obtendras',
                done: Boolean((currentCourse?.lo_que_obtendras || '').trim()),
                detail: 'Describe beneficios claros para el alumno.',
            },
            {
                label: 'Al menos un módulo',
                done: modules.length > 0,
                detail: `${modules.length} módulo${modules.length === 1 ? '' : 's'} creado${modules.length === 1 ? '' : 's'}.`,
            },
            {
                label: 'Contenido por módulo',
                done: modules.length > 0 && modulesWithContent === modules.length,
                detail: `${modulesWithContent}/${modules.length || 0} módulo${modules.length === 1 ? '' : 's'} con lección o evaluación.`,
            },
        ];
    }

    async function loadCourseWorkspace() {
        const [courseData, modules, lessons, quizzes] = await Promise.all([
            API().getCourse(courseId),
            API().getModules(courseId).catch(() => []),
            API().getLessons(courseId).catch(() => []),
            API().getQuizzes(courseId).catch(() => []),
        ]);

        course = attachCourseContent(courseData, modules, lessons, quizzes);
        return course;
    }

    async function render(params) {
        if (!C().requireAuth('maestro')) return;

        courseId = params?.id;
        const app = document.getElementById('app');
        if (!courseId) {
            app.innerHTML = '<div class="page-wrap"><p>Curso no encontrado.</p></div>';
            return;
        }

        if (String(courseId).toLowerCase() === 'nuevo') {
            drawNewCourseBuilder();
            return;
        }

        app.innerHTML = C().renderLoadingBlock('Cargando curso');

        try {
            await loadCourseWorkspace();
            draw();
        } catch (e) {
            app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">Error: ${esc(e.message)}</div></div>`;
        }
    }

    function drawNewCourseBuilder() {
        const app = document.getElementById('app');
        app.innerHTML = `
        <div class="page-wrap">
            <div class="page-hd" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
                <div>
                    <a href="#/dashboard-maestro" class="text-sm text-muted" style="display:inline-block;margin-bottom:8px">Volver a mis cursos</a>
                    <h1>Nuevo curso</h1>
                    <p>Crea el borrador completo desde esta pantalla. Después podrás agregar módulos, clases textuales y evaluaciones.</p>
                </div>
            </div>

            <form id="new-course-form">
                <div class="section">
                    <div class="section__label">Base del curso</div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
                        <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                            <label class="fl" for="new-course-title">Titulo del curso</label>
                            <input class="fi" id="new-course-title" name="titulo" type="text" minlength="3" maxlength="255" placeholder="Ejemplo: Prompt Injection Practico" required>
                        </div>
                        <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                            <label class="fl" for="new-course-price">Precio (opcional)</label>
                            <input class="fi" id="new-course-price" name="precio" type="number" min="0" step="0.01" placeholder="0.00">
                        </div>
                        ${courseClassification('new-course')}
                        <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;grid-column:1/-1">
                            <label class="fl" for="new-course-description">Descripcion</label>
                            <textarea class="fi" id="new-course-description" name="descripcion" rows="5" placeholder="Describe el objetivo del curso, a quien va dirigido y que problema resuelve."></textarea>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section__label">Presentacion publica inicial</div>
                    <p class="text-sm text-muted" style="margin-bottom:16px">Estos bloques alimentan la ficha del curso desde el primer borrador para que luego solo ajustes detalles antes de publicar.</p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
                        <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                            <label class="fl" for="new-course-que-aprenderas">Que aprenderas</label>
                            <textarea class="fi" id="new-course-que-aprenderas" name="que_aprenderas" rows="7" placeholder="Dominaras prompts efectivos\nConstruiras agentes basicos\nAplicaras IA a casos reales"></textarea>
                        </div>
                        <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                            <label class="fl" for="new-course-lo-que-obtendras">Lo que obtendras</label>
                            <textarea class="fi" id="new-course-lo-que-obtendras" name="lo_que_obtendras" rows="7" placeholder="Una ruta guiada lista para seguir\nPráctica con evaluaciones\nEvidencia clara de progreso"></textarea>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px">
                        <div style="background:rgba(0,86,210,0.05);border:1px solid rgba(0,86,210,0.12);border-radius:18px;padding:16px">
                            <strong style="display:block;margin-bottom:6px">Borrador privado</strong>
                            <div class="text-sm text-muted">El curso nace en borrador. Solo el maestro y admin pueden verlo antes de publicar.</div>
                        </div>
                        <div style="background:rgba(15,23,42,0.04);border:1px solid rgba(15,23,42,0.1);border-radius:18px;padding:16px">
                            <strong style="display:block;margin-bottom:6px">Checklist de salida</strong>
                            <div class="text-sm text-muted">Después podrás validar la descripción, presentación, módulos y contenido antes de abrirlo a los alumnos.</div>
                        </div>
                        <div style="background:rgba(14,116,144,0.05);border:1px solid rgba(14,116,144,0.12);border-radius:18px;padding:16px">
                            <strong style="display:block;margin-bottom:6px">Escala sin perder avance</strong>
                            <div class="text-sm text-muted">Actualizar el título, la descripción, los módulos o las evaluaciones no borra el avance registrado de los alumnos.</div>
                        </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-top:16px">
                        <p class="text-sm text-muted" style="margin:0">Crea el borrador y te llevamos directo al editor para completar la ruta.</p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap">
                            <button type="button" class="btn btn--out" id="cancel-new-course">Cancelar</button>
                            <button type="submit" class="btn btn--pri">Crear borrador y abrir editor</button>
                        </div>
                    </div>
                    <div id="new-course-msg" style="margin-top:12px"></div>
                </div>
            </form>
        </div>`;

        bindNewCourseBuilderEvents();
    }

    function draw() {
        const app = document.getElementById('app');
        const modules = course.modulos || [];
        const modulesWithContent = modules.filter(moduleHasTrackableContent).length;
        const checklist = buildPublicationChecklist(course);
        const firstLesson = modules.flatMap((module) => module.lecciones || [])[0] || null;

        app.innerHTML = `
        <div class="page-wrap">
            <div class="page-hd" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
                <div>
                    <a href="#/dashboard-maestro" class="text-sm text-muted" style="display:inline-block;margin-bottom:8px">Volver a mis cursos</a>
                    <h1>${esc(course.titulo)}</h1>
                    <p>
                        <span class="badge ${course.publicado ? 'badge--ok' : 'badge--mute'}">${course.publicado ? 'Publicado' : 'Borrador'}</span>
                        ${modules.length} módulo${modules.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
                    <a href="#/curso/${course.id}" class="btn btn--out btn--sm">Ver como alumno</a>
                    ${['machine_learning', 'deep_learning', 'transformers_multimodal'].includes(course.programa) ? `<a href="${window.EducatIA.Router.toUrl('/tareas/curso/' + course.id)}" class="btn btn--out btn--sm">Tareas y entregas</a>` : ''}
                    ${firstLesson ? `<a href="#/leccion/${firstLesson.id}?edit=1" class="btn btn--blue btn--sm">Editar primera clase</a>` : ''}
                </div>
            </div>

            <div class="section admin-visual-edit-callout">
                <div>
                    <div class="section__label">Edicion visual del contenido</div>
                    <h2>Edita las clases viendo la misma interfaz del alumno.</h2>
                    <p>Usa este panel para organizar módulos, evaluaciones y publicación. Para escribir, acomodar texto e insertar imágenes, abre cualquier clase en modo visual; ahí verás exactamente cómo la estudiarán los alumnos.</p>
                </div>
                <div class="admin-visual-edit-callout__actions">
                    <a href="#/curso/${course.id}" class="btn btn--out btn--sm">Vista del alumno</a>
                    ${firstLesson ? `<a href="#/leccion/${firstLesson.id}?edit=1" class="btn btn--pri btn--sm">Abrir editor visual</a>` : '<span class="text-sm text-muted">Crea una clase para activar el editor visual.</span>'}
                </div>
            </div>

            <div class="section">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:16px">
                    <div>
                        <div class="section__label" style="margin-bottom:8px">Configuración del curso</div>
                        <p class="text-sm text-muted" style="margin:0">Trabaja el curso como borrador y publícalo solo cuando la ruta esté lista. Actualizarlo después no borra inscripciones ni avances existentes.</p>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px">
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${modules.length}</strong>
                        <div class="text-sm text-muted">Módulos creados</div>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${modulesWithContent}</strong>
                        <div class="text-sm text-muted">Módulos con contenido</div>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${course.total_lecciones || 0}</strong>
                        <div class="text-sm text-muted">Clases creadas</div>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${course.total_quizzes || 0}</strong>
                        <div class="text-sm text-muted">Evaluaciones</div>
                    </div>
                    ${aleEnabled() ? `<div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <strong style="display:block;font-size:1.25rem">${course.total_chating || 0}</strong>
                        <div class="text-sm text-muted">Módulos con Chating</div>
                    </div>` : ''}
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
                    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                        <label class="fl" for="course-title">Titulo del curso</label>
                        <input class="fi" id="course-title" type="text" value="${esc(course.titulo)}" minlength="3" maxlength="255" placeholder="Titulo del curso">
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                        <label class="fl" for="course-price">Precio (opcional)</label>
                        <input class="fi" id="course-price" type="number" min="0" step="0.01" value="${course.precio != null ? esc(course.precio) : ''}" placeholder="0.00">
                    </div>
                    ${courseClassification('course', course)}
                    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;grid-column:1/-1">
                        <label class="fl" for="course-description">Descripcion</label>
                        <textarea class="fi" id="course-description" rows="5" placeholder="Describe el objetivo del curso, a quien ayuda y que resultados entrega.">${renderTextBlock(course.descripcion)}</textarea>
                    </div>
                </div>

                <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-top:16px">
                    <p class="text-sm text-muted" style="margin:0">${course.publicado ? 'El curso ya esta en linea. Usa Actualizar curso para publicar cambios de ficha y mantener intacto el avance.' : 'Mientras siga en borrador, solo tu y admin pueden verlo en vista previa.'}</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <button class="btn btn--out btn--sm" id="save-course-btn">${course.publicado ? 'Actualizar curso' : 'Guardar borrador'}</button>
                        <button class="btn btn--${course.publicado ? 'out' : 'blue'} btn--sm" id="toggle-pub-btn">${course.publicado ? 'Volver a borrador' : 'Publicar curso'}</button>
                        <button class="btn btn--danger btn--sm" id="delete-course-btn">Eliminar</button>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section__label">Lista de publicación</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
                    ${checklist.map((item) => `
                    <div style="background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px">
                        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
                            <strong style="font-size:0.95rem">${esc(item.label)}</strong>
                            <span class="badge ${item.done ? 'badge--ok' : 'badge--mute'}">${item.done ? 'Listo' : 'Pendiente'}</span>
                        </div>
                        <div class="text-xs text-muted" style="margin-top:8px">${esc(item.detail)}</div>
                    </div>`).join('')}
                </div>
            </div>

            <div class="section">
                <div class="section__label">Presentacion publica del curso</div>
                <p class="text-sm text-muted" style="margin-bottom:16px">Estas secciones aparecen en la página pública. Escribe una idea por línea para mostrarla como punto clave.</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
                    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                        <label class="fl" for="course-que-aprenderas">Que aprenderas</label>
                        <textarea class="fi" id="course-que-aprenderas" rows="7" placeholder="Dominaras prompts efectivos\nConstruiras agentes basicos\nAplicaras IA a casos reales">${renderTextBlock(course.que_aprenderas)}</textarea>
                    </div>
                    <div style="background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                        <label class="fl" for="course-lo-que-obtendras">Lo que obtendras al completar el curso</label>
                        <textarea class="fi" id="course-lo-que-obtendras" rows="7" placeholder="Una ruta guiada lista para seguir\nPráctica con evaluaciones\nEvidencia clara de progreso">${renderTextBlock(course.lo_que_obtendras)}</textarea>
                    </div>
                </div>
                <div style="margin-top:16px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px">
                    <div style="display:grid;grid-template-columns:minmax(220px,320px) 1fr;gap:18px;align-items:start">
                        <div class="admin-course-cover-preview">
                            ${course.imagen_url ? `<img src="${esc(assetUrl(course.imagen_url))}" alt="${esc(course.imagen_alt || course.titulo)}">` : '<span>Sin portada personalizada</span>'}
                        </div>
                        <div>
                            <label class="fl" for="course-cover-file">Portada del curso</label>
                            <input class="fi" id="course-cover-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:10px">
                                <div>
                                    <label class="fl" for="course-cover-alt">Texto alternativo</label>
                                    <input class="fi" id="course-cover-alt" type="text" maxlength="255" value="${esc(course.imagen_alt || course.titulo)}" placeholder="Describe la imagen">
                                </div>
                                <div>
                                    <label class="fl" for="course-cover-position">Posicion</label>
                                    <select class="fi" id="course-cover-position">
                                        <option value="center" ${(course.imagen_posicion || 'center') === 'center' ? 'selected' : ''}>Centro</option>
                                        <option value="left" ${course.imagen_posicion === 'left' ? 'selected' : ''}>Izquierda</option>
                                        <option value="right" ${course.imagen_posicion === 'right' ? 'selected' : ''}>Derecha</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="fl" for="course-cover-size">Tamaño</label>
                                    <select class="fi" id="course-cover-size">
                                        <option value="cover" ${(course.imagen_tamano || 'cover') === 'cover' ? 'selected' : ''}>Cubrir</option>
                                        <option value="contain" ${course.imagen_tamano === 'contain' ? 'selected' : ''}>Contener</option>
                                        <option value="wide" ${course.imagen_tamano === 'wide' ? 'selected' : ''}>Ancha</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px">
                                <p class="text-xs text-muted" style="margin:0">Esta imagen aparece en la ficha del curso y se puede cambiar sin afectar el avance de alumnos.</p>
                                <button class="btn btn--out btn--sm" id="upload-course-cover-btn" type="button">Guardar portada</button>
                            </div>
                            <div id="course-cover-msg" style="margin-top:10px"></div>
                        </div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-top:16px">
                    <p class="text-sm text-muted" style="margin:0">Guarda la ficha cuando cierres una tanda de cambios. Si el curso ya esta publicado, este boton actua como actualizacion de la portada publica.</p>
                    <button class="btn btn--blue btn--sm" id="save-public-copy-btn">${course.publicado ? 'Actualizar ficha publica' : 'Guardar presentacion'}</button>
                </div>
            </div>

            <div class="section">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:16px;flex-wrap:wrap">
                    <div>
                        <div class="section__label" style="margin-bottom:0">Módulos y contenido</div>
                        <p class="text-sm text-muted" style="margin:8px 0 0">Agrega clases textuales y evaluaciones por módulo. Los cambios de estructura no reinician el progreso guardado en otros módulos.</p>
                    </div>
                    <button class="btn btn--pri btn--sm" id="add-mod-btn">Agregar módulo</button>
                </div>

                ${modules.length === 0 ? `
                <div class="empty">
                    <h3>Sin módulos</h3>
                    <p>Agrega módulos para organizar el contenido del curso.</p>
                </div>` : ''}

                <div class="ml" id="modules-list">
                    ${modules.map((m, mi) => renderModule(m, mi)).join('')}
                </div>
            </div>
        </div>`;

        bindEvents();
    }

    function renderModule(m, mi) {
        const lessons = m.lecciones || [];
        const quizzes = m.quizzes || m.evaluaciones || [];
        const chatingProcessCount = getChatingProcessCount(m);

        return `
        <div class="mp" data-mod-id="${m.id}">
            <div class="mp__hd">
                <div>
                    <h3>${esc(m.titulo || `Módulo ${mi + 1}`)}</h3>
                    <div class="ir__meta" style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                        ${m.descripcion ? `<span>${esc(m.descripcion)}</span>` : ''}
                        ${aleEnabled() ? `<span class="badge ${m.chating_habilitado ? 'badge--info' : 'badge--mute'}">${m.chating_habilitado ? `Chating activo · ${chatingProcessCount} proceso${chatingProcessCount === 1 ? '' : 's'}` : 'Chating inactivo'}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn--ghost btn--sm add-video" data-mid="${m.id}">+ Clase textual</button>
                    ${aleEnabled() ? `<button class="btn btn--ghost btn--sm add-chating" data-mid="${m.id}">+ Chating</button>` : ''}
                    <button class="btn btn--ghost btn--sm add-quiz" data-mid="${m.id}">+ Evaluación</button>
                    <button class="btn btn--ghost btn--sm edit-mod" data-mid="${m.id}">Editar</button>
                    <button class="btn btn--ghost btn--sm del-mod" data-mid="${m.id}">Eliminar</button>
                </div>
            </div>
            <div class="mp__body">
                ${lessons.length === 0 && quizzes.length === 0 && (!aleEnabled() || !m.chating_habilitado) ? '<div class="mp__empty">Sin contenido. Agrega una clase textual o una evaluación.</div>' : ''}
                ${aleEnabled() && m.chating_habilitado ? `
                <div class="ir" style="padding:10px 20px">
                    <div class="ir__body">
                        <div class="ir__title">Chating del módulo</div>
                        <div class="ir__meta">Bill evaluativo · ${chatingProcessCount} criterio${chatingProcessCount === 1 ? '' : 's'} de cierre</div>
                    </div>
                    <div class="ir__acts">
                        <button class="btn btn--ghost btn--sm add-chating" data-mid="${m.id}">Configurar</button>
                    </div>
                </div>` : ''}
                ${lessons.map((lesson) => `
                <div class="ir" style="padding:10px 20px">
                    <div class="ir__body">
                        <div class="ir__title">${esc(lesson.titulo)}</div>
                        <div class="ir__meta">${lesson.video_tipo === 'upload' ? 'Clase con recurso de video' : lesson.video_url ? 'Clase con enlace de apoyo' : 'Clase textual'}</div>
                    </div>
                    <div class="ir__acts">
                        <a href="#/leccion/${lesson.id}" class="btn btn--ghost btn--sm">Ver</a>
                        <a href="#/leccion/${lesson.id}?edit=1" class="btn btn--ghost btn--sm">Editar visual</a>
                        <button class="btn btn--ghost btn--sm del-lesson" data-lid="${lesson.id}" data-mid="${m.id}">Eliminar</button>
                    </div>
                </div>`).join('')}
                ${quizzes.map((quiz) => `
                <div class="ir" style="padding:10px 20px">
                    <div class="ir__body">
                        <div class="ir__title">${esc(quiz.titulo)}</div>
                        <div class="ir__meta">Evaluación — ${(quiz.preguntas || []).length} preguntas · 3 intentos cada 8 h</div>
                    </div>
                    <div class="ir__acts">
                        <button class="btn btn--ghost btn--sm edit-quiz" data-qid="${quiz.id}" data-mid="${m.id}">Editar</button>
                        <button class="btn btn--ghost btn--sm del-quiz" data-qid="${quiz.id}" data-mid="${m.id}">Eliminar</button>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    }

    function collectCoursePayload() {
        return {
            titulo: document.getElementById('course-title')?.value.trim() || '',
            programa: document.getElementById('course-program')?.value || course.programa || 'exani',
            modalidad: document.getElementById('course-modality')?.value || course.modalidad || 'autonomo',
            descripcion: document.getElementById('course-description')?.value.trim() || '',
            precio: parsePriceValue(document.getElementById('course-price')?.value || ''),
            que_aprenderas: document.getElementById('course-que-aprenderas')?.value || '',
            lo_que_obtendras: document.getElementById('course-lo-que-obtendras')?.value || '',
        };
    }

    function confirmAction({ title, message, confirmText, cancelText, tone }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'mo';
            overlay.innerHTML = `
            <div class="modal" style="max-width:480px">
                <div class="modal__hd">
                    <h2>${esc(title || 'Confirmar accion')}</h2>
                    <button class="modal__x" type="button" id="close-confirm-modal">X</button>
                </div>
                <div style="display:grid;gap:16px">
                    <p class="text-sm text-muted" style="margin:0">${esc(message || 'Confirma para continuar.')}</p>
                    <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap">
                        <button type="button" class="btn btn--out" id="cancel-confirm-modal">${esc(cancelText || 'Cancelar')}</button>
                        <button type="button" class="btn ${tone === 'danger' ? 'btn--danger' : 'btn--pri'}" id="accept-confirm-modal">${esc(confirmText || 'Confirmar')}</button>
                    </div>
                </div>
            </div>`;

            document.body.appendChild(overlay);

            const close = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector('#close-confirm-modal').addEventListener('click', () => close(false));
            overlay.querySelector('#cancel-confirm-modal').addEventListener('click', () => close(false));
            overlay.querySelector('#accept-confirm-modal').addEventListener('click', () => close(true));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    close(false);
                }
            });
        });
    }

    function bindNewCourseBuilderEvents() {
        document.getElementById('cancel-new-course')?.addEventListener('click', () => {
            window.EducatIA.Router.navigate('/dashboard-maestro');
        });

        document.getElementById('new-course-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const msgEl = document.getElementById('new-course-msg');
            const payload = {
                titulo: form.titulo.value.trim(),
                programa: form.programa.value,
                modalidad: form.modalidad.value,
                descripcion: form.descripcion.value.trim(),
                precio: parsePriceValue(form.precio.value),
                que_aprenderas: form.que_aprenderas.value,
                lo_que_obtendras: form.lo_que_obtendras.value,
            };

            try {
                const newCourse = await API().createCourse(payload.titulo, payload.descripcion);
                await API().updateCourse(newCourse.id, {
                    programa: payload.programa,
                    modalidad: payload.modalidad,
                    precio: payload.precio,
                    que_aprenderas: payload.que_aprenderas,
                    lo_que_obtendras: payload.lo_que_obtendras,
                });
                C().showWebNotice('Borrador creado', 'Abrimos el editor completo del curso para que sigas agregando contenido.', 'success');
                window.EducatIA.Router.navigate(`/maestro/curso/${newCourse.id}`);
            } catch (error) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = error.message || 'No se pudo crear el curso.';
            }
        });
    }

    function bindEvents() {
        document.getElementById('save-course-btn')?.addEventListener('click', async () => {
            const payload = collectCoursePayload();
            try {
                await API().updateCourse(courseId, payload);
                C().showWebNotice(
                    course.publicado ? 'Curso actualizado' : 'Borrador guardado',
                    course.publicado
                        ? 'Los cambios del curso ya quedaron actualizados sin tocar el avance existente.'
                        : 'La configuración principal del curso quedó guardada como borrador.',
                    'success'
                );
                await reload();
            } catch (error) {
                C().showWebNotice('Curso no guardado', error.message || 'No fue posible guardar la configuración del curso.', 'error');
            }
        });

        document.getElementById('save-public-copy-btn')?.addEventListener('click', async () => {
            const payload = collectCoursePayload();
            try {
                await API().updateCourse(courseId, payload);
                C().showWebNotice(
                    course.publicado ? 'Ficha publica actualizada' : 'Presentacion guardada',
                    course.publicado
                        ? 'La portada publica del curso ya refleja los cambios nuevos.'
                        : 'La presentacion publica quedo guardada para cuando publiques el curso.',
                    'success'
                );
                await reload();
            } catch (error) {
                C().showWebNotice('Presentación no guardada', error.message || 'No fue posible actualizar la presentación pública.', 'error');
            }
        });

        document.getElementById('upload-course-cover-btn')?.addEventListener('click', async () => {
            const fileInput = document.getElementById('course-cover-file');
            const msgEl = document.getElementById('course-cover-msg');
            const file = fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
            const alt = document.getElementById('course-cover-alt')?.value || course.titulo;
            const position = document.getElementById('course-cover-position')?.value || 'center';
            const size = document.getElementById('course-cover-size')?.value || 'cover';

            if (!file && course.imagen_url) {
                try {
                    await API().updateCourse(courseId, {
                        imagen_url: course.imagen_url,
                        imagen_alt: alt,
                        imagen_posicion: position,
                        imagen_tamano: size,
                    });
                    C().showWebNotice('Portada actualizada', 'Ajustamos texto, posicion y tamano de la portada.', 'success');
                    await reload();
                } catch (error) {
                    C().showWebNotice('Portada no actualizada', error.message || 'No fue posible guardar la portada.', 'error');
                }
                return;
            }

            if (!file) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = 'Selecciona una imagen para guardar la portada.';
                return;
            }

            try {
                msgEl.className = 'smsg smsg--ok';
                msgEl.textContent = 'Subiendo portada...';
                await API().uploadCourseImage(courseId, file, { alt, position, size });
                C().showWebNotice('Portada guardada', 'La portada del curso ya quedo actualizada.', 'success');
                await reload();
            } catch (error) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = error.message || 'No se pudo subir la portada.';
            }
        });

        document.getElementById('toggle-pub-btn')?.addEventListener('click', async () => {
            const nextPublishedState = !course.publicado;
            if (!nextPublishedState) {
                const confirmed = await confirmAction({
                    title: 'Volver a borrador',
                    message: 'El curso dejara de verse como publicado para alumnos nuevos, pero el avance existente no se elimina.',
                    confirmText: 'Volver a borrador',
                    tone: 'danger',
                });
                if (!confirmed) {
                    return;
                }
            }

            const payload = collectCoursePayload();
            payload.publicado = nextPublishedState;

            try {
                await API().updateCourse(courseId, payload);
                C().showWebNotice(
                    nextPublishedState ? 'Curso publicado' : 'Curso en borrador',
                    nextPublishedState
                        ? 'El curso ya quedo disponible para los alumnos con su estructura actual.'
                        : 'El curso volvio a estado borrador para que sigas ajustandolo.',
                    'success'
                );
                await reload();
            } catch (error) {
                C().showWebNotice('Estado no actualizado', error.message || 'No fue posible actualizar el estado del curso.', 'error');
            }
        });

        document.getElementById('delete-course-btn')?.addEventListener('click', async () => {
            const confirmed = await confirmAction({
                title: 'Eliminar curso',
                message: 'Esta accion elimina el curso y su contenido de forma permanente.',
                confirmText: 'Eliminar curso',
                tone: 'danger',
            });
            if (!confirmed) {
                return;
            }

            try {
                await API().deleteCourse(courseId);
                C().showWebNotice('Curso eliminado', 'El curso se elimino correctamente.', 'success');
                window.EducatIA.Router.navigate('/dashboard-maestro');
            } catch (error) {
                C().showWebNotice('Curso no eliminado', error.message || 'No fue posible eliminar el curso.', 'error');
            }
        });

        document.getElementById('add-mod-btn')?.addEventListener('click', () => {
            showModuleModal(null);
        });

        document.querySelectorAll('.edit-mod').forEach((button) => {
            button.addEventListener('click', async () => {
                try {
                    const currentModule = (course.modulos || []).find((item) => String(item.id) === String(button.dataset.mid));
                    if (currentModule && Object.prototype.hasOwnProperty.call(currentModule, 'chating_prompt')) {
                        showModuleModal(currentModule);
                        return;
                    }

                    const freshModule = await API().getModule(button.dataset.mid);
                    showModuleModal(freshModule);
                } catch (error) {
                    C().showWebNotice('Módulo no disponible', error.message || 'No fue posible cargar el módulo.', 'error');
                }
            });
        });

        document.querySelectorAll('.del-mod').forEach((button) => {
            button.addEventListener('click', async () => {
                const confirmed = await confirmAction({
                    title: 'Eliminar módulo',
                    message: 'Se eliminará el módulo y todo su contenido asociado.',
                    confirmText: 'Eliminar módulo',
                    tone: 'danger',
                });
                if (!confirmed) {
                    return;
                }

                try {
                    await API().deleteModule(button.dataset.mid);
                    await reload();
                } catch (error) {
                    C().showWebNotice('Módulo no eliminado', error.message || 'No fue posible eliminar el módulo.', 'error');
                }
            });
        });

        document.querySelectorAll('.add-video').forEach((button) => {
            button.addEventListener('click', () => showLessonModal(button.dataset.mid, null));
        });

        document.querySelectorAll('.add-chating').forEach((button) => {
            button.addEventListener('click', async () => {
                try {
                    const currentModule = (course.modulos || []).find((item) => String(item.id) === String(button.dataset.mid));
                    if (currentModule && Object.prototype.hasOwnProperty.call(currentModule, 'chating_prompt')) {
                        showModuleModal(currentModule, { focusChating: true });
                        return;
                    }

                    const freshModule = await API().getModule(button.dataset.mid);
                    showModuleModal(freshModule, { focusChating: true });
                } catch (error) {
                    C().showWebNotice('Chating no disponible', error.message || 'No fue posible cargar la configuración de Chating.', 'error');
                }
            });
        });

        document.querySelectorAll('.del-lesson').forEach((button) => {
            button.addEventListener('click', async () => {
                const confirmed = await confirmAction({
                    title: 'Eliminar lección',
                    message: 'La lección y sus recursos asociados se eliminarán del módulo.',
                    confirmText: 'Eliminar lección',
                    tone: 'danger',
                });
                if (!confirmed) {
                    return;
                }

                try {
                    await API().deleteLesson(button.dataset.lid);
                    await reload();
                } catch (error) {
                    C().showWebNotice('Lección no eliminada', error.message || 'No fue posible eliminar la lección.', 'error');
                }
            });
        });

        document.querySelectorAll('.add-quiz').forEach((button) => {
            button.addEventListener('click', () => showQuizModal(button.dataset.mid, null));
        });

        document.querySelectorAll('.edit-quiz').forEach((button) => {
            button.addEventListener('click', async () => {
                try {
                    const quiz = await API().getQuizEditor(button.dataset.qid);
                    showQuizModal(button.dataset.mid, quiz);
                } catch (error) {
                    C().showWebNotice('Evaluación no disponible', error.message || 'No fue posible cargar la evaluación.', 'error');
                }
            });
        });

        document.querySelectorAll('.del-quiz').forEach((button) => {
            button.addEventListener('click', async () => {
                const confirmed = await confirmAction({
                    title: 'Eliminar evaluación',
                    message: 'La evaluación se eliminará del módulo. El historial previo del alumno no se reutilizará para una evaluación nueva.',
                    confirmText: 'Eliminar evaluación',
                    tone: 'danger',
                });
                if (!confirmed) {
                    return;
                }

                try {
                    await API().deleteQuiz(button.dataset.qid);
                    await reload();
                } catch (error) {
                    C().showWebNotice('Evaluación no eliminada', error.message || 'No fue posible eliminar la evaluación.', 'error');
                }
            });
        });
    }

    function showModuleModal(module, options) {
        const isEdit = !!module;
        const showAleControls = aleEnabled();
        const focusChating = showAleControls && !!options?.focusChating;
        const overlay = document.createElement('div');
        const defaultOrder = isEdit ? Number(module.orden || 1) : ((course.modulos || []).length + 1);

        overlay.className = 'mo';
        overlay.innerHTML = `
        <div class="modal" style="max-width:680px">
            <div class="modal__hd">
                <h2>${isEdit ? 'Editar módulo' : 'Nuevo módulo'}</h2>
                <button class="modal__x" id="close-modal">X</button>
            </div>
            <form id="module-form">
                <div class="fg">
                    <label class="fl">Titulo</label>
                    <input class="fi" type="text" name="titulo" value="${esc(module?.titulo || '')}" required>
                </div>
                <div class="fg">
                    <label class="fl">Descripcion breve</label>
                    <textarea class="fi" name="descripcion" rows="3" placeholder="Resumen visible para el alumno dentro del módulo.">${esc(module?.descripcion || '')}</textarea>
                </div>
                <div class="fg">
                    <label class="fl">Orden</label>
                    <input class="fi" type="number" name="orden" value="${defaultOrder}" min="1">
                </div>
                ${showAleControls ? `<div class="fg" style="padding:14px 16px;border:1px solid var(--border-light);border-radius:12px;background:rgba(0,86,210,0.03)">
                    <label style="display:flex;align-items:center;gap:10px;font-weight:600;color:var(--text-primary)">
                        <input type="checkbox" name="chating_habilitado" ${module?.chating_habilitado ? 'checked' : ''}>
                        Activar Chating en este módulo
                    </label>
                    <div class="text-xs text-muted" style="margin-top:6px">Chating pondrá a prueba al alumno, sin darle la respuesta, hasta cubrir los procesos clave del módulo.</div>
                </div>
                <div id="module-chating-fields" style="display:grid;gap:16px;margin-top:16px;">
                    <div class="fg">
                        <label class="fl">Prompt injection de Chating</label>
                        <textarea class="fi" name="chating_prompt" rows="4" placeholder="Ejemplo: evalua con escenarios reales, exige razonamiento y nunca entregues la respuesta.">${esc(module?.chating_prompt || '')}</textarea>
                    </div>
                    <div class="fg">
                        <label class="fl">Procesos clave</label>
                        <textarea class="fi" name="chating_procesos_clave" rows="5" placeholder="Escribe un proceso por linea\nIdentificar amenazas relevantes\nProponer mitigaciones concretas">${esc(module?.chating_procesos_clave || '')}</textarea>
                        <div class="fh">Cada linea se convierte en un criterio de cierre para la sesión.</div>
                    </div>
                </div>` : ''}
                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
                    <button type="button" class="btn btn--out" id="cancel-modal">Cancelar</button>
                    <button type="submit" class="btn btn--pri">${isEdit ? 'Guardar cambios' : 'Crear módulo'}</button>
                </div>
                <div id="module-modal-msg" style="margin-top:12px"></div>
            </form>
        </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        const chatingCheckbox = overlay.querySelector('input[name="chating_habilitado"]');
        const chatingFields = overlay.querySelector('#module-chating-fields');

        const syncChatingFields = () => {
            if (!chatingCheckbox || !chatingFields) return;
            const enabled = !!chatingCheckbox.checked;
            chatingFields.style.opacity = enabled ? '1' : '0.52';
            chatingFields.querySelectorAll('textarea').forEach((field) => {
                field.disabled = !enabled;
            });
        };

        overlay.querySelector('#close-modal').addEventListener('click', close);
        overlay.querySelector('#cancel-modal').addEventListener('click', close);
        overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
        chatingCheckbox?.addEventListener('change', syncChatingFields);
        if (focusChating && chatingCheckbox) {
            chatingCheckbox.checked = true;
        }
        syncChatingFields();
        if (focusChating) {
            window.setTimeout(() => {
                overlay.querySelector('textarea[name="chating_prompt"]')?.focus();
            }, 0);
        }

        overlay.querySelector('#module-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const chatingEnabled = showAleControls
                ? !!form.chating_habilitado?.checked
                : !!module?.chating_habilitado;
            const payload = {
                titulo: form.titulo.value.trim(),
                descripcion: form.descripcion.value.trim() || null,
                orden: parseInt(form.orden.value, 10) || 1,
                chating_habilitado: chatingEnabled,
                chating_prompt: showAleControls
                    ? (chatingEnabled ? (form.chating_prompt.value.trim() || null) : null)
                    : (module?.chating_prompt || null),
                chating_procesos_clave: showAleControls
                    ? (chatingEnabled ? (form.chating_procesos_clave.value.trim() || null) : null)
                    : (module?.chating_procesos_clave || null),
            };
            const msgEl = overlay.querySelector('#module-modal-msg');

            try {
                if (isEdit) {
                    await API().updateModule(module.id, payload);
                } else {
                    await API().createModule(courseId, payload);
                }
                close();
                reload();
            } catch (error) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = error.message || 'No se pudo guardar el módulo.';
            }
        });
    }

    /* ── Lesson Modal ── */
    function showLessonModal(moduleId, lesson, options) {
        const isEdit = !!lesson;
        const focusVideo = !!options?.focusVideo;
        const existingVideoUrl = lesson?.video_tipo === 'upload' ? '' : (lesson?.video_url || '');
        const overlay = document.createElement('div');
        overlay.className = 'mo';
        overlay.innerHTML = `
        <div class="modal">
            <div class="modal__hd">
                <h2>${isEdit ? 'Editar clase textual' : 'Nueva clase textual'}</h2>
                <button class="modal__x" id="close-modal">X</button>
            </div>
            <form id="lesson-form">
                <div class="fg">
                    <label class="fl">Titulo</label>
                    <input class="fi" type="text" name="titulo" value="${esc(lesson?.titulo || '')}" required>
                </div>
                <div class="fg">
                    <label class="fl">Borrador inicial opcional</label>
                    <textarea class="fi" name="contenido" rows="4" placeholder="Puedes escribir una primera idea. Al crear la clase se abrira el editor visual para trabajar como si fuera el curso del alumno.">${esc(lesson?.contenido || lesson?.content || '')}</textarea>
                    <div class="fh">La edición completa del texto, las imágenes y la distribución se realiza en la vista visual de la clase.</div>
                </div>
                <div class="fg">
                    <label class="fl">Recurso de video opcional</label>
                    <div class="fh" style="margin-bottom:8px">educatIA es textual. Si alguna clase necesita apoyo adicional, puedes enlazar YouTube o subir un archivo.</div>
                    <input class="fi" type="url" name="video_url" value="${esc(existingVideoUrl)}" placeholder="https://youtube.com/watch?v=...">
                </div>
                <div class="fg">
                    <label class="fl">Subir archivo de video (opcional)</label>
                    <input class="fi" type="file" name="video_file" accept="video/*">
                    <div class="fh">Si eliges un archivo, educatIA lo cargara como video propio de la plataforma.</div>
                    ${lesson?.video_tipo === 'upload' ? `<div class="fh">Video actual: cargado en plataforma${lesson?.video_status ? ` · estado ${esc(lesson.video_status)}` : ''}</div>` : ''}
                </div>
                <div class="fg">
                    <label class="fl">Orden</label>
                    <input class="fi" type="number" name="orden" value="${lesson?.orden || 1}" min="1">
                </div>
                <div style="display:flex;gap:8px;justify-content:flex-end">
                    <button type="button" class="btn btn--out" id="cancel-modal">Cancelar</button>
                    <button type="submit" class="btn btn--pri">${isEdit ? 'Guardar cambios' : 'Crear lección'}</button>
                </div>
                <div id="lesson-modal-msg" style="margin-top:12px"></div>
            </form>
        </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('#close-modal').addEventListener('click', close);
        overlay.querySelector('#cancel-modal').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        if (focusVideo) {
            window.setTimeout(() => {
                overlay.querySelector('input[name="video_url"]')?.focus();
            }, 0);
        }

        overlay.querySelector('#lesson-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const videoUrl = e.target.video_url.value.trim();
            const videoFile = e.target.video_file.files && e.target.video_file.files[0] ? e.target.video_file.files[0] : null;
            const msgEl = overlay.querySelector('#lesson-modal-msg');

            if (videoUrl && videoFile) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = 'Elige solo una fuente de video: enlace o archivo.';
                return;
            }

            const data = {
                titulo: e.target.titulo.value.trim(),
                contenido: e.target.contenido.value,
                orden: parseInt(e.target.orden.value, 10) || 1,
            };

            if (videoFile) {
                data.video_url = null;
                data.video_tipo = 'upload';
            } else if (videoUrl) {
                data.video_url = videoUrl;
                data.video_tipo = 'youtube';
            } else if (!isEdit || lesson?.video_tipo !== 'upload') {
                data.video_url = null;
                data.video_tipo = null;
            }

            try {
                let savedLesson;
                if (isEdit) {
                    savedLesson = await API().updateLesson(lesson.id, data);
                } else {
                    savedLesson = await API().createLesson(courseId, { ...data, modulo_id: moduleId });
                }
                if (videoFile && savedLesson?.id) {
                    msgEl.className = 'smsg smsg--ok';
                    msgEl.textContent = 'Subiendo video...';
                    await API().uploadLessonVideo(savedLesson.id, videoFile);
                }
                close();
                if (!isEdit && savedLesson?.id) {
                    C().showWebNotice('Clase creada', 'Abrimos el editor visual para que escribas esta clase como la vera el alumno.', 'success');
                    window.EducatIA.Router.navigate(`/leccion/${savedLesson.id}?edit=1`);
                    return;
                }
                reload();
            } catch (err) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = err.message || 'No fue posible guardar los cambios.';
            }
        });
    }

    /* ── Quiz Modal ── */
    function showQuizModal(moduleId, quiz) {
        const isEdit = !!quiz;
        const showAleControls = aleEnabled();
        let questions = quiz?.preguntas || [];

        const overlay = document.createElement('div');
        overlay.className = 'mo';
        overlay.innerHTML = `
        <div class="modal" style="max-width:640px">
            <div class="modal__hd">
                <h2>${isEdit ? 'Editar evaluación' : 'Nueva evaluación'}</h2>
                <button class="modal__x" id="close-modal">X</button>
            </div>
            <form id="quiz-form">
                <div class="fg">
                    <label class="fl">Titulo</label>
                    <input class="fi" type="text" name="titulo" value="${esc(quiz?.titulo || '')}" required>
                </div>
                <div class="fg">
                    <label class="fl">Descripcion (opcional)</label>
                    <textarea class="fi" name="descripcion" rows="2">${esc(quiz?.descripcion || '')}</textarea>
                </div>
                <div class="fg" style="padding:12px 14px;border:1px solid var(--border-light);border-radius:12px;background:rgba(15,23,42,0.03)">
                    <div class="text-xs text-muted">Cada alumno podrá presentar esta evaluación hasta 3 veces cada 8 horas. La calificación se calcula automáticamente con las respuestas correctas definidas por el maestro.</div>
                </div>
                ${showAleControls ? `<div class="fg" style="padding:12px 14px;border:1px solid var(--border-light);border-radius:12px;background:rgba(0,86,210,0.03)">
                    <label style="display:flex;align-items:center;gap:10px;font-weight:600;color:var(--text-primary)">
                        <input type="checkbox" name="ai_teacher_enabled" ${quiz?.ai_teacher_enabled ? 'checked' : ''}>
                        Añadir a Bill en esta evaluación
                    </label>
                    <div class="text-xs text-muted" style="margin-top:6px">Este asistente quedará limitado a esta evaluación y no mezclará respuestas ni contexto con otras.</div>
                </div>
                <div class="fg">
                    <label class="fl">Contexto de Bill (opcional)</label>
                    <textarea class="fi" name="ai_teacher_context" rows="3" placeholder="Ejemplo: explica solo matrices, determinantes y vectores; evita otros temas.">${esc(quiz?.ai_teacher_context || '')}</textarea>
                </div>` : ''}
                <div style="margin-bottom:16px">
                    <div class="section__label">Preguntas</div>
                    <div id="quiz-questions"></div>
                    <button type="button" class="btn btn--out btn--sm mt-8" id="add-question-btn">Agregar pregunta</button>
                </div>
                <div style="display:flex;gap:8px;justify-content:flex-end">
                    <button type="button" class="btn btn--out" id="cancel-modal">Cancelar</button>
                    <button type="submit" class="btn btn--pri">${isEdit ? 'Guardar cambios' : 'Crear evaluación'}</button>
                </div>
                <div id="quiz-modal-msg" style="margin-top:12px"></div>
            </form>
        </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('#close-modal').addEventListener('click', close);
        overlay.querySelector('#cancel-modal').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        function renderQuestions() {
            const container = overlay.querySelector('#quiz-questions');
            container.innerHTML = questions.map((question, questionIndex) => `
            <div class="card mb-8" style="padding:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <strong class="text-sm">Pregunta ${questionIndex + 1}</strong>
                    <button type="button" class="btn btn--ghost btn--sm remove-q" data-qi="${questionIndex}">Eliminar</button>
                </div>
                <div class="fg">
                    <input class="fi" type="text" placeholder="Texto de la pregunta" value="${esc(question.texto || question.pregunta || '')}" data-qi="${questionIndex}" data-field="texto">
                </div>
                <div class="text-xs text-muted mb-8">Opciones (marca la correcta):</div>
                ${(question.opciones || ['', '', '', '']).map((option, optionIndex) => `
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                    <input type="radio" name="correct-${questionIndex}" ${(question.respuesta_correcta === optionIndex || question.correcta === optionIndex || (typeof option === 'object' && option.correcta)) ? 'checked' : ''} data-qi="${questionIndex}" data-oi="${optionIndex}" class="q-correct">
                    <input class="fi" type="text" style="flex:1" placeholder="Opcion ${optionIndex + 1}" value="${esc(typeof option === 'string' ? option : option.texto || '')}" data-qi="${questionIndex}" data-oi="${optionIndex}" data-field="opcion">
                </div>`).join('')}
                <div class="fg" style="margin-top:10px">
                    <textarea class="fi" rows="3" placeholder="Retroalimentación para mostrar después del intento" data-qi="${questionIndex}" data-field="retroalimentacion">${esc(question.retroalimentacion || '')}</textarea>
                </div>
            </div>`).join('');

            if (questions.length === 0) {
                container.innerHTML = '<div class="text-sm text-muted" style="padding:16px 0">Sin preguntas. Agrega al menos una.</div>';
            }

            container.querySelectorAll('.remove-q').forEach((button) => {
                button.addEventListener('click', () => {
                    questions.splice(parseInt(button.dataset.qi, 10), 1);
                    renderQuestions();
                });
            });
        }

        renderQuestions();

        overlay.querySelector('#add-question-btn').addEventListener('click', () => {
            syncQuestions();
            questions.push({ texto: '', opciones: ['', '', '', ''], respuesta_correcta: 0 });
            renderQuestions();
        });

        function syncQuestions() {
            overlay.querySelectorAll('[data-field="texto"]').forEach((input) => {
                const questionIndex = parseInt(input.dataset.qi, 10);
                if (questions[questionIndex]) questions[questionIndex].texto = input.value;
            });
            overlay.querySelectorAll('[data-field="opcion"]').forEach((input) => {
                const questionIndex = parseInt(input.dataset.qi, 10);
                const optionIndex = parseInt(input.dataset.oi, 10);
                if (questions[questionIndex] && questions[questionIndex].opciones) questions[questionIndex].opciones[optionIndex] = input.value;
            });
            overlay.querySelectorAll('[data-field="retroalimentacion"]').forEach((input) => {
                const questionIndex = parseInt(input.dataset.qi, 10);
                if (questions[questionIndex]) questions[questionIndex].retroalimentacion = input.value;
            });
            overlay.querySelectorAll('.q-correct:checked').forEach((radio) => {
                const questionIndex = parseInt(radio.dataset.qi, 10);
                const optionIndex = parseInt(radio.dataset.oi, 10);
                if (questions[questionIndex]) questions[questionIndex].respuesta_correcta = optionIndex;
            });
        }

        overlay.querySelector('#quiz-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            syncQuestions();
            const data = {
                titulo: e.target.titulo.value.trim(),
                descripcion: e.target.descripcion.value.trim(),
                ai_teacher_enabled: showAleControls
                    ? !!e.target.ai_teacher_enabled?.checked
                    : !!quiz?.ai_teacher_enabled,
                ai_teacher_context: showAleControls
                    ? (e.target.ai_teacher_context?.value.trim() || null)
                    : (quiz?.ai_teacher_context || null),
                preguntas: questions.map((question) => ({
                    texto: question.texto || question.pregunta || '',
                    opciones: (question.opciones || []).map((option) => typeof option === 'string' ? option : option.texto || ''),
                    respuesta_correcta: question.respuesta_correcta ?? 0,
                    retroalimentacion: question.retroalimentacion || null,
                })),
            };
            const msgEl = overlay.querySelector('#quiz-modal-msg');
            try {
                if (isEdit) {
                    await API().updateQuiz(quiz.id, data);
                } else {
                    await API().createQuiz(courseId, { ...data, modulo_id: moduleId });
                }
                close();
                reload();
            } catch (err) {
                msgEl.className = 'smsg smsg--err';
                msgEl.textContent = err.message || 'No fue posible guardar los cambios.';
            }
        });
    }

    async function reload() {
        try {
            await loadCourseWorkspace();
            draw();
        } catch (error) {
            C().showWebNotice('Curso no actualizado', error.message || 'No fue posible recargar la información del curso.', 'error');
        }
    }

    return { render };
})();
