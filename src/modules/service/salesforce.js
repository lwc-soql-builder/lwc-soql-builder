import jsforce from 'jsforce';
import { store, logout as logoutAction } from '../store/store';
import { escapeRegExp } from '../base/utils/regexp-utils';
import {
    generateRandomString,
    computeCodeChallenge,
    buildAuthorizationUrl,
    requestToken,
    revokeToken
} from './oauth';

const ACCESS_TOKEN_KEY = 'lsb.accessToken';
const INSTANCE_URL_KEY = 'lsb.instanceUrl';
const API_VERSION_KEY = 'lsb.apiVersion';
const REFRESH_TOKEN_KEY = 'lsb.refreshToken';
const AUTH_LOGIN_URL_KEY = 'lsb.authLoginUrl';
const AUTH_CLIENT_ID_KEY = 'lsb.authClientId';
const PKCE_VERIFIER_KEY = 'lsb.pkce.verifier';
const PKCE_STATE_KEY = 'lsb.pkce.state';
const PKCE_CONTEXT_KEY = 'lsb.pkce.context';

// eslint-disable-next-line no-undef
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

const MANAGED_NAME_PATTERN = new RegExp(
    '^([a-z]|_(?!_))*[a-z]__(?:[cr]|Share|latitude__s|longitude__s)$',
    'i'
);

export let connection;
export let namespace;

let apiVersion;

function getProxyUrl() {
    // Without a proxy, API calls go directly to the org, which requires the
    // app's origin in the org's CORS allowlist.
    if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID.startsWith('<')) {
        return undefined;
    }
    if (navigator.language === 'ja') {
        return `https://asia-northeast1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/asia_northeast1/proxy/`;
    }
    return `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/us_central1/proxy/`;
}

function getRedirectUri() {
    return `${window.location.origin}${window.location.pathname}`;
}

function createConnection(accessToken, instanceUrl) {
    connection = new jsforce.Connection({
        accessToken,
        instanceUrl,
        version: apiVersion,
        proxyUrl: getProxyUrl()
    });
}

// Persists the token response. With Refresh Token Rotation enabled on the
// External Client App, a refresh response carries a NEW refresh token that
// must replace the old one immediately, or the session chain is lost.
function saveTokenResponse(loginUrl, clientId, token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token.access_token);
    if (token.instance_url) {
        localStorage.setItem(INSTANCE_URL_KEY, token.instance_url);
    }
    if (token.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token);
    }
    localStorage.setItem(AUTH_LOGIN_URL_KEY, loginUrl);
    localStorage.setItem(AUTH_CLIENT_ID_KEY, clientId);
}

function clearStoredAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(INSTANCE_URL_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_LOGIN_URL_KEY);
    localStorage.removeItem(AUTH_CLIENT_ID_KEY);
    sessionStorage.removeItem(API_VERSION_KEY);
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

async function fetchOrgInfo() {
    const user = await connection.request('/services/oauth2/userinfo');
    await getApiVersion();
    const result = await connection.query(
        'SELECT NamespacePrefix FROM Organization'
    );
    namespace =
        result.records && result.records[0]
            ? result.records[0].NamespacePrefix
            : null;
    return user;
}

// Attempts a single refresh-token grant. Returns true when a new access
// token was obtained and the connection was rebuilt.
async function tryRefresh() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const loginUrl = localStorage.getItem(AUTH_LOGIN_URL_KEY);
    const clientId = localStorage.getItem(AUTH_CLIENT_ID_KEY);
    if (!refreshToken || !loginUrl || !clientId) return false;
    try {
        const token = await requestToken(
            loginUrl,
            {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId
            },
            getProxyUrl()
        );
        saveTokenResponse(loginUrl, clientId, token);
        createConnection(
            token.access_token,
            token.instance_url || localStorage.getItem(INSTANCE_URL_KEY)
        );
        return true;
    } catch (e) {
        return false;
    }
}

async function postConnect(callback, allowRefresh) {
    callback = callback || (() => {});
    try {
        const user = await fetchOrgInfo();
        callback(null, user);
    } catch (e) {
        if (allowRefresh && (await tryRefresh())) {
            try {
                const user = await fetchOrgInfo();
                callback(null, user);
                return;
            } catch (e2) {
                callback(e2);
                logout();
                return;
            }
        }
        callback(e);
        logout();
    }
}

// Handles the redirect back from the authorization server.
// The PKCE material is consumed (read and deleted) and the query string is
// stripped BEFORE the token exchange, so a re-run of init() can never
// exchange the same code twice.
async function handleAuthCallback(params, callback) {
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const returnedState = params.get('state');
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    const expectedState = sessionStorage.getItem(PKCE_STATE_KEY);
    let context = null;
    try {
        context = JSON.parse(sessionStorage.getItem(PKCE_CONTEXT_KEY));
    } catch (e) {
        // ignore corrupt context
    }
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
    sessionStorage.removeItem(PKCE_CONTEXT_KEY);
    window.history.replaceState(null, '', window.location.pathname);

    if (error) {
        callback(new Error(errorDescription || error));
        return;
    }
    if (!verifier || !context || returnedState !== expectedState) {
        callback(new Error('Login session expired. Please login again.'));
        return;
    }
    let token;
    try {
        token = await requestToken(
            context.loginUrl,
            {
                grant_type: 'authorization_code',
                code,
                client_id: context.clientId,
                redirect_uri: getRedirectUri(),
                code_verifier: verifier
            },
            getProxyUrl()
        );
    } catch (e) {
        callback(e);
        return;
    }
    sessionStorage.removeItem(API_VERSION_KEY);
    saveTokenResponse(context.loginUrl, context.clientId, token);
    createConnection(token.access_token, token.instance_url);
    postConnect(callback, false);
}

export function init(callback) {
    callback = callback || (() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || params.has('error')) {
        handleAuthCallback(params, callback);
        return;
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const instanceUrl = localStorage.getItem(INSTANCE_URL_KEY);
    if (accessToken && instanceUrl) {
        createConnection(accessToken, instanceUrl);
        postConnect(callback, true);
        return;
    }

    callback();
}

export function logout() {
    const loginUrl = localStorage.getItem(AUTH_LOGIN_URL_KEY);
    const revokeTarget =
        localStorage.getItem(REFRESH_TOKEN_KEY) ||
        localStorage.getItem(ACCESS_TOKEN_KEY);
    // Best-effort revoke; never block the local logout on it.
    if (loginUrl && revokeTarget) {
        revokeToken(loginUrl, revokeTarget, getProxyUrl()).catch(() => {});
    }
    connection = null;
    clearStoredAuth();
    store.dispatch(logoutAction());
}

// Starts the Authorization Code + PKCE flow against the org's My Domain.
// org: { loginUrl, clientId }
export function login(org) {
    const verifier = generateRandomString();
    const state = generateRandomString();
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);
    sessionStorage.setItem(
        PKCE_CONTEXT_KEY,
        JSON.stringify({ loginUrl: org.loginUrl, clientId: org.clientId })
    );
    computeCodeChallenge(verifier).then(codeChallenge => {
        window.location.assign(
            buildAuthorizationUrl({
                loginUrl: org.loginUrl,
                clientId: org.clientId,
                redirectUri: getRedirectUri(),
                codeChallenge,
                state
            })
        );
    });
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
