import VirtualSelect from './VirtualSelect'

VirtualSelect.install = function (Vue) {
  window.$vueApp.component(VirtualSelect.name, VirtualSelect)
}

export default VirtualSelect
