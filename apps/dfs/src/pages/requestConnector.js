import Vue from 'vue'
import '@/plugins/icon'
import '../plugins/element'
import '../plugins/axios'
import '../directive'
import i18n from '../i18n'
import App from '../RequestConnector.vue'
import '../assets/styles/app.scss'

import store from '@/store'
import { errorConfirmFnc } from '@/util'
import { VIcon, VButton } from '@tap/component'

Vue.config.productionTip = false
Vue.component(VIcon.name, VIcon)

let loading = window.loading({ fullscreen: true })
let count = 0

const bootstrap = () => {
  window.axios
    .get('api/tcm/user')
    .then(data => {
      loading.close()
      let userInfo = data
      window.__USER_INFO__ = userInfo

      store.commit('setUser', userInfo)
      store.commit('setLanguage', userInfo.locale)

      window.App = new Vue({
        i18n,
        store,
        render: h => h(App)
      }).$mount('#app')
    })
    .catch(err => {
      // 获取用户信息失败
      if (count < 4) {
        setTimeout(() => {
          count++
          bootstrap()
        }, 3000)
      } else {
        loading.close()
        return errorConfirmFnc(err)
      }
    })
}

bootstrap()
