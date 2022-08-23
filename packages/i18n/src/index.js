import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { langKeyMap, getCurrentLanguage } from './shared/util'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: getCurrentLanguage(),
  messages: {}
})

i18n.merge = (langs = {}) => {
  Object.keys(langKeyMap).forEach(f => {
    i18n.mergeLocaleMessage(f, langs[f])
  })
}

export default i18n
