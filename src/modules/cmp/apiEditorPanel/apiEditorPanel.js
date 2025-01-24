import { LightningElement, wire } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import { executeApi } from '../../store/modules/api/actions';
import { connectStore, store } from '../../store/store';

export default class ApiEditorPanel extends I18nMixin(LightningElement) {
    apiPath = '';
    httpMethod = 'GET';
    _requestBody = '';

    get httpMethods() {
        return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => ({
            value: method,
            checked: method === this.httpMethod
        }));
    }

    get requestBody() {
        return this._requestBody;
    }

    set requestBody(value) {
        this._requestBody = value;
        const inputEl = this.template.querySelector('[name=request-body]');
        if (inputEl) {
            inputEl.value = value;
        }
    }

    @wire(connectStore, { store })
    storeChange({ ui }) {
        if (ui.selectedAPIRequest) {
            const { requestBody, httpMethod, apiPath } = ui.selectedAPIRequest;
            this.apiPath = apiPath;
            this.httpMethod = httpMethod;
            this.requestBody = requestBody;
        }
    }

    handleApiPathChange(event) {
        this.apiPath = event.target.value;
    }

    handleHttpMethodChange(event) {
        this.httpMethod = event.target.value;
    }

    handleRequestBodyChange(event) {
        this.requestBody = event.target.value;
    }

    executeApi() {
        if (!this.apiPath || !this.httpMethod) return;
        store.dispatch(
            executeApi(this.apiPath, this.httpMethod, this.requestBody)
        );
    }
}
