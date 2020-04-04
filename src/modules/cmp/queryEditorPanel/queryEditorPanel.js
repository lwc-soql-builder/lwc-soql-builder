import { LightningElement, wire } from 'lwc';
import { composeQuery, getField } from 'soql-parser-js';
import salesforce from '../../service/salesforce';
import { connectStore, store, executeQuery } from '../../app/store/store';

export default class QueryEditorPanel extends LightningElement {
    _query;
    _sObjectName;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this._query = ui.query;
    }

    get queryText() {
        if (!this._query) return '';
        return composeQuery(this._query, { format: true });
    }

    runQuery() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        store.dispatch(executeQuery(query));
    }
}
