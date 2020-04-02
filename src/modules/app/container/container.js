import { LightningElement, track } from 'lwc';
import { composeQuery, getField } from 'soql-parser-js';
import salesforce from '../../service/salesforce';

export default class Container extends LightningElement {
    @track query;
    selectedSObject;
    queryResponse;

    get isLoggedIn() {
        return salesforce.isLoggedIn();
    }

    get locationOrigin() {
        return window.location.origin;
    }

    get queryText() {
        if (!this.query) return '';
        return composeQuery(this.query, { format: true });
    }

    connectedCallback() {
        salesforce.init();
    }

    selectSObject(event) {
        this.selectedSObject = event.detail;
        console.log(this.selectedSObject);
        this.query = {
            fields: [getField('Id')],
            sObject: this.selectedSObject.name
        };
    }

    deselectSObject() {
        this.selectedSObject = null;
    }

    selectField(event) {
        const fieldName = event.detail;
        console.log(fieldName);
        this.query.fields.push(getField(fieldName));
    }

    selectRelationship(event) {
        const relationshipName = event.detail;
        console.log(relationshipName);
        const subquery = {
            fields: [getField('Id')],
            relationshipName
        };
        this.query.fields.push(getField({ subquery }));
    }
}
