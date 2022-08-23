import { getBrowserLanguage, Cookie } from '@tap/shared'

// 后端需要的值
export const langKeyMap = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  en: 'en_US'
}

export const langMenu = {
  'zh-CN': '中文 (简)',
  'zh-TW': '中文 (繁)',
  en: 'English'
}

export const getLang = lang => {
  return Object.keys(langKeyMap).includes(lang) ? lang : 'en'
}

export const getCurrentLanguage = () => {
  const lang = localStorage.getItem('lang') || getBrowserLanguage()
  return getLang(lang)
}

export const setCurrentLanguage = (lang, $i18n) => {
  const l = getCurrentLanguage(lang)
  localStorage.setItem('lang', l)
  Cookie.set('lang', langKeyMap[l] || langKeyMap['en'])
  $i18n.locale = l
}
