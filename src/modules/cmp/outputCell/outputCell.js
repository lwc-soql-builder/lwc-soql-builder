import { LightningElement, api } from 'lwc';
import { store, selectChildRelationship } from '../../store/store';
import * as salesforce from '../../service/salesforce';
import { I18nMixin } from '../../i18n/i18n';

export default class OutputPanel extends I18nMixin(LightningElement) {
    @api value;

    get isChildRelationship() {
        return this.value && this.value.rawData && this.value.rawData.totalSize;
    }

    get url() {
        if (!/^[0-9A-Za-z]{18}$/.test(this.value.data)) return null;
        return `${salesforce.connection.instanceUrl}/${this.value.data}`;
    }

    handleClick() {
        store.dispatch(selectChildRelationship(this.value.rawData));
    }
}
