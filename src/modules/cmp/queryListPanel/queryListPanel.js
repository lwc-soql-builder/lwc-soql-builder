import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    loadRecentQueries,
    updateSoql
} from '../../app/store/store';
export default class QueryListPanel extends LightningElement {
    recentQueries;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        if (ui.recentQueries) {
            this.recentQueries = ui.recentQueries.map((query, index) => {
                return { key: `${index}`, soql: query };
            });
        }
    }

    connectedCallback() {
        store.dispatch(loadRecentQueries());
    }

    selectQuery(event) {
        const { key } = event.target.dataset;
        console.log(key);
        const selectedQuery = this.recentQueries.find(
            query => query.key === key
        );
        if (selectedQuery) {
            store.dispatch(updateSoql(selectedQuery.soql));
        }
    }
}
