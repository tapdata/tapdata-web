// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './vuex';   // 引入全局数据控制
import axios from 'axios';
import VueI18n from 'vue-i18n';
import VueCookie from 'vue-cookie';

import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(VueCookie);

const i18n = new VueI18n({
  locale: 'en', // 语言标识
  messages: {
    'cn': require('./i18n/langs/cn'), // 中文语言包
    'en': require('./i18n/langs/en'), // 英文语言包
    'tc': require('./i18n/langs/tc') // 繁体语言包
  }
});

// Vue.prototype.i18n = window.jQuery.i18n
let vm = new Vue({
  el: '#app',
  router,
  store,
  i18n,
	axios,
  components: { App },
  template: '<App/>'
});

axios.interceptors.request.use(function (config) {
  let access_token = vm.$cookie.get('token');
  if (~config.url.indexOf('?')) {
    if (!~config.url.indexOf('access_token')) {
      config.url = `${config.url}&access_token=${access_token}`;
    }
  } else {
    config.url = `${config.url}?access_token=${access_token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});
