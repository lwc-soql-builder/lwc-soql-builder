import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforceService';

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
    tabStatus = {};
    query;
    queryBuilder;
    output;

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

    loginProduction() {
        salesforce.login('https://login.salesforce.com');
    }

    loginSandbox() {
        salesforce.login('https://test.salesforce.com');
    }

    logout() {
        salesforce.logout();
        window.location.reload();
    }

    executeSOQL() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        console.log(input);
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        salesforce.connection
            .query(query)
            .then(res => {
                console.log(res);
                this.output = this._formatResponse(res);
            })
            .catch(err => {
                console.error(err);
            });
    }

    _formatResponse(res) {
        let output = {
            totalSize: res.totalSize,
            rows: []
        };
        let columns = new Set();
        res.records.forEach(record => {
            Object.keys(record).forEach(name => {
                if (name !== 'attributes') {
                    columns.add(name);
                }
            });
        });
        output.columns = Array.from(columns);
        res.records.forEach(record => {
            let row = {
                key: Math.random()
                    .toString(36)
                    .slice(-8),
                values: []
            };
            output.columns.forEach(column => {
                row.values.push({
                    key: Math.random()
                        .toString(36)
                        .slice(-8),
                    data: record[column]
                });
            });
            output.rows.push(row);
        });
        return output;
    }
}
