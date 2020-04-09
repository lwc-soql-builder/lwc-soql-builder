import { LightningElement, api } from 'lwc';
import { store } from '../../app/store/redux';
import { selectChildRelationship } from '../../app/store/store';

export default class OutputPanel extends LightningElement {
    @api value;

    get isChildRelationship() {
        return this.value && this.value.rawData && this.value.rawData.totalSize;
    }

    handleClick() {
        store.dispatch(selectChildRelationship(this.value.rawData));
    }
}
