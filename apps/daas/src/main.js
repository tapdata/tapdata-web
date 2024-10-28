import '@/styles/app.scss'
import Vue from 'vue'
import App from '@/App.tsx'
import store from '@/vuex' // 引入全局数据控制
import i18n from './i18n'
import VueClipboard from 'vue-clipboard2'
// import factory from '@/api/factory'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import WSClient from '@tap/business/src/shared/ws-client'
import { VIcon } from '@tap/component'
import getRouter from '@/router'
import VConfirm from '@/components/v-confirm'
import { settingsApi, usersApi, timeStampApi } from '@tap/api'
import { getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import FormBuilder from '@tap/component/src/form-builder'

import '@/plugins/element'
import '@/plugins/icon'
import '@/directives'
import LoadMore from '@/utils/loadMore'

import '@/plugins/axios.ts'
import { configUser, getUrlSearch } from '@/utils/util'
import { installOEM } from '@/oem'
Vue.config.productionTip = false
Vue.use(VueClipboard)
Vue.use(LoadMore)
Vue.use(FormBuilder)

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

// Vue.prototype.$api = factory

Vue.component(VIcon.name, VIcon)

window._TAPDATA_OPTIONS_ = {
  version: process.env.VUE_APP_VERSION,
  logoUrl: require(`@/assets/images/${process.env.VUE_APP_LOGO_IMG}`),
  loginUrl: require(`@/assets/images/${process.env.VUE_APP_LOGIN_IMG}`),
  loadingImg: require(`@/assets/icons/${process.env.VUE_APP_LOADING_IMG}`),
  logoWidth: process.env.VUE_APP_LOGO_WIDTH,
  logoHeight: process.env.VUE_APP_LOGO_HEIGHT,
  loginSize: process.env.VUE_APP_LOGIN_IMG_SIZE,
  homeUrl: process.env.VUE_APP_HOME_URL
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
          cancelButtonText: i18n.t('public_button_cancel'),
          confirmButtonText: i18n.t('public_button_confirm')
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

;['zh-CN', 'zh-TW', 'en'].includes(URL_LANG) && localStorage.setItem('lang', URL_LANG)

if (TOKEN) {
  Cookie.set('access_token', TOKEN)
  // eslint-disable-next-line
  console.log(i18n.t('daas_src_main_baocuntok'), TOKEN)
}

let token = Cookie.get('access_token')

const router = getRouter(i18n)

installOEM(router, i18n)

let init = settings => {
  window.__settings__ = settings
  let lang = getCurrentLanguage()
  setCurrentLanguage(lang, i18n)

  document.title = /*window.getSettingByKey('PRODUCT_TITLE') ||*/ process.env.VUE_APP_PAGE_TITLE || 'Tapdata'

  var loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  new Vue({
    el: '#app',
    i18n,
    router,
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
    // 设置服务器时间
    timeStampApi.get().then(t => {
      Time.setTime(t)
    })
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

// community add jira issue collector
if (process.env.VUE_APP_MODE === 'community') {
  window.ATL_JQ_PAGE_PROPS = {
    triggerFunction: function (showCollectorDialog) {
      document.addEventListener('click', function (event) {
        const target = document.getElementById('add-jira-issue-btn')
        if (event.target === target || target.contains(event.target)) {
          showCollectorDialog()
        }
      })
    }
  }
}
