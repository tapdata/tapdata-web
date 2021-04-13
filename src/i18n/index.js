import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
// import messages from './langs'

import en from './langs/en'
import sc from './langs/cn'
import tc from './langs/tc'

Vue.use(VueI18n)
const index = new VueI18n({
  // locale: localStorage.lang || 'en',
  locale: localStorage.getItem('tapdata_localize_lang') || 'cn',
  messages: {
    sc, // 中文
    en, // 英文
    tc // 繁体
  }
})

if (module.hot) {
  module.hot.accept(['./langs/en', './langs/cn', './langs/tc'], function () {
    index.setLocaleMessage('en', require('./langs/en').default)
    index.setLocaleMessage('cn', require('./langs/cn').default)
    index.setLocaleMessage('tc', require('./langs/tc').default)
    // app.$i18n.setLocaleMessage('en', require('./en').default)
    // app.$i18n.setLocaleMessage('ja', require('./ja').default)
  })
}

locale.i18n((key, value) => index.t(key, value)) // 重点：为了实现element插件的多语言切换

export default index
