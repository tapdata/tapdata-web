import axios from 'axios'

const pretreatment = function (doc) {
  if (Array.isArray(doc)) {
    doc.forEach(v => pretreatment(v))
  } else if (doc && typeof doc === 'object') {
    Object.keys(doc).forEach(key => {
      if (doc[key] && doc[key]['$numberDecimal']) {
        doc[key] = Number(doc[key]['$numberDecimal']) || 0
      }
      if (typeof doc[key] === 'object') {
        pretreatment(doc[key])
      }
    })
  }
}
export default class ApiClient {
  collections: any
  collection: any
  uri: string
  constructor() {
    this.uri = `${location.protocol}//${location.hostname}:3080`
  }

  setApiServer(server) {
    this.uri = server.clientURI
    localStorage.removeItem('__api_server_token')
  }

  getAPIServerUrl(path) {
    return `${this.uri || ''}${path || ''}`
  }

  /**
   * set collection
   * */
  setCollection(collection) {
    if (collection) {
      this.collection = collection
    }
  }
  async getAPIServerToken() {
    const apiToken = localStorage.getItem('__api_server_token') || ''
    if (apiToken) {
      return apiToken
    }

    let clientInfo = await axios.create().get('/api/Applications', {
      params: {
        // 'filter[where][clientName]': 'Data Explorer'
        filter: JSON.stringify({
          where: {
            clientName: 'Data Explorer'
          }
        })
      }
    })
    const clientInfoItem = clientInfo.data?.items[0] || {}
    let data =
      'grant_type=client_credentials&client_id=' + clientInfoItem.id + '&client_secret=' + clientInfoItem.clientSecret

    const result = await axios.create().post('/oauth/token', data)

    const token = result?.data?.access_token || ''
    localStorage.setItem('__api_server_token', token)

    return token
  }

  /**
   * load open api json
   * @returns {Promise<*>}
   */
  async loadOpenAPI() {
    const token = await this.getAPIServerToken()
    try {
      let openAPIUrl = this.getAPIServerUrl('/openapi.json?access_token=' + token)
      let response = await axios.create().get(openAPIUrl)
      if (response && response.data) {
        this.collections = await this.parseOpenAPI(response.data)
        return {
          success: true,
          data: this.collections
        }
      } else {
        return {
          success: false,
          status: response.status
        }
      }
    } catch (e) {
      // if (console && console.error) {
      //   console.error('parse OpenAPI.json error', e)
      // }
      return {
        success: false,
        status: 'default'
      }
    }
  }

  /**
   * 解析 json
   */
  async parseOpenAPI(openAPI) {
    if (openAPI && openAPI.paths) {
      const server = this.getAPIServerUrl('')
      const paths = Object.keys(openAPI.paths || {})
      const collections = {}
      paths.forEach(path => {
        let methods = Object.keys(openAPI.paths[path] || {})
        methods.forEach(method => {
          const methodDesc = openAPI.paths[path][method]
          const collection = methodDesc.tags ? methodDesc.tags[0] : ''
          const operationName = methodDesc['x-operation-name']
          const tableName = methodDesc['x-table-name']
          const apiId = methodDesc['x-api-id']
          const apiName = methodDesc['x-api-name']
          const fields = methodDesc['x-fields']

          if (collection && methodDesc['responses']) {
            collections[collection] = collections[collection] || {
              api: {},
              properties: {},
              tableName: tableName,
              apiId: apiId,
              apiName: apiName
            }
            collections[collection]['api'][operationName] = {
              url: server + path,
              method: method,
              fields: fields
            }

            if (
              operationName === 'findPage' ||
              operationName === 'findPage_post' ||
              (operationName !== 'findPage_post' && operationName.startsWith('findPage_'))
            ) {
              let $ref =
                methodDesc['responses']['200']['content']['application/json']['schema']['properties']['data']['items'][
                  '$ref'
                ]
              let modelPath = $ref.split('/')
              let model = openAPI['components']['schemas'][modelPath[modelPath.length - 1]]
              collections[collection]['properties'] = model.properties
            }
          }
        })
      })
      // console.log(collections)
      return collections
    }
  }

