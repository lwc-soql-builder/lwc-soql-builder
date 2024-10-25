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

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
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
}
