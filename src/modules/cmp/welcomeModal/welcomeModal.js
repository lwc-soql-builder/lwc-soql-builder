import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforceService';

export default class WelcomeModal extends LightningElement {
    get locationOrigin() {
        return salesforce.locationOrigin;
    }

    loginProduction() {
        salesforce.login('https://login.salesforce.com');
    }

    loginSandbox() {
        salesforce.login('https://test.salesforce.com');
    }
}
