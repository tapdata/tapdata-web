import Vue from 'vue'

export class Locale {
  constructor(langs = {}, defaultLang = {}) {
    this.merged = false
    this.lang = defaultLang
    this.langs = langs
  }

  format(string) {
    let args

    if (arguments.length === 2 && typeof arguments[1] === 'object') {
      args = arguments[1]
    } else {
      args = new Array(arguments.length - 1)
      for (let i = 1; i < arguments.length; ++i) {
        args[i - 1] = arguments[i]
      }
    }

    if (!args || !args.hasOwnProperty) {
      args = {}
    }

    return string.replace(/\{([0-9a-zA-Z_]+)\}/g, function replaceArg(match, i, index) {
      let result

      if (string[index - 1] === '{' && string[index + match.length] === '}') {
        return i
      } else {
        result = args.hasOwnProperty(i) ? args[i] : null
        if (result === null || result === undefined) {
          return ''
        }

        return result
      }
    })
  }

  i18nHandler() {
    const vuei18n = Object.getPrototypeOf(this || Vue).$t
    if (typeof vuei18n === 'function' && !!Vue.locale) {
      if (!this.merged) {
        this.merged = true
        Vue.locale(Vue.config.lang, Object.assign(this.lang, Vue.locale(Vue.config.lang) || {}, { clone: true }))
      }
      return vuei18n.apply(this, arguments)
    }
  }

  t(path, options) {
    let value = this.i18nHandler.apply(this, arguments)
    if (value !== null && value !== undefined) return value

    const array = path.split('.')
    let current = this.lang

    for (let i = 0, j = array.length; i < j; i++) {
      const property = array[i]
      value = current[property]
      if (i === j - 1) return this.format(value, options)
      if (!value) return ''
      current = value
    }
    return ''
  }

  use(l) {
    this.lang = this.langs[l] || this.lang
  }

  i18n(fn) {
    this.i18nHandler = fn || this.i18nHandler
  }
}
