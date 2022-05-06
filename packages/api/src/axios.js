import axios from 'axios'
import { Message } from 'element-ui'
import Cookie from '@tap/shared/src/cookie'

// Full config:  https://github.com/axios/axios#request-config
const config = {
  baseURL: process.env.VUE_APP_BASE_URL || process.env.BASE_URL
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}
const removePending = config => {
  let key = JSON.stringify(config)
  let index = pending.findIndex(it => it === key)
  pending.splice(index, 1)
}
const errorCallback = error => {
  if (error?.response?.status === 401) {
    location.href = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/login'
    return
  } else if (error?.response?.status === 502 || error?.response?.status === 400) {
    return
  }
  let data = error?.response?.data
  if (error && error.message !== 'cancel' && (!data || data.state !== 'EXCEPTION')) {
    // Message.error('服务器错误:' + error)
    location.replace(location.href.split('#/')[0] + '#/500')
  }
  if (error && error.response && error.response.config) {
    removePending(error.response.config)
  }
  return Promise.reject(error)
}
const service = axios.create(config)

const pending = []

const CancelToken = axios.CancelToken
service.interceptors.request.use(function (config) {
  // 本地开发使用header中加__token的方式绕过网关登录
  const ACCESS_TOKEN = process.env.VUE_APP_ACCESS_TOKEN || ''
  const params = {}
  let accessToken = Cookie.get('token')
  if (accessToken) {
    params.access_token = accessToken
  }
  if (ACCESS_TOKEN) {
    params.__token = ACCESS_TOKEN
  }
  config.params = Object.assign({}, config.params, params)

  let url = config.url
  // get 请求编码参数
  if (config.method === 'get' && config.params) {
    url += '?'
    Object.keys(config.params).forEach(key => (url += `${key}=${encodeURIComponent(config.params[key])}&`))
    url = url.substring(0, url.length - 1)
    config.params = {}
  }
  config.url = url

  let user = window.__USER_INFO__
  if (user) {
    config.headers['X-Token'] = user.token
  }
  config.withCredentials = true
  config.headers['x-requested-with'] = 'XMLHttpRequest'
  let cancelFunc = null
  if (!config.cancelToken) {
    config.cancelToken = new CancelToken(c => {
      cancelFunc = c
    })
  }
  let key = JSON.stringify(config)
  if (pending.includes(key)) {
    console.log('Cancel request:', config) //eslint-disable-line
    cancelFunc('cancel')
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}, errorCallback)

// Add a response interceptor
service.interceptors.response.use(function (response) {
  return new Promise((resolve, reject) => {
    removePending(response.config)
    let code = response.data.code
    if (code === 'ok') {
      return resolve(response.data.data)
    } else if (code === 'SystemError') {
      Message.error(response.data.message)
      reject(response)
    }
    reject(response)
  })
}, errorCallback)

export default service

export { CancelToken }
