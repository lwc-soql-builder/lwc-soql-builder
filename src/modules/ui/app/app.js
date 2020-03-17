import { LightningElement } from 'lwc';
import jsforce from 'jsforce';

export default class App extends LightningElement {
    sobjects;
    filteredSObjects;
    connection;

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
}
