import init from '../init'
import 'virtual:svg-icons-register'

const routes = [
  {
    path: '/',
    name: 'aliyunMarketLicense',
    component: () => import('../views/aliyun-market/License.vue'),
  },
]
init({
  routes,
})
