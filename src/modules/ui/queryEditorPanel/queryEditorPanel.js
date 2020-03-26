import { LightningElement, api } from 'lwc';
import salesforce from '../../service/salesforceService';

export default class QueryEditorPanel extends LightningElement {
    @api query;

    executeQuery() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        console.log(input);
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        salesforce.connection.query(query, (error, result) => {
            this.dispatchEvent(
                new CustomEvent('query', {
                    detail: { error, result }
                })
            );
        });
    }
}
