import { LightningElement, api } from 'lwc';
import salesforce from '../../service/salesforceService';

export default class FieldsPanel extends LightningElement {
    @api sobject;
    sobjectMeta;

    connectedCallback() {
        if (salesforce.isLoggedIn()) {
            salesforce.connection
                .request(
                    `/services/data/v48.0/sobjects/${this.sobject.name}/describe`
                )
                .then(res => {
                    console.log(res);
                    this.sobjectMeta = res;
                })
                .catch(err => {
                    console.error(err);
                });
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
        console.log(domId);
        const tab = this.template.querySelector(`[data-id=${domId}]`);
        console.log(tab);
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
        console.log(tabContent);
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
