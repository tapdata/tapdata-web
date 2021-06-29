const langs = {
  'zh-CN': require('./lang/zh-CN').default,
  'zh-TW': require('./lang/zh-TW').default,
  en: require('./lang/en').default
}

let lang = 'zh-CN'

export const t = function(path) {
  let value = ''
  const array = path.split('.')
  let current = langs[lang]

  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i]
    value = current[property]
    if (i === j - 1) return value
    if (!value) return ''
    current = value
  }
  return ''
}

export const use = function(l) {
  lang = l || lang
}

console.log('1111')

export default { use, t }
