import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
// import messages from './langs'

import en from './lang/en'
import cn from './lang/cn'
import tc from './lang/tc'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: localStorage.lang || 'en',
  messages: {
    cn, //中文
    en, //英文
    tc  //繁体
  }
})

locale.i18n((key, value) => i18n.t(key, value))

export default i18n
