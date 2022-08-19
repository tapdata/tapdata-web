import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from 'web-core'
import locale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import tcLocale from 'element-ui/lib/locale/lang/zh-TW'
import Cookie from '@tap/shared/src/cookie'
import { locale as dagLocale, langs as dagLangs } from '@tap/dag'

let eleLangs = {
  'zh-CN': zhLocale,
  'zh-TW': tcLocale,
  en: enLocale
}
const langMap = {
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
  en_US: 'en'
}
Vue.use(VueI18n)
let lang = Cookie.get('lang') || 'en_US'
const i18n = new VueI18n({
  locale: langMap[lang],
  messages: eleLangs
})
Object.values(langMap).forEach(l => {
  i18n.mergeLocaleMessage(l, langs[l])
  i18n.mergeLocaleMessage(l, dagLangs[l])
})

locale.i18n((key, value) => i18n.t(key, value)) // 重点：为了实现element插件的多语言切换

export default i18n
