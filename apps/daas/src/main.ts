import { fetchSettings, fetchTimestamp, getUserInfoByToken } from '@tap/api'
import { WSClient } from '@tap/business/src/shared/ws-client'
import VIcon from '@tap/component/src/base/VIcon.vue'
import { installElement } from '@tap/component/src/InstallElement'
import {
  getCurrentLanguage,
  setCurrentLanguage,
} from '@tap/i18n/src/shared/util'
import Cookie from '@tap/shared/src/cookie'
import { setSettings } from '@tap/shared/src/settings'
import Time from '@tap/shared/src/time'
import { ElLoading } from 'element-plus'
import { createApp } from 'vue'
import App from '@/App.vue'
import { installOEM } from '@/oem'
import { installAllPlugins } from '@/plugins'
import { initRequestClient } from '@/plugins/axios'
import { configUser, getUrlSearch } from '@/utils/util'
import store from '@/vuex' // 引入全局数据控制

import { installDirectives } from './directives'
import i18n from './i18n'
import router from './router'

import 'virtual:svg-icons-register'
// import 'element-plus/theme-chalk/dark/css-vars.css'
import '@tap/styles'
import '@/styles/app.scss'

initRequestClient()

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

  document.title = import.meta.env.VUE_APP_PAGE_TITLE || 'Tapdata'

  const loc = window.location
  let wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  const app = createApp(App)

  installAllPlugins(app)
  installDirectives(app)
  installElement(app)

  app.config.globalProperties.$ws = new WSClient(wsUrl, undefined, {
    getQuery: () => {
      return {
        access_token: Cookie.get('access_token'),
      }
    },
  })

  app.component(VIcon.name, VIcon)
  app.config.globalProperties.routerAppend = (path, pathToAppend) => {
    return path + (path.endsWith('/') ? '' : '/') + pathToAppend
  }
  app.use(i18n)
  app.use(store)
  app.use(router)
  app.mount('#app')
}

const loading = ElLoading.service({ fullscreen: true })

fetchSettings()
  .then(async (data) => {
    const initData = data || []
    setSettings(initData)

    if (initData.length) {
      localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(initData))
    }
    if (token) {
      //无权限，说明是首次进入页面，重新请求后台获取
      const user = await getUserInfoByToken().catch(() => {
        init()
        return null
      })

      if (!user) {
        return
      }

      await store.dispatch('feature/getFeatures')

      //权限存在则存入缓存并继续向下走
      configUser(user)
    }

    init()
    // 设置服务器时间
    fetchTimestamp().then((t) => {
      Time.setTime(t)
    })
  })
  .catch((error) => {
    // eslint-disable-next-line
    console.log(i18n.global.t('daas_src_main_qingqiuquanjupei') + error)
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
