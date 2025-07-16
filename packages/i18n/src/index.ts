import { createI18n, I18nT, useI18n } from 'vue-i18n'

import locale from './locale'
import { getCurrentLanguage, langKeyMap } from './shared/util'

const i18n = createI18n({
  legacy: false, // 👈 关键在这
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

export { I18nT, useI18n }
