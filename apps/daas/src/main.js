import '@/styles/app.scss'
import * as Vue from 'vue'
import App from '@/App.tsx'
import store from '@/vuex' // 引入全局数据控制
import i18n from './i18n'
import router from './router'
// import factory from '@/api/factory'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import WSClient from '@tap/business/src/shared/ws-client'
import { VIcon } from '@tap/component'
import { settingsApi, usersApi, timeStampApi } from '@tap/api'
import { getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'

import { installAllPlugins } from '@/plugins'
// import '@/plugins/element'
import { installDirectives } from './directives'

import '@/plugins/axios.ts'
import { configUser, getUrlSearch } from '@/utils/util'

import 'virtual:svg-icons-register'

window._TAPDATA_OPTIONS_ = {
  version: import.meta.env.VITE_VERSION,
  logoUrl: new URL(`./assets/images/${import.meta.env.VITE_LOGO_IMG}`, import.meta.url).href,
  loginUrl: new URL(`./assets/images/${import.meta.env.VITE_LOGIN_IMG}`, import.meta.url).href,
  loadingImg: new URL(`./assets/icons/${import.meta.env.VITE_LOADING_IMG}`, import.meta.url).href,
  logoWidth: import.meta.env.VITE_LOGO_WIDTH,
  logoHeight: import.meta.env.VITE_LOGO_HEIGHT,
  loginSize: import.meta.env.VITE_LOGIN_IMG_SIZE,
  homeUrl: import.meta.env.VITE_HOME_URL,
}

window.getSettingByKey = (key) => {
  let value = ''

  let setting = window?.__settings__.find((it) => it.key === key) || {}
  value = setting.isArray ? setting.value.split(',') : setting.value
  return value
}

// TODO 可能需要重写适配
// window.$vueApp.config.globalProperties.$confirm = (message, title, options) => {
//   return new Promise((resolve, reject) => {
//     VConfirm.confirm(
//       message,
//       title,
//       Object.assign(
//         {
//           cancelButtonText: window.App.$t('public_button_cancel'),
//           confirmButtonText: window.App.$t('public_button_confirm')
//         },
//         options
//       )
//     )
//       .then(() => {
//         resolve(true)
//       })
//       .catch(() => {
//         reject(false)
//       })
//   }).catch(() => {
//     return false
//   })
// }

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

let init = (settings) => {
  window.__settings__ = settings
  let lang = getCurrentLanguage()
  setCurrentLanguage(lang, i18n)

  document.title = /*window.getSettingByKey('PRODUCT_TITLE') ||*/ import.meta.env.VITE_PAGE_TITLE || 'Tapdata'

  var loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  const app = (window.App = window.$vueApp = Vue.createApp(App))

  installAllPlugins(app)
  installDirectives(app)

  // TODO 废弃，后续替换
  // window.$vueApp.use(VueClipboard)
  // window.$vueApp.use(LoadMore)
  // window.$vueApp.use(FormBuilder)

  window.$vueApp.config.globalProperties.$ws = new WSClient(wsUrl)

  // Vue.prototype.$api = factory

  window.$vueApp.component(VIcon.name, VIcon)
  window.$vueApp.config.globalProperties.routerAppend = (path, pathToAppend) => {
    return path + (path.endsWith('/') ? '' : '/') + pathToAppend
  }
  window.$vueApp.config.globalProperties.$getSettingByKey = window.getSettingByKey
  window.$vueApp.use(i18n)
  window.$vueApp.use(store)
  window.$vueApp.use(router)
  window.$vueApp.mount('#app')
}
settingsApi
  .get()
  .then(async (data) => {
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
    // 设置服务器时间
    timeStampApi.get().then((t) => {
      Time.setTime(t)
    })
  })
  .catch((err) => {
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
