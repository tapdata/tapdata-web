import VirtualTransfer from './VirtualTransfer'

VirtualTransfer.install = function (Vue) {
  window.$vueApp.component(VirtualTransfer.name, VirtualTransfer)
}

export default VirtualTransfer
