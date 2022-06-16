import { each, isPlainObj, Cookie } from '@tap/shared'

export const lowerSnake = str => {
  return String(str).replace(/\s+/g, '_').toLocaleLowerCase()
}

export const mergeLocales = (target, source) => {
  if (isPlainObj(target) && isPlainObj(source)) {
    each(source, function (value, key) {
      const token = lowerSnake(key)
      const messages = mergeLocales(target[key] || target[token], value)
      target[token] = messages
    })
    return target
  } else if (isPlainObj(source)) {
    const result = Array.isArray(source) ? [] : {}
    each(source, function (value, key) {
      const messages = mergeLocales(undefined, value)
      result[lowerSnake(key)] = messages
    })
    return result
  }
  return source
}

export const getBrowserLanguage = () => {
  let lang = Cookie.get('lang')
  lang = lang ? lang.replace('_', '-') : 'en-US'
  return lang
}
