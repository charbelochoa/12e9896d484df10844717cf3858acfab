/* ================================================================
   educatIA - Explorar EXANI-II
   Catalog of disciplinary modules and official-aligned topics.
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.ExaniModules = [
    {
        id: 'administracion',
        title: 'Administración',
        group: 'Sociales',
        type: 'Módulo disciplinar',
        accent: 'blue',
        summary: 'Bases para entender empresas, emprendimiento, funciones administrativas y control organizacional.',
        subareas: [
            {
                title: 'Fundamentos de la administración',
                topics: [
                    'Escuelas y teorías administrativas: clásica, científica, humanista y contemporánea.',
                    'Clasificación de empresas por función, tamaño y capital.',
                    'Funciones de producción, mercadotecnia, finanzas y recursos humanos.',
                    'Tipos de empresa: pública, privada y mixta.',
                    'Características del emprendedor y elementos del plan de negocios.'
                ]
            },
            {
                title: 'Proceso administrativo',
                topics: [
                    'Planeación, organización, dirección y control.',
                    'Organigramas, manuales y estructura organizacional.',
                    'Objetivos, toma de decisiones y estilos de liderazgo.',
                    'Controles, auditoría y seguimiento de resultados.'
                ]
            }
        ]
    },
    {
        id: 'aritmetica',
        title: 'Aritmética',
        group: 'Matemáticas',
        type: 'Módulo disciplinar',
        accent: 'violet',
        summary: 'Operaciones, proporcionalidad y problemas numéricos frecuentes en el examen.',
        subareas: [
            {
                title: 'Principios de números reales',
                topics: [
                    'Leyes de signos y exponentes.',
                    'Operaciones con enteros, fraccionarios y decimales.',
                    'Factorización, divisibilidad, números primos, mínimo común múltiplo y máximo común divisor.',
                    'Notación científica.'
                ]
            },
            {
                title: 'Problemas con números racionales',
                topics: [
                    'Razón, proporción, porcentaje y reparto proporcional.',
                    'Progresiones aritméticas y geométricas.',
                    'Interés simple y regla de tres.',
                    'Relación entre fracciones, decimales y porcentajes.'
                ]
            }
        ]
    },
    {
        id: 'biologia',
        title: 'Biología',
        group: 'Experimentales',
        type: 'Módulo disciplinar',
        accent: 'green',
        summary: 'Célula, genética, biodiversidad, evolución y relación de organismos con ecosistemas.',
        subareas: [
            {
                title: 'La célula',
                topics: [
                    'Teoría celular, niveles de organización, organelos y funciones.',
                    'ADN y ARN: replicación, transcripción y traducción.',
                    'Respiración, fotosíntesis, ciclo celular y genética molecular.',
                    'Herencia mendeliana y no mendeliana, mutaciones, biotecnología y bioética.'
                ]
            },
            {
                title: 'Biodiversidad',
                topics: [
                    'Técnicas para estudiar diversidad y mecanismos evolutivos.',
                    'Selección natural, deriva genética y especiación.',
                    'Impacto humano, conservación y ecosistemas mexicanos.',
                    'Relaciones interespecíficas, estructura de plantas, animales y hongos.',
                    'Reproducción, adaptaciones y servicios ecosistémicos.'
                ]
            }
        ]
    },
    {
        id: 'calculo',
        title: 'Cálculo diferencial e integral',
        group: 'Matemáticas',
        type: 'Módulo disciplinar',
        accent: 'violet',
        summary: 'Límites, derivadas, integrales y aplicaciones en cambio, optimización, áreas y volúmenes.',
        subareas: [
            {
                title: 'Cálculo diferencial',
                topics: [
                    'Propiedades de los límites.',
                    'Límites de funciones polinomiales, racionales, exponenciales y logarítmicas.',
                    'Derivada como razón de cambio y reglas de derivación.',
                    'Derivadas trigonométricas, recta tangente, velocidad instantánea y optimización.'
                ]
            },
            {
                title: 'Cálculo integral',
                topics: [
                    'Propiedades de la integral definida.',
                    'Métodos de integración por sustitución y por partes.',
                    'Integración de funciones trigonométricas y racionales.',
                    'Área bajo la curva, áreas, volúmenes de revolución y teorema fundamental del cálculo.'
                ]
            }
        ]
    },
    {
        id: 'salud',
        title: 'Ciencias de la Salud',
        group: 'Salud',
        type: 'Módulo disciplinar',
        accent: 'teal',
        summary: 'Proceso salud-enfermedad, prevención y morfofisiología del cuerpo humano.',
        subareas: [
            {
                title: 'Estudio del proceso salud-enfermedad',
                topics: [
                    'Terminología de salud, tríada ecológica y cadena epidemiológica.',
                    'Historia natural de la enfermedad, propagación y prevención.',
                    'Trastornos alimentarios, factores de riesgo y programas de vacunación.'
                ]
            },
            {
                title: 'Morfofisiología del cuerpo humano',
                topics: [
                    'Planos anatómicos.',
                    'Sistemas óseo-muscular, tegumentario, endocrino, nervioso, linfático-inmune, cardiovascular, respiratorio, digestivo, urinario y reproductor.',
                    'Homeostasis y control hormonal.'
                ]
            }
        ]
    },
    {
        id: 'derecho',
        title: 'Derecho',
        group: 'Sociales',
        type: 'Módulo disciplinar',
        accent: 'slate',
        summary: 'Normas, fuentes del derecho, derechos humanos y ramas jurídicas fundamentales.',
        subareas: [
            {
                title: 'Nociones de derecho',
                topics: [
                    'Derecho como facultad, ciencia y norma.',
                    'Normas morales, sociales y jurídicas; sanciones.',
                    'Fuentes del derecho: ley, costumbre y jurisprudencia.',
                    'Proceso jurisdiccional, derechos humanos y división de poderes.'
                ]
            },
            {
                title: 'Ramas del derecho',
                topics: [
                    'Civil: personas, familia, bienes y sucesiones.',
                    'Mercantil: sociedades y títulos de crédito.',
                    'Laboral: relaciones de trabajo y sindicatos.',
                    'Penal: elementos del delito, responsabilidad y sanciones.',
                    'Administrativo y constitucional: poder público, Estado y proceso legislativo.'
                ]
            }
        ]
    },
    {
        id: 'economia',
        title: 'Economía',
        group: 'Sociales',
        type: 'Módulo disciplinar',
        accent: 'orange',
        summary: 'Principios económicos, mercados, indicadores macroeconómicos y políticas públicas.',
        subareas: [
            {
                title: 'Principios de economía',
                topics: [
                    'Objeto y ramas de la economía.',
                    'Proceso económico, factores de producción y agentes económicos.',
                    'Sistemas capitalista, socialista y mixto.',
                    'Mercantilismo, fisiocracia, escuela clásica y keynesianismo.'
                ]
            },
            {
                title: 'Microeconomía y macroeconomía',
                topics: [
                    'Oferta, demanda y elasticidad.',
                    'Mercados competitivos e imperfectos.',
                    'Consumidor, productor, PIB, inflación, desempleo y ciclos económicos.',
                    'Políticas fiscal y monetaria, globalización y bloques comerciales.'
                ]
            }
        ]
    },
    {
        id: 'filosofia',
        title: 'Filosofía',
        group: 'Humanidades',
        type: 'Módulo disciplinar',
        accent: 'amber',
        summary: 'Pensamiento filosófico, ética, racionalidad, identidad mexicana y problemas contemporáneos.',
        subareas: [
            {
                title: 'Fundamentos',
                topics: [
                    'Cuestionamientos presocráticos y definición de filosofía.',
                    'Ética, estética, lógica, epistemología y metafísica.',
                    'Aportaciones de Sócrates, Platón y Aristóteles.',
                    'Naturaleza humana, buen vivir, autoconocimiento, cuidado de sí y justicia.'
                ]
            },
            {
                title: 'Quehacer filosófico',
                topics: [
                    'Corrientes en México: positivismo, existencialismo y filosofía de la liberación.',
                    'Discriminación, derechos humanos, bioética, ciencia y tecnología.',
                    'Racionalidad, globalización, identidad mexicana, mitologías prehispánicas, multiculturalismo y nacionalismo.'
                ]
            }
        ]
    },
    {
        id: 'fisica',
        title: 'Física',
        group: 'Experimentales',
        type: 'Módulo disciplinar',
        accent: 'blue',
        summary: 'Mecánica, ondas, óptica, electromagnetismo y aplicaciones tecnológicas.',
        subareas: [
            {
                title: 'Mecánica',
                topics: [
                    'Fuerzas coplanares, equilibrio estático y leyes de Newton.',
                    'Movimiento circular: velocidad angular, frecuencia y aceleración centrípeta.',
                    'Trabajo, energía en rotación, momento angular, impulsos y colisiones.'
                ]
            },
            {
                title: 'Óptica, ondas y electromagnetismo',
                topics: [
                    'Campos magnéticos y fuerzas sobre partículas y conductores.',
                    'Campos por corrientes eléctricas.',
                    'Movimiento armónico simple, clasificación de ondas y propiedades.',
                    'Reflexión, refracción, difracción, interferencia, lentes esféricas y aplicaciones.'
                ]
            }
        ]
    },
    {
        id: 'historia',
        title: 'Historia',
        group: 'Humanidades',
        type: 'Módulo disciplinar',
        accent: 'slate',
        summary: 'Procesos históricos de México y del mundo para explicar cambios sociales y políticos.',
        subareas: [
            {
                title: 'Historia de México',
                topics: [
                    'Poblamiento de América, culturas prehispánicas e instituciones novohispanas.',
                    'Independencia, proyectos del siglo XIX, intervenciones extranjeras, Porfiriato y Revolución.',
                    'Gobiernos posrevolucionarios, desarrollo económico, movimientos sociales de 1968 a 2000 y transición democrática.'
                ]
            },
            {
                title: 'Historia universal',
                topics: [
                    'Imperialismo y colonialismo de 1870 a 1914.',
                    'Primera y Segunda Guerra Mundial.',
                    'Descolonización, Guerra Fría, globalización y neoliberalismo.'
                ]
            }
        ]
    },
    {
        id: 'literatura',
        title: 'Literatura',
        group: 'Humanidades',
        type: 'Módulo disciplinar',
        accent: 'pink',
        summary: 'Corrientes literarias, géneros, elementos narrativos, líricos, dramáticos y ensayísticos.',
        subareas: [
            {
                title: 'Ubicación espacio-temporal',
                topics: [
                    'Literatura griega y romana, Edad Media, Renacimiento y Humanismo.',
                    'Neoclasicismo, Romanticismo, Realismo, Naturalismo y vanguardias.',
                    'Existencialismo, teatro del absurdo, Boom latinoamericano y literatura emergente.'
                ]
            },
            {
                title: 'Generos y elementos estructurales',
                topics: [
                    'Narrativa: inicio, clímax y desenlace.',
                    'Lírica: rima, métrica y figuras retóricas.',
                    'Teatro: acotaciones, acto, cuadro y escena.',
                    'Ensayo: tesis, argumentos y conclusión.'
                ]
            }
        ]
    },
    {
        id: 'matematicas-financieras',
        title: 'Matemáticas financieras',
        group: 'Matemáticas',
        type: 'Módulo disciplinar',
        accent: 'green',
        summary: 'Porcentajes, proporcionalidad, descuentos, interés simple, préstamos y amortizaciones.',
        subareas: [
            {
                title: 'Elementos financieros básicos',
                topics: [
                    'Razón, proporción, porcentajes y descuentos.',
                    'Progresiones aritméticas y geométricas.',
                    'Proporcionalidad directa e inversa.',
                    'Porcentajes aplicados a operaciones comerciales.'
                ]
            },
            {
                title: 'Interés simple',
                topics: [
                    'Capital, tasa, tiempo, interés y monto.',
                    'Fórmulas de interés simple y monto.',
                    'Préstamos, amortizaciones, tablas de amortización y descuentos en créditos.'
                ]
            }
        ]
    },
    {
        id: 'premedicina',
        title: 'Premedicina',
        group: 'Salud',
        type: 'Módulo especial de 48 reactivos',
        accent: 'teal',
        summary: 'Módulo no combinable para aspirantes de salud con anatomía, biología celular, microbiología y bioquímica.',
        subareas: [
            {
                title: 'Subáreas evaluadas',
                topics: [
                    'Salud pública y medicina comunitaria.',
                    'Anatomía y fisiología.',
                    'Biología celular y microbiología.',
                    'Bioquímica y biología molecular.'
                ]
            },
            {
                title: 'Temas principales',
                topics: [
                    'Concepto de salud y enfermedad, tríada ecológica, cadena epidemiológica e historia natural de la enfermedad.',
                    'Prevención, anatomía, sistemas corporales, estructura celular y genética.',
                    'Microbiología de bacterias, virus, hongos y parásitos.',
                    'Transporte de membranas, biomoléculas, glucólisis, ciclo de Krebs, farmacología básica y homeostasis.'
                ]
            }
        ]
    },
    {
        id: 'probabilidad-estadistica',
        title: 'Probabilidad y estadística',
        group: 'Matemáticas',
        type: 'Módulo disciplinar',
        accent: 'violet',
        summary: 'Análisis de datos, medidas estadísticas, conteo y cálculo de probabilidades.',
        subareas: [
            {
                title: 'Estadística',
                topics: [
                    'Población, muestra y variables cualitativas y cuantitativas.',
                    'Tablas de frecuencia absoluta, relativa y acumulada.',
                    'Histogramas, ojivas y polígonos.',
                    'Media, mediana, moda, varianza, desviación estándar, percentiles, deciles y cuartiles.'
                ]
            },
            {
                title: 'Probabilidad',
                topics: [
                    'Teoría de conjuntos, espacio muestral y eventos.',
                    'Permutaciones, combinaciones y técnicas de conteo.',
                    'Axiomas de probabilidad y experimentos simples y compuestos.',
                    'Distribuciones básicas.'
                ]
            }
        ]
    },
    {
        id: 'psicologia',
        title: 'Psicología',
        group: 'Sociales',
        type: 'Módulo disciplinar',
        accent: 'pink',
        summary: 'Conducta, procesos cognitivos, personalidad, escuelas psicológicas y áreas de aplicación.',
        subareas: [
            {
                title: 'Bases biopsicosociales de la conducta',
                topics: [
                    'Sistema nervioso central y periférico, neurotransmisores y hormonas.',
                    'Sensación, percepción, atención, memoria, aprendizaje, lenguaje y pensamiento.',
                    'Motivación, emoción y teorías de la personalidad.'
                ]
            },
            {
                title: 'Aportaciones de la psicología',
                topics: [
                    'Objetivos, método científico, conductismo, psicoanálisis, cognitivismo y humanismo.',
                    'Condicionamiento clásico y operante.',
                    'Freud, Piaget, psicología educativa, organizacional, clínica y social.',
                    'Rol del psicólogo.'
                ]
            }
        ]
    },
    {
        id: 'quimica',
        title: 'Química',
        group: 'Experimentales',
        type: 'Módulo disciplinar',
        accent: 'orange',
        summary: 'Enlaces, soluciones, reacciones, estequiometría, equilibrio y química orgánica.',
        subareas: [
            {
                title: 'Fundamentos generales',
                topics: [
                    'Enlaces iónico, covalente y metálico; electronegatividad.',
                    'Masa molar y concentración de soluciones.',
                    'Balanceo e identificación de reacciones.',
                    'Estequiometría, entalpía, endotermia, exotermia y equilibrio químico.'
                ]
            },
            {
                title: 'Química orgánica',
                topics: [
                    'Hibridación y geometría del carbono.',
                    'Hidrocarburos y nomenclatura IUPAC.',
                    'Alcoholes, aldehídos, cetonas, ácidos carboxílicos, éteres, ésteres y aminas.',
                    'Carbohidratos, aminoácidos, lípidos, enlace glucosídico y enlace peptídico.'
                ]
            }
        ]
    },
    {
        id: 'ciencias-experimentales',
        title: 'Ciencias experimentales',
        group: 'Generales',
        type: 'Módulo general',
        accent: 'green',
        summary: 'Integra química, física y biología para resolver problemas científicos de base.',
        subareas: [
            {
                title: 'Química integrada',
                topics: [
                    'Configuración electrónica, reacciones, estequiometría y macromoléculas.'
                ]
            },
            {
                title: 'Física integrada',
                topics: [
                    'Leyes de Newton, calor, electricidad, magnetismo y ondas.'
                ]
            },
            {
                title: 'Biología integrada',
                topics: [
                    'Estructura celular, sistemas corporales, genética, evolución y biodiversidad.'
                ]
            }
        ]
    },
    {
        id: 'ciencias-sociales',
        title: 'Ciencias sociales',
        group: 'Generales',
        type: 'Módulo general',
        accent: 'blue',
        summary: 'Integra conocimiento social, teorías, instituciones, derechos y fenómenos sociales.',
        subareas: [
            {
                title: 'Construcción del conocimiento',
                topics: [
                    'Tipos de conocimiento, Revolución Científica, Industrial y Francesa.',
                    'Ilustración, racionalismo, empirismo, positivismo y materialismo histórico.'
                ]
            },
            {
                title: 'Fenómenos sociales',
                topics: [
                    'Antropología, política, derecho, economía, geografía, historia, psicología y sociología.',
                    'Socialización, clases, grupos sociales, derechos humanos, discriminación y migración.',
                    'Funciones del Estado mexicano.'
                ]
            }
        ]
    }
];

window.EducatIA.Pages.Explorar = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const toUrl = (path) => window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    const MODULES = window.EducatIA.ExaniModules;
    const GROUPS = ['Todos', 'Matemáticas', 'Experimentales', 'Sociales', 'Humanidades', 'Salud', 'Generales'];

    let backendCourses = [];
    let searchQuery = '';
    let activeGroup = 'Todos';
    let selectedModuleId = 'aritmetica';

    function allTopics(module) {
        return module.subareas.flatMap((subarea) => subarea.topics);
    }

    function topicCount(module) {
        return allTopics(module).length;
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function allSearchableText(module) {
        return normalizeSearchText([
            module.title,
            module.group,
            module.type,
            module.summary,
            ...module.subareas.map((subarea) => subarea.title),
            ...allTopics(module)
        ].join(' '));
    }

    function filteredModules() {
        const query = normalizeSearchText(searchQuery.trim());
        return MODULES.filter((module) => {
            const groupOk = activeGroup === 'Todos' || module.group === activeGroup;
            const queryOk = !query || allSearchableText(module).includes(query);
            return groupOk && queryOk;
        });
    }

    function getSelectedModule(list) {
        return MODULES.find((module) => module.id === selectedModuleId) || list[0] || MODULES[0];
    }

    function isPublished(course) {
        if (!course) return false;
        if (course.publicado === false || course.visible === false) return false;
        const status = String(course.estado || course.status || '').toLowerCase();
        return !['borrador', 'draft', 'archivado', 'archive'].includes(status);
    }

    function courseTitle(course) {
        return course.titulo || course.title || course.nombre || 'Curso educatIA';
    }

    function courseDescription(course) {
        return course.descripcion || course.description || course.resumen || 'Curso publicado dentro de educatIA.';
    }

    function moduleCard(module, selected) {
        return `
            <button type="button" class="exani-module-card exani-module-card--${esc(module.accent)} ${selected ? 'is-selected' : ''}" data-module-id="${esc(module.id)}">
                <span class="exani-module-card__type">${esc(module.type)}</span>
                <h3>${esc(module.title)}</h3>
                <p>${esc(module.summary)}</p>
                <div class="exani-module-card__meta">
                    <span>${module.subareas.length} subáreas</span>
                    <span>${topicCount(module)} temas</span>
                </div>
            </button>
        `;
    }

    function detailPanel(module) {
        return `
            <aside class="exani-detail" id="exani-detail">
                <div class="exani-detail__head">
                    <span class="exani-pill exani-pill--${esc(module.accent)}">${esc(module.group)}</span>
                    <span>${esc(module.type)}</span>
                </div>
                <h2>${esc(module.title)}</h2>
                <p>${esc(module.summary)}</p>
                <div class="exani-detail__numbers">
                    <div><strong>${module.subareas.length}</strong><span>subáreas</span></div>
                    <div><strong>${topicCount(module)}</strong><span>temas guía</span></div>
                </div>
                <div class="exani-subarea-list">
                    ${module.subareas.map((subarea, index) => `
                        <section class="exani-subarea">
                            <div class="exani-subarea__title">
                                <span>${String(index + 1).padStart(2, '0')}</span>
                                <h3>${esc(subarea.title)}</h3>
                            </div>
                            <ul>
                                ${subarea.topics.map((topic) => `<li>${esc(topic)}</li>`).join('')}
                            </ul>
                        </section>
                    `).join('')}
                </div>
                <div class="exani-detail__note">
                    Contenido organizado para estudiar el temario sin reproducir reactivos protegidos.
                </div>
            </aside>
        `;
    }

    function publishedCard(course) {
        return `
            <a class="exani-published-card" href="${toUrl(window.EducatIA.Utils.courseUrl(course))}">
                <span>Curso publicado</span>
                <h3>${esc(courseTitle(course))}</h3>
                <p>${esc(courseDescription(course))}</p>
            </a>
        `;
    }

    function draw() {
        const app = document.getElementById('app');
        const list = filteredModules();
        const selected = getSelectedModule(list);
        const totalTopics = MODULES.reduce((sum, module) => sum + topicCount(module), 0);
        const totalSubareas = MODULES.reduce((sum, module) => sum + module.subareas.length, 0);
        const published = backendCourses.filter(isPublished).slice(0, 4);

        app.innerHTML = `
            <div class="exani-explore">
                <section class="exani-hero">
                    <div class="container exani-hero__grid">
                        <div class="exani-hero__copy">
                            <span class="exani-eyebrow">Explorar EXANI-II</span>
                            <h1>Todos los módulos del examen en una ruta clara.</h1>
                            <p>Consulta subáreas, temas y prioridades para construir una preparación alineada con el temario del EXANI-II.</p>
                            <div class="exani-hero__actions">
                                <a class="btn btn--blue btn--lg" href="#exani-catalog">Ver módulos</a>
                                <a class="btn btn--outline btn--lg" href="${signupOrLearningHref()}">Comenzar preparación</a>
                            </div>
                        </div>
                        <div class="exani-hero__panel" aria-label="Resumen del catálogo">
                            <div class="exani-orbit">
                                <span>EXANI-II</span>
                                <i style="--x:18%;--y:18%">MAT</i>
                                <i style="--x:78%;--y:20%">BIO</i>
                                <i style="--x:18%;--y:72%">SOC</i>
                                <i style="--x:76%;--y:74%">SAL</i>
                            </div>
                            <div class="exani-hero__mini-grid">
                                <div><strong>${MODULES.length}</strong><span>módulos</span></div>
                                <div><strong>${totalSubareas}</strong><span>subáreas</span></div>
                                <div><strong>${totalTopics}</strong><span>temas</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="exani-overview">
                    <div class="container exani-overview__grid">
                        <div>
                            <span class="exani-kicker">Catálogo disciplinar</span>
                            <h2>Busca por área, módulo o tema específico.</h2>
                            <p>Elige un módulo para consultar su contenido. La búsqueda también encuentra temas dentro de cada subárea.</p>
                        </div>
                        <div class="exani-search">
                            <span>${window.EducatIA.Icons?.search || ''}</span>
                            <input id="exani-search-input" type="search" value="${esc(searchQuery)}" placeholder="Ej. derivadas, salud, derecho, porcentajes">
                            ${searchQuery ? '<button type="button" id="exani-clear-search">Limpiar</button>' : ''}
                        </div>
                    </div>
                </section>

                <section class="container exani-filter-row" aria-label="Filtros de módulos">
                    ${GROUPS.map((group) => `
                        <button type="button" class="exani-filter ${activeGroup === group ? 'is-active' : ''}" data-group="${esc(group)}">
                            ${esc(group)}
                        </button>
                    `).join('')}
                </section>

                <section class="container exani-catalog" id="exani-catalog">
                    <div class="exani-catalog__main">
                        <div class="exani-section-head">
                            <div>
                                <h2>Módulos disponibles</h2>
                                <p>${list.length} módulos disponibles. Selecciona uno para revisar sus temas y subáreas.</p>
                            </div>
                        </div>
                        <div class="exani-module-grid">
                            ${list.length ? list.map((module) => moduleCard(module, module.id === selected.id)).join('') : `
                                <div class="exani-empty">
                                    <h3>No encontramos coincidencias</h3>
                                    <p>Prueba otra búsqueda o cambia el filtro de área.</p>
                                </div>
                            `}
                        </div>
                    </div>
                    ${detailPanel(selected)}
                </section>

                <section class="exani-plan-band">
                    <div class="container exani-plan-band__grid">
                        <div>
                            <span class="exani-kicker exani-kicker--light">Cómo se estudia en educatIA</span>
                            <h2>De temario a ruta de estudio.</h2>
                            <p>Cada módulo conecta clases, diagnóstico, práctica por habilidad y simulacros dentro de una misma ruta de preparación.</p>
                        </div>
                        <div class="exani-flow">
                            <span>Diagnóstico</span>
                            <span>Lecciones cortas</span>
                            <span>Práctica por tema</span>
                            <span>Simulacro</span>
                        </div>
                    </div>
                </section>

                <section class="container exani-published">
                    <div class="exani-section-head">
                        <div>
                            <h2>Cursos publicados en la plataforma</h2>
                            <p>Continúa desde los cursos activos y conserva tu avance en cada materia.</p>
                        </div>
                    </div>
                    <div class="exani-published__grid">
                        ${published.length ? published.map(publishedCard).join('') : `
                            <div class="exani-empty exani-empty--inline">
                                <h3>Estamos preparando esta sección</h3>
                                <p>Mientras publicamos nuevas materias, puedes explorar los módulos y comenzar con los cursos disponibles.</p>
                            </div>
                        `}
                    </div>
                </section>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        let debounce;
        document.getElementById('exani-search-input')?.addEventListener('input', function (event) {
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                searchQuery = event.target.value;
                const list = filteredModules();
                if (list.length && !list.some((module) => module.id === selectedModuleId)) {
                    selectedModuleId = list[0].id;
                }
                draw();
            }, 140);
        });

        document.getElementById('exani-clear-search')?.addEventListener('click', function () {
            searchQuery = '';
            draw();
        });

        document.querySelectorAll('[data-group]').forEach((button) => {
            button.addEventListener('click', function () {
                activeGroup = button.dataset.group || 'Todos';
                const list = filteredModules();
                if (list.length) selectedModuleId = list[0].id;
                draw();
            });
        });

        document.querySelectorAll('[data-module-id]').forEach((button) => {
            button.addEventListener('click', function () {
                selectedModuleId = button.dataset.moduleId || selectedModuleId;
                draw();
                document.getElementById('exani-detail')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });
        });
    }

    async function render() {
        const app = document.getElementById('app');
        app.innerHTML = window.EducatIA.Components.renderLoadingBlock('Cargando temario EXANI-II');

        try {
            const res = await API().getCourses();
            backendCourses = Array.isArray(res) ? res : (res?.items || []);
        } catch {
            backendCourses = [];
        }

        const queryFromSession = window.sessionStorage.getItem('educatia_explore_query');
        if (queryFromSession) {
            searchQuery = queryFromSession;
            window.sessionStorage.removeItem('educatia_explore_query');
        }

        draw();
    }

    return { render, modules: MODULES };
})();

/* ================================================================
   educatIA - Explorar marketplace
   Coursera-inspired layout using the EXANI-II module catalog.
   ================================================================ */

