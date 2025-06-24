const defAttr = { path: '/' }
const defCover = {
  read(value) {
    if (value[0] === '"') {
      value = value.slice(1, -1)
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write(value) {
    return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
  },
}

function set(key, value, attrs) {
  attrs = Object.assign({}, defAttr, attrs)
  if (typeof attrs.expires === 'number') {
    attrs.expires = new Date(Date.now() + attrs.expires * 864e5)
  }
  if (attrs.expires) {
    attrs.expires = attrs.expires.toUTCString()
  }
  key = defCover.write(key).replace(/=/g, '%3D')
  value = defCover.write(String(value))
  let str = ''
  for (let name in attrs) {
    if (!attrs[name]) continue
    str += '; ' + name
    if (attrs[name] === true) continue
    str += '=' + attrs[name].split(';')[0]
  }
  return (document.cookie = key + '=' + value + str)
}

function get(key) {
  let cookies = document.cookie ? document.cookie.split('; ') : []
  let tmp = {}
  for (let c of cookies) {
    let parts = c.split('=')
    let value = parts.slice(1).join('=')
    let _key = defCover.read(parts[0]).replace(/%3D/g, '=')
    tmp[_key] = defCover.read(value)
    if (key === _key) break
  }
  return key ? tmp[key] : tmp
}

export const Cookie = {
  get,
  set,
  remove(key, attrs) {
    set(
      key,
      '',
      Object.assign({}, attrs, {
        expires: -1,
      }),
    )
  },
}

export default Cookie
