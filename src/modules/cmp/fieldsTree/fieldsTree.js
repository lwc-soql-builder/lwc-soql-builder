import { LightningElement, api, wire } from 'lwc';
import { getFlattenedFields } from 'soql-parser-js';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    toggleField
} from '../../store/store';

export default class FieldsTree extends LightningElement {
    // sObject Name
    @api sobject;
    // relationship Path e.g. "Contact.Owner"
    @api relationship;
    // Child Relationship Name
    @api childrelation;
    @api rootlevel = 1;

    sobjectMeta;
    fields = [];
    _keyword;
    _rawFields = [];
    _expandedFieldNames = {};

    @api
    get keyword() {
        return this._keyword;
    }
    set keyword(value) {
        if (this._keyword !== value) {
            this._keyword = value;
            this._filterFields();
        }
    }

    get level() {
        if (!this.relationship) return this.rootLevelNum;
        return this.relationship.split('.').length + this.rootLevelNum;
    }

    get isMaxLevel() {
        return this.level > 4 + this.rootLevelNum;
    }

    get rootLevelNum() {
        return parseInt(this.rootlevel, 10);
    }

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        const sobjectState = sobject[this.sobject];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        }

        this._updateFields(ui.query);
    }

    connectedCallback() {
        store.dispatch(describeSObjectIfNeeded(this.sobject));
    }

    selectField(event) {
        const fieldName = event.target.dataset.name;
        store.dispatch(
            toggleField(fieldName, this.relationship, this.childrelation)
        );
    }

    toggleReferenceField(event) {
        const fieldName = event.target.dataset.field;
        this._expandedFieldNames[fieldName] = !this._expandedFieldNames[
            fieldName
        ];
        this._filterFields();
    }

    _updateFields(query) {
        if (!this.sobjectMeta) return;
        const selectedFields = this._getSelectedFields(query);
        this._rawFields = this.sobjectMeta.fields.map(field => {
            return {
                ...field,
                itemLabel: `${field.name} / ${field.label}`,
                isNotReference: field.type !== 'reference',
                isActive: selectedFields.includes(this._getRawFieldName(field)),
                isExpanded: false,
                ...this._generateRelationshipProperties(field)
            };
        });
        this._filterFields();
    }

    _getSelectedFields(query) {
        if (!query) return [];
        if (this.childrelation) {
            const subquery = query.fields.find(
                field =>
                    field.type === 'FieldSubquery' &&
                    field.subquery.relationshipName === this.childrelation
            );
            if (!subquery) return [];
            return getFlattenedFields(subquery);
        }
        return getFlattenedFields(query);
    }

    _getRawFieldName(field) {
        if (this.relationship) {
            return `${this.relationship}.${field.name}`;
        }
        return field.name;
    }

    _getRelationshipPath(field) {
        if (this.relationship) {
            return `${this.relationship}.${field.relationshipName}`;
        }
        return field.relationshipName;
    }

    _generateRelationshipProperties(field) {
        return {
            relationshipSObjectName:
                field.referenceTo && field.referenceTo.length > 0
                    ? field.referenceTo[0]
                    : undefined,
            relationshipPath: this._getRelationshipPath(field)
        };
    }

    _filterFields() {
        let fields;
        if (this.level === 1 && this.keyword) {
            fields = this._rawFields.filter(field => {
                return `${field.name} ${field.label}`.includes(this.keyword);
            });
        } else {
            fields = this._rawFields;
        }
        this.fields = fields.map(field => {
            return {
                ...field,
                isExpanded: !!this._expandedFieldNames[field.name]
            };
        });
    }
}
