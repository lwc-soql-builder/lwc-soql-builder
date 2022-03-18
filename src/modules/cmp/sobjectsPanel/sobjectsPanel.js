import { LightningElement, wire } from 'lwc';
import {
    connectStore,
    store,
    selectSObject,
    clearSObjectsError
} from '../../store/store';
import { showToast } from '../../base/toast/toast-manager';
import { escapeRegExp } from '../../base/utils/regexp-utils';

export default class SobjectsPanel extends LightningElement {
    searchword = '';
    sobjects;
    isLoading;

    _rawSObjects;

    get isNoSObjects() {
        return !this.isLoading && (!this.sobjects || !this.sobjects.length);
    }

    get isDisplayClearButton() {
        return this.searchword !== '';
    }

    @wire(connectStore, { store })
    storeChange({ sobjects }) {
        if (this._rawSObjects) return;
        this.isLoading = sobjects.isFetching;
        if (sobjects.data) {
            this._rawSObjects = sobjects.data.sobjects.map(sobject => {
                return {
                    ...sobject,
                    itemLabel: `${sobject.name} / ${sobject.label}`
                };
            });
            this.sobjects = this._rawSObjects;
        } else if (sobjects.error) {
            console.error(sobjects.error);
            showToast({
                message: 'Failed to fetch sObjects.',
                errors: sobjects.error
            });
            store.dispatch(clearSObjectsError());
        }
    }

    handleKeywordChange(event) {
        this.searchword = event.target.value;
        this.filterSObjects(this.searchword);
    }

    filterSObjects(keyword) {
        if (keyword) {
            const escapedKeyword = escapeRegExp(keyword);
            const keywordPattern = new RegExp(escapedKeyword, 'i');
            this.sobjects = this._rawSObjects.filter(sobject => {
                return keywordPattern.test(`${sobject.name} ${sobject.label}`);
            });
        } else {
            this.sobjects = this._rawSObjects;
        }
    }

    selectSObject(event) {
        const sObjectName = event.target.dataset.name;
        store.dispatch(selectSObject(sObjectName));
    }

    handleClear() {
        this.searchword = '';
        this.filterSObjects(this.searchword);
    }
}
