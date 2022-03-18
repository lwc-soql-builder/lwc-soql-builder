import { LightningElement, wire } from 'lwc';
import * as salesforce from '../../service/salesforce';
import {
    connectStore,
    store,
    login,
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
    rightTopLeftPanelHeight = 300;

    get sobjectsPanelClass() {
        return this.selectedSObject ? 'slds-hide' : '';
    }

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
        if (ui.selectedSObject) {
            this.selectedSObject = ui.selectedSObject;
        } else {
            this.selectedSObject = null;
        }
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
            store.dispatch(fetchSObjectsIfNeeded());
        }
    }

    get rightTopPanelStyle() {
        return 'height:' + this.rightTopLeftPanelHeight + 'px';
    }

    dragRightSeparator(event) {
        if (event.clientY > 0)
            this.rightTopLeftPanelHeight = event.clientY - 56;
    }

    dragOverRightSeparator(event) {
        event.preventDefault();
    }
}
