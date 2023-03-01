import { createI18n } from 'vue-i18n'
import { langKeyMap, getCurrentLanguage } from './shared/util'

const i18n = createI18n({
  locale: getCurrentLanguage(),
  messages: {},
  silentTranslationWarn: true
})

i18n.merge = (langs = {}) => {
  Object.keys(langKeyMap).forEach(f => {
    i18n.global.mergeLocaleMessage(f, langs[f])
  })
}

export default i18n
