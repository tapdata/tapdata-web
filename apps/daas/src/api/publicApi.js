import axios from 'axios'
import Cookie from '@tap/shared/src/cookie'
import { signOut } from '../utils/util'
import { Message } from 'element-ui'
import i18n from '@/i18n'
import Qs from 'qs'

let pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken

axios.defaults.baseURL = process.env.BASE_URL || './'

const getPendingKey = config => {
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
const removePending = config => {
  let key = getPendingKey(config)
  let index = pending.findIndex(it => it === key)
  if (index >= 0) {
    pending.splice(index, 1)
  }
}
axios.interceptors.request.use(
  function (config) {
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
    let apiPre = ''
    let tcmApiPre = ''
    let preUrl = ''
    if (config.url.startsWith('/api/tcm')) {
      preUrl = tcmApiPre
    } else {
      preUrl = tcmApiPre + apiPre
    }
    config.url = preUrl + config.url
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
  },
  function (error) {
    if (error?.config || error?.response?.config) {
      removePending(error.config || error.response.config)
    }
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    return new Promise((resolve, reject) => {
      removePending(response.config)
      let data = response.data
      if (data.code === 'ok') {
        return resolve({
          data: (data && data.data) || data || {},
          response: response
        })
      } else {
        switch (data.code) {
          case '110500':
            reject({
              response: {
                code: '110500',
                status: 500,
                msg: data.message,
                data: data.data || []
              }
            })
            break
          case '110400':
            reject({
              response: {
                code: '110400',
                status: 500,
                msg: data.message
              }
            })
            break
          case '110401':
            signOut()
            setTimeout(() => {
              Message.error({
                message: data.message
              })
            }, 500)
            break
          case '110403':
            // 接口无权限
            reject({
              response: {
                code: '110403',
                msg: data.message
              }
            })
            Message.error({
              message: i18n.t('message_no_permission')
            })
            break
          case 'SystemError':
            if (data.message === 'System error: null') {
              Message.error({
                message: i18n.t('message_request_error')
              })
            } else {
              Message.error({
                message: data.message
              })
            }
            reject(response)
            break
          default:
            reject(response)
        }
      }
    })
  },
  error => {
    if (error?.config || error?.response?.config) {
      removePending(error.config || error.response.config)
    }
    let rsp = error.response
    if (rsp) {
      if (rsp.data && rsp.data.state === 'EXCEPTION') {
        return new Promise(() => {
          return Promise.reject(error)
        })
      }
      switch (rsp.status) {
        // 用户无权限访问接口
        case 401:
          signOut()
          setTimeout(() => {
            Message.error({
              message: i18n.t('errorCode.unauthorized')
            })
          }, 500)
          break
        // 请求的资源不存在
        case 404:
          // 处理404
          Message.error({
            message: i18n.t('errorCode.requested')
          })
          break
        // 服务器500错误
        case 504:
          Message.error({
            message: i18n.t('errorCode.serverAbnormal')
          })
          break
        case 500:
          Message.error({
            message: i18n.t('errorCode.serverAbnormal')
          })
          break
      }
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !window.navigator.onLine) {
      Message.error({
        message: i18n.t('errorCode.networkUnconnected')
      })
    } else if (error.message && error.message.includes('timeout')) {
      Message.error({
        message: i18n.t('errorCode.timeout')
      })
    }
    return new Promise(() => {
      return Promise.reject(error)
    })
  }
)

export default class PublicAPI {
  constructor(url) {
    this.url = url
  }

  count(params) {
    return axios.get(this.url + '/count', { params })
  }

  patch(params) {
    return axios.patch(this.url, params)
  }

  updateById(id, attributes) {
    return axios.patch(this.url + '/' + id, attributes)
  }

  /**
   *
   * @param where 	Criteria to match model instances
   * @param attributes	An object of model property name/value pairs
   * @return {Promise<AxiosResponse<T>>}
   */
  update(where, attributes) {
    if (typeof where === 'object') where = JSON.stringify(where)

    return axios.post(this.url + '/update?where=' + encodeURIComponent(where), attributes)
  }

  get(params, filter) {
    if (Array.isArray(params)) {
      filter = typeof filter === 'object' ? JSON.stringify(filter) : filter
      let qs = filter ? '?filter=' + encodeURIComponent(filter) : ''
      return axios.get(this.url + '/' + params.join('/') + qs)
    }
    params = params || {}
    return axios.get(this.url, { params })
  }

  delete(id) {
    return axios.delete(`${this.url}/${id}`)
  }

  post(params) {
    return axios.post(this.url, params)
  }

  findOne(params) {
    params = params || {}
    return axios.get(this.url + '/findOne', { params })
  }
}
