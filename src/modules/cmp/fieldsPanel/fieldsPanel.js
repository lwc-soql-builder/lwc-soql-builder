import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    deselectSObject,
    clearSObjectError,
    selectAllFields,
    unselectAllFields
} from '../../store/store';
import { showToast } from '../../base/toast/toast-manager';
import { fullApiName } from '../../service/salesforce';

export default class FieldsPanel extends LightningElement {
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
    keyword;
    isLoading;

    _selectedSObject;

    @wire(connectStore, { store })
    storeChange({ sobjects, sobject, ui }) {
        const { selectedSObject } = ui;
        if (!selectedSObject) return;

        const fullSObjectName = fullApiName(selectedSObject);
        if (
            sobjects &&
            !sobjects.data.sobjects.find(o => o.name === fullSObjectName)
        ) {
            return;
        }
        if (fullSObjectName !== this._selectedSObject) {
            this._selectedSObject = fullSObjectName;
            store.dispatch(describeSObjectIfNeeded(this._selectedSObject));
        }

        const sobjectState = sobject[this._selectedSObject];
        if (!sobjectState) return;
        this.isLoading = sobjectState.isFetching;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        } else if (sobjectState.error) {
            console.error(sobjectState.error);
            showToast({
                message: 'Failed to describe sObject',
                errors: sobjectState.error
            });
            store.dispatch(clearSObjectError(this._selectedSObject));
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

    deselectSObject() {
        store.dispatch(deselectSObject());
    }

    selectTab(event) {
        const tabId = event.target.dataset.id;
        this.tabs = this.tabs.map(tab => {
            return { ...tab, isActive: tab.id === tabId };
        });
    }

    setKeyword(event) {
        this.keyword = event.target.value;
    }

    handleMenuSelect(event) {
        switch (event.detail.value) {
            case 'select_all':
                store.dispatch(selectAllFields(this.sobjectMeta));
                break;
            case 'unselect_all':
                store.dispatch(unselectAllFields());
                break;
            default:
                break;
        }
    }
}
