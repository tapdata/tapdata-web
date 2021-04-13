import axios from 'axios'
import Cookie from 'tiny-cookie'
import { signOut } from '../utils/util'
import { Message } from 'element-ui'
import i18n from '@/i18n'
import Qs from 'qs'

let pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken

axios.interceptors.request.use(
  function (config) {
    config.paramsSerializer = (params) => {
      return Qs.stringify(params, {
        arrayFormat: 'brackets',
        encoder: (str) => window.encodeURIComponent(str)
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
    let xToken = Cookie.get('xToken')
    if (xToken) {
      config.headers['X-Token'] = xToken
    }
    let apiPre = window.getSettingByKey('DFS_TM_API_PRE_URL') || ''
    let tcmApiPre = window.getSettingByKey('DFS_TCM_API_PRE_URL') || ''
    let preUrl = ''
    if (config.url.startsWith('/api/tcm')) {
      preUrl = tcmApiPre
    } else {
      preUrl = tcmApiPre + apiPre
    }
    config.url = preUrl + config.url
    config.headers['Pool-Id'] = 'CIDC-RP-25'
    config.headers['x-requested-with'] = 'XMLHttpRequest'

    let key = JSON.stringify(config)
    let cancelFunc = null
    config.cancelToken = new CancelToken((c) => {
      cancelFunc = c
    })
    if (pending.includes(key)) {
      console.log('Cancel request:', JSON.parse(key)) //eslint-disable-line
      cancelFunc()
    } else {
      pending.push(key)
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    return new Promise((resolve, reject) => {
      let key = JSON.stringify(response.config)
      let index = pending.findIndex((it) => it === key)
      pending.splice(index, 1)
      let data = response.data
      if (data.code === 'ok') {
        return resolve({
          data: data.data || data || {},
          response: response
        })
      } else {
        switch (data.code) {
          case '110500':
            reject({
              response: {
                code: '110500',
                status: 500,
                msg: data.msg
              }
            })
            break
          case '110400':
            reject({
              response: {
                code: '110400',
                status: 500,
                msg: data.msg
              }
            })
            break
          case '110401':
            signOut()
            setTimeout(() => {
              Message.error({
                message: data.msg
              })
            }, 500)
            break
          case '110403':
            // 接口无权限
            reject({
              response: {
                code: '110403',
                msg: data.msg
              }
            })
            Message.error({
              message: i18n.t('message.noPermission')
            })
            break
          default:
            reject(response)
        }
      }
    })
  },
  (error) => {
    let rsp = error.response
    if (rsp) {
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
