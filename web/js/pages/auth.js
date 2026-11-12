/* ================================================================
   educatIA — Auth Pages (v4 – Social-first, no email verification)
   Login · Registro alumno · Registro maestro · OAuth callback
   ================================================================ */
window.EducatIA = window.EducatIA || {};
window.EducatIA.Pages = window.EducatIA.Pages || {};

window.EducatIA.Pages.Auth = (function () {
    var esc = function (v) { return window.EducatIA.Utils.escapeHtml(String(v || '')); };
    var API = function () { return window.EducatIA.API; };
    var C   = function () { return window.EducatIA.Components; };
    var R   = function () { return window.EducatIA.Router; };
    var Icons = window.EducatIA.Icons;
    var activeOAuthPopup = null;

    function getPendingPlanPath(role) {
        if (role !== 'alumno') return '';
        var planId = window.sessionStorage.getItem('educatia_pending_plan');
        if (!planId) return '';
        window.sessionStorage.removeItem('educatia_pending_plan');
        return '/checkout?plan_id=' + encodeURIComponent(planId);
    }

    function normalizePostLoginPath(value) {
        var path = String(value || '').trim();
        if (!path || !path.startsWith('/') || path.startsWith('//') || path.indexOf('\\') !== -1) return '';
        return path;
    }

    function rememberPostLoginPath(nextOverride) {
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams(window.location.search || '');
        var next = normalizePostLoginPath(nextOverride) || normalizePostLoginPath(params.get('next'));
        if (next) window.sessionStorage.setItem('educatia_post_login_path', next);
    }

    function getRequestedPostLoginPath(role) {
        if (role !== 'alumno') return '';
        var stored = normalizePostLoginPath(window.sessionStorage.getItem('educatia_post_login_path'));
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams(window.location.search || '');
        var requested = stored || normalizePostLoginPath(params.get('next'));
        window.sessionStorage.removeItem('educatia_post_login_path');
        return requested;
    }

    function getPostLoginPath(role) {
        var pendingPlanPath = getPendingPlanPath(role);
        if (pendingPlanPath) return pendingPlanPath;
        var requestedPath = getRequestedPostLoginPath(role);
        if (requestedPath) return requestedPath;
        if (role === 'admin') return '/';
        return role === 'maestro' ? '/dashboard-maestro' : '/';
    }

    function setMsg(id, text, tone) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = text || '';
        el.className = 'auth-modal__msg' + (tone ? ' auth-modal__msg--' + tone : '');
    }

    function validatePassword(password) {
        if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        return '';
    }

    function getOAuthErrorMessage(code, fallback) {
        var messages = {
            github_auth_failed: 'No se pudo completar la autenticación con GitHub. Intenta de nuevo.',
            github_no_profile: 'GitHub no proporcionó información de perfil suficiente.',
            github_no_email: 'GitHub no proporcionó un correo verificado.',
            oauth_link_required: 'Esta cuenta ya existe. Inicia sesión con contraseña y vincula el proveedor desde tu perfil.',
            oauth_provider_mismatch: 'La cuenta ya está vinculada con otro proveedor de acceso.'
        };
        return messages[code] || fallback;
    }

    function socialButtons() {
        return '<div class="auth-modal__social">' +
            '<button type="button" class="auth-modal__social-btn" id="auth-google-btn">' +
                '<span class="auth-modal__social-mark"><img class="auth-modal__social-icon" src="assets/images/google-logo.svg" alt="Google" width="20" height="20"></span>' +
                '<span class="auth-modal__social-copy"><strong>Continuar con Google</strong><small>Acceso inmediato y sincronizado</small></span>' +
            '</button>' +
            '<button type="button" class="auth-modal__social-btn" id="auth-github-btn">' +
                '<span class="auth-modal__social-mark"><img class="auth-modal__social-icon" src="assets/images/github-logo.svg" alt="GitHub" width="20" height="20"></span>' +
                '<span class="auth-modal__social-copy"><strong>Continuar con GitHub</strong><small>Entra con tu cuenta de desarrollo</small></span>' +
            '</button>' +
        '</div>';
    }

    function termsConsentMarkup(idSuffix) {
        var suffix = idSuffix || 'registro';
        return '<label class="auth-consent" for="auth-terms-' + suffix + '">' +
            '<input type="checkbox" id="auth-terms-' + suffix + '" required>' +
            '<span>He leído y acepto los <a href="#/info/terminos" target="_blank" rel="noopener">Términos de uso</a> y el <a href="#/info/privacidad" target="_blank" rel="noopener">Aviso de privacidad</a>. Entiendo que mis datos se tratarán para operar mi cuenta y mi preparación.</span>' +
        '</label>';
    }

    function shell(modalHtml) {
        return '<div class="auth-modal-overlay active" id="auth-overlay">' +
            '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">' +
                '<button type="button" class="auth-modal__close" id="auth-close-btn" aria-label="Cerrar inicio de sesión">' + Icons.x + '</button>' +
                modalHtml +
            '</div></div>';
    }

    function closeLoginModal() {
        var host = document.getElementById('auth-modal-host');
        var overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('auth-modal-open');
        window.setTimeout(function () {
            if (host) host.remove();
            else if (overlay) overlay.remove();
        }, 180);
    }

    function bindClose(onClose) {
        var overlay = document.getElementById('auth-overlay');
        var closeBtn = document.getElementById('auth-close-btn');
        var go = onClose || function () { R().navigate('/'); };
        if (closeBtn) closeBtn.addEventListener('click', go);
        if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) go(); });
        document.addEventListener('keydown', function escapeModal(e) {
            if (e.key !== 'Escape' || !document.getElementById('auth-overlay')) return;
            document.removeEventListener('keydown', escapeModal);
            go();
        });
    }

    function popupFeatures() {
        var width = 520;
        var height = 700;
        var left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
        var top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
        return 'popup=yes,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes';
    }

    function openOAuthPopup(provider, url, msgId) {
        var popup = window.open(url, 'educatia-' + provider + '-oauth', popupFeatures());
        if (!popup) {
            setMsg(msgId, 'Tu navegador bloqueó la ventana de acceso. Habilita ventanas emergentes e intenta de nuevo.', 'err');
            return;
        }
        activeOAuthPopup = popup;
        popup.focus();
        setMsg(msgId, 'Completa el acceso en la ventana segura que acabamos de abrir.', 'info');
    }

    function bindSocial(msgId, requireLegalConsent) {
        var gBtn = document.getElementById('auth-google-btn');
        var hBtn = document.getElementById('auth-github-btn');
        var canContinue = function () {
            if (!requireLegalConsent) return true;
            var consent = document.querySelector('.auth-consent input[type="checkbox"]');
            if (consent && consent.checked) return true;
            setMsg(msgId, 'Lee y acepta los Términos de uso y el Aviso de privacidad para crear una cuenta.', 'err');
            return false;
        };
        if (gBtn) {
            gBtn.addEventListener('click', function () {
                if (!canContinue()) return;
                rememberPostLoginPath();
                var url = API().getGoogleLoginUrl ? API().getGoogleLoginUrl() : null;
                if (url) openOAuthPopup('google', url + (requireLegalConsent ? '?terms_accepted=1&privacy_accepted=1' : ''), msgId);
                else setMsg(msgId, 'Google OAuth no disponible en este momento.', 'err');
            });
        }
        if (hBtn) {
            hBtn.addEventListener('click', function () {
                if (!canContinue()) return;
                rememberPostLoginPath();
                var url = API().getGitHubLoginUrl ? API().getGitHubLoginUrl() : null;
                if (url) openOAuthPopup('github', url + (requireLegalConsent ? '?terms_accepted=1&privacy_accepted=1' : ''), msgId);
                else setMsg(msgId, 'GitHub OAuth no disponible en este momento.', 'err');
            });
        }
        var err = window.sessionStorage.getItem('educatia_oauth_error');
        if (err) { window.sessionStorage.removeItem('educatia_oauth_error'); setMsg(msgId, err, 'err'); }
    }

    /* ═══════════════════════════════════════════════════════════
       LOGIN
       ═══════════════════════════════════════════════════════════ */
    function loginMarkup() {
        return shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title" id="auth-modal-title">Iniciar sesión</h2>' +
                '<p class="auth-modal__sub">Ingresa con tu correo institucional o personal para retomar tu avance.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                '<form id="login-form" class="auth-modal__form" autocomplete="on">' +
                    '<div class="fg"><label class="fl" for="login-email">Correo electrónico</label>' +
                    '<input class="fi" type="email" id="login-email" required autocomplete="email" placeholder="tu@correo.com"></div>' +
                    '<div class="fg"><label class="fl" for="login-pass">Contraseña</label>' +
                    '<input class="fi" type="password" id="login-pass" required autocomplete="current-password" placeholder="Tu contraseña"></div>' +
                    '<button type="submit" class="btn--modal-pri" id="login-btn">Continuar</button>' +
                    '<div id="login-msg"></div>' +
                '</form>' +
            '</div>' +
            '<div class="auth-modal__footer">' +
                '<p><a href="#/recuperar-contrasena" data-auth-password-reset>¿Olvidaste tu contraseña?</a></p>' +
                '<p>¿No tienes cuenta? <a href="#/registro-alumno">Crear cuenta</a></p>' +
            '</div>'
        );
    }

    function bindLoginForm() {
        bindSocial('login-msg');
        var form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var email = document.getElementById('login-email').value.trim();
            var pass  = document.getElementById('login-pass').value;
            var btn   = document.getElementById('login-btn');
            setMsg('login-msg', '', '');
            if (!email || !pass) { setMsg('login-msg', 'Completa correo y contraseña.', 'err'); return; }
            btn.disabled = true; btn.textContent = 'Ingresando...';
            try {
                var data = await API().login(email, pass);
                var user = data.user || (await API().getMe());
                C().setLoggedIn(user.rol, user);
                closeLoginModal();
                R().navigate(getPostLoginPath(user.rol));
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Continuar';
                C().setLoggedOut({ remote: false });
                setMsg('login-msg', (err.message || 'No pudimos iniciar sesión.') + ' No hay ninguna sesión iniciada; puedes crear una cuenta nueva.', 'err');
            }
        });
    }

    function openLoginModal(options) {
        var config = options || {};
        var existing = document.getElementById('auth-modal-host');
        if (existing) existing.remove();
        rememberPostLoginPath(config.next);

        var host = document.createElement('div');
        host.id = 'auth-modal-host';
        host.innerHTML = loginMarkup();
        document.body.appendChild(host);
        document.body.classList.add('auth-modal-open');
        bindClose(closeLoginModal);
        bindLoginForm();
        window.requestAnimationFrame(function () {
            document.getElementById('login-email')?.focus();
        });
    }

    function passwordResetRequestMarkup() {
        return shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title" id="auth-modal-title">Recupera tu acceso</h2>' +
                '<p class="auth-modal__sub">Ingresa el correo con el que te registraste. Te enviaremos un enlace seguro con vigencia de 30 minutos.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                '<form id="password-reset-request-form" class="auth-modal__form">' +
                    '<div class="fg"><label class="fl" for="password-reset-email">Correo electrónico</label>' +
                    '<input class="fi" type="email" id="password-reset-email" required autocomplete="email" placeholder="tu@correo.com"></div>' +
                    '<button type="submit" class="btn--modal-pri" id="password-reset-request-btn">Enviar enlace seguro</button>' +
                    '<div id="password-reset-request-msg"></div>' +
                '</form>' +
            '</div>' +
            '<div class="auth-modal__footer"><p><a href="#/login">Volver a iniciar sesión</a></p></div>'
        );
    }

    function bindPasswordResetRequestForm() {
        var form = document.getElementById('password-reset-request-form');
        if (!form) return;
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            var email = document.getElementById('password-reset-email').value.trim();
            var btn = document.getElementById('password-reset-request-btn');
            setMsg('password-reset-request-msg', '', '');
            if (!email) {
                setMsg('password-reset-request-msg', 'Escribe tu correo electrónico.', 'err');
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Enviando...';
            try {
                await API().requestPasswordReset(email);
                form.innerHTML =
                    '<section class="auth-modal__success" role="status" aria-live="polite">' +
                        '<span class="auth-modal__success-icon" aria-hidden="true">' + (Icons.mail || '') + '</span>' +
                        '<h3>Revisa tu correo</h3>' +
                        '<p>Enviamos las instrucciones de recuperación a <strong>' + esc(email) + '</strong>.</p>' +
                        '<p class="auth-modal__success-help">El enlace vence en 30 minutos. Si no lo encuentras, revisa las carpetas de spam y promociones.</p>' +
                        '<a class="btn--modal-pri auth-modal__success-action" href="#/login">Volver a iniciar sesión</a>' +
                    '</section>';
            } catch (error) {
                btn.disabled = false;
                btn.textContent = 'Enviar enlace seguro';
                setMsg('password-reset-request-msg', error.message || 'No fue posible enviar el enlace en este momento. Vuelve a intentarlo en unos minutos.', 'err');
            }
        });
    }

    function openPasswordResetRequestModal() {
        var existing = document.getElementById('auth-modal-host');
        if (existing) existing.remove();
        var host = document.createElement('div');
        host.id = 'auth-modal-host';
        host.innerHTML = passwordResetRequestMarkup();
        document.body.appendChild(host);
        document.body.classList.add('auth-modal-open');
        bindClose(closeLoginModal);
        bindPasswordResetRequestForm();
        window.requestAnimationFrame(function () {
            document.getElementById('password-reset-email')?.focus();
        });
    }

    function renderPasswordResetRequest() {
        R().navigate('/', { replace: true });
        window.setTimeout(openPasswordResetRequestModal, 40);
    }

    function renderPasswordResetConfirm() {
        var app = document.getElementById('app');
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams();
        var token = params.get('token') || '';
        // Remove the secret from the address bar and browser history before the
        // student types anything. Fragment tokens never reach HTTP access logs.
        window.history.replaceState({}, '', R().toUrl('/restablecer-contrasena'));
        document.body.classList.add('auth-modal-open');

        app.innerHTML = shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title" id="auth-modal-title">Crea una contraseña nueva</h2>' +
                '<p class="auth-modal__sub">El enlace es de un solo uso. Al terminar cerraremos las sesiones anteriores de tu cuenta.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                (token ?
                    '<form id="password-reset-confirm-form" class="auth-modal__form">' +
                        '<div class="fg"><label class="fl" for="password-reset-new">Nueva contraseña</label>' +
                        '<input class="fi" type="password" id="password-reset-new" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>' +
                        '<div class="fg"><label class="fl" for="password-reset-confirm">Confirmar contraseña</label>' +
                        '<input class="fi" type="password" id="password-reset-confirm" required minlength="15" autocomplete="new-password" placeholder="Repite tu contraseña"></div>' +
                        '<button type="submit" class="btn--modal-pri" id="password-reset-confirm-btn">Guardar contraseña</button>' +
                        '<div id="password-reset-confirm-msg"></div>' +
                    '</form>' :
                    '<div class="auth-modal__msg auth-modal__msg--err">El enlace no contiene un token válido. Solicita uno nuevo.</div>' +
                    '<button type="button" class="btn--modal-pri" id="password-reset-request-again">Solicitar otro enlace</button>') +
            '</div>' +
            '<div class="auth-modal__footer"><p><a href="#/login">Volver a iniciar sesión</a></p></div>'
        );
        bindClose(function () {
            document.body.classList.remove('auth-modal-open');
            R().navigate('/');
        });

        document.getElementById('password-reset-request-again')?.addEventListener('click', function () {
            document.body.classList.remove('auth-modal-open');
            R().navigate('/');
            openPasswordResetRequestModal();
        });

        var form = document.getElementById('password-reset-confirm-form');
        if (!form) return;
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            var password = document.getElementById('password-reset-new').value;
            var confirmation = document.getElementById('password-reset-confirm').value;
            var btn = document.getElementById('password-reset-confirm-btn');
            setMsg('password-reset-confirm-msg', '', '');
            var passwordError = validatePassword(password);
            if (passwordError) {
                setMsg('password-reset-confirm-msg', passwordError, 'err');
                return;
            }
            if (password !== confirmation) {
                setMsg('password-reset-confirm-msg', 'Las contraseñas no coinciden.', 'err');
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Guardando...';
            try {
                var result = await API().confirmPasswordReset(token, password);
                C().setLoggedOut({ remote: false });
                Array.from(form.querySelectorAll('.fg')).forEach(function (field) { field.hidden = true; });
                setMsg('password-reset-confirm-msg', result.message || 'Contraseña actualizada. Inicia sesión nuevamente.', 'ok');
                btn.disabled = false;
                btn.type = 'button';
                btn.textContent = 'Ir a iniciar sesión';
                btn.addEventListener('click', function () {
                    document.body.classList.remove('auth-modal-open');
                    R().navigate('/');
                    openLoginModal();
                }, { once: true });
            } catch (error) {
                btn.disabled = false;
                btn.textContent = 'Guardar contraseña';
                setMsg('password-reset-confirm-msg', error.message || 'El enlace no es válido o ya expiró.', 'err');
            }
        });
        window.requestAnimationFrame(function () {
            document.getElementById('password-reset-new')?.focus();
        });
    }

    function renderEmailChangeConfirm() {
        var app = document.getElementById('app');
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams();
        var token = params.get('token') || '';
        window.history.replaceState({}, '', R().toUrl('/confirmar-correo'));
        document.body.classList.add('auth-modal-open');

        app.innerHTML = shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title" id="auth-modal-title">Confirma tu nuevo correo</h2>' +
                '<p class="auth-modal__sub">El correo de acceso sólo cambiará cuando confirmes esta acción.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                (token ?
                    '<button type="button" class="btn--modal-pri" id="email-change-confirm-btn">Confirmar nuevo correo</button>' +
                    '<div id="email-change-confirm-msg"></div>' :
                    '<div class="auth-modal__msg auth-modal__msg--err">El enlace no contiene un token válido.</div>') +
            '</div>' +
            '<div class="auth-modal__footer"><p><a href="#/login">Volver a iniciar sesión</a></p></div>'
        );
        bindClose(function () {
            document.body.classList.remove('auth-modal-open');
            R().navigate('/');
        });

        var btn = document.getElementById('email-change-confirm-btn');
        var completed = false;
        btn?.addEventListener('click', async function () {
            if (completed) {
                document.body.classList.remove('auth-modal-open');
                R().navigate('/');
                openLoginModal();
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Confirmando...';
            setMsg('email-change-confirm-msg', '', '');
            try {
                var result = await API().confirmEmailChange(token);
                C().setLoggedOut({ remote: false });
                setMsg('email-change-confirm-msg', result.message || 'Correo confirmado. Inicia sesión nuevamente.', 'ok');
                completed = true;
                btn.disabled = false;
                btn.textContent = 'Ir a iniciar sesión';
            } catch (error) {
                btn.disabled = false;
                btn.textContent = 'Confirmar nuevo correo';
                setMsg('email-change-confirm-msg', error.message || 'El enlace no es válido o ya expiró.', 'err');
            }
        });
        window.requestAnimationFrame(function () { btn?.focus(); });
    }

    function registrationMarkup() {
        return shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title" id="auth-modal-title">Crear cuenta</h2>' +
                '<p class="auth-modal__sub">Crea tu acceso y pasa directo al cuestionario para personalizar tu ruta.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                '<form id="reg-form" class="auth-modal__form" autocomplete="on">' +
                    '<div class="fg"><label class="fl" for="reg-nombre">Nombre completo</label>' +
                    '<input class="fi" type="text" id="reg-nombre" required autocomplete="name" placeholder="Nombre y apellidos"></div>' +
                    '<div class="fg"><label class="fl" for="reg-email">Correo electrónico</label>' +
                    '<input class="fi" type="email" id="reg-email" required autocomplete="email" placeholder="tu@correo.com"></div>' +
                    '<div class="fg"><label class="fl" for="reg-pass">Contraseña</label>' +
                    '<input class="fi" type="password" id="reg-pass" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>' +
                    '<div class="fg"><label class="fl" for="reg-pass2">Confirmar contraseña</label>' +
                    '<input class="fi" type="password" id="reg-pass2" required autocomplete="new-password" placeholder="Repite tu contraseña"></div>' +
                    termsConsentMarkup('alumno') +
                    '<button type="submit" class="btn--modal-pri" id="reg-btn">Crear cuenta</button>' +
                    '<div id="reg-msg"></div>' +
                '</form>' +
            '</div>' +
            '<div class="auth-modal__footer">' +
                '<p>¿Ya tienes cuenta? <a href="#/login">Iniciar sesión</a></p>' +
            '</div>'
        );
    }

    function bindRegistrationForm() {
        var form = document.getElementById('reg-form');
        if (!form) return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var nombre = document.getElementById('reg-nombre').value.trim();
            var email = document.getElementById('reg-email').value.trim();
            var pass = document.getElementById('reg-pass').value;
            var pass2 = document.getElementById('reg-pass2').value;
            var consent = document.getElementById('auth-terms-alumno');
            var btn = document.getElementById('reg-btn');
            setMsg('reg-msg', '', '');
            if (!nombre || !email || !pass) { setMsg('reg-msg', 'Completa todos los campos.', 'err'); return; }
            var passError = validatePassword(pass);
            if (passError) { setMsg('reg-msg', passError, 'err'); return; }
            if (pass !== pass2) { setMsg('reg-msg', 'Las contraseñas no coinciden.', 'err'); return; }
            if (!consent || !consent.checked) { setMsg('reg-msg', 'Debes aceptar los Términos de uso y el Aviso de privacidad.', 'err'); return; }
            btn.disabled = true;
            btn.textContent = 'Registrando...';
            try {
                var result = await API().register(nombre, email, pass, 'alumno', { termsAccepted: true, privacyAccepted: true });
                if (result.user && result.user.rol === 'alumno') {
                    C().setLoggedIn(result.user.rol, result.user);
                    closeLoginModal();
                    var pendingPlanPath = getPendingPlanPath(result.user.rol);
                    R().navigate(pendingPlanPath || '/onboarding');
                } else {
                    setMsg('reg-msg', result.message || 'Cuenta creada. Inicia sesión para continuar.', 'ok');
                }
            } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Crear cuenta';
                C().setLoggedOut({ remote: false });
                setMsg('reg-msg', err.message || 'No fue posible crear la cuenta. Revisa los datos e inténtalo nuevamente.', 'err');
            }
        });
    }

    function openRegistrationModal(options) {
        var config = options || {};
        var existing = document.getElementById('auth-modal-host');
        if (existing) existing.remove();
        rememberPostLoginPath(config.next);
        if (config.planId) window.sessionStorage.setItem('educatia_pending_plan', config.planId);

        var host = document.createElement('div');
        host.id = 'auth-modal-host';
        host.innerHTML = registrationMarkup();
        document.body.appendChild(host);
        document.body.classList.add('auth-modal-open');
        bindClose(closeLoginModal);
        bindRegistrationForm();
        window.requestAnimationFrame(function () {
            document.getElementById('reg-nombre')?.focus();
        });
    }

    function installLoginInterception() {
        if (document.documentElement.dataset.authModalInterception === 'ready') return;
        document.documentElement.dataset.authModalInterception = 'ready';

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest?.('[data-auth-login], a[href="#/login"], a[href="/login"], a[href^="/login?"], a[href^="#/login?"]');
            if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            var route = R().getPath ? R().getPath() : '/';
            var next = trigger.dataset.authNext || (route !== '/login' ? route + (window.location.search || '') : '/');
            openLoginModal({ next: next });
        }, true);

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest?.('[data-auth-password-reset], a[href="#/recuperar-contrasena"], a[href="/recuperar-contrasena"]');
            if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            openPasswordResetRequestModal();
        }, true);

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest?.('[data-auth-register], a[href="#/registro-alumno"], a[href="/registro-alumno"], a[href^="/registro-alumno?"], a[href^="#/registro-alumno?"]');
            if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            var href = trigger.getAttribute('href') || '';
            var query = href.indexOf('?') >= 0 ? href.slice(href.indexOf('?') + 1) : '';
            var params = new URLSearchParams(query);
            var route = R().getPath ? R().getPath() : '/';
            var next = trigger.dataset.authNext || normalizePostLoginPath(params.get('next')) || (route !== '/registro-alumno' ? route : '/');
            openRegistrationModal({ next: next, planId: params.get('plan_id') || '' });
        }, true);

        window.addEventListener('message', function (event) {
            var allowedOrigins = [
                window.location.origin,
                '',
                'https://www.educatia.me',
                'https://charbelochoa.github.io'
            ];
            if (!allowedOrigins.includes(event.origin) || event.data?.type !== 'educatia:oauth-complete') return;
            if (!activeOAuthPopup || event.source !== activeOAuthPopup) return;
            activeOAuthPopup = null;
            if (event.data.error) {
                setMsg('login-msg', getOAuthErrorMessage(event.data.error, 'No se pudo completar el acceso.'), 'err');
                return;
            }
            setMsg('login-msg', 'Acceso confirmado. Preparando tu espacio…', 'ok');
            API().loginWithOAuthToken('')
                .then(function (user) {
                    C().setLoggedIn(user.rol, user);
                    closeLoginModal();
                    R().navigate(getPostLoginPath(user.rol));
                })
                .catch(function (error) {
                    setMsg('login-msg', error.message || 'No se pudo verificar la sesión.', 'err');
                });
        });
    }

    function renderLogin() {
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams(window.location.search || '');
        var next = normalizePostLoginPath(params.get('next'));
        var hasOAuthError = Boolean(window.sessionStorage.getItem('educatia_oauth_error'));
        var shouldPrompt = Boolean(next || hasOAuthError || params.get('prompt') === '1');
        R().navigate('/', { replace: true });
        // Public visits must never be blocked by an authentication modal. Normal
        // navigation links are intercepted and call openLoginModal directly;
        // this route only prompts when a protected destination or OAuth result
        // explicitly requires authentication.
        if (shouldPrompt) {
            window.setTimeout(function () { openLoginModal({ next: next }); }, 40);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       REGISTRO ALUMNO
       ═══════════════════════════════════════════════════════════ */
    function renderRegistroAlumno() {
        var modalParams = R().getQueryParams ? R().getQueryParams() : new URLSearchParams(window.location.search || '');
        var modalNext = normalizePostLoginPath(modalParams.get('next'));
        var modalPlanId = modalParams.get('plan_id') || '';
        var shouldPrompt = Boolean(modalNext || modalPlanId || modalParams.get('prompt') === '1');
        R().navigate('/', { replace: true });
        // Registration CTAs are intercepted before routing and open the modal in
        // place. A bare restored/deep-linked route returns to the public landing
        // without covering it automatically.
        if (shouldPrompt) {
            window.setTimeout(function () { openRegistrationModal({ next: modalNext, planId: modalPlanId }); }, 40);
        }
        return;
        var app = document.getElementById('app');
        app.innerHTML = shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title">Crear cuenta</h2>' +
                '<p class="auth-modal__sub">Crea tu acceso y pasa directo al cuestionario para personalizar tu ruta.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                '<form id="reg-form" class="auth-modal__form" autocomplete="on">' +
                    '<div class="fg"><label class="fl" for="reg-nombre">Nombre completo</label>' +
                    '<input class="fi" type="text" id="reg-nombre" required autocomplete="name" placeholder="Nombre y apellidos"></div>' +
                    '<div class="fg"><label class="fl" for="reg-email">Correo electrónico</label>' +
                    '<input class="fi" type="email" id="reg-email" required autocomplete="email" placeholder="tu@correo.com"></div>' +
                    '<div class="fg"><label class="fl" for="reg-pass">Contraseña</label>' +
                    '<input class="fi" type="password" id="reg-pass" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>' +
                    '<div class="fg"><label class="fl" for="reg-pass2">Confirmar contraseña</label>' +
                    '<input class="fi" type="password" id="reg-pass2" required autocomplete="new-password" placeholder="Repite tu contraseña"></div>' +
                    termsConsentMarkup('alumno') +
                    '<button type="submit" class="btn--modal-pri" id="reg-btn">Crear cuenta</button>' +
                    '<div id="reg-msg"></div>' +
                '</form>' +
            '</div>' +
            '<div class="auth-modal__footer">' +
                '<p>¿Ya tienes cuenta? <a href="#/login">Iniciar sesión</a></p>' +
            '</div>'
        );
        bindClose();
        document.getElementById('reg-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            var nombre = document.getElementById('reg-nombre').value.trim();
            var email  = document.getElementById('reg-email').value.trim();
            var pass   = document.getElementById('reg-pass').value;
            var pass2  = document.getElementById('reg-pass2').value;
            var consent = document.getElementById('auth-terms-alumno');
            var btn    = document.getElementById('reg-btn');
            setMsg('reg-msg', '', '');
            if (!nombre || !email || !pass) { setMsg('reg-msg', 'Completa todos los campos.', 'err'); return; }
            var passError = validatePassword(pass);
            if (passError) { setMsg('reg-msg', passError, 'err'); return; }
            if (pass !== pass2) { setMsg('reg-msg', 'Las contraseñas no coinciden.', 'err'); return; }
            if (!consent || !consent.checked) { setMsg('reg-msg', 'Debes aceptar los Términos de uso y el Aviso de privacidad.', 'err'); return; }
            btn.disabled = true; btn.textContent = 'Registrando...';
            try {
                var result = await API().register(nombre, email, pass, 'alumno', { termsAccepted: true, privacyAccepted: true });
                if (result.user && result.user.rol === 'alumno') {
                    C().setLoggedIn(result.user.rol, result.user);
                    var pendingPlanPath = getPendingPlanPath(result.user.rol);
                    R().navigate(pendingPlanPath || (result.user.rol === 'alumno' ? '/onboarding' : getPostLoginPath(result.user.rol)));
                } else {
                    setMsg('reg-msg', result.message || 'Cuenta creada. Inicia sesión para continuar.', 'ok');
                }
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Crear cuenta';
                C().setLoggedOut({ remote: false });
                setMsg('reg-msg', err.message || 'No fue posible crear la cuenta. Revisa los datos e inténtalo nuevamente.', 'err');
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════
       REGISTRO MAESTRO (24-48 hr approval)
       ═══════════════════════════════════════════════════════════ */
    function renderRegistroMaestro() {
        var app = document.getElementById('app');
        app.innerHTML = shell(
            '<div class="auth-modal__header">' +
                '<div class="auth-modal__brand">educatIA</div>' +
                '<h2 class="auth-modal__title">Registro de maestro</h2>' +
                '<p class="auth-modal__sub">Solicita acceso docente para crear cursos y evaluar alumnos.</p>' +
            '</div>' +
            '<div class="auth-modal__body">' +
                '<form id="regt-form" class="auth-modal__form" autocomplete="on">' +
                    '<div class="fg"><label class="fl" for="regt-nombre">Nombre completo</label>' +
                    '<input class="fi" type="text" id="regt-nombre" required autocomplete="name" placeholder="Nombre y apellidos"></div>' +
                    '<div class="fg"><label class="fl" for="regt-email">Correo institucional</label>' +
                    '<input class="fi" type="email" id="regt-email" required autocomplete="email" placeholder="tu@universidad.edu"></div>' +
                    '<div class="fg"><label class="fl" for="regt-pass">Contraseña</label>' +
                    '<input class="fi" type="password" id="regt-pass" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>' +
                    '<div class="fg"><label class="fl" for="regt-pass2">Confirmar contraseña</label>' +
                    '<input class="fi" type="password" id="regt-pass2" required autocomplete="new-password" placeholder="Repite tu contraseña"></div>' +
                    termsConsentMarkup('maestro') +
                    '<button type="submit" class="btn--modal-pri" id="regt-btn">Solicitar cuenta docente</button>' +
                    '<div id="regt-msg"></div>' +
                    '<div id="regt-approval" style="display:none"></div>' +
                '</form>' +
            '</div>' +
            '<div class="auth-modal__footer">' +
                '<p>¿Ya tienes cuenta? <a href="#/login">Iniciar sesión</a></p>' +
                '<p>¿Eres alumno? <a href="#/registro-alumno">Crear cuenta de alumno</a></p>' +
            '</div>'
        );
        bindClose();
        document.getElementById('regt-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            var nombre = document.getElementById('regt-nombre').value.trim();
            var email  = document.getElementById('regt-email').value.trim();
            var pass   = document.getElementById('regt-pass').value;
            var pass2  = document.getElementById('regt-pass2').value;
            var consent = document.getElementById('auth-terms-maestro');
            var btn    = document.getElementById('regt-btn');
            setMsg('regt-msg', '', '');
            if (!nombre || !email || !pass) { setMsg('regt-msg', 'Completa todos los campos.', 'err'); return; }
            var passError = validatePassword(pass);
            if (passError) { setMsg('regt-msg', passError, 'err'); return; }
            if (pass !== pass2) { setMsg('regt-msg', 'Las contraseñas no coinciden.', 'err'); return; }
            if (!consent || !consent.checked) { setMsg('regt-msg', 'Debes aceptar los Términos de uso y el Aviso de privacidad.', 'err'); return; }
            btn.disabled = true; btn.textContent = 'Enviando solicitud...';
            try {
                await API().register(nombre, email, pass, 'maestro', { termsAccepted: true, privacyAccepted: true });
                btn.style.display = 'none';
                document.getElementById('regt-approval').style.display = 'block';
                document.getElementById('regt-approval').innerHTML =
                    '<div class="auth-approval-msg">' +
                        '<h3>Solicitud enviada correctamente</h3>' +
                        '<p>Tu solicitud docente será revisada por un administrador en un plazo de <strong>24 a 48 horas</strong>. No necesitas verificar correo.</p>' +
                        '<p style="margin-top:12px"><a href="#/login" style="color:#0056D2;text-decoration:underline">Ir a iniciar sesión</a></p>' +
                    '</div>';
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Solicitar cuenta docente';
                setMsg('regt-msg', err.message || 'No fue posible crear la cuenta docente. Revisa los datos e inténtalo nuevamente.', 'err');
            }
        });
    }

    function renderOAuthCallback() {
        var app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Procesando autenticación');
        var params = R().getQueryParams ? R().getQueryParams() : new URLSearchParams(window.location.search || '');
        var provider = params.get('provider');
        if (provider) {
            API().loginWithOAuthToken('').then(function (user) {
                C().setLoggedIn(user.rol, user);
                R().navigate(getPostLoginPath(user.rol));
            }).catch(function () {
                app.innerHTML = '<div class="page-wrap"><div class="auth-modal__msg auth-modal__msg--err">Error de autenticación. <a href="#/login">Volver</a>.</div></div>';
            });
        } else {
            app.innerHTML = '<div class="page-wrap"><div class="auth-modal__msg auth-modal__msg--err">Error en autenticación. <a href="#/login">Volver</a>.</div></div>';
        }
    }

    function renderGitHubCallback() {
        var app = document.getElementById('app');
        app.innerHTML = C().renderLoadingBlock('Conectando con GitHub');

        var params = new URLSearchParams(window.location.search || '');
        var code = params.get('code');
        var state = params.get('state');
        var error = params.get('error');

        if (error) {
            R().navigate('/', { replace: true });
            window.sessionStorage.setItem('educatia_oauth_error', 'No se pudo completar la autenticación con GitHub. Intenta de nuevo.');
            R().navigate('/login');
            return;
        }

        if (!code || !state) {
            R().navigate('/', { replace: true });
            window.sessionStorage.setItem('educatia_oauth_error', 'GitHub no devolvió un código de acceso válido.');
            R().navigate('/login');
            return;
        }

        API().exchangeGitHubCode(code, state)
            .then(function (data) {
                var user = data.user;
                C().setLoggedIn(user.rol, user);
                R().navigate(getPostLoginPath(user.rol));
            })
            .catch(function (err) {
                var fallback = 'No se pudo completar el acceso con GitHub.';
                window.sessionStorage.setItem('educatia_oauth_error', getOAuthErrorMessage(err.message, fallback));
                R().navigate('/login');
            });
    }

    return {
        renderLogin: renderLogin,
        openLoginModal: openLoginModal,
        openPasswordResetRequestModal: openPasswordResetRequestModal,
        renderPasswordResetRequest: renderPasswordResetRequest,
        renderPasswordResetConfirm: renderPasswordResetConfirm,
        renderEmailChangeConfirm: renderEmailChangeConfirm,
        openRegistrationModal: openRegistrationModal,
        closeLoginModal: closeLoginModal,
        installLoginInterception: installLoginInterception,
        renderRegistroAlumno: renderRegistroAlumno,
        renderOAuthCallback: renderOAuthCallback,
        renderGitHubCallback: renderGitHubCallback,
        getPostLoginPath: getPostLoginPath
    };
})();
