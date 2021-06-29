/* eslint-disable */
import { t, use } from './locale'
import FormBuilder from './components/form-builder'
import ConnectionTypeSelector from './components/connection-type-selector'
import ConnectionTest from './components/ConnectionTest'

import WSClient from './plugins/ws-client'

const components = [ConnectionTypeSelector, ConnectionTest]

const install = function(Vue, opts = {}) {
  use(opts.lang)
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
    },
    methods: {
      t(...args) {
        return t.apply(this, args)
      }
    }
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  locale: use,
  ConnectionTypeSelector,
  ConnectionTest,
  WSClient
}
console.log(111)
