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
    UPDATE_SOQL,
    FORMAT_SOQL
} from './constants';

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

function toggleField(state = INITIAL_QUERY, action) {
    console.log(action.payload);
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

        default:
            return state;
    }
}
