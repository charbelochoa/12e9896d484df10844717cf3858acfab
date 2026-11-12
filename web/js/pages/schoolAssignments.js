/* Course tasks use the existing educatIA forms, tables and reading surfaces. */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.SchoolAssignments = (function () {
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const url = (path) => window.EducatIA.Router.toUrl(path);
    const formats = ['.pdf', '.docx', '.txt', '.md', '.py', '.ipynb', '.csv', '.json', '.png', '.jpg', '.jpeg'];
    const statusNames = { entregada: 'Pendiente de revisión', revisada: 'Calificada', cambios_solicitados: 'Corrección solicitada' };
    let renderVersion = 0;

    function dateLabel(value) {
        return value ? new Date(value).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' }) + ' · Ciudad de México' : 'Sin fecha límite';
    }

    function localDateInput(value) {
        if (!value) return '';
        const date = new Date(value);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    function paragraphs(value) {
        return String(value || '').split(/\r?\n/).filter(Boolean).map((line) => `<p>${esc(line)}</p>`).join('');
    }

    // Task text supports section headings; raw HTML and student responses remain escaped.
    function renderInstructions(value) {
        return String(value || '').split(/\r?\n/).filter(Boolean).map((line) => {
            const heading = line.match(/^ {0,3}(#{1,6})[ \t]+(.+?)\s*$/);
            if (!heading) return `<p>${esc(line)}</p>`;
            const level = heading[1].length <= 2 ? 3 : 4;
            return `<h${level}>${esc(heading[2])}</h${level}>`;
        }).join('');
    }

    function editor(task, lessons, locked, modules = []) {
        return `
            <section class="section" aria-labelledby="task-editor-title">
                <h2 id="task-editor-title">${task ? 'Editar tarea' : 'Nueva tarea'}</h2>
                <p>${locked ? 'Esta tarea ya tiene entregas. Puedes ampliar o retirar su fecha límite; las instrucciones y la rúbrica se conservan.' : 'Define las instrucciones y los criterios que utilizarás para revisar el trabajo.'}</p>
                <form id="school-task-editor">
                    <fieldset ${locked ? 'disabled' : ''}>
                        <label class="fl" for="task-title">Título</label>
                        <input class="fi" id="task-title" name="titulo" minlength="3" maxlength="255" required value="${esc(task?.titulo)}">
                        <label class="fl" for="task-instructions">Instrucciones y entregables</label>
                        <textarea class="fi" id="task-instructions" name="instrucciones" rows="8" minlength="10" maxlength="20000" required>${esc(task?.instrucciones)}</textarea>
                        <label class="fl" for="task-module">Módulo relacionado</label>
                        <select class="fi" id="task-module" name="modulo_id"><option value="">Todo el curso</option>${modules.map((module) => `<option value="${module.id}" ${Number(task?.modulo_id) === module.id ? 'selected' : ''}>${esc(module.titulo)}</option>`).join('')}</select>
                        <label class="fl" for="task-lesson">Clase relacionada</label>
                        <select class="fi" id="task-lesson" name="leccion_id">
                            <option value="">Sin lección específica</option>
                            ${lessons.map((lesson) => `<option value="${lesson.id}" ${Number(task?.leccion_id) === lesson.id ? 'selected' : ''}>${esc(lesson.titulo)}</option>`).join('')}
                        </select>
                        <label class="fl" for="task-pass-score">Calificación mínima para aprobar (0 a 10)</label>
                        <input class="fi" id="task-pass-score" name="nota_minima" type="number" min="0" max="10" step="0.1" value="${esc(task?.nota_minima ?? 7)}" required>
                        <h3>Rúbrica</h3>
                        <p>Si agregas criterios, sus pesos deben sumar 100%. Sin rúbrica, asignarás una nota de 0 a 10.</p>
                        <div id="task-rubric-editor"></div>
                        <button type="button" class="btn btn--out btn--sm" id="task-add-criterion">Agregar criterio</button>
                        <h3>Formatos de archivos</h3>
                        ${formats.map((extension) => `<label class="fl"><input type="checkbox" name="extensiones" value="${extension}" ${(task?.extensiones || formats).includes(extension) ? 'checked' : ''}> ${extension}</label>`).join('')}
                        <label class="fl"><input type="checkbox" name="permitir_tardias" ${task?.permitir_tardias ? 'checked' : ''}> Aceptar entregas tardías</label>
                        <label class="fl"><input type="checkbox" name="publicado" ${task?.publicado ? 'checked' : ''}> Publicar para los alumnos</label>
                    </fieldset>
                    <label class="fl" for="task-deadline">Fecha límite (hora de tu dispositivo)</label>
                    <input class="fi" id="task-deadline" name="fecha_limite" type="datetime-local" value="${localDateInput(task?.fecha_limite)}">
                    <p class="text-sm text-muted">La fecha se guarda con zona horaria y se muestra a los alumnos en hora de Ciudad de México.</p>
                    <button type="submit" class="btn btn--pri">${task ? 'Guardar cambios' : 'Crear tarea'}</button>
                    <p id="task-editor-message" role="status"></p>
                </form>
            </section>`;
    }

    function bindEditor(task, lessons, submissions, courseId, reload) {
        const form = document.getElementById('school-task-editor');
        if (!form) return;
        form.elements.leccion_id.addEventListener('change', () => {
            const lesson = lessons.find((item) => item.id === Number(form.elements.leccion_id.value));
            if (lesson) form.elements.modulo_id.value = lesson.modulo_id || '';
        });
        const locked = submissions.length > 0;
        const container = document.getElementById('task-rubric-editor');
        function addCriterion(criterion = {}) {
            const fieldset = document.createElement('fieldset');
            fieldset.dataset.rubricCriterion = '';
            fieldset.innerHTML = `<legend>Criterio de revisión</legend>
                <label class="fl">Nombre<input class="fi" name="criterio_titulo" minlength="3" maxlength="160" required value="${esc(criterion.titulo)}"></label>
                <label class="fl">Qué debe demostrar el alumno<textarea class="fi" name="criterio_descripcion" minlength="3" maxlength="1000" required>${esc(criterion.descripcion)}</textarea></label>
                <label class="fl">Peso (%)<input class="fi" type="number" name="criterio_peso" min="1" max="100" required value="${esc(criterion.peso)}"></label>
                <button type="button" class="btn btn--out btn--sm" data-remove-criterion>Retirar criterio</button>`;
            fieldset.disabled = locked;
            fieldset.querySelector('[data-remove-criterion]').addEventListener('click', () => fieldset.remove());
            container.appendChild(fieldset);
        }
        for (const criterion of task?.rubrica || []) addCriterion(criterion);
        document.getElementById('task-add-criterion').addEventListener('click', () => {
            if (container.children.length < 12) addCriterion();
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('[type="submit"]');
            const message = document.getElementById('task-editor-message');
            const deadline = form.elements.fecha_limite.value;
            const data = locked ? {
                titulo: task.titulo, instrucciones: task.instrucciones, leccion_id: task.leccion_id, modulo_id: task.modulo_id,
                nota_minima: task.nota_minima, rubrica: task.rubrica, extensiones: task.extensiones,
                permitir_tardias: task.permitir_tardias, publicado: task.publicado,
            } : {
                titulo: form.elements.titulo.value.trim(), instrucciones: form.elements.instrucciones.value.trim(),
                leccion_id: form.elements.leccion_id.value ? Number(form.elements.leccion_id.value) : null,
                modulo_id: form.elements.modulo_id.value ? Number(form.elements.modulo_id.value) : null,
                nota_minima: Number(form.elements.nota_minima.value),
                rubrica: Array.from(container.children).map((row) => ({
                    titulo: row.querySelector('[name="criterio_titulo"]').value.trim(),
                    descripcion: row.querySelector('[name="criterio_descripcion"]').value.trim(),
                    peso: Number(row.querySelector('[name="criterio_peso"]').value),
                })),
                extensiones: Array.from(form.querySelectorAll('[name="extensiones"]:checked')).map((input) => input.value),
                permitir_tardias: form.elements.permitir_tardias.checked, publicado: form.elements.publicado.checked,
            };
            data.fecha_limite = deadline ? new Date(deadline).toISOString() : null;
            button.disabled = true;
            message.textContent = 'Guardando tarea…';
            try {
                const result = task ? await API().updateSchoolAssignment(task.id, data) : await API().createSchoolAssignment(courseId, data);
                C().showWebNotice('Tarea guardada', result.publicado ? 'La tarea está disponible para los alumnos del curso.' : 'El borrador solo es visible para el docente.', 'success');
                await reload(result.id);
            } catch (error) {
                message.textContent = error.message;
                button.disabled = false;
            }
        });
    }

    function submissionCard(submission, task, teacher, latest) {
        const canReview = teacher && latest && submission.estado === 'entregada';
        return `<section class="section" id="submission-${submission.id}">
            <h3>${teacher ? esc(submission.alumno_nombre) + ' · ' : ''}Entrega ${submission.version}</h3>
            <p>${esc(dateLabel(submission.entregado_en))} · ${submission.tardia ? 'Entrega tardía' : 'Dentro del plazo'} · ${esc(statusNames[submission.estado])}</p>
            ${paragraphs(submission.texto)}
            ${submission.archivos.map((file) => `<p><button type="button" class="btn btn--out btn--sm" data-download-submission="${submission.id}" data-download-attachment="${file.id}" data-file-name="${esc(file.nombre)}">Descargar ${esc(file.nombre)} (${Math.ceil(file.tamano_bytes / 1024)} KB)</button></p>`).join('')}
            ${submission.retroalimentacion ? `<h4>Devolución docente</h4>${paragraphs(submission.retroalimentacion)}` : ''}
            ${submission.calificacion != null ? `<p><strong>Calificación: ${Number(submission.calificacion).toFixed(2)} / 10</strong> · ${submission.calificacion >= task.nota_minima ? 'Aprobada' : 'No aprobada'}</p>` : ''}
            ${submission.criterios.length ? `<ul>${task.rubrica.map((criterion, index) => `<li>${esc(criterion.titulo)}: ${submission.criterios[index]} / 10 (${criterion.peso}%)</li>`).join('')}</ul>` : ''}
            ${canReview ? `<form data-review-submission="${submission.id}">
                <label class="fl">Devolución para el alumno<textarea class="fi" name="retroalimentacion" rows="4" minlength="3" maxlength="12000" required></textarea></label>
                <label class="fl">Resultado<select class="fi" name="estado"><option value="revisada">Calificar entrega</option><option value="cambios_solicitados">Solicitar corrección</option></select></label>
                <fieldset data-grade-fields><legend>Calificación</legend>
                ${task.rubrica.length ? task.rubrica.map((criterion, index) => `<label class="fl">${esc(criterion.titulo)} (${criterion.peso}%)<input class="fi" type="number" data-criterion-score="${index}" min="0" max="10" step="0.1" required></label>`).join('') : '<label class="fl">Nota (0 a 10)<input class="fi" name="calificacion" type="number" min="0" max="10" step="0.1" required></label>'}
                </fieldset><button type="submit" class="btn btn--pri">Guardar revisión</button><p role="status" data-review-message></p>
            </form>` : ''}
        </section>`;
    }

    function bindSubmissionActions(task, teacher, reload, root = document) {
        const studentForm = root.querySelector('#school-submission-form');
        if (studentForm) studentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = studentForm.querySelector('[type="submit"]');
            const message = document.getElementById('school-submission-message');
            const text = studentForm.elements.texto.value.trim();
            const files = Array.from(studentForm.elements.archivos.files);
            if (!text && !files.length) { message.textContent = 'Escribe tu respuesta o adjunta un archivo.'; return; }
            if (files.length > 10 || files.some((file) => file.size > 10 * 1024 * 1024) || files.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) {
                message.textContent = 'Adjunta hasta diez archivos, de hasta 10 MB cada uno y 20 MB en total.';
                return;
            }
            button.disabled = true;
            message.textContent = 'Analizando archivos y guardando entrega…';
            try {
                const submission = await API().submitSchoolAssignment(task.id, text, files);
                C().showWebNotice('Entrega recibida', `La versión ${submission.version} quedó guardada para revisión docente.`, 'success');
                await reload(task.id);
            } catch (error) { message.textContent = error.message; button.disabled = false; }
        });
        root.querySelectorAll('[data-review-submission]').forEach((form) => {
            const fields = form.querySelector('[data-grade-fields]');
            form.elements.estado.addEventListener('change', () => {
                fields.disabled = form.elements.estado.value === 'cambios_solicitados';
                fields.hidden = fields.disabled;
            });
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const button = form.querySelector('[type="submit"]');
                const message = form.querySelector('[data-review-message]');
                const data = { estado: form.elements.estado.value, retroalimentacion: form.elements.retroalimentacion.value.trim(), criterios: [] };
                if (data.estado === 'revisada') {
                    if (task.rubrica.length) data.criterios = Array.from(form.querySelectorAll('[data-criterion-score]')).map((input) => Number(input.value));
                    else data.calificacion = Number(form.elements.calificacion.value);
                }
                button.disabled = true;
                message.textContent = 'Guardando revisión…';
                try {
                    await API().reviewSchoolSubmission(form.dataset.reviewSubmission, data);
                    C().showWebNotice('Revisión guardada', 'El alumno puede consultar la devolución de esta entrega.', 'success');
                    await reload(task.id);
                } catch (error) { message.textContent = error.message; button.disabled = false; }
            });
        });
        root.querySelectorAll('[data-download-attachment]').forEach((button) => button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                const blob = await API().downloadSchoolAttachment(button.dataset.downloadSubmission, button.dataset.downloadAttachment);
                const temporaryUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = temporaryUrl;
                link.download = button.dataset.fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.setTimeout(() => URL.revokeObjectURL(temporaryUrl), 1000);
            } catch (error) { C().showWebNotice('Archivo no disponible', error.message, 'error'); }
            finally { button.disabled = false; }
        }));
    }

    async function render(params) {
        if (!C().requireAuth()) return;
        const token = ++renderVersion;
        const courseId = Number(params.id);
        const route = '/tareas/curso/' + courseId;
        const isCurrent = () => token === renderVersion && window.EducatIA.Router.getPath() === route;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando tareas del curso');
        try {
            const [course, tasks] = await Promise.all([API().getCourse(courseId), API().getSchoolAssignments(courseId)]);
            if (!isCurrent()) return;
            const user = API().getUser();
            const teacher = user.rol === 'admin' || (user.rol === 'maestro' && Number(course.maestro_id) === Number(user.id));
            const taskId = Number(params.taskId || new URLSearchParams(window.location.search).get('tarea'));
            const task = tasks.find((item) => item.id === taskId) || null;
            const editing = teacher && new URLSearchParams(window.location.search).get('editar') === '1';
            const [submissions, lessons, modules] = await Promise.all([
                task ? API().getSchoolSubmissions(task.id) : Promise.resolve([]),
                API().getLessons(courseId),
                API().getModules(courseId),
            ]);
            if (!isCurrent()) return;
            const reload = (selectedId) => {
                if (!isCurrent()) return;
                window.history.replaceState({}, '', url('/tareas/curso/' + courseId + (selectedId ? '?tarea=' + selectedId : '')));
                return render({ id: courseId, taskId: selectedId });
            };
            const courseHref = url(window.EducatIA.Utils.courseUrl(course));
            const latestByStudent = new Map();
            for (const entry of submissions) latestByStudent.set(entry.alumno_id, Math.max(latestByStudent.get(entry.alumno_id) || 0, entry.version));
            const latest = teacher ? null : submissions[0];
            const closed = task?.fecha_limite && new Date(task.fecha_limite) < new Date() && !task.permitir_tardias;
            app.innerHTML = `<div class="page-wrap school-page">
                <div class="page-hd"><a href="${courseHref}" class="edu-inline-link">${esc(course.titulo)}</a><h1>Tareas y proyectos</h1><p>${teacher ? 'Publica actividades y revisa las entregas de tus alumnos.' : 'Consulta las instrucciones, entrega tu trabajo y revisa la devolución docente.'}</p></div>
                <nav class="school-nav" aria-label="Tareas del curso"><a href="${url(teacher ? '/tareas/revision' : '/tareas')}" class="btn btn--out btn--sm">${teacher ? 'Bandeja de revisión' : 'Todas mis tareas'}</a><a href="${url('/tareas/curso/' + courseId)}" class="btn btn--out btn--sm">${teacher ? 'Listado y nueva tarea' : 'Tareas de este curso'}</a></nav>
                ${task ? `<section class="section"><h2>${esc(task.titulo)}</h2><p class="school-meta">${esc(modules.find((module) => module.id === task.modulo_id)?.titulo || 'Actividad del curso')}${task.leccion_id ? ' · ' + esc(lessons.find((lesson) => lesson.id === task.leccion_id)?.titulo || 'Lección relacionada') : ''}</p><p>${esc(dateLabel(task.fecha_limite))} · ${task.permitir_tardias ? 'Acepta entregas tardías' : 'Entrega dentro del plazo'}${teacher && !task.publicado ? ' · Borrador' : ''}</p>${renderInstructions(task.instrucciones)}
                    ${task.rubrica.length ? `<h3>Criterios de revisión</h3><ul>${task.rubrica.map((criterion) => `<li><strong>${esc(criterion.titulo)} (${criterion.peso}%)</strong>: ${esc(criterion.descripcion)}</li>`).join('')}</ul>` : ''}
                    <p>Calificación mínima: ${task.nota_minima} / 10.</p>
                    ${teacher ? `<a href="${url('/tareas/curso/' + courseId + '?tarea=' + task.id + '&editar=1')}" class="btn btn--out btn--sm">Editar tarea</a>` : ''}</section>
                    ${teacher && editing ? editor(task, lessons, submissions.length > 0, modules) : ''}
                    ${!teacher && !closed && latest?.estado !== 'revisada' ? `<section class="section"><h2>${latest ? 'Enviar una nueva versión' : 'Entregar tarea'}</h2><p>Formatos: ${esc(task.extensiones.join(', '))}. Hasta diez archivos; 10 MB por archivo y 20 MB en total. Se conservan tus versiones anteriores. Los documentos Word deben estar en formato .docx, sin macros ni contraseña. Cada archivo pasa por un análisis de seguridad.</p><form id="school-submission-form"><label class="fl" for="submission-text">Respuesta y explicación<textarea class="fi" id="submission-text" name="texto" rows="8" maxlength="20000"></textarea></label><label class="fl" for="submission-files">Archivos<input class="fi" id="submission-files" name="archivos" type="file" accept="${esc(task.extensiones.join(','))}" multiple></label><button class="btn btn--pri" type="submit">Guardar entrega</button><p id="school-submission-message" role="status"></p></form></section>` : ''}
                    ${!teacher && closed ? '<p class="smsg">El plazo terminó. Puedes consultar tus entregas y revisiones anteriores.</p>' : ''}
                    <h2>${teacher ? 'Entregas para revisión' : 'Mis entregas y revisiones'}</h2>
                    ${submissions.length ? submissions.map((entry) => submissionCard(entry, task, teacher, entry.version === latestByStudent.get(entry.alumno_id))).join('') : '<p>Aún no hay entregas.</p>'}` : `
                    <section class="section"><h2>Actividades del curso</h2>${tasks.length ? `<table class="dt"><thead><tr><th>Tarea</th><th>Fecha límite</th>${teacher ? '<th>Publicación</th>' : ''}</tr></thead><tbody>${tasks.map((item) => `<tr><td><a class="edu-inline-link" href="${url('/tareas/curso/' + courseId + '?tarea=' + item.id)}">${esc(item.titulo)}</a><div class="school-meta">${esc(modules.find((module) => module.id === item.modulo_id)?.titulo || 'Actividad del curso')}</div></td><td>${esc(dateLabel(item.fecha_limite))}</td>${teacher ? `<td>${item.publicado ? 'Publicada' : 'Borrador'}</td>` : ''}</tr>`).join('')}</tbody></table>` : '<p>El docente todavía no ha publicado tareas en este curso.</p>'}</section>
                    ${teacher ? editor(null, lessons, false, modules) : ''}`}
            </div>`;
            bindEditor(task, lessons, submissions, courseId, reload);
            if (task) bindSubmissionActions(task, teacher, reload);
        } catch (error) {
            if (isCurrent()) app.innerHTML = `<div class="page-wrap"><div class="smsg smsg--err">${esc(error.message)}</div><a href="${url('/dashboard')}" class="btn btn--out">Volver a mi aprendizaje</a></div>`;
        }
    }

    function taskState(item) {
        if (item.entrega) return statusNames[item.entrega.estado];
        return item.tarea.fecha_limite && new Date(item.tarea.fecha_limite) < new Date() ? 'Sin entregar · plazo vencido' : 'Por entregar';
    }

    async function mountBoard(root, teacher = false) {
        let offset = 0, estado = 'entregada', generation = 0;
        const limit = teacher ? 20 : 30;
        async function load() {
            const current = ++generation;
            root.innerHTML = '<p role="status">Cargando tareas…</p>';
            try {
                const data = await API().getSchoolBoard({ offset, limit, ...(teacher ? { estado } : {}) }, teacher);
                if (current !== generation || !root.isConnected) return;
                root.innerHTML = `<div class="school-toolbar"><div><h2>${teacher ? 'Entregas de alumnos' : 'Mis tareas'}</h2><p>${data.total} ${teacher ? 'entregas en esta vista' : 'actividades publicadas'} · ML, DL y Transformers</p></div>${teacher ? `<label class="fl">Mostrar<select class="fi" data-board-filter><option value="entregada">Pendientes de revisión</option><option value="cambios_solicitados">Corrección solicitada</option><option value="revisada">Calificadas</option><option value="todas">Todas las entregas</option></select></label>` : ''}</div>
                    <div class="school-inbox ${teacher ? 'school-inbox--review' : ''}"><div class="school-task-list">${data.items.length ? data.items.map((item, index) => `<article class="school-task-card"><div class="school-meta">${esc(item.curso_titulo)}${item.modulo_titulo ? ' · ' + esc(item.modulo_titulo) : ''}</div><h3>${esc(item.tarea.titulo)}</h3>${item.leccion_titulo ? `<p class="school-lesson">${esc(item.leccion_titulo)}</p>` : ''}${teacher ? `<p><strong>${esc(item.entrega.alumno_nombre)}</strong> · Versión ${item.entrega.version}</p>` : ''}<p class="school-state">${esc(taskState(item))}${item.entrega?.calificacion != null ? ` · ${Number(item.entrega.calificacion).toFixed(2)} / 10` : ''}</p><p class="school-meta">${esc(dateLabel(teacher ? item.entrega.entregado_en : item.tarea.fecha_limite))}</p>${teacher ? `<button type="button" class="btn btn--pri btn--sm" data-open-review="${index}">${item.entrega.estado === 'entregada' ? 'Revisar entrega' : 'Ver revisión'}</button>` : `<a class="btn btn--out btn--sm" href="${url('/tareas/curso/' + item.tarea.curso_id + '?tarea=' + item.tarea.id)}">${item.entrega ? 'Ver entrega y comentarios' : 'Abrir tarea'}</a>`}</article>`).join('') : '<div class="school-empty"><h3>No hay tareas en esta vista</h3><p>' + (teacher ? 'Las nuevas entregas aparecerán aquí para su revisión.' : 'Las actividades publicadas de tus cursos con acceso vigente aparecerán aquí.') + '</p></div>'}</div>${teacher ? '<section class="school-review" aria-label="Revisión de entrega"><p>Selecciona un trabajo para consultar sus archivos y calificarlo aquí.</p></section>' : ''}</div>
                    <nav class="school-pagination" aria-label="Páginas de tareas"><button class="btn btn--out btn--sm" data-page-prev ${offset === 0 ? 'disabled' : ''}>Anterior</button><span>${data.total ? offset + 1 : 0}–${Math.min(offset + limit, data.total)} de ${data.total}</span><button class="btn btn--out btn--sm" data-page-next ${offset + limit >= data.total ? 'disabled' : ''}>Siguiente</button></nav>`;
                const filter = root.querySelector('[data-board-filter]');
                if (filter) { filter.value = estado; filter.onchange = () => { estado = filter.value; offset = 0; load(); }; }
                root.querySelector('[data-page-prev]').onclick = () => { offset = Math.max(0, offset - limit); load(); };
                root.querySelector('[data-page-next]').onclick = () => { offset += limit; load(); };
                root.querySelectorAll('[data-open-review]').forEach((button) => button.onclick = () => {
                    const item = data.items[Number(button.dataset.openReview)];
                    const panel = root.querySelector('.school-review');
                    root.querySelectorAll('.school-task-card').forEach((card) => card.classList.remove('is-selected'));
                    button.closest('article').classList.add('is-selected');
                    panel.innerHTML = `<h2 tabindex="-1">${esc(item.tarea.titulo)}</h2><p class="school-meta">${esc(item.curso_titulo)}</p><details><summary>Instrucciones y criterios</summary>${renderInstructions(item.tarea.instrucciones)}${item.tarea.rubrica.map((criterion) => `<p><strong>${esc(criterion.titulo)} (${criterion.peso}%)</strong><br>${esc(criterion.descripcion)}</p>`).join('')}</details>${submissionCard(item.entrega, item.tarea, true, true)}`;
                    bindSubmissionActions(item.tarea, true, load, panel);
                    panel.querySelector('h2').focus({ preventScroll: true });
                    if (window.innerWidth < 900) panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
                });
            } catch (error) {
                if (current !== generation || !root.isConnected) return;
                root.innerHTML = `<p class="smsg smsg--err" role="alert">${esc(error.message)}</p><button class="btn btn--out" data-board-retry>Reintentar</button>`;
                root.querySelector('[data-board-retry]').onclick = load;
            }
        }
        await load();
    }

    async function renderBoard(teacher = false) {
        if (!C().requireAuth()) return;
        ++renderVersion;
        const user = API().getUser();
        const app = document.getElementById('app');
        if (teacher && !['admin', 'maestro'].includes(user?.rol)) {
            app.innerHTML = '<div class="page-wrap"><p>No tienes acceso a la revisión docente.</p></div>'; return;
        }
        if (!teacher && ['admin', 'maestro'].includes(user?.rol)) return renderBoard(true);
        app.innerHTML = `<main class="page-wrap school-page"><header class="page-hd"><a class="edu-inline-link" href="${url('/dashboard')}">Mi aprendizaje</a><h1>${teacher ? 'Revisión de tareas' : 'Tareas y proyectos'}</h1><p>${teacher ? 'Revisa archivos, devuelve comentarios y registra la calificación de cada alumno.' : 'Consulta lo que debes entregar, conserva tus versiones y sigue las observaciones de tu docente.'}</p></header><div data-school-board></div></main>`;
        await mountBoard(app.querySelector('[data-school-board]'), teacher);
    }

    return { render, renderInstructions, renderBoard, mountBoard };
})();
