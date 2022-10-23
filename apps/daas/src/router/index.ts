import Vue from 'vue'
import Router from 'vue-router'
import { Message } from 'element-ui'
import routes from './routes'
import Cookie from '@tap/shared/src/cookie'

Vue.use(Router)

export default i18n => {
  const router = new Router({
    routes: routes
  })

  router.beforeEach((to, from, next) => {
    if (!to.matched.length) {
      Message.error({
        message: 'Page not found!'
      })
      next(false)
      return
    }
    if (to.meta.title && window.getSettingByKey('SHOW_PAGE_TITLE')) {
      document.title = i18n.t(to.meta.title)
    }
    const token = Cookie.get('access_token')
    if (token) {
      //若token存在，获取权限
      const permissionsStr = sessionStorage.getItem('tapdata_permissions')
      const permissions = JSON.parse(permissionsStr)

      //判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
      let matched = true
      if (to.meta.code) {
        matched = permissions.some(p => p.code === to.meta.code)
      }
      // 绕开权限判断
      if (matched) {
        if (to.name === 'login' || to.name === 'guide') {
          next('/')
        } else {
          next()
        }
      } else {
        Message.error({
          message: i18n.t('app_signIn_permission_denied')
        })
        next(false)
      }
    } else {
      if (['login', 'registry', 'passwordReset', 'verificationEmail', 'registyResult'].includes(to.name)) {
        next()
      } else {
        sessionStorage.setItem('lastLocationHref', location.href)
        next('/login')
      }
    }
  })
  return router
}
