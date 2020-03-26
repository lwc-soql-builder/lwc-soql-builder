import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforce-service';

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
    sobjects;
    filteredSObjects;
    selectedSObject;
    selectedSObjectMeta;
    tabStatus = {};
    query;
    queryBuilder;
    output;
    salesforce;

    get isLoggedIn() {
        return salesforce.isLoggedIn();
    }

    get locationOrigin() {
        return window.location.origin;
    }

    connectedCallback() {
        salesforce.init();
        if (salesforce.isLoggedIn()) {
            salesforce.connection
                .request('/services/data/v48.0/sobjects')
                .then(res => {
                    console.log(res);
                    this.sobjects = res.sobjects;
                    this.filteredSObjects = this.sobjects;
                })
                .catch(err => {
                    console.error(err);
                    this.logout();
                });
        }
    }

    filterSObjects(event) {
        const keyword = event.target.value;
        if (keyword) {
            this.filteredSObjects = this.sobjects.filter(sobject => {
                return `${sobject.name} ${sobject.label}`.includes(keyword);
            });
        } else {
            this.filteredSObjects = this.sobjects;
        }
    }

    selectSObject(event) {
        const sObjectName = event.target.dataset.name;
        console.log(sObjectName);
        this.selectedSObject = this.sobjects.find(
            sobject => sobject.name === sObjectName
        );
        if (!this.selectedSObject) return;
        if (!salesforce.connection) return;
        salesforce.connection
            .request(
                `/services/data/v48.0/sobjects/${this.selectedSObject.name}/describe`
            )
            .then(res => {
                console.log(res);
                this.selectedSObjectMeta = res;
            })
            .catch(err => {
                console.error(err);
            });
        this.queryBuilder = new QueryBuilder(sObjectName);
        this.query = this.queryBuilder.query;
    }

    deselectSObject() {
        this.selectedSObject = null;
    }

    selectTab(event) {
        const tabs = this.template.querySelectorAll(
            '.sobject-tabs .slds-tabs_default__item'
        );
        tabs.forEach(tab => {
            tab.classList.remove('slds-is-active');
        });
        const domId = event.target.dataset.id;
        console.log(domId);
        const tab = this.template.querySelector(`[data-id=${domId}]`);
        console.log(tab);
        tab.parentNode.classList.add('slds-is-active');
        const tabContents = this.template.querySelectorAll(
            '.sobject-tabs .slds-tabs_default__content'
        );
        tabContents.forEach(tabContent => {
            tabContent.classList.add('slds-hide');
        });
        const tabContent = this.template.querySelector(
            `[data-id=${domId}__content]`
        );
        console.log(tabContent);
        tabContent.classList.remove('slds-hide');
    }

    selectField(event) {
        const fieldName = event.target.dataset.name;
        console.log(fieldName);
        if (!this.queryBuilder) {
            this.queryBuilder = new QueryBuilder(this.selectedSObject.name);
        }
        this.queryBuilder.addField(fieldName);
        this.query = this.queryBuilder.query;
    }

    selectRelationship(event) {
        const relationshipName = event.target.dataset.name;
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
