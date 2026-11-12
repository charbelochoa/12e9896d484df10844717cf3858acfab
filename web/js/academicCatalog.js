/* Authored curriculum outline; generated from data/ai_academic_catalog.json. */
window.EducatIA = window.EducatIA || {};
window.EducatIA.AcademicCatalog = {
  "schema_version": 1,
  "updated": "2026-10-06",
  "status": "curriculum_draft",
  "publication_policy": "final_release_only",
  "sources": {
    "cs229": {
      "title": "Stanford CS229, Spring 2026",
      "url": "https://cs229.stanford.edu/index.html-spr26",
      "scope": "Alcance de aprendizaje automático y prerrequisitos; no acceso a materiales restringidos."
    },
    "cs231n": {
      "title": "Stanford CS231n, Spring 2025",
      "url": "https://cs231n.stanford.edu/2025/schedule.html",
      "scope": "Fundamentos de redes y visión; no representa por sí solo todo deep learning."
    },
    "cs224n": {
      "title": "Stanford CS224N, Winter 2026",
      "url": "https://web.stanford.edu/class/cs224n/",
      "scope": "Lenguaje, representaciones, secuencias y atención."
    },
    "cs336": {
      "title": "Stanford CS336, Spring 2025",
      "url": "https://cs336.stanford.edu/spring2025/",
      "scope": "Construcción y evaluación de modelos de lenguaje a escala educativa."
    },
    "clip": {
      "title": "CLIP, artículo original",
      "url": "https://arxiv.org/abs/2103.00020",
      "scope": "Alineación contrastiva entre texto e imagen."
    },
    "blip2": {
      "title": "BLIP-2, artículo original",
      "url": "https://arxiv.org/abs/2301.12597",
      "scope": "Conexión entre codificadores visuales y modelos de lenguaje."
    },
    "whisper": {
      "title": "Whisper, artículo original",
      "url": "https://arxiv.org/abs/2212.04356",
      "scope": "Reconocimiento de voz y evaluación bajo cambios de distribución."
    }
  },
  "programs": [
    {
      "programa": "ai_engineer",
      "titulo": "AI Engineer",
      "modalidad": "autonomo",
      "requisitos": "Python básico: funciones, listas, diccionarios y archivos. Nivelación previa si el diagnóstico detecta carencias.",
      "objetivo": "Construir y evaluar un sistema de IA con datos trazables, API, pruebas y operación documentada.",
      "estado": "en_desarrollo",
      "fuentes": [
        "cs229",
        "cs224n"
      ],
      "modulos": [
        {
          "id": "ai_engineer-m01",
          "orden": 1,
          "titulo": "Fundamentos de ingeniería y experimentación",
          "temas": [
            "Problema y momento de predicción",
            "Contrato de datos",
            "Particiones y referencias",
            "Informe reproducible"
          ],
          "objetivo": "Reproducir una comparación sin utilizar prueba para seleccionar modelos.",
          "entrega": "Informe y código del experimento, con matriz de confusión calculada a mano.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m02",
          "orden": 2,
          "titulo": "Python para sistemas de IA",
          "temas": [
            "Tipos y estructuras",
            "Funciones y módulos",
            "Errores y archivos",
            "Entornos, Git y pruebas"
          ],
          "objetivo": "Organizar código ejecutable con dependencias registradas y casos de prueba.",
          "entrega": "Paquete Python con instrucciones de instalación y pruebas de entradas inválidas.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m03",
          "orden": 3,
          "titulo": "Matemáticas y cómputo numérico",
          "temas": [
            "Vectores y matrices",
            "Derivadas y gradientes",
            "Probabilidad y muestreo",
            "NumPy y estabilidad numérica"
          ],
          "objetivo": "Comprobar dimensiones y gradientes en un problema numérico pequeño.",
          "entrega": "Notebook con comprobación analítica y numérica de un gradiente.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m04",
          "orden": 4,
          "titulo": "Datos y calidad",
          "temas": [
            "Adquisición y procedencia",
            "Validación y faltantes",
            "Transformaciones y particiones",
            "Versionado y permisos de uso"
          ],
          "objetivo": "Preparar datos sin fuga y registrar decisiones de limpieza.",
          "entrega": "Pipeline de datos con reporte de calidad y procedencia.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m05",
          "orden": 5,
          "titulo": "Modelos supervisados y evaluación",
          "temas": [
            "Regresión y clasificación",
            "Pérdidas y regularización",
            "Validación y selección",
            "Errores y calibración"
          ],
          "objetivo": "Comparar modelos contra una referencia usando un protocolo fijo.",
          "entrega": "Experimento tabular con métricas y análisis de casos fallidos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m06",
          "orden": 6,
          "titulo": "Redes y modelos preentrenados",
          "temas": [
            "Tensores y autograd",
            "Red multicapa",
            "Entrenamiento y diagnóstico",
            "Transferencia e inferencia"
          ],
          "objetivo": "Entrenar una red pequeña y distinguir aprendizaje, adaptación e inferencia.",
          "entrega": "Modelo pequeño con curvas, checkpoint y límites de recursos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m07",
          "orden": 7,
          "titulo": "Representaciones y recuperación",
          "temas": [
            "Embeddings y similitud",
            "Fragmentación e índices",
            "Recuperación y reranking",
            "Evaluación de búsqueda"
          ],
          "objetivo": "Medir calidad de recuperación en consultas con relevancia definida.",
          "entrega": "Buscador con corpus permitido, consultas de evaluación y análisis de resultados.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m08",
          "orden": 8,
          "titulo": "Sistemas de generación con evidencia",
          "temas": [
            "Contexto y plantillas",
            "RAG y atribución",
            "Respuestas sin evidencia",
            "Evaluación de recuperación y respuesta"
          ],
          "objetivo": "Separar errores de recuperación y generación en un sistema documental.",
          "entrega": "Aplicación con respuestas sustentadas y evaluación de abstención.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m09",
          "orden": 9,
          "titulo": "APIs y operación",
          "temas": [
            "Contratos y validación",
            "Pruebas de integración",
            "Latencia, costo y observabilidad",
            "Versionado, despliegue y rollback"
          ],
          "objetivo": "Servir inferencia con límites de recursos y señales de operación.",
          "entrega": "API con pruebas, medición de latencia y procedimiento de reversión.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "ai_engineer-m10",
          "orden": 10,
          "titulo": "Seguridad y proyecto de ingeniería",
          "temas": [
            "Datos privados y permisos",
            "Entradas adversarias",
            "Monitoreo de deriva",
            "Defensa y documentación"
          ],
          "objetivo": "Justificar decisiones del sistema completo y reconocer condiciones de fallo.",
          "entrega": "Proyecto integrado con repositorio, evaluación, demostración y memoria técnica.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        }
      ],
      "compute_policy": "CPU para fundamentos; prácticas GPU con presupuesto y alternativa acotada. No incluye créditos externos."
    },
    {
      "programa": "machine_learning",
      "titulo": "Machine Learning For AI",
      "modalidad": "autonomo",
      "requisitos": "Python y NumPy; álgebra lineal, derivadas y probabilidad básica, acreditadas por diagnóstico.",
      "objetivo": "Derivar, implementar y comparar modelos de aprendizaje automático con validación rigurosa.",
      "estado": "en_desarrollo",
      "fuentes": [
        "cs229"
      ],
      "modulos": [
        {
          "id": "machine_learning-m01",
          "orden": 1,
          "titulo": "Fundamentos estadísticos",
          "temas": [
            "Variables y distribuciones",
            "Estimación y verosimilitud",
            "Riesgo y generalización",
            "Diseño experimental"
          ],
          "objetivo": "Plantear un experimento con supuestos y criterio de comparación.",
          "entrega": "Protocolo de evaluación y simulación de estimadores.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m02",
          "orden": 2,
          "titulo": "Regresión y optimización",
          "temas": [
            "Mínimos cuadrados",
            "Descenso de gradiente",
            "Escalamiento de variables",
            "Diagnóstico de residuos"
          ],
          "objetivo": "Relacionar una solución matemática con su implementación numérica.",
          "entrega": "Regresión desde cero y comparación con una biblioteca.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m03",
          "orden": 3,
          "titulo": "Clasificación probabilística",
          "temas": [
            "Regresión logística",
            "Entropía cruzada",
            "Modelos generativos",
            "Umbrales y costos de error"
          ],
          "objetivo": "Elegir una regla de clasificación según objetivos y restricciones.",
          "entrega": "Clasificador con curvas y análisis de falsos positivos y negativos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m04",
          "orden": 4,
          "titulo": "Regularización y selección",
          "temas": [
            "Sesgo y varianza",
            "Penalizaciones L1 y L2",
            "Validación cruzada",
            "Búsqueda sin fuga"
          ],
          "objetivo": "Separar selección de hiperparámetros y evaluación final.",
          "entrega": "Experimento con validación anidada cuando corresponda y prueba reservada.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m05",
          "orden": 5,
          "titulo": "Márgenes y kernels",
          "temas": [
            "Clasificadores de margen",
            "Problema primal y dual",
            "Funciones kernel",
            "Límites de escalamiento"
          ],
          "objetivo": "Explicar cuándo una representación kernel resulta adecuada.",
          "entrega": "Comparación lineal y kernel con tiempo y memoria medidos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m06",
          "orden": 6,
          "titulo": "Árboles y ensambles",
          "temas": [
            "Particiones y criterios",
            "Bagging y bosques",
            "Boosting",
            "Importancia de variables"
          ],
          "objetivo": "Comparar ensambles sin confundir importancia con causalidad.",
          "entrega": "Benchmark tabular y revisión de errores por segmento.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m07",
          "orden": 7,
          "titulo": "Aprendizaje no supervisado",
          "temas": [
            "K-means",
            "Mezclas y EM",
            "Selección de agrupamientos",
            "Evaluación sin etiquetas"
          ],
          "objetivo": "Analizar estabilidad y utilidad de agrupamientos.",
          "entrega": "Informe de clustering con distintas inicializaciones y limitaciones.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m08",
          "orden": 8,
          "titulo": "Reducción y representaciones",
          "temas": [
            "PCA y SVD",
            "Reconstrucción",
            "Visualización de datos",
            "Anomalías y distancias"
          ],
          "objetivo": "Distinguir visualización, reducción y detección de anomalías.",
          "entrega": "Estudio de reconstrucción y sensibilidad a escalas.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m09",
          "orden": 9,
          "titulo": "Evaluación bajo condiciones reales",
          "temas": [
            "Desbalance y métricas",
            "Calibración",
            "Dependencia temporal y grupos",
            "Incertidumbre y cambio de distribución"
          ],
          "objetivo": "Evaluar un modelo bajo un esquema próximo a su uso previsto.",
          "entrega": "Auditoría de particiones, calibración y desempeño por grupos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m10",
          "orden": 10,
          "titulo": "Introducción al aprendizaje por refuerzo",
          "temas": [
            "Procesos de decisión de Markov",
            "Bandits y exploración",
            "Funciones de valor y Q-learning",
            "Evaluación de políticas y límites"
          ],
          "objetivo": "Distinguir recompensa y etiqueta y evaluar una política en un entorno pequeño.",
          "entrega": "Simulación acotada con comparación de políticas y registro de recompensas.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "machine_learning-m11",
          "orden": 11,
          "titulo": "Proyecto de ML",
          "temas": [
            "Propuesta y baseline",
            "Experimentos y ablaciones",
            "Prueba final",
            "Informe y defensa"
          ],
          "objetivo": "Entregar evidencia reproducible que respalde una decisión de modelado.",
          "entrega": "Repositorio y reporte con comparación, errores y límites de generalización.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        }
      ],
      "compute_policy": "CPU para fundamentos; prácticas GPU con presupuesto y alternativa acotada. No incluye créditos externos."
    },
    {
      "programa": "deep_learning",
      "titulo": "Deep Learning For AI",
      "modalidad": "autonomo",
      "requisitos": "ML básico, derivadas multivariables, álgebra lineal y programación NumPy. PyTorch se introduce en el curso.",
      "objetivo": "Implementar y diagnosticar redes neuronales con experimentos, ablaciones y presupuestos explícitos.",
      "estado": "en_desarrollo",
      "fuentes": [
        "cs231n",
        "cs224n"
      ],
      "modulos": [
        {
          "id": "deep_learning-m01",
          "orden": 1,
          "titulo": "Tensores y diferenciación",
          "temas": [
            "Dimensiones y broadcasting",
            "Operaciones numéricas",
            "Grafos de cómputo",
            "Gradientes y autograd"
          ],
          "objetivo": "Verificar dimensiones y derivadas antes de entrenar.",
          "entrega": "Gradientes manuales y comprobación por diferencias finitas.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m02",
          "orden": 2,
          "titulo": "Redes multicapa",
          "temas": [
            "Perceptrón y activaciones",
            "Pérdidas",
            "Backpropagation",
            "Inicialización"
          ],
          "objetivo": "Implementar una red pequeña y explicar el flujo del gradiente.",
          "entrega": "MLP desde cero y equivalente en PyTorch.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m03",
          "orden": 3,
          "titulo": "Optimización y regularización",
          "temas": [
            "SGD y momentum",
            "Adam y tasas de aprendizaje",
            "Normalización",
            "Dropout y penalizaciones"
          ],
          "objetivo": "Diagnosticar curvas sin cambiar múltiples variables a la vez.",
          "entrega": "Comparación controlada de optimizadores y regularizadores.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m04",
          "orden": 4,
          "titulo": "Ciclo de entrenamiento",
          "temas": [
            "Datasets y batches",
            "Checkpoints",
            "Métricas y curvas",
            "Depuración de entrenamiento"
          ],
          "objetivo": "Construir un ciclo reproducible con validación y recuperación.",
          "entrega": "Entrenamiento con prueba de sobreajuste a un lote y reanudación.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m05",
          "orden": 5,
          "titulo": "Visión y convoluciones",
          "temas": [
            "Convolución y pooling",
            "Campo receptivo",
            "Redes residuales",
            "Aumento de datos"
          ],
          "objetivo": "Relacionar arquitectura y transformaciones con el problema visual.",
          "entrega": "Clasificador visual con análisis de clases y errores.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m06",
          "orden": 6,
          "titulo": "Transferencia y representaciones",
          "temas": [
            "Modelos preentrenados",
            "Congelamiento y adaptación",
            "Embeddings",
            "Aprendizaje autosupervisado"
          ],
          "objetivo": "Distinguir transferencia de entrenamiento desde cero.",
          "entrega": "Comparación de entrenamiento completo y adaptación limitada.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m07",
          "orden": 7,
          "titulo": "Secuencias y atención",
          "temas": [
            "Representaciones de secuencias",
            "Recurrencia",
            "Atención",
            "Máscaras y batching"
          ],
          "objetivo": "Explicar el tratamiento de secuencias de distintas longitudes.",
          "entrega": "Modelo de secuencia con pruebas de padding y máscara.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m08",
          "orden": 8,
          "titulo": "Transformers y objetivos",
          "temas": [
            "Autoatención",
            "Posiciones",
            "Bloques transformer",
            "Objetivos de entrenamiento"
          ],
          "objetivo": "Implementar un bloque pequeño y comprobar sus dimensiones.",
          "entrega": "Bloque de atención y experimento acotado de lenguaje.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m09",
          "orden": 9,
          "titulo": "Generación y eficiencia",
          "temas": [
            "Autoencoders y VAE",
            "Objetivos adversarios y GAN",
            "Fundamentos de difusión",
            "Precisión mixta",
            "Memoria y perfiles"
          ],
          "objetivo": "Distinguir objetivos generativos y medir su costo computacional.",
          "entrega": "Experimento generativo pequeño con reporte de recursos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "deep_learning-m10",
          "orden": 10,
          "titulo": "Proyecto de DL",
          "temas": [
            "Diseño y baseline",
            "Ablaciones",
            "Errores y robustez",
            "Informe de reproducción"
          ],
          "objetivo": "Defender una mejora con evidencia y límites de cómputo.",
          "entrega": "Proyecto con checkpoints, registro experimental y defensa técnica.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        }
      ],
      "compute_policy": "CPU para fundamentos; prácticas GPU con presupuesto y alternativa acotada. No incluye créditos externos."
    },
    {
      "programa": "transformers_multimodal",
      "titulo": "Transformers and Multi-Modal Models",
      "modalidad": "hibrido_zoom",
      "requisitos": "ML y DL o experiencia equivalente; PyTorch, atención, gradientes y lectura de artículos en inglés.",
      "objetivo": "Entrenar un transformer educativo y adaptar un sistema multimodal con evaluación por modalidad.",
      "estado": "en_desarrollo",
      "fuentes": [
        "cs336",
        "cs224n",
        "clip",
        "blip2",
        "whisper"
      ],
      "modulos": [
        {
          "id": "transformers_multimodal-m01",
          "orden": 1,
          "titulo": "Representaciones y arquitectura",
          "temas": [
            "Tokenización",
            "Embeddings",
            "Atención causal",
            "Posiciones y bloques"
          ],
          "objetivo": "Comprobar tokenización, máscaras y dimensiones del modelo.",
          "entrega": "Tokenizer y bloque transformer con pruebas y discusión en Zoom.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m02",
          "orden": 2,
          "titulo": "Modelo de lenguaje desde cero",
          "temas": [
            "Objetivo autoregresivo",
            "Preparación del corpus",
            "Batches y entrenamiento",
            "Generación y muestreo"
          ],
          "objetivo": "Entrenar un modelo pequeño con corpus permitido y presupuesto fijo.",
          "entrega": "Modelo educativo y registro de entrenamiento; no escala industrial.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m03",
          "orden": 3,
          "titulo": "Datos y evaluación de lenguaje",
          "temas": [
            "Deduplicación",
            "Contaminación de prueba",
            "Pérdida y perplexity",
            "Evaluaciones de tarea"
          ],
          "objetivo": "Diferenciar calidad de datos y calidad de generación.",
          "entrega": "Auditoría del corpus y evaluación reservada.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m04",
          "orden": 4,
          "titulo": "Recursos y escalamiento",
          "temas": [
            "GPU y memoria",
            "Precisión numérica",
            "Perfilado",
            "Estimaciones de cómputo"
          ],
          "objetivo": "Estimar qué entrenamiento cabe en el presupuesto disponible.",
          "entrega": "Perfil de memoria y plan de ejecución con límites explícitos.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m05",
          "orden": 5,
          "titulo": "Adaptación y preferencias",
          "temas": [
            "Fine-tuning supervisado",
            "Adaptadores y LoRA",
            "Preferencias y alineación",
            "Evaluación de regresiones"
          ],
          "objetivo": "Comparar adaptación con el modelo de referencia.",
          "entrega": "Adaptación pequeña con evaluación antes y después.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m06",
          "orden": 6,
          "titulo": "Inferencia y servicio",
          "temas": [
            "KV cache",
            "Batching",
            "Cuantización",
            "Latencia y capacidad"
          ],
          "objetivo": "Medir compromisos entre memoria, calidad y respuesta.",
          "entrega": "Benchmark de inferencia con hardware y cargas documentados.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m07",
          "orden": 7,
          "titulo": "Texto e imagen contrastivos",
          "temas": [
            "Codificadores por modalidad",
            "Objetivo contrastivo",
            "CLIP y recuperación",
            "Evaluación por clases"
          ],
          "objetivo": "Evaluar alineación texto-imagen sin llamarla generación visual.",
          "entrega": "Búsqueda texto-imagen y análisis de sensibilidad a descripciones.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m08",
          "orden": 8,
          "titulo": "Modelos visión-lenguaje",
          "temas": [
            "Puentes entre representaciones",
            "BLIP-2",
            "Instrucciones visuales",
            "Percepción y alucinaciones"
          ],
          "objetivo": "Examinar fallos de un sistema que responde sobre imágenes.",
          "entrega": "Evaluación visual con casos de lectura, conteo y abstención.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m09",
          "orden": 9,
          "titulo": "Audio y video",
          "temas": [
            "Representaciones de audio",
            "Transcripción y WER",
            "Muestreo temporal de video",
            "Sincronización y evidencia"
          ],
          "objetivo": "Diseñar evaluación distinta para audio, imagen y secuencia temporal.",
          "entrega": "Experimento de audio/video con corpus permitido y errores desglosados.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        },
        {
          "id": "transformers_multimodal-m10",
          "orden": 10,
          "titulo": "Seguridad y proyecto de cohorte",
          "temas": [
            "Privacidad y licencias",
            "Entradas adversarias multimodales",
            "Ablaciones por modalidad",
            "Defensa en Zoom"
          ],
          "objetivo": "Defender un sistema multimodal con límites y evidencia verificable.",
          "entrega": "Proyecto por hitos: propuesta, datos, baseline, adaptación, evaluación y defensa.",
          "estado": "planned",
          "evaluacion": "Práctica guiada, examen del módulo y entrega con rúbrica; criterios definitivos al revisar las lecciones."
        }
      ],
      "compute_policy": "CPU para fundamentos; prácticas GPU con presupuesto y alternativa acotada. No incluye créditos externos."
    }
  ]
};
