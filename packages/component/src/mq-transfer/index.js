import MqTransfer from './MqTransfer'

MqTransfer.install = function (app) {
  app.component(MqTransfer.name, MqTransfer)
}

export default MqTransfer
