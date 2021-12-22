import { TOPOLOGY_MAP } from './const'
import moment from 'moment'

export function formatAgent(data) {
  let { regionMap, zoneMap } = window.__REGION__
  data.regionFmt = `${regionMap[data.region] || data.region} | ${zoneMap[data.zone] || data.zone}`
  data.topology = TOPOLOGY_MAP[data.spec?.direction]?.split('（')[0]
  data.endTimeStr = data.endTime ? moment(data.endTime).format('YYYY-DD-MM') : ''
  return data
}
export function queryParams(data, isPrefix) {
  isPrefix = isPrefix ? isPrefix : false
  let prefix = isPrefix ? '?' : ''
  let _result = []
  for (let key in data) {
    let value = data[key]
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue
    }
    if (value.constructor === Array) {
      value.forEach(_value => {
        _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value))
      })
    } else {
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }
  }
  return _result.length ? prefix + _result.join('&') : ''
}
export function toDecimal2(x) {
  var float = parseFloat(x)
  if (isNaN(float)) {
    return false
  }
  var f = Math.round(x * 100) / 100
  var s = f.toString()
  var rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}
export function toRegExp(word) {
  let arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-']
  for (let i = 0; i < arr.length; i++) {
    let str = '\\' + arr[i]
    word = word.replace(new RegExp(str, 'g'), '\\' + arr[i])
  }
  return word
}
export const deepCopy = obj => JSON.parse(JSON.stringify(obj))
export const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return date ? moment(date).format(format) : ''
}
// 判断对象是否为空
export const isEmpty = obj => Reflect.ownKeys(obj).length === 0 && obj.constructor === Object
// 数组去重
export function uniqueArr(arr = [], key = 'id') {
  if (typeof arr[0] !== 'object') {
    return Array.from(new Set(arr))
  }
  let obj = {}
  return arr.reduce((cur, next) => {
    if (!obj[next[key]]) {
      obj[next[key]] = true
      cur.push(next)
    }
    return cur
  }, [])
}
// cookie
export const cookie = {
  // 设置cookie
  set: (name, value, day) => {
    const date = new Date()
    date.setDate(date.getDate() + day)
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString()
  },
  // 获取cookie
  get: key => {
    var arr = document.cookie.split('; ')
    for (var i = 0; i < arr.length; i++) {
      var arr1 = arr[i].split('=')
      if (arr1[0] == key) {
        return arr1[1]
      }
    }
    return ''
  },
  // 删除cookie
  remove: name => {
    cookie.set(name, '', -1)
  }
}
let timeout = null
export function delayTrigger(func, t) {
  if (t) {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func && func()
      timeout = null
    }, t)
  } else {
    func && func()
  }
}
// 支持的数据源 'mysql','mariadb','mysql pxc','mongodb','postgres','oracle','sqlserver','redis'
// 不支持 'rest api','db2','sybase','gbase','gaussdb200','kafka','elasticsearch'
export const TYPEMAP = {
  mysql: 'MySQL',
  oracle: 'Oracle',
  mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch',
  redis: 'Redis',
  postgres: 'PostgreSQL',
  sqlserver: 'SQL Server',
  'gbase-8s': 'GBase 8s',
  'sybase ase': 'Sybase ASE',
  gaussdb200: 'GaussDB200',
  db2: 'IBM Db2',
  mem_cache: 'Memory Cache',
  file: 'File(s)',
  custom_connection: 'Custom connection',
  'rest api': 'REST API',
  'dummy db': 'Dummy DB',
  gridfs: 'GridFS',
  kafka: 'Kafka',
  mariadb: 'MariaDB',
  'mysql pxc': 'MySQL PXC',
  jira: 'jira',
  clickhouse: 'ClickHouse'
}
