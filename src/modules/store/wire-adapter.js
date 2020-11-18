export class connectStore {
    dataCallback;
    store;
    subscription;
    connected = false;

    constructor(dataCallback) {
        this.dataCallback = dataCallback;
    }

    connect() {
        this.connected = true;
        this.subscribeToStore();
    }

    disconnect() {
        this.unsubscribeFromStore();
        this.connected = false;
    }

    update(config) {
        this.unsubscribeFromStore();
        this.store = config.store;
        this.subscribeToStore();
    }

    subscribeToStore() {
        if (this.connected && this.store) {
            const notifyStateChange = () => {
                const state = this.store.getState();
                this.dataCallback(state);
            };
            this.subscription = this.store.subscribe(notifyStateChange);
            notifyStateChange();
        }
    }

    unsubscribeFromStore() {
        if (this.subscription) {
            this.subscription();
            this.subscription = undefined;
        }
    }
}
