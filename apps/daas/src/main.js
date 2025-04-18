import { settingsApi, timeStampApi, usersApi } from '@tap/api'
import WSClient from '@tap/business/src/shared/ws-client'
import { installElement, VIcon } from '@tap/component'
import {
  getCurrentLanguage,
  setCurrentLanguage,
} from '@tap/i18n/src/shared/util'
// import factory from '@/api/factory'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import { ElLoading } from 'element-plus'
import * as Vue from 'vue'
import App from '@/App.vue'
import { installOEM } from '@/oem'
import { installAllPlugins } from '@/plugins'
import { configUser, getUrlSearch } from '@/utils/util'
import store from '@/vuex' // 引入全局数据控制
// import '@/plugins/element'
import { installDirectives } from './directives'

import i18n from './i18n'
import router from './router'
import '@/plugins/axios.ts'

import 'virtual:svg-icons-register'
import '@/styles/app.scss'

window._TAPDATA_OPTIONS_ = {
  version: import.meta.env.VUE_APP_VERSION,
  logoUrl: new URL(
    `./assets/images/${import.meta.env.VUE_APP_LOGO_IMG}`,
    import.meta.url,
  ).href,
  loginUrl: new URL(
    `./assets/images/${import.meta.env.VUE_APP_LOGIN_IMG}`,
    import.meta.url,
  ).href,
  loadingImg: new URL(
    `./assets/icons/${import.meta.env.VUE_APP_LOADING_IMG}`,
    import.meta.url,
  ).href,
  logoWidth: import.meta.env.VUE_APP_LOGO_WIDTH,
  logoHeight: import.meta.env.VUE_APP_LOGO_HEIGHT,
  loginSize: import.meta.env.VUE_APP_LOGIN_IMG_SIZE,
  homeUrl: import.meta.env.VUE_APP_HOME_URL,
}

window.getSettingByKey = (key) => {
  let value = ''

  const setting = window?.__settings__.find((it) => it.key === key) || {}
  value = setting.isArray ? setting.value.split(',') : setting.value
  return value
}

const IS_IFRAME = String(
  getUrlSearch('frame') ||
    sessionStorage.getItem('IS_IFRAME') ||
    window.self !== window.top,
)
if (IS_IFRAME) {
  sessionStorage.setItem('IS_IFRAME', IS_IFRAME)
}
const TOKEN = getUrlSearch('token')
const URL_LANG = getUrlSearch('lang')

;['zh-CN', 'zh-TW', 'en'].includes(URL_LANG) &&
  localStorage.setItem('lang', URL_LANG)

if (TOKEN) {
  Cookie.set('access_token', TOKEN)
}

const token = Cookie.get('access_token')

installOEM(router, i18n)

const init = () => {
  const lang = getCurrentLanguage()
  setCurrentLanguage(lang, i18n)

  document.title =
    /*window.getSettingByKey('PRODUCT_TITLE') ||*/ import.meta.env
      .VUE_APP_PAGE_TITLE || 'Tapdata'

  const loc = window.location
  let wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  const app = (window.App = window.$vueApp = Vue.createApp(App))

  installAllPlugins(app)
  installDirectives(app)
  installElement(app)

  // TODO 废弃，后续替换
  // window.$vueApp.use(VueClipboard)
  // window.$vueApp.use(LoadMore)
  // window.$vueApp.use(FormBuilder)

  window.$vueApp.config.globalProperties.$ws = new WSClient(wsUrl, undefined, {
    getQuery: () => {
      return {
        access_token: Cookie.get('access_token'),
      }
    },
  })

  // Vue.prototype.$api = factory

  window.$vueApp.component(VIcon.name, VIcon)
  window.$vueApp.config.globalProperties.routerAppend = (
    path,
    pathToAppend,
  ) => {
    return path + (path.endsWith('/') ? '' : '/') + pathToAppend
  }
  window.$vueApp.config.globalProperties.$getSettingByKey =
    window.getSettingByKey
  window.$vueApp.use(i18n)
  window.$vueApp.use(store)
  window.$vueApp.use(router)
  window.$vueApp.mount('#app')
}

const loading = ElLoading.service({ fullscreen: true })

settingsApi
  .get()
  .then(async (data) => {
    const initData = data || []
    window.__settings__ = initData

    if (initData.length) {
      localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(initData))
    }
    if (token) {
      //无权限，说明是首次进入页面，重新请求后台获取
      const user = await usersApi.getInfo().catch(async () => {
        init()
      })

      await store.dispatch('feature/getFeatures')

      //权限存在则存入缓存并继续向下走
      configUser(user)
    }

    init()
    // 设置服务器时间
    timeStampApi.get().then((t) => {
      Time.setTime(t)
    })
  })
  .catch((error) => {
    // eslint-disable-next-line
    console.log(i18n.t('daas_src_main_qingqiuquanjupei') + error)
  })
  .finally(() => {
    loading.close()
  })
//获取全局项目设置（OEM信息）

//解决浏览器tab切换时，element ui 组件tooltip气泡不消失的问题  #7752
document.addEventListener('visibilitychange', () => {
  setTimeout(() => {
    const ele = document.querySelector(':focus')
    ele && ele.blur()
  }, 50)
})

// community add jira issue collector
if (import.meta.env.VUE_APP_MODE === 'community') {
  window.ATL_JQ_PAGE_PROPS = {
    triggerFunction(showCollectorDialog) {
      document.addEventListener('click', function (event) {
        const target = document.querySelector('#add-jira-issue-btn')
        if (event.target === target || target.contains(event.target)) {
          showCollectorDialog()
        }
      })
    },
  }
}
