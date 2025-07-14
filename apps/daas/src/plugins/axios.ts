import { requestClient } from '@tap/api'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import { Modal } from '@tap/component/src/modal'
import {
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
} from '@tap/request'
import Cookie from '@tap/shared/src/cookie'
import { getSettingByKey } from '@tap/shared/src/settings'
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import Qs from 'qs'
import i18n from '@/i18n'
import { signOut } from '../utils/util'

type AxiosRequestConfigPro = AxiosRequestConfig & {
  silenceMessage?: boolean
}

// Pending requests map for cancellation
const pendingRequests = new Map<string, AbortController>()

// Function to generate request key
const generateRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method}:${config.url}`
}

// Function to remove pending request
const removePending = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey)
    controller?.abort()
    pendingRequests.delete(requestKey)
  }
}

axios.defaults.baseURL = import.meta.env.BASE_URL || './'

const errorCallback = (error: any): Promise<any> => {
  if (axios.isCancel(error)) {
    // eslint-disable-next-line no-console
    console.log('Request canceled', error.message)
    return Promise.reject(error)
  }
  if (error?.config || error?.response?.config) {
    removePending(
      (error.config || error.response?.config) as AxiosRequestConfig,
    )
  }
  const rsp = error.response
  if (rsp) {
    if (rsp.data && rsp.data.state === 'EXCEPTION') {
      return Promise.reject(error)
    }
    switch (rsp.status) {
      // 用户无权限访问接口
      case 401: {
        const isSingleSession = getSettingByKey('login.single.session', 'open')

        signOut()

        setTimeout(() => {
          if (isSingleSession) {
            Modal.warning(
              i18n.global.t('public_alert_401'),
              i18n.global.t('public_alert_401_tip'),
            )
          } else {
            ElMessage.error({
              message: i18n.global.t('public_message_401'),
              grouping: true,
            })
          }
        }, 500)
        break
      }
      // 请求的资源不存在
      case 404:
        ElMessage.error({ message: i18n.global.t('public_message_404') })
        break
      case 504:
        ElMessage.error({
          message: i18n.global.t('public_message_5xx'),
          grouping: true,
        })
        break
      case 500:
        ElMessage.error({
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
    ElMessage.error({
      message: i18n.global.t('public_message_network_unconnected'),
      grouping: true,
    })
  } else if (error.message && error.message.includes('timeout')) {
    ElMessage.error({
      message: i18n.global.t('public_message_request_timeout'),
      grouping: true,
    })
  }
  return Promise.reject(error)
}

axios.interceptors.request.use(function (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  config.paramsSerializer = (params) => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      encoder: (str) => window.encodeURIComponent(str),
    })
  }
  const accessToken = Cookie.get('access_token')
  if (accessToken && config.url) {
    if (~config.url.indexOf('?')) {
      if (!~config.url.indexOf('access_token')) {
        config.url = `${config.url}&access_token=${accessToken}`
      }
    } else {
      config.url = `${config.url}?access_token=${accessToken}`
    }
  }
  if (config.headers) {
    config.headers['x-requested-with'] = 'XMLHttpRequest'
  }

  return config
}, errorCallback)

axios.interceptors.response.use((response: AxiosResponse) => {
  return new Promise((resolve, reject) => {
    removePending(response.config as AxiosRequestConfig)
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

export function initRequestClient() {
  requestClient.setBaseURL(import.meta.env.BASE_URL || './')

  requestClient.addRequestInterceptor({
    fulfilled: (config) => {
      const accessToken = Cookie.get('access_token')
      if (accessToken) {
        if (config.url?.indexOf?.('?') !== -1) {
          if (config.url?.indexOf?.('access_token') === -1) {
            config.url = `${config.url}&access_token=${accessToken}`
          }
        } else {
          config.url = `${config.url}?access_token=${accessToken}`
        }
      }
      return config
    },
  })

  requestClient.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 'ok',
    }),
  )

  requestClient.addResponseInterceptor(
    errorMessageResponseInterceptor(
      (msg: string, error) => {
        // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
        const responseData = error?.response?.data ?? {}
        const errorMessage = responseData?.message ?? responseData?.msg

        if (errorMessage) {
          showErrorMessage(error.response.data)
          return
        }

        ElMessage.error({
          message: msg || i18n.global.t('public_message_inner_error'),
          grouping: true,
        })
      },
      {
        401: () => {
          const isSingleSession = getSettingByKey(
            'login.single.session',
            'open',
          )

          signOut()

          setTimeout(() => {
            if (isSingleSession) {
              Modal.warning(
                i18n.global.t('public_alert_401'),
                i18n.global.t('public_alert_401_tip'),
              )
            }
          }, 500)

          return i18n.global.t('public_message_401')
        },
      },
    ),
  )

  return requestClient
}
