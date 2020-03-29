import '@lwc/synthetic-shadow';
import { buildCustomElementConstructor, register } from 'lwc';
import { registerWireService } from '@lwc/wire-service';
import AppContainer from 'app/container';

const availableFeature = detectFeatures();
const isCompatibleBrowser = Object.keys(availableFeature).some(
    feature => !availableFeature[feature]
);

if (isCompatibleBrowser) {
    unsupportedErrorMessage(availableFeature);
} else {
    registerWireService(register);

    customElements.define(
        'app-container',
        buildCustomElementConstructor(AppContainer)
    );

    if ('serviceWorker' in navigator) {
        // Register service worker after page load event to avoid delaying critical requests for the
        // initial page load.
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
            console.log('Service worker registered');
        });
    }
}

function detectFeatures() {
    return {
        'Service Worker': 'serviceWorker' in navigator
    };
}

function unsupportedErrorMessage() {
    const { outdated } = window;
    outdated.style.display = 'unset';

    let message = `This browser doesn't support all the required features`;

    message += `<ul>`;
    for (const [name, available] of Object.entries(availableFeature)) {
        message += `<li><b>${name}:<b> ${available ? '✅' : '❌'}</li>`;
    }
    message += `</ul>`;

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    outdated.querySelector('.unsupported_message').innerHTML = message;
}
