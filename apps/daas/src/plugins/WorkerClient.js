import { Message } from 'element-ui'
import { merge } from 'lodash'
import i18n from '@/i18n'
import EventEmitter from './event-emitter'

class WorkerClient extends EventEmitter {
  constructor(url, wsOptions) {
    super()
    const _wsOptions = {
      url: undefined,
      protocols: undefined, // 不能为null
      retryTimes: Number.MAX_VALUE, // 无限次尝试重连
      retryInterval: 500, // 断开立即重连
      query: {
        id: this.getId()
      }
    }
    this.wsOptions = merge({}, _wsOptions, wsOptions)
    this.init(url)
    this.bindNetworkEvent()
  }

  init(url) {
    let worker = new SharedWorker(url, 'tapdata-worker')
    worker.port.onmessage = event => {
      console.debug('收到websocket消息', event.data) // eslint-disable-line
      this.receiveMessage(event)
    }
    worker.port.start()
    this.worker = worker
    this.connect()
  }

  connect() {
    this.worker.port.postMessage({
      type: 'websocket:connect',
      data: {
        ...this.wsOptions,
        getQuery: undefined,
        url: this.getURL()
      }
    })
  }

  refresh() {
    this.worker.port.postMessage({
      type: 'websocket:refresh',
      data: {
        ...this.wsOptions,
        getQuery: undefined,
        url: this.getURL()
      }
    })
  }

  close() {
    this.worker.port.postMessage({
      type: 'websocket:close'
    })
  }

  getURL() {
    const { wsOptions } = this
    let query = {}
    if (wsOptions.getQuery && typeof wsOptions.getQuery === 'function') {
      Object.assign(query, wsOptions.query, wsOptions.getQuery() || {})
    }
    const url = new URL(wsOptions.url)
    Object.keys(query).forEach(key => {
      url.searchParams.append(key, query[key])
    })
    return url.toString()
  }

  send(msg) {
    msg = typeof msg === 'string' ? msg : JSON.stringify(msg)
    this.worker.port.postMessage({
      type: 'websocket',
      data: msg
    })
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

  getId() {
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

  receiveMessage(event) {
    let msg = event.data
    let message = {}
    try {
      if (msg === 'UserId is blank') {
        console.debug('access_token 过期', event) // eslint-disable-line
        this.emit('401')
        this.refresh()
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
