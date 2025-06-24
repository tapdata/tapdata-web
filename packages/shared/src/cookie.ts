const defAttr = { path: '/' }
const defCover = {
  read(value: string) {
    if (value[0] === '"') {
      value = value.slice(1, -1)
    }
    return value.replaceAll(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write(value: string) {
    return encodeURIComponent(value).replaceAll(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent,
    )
  },
}

function set(key: string, value: string, attrs?: Record<string, any>) {
  attrs = Object.assign({}, defAttr, attrs)
  if (typeof attrs.expires === 'number') {
    attrs.expires = new Date(Date.now() + attrs.expires * 864e5)
  }
  if (attrs.expires) {
    attrs.expires = attrs.expires.toUTCString()
  }
  key = defCover.write(key).replaceAll('=', '%3D')
  value = defCover.write(String(value))
  let str = ''
  for (const name of Object.keys(attrs)) {
    if (!attrs[name]) {
      continue
    }
    str += `; ${name}`
    if (attrs[name] === true) {
      continue
    }
    str += `=${attrs[name].split(';')[0]}`
  }
  return (document.cookie = `${key}=${value}${str}`)
}

function get(key: string) {
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const tmp: Record<string, string> = {}
  for (const c of cookies) {
    const parts = c.split('=')
    const value = parts.slice(1).join('=')
    const _key = defCover.read(parts[0] ?? '').replaceAll('%3D', '=')
    tmp[_key] = defCover.read(value)
    if (key === _key) {
      break
    }
  }
  return key ? tmp[key] : tmp
}

export const Cookie = {
  get,
  set,
  remove(key: string, attrs?: Record<string, any>) {
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
