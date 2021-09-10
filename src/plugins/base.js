import Vue from 'vue'
import VConfirm from '@/components/VConfirm/main.js'
// 封装确认弹窗
Vue.prototype.$confirm = (param1, param2, param3) => {
  return new Promise((resolve, reject) => {
    VConfirm.confirm(param1, param2, param3)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        reject(false)
      })
  }).catch(() => {})
}
