/* ================================================================
   educatIA - Configuración de cuenta
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Configuracion = (function () {
    const esc = (value) => window.EducatIA.Utils.escapeHtml(String(value ?? ''));
    const API = () => window.EducatIA.API;
    const C = () => window.EducatIA.Components;
    const Router = () => window.EducatIA.Router;

    function boolAttr(value) {
        return value ? ' checked' : '';
    }

    function renderSessionRows(sessions) {
        if (!sessions?.length) return '<p class="settings-muted">No hay sesiones registradas.</p>';
        return sessions.map((session) => {
            const expiresAt = session.expires_at ? new Date(session.expires_at) : null;
            const expired = session.expired === true
                || (expiresAt && Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() <= Date.now());
            const inactive = Boolean(session.revoked_at) || expired;
            const sessionStatus = expired ? 'Vencida' : (session.revoked_at ? 'Revocada' : 'Activa');
            return `
            <article class="settings-session">
                <div>
                    <strong>${esc(session.ip_address || 'IP no disponible')}</strong>
                    <span>${esc((session.user_agent || 'Dispositivo desconocido').slice(0, 120))}</span>
                    <small>${esc(sessionStatus)} · expira ${esc((session.expires_at || '').slice(0, 10))}</small>
                </div>
                ${inactive ? '' : `<button type="button" class="btn btn--outline btn--sm" data-revoke-session="${esc(session.id)}">Revocar</button>`}
            </article>
        `;
        }).join('');
    }

    function renderAccessibilityControls(preferences) {
        const font = preferences?.font || 'normal';
        const contrast = !!preferences?.contrast;
        const dark = !!preferences?.dark;
        return `
            <div class="settings-a11y" data-settings-a11y>
                <div class="settings-a11y__group" aria-label="Tamaño de lectura">
                    <span>Tamaño de lectura</span>
                    <button type="button" data-settings-a11y-font="normal" aria-pressed="${font === 'normal'}">A</button>
                    <button type="button" data-settings-a11y-font="large" aria-pressed="${font === 'large'}">A+</button>
                    <button type="button" data-settings-a11y-font="xl" aria-pressed="${font === 'xl'}">A++</button>
                </div>
                <div class="settings-a11y__group" aria-label="Modo visual accesible">
                    <button type="button" data-settings-a11y-toggle="contrast" aria-pressed="${contrast}">Alto contraste</button>
                    <button type="button" data-settings-a11y-toggle="dark" aria-pressed="${dark}">Modo oscuro</button>
                </div>
            </div>
        `;
    }

    async function render() {
        if (!C().requireAuth()) return;
        const aleEnabled = window.EducatIA.Features?.ale === true;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando configuración');

        const [user, alePrefs, sessions, currentSubscription] = await Promise.all([
            API().getMe().catch(() => API().getUser?.()),
            aleEnabled ? API().getAlePreferences().catch(() => null) : Promise.resolve(null),
            API().getAuthSessions().catch(() => []),
            API().getCurrentSubscription().catch(() => null),
        ]);
        const subscriptionUntil = currentSubscription?.suscripcion_hasta || user?.suscripcion_hasta || C().userState.subscriptionUntil;
        const hasPremium = C().hasPremiumAccess(user);
        const billingStatus = currentSubscription?.billing_status || null;
        const graceUntil = currentSubscription?.grace_until || null;
        const cancelAtPeriodEnd = !!currentSubscription?.cancel_at_period_end;
        const portalAvailable = !!currentSubscription?.portal_available;
        const a11yPrefs = window.EducatIA.Accessibility?.getPreferences?.() || { font: 'normal', contrast: false, dark: false };

        app.innerHTML = `
            <div class="settings-page">
                <header class="settings-header">
                    <span class="course-detail__section-kicker">Cuenta</span>
                    <h1>Configuración de mi cuenta</h1>
                    <p>Administra tus datos, accesibilidad, seguridad, suscripción y sesiones activas.</p>
                </header>

                <nav class="account-shortcuts" aria-label="Apartados de la cuenta">
                    <a href="${Router().toUrl('/perfil')}"><span>${window.EducatIA.Icons.user}</span><strong>Mi perfil</strong><small>Datos académicos y presentación</small></a>
                    <a href="${Router().toUrl('/compras')}"><span>${window.EducatIA.Icons.grid}</span><strong>Mis compras</strong><small>Plan, pagos y facturación</small></a>
                    <a href="${Router().toUrl('/certificados')}"><span>${window.EducatIA.Icons.award}</span><strong>Mis certificados</strong><small>Documentos verificables</small></a>
                </nav>

                <div class="settings-grid">
                    <section class="settings-card">
                        <h2>Perfil</h2>
                        <form id="settings-profile-form" class="settings-form">
                            <label>
                                <span>Nombre</span>
                                <input class="fi" name="nombre" value="${esc(user?.nombre || '')}" minlength="2">
                            </label>
                            <label>
                                <span>Correo electrónico</span>
                                <input class="fi" name="email" type="email" value="${esc(user?.email || '')}">
                            </label>
                            <label>
                                <span>Contraseña actual <small>(solo si cambias el correo)</small></span>
                                <input class="fi" name="current_password" type="password" autocomplete="current-password">
                            </label>
                            ${user?.oauth_provider ? `
                                <p class="settings-muted">Tu acceso está vinculado con ${esc(user.oauth_provider === 'google' ? 'Google' : 'GitHub')}. Si nunca creaste una contraseña de EducatIA, <a href="#/recuperar-contrasena" data-auth-password-reset>créala desde Recuperar acceso</a> antes de solicitar el cambio.</p>
                            ` : ''}
                            <div class="settings-actions">
                                <button class="btn btn--primary btn--sm" type="submit">Guardar perfil</button>
                            </div>
                            <p class="settings-feedback" id="settings-profile-feedback"></p>
                        </form>
                    </section>

                    <section class="settings-card">
                        <h2>Contraseña</h2>
                        <form id="settings-password-form" class="settings-form">
                            <label>
                                <span>Contraseña actual</span>
                                <input class="fi" name="current_password" type="password" autocomplete="current-password">
                            </label>
                            <label>
                                <span>Nueva contraseña</span>
                                <input class="fi" name="new_password" type="password" autocomplete="new-password" minlength="15">
                            </label>
                            <button class="btn btn--outline btn--sm" type="submit">Actualizar contraseña</button>
                            <p class="settings-feedback" id="settings-password-feedback"></p>
                        </form>
                    </section>

                    ${aleEnabled ? `<section class="settings-card settings-card--wide">
                        <h2>Bill como profesor personal</h2>
                        <form id="settings-ale-form" class="settings-form settings-form--columns">
                            <label>
                                <span>Cómo quieres que Bill te llame</span>
                                <input class="fi" name="preferred_name" value="${esc(alePrefs?.preferred_name || (user?.nombre || '').split(' ')[0] || '')}">
                            </label>
                            <label>
                                <span>Nombre del profesor IA</span>
                                <input class="fi" name="tutor_name" value="${esc(String(alePrefs?.tutor_name || '').trim().toLowerCase() === 'ale' ? 'Bill' : (alePrefs?.tutor_name || 'Bill'))}">
                            </label>
                            <label>
                                <span>Tono</span>
                                <select class="fi" name="tone">
                                    ${['amigable', 'estricto', 'motivador', 'directo'].map((tone) => `<option value="${tone}"${alePrefs?.tone === tone ? ' selected' : ''}>${tone}</option>`).join('')}
                                </select>
                            </label>
                            <label>
                                <span>Estilo de clase</span>
                                <select class="fi" name="teaching_style">
                                    ${['paso_a_paso', 'practico', 'socratico', 'resumen_y_ejercicios'].map((style) => `<option value="${style}"${alePrefs?.teaching_style === style ? ' selected' : ''}>${style.replace(/_/g, ' ')}</option>`).join('')}
                                </select>
                            </label>
                            <label>
                                <span>Idioma</span>
                                <select class="fi" name="language">
                                    <option value="es-MX"${alePrefs?.language === 'es-MX' ? ' selected' : ''}>Español México</option>
                                    <option value="en"${alePrefs?.language === 'en' ? ' selected' : ''}>English</option>
                                </select>
                            </label>
                            <label>
                                <span>Modo visual</span>
                                <select class="fi" name="visual_mode">
                                    ${['system', 'light', 'dark'].map((mode) => `<option value="${mode}"${alePrefs?.visual_mode === mode ? ' selected' : ''}>${mode}</option>`).join('')}
                                </select>
                            </label>
                            <div class="settings-checks">
                                <label><input type="checkbox" name="notifications_email"${boolAttr(alePrefs?.notifications_email ?? true)}> Avisos por correo</label>
                                <label><input type="checkbox" name="notifications_study"${boolAttr(alePrefs?.notifications_study ?? true)}> Recordatorios de estudio</label>
                                <label><input type="checkbox" name="notifications_ai"${boolAttr(alePrefs?.notifications_ai ?? true)}> Mensajes de Bill</label>
                                <label><input type="checkbox" name="accessibility_high_contrast"${boolAttr(alePrefs?.accessibility_settings?.high_contrast)}> Alto contraste</label>
                                <label><input type="checkbox" name="privacy_hide_progress"${boolAttr(alePrefs?.privacy_settings?.hide_progress)}> Ocultar progreso público</label>
                            </div>
                            ${alePrefs?.ai_suspended ? `<p class="settings-alert">Bill está suspendido: ${esc(alePrefs.ai_suspension_reason || 'requiere revisión del administrador.')}</p>` : ''}
                            <button class="btn btn--primary btn--sm" type="submit">Guardar preferencias de Bill</button>
                            <p class="settings-feedback" id="settings-ale-feedback"></p>
                        </form>
                    </section>` : ''}

                    <section class="settings-card">
                        <h2>Accesibilidad</h2>
                        <p class="settings-muted">Ajusta lectura, contraste y modo oscuro desde aquí. El botón flotante ya no aparece durante las clases.</p>
                        ${renderAccessibilityControls(a11yPrefs)}
                        <button class="btn btn--outline btn--sm" type="button" id="settings-a11y-reset">Restablecer accesibilidad</button>
                    </section>

                    <section class="settings-card">
                        <h2>Premium</h2>
                        <div class="settings-plan-summary">
                            <strong>${esc(currentSubscription?.plan_name || (hasPremium ? 'Acceso Premium activo' : 'Sin suscripción activa'))}</strong>
                            <span>${hasPremium ? `Acceso vigente hasta ${esc((subscriptionUntil || '').slice(0, 10))}` : 'Elige el plan que mejor se ajuste a tu preparación.'}</span>
                        </div>
                        <p class="settings-muted">Bill está incluido exclusivamente en el plan de 6 meses y solo aparece mientras ese plan se encuentra activo.</p>
                        ${billingStatus === 'past_due' ? `<p class="settings-alert">Tu renovación está pendiente. Conservas acceso durante el periodo de gracia${graceUntil ? ` hasta ${esc(String(graceUntil).slice(0, 10))}` : ''}. Actualiza tu método de pago.</p>` : ''}
                        ${cancelAtPeriodEnd ? `<p class="settings-alert">La cancelación está programada. Mantendrás acceso hasta ${esc(String(currentSubscription?.current_period_end || subscriptionUntil || '').slice(0, 10))}.</p>` : ''}
                        <div class="settings-actions">
                            <a class="btn btn--primary btn--sm" href="${Router().toUrl('/precios')}">Ver planes</a>
                            ${portalAvailable
                                ? '<button class="btn btn--outline btn--sm" type="button" id="settings-billing-portal">Administrar facturación</button>'
                                : `<a class="btn btn--outline btn--sm" href="${Router().toUrl('/checkout')}">Activar suscripción</a>`}
                        </div>
                        <p class="settings-muted">El portal seguro de Stripe permite actualizar la tarjeta, consultar facturas y cancelar renovaciones.</p>
                        <p class="settings-feedback" id="settings-billing-feedback"></p>
                    </section>

                    <section class="settings-card">
                        <h2>Privacidad y seguridad</h2>
                        <div class="settings-sessions" id="settings-sessions">
                            ${renderSessionRows(sessions)}
                        </div>
                    </section>

                    <section class="settings-card">
                        <h2>Sesión</h2>
                        <p class="settings-muted">Cerrar sesión en este dispositivo.</p>
                        <button class="btn btn--danger" id="logout-btn">Cerrar sesión</button>
                    </section>
                </div>
            </div>
        `;

        document.getElementById('settings-profile-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.currentTarget).entries());
            const feedback = document.getElementById('settings-profile-feedback');
            const emailChanged = String(data.email || '').trim().toLowerCase() !== String(user?.email || '').trim().toLowerCase();
            if (emailChanged && !data.current_password) {
                if (feedback) {
                    feedback.textContent = user?.oauth_provider
                        ? 'Si aún no tienes contraseña de EducatIA, créala desde Recuperar acceso; después vuelve a confirmar el cambio.'
                        : 'Confirma tu contraseña actual para cambiar el correo.';
                }
                return;
            }
            const requestedEmail = String(data.email || '').trim();
            const currentPassword = data.current_password;
            delete data.email;
            delete data.current_password;
            try {
                const updatedUser = await API().updateMe(data);
                if (user && updatedUser) Object.assign(user, updatedUser);
                event.currentTarget.current_password.value = '';
                if (emailChanged) {
                    const result = await API().requestEmailChange(requestedEmail, currentPassword);
                    event.currentTarget.email.value = user?.email || '';
                    if (feedback) feedback.textContent = result.message || 'Revisa el nuevo correo para confirmar el cambio.';
                } else if (feedback) {
                    feedback.textContent = 'Perfil actualizado.';
                }
            } catch (error) {
                if (feedback) feedback.textContent = error.message || 'No fue posible guardar los cambios del perfil.';
            }
        });

        document.getElementById('settings-password-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.currentTarget).entries());
            const feedback = document.getElementById('settings-password-feedback');
            try {
                await API().changePassword(data);
                event.currentTarget.reset();
                if (feedback) feedback.textContent = 'Contraseña actualizada.';
            } catch (error) {
                if (feedback) feedback.textContent = error.message || 'No fue posible actualizar la contraseña.';
            }
        });

        document.getElementById('settings-ale-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = Object.fromEntries(new FormData(form).entries());
            const payload = {
                preferred_name: data.preferred_name,
                tutor_name: String(data.tutor_name || '').trim().toLowerCase() === 'ale' ? 'Bill' : (data.tutor_name || 'Bill'),
                tone: data.tone || 'amigable',
                teaching_style: data.teaching_style || 'paso_a_paso',
                language: data.language || 'es-MX',
                visual_mode: data.visual_mode || 'system',
                notifications_email: form.notifications_email.checked,
                notifications_study: form.notifications_study.checked,
                notifications_ai: form.notifications_ai.checked,
                accessibility_settings: { high_contrast: form.accessibility_high_contrast.checked },
                privacy_settings: { hide_progress: form.privacy_hide_progress.checked },
            };
            const feedback = document.getElementById('settings-ale-feedback');
            try {
                await API().saveAlePreferences(payload);
                if (feedback) feedback.textContent = 'Preferencias guardadas.';
            } catch (error) {
                if (feedback) feedback.textContent = error.message || 'No fue posible guardar las preferencias de Bill.';
            }
        });

        const refreshAccessibilityButtons = () => {
            const prefs = window.EducatIA.Accessibility?.getPreferences?.() || {};
            document.querySelectorAll('[data-settings-a11y-font]').forEach((button) => {
                button.setAttribute('aria-pressed', String(button.dataset.settingsA11yFont === (prefs.font || 'normal')));
            });
            document.querySelectorAll('[data-settings-a11y-toggle]').forEach((button) => {
                const key = button.dataset.settingsA11yToggle;
                button.setAttribute('aria-pressed', String(Boolean(prefs[key])));
            });
        };

        document.querySelectorAll('[data-settings-a11y-font]').forEach((button) => {
            button.addEventListener('click', () => {
                window.EducatIA.Accessibility?.update?.({ font: button.dataset.settingsA11yFont });
                refreshAccessibilityButtons();
            });
        });

        document.querySelectorAll('[data-settings-a11y-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                const prefs = window.EducatIA.Accessibility?.getPreferences?.() || {};
                const key = button.dataset.settingsA11yToggle;
                window.EducatIA.Accessibility?.update?.({ [key]: !prefs[key] });
                refreshAccessibilityButtons();
            });
        });

        document.getElementById('settings-a11y-reset')?.addEventListener('click', () => {
            window.EducatIA.Accessibility?.reset?.();
            refreshAccessibilityButtons();
        });

        document.getElementById('settings-billing-portal')?.addEventListener('click', async (event) => {
            const button = event.currentTarget;
            const feedback = document.getElementById('settings-billing-feedback');
            const original = button.textContent;
            button.disabled = true;
            button.textContent = 'Abriendo Stripe...';
            try {
                const result = await API().openBillingPortal();
                if (!result?.portal_url) throw new Error('Stripe no devolvió una dirección válida.');
                window.location.assign(result.portal_url);
            } catch (error) {
                button.disabled = false;
                button.textContent = original;
                if (feedback) feedback.textContent = error.message || 'No se pudo abrir el portal de facturación.';
            }
        });

        document.querySelectorAll('[data-revoke-session]').forEach((button) => {
            button.addEventListener('click', async () => {
                const confirmed = await C().confirmAction({
                    title: 'Cerrar sesión en otro dispositivo',
                    message: 'Ese dispositivo perderá el acceso y tendrá que iniciar sesión nuevamente.',
                    confirmLabel: 'Cerrar sesión',
                    tone: 'danger'
                });
                if (!confirmed) {
                    return;
                }

                const originalText = button.textContent;
                button.disabled = true;
                button.textContent = 'Revocando...';
                try {
                    await API().revokeAuthSession(button.dataset.revokeSession);
                    render();
                } catch (error) {
                    button.disabled = false;
                    button.textContent = error.message || originalText || 'Revocar';
                }
            });
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => {
            C().logoutWithTransition();
        });
    }

    function money(amount, currency) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: String(currency || 'MXN').toUpperCase(),
        }).format(Number(amount || 0));
    }

    function purchaseStatus(status) {
        const labels = { completado: 'Pagado', fallido: 'Pago fallido', pendiente: 'Pendiente' };
        return labels[status] || status || 'Sin estado';
    }

    async function renderPurchases() {
        if (!C().requireAuth()) return;
        const app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Cargando compras');
        const [history, subscription] = await Promise.all([
            API().getPurchaseHistory().catch(() => []),
            API().getCurrentSubscription().catch(() => null),
        ]);

        app.innerHTML = `
            <main class="account-page purchases-page">
                <header class="account-page__header">
                    <span class="account-page__eyebrow">Cuenta y facturación</span>
                    <h1>Mis compras</h1>
                    <p>Consulta tu plan actual, renovaciones y referencias de pago de educatIA.</p>
                </header>

                <section class="purchase-summary ${subscription?.active ? 'is-active' : ''}">
                    <div>
                        <span>Plan actual</span>
                        <h2>${esc(subscription?.active
                            ? (subscription?.plan_name || (subscription?.portal_available ? 'Acceso Premium' : 'Acceso institucional'))
                            : 'Sin suscripción activa')}</h2>
                        <p>${subscription?.active
                            ? `Acceso vigente hasta ${esc(new Date(subscription.suscripcion_hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }))}.`
                            : 'Puedes elegir un plan cuando estés listo para activar el acceso completo.'}</p>
                    </div>
                    <div class="purchase-summary__actions">
                        ${subscription?.active && subscription?.portal_available ? `
                            <button type="button" class="btn btn--primary" data-purchases-billing-flow="change_plan">Cambiar plan</button>
                            <button type="button" class="btn btn--outline" data-purchases-billing-flow="cancel">Cancelar suscripción</button>
                        ` : ''}
                        ${!subscription?.active ? `<a class="btn btn--primary" href="${Router().toUrl('/precios')}">Ver planes</a>` : ''}
                        ${subscription?.portal_available ? '<button type="button" class="btn btn--outline" data-purchases-billing-flow="manage">Facturas y pagos</button>' : ''}
                    </div>
                </section>

                <section class="account-panel">
                    <div class="account-panel__head">
                        <div>
                            <span class="account-page__eyebrow">Historial</span>
                            <h2>Movimientos de tu cuenta</h2>
                        </div>
                    </div>
                    ${history.length ? `
                        <div class="purchase-list">
                            ${history.map((item) => `
                                <article class="purchase-row">
                                    <div class="purchase-row__date">
                                        <strong>${esc(new Date(item.purchased_at).toLocaleDateString('es-MX', { day: '2-digit' }))}</strong>
                                        <span>${esc(new Date(item.purchased_at).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }))}</span>
                                    </div>
                                    <div>
                                        <strong>${esc(item.plan_name)}</strong>
                                        <span>${esc(item.months)} ${Number(item.months) === 1 ? 'mes' : 'meses'} de acceso${item.support_subscription_id ? ` · Ref. ${esc(item.support_subscription_id)}` : ''}</span>
                                    </div>
                                    <div class="purchase-row__amount">
                                        <strong>${esc(money(item.amount, item.currency))}</strong>
                                        <span class="purchase-status purchase-status--${esc(item.status)}">${esc(purchaseStatus(item.status))}</span>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="account-empty account-empty--compact">
                            <h3>Aún no hay compras registradas</h3>
                            <p>Cuando actives un plan, el movimiento y su referencia aparecerán aquí.</p>
                        </div>
                    `}
                </section>
            </main>
        `;

        const billingResult = new URLSearchParams(window.location.search).get('billing');
        if (billingResult === 'plan-actualizado') {
            C().showWebNotice(
                'Plan actualizado',
                'Stripe confirmó la solicitud. Tu cuenta se actualizará automáticamente con el siguiente evento de facturación.',
                'success'
            );
        } else if (billingResult === 'cancelacion-programada') {
            C().showWebNotice(
                'Cancelación programada',
                'Conservarás el acceso hasta el final del periodo pagado. Te enviamos la confirmación por correo.',
                'success'
            );
        }

        document.querySelectorAll('[data-purchases-billing-flow]').forEach((button) => {
            button.addEventListener('click', async () => {
                const original = button.textContent;
                button.disabled = true;
                button.textContent = 'Abriendo Stripe...';
                try {
                    const flow = button.dataset.purchasesBillingFlow;
                    const result = await API().openBillingPortal(flow === 'manage' ? null : flow);
                    if (!result?.portal_url) throw new Error('No se recibió una dirección válida.');
                    window.location.assign(result.portal_url);
                } catch (error) {
                    button.disabled = false;
                    button.textContent = original;
                    C().showWebNotice('Facturación', error.message || 'No se pudo abrir el portal.', 'error');
                }
            });
        });
    }

    return { render, renderPurchases };
})();
