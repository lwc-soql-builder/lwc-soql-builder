import en from './messages/en';
import ja from './messages/ja';

const I18N_MESSAGES = { en, ja };

const I18nMixin = base =>
    class I18nElement extends base {
        language = window.navigator.language;
        // TODO: ja_JPとか対応？
        i18n = Object.assign(
            {},
            I18N_MESSAGES.en,
            I18N_MESSAGES[this.language]
        );
    };
export { I18nMixin };
