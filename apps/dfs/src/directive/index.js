import Vue from 'vue'

Vue.directive('readonlybtn', {})

Vue.prototype.$has = function () {
  return true
}
Vue.prototype.$disabledByPermission = function () {
  return false
}
