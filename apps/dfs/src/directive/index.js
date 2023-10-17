import * as Vue from 'vue'

window.$vueApp.directive('readonlybtn', {})

window.$vueApp.config.globalProperties.$has = function () {
  return true
}
window.$vueApp.config.globalProperties.$disabledByPermission = function () {
  return false
}
window.$vueApp.config.globalProperties.$disabledReadonlyUserBtn = function () {
  let domainName = document.domain
  let removeReadonly = localStorage.getItem('removeReadonly')
  if (domainName === 'demo.cloud.tapdata.net' && !removeReadonly) {
    return true
  }
  return false
}
