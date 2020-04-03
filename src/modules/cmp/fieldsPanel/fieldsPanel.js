import { LightningElement, api, wire } from 'lwc';
import { connectStore, store } from '../../app/store/store';
import { describeSObjectIfNeeded } from '../../app/store/store';

export default class FieldsPanel extends LightningElement {
    @api sobject;
    sobjectMeta;

    @wire(connectStore, { store })
    storeChange({ sobject }) {
        const sobjectState = sobject[this.sobject.name];
        if (!sobjectState) return;
        if (sobjectState.data) {
            this.sobjectMeta = sobjectState.data;
        } else if (sobjectState.error) {
            console.error(sobject.error);
        }
    }

    connectedCallback() {
        if (this.sobject.name) {
            store.dispatch(describeSObjectIfNeeded(this.sobject.name));
        }
    }

    deselectSObject() {
        this.dispatchEvent(new CustomEvent('deselect'));
    }

    selectTab(event) {
        const tabs = this.template.querySelectorAll(
            '.sobject-tabs .slds-tabs_default__item'
        );
        tabs.forEach(tab => {
            tab.classList.remove('slds-is-active');
        });
        const domId = event.target.dataset.id;
        const tab = this.template.querySelector(`[data-id=${domId}]`);
        tab.parentNode.classList.add('slds-is-active');
        const tabContents = this.template.querySelectorAll(
            '.sobject-tabs .slds-tabs_default__content'
        );
        tabContents.forEach(tabContent => {
            tabContent.classList.add('slds-hide');
        });
        const tabContent = this.template.querySelector(
            `[data-id=${domId}__content]`
        );
        tabContent.classList.remove('slds-hide');
    }

    selectField(event) {
        const fieldName = event.target.dataset.name;
        console.log(fieldName);
        this.dispatchEvent(
            new CustomEvent('selectfield', {
                detail: fieldName
            })
        );
    }

    selectRelationship(event) {
        const relationshipName = event.target.dataset.name;
        console.log(relationshipName);
        this.dispatchEvent(
            new CustomEvent('selectrelation', {
                detail: relationshipName
            })
        );
    }
}
