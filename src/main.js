// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import api from './api/index'
import store from './vuex'// 引入全局数据控制
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import VueI18n from 'vue-i18n'
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueI18n)
Vue.prototype.$api = api
/* eslint-disable no-new */

const i18n = new VueI18n({
  locale: 'en', // 语言标识
  messages: {
    'cn': require('./i18n/langs/cn'), // 中文语言包
    'en': require('./i18n/langs/en'), // 英文语言包
    'tc': require('./i18n/langs/tc') // 繁体语言包
  }
})

// Vue.prototype.i18n = window.jQuery.i18n
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})
