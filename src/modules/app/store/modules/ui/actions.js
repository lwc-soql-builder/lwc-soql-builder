import {
    SELECT_FIELD,
    DESELECT_FIELD,
    SELECT_RELATIONSHIP,
    DESELECT_RELATIONSHIP
} from './constants';

export function selectField(fieldName) {
    return {
        type: SELECT_FIELD,
        payload: { fieldName }
    };
}

export function deselectField() {
    return {
        type: DESELECT_FIELD
    };
}

export function selectRelationship(relationshipName) {
    return {
        type: SELECT_RELATIONSHIP,
        payload: { relationshipName }
    };
}

export function deselectRelationship() {
    return {
        type: DESELECT_RELATIONSHIP
    };
}
