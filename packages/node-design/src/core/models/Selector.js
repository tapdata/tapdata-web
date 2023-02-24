const toArray = (target) => Array.from(target || [])

export class Selector {
  #store = new Map()

  #_queryAll(target, selector) {
    if (!target) return []
    const results = toArray(target?.querySelectorAll(selector))
    const cacheKey = selector + '@ALL'
    const caches = this.#store.get(cacheKey)
    if (caches) {
      caches.set(target, results)
    } else {
      this.#store.set(cacheKey, new WeakMap([[target, results]]))
    }
    return results
  }

  // eslint-disable-next-line no-dupe-class-members
  #_query(target, selector) {
    if (!target) return
    const results = target?.querySelector(selector)
    const caches = this.#store.get(selector)
    if (caches) {
      caches.set(target, results)
    } else {
      this.#store.set(selector, new WeakMap([[target, results]]))
    }
    return results
  }

  // eslint-disable-next-line no-dupe-class-members
  #_clean(target, key) {
    const caches = this.#store.get(key)
    if (caches) {
      caches.delete(target)
    }
  }

  queryAll(target, selector) {
    const cacheKey = selector + '@ALL'
    const caches = this.#store.get(cacheKey)
    const results = { current: null }
    if (caches) {
      results.current = caches.get(target)
      if (Array.isArray(results.current)) {
        if (
          results.current.length === 0 ||
          results.current.some((node) => !node.isConnected)
        ) {
          this.#_clean(target, cacheKey)
          return this.#_queryAll(target, selector)
        }
        return results.current
      }
      this.#_clean(target, cacheKey)
      return this.#_queryAll(target, selector)
    } else {
      return this.#_queryAll(target, selector)
    }
  }

  query(target, selector) {
    const caches = this.#store.get(selector)
    const results = { current: null }
    if (caches) {
      results.current = caches.get(target)
      if (results.current && !Array.isArray(results.current)) {
        if (!results.current.isConnected) {
          this.#_clean(target, selector)
          return this.#_query(target, selector)
        }
        return results.current
      }
      this.#_clean(target, selector)
      return this.#_query(target, selector)
    } else {
      return this.#_query(target, selector)
    }
  }
}
