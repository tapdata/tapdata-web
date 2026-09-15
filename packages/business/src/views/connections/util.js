import axios from 'axios'
import { reactive } from 'vue'

export const getImgByType = function (type) {
  if (!type || type === 'jira') {
    type = 'default'
  }
  return require(`@tap/assets/images/databaseType/${type.toLowerCase()}.png`)
}

export const verify = function (value) {
  const arr = [
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
    const str = `\\${element}`
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

// 数据源图标：<img src> 无法带 Authorization，用 Bearer 拉 blob 再转 object URL（TAP-11883）。
const iconUrlMap = reactive({})
const iconPending = new Set()

export const getConnectionIcon = (pdkHash) => {
  if (!pdkHash) {
    return ''
  }
  const cached = iconUrlMap[pdkHash]
  if (cached) {
    return cached
  }
  if (!iconPending.has(pdkHash)) {
    iconPending.add(pdkHash)
    const params = { pdkHash }
    const cloudToken = globalThis.TAP_ACCESS_TOKEN
    if (cloudToken) {
      params.__token = cloudToken
    }
    const baseUrl = axios.defaults.baseURL.replace(/\/$/, '')
    axios
      .get(`${baseUrl}/api/pdk/icon`, {
        params,
        responseType: 'blob',
        skipAuthExpire: true,
        silenceMessage: true,
      })
      .then((res) => {
        const blob = res.data
        if (blob && blob.size) {
          iconUrlMap[pdkHash] = URL.createObjectURL(blob)
        }
      })
      .finally(() => {
        iconPending.delete(pdkHash)
      })
  }
  return iconUrlMap[pdkHash] || ''
}
