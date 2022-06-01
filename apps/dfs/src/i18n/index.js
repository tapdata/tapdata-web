import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from 'web-core'
import locale from 'element-ui/lib/locale'
import elementEn from 'element-ui/lib/locale/lang/en'
import elementZhCN from 'element-ui/lib/locale/lang/zh-CN'
import elementZhTW from 'element-ui/lib/locale/lang/zh-TW'
import zhCN from './langs/zh-CN'
import enSource from './langs/en'
import zhTWSource from './langs/zh-TW'
import modify from './modify'

import { locale as tapComponentLocale } from '@tap/component'

let localLangModifyZhTW = localStorage.getItem('localLangModifyZhTW')
let localLangModifyEn = localStorage.getItem('localLangModifyEn')
localLangModifyZhTW = localLangModifyZhTW ? JSON.parse(localLangModifyZhTW) : {}
localLangModifyEn = localLangModifyEn ? JSON.parse(localLangModifyEn) : {}
const en = Object.assign({}, enSource, modify.en, localLangModifyEn)
const zhTW = Object.assign({}, zhTWSource, modify.zhTW, localLangModifyZhTW)
let eleLangs = {
  'zh-CN': elementZhCN,
  'zh-TW': elementZhTW,
  en: elementEn
}
let localLangs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en
}
const i18nLangMap = {
  'en-US': 'en'
}
Vue.use(VueI18n)
let localeValue = 'zh-CN'
const i18n = new VueI18n({
  locale: i18nLangMap[localeValue] || localeValue,
  messages: {}
})
const current = i18n.locale
const langsArr = [localLangs, langs]
langsArr.forEach(el => {
  i18n.mergeLocaleMessage(current, el[current])
})
locale.use(eleLangs[current])
tapComponentLocale.use(current)
dayjs.locale(current)

export default i18n
