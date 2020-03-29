import { LightningElement, api } from 'lwc';
import salesforce from '../../service/salesforce';
import { store } from '../../app/store/store';
import { describeQuery } from '../../app/store/store';

export default class QueryEditorPanel extends LightningElement {
    @api query;

    executeQuery() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        store.dispatch(describeQuery(query));
    }
}
