import { isStr } from '@tap/shared'
import { getCurrentInstance } from 'vue-demi'

const css2obj = css => {
  const r = /(?<=^|;)\s*([^:]+)\s*:\s*([^;]+)\s*/g,
    o = {}
  css.replace(r, (m, p, v) => (o[p] = v))
  return o
}

export function useStyle() {
  let {
    vnode: {
      data: { style }
    }
  } = getCurrentInstance()
  if (isStr(style)) {
    style = css2obj(style)
  }
  if (Array.isArray(style)) {
    style = Object.assign({}, ...style)
  }
  return style
}
