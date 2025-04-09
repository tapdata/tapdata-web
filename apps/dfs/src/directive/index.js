import { ClipboardPlugin } from '@tap/shared'

export function installDirectives(app) {
  app.directive('readonlybtn', {})
  app.directive('feature', {})
  app.config.globalProperties.$has = function () {
    return true
  }
  app.config.globalProperties.$disabledByPermission = function () {
    return false
  }
  app.config.globalProperties.$disabledReadonlyUserBtn = function () {
    let domainName = document.domain
    let removeReadonly = localStorage.getItem('removeReadonly')
    if (domainName === 'demo.cloud.tapdata.net' && !removeReadonly) {
      return true
    }
    return false
  }

  app.use(ClipboardPlugin)
}
