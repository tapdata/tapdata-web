import locale from './locale'
import FormBuilder from './components/form-builder'
import ConnectionTypeSelector from './components/connection-type-selector'
//import ConnectionFormSelector from './components/connection-form'
import ConnectionTest from './components/connection-test'
import JsEditor from './components/js-editor.vue'

import WSClient from './plugins/ws-client'
import * as _util from './util'
import * as _const from './const'

const components = [ConnectionTypeSelector, ConnectionTest, JsEditor]

const install = function(Vue) {
  Vue.prototype.$util = _util
  Vue.prototype.$const = _const

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
export {
  langs,
  ConnectionTypeSelector,
  //ConnectionFormSelector,
  ConnectionTest,
  JsEditor,
  WSClient
}
