import { isStr, isFn } from './types'
export const instOf = (value, cls) => {
  if (isFn(cls)) return value instanceof cls
  if (isStr(cls)) return window[cls] ? value instanceof window[cls] : false
  return false
}
