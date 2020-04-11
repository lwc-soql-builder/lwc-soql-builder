import { LightningElement, wire } from 'lwc';
import salesforce from '../../service/salesforce';
import { connectStore, store } from '../../store/store';

export default class Container extends LightningElement {
    selectedSObject;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        if (ui.selectedSObject) {
            this.selectedSObject = ui.selectedSObject;
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
