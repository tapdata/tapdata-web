import '@/styles/app.scss'

import * as Vue from 'vue'
import App from '@/App'
import store from '@/vuex' // 引入全局数据控制
import i18n from './i18n'
import VueClipboard from 'vue-clipboard2'
// import factory from '@/api/factory'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import WSClient from '@tap/business/src/shared/ws-client'
import { VIcon } from '@tap/component'
import { setupRouter } from '@/router'
import { setupElement } from '@/element'
// import VConfirm from '@/components/v-confirm'
import { settingsApi, usersApi, timeStampApi } from '@tap/api'
import { getCurrentLanguage, setCurrentLanguage } from '@tap/i18n/src/shared/util'
import FormBuilder from '@tap/component/src/form-builder'
// import '@/plugins/element'
import '@/plugins/icon'
import '@/plugins/axios.ts'
import { configUser, getUrlSearch } from '@/utils/util'
import { setupDirectives } from '@/directives'

async function bootstrap() {
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
    let value: settingItem['value'] = ''

    let setting: settingItem = window.__settings__.find(it => it.key === key) || ({} as settingItem)
    value = setting.isArray ? (setting.value as string).split(',') : setting.value
    return value
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
    console.log(i18n.global.t('daas_src_main_baocuntok'), TOKEN)
  }

  let token = Cookie.get('access_token')

  const settings = (await settingsApi.get()) || []

  if (settings.length) {
    localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(settings))
  }

  if (token) {
    try {
      //无权限，说明是首次进入页面，重新请求后台获取
      let user = await usersApi.getInfo()
      //权限存在则存入缓存并继续向下走
      configUser(user)
    } catch (e) {
      console.error(e) // eslint-disable-line
    }
  }

  window.__settings__ = settings
  let lang = getCurrentLanguage()
  setCurrentLanguage(lang, i18n)

  document.title = process.env.VUE_APP_PAGE_TITLE || 'Tapdata'

  let loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent`

  const app = (window.App = window.$vueApp = Vue.createApp(App))
  app.config.globalProperties.routerAppend = (path, pathToAppend) => {
    return path + (path.endsWith('/') ? '' : '/') + pathToAppend
  }
  app.use(store)
  app.use(VueClipboard)
  app.use(FormBuilder)
  app.use(i18n)
  app.mixin({
    created() {
      // 创建实例时传入wsOptions，即可默认开启websocket
      let wsOptions = this.$options.wsOptions
      // 根实例才有ws
      if (wsOptions) {
        app.config.globalProperties.$ws = new WSClient(wsOptions.url, wsOptions.protocols, wsOptions)
      }
    }
  })
  app.component(VIcon.name, VIcon)
  app.config.globalProperties.$getSettingByKey = window.getSettingByKey

  setupRouter(app)

  setupElement(app)

  setupDirectives(app)

  app.mount('#app')

  // 设置服务器时间
  timeStampApi.get().then(t => {
    Time.setTime(t)
  })
}

bootstrap()
