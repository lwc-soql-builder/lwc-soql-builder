import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforce';

export default class WelcomeModal extends LightningElement {
    loginProduction() {
        salesforce.login('https://login.salesforce.com');
    }

    loginSandbox() {
        salesforce.login('https://test.salesforce.com');
    }
}
