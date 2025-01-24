import {
    LOGIN,
    LOGOUT,
    UPDATE_API_LIMIT,
    LOAD_RECENT_QUERIES,
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP,
    UPDATE_SOQL,
    FORMAT_SOQL,
    SELECT_CHILD_RELATIONSHIP,
    DESELECT_CHILD_RELATIONSHIP,
    SELECT_ALL_FIELDS,
    CLEAR_ALL_FIELDS,
    SORT_FIELDS,
    SELECT_MODE,
    LOAD_RECENT_APIS,
    SELECT_API_REQUEST
} from './constants';

export function login(user) {
    return {
        type: LOGIN,
        payload: { user }
    };
}

export function logout() {
    return {
        type: LOGOUT
    };
}

export function updateApiLimit() {
    return {
        type: UPDATE_API_LIMIT
    };
}

export function loadRecentQueries() {
    return {
        type: LOAD_RECENT_QUERIES
    };
}

export function loadRecentAPIs() {
    return {
        type: LOAD_RECENT_APIS
    };
}

export function selectAPIRequest(request) {
    return {
        type: SELECT_API_REQUEST,
        payload: { request }
    };
}

export function selectSObject(sObjectName) {
    return {
        type: SELECT_SOBJECT,
        payload: { sObjectName }
    };
}

export function deselectSObject() {
    return {
        type: DESELECT_SOBJECT
    };
}

export function toggleField(fieldName, relationships, childRelationship) {
    return {
        type: TOGGLE_FIELD,
        payload: {
            fieldName,
            relationships,
            childRelationship
        }
    };
}

export function toggleRelationship(relationshipName) {
    return {
        type: TOGGLE_RELATIONSHIP,
        payload: { relationshipName }
    };
}

export function updateSoql(soql) {
    return {
        type: UPDATE_SOQL,
        payload: { soql }
    };
}

export function formatSoql() {
    return {
        type: FORMAT_SOQL
    };
}

export function selectChildRelationship(childRelationship) {
    return {
        type: SELECT_CHILD_RELATIONSHIP,
        payload: { childRelationship }
    };
}

export function deselectChildRelationship() {
    return {
        type: DESELECT_CHILD_RELATIONSHIP
    };
}

export function selectAllFields(sObjectMeta) {
    return {
        type: SELECT_ALL_FIELDS,
        payload: { sObjectMeta }
    };
}

export function clearAllFields() {
    return {
        type: CLEAR_ALL_FIELDS
    };
}

export function sortFields(order) {
    return {
        type: SORT_FIELDS,
        payload: {
            sort: {
                order
            }
        }
    };
}

export function selectMode(mode) {
    return {
        type: SELECT_MODE,
        payload: { mode }
    };
}
