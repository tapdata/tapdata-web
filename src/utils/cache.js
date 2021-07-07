const GLOBAL = 'GLOBAL'
export default class Cache {
  _cache = {}

  constructor() {
    // let cacheString = localStorage.getItem('TAPDATA_CACHE');
    // let userId = this.$cookie.get('user_id');
    // if (cacheString && userId) {
    // 	let cache = JSON.parse(cacheString);
    // 	let userCache = cache[userId] || {};
    // 	userCache['TAPDATA_SEARCH_PARAMS'] = Object.assign(
    // 		{},
    // 		userCache['TAPDATA_SEARCH_PARAMS'],
    // 		params
    // 	);
    // 	cache[userId] = userCache;
    // 	cacheString = JSON.stringify(cache);
    // }
    // localStorage.setItem('TAPDATA_CACHE', cacheString);
    let cacheString = localStorage.getItem('TAPDATA_CACHE')
    this._cache = cacheString ? JSON.parse(cacheString) : {}
    window.cache = this
  }
  get(key, isForUser = true) {
    let cache = Object.assign({}, this._cache)
    let scopeCache = cache[GLOBAL]
    if (isForUser) {
      let userId = window.VueCookie.get('user_id')
      if (!userId) {
        throw new Error('Getting cache error, cant not found user id from cookie')
      }
      scopeCache = cache[userId] || {}
    }
    return scopeCache[key]
  }
  set(key, value, isForUser = true) {
    let cache = this._cache
    let scope = GLOBAL
    if (isForUser) {
      let userId = window.VueCookie.get('user_id')
      if (!userId) {
        throw new Error('Getting cache error, cant not found user id from cookie')
      }
      scope = userId
    }
    if (!cache[scope]) {
      cache[scope] = {}
    }
    cache[scope][key] = value
    localStorage.setItem('TAPDATA_CACHE', JSON.stringify(cache))
  }
}
