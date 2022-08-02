import { Cookie } from '@tap/shared'
import axios from 'axios'

const BASE_URL = process.env.BASE_URL || '/'

export function getNodeIconSrc(node) {
  if (!node) return
  const pdkHash = node.pdkHash || node.attrs?.pdkHash
  if (pdkHash) {
    const accessToken = Cookie.get('token')
    return `${BASE_URL}${axios.defaults.baseURL + '/'}api/pdk/icon?access_token=${accessToken}&pdkHash=${pdkHash}`
  }
  let icon = node.type === 'table' || node.type === 'database' || node.databaseType ? node.databaseType : node.type
  return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
}
