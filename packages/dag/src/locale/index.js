import zhCN from './lang/zh-CN'
import zhTW from './lang/zh-TW'
import en from './lang/en'
import { Locale } from '@tap/locale'
const langs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': en,
  en: en
}
const local = new Locale(langs, zhCN)
export { langs, local }
