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
    UPDATE_API_LIMIT,
    SELECT_SOBJECT,
    DESELECT_SOBJECT,
    TOGGLE_FIELD,
    TOGGLE_RELATIONSHIP,
    UPDATE_SOQL,
    FORMAT_SOQL,
    LOAD_RECENT_QUERIES,
    SELECT_CHILD_RELATIONSHIP,
    DESELECT_CHILD_RELATIONSHIP,
    SELECT_ALL_FIELDS,
    CLEAR_ALL_FIELDS,
    SORT_FIELDS
} from './constants';
import { RECEIVE_QUERY_SUCCESS } from '../query/constants';
import { connection, stripNamespace } from '../../../service/salesforce';

const RECENT_QUERIES_KEY = 'lsb.recentQueries';
const MAX_RECENT_QUERIES = 20;

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
    fieldName = stripNamespace(fieldName);
    relationships = stripNamespace(relationships);
    const fieldNames = stripNamespace(getFlattenedFields(query));
    const rawFieldName = stripNamespace(
        _getRawFieldName(fieldName, relationships)
    );
    if (fieldNames.includes(rawFieldName)) {
        return {
            ...query,
            fields: query.fields.filter(field => {
                const relationshipPath =
                    field.relationships && field.relationships.join('.');
                return (
                    stripNamespace(
                        _getRawFieldName(field.field, relationshipPath)
                    ) !== rawFieldName
                );
            })
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
    fieldName = stripNamespace(fieldName);
    childRelationship = stripNamespace(childRelationship);
    const childField = state.fields.find(
        field =>
            field.subquery &&
            stripNamespace(field.subquery.relationshipName) ===
                childRelationship
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
    relationships = stripNamespace(relationships);
    const newSubquery = _toggleField(
        childField.subquery,
        fieldName,
        relationships
    );
    const newFields = state.fields.map(field => {
        if (
            field.subquery &&
            stripNamespace(field.subquery.relationshipName) ===
                childRelationship
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
    const relationship = stripNamespace(relationshipName);
    const fieldNames = stripNamespace(getFlattenedFields(state));
    if (fieldNames.includes(relationship)) {
        return {
            ...state,
            fields: state.fields.filter(
                field =>
                    !field.subquery ||
                    stripNamespace(field.subquery.relationshipName) !==
                        relationship
            )
        };
    }
    const subquery = {
        fields: [getField('Id')],
        relationshipName: relationship
    };
    return {
        ...state,
        fields: [...state.fields, getField({ subquery })]
    };
}

function selectAllFields(query = INITIAL_QUERY, action) {
    const { sObjectMeta } = action.payload;
    return {
        ...query,
        fields: sObjectMeta.fields.map(field =>
            getField(stripNamespace(field.name))
        )
    };
}

function clearAllFields(query = INITIAL_QUERY) {
    return {
        ...query,
        fields: [getField('Id')]
    };
}

export default function ui(state = {}, action) {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                isLoggedIn: true,
                user: action.payload.user
            };

        case LOGOUT:
            return {
                ...state,
                isLoggedIn: false
            };

        case UPDATE_API_LIMIT: {
            const { limitInfo } = connection;
            return {
                ...state,
                apiUsage: limitInfo ? limitInfo.apiUsage : undefined
            };
        }

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
            const { sObjectName } = action.payload;
            const query = {
                ...INITIAL_QUERY,
                sObject: stripNamespace(sObjectName)
            };
            return {
                ...state,
                selectedSObject: sObjectName,
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
            if (!soql.trim()) {
                return {
                    ...state,
                    selectedSObject: undefined,
                    query: undefined,
                    soql
                };
            }
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

        case SELECT_ALL_FIELDS: {
            const query = selectAllFields(state.query, action);
            return {
                ...state,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case CLEAR_ALL_FIELDS: {
            const query = clearAllFields(state.query);
            return {
                ...state,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case SORT_FIELDS: {
            const { sort } = action.payload;
            return {
                ...state,
                sort
            };
        }

        default:
            return state;
    }
}
