import * as Vue from 'vue'
import Cookie from '@tap/shared/src/cookie'

window.$vueApp.directive('readonlybtn', {
  mounted: function (el, binding, vnode) {
    const code = binding.value

    if (!window.$vueApp.config.globalProperties.$has(code)) {
      el.remove()
      vnode.child && vnode.child.$destroy()
    }
  },
})
window.$vueApp.config.globalProperties.$disabledReadonlyUserBtn = function () {
  return false
}

window.$vueApp.config.globalProperties.$has = function (code) {
  return hasPermissionByCode(code)
}
window.$vueApp.config.globalProperties.$disabledByPermission = function (
  code,
  id
) {
  return permissionBtnDisable(code, id)
}

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
  // for (let i = 0; i < permissions.length; i++) {
  // 	let permission = permissions[i];
  // 	if (permission.type === 'button') {

  // 	}
  // }
  let pList = permissions.filter(
    (resource) => _codes.indexOf(resource.code) !== -1
  )
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