window.EducatIA.Pages.Explorar = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const toUrl = (path) => window.EducatIA.Router?.toUrl ? window.EducatIA.Router.toUrl(path) : path;
    const MODULES = window.EducatIA.ExaniModules || [];
    const GROUPS = ['Todos', 'Matemáticas', 'Experimentales', 'Sociales', 'Humanidades', 'Salud', 'Generales'];
    const TRENDING_GROUPS = ['Más populares', 'Matemáticas', 'Salud', 'Sociales', 'Generales'];

    const editorialById = {
        administracion: { color: '#011330', image: 'assets/banners/administracion.webp' },
        aritmetica: { color: '#01353E', image: 'assets/banners/aritmetica.webp' },
        biologia: { color: '#13311C', image: 'assets/banners/biologia.webp' },
        calculo: { color: '#001236', image: 'assets/banners/calculo.webp' },
        salud: { color: '#014656', image: 'assets/banners/ciencias%20de%20la%20salud.webp' },
        'ciencias-experimentales': { color: '#2D2050', image: 'assets/banners/ciencias%20experimentales.webp' },
        derecho: { color: '#3B0A14', image: 'assets/banners/derecho.webp' },
        economia: { color: '#012E25', image: 'assets/banners/economia.webp' },
        filosofia: { color: '#401632', image: 'assets/banners/filosofia.webp' },
        fisica: { color: '#001331', image: 'assets/banners/fisica.webp' },
        historia: { color: '#36010A', image: 'assets/banners/historia.webp' },
        literatura: { color: '#5E1C2F', image: 'assets/banners/literatura.webp' },
        'matematicas-financieras': { color: '#034235', image: 'assets/banners/matematicas%20financieras.webp' },
        premedicina: { color: '#012B3F', image: 'assets/banners/premedicina.webp' },
        'probabilidad-estadistica': { color: '#1F3F6E', image: 'assets/banners/probabilidad%20y%20estadistica.webp' },
        psicologia: { color: '#62418A', image: 'assets/banners/psicologia.webp' },
        quimica: { color: '#492E7F', image: 'assets/banners/quimica.webp' },
    };

    const imageById = {
        ...Object.fromEntries(Object.entries(editorialById).map(([id, item]) => [id, item.image])),
        'ciencias-sociales': 'assets/lessons_photo/webp/historia.webp'
    };

    let activeGroup = 'Todos';
    let activeTrending = 'Más populares';
    let searchQuery = '';
    let activeLevel = 'Todos';
    let activeDuration = 'Todas';
    let selectedModuleId = 'premedicina';
    let backendCourses = [];

    function moduleById(id) {
        return MODULES.find((module) => module.id === id);
    }

    function allTopics(module) {
        return module.subareas.flatMap((subarea) => subarea.topics);
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function topicCount(module) {
        return allTopics(module).length;
    }

    function moduleLevel(module) {
        const count = topicCount(module);
        if (count <= 7) return 'Base';
        if (count <= 10) return 'Intermedio';
        return 'Intensivo';
    }

    function moduleDuration(module) {
        const count = topicCount(module);
        if (count <= 7) return 'Corta';
        if (count <= 10) return 'Media';
        return 'Larga';
    }

    function searchable(module) {
        return normalizeSearchText([
            module.title,
            module.group,
            module.type,
            module.summary,
            ...module.subareas.map((subarea) => subarea.title),
            ...allTopics(module)
        ].join(' '));
    }

    function matchModule(module, group) {
        const normalizedQuery = normalizeSearchText(searchQuery.trim());
        const groupOk = group === 'Todos' || module.group === group;
        const levelOk = activeLevel === 'Todos' || moduleLevel(module) === activeLevel;
        const durationOk = activeDuration === 'Todas' || moduleDuration(module) === activeDuration;
        const queryOk = !normalizedQuery || searchable(module).includes(normalizedQuery);
        return groupOk && levelOk && durationOk && queryOk;
    }

    function filteredModules(group = activeGroup) {
        return MODULES.filter((module) => matchModule(module, group));
    }

    function modulesByIds(ids) {
        return ids.map(moduleById).filter(Boolean);
    }

    function mediaFor(module) {
        return imageById[module.id] || 'assets/images/landing-courses/exani-route.jpg';
    }

    function moduleEditorialHref(module) {
        return moduleCourseHref(module);
    }

    function moduleColor(module) {
        return editorialById[module.id]?.color || '#0B4A7B';
    }

    function shortText(text, limit = 116) {
        if (!text || text.length <= limit) return text || '';
        return `${text.slice(0, limit - 3)}...`;
    }

    function moduleStars(module) {
        const base = 4.6 + (topicCount(module) % 4) / 10;
        return base.toFixed(1);
    }

    function selectedModule(list) {
        return MODULES.find((module) => module.id === selectedModuleId) || list[0] || MODULES[0];
    }

    function statTotals() {
        return {
            modules: MODULES.length,
            subareas: MODULES.reduce((sum, module) => sum + module.subareas.length, 0),
            topics: MODULES.reduce((sum, module) => sum + topicCount(module), 0)
        };
    }

    function courseTitle(course) {
        return course?.titulo || course?.title || course?.nombre || 'Curso educatIA';
    }

    function courseDescription(course) {
        return course?.descripcion || course?.description || course?.resumen || 'Curso publicado dentro de educatIA.';
    }

    function courseImage(course) {
        if (course?.imagen_url) {
            return API().resolveAssetUrl(course.imagen_url);
        }
        const related = MODULES.find((module) => {
            const courseKey = normalizeCourseKey(courseTitle(course));
            const moduleKey = normalizeCourseKey(module.title);
            return courseKey === moduleKey || courseKey.includes(moduleKey) || moduleKey.includes(courseKey);
        });
        return related ? mediaFor(related) : 'assets/images/landing-courses/exani-route.jpg';
    }

    function normalizeCourseKey(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function userHasSession() {
        const api = API();
        const components = window.EducatIA.Components;
        return Boolean(
            components?.userState?.loggedIn ||
            api?.getToken?.() ||
            api?.getUser?.()
        );
    }

    function signupOrLearningHref() {
        return toUrl(userHasSession() ? '/dashboard' : '/registro-alumno?plan=premium');
    }

    function courseForModule(module) {
        const moduleKey = normalizeCourseKey(module?.title);
        if (!moduleKey) return null;
        return backendCourses
            .filter(isPublished)
            .find((course) => {
                const titleKey = normalizeCourseKey(courseTitle(course));
                return titleKey === moduleKey || titleKey.includes(moduleKey) || moduleKey.includes(titleKey);
            }) || null;
    }

    function moduleCourseHref(module) {
        const course = courseForModule(module);
        if (!course) return signupOrLearningHref();
        return toUrl(window.EducatIA.Utils.courseUrl(course));
    }

    function moduleCourseAction(module) {
        if (courseForModule(module)) return 'Comenzar preparación';
        return userHasSession() ? 'Ver mi aprendizaje' : 'Crear cuenta';
    }

    function moduleCard(module, variant = '') {
        return `
            <a class="exm-card ${variant}" href="${moduleEditorialHref(module)}" style="--module-color:${esc(moduleColor(module))}">
                <div class="exm-card__body">
                    <div class="exm-card__category">${esc(module.group)}</div>
                    <h3>${esc(module.title)}</h3>
                    <p>${esc(shortText(module.summary, 118))}</p>
                    <div class="exm-card__meta">
                        <span>${module.subareas.length} subáreas</span>
                        <span>${topicCount(module)} temas</span>
                    </div>
                    <small>Comenzar preparación <span aria-hidden="true">→</span></small>
                </div>
            </a>
        `;
    }

    function compactModuleCard(module) {
        return `
            <a class="exm-compact-card" href="${moduleEditorialHref(module)}" style="--module-color:${esc(moduleColor(module))}">
                <div class="exm-compact-card__copy">
                    <span>${esc(module.group)}</span>
                    <h3>${esc(module.title)}</h3>
                    <p>${esc(shortText(module.summary, 104))}</p>
                    <div class="exm-compact-card__meta">
                        <small>${module.subareas.length} subáreas</small>
                        <small>${topicCount(module)} temas guía</small>
                    </div>
                    <strong>Abrir curso <span aria-hidden="true">→</span></strong>
                </div>
            </a>
        `;
    }

    function detailPanel(module) {
        if (!module) return '';
        return `
            <aside class="exm-detail" id="exm-detail">
                <div class="exm-detail__media">
                    <img src="${esc(mediaFor(module))}" alt="${esc(module.title)}" loading="lazy">
                    <span>${esc(module.group)}</span>
                </div>
                <div class="exm-detail__content">
                    <div class="exm-detail__top">
                        <span>Detalle del módulo</span>
                        <strong>* ${moduleStars(module)}</strong>
                    </div>
                    <h2>${esc(module.title)}</h2>
                    <p>${esc(module.summary)}</p>
                    <div class="exm-detail__stats">
                        <div><strong>${module.subareas.length}</strong><span>subáreas</span></div>
                        <div><strong>${topicCount(module)}</strong><span>temas</span></div>
                        <div><strong>EXANI-II</strong><span>enfoque</span></div>
                    </div>
                    <div class="exm-detail__subareas">
                        ${module.subareas.map((subarea, index) => `
                            <section>
                                <h3><span>${String(index + 1).padStart(2, '0')}</span>${esc(subarea.title)}</h3>
                                <ul>
                                    ${subarea.topics.slice(0, 5).map((topic) => `<li>${esc(topic)}</li>`).join('')}
                                </ul>
                            </section>
                        `).join('')}
                    </div>
                    <div class="exm-detail__actions">
                        <a class="btn btn--blue btn--lg" href="${moduleCourseHref(module)}">${moduleCourseAction(module)}</a>
                        <button type="button" class="btn btn--outline btn--lg" data-scroll-catalog>Ver más módulos</button>
                    </div>
                </div>
            </aside>
        `;
    }

    function sectionHead(title, subtitle, actionText = 'Mostrar todos') {
        return `
            <div class="exm-section-head">
                <div>
                    <h2>${esc(title)}</h2>
                    <p>${esc(subtitle)}</p>
                </div>
                <button type="button" data-scroll-catalog>${esc(actionText)}</button>
            </div>
        `;
    }

    function renderTrendingTabs() {
        return `
            <div class="exm-tabs" aria-label="Filtros destacados">
                ${TRENDING_GROUPS.map((group) => `
                    <button type="button" class="${activeTrending === group ? 'is-active' : ''}" data-trending="${esc(group)}">${esc(group)}</button>
                `).join('')}
            </div>
        `;
    }

    function trendingModules() {
        if (activeTrending === 'Más populares') {
            return modulesByIds(['premedicina', 'aritmetica', 'literatura', 'probabilidad-estadistica']);
        }
        return MODULES.filter((module) => module.group === activeTrending).slice(0, 4);
    }

    function programModules() {
        return modulesByIds(['aritmetica', 'literatura', 'probabilidad-estadistica', 'premedicina']);
    }

    function learningLabHref(subjectId, simulationId) {
        const path = `laboratorio-aprendizaje/${subjectId}/${simulationId}`;
        return toUrl(userHasSession() ? `/${path}` : `/registro-alumno?next=${encodeURIComponent(path)}`);
    }

    function renderLearningLabEntry() {
        const laboratories = [
            { id: 'fisica', title: 'Fuerzas y equilibrio', meta: 'Masas, torques y palancas', simulation: 'balancing-act', mark: 'F' },
            { id: 'fisica', title: 'Luz y refracción', meta: 'Rayos, medios y reflexión', simulation: 'bending-light', mark: 'L' },
            { id: 'fisica', title: 'Movimiento', meta: 'Fuerza neta, fricción y aceleración', simulation: 'forces-and-motion-basics', mark: 'M' },
        ];
        return `
            <section class="exm-lab-entry" aria-labelledby="exm-lab-entry-title">
                <div class="exm-lab-entry__copy">
                    <span>Laboratorio de aprendizaje</span>
                    <h2 id="exm-lab-entry-title">Experimenta antes de memorizar.</h2>
                    <p>Elige una práctica de Física y abre un simulador HTML5 de pantalla completa con animaciones, variables y resultados en tiempo real.</p>
                    <a href="${toUrl(userHasSession() ? '/laboratorio-aprendizaje' : '/registro-alumno?next=laboratorio-aprendizaje')}" class="btn btn--white">Ver todo el laboratorio</a>
                </div>
                <div class="exm-lab-entry__subjects">
                    ${laboratories.map((lab) => `
                        <a href="${learningLabHref(lab.id, lab.simulation)}" class="exm-lab-subject exm-lab-subject--${esc(lab.id)}">
                            <i aria-hidden="true">${esc(lab.mark)}</i>
                            <span><strong>${esc(lab.title)}</strong><small>${esc(lab.meta)}</small></span>
                            <b aria-hidden="true">→</b>
                        </a>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderPartnerChips() {
        const logged = userHasSession();
        const chips = [
            { label: 'Temario EXANI-II', href: '#exm-catalog' },
            { label: 'Diagnóstico inicial', href: toUrl(logged ? '/onboarding' : '/registro-alumno?plan=premium') },
            { label: 'Plan semanal', href: toUrl(logged ? '/dashboard?focus=plan' : '/registro-alumno?next=plan-semanal') },
            { label: 'Exámenes de práctica', href: toUrl(logged ? window.EducatIA.Utils.exaniPracticeUrl() : '/registro-alumno?next=simuladores-exani/practica-por-modulos') },
            { label: 'Evaluación continua', href: '#exm-evaluacion' },
            { label: 'Práctica por tema', href: toUrl(logged ? window.EducatIA.Utils.exaniPracticeUrl() : '/registro-alumno?next=simuladores-exani/practica-por-modulos') },
            { label: 'Retroalimentación', href: toUrl(logged ? '/calificaciones' : '/registro-alumno?plan=premium') },
        ];
        return chips.map((chip) => `<a href="${esc(chip.href)}">${esc(chip.label)}</a>`).join('');
    }

    function renderCategoryChips() {
        return GROUPS.map((group) => `
            <button type="button" class="${activeGroup === group ? 'is-active' : ''}" data-group="${esc(group)}">${esc(group)}</button>
        `).join('');
    }

    function renderAdvancedFilters() {
        const levels = ['Todos', 'Base', 'Intermedio', 'Intensivo'];
        const durations = ['Todas', 'Corta', 'Media', 'Larga'];
        return `
            <div class="exm-advanced-filters" aria-label="Filtros avanzados de módulos">
                <label>
                    <span>Nivel</span>
                    <select id="exm-level-filter">
                        ${levels.map((level) => `<option value="${esc(level)}" ${activeLevel === level ? 'selected' : ''}>${esc(level)}</option>`).join('')}
                    </select>
                </label>
                <label>
                    <span>Duracion</span>
                    <select id="exm-duration-filter">
                        ${durations.map((duration) => `<option value="${esc(duration)}" ${activeDuration === duration ? 'selected' : ''}>${esc(duration)}</option>`).join('')}
                    </select>
                </label>
            </div>
        `;
    }

    function renderModuleRows() {
        const rows = [
            { group: 'Matemáticas', title: 'Más populares en matemáticas', subtitle: 'Aritmética, cálculo, finanzas y probabilidad para resolver con precisión.' },
            { group: 'Experimentales', title: 'Ciencias para el examen', subtitle: 'Biología, física y química organizadas por subáreas del temario.' },
            { group: 'Sociales', title: 'Ciencias sociales y administración', subtitle: 'Derecho, economía, historia y administración para estudiar con contexto.' },
            { group: 'Salud', title: 'Ruta de salud y premedicina', subtitle: 'Bases de morfofisiología, salud pública, biología celular y bioquímica.' }
        ];

        return rows.map((row) => {
            const modules = MODULES.filter((module) => module.group === row.group).slice(0, 4);
            if (!modules.length) return '';
            return `
                <section class="exm-module-row">
                    ${sectionHead(row.title, row.subtitle, 'Ver categoría')}
                    <div class="exm-card-row">
                        ${modules.map((module) => moduleCard(module)).join('')}
                    </div>
                </section>
            `;
        }).join('');
    }

    function publishedCourseCard(course) {
        const title = courseTitle(course);
        const desc = courseDescription(course);
        return `
            <a class="exm-published-card" href="${toUrl(window.EducatIA.Utils.courseUrl(course))}">
                <img src="${esc(courseImage(course))}" alt="${esc(title)}" loading="lazy">
                <span>Curso publicado</span>
                <h3>${esc(title)}</h3>
                <p>${esc(shortText(desc, 120))}</p>
            </a>
        `;
    }

    function isPublished(course) {
        if (!course) return false;
        if (course.publicado === false || course.visible === false) return false;
        const status = String(course.estado || course.status || '').toLowerCase();
        return !['borrador', 'draft', 'archivado', 'archive'].includes(status);
    }

    function draw() {
        const app = document.getElementById('app');
        const list = filteredModules();
        const selected = selectedModule(list);
        const published = backendCourses.filter(isPublished).slice(0, 4);
        const hasSearch = Boolean(normalizeSearchText(searchQuery.trim()));

        if (list.length && !list.some((module) => module.id === selectedModuleId)) {
            selectedModuleId = list[0].id;
        }

        app.innerHTML = `
            <div class="exm-page">
                <section class="exm-hero">
                    <div class="container exm-hero__grid">
                        <div class="exm-hero__copy">
                            <span>Catálogo de educatIA</span>
                            <h1>Elige tu siguiente curso.</h1>
                            <p>Preparación EXANI-I y EXANI-II, ingeniería de IA, machine learning y deep learning. Consulta el temario y comienza tu formación.</p>
                            <div class="exm-hero__actions">
                                <a class="btn btn--blue btn--lg" href="#exm-catalog">Explorar módulos</a>
                                <a class="btn btn--outline btn--lg" href="${signupOrLearningHref()}">Comenzar preparación</a>
                            </div>
                        </div>
                        <div class="exm-hero__visual">
                            <img src="assets/explorar/banner-exani-hero.webp" alt="Estudiante preparando el EXANI-II con recursos de educatIA" fetchpriority="high" decoding="async">
                        </div>
                    </div>
                </section>

                <main class="container exm-main">
                    <section class="exm-search-band">
                        <div class="exm-search">
                            <span>${window.EducatIA.Icons?.search || ''}</span>
                            <input id="exm-search-input" type="search" value="${esc(searchQuery)}" placeholder="Busca un curso, módulo o tema">
                            ${searchQuery ? '<button type="button" id="exm-clear-search">Limpiar</button>' : ''}
                        </div>
                        <div class="exm-search-band__chips">
                            ${renderPartnerChips()}
                        </div>
                        ${renderAdvancedFilters()}
                    </section>

                    ${window.EducatIA.ProgramCatalog.section({ query: searchQuery })}

                    ${!hasSearch ? `
                    <section class="exm-section">
                        ${sectionHead('Módulos de preparación populares', 'Una selección rápida para comenzar por las áreas más practicadas.', 'Ver catálogo')}
                        ${renderTrendingTabs()}
                        <div class="exm-card-row exm-card-row--featured">
                            ${trendingModules().map((module) => moduleCard(module)).join('')}
                        </div>
                    </section>

                    <section class="exm-program-band">
                        <div class="exm-program-band__copy">
                            <span>Preparación premium</span>
                            <h2>Prepárate para ingresar a la universidad con una ruta clara.</h2>
                            <p>Diagnóstico, clases por habilidad, práctica y simulacros para estudiar con un objetivo definido.</p>
                            <a class="btn btn--white btn--lg" href="${signupOrLearningHref()}">Iniciar mi ruta</a>
                        </div>
                        <div class="exm-program-band__cards">
                            ${programModules().map((module) => moduleCard(module, 'exm-card--compact')).join('')}
                        </div>
                    </section>

                    <section class="exm-categories">
                        <h2>Explorar categorías</h2>
                        <div class="exm-category-chips">
                            ${renderCategoryChips()}
                        </div>
                    </section>

                    <section class="exm-section exm-section--soft" id="exm-evaluacion">
                        ${sectionHead('Evaluación continua dentro de cada curso', 'Practica por clase, identifica errores y comprueba tu dominio antes de avanzar al siguiente bloque.', 'Ver módulos')}
                        <div class="exm-published-grid">
                            <a class="exm-published-card" href="${moduleCourseHref(selected)}">
                                <img src="${esc(mediaFor(selected))}" alt="${esc(selected?.title || 'Evaluación por clase en educatIA')}" loading="lazy">
                                <span>Dominio por clase</span>
                                <h3>Comprueba lo aprendido al terminar cada tema</h3>
                                <p>Responde formularios breves, revisa las explicaciones y repite la práctica hasta dominar el contenido.</p>
                            </a>
                            <a class="exm-published-card" href="#exm-catalog">
                                <img src="assets/images/landing-courses/exani-route.jpg" alt="Módulos EXANI-II" loading="lazy">
                                <span>Práctica dirigida</span>
                                <h3>Refuerza primero las habilidades con menor desempeño</h3>
                                <p>Los resultados de evaluaciones y simulacros te ayudan a ordenar la siguiente sesión de estudio.</p>
                            </a>
                        </div>
                    </section>
                    ` : ''}

                    <section class="exm-catalog" id="exm-catalog">
                        ${sectionHead(hasSearch ? 'Resultados de búsqueda' : 'Programas de preparación EXANI-II', `${list.length} ${list.length === 1 ? 'programa' : 'programas'} con una ficha editorial, objetivos y temario antes de comenzar.`, 'Volver arriba')}
                        <div class="exm-editorial-grid">
                            ${list.length ? list.map(compactModuleCard).join('') : `
                                <div class="exm-empty">
                                    <h3>No encontramos coincidencias</h3>
                                    <p>Prueba con otra búsqueda o cambia la categoría.</p>
                                </div>
                            `}
                        </div>
                    </section>

                    ${!hasSearch ? renderModuleRows() : ''}

                    ${!hasSearch ? `
                    <section class="exm-section exm-section--soft">
                        ${sectionHead('Cursos publicados en educatIA', 'Accede a las materias disponibles y continúa desde tu último avance.', 'Ver plataforma')}
                        <div class="exm-published-grid">
                            ${published.length ? published.map(publishedCourseCard).join('') : `
                                <div class="exm-empty">
                                    <h3>Estamos preparando nuevos cursos</h3>
                                    <p>Explora los módulos disponibles mientras incorporamos nuevas rutas de estudio.</p>
                                </div>
                            `}
                        </div>
                    </section>
                    ` : ''}
                </main>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        let debounce;

        document.getElementById('exm-search-input')?.addEventListener('input', function (event) {
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                searchQuery = event.target.value;
                const list = filteredModules();
                if (list.length) selectedModuleId = list[0].id;
                draw();
            }, 140);
        });

        document.getElementById('exm-clear-search')?.addEventListener('click', function () {
            searchQuery = '';
            draw();
        });

        document.getElementById('exm-level-filter')?.addEventListener('change', function (event) {
            activeLevel = event.target.value || 'Todos';
            const list = filteredModules();
            if (list.length) selectedModuleId = list[0].id;
            draw();
        });

        document.getElementById('exm-duration-filter')?.addEventListener('change', function (event) {
            activeDuration = event.target.value || 'Todas';
            const list = filteredModules();
            if (list.length) selectedModuleId = list[0].id;
            draw();
        });

        document.querySelectorAll('[data-trending]').forEach((button) => {
            button.addEventListener('click', function () {
                activeTrending = button.dataset.trending || 'Más populares';
                draw();
            });
        });

        document.querySelectorAll('[data-group]').forEach((button) => {
            button.addEventListener('click', function () {
                activeGroup = button.dataset.group || 'Todos';
                const list = filteredModules();
                if (list.length) selectedModuleId = list[0].id;
                draw();
                document.getElementById('exm-catalog')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });
        });

        document.querySelectorAll('[data-module-id]').forEach((button) => {
            button.addEventListener('click', function () {
                selectedModuleId = button.dataset.moduleId || selectedModuleId;
                draw();
                document.getElementById('exm-detail')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        });

        document.querySelectorAll('[data-scroll-catalog]').forEach((button) => {
            button.addEventListener('click', function () {
                document.getElementById('exm-catalog')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });
        });
    }

    function readInitialSearchQuery() {
        const params = window.EducatIA.Router?.getQueryParams?.();
        const queryFromUrl = params?.get('q') || params?.get('buscar') || '';
        const queryFromSession = window.sessionStorage.getItem('educatia_explore_query') || '';
        window.sessionStorage.removeItem('educatia_explore_query');
        return (queryFromUrl || queryFromSession).trim();
    }

    async function render() {
        const app = document.getElementById('app');
        app.innerHTML = window.EducatIA.Components.renderLoadingBlock('Cargando catálogo de cursos');

        try {
            const res = await API().getCourses();
            backendCourses = Array.isArray(res) ? res : (res?.items || []);
        } catch (error) {
            backendCourses = [];
        }

        const initialQuery = readInitialSearchQuery();
        if (initialQuery) {
            searchQuery = initialQuery;
            const list = filteredModules();
            if (list.length) selectedModuleId = list[0].id;
        }

        draw();
    }

    return {
        render,
        modules: MODULES,
        editorial: editorialById,
        findPublishedCourse(moduleId) {
            const module = moduleById(moduleId);
            return module ? courseForModule(module) : null;
        },
    };
})();
