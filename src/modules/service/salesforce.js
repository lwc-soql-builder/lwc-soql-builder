import jsforce from 'jsforce';
import { store, logout as logoutAction } from '../store/store';

const CLIENT_ID =
    '3MVG9n_HvETGhr3Bp2TP0lUhBaOTAOuCH9OKmjFKsspVG.z8WOx0Vb94skZ8d4wHTVuMf5DArbdwCb05yIAT5';
const ACCESS_TOKEN_KEY = 'lsb.accessToken';
const INSTANCE_URL_KEY = 'lsb.instanceUrl';

// eslint-disable-next-line no-undef
const FIREBASE_ALIAS = process.env.FIREBASE_ALIAS;

export const API_VERSION = '48.0';

function getProxyUrl() {
    if (navigator.language === 'ja') {
        return `https://asia-northeast1-${FIREBASE_ALIAS}.cloudfunctions.net/asia_northeast1/proxy/`;
    }
    return `https://us-central1-${FIREBASE_ALIAS}.cloudfunctions.net/us_central1/proxy/`;
}

const jsforceOptions = {
    clientId: CLIENT_ID,
    redirectUri: `${window.location.origin}${window.location.pathname}`,
    version: API_VERSION,
    proxyUrl: getProxyUrl()
};

export let connection;

function postConnect(callback) {
    connection
        .request('/services/oauth2/userinfo')
        .then(user => {
            if (callback) callback(null, user);
        })
        .catch(e => {
            if (callback) callback(e);
            logout();
        });
}

export function init(callback) {
    const isAuthCallback = window.location.hash;

    jsforce.browser.init(jsforceOptions);
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
            proxyUrl: getProxyUrl()
        });
        postConnect(callback);
        return;
    }

    jsforce.browser.on('connect', conn => {
        localStorage.setItem(ACCESS_TOKEN_KEY, conn.accessToken);
        localStorage.setItem(INSTANCE_URL_KEY, conn.instanceUrl);
        connection = conn;
        postConnect(callback);
    });
    // force emit connect event when receiving callback response
    if (isAuthCallback) jsforce.browser.init(jsforceOptions);

    if (!isAuthCallback && callback) callback();
}

export function logout() {
    connection = null;
    jsforce.browser.logout();
    store.dispatch(logoutAction());
}

export function login(loginUrl) {
    // Force redirect instead of popup
    window.open = () => null;
    jsforce.browser.login({ loginUrl });
}

export function isLoggedIn() {
    return !!(connection && connection.accessToken);
}
