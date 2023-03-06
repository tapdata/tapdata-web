import '@/plugins/icon'
import init from '../init'

let routes = [
  {
    path: '/',
    name: 'aliyunMarketLicense',
    component: () => import('../views/aliyun-market/License.vue')
  }
]
init({
  routes
})
