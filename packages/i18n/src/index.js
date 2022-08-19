import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookie from '@tap/shared/src/cookie'

const langMap = {
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
  en_US: 'en'
}
Vue.use(VueI18n)
let lang = Cookie.get('lang') || 'en_US'
const i18n = new VueI18n({
  locale: langMap[lang],
  messages: {}
})

const currentLocale = i18n.locale
i18n.merge = (langs = {}) => {
  i18n.mergeLocaleMessage(currentLocale, langs[currentLocale])
}

export default i18n
