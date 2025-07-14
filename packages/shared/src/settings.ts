let settings: Record<string, any> = {}

export const getSettings = () => {
  return Object.values(settings)
}

export const setSettings = (data: Record<string, any>[] = []) => {
  settings = {}

  data.forEach((setting) => {
    setting.value = setting.isArray ? setting.value.split(',') : setting.value
    settings[setting.key] = setting
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
