import { LightningElement, wire } from 'lwc';
import { store } from '../../store/redux';
import { connectStore } from '../../store/wire-adapter';

export default class Soql extends LightningElement {
    selectedSObject;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        if (ui.selectedSObject) {
            this.selectedSObject = ui.selectedSObject;
        } else {
            this.selectedSObject = null;
        }
    }

    get sobjectsPanelClass() {
        return this.selectedSObject ? 'slds-hide' : '';
    }
}
