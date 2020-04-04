import { LightningElement, wire } from 'lwc';
import { composeQuery, getField } from 'soql-parser-js';
import salesforce from '../../service/salesforce';
import { connectStore, store, executeQuery } from '../../app/store/store';

export default class QueryEditorPanel extends LightningElement {
    _query;
    _sObjectName;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this._updateQuery(ui);
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

    _updateQuery(ui) {
        if (!ui.selectedSObject) return;

        let query = {
            fields: [],
            sObject: ui.selectedSObject
        };
        if (ui.selectedFields) {
            query.fields = ui.selectedFields.map(fieldName => {
                return getField(fieldName);
            });
        }
        if (ui.selectedRelationships) {
            const subqueries = ui.selectedRelationships.map(
                relationshipName => {
                    const subquery = {
                        fields: [getField('Id')],
                        relationshipName
                    };
                    return getField({ subquery });
                }
            );
            query.fields = [...query.fields, ...subqueries];
        }
        this._query = query;
    }
}
