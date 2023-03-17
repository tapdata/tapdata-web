/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2022/4/18
 * @description
 */
import i18n from '@/i18n'
export function handleUnit(limit) {
  if (!limit) return 0
  var size = ''
  if (limit < 0.1 * 1024) {
    //小于0.1KB，则转化成B
    size = limit.toFixed(1) + 'B'
  } else if (limit < 0.1 * 1024 * 1024) {
    //小于0.1MB，则转化成KB
    size = (limit / 1024).toFixed(1) + 'KB'
  } else if (limit < 0.1 * 1024 * 1024 * 1024) {
    //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(1) + 'M'
  } else {
    //其他转化成GB
    size = (limit / (1024 * 1024 * 1024)).toFixed(1) + 'G'
  }

  var sizeStr = size + '' //转成字符串
  var index = sizeStr.indexOf('.') //获取小数点处的索引
  var dou = sizeStr.substr(index + 1, 1) //获取小数点后一位的值
  if (dou === '00') {
    //判断后两位是否为00，如果是则删除0
    return sizeStr.substring(0, index) + sizeStr.substr(index + 2, 1)
  }
  return size
}
// 毫秒换算成时分秒
export const formatMs = (msTime = 0, type = 'time') => {
  let time = msTime / 1000
  let arr = []
  arr.push({
    label: 'd',
    value: Math.floor(time / 60 / 60 / 24)
  }) // day
  arr.push({
    label: 'h',
    value: Math.floor(time / 60 / 60) % 24
  }) // hour
  arr.push({
    label: 'm',
    value: Math.floor(time / 60) % 60
  }) // minute
  arr.push({
    label: 's',
    value: Math.floor(time) % 60
  }) // second
  let result = ''
  if (type === 'time') {
    result = arr
      .slice(1)
      .map(t => (t.value + '').padStart(2, '0'))
      .join(':')
    return result
  }
  arr.forEach(el => {
    if (el.value) {
      result += el.value + el.label
    }
  })
  if (!result) {
    result = msTime + i18n.t('public_time_ms')
  }
  return result
}
