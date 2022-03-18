import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    describeSObjectIfNeeded,
    deselectSObject,
    clearSObjectError,
    selectAllFields,
    clearAllFields,
    sortFields
} from '../../store/store';
import { showToast } from '../../base/toast/toast-manager';
import { fullApiName } from '../../service/salesforce';
import { I18nMixin } from '../../i18n/i18n';
import { SORT } from '../../store/modules/ui/constants';

export default class FieldsPanel extends I18nMixin(LightningElement) {
    tabs = [
        {
            id: 'tab-fields',
            label: this.i18n.FIELDS_PANEL_FIELDS,
            isActive: true
        },
        {
            id: 'tab-relationships',
            label: this.i18n.FIELDS_PANEL_CHILD_REL,
            isActive: false
        }
    ];
    sobjectMeta;
    keyword = '';
    isLoading;

    _selectedSObject;

    @wire(connectStore, { store })
    storeChange({ sobjects, sobject, ui }) {
        const { selectedSObject } = ui;
        if (!selectedSObject) return;

        const fullSObjectName = fullApiName(selectedSObject);
        if (
            sobjects &&
            !sobjects.data.sobjects.find(o => o.name === fullSObjectName)
        ) {
            return;
        }
        if (fullSObjectName !== this._selectedSObject) {
            this._selectedSObject = fullSObjectName;
            store.dispatch(describeSObjectIfNeeded(this._selectedSObject));
        }

        const sobjectState = sobject[this._selectedSObject];
        if (!sobjectState) return;
        this.isLoading = sobjectState.isFetching;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        } else if (sobjectState.error) {
            console.error(sobjectState.error);
            showToast({
                message: this.i18n.FIELDS_PANEL_FAILED_DESCRIBE_OBJ,
                errors: sobjectState.error
            });
            store.dispatch(clearSObjectError(this._selectedSObject));
        }
    }

    get isFieldsActive() {
        return !!this.tabs.find(tab => tab.id === 'tab-fields' && tab.isActive);
    }

    get isRelationshipsActive() {
        return !!this.tabs.find(
            tab => tab.id === 'tab-relationships' && tab.isActive
        );
    }

    deselectSObject() {
        store.dispatch(deselectSObject());
    }

    selectTab(event) {
        const tabId = event.target.dataset.id;
        this.tabs = this.tabs.map(tab => {
            return { ...tab, isActive: tab.id === tabId };
        });
    }

    setKeyword(event) {
        this.keyword = event.target.value;
    }

    handleMenuSelect(event) {
        switch (event.detail.value) {
            case 'select_all':
                store.dispatch(selectAllFields(this.sobjectMeta));
                break;
            case 'clear_all':
                store.dispatch(clearAllFields());
                break;
            case 'sort_asc':
                store.dispatch(sortFields(SORT.ORDER.ASC));
                break;
            case 'sort_desc':
                store.dispatch(sortFields(SORT.ORDER.DESC));
                break;
            default:
                break;
        }
    }

    get isDisplayClearButton() {
        return this.keyword !== '';
    }

    handleClear() {
        this.keyword = '';
    }
}
