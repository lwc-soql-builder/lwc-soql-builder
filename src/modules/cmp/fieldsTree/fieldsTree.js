import { LightningElement, api, wire } from 'lwc';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    toggleField
} from '../../store/store';
import { escapeRegExp } from '../../base/utils/regexp-utils';
import { fullApiName, isSame } from '../../service/salesforce';
import { getFlattenedFields } from 'soql-parser-js';
import { I18nMixin } from '../../i18n/i18n';

export default class FieldsTree extends I18nMixin(LightningElement) {
    // sObject Name
    @api sobject;
    // relationship Path e.g. "Contact.Owner"
    @api relationship;
    // Child Relationship Name
    @api childrelation;
    @api rootlevel = 1;

    sobjectMeta;
    fields = [];
    isLoading;
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

    get isNoFields() {
        return !this.fields || !this.fields.length;
    }

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        const sobjectState = sobject[this.sobject];
        if (!sobjectState) return;
        this.isLoading = sobjectState.isFetching;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        }

        this._updateFields(ui.query);
    }

    connectedCallback() {
        store.dispatch(describeSObjectIfNeeded(this.sobject));
    }

    selectField(event) {
        const fieldName = event.currentTarget.dataset.name;
        store.dispatch(
            toggleField(fieldName, this.relationship, this.childrelation)
        );
    }

    toggleReferenceField(event) {
        const fieldName = event.target.dataset.field;
        this._expandedFieldNames[fieldName] =
            !this._expandedFieldNames[fieldName];
        this._filterFields();
    }

    _updateFields(query) {
        if (!this.sobjectMeta) return;
        const selectedFields = this._getSelectedFields(query);
        this._rawFields = this.sobjectMeta.fields.map(field => {
            return {
                ...field,
                details: `${field.type.toUpperCase()} / ${field.label}`,
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
                    isSame(field.subquery.relationshipName, this.childrelation)
            );
            if (!subquery) return [];
            return this._getFlattenedFields(subquery);
        }
        return this._getFlattenedFields(query);
    }

    _getRawFieldName(field) {
        let rawFieldName;
        if (this.relationship) {
            rawFieldName = `${this.relationship}.${field.name}`;
        } else {
            rawFieldName = field.name;
        }
        return fullApiName(rawFieldName);
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
            const escapedKeyword = escapeRegExp(this.keyword);
            const keywordPattern = new RegExp(escapedKeyword, 'i');
            fields = this._rawFields.filter(field => {
                return keywordPattern.test(`${field.name} ${field.label}`);
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

    _getFlattenedFields(query) {
        return getFlattenedFields(query).map(field => fullApiName(field));
    }
}
