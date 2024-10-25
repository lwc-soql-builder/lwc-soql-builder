import { LightningElement, api } from 'lwc';

export default class Menu extends LightningElement {
    @api alternativeText;
    @api useCustomTrigger;

    _closeMenuTimer;

    connectedCallback() {
        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );
    }

    toggleMenu() {
        this.classList.toggle('slds-is-open');
    }

    handleTriggerSlotChange() {
        const triggerElement = this.querySelector('[slot="trigger"]');
        triggerElement.addEventListener('click', this.toggleMenu.bind(this));
        triggerElement.addEventListener('blur', this.handleBlur.bind(this));
    }

    handleBlur() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._closeMenuTimer = setTimeout(() => this._closeMenu(), 200);
    }

    handleMenuItemPrivateSelect(event) {
        clearTimeout(this._closeMenuTimer);

        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent('select', {
                cancelable: true,
                detail: {
                    value: event.detail.value
                }
            })
        );

        this._closeMenu();
    }

    _closeMenu() {
        this.classList.remove('slds-is-open');
    }
}
