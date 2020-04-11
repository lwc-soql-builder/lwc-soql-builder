import { LightningElement, api } from 'lwc';

export default class Spinner extends LightningElement {
    @api
    close() {
        this.template.host.remove();
    }
}
