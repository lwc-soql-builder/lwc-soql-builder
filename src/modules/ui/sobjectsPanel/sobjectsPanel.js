import { LightningElement } from 'lwc';
import salesforce from '../../service/salesforceService';

export default class SobjectsPanel extends LightningElement {
    sobjects;
    filteredSObjects;

    connectedCallback() {
        if (salesforce.isLoggedIn()) {
            salesforce.connection
                .request('/services/data/v48.0/sobjects')
                .then(res => {
                    console.log(res);
                    this.sobjects = res.sobjects;
                    this.filteredSObjects = this.sobjects;
                })
                .catch(err => {
                    console.error(err);
                    this.logout();
                });
        }
    }

    filterSObjects(event) {
        const keyword = event.target.value;
        if (keyword) {
            this.filteredSObjects = this.sobjects.filter(sobject => {
                return `${sobject.name} ${sobject.label}`.includes(keyword);
            });
        } else {
            this.filteredSObjects = this.sobjects;
        }
    }

    selectSObject(event) {
        const sObjectName = event.target.dataset.name;
        console.log(sObjectName);
        this.selectedSObject = this.sobjects.find(
            sobject => sobject.name === sObjectName
        );
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: this.selectedSObject
            })
        );
    }
}
