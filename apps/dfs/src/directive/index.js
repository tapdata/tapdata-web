import { isFn } from '@tap/shared'

class Cache {
  #seed = 0
  #data = new Map()

  #id() {
    return Date.now().toString(26) + this.#seed++
  }

  add(value, id = this.#id()) {
    this.#data.set(id, value)

    return id
  }

  get(id) {
    return this.#data.get(id)
  }

  delete(id) {
    return this.#data.delete(id)
  }
}

const cache = new Cache()

export function installDirectives(app) {
  app.directive('readonlybtn', {})

  app.directive('clipboard', {
    beforeMount: (el, binding) => {
      const { arg, value } = binding
      const isFnValue = isFn(value)

      if (arg === 'success' && isFnValue) {
        el.dataset.clipboardSuccess = cache.add(value)
        return
      }

      if (arg === 'error' && isFnValue) {
        el.dataset.clipboardError = cache.add(value)
        return
      }

      const onClick = async () => {
        let callbackId = await navigator.clipboard.writeText(value).then(
          () => el.dataset.clipboardSuccess,
          () => el.dataset.clipboardError,
        )
        const callback = cache.get(callbackId)

        callback?.(value, event)
      }

      el.dataset.clipboardClick = cache.add(onClick)
      el.addEventListener('click', onClick)
    },

    unmounted: (el) => {
      const { clipboardClick, clipboardSuccess, clipboardError } = el.dataset

      for (let id of [clipboardClick, clipboardSuccess, clipboardError]) {
        if (id) {
          cache.delete(id)
        }
      }
    },
  })

  app.config.globalProperties.$has = function () {
    return true
  }
  app.config.globalProperties.$disabledByPermission = function () {
    return false
  }
  app.config.globalProperties.$disabledReadonlyUserBtn = function () {
    let domainName = document.domain
    let removeReadonly = localStorage.getItem('removeReadonly')
    if (domainName === 'demo.cloud.tapdata.net' && !removeReadonly) {
      return true
    }
    return false
  }
}
