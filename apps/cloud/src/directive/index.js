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

  app.use(ClipboardPlugin)
}
