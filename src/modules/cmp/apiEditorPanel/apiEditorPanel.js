import { LightningElement } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import { store } from '../../store/redux';
import { executeApi } from '../../store/modules/api/actions';

export default class ApiEditorPanel extends I18nMixin(LightningElement) {
    executeApi() {
        const apiPathInput = this.template.querySelector('[name=api-path]');
        const apiPath = apiPathInput.value;
        if (!apiPath) return;
        const httpMethodInput =
            this.template.querySelector('[name=http-method]');
        const httpMethod = httpMethodInput.value;
        if (!httpMethod) return;
        const requestBodyInput = this.template.querySelector(
            '[name=request-body]'
        );
        const requestBody = requestBodyInput.value;
        store.dispatch(executeApi(apiPath, httpMethod, requestBody));
    }
}
