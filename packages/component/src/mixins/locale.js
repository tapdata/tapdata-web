import { locale } from '../index'

export default {
  methods: {
    t(...args) {
      console.log('t', args)
      return locale.t.apply(locale, args)
    }
  }
}
