import { createI18n } from 'vue-i18n'

import { langKeyMap, getCurrentLanguage } from './shared/util'
import locale from './locale'

const i18n = createI18n({
  locale: getCurrentLanguage(),
  messages: locale,
  silentTranslationWarn: true,
})

i18n.merge = (langs = {}) => {
  Object.keys(langKeyMap).forEach((f) => {
    i18n.global.mergeLocaleMessage(f, langs[f])
  })
}

// FIXME 这里只是临时处理，需要优化
i18n.t = i18n.global.t

export default i18n

export const { t } = i18n.global
