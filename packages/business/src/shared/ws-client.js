import { ElMessage as Message } from 'element-plus'
import { merge } from 'lodash'
import EventEmitter from './event'
import i18n from '@/i18n'

class WSClient extends EventEmitter {
  constructor(url, protocols, opts = {}) {
    super()

    const defaultOptions = {
      url: undefined,
      protocols: undefined, // 不能为null
      retryTimes: Number.MAX_VALUE, // 无限次尝试重连
      retryInterval: 500, // 断开立即重连
      query: {}
    }
    this.options = merge({}, defaultOptions, opts, {
      url,
      protocols,
      query: {
        id: this.__getId()
      }
    })
    this.ws = null
    this.retryCount = 0
    this.connect()
    this.bindNetworkEvent()
  }

  __getId() {
    let id = this.__id
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
      this.__id = id
    }
    return id
  }

  connect() {
    if (this.ws) {
      this.disconnect()
    }
    let opts = this.options

    // 包含获取参数方法
    if (opts.getQuery && typeof opts.getQuery === 'function') {
      Object.assign(opts.query, opts.getQuery() || {})
    }

    try {
      let queryStr = ''
      if (opts.query && Object.keys(opts.query).length > 0) {
        queryStr = Object.keys(opts.query)
          .map(key => key + '=' + encodeURIComponent(opts.query[key]))
          .join('&')
      }

      let idx = opts.url.indexOf('?')
      let url =
        idx > 0
          ? idx + 1 === opts.url.length
            ? opts.url + queryStr
            : opts.url + '&' + queryStr
          : opts.url + '?' + queryStr
      this.ws = new WebSocket(url, opts.protocols)
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
      console.log('websocket 超过最大重连次数 ' + this.retryTimes)
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
