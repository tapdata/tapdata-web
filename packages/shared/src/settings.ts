let settings: Record<string, any> = {}

const normalizeSetting = (setting: Record<string, any>) => {
  return {
    ...setting,
    value:
      setting.isArray && typeof setting.value === 'string'
        ? setting.value.split(',')
        : setting.value,
  }
}

export const getSettings = () => {
  return Object.values(settings)
}

export const setSettings = (data: Record<string, any>[] = []) => {
  settings = {}

  data.forEach((setting) => {
    settings[setting.key] = normalizeSetting(setting)
  })
}

export const getSettingByKey = (key: string, path = 'value') => {
  return settings[key]?.[path]
}

export const getSettingsByKeys = (keys: string[] = []) => {
  return keys.reduce((acc: Record<string, any>, key) => {
    acc[key] = getSettingByKey(key)
    return acc
  }, {})
}
