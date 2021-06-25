/* eslint-disable */
import ConnectionTypeSelector from './components/connection-type-selector'
import FormBuilder from './components/form-builder'

import WSClient from './plugins/ws-client'

const components = [ConnectionTypeSelector]

const install = function (Vue, opts = {}) {
  Vue.use(FormBuilder)

  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  ConnectionTypeSelector,
  WSClient
}
