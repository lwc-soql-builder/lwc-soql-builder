import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    deselectChildRelationship
} from '../../app/store/store';

export default class OutputPanel extends LightningElement {
    response;
    childResponse;

    _sObject;

    @wire(connectStore, { store })
    storeChange({ query, ui }) {
        if (query.data) {
            if (this.response !== query.data) {
                this.response = query.data;
                this._sObject = ui.query.sObject;
            }
        } else if (query.error) {
            console.error(query.error);
        }
        this.childResponse = ui.childRelationship;
    }

    closeChildRelationship() {
        store.dispatch(deselectChildRelationship());
    }

    exportCsv() {
        const data = this.template
            .querySelector('cmp-output-table.main-output')
            .generateCsv();
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const blob = new Blob([bom, data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const download = document.createElement('a');
        download.href = window.URL.createObjectURL(blob);
        download.download = `${this._sObject}.csv`;
        download.click();
        URL.revokeObjectURL(url);
    }
}
