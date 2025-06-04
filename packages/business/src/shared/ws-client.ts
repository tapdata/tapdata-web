import { ElMessage as Message } from 'element-plus'
import { merge } from 'lodash-es'
// @ts-ignore
import i18n from '@/i18n'
import { EventEmitter } from './event'

interface WSClientOptions {
  url: string
  protocols?: string | string[]
  retryTimes: number
  retryInterval: number
  query: Record<string, any>
  getQuery?: () => Record<string, any>
}

// Define WebSocket readyState constants
enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

class WSClient extends EventEmitter {
  private options: WSClientOptions
  private ws: WebSocket | null
  private retryCount: number
  private __id?: string
  private msg: { close: () => void; visible?: boolean } | null
  private readyTimer: ReturnType<typeof setTimeout>

  constructor(
    url: string,
    protocols?: string | string[],
    opts: Partial<WSClientOptions> = {},
  ) {
    super()

    const defaultOptions: WSClientOptions = {
      url: undefined as unknown as string,
      protocols: undefined,
      retryTimes: Number.MAX_VALUE,
      retryInterval: 500,
      query: {},
    }
    this.options = merge({}, defaultOptions, opts, {
      url,
      protocols,
      query: {
        id: this.__getId(),
      },
    })
    this.ws = null
    this.retryCount = 0
    this.msg = null
    this.connect()
    this.bindNetworkEvent()
  }

  private __getId(): string {
    let id = this.__id
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(
        /[xy]/g,
        function (c) {
          const r = Math.trunc(Math.random() * 16),
            v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        },
      )
      this.__id = id
    }
    return id
  }

  connect(): void {
    if (this.ws) {
      this.disconnect()
    }
    const opts = this.options

    // 包含获取参数方法
    if (opts.getQuery && typeof opts.getQuery === 'function') {
      Object.assign(opts.query, opts.getQuery() || {})
    }

    try {
      let queryStr = ''
      if (opts.query && Object.keys(opts.query).length > 0) {
        queryStr = Object.keys(opts.query)
          .map((key) => `${key}=${encodeURIComponent(opts.query[key])}`)
          .join('&')
      }

      const idx = opts.url.indexOf('?')
      const url =
        idx > 0
          ? idx + 1 === opts.url.length
            ? opts.url + queryStr
            : `${opts.url}&${queryStr}`
          : `${opts.url}?${queryStr}`
      this.ws = new WebSocket(url, opts.protocols)
      this.retryCount = 0
      this.__bindEvent()
    } catch (error) {
      if (!this.retryCount) {
        // eslint-disable-next-line no-console
        console.log(i18n.t('packages_business_shared_ws_client_webso8'), error)
      }
      this.reconnect()
    }
  }

  reconnect(): void {
    const opts = this.options
    if (this.retryCount < opts.retryTimes) {
      this.retryCount++
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log(
          i18n.t('packages_business_shared_ws_client_webso7') +
            this.retryCount +
            i18n.t('packages_business_shared_ws_client_cizhonglian'),
        )
        this.connect()
      }, opts.retryInterval)
    } else {
      // eslint-disable-next-line no-console
      console.log(
        i18n.t('packages_business_shared_ws_client_webso6') + opts.retryTimes,
      )
      this.retryCount = 0
    }
  }

  disconnect(): void {
    if (this.readyTimer) {
      clearTimeout(this.readyTimer)
      this.readyTimer = null
    }
    const ws = this.ws
    if (
      ws &&
      [ReadyState.CONNECTING, ReadyState.OPEN].includes(
        ws.readyState as ReadyState,
      )
    )
      ws.close()
  }

  private __bindEvent(): void {
    const ws = this.ws
    if (!ws) return

    ws.addEventListener('open', () => {
      // eslint-disable-next-line no-console
      console.log(i18n.t('packages_business_shared_ws_client_webso5'))
      this.emit('open')
    })

    ws.addEventListener('message', (e) => {
      this.__receiveMessage(e)
    })

    ws.addEventListener('error', () => {
      // eslint-disable-next-line no-console
      console.log(i18n.t('packages_business_shared_ws_client_webso4'))
      this.ws = null
      if (this.retryCount === 0) {
        this.reconnect()
      }
    })

    ws.addEventListener('close', () => {
      // eslint-disable-next-line no-console
      console.log(i18n.t('packages_business_shared_ws_client_webso3'))
      this.ws = null
      if (this.retryCount === 0) {
        this.reconnect()
      }
    })
  }

  private __receiveMessage(event: MessageEvent): void {
    const msg = event.data
    let message: any = {}
    try {
      if (msg === 'UserId is blank') {
        // access_token 过期
        console.debug(i18n.t('packages_business_shared_ws_client_acces'), event) // eslint-disable-line no-console
        this.emit('401')
        this.connect()
      } else if (typeof msg === 'string' && /^"?\{.*\}"?$/.test(msg)) {
        message = JSON.parse(msg)
        if (message.type === 'pipe') {
          const data = message.data || {}
          const eventName = message.data?.type
          if (eventName) {
            this.emit(eventName, data)
          } else {
            this.emit(message.type, message)
          }
        } else if (message.code === 'fail') {
          console.debug('fail', message) // eslint-disable-line no-console
          if (message.message === 'UserId is blank') {
            console.debug(
              i18n.t('packages_business_shared_ws_client_acces'),
              event,
            )
            this.emit('401')
            this.connect()
          }
        } else {
          this.emit(message.type, message)
        }
      } else {
        throw new Error(
          i18n.t('packages_business_shared_ws_client_webso2') + msg,
        )
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(
        i18n.t('packages_business_shared_ws_client_webso') + msg,
        error,
      )
    }
  }

  send(msg: string | object): void {
    const messageStr = typeof msg === 'string' ? msg : JSON.stringify(msg)
    this.ready(() => {
      this.ws?.send(messageStr)
    })
  }

  ready(cb: () => void): void {
    if (this.ws && this.ws.readyState === ReadyState.OPEN) {
      cb && cb()
    } else {
      // 清除之前的定时器
      if (this.readyTimer) {
        clearTimeout(this.readyTimer)
      }
      this.readyTimer = setTimeout(() => {
        this.readyTimer = null
        this.ready(cb)
      }, 500)
    }
  }

  bindNetworkEvent(): void {
    window.addEventListener('online', this.onLine.bind(this))
    window.addEventListener('offline', this.offLine.bind(this))
  }

  onLine(): void {
    this.send('ping') // 网络恢复立即发送ping
    if (this.msg) {
      this.msg.close()
      this.msg = null
      Message.success({
        message: i18n.t('public_message_network_connected'),
        duration: 3000,
      })
    }
  }

  offLine(): void {
    this.msg = Message.error({
      duration: 0,
      showClose: true,
      message: i18n.t('public_message_network_unconnected'),
    })
  }
}

export { WSClient }
