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

import { langs as tapComponentLangs } from '@tap/component'

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
const langsArr = [localLangs, langs, tapComponentLangs]
langsArr.forEach(el => {
  i18n.mergeLocaleMessage(current, el[current])
})
locale.use(eleLangs[current])
// 定位矫正文案
// let currentLang = i18n.messages?.[current] || {}
// if (process.env.NODE_ENV === 'development') {
//   let equal = localStorage.getItem('equalLang') ?? ''
//   let inc = localStorage.getItem('includesLang') ?? ''
//   equal = equal ? equal.split(',') : []
//   inc = inc ? inc.split(',') : []
//   for (let key in currentLang) {
//     let item = currentLang[key]
//     if (!!equal.length && equal.some(t => item === t)) {
//       delete currentLang[key]
//     }
//     if (item && !!inc.length && inc.some(t => item?.includes(t))) {
//       delete currentLang[key]
//     }
//   }
// }
export default i18n
