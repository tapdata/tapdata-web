import * as Vue from 'vue'
import 'virtual:svg-icons-register'
import init from '../init'

let routes = [
  {
    path: '/',
    name: 'aliyunMarketLicense',
    component: Vue.defineAsyncComponent(Vue.defineAsyncComponent(() => import('../views/aliyun-market/License.vue'))),
  },
]
init({
  routes,
})
