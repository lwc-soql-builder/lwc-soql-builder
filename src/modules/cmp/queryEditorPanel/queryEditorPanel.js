import { LightningElement, wire, track } from 'lwc';
import getCaretCoordinates from 'textarea-caret';
import salesforce from '../../service/salesforce';
import {
    connectStore,
    store,
    executeQuery,
    updateSoql
} from '../../app/store/store';

export default class QueryEditorPanel extends LightningElement {
    isCompletionVisible;
    completionStyle;
    completionFields;
    _sobjectMeta;
    _keyword;
    _selectionStart;
    _soql;

    get soql() {
        return this._soql;
    }

    set soql(value) {
        console.log(value);
        this._soql = value;
        const inputEl = this.template.querySelector('.soql-input');
        if (inputEl) inputEl.value = value;
    }

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        if (sobject && ui.query) {
            const sobjectState = sobject[ui.query.sObject];
            if (sobjectState) {
                this._sobjectMeta = sobjectState.data;
            }
        }
        if (ui.soql !== this.soql) {
            this.soql = ui.soql;
        }
    }

    runQuery() {
        if (!salesforce.connection) return;
        const input = this.template.querySelector('.soql-input');
        if (!input) return;
        const query = input.value;
        console.log(query);
        if (!query) return;
        store.dispatch(executeQuery(query));
    }

    handleChangeSoql(event) {
        const { value } = event.target;
        if (this._soql !== value)
            store.dispatch(updateSoql(event.target.value));
    }

    handleInputSoql(event) {
        if (!this._sobjectMeta) return;
        if (!this.isCompletionVisible) {
            this._openCompletion(event);
        } else {
            this._handleCompletion(event);
        }
    }

    _openCompletion(event) {
        const { key, ctrlKey, target } = event;
        this._selectionStart = target.selectionStart;
        this._keyword = '';
        if (ctrlKey && key === ' ') {
            this._searchCompletionFields(event);
        } else if (key !== ' ') {
            this._addKeyword(event);
        }
    }

    _closeCompletion() {
        this.isCompletionVisible = false;
    }

    _setCompletionPosition(event) {
        const { target } = event;
        const caret = getCaretCoordinates(target, target.selectionStart);
        this.completionStyle = `top:${caret.top + caret.height}px;left:${
            caret.left
        }px;`;
    }

    _searchCompletionFields(event) {
        const escapedKeyword = this._escapeRegExp(this._keyword);
        const keywordPattern = new RegExp(escapedKeyword, 'i');
        this.completionFields = this._sobjectMeta.fields
            .filter(field =>
                keywordPattern.test(`${field.name} ${field.label}`)
            )
            .map((field, index) => {
                return {
                    ...field,
                    isActive: index === 0
                };
            });
        if (this.completionFields.length > 0) {
            this._setCompletionPosition(event);
            this.isCompletionVisible = true;
        } else {
            this.isCompletionVisible = false;
        }
    }

    _escapeRegExp(str) {
        if (!str) return '';
        return str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, '\\$&');
    }

    _handleCompletion(event) {
        if (event.isComposing) return;
        const { key } = event;
        switch (key) {
            case '.':
            case ',':
            case ' ':
            case 'Escape':
            case 'ArrowLeft':
            case 'ArrowRight':
                this._closeCompletion();
                break;
            case 'Backspace':
                this._deleteKeyword(event);
                break;
            case 'ArrowDown':
                this._selectBellowField(event);
                break;
            case 'ArrowUp':
                this._selectAboveField(event);
                break;
            case 'Enter':
                this._insertField(event);
                break;
            default:
                this._addKeyword(event);
                break;
        }
    }

    _addKeyword(event) {
        const { key } = event;
        if (key.length === 1) {
            this._keyword += key;
            this._searchCompletionFields(event);
        }
    }

    _deleteKeyword(event) {
        this._keyword = this._keyword.slice(0, -1);
        if (this._keyword) this._searchCompletionFields(event);
        else this._closeCompletion();
    }

    _selectBellowField(event) {
        event.preventDefault();
        const activeIndex = this._getActiveFieldIndex();
        if (activeIndex + 1 < this.completionFields.length) {
            this.completionFields = this.completionFields.map(
                (field, index) => {
                    return {
                        ...field,
                        isActive: index === activeIndex + 1
                    };
                }
            );
        }
    }

    _selectAboveField(event) {
        event.preventDefault();
        const activeIndex = this._getActiveFieldIndex();
        if (activeIndex > 0) {
            this.completionFields = this.completionFields.map(
                (field, index) => {
                    return {
                        ...field,
                        isActive: index === activeIndex - 1
                    };
                }
            );
        }
    }

    _getActiveFieldIndex() {
        return this.completionFields.findIndex(field => field.isActive);
    }

    _insertField(event) {
        event.preventDefault();
        const selectedField = this.completionFields.find(
            field => field.isActive
        );
        if (selectedField) {
            const { target } = event;
            const soql = target.value;
            const preSoql = soql.substring(0, this._selectionStart);
            const postSoql = soql.substring(target.selectionStart);
            this.soql = preSoql + selectedField.name + postSoql;
            const insertedIndex =
                this._selectionStart + selectedField.name.length;
            target.setSelectionRange(insertedIndex, insertedIndex);
        }
        this._closeCompletion();
    }
}
