import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    deselectChildRelationship
} from '../../app/store/store';

export default class OutputPanel extends LightningElement {
    response;
    childResponse;

    @wire(connectStore, { store })
    storeChange({ query, ui }) {
        if (query.data) {
            this.response = query.data;
        } else if (query.error) {
            console.error(query.error);
        }
        this.childResponse = ui.childRelationship;
    }

    closeChildRelationship() {
        store.dispatch(deselectChildRelationship());
    }
}
