import WSClient from './plugins/ws-client'
import * as _util from './util'
import WorkerClient from '@/plugins/WorkerClient'

const install = Vue => {
  Vue.prototype.$util = _util

  Vue.mixin({
    created() {
      // 创建实例时传入wsOptions，即可默认开启websocket
      let wsOptions = this.$options.wsOptions
      // 根实例才有ws
      if (wsOptions) {
        let worker = new WorkerClient('/static/js/ws.worker.js')

        Vue.prototype.$ws = worker
      }
    }
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install
}
export { WSClient }
