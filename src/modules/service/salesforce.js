import jsforce from 'jsforce';
import {
    store,
    login as loginAction,
    logout as logoutAction,
    fetchUser
} from '../store/store';

const CLIENT_ID =
    '3MVG9n_HvETGhr3Bp2TP0lUhBaOTAOuCH9OKmjFKsspVG.z8WOx0Vb94skZ8d4wHTVuMf5DArbdwCb05yIAT5';
const PROXY_URL =
    'https://asia-northeast1-lwc-soql-builder-dev.cloudfunctions.net/';
const API_VERSION = '48.0';
const ACCESS_TOKEN_KEY = 'lsb.accessToken';
const INSTANCE_URL_KEY = 'lsb.instanceUrl';

const locationOrigin = window.location.origin;

export let connection;

export function init() {
    jsforce.browser.init({
        clientId: CLIENT_ID,
        redirectUri: `${locationOrigin}/`,
        version: API_VERSION,
        proxyUrl: `${PROXY_URL}proxy/`
    });
    jsforce.browser.on('connect', conn => {
        localStorage.setItem(ACCESS_TOKEN_KEY, conn.accessToken);
        localStorage.setItem(INSTANCE_URL_KEY, conn.instanceUrl);
        connection = conn;
        store.dispatch(loginAction());
        store.dispatch(fetchUser());
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
            version: API_VERSION,
            proxyUrl: `${PROXY_URL}proxy/`
        });
        store.dispatch(loginAction());
        store.dispatch(fetchUser());
    }
}

export function logout() {
    connection = null;
    jsforce.browser.logout();
    store.dispatch(logoutAction());
}

export function login(loginUrl) {
    jsforce.browser.login({ loginUrl }, () => {
        window.location.reload();
    });
}

export function isLoggedIn() {
    return !!(connection && connection.accessToken);
}
