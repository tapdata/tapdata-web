import Vue from 'vue'
import './plugins/axios'
import './plugins/element'
import App from './App.vue'
import VueRouter from 'vue-router'
import Moment from 'moment'
import './assets/app.scss'
import VueClipboard from 'vue-clipboard2'
import VueIntro from 'vue-introjs'
import 'intro.js/introjs.css'
Vue.use(VueIntro)

if (process.env.VUE_APP_THEME) {
  require('./assets/theme/' + process.env.VUE_APP_THEME + '/index.scss')
}
Vue.prototype.$PLATFORM = process.env.VUE_APP_PLATFORM

Vue.config.productionTip = false
Vue.prototype.$moment = Moment
Vue.use(VueClipboard)

Vue.use(VueRouter)

export default function({ routes }) {
  const router = new VueRouter({
    routes
  })
  let loading = null
  router.beforeEach((to, from, next) => {
    if (to.meta.isErrorPage) {
      return next()
    }
    let userInfo = window.__USER_INFO__ || {}
    let authoritys = userInfo.authoritys || []
    if (userInfo.isInternet) {
      return next('/invalid')
    }
    if (
      process.env.VUE_APP_GRAY === 'true' &&
      !authoritys.includes('ECLOUD_DRS_TEST')
    ) {
      return next('/invalid')
    }
    if (
      [
        'Dataflow',
        'DataflowCreate',
        'Connection',
        'ConnectionCreate',
        'Verification',
        'VerificationCreate'
      ].includes(to.name)
    ) {
      loading = window.loading({ fullscreen: true })
      window.axios
        .get('api/tcm/agent/agentCount')
        .then(data => {
          next()
          if (!data.agentTotalCount || data.agentTotalCount <= 0) {
            window.App.$confirm(
              '创建任务要先订购同步实例，同步任务的服务进程环境要在实例中运行，实例的链路与性能影响同步任务的运行效率。',
              '您尚未订购同步实例，请先订购实例',
              {
                type: 'warning',
                confirmButtonText: '订购实例'
              }
            ).then(flag => {
              if (flag) {
                let downloadUrl = window.App.$router.resolve({
                  name: 'FastDownload'
                })
                window.open(downloadUrl.href, '_blank')
              }
            })
          }
        })
        .finally(() => {
          loading.close()
        })
    } else {
      next()
    }
  })
  loading = window.loading({ fullscreen: true })
  let count = 0
  let getData = () => {
    Promise.all([
      window.axios.get('api/tcm/user'),
      window.axios.get('api/tcm/region'),
      window.axios.get('api/tcm/product/status')
    ])
      .then(([user, region, status]) => {
        let userInfo = user
        //移动云DRS环境代码 ---
        if (userInfo.customerType) {
          userInfo.isInternet = userInfo.customerType.includes('互联网')
        }
        // ----
        window.__USER_INFO__ = userInfo

        let poolList = region.poolList
        let regionMap = {}
        let zoneMap = {}
        poolList.forEach(item => {
          regionMap[item.poolId] = item.poolName
          item.zoneInfo.forEach(zone => {
            zoneMap[zone.zoneCode] = zone.zoneName
          })
        })
        window.__REGION__ = {
          poolList,
          regionMap,
          zoneMap
        }
        if (
          location.href.includes('purchase.html') &&
          !['3', '4', '8'].includes(status)
        ) {
          location.href = location.href.split('#/')[0] + '#/off'
        }
        setTimeout(() => {
          window.App = new Vue({
            router,
            render: h => h(App)
          }).$mount('#app')
        }, 0)
        loading.close()
      })
      .catch(() => {
        if (count < 4) {
          setTimeout(() => {
            count++
            getData()
          }, 3000)
        } else {
          loading.close()
          window.App = new Vue({
            router,
            render: h => h(App)
          }).$mount('#app')
          location.replace(location.href.split('#/')[0] + '#/500')
        }
      })
  }
  getData()
}
sessionStorage.setItem(
  'TM_CONFIG',
  JSON.stringify({
    DFS_IGNORE_PERMISSION: true,
    DFS_TM_API_PRE_URL: process.env.VUE_APP_TM_PUBLIC_PATH,
    DFS_TCM_API_PRE_URL: process.env.VUE_APP_API_PATH,
    DFS_TCM_PLATFORM: process.env.VUE_APP_PLATFORM,
    DFS_TM_WS_HOST: process.env.VUE_APP_WS_HOST
  })
)
