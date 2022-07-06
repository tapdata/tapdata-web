import { provide, inject } from '@vue/composition-api'
import i18n from '@/i18n'

const createI18n = () => ({
  // locale: ref(config.locale),
  // messages: config.messages,
  $t(key) {
    return i18n.t(key)
  }
})

const i18nSymbol = Symbol()

export function provideI18n() {
  provide(i18nSymbol, createI18n())
}
export function useI18n() {
  const i18n: { $t: Function } = inject(i18nSymbol)
  return i18n
}
