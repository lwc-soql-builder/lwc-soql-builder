import jsforce from 'jsforce';

const CLIENT_ID =
    '3MVG9n_HvETGhr3Bp2TP0lUhBaOTAOuCH9OKmjFKsspVG.z8WOx0Vb94skZ8d4wHTVuMf5DArbdwCb05yIAT5';
const ACCESS_TOKEN_KEY = 'accessToken';
const INSTANCE_URL_KEY = 'instanceUrl';

class SalseforceService {
    constructor() {
        this.locationOrigin = window.location.origin;
    }

    init() {
        jsforce.browser.init({
            clientId: CLIENT_ID,
            redirectUri: `${this.locationOrigin}/`
        });
        jsforce.browser.on('connect', connection => {
            console.log(connection);
            localStorage.setItem(ACCESS_TOKEN_KEY, connection.accessToken);
            localStorage.setItem(INSTANCE_URL_KEY, connection.instanceUrl);
            this.connection = connection;
        });

        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const instanceUrl = localStorage.getItem(INSTANCE_URL_KEY);

        if (accessToken && instanceUrl) {
            this.connection = new jsforce.Connection({
                accessToken,
                instanceUrl,
                version: '48.0'
            });
        }
    }

    logout() {
        this.connection = null;
        localStorage.clear();
    }

    login(loginUrl) {
        jsforce.browser.login({ loginUrl }, () => {
            window.location.reload();
        });
    }

    isLoggedIn() {
        return !!(this.connection && this.connection.accessToken);
    }
}

export default new SalseforceService();
