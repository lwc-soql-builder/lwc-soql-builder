import { getField, getFlattenedFields } from 'soql-parser-js';
import {
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP
} from './constants';

const INITIAL_QUERY = {
    fields: [getField('Id')],
    sObject: undefined
};

function toggleField(state = INITIAL_QUERY, action) {
    const { fieldName } = action.payload;
    const fieldNames = getFlattenedFields(state);
    if (fieldNames.includes(fieldName)) {
        return {
            ...state,
            fields: state.fields.filter(field => field.field !== fieldName)
        };
    }
    return {
        ...state,
        fields: [...state.fields, getField(fieldName)]
    };
}

function toggleRelationship(state = [], action) {
    const { relationshipName } = action.payload;
    const fieldNames = getFlattenedFields(state);
    if (fieldNames.includes(relationshipName)) {
        return {
            ...state,
            fields: state.fields.filter(
                field =>
                    field.subquery &&
                    field.subquery.relationshipName !== relationshipName
            )
        };
    }
    const subquery = {
        fields: [getField('Id')],
        relationshipName
    };
    return {
        ...state,
        fields: [...state.fields, getField({ subquery })]
    };
}

export default function sobjects(state = {}, action) {
    switch (action.type) {
        case SELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: action.payload.sObjectName,
                query: {
                    ...INITIAL_QUERY,
                    sObject: action.payload.sObjectName
                }
            };

        case DESELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: undefined
            };

        case TOGGLE_FIELD:
            return {
                ...state,
                query: toggleField(state.query, action)
            };

        case TOGGLE_RELATIONSHIP:
            return {
                ...state,
                query: toggleRelationship(state.query, action)
            };

        default:
            return state;
    }
}
