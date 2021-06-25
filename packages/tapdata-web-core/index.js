/* eslint-disable */
import ConnectionTypeSelector from './component/ConnectionTypeSelector'
import FormBuilder from './component/FormBuilder'

import WSClient from './lib/WSClient'

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
