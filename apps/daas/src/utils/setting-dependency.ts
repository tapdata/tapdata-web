export interface DependentSetting {
  key?: string
  value?: unknown
  default_value?: unknown
  open?: unknown
  parent_key?: string
  parent_value?: unknown
}

function getSettingValue(setting: DependentSetting) {
  const value = Object.prototype.hasOwnProperty.call(setting, 'open')
    ? setting.open
    : setting.value

  return value === undefined || value === null || value === ''
    ? setting.default_value
    : value
}

export function isSettingDependencyVisible(
  setting: DependentSetting,
  settingsByKey: Record<string, DependentSetting>,
) {
  if (!setting.parent_key) {
    return true
  }

  const parent = settingsByKey[setting.parent_key]
  if (!parent) {
    return false
  }

  const expectedValue = setting.parent_value ?? 'true'
  return String(getSettingValue(parent)) === String(expectedValue)
}

export function orderSettingsByDependency<T extends DependentSetting>(
  settings: T[],
) {
  const settingsByKey = new Map<string, T>()
  const childrenByParent = new Map<string, T[]>()
  const orderedSettings: T[] = []
  const visited = new Set<T>()

  settings.forEach((setting) => {
    if (setting.key) {
      settingsByKey.set(setting.key, setting)
    }
  })

  settings.forEach((setting) => {
    if (!setting.parent_key || !settingsByKey.has(setting.parent_key)) {
      return
    }

    const children = childrenByParent.get(setting.parent_key) || []
    children.push(setting)
    childrenByParent.set(setting.parent_key, children)
  })

  const appendSettingAndChildren = (setting: T) => {
    if (visited.has(setting)) {
      return
    }

    visited.add(setting)
    orderedSettings.push(setting)
    ;(childrenByParent.get(setting.key || '') || []).forEach(
      appendSettingAndChildren,
    )
  }

  settings.forEach((setting) => {
    if (!setting.parent_key || !settingsByKey.has(setting.parent_key)) {
      appendSettingAndChildren(setting)
    }
  })

  settings.forEach(appendSettingAndChildren)
  return orderedSettings
}
