import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from 'web-core'
import locale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import tcLocale from 'element-ui/lib/locale/lang/zh-TW'
import en from './langs/en'
import zhCN from './langs/zh-CN'
import zhTW from './langs/zh-TW'

let eleLangs = {
  'zh-CN': zhLocale,
  'zh-TW': tcLocale,
  en: enLocale
}
let localLangs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en
}
let langMap = {
  sc: 'zh-CN',
  tc: 'zh-TW',
  en: 'en'
}
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'zh-CN',
  messages: eleLangs
})
Object.values(langMap).forEach(l => {
  i18n.mergeLocaleMessage(l, langs[l])
  i18n.mergeLocaleMessage(l, localLangs[l])
})

locale.i18n((key, value) => i18n.t(key, value)) // 重点：为了实现element插件的多语言切换

export default i18n
