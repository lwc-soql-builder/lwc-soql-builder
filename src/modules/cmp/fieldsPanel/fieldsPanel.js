import { LightningElement, api, wire } from 'lwc';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    deselectSObject,
    selectField,
    selectRelationship
} from '../../app/store/store';

export default class FieldsPanel extends LightningElement {
    @api sobject;
    sobjectMeta;
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

    @wire(connectStore, { store })
    storeChange({ sobject }) {
        const sobjectState = sobject[this.sobject.name];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        } else if (sobjectState.error) {
            console.error(sobject.error);
        }
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
        if (this.sobject.name) {
            store.dispatch(describeSObjectIfNeeded(this.sobject.name));
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
        store.dispatch(selectField(fieldName));
    }

    selectRelationship(event) {
        const relationshipName = event.target.dataset.name;
        console.log(relationshipName);
        store.dispatch(selectRelationship(relationshipName));
    }
}
