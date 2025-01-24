import { LightningElement, wire } from 'lwc';
import {
    registerToastListener,
    showToast
} from '../../base/toast/toast-manager';
import * as salesforce from '../../service/salesforce';
import { MODE } from '../../store/modules/ui/constants';
import {
    connectStore,
    fetchSObjectsIfNeeded,
    login,
    store
} from '../../store/store';

export default class Container extends LightningElement {
    isLoading;
    isLoggedIn;
    mode;

    get isSoqlMode() {
        return this.mode === MODE.SOQL;
    }

    get isApiMode() {
        return this.mode === MODE.API;
    }

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
        this.mode = ui.mode || MODE.SOQL;
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
