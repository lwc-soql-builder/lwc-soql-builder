import { LightningElement, wire } from 'lwc';
import * as salesforce from '../../service/salesforce';
import { connectStore, store } from '../../store/store';
import { registerToastListener } from '../../base/toast/toast-manager';

export default class Container extends LightningElement {
    isLoggedIn;
    selectedSObject;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
        if (ui.selectedSObject) {
            this.selectedSObject = ui.selectedSObject;
        } else {
            this.selectedSObject = null;
        }
    }

    get locationOrigin() {
        return window.location.origin;
    }

    constructor() {
        super();
        salesforce.init();
        registerToastListener();
    }
}
