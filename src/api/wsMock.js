import EventEmitter from '../editor/lib/EventEmitter'
// const Mock = require('mockjs')

export default class WSMock extends EventEmitter {
  constructor() {
    super()
  }
  // 连接
  connect() {
    console.log('连接', this, arguments)
  }

  // 发送
  send() {
    console.log('发送', this, arguments)
  }

  // 准备
  ready() {}

  // 获取agentId
  getAgentId() {}

  // 发送管道
  sendPipe() {}
}
