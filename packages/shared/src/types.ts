const isType =
  (type: string | string[]) =>
  (obj: unknown): boolean =>
    obj != null &&
    (Array.isArray(type) ? type : [type]).some(
      (t) => getType(obj) === `[object ${t}]`,
    )
export const getType = (obj: unknown): string =>
  Object.prototype.toString.call(obj)
export const isFn = isType(['Function', 'AsyncFunction', 'GeneratorFunction'])
export const isWindow = isType('Window')
export const isHTMLElement = (obj: unknown): boolean => {
  if (typeof obj === 'object' && obj !== null) {
    return Boolean(
      (obj as { nodeName?: unknown; tagName?: unknown }).nodeName ||
        (obj as { nodeName?: unknown; tagName?: unknown }).tagName,
    )
  }
  return false
}
export const isArr = Array.isArray
export const isPlainObj = isType('Object')
export const isStr = isType('String')
export const isBool = isType('Boolean')
export const isNum = isType('Number')
export const isObj = (val: unknown): boolean => typeof val === 'object'
export const isRegExp = isType('RegExp')
export const isValid = (val: unknown): boolean =>
  val !== null && val !== undefined
