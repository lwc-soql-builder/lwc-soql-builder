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
    DESELECT_CHILD_RELATIONSHIP
} from './constants';
import { RECEIVE_QUERY_SUCCESS } from '../query/constants';
import { connection } from '../../../service/salesforce';
import { RECEIVE_METADATA_SUCCESS } from '../metadata/constants';
import { stripNamespace } from '../../../base/utils/namespace-utils';

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

function _getStripNamespaceFunc(namespace) {
    return apiName => {
        return stripNamespace(namespace, apiName);
    };
}

function _toggleField(query, namespace, fieldName, relationships) {
    const stripNamespaceFunc = _getStripNamespaceFunc(namespace);
    fieldName = stripNamespaceFunc(fieldName);
    relationships = stripNamespaceFunc(relationships);
    const fieldNames = stripNamespaceFunc(getFlattenedFields(query));
    const rawFieldName = stripNamespaceFunc(
        _getRawFieldName(fieldName, relationships)
    );
    if (fieldNames.includes(rawFieldName)) {
        return {
            ...query,
            fields: query.fields.filter(field => {
                const relationshipPath =
                    field.relationships && field.relationships.join('.');
                return (
                    stripNamespaceFunc(
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
    namespace,
    fieldName,
    relationships,
    childRelationship
) {
    const stripNamespaceFunc = _getStripNamespaceFunc(namespace);
    fieldName = stripNamespaceFunc(fieldName);
    childRelationship = stripNamespaceFunc(childRelationship);
    const childField = state.fields.find(
        field =>
            field.subquery &&
            stripNamespaceFunc(field.subquery.relationshipName) ===
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
    relationships = stripNamespaceFunc(relationships);
    const newSubquery = _toggleField(
        childField.subquery,
        namespace,
        fieldName,
        relationships
    );
    const newFields = state.fields.map(field => {
        if (
            field.subquery &&
            stripNamespaceFunc(field.subquery.relationshipName) ===
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

function toggleField(state = INITIAL_QUERY, namespace, action) {
    const { fieldName, relationships, childRelationship } = action.payload;
    if (childRelationship) {
        return _toggleChildRelationshipField(
            state,
            namespace,
            fieldName,
            relationships,
            childRelationship
        );
    }
    return _toggleField(state, namespace, fieldName, relationships);
}

function toggleRelationship(state = [], namespace, action) {
    const { relationshipName } = action.payload;
    const stripNamespaceFunc = _getStripNamespaceFunc(namespace);
    const relationship = stripNamespaceFunc(relationshipName);
    const fieldNames = stripNamespaceFunc(getFlattenedFields(state));
    if (fieldNames.includes(relationship)) {
        return {
            ...state,
            fields: state.fields.filter(
                field =>
                    !field.subquery ||
                    stripNamespaceFunc(field.subquery.relationshipName) !==
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

        case RECEIVE_METADATA_SUCCESS:
            return {
                ...state,
                namespace: action.payload.data.organizationNamespace
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
                sObject: stripNamespace(state.namespace, sObjectName)
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
            const query = toggleField(state.query, state.namespace, action);
            return {
                ...state,
                query,
                soql: composeQuery(query, { format: true })
            };
        }

        case TOGGLE_RELATIONSHIP: {
            const query = toggleRelationship(
                state.query,
                state.namespace,
                action
            );
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

        default:
            return state;
    }
}
