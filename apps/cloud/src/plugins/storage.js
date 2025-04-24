class StorageManager {
  constructor(namespace, version) {
    this.namespace = namespace
    this.version = version
    this.init()
  }

  init() {
    const storedVersion = localStorage.getItem(`${this.namespace}_version`)
    if (storedVersion !== this.version) {
      this.migrate(storedVersion)
      localStorage.setItem(`${this.namespace}_version`, this.version)
    }
  }

  migrate(oldVersion) {
    // 数据迁移逻辑
  }

  setItem(key, value) {
    localStorage.setItem(`${this.namespace}_${key}`, JSON.stringify(value))
  }

  getItem(key) {
    const value = localStorage.getItem(`${this.namespace}_${key}`)
    return value ? JSON.parse(value) : null
  }

  removeItem(key) {
    localStorage.removeItem(`${this.namespace}_${key}`)
  }
}

class TipManager {
  constructor(storageManager, namespace = 'tips') {
    this.storageManager = storageManager
    this.namespace = namespace
  }

  getTipKey(feature) {
    return `${this.namespace}_${feature}`
  }

  shouldShowTip(feature) {
    const tipData = this.storageManager.getItem(this.getTipKey(feature))
    if (!tipData) {
      return true
    }

    const { lastShown, version } = tipData
    const currentTime = Date.now()
    const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数

    // 判断提示是否已经显示过或者版本是否一致
    // return currentTime - lastShown > oneDay || version !== this.storageManager.version
    return false
  }

  showTip(feature) {
    if (this.shouldShowTip(feature)) {
      // 显示提示
      console.log(`Showing tip for feature: ${feature}`)
      this.recordTipShown(feature)
    }
  }

  recordTipShown(feature) {
    const tipKey = this.getTipKey(feature)
    const tipData = {
      lastShown: Date.now(),
      version: this.storageManager.version
    }
    this.storageManager.setItem(tipKey, tipData)
  }

  resetTip(feature) {
    this.storageManager.removeItem(this.getTipKey(feature))
  }
}

const FEATURES = {
  serviceUpgrade: {
    // expires: 24 * 60 * 60 * 1000,
    version: '3.10.0'
  }
}

export const storage = new StorageManager('tap', '3.10.0')
export const tipManager = new TipManager(storage)
