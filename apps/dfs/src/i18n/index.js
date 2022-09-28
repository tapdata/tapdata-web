import i18n from '@tap/i18n'
import dayjs from '../plugins/dayjs'
// elementUI
import locale from 'element-ui/lib/locale'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import tcLocale from 'element-ui/lib/locale/lang/zh-TW'
// 公共模块
import { langs as formLangs } from '@tap/form'
import { langs as componentLangs } from '@tap/component'
import { langs as businessLangs } from '@tap/business'
import { langs as dagLangs } from '@tap/dag'
// apps语言文件
import en from './langs/en'
import zhCN from './langs/zh-CN'
import zhTW from './langs/zh-TW'

const eleLangs = {
  'zh-CN': zhLocale,
  'zh-TW': tcLocale,
  en: enLocale
}
const localLangs = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en
}
const current = i18n.locale

dayjs.locale(current)
locale.i18n((key, value) => i18n.t(key, value)) // 重点：为了实现element插件的多语言切换
i18n.merge(eleLangs)
i18n.merge(formLangs)
i18n.merge(componentLangs)
i18n.merge(businessLangs)
i18n.merge(dagLangs)
// apps语言文件，最后覆盖
i18n.merge(localLangs)

export default i18n
