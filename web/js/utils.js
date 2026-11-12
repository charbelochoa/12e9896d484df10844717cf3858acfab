window.EducatIA = window.EducatIA || {};

// Runtime feature access. Bill remains implemented, but the API grants it only
// to an active six-month plan. Keeping the switch mutable lets a restored
// session reveal the experience without shipping a second frontend build.
window.EducatIA.Features = {
    ale: false,
    setAleAccess: function (enabled) {
        this.ale = enabled === true;
        document.documentElement.classList.toggle('feature-ale-off', !this.ale);
        document.dispatchEvent(new CustomEvent('educatia:ale-access-changed', {
            detail: { enabled: this.ale }
        }));
    }
};
window.EducatIA.Features.setAleAccess(false);

window.EducatIA.Utils = {
    escapeHtml: function (value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;');
    },

    safeUrl: function (value, fallback) {
        const safeFallback = fallback || '#';
        if (!value) {
            return safeFallback;
        }
        try {
            const parsed = new URL(String(value), window.location.origin);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return parsed.toString();
            }
        } catch (error) {
            return safeFallback;
        }
        return safeFallback;
    },

    slugify: function (value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            || 'contenido';
    },

    courseUrl: function (course) {
        const slug = this.slugify(course?.titulo || course?.title || course?.id || 'curso');
        return `/cursos/${slug}`;
    },

    lessonUrl: function (course, lesson) {
        const lessonSlug = this.slugify(lesson?.titulo || lesson?.title || lesson?.id || 'leccion');
        return `${this.courseUrl(course)}/${lessonSlug}`;
    },

    quizUrl: function (course, quiz) {
        const quizSlug = this.slugify(quiz?.titulo || quiz?.title || quiz?.id || 'evaluacion');
        return `${this.courseUrl(course)}/evaluaciones/${quizSlug}`;
    },

    moduleUrl: function (course, module) {
        const moduleSlug = this.slugify(module?.titulo || module?.title || module?.id || 'modulo');
        return `${this.courseUrl(course)}/modulos/${moduleSlug}`;
    },

    exaniSimulatorUrl: function () {
        return '/simuladores-exani';
    },

    exaniPracticeUrl: function () {
        return '/simuladores-exani/practica-por-modulos';
    },

    exaniStreakUrl: function () {
        return '/simuladores-exani/racha-diaria';
    },

    exaniQuestionUrl: function (sessionId, order, options = {}) {
        const safeSession = encodeURIComponent(sessionId || '');
        const safeOrder = encodeURIComponent(order || 1);
        const base = options.daily ? '/simuladores-exani/racha-diaria/sesiones' : '/simuladores-exani/sesiones';
        return `${base}/${safeSession}/reactivos/${safeOrder}`;
    }
};
