/**
 * @desc 根据单位换算，除法计算
 * @val Number 需要处理的数字
 * @type Number|Array 可以使用内置单位数组1，或者传递单位数组['B', 'KB', 'M', 'G']
 * @fix Number 四舍五入的小数位，负数则表示不做舍入，将等价换算（携带单位）
 * @sp Array 被除数，数组内可以多个被除数，比如[60, 60, 24, 30]
 * @return string
 * */
export function calcUnit(val, type, fix = 1, sp = [1000]) {
  if ([undefined, null, ''].includes(val)) {
    return ''
  }
  let list
  // 接收传递的单位数组
  if (type instanceof Array) {
    list = type
  } else {
    // 内置单位数组
    switch (type) {
      // 内存
      case 1:
        sp = [1024]
        list = ['B', 'KB', 'M', 'G']
        break
      // 时间
      case 2:
        sp = [1000, 60, 60, 24, 30, 12]
        list = ['ms', 's', 'min', 'h', 'd', 'M', 'Y']
        break
      // 数量
      default:
        list = ['', 'K', 'M', 'T']
        break
    }
  }

  let num = val
  let util = ''
  let res = []
  const f = Math.pow(10, fix)
  for (let i = 0; i < list.length; i++) {
    util = list[i]
    let m = num / (sp[i] ?? sp[0])
    if (m < 1) {
      if (fix < 0) {
        res.unshift(num + util)
      }
      break
    }
    if (fix < 0) {
      res.unshift((num % (sp[i] ?? sp[0])) + util)
      num = Math.floor(m)
    } else {
      num = Math.round(m * f) / f
    }
  }
  if (res.length) {
    return res.join('')
  }
  return num + util
}

/**
 * @desc 时间差换算： 毫秒转年月日时分秒
 * @val Number 需要处理的毫秒
 * @fix Number 需要保留几个单位
 * @digits Number 只有ms单位时，保留几位小数；多个单位默认取整
 * @options.separator String 分割符
 * @options.showMs Boolean
 * @options.autoShowMs Boolean <= 10s 自动显示ms
 * @return string
 * */
export function calcTimeUnit(
  val,
  fix = 1,
  options = {
    separator: ' ',
    showMs: false,
    autoShowMs: false
  }
) {
  const list = ['ms', 's', 'min', 'h', 'd', 'M', 'Y']
  const sp = [1000, 60, 60, 24, 30, 12]
  let result = []
  const power = Math.pow(10, 3)
  let num = val
  const isMs = num / sp[0] < 1
  const ms = Math.round(num * power) / power
  if (!ms) {
    return ms + list[0]
  }
  for (let i = 0; i < list.length; i++) {
    let util = list[i]
    let m = num / sp[i]
    if (m < 1) {
      result.unshift({
        value: isMs ? ms : num,
        util
      })
      break
    }
    result.unshift({
      value: Math.round(num % sp[i]),
      util
    })
    num = Math.round(m)
  }
  let arr = fix < 0 ? result : result.slice(0, fix)
  const findMsIndex = arr.findIndex(t => t.util === 'ms')
  if ((!options.showMs || options.autoShowMs) && findMsIndex >= 1) {
    const s = arr[findMsIndex - 1]
    // 如果 >10s 不需要ms
    if ((options.autoShowMs && s.value > 10) || !options.autoShowMs) {
      s.value++
      arr = arr.slice(0, fix - 1)
    }
  }
  return arr
    .filter(t => t.value)
    .reduce((pre, current) => {
      return pre + (pre ? options.separator : '') + current.value + current.util
    }, '')
}
