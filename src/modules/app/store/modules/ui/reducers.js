import {
    SELECT_FIELD,
    DESELECT_FIELD,
    SELECT_RELATIONSHIP,
    DESELECT_RELATIONSHIP
} from './constants';
import { SELECT_SOBJECT } from '../sobjects/constants';

function addField(state = [], action) {
    return [...state, action.payload.fieldName];
}

function removeField(state = [], action) {
    return state.filter(el => el !== action.payload.fieldName);
}

function addRelationship(state = [], action) {
    return [...state, action.payload.relationshipName];
}

function removeRelationship(state = [], action) {
    return state.filter(el => el !== action.payload.relationshipName);
}

export default function sobjects(state = {}, action) {
    switch (action.type) {
        case SELECT_SOBJECT:
            return {
                ...state,
                selectedFields: ['Id']
            };

        case SELECT_FIELD:
            return {
                ...state,
                selectedFields: addField(state.selectedFields, action)
            };

        case DESELECT_FIELD:
            return {
                ...state,
                selectedFields: removeField(state.selectedFields, action)
            };

        case SELECT_RELATIONSHIP:
            return {
                ...state,
                selectedRelationships: addRelationship(
                    state.selectedRelationships,
                    action
                )
            };

        case DESELECT_RELATIONSHIP:
            return {
                ...state,
                selectedRelationships: removeRelationship(
                    state.selectedRelationships,
                    action
                )
            };

        default:
            return state;
    }
}
