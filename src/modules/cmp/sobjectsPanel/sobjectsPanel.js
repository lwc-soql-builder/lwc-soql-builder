import { LightningElement, wire } from 'lwc';
import salesforce from '../../service/salesforce';
import { connectStore, store } from '../../app/store/store';
import { fetchSObjectsIfNeeded, selectSObject } from '../../app/store/store';

export default class SobjectsPanel extends LightningElement {
    sobjects;
    filteredSObjects;

    @wire(connectStore, { store })
    storeChange({ sobjects }) {
        if (sobjects.data) {
            this.sobjects = sobjects.data.sobjects;
            this.filteredSObjects = this.sobjects;
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
            this.filteredSObjects = this.sobjects.filter(sobject => {
                return `${sobject.name} ${sobject.label}`.includes(keyword);
            });
        } else {
            this.filteredSObjects = this.sobjects;
        }
    }

    selectSObject(event) {
        const sObjectName = event.target.dataset.name;
        console.log(sObjectName);
        store.dispatch(selectSObject(sObjectName));
    }
}
