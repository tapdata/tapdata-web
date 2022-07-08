import { Cookie } from '@tap/shared'

const BASE_URL = process.env.BASE_URL || '/'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    const accessToken = Cookie.get('token')
    return `${BASE_URL}api/pdk/icon?access_token=${accessToken}&pdkHash=${pdkHash}`
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
  return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
}

export function formatNumber(val, type = 'KMT') {
  let result
  let fixed = 1
  let thousandsIndex = 3
  let reg = new RegExp('(?!^)(?=(\\d{' + thousandsIndex + '})+$)', 'g')
  let symbol = ','
  switch (type) {
    case 'thousands':
      result = String(val).replace(reg, symbol)
      break
    default:
      if (val / (1000 * 1000 * 1000) > 1) {
        result = (val / (1000 * 1000 * 1000)).toFixed(fixed) + 'T'
      } else if (val / (1000 * 1000) > 1) {
        result = (val / (1000 * 1000)).toFixed(fixed) + 'M'
      } else if (val / 1000 > 1) {
        result = (val / 1000).toFixed(fixed) + 'K'
      } else {
        result = val
      }
      break
  }
  console.log('result', result)
  return result
}
