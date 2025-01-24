import { api, LightningElement, wire } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import * as salesforce from '../../service/salesforce';
import { MODE } from '../../store/modules/ui/constants';
import { connectStore, selectMode, store } from '../../store/store';

export default class Header extends I18nMixin(LightningElement) {
    @api mode;

    isLoggedIn;
    _user;
    _apiUsage;

    get userLabel() {
        if (!this._user) return '';
        return `${this._user.name}(${this._user.preferred_username})`;
    }

    get apiUsage() {
        if (!this._apiUsage) return '';
        return `${this._apiUsage.used}/${this._apiUsage.limit}`;
    }

    get modeOptions() {
        return [
            {
                label: this.i18n.HEADER_MODE_SOQL,
                value: MODE.SOQL,
                icon: 'utility:database'
            },
            {
                label: this.i18n.HEADER_MODE_API,
                value: MODE.API,
                icon: 'utility:automate'
            },
            {
                label: this.i18n.HEADER_MODE_APEX,
                value: MODE.APEX,
                icon: 'utility:apex'
            }
        ];
    }

    get selectedMode() {
        return this.modeOptions.find(option => option.value === this.mode);
    }

    get selectedModeIconPath() {
        const iconNames = this.selectedMode.icon.split(':');
        return `./resources/slds/icons/${iconNames[0]}-sprite/svg/symbols.svg#${iconNames[1]}`;
    }

    @wire(connectStore, { store })
    storeChange({ ui }) {
        this.isLoggedIn = ui.isLoggedIn;
        this._user = ui.user;
        this._apiUsage = ui.apiUsage;
    }

    logout() {
        salesforce.logout();
    }

    handleModeSelect(event) {
        store.dispatch(selectMode(event.detail.value));
    }
}
