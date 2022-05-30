import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from 'web-core'
import locale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import tcLocale from 'element-ui/lib/locale/lang/zh-TW'
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
  'zh-CN': zhLocale,
  'zh-TW': tcLocale,
  en: enLocale
}
let localLangs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en
}
// i18n需要的格式
const i18nLangMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en'
}
Vue.use(VueI18n)
let localeValue = 'zh-CN'
const i18n = new VueI18n({
  locale: i18nLangMap[localeValue],
  messages: {} // eleLangs
})
const current = i18n.locale
const langsArr = [localLangs, langs]
langsArr.forEach(el => {
  i18n.mergeLocaleMessage(current, el[current])
})
locale.use(eleLangs[current])
tapComponentLocale.use(current)

export default i18n
