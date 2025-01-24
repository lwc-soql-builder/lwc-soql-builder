import { LightningElement, wire } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import {
    connectStore,
    store,
    loadRecentAPIs,
    selectAPIRequest
} from '../../store/store';

export default class ApiHistoryPanel extends I18nMixin(LightningElement) {
    recentAPIs;

    @wire(connectStore, { store })
    storeChange({ ui }) {
        if (ui.recentAPIs) {
            this.recentAPIs = ui.recentAPIs.map((request, index) => {
                return {
                    key: `${index}`,
                    request: {
                        ...request,
                        requestBodyPreview: request.requestBody.substring(
                            0,
                            100
                        )
                    }
                };
            });
        }
    }

    connectedCallback() {
        store.dispatch(loadRecentAPIs());
    }

    selectAPIRequest(event) {
        const { key } = event.currentTarget.dataset;
        const selectedAPI = this.recentAPIs.find(api => api.key === key);
        if (!selectedAPI) return;
        store.dispatch(selectAPIRequest(selectedAPI.request));
    }
}
