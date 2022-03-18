const isType = type => obj =>
  obj != null && (Array.isArray(type) ? type : [type]).some(t => getType(obj) === `[object ${t}]`)
export const getType = obj => Object.prototype.toString.call(obj)
export const isFn = isType(['Function', 'AsyncFunction', 'GeneratorFunction'])
export const isWindow = isType('Window')
export const isHTMLElement = obj => {
  return obj?.['nodeName'] || obj?.['tagName']
}
export const isArr = Array.isArray
export const isPlainObj = isType('Object')
export const isStr = isType('String')
export const isBool = isType('Boolean')
export const isNum = isType('Number')
export const isObj = val => typeof val === 'object'
export const isRegExp = isType('RegExp')
export const isValid = val => val !== null && val !== undefined
