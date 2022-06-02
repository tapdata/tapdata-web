import Vue from 'vue'
import axios from 'axios'
import './plugins/element'
import './plugins/axios'
import App from './App.vue'
import VueRouter from 'vue-router'
import 'github-markdown-css'
import './assets/styles/app.scss'
import VueClipboard from 'vue-clipboard2'
import { Message } from 'element-ui'
import settings from './settings'
import TapdataWebCore from 'web-core'
import i18n from './i18n'
import Purchase from '@/views/purchase/Purchase'
import store from '@/store'
import { errorConfirmFnc, buried } from '@/util'
import VConfirm from '@/components/v-confirm'

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
  return new Promise((resolve, reject) => {
    window.axios.get('api/tcm/agent/agentCount').then(data => {
      if (data.agentRunningCount || data.agentRunningCount > 0) {
        resolve(callback?.())
      } else {
        Message.error(i18n.t('agent_error_check'))
        reject()
      }
    })
  })
}

Vue.prototype.$confirm = (message, title, options) => {
  return new Promise((resolve, reject) => {
    VConfirm.confirm(message, title, options)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  }).catch(() => {})
}

export default ({ routes }) => {
  let loading = null
  let all = {
    timer: null,
    count: 0
  }
  let one = {
    timer: null,
    count: 0,
    page: ''
  }
  const init = () => {
    all.timer && clearInterval(all.timer)
    all.timer = setInterval(() => {
      all.count++
      if (all.count > 0 && all.count % 30 === 0) {
        buried('timeOnSite', '/', {
          times: all.count + 's'
        })
      }
    }, 1000)
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
      buried('accessPage', to.path || '/')
      one.page = to.path
      one.count = 0
      one.timer && clearInterval(one.timer)
      one.timer = setInterval(() => {
        one.count++
        if (one.count > 0 && one.count % 30 === 0) {
          buried('timeOnPage', to.path || '/', {
            times: one.count + 's'
          })
        }
      }, 1000)
    })
    let startTime = Date.now()
    window.onbeforeunload = () => {
      buried('leaveSite', one.page, {
        times: (Date.now() - startTime) / 1000 + 's'
      })
      setTimeout(() => {
        buried('leavePage', one.page, {
          times: one.count + 's'
        })
      }, 300)
    }
    var loc = window.location,
      wsUrl = 'ws://'
    if (loc.protocol === 'https:') {
      wsUrl = 'wss://'
    }
    let preUrl = settings.DFS_TM_API_PRE_URL || ''
    let queryString = `X-Token=${window.__USER_INFO__?.token}`
    if (process.env.NODE_ENV === 'development') {
      queryString = `__token=${process.env.VUE_APP_ACCESS_TOKEN}`
    }
    wsUrl = wsUrl + loc.host + preUrl + `/ws/agent?${queryString}`
    window.App = new Vue({
      router,
      store,
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
      .catch(err => {
        // 获取用户信息失败
        if (count < 4) {
          // eslint-disable-next-line
          console.log('获取用户信息失败')
          setTimeout(() => {
            count++
            // eslint-disable-next-line
            console.log(`重新尝试获取用户信息: 第${count}次`)
            getData()
          }, 3000)
        } else {
          // eslint-disable-next-line
          console.log('获取用户信息失败, 停止重试，跳转到500', err)
          loading.close()
          init()
          return errorConfirmFnc(err)
        }
      })
  }
  axios.get('config/config.json').then(res => {
    window.__config__ = res.data
    getData()
  })
}
sessionStorage.setItem('TM_CONFIG', JSON.stringify(settings))
