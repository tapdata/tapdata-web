import locale from './locale'
import baseComponents from './components/base'
import FormBuilder from './components/form-builder'
import ConnectionTest from './components/ConnectionTest'
import FieldMapping from './components/FieldMapping'
import CheckStage from './components/CheckStage'

import WSClient from './plugins/ws-client'
import * as _util from './util'

const components = [ConnectionTest, FieldMapping, CheckStage].concat(baseComponents)

const install = Vue => {
  Vue.prototype.$util = _util

  Vue.use(FormBuilder)

  components.forEach(component => {
    Vue.component(component.name, component)
  })

  Vue.mixin({
    created() {
      // 创建实例时传入wsOptions，即可默认开启websocket
      let wsOptions = this.$options.wsOptions
      // 根实例才有ws
      if (wsOptions) {
        Vue.prototype.$ws = new WSClient(wsOptions.url, wsOptions.protocols, wsOptions)
      }
    }
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
const langs = locale
export default {
  install
}
export { langs, ConnectionTest, WSClient, FieldMapping, CheckStage }
