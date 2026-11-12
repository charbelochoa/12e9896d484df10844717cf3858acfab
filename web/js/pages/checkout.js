/* ================================================================
   educatIA - Stripe Elements checkout
   ================================================================ */

window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Checkout = (function () {
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;
    const esc = (value) => window.EducatIA.Utils.escapeHtml(value);

    let activeElements = null;
    let activeStripe = null;
    let checkoutRequestId = null;
    let stripeLibraryPromise = null;

    function ensureStripeLibrary() {
        if (window.Stripe) return Promise.resolve(window.Stripe);
        if (stripeLibraryPromise) return stripeLibraryPromise;

        stripeLibraryPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-educatia-stripe]');
            const script = existing || document.createElement('script');
            let settled = false;
            let timeoutId = null;
            const cleanup = (removeScript = false) => {
                if (timeoutId) window.clearTimeout(timeoutId);
                script.removeEventListener('load', finish);
                script.removeEventListener('error', fail);
                if (removeScript) script.remove();
            };
            const finish = () => {
                if (settled) return;
                settled = true;
                cleanup(!window.Stripe);
                if (window.Stripe) {
                    resolve(window.Stripe);
                    return;
                }
                stripeLibraryPromise = null;
                reject(new Error('Stripe no está disponible en este momento.'));
            };
            const fail = () => {
                if (settled) return;
                settled = true;
                cleanup(true);
                stripeLibraryPromise = null;
                reject(new Error('No se pudo cargar Stripe.js. Revisa tu conexión e intenta nuevamente.'));
            };
            timeoutId = window.setTimeout(() => {
                if (settled) return;
                settled = true;
                cleanup(true);
                stripeLibraryPromise = null;
                reject(new Error('Stripe tardó demasiado en responder. Intenta nuevamente.'));
            }, 15000);
            script.addEventListener('load', finish, { once: true });
            script.addEventListener('error', fail, { once: true });
            if (!existing) {
                fail();
            }
        });
        return stripeLibraryPromise;
    }

    function elementsAppearance() {
        return {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#111111',
                    colorBackground: '#ffffff',
                    colorText: '#111111',
                    colorDanger: '#9f1239',
                    colorTextSecondary: '#666666',
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                    borderRadius: '6px',
                    spacingUnit: '4px',
                },
                rules: {
                    '.Input': {
                        border: '1px solid #d9d9d9',
                        boxShadow: 'none',
                    },
                    '.Input:focus': {
                        border: '1px solid #111111',
                        boxShadow: '0 0 0 1px #111111',
                    },
                    '.Label': {
                        fontWeight: '600',
                    },
                    '.Tab': {
                        border: '1px solid #d9d9d9',
                        boxShadow: 'none',
                    },
                    '.Tab--selected': {
                        border: '1px solid #111111',
                        boxShadow: '0 0 0 1px #111111',
                    },
                },
            };
    }

    function formatMoney(amount, currency) {
        try {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: String(currency || 'usd').toUpperCase(),
                maximumFractionDigits: 2,
            }).format((Number(amount) || 0) / 100);
        } catch {
            return `$${((Number(amount) || 0) / 100).toFixed(2)} ${String(currency || 'usd').toUpperCase()}`;
        }
    }

    function courseIdFromQuery() {
        const raw = Router().getQueryParams().get('course_id');
        const parsed = Number(raw);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }

    function planIdFromQuery() {
        return Router().getQueryParams().get('plan_id') || Router().getQueryParams().get('plan') || null;
    }

    function checkoutReturnUrl(courseId, planId) {
        const params = new URLSearchParams({ payment: 'success', status: 'complete' });
        if (courseId) params.set('course_id', courseId);
        if (planId) params.set('plan_id', planId);
        const suffix = '?' + params.toString();
        return window.location.origin + Router().toUrl('/personalizacion' + suffix);
    }

    function currentCheckoutRequestId() {
        if (!checkoutRequestId) {
            checkoutRequestId = window.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
                const value = Math.floor(Math.random() * 16);
                return (char === 'x' ? value : ((value & 0x3) | 0x8)).toString(16);
            });
        }
        return checkoutRequestId;
    }

    function renderFrame(body) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="checkout-page" aria-label="Checkout EducatIA">
                <div class="checkout-page__shell">
                    ${body}
                </div>
            </section>
        `;
    }

    function renderLoading() {
        renderFrame(`
            <div class="checkout-card checkout-card--center">
                ${C().renderLoading({ label: 'Preparando checkout', compact: true })}
                <p>Preparando tu acceso seguro.</p>
            </div>
        `);
    }

    function renderError(title, message) {
        renderFrame(`
            <div class="checkout-card checkout-card--center">
                <span class="checkout-page__eyebrow">Checkout</span>
                <h1>${esc(title || 'No se pudo abrir el checkout')}</h1>
                <p>${esc(message || 'Intenta nuevamente en unos minutos.')}</p>
                <div class="checkout-page__actions">
                    <button class="checkout-page__primary" type="button" data-checkout-retry>Reintentar</button>
                    <a class="checkout-page__secondary" href="${Router().toUrl('/dashboard')}">Volver</a>
                </div>
            </div>
        `);

        document.querySelector('[data-checkout-retry]')?.addEventListener('click', render);
    }

    function renderComplete() {
        renderFrame(`
            <div class="checkout-card checkout-card--center">
                <span class="checkout-page__eyebrow">Operación confirmada</span>
                <h1>Estamos activando tu acceso</h1>
                <p>Stripe confirmó la operación. Tu suscripción o prueba gratuita se reflejará en cuanto termine la validación segura.</p>
                <div class="checkout-page__actions">
                    <a class="checkout-page__primary" href="${Router().toUrl('/personalizacion?payment=success')}">Personalizar mi ruta</a>
                    <a class="checkout-page__secondary" href="${Router().toUrl('/dashboard')}">Ir a mi aprendizaje</a>
                </div>
            </div>
        `);
        API().getMe?.().catch(() => {});
    }

    function renderCheckout(config, courseId, planId) {
        const currentUser = API().getUser?.() || {};
        const defaultEmail = currentUser.email || '';
        const periodLabel = Number(config.meses_acceso || 1) === 1
            ? 'al mes'
            : `por ${Number(config.meses_acceso)} meses`;
        const priceLabel = `${formatMoney(config.amount, config.currency)} ${periodLabel}`;
        const trialDays = Number(config.trial_days || 0);
        const hasTrial = Boolean(config.trial_eligible && trialDays > 0);
        const promotionFreeMonths = Math.max(0, Number(config.launch_promotion_free_months || 0));
        const promotionMaxCustomers = Math.max(0, Number(config.launch_promotion_max_customers || 0));
        const hasLaunchPromotion = config.plan_id === 'educatia-mensual'
            && config.launch_promotion_enabled === true
            && config.launch_promotion_eligible === true
            && Number.isInteger(promotionFreeMonths)
            && Number.isInteger(promotionMaxCustomers)
            && promotionFreeMonths > 0
            && promotionMaxCustomers > 0;
        const priceLead = hasTrial
            ? `${trialDays} días gratis; después ${priceLabel}`
            : priceLabel;
        const courseCopy = config.course_title
            ? `<p class="checkout-summary__course">Curso seleccionado: <strong>${esc(config.course_title)}</strong></p>`
            : '';
        const features = Array.isArray(config.features) ? config.features : [];
        const firstChargeCopy = hasTrial
            ? 'Después de la prueba, Stripe cobra el primer mes.'
            : 'Stripe cobra el primer mes al confirmar esta suscripción.';
        const launchPromotionCopy = hasLaunchPromotion ? `
            <div class="checkout-summary__promotion" role="note">
                <span>Promoción de lanzamiento</span>
                <strong>${esc(promotionFreeMonths)} mensualidades adicionales sin cargo</strong>
                <p>${esc(firstChargeCopy)} Si al aprobarse ese cobro sigue disponible uno de los primeros ${esc(promotionMaxCustomers)} lugares, las siguientes ${esc(promotionFreeMonths)} mensualidades quedan sin cargo.</p>
            </div>
        ` : '';
        const renewalCopy = hasLaunchPromotion
            ? ` Después de las ${promotionFreeMonths} mensualidades promocionales, la suscripción vuelve a renovarse mensualmente al precio vigente. Puedes cancelar cuando quieras; al cancelar pierdes cualquier beneficio promocional futuro que aún no se haya aplicado.`
            : '';
        const finePrint = hasTrial
            ? `La tarjeta es obligatoria para iniciar la prueba. No se cobra hoy; después de ${trialDays} días Stripe cobrará el primer mes, salvo que canceles antes.${renewalCopy}`
            : `Los datos de tarjeta se capturan directamente por Stripe mediante Elements. EducatIA no almacena información bancaria.${renewalCopy}`;

        renderFrame(`
            <div class="checkout-page__layout">
                <aside class="checkout-summary" aria-label="Resumen de compra">
                    <span class="checkout-page__eyebrow">EducatIA Premium</span>
                    <h1>${esc(config.plan_name || 'Activa tu acceso completo')}</h1>
                    <p class="checkout-summary__lead">${esc(config.plan_description || 'Acceso completo a cursos, evaluaciones y seguimiento académico dentro de EducatIA.')}</p>
                    ${courseCopy}
                    <div class="checkout-summary__price">
                        <strong>${esc(priceLead)}</strong>
                        ${config.discount_label ? `<span>${esc(config.discount_label)}</span>` : ''}
                    </div>
                    ${launchPromotionCopy}
                    <div class="checkout-summary__details">
                        <div>
                            <span>Plan</span>
                            <strong>${esc(config.plan_name || 'EducatIA Premium')}</strong>
                        </div>
                        <div>
                            <span>Periodo inicial</span>
                            <strong>${esc(config.meses_acceso || 1)} ${Number(config.meses_acceso || 1) === 1 ? 'mes' : 'meses'}</strong>
                        </div>
                        <div>
                            <span>Procesador</span>
                            <strong>Stripe</strong>
                        </div>
                    </div>
                    <ul class="checkout-summary__features">
                        ${features.map((item) => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                    <p class="checkout-summary__fine">${esc(finePrint)}</p>
                </aside>

                <section class="checkout-card" aria-label="Formulario de pago">
                    <div class="checkout-card__head">
                        <span class="checkout-page__eyebrow">Pago seguro</span>
                        <h2>Método de pago</h2>
                    </div>
                    <form id="checkout-payment-form" class="checkout-form">
                        <label class="checkout-form__field" for="checkout-billing-email">
                            <span>Correo para confirmación y acceso</span>
                            <input id="checkout-billing-email" type="email" autocomplete="email" required value="${esc(defaultEmail)}" placeholder="tu-correo@ejemplo.com">
                        </label>
                        <div id="checkout-payment-element" class="checkout-form__element"></div>
                        <div id="checkout-payment-message" class="checkout-form__message" role="alert"></div>
                        <button id="checkout-submit" class="checkout-page__primary checkout-page__primary--full" type="submit">
                            ${hasTrial ? `Iniciar prueba de ${trialDays} días` : 'Confirmar suscripción'}
                        </button>
                    </form>
                    <div class="checkout-card__footer">
                        <span>Transaccion cifrada</span>
                        <span>Cancelación disponible en cualquier momento</span>
                    </div>
                </section>
            </div>
        `);

        activeStripe = window.Stripe(config.publishable_key);
        activeElements = activeStripe.elements({
            mode: 'subscription',
                amount: config.amount,
                currency: config.currency,
            appearance: elementsAppearance(),
        });

        const paymentElement = activeElements.create('payment', {
            layout: {
                type: 'tabs',
                defaultCollapsed: false,
            },
        });
        paymentElement.mount('#checkout-payment-element');

        const form = document.getElementById('checkout-payment-form');
        const submit = document.getElementById('checkout-submit');
        const message = document.getElementById('checkout-payment-message');
        const billingEmailInput = document.getElementById('checkout-billing-email');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (submit.disabled) {
                return;
            }

            submit.disabled = true;
            submit.textContent = 'Procesando...';
            message.textContent = '';
            const billingEmail = String(billingEmailInput?.value || '').trim();
            if (!billingEmail || !(billingEmailInput?.checkValidity?.() ?? false)) {
                message.textContent = 'Ingresa un correo válido para recibir la confirmación.';
                submit.disabled = false;
                submit.textContent = hasTrial ? `Iniciar prueba de ${trialDays} días` : 'Confirmar suscripción';
                billingEmailInput?.focus();
                return;
            }

            const { error: submitError } = await activeElements.submit();
            if (submitError) {
                message.textContent = submitError.message || 'Revisa los datos del pago.';
                submit.disabled = false;
                submit.textContent = hasTrial ? `Iniciar prueba de ${trialDays} días` : 'Confirmar suscripción';
                return;
            }

            try {
                const subscription = await API().createSubscription(
                    courseId,
                    planId || config.plan_id,
                    billingEmail,
                    currentCheckoutRequestId()
                );
                const confirmOptions = {
                    elements: activeElements,
                    clientSecret: subscription.client_secret,
                    confirmParams: {
                        return_url: checkoutReturnUrl(courseId, planId || config.plan_id),
                    },
                    redirect: 'if_required',
                };
                const { error } = subscription.type === 'setup'
                    ? await activeStripe.confirmSetup(confirmOptions)
                    : await activeStripe.confirmPayment(confirmOptions);

                if (error) {
                    throw error;
                }

                renderComplete();
            } catch (error) {
                message.textContent = error.message || 'No se pudo confirmar la suscripción.';
                submit.disabled = false;
                submit.textContent = hasTrial ? `Iniciar prueba de ${trialDays} días` : 'Confirmar suscripción';
            }
        });
    }

    async function renderProgramCheckout(program) {
        renderLoading();
        try {
            const response = await API().getCourses({ programa: program });
            if (Router().getCurrentRoute() !== '/checkout' || Router().getQueryParams().get('programa') !== program) return;
            const course = (Array.isArray(response) ? response : response.items || []).find(item => item.programa === program && item.publicado);
            if (!course) throw new Error('Este curso todavía no está disponible para inscripción.');
            const detail = Router().toUrl('/curso/' + course.id);
            const user = API().getUser?.();
            if (user) {
                const currentCourse = await API().getCourse(course.id);
                if (Router().getCurrentRoute() !== '/checkout') return;
                if (currentCourse.acceso_autorizado) {
                    renderFrame(`<div class="checkout-card checkout-card--center"><h1>Ya tienes acceso a este curso</h1><p>${esc(course.titulo)}</p><a class="checkout-page__primary" href="${detail}">Ir al curso</a></div>`);
                    return;
                }
            }
            const [config] = await Promise.all([API().getProgramElementsConfig(course.id), ensureStripeLibrary()]);
            if (Router().getCurrentRoute() !== '/checkout' || Router().getQueryParams().get('programa') !== program) return;
            const requestId = window.crypto.randomUUID();
            const price = formatMoney(config.amount, config.currency) + ' MXN';
            renderFrame(`<div class="checkout-page__layout">
                <aside class="checkout-summary" aria-label="Resumen de compra">
                    <span class="checkout-page__eyebrow">Formación en inteligencia artificial</span>
                    <h1>${esc(course.titulo)}</h1><p class="checkout-summary__lead">${esc(course.descripcion)}</p>
                    <div class="checkout-summary__price"><strong>${esc(price)}</strong><span>Pago único</span></div>
                    <div class="checkout-summary__details"><div><span>Moneda</span><strong>MXN</strong></div><div><span>Acceso al curso</span><strong>${config.access_months} meses</strong></div><div><span>Renovación</span><strong>No automática</strong></div></div>
                    <ul class="checkout-summary__features"><li>Lecciones y código explicado</li><li>Prácticas, exámenes y seguimiento</li><li>Tareas y archivos para revisión</li></ul>
                    <p class="checkout-summary__fine">Compra de este curso, sin renovación automática. El acceso comienza cuando Stripe confirma el pago. Consulta los <a href="${Router().toUrl('/info/terminos')}">términos de contratación</a> y el <a href="${Router().toUrl('/info/privacidad')}">aviso de privacidad</a>.</p>
                    <a href="${detail}">Consultar el temario completo</a>
                </aside>
                <section class="checkout-card" aria-label="Formulario de pago">
                    <div class="checkout-card__head"><span class="checkout-page__eyebrow">Pago seguro</span><h2>Método de pago</h2></div>
                    <form id="checkout-payment-form" class="checkout-form">
                        ${!user ? '<p>Inicia sesión o crea tu cuenta de alumno para asociar la compra a tu aprendizaje.</p>' : ''}
                        <label class="checkout-form__field" for="checkout-billing-email"><span>Correo para confirmación y acceso</span><input id="checkout-billing-email" type="email" autocomplete="email" required value="${esc(user?.email || '')}" placeholder="tu-correo@ejemplo.com"></label>
                        <div id="checkout-payment-element" class="checkout-form__element"></div>
                        <div id="checkout-payment-message" class="checkout-form__message" role="alert"></div>
                        <button id="checkout-submit" class="checkout-page__primary checkout-page__primary--full" type="${user ? 'submit' : 'button'}">${user ? 'Pagar ' + esc(price) : 'Iniciar sesión para inscribirme'}</button>
                    </form>
                    <div class="checkout-card__footer"><span>Transacción cifrada</span><span>Pago único</span></div>
                </section>
            </div>`);
            activeStripe = window.Stripe(config.publishable_key);
            activeElements = activeStripe.elements({ mode: 'payment', amount: config.amount, currency: config.currency,
                paymentMethodTypes: ['card'], appearance: elementsAppearance() });
            activeElements.create('payment', { layout: { type: 'tabs', defaultCollapsed: false } }).mount('#checkout-payment-element');
            const form = document.getElementById('checkout-payment-form');
            const button = document.getElementById('checkout-submit');
            const message = document.getElementById('checkout-payment-message');
            if (!user) button.addEventListener('click', () => C().requireAuth('alumno'));
            form.addEventListener('submit', async event => {
                event.preventDefault();
                if (button.disabled || !C().requireAuth('alumno')) return;
                const email = document.getElementById('checkout-billing-email');
                if (!email.checkValidity()) { email.reportValidity(); return; }
                button.disabled = true; button.textContent = 'Procesando…'; message.textContent = '';
                try {
                    const submitted = await activeElements.submit();
                    if (submitted.error) throw submitted.error;
                    const payment = await API().createProgramElementsPayment(course.id, requestId, email.value.trim());
                    if (payment.amount !== config.amount || payment.currency !== config.currency || payment.access_months !== config.access_months) throw new Error('Las condiciones del curso cambiaron. Actualiza la página antes de pagar.');
                    const result = await activeStripe.confirmPayment({ elements: activeElements, clientSecret: payment.client_secret,
                        confirmParams: { return_url: window.location.origin + detail + '?payment=success', payment_method_data: { billing_details: { email: email.value.trim() } } }, redirect: 'if_required' });
                    if (result.error) throw result.error;
                    await API().refreshCourseAccess(course.id);
                    renderFrame(`<div class="checkout-card checkout-card--center"><h1>Validando tu acceso</h1><p>El pago se está verificando de forma segura. El curso se habilita al recibir la confirmación de Stripe.</p><a class="checkout-page__primary" href="${detail}">Ir al curso</a><a class="checkout-page__secondary" href="${Router().toUrl('/dashboard')}">Mi aprendizaje</a></div>`);
                } catch (error) {
                    message.textContent = error.message || 'No se pudo confirmar el pago. Revisa los datos e intenta nuevamente.';
                    button.disabled = false; button.textContent = 'Pagar ' + price;
                }
            });
        } catch (error) {
            if (Router().getCurrentRoute() === '/checkout') renderError('Inscripción no disponible', error.message);
        }
    }

    async function render() {
        const program = Router().getQueryParams().get('programa');
        if (program) return renderProgramCheckout(program);
        if (!C().requireAuth('alumno')) {
            return;
        }

        const query = Router().getQueryParams();
        if (query.get('status') === 'complete' || query.get('payment_intent_client_secret') || query.get('setup_intent_client_secret')) {
            renderComplete();
            return;
        }

        const user = API().getUser?.();
        if (C().hasPremiumAccess(user)) {
            const subscription = await API().getCurrentSubscription().catch(() => null);
            const canManage = !!subscription?.portal_available;
            renderFrame(`
                <div class="checkout-card checkout-card--center">
                    <span class="checkout-page__eyebrow">Cuenta y facturación</span>
                    <h1>Tu acceso está activo</h1>
                    <p>${canManage
                        ? 'Puedes cambiar de plan o programar la cancelación desde el portal seguro de Stripe.'
                        : 'Tu cuenta tiene acceso institucional; no requiere otro pago.'}</p>
                    <div class="checkout-page__actions">
                        ${canManage ? `
                            <button class="checkout-page__primary" type="button" data-billing-flow="change_plan">Cambiar plan</button>
                            <button class="checkout-page__secondary" type="button" data-billing-flow="cancel">Cancelar suscripción</button>
                        ` : ''}
                        <a class="checkout-page__secondary" href="${Router().toUrl('/compras')}">Ver mi cuenta</a>
                    </div>
                </div>
            `);
            document.querySelectorAll('[data-billing-flow]').forEach((button) => {
                button.addEventListener('click', async () => {
                    const original = button.textContent;
                    button.disabled = true;
                    button.textContent = 'Abriendo Stripe...';
                    try {
                        const result = await API().openBillingPortal(button.dataset.billingFlow);
                        if (!result?.portal_url) throw new Error('Stripe no devolvió una dirección válida.');
                        window.location.assign(result.portal_url);
                    } catch (error) {
                        button.disabled = false;
                        button.textContent = original;
                        C().showWebNotice('Facturación', error.message || 'No se pudo abrir Stripe.', 'error');
                    }
                });
            });
            return;
        }

        renderLoading();
        try {
            await ensureStripeLibrary();
            if (Router().getCurrentRoute() !== '/checkout') return;
            const courseId = courseIdFromQuery();
            const planId = planIdFromQuery();
            const config = await API().getCheckoutConfig(courseId, planId);
            if (Router().getCurrentRoute() !== '/checkout') return;
            renderCheckout(config, courseId, planId || config.plan_id);
        } catch (error) {
            if (Router().getCurrentRoute() !== '/checkout') return;
            renderError('No se pudo preparar el checkout', error.message || 'Intenta nuevamente en unos minutos.');
        }
    }

    return { render };
})();
