/* ================================================================
   educatIA - History Router
   SPA navigation with clean URLs and legacy hash compatibility
   ================================================================ */

window.EducatIA = window.EducatIA || {};

window.EducatIA.Router = (function () {
    const routes = {};
    let currentRoute = null;
    let transitionToken = 0;
    let initialized = false;
    let basePathCache = null;

    function getBasePath() {
        if (basePathCache !== null) {
            return basePathCache;
        }

        const configured = window.EDUCATIA_BASE_PATH;
        if (typeof configured === 'string') {
            basePathCache = configured.replace(/\/$/, '');
            return basePathCache === '/' ? '' : basePathCache;
        }

        if (window.location.hostname.endsWith('github.io')) {
            const firstSegment = window.location.pathname.split('/').filter(Boolean)[0];
            basePathCache = firstSegment ? `/${firstSegment}` : '';
            return basePathCache;
        }

        basePathCache = '';
        return basePathCache;
    }

    function splitPathAndQuery(path) {
        const raw = String(path || '/');
        const queryIndex = raw.indexOf('?');
        if (queryIndex === -1) {
            return { pathname: raw, search: '' };
        }

        return {
            pathname: raw.slice(0, queryIndex) || '/',
            search: raw.slice(queryIndex),
        };
    }

    function normalizePath(path) {
        const parts = splitPathAndQuery(path);
        let pathname = parts.pathname || '/';
        if (!pathname.startsWith('/')) {
            pathname = `/${pathname}`;
        }
        pathname = pathname.replace(/\/{2,}/g, '/');
        if (pathname.length > 1) {
            pathname = pathname.replace(/\/+$/, '');
        }
        return `${pathname}${parts.search}`;
    }

    function stripBasePath(pathname) {
        const basePath = getBasePath();
        if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
            return pathname.slice(basePath.length) || '/';
        }
        return pathname || '/';
    }

    function toUrl(path) {
        const normalized = normalizePath(path);
        const basePath = getBasePath();
        return `${basePath}${normalized === '/' ? '/' : normalized}`;
    }

    function getLocationRoute() {
        const legacyHash = window.location.hash || '';
        if (legacyHash.startsWith('#/')) {
            return normalizePath(legacyHash.slice(1));
        }

        return normalizePath(`${stripBasePath(window.location.pathname)}${window.location.search || ''}`);
    }

    function getPath() {
        return splitPathAndQuery(getLocationRoute()).pathname;
    }

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search || '');
        const fragment = window.location.hash || '';

        if (fragment && !fragment.startsWith('#/')) {
            const fragmentParams = new URLSearchParams(fragment.slice(1));
            fragmentParams.forEach(function (value, key) {
                if (!params.has(key)) {
                    params.set(key, value);
                }
            });
        }

        if (fragment.startsWith('#/') && fragment.includes('?')) {
            const legacyParams = new URLSearchParams(fragment.split('?')[1] || '');
            legacyParams.forEach(function (value, key) {
                if (!params.has(key)) {
                    params.set(key, value);
                }
            });
        }

        return params;
    }

    function migrateLegacyHash() {
        const legacyHash = window.location.hash || '';
        if (!legacyHash.startsWith('#/')) {
            return;
        }

        const cleanPath = normalizePath(legacyHash.slice(1));
        window.history.replaceState({}, '', toUrl(cleanPath));
    }

    function register(path, handler) {
        routes[path] = handler;
    }

    function navigate(path, options) {
        const normalizedPath = normalizePath(path);
        const current = getLocationRoute();
        const targetUrl = toUrl(normalizedPath);
        const method = options?.replace ? 'replaceState' : 'pushState';

        if (current === normalizedPath) {
            handleRoute();
            return;
        }

        window.history[method]({}, '', targetUrl);
        handleRoute();
    }

    function getParams() {
        return getPath().split('/').filter(Boolean);
    }

    function matchRoute(pathname) {
        if (routes[pathname]) {
            return { handler: routes[pathname], params: {} };
        }

        for (const path in routes) {
            const pathParts = path.split('/').filter(Boolean);
            const routeParts = pathname.split('/').filter(Boolean);

            if (pathParts.length !== routeParts.length) {
                continue;
            }

            const params = {};
            let match = true;

            for (let index = 0; index < pathParts.length; index += 1) {
                if (pathParts[index].startsWith(':')) {
                    params[pathParts[index].slice(1)] = routeParts[index];
                    continue;
                }

                if (pathParts[index] !== routeParts[index]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { handler: routes[path], params };
            }
        }

        return null;
    }

    function renderState(title, description, actionLabel, actionPath) {
        const app = document.getElementById('app');
        if (!app) {
            return;
        }

        if (window.EducatIA.Components) {
            window.EducatIA.Components.renderNav();
            window.EducatIA.Components.renderFooter();
        }

        app.innerHTML = `
            <div class="page-wrap">
                <div class="card">
                    <div class="section__label">Estado de la aplicación</div>
                    <h1>${title}</h1>
                    <p class="text-muted" style="margin-top:12px;max-width:60ch;">${description}</p>
                    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="${toUrl(actionPath)}" class="btn btn--pri">${actionLabel}</a>
                        <a href="${toUrl('/explorar')}" class="btn btn--out">Explorar cursos</a>
                    </div>
                </div>
            </div>`;
    }

    function interceptInternalLinks(event) {
        const anchor = event.target.closest?.('a[href]');
        if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        // Some sections of educatIA publish a self-contained static application
        // (for example, the Premedicina anatomy lab).  Those entries must be
        // loaded by the browser instead of being interpreted as a SPA route.
        if (anchor.hasAttribute('data-full-navigation')) {
            return;
        }

        const href = anchor.getAttribute('href') || '';
        if (href.startsWith('#/') || href === '#') {
            event.preventDefault();
            navigate(href === '#' ? '/' : href.slice(1));
            return;
        }

        if (!anchor.origin || anchor.origin !== window.location.origin) {
            return;
        }

        const routePath = normalizePath(`${stripBasePath(anchor.pathname)}${anchor.search || ''}`);
        if (!matchRoute(splitPathAndQuery(routePath).pathname)) {
            return;
        }

        event.preventDefault();
        navigate(routePath);
    }

    function handleRoute() {
        migrateLegacyHash();

        const routePath = getPath();
        const routeToken = ++transitionToken;
        const app = document.getElementById('app');

        if (!app) {
            return;
        }

        document.body.classList.toggle('learning-home-mode', routePath === '/dashboard');
        app.style.opacity = '0';

        var runRender = async function () {
            if (routeToken !== transitionToken) {
                return;
            }

            const result = matchRoute(routePath);

            try {
                if (!result) {
                    currentRoute = '/404';
                    renderState(
                        'La página que buscas no existe',
                        'La ruta solicitada no coincide con ninguna vista disponible. Revisa el enlace o vuelve al inicio.',
                        'Volver al inicio',
                        '/'
                    );
                    window.EducatIA.enhanceAccessibility?.();
                    return;
                }

                currentRoute = routePath;
                await Promise.resolve(result.handler(result.params));
                window.EducatIA.enhanceAccessibility?.();

                if (window.EducatIA.Components) {
                    window.EducatIA.Components.updateNav(routePath);
                }
            } catch (error) {
                currentRoute = '/error';
                console.error('Route render failed:', routePath, error);
                renderState(
                    'No se pudo cargar esta vista',
                    error?.message || 'Ocurrió un error inesperado al mostrar esta pantalla.',
                    'Ir al inicio',
                    '/'
                );
                window.EducatIA.enhanceAccessibility?.();
            } finally {
                if (routeToken === transitionToken) {
                    app.style.opacity = '1';
                    window.scrollTo(0, 0);
                }
            }
        };

        // Render on the next animation frame instead of a fixed 150ms timeout:
        // removes ~150ms of latency on every navigation while keeping the CSS
        // opacity fade-in, so clicking "Iniciar sesión" / "Comenzar gratis" is snappy.
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(runRender);
        });
    }

    function init() {
        if (initialized) {
            return;
        }

        migrateLegacyHash();
        window.addEventListener('popstate', handleRoute);
        window.addEventListener('hashchange', handleRoute);
        document.addEventListener('click', interceptInternalLinks);
        initialized = true;
    }

    function getCurrentRoute() {
        return currentRoute || getPath();
    }

    return {
        register,
        navigate,
        getParams,
        getQueryParams,
        getPath,
        getBasePath,
        toUrl,
        matchRoute,
        handleRoute,
        init,
        getCurrentRoute
    };
})();
