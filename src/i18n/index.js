import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { langs } from '../../packages/tapdata-web-core'
import locale from 'element-ui/lib/locale'

Vue.use(VueI18n)
const index = new VueI18n({
  locale:
    {
      sc: 'zh-CN',
      tc: 'zh-TW',
      en: 'en'
    }[localStorage.getItem('tapdata_localize_lang')] || 'zh-CN',
  messages: langs
})

locale.i18n((key, value) => index.t(key, value)) // 重点：为了实现element插件的多语言切换

export default index
