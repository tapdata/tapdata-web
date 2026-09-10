import { ClipboardPlugin, Cookie } from '@tap/shared'
import { getCachedPermissions } from '@/utils/util'

// Remove these once the backend starts returning the TAP-12273 permission codes.
const PENDING_PERMISSION_CODES = new Set([
  'v2_conn_heartbeat',
  'v2_project_management',
  'v2_project_management_creation',
  'v2_project_management_git_config',
  'v2_project_import_and_export',
  'v2_project_import_and_export_import',
  'v2_project_import_and_export_export',
  'v2_user_management_menu_creation',
  'v2_shared_cache_creation',
  'v2_shared_cache_import',
  'v2_shared_cache_export',
  'v2_data_check_creation',
  'v2_data_check_import',
  'v2_data_check_export',
])

export function hasPermissionByCode(code) {
  let _codes = []
  if (typeof code === 'string') {
    _codes.push(code)
  } else if (Object.prototype.toString.call(code) === '[object Array]') {
    _codes = code
  }

  if (_codes.some((item) => PENDING_PERMISSION_CODES.has(item))) {
    return true
  }

  const permissions = getCachedPermissions()
  if (!permissions || permissions.length === 0) {
    return false
  }

  const pList = permissions.filter((resource) => _codes.includes(resource.code))
  if (pList && pList.length > 0) {
    return true
  }
  return false
}

export function permissionBtnDisable(code, id) {
  let falg = false
  const user_id = Cookie.get('user_id')

  if (!id) {
    return true
  }
  if (!hasPermissionByCode(code) && id !== user_id) {
    falg = true
  }
  return falg
}

export function installDirectives(app) {
  app.provide('hasPermissionByCode', hasPermissionByCode)

  app.directive('readonlybtn', {
    mounted(el, binding) {
      const code = binding.value

      if (!hasPermissionByCode(code)) {
        el.remove()
      }
    },
  })

  app.directive('feature', {
    mounted(el, binding, vnode) {
      const store = app.config.globalProperties.$store
      const hasFeature = store.getters['feature/hasFeature']

      if (!hasFeature(binding.value)) {
        el.remove()

        vnode.component?.exposed?.$destroy?.()
      }
    },
  })

  app.config.globalProperties.$has = function (code) {
    return hasPermissionByCode(code)
  }
  app.config.globalProperties.$disabledByPermission = function (code, id) {
    return permissionBtnDisable(code, id)
  }

  app.directive('loadmore', {
    // bind只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置
    beforeMount(el, binding) {
      // 获取element-ui定义好的scroll盒子  Select 选择器的下拉盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap',
      )
      SELECTWRAP_DOM.addEventListener('scroll', function () {
        // 判断滚动到底部
        const CONDITION =
          this.scrollHeight - this.scrollTop <= this.clientHeight
        if (CONDITION) {
          // binding.value 是指令的绑定值，该值可能是字符串，数字、函数
          // binding.value() 表示执行 v-loadmore 绑定的函数
          binding.value()
        }
      })
    },
  })

  app.use(ClipboardPlugin)
}
