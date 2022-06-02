import { confirm } from 'web-core'
import i18n from '@/i18n'
import timeFunction from '@/mixins/timeFunction'

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
export const formatTime = timeFunction.methods.formatTime
// 根据类型做时间格式化，精确到哪种级别
export const formatTimeByTime = (time, type) => {
  let result = time
  switch (type) {
    case 'second':
      result = formatTime(time, '', 'HH:mm:ss')
      break
    case 'minute':
      result = formatTime(time, '', 'HH:mm')
      break
    case 'hour':
      result = formatTime(time, '', 'HH:00')
      break
    case 'day':
      result = formatTime(time, '', 'MM-DD')
      break
  }
  return result
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
// 千分符
export const numToThousands = (num, index = 3, symbol = ',') => {
  let reg = new RegExp('(?!^)(?=(\\d{' + index + '})+$)', 'g')
  return String(num).replace(reg, symbol)
}
// 下载Blob
export const downloadBlob = (res, name = '') => {
  if (!res) {
    return
  }
  const { data, headers } = res
  const fileName = name || headers['content-disposition'].replace(/\w+;\s*filename="(.*)"/, '$1')
  const blob = new Blob([data], { type: headers['content-type'] })
  let dom = document.createElement('a')
  let url = window.URL.createObjectURL(blob)
  dom.href = url
  dom.download = decodeURI(fileName)
  dom.style.display = 'none'
  document.body.appendChild(dom)
  dom.click()
  dom.parentNode.removeChild(dom)
  window.URL.revokeObjectURL(url)
}
// 设置数据源
export const setDatabaseTypes = (data = []) => {
  localStorage.setItem('DatabaseTypes', JSON.stringify(data))
}
// 支持的数据源
export const getDatabaseTypes = (mapping = false) => {
  let str = localStorage.getItem('DatabaseTypes')
  let result = str ? JSON.parse(str) : []
  if (mapping) {
    let obj = {}
    result.forEach(el => {
      obj[el.type] = el.name
    })
    return obj
  }
  return result
}

// 500错误弹窗
export const errorConfirmFnc = error => {
  let msg = `<div>${i18n.t('RequestErrorMessage_error_title')}</div>`
  let title = i18n.t('confirm_error_tip')
  error = typeof error === 'object' ? error : {}
  let code = error.code
  let reqId = error.data?.reqId
  if (code) {
    msg += `<div class="mt-1">${i18n.t(
      'RequestErrorMessage_code_label'
    )}<span class="color-disable">${code}</span></div>`
  }
  if (reqId) {
    msg += `<div class="mt-1">${i18n.t(
      'RequestErrorMessage_req_id_label'
    )}<span class="color-disable">${reqId}</span></div>`
  }
  if (error.message) {
    const mm = `${i18n.t('RequestErrorMessage_error_detail_label')}${i18n.t(
      'field_mapping_field_mapping_dialog_'
    )}<span class="color-disable" style="
    line-height: 18px;
">${error.message}</span>`
    msg += `<div class="error-confirm-fold mt-1">
                <input type="checkbox" id="errorConfirm" style="display: none" />
                <div class="error-confirm-fold-content text-truncate">${mm}</div>
                <label for="errorConfirm" class="color-primary cursor-pointer text-nowrap">${i18n.t(
                  'verify_Details_zhanKai'
                )}</label>
              </div>`
  }
  confirm(msg, title, {
    type: 'error',
    iconSize: 18,
    dangerouslyUseHTMLString: true,
    confirmButtonText: i18n.t('confirm_reload_label'),
    cancelButtonText: i18n.t('button_close')
  }).then(flag => {
    if (flag) {
      location.reload()
    }
  })
}

export const buried = (code, page, attrs) => {
  let userInfo = window.__USER_INFO__ || {}
  let data = {
    user_id: userInfo.user_id,
    code,
    page
  }
  if (attrs) {
    data.attrs = attrs
  }
  console.log('buried', JSON.stringify(data))

  window.axios.get('api/tcm/user/behavior?data=' + encodeURIComponent(JSON.stringify(data))).then(res => {
    console.log('res', res)
  })
}
