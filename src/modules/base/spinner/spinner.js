import { LightningElement, api } from 'lwc';

export default class Spinner extends LightningElement {
    @api size = 'medium';
    @api
    close() {
        this.template.host.remove();
    }

    get className() {
        return `slds-spinner slds-spinner_${this.size} slds-spinner_brand`;
    }
}
