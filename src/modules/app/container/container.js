import { LightningElement, wire } from 'lwc';
import salesforce from '../../service/salesforce';
import { connectStore, store } from '../../app/store/store';

export default class Container extends LightningElement {
    selectedSObject;

    @wire(connectStore, { store })
    storeChange({ sobjects }) {
        if (sobjects.selectedSObject) {
            this.selectedSObject = sobjects.selectedSObject;
        } else {
            this.selectedSObject = null;
        }
    }

    get isLoggedIn() {
        return salesforce.isLoggedIn();
    }

    get locationOrigin() {
        return window.location.origin;
    }

    connectedCallback() {
        salesforce.init();
    }
}
