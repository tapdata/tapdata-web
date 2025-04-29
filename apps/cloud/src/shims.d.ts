declare interface Window {
  // extend the window
  getSettingByKey: any
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
