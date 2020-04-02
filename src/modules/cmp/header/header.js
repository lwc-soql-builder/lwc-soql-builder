import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforce';

export default class Header extends LightningElement {
    get isLoggedIn() {
        return salesforce.isLoggedIn();
    }

    logout() {
        salesforce.logout();
        window.location.reload();
    }
}
