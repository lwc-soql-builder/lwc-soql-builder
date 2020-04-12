import jsforce from 'jsforce';

const CLIENT_ID =
    '3MVG9n_HvETGhr3Bp2TP0lUhBaOTAOuCH9OKmjFKsspVG.z8WOx0Vb94skZ8d4wHTVuMf5DArbdwCb05yIAT5';
const PROXY_URL = 'https://lwc-soql-builder-proxy.herokuapp.com/';
const ACCESS_TOKEN_KEY = 'lsb.accessToken';
const INSTANCE_URL_KEY = 'lsb.instanceUrl';

const locationOrigin = window.location.origin;

export let connection;

export function init() {
    jsforce.browser.init({
        clientId: CLIENT_ID,
        redirectUri: `${locationOrigin}/`,
        proxyUrl: `${PROXY_URL}proxy/`
    });
    jsforce.browser.on('connect', conn => {
        localStorage.setItem(ACCESS_TOKEN_KEY, conn.accessToken);
        localStorage.setItem(INSTANCE_URL_KEY, conn.instanceUrl);
        connection = conn;
    });
    jsforce.browser.on('disconnect', () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(INSTANCE_URL_KEY);
    });

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const instanceUrl = localStorage.getItem(INSTANCE_URL_KEY);

    if (accessToken && instanceUrl) {
        connection = new jsforce.Connection({
            accessToken,
            instanceUrl,
            version: '48.0',
            proxyUrl: `${PROXY_URL}proxy/`
        });
    }
}

export function logout() {
    connection = null;
    jsforce.browser.logout();
}

export function login(loginUrl) {
    jsforce.browser.login({ loginUrl }, () => {
        window.location.reload();
    });
}

export function isLoggedIn() {
    return !!(connection && connection.accessToken);
}
