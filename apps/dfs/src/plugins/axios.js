'use strict'

import Vue from 'vue'
import axios from 'axios'
import { Message } from 'element-ui'
import { errorConfirmFnc } from '@/util'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL ||  '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
const headers = {
  'x-requested-with': 'XMLHttpRequest'
}
axios.defaults.headers.common['x-requested-with'] = headers['x-requested-with']
axios.defaults.baseURL = './tm'
const pending = []
const CancelToken = axios.CancelToken

const _axios = axios.create({
  baseURL: './',
  headers: headers
})

const getPendingKey = config => {
  let { url, method, params } = config
  let headers = {}
  for (const key in config.headers) {
    let value = config.headers[key]
    if (Object.prototype.toString.call(value) === '[object String]' && !['Content-Type', 'Accept'].includes(key)) {
      headers[key] = value
    }
  }
  let key = JSON.stringify({
    url,
    method,
    params,
    headers
  })
  return key
}
const removePending = config => {
  let key = getPendingKey(config)
  let index = pending.findIndex(it => it === key)
  pending.splice(index, 1)
}
const errorCallback = error => {
  let status = error?.response?.status
  // 从请求池清除掉错误请求
  if (error?.response?.config || error?.config) {
    removePending(error.config || error.response.config)
  }
  if (status === 401) {
    // 未登录
    location.replace(location.href.split('#/')[0] + 'login')
  } else if (error.code && error.message) {
    // 其他错误
    Message.error(`${error.message || error}`)
  } else if (error?.message !== 'cancel') {
    errorConfirmFnc(error)
  }
  console.error('请求报错：' + error) // eslint-disable-line
  return Promise.reject(error)
}
const requestInterceptor = config => {
  // 本地开发使用header中加__token的方式绕过网关登录
  const ACCESS_TOKEN = process.env.VUE_APP_ACCESS_TOKEN || ''
  if (ACCESS_TOKEN) {
    let params = { __token: ACCESS_TOKEN }
    config.params = Object.assign({}, config.params, params)
  }

  // headers里面注入用户token，并开启鉴权
  let user = window.__USER_INFO__
  if (user) {
    config.headers['X-Token'] = user.token
    if (process.env.NODE_ENV === 'development') {
      config.headers['user_id'] = user.id
    }
  }
  config.withCredentials = true

  // 获取取消请求的函数
  let cancelFunc = null
  config.cancelToken = new CancelToken(c => {
    cancelFunc = c
  })
  let key = getPendingKey(config)
  // 判断请求池是否有相同请求，有则取消当前请求（后一条）,没有则将请求注入请求池
  if (pending.includes(key)) {
    console.log('Cancel request:', config) //eslint-disable-line
    cancelFunc('cancel')
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}
const responseInterceptor = response => {
  return new Promise((resolve, reject) => {
    // 从请求池清除掉错误请求
    removePending(response.config)

    let data = response?.data
    let code = data?.code
    if (code === 'ok') {
      // code 为 ok 则表示请求正常返回，进入then逻辑
      return resolve(data?.data)
    } else if (code === 'SystemError') {
      // code 为 SystemError 则表示请求异常，提示信息
      let msg = data?.message || data?.msg || ''
      Message.error(`SystemError： ${msg === msg.substring(0, 20) ? msg : msg.substring(0, 20) + '...'}`)
      // eslint-disable-next-line
      console.log('请求失败:' + msg, response)
      return reject(msg)
    } else {
      // 其他情况交由业务端自行处理
      if (['Datasource.TableNotFound'].includes(code)) {
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
      let msg = data?.message || data?.msg || ''
      // eslint-disable-next-line
      console.log(`${code}： ${msg}`)
      Message.error(msg)
      return reject(Object.assign(response))
    }
  })
}
// 请求发起拦截器
axios.interceptors.request.use(requestInterceptor, errorCallback)
axios.interceptors.response.use(responseInterceptor, errorCallback)

_axios.interceptors.request.use(requestInterceptor, errorCallback)

// 请求返回拦截器
_axios.interceptors.response.use(responseInterceptor, errorCallback)

const Plugin = {}
Plugin.install = function (Vue) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios
      }
    },
    $axios: {
      get() {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
