import Vue from 'vue'
import Router from 'vue-router'
import factor from '@/api/factory'
import { setPermission } from '@/utils/util'
import { Loading, Message } from 'element-ui'
import routes from './routes'

Vue.use(Router)

export default i18n => {
  const router = new Router({
    routes: routes
  })

  let usersModel = factor('users')
  let isFirst = true
  router.beforeEach(async (to, from, next) => {
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
    let cookie = window.VueCookie
    let token = cookie.get('token')
    let xToken = cookie.get('xToken')
    let userId = cookie.get('user_id')

    if (token || xToken) {
      //若token存在，获取权限
      let permissions = sessionStorage.getItem('tapdata_permissions')
      if (!permissions || isFirst) {
        if (xToken) {
          try {
            let res = await usersModel.getUserInfo()
            let user = res.data
            cookie.set('email', user.email)
            cookie.set('username', user.username || '')
            cookie.set('isAdmin', parseInt(user.role) || 0)
            cookie.set('user_id', user.id)
            cookie.delete('show_guide')
            if (!user.isCompleteGuide) {
              cookie.set('show_guide', 1)
            }
            userId = user.id
          } catch (e) {
            if (e.response && e.response.msg) {
              Message.error({
                message: e.response.msg
              })
            }
          }
        }
        //无权限，说明是首次进入页面，重新请求后台获取
        let loading = Loading.service({
          fullscreen: true,
          lock: true
        })
        try {
          let result = await usersModel.getPermissions(`/${userId}/permissions`)
          isFirst = false
          loading.close()
          if (result && result.data) {
            permissions = result.data.permissions || []
            //权限存在则存入缓存并继续向下走
            permissions = setPermission(permissions)
          } else {
            Message.error({
              message: i18n.t('app.signIn.permission_denied')
            })
            next(false)
            return
          }
        } catch (e) {
          loading.close()
          if (e.response && e.response.msg) {
            Message.error({
              message: e.response.msg
            })
          }
        }
      } else {
        permissions = JSON.parse(permissions)
      }

      //判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
      let matched = true
      if (to.meta.code && !window.getSettingByKey('DFS_IGNORE_PERMISSION')) {
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
          message: i18n.t('app.signIn.permission_denied')
        })
        next(false)
      }
    } else {
      if (['login', 'registry', 'passwordReset', 'verificationEmail', 'registyResult'].includes(to.name)) {
        next()
      } else {
        next('/login')
      }
    }
  })
  return router
}
