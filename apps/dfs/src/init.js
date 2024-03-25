import Vue from 'vue'
import './plugins/element'
import './plugins/axios'
import './directive'
import App from './App.vue'
import VueRouter from 'vue-router'
import 'github-markdown-css'
import './assets/styles/app.scss'
import VueClipboard from 'vue-clipboard2'

import i18n from './i18n'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import VConfirm from '@/components/v-confirm'
import { startTimeOnSite, startTimeOnPage } from '@/plugins/buried'
import { VIcon, VButton } from '@tap/component'
import FormBuilder from '@tap/component/src/form-builder'
import { timeStampApi } from '@tap/api'
import Time from '@tap/shared/src/time'
import WSClient from '@tap/business/src/shared/ws-client'
import { Notification } from 'element-ui'
import { createVersionPolling } from './plugins/version-polling'

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
Vue.use(FormBuilder)

Vue.component(VIcon.name, VIcon)
Vue.component(VButton.name, VButton)

Vue.mixin({
  created() {
    // 创建实例时传入wsOptions，即可默认开启websocket
    let wsOptions = this.$options.wsOptions
    // 根实例才有ws
    if (wsOptions) {
      Vue.prototype.$ws = new WSClient(wsOptions.url, wsOptions.protocols, wsOptions)
    }
  }
})

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
    let index = loc.pathname.lastIndexOf('.html')
    let path = loc.pathname
    if (index > 0) {
      path = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1)
    }
    wsUrl = wsUrl + loc.host + path + `tm/ws/agent?${queryString}`

    store.commit('setUser', window.__USER_INFO__)
    store.commit('setLanguage', window.__USER_INFO__.locale)

    window.App = new Vue({
      router,
      store,
      i18n,
      wsOptions: {
        url: wsUrl
      },
      render: h => h(App)
    }).$mount('#app')

    // 版本升级检测
    createVersionPolling({
      appETagKey: '__APP_ETAG__',
      pollingInterval: 5 * 1000, // 单位为毫秒
      silent: process.env.NODE_ENV === 'development', // 开发环境下不检测
      onUpdate: self => {
        const h = window.App.$createElement
        Notification({
          customClass: 'version-upgrade-notification',
          title: '',
          message: h(
            'div',
            {
              class: 'flex align-items-start gap-2 ml-n3 mr-n2'
            },
            [
              h('ElImage', {
                class: 'flex-shrink-0',
                attrs: { src: require('@/assets/image/version-rocket.svg') }
              }),
              h('div', { class: 'flex flex-column align-items-start gap-2 text-start' }, [
                h('span', { class: 'text-primary fs-6 fw-sub' }, i18n.t('dfs_system_update')),
                h('span', { class: '' }, i18n.t('dfs_system_description')),
                h(
                  'el-button',
                  {
                    class: 'ml-auto',
                    props: { type: 'primary', size: 'mini' },
                    on: { click: () => self.onRefresh() }
                  },
                  i18n.t('public_button_refresh')
                )
              ])
            ]
          ),
          duration: 0,
          position: 'bottom-right'
        })
      }
    })

    // 路由守卫
    router.beforeEach((to, from, next) => {
      let domainName = document.domain
      let removeReadonly = localStorage.getItem('removeReadonly')
      if (
        [
          'connectionCreate',
          'connectionsEdit',
          'DataflowNew',
          'DataflowEditor',
          'MigrateCreate',
          'MigrateEditor',
          'MigrateEditor'
        ].includes(to.name) &&
        domainName === 'demo.cloud.tapdata.net' &&
        !removeReadonly
      ) {
        next(false)
      } else {
        next()
      }
    })
    router.onError(error => {
      const pattern = /Loading chunk (\d)+ failed/g
      const isChunkLoadFailed = error.message.match(pattern)
      if (isChunkLoadFailed) {
        // 用路由的replace方法，并没有相当于F5刷新页面，失败的js文件并没有从新请求，会导致一直尝试replace页面导致死循环
        location.reload()
      }
    })
    return router
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

        // 设置服务器时间
        timeStampApi.get().then(t => {
          Time.setTime(t)
        })
      })
      .catch(err => {
        // 获取用户信息失败
        if (count < 4) {
          // eslint-disable-next-line
          // console.log(i18n.t('dfs_src_init_huoquyonghuxin2'))
          setTimeout(() => {
            count++
            // eslint-disable-next-line
            // console.log(i18n.t('dfs_src_init_chongxinchangshihuo')('dfs_src_init_chongxinchangshihuo', { val1: count }))
            getData()
          }, 3000)
        } else {
          // eslint-disable-next-line
          // console.log(i18n.t('dfs_src_init_huoquyonghuxin'), err)
          loading.close()
          init()
          return errorConfirmFnc(err)
        }
      })
  }

  window.axios
    .get('config/config.json', {
      responseType: 'json',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    .then(res => {
      store.commit('setConfig', res.data)
      getData()
    })
}

startTimeOnSite()
