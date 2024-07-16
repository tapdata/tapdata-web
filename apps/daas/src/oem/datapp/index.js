import routes from '@/router/routes'
import './styles/var.scss'

const loginRoute = routes.find(r => r.path === '/login')

loginRoute.component = () => import('./components/Login')

export function install(router) {
  // router.addRoute({
  //   path: '/login_oem',
  //   name: 'login',
  //   component: () => import('./components/Login')
  // })

  console.log(router)
  window._TAPDATA_OPTIONS_.logoUrl = require('./images/app_logo.png')
  window._TAPDATA_OPTIONS_.logoHeight = 36
}
