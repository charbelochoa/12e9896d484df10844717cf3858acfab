/* ================================================================
   educatIA — Info Pages (dedicated footer-link pages)
   /info/:topic  →  privacidad, terminos, cookies, legal,
                     proyecto, oferta, vinculacion, ayuda, accesibilidad
   Contenido estático y profesional (sin datos de usuario).
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Info = (function () {
    var esc = function (v) { return window.EducatIA.Utils.escapeHtml(String(v || '')); };

    var LEGAL_VERSION = '2026-07-27';
    var UPDATED = '27 de julio de 2026 · versión ' + LEGAL_VERSION;
    var MAIL_SOPORTE = 'soporte@educatia.test';
    var MAIL_PRIVACIDAD = 'privacidad@educatia.test';
    var MAIL_LEGAL = 'legal@educatia.test';
    var MAIL_VINCULACION = 'vinculacion@educatia.test';

    var pages = {
        'formacion-ia': {
            updated: '6 de octubre de 2026',
            title: 'Formación en inteligencia artificial',
            lead: 'Cuatro programas en desarrollo para aprender fundamentos, implementar modelos y construir sistemas de IA.',
            body: `
                <p>Estamos preparando estos cursos con contenido propio, referencias académicas, prácticas y evaluaciones. Las inscripciones todavía no están abiertas.</p>
                <h2>AI Engineer</h2>
                <p>Una formación aplicada que conecta programación, datos, fundamentos de modelos, evaluación y despliegue. El objetivo es construir sistemas de inteligencia artificial y justificar sus decisiones técnicas.</p>
                <p>El recorrido propuesto incluye Python y Git, matemáticas para IA, preparación de datos, machine learning, redes neuronales, modelos preentrenados, recuperación de información, APIs, pruebas, monitoreo y un proyecto de ingeniería.</p>
                <h2>Machine Learning For AI</h2>
                <p>Un curso independiente de aprendizaje automático: regresión, clasificación, regularización, métodos de kernel, árboles, ensembles, clustering, reducción de dimensionalidad y evaluación experimental.</p>
                <p>Requisitos previstos: Python, NumPy, álgebra lineal, cálculo y probabilidad. El proyecto deberá comparar modelos con particiones correctas y resultados reproducibles.</p>
                <h2>Deep Learning For AI</h2>
                <p>Un curso independiente sobre tensores, diferenciación automática, backpropagation, optimización, redes convolucionales, representaciones, secuencias y atención.</p>
                <p>Requisitos previstos: fundamentos de machine learning y operaciones con tensores. Las prácticas incluirán implementación, diagnóstico del entrenamiento y análisis de errores.</p>
                <h2>Transformers and Multi-Modal Models</h2>
                <p>Un programa avanzado que combinará recursos en plataforma con clases por Zoom impartidas por el docente de educatIA. Tendrá un precio superior a los cursos autónomos.</p>
                <p>El alcance propuesto incluye atención y transformers, entrenamiento de un modelo pequeño, adaptación de modelos existentes, inferencia eficiente y sistemas que relacionan texto, imagen, audio y video.</p>
                <p>Requisitos previstos: machine learning, deep learning y PyTorch. Calendario, cupo, recursos de cómputo y precio se publicarán antes de abrir inscripciones.</p>
                <h2>Aprendizaje y revisión</h2>
                <p>La nueva oferta contempla explicaciones, código trabajado paso a paso, prácticas, exámenes, proyectos y tareas con archivos para revisión docente. Cada módulo se publicará después de comprobar su contenido y funcionamiento.</p>
                <h2>Referencias académicas</h2>
                <p>La investigación parte de los programas oficiales <a href="https://cs229.stanford.edu/index.html-fall25">CS229</a>, <a href="https://cs231n.stanford.edu/2025/schedule.html">CS231n</a>, <a href="https://web.stanford.edu/class/cs224n/">CS224N</a> y <a href="https://cs336.stanford.edu/spring2025/">CS336</a>. Los cursos de educatIA son independientes y no otorgan acreditación de Stanford.</p>
            `
        },
        privacidad: {
            title: 'Política de Privacidad',
            lead: 'Tu privacidad es prioritaria. Aquí explicamos qué datos tratamos, con qué finalidad y qué control tienes sobre ellos.',
            body: `
                <h2>1. Responsable del tratamiento</h2>
                <p>educatIA es un proyecto educativo independiente responsable del tratamiento de los datos personales que nos proporcionas al usar la plataforma. Para cualquier asunto relacionado con tus datos puedes escribirnos a <a href="mailto:${MAIL_PRIVACIDAD}">${MAIL_PRIVACIDAD}</a>.</p>

                <h2>2. Datos que recopilamos</h2>
                <ul>
                    <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y rol (alumno o maestro).</li>
                    <li><strong>Datos de autenticación:</strong> contraseña cifrada (hash Argon2) o identificador de proveedor OAuth (Google / GitHub) cuando inicias sesión con ellos.</li>
                    <li><strong>Datos académicos:</strong> cursos inscritos, progreso de lecciones, calificaciones de evaluaciones y certificados emitidos.</li>
                    <li><strong>Actividad de aprendizaje:</strong> respuestas, intentos y resultados que generas al usar ejercicios, evaluaciones y simulacros.</li>
                    <li><strong>Datos técnicos mínimos:</strong> registros de acceso para seguridad y prevención de abuso.</li>
                </ul>

                <h2>3. Finalidad del tratamiento</h2>
                <p>Utilizamos tus datos para crear y administrar tu cuenta, ofrecer los cursos, registrar tu progreso, emitir certificados, comunicarnos contigo sobre el servicio y proteger la plataforma frente a usos indebidos. No usamos tus datos para publicidad de terceros.</p>

                <h2>4. Base legal</h2>
                <p>El tratamiento se basa en la ejecución de la relación de servicio que aceptas al registrarte, en tu consentimiento y en nuestro interés legítimo de mantener la seguridad de la plataforma, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México) y normativa aplicable.</p>

                <h2>5. Conservación</h2>
                <p>Conservamos tus datos mientras tu cuenta permanezca activa. Si solicitas la eliminación de tu cuenta, borramos o anonimizamos tus datos personales salvo aquellos que debamos conservar por obligación legal.</p>

                <h2>6. Seguridad</h2>
                <p>Aplicamos cifrado en tránsito (TLS), hashing unidireccional de contraseñas (Argon2), control de acceso por roles, límites de uso y endurecimiento del servidor. Ningún sistema es infalible, pero trabajamos para minimizar riesgos de forma continua.</p>

                <h2>7. Encargados y terceros</h2>
                <p>Para operar empleamos proveedores de infraestructura, alojamiento, base de datos, correo transaccional y procesamiento de pagos. Estos proveedores actúan como encargados bajo acuerdos de confidencialidad y no usan tus datos para fines propios. <strong>No vendemos tus datos personales.</strong></p>

                <h2>8. Tus derechos (ARCO)</h2>
                <p>Puedes ejercer en cualquier momento tus derechos de Acceso, Rectificación, Cancelación y Oposición, así como solicitar la portabilidad o limitación del tratamiento, escribiendo a <a href="mailto:${MAIL_PRIVACIDAD}">${MAIL_PRIVACIDAD}</a>. Atenderemos tu solicitud en un plazo razonable.</p>

                <h2>9. Cambios a esta política</h2>
                <p>Podemos actualizar esta política para reflejar mejoras o cambios legales. Publicaremos la versión vigente en esta página con su fecha de actualización.</p>
            `
        },

        terminos: {
            title: 'Términos de Uso',
            lead: 'Estas condiciones regulan el acceso y uso de educatIA. Al registrarte, las aceptas en su totalidad.',
            body: `
                <h2>1. Objeto</h2>
                <p>educatIA es una plataforma educativa en línea para preparar el EXANI-I y EXANI-II mediante cursos por materia, práctica, simulacros y laboratorios interactivos.</p>

                <h2>2. Cuentas de usuario</h2>
                <p>Para acceder a la mayoría de funciones debes crear una cuenta con información veraz. Eres responsable de la confidencialidad de tus credenciales y de la actividad realizada desde tu cuenta. Las cuentas docentes y administrativas se crean únicamente mediante procesos internos autorizados.</p>

                <h2>3. Uso aceptable</h2>
                <p>Te comprometes a usar la plataforma con fines educativos y a no:</p>
                <ul>
                    <li>Redistribuir o comercializar el contenido sin autorización.</li>
                    <li>Suplantar la identidad de otras personas o instituciones.</li>
                    <li>Intentar vulnerar la seguridad, extraer datos masivamente o interferir con el servicio.</li>
                    <li>Usar las herramientas de la plataforma para generar, distribuir o facilitar contenido ilícito o fraudulento.</li>
                </ul>

                <h2>4. Contenido de maestros</h2>
                <p>El contenido publicado por los maestros permanece bajo su autoría. Al publicarlo, otorgan a educatIA una licencia no exclusiva para alojarlo y mostrarlo dentro de la plataforma. Los maestros son responsables de contar con los derechos sobre el material que suben.</p>

                <h2>5. Suscripciones y pagos</h2>
                <p>Algunas funciones pueden requerir una suscripción premium. Los precios se muestran antes de la compra y los cobros se procesan mediante un proveedor de pagos seguro. Las condiciones de cancelación y reembolso se indican en el momento de la contratación.</p>

                <h2>6. Propiedad intelectual</h2>
                <p>La marca, el diseño y el software de educatIA están protegidos. No se concede ningún derecho sobre ellos más allá del uso normal de la plataforma.</p>

                <h2>7. Suspensión</h2>
                <p>Podemos suspender o cancelar cuentas que incumplan estos términos o que pongan en riesgo a la comunidad o al servicio.</p>

                <h2>8. Limitación de responsabilidad</h2>
                <p>La plataforma se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida ni que el contenido aportado por terceros sea exacto en todos los casos. Verifica siempre la información crítica.</p>

                <h2>9. Modificaciones y ley aplicable</h2>
                <p>Podemos actualizar estos términos; la versión vigente estará siempre disponible en esta página. Cualquier controversia se regirá por las leyes aplicables en el Estado de México, México.</p>
            `
        },

        cookies: {
            title: 'Política de Cookies',
            lead: 'educatIA prioriza una experiencia ligera y respetuosa: no usamos cookies de marketing ni rastreo de terceros.',
            body: `
                <h2>¿Qué tecnologías usamos?</h2>
                <p>En lugar de cookies de seguimiento, educatIA utiliza cookies estrictamente necesarias, seguras y HttpOnly para mantener tu sesión.</p>

                <h2>Almacenamiento estrictamente necesario</h2>
                <ul>
                    <li><strong>Cookie de sesión:</strong> HttpOnly y Secure, mantiene tu sesión activa sin exponer el token a JavaScript.</li>
                    <li><strong>Cookie de actualización de sesión:</strong> cookie <em>HttpOnly</em> y segura usada solo para renovar tu sesión sin volver a iniciar sesión.</li>
                    <li><strong>Preferencias:</strong> búsquedas recientes y ajustes de interfaz guardados localmente en tu dispositivo.</li>
                </ul>

                <h2>Lo que NO usamos</h2>
                <p>No empleamos cookies publicitarias, píxeles de seguimiento ni perfiles de comportamiento con fines comerciales.</p>

                <h2>Cómo gestionarlas</h2>
                <p>Puedes borrar este almacenamiento cerrando sesión o limpiando los datos del sitio desde la configuración de tu navegador. Ten en cuenta que eliminar el almacenamiento necesario cerrará tu sesión.</p>
            `
        },

        legal: {
            title: 'Aviso Legal',
            lead: 'Información legal sobre la titularidad y las condiciones generales de educatIA.',
            body: `
                <h2>Titularidad</h2>
                <p>educatIA es un proyecto educativo independiente. No representa ni está afiliado a ninguna institución salvo que se indique expresamente y por escrito.</p>

                <h2>Objeto del sitio</h2>
                <p>El sitio tiene una finalidad educativa: ofrecer cursos, práctica, simulacros, laboratorios y acompañamiento para preparar exámenes de admisión.</p>

                <h2>Propiedad intelectual</h2>
                <p>Los contenidos, la marca, los logotipos y el software están protegidos por la legislación de propiedad intelectual. Su reproducción o distribución no autorizada queda prohibida.</p>

                <h2>Exención de responsabilidad</h2>
                <p>educatIA no se hace responsable del uso que los usuarios hagan del contenido ni de las decisiones tomadas con base en él. El material publicado por terceros es responsabilidad de sus autores.</p>

                <h2>Enlaces externos</h2>
                <p>El sitio puede contener enlaces a páginas de terceros. No controlamos ni respondemos por su contenido o políticas.</p>

                <h2>Jurisdicción</h2>
                <p>Este aviso se rige por las leyes aplicables en el Estado de México, México. Para consultas legales escribe a <a href="mailto:${MAIL_LEGAL}">${MAIL_LEGAL}</a>.</p>
            `
        },

        proyecto: {
            title: 'Proyecto educatIA',
            lead: 'Preparación clara y medible para el EXANI-I y EXANI-II.',
            body: `
                <h2>Qué es educatIA</h2>
                <p>educatIA es una plataforma mexicana de preparación académica para estudiantes que presentarán el EXANI-I o EXANI-II. Integra cursos por materia, diagnóstico, práctica, simulacros y laboratorios interactivos.</p>

                <h2>Misión</h2>
                <p>Ayudar a cada estudiante a preparar su examen de admisión con una ruta clara, práctica constante y retroalimentación que convierta los errores en decisiones de estudio.</p>

                <h2>Visión</h2>
                <p>Ser una referencia de preparación para exámenes de admisión en México, con experiencias accesibles, rigurosas y centradas en el progreso real del alumno.</p>

                <h2>Cómo funciona la preparación</h2>
                <ul>
                    <li><strong>Cursos por materia:</strong> lecciones organizadas según las áreas del examen.</li>
                    <li><strong>Diagnóstico inicial:</strong> identifica fortalezas y temas que requieren refuerzo.</li>
                    <li><strong>Simulacros y práctica:</strong> sesiones con reactivos, tiempo y resultados.</li>
                    <li><strong>Laboratorio de aprendizaje:</strong> simuladores HTML5 interactivos de Física.</li>
                    <li><strong>Evaluación continua:</strong> formularios por clase, práctica por habilidad y seguimiento del progreso.</li>
                </ul>

                <h2>Para quién es</h2>
                <p>Para aspirantes a preparatoria y universidad que buscan una preparación estructurada para el EXANI-I o EXANI-II.</p>

                <h2>Independencia</h2>
                <p>educatIA es una plataforma independiente. No representa a CENEVAL ni garantiza la admisión a una institución; ofrece recursos educativos para apoyar la preparación del estudiante.</p>
            `
        },

        oferta: {
            title: 'Oferta Académica',
            lead: 'Cursos, simulacros y laboratorios para preparar el EXANI-I y EXANI-II.',
            body: `
                <h2>Programas de preparación</h2>
                <ul>
                    <li><strong>EXANI-I:</strong> preparación para ingreso a educación media superior.</li>
                    <li><strong>EXANI-II:</strong> preparación para ingreso a educación superior.</li>
                </ul>

                <h2>Materias y áreas</h2>
                <p>La oferta incluye pensamiento matemático, comprensión lectora, redacción indirecta, aritmética, cálculo, probabilidad, Física, Química, Biología, ciencias sociales, humanidades, salud y módulos específicos.</p>

                <h2>Práctica y evaluación</h2>
                <p>Los estudiantes pueden realizar diagnósticos, prácticas por tema y simulacros con tiempo para revisar resultados y decidir qué estudiar después.</p>

                <h2>Laboratorio de aprendizaje</h2>
                <p>Los simuladores HTML5 de Física permiten observar variables, resultados y relaciones conceptuales en experiencias interactivas de pantalla completa.</p>

                <h2>Aprendizaje con seguimiento</h2>
                <p>Las evaluaciones por clase, la práctica y los simulacros permiten identificar errores recurrentes y reforzar las habilidades que necesitan mayor atención.</p>
            `
        },

        vinculacion: {
            title: 'Vinculación',
            lead: 'Colaboramos con docentes e instituciones para fortalecer la preparación académica.',
            body: `
                <h2>Qué buscamos</h2>
                <p>educatIA busca colaborar con docentes, instituciones educativas y comunidades que quieran mejorar contenidos, ejercicios y estrategias de preparación para exámenes de admisión.</p>

                <h2>Modalidades de colaboración</h2>
                <ul>
                    <li>Revisión académica de temarios y reactivos.</li>
                    <li>Creación de cursos y materiales por materia.</li>
                    <li>Diseño de simulacros y prácticas guiadas.</li>
                    <li>Desarrollo de recursos educativos abiertos.</li>
                    <li>Programas de orientación y acompañamiento estudiantil.</li>
                </ul>

                <h2>Proceso</h2>
                <p>Escríbenos con tu propuesta, revisamos su pertinencia académica y definimos un plan de colaboración con objetivos, responsabilidades y criterios de calidad claros.</p>

                <h2>Contacto</h2>
                <p>Para explorar oportunidades de vinculación escribe a <a href="mailto:${MAIL_VINCULACION}">${MAIL_VINCULACION}</a>.</p>
            `
        },

        ayuda: {
            title: 'Centro de Ayuda',
            lead: 'Respuestas a las preguntas más frecuentes y canales para contactar al equipo de soporte.',
            body: `
                <h2>Cuenta y acceso</h2>
                <h3>¿Cómo me registro?</h3>
                <p>Selecciona "Crear cuenta" en la página de inicio. El registro público está disponible exclusivamente para alumnos, quienes después pueden elegir un plan.</p>
                <h3>Olvidé mi contraseña</h3>
                <p>Solicita un enlace seguro desde <a href="#/recuperar-contrasena" data-auth-password-reset>recuperar contraseña</a>. El enlace es de un solo uso, expira en 30 minutos y cierra las sesiones anteriores cuando eliges una contraseña nueva.</p>
                <h3>¿Puedo entrar con Google o GitHub?</h3>
                <p>Sí. Desde la pantalla de inicio de sesión puedes usar tu cuenta de Google o GitHub.</p>

                <h2>Cursos y aprendizaje</h2>
                <h3>¿Cómo me inscribo a un curso?</h3>
                <p>Ve al catálogo, abre el curso que te interese y pulsa "Inscribirme". Aparecerá en tu panel de aprendizaje.</p>
                <h3>¿Cómo recibo retroalimentación?</h3>
                <p>Cada evaluación y simulacro muestra resultados y explicaciones para que identifiques qué temas debes reforzar y continúes estudiando a tu ritmo.</p>
                <h3>¿Cómo obtengo un certificado?</h3>
                <p>Completa las lecciones y aprueba las evaluaciones del curso para generar tu certificado digital verificable.</p>

                <h2>Pagos</h2>
                <h3>¿Hay contenido de pago?</h3>
                <p>Gran parte del contenido es gratuito. Algunas funciones premium pueden requerir suscripción; el precio siempre se muestra antes de pagar.</p>

                <h2>Cuentas docentes</h2>
                <h3>¿Cómo se habilita el acceso docente?</h3>
                <p>Las cuentas docentes no admiten registro público. educatIA las crea únicamente mediante un proceso interno autorizado.</p>

                <h2>¿Necesitas más ayuda?</h2>
                <p>Escríbenos a <a href="mailto:${MAIL_SOPORTE}">${MAIL_SOPORTE}</a> y te responderemos lo antes posible.</p>
            `
        },

        accesibilidad: {
            title: 'Accesibilidad',
            lead: 'Trabajamos para que cualquier persona pueda aprender en educatIA, sin barreras.',
            body: `
                <h2>Nuestro compromiso</h2>
                <p>Diseñamos educatIA siguiendo las pautas WCAG 2.1 en nivel AA como objetivo, para ofrecer una experiencia inclusiva y usable.</p>

                <h2>Características de accesibilidad</h2>
                <ul>
                    <li>Navegación completa por teclado y enlace para "saltar al contenido".</li>
                    <li>Etiquetas ARIA en los controles interactivos.</li>
                    <li>Contraste de color conforme al nivel AA.</li>
                    <li>Texto redimensionable sin pérdida de funcionalidad.</li>
                    <li>Estructura semántica HTML5.</li>
                    <li>Respeto a la preferencia "reducir movimiento" del sistema, atenuando animaciones.</li>
                </ul>

                <h2>Contenido basado en texto</h2>
                <p>Al ser una plataforma centrada en texto, el contenido es fácilmente compatible con lectores de pantalla y herramientas de asistencia.</p>

                <h2>Limitaciones conocidas</h2>
                <p>Mejoramos de forma continua. Si una sección no cumple tus necesidades de accesibilidad, queremos saberlo para corregirlo.</p>

                <h2>Reportar una barrera</h2>
                <p>Escríbenos a <a href="mailto:${MAIL_SOPORTE}">${MAIL_SOPORTE}</a> describiendo el problema y, si puedes, el navegador y dispositivo que usas. Tu retroalimentación nos ayuda a mejorar.</p>
            `
        }
    };

    // Product-specific legal notices. The commercial identity fields must be
    // verified by the platform owner before a paid public launch; we do not
    // fabricate a legal name, RFC or fiscal address in a user-facing contract.
    pages.privacidad = {
        title: 'Aviso de Privacidad',
        lead: 'Explica qué datos usa educatIA para operar tu cuenta y tu preparación para EXANI-I o EXANI-II, así como la forma de ejercer tus derechos.',
        body: `
            <h2>1. Responsable y contacto</h2>
            <p>educatIA opera esta plataforma educativa. Para asuntos de privacidad escribe a <a href="mailto:${MAIL_PRIVACIDAD}">${MAIL_PRIVACIDAD}</a>. La denominación fiscal, RFC y domicilio del responsable se mostrarán en el comprobante de contratación y en este aviso antes de cualquier lanzamiento comercial definitivo.</p>
            <h2>2. Datos y finalidades</h2>
            <p>Tratamos nombre, correo, credenciales protegidas, progreso, respuestas de práctica, resultados, preferencias de estudio y datos técnicos mínimos de seguridad. Los usamos para crear tu cuenta, prestar los cursos y simulacros, personalizar la ruta, gestionar pagos, prevenir fraude, atender soporte y cumplir obligaciones legales.</p>
            <h2>3. Decisiones y herramientas de apoyo</h2>
            <p>Los resultados y recomendaciones de estudio son orientativos; no sustituyen al profesorado, asesoría profesional ni decisiones de admisión. No usamos tus datos para publicidad de terceros ni vendemos información personal.</p>
            <h2>4. Encargados y transferencias</h2>
            <p>Podemos utilizar proveedores de alojamiento, procesamiento de pagos y servicios tecnológicos para operar la plataforma. Solo reciben la información necesaria bajo instrucciones y medidas de confidencialidad. Si una transferencia requiere consentimiento conforme a la ley, lo solicitaremos previamente.</p>
            <h2>5. Derechos y solicitudes</h2>
            <p>Puedes solicitar acceso, rectificación, cancelación u oposición, así como revocar consentimiento cuando proceda, enviando tu nombre, medio de respuesta, derecho solicitado y documentos de identidad necesarios a <a href="mailto:${MAIL_PRIVACIDAD}">${MAIL_PRIVACIDAD}</a>. Atenderemos el trámite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
            <h2>6. Conservación y cambios</h2>
            <p>Conservamos los datos mientras la cuenta o relación de servicio esté activa y durante los plazos exigidos por ley. Las actualizaciones relevantes de este aviso se publicarán aquí con una nueva versión y fecha.</p>
        `
    };

    pages.terminos = {
        title: 'Términos de Uso y Contratación',
        lead: 'Contrato de acceso a educatIA para preparación académica, cursos, práctica y simulacros EXANI-I y EXANI-II.',
        body: `
            <h2>1. Aceptación y objeto</h2>
            <p>Al marcar la casilla de aceptación, crear una cuenta o contratar un plan, aceptas estos Términos y el Aviso de Privacidad, versión <strong>${LEGAL_VERSION}</strong>. educatIA ofrece recursos de preparación para EXANI-I y EXANI-II; no garantiza un puntaje, admisión ni resultado específico.</p>
            <h2>2. Cuenta y uso permitido</h2>
            <p>Debes proporcionar información veraz, proteger tus credenciales y usar la cuenta personalmente. Está prohibido compartir acceso de pago, copiar o redistribuir contenido, automatizar extracción de datos, vulnerar la seguridad, suplantar identidad o usar los servicios para fines ilícitos.</p>
            <h2>3. Planes, precio y pagos</h2>
            <p>El precio, moneda, vigencia, funcionalidades incluidas y cargos recurrentes, si aplican, se muestran antes de confirmar el pago. Los pagos se procesan mediante el proveedor indicado en checkout. La cancelación, reembolsos y renovación se informan antes de la contratación y se rigen por las disposiciones de protección al consumidor aplicables.</p>
            <h2>4. Prueba gratuita y renovación</h2>
            <p>Cuando el checkout indique que tu cuenta es elegible, la primera suscripción incluye siete días sin cargo. Es obligatorio registrar una tarjeta válida con Stripe para iniciar la prueba. Al concluir los siete días, la suscripción se renueva automáticamente y Stripe cobra el precio y la periodicidad del plan elegido, salvo que canceles antes del cobro desde el portal seguro de Stripe. La cancelación puede solicitarse en cualquier momento y no genera cargos posteriores a la fecha efectiva indicada por Stripe.</p>
            <h2>5. Promoción de lanzamiento mensual</h2>
            <p>Cuando el plan mensual y el checkout muestren la promoción activa, el proceso comienza con los siete días de prueba y requiere una tarjeta. Si no cancelas antes, Stripe cobra el primer mes. Si ese primer cobro es aprobado mientras todavía existe cupo entre las primeras cien compras confirmadas, las siguientes seis mensualidades se aplican sin cargo. Después, la suscripción vuelve a renovarse mensualmente al precio vigente hasta que la canceles. Abrir el checkout no reserva un lugar. Puedes cancelar cuando quieras; al cancelar pierdes cualquier mensualidad promocional futura que aún no se haya aplicado.</p>
            <h2>6. Contenido y propiedad intelectual</h2>
            <p>educatIA, sus textos, diseño, software, evaluaciones y materiales conservan los derechos que les correspondan. Se concede una licencia limitada, personal, revocable y no transferible para estudiar dentro de la plataforma. Los recursos de terceros conservan sus avisos y atribuciones originales.</p>
            <h2>7. Disponibilidad y limitaciones</h2>
            <p>Procuramos disponibilidad razonable, pero pueden existir mantenimientos, cambios o interrupciones. El material es educativo y debe contrastarse con las convocatorias y fuentes oficiales vigentes del examen.</p>
            <h2>8. Suspensión y cambios</h2>
            <p>Podemos suspender una cuenta por incumplimiento, fraude, riesgo de seguridad o mandato legal. Si modificamos términos que afecten materialmente una contratación vigente, lo comunicaremos antes de que entren en vigor cuando sea exigible.</p>
            <h2>8. Atención y ley aplicable</h2>
            <p>Para soporte escribe a <a href="mailto:${MAIL_SOPORTE}">${MAIL_SOPORTE}</a>; para temas legales, a <a href="mailto:${MAIL_LEGAL}">${MAIL_LEGAL}</a>. Estos términos se interpretan conforme a la legislación mexicana aplicable y sin perjuicio de los derechos irrenunciables de las personas consumidoras.</p>
        `
    };

    pages.cookies = {
        title: 'Cookies y almacenamiento',
        lead: 'Usamos tecnología necesaria para mantener tu sesión y recordar ajustes esenciales; no vendemos ni usamos datos para publicidad de terceros.',
        body: `
            <h2>1. Cookies necesarias</h2>
            <p>Usamos cookies seguras, HttpOnly y con el atributo SameSite para autenticar la sesión, renovarla de forma segura y prevenir uso indebido. Sin ellas no es posible mantener el acceso a cursos protegidos.</p>
            <h2>2. Almacenamiento local</h2>
            <p>El navegador puede guardar preferencias no sensibles, como opciones de accesibilidad, navegación y el estado de la interfaz. Puedes eliminarlas desde la configuración del navegador; hacerlo puede restablecer dichas preferencias.</p>
            <h2>3. Lo que no hacemos</h2>
            <p>No instalamos cookies de marketing de terceros ni vendemos perfiles de navegación. Si se incorpora una tecnología no necesaria, se actualizará esta política y se solicitará el consentimiento que corresponda.</p>
            <h2>4. Gestión</h2>
            <p>Puedes bloquear o borrar cookies desde tu navegador; algunas funciones, incluido mantener la sesión activa, dejarán de operar correctamente.</p>
        `
    };

    pages.legal = {
        title: 'Aviso Legal',
        lead: 'Información sobre el alcance educativo, propiedad intelectual, contacto y contratación de educatIA.',
        body: `
            <h2>1. Finalidad del sitio</h2>
            <p>educatIA es una plataforma de preparación académica para EXANI-I y EXANI-II con cursos, práctica, simulacros, herramientas de estudio y laboratorio de aprendizaje.</p>
            <h2>2. Titularidad y contacto</h2>
            <p>La identidad fiscal del proveedor, RFC y domicilio de atención deben mostrarse en la contratación y comprobante aplicables. Contacto general: <a href="mailto:${MAIL_SOPORTE}">${MAIL_SOPORTE}</a>; asuntos legales: <a href="mailto:${MAIL_LEGAL}">${MAIL_LEGAL}</a>.</p>
            <h2>3. Marcas y contenidos de terceros</h2>
            <p>Las marcas y materiales de terceros pertenecen a sus respectivos titulares. Cuando se integran recursos con licencia abierta, se mantienen los avisos de autoría, licencia y atribución exigidos. La apariencia de la plataforma no transfiere propiedad sobre esos materiales.</p>
            <h2>4. Avisos y cumplimiento</h2>
            <p>Este aviso se complementa con los Términos, el Aviso de Privacidad y la política de Cookies. Las personas consumidoras conservan los derechos que les otorga la legislación mexicana aplicable.</p>
        `
    };

    function render(params) {
        var topic = params && params.topic ? params.topic : '';
        if (topic === 'formacion-ia') return window.EducatIA.ProgramCatalog.render();
        var page = pages[topic];
        var app = document.getElementById('app');

        if (!page) {
            app.innerHTML = '<div class="info-page"><div class="info-page__breadcrumb"><a href="#/">Inicio</a> / No encontrada</div><h1>Página no encontrada</h1><p>La sección solicitada no existe. <a href="#/">Volver al inicio</a>.</p></div>';
            return;
        }

        app.innerHTML =
            '<div class="info-page">' +
                '<div class="info-page__breadcrumb"><a href="#/">Inicio</a> / ' + esc(page.title) + '</div>' +
                '<h1>' + esc(page.title) + '</h1>' +
                (page.lead ? '<p class="info-page__lead">' + esc(page.lead) + '</p>' : '') +
                '<p class="info-page__updated">Última actualización: ' + esc(page.updated || UPDATED) + '</p>' +
                '<div class="info-page__body">' + page.body + '</div>' +
                '<div class="info-page__cta">' +
                    '<a href="#/" class="btn--blue">Volver al inicio</a>' +
                    '<a href="#/explorar" class="btn--blue" style="background:#333">Explorar cursos</a>' +
                '</div>' +
            '</div>';
    }

    return { render: render };
})();
