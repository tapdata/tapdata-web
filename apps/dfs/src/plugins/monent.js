import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
let localeValue = localStorage.getItem('tapdata_localize_lang') || 'zh-CN'
const langMap = {
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'en-US': 'en'
}
dayjs.locale(langMap[localeValue])
