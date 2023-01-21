import EventEmitter from './event-emitter'

class WebSocketMessage {
  type = 'websocket'
  constructor(data) {
    this.data = data
  }
}

class WorkerClientMessage {
  type = 'worker'
  constructor(data) {
    this.data = data
  }
}

class WorkerClient extends EventEmitter {
  constructor(url) {
    super()
    this.init(url)
  }

  init(url) {
    let worker = new SharedWorker(url, 'tapdata-worker')
    worker.port.onmessage = event => {
      console.debug('收到websocket消息', event.data) // eslint-disable-line
      this.__receiveMessage(event)
    }
    worker.port.start()
    worker.port.postMessage(new WorkerClientMessage('open'))
    this.worker = worker
  }

  send(msg) {
    msg = typeof msg === 'string' ? msg : JSON.stringify(msg)
    this.worker.port.postMessage(new WebSocketMessage(msg))
  }

  __receiveMessage(event) {
    let msg = event.data
    let message = {}
    try {
      if (msg === 'UserId is blank') {
        // access_token 过期
        console.debug('access_token 过期', event) // eslint-disable-line
        this.emit('401')
        this.connect()
      } else if (typeof msg === 'string' && /^"?\{.*\}"?$/.test(msg)) {
        message = JSON.parse(msg)
        if (message.type === 'pipe') {
          let data = message.data || {}
          let eventName = message.data.type
          if (eventName) {
            this.emit(eventName, data)
          } else {
            this.emit(message.type, message)
          }
        } else {
          this.emit(message.type, message)
        }
      } else {
        throw new Error('websocket 接收消息格式错误: ' + msg)
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log('websocket 消息解析失败: ' + msg, e)
    }
  }
}

export default WorkerClient
