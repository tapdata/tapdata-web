import Vue from 'vue'
import './plugins/element'
import './plugins/axios'
import './directive'
import App from './App.vue'
import VueRouter from 'vue-router'
import 'github-markdown-css'
import './assets/styles/app.scss'
import VueClipboard from 'vue-clipboard2'
import TapdataWebCore from 'web-core'
import i18n from './i18n'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import VConfirm from '@/components/v-confirm'
import { startTimeOnSite, startTimeOnPage } from '@/plugins/buried'
import { VIcon, VButton } from '@tap/component'
import FormBuilder from '@tap/component/src/form-builder'

Vue.config.productionTip = false
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
Vue.use(FormBuilder)

Vue.component(VIcon.name, VIcon)
Vue.component(VButton.name, VButton)

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

  const init = () => {
    const router = new VueRouter({
      routes
    })
    startTimeOnPage(router)

    var loc = window.location,
      wsUrl = 'ws://'
    if (loc.protocol === 'https:') {
      wsUrl = 'wss://'
    }
    let queryString = ``
    if (process.env.NODE_ENV === 'development') {
      queryString = `__token=${process.env.VUE_APP_ACCESS_TOKEN}`
    }
    wsUrl = wsUrl + loc.host + `/tm/ws/agent?${queryString}`
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
  window.axios.get('config/config.json').then(res => {
    window.__config__ = res.data
    getData()
  })
}

startTimeOnSite()
