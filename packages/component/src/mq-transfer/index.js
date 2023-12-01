import MqTransfer from './MqTransfer'

MqTransfer.install = function (Vue) {
  window.$vueApp.component(MqTransfer.name, MqTransfer)
}

export default MqTransfer
