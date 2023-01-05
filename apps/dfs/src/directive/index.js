import Vue from 'vue'

Vue.directive('readonlybtn', {})

Vue.prototype.$has = function () {
  return true
}
Vue.prototype.$disabledByPermission = function () {
  return false
}
Vue.prototype.$disabledReadonlyUserBtn = function () {
  let user = window.__USER_INFO__
  let removeReadonly = localStorage.getItem('removeReadonly')
  if (user?.username === 'demo@tapdata.io' && !removeReadonly) {
    return true
  }
  return false
}
