import { isStr } from '@tap/shared'
import { cloneVNode, useAttrs, type CSSProperties } from 'vue'
export * from './reactive'

/**
 * 复制一个现有VNode对象
 * @param VNode
 * @param props
 * @returns
 */
export const cloneElement = cloneVNode

const css2obj = (css: string) => {
  const r = /(?<=^|;)\s*([^:]+)\s*:\s*([^;]+)\s*/g,
    o = {}
  css.replaceAll(r, (m, p, v) => (o[p] = v))
  return o
}

export const useStyle = () => {
  let { style = {} } = useAttrs()
  if (isStr(style)) {
    style = css2obj(style)
  }
  return style as CSSProperties
}

const isObj = (val: unknown): val is any => typeof val === 'object'
export { isVNode } from 'vue'
