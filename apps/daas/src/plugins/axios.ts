import { showErrorMessage } from '@tap/business/src/components/error-message'
import Cookie from '@tap/shared/src/cookie'
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { ElMessageBox, ElMessage as Message } from 'element-plus'
import Qs from 'qs'
import i18n from '@/i18n'
import { signOut } from '../utils/util'

type AxiosRequestConfigPro = AxiosRequestConfig & {
  silenceMessage?: boolean
}

const pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识

const CancelToken = axios.CancelToken

axios.defaults.baseURL = import.meta.env.BASE_URL || './'

const getPendingKey = (config: AxiosRequestConfig): string => {
  const { url, method, data, params } = config
  const headers = {}
  // headers 这里，有时候服务端响应的时候会多一些头，造成响应头跟请求头不一致，无法remove，后续的请求都会被cancel
  /*for (const key in config.headers) {
    const value = config.headers[key]
    if (Object.prototype.toString.call(value) === '[object String]' && !['Content-Type', 'Accept'].includes(key)) {
      headers[key] = value
    }
  }*/
  config.data =
    Object.prototype.toString.call(data) === '[object String]'
      ? JSON.parse(data)
      : data
  const key = JSON.stringify({
    url,
    method,
    data: config.data,
    params,
    headers,
  })
  return key
}
const removePending = (config: AxiosRequestConfig): void => {
  const key = getPendingKey(config)
  const index = pending.indexOf(key)
  if (index !== -1) {
    pending.splice(index, 1)
  }
}
const errorCallback = (error: AxiosError): Promise<AxiosError | string> => {
  if (axios.isCancel(error)) {
    // eslint-disable-next-line no-console
    console.log('Request canceled', error.message)
    return Promise.reject(error)
  }
  if (error?.config || error?.response?.config) {
    removePending(error.config || error.response.config)
  }
  const rsp = error.response
  if (rsp) {
    if (rsp.data && rsp.data.state === 'EXCEPTION') {
      return Promise.reject(error)
    }
    switch (rsp.status) {
      // 用户无权限访问接口
      case 401: {
        const isSingleSession = window.__settings__?.find(
          (item) => item.key === 'login.single.session',
        )?.open

        signOut()

        setTimeout(() => {
          if (isSingleSession) {
            ElMessageBox.confirm(
              i18n.global.t('public_alert_401_tip'),
              i18n.global.t('public_alert_401'),
              {
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: i18n.global.t('public_button_confirm'),
              },
            )
          } else {
            Message.error({
              message: i18n.global.t('public_message_401'),
              grouping: true,
            })
          }
        }, 500)
        break
      }
      // 请求的资源不存在
      case 404:
        Message.error({ message: i18n.global.t('public_message_404') })
        break
      case 504:
        Message.error({
          message: i18n.global.t('public_message_5xx'),
          grouping: true,
        })
        break
      case 500:
        Message.error({
          message: i18n.global.t('public_message_5xx'),
          grouping: true,
        })
        break
    }
  } else if (
    error.code ===
    'ECONNABORTED' /* || error.message === 'Network Error' || !window.navigator.onLine*/
  ) {
    // 这两种情况已在ws-client.js里监听 👉 error.message === 'Network Error' || !window.navigator.onLine
    Message.error({
      message: i18n.global.t('public_message_network_unconnected'),
      grouping: true,
    })
  } else if (error.message && error.message.includes('timeout')) {
    Message.error({
      message: i18n.global.t('public_message_request_timeout'),
      grouping: true,
    })
  }
  return Promise.reject(error)
}
axios.interceptors.request.use(function (
  config: AxiosRequestConfig,
): AxiosRequestConfig {
  config.paramsSerializer = (params) => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      encoder: (str) => window.encodeURIComponent(str),
    })
  }
  const accessToken = Cookie.get('access_token')
  if (accessToken) {
    if (~config.url.indexOf('?')) {
      if (!~config.url.indexOf('access_token')) {
        config.url = `${config.url}&access_token=${accessToken}`
      }
    } else {
      config.url = `${config.url}?access_token=${accessToken}`
    }
  }
  config.headers['x-requested-with'] = 'XMLHttpRequest'

  // 业务内设置了cancel
  if (config.cancelToken) return config

  const key = getPendingKey(config)
  let cancelFunc = null
  config.cancelToken = new CancelToken((c) => {
    cancelFunc = c
  })
  if (pending.includes(key)) {
    console.warn('Cancel request:', JSON.parse(key))
    cancelFunc()
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}, errorCallback)

axios.interceptors.response.use((response: AxiosResponse) => {
  return new Promise((resolve, reject) => {
    removePending(response.config)
    const code = response.data.code

    if (response?.config?.responseType === 'blob') {
      return resolve(response)
    }

    if (code === 'ok') {
      return resolve(response.data.data)
    }

    if ((response.config as AxiosRequestConfigPro).silenceMessage) {
      return reject(response)
    }

    showErrorMessage(response.data)
    return reject(response)
  })
}, errorCallback)

export default axios
