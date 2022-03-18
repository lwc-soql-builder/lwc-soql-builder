import { LightningElement } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import * as salesforce from '../../service/salesforce';

export default class WelcomeModal extends I18nMixin(LightningElement) {
    loginProduction() {
        salesforce.login('https://login.salesforce.com');
    }

    loginSandbox() {
        salesforce.login('https://test.salesforce.com');
    }
}
