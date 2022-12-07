// TODO 整理下方通用工具方法 ------------------------------------------------------------------------------------------------------------------------
import Cookie from './cookie'

export function setPermission(list) {
  let permissions = []
  if (list) {
    list.forEach(permission => {
      if (permission.resources && permission.resources.length > 0) {
        permission.resources.forEach(res => {
          // if (res.type === 'page')
          permissions.push(res)
        })
      }
    })
  }
  sessionStorage.setItem('tapdata_permissions', JSON.stringify(permissions))
  return permissions
}
// export const getConnectionTypeDialogImg = function (type) {
//   try {
//     return require(`./assets/icons/node/${type}.svg`)
//   } catch (e) {
//     return null
//   }
// }
export function signOut() {
  sessionStorage.removeItem('tapdata_permissions')
  Cookie.remove('xToken')
  Cookie.remove('access_token')
  Cookie.remove('user_id')
  Cookie.remove('login')
  Cookie.remove('isAdmin')
  Cookie.remove('email')
  Cookie.remove('username')
  Cookie.remove('isReadonly')
  if (window !== top) {
    top.window.location.href = '/login'
  } else {
    window.App.$router.push({
      name: 'login'
    })
  }
}

export function toRegExp(word) {
  let arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-']
  for (let i = 0; i < arr.length; i++) {
    let str = '\\' + arr[i]
    word = word.replace(new RegExp(str, 'g'), '\\' + arr[i])
  }
  return word
}

export function getUrlSearch(name) {
  // 未传参，返回空
  if (!name) return null
  // 查询参数：先通过search取值，如果取不到就通过hash来取
  var after = window.location.search
  after = after.substr(1) || window.location.hash.split('?')[1]
  // 地址栏URL没有查询参数，返回空
  if (!after) return null
  // 如果查询参数中没有"name"，返回空
  if (after.indexOf(name) === -1) return null
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  // 当地址栏参数存在中文时，需要解码，不然会乱码
  var r = decodeURI(after).match(reg)
  // 如果url中"name"没有值，返回空
  if (!r) return null
  return r[2]
}
let timeout = null
export function delayTrigger(func, t = 500) {
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

const CLASSTYPES = [
  'String',
  'Number',
  'BigInt',
  'Boolean',
  'Symbol',
  'Function',
  'Array',
  'Date',
  'RegExp',
  'Object',
  'Error'
]

const CLASS2TYPE = CLASSTYPES.reduce((obj, t) => ((obj[`[object ${t}]`] = t.toLowerCase()), obj), {})

export function getClassType(obj) {
  return obj == null ? String(obj) : CLASS2TYPE[{}.toString.call(obj)] || 'object'
}

export function isObject(obj) {
  return getClassType(obj) === 'object'
}

export function isString(obj) {
  return getClassType(obj) === 'string'
}

export function isFunction(func) {
  return typeof func === 'function' || getClassType(func) === 'function'
}

/**
 * 按key给数组分组
 * @param data
 * @param key
 * @returns {*}
 */
export function groupBy(data, key) {
  return data.reduce((storage, item) => {
    const g = item[key]
    storage[g] = storage[g] || []
    storage[g].push(item)
    return storage
  }, {})
}

export const uuid = function () {
  // credit: http://stackoverflow.com/posts/2117523/revisions

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0
    let v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 比较两个数字是否近似相等
 * 0.1 + 0.2 === 0.3 => false
 * sameNumber(0.1+0.2, 0.3) => true
 * @param num1
 * @param num2
 * @param tolerance 宽松度
 * @returns {boolean}
 */
export function sameNumber(num1, num2, tolerance = Number.EPSILON) {
  return Math.abs(num1 - num2) <= tolerance || num1 === num2
}

export const os = (function () {
  var ua = navigator.userAgent,
    isWindowsPhone = /(Windows Phone)/.test(ua),
    isSymbian = /SymbianOS/.test(ua) || isWindowsPhone,
    isAndroid = /Android/.test(ua),
    isFireFox = /Firefox/.test(ua),
    isChrome = /Chrome|CriOS/.test(ua),
    isTablet = /iPad|PlayBook/.test(ua) || (isAndroid && !/Mobile/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
    isIPhone = /iPhone/.test(ua) && !isTablet,
    isWeixin = /MicroMessenger/.test(ua),
    isPc = !isIPhone && !isAndroid && !isSymbian
  return {
    isChrome,
    isTablet,
    isIPhone,
    isAndroid,
    isWeixin,
    isPc
  }
})()

// 深拷贝
export const deepCopy = obj => JSON.parse(JSON.stringify(obj))
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
export function checkConnectionName(name) {
  return /^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(name)
}

export function openUrl(url, target = '_blank', name = '') {
  const dom = document.createElement('a')
  if (name) dom.download = decodeURI(name)
  dom.href = url
  dom.setAttribute('target', target)
  dom.setAttribute('ID', name)
  dom.style.display = 'none'
  document.body.appendChild(dom)
  dom.click()
  dom.parentNode.removeChild(dom)
  window.URL.revokeObjectURL(url)
}

// 下载Blob
export function downloadBlob(res, name = '') {
  if (!res) {
    return
  }
  const { data, headers } = res
  const fileName = name || headers['content-disposition'].replace(/\w+;\s*filename="(.*)"/, '$1')
  const blob = new Blob([data], { type: headers['content-type'] })
  openUrl(window.URL.createObjectURL(blob), '_blank', fileName)
}

export const isEmpty = obj => Reflect.ownKeys(obj).length === 0 && obj.constructor === Object
