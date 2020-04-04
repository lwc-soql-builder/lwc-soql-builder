import {
    getField,
    getFlattenedFields,
    composeQuery,
    parseQuery,
    isQueryValid
} from 'soql-parser-js';
import {
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP,
    UPDATE_SOQL
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
        case SELECT_SOBJECT: {
            const query = {
                ...INITIAL_QUERY,
                sObject: action.payload.sObjectName
            };
            return {
                ...state,
                selectedSObject: action.payload.sObjectName,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case DESELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: undefined
            };

        case TOGGLE_FIELD: {
            const query = toggleField(state.query, action);
            return {
                ...state,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case TOGGLE_RELATIONSHIP: {
            const query = toggleRelationship(state.query, action);
            return {
                ...state,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case UPDATE_SOQL: {
            const { soql } = action.payload;
            const query = isQueryValid(soql) ? parseQuery(soql) : state.query;
            return {
                ...state,
                selectedSObject: query.sObject,
                query,
                soql
            };
        }

        default:
            return state;
    }
}
