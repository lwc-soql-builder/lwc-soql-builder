import { createElement } from 'lwc';

import Toast from 'base/toast';

export function registerToastListener() {
    window.addEventListener('show-toast', evt => {
        const { detail } = evt;

        if (!detail) {
            return;
        }

        const { message = 'Unexpected error occured.', errors = [] } = detail;

        const toast = createElement('base-toast', { is: Toast });
        toast.message = message;
        toast.errors = errors;

        document.body.appendChild(toast);
    });
}

export function showToast(options) {
    window.dispatchEvent(
        new CustomEvent('show-toast', {
            detail: options
        })
    );
}
