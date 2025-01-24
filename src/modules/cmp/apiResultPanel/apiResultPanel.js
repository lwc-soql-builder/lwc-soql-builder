import { LightningElement, wire } from 'lwc';
import { showToast } from '../../base/toast/toast-manager';
import { I18nMixin } from '../../i18n/i18n';
import { clearApiError } from '../../store/modules/api/actions';
import { store } from '../../store/redux';
import { connectStore } from '../../store/wire-adapter';

export default class ApiResultPanel extends I18nMixin(LightningElement) {
    isLoading;
    response;

    get responseString() {
        if (!this.response) {
            return '';
        }
        return JSON.stringify(this.response, null, 2);
    }

    get hasResponse() {
        return !!this.response;
    }

    @wire(connectStore, { store })
    storeChange({ api }) {
        this.isLoading = api.isFetching;
        if (api.data) {
            if (this.response !== api.data) {
                this.response = api.data;
            }
        } else {
            this.response = undefined;
        }
        if (api.error) {
            console.error(api.error);
            showToast({
                message: this.i18n.OUTPUT_PANEL_FAILED_SOQL,
                errors: api.error
            });
            store.dispatch(clearApiError());
        }
    }
}
