import Vue from 'vue'
import Moment from 'moment'
import Cookie from '@tap/shared/src/cookie'
let localeValue = Cookie.get('lang') || 'zh-CN'
const langMap = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en-US': 'en'
}
Moment.locale(langMap[localeValue])

Vue.prototype.$moment = Moment
