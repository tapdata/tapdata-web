import { fetchTimestamp } from '@tap/api'
import { WSClient } from '@tap/business/src/shared/ws-client'
import { installElement, VButton, VIcon } from '@tap/component'
import Time from '@tap/shared/src/time'
import { ElLoading } from 'element-plus'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { installAllPlugins } from '@/plugins'
import axios from '@/plugins/axios'
import { startTimeOnPage, startTimeOnSite } from '@/plugins/buried'
import store from '@/store'
import { errorConfirmFnc } from '@/util'
import App from './App.vue'
import { installDirectives } from './directive'
import i18n from './i18n'
import dayjs from './plugins/dayjs'
import { startVersionPolling } from './plugins/version-polling'
import 'github-markdown-css'
import './assets/styles/app.scss'

export default ({ routes }) => {
  let loading = null

  const init = (userInfo) => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })
    startTimeOnPage(router)

    var loc = window.location,
      wsUrl = 'ws://'
    if (loc.protocol === 'https:') {
      wsUrl = 'wss://'
    }
    let queryString = ``
    if (TAP_ACCESS_TOKEN) {
      queryString = `__token=${TAP_ACCESS_TOKEN}`
    }
    const index = loc.pathname.lastIndexOf('.html')
    let path = loc.pathname
    if (index > 0) {
      path = loc.pathname.slice(
        0,
        Math.max(0, loc.pathname.lastIndexOf('/') + 1),
      )
    }
    wsUrl = `${wsUrl + loc.host + path}tm/ws/agent?${queryString}`

    store.commit('setUser', window.__USER_INFO__)
    store.commit('setLanguage', document.domain.endsWith('io') ? 'en' : 'zh-CN')
    store.dispatch('initGuide', router)

    // Bing Ads
    window.uetq = window.uetq || []
    window.uetq.push('set', {
      pid: {
        em: window.__USER_INFO__.email,
        ph: window.__USER_INFO__.telephone,
      },
    })

    /*S 万维广告*/
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.style.height = '0'
    iframe.style.width = '0'
    iframe.style.border = '0'
    iframe.src = `https://wwads.cn/code/tracking/143?user_id=${window.__USER_INFO__.id}`
    document.body.append(iframe)
    /*E 万维广告*/

    const app = createApp(App)

    installAllPlugins(app)
    installDirectives(app)
    installElement(app)

    app.use(i18n)
    app.use(store)
    app.use(router)

    app.mount('#app')

    app.component(VIcon.name, VIcon)
    app.config.globalProperties.$ws = new WSClient(wsUrl)

    startVersionPolling()

    // 路由守卫
    router.beforeEach((to, from, next) => {
      const domainName = document.domain
      const removeReadonly = localStorage.getItem('removeReadonly')
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

  loading = ElLoading.service({ fullscreen: true })
  let count = 0

  const getData = () => {
    axios
      .get('api/tcm/user')
      .then((data) => {
        const userInfo = data
        window.__USER_INFO__ = userInfo

        loading.close()
        init(userInfo)

        // 设置服务器时间
        fetchTimestamp().then((t) => {
          Time.setTime(t)
        })
      })
      .catch((error) => {
        // 获取用户信息失败
        if (count < 4) {
          // console.log(i18n.t('dfs_src_init_huoquyonghuxin2'))
          setTimeout(() => {
            count++

            // console.log(i18n.t('dfs_src_init_chongxinchangshihuo')('dfs_src_init_chongxinchangshihuo', { val1: count }))
            getData()
          }, 3000)
        } else {
          // console.log(i18n.t('dfs_src_init_huoquyonghuxin'), err)
          loading.close()
          init()
          return errorConfirmFnc(error)
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
      getData()
    })
}

startTimeOnSite()
