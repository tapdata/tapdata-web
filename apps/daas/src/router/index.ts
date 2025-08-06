import { setPageTitle } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import { getSettingByKey } from '@tap/shared/src/settings'
import { ElMessage as Message } from 'element-plus'

import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'

import i18n from '@/i18n'
import { routes } from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes as readonly RouteRecordRaw[],
})

router.beforeEach((to, from, next) => {
  if (!to.matched.length) {
    Message.error({
      message: 'Page not found!',
    })
    next(false)
    return
  }
  if (to.meta.title && getSettingByKey('SHOW_PAGE_TITLE')) {
    setPageTitle(i18n.global.t(to.meta.title as string))
  }
  const token = Cookie.get('access_token')
  if (token) {
    //若token存在，获取权限
    const permissionsStr = sessionStorage.getItem('tapdata_permissions')
    const permissions = JSON.parse(permissionsStr)

    //判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
    let matched = true
    if (to.meta.code) {
      matched = permissions?.some((p) => p.code === to.meta.code)
    }
    // 绕开权限判断
    if (matched) {
      if (to.name === 'login' || to.name === 'guide') {
        next('/')
      } else {
        next()
      }
    } else if (from.name === 'login') {
      //from为login 上一次重定向无权限跳转到 控制台
      next('/')
    } else {
      Message.error({
        message: i18n.global.t('app_signIn_permission_denied'),
      })
      next(false)
    }
  } else if (
    [
      'login',
      'registry',
      'passwordReset',
      'verificationEmail',
      'registyResult',
    ].includes(to.name as string)
  ) {
    next()
  } else {
    sessionStorage.setItem('lastLocationHref', location.href)
    next('/login')
  }
})

export default router
