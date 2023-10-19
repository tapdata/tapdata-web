import i18n, { t } from '@tap/i18n'
import dayjs from '../plugins/dayjs'

// element-plus
import elementEnLocale from 'element-plus/lib/locale/lang/en'
import elementZhLocale from 'element-plus/lib/locale/lang/zh-cn'
import elementTwLocale from 'element-plus/lib/locale/lang/zh-tw'

// 公共模块
import formLangs from '@tap/form/src/locale'
import componentLangs from '@tap/component/src/locale'
import businessLangs from '@tap/business/src/locale'
import dagLangs from '@tap/dag/src/locale'
import ldpLangs from '@tap/ldp/src/locale'
// apps语言文件
import en from './langs/en'
import zhCN from './langs/zh-CN'
import zhTW from './langs/zh-TW'

const localLangModifyZhCN = localStorage.getItem('localLangModifyZhCN') || '{}'
const localLangModifyZhTW = localStorage.getItem('localLangModifyZhTW') || '{}'
const localLangModifyEn = localStorage.getItem('localLangModifyEn') || '{}'
const localStorageLangs = {
  'zh-CN': JSON.parse(localLangModifyZhCN),
  'zh-TW': JSON.parse(localLangModifyZhTW),
  en: JSON.parse(localLangModifyEn)
}

const eleLangs = {
  'zh-CN': elementZhLocale,
  'zh-TW': elementTwLocale,
  en: elementEnLocale
}
const localLangs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en
}
const current = i18n.locale

dayjs.locale(current)

i18n.merge(eleLangs)
i18n.merge(formLangs)
i18n.merge(componentLangs)
i18n.merge(businessLangs)
i18n.merge(dagLangs)
i18n.merge(ldpLangs)
// apps语言文件，最后覆盖
i18n.merge(localLangs)
// 本地矫正文案
i18n.merge(localStorageLangs)

export default i18n
export { t }
