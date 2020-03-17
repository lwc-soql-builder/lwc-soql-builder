import { LightningElement } from 'lwc';
import jsforce from 'jsforce';

export default class App extends LightningElement {
    sobjects;
    filteredSObjects;
    connection;
    output;

    get isLoggedIn() {
        return !!(this.connection && this.connection.accessToken);
    }

    connectedCallback() {
        jsforce.browser.init({
            clientId:
                '3MVG9n_HvETGhr3Bp2TP0lUhBaOTAOuCH9OKmjFKsspVG.z8WOx0Vb94skZ8d4wHTVuMf5DArbdwCb05yIAT5',
            redirectUri: 'http://localhost:3001/'
        });

        const accessToken = localStorage.getItem('accessToken');
        const instanceUrl = localStorage.getItem('instanceUrl');
        console.log(accessToken, instanceUrl);
        if (accessToken) {
            this.connection = new jsforce.Connection({
                accessToken: accessToken,
                instanceUrl: instanceUrl,
                version: '48.0'
            });
            this.connection
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
        } else {
            jsforce.browser.on('connect', connection => {
                console.log(connection);
                localStorage.setItem('accessToken', connection.accessToken);
                localStorage.setItem('instanceUrl', connection.instanceUrl);
                this.connection = connection;
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

    login() {
        jsforce.browser.login(() => {
            console.log('login callback');
            window.location.reload();
        });
    }

    logout() {
        this.connection = null;
        localStorage.clear();
    }

    executeSOQL() {
        if (!this.connection) return;
        const input = this.template.querySelector('.soql-input');
        console.log(input);
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        this.connection
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
