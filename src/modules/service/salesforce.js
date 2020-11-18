import jsforce from 'jsforce';
import { store, logout as logoutAction } from '../store/store';
import { escapeRegExp } from '../base/utils/regexp-utils';

// eslint-disable-next-line no-undef
const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN_KEY = 'lsb.accessToken';
const INSTANCE_URL_KEY = 'lsb.instanceUrl';
const API_VERSION_KEY = 'lsb.apiVersion';

// eslint-disable-next-line no-undef
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

const MANAGED_NAME_PATTERN = new RegExp(
    '^([a-z_]?[a-z])+(?:__[cr]|__Share|__latitude__s|__longitude__s)$',
    'i'
);

export let connection;
export let namespace;

let apiVersion;

function getProxyUrl() {
    if (navigator.language === 'ja') {
        return `https://asia-northeast1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/asia_northeast1/proxy/`;
    }
    return `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/us_central1/proxy/`;
}

function jsforceOptions() {
    return {
        clientId: CLIENT_ID,
        redirectUri: `${window.location.origin}${window.location.pathname}`,
        version: apiVersion,
        proxyUrl: getProxyUrl()
    };
}

async function getApiVersion() {
    apiVersion = sessionStorage.getItem(API_VERSION_KEY);
    if (!apiVersion) {
        const versions = await connection.request('/services/data/');
        // Get latest version
        apiVersion = versions[versions.length - 1].version;
        connection.version = apiVersion;
        sessionStorage.setItem(API_VERSION_KEY, apiVersion);
    } else {
        connection.version = apiVersion;
    }
}

async function postConnect(callback) {
    callback = callback || (() => {});
    try {
        const user = await connection.request('/services/oauth2/userinfo');
        await getApiVersion();
        const metadata = await connection.metadata.describe(apiVersion);
        namespace = metadata.organizationNamespace;
        callback(null, user);
    } catch (e) {
        callback(e);
        logout();
    }
}

export function init(callback) {
    const isAuthCallback = window.location.hash;

    jsforce.browser.init(jsforceOptions());
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
            version: apiVersion,
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
    if (isAuthCallback) jsforce.browser.init(jsforceOptions());

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

export function getQueryHeaders() {
    if (namespace) {
        return {
            'Sforce-Call-Options': `defaultNamespace=${namespace}`
        };
    }
    return {};
}

function _fullApiName(apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (MANAGED_NAME_PATTERN.test(apiName)) {
        return `${namespace}__${apiName}`;
    }
    return apiName;
}

export function fullApiName(apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (Array.isArray(apiName)) {
        return apiName.map(n => _fullApiName(n));
    }
    return apiName
        .split('.')
        .map(n => _fullApiName(n))
        .join('.');
}

function _stripNamespace(apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    const escapedNamespace = escapeRegExp(namespace);
    const namespacePattern = new RegExp(`^${escapedNamespace}__(.*)$`, 'i');
    const matcher = apiName.match(namespacePattern);
    if (matcher) {
        return matcher[1];
    }
    return apiName;
}

export function stripNamespace(apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (Array.isArray(apiName)) {
        return apiName.map(n => _stripNamespace(n));
    }
    return apiName
        .split('.')
        .map(n => _stripNamespace(n))
        .join('.');
}

export function isSame(apiName1, apiName2) {
    return fullApiName(apiName1) === fullApiName(apiName2);
}
