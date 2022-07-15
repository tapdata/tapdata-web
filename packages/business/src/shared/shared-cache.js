export function getCode(data) {
  let cacheKeys = data?.cacheKeys || ''
  let cacheKeysArr = data?.cacheKeys?.split(',') || []
  return [
    `  var cachedRow = CacheService.getCache('${data.name || 'cachename'}', ${
      cacheKeys.length ? 'record.' + cacheKeysArr.join(', record.') : 'record.category_code'
    })\n  record.category_name = cachedRow.category_name`,
    `record.category_name = CacheService.getCacheItem( '${data.name || 'cachename'}', 'category_name', defaultValue, ${
      cacheKeys.length ? 'record.' + cacheKeysArr.join(', record.') : 'record.category_code'
    })`
  ]
}
