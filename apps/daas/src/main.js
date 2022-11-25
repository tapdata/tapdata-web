import '@/styles/app.scss'

import Vue from 'vue'
import App from '@/App.tsx'
import store from '@/vuex' // 引入全局数据控制
import i18n from './i18n'
import VueClipboard from 'vue-clipboard2'
// import factory from '@/api/factory'
import TapdataWebCore from 'web-core'
import Cookie from '@tap/shared/src/cookie'
import { VIcon } from '@tap/component'
import getRouter from '@/router'
import VConfirm from '@/components/v-confirm'
import { settingsApi, usersApi } from '@tap/api'
import { getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import FormBuilder from '@tap/component/src/form-builder'

import '@/plugins/element'
import '@/plugins/icon'
import '@/directives'
import LoadMore from '@/utils/loadMore'

import '@/plugins/axios.ts'
import { configUser, getUrlSearch } from '@/utils/util'

Vue.config.productionTip = false
Vue.use(VueClipboard)
Vue.use(LoadMore)
Vue.use(TapdataWebCore)
Vue.use(FormBuilder)

// Vue.prototype.$api = factory

Vue.component(VIcon.name, VIcon)

window._TAPDATA_OPTIONS_ = {
  version: process.env.VUE_APP_VERSION,
  logoUrl: require(`@/assets/images/${process.env.VUE_APP_LOGO_IMG}`),
  loginUrl: require(`@/assets/images/${process.env.VUE_APP_LOGIN_IMG}`),
  loadingImg: require(`@/assets/icons/${process.env.VUE_APP_LOADING_IMG}`),
  logoWidth: process.env.VUE_APP_LOGO_WIDTH,
  loginSize: process.env.VUE_APP_LOGIN_IMG_SIZE
}

window.getSettingByKey = key => {
  let value = ''

  let setting = window?.__settings__.find(it => it.key === key) || {}
  value = setting.isArray ? setting.value.split(',') : setting.value
  return value
}
Vue.prototype.$getSettingByKey = window.getSettingByKey

Vue.prototype.$confirm = (message, title, options) => {
  return new Promise((resolve, reject) => {
    VConfirm.confirm(
      message,
      title,
      Object.assign(
        {
          cancelButtonText: window.App.$t('button_cancel'),
          confirmButtonText: window.App.$t('button_confirm')
        },
        options
      )
    )
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  }).catch(() => {
    return false
  })
}

const IS_IFRAME = (getUrlSearch('frame') || sessionStorage.getItem('IS_IFRAME') || window.self !== window.top) + ''
if (IS_IFRAME) {
  sessionStorage.setItem('IS_IFRAME', IS_IFRAME)
}
const TOKEN = getUrlSearch('token')
const URL_LANG = getUrlSearch('lang')

// 西工大的case
;['zh-CN', 'zh-TW', 'en'].includes(URL_LANG) && localStorage.setItem('lang', URL_LANG)

if (TOKEN) {
  Cookie.set('access_token', TOKEN)
  // eslint-disable-next-line
  console.log(i18n.t('daas_src_main_baocuntok'), TOKEN)
}

let token = Cookie.get('access_token')

let init = settings => {
  window.__settings__ = settings
  let lang = getCurrentLanguage()
  setCurrentLanguage(lang, i18n)

  document.title = window.getSettingByKey('PRODUCT_TITLE') || 'Tapdata'

  var loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  window.App = new Vue({
    el: '#app',
    i18n,
    router: getRouter(i18n),
    store,
    wsOptions: {
      url: wsUrl,
      getQuery() {
        return {
          access_token: Cookie.get('access_token')
        }
      }
    },
    render: h => h(App)
  })
}
settingsApi
  .get()
  .then(async data => {
    let initData = data || []
    if (initData.length) {
      localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(initData))
    }
    if (token) {
      //无权限，说明是首次进入页面，重新请求后台获取
      let user = await usersApi.getInfo().catch(() => {
        init(initData)
      })
      //权限存在则存入缓存并继续向下走
      configUser(user)
    }
    init(initData)
  })
  .catch(err => {
    // eslint-disable-next-line
    console.log(i18n.t('daas_src_main_qingqiuquanjupei') + err)
  })
//获取全局项目设置（OEM信息）

//解决浏览器tab切换时，element ui 组件tooltip气泡不消失的问题  #7752
document.addEventListener('visibilitychange', () => {
  setTimeout(() => {
    let ele = document.querySelector(':focus')
    ele && ele.blur()
  }, 50)
})

// 判断浏览器是否为IE
// const isIE = /MSIE (\d+\.\d+);/.test(navigator.userAgent) || ~navigator.userAgent.indexOf('Trident/')

// // 兼容ie iframe切换路由不生效
// if (isIE) {
//   window.addEventListener(
//     'hashchange',
//     () => {
//       let currentPath = window.location.hash.slice(1)
//       let arr = ['/dataFlows', '/connections'] // 匹配的路由：同步任务、连接管理、数据校验
//       let flag = false // 是否是iframe使用到的路由地址
//       arr.forEach(el => {
//         let reg = new RegExp('^' + el)
//         if (reg.test(currentPath)) {
//           flag = true
//         }
//       })
//       if (flag && window.App.$route.fullPath !== currentPath) {
//         window.App.$router.push(currentPath)
//       }
//     },
//     false
//   )
// }
