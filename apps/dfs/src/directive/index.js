import Vue from 'vue'

Vue.directive('readonlybtn', {})

Vue.prototype.$has = function () {
  return true
}
Vue.prototype.$disabledByPermission = function () {
  return false
}
Vue.prototype.$disabledReadonlyUserBtn = function () {
  let domainName = document.domain
  let removeReadonly = localStorage.getItem('removeReadonly')
  if (domainName === 'dev.cloud.tapdata.net' && !removeReadonly) {
    return true
  }
  return false
}
