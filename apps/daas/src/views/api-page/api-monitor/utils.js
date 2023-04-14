/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2022/4/18
 * @description
 */
import i18n from '@/i18n'
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
