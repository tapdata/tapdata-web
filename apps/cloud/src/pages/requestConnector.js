import { installElement } from '@tap/component'
import { ElLoadingService } from 'element-plus'
import { createApp } from 'vue'
import { installDirectives } from '@/directive'
import { installAllPlugins } from '@/plugins'
import axios from '@/plugins/axios'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import i18n from '../i18n'
import App from '../RequestConnector.vue'
import '../directive'
import 'virtual:svg-icons-register'
import '../assets/styles/app.scss'

const loading = ElLoadingService({ fullscreen: true })
let count = 0

const bootstrap = () => {
  axios
    .get('api/tcm/user')
    .then((data) => {
      loading.close()
      const userInfo = data
      window.__USER_INFO__ = userInfo

      store.commit('setUser', userInfo)
      store.commit('setLanguage', userInfo.locale)

      const app = createApp(App)

      installAllPlugins(app)
      installDirectives(app)
      installElement(app)

      app.use(i18n)
      app.use(store)

      app.mount('#app')
    })
    .catch((error) => {
      // 获取用户信息失败
      if (count < 4) {
        setTimeout(() => {
          count++
          bootstrap()
        }, 3000)
      } else {
        loading.close()
        return errorConfirmFnc(error)
      }
    })
}

bootstrap()
