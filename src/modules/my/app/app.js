import { LightningElement } from 'lwc';
import jsforce from 'jsforce';

export default class App extends LightningElement {
    sobjects;
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
                })
                .catch(err => {
                    console.error(err);
                    this.onLogout();
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

    onLogin() {
        jsforce.browser.login(() => {
            console.log('login callback');
            window.location.reload();
        });
    }

    onLogout() {
        this.connection = null;
        localStorage.clear();
    }
}
