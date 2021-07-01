import Vue from 'vue'
import App from '@/App.vue'
import router, { childRoutes } from '@/router'
import moment from 'moment' // 时间格式化
import store from '@/vuex' // 引入全局数据控制
import VueCookie from 'vue-cookie'
import i18n from '@/i18n'
import VueBus from 'vue-bus'
import VueClipboard from 'vue-clipboard2'
import factory from '@/api/factory'
import Cache from '@/utils/cache'

import '@/plugins/element'
import '@/plugins/icon'
import 'element-ui/lib/theme-chalk/index.css'
import '@/components/form-builder'
import '@/directives'
import 'github-markdown-css'
import '@/assets/style/index.scss'
// import '@/assets/theme/drs/index.scss'
import LoadMore from '@/utils/loadMore'

import '@/styles/app.scss'

Vue.config.productionTip = false
Vue.use(VueCookie)
Vue.use(VueBus)
Vue.use(VueClipboard)
Vue.use(LoadMore)

Vue.prototype.$moment = moment
Vue.prototype.$api = factory
Vue.prototype.$window = window
Vue.prototype.$cache = new Cache()

window.VueCookie = VueCookie
window.ChildRoutes = childRoutes

window.openDebug = () => {
  localStorage.setItem('tapdata_debug', 'true')
}

//因线上存在偶现bug，默认开启
// if (process.env.NODE_ENV === 'development') {
window.openDebug()
// }

window._TAPDATA_OPTIONS_ = {
  logoUrl: require('@/assets/icons/logo.png'),
  version: 'DAAS_BUILD_NUMBER',
  loadingImg: require('@/assets/icons/loading.svg')
}
if (parent && parent.__USER_INFO__) {
  let userInfo = parent.__USER_INFO__
  VueCookie.set('xToken', userInfo.token)
  VueCookie.set('userId', userInfo.id)
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
let init = settings => {
  window.__settings__ = settings
  let lang = localStorage.getItem('tapdata_localize_lang')
  if (!lang) {
    lang = window.getSettingByKey('DEFAULT_LANGUAGE')
    localStorage.setItem('tapdata_localize_lang', lang || 'en')
  }
  i18n.locale = lang
  document.title = window.getSettingByKey('PRODUCT_TITLE') || 'Tapdata'
  window.App = new Vue({
    el: '#app',
    i18n,
    router,
    store,
    render: h => h(App)
  })
}

factory('Setting')
  .get()
  .then(({ data }) => {
    // data = [
    // 	//前端相关
    // 	// { category: 'Frontend', key: 'PRODUCT_TITLE', value: 'Tapdata' },
    // 	// { category: 'Frontend', key: 'PRODUCT_LOGO', value: 'logo.svg' },
    // 	{ category: 'Frontend', key: 'SHOW_LANGUAGE', value: 1 },
    // 	{ category: 'Frontend', key: 'DEFAULT_LANGUAGE', value: 'en' },
    // 	{ category: 'Frontend', key: 'SHOW_REGISTER', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_OLD_PAGE', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_PAGE_TITLE', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_LICENSE', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_NOTIFICATION', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_QA_AND_HELP', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_SETTING_BUTTON', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_HOME_BUTTON', value: 1 },
    // 	{ category: 'Frontend', key: 'ALLOW_DOWNLOAD_AGENT', value: 1 },
    // 	{ category: 'Frontend', key: 'USE_CLOUD_MENU', value: 1 },
    // 	{ category: 'Frontend', key: 'SHOW_DK_VERSION', value: 1 }
    // ];
    if (data && data.length) {
      localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(data))
    }
    init(data || [])
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
const isIE =
  /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
  ~navigator.userAgent.indexOf('Trident/')

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
      console.log('currentPath', currentPath, window.App.$route, flag)
      if (flag && window.App.$route.fullPath !== currentPath) {
        window.App.$router.push(currentPath)
      }
    },
    false
  )
}
