/* ================================================================
   educatIA - Pricing
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Pricing = (function () {
    const API = () => window.EducatIA.API;
    const Router = () => window.EducatIA.Router;
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const PLAN_LOAD_TIMEOUT_MS = 1600;
    let activeProgram = window.sessionStorage.getItem('educatia_pricing_program') || 'universidad';
    if (!['universidad', 'preparatoria'].includes(activeProgram)) {
        activeProgram = 'universidad';
    }
    let cachedPlans = null;
    let cachedSubscription = null;

    const fallbackPlans = [
        {
            id: 'educatia-mensual',
            name: 'EducatIA mensual',
            short_name: 'Mensual',
            months: 1,
            amount: 39900,
            currency: 'mxn',
            badge: 'Todo incluido',
            description: 'Cursos, simulacros y rutas completas de preparación EXANI-II.',
            discount_label: null,
            features: ['Todos los cursos publicados', 'Práctica por habilidad', 'Simulacros disponibles', 'Rutas personalizadas'],
            exam_level: 'exani_ii',
            audience: 'universidad',
            ai_tutor_enabled: false,
            launch_promotion_enabled: false,
            launch_promotion_free_months: 0,
            launch_promotion_max_customers: 0,
        },
        {
            id: 'educatia-3-meses',
            name: 'Plan 3 meses EducatIA',
            short_name: '3 meses',
            months: 3,
            amount: 79900,
            currency: 'mxn',
            badge: 'Ritmo constante',
            highlight: true,
            description: 'Acceso por 3 meses para sostener una ruta de estudio constante en EducatIA.',
            discount_label: null,
            features: ['Todo lo del mensual', 'Seguimiento de avance', 'Práctica guiada', 'Acompañamiento semanal'],
            exam_level: 'exani_ii',
            audience: 'universidad',
            ai_tutor_enabled: false,
        },
        {
            id: 'educatia-6-meses',
            name: 'Plan 6 meses EducatIA',
            short_name: '6 meses',
            months: 6,
            amount: 119900,
            currency: 'mxn',
            badge: 'Mejor ritmo',
            description: 'Acceso semestral para preparar admisión con más tiempo.',
            discount_label: null,
            features: ['Todo lo del plan 3 meses', 'Bill, tutor contextual para dudas durante las clases', 'Laboratorio interactivo de aprendizaje', 'Seguimiento extendido', 'Práctica por módulos'],
            exam_level: 'exani_ii',
            audience: 'universidad',
            ai_tutor_enabled: true,
        },
        {
            id: 'educatia-anual',
            name: 'EducatIA 1 año',
            short_name: '1 año',
            months: 12,
            amount: 179900,
            currency: 'mxn',
            badge: 'Máximo acceso',
            description: 'Acceso anual a cursos, práctica, laboratorio y simulacros ilimitados.',
            discount_label: null,
            features: ['Todos los cursos, módulos y rutas', 'Seguimiento continuo durante todo el año', 'Laboratorio interactivo', 'Simulacros ilimitados'],
            exam_level: 'exani_ii',
            audience: 'universidad',
            ai_tutor_enabled: false,
        },
        {
            id: 'prepa-basico',
            name: 'EducatIA Preparatoria Básico',
            short_name: 'Básico',
            months: 1,
            amount: 29900,
            currency: 'mxn',
            badge: '5 simulacros/mes',
            description: 'Acceso mensual para EXANI-I con cursos generales y 5 simulacros al mes.',
            discount_label: 'Preparación EXANI-I mensual',
            features: ['Comprensión lectora', 'Redacción indirecta', 'Pensamiento matemático', '5 exámenes simulacro al mes'],
            exam_level: 'exani_i',
            audience: 'preparatoria',
            monthly_simulator_limit: 5,
            ai_tutor_enabled: false,
        },
        {
            id: 'prepa-pro',
            name: 'EducatIA Preparatoria Pro',
            short_name: 'Pro',
            months: 1,
            amount: 49900,
            currency: 'mxn',
            badge: '15 simulacros/mes',
            highlight: true,
            description: 'Preparación mensual EXANI-I con más simulacros y práctica guiada.',
            discount_label: 'Preparación EXANI-I mensual',
            features: ['Todo lo del Básico', '15 exámenes simulacro al mes', 'Recomendaciones por desempeño', 'Práctica diaria'],
            exam_level: 'exani_i',
            audience: 'preparatoria',
            monthly_simulator_limit: 15,
            ai_tutor_enabled: false,
        },
        {
            id: 'prepa-pro-plus',
            name: 'EducatIA Preparatoria Pro+',
            short_name: 'Pro+',
            months: 1,
            amount: 69900,
            currency: 'mxn',
            badge: 'Práctica intensiva',
            description: 'Acceso máximo EXANI-I con cursos completos y 35 simulacros al mes.',
            discount_label: 'Preparación EXANI-I mensual',
            features: ['Todo lo del Pro', '35 exámenes simulacro al mes', 'Seguimiento de desempeño', 'Práctica intensiva'],
            exam_level: 'exani_i',
            audience: 'preparatoria',
            monthly_simulator_limit: 35,
            ai_tutor_enabled: false,
        },
    ];

    function amountValue(amount) {
        return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format((Number(amount) || 0) / 100);
    }

    function currencyLabel(currency) {
        return String(currency || 'mxn').toUpperCase();
    }

    function programOf(plan) {
        return plan?.audience === 'preparatoria' || plan?.exam_level === 'exani_i' || String(plan?.id || '').startsWith('prepa-')
            ? 'preparatoria'
            : 'universidad';
    }

    function period(plan) {
        if (programOf(plan) === 'preparatoria') return '/ mes';
        const months = Number(plan.months || 1);
        return months === 1 ? '/ mes' : `/ ${months} meses`;
    }

    function monthlyEquivalent(plan) {
        if (programOf(plan) === 'preparatoria') {
            const limit = Number(plan.monthly_simulator_limit || 0);
            return limit ? `${limit} simulacros EXANI-I al mes` : 'Plan mensual EXANI-I';
        }
        const months = Number(plan.months || 1);
        if (months <= 1) return 'Pago mensual flexible';
        const monthly = Math.round(((Number(plan.amount) || 0) / 100) / months);
        return `Equivale a $${new Intl.NumberFormat('es-MX').format(monthly)} MXN al mes`;
    }

    function planHeadline(plan) {
        if (programOf(plan) === 'preparatoria') {
            if (plan.id === 'prepa-basico') return 'Para iniciar tu ingreso a preparatoria';
            if (plan.id === 'prepa-pro') return 'Para practicar con más ritmo';
            return 'Para practicar con mayor frecuencia y medir tu avance';
        }
        const months = Number(plan.months || 1);
        if (months === 1) return 'Para empezar con todo EducatIA';
        if (months === 3) return 'Para sostener un ritmo constante';
        if (months === 6) return 'Para preparar con calma y avance';
        return 'Para acceso máximo durante todo el año';
    }

    function isCurrentPlan(plan, currentSubscription) {
        if (!currentSubscription?.active) return false;
        if (currentSubscription.plan_id && currentSubscription.plan_id === plan.id) return true;
        const sameProgram = !currentSubscription.audience || currentSubscription.audience === plan.audience;
        const sameAmount = Math.round(Number(currentSubscription.amount || 0) * 100) === Number(plan.amount || 0);
        return sameProgram && sameAmount && Number(currentSubscription.months || 0) === Number(plan.months || 0);
    }

    function planTrialDays(plan) {
        const configured = Number(plan?.trial_days);
        return Number.isFinite(configured) && configured >= 0 ? configured : 7;
    }

    function launchPromotion(plan) {
        const freeMonths = Math.max(0, Number(plan?.launch_promotion_free_months || 0));
        const maxCustomers = Math.max(0, Number(plan?.launch_promotion_max_customers || 0));
        const enabled = plan?.id === 'educatia-mensual'
            && plan?.launch_promotion_enabled === true
            && Number.isInteger(freeMonths)
            && Number.isInteger(maxCustomers)
            && freeMonths > 0
            && maxCustomers > 0;
        return { enabled, freeMonths, maxCustomers, trialDays: planTrialDays(plan) };
    }

    function ctaLabel(plan, currentSubscription) {
        if (isCurrentPlan(plan, currentSubscription)) return 'Plan actual';
        const trialDays = planTrialDays(plan);
        if (!currentSubscription?.active && trialDays > 0) return `Probar ${trialDays} días gratis`;
        const user = API().getUser?.();
        if (user) return `Elegir ${plan.short_name || plan.name}`;
        return 'Crear cuenta y elegir';
    }

    function renderPlan(plan, index, currentSubscription) {
        const featured = Boolean(plan.highlight);
        const current = isCurrentPlan(plan, currentSubscription);
        const program = programOf(plan);
        const promotion = launchPromotion(plan);
        return `
            <article class="pricing-card pricing-card--${esc(program)} ${featured ? 'pricing-card--featured' : ''} ${current ? 'pricing-card--current' : ''}" style="--delay:${index * 70}ms">
                <div class="pricing-card__header">
                    <h2>${esc(plan.short_name || plan.name)}</h2>
                    <span class="pricing-card__badge">${esc(current ? 'Plan actual' : (plan.badge || 'Plan EducatIA'))}</span>
                </div>
                <p class="pricing-card__headline">${esc(planHeadline(plan))}</p>
                <div class="pricing-card__price" aria-label="${esc(plan.name)} ${esc(currencyLabel(plan.currency))}">
                    <span class="pricing-card__currency">$</span>
                    <strong>${esc(amountValue(plan.amount))}</strong>
                    <span class="pricing-card__period">${esc(currencyLabel(plan.currency))} ${esc(period(plan))}</span>
                </div>
                <p class="pricing-card__description">${esc(plan.description)}</p>
                ${planTrialDays(plan) > 0 && !currentSubscription?.active ? `
                    <p class="pricing-card__trial">Primera suscripción: ${esc(planTrialDays(plan))} días sin cargo</p>
                ` : ''}
                ${promotion.enabled && !currentSubscription?.active ? `
                    <div class="pricing-card__promotion">
                        <strong>${esc(promotion.freeMonths)} mensualidades adicionales sin cargo</strong>
                        <span>Después del primer mes cobrado. Limitado a las primeras ${esc(promotion.maxCustomers)} compras mensuales confirmadas.</span>
                    </div>
                ` : ''}
                <button type="button" class="pricing-card__cta" data-pricing-plan="${esc(plan.id)}"${current ? ' disabled aria-disabled="true"' : ''}>
                    ${esc(ctaLabel(plan, currentSubscription))}
                </button>
                <p class="pricing-card__equivalent">${esc(monthlyEquivalent(plan))}</p>
                <ul>
                    ${(plan.features || []).map((item) => `<li>${esc(item)}</li>`).join('')}
                </ul>
                ${plan.discount_label ? `<p class="pricing-card__discount">${esc(plan.discount_label)}</p>` : ''}
            </article>
        `;
    }

    function normalizePlan(plan) {
        if (!plan || typeof plan !== 'object') return null;
        const normalized = { ...plan };
        if (normalized.amount === undefined && normalized.amount_cents !== undefined) {
            normalized.amount = normalized.amount_cents;
        }
        return normalized;
    }

    function mergePlans(remotePlans) {
        const byId = new Map(fallbackPlans.map((plan) => [plan.id, normalizePlan(plan)]));
        (Array.isArray(remotePlans) ? remotePlans : [])
            .map(normalizePlan)
            .filter(Boolean)
            .forEach((plan) => {
                const fallback = byId.get(plan.id) || {};
                byId.set(plan.id, { ...fallback, ...plan });
            });
        return Array.from(byId.values());
    }

    async function loadPlans() {
        try {
            const plans = await Promise.race([
                API().getPricingPlans(),
                new Promise((resolve) => setTimeout(() => resolve(null), PLAN_LOAD_TIMEOUT_MS)),
            ]);
            return mergePlans(plans);
        } catch {
            return fallbackPlans;
        }
    }

    async function loadCurrentSubscription() {
        if (!API().getUser?.()) return null;
        try {
            return await API().getCurrentSubscription();
        } catch {
            return null;
        }
    }

    function bindPlanButtons() {
        document.querySelectorAll('[data-pricing-plan]').forEach((button) => {
            button.addEventListener('click', () => {
                const planId = button.dataset.pricingPlan;
                window.sessionStorage.setItem('educatia_pending_plan', planId);
                if (API().getUser?.()) {
                    Router().navigate('/checkout?plan_id=' + encodeURIComponent(planId));
                    return;
                }
                Router().navigate('/registro-alumno?plan_id=' + encodeURIComponent(planId));
            });
        });

        document.querySelectorAll('[data-pricing-program]').forEach((button) => {
            button.addEventListener('click', () => {
                activeProgram = button.dataset.pricingProgram || 'universidad';
                window.sessionStorage.setItem('educatia_pricing_program', activeProgram);
                paintPlans(document.getElementById('app'), cachedPlans || fallbackPlans, cachedSubscription);
            });
        });
    }

    function currentSubscriptionBanner(currentSubscription) {
        if (!currentSubscription?.active) return '';
        const until = currentSubscription.suscripcion_hasta ? String(currentSubscription.suscripcion_hasta).slice(0, 10) : 'fecha no disponible';
        const planName = currentSubscription.short_name || currentSubscription.plan_name || 'Premium';
        return `
            <div class="pricing-current-plan">
                <span>Tu plan actual</span>
                <strong>${esc(planName)}</strong>
                <p>Activo hasta ${esc(until)}. Para cambiarlo, Stripe mostrará el importe y la fecha de aplicación antes de que confirmes.</p>
            </div>
        `;
    }

    function trialOfferBanner(plans, currentSubscription) {
        if (currentSubscription?.active) return '';
        const trialDays = Math.max(0, ...plans.map(planTrialDays));
        if (!trialDays) return '';
        const hasLaunchOffer = plans.some((plan) => launchPromotion(plan).enabled);
        const renewalText = hasLaunchOffer
            ? 'Al terminar la prueba, Stripe cobra el primer mes. Si el primer cobro mensual obtiene uno de los lugares promocionales, se aplican después las mensualidades sin cargo descritas arriba.'
            : 'Al terminar la prueba, el plan se renueva automáticamente al precio y periodicidad elegidos, salvo que canceles antes desde el portal seguro de Stripe.';
        return `
            <aside class="pricing-trial" aria-label="Condiciones de la prueba gratuita">
                <div class="pricing-trial__mark" aria-hidden="true">${esc(trialDays)}</div>
                <div>
                    <strong>${esc(trialDays)} días gratis en tu primera suscripción</strong>
                    <p>Se requiere una tarjeta. ${esc(renewalText)}</p>
                </div>
            </aside>
        `;
    }

    function launchPromotionBanner(plans, currentSubscription) {
        if (currentSubscription?.active) return '';
        const offer = plans.map(launchPromotion).find((promotion) => promotion.enabled);
        if (!offer) return '';
        const firstChargeText = offer.trialDays > 0
            ? `Tienes ${offer.trialDays} días de prueba con tarjeta. Si no cancelas, Stripe cobra el primer mes.`
            : 'Stripe cobra el primer mes al confirmar la suscripción.';
        return `
            <aside class="pricing-promotion" aria-label="Promoción de lanzamiento">
                <span class="pricing-promotion__eyebrow">Promoción de lanzamiento</span>
                <strong>Compra un mes y recibe ${esc(offer.freeMonths)} mensualidades adicionales sin cargo</strong>
                <p>${esc(firstChargeText)} Si aún hay cupo entre las primeras ${esc(offer.maxCustomers)} compras confirmadas, las siguientes ${esc(offer.freeMonths)} mensualidades quedan sin cargo.</p>
                <p>Después, la suscripción vuelve a renovarse mensualmente al precio vigente. Puedes cancelar cuando quieras; al cancelar pierdes los beneficios promocionales que todavía no se hayan aplicado.</p>
                <small>Ver esta oferta o iniciar el checkout no reserva un lugar. El cupo se asigna al aprobarse el primer cobro.</small>
            </aside>
        `;
    }

    function programCopy() {
        if (activeProgram === 'preparatoria') {
            return {
                title: 'Planes para entrar a preparatoria',
                text: 'Acceso mensual a Comprensión lectora, Redacción indirecta y Pensamiento matemático, con límites de simulacros según el plan.',
            };
        }
        return {
            title: 'Mejora tu plan',
            text: 'Elige el periodo que mejor se adapte a tu preparación. El precio final, la vigencia y las funciones incluidas aparecen antes de confirmar.',
        };
    }

    function paintPlans(app, plans, currentSubscription = null) {
        cachedPlans = plans;
        cachedSubscription = currentSubscription;
        const copy = programCopy();
        const sourcePlans = Array.isArray(plans) && plans.length ? plans : fallbackPlans;
        let visiblePlans = sourcePlans.filter((plan) => programOf(plan) === activeProgram);
        if (activeProgram === 'preparatoria' && visiblePlans.length < 3) {
            const byId = new Map(visiblePlans.map((plan) => [plan.id, plan]));
            fallbackPlans
                .filter((plan) => programOf(plan) === 'preparatoria')
                .forEach((plan) => {
                    if (!byId.has(plan.id)) {
                        byId.set(plan.id, plan);
                    }
                });
            visiblePlans = Array.from(byId.values());
        }
        if (!visiblePlans.length) {
            visiblePlans = fallbackPlans.filter((plan) => programOf(plan) === activeProgram);
        }
        app.innerHTML = `
            <main class="pricing-page">
                <section class="pricing-hero">
                    <h1>${esc(copy.title)}</h1>
                    <p>${esc(copy.text)}</p>
                    ${currentSubscriptionBanner(currentSubscription)}
                    ${launchPromotionBanner(visiblePlans, currentSubscription)}
                    ${trialOfferBanner(visiblePlans, currentSubscription)}
                    <div class="pricing-switch pricing-switch--program" role="group" aria-label="Tipo de examen">
                        <button type="button" data-pricing-program="universidad" aria-pressed="${activeProgram === 'universidad'}" class="${activeProgram === 'universidad' ? 'is-active' : ''}">Universidad</button>
                        <button type="button" data-pricing-program="preparatoria" aria-pressed="${activeProgram === 'preparatoria'}" class="${activeProgram === 'preparatoria' ? 'is-active' : ''}">Preparatoria</button>
                    </div>
                </section>

                <section class="pricing-grid pricing-grid--${esc(activeProgram)}" aria-label="Planes EducatIA">
                    ${visiblePlans.map((plan, index) => renderPlan(plan, index, currentSubscription)).join('')}
                </section>
            </main>
            ${window.EducatIA.ProgramCatalog.section()}
        `;
        bindPlanButtons();
    }

    async function render() {
        const app = document.getElementById('app');
        const requestedProgram = Router().getQueryParams?.().get('program');
        if (requestedProgram === 'universidad' || requestedProgram === 'preparatoria') {
            activeProgram = requestedProgram;
            window.sessionStorage.setItem('educatia_pricing_program', activeProgram);
        }
        paintPlans(app, fallbackPlans);
        const [plans, currentSubscription] = await Promise.all([loadPlans(), loadCurrentSubscription()]);
        paintPlans(app, plans, currentSubscription);
    }

    return { render };
})();
