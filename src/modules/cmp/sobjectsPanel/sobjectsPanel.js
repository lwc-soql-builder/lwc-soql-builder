import { LightningElement, wire } from 'lwc';
import salesforce from '../../service/salesforce';
import {
    connectStore,
    store,
    fetchSObjectsIfNeeded,
    selectSObject
} from '../../app/store/store';

export default class SobjectsPanel extends LightningElement {
    sobjects;
    _rawSObjects;

    @wire(connectStore, { store })
    storeChange({ sobjects }) {
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
            salesforce.logout();
            window.location.reload();
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
