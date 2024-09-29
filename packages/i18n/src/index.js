import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { langKeyMap, getCurrentLanguage, setCurrentLanguage } from './shared/util'
import locale from './locale'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: getCurrentLanguage(),
  messages: locale,
  silentTranslationWarn: true
})

setCurrentLanguage(document.domain.endsWith('io') ? 'en' : 'zh-CN', i18n)

i18n.merge = (langs = {}) => {
  Object.keys(langKeyMap).forEach(f => {
    i18n.mergeLocaleMessage(f, langs[f])
  })
}

export default i18n

export function createI18nObject(obj) {
  const translatedObj = {}

  function translateValue(value) {
    if (typeof value === 'string') {
      return i18n.t(value)
    }
    return value
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      Object.defineProperty(translatedObj, key, {
        get() {
          const result = {}
          for (const [subKey, subValue] of Object.entries(value)) {
            result[subKey] = translateValue(subValue)
          }
          return result
        },
        enumerable: true
      })
    } else {
      Object.defineProperty(translatedObj, key, {
        get() {
          return translateValue(value)
        },
        enumerable: true
      })
    }
  }

  return translatedObj
}
