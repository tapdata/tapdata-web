type settingItem = {
  isArray: boolean
  key: string
  value: string | string[]
}

declare interface Window {
  getSettingByKey: any
  $vueApp: any
  _TAPDATA_OPTIONS_: object
  __settings__: settingItem[]
  App: object
}
