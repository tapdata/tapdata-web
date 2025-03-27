// TODO 整理下方通用工具方法 ------------------------------------------------------------------------------------------------------------------------
import Cookie from './cookie'
import dayjs from 'dayjs'

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

export function checkConnectionName(name) {
  return /^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-.]|[\u4e00-\u9fa5])*$/.test(name)
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

export function submitForm(url, obj = {}, method = 'post') {
  const form = document.createElement('form')
  form.action = url
  form.method = method
  for (let key in obj) {
    const dom = document.createElement('input')
    dom.setAttribute('type', 'hidden')
    dom.setAttribute('name', key)
    dom.value = typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key]
    form.appendChild(dom)
  }
  document.body.appendChild(form)
  form.submit()
  form.parentNode.removeChild(form)
}

// 下载Blob
export function downloadBlob(res, name = '') {
  if (!res) {
    return
  }
  const { data, headers } = res
  const fileName = name || headers['content-disposition'].replace(/\w+;\s*filename="?([^"]+)"?/, '$1')
  const blob = new Blob([data], { type: headers['content-type'] })
  openUrl(window.URL.createObjectURL(blob), '_blank', fileName)
}

// 下载Json
export function downloadJson(data, name = '') {
  if (!data) {
    return
  }
  const fileName = name
  const blob = new Blob([data], { type: 'application/JSON' })
  openUrl(window.URL.createObjectURL(blob), '_blank', fileName)
}

export function dec2hex(dec) {
  return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
export function generateId(len = 8) {
  const arr = new Uint8Array(len / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

// 转base64
export const urlToBase64 = url => {
  return new Promise((resolve, reject) => {
    let image = new Image()
    image.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = this.naturalWidth
      canvas.height = this.naturalHeight
      // 将图片插入画布并开始绘制
      canvas.getContext('2d').drawImage(image, 0, 0)
      // result
      let result = canvas.toDataURL('image/png')
      resolve(result)
    }
    // CORS 策略，会存在跨域问题https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
    image.setAttribute('crossOrigin', 'Anonymous')
    image.src = url
    // 图片加载失败的错误处理
    image.onerror = () => {
      reject(new Error('urlToBase64 error'))
    }
  })
}

export function fromNow(date, flag = false) {
  return dayjs(date).fromNow(flag)
}

// 转大写
export function toUpperCase(str = '') {
  return str.toUpperCase()
}

// 转小写
export function toLowerCase(str = '') {
  return str.toLowerCase()
}

// 驼峰命名转蛇形命名
// 处理逻辑：将源字段名中非首字母的大写字母前增加下划线_进行连接，并将所有字母转换为小写
export function camelToSnake(camelStr) {
  return camelStr.replace(/[A-Z]/g, match => '_' + match.toLowerCase()).toLowerCase()
}

// 驼峰命名转蛇形命名
// 处理逻辑：将源字段名中非首字母的大写字母前增加下划线_进行连接，并将所有字母转换为小写
export function snakeToCamel(snakeStr) {
  return snakeStr.replace(/_[a-z]/g, match => match.charAt(1).toUpperCase())
}

export function onCopy(value) {
  const input = document.createElement('textarea')
  input.style.fontSize = '12pt'
  input.style.border = '0'
  input.style.padding = '0'
  input.style.margin = '0'
  input.style.position = 'absolute'
  input.style.left = '-9999px'
  input.style.top = document.documentElement.scrollTop + 'px'
  input.setAttribute('readonly', '')
  input.value = value

  document.body.appendChild(input)
  input.select() // 这里会触发ElTooltip -> Button 的blur，下面要主动focus
  document.execCommand?.('copy')
  document.body.removeChild(input)
}

export async function copyToClipboard(textToCopy, context) {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(textToCopy)
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'

    context = context || document.body
    context.prepend(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (error) {
      console.error(error)
    }

    context.removeChild(textArea)
  }
}

export function deepEqual(obj1, obj2, excludedPaths = [], currentPath = '', seen = new Map()) {
  const isExcluded = path => excludedPaths.includes(path)

  // Handle identical references (including NaN)
  if (obj1 === obj2) {
    return true
  }

  // Handle NaN case
  if (typeof obj1 === 'number' && typeof obj2 === 'number' && isNaN(obj1) && isNaN(obj2)) {
    return true
  }

  // Handle null and undefined
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2
  }

  // Handle functions (if needed)
  // if (typeof obj1 === 'function' || typeof obj2 === 'function') {
  //   return false
  // }

  // Handle different types
  if (typeof obj1 !== typeof obj2) {
    return false
  }

  // Handle dates
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime()
  }

  // Handle regular expressions
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.source === obj2.source && obj1.flags === obj2.flags
  }

  // Handle arrays and objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    // Handle cyclic references
    if (seen.has(obj1) && seen.get(obj1) === obj2) {
      return true
    }
    seen.set(obj1, obj2)

    let keys1 = Object.keys(obj1)
    let keys2 = Object.keys(obj2)
    const pathPrefix = currentPath ? `${currentPath}.` : ''

    if (excludedPaths.length) {
      keys1 = keys1.filter(key => !isExcluded(pathPrefix + key))
      keys2 = keys2.filter(key => !isExcluded(pathPrefix + key))
    }

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key], excludedPaths, pathPrefix + key, seen)) {
        return false
      }
    }

    return true
  }

  // Default case: not equal
  return false
}
