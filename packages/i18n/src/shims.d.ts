import 'vue-i18n'

declare module 'vue-i18n' {
  interface I18n {
    merge(): void
    t: I18n.global.t
  }
}
