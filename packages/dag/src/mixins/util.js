import { NODE_TYPE_ICON } from '../constants'
import Cookie from '@tap/shared/src/cookie'
let accessToken = Cookie.get('token')

export default {
  methods: {
    getIcon(node) {
      if (!node) return null
      const attr = Object.assign({}, node.attr || {}, node.attrs || {})
      if (attr.pdkType === 'pdk') {
        return `/api/pdk/icon?access_token=${accessToken}&pdkHash=${attr.pdkHash}`
      }
      let icon = node.type === 'table' ? node.databaseType : NODE_TYPE_ICON[node.type]
      return icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
    }
  }
}
