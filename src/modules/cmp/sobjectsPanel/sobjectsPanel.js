import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    fetchSObjectsIfNeeded,
    selectSObject,
    clearSObjectsError
} from '../../store/store';
import { showToast } from '../../base/toast/toast-manager';

export default class SobjectsPanel extends LightningElement {
    sobjects;
    isLoading;

    _rawSObjects;

    @wire(connectStore, { store })
    storeChange({ sobjects }) {
        this.isLoading = sobjects.isFetching;
        if (sobjects.data) {
            this._rawSObjects = sobjects.data.sobjects.map(sobject => {
                return {
                    ...sobject,
                    itemLabel: `${sobject.name} / ${sobject.label}`
                };
            });
            this.sobjects = this._rawSObjects;
        } else if (sobjects.error) {
            console.error(sobjects.error);
            showToast({
                message:
                    'Failed to get sObjects. Perhaps your token is expired. Please login again.',
                errors: sobjects.error
            });
            store.dispatch(clearSObjectsError());
        }
    }

    connectedCallback() {
        store.dispatch(fetchSObjectsIfNeeded());
    }

    filterSObjects(event) {
        const keyword = event.target.value;
        if (keyword) {
            this.sobjects = this._rawSObjects.filter(sobject => {
                return `${sobject.name} ${sobject.label}`.includes(keyword);
            });
        } else {
            this.sobjects = this._rawSObjects;
        }
    }

    selectSObject(event) {
        const sObjectName = event.target.dataset.name;
        store.dispatch(selectSObject(sObjectName));
    }
}
