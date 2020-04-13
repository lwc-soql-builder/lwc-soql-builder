import { LightningElement, wire } from 'lwc';
import { connectStore, store } from '../../store/store';
import * as salesforce from '../../service/salesforce';
export default class Header extends LightningElement {
    isLoggedIn;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
    }

    logout() {
        salesforce.logout();
    }
}
