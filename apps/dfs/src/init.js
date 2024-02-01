import { installAllPlugins } from '@/plugins'
import { installDirectives } from './directive'
import App from './App.vue'
import * as VueRouter from 'vue-router'
import 'github-markdown-css'
import './assets/styles/app.scss'
import axios from '@/plugins/axios'
import i18n from './i18n'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import VConfirm from '@/components/v-confirm'
import { startTimeOnSite, startTimeOnPage } from '@/plugins/buried'
import { VIcon, VButton, installElement } from '@tap/component'
import { timeStampApi } from '@tap/api'
import Time from '@tap/shared/src/time'
import WSClient from '@tap/business/src/shared/ws-client'
import { ElNotification as Notification } from 'element-plus'
import { createVersionPolling } from './plugins/version-polling'
import * as Vue from 'vue'
import { ElLoadingService } from 'element-plus'

// window.$vueApp.use(VueClipboard)

// const originalPush = VueRouter.prototype.push
// const originalReplace = VueRouter.prototype.replace
// VueRouter.prototype.push = function push(location) {
//   return originalPush.call(this, location).catch(err => err)
// }
// VueRouter.prototype.replace = function replace(location) {
//   return originalReplace.call(this, location).catch(err => err)
// }
// window.$vueApp.use(FormBuilder)

export default ({ routes }) => {
  let loading = null

  const init = () => {
    const router = VueRouter.createRouter({
      history: VueRouter.createWebHashHistory(),
      routes,
    })
    startTimeOnPage(router)

    var loc = window.location,
      wsUrl = 'ws://'
    if (loc.protocol === 'https:') {
      wsUrl = 'wss://'
    }
    let queryString = ``
    if (process.env.NODE_ENV === 'development') {
      queryString = `__token=${process.env.VITE_ACCESS_TOKEN}`
    }
    let index = loc.pathname.lastIndexOf('.html')
    let path = loc.pathname
    if (index > 0) {
      path = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1)
    }
    wsUrl = wsUrl + loc.host + path + `tm/ws/agent?${queryString}`

    store.commit('setUser', window.__USER_INFO__)
    store.commit('setLanguage', window.__USER_INFO__.locale)

    const app = (window.App = window.$vueApp = Vue.createApp(App))

    installAllPlugins(app)
    installDirectives(app)
    installElement(app)

    window.$vueApp.use(i18n)
    window.$vueApp.use(store)
    window.$vueApp.use(router)

    window.$vueApp.component(VIcon.name, VIcon)
    window.$vueApp.component(VButton.name, VButton)

    window.$vueApp.config.globalProperties.$ws = new WSClient(wsUrl)
    /*window.$vueApp.config.globalProperties.$confirm = (message, title, options) => {
      return new Promise((resolve, reject) => {
        VConfirm.confirm(message, title, options)
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject(false)
          })
      }).catch(() => {})
    }*/

    app.mount('#app')

    // 版本升级检测
    createVersionPolling({
      appETagKey: '__APP_ETAG__',
      pollingInterval: 5 * 1000, // 单位为毫秒
      silent: process.env.NODE_ENV === 'development', // 开发环境下不检测
      onUpdate: (self) => {
        const h = window.App.$createElement
        Notification({
          customClass: 'version-upgrade-notification',
          title: '',
          message: h(
            'div',
            {
              class: 'flex align-items-start gap-2 ml-n3 mr-n2',
            },
            [
              h('ElImage', {
                class: 'flex-shrink-0',
                attrs: { src: require('@/assets/image/version-rocket.svg') },
              }),
              h(
                'div',
                {
                  class: 'flex flex-column align-items-start gap-2 text-start',
                },
                [
                  h('span', { class: 'text-primary fs-6 fw-sub' }, i18n.t('dfs_system_update')),
                  h('span', { class: '' }, i18n.t('dfs_system_description')),
                  h(
                    'el-button',
                    {
                      class: 'ml-auto',
                      props: { type: 'primary', size: 'mini' },
                      on: { click: () => self.onRefresh() },
                    },
                    i18n.t('public_button_refresh'),
                  ),
                ],
              ),
            ],
          ),
          duration: 0,
          position: 'bottom-right',
        })
      },
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
          'MigrateEditor',
        ].includes(to.name) &&
        domainName === 'demo.cloud.tapdata.net' &&
        !removeReadonly
      ) {
        next(false)
      } else {
        next()
      }
    })
    router.onError((error) => {
      const pattern = /Loading chunk (\d)+ failed/g
      const isChunkLoadFailed = error.message.match(pattern)
      if (isChunkLoadFailed) {
        // 用路由的replace方法，并没有相当于F5刷新页面，失败的js文件并没有从新请求，会导致一直尝试replace页面导致死循环
        location.reload()
      }
    })
    return router
  }

  console.log('app', app)

  loading = ElLoadingService({ fullscreen: true })
  let count = 0

  let getData = () => {
    axios
      .get('api/tcm/user')
      .then((data) => {
        let userInfo = data
        window.__USER_INFO__ = userInfo

        loading.close()
        init()

        // 设置服务器时间
        timeStampApi.get().then((t) => {
          Time.setTime(t)
        })
      })
      .catch((err) => {
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

  axios
    .get('config/config.json', {
      responseType: 'json',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
    .then((res) => {
      store.commit('setConfig', res.data)
      window.__config__ = res.data

      getData()
    })
}

startTimeOnSite()
