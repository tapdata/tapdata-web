import EventEmitter from './EventEmitter'

class WSClient extends EventEmitter {
  constructor(opts = {}) {
    super()

    const defaultOptions = {
      url: null,
      protocols: null,
      retryTimes: 5,
      retryInterval: 5000
    }
    this.options = Object.assign({}, defaultOptions, opts)
    this.ws = null
    this.retryCount = 0
  }
  connect() {
    if (this.ws) {
      this.disconnect()
    }
    try {
      this.ws = new WebSocket(this.url, this.protocols)
      this.retryCount = 0
      this.__bindEvent()
    } catch (e) {
      this.reconnect()
      return
    }
  }

  reconnect() {
    let opts = this.options
    if (this.retryCount < opts.retryTimes) {
      this.retryCount++
      setTimeout(() => {
        this.connect()
      }, opts.retryInterval)
    } else {
      console.log('websocket 重连失败！')
      this.retryCount = 0
    }
  }

  disconnect() {
    let ws = this.ws
    if (ws) {
      if ([WebSocket.CONNECTING, WebSocket.OPEN].includes(this.ws.readyState))
        this.ws.close(1, null)
    }
  }

  __bindEvent() {
    let ws = this.ws
    ws.onopen = () => {
      console.log('websocket 已连接')
      this.emit('open')
    }
    ws.onmessage = e => {
      this.__receiveMessage(e)
    }
    ws.onerror = () => {
      console.log('websocket 断开连接')
      this.ws = null
      if (this.retryCount === 0) {
        this.reconnect()
      }
    }
    ws.onclose = () => {
      console.log('websocket 已关闭')
      this.ws = null
      if (this.retryCount === 0) {
        this.reconnect()
      }
    }
  }

  __receiveMessage(event) {
    let msg = event.data
    let message = {}
    try {
      if (typeof msg === 'string' && /^"?\{.*\}"?$/.test(msg)) {
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
      console.log('websocket 消息解析失败: ' + msg, e)
    }
  }

  send(msg) {
    msg = typeof msg === 'string' ? msg : JSON.stringify(msg)
    this.ready(() => {
      this.ws.send(msg)
    })
  }

  ready(cb) {
    if (this.ws.readyState == 1) {
      cb && cb()
    } else {
      setTimeout(() => {
        this.ready(cb)
      }, 500)
    }
  }
}

export default WSClient
