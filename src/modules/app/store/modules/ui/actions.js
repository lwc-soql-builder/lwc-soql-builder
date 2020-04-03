import { TOGGLE_FIELD, TOGGLE_RELATIONSHIP } from './constants';

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
