import {
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP
} from './constants';

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

export function toggleField(fieldName) {
    return {
        type: TOGGLE_FIELD,
        payload: { fieldName }
    };
}

export function toggleRelationship(relationshipName) {
    return {
        type: TOGGLE_RELATIONSHIP,
        payload: { relationshipName }
    };
}
