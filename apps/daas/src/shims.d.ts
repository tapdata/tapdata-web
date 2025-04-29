/// <reference types="vite/client" />

declare interface Window {
  getSettingByKey: any
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
