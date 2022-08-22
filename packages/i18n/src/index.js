import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { langFileNameMap, getCurrentLanguage } from './shared/util'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: langFileNameMap[getCurrentLanguage()],
  messages: {}
})

i18n.merge = (langs = {}) => {
  Object.values(langFileNameMap).forEach(f => {
    i18n.mergeLocaleMessage(f, langs[f])
  })
}

export default i18n
