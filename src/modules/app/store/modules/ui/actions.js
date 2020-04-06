import {
    LOAD_RECENT_QUERIES,
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP,
    UPDATE_SOQL,
    FORMAT_SOQL
} from './constants';

export function loadRecentQueries() {
    return {
        type: LOAD_RECENT_QUERIES
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
        payload: { fieldName, relationships, childRelationship }
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
