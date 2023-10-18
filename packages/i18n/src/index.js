import { createI18n } from 'vue-i18n'

import { langKeyMap, getCurrentLanguage } from './shared/util'
import locale from './locale'

const i18n = createI18n({
  locale: getCurrentLanguage(),
  messages: locale,
  silentTranslationWarn: true
})

window.$vueApp.use(i18n)

i18n.merge = (langs = {}) => {
  Object.keys(langKeyMap).forEach(f => {
    i18n.mergeLocaleMessage(f, langs[f])
  })
}

export default i18n

export const { t } = i18n.global
