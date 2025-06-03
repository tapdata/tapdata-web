let settings = {}

export const getSettings = () => {
  return Object.values(settings)
}

export const setSettings = (data = []) => {
  settings = {}

  data.forEach((setting) => {
    setting.value = setting.isArray ? setting.value.split(',') : setting.value
    settings[setting.key] = setting
  })
}

export const getSettingByKey = (key, path = 'value') => {
  return settings[key]?.[path]
}

export const getSettingsByKeys = (keys = []) => {
  return keys.reduce((acc, key) => {
    acc[key] = getSettingByKey(key)
    return acc
  }, {})
}
