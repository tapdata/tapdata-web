import Vue from 'vue'
import App from '@/App.vue'
import moment from 'moment' // 时间格式化
import store from '@/vuex' // 引入全局数据控制
import VueCookie from 'vue-cookie'
import i18n from './i18n'
import VueBus from 'vue-bus'
import VueClipboard from 'vue-clipboard2'
import factory from '@/api/factory'
import Cache from '@/utils/cache'
import TapdataWebCore from 'web-core'
import Cookie from '@daas/shared/src/cookie'
import VIcon from '@/components/VIcon'
import getRouter from '@/router'
import VConfirm from 'web-core/components/base/v-confirm'

import '@/plugins/element'
import '@/plugins/icon'
import 'element-ui/lib/theme-chalk/index.css'
import '@/directives'
import 'github-markdown-css'
// import '@/assets/style/index.scss'
import LoadMore from '@/utils/loadMore'

import '@/styles/app.scss'

Vue.config.productionTip = false
Vue.use(VueCookie)
Vue.use(VueBus)
Vue.use(VueClipboard)
Vue.use(LoadMore)
Vue.use(TapdataWebCore)

Vue.prototype.$moment = moment
Vue.prototype.$api = factory
Vue.prototype.$cache = new Cache()

Vue.component(VIcon.name, VIcon)

window.VueCookie = VueCookie

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

window.openDebug = () => {
  localStorage.setItem('tapdata_debug', 'true')
}

//因线上存在偶现bug，默认开启
// if (process.env.NODE_ENV === 'development') {
// window.openDebug()
// }

window._TAPDATA_OPTIONS_ = {
  logoUrl: require('@/assets/images/logo.png'),
  version: 'DAAS_BUILD_NUMBER',
  loadingImg: require('@/assets/icons/loading.svg')
}
let config = sessionStorage.getItem('TM_CONFIG') || '{}'
config = JSON.parse(config)
window.getSettingByKey = key => {
  let value = ''
  if (!window.__settings__ || key.startsWith('DFS_')) {
    value = config[key]
  } else {
    let setting = window.__settings__.find(it => it.key === key) || {}
    value = setting.isArray ? setting.value.split(',') : setting.value
  }
  return value
}
Vue.prototype.$getSettingByKey = window.getSettingByKey

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
  }

  document.title = window.getSettingByKey('PRODUCT_TITLE') || 'Tapdata'

  var loc = window.location,
    wsUrl = 'ws:'
  if (loc.protocol === 'https:') {
    wsUrl = 'wss:'
  }
  let host = window.getSettingByKey('DFS_TM_WS_HOST') || loc.host
  let apiPre = window.getSettingByKey('DFS_TM_API_PRE_URL') || location.pathname.replace(/\/$/, '')
  let tcmApiPre = window.getSettingByKey('DFS_TCM_API_PRE_URL') || ''
  let path = (tcmApiPre === '/console' ? '' : tcmApiPre) + apiPre
  let token = Cookie.get('token')
  let tokenParam = 'access_token=' + token
  wsUrl += '//' + host
  wsUrl += path + '/ws/agent'
  wsUrl += `?${tokenParam}`

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

Object.defineProperty(Array.prototype, 'findWhere', {
  value: function (attrs) {
    let keys = Object.keys(attrs),
      length = keys.length
    for (let idx = 0; idx < this.length; idx++) {
      let object = this[idx]
      if (object == null) continue
      let obj = Object(object),
        finded = true
      for (let i = 0; i < length; i++) {
        let key = keys[i]
        if (attrs[key] !== obj[key] || !(key in obj)) {
          finded = false
          break
        }
      }
      if (finded) return object
    }
    return null
  }
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
