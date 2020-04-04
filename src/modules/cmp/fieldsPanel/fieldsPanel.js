import { LightningElement, api, wire } from 'lwc';
import { getFlattenedFields } from 'soql-parser-js';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    deselectSObject,
    toggleField,
    toggleRelationship
} from '../../app/store/store';

export default class FieldsPanel extends LightningElement {
    @api sobject;
    tabs = [
        {
            id: 'tab-fields',
            label: 'Fields',
            isActive: true
        },
        {
            id: 'tab-relationships',
            label: 'Child Relationships',
            isActive: false
        }
    ];
    sobjectMeta;
    fields = [];
    relationships = [];
    _rawFields = [];
    _rawRelationships = [];
    _keyword;

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        const sobjectState = sobject[this.sobject];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
            console.log(this.sobjectMeta);
        } else if (sobjectState.error) {
            console.error(sobject.error);
        }

        this._updateFields(ui.query);
    }

    get isFieldsActive() {
        return !!this.tabs.find(tab => tab.id === 'tab-fields' && tab.isActive);
    }

    get isRelationshipsActive() {
        return !!this.tabs.find(
            tab => tab.id === 'tab-relationships' && tab.isActive
        );
    }

    connectedCallback() {
        if (this.sobject) {
            store.dispatch(describeSObjectIfNeeded(this.sobject));
        }
    }

    deselectSObject() {
        store.dispatch(deselectSObject());
    }

    selectTab(event) {
        const tabId = event.target.dataset.id;
        this.tabs = this.tabs.map(tab => {
            return { ...tab, isActive: tab.id === tabId };
        });
    }

    selectField(event) {
        const fieldName = event.target.dataset.name;
        console.log(fieldName);
        store.dispatch(toggleField(fieldName));
    }

    selectRelationship(event) {
        const relationshipName = event.target.dataset.name;
        console.log(relationshipName);
        store.dispatch(toggleRelationship(relationshipName));
    }

    filterFields(event) {
        this._keyword = event.target.value;
        this._filterFields();
    }

    _updateFields(query) {
        if (!this.sobjectMeta) return;
        const selectedFields = query && getFlattenedFields(query);
        console.log(selectedFields);
        this._rawFields = this.sobjectMeta.fields.map(field => {
            return {
                ...field,
                isActive: selectedFields.includes(field.name)
            };
        });
        this._rawRelationships = this.sobjectMeta.childRelationships.map(
            relation => {
                return {
                    ...relation,
                    isActive: selectedFields.includes(relation.relationshipName)
                };
            }
        );
        this._filterFields();
    }

    _filterFields() {
        if (this._keyword) {
            this.fields = this._rawFields.filter(field => {
                return `${field.name} ${field.label}`.includes(this._keyword);
            });
            this.relationships = this._rawRelationships.filter(relation => {
                return `${relation.relationshipName} ${relation.childSObject}`.includes(
                    this._keyword
                );
            });
        } else {
            this.fields = this._rawFields;
            this.relationships = this._rawRelationships;
        }
    }
}
