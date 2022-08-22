import { getBrowserLanguage } from '@tap/shared'

export const langKeyMap = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'en-US': 'en_US',
  en: 'en_US'
}

export const langFileNameMap = {
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
  en_US: 'en'
}

export const langMenu = {
  zh_CN: '中文 (简)',
  en_US: 'English',
  zh_TW: '中文 (繁)'
}

export const getCurrentLanguage = () => {
  const lang = localStorage.getItem('lang') || getBrowserLanguage()
  return langKeyMap[lang] || lang
}

export const setCurrentLanguage = (lang, $i18n) => {
  localStorage.setItem('lang', lang)
  $i18n.locale = langFileNameMap[lang]
}
