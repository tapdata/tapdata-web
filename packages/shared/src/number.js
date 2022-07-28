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
        list = ['ms', 's', 'm', 'h', 'd', 'M', 'Y']
        break
      // 数量
      default:
        list = ['', 'K', 'M', 'T']
        break
    }
  }

  let i = 0
  let num = val
  let util = ''
  let res = []
  const f = Math.pow(10, fix)
  while (num > 1 && i < list.length) {
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
    i++
    util = list[i]
  }
  if (res.length) {
    return res.join('')
  }
  return num + util
}
