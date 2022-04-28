import Vue from 'vue'
import Moment from 'moment'
let localeValue = localStorage.getItem('tapdata_localize_lang') || 'zh-CN'
const langMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en'
}
Moment.locale(langMap[localeValue])

Vue.prototype.$moment = Moment
