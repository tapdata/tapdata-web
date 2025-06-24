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
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { ElMessage as Message } from 'element-plus'
import Qs from 'qs'
import i18n from '@/i18n'
import { signOut } from '../utils/util'

type AxiosRequestConfigPro = AxiosRequestConfig & {
  silenceMessage?: boolean
}

axios.defaults.baseURL = import.meta.env.BASE_URL || './'

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
        const isSingleSession = getSettingByKey('login.single.session', 'open')

        signOut()

        setTimeout(() => {
          if (isSingleSession) {
            Modal.warning(
              i18n.global.t('public_alert_401'),
              i18n.global.t('public_alert_401_tip'),
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

  requestClient.addResponseInterceptor({
    rejected: (error: any) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      }

      const err: string = error?.toString?.() ?? ''
      let errMsg = ''

      if (err?.includes('Network Error')) {
        errMsg = i18n.global.t('public_message_network_unconnected')
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = i18n.global.t('public_message_request_timeout')
      }

      if (errMsg) {
        ElMessage.error(errMsg)
        return Promise.reject(error)
      }

      let errorMessage = ''
      const status = error?.response?.status

      switch (status) {
        case 400: {
          errorMessage = i18n.global.t('public_message_400')
          break
        }
        case 401: {
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
            } else {
              Message.error({
                message: i18n.global.t('public_message_401'),
                grouping: true,
              })
            }
          }, 500)
          errorMessage = i18n.global.t('public_message_401')
          break
        }
        case 403: {
          errorMessage = i18n.global.t('public_message_403')
          break
        }
        case 404: {
          errorMessage = i18n.global.t('public_message_404')
          break
        }
        case 408: {
          errorMessage = i18n.global.t('public_message_408')
          break
        }
        default: {
          errorMessage = i18n.global.t('public_message_inner_error')
          break
        }
      }

      const responseData = error?.response?.data ?? {}
      const message = responseData?.error ?? responseData?.message ?? ''
      // 如果没有错误信息，则会根据状态码进行提示
      ElMessage.error(message || errorMessage)
      return Promise.reject(error)
    },
  })

  return requestClient
}
