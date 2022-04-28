import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from 'web-core'
import locale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import tcLocale from 'element-ui/lib/locale/lang/zh-TW'
import zhCN from './langs/zh-CN'
import enSource from './langs/en'
import enModify from './modify/en'
import zhTWSource from './langs/zh-TW'
import zhTWModify from './modify/zh-TW'

const en = Object.assign({}, enSource, enModify)
const zhTW = Object.assign({}, zhTWSource, zhTWModify)
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
// i18n需要的格式
const i18nLangMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en'
}
Vue.use(VueI18n)
let localeValue = localStorage.getItem('tapdata_localize_lang') || 'zh-CN'
const i18n = new VueI18n({
  locale: i18nLangMap[localeValue],
  messages: eleLangs
})
Object.values(langMap).forEach(l => {
  // 定位矫正文案
  if (process.env.NODE_ENV === 'development') {
    let equal = localStorage.getItem('equalLang') ?? ''
    let inc = localStorage.getItem('includesLang') ?? ''
    equal = equal ? equal.split(',') : []
    inc = inc ? inc.split(',') : []
    for (let key in localLangs[l]) {
      if (!!equal.length && equal.some(t => localLangs[l][key] === t)) {
        delete localLangs[l][key]
      }
      if (localLangs[l][key] && !!inc.length && inc.some(t => localLangs[l][key]?.includes(t))) {
        delete localLangs[l][key]
      }
    }
  }
  i18n.mergeLocaleMessage(l, langs[l])
  i18n.mergeLocaleMessage(l, localLangs[l])
})

locale.i18n((key, value) => i18n.t(key, value)) // 重点：为了实现element插件的多语言切换

export default i18n
