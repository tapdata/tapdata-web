declare interface Window {
  getSettingByKey: any
  __settings__: {
    key: string
    open: boolean
  }[]
}
