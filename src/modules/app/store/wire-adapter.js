import { register, ValueChangedEvent } from '@lwc/wire-service';

export function connectStore(store) {
    return store.getState();
}

register(connectStore, eventTarget => {
    let store;
    let subscription;

    const notifyStateChange = () => {
        const state = store.getState();
        eventTarget.dispatchEvent(new ValueChangedEvent(state));
    };

    eventTarget.addEventListener('connect', () => {
        subscription = store.subscribe(notifyStateChange);
        notifyStateChange();
    });

    eventTarget.addEventListener('disconnect', () => {
        if (subscription) {
            subscription();
        }
    });

    eventTarget.addEventListener('config', config => {
        store = config.store;
    });
});
