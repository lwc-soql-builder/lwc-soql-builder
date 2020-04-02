import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforce';

class QueryBuilder {
    sObjectName;
    query;

    constructor(sObjectName) {
        this.sObjectName = sObjectName;
        this.query = `SELECT Id FROM ${this.sObjectName}`;
    }

    addField(fieldName) {
        const fromIndex = this.query.lastIndexOf(' FROM ');
        this.query =
            this.query.substring(0, fromIndex) +
            ', ' +
            fieldName +
            this.query.substring(fromIndex);
    }
}

export default class App extends LightningElement {
    selectedSObject;
    query;
    queryBuilder;
    queryResponse;

    get isLoggedIn() {
        return salesforce.isLoggedIn();
    }

    get locationOrigin() {
        return window.location.origin;
    }

    connectedCallback() {
        salesforce.init();
    }

    selectSObject(event) {
        this.selectedSObject = event.detail;
        console.log(this.selectedSObject);
        this.queryBuilder = new QueryBuilder(this.selectedSObject.name);
        this.query = this.queryBuilder.query;
    }

    deselectSObject() {
        this.selectedSObject = null;
    }

    selectField(event) {
        const fieldName = event.detail;
        console.log(fieldName);
        if (!this.queryBuilder) {
            this.queryBuilder = new QueryBuilder(this.selectedSObject.name);
        }
        this.queryBuilder.addField(fieldName);
        this.query = this.queryBuilder.query;
    }

    selectRelationship(event) {
        const relationshipName = event.detail;
        console.log(relationshipName);
    }
}
