import {
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP
} from './constants';

function toggleField(state = [], action) {
    const { fieldName } = action.payload;
    if (state.includes(fieldName)) {
        return state.filter(el => el !== fieldName);
    }
    return [...state, fieldName];
}

function toggleRelationship(state = [], action) {
    const { relationshipName } = action.payload;
    if (state.includes(relationshipName)) {
        return state.filter(el => el !== relationshipName);
    }
    return [...state, relationshipName];
}

export default function sobjects(state = {}, action) {
    switch (action.type) {
        case SELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: action.payload.sObjectName,
                selectedFields: ['Id']
            };

        case DESELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: undefined
            };

        case TOGGLE_FIELD:
            return {
                ...state,
                selectedFields: toggleField(state.selectedFields, action)
            };

        case TOGGLE_RELATIONSHIP:
            return {
                ...state,
                selectedRelationships: toggleRelationship(
                    state.selectedRelationships,
                    action
                )
            };

        default:
            return state;
    }
}
