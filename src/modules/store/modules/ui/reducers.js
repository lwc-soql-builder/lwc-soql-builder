import {
    getField,
    getFlattenedFields,
    composeQuery,
    parseQuery,
    isQueryValid
} from 'soql-parser-js';
import {
    LOGIN,
    LOGOUT,
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP,
    UPDATE_SOQL,
    FORMAT_SOQL,
    LOAD_RECENT_QUERIES,
    SELECT_CHILD_RELATIONSHIP,
    DESELECT_CHILD_RELATIONSHIP
} from './constants';
import { RECEIVE_QUERY_SUCCESS } from '../query/constants';

const RECENT_QUERIES_KEY = 'lsb.recentQueries';
const MAX_RECENT_QUERIES = 10;

const INITIAL_QUERY = {
    fields: [getField('Id')],
    sObject: undefined
};

function _getRawFieldName(fieldName, relationships) {
    if (relationships) {
        return `${relationships}.${fieldName}`;
    }
    return fieldName;
}

function _toggleField(query, fieldName, relationships) {
    const fieldNames = getFlattenedFields(query);
    const rawFieldName = _getRawFieldName(fieldName, relationships);
    if (fieldNames.includes(rawFieldName)) {
        return {
            ...query,
            fields: query.fields.filter(field => field.field !== rawFieldName)
        };
    }
    if (relationships) {
        return {
            ...query,
            fields: [
                ...query.fields,
                getField({
                    field: fieldName,
                    relationships: relationships.split('.')
                })
            ]
        };
    }
    return {
        ...query,
        fields: [...query.fields, getField(fieldName)]
    };
}

function _toggleChildRelationshipField(
    state,
    fieldName,
    relationships,
    childRelationship
) {
    const childField = state.fields.find(
        field =>
            field.subquery &&
            field.subquery.relationshipName === childRelationship
    );
    if (!childField) {
        return {
            ...state,
            fields: [
                ...state.fields,
                getField({
                    subquery: {
                        fields: [getField(fieldName)],
                        relationshipName: childRelationship
                    }
                })
            ]
        };
    }
    const newSubquery = _toggleField(
        childField.subquery,
        fieldName,
        relationships
    );
    const newFields = state.fields.map(field => {
        if (
            field.subquery &&
            field.subquery.relationshipName === childRelationship
        ) {
            return {
                ...field,
                subquery: newSubquery
            };
        }
        return field;
    });
    return {
        ...state,
        fields: newFields
    };
}

function recentQueries(state = [], action) {
    const { soql } = action.payload;
    const recentQueriesState = [
        soql,
        ...state.filter(q => q !== soql).slice(0, MAX_RECENT_QUERIES - 1)
    ];
    try {
        localStorage.setItem(
            RECENT_QUERIES_KEY,
            JSON.stringify(recentQueriesState)
        );
    } catch (e) {
        console.warn('Failed to save recent queries from localStorage', e);
    }
    return recentQueriesState;
}

function loadRecentQueries() {
    try {
        const recentQueriesText = localStorage.getItem(RECENT_QUERIES_KEY);
        if (recentQueriesText) return JSON.parse(recentQueriesText);
    } catch (e) {
        console.warn('Failed to load recent queries from localStorage', e);
    }
    return [];
}

function toggleField(state = INITIAL_QUERY, action) {
    const { fieldName, relationships, childRelationship } = action.payload;
    if (childRelationship) {
        return _toggleChildRelationshipField(
            state,
            fieldName,
            relationships,
            childRelationship
        );
    }
    return _toggleField(state, fieldName, relationships);
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

export default function ui(state = {}, action) {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                isLoggedIn: true
            };

        case LOGOUT:
            return {
                ...state,
                isLoggedIn: false
            };

        case RECEIVE_QUERY_SUCCESS:
            return {
                ...state,
                recentQueries: recentQueries(state.recentQueries, action),
                childRelationship: undefined
            };

        case LOAD_RECENT_QUERIES:
            return {
                ...state,
                recentQueries: loadRecentQueries()
            };

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
                selectedSObject: query ? query.sObject : undefined,
                query,
                soql
            };
        }

        case FORMAT_SOQL: {
            return {
                ...state,
                soql: composeQuery(state.query, { format: true })
            };
        }

        case SELECT_CHILD_RELATIONSHIP: {
            return {
                ...state,
                childRelationship: action.payload.childRelationship
            };
        }

        case DESELECT_CHILD_RELATIONSHIP: {
            return {
                ...state,
                childRelationship: undefined
            };
        }

        default:
            return state;
    }
}
