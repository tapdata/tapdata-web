let settings = {}

const normalizeSetting = (setting) => {
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

export const setSettings = (data = []) => {
  settings = {}

  data.forEach((setting) => {
    settings[setting.key] = normalizeSetting(setting)
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
