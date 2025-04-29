import Cookie from '@tap/shared/src/cookie'
import axios from 'axios'

import qs from 'qs'

export const getImgByType = function (type) {
  if (!type || type === 'jira') {
    type = 'default'
  }
  return require(`@tap/assets/images/databaseType/${type.toLowerCase()}.png`)
}

export const verify = function (value) {
  var arr = [
    '\\',
    '$',
    '(',
    ')',
    '*',
    '+',
    '.',
    '[',
    ']',
    '?',
    '^',
    '{',
    '}',
    '|',
    '-',
  ]
  for (const element of arr) {
    var str = `\\${element}`
    value = value.replaceAll(new RegExp(str, 'g'), `\\${element}`)
  }
  return value
}
//列表脱敏
export const desensitization = function (url) {
  const matchResult = url.match(/^mongodb(\+srv)?:\/\/(.+):(.+)@/)
  if (matchResult && matchResult[3]) {
    return url.replace(`:${matchResult[3]}@`, ':*********@')
  }
  return url
}

export const handleProgress = function (data) {
  let count = 0
  data.forEach((log) => {
    if (log.status === 'passed') {
      count++
    }
  })
  const len = (100 / data.length) * count
  return Math.round(len) ? Math.round(len) : 0
}

//数据源基础字段
export const defaultModel = {
  default: {
    id: '',
    name: '',
    connection_type: '',
    table_filter: '',
  },
}

// 数据源图标
export const getConnectionIcon = (pdkHash) => {
  if (pdkHash) {
    const params = {
      pdkHash,
    }
    if (TAP_ACCESS_TOKEN) {
      params.__token = TAP_ACCESS_TOKEN
    }
    const access_token = Cookie.get('access_token')
    if (access_token) {
      params.access_token = access_token
    }
    const baseUrl = axios.defaults.baseURL.replace(/\/$/, '')
    return `${baseUrl}/api/pdk/icon?${qs.stringify(params)}`
  } else {
    return ''
  }
}
