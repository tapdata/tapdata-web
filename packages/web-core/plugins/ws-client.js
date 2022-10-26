/**
 * websocket 封装类
 */
import { Message } from 'element-ui'
import EventEmitter from './event'
import i18n from '@/i18n'

class WSClient extends EventEmitter {
  constructor(url, protocols, opts = {}) {
    super()

    const defaultOptions = {
      url: null,
      protocols: null,
      retryTimes: 5,
      retryInterval: 5000
    }
    this.options = Object.assign({}, defaultOptions, opts, {
      url,
      protocols
    })
    this.ws = null
    this.retryCount = 0
    this.connect()
    this.bindNetworkEvent()
  }
  connect() {
    if (this.ws) {
      this.disconnect()
    }
    let opts = this.options
    try {
      this.ws = new WebSocket(opts.url, opts.protocols)
      this.retryCount = 0
      this.__bindEvent()
    } catch (e) {
      if (!this.retryCount) {
        // eslint-disable-next-line
        console.log('websocket 连接失败，准备尝试重连', e)
      }
      this.reconnect()
    }
  }

  reconnect() {
    let opts = this.options
    if (this.retryCount < opts.retryTimes) {
      this.retryCount++
      setTimeout(() => {
        // eslint-disable-next-line
        console.log('websocket 尝试第' + this.retryCount + '次重连')
        this.connect()
      }, opts.retryInterval)
    } else {
      // eslint-disable-next-line
      console.log('websocket 重连失败！')
      this.retryCount = 0
    }
  }

  disconnect() {
    let ws = this.ws
    if (ws) {
      if ([WebSocket.CONNECTING, WebSocket.OPEN].includes(ws.readyState)) ws.close()
    }
  }

  __bindEvent() {
    let ws = this.ws
    ws.onopen = () => {
      // eslint-disable-next-line
      console.log('websocket 已连接')
      this.emit('open')
    }
    ws.onmessage = e => {
      this.__receiveMessage(e)
    }
    ws.onerror = () => {
      // eslint-disable-next-line
      console.log('websocket 断开连接')
      this.ws = null
      if (this.retryCount === 0) {
        this.reconnect()
      }
    }
    ws.onclose = () => {
      // eslint-disable-next-line
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
      // eslint-disable-next-line
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
    if (this.ws?.readyState == 1) {
      cb && cb()
    } else {
      setTimeout(() => {
        this.ready(cb)
      }, 500)
    }
  }

  bindNetworkEvent() {
    window.addEventListener('online', this.onLine.bind(this))
    window.addEventListener('offline', this.offLine.bind(this))
  }

  onLine() {
    this.send('ping') // 网络恢复立即发送ping
    if (this.msg?.visible) {
      Object.assign(this.msg, {
        message: i18n.t('message_network_connected'),
        type: 'success',
        duration: 3000
      })
      this.msg.startTimer()
      this.msg = null
    }
  }

  offLine() {
    this.msg = Message.error({
      duration: 0,
      showClose: true,
      message: i18n.t('message_network_unconnected')
    })
  }
}

export default WSClient
