import { requestClient } from '@tap/api'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import {
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
} from '@tap/request'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import Qs from 'qs'
import i18n from '@/i18n'

const headers = {
  'x-requested-with': 'XMLHttpRequest',
}
axios.defaults.headers.common['x-requested-with'] = headers['x-requested-with']
axios.defaults.baseURL = './tm'
const pending = []
const CancelToken = axios.CancelToken

const _axios = axios.create({
  baseURL: './',
  headers,
})

const getPendingKey = (config) => {
  const { url, method, data, params } = config
  const headers = {}
  for (const key in config.headers) {
    const value = config.headers[key]
    if (
      Object.prototype.toString.call(value) === '[object String]' &&
      !['Content-Type', 'Accept'].includes(key)
    ) {
      headers[key] = value
    }
  }
  const key = JSON.stringify({
    url,
    method,
    data,
    params,
    headers,
  })
  return key
}
const removePending = (config) => {
  const key = getPendingKey(config)
  const index = pending.indexOf(key)
  pending.splice(index, 1)
}
let skipErrorHandler = false
const errorCallback = (error) => {
  const status = error?.response?.status
  if (axios.isCancel(error)) {
    return Promise.reject(error)
  }
  // 从请求池清除掉错误请求
  if (error?.response?.config || error?.config) {
    removePending(error.config || error.response.config)
  }
  if (status === 401) {
    // 未登录
    location.replace(`${location.href.split('#/')[0]}login`)
  } else if (error.code && error.message) {
    // 其他错误
    ElMessage.error(String(error.message || error))
  }
  //暂时注释 62-2 迭代先authing错误页面提示
  // if (status === 404) {
  //   // Message.error('服务器错误:' + error)
  //   location.replace(location.href.split('#/')[0] + '#/404')
  // }
  // if (status === 500) {
  //   // Message.error('服务器错误:' + error)
  //   location.replace(location.href.split('#/')[0] + '#/500')
  // }
  // if (status === 502) {
  //   // Message.error('服务器错误:' + error)
  //   location.replace(location.href.split('#/')[0] + '#/502')
  // }
  // if (status === 504) {
  //   // Message.error('服务器错误:' + error)
  //   location.replace(location.href.split('#/')[0] + '#/504')
  // }
  //先去掉全局接口异常弹窗 #125624
  // else if (error?.message !== 'cancel' && window.navigator.onLine) {
  //   errorConfirmFnc(error)
  // }
  console.error(i18n.t('dfs_plugins_axios_qingqiubaocuo') + error)
  return Promise.reject(error)
}
const requestInterceptor = (config) => {
  config.paramsSerializer = (params) => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      encoder: (str) => window.encodeURIComponent(str),
    })
  }

  if (!config.params) config.params = {}

  // 配置请求头
  if (TAP_ACCESS_TOKEN) {
    config.params.__token = TAP_ACCESS_TOKEN
  }

  // headers里面注入用户token，并开启鉴权
  if (TAP_USER_ID) {
    config.headers.user_id = TAP_USER_ID
  }

  skipErrorHandler = config?.data?.skipErrorHandler || false //是否跳转统一错误提示

  config.withCredentials = true

  // 业务内设置了cancel
  if (config.cancelToken) return config

  // 获取取消请求的函数
  let cancelFunc = null
  config.cancelToken = new CancelToken((c) => {
    cancelFunc = c
  })
  const key = getPendingKey(config)
  // 判断请求池是否有相同请求，有则取消当前请求（后一条）,没有则将请求注入请求池
  if (pending.includes(key)) {
    console.warn('Cancel request:', config)
    cancelFunc('cancel')
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}
const responseInterceptor = (response) => {
  return new Promise((resolve, reject) => {
    // 从请求池清除掉错误请求
    removePending(response.config)

    const data = response?.data
    const code = data?.code

    if (code === 'ok') {
      // code 为 ok 则表示请求正常返回，进入then逻辑
      return resolve(data?.data)
    }

    if (['SystemError', 'SubscribeFailed.OrderLimit'].includes(code)) {
      showErrorMessage(data)
      return reject(msg)
    }

    if (response.config.silenceMessage) {
      return reject(response)
    }
    // 其他情况交由业务端自行处理
    if (
      [
        'Datasource.TableNotFound',
        'SubscribeFailed.OrderLimit',
        'Task.ScheduleLimit',
        'Task.ManuallyScheduleLimit',
      ].includes(code)
    ) {
      return reject(Object.assign(response))
    }
    // 文件处理
    if (response?.config?.responseType === 'blob') {
      return resolve(response)
    }
    // JSON文件
    if (response?.config.url?.match(/.json$/i)) {
      return resolve(response)
    }

    // 特殊处理
    if (!code) {
      return resolve(data)
    }

    if (!skipErrorHandler) {
      // 手机号码
      if (['Authing.User.Update.Failed'].includes(code)) {
        ElMessage.error(i18n.t('dfs_user_center_phone_error'))
      } else {
        if (code === '8051') {
          ElMessage.error(i18n.t('agent_version_not_support'))
          return reject(response)
        }
        showErrorMessage(data)
      }
    }
    return reject(Object.assign(response))
  })
}

axios.interceptors.request.use(requestInterceptor, errorCallback)
axios.interceptors.response.use(responseInterceptor, errorCallback)

_axios.interceptors.request.use(requestInterceptor, errorCallback)
_axios.interceptors.response.use(responseInterceptor, errorCallback)

export default _axios

export const install = (app) => {
  Object.defineProperties(app.config.globalProperties, {
    axios: {
      get() {
        return _axios
      },
    },
    $axios: {
      get() {
        return _axios
      },
    },
  })
}

export function initRequestClient() {
  requestClient.setBaseURL('./tm')

  requestClient.addRequestInterceptor({
    fulfilled: (config) => {
      if (!config.params) config.params = {}

      // 配置请求头
      if (TAP_ACCESS_TOKEN) {
        config.params.__token = TAP_ACCESS_TOKEN
      }

      // headers里面注入用户token，并开启鉴权
      if (TAP_USER_ID) {
        config.headers.user_id = TAP_USER_ID
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
        const responseData = error?.response?.data ?? {}
        const errorMessage = responseData?.message ?? responseData?.msg

        if (
          ['SystemError', 'SubscribeFailed.OrderLimit'].includes(
            responseData.code,
          ) ||
          errorMessage
        ) {
          showErrorMessage(responseData)
          return
        }

        if (
          [
            'Datasource.TableNotFound',
            'SubscribeFailed.OrderLimit',
            'Task.ScheduleLimit',
            'Task.ManuallyScheduleLimit',
          ].includes(responseData.code)
        ) {
          return
        }

        if (['Authing.User.Update.Failed'].includes(responseData.code)) {
          ElMessage.error(i18n.t('dfs_user_center_phone_error'))
        } else {
          if (responseData.code === '8051') {
            ElMessage.error(i18n.t('agent_version_not_support'))
            return
          }
          showErrorMessage(
            Object.assign({}, responseData, {
              message: msg || i18n.global.t('public_message_inner_error'),
            }),
          )
        }
      },
      {
        401: () => {
          location.replace(`${location.href.split('#/')[0]}login`)
          return i18n.global.t('public_message_401')
        },
      },
    ),
  )

  return requestClient
}
