import { LightningElement, wire } from 'lwc';
import * as salesforce from '../../service/salesforce';
import { connectStore, store, clearMetadataError } from '../../store/store';
import {
    registerToastListener,
    showToast
} from '../../base/toast/toast-manager';

export default class Container extends LightningElement {
    isLoggedIn;
    selectedSObject;

    @wire(connectStore, { store })
    storeChange({ metadata, ui }) {
        this.isLoggedIn = ui.isLoggedIn;
        if (ui.selectedSObject) {
            this.selectedSObject = ui.selectedSObject;
        } else {
            this.selectedSObject = null;
        }
        if (metadata.error) {
            console.error(metadata.error);
            showToast({
                message: 'Failed to fetch Metadata.',
                errors: metadata.error
            });
            store.dispatch(clearMetadataError());
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
