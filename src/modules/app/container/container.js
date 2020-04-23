import { LightningElement, wire } from 'lwc';
import * as salesforce from '../../service/salesforce';
import {
    connectStore,
    store,
    clearMetadataError,
    login,
    fetchMetadataIfNeeded,
    fetchSObjectsIfNeeded
} from '../../store/store';
import {
    registerToastListener,
    showToast
} from '../../base/toast/toast-manager';

export default class Container extends LightningElement {
    isLoading;
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
        this.isLoading = true;
        salesforce.init(this._loginCallback.bind(this));
        registerToastListener();
    }

    _loginCallback(error, user) {
        this.isLoading = false;
        if (error) {
            console.error(error);
            showToast({
                message:
                    'Failed to fetch login user. Your token is expired. Please login again.',
                errors: error
            });
            return;
        }
        if (user) {
            store.dispatch(login(user));
            store.dispatch(fetchMetadataIfNeeded());
            store.dispatch(fetchSObjectsIfNeeded());
        }
    }
}
