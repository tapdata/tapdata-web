import { createWorker, createWorkerFunc, closeWorker } from './util'

let APP_ETAG_KEY = '__APP_ETAG__'
let myWorker
const defaultOptions = {
  appETagKey: APP_ETAG_KEY,
  pollingInterval: 5 * 60 * 1000, // 默认单位为毫秒
  immediate: true,
  htmlFileUrl: `${location.origin}${location.pathname}`,
  silent: false,
}

/**
 * 页面隐藏时停止轮询任务，页面再度可见时在继续
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    myWorker.postMessage({
      code: 'pause',
    })
  } else {
    myWorker.postMessage({
      code: 'resume',
    })
  }
}

export class VersionPolling {
  appEtag = ''

  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options)

    this.init()
  }

  async init() {
    const { htmlFileUrl } = this.options

    const response = await fetch(htmlFileUrl, {
      method: 'HEAD',
      cache: 'no-cache',
    })

    const etag = response.headers.get('etag')
    this.appEtag = etag
    localStorage.setItem(`${this.options.appETagKey}`, etag)

    this.start()
  }

  start() {
    const { appETagKey, pollingInterval, immediate, htmlFileUrl, silent } = this.options

    // 安静模式
    if (silent) {
      return
    }

    console.log('createWorkerFunc', createWorkerFunc)

    myWorker = createWorker(createWorkerFunc)

    myWorker.postMessage({
      code: 'start',
      data: {
        appETagKey,
        htmlFileUrl,
        pollingInterval,
        immediate,
        lastEtag: localStorage.getItem(`${appETagKey}`),
      },
    })

    myWorker.onmessage = (event) => {
      const { lastEtag, etag } = event.data
      this.appEtag = etag

      if (lastEtag !== etag) {
        this.stop()
        this.options.onUpdate?.(this)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  stop() {
    if (myWorker) {
      closeWorker(myWorker)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  onRefresh() {
    localStorage.setItem(`${this.options.appETagKey}`, this.appEtag)
    window.location.reload()
  }

  onCancel() {
    localStorage.removeItem(`${this.options.appETagKey}`)
  }
}

export function createVersionPolling(options) {
  const versionPolling = new VersionPolling(options)

  return versionPolling
}
