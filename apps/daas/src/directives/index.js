import Cookie from '@tap/shared/src/cookie'
import { useStore } from 'vuex'
export function hasPermissionByCode(code) {
  let permissions = sessionStorage.getItem('tapdata_permissions')
  permissions = JSON.parse(permissions)

  if (!permissions || permissions.length === 0) {
    return false
  }
  let _codes = []
  if (typeof code === 'string') {
    _codes.push(code)
  } else if (Object.prototype.toString.call(code) === '[object Array]') {
    _codes = code
  }
  let pList = permissions.filter((resource) => _codes.indexOf(resource.code) !== -1)
  if (pList && pList.length > 0) {
    return true
  }
  return false
}

export function permissionBtnDisable(code, id) {
  let falg = false
  let user_id = Cookie.get('user_id')

  if (!id) {
    return true
  }
  if (!window.$vueApp.config.globalProperties.$has(code)) {
    if (id !== user_id) {
      falg = true
    }
  }
  return falg
}

export function installDirectives(app) {
  app.directive('readonlybtn', {
    mounted(el, binding, vnode) {
      const code = binding.value

      if (!window.$vueApp.config.globalProperties.$has(code)) {
        el.remove()
        vnode.child && vnode.child.$destroy()
      }
    },
  })

  app.directive('feature', {
    mounted(el, binding, vnode) {
      const store = app.config.globalProperties.$store
      const hasFeature = store.getters['feature/hasFeature']
  
      if (!hasFeature(binding.value)) {
        el.parentNode.removeChild(el)
  
        vnode.component?.exposed?.$destroy?.()
      }
    }
  })
  

  app.config.globalProperties.$has = function (code) {
    return hasPermissionByCode(code)
  }
  app.config.globalProperties.$disabledByPermission = function (code, id) {
    return permissionBtnDisable(code, id)
  }
  app.config.globalProperties.$disabledReadonlyUserBtn = function () {
    return false
  }

  app.directive('loadmore', {
    // bind只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置
    beforeMount(el, binding) {
      // 获取element-ui定义好的scroll盒子  Select 选择器的下拉盒子
      const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
      SELECTWRAP_DOM.addEventListener('scroll', function () {
        // 判断滚动到底部
        const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight
        if (CONDITION) {
          // binding.value 是指令的绑定值，该值可能是字符串，数字、函数
          // binding.value() 表示执行 v-loadmore 绑定的函数
          binding.value()
        }
      })
    },
  })
}
