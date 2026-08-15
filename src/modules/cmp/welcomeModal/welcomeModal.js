import { LightningElement, track } from 'lwc';
import { I18nMixin } from '../../i18n/i18n';
import * as salesforce from '../../service/salesforce';

const ORGS_KEY = 'lsb.orgs';

function loadOrgs() {
    try {
        const orgs = JSON.parse(localStorage.getItem(ORGS_KEY));
        return Array.isArray(orgs) ? orgs : [];
    } catch (e) {
        return [];
    }
}

function saveOrgs(orgs) {
    localStorage.setItem(ORGS_KEY, JSON.stringify(orgs));
}

function normalizeLoginUrl(value) {
    let url = (value || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
}

export default class WelcomeModal extends I18nMixin(LightningElement) {
    @track orgs = [];
    @track label = '';
    @track loginUrl = '';
    @track clientId = '';
    @track editingIndex = null;

    connectedCallback() {
        this.orgs = loadOrgs();
    }

    get hasOrgs() {
        return this.orgs.length > 0;
    }

    get orgItems() {
        return this.orgs.map((org, index) => ({
            ...org,
            index,
            key: `${index}:${org.loginUrl}`
        }));
    }

    get isEditing() {
        return this.editingIndex !== null;
    }

    get formTitle() {
        return this.isEditing
            ? this.i18n.WELCOME_EDIT_ORG
            : this.i18n.WELCOME_ADD_ORG;
    }

    get saveButtonLabel() {
        return this.isEditing
            ? this.i18n.WELCOME_ORG_SAVE
            : this.i18n.WELCOME_ADD_ORG;
    }

    handleLabelChange(event) {
        this.label = event.target.value;
    }

    handleLoginUrlChange(event) {
        this.loginUrl = event.target.value;
    }

    handleClientIdChange(event) {
        this.clientId = event.target.value;
    }

    _resetForm() {
        this.label = '';
        this.loginUrl = '';
        this.clientId = '';
        this.editingIndex = null;
    }

    saveOrg() {
        const loginUrl = normalizeLoginUrl(this.loginUrl);
        const clientId = (this.clientId || '').trim();
        if (!loginUrl || !clientId) return;
        const label = (this.label || '').trim() || loginUrl;
        const org = { label, loginUrl, clientId };
        if (this.isEditing) {
            this.orgs = this.orgs.map((o, i) =>
                i === this.editingIndex ? org : o
            );
        } else {
            this.orgs = [...this.orgs, org];
        }
        saveOrgs(this.orgs);
        this._resetForm();
    }

    editOrg(event) {
        event.stopPropagation();
        const index = Number(event.currentTarget.dataset.index);
        const org = this.orgs[index];
        if (!org) return;
        this.label = org.label;
        this.loginUrl = org.loginUrl;
        this.clientId = org.clientId;
        this.editingIndex = index;
    }

    cancelEdit() {
        this._resetForm();
    }

    removeOrg(event) {
        event.stopPropagation();
        const index = Number(event.currentTarget.dataset.index);
        this.orgs = this.orgs.filter((org, i) => i !== index);
        saveOrgs(this.orgs);
        if (this.editingIndex === index) {
            this._resetForm();
        } else if (this.editingIndex !== null && this.editingIndex > index) {
            // keep pointing at the same org after the array shifts
            this.editingIndex -= 1;
        }
    }

    loginOrg(event) {
        const index = Number(event.currentTarget.dataset.index);
        const org = this.orgs[index];
        if (org) salesforce.login(org);
    }
}
