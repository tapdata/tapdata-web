import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import Cookie from '@tap/shared/src/cookie'
import { signOut } from '../utils/util'
import { Message } from 'element-ui'
import i18n from '@/i18n'
import Qs from 'qs'

let pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识

const CancelToken = axios.CancelToken

axios.defaults.baseURL = process.env.BASE_URL || './'

const getPendingKey = (config: AxiosRequestConfig): string => {
  let { url, method, data, params } = config
  let headers = {}
  for (const key in config.headers) {
    let value = config.headers[key]
    if (Object.prototype.toString.call(value) === '[object String]' && !['Content-Type', 'Accept'].includes(key)) {
      headers[key] = value
    }
  }
  data = Object.prototype.toString.call(data) === '[object String]' ? JSON.parse(data) : data
  let key = JSON.stringify({
    url,
    method,
    data,
    params,
    headers
  })
  return key
}
const removePending = (config: AxiosRequestConfig): void => {
  let key = getPendingKey(config)
  let index = pending.findIndex(it => it === key)
  if (index >= 0) {
    pending.splice(index, 1)
  }
}
const errorCallback = (error: AxiosError): Promise<AxiosError | string> => {
  if (axios.isCancel(error)) {
    // eslint-disable-next-line no-console
    console.log('Request canceled', error.message)
    return Promise.reject('Request canceled')
  }
  if (error?.config || error?.response?.config) {
    removePending(error.config || error.response.config)
  }
  let rsp = error.response
  if (rsp) {
    if (rsp.data && rsp.data.state === 'EXCEPTION') {
      return Promise.reject(error)
    }
    switch (rsp.status) {
      // 用户无权限访问接口
      case 401:
        signOut()
        setTimeout(() => {
          Message.error({ message: i18n.t('message_401').toString() })
        }, 500)
        break
      // 请求的资源不存在
      case 404:
        Message.error({ message: i18n.t('message_404').toString() })
        break
      case 504:
        Message.error({ message: i18n.t('message_5xx').toString() })
        break
      case 500:
        Message.error({ message: i18n.t('message_5xx').toString() })
        break
    }
  } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !window.navigator.onLine) {
    Message.error({
      message: i18n.t('message_network_unconnected').toString()
    })
  } else if (error.message && error.message.includes('timeout')) {
    Message.error({
      message: i18n.t('message_request_timeout').toString()
    })
  }
  return Promise.reject(error)
}
axios.interceptors.request.use(function (config: AxiosRequestConfig): AxiosRequestConfig {
  config.paramsSerializer = params => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      encoder: str => window.encodeURIComponent(str)
    })
  }
  let accessToken = Cookie.get('token')
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

  let key = getPendingKey(config)
  let cancelFunc = null
  config.cancelToken = new CancelToken(c => {
    cancelFunc = c
  })
  if (pending.includes(key)) {
    console.log('Cancel request:', JSON.parse(key)) //eslint-disable-line
    cancelFunc()
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}, errorCallback)

axios.interceptors.response.use((response: AxiosResponse): any => {
  removePending(response.config)
  let data = response.data
  if (response?.config?.responseType === 'blob') {
    return {
      data: data?.data ?? (data || {}),
      response: response
    }
  }
  if (data.code === 'ok') {
    return {
      // data: (data && data.data) || data || {}, // 这种写法data.data = false 会不通过
      data: data?.data ?? (data || {}),
      response: response
    }
  } else {
    switch (data.code) {
      case 'SystemError':
        if (data.message === 'System error: null') {
          Message.error({
            message: i18n.t('message_request_error').toString()
          })
        } else {
          Message.error({
            message: data.message
          })
        }
        throw response
      default:
        Message.error({
          message: data.message
        })
        throw response
    }
  }
}, errorCallback)

export default axios
