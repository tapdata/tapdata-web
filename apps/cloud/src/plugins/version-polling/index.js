import { CloseIcon } from '@tap/component'
import { ElButton, ElImage, ElNotification as Notification } from 'element-plus'
import { h } from 'vue'
import rocketImg from '@/assets/image/version-rocket.svg'
import i18n from '@/i18n'
import { closeWorker, createWorker, createWorkerFunc } from './util'

const APP_ETAG_KEY = '__APP_ETAG__'
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

    const etag = response.headers.get('etag').replace(/^W\//i, '')
    this.appEtag = etag
    localStorage.setItem(String(this.options.appETagKey), etag)

    this.start()
  }

  start() {
    const { appETagKey, pollingInterval, immediate, htmlFileUrl, silent } =
      this.options

    // 安静模式
    if (silent) {
      return
    }

    myWorker = createWorker(createWorkerFunc)

    myWorker.postMessage({
      code: 'start',
      data: {
        appETagKey,
        htmlFileUrl,
        pollingInterval,
        immediate,
        lastEtag: localStorage.getItem(String(appETagKey)),
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
    localStorage.setItem(String(this.options.appETagKey), this.appEtag)
    window.location.reload()
  }

  onCancel() {
    localStorage.removeItem(String(this.options.appETagKey))
  }
}

export function createVersionPolling(options) {
  const versionPolling = new VersionPolling(options)

  return versionPolling
}

export function startVersionPolling() {
  // 版本升级检测
  createVersionPolling({
    appETagKey: '__APP_ETAG__',
    pollingInterval: 5 * 1000, // 单位为毫秒
    silent: import.meta.env.DEV, // 开发环境下不检测
    onUpdate: (self) => {
      Notification({
        closeIcon: CloseIcon,
        customClass: 'version-upgrade-notification',
        title: '',
        message: h(
          'div',
          {
            class: 'flex align-items-start gap-2 ml-n3 mr-n2',
          },
          [
            h(ElImage, {
              class: 'flex-shrink-0',
              src: rocketImg,
            }),
            h(
              'div',
              {
                class: 'flex flex-column align-items-start gap-2 text-start',
              },
              [
                h(
                  'span',
                  { class: 'text-primary fs-6 fw-sub' },
                  i18n.t('dfs_system_update'),
                ),
                h('span', { class: '' }, i18n.t('dfs_system_description')),
                h(
                  ElButton,
                  {
                    class: 'ml-auto',
                    type: 'primary',
                    size: 'small',
                    onClick: () => self.onRefresh(),
                  },
                  i18n.t('public_button_refresh'),
                ),
              ],
            ),
          ],
        ),
        duration: 0,
        position: 'bottom-right',
      })
    },
  })
}
