// OAuth 2.0 Authorization Code + PKCE helpers (RFC 7636).
// The implicit (user-agent) flow this app used before is removed in OAuth 2.1
// and no longer works with Salesforce; External Client Apps require PKCE.

function base64UrlEncode(bytes) {
    let str = '';
    bytes.forEach(b => {
        str += String.fromCharCode(b);
    });
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateRandomString() {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
}

export async function computeCodeChallenge(verifier) {
    const digest = await window.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
    );
    return base64UrlEncode(new Uint8Array(digest));
}

export function buildAuthorizationUrl({
    loginUrl,
    clientId,
    redirectUri,
    codeChallenge,
    state
}) {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state
    });
    return `${loginUrl}/services/oauth2/authorize?${params.toString()}`;
}

// POST to the token endpoint as a public client (no client secret).
// Tries a direct fetch first, which works when the org has
// "Enable CORS for OAuth endpoints" turned on. Otherwise falls back to the
// jsforce AJAX proxy (same one used for API calls), which relays the request
// via the `salesforceproxy-endpoint` header.
export async function requestToken(loginUrl, params, proxyUrl) {
    const url = `${loginUrl}/services/oauth2/token`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString()
    };
    let response;
    try {
        response = await fetch(url, options);
    } catch (e) {
        if (!proxyUrl) throw e;
        response = await fetch(`${proxyUrl}?${Date.now()}`, {
            ...options,
            headers: {
                ...options.headers,
                'salesforceproxy-endpoint': url
            }
        });
    }
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }
    if (!response.ok) {
        throw new Error(
            data.error_description ||
                data.error ||
                `Token request failed (HTTP ${response.status})`
        );
    }
    if (!data.access_token) {
        throw new Error('Token response did not contain an access token');
    }
    return data;
}

// Best-effort token revocation with the same direct-then-proxy fallback as
// requestToken. Failures are swallowed by the caller.
export async function revokeToken(loginUrl, token, proxyUrl) {
    const url = `${loginUrl}/services/oauth2/revoke`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }).toString()
    };
    try {
        await fetch(url, options);
    } catch (e) {
        if (!proxyUrl) throw e;
        await fetch(`${proxyUrl}?${Date.now()}`, {
            ...options,
            headers: {
                ...options.headers,
                'salesforceproxy-endpoint': url
            }
        });
    }
}
