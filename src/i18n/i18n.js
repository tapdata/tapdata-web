import Vue from 'vue';
import locale from 'element-ui/lib/locale';
import VueI18n from 'vue-i18n';
// import messages from './langs'

import en from './langs/en';
import cn from './langs/cn';
import tc from './langs/tc';

Vue.use(VueI18n);

const i18n = new VueI18n({
  //locale: localStorage.lang || 'en',
  locale: localStorage.getItem('locale') || 'en',
  messages: {
    cn, //中文
    en, //英文
    tc  //繁体
  }
});

locale.i18n((key, value) => i18n.t(key, value)) //重点：为了实现element插件的多语言切换

export default i18n;
