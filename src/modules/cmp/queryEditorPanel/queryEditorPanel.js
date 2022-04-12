import { LightningElement, wire } from 'lwc';
import getCaretCoordinates from 'textarea-caret';
import {
    connectStore,
    store,
    executeQuery,
    updateSoql,
    formatSoql
} from '../../store/store';
import { escapeRegExp } from '../../base/utils/regexp-utils';
import { fullApiName, stripNamespace } from '../../service/salesforce';
import { I18nMixin } from '../../i18n/i18n';

const SOQL_SYNTAX_KEYWORDS = [
    'SELECT',
    'FROM',
    'USING SCOPE',
    'WHERE',
    'AND',
    'OR',
    'LIKE',
    'IN',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'ASC',
    'DESC',
    'NULLS FIRST',
    'NULLS LAST',
    'LIMIT',
    'OFFSET'
];

export default class QueryEditorPanel extends I18nMixin(LightningElement) {
    isCompletionVisible;
    completionStyle;
    completionItems;
    _sobjectMeta;
    _selectionStart;
    _soql;

    get soql() {
        return this._soql;
    }

    set soql(value) {
        this._soql = value;
        const inputEl = this.template.querySelector('.soql-input');
        if (inputEl) inputEl.value = value;
    }

    @wire(connectStore, { store })
    storeChange({ sobject, ui }) {
        const { query, soql } = ui;
        if (sobject && query) {
            const sobjectState = sobject[fullApiName(query.sObject)];
            if (sobjectState) {
                this._sobjectMeta = sobjectState.data;
            }
        }
        if (soql !== this.soql) {
            this.soql = soql;
        }
    }

    runQuery() {
        this._runQuery();
    }

    runQueryAll() {
        this._runQuery(true);
    }

    formatQuery() {
        store.dispatch(formatSoql());
    }

    insertItem(event) {
        const key = event.target.dataset.key;
        if (this._closeCompletionTimer) {
            clearTimeout(this._closeCompletionTimer);
        }
        const selectedItem = this.completionItems.find(
            item => item.key === key
        );
        const inputEl = this.template.querySelector('.soql-input');
        this._insertItem(inputEl, selectedItem);
    }

    handleKeyupSoql(event) {
        const { value } = event.target;
        if (this._soql !== value) {
            store.dispatch(updateSoql(value));
        }

        if (!this._sobjectMeta) return;
        if (!this.isCompletionVisible) {
            this._openCompletion(event);
        } else {
            this._handleCompletion(event);
        }
    }

    handleKeydownSoql(event) {
        const { key, isComposing } = event;
        if (this.isCompletionVisible) {
            if (isComposing) return;
            switch (key) {
                case 'ArrowDown':
                    this._selectBellowItem(event);
                    break;
                case 'ArrowUp':
                    this._selectAboveItem(event);
                    break;
                case 'Enter':
                    this._insertItemByKeyboard(event);
                    break;
                default:
                    break;
            }
        } else {
            if (isComposing && key === 'Enter') {
                this._openCompletion(event);
            }
        }
    }

    handleBlurSoql() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._closeCompletionTimer = setTimeout(
            () => this._closeCompletion(),
            100
        );
    }

    _runQuery(isAllRows) {
        const input = this.template.querySelector('.soql-input');
        if (!input) return;
        const query = input.value;
        if (!query) return;
        store.dispatch(executeQuery(query, isAllRows));
    }

    _openCompletion(event) {
        const { target } = event;
        this._selectionStart =
            this._findSeparator(
                target.value.substring(0, target.selectionEnd)
            ) || target.selectionEnd;
        if (this._canOpenCompletion(event)) {
            this._searchCompletionItems(event);
        }
    }

    _canOpenCompletion(event) {
        const { key, altKey, ctrlKey, metaKey, isComposing } = event;
        return (
            (ctrlKey && key === ' ') ||
            (key.length === 1 &&
                ![' ', ',', '.'].includes(key) &&
                !altKey &&
                !ctrlKey &&
                !metaKey &&
                !isComposing) ||
            (isComposing && key === 'Enter')
        );
    }

    _findSeparator(value) {
        const result = /[,. \n][^,. \n]*$/g.exec(value);
        return result && result.index + 1;
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

    _searchCompletionItems(event) {
        const { target } = event;
        const keyword = target.value.substring(
            this._selectionStart,
            target.selectionEnd
        );
        const escapedKeyword = escapeRegExp(keyword);
        const keywordPattern = new RegExp(escapedKeyword, 'i');
        const completionFields = this._sobjectMeta.fields
            .filter(field =>
                keywordPattern.test(`${field.name} ${field.label}`)
            )
            .map(field => {
                return {
                    ...field,
                    key: field.name,
                    itemLabel: `${field.name} / ${field.label}`,
                    isActive: false,
                    isSyntax: false
                };
            });
        const completionClauses = SOQL_SYNTAX_KEYWORDS.filter(syntax =>
            keywordPattern.test(`${syntax}`)
        ).map((syntax, index) => {
            return {
                name: syntax,
                key: `syntax_${index}`,
                itemLabel: syntax,
                isActive: false,
                isSyntax: true
            };
        });
        this.completionItems = [...completionClauses, ...completionFields];
        if (this.completionItems.length > 0) {
            this.completionItems[0].isActive = true;
            this._setCompletionPosition(event);
            this.isCompletionVisible = true;
        } else {
            this.isCompletionVisible = false;
        }
    }

    _handleCompletion(event) {
        const { key, altKey, ctrlKey, metaKey } = event;
        if (altKey || ctrlKey || metaKey) {
            this._closeCompletion();
        }
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
            case 'ArrowUp':
            case 'Enter':
                if (event.isComposing) {
                    this._searchCompletionItems(event);
                }
                break;
            default:
                this._searchCompletionItems(event);
                break;
        }
    }

    _deleteKeyword(event) {
        this._searchCompletionItems(event);
        if (this._selectionStart === event.target.selectionStart) {
            this._closeCompletion();
        }
    }

    _selectBellowItem(event) {
        event.preventDefault();
        const activeIndex = this._getActiveItemIndex();
        if (activeIndex + 1 < this.completionItems.length) {
            this.completionItems = this.completionItems.map((item, index) => {
                return {
                    ...item,
                    isActive: index === activeIndex + 1
                };
            });
        }
    }

    _selectAboveItem(event) {
        event.preventDefault();
        const activeIndex = this._getActiveItemIndex();
        if (activeIndex > 0) {
            this.completionItems = this.completionItems.map((item, index) => {
                return {
                    ...item,
                    isActive: index === activeIndex - 1
                };
            });
        }
    }

    _getActiveItemIndex() {
        return this.completionItems.findIndex(item => item.isActive);
    }

    _insertItemByKeyboard(event) {
        event.preventDefault();
        const selectedItem = this.completionItems.find(item => item.isActive);
        const { target } = event;
        this._insertItem(target, selectedItem);
    }

    _insertItem(textarea, selectedItem) {
        if (selectedItem) {
            const soql = textarea.value;
            const preSoql = soql.substring(0, this._selectionStart);
            const postSoql = soql.substring(textarea.selectionStart);
            const strippedItemName = stripNamespace(selectedItem.name);
            this.soql = preSoql + strippedItemName + postSoql;
            const insertedIndex =
                this._selectionStart + strippedItemName.length;
            textarea.focus();
            textarea.setSelectionRange(insertedIndex, insertedIndex);
            store.dispatch(updateSoql(this.soql));
        }
        this._closeCompletion();
    }
}
