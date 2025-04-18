import { installAllPlugins } from '@/plugins'
import { installDirectives } from '@/directive'

import * as Vue from 'vue'
import axios from '@/plugins/axios'
// import '@/plugins/icon'
// import '../plugins/element'
// import '../plugins/axios'
import '../directive'
import i18n from '../i18n'
import App from '../RequestConnector.vue'
import '../assets/styles/app.scss'
import 'virtual:svg-icons-register'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import { ElLoadingService } from 'element-plus'
import { installElement } from '@tap/component'
// import { VIcon } from '@tap/component'

// Vue.config.productionTip = false
// Vue.component(VIcon.name, VIcon)

let loading = ElLoadingService({ fullscreen: true })
let count = 0

const bootstrap = () => {
  axios
    .get('api/tcm/user')
    .then((data) => {
      loading.close()
      let userInfo = data
      window.__USER_INFO__ = userInfo

      store.commit('setUser', userInfo)
      store.commit('setLanguage', userInfo.locale)

      const app = (window.App = window.$vueApp = Vue.createApp(App))

      installAllPlugins(app)
      installDirectives(app)
      installElement(app)

      window.$vueApp.use(i18n)
      window.$vueApp.use(store)

      app.mount('#app')
    })
    .catch((err) => {
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
