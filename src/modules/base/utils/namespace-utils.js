import { escapeRegExp } from './regexp-utils';

const MANAGED_NAME_PATTERN = new RegExp(
    '^([a-z_]?[a-z])+(?:__[cr]|__Share|__latitude__s|__longitude__s)$',
    'i'
);

function _fullApiName(namespace, apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (MANAGED_NAME_PATTERN.test(apiName)) {
        return `${namespace}__${apiName}`;
    }
    return apiName;
}

export function fullApiName(namespace, apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (Array.isArray(apiName)) {
        return apiName.map(n => _fullApiName(namespace, n));
    }
    return apiName
        .split('.')
        .map(n => _fullApiName(namespace, n))
        .join('.');
}

function _stripNamespace(namespace, apiName) {
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

export function stripNamespace(namespace, apiName) {
    if (!apiName) return null;
    if (!namespace) return apiName;
    if (Array.isArray(apiName)) {
        return apiName.map(n => _stripNamespace(namespace, n));
    }
    return apiName
        .split('.')
        .map(n => _stripNamespace(namespace, n))
        .join('.');
}

export function isSame(namespace, apiName1, apiName2) {
    return (
        fullApiName(namespace, apiName1) === fullApiName(namespace, apiName2)
    );
}