  async getHeaders(collectionName, operationName) {
    let collection = this.collections[collectionName || this.collection.collection]
    let properties = collection ? collection['properties'] : {}
    let headers = []
    let fields = Object.keys(properties || {})
    if (fields?.length)
      fields.forEach(field => {
        headers.push({
          text: field,
          value: field,
          show: true,
          type: properties[field]['type'],
          format: properties[field]['format']
        })
      })
    let showFields = {}
    if (operationName) {
      showFields = (collection.api[operationName] && collection.api[operationName]['fields']) || {}
      if (showFields && Object.keys(showFields || {}).length > 0) {
        headers = headers.filter(v => !!showFields[v.value])
      }
    }
    return headers
  }

  async exportData(params) {
    const token = await this.getAPIServerToken()
    params = params || {}
    let url = this.collections[this.collection.collection]['api']['findPage']['url']
    let fileExp = params.type === 'excel' ? 'xlsx' : params.type || 'json'
    let queryString = []
    Object.keys(params || {}).forEach(v => {
      queryString.push(v + '=' + params[v])
    })
    queryString.push('access_token=' + token)
    queryString.push('filename=' + this.collection.collection + '.' + fileExp)
    url = url + '?' + queryString.join('&')
    window.open(url, '__target')
  }

  async downloadById(item) {
    const token = await this.getAPIServerToken()
    let url = this.collections[this.collection.collection]['api']['downloadById']['url']
    url = url.replace('{id}', item._id)
    url = url + '?access_token=' + token
    window.open(url, '__target')
  }

  // 查询列表
  async find(params) {
    try {
      if (!this.collections || !this.collection) {
        return {
          success: true,
          status: 200,
          data: {
            data: [],
            total: {
              count: 0
            }
          }
        }
      }
      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      params = params || {}
      let url = ''
      if (
        this.collections[this.collection.collection] &&
        this.collections[this.collection.collection]['api'] &&
        this.collections[this.collection.collection]['api'][this.collection.operationName || 'findPage_post']
      ) {
        url =
          this.collections[this.collection.collection]['api'][this.collection.operationName || 'findPage_post']['url']
      }
      if (!url) {
        return {
          success: false,
          response: 'Not found API',
          msg: 'Not found API'
        }
      }
      const response = await request.post(url, params)
      if (response.statusText === 'OK') {
        if (response.data && response.data.data && response.data.data.length > 0) {
          response.data.data.forEach(doc => pretreatment(doc))
        }
        return {
          status: 200,
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }

  async create(doc) {
    try {
      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      let url = this.collections[this.collection.collection]['api']['create']['url']
      const response = await request.post(url, doc)
      if (response.statusText === 'OK') {
        return {
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }

  // 根据id更新单条数据
  async updateById(id, doc) {
    try {
      pretreatment(doc)
      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      let url = this.collections[this.collection.collection]['api']['updateById']['url']
      url = url.replace('{id}', id)
      const response = await request.patch(url, doc)
      if (response.statusText === 'OK') {
        return {
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }

  async updateone(id, doc) {
    try {
      pretreatment(doc)
      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      let url = this.collections[this.collection.collection]['api']['updateById']['url']
      url = url.replace('{id}', id)
      const response = await request.patch(url, doc)
      if (response.statusText === 'OK') {
        return {
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }

  // 删除行
  async deleteById(id) {
    try {
      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      let url = this.collections[this.collection.collection]['api']['deleteById']['url']
      url = url.replace('{id}', id)
      const response = await request.delete(url)

      if (response.statusText === 'OK') {
        return {
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }

  // 批量更新
  async updateAll(where, data) {
    try {
      where = where || {}

      const request = axios.create({
        headers: { access_token: await this.getAPIServerToken() }
      })
      let url = this.collections[this.collection.collection]['api']['updateAll']['url']
      let querys = []
      Object.keys(where).forEach(key => {
        querys.push(`${key}=${where[key]}`)
      })
      url = url + '?' + querys.join('&')

      const response = await request.patch(url, data)
      if (response.statusText === 'OK') {
        return {
          success: true,
          data: response.data
        }
      } else {
        return {
          success: false,
          response: response
        }
      }
    } catch (e) {
      return {
        success: false,
        response: e.response,
        msg: e.message
      }
    }
  }
}

export { ApiClient }
