import { locale } from '../index'

export default {
  methods: {
    t(...args) {
      return locale.t.apply(locale, args)
    }
  }
}
