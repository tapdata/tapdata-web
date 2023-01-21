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
      case 'worker':
        switch (data) {
          case 'close-port':
            const index = portPool.findIndex(p => p === port)
            portPool.splice(index, 1)
            break
          case 'open':
            ws.connect()
            break
          case 'close':
            ws.disconnect()
            break
        }
        break
    }
  }
}

const sendMessage = (...args) => {
  portPool.forEach(port => port.postMessage(...args))
}

class WSClient {
  constructor(url, protocols, options = {}) {
    const defaultOptions = {
      url: undefined,
      protocols: undefined, // 不能为null
      retryTimes: Number.MAX_VALUE, // 无限次尝试重连
      retryInterval: 500, // 断开立即重连
      query: {}
    }
    this.options = Object.assign({}, defaultOptions, options)
    /*this.options = merge({}, defaultOptions, options, {
      url,
      protocols,
      query: {
        id: this.__getId()
      }
    })*/
    this.ws = null
    this.retryCount = 0
    // this.connect()
    // this.bindNetworkEvent()
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
    if (this.ws && this.ws.readyState == 1) {
      return
    }
    let opts = this.options

    // 包含获取参数方法
    if (opts.getQuery && typeof opts.getQuery === 'function') {
      Object.assign(opts.query, opts.getQuery() || {})
    }

    try {
      let url =
        'ws://localhost:8080/ws/agent?id=e86fc151-2a71-42f1-80c1-2ef515a8ce79&access_token=c4521457d02640628d98cd767968f99f415081d6a3964c7199b8aad535e8d1ce'
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
