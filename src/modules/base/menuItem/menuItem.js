import { LightningElement, api } from 'lwc';

export default class Menu extends LightningElement {
    @api iconName;
    @api label;
    @api value;

    get iconPath() {
        if (!this.iconName) return null;
        const iconNames = this.iconName.split(':');
        return `./resources/slds/icons/${iconNames[0]}-sprite/svg/symbols.svg#${iconNames[1]}`;
    }

    connectedCallback() {
        this.classList.add('slds-dropdown__item');
        this.setAttribute('role', 'presentation');
    }

    handleClick(event) {
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent('privateselect', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }
}
