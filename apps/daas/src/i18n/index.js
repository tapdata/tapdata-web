import i18n from '@tap/i18n'
// elementUI
// import locale from 'element-ui/lib/locale'
import enLocale from 'element-plus/es/locale/lang/en'
import zhLocale from 'element-plus/es/locale/lang/zh-cn'
import tcLocale from 'element-plus/es/locale/lang/zh-tw'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 公共模块
import componentLangs from '@tap/component/src/locale'
import dagLangs from '@tap/dag/src/locale'
import formLangs from '@tap/form/src/locale'
import businessLangs from '@tap/business/src/locale'
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

// locale.i18n((key, value) => i18n.global.t(key, value)) // 重点：为了实现element插件的多语言切换
i18n.merge(eleLangs)
i18n.merge(dagLangs)
i18n.merge(formLangs)
i18n.merge(componentLangs)
i18n.merge(businessLangs)
// apps语言文件，最后覆盖
i18n.merge(localLangs)
export default i18n
