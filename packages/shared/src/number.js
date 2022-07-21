/**
 * @desc 根据单位换算，除法计算
 * @val Number 需要处理的数字
 * @type Number|Array 可以使用内置单位数组1，或者传递单位数组['B', 'KB', 'M', 'G']
 * @sp Array 被除数，数组内可以多个被除数，比如[60, 60, 24, 30]
 * @fix Number 四舍五入的小数位
 * @return string
 * */
export function calcUnit(val, type, sp = [1000], fix = 1) {
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
        list = ['s', 'm', 'h', 'd', 'M', 'Y']
        break
      // 数量
      default:
        list = ['K', 'M', 'T']
        break
    }
  }

  let i = 0
  let num = val
  let util = ''
  const f = Math.pow(10, fix)
  while (num > 1 && i < list.length) {
    let m = num / (sp[i] ?? sp[0])
    if (m < 1) {
      break
    }
    num = Math.round(m * f) / f
    util = list[i]
    i++
  }
  return num + util
}
