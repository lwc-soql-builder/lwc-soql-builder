import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    deselectSObject,
    clearSObjectError
} from '../../store/store';
import { showToast } from '../../base/toast/toast-manager';

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
    storeChange({ sobject, ui }) {
        if (!ui.selectedSObject) return;

        if (ui.selectedSObject !== this._selectedSObject) {
            this._selectedSObject = ui.selectedSObject;
            store.dispatch(describeSObjectIfNeeded(ui.selectedSObject));
        }

        const sobjectState = sobject[ui.selectedSObject];
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
            store.dispatch(clearSObjectError(ui.selectedSObject));
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
}
