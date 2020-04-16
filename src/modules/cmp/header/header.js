import { LightningElement, wire } from 'lwc';
import { connectStore, store, clearUserError } from '../../store/store';
import * as salesforce from '../../service/salesforce';
import { showToast } from '../../base/toast/toast-manager';
export default class Header extends LightningElement {
    _user;
    isLoggedIn;

    get userLabel() {
        if (!this._user) return '';
        return `${this._user.name}(${this._user.preferred_username})`;
    }

    @wire(connectStore, { store })
    storeChange({ ui, user }) {
        this.isLoggedIn = ui.isLoggedIn;
        this._user = user.data;
        if (user.error) {
            this._handleError(user.error);
        }
    }

    logout() {
        salesforce.logout();
    }

    _handleError(error) {
        console.error(error);
        store.dispatch(clearUserError());
        let message;
        if (
            error.errorCode === 'INVALID_SESSION_ID' ||
            error.errorCode === 'ERROR_HTTP_403'
        ) {
            salesforce.logout();
            message =
                'Failed to fetch login user.. Your token is expired. Please login again.';
        } else {
            message = 'Failed to fetch login user.';
        }
        showToast({
            message,
            errors: error
        });
    }
}
