import Vue from 'vue'
import App from '@/App.vue'
import store from '@/vuex' // 引入全局数据控制
import i18n from './i18n'
import VueClipboard from 'vue-clipboard2'
import factory from '@/api/factory'
import TapdataWebCore from 'web-core'
import Cookie from '@tap/shared/src/cookie'
import VIcon from '@/components/VIcon'
import getRouter from '@/router'
import VConfirm from '@/components/v-confirm'

import '@/plugins/element'
import '@/plugins/icon'
import '@/directives'
import 'github-markdown-css'
import LoadMore from '@/utils/loadMore'

import '@/styles/app.scss'
import '@/styles/element-variables.scss'

Vue.config.productionTip = false
Vue.use(VueClipboard)
Vue.use(LoadMore)
Vue.use(TapdataWebCore)

Vue.prototype.$api = factory

Vue.component(VIcon.name, VIcon)

window._TAPDATA_OPTIONS_ = {
  logoUrl: require('@/assets/images/logo.png'),
  loginUrl: require('@/assets/images/login-bg.png'),
  version: 'DAAS_BUILD_NUMBER',
  loadingImg: require('@/assets/icons/loading.svg')
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
  }).catch(() => {})
}

const langMap = {
  sc: 'zh-CN',
  tc: 'zh-TW',
  en: 'en'
}
const LanguagesKey = {
  sc: 'zh_CN',
  en: 'en_US',
  tc: 'zh_TW'
}
let init = settings => {
  window.__settings__ = settings
  let lang = localStorage.getItem('tapdata_localize_lang')
  if (!lang) {
    lang = window.getSettingByKey('DEFAULT_LANGUAGE')
    localStorage.setItem('tapdata_localize_lang', lang || 'en')
    Cookie.set('lang', LanguagesKey[lang || 'en'])
    i18n.locale = langMap[lang]
  }

  document.title = window.getSettingByKey('PRODUCT_TITLE') || 'Tapdata'

  var loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  let token = Cookie.get('token')
  wsUrl += `//${loc.host}${location.pathname.replace(/\/$/, '')}/ws/agent?access_token=${token}`

  window.App = new Vue({
    el: '#app',
    i18n,
    router: getRouter(i18n),
    store,
    wsOptions: {
      url: wsUrl
    },
    render: h => h(App)
  })
}

factory('Setting')
  .get()
  .then(({ data }) => {
    if (data && data.length) {
      localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(data))
    }
    init(data || [])
  })
  .catch(err => {
    // eslint-disable-next-line
    console.log('请求全局配置(settings)失败: ' + err)
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
const isIE = /MSIE (\d+\.\d+);/.test(navigator.userAgent) || ~navigator.userAgent.indexOf('Trident/')

// 兼容ie iframe切换路由不生效
if (isIE) {
  window.addEventListener(
    'hashchange',
    () => {
      let currentPath = window.location.hash.slice(1)
      let arr = ['/dataFlows', '/connections', '/dataVerification'] // 匹配的路由：同步任务、连接管理、数据校验
      let flag = false // 是否是iframe使用到的路由地址
      arr.forEach(el => {
        let reg = new RegExp('^' + el)
        if (reg.test(currentPath)) {
          flag = true
        }
      })
      if (flag && window.App.$route.fullPath !== currentPath) {
        window.App.$router.push(currentPath)
      }
    },
    false
  )
}
