import { LightningElement, wire } from 'lwc';
import { composeQuery, getField } from 'soql-parser-js';
import salesforce from '../../service/salesforce';
import { connectStore, store } from '../../app/store/store';
import { describeQuery } from '../../app/store/store';

export default class QueryEditorPanel extends LightningElement {
    selectedSObject;
    query;

    @wire(connectStore, { store })
    storeChange({ sobjects, ui }) {
        if (sobjects.selectedSObject) {
            if (this._isChangedSObjct(sobjects)) {
                this.selectedSObject = sobjects.selectedSObject;
            }
        } else {
            this.selectedSObject = null;
        }

        this._updateQuery(ui);
    }

    get queryText() {
        if (!this.query) return '';
        return composeQuery(this.query, { format: true });
    }

    executeQuery() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        store.dispatch(describeQuery(query));
    }

    _isChangedSObjct(sobjects) {
        return (
            !this.selectedSObject ||
            sobjects.selectedSObject.name !== this.selectedSObject.name
        );
    }

    _updateQuery(ui) {
        if (!this.selectedSObject) return;

        let query = {
            fields: [],
            sObject: this.selectedSObject.name
        };
        if (ui.selectedFields) {
            query.fields = ui.selectedFields.map(fieldName => {
                return getField(fieldName);
            });
        }
        if (ui.selectedRelationships) {
            const subqueries = ui.selectedRelationships.map(
                relationshipName => {
                    console.log(relationshipName);
                    const subquery = {
                        fields: [getField('Id')],
                        relationshipName
                    };
                    return getField({ subquery });
                }
            );
            query.fields = [...query.fields, ...subqueries];
        }
        this.query = query;
    }
}
