import Vue from 'vue'
import axios from 'axios'
import './plugins/element'
import './plugins/axios'
import './plugins/monent'
import App from './App.vue'
import VueRouter from 'vue-router'
import 'github-markdown-css'
import './assets/styles/app.scss'
import VueClipboard from 'vue-clipboard2'
import { Message } from 'element-ui'
import settings from './settings'
import TapdataWebCore from 'web-core'
import i18n from './i18n'
import './plugins/base'
import Purchase from '@/views/Purchase/Purchase'

Vue.config.productionTip = false
Vue.prototype.$settings = settings
Vue.use(VueClipboard)

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}
Vue.use(VueRouter)
Vue.use(TapdataWebCore)

Vue.prototype.$checkAgentStatus = callback => {
  window.axios.get('api/tcm/agent/agentCount').then(data => {
    if (data.agentRunningCount || data.agentRunningCount > 0) {
      callback && callback()
    } else {
      Message.error('Agent当前状态异常，请检查')
    }
  })
}

export default ({ routes }) => {
  let loading = null
  const init = () => {
    if (window.__config__.ENV === 'dev') {
      routes.push({
        path: '/Purchase',
        name: 'Purchase',
        component: Purchase
      })
    }
    const router = new VueRouter({
      routes
    })
    router.beforeEach((to, from, next) => {
      next()
    })
    var loc = window.location,
      wsUrl = 'ws://'
    if (loc.protocol === 'https:') {
      wsUrl = 'wss://'
    }
    let preUrl = settings.DFS_TM_API_PRE_URL || ''
    wsUrl = wsUrl + loc.host + preUrl + `/ws/agent?X-Token=${window.__USER_INFO__?.token}`
    window.App = new Vue({
      router,
      i18n,
      wsOptions: {
        url: wsUrl
      },
      render: h => h(App)
    }).$mount('#app')
  }
  loading = window.loading({ fullscreen: true })
  let count = 0

  let getData = () => {
    window.axios
      .get('api/tcm/user')
      .then(data => {
        let userInfo = data
        window.__USER_INFO__ = userInfo
        loading.close()
        init()
      })
      .catch(() => {
        if (count < 4) {
          setTimeout(() => {
            count++
            getData()
          }, 3000)
        } else {
          loading.close()
          init()
          location.replace(location.href.split('#/')[0] + '#/500')
        }
      })
  }
  axios.get('config/config.json').then(res => {
    window.__config__ = res.data
    getData()
  })
}
sessionStorage.setItem('TM_CONFIG', JSON.stringify(settings))
