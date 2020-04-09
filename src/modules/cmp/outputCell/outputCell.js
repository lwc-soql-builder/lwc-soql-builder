import { LightningElement, api } from 'lwc';
import { store } from '../../app/store/redux';
import { selectChildRelationship } from '../../app/store/store';
import salesforce from '../../service/salesforce';

export default class OutputPanel extends LightningElement {
    @api value;

    get isChildRelationship() {
        return this.value && this.value.rawData && this.value.rawData.totalSize;
    }

    get url() {
        if (this.value.column !== 'Id') return null;
        return `${salesforce.connection.instanceUrl}/${this.value.data}`;
    }

    handleClick() {
        store.dispatch(selectChildRelationship(this.value.rawData));
    }
}
