const portPool = []

onconnect = function (e) {
  let port = e.ports[0]
  portPool.push(port)
  port.onmessage = event => {
    console.log('onmessage', e) // eslint-disable-line
    const { data, type } = event.data

    switch (type) {
      case 'websocket':
        console.log('websocket发送消息', data) // eslint-disable-line
        ws.send(data)
        break
      case 'websocket:connect':
        ws.connect(data)
        break
      case 'websocket:refresh':
        ws.refresh(data)
        break
      case 'websocket:close':
        ws.disconnect()
        break
      case 'worker:close':
        const index = portPool.findIndex(p => p === port)
        portPool.splice(index, 1)
        break
    }
  }
}

const sendMessage = (...args) => {
  portPool.forEach(port => port.postMessage(...args))
}

class WSClient {
  constructor(options = {}) {
    const defaultOptions = {
      url: undefined,
      protocols: undefined, // 不能为null
      retryTimes: Number.MAX_VALUE, // 无限次尝试重连
      retryInterval: 500, // 断开立即重连
      query: {}
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.ws = null
    this.retryCount = 0
  }

  connect(options) {
    this.wsOptions = options

    if (this.ws && this.ws.readyState == 1) {
      return
    }

    try {
      this.ws = new WebSocket(options.url, options.protocols)
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

  refresh(options) {
    if (options.url !== this.wsOptions.url) {
      this.disconnect()
      this.connect(options)
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
      sendMessage('open')
    }
    ws.onmessage = e => {
      console.log('websocket广播消息', e.data) // eslint-disable-line
      sendMessage(e.data)
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
}

ws = new WSClient()
