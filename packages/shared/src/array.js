import { isArr, isObj, isStr } from './types'

export const toArr = val => (isArr(val) ? val : val ? [val] : [])

export function each(val, iterator, revert) {
  if (isArr(val) || isStr(val)) {
    if (revert) {
      for (let i = val.length - 1; i >= 0; i--) {
        if (iterator(val[i], i) === false) {
          return
        }
      }
    } else {
      for (let i = 0; i < val.length; i++) {
        if (iterator(val[i], i) === false) {
          return
        }
      }
    }
  } else if (isObj(val)) {
    let key
    for (key in val) {
      if (Object.hasOwnProperty.call(val, key)) {
        if (iterator(val[key], key) === false) {
          return
        }
      }
    }
  }
}

export function map(val, iterator, revert) {
  const res = isArr(val) || isStr(val) ? [] : {}
  each(
    val,
    (item, key) => {
      const value = iterator(item, key)
      if (isArr(res)) {
        res.push(value)
      } else {
        res[key] = value
      }
    },
    revert
  )
  return res
}

export function reduce(val, iterator, accumulator, revert) {
  let result = accumulator
  each(
    val,
    (item, key) => {
      result = iterator(result, item, key)
    },
    revert
  )
  return result
}

export function every(val, iterator, revert) {
  let res = true
  each(
    val,
    (item, key) => {
      if (!iterator(item, key)) {
        res = false
        return false
      }
    },
    revert
  )
  return res
}

export function some(val, iterator, revert) {
  let res = false
  each(
    val,
    (item, key) => {
      if (iterator(item, key)) {
        res = true
        return false
      }
    },
    revert
  )
  return res
}

export function findIndex(val, iterator, revert) {
  let res = -1
  each(
    val,
    (item, key) => {
      if (iterator(item, key)) {
        res = key
        return false
      }
    },
    revert
  )
  return res
}

export function find(val, iterator, revert) {
  let res
  each(
    val,
    (item, key) => {
      if (iterator(item, key)) {
        res = item
        return false
      }
    },
    revert
  )
  return res
}

export function includes(val, searchElement, revert) {
  if (isStr(val)) return val.includes(searchElement)
  return some(val, item => item === searchElement, revert)
}

export function includesWith(val, search) {
  if (isArr(val)) {
    return val.some(item => search(item))
  } else {
    return false
  }
}

export const flat = array => {
  return toArr(array).reduce((buf, item) => {
    if (isArr(item)) return buf.concat(flat(item))
    return buf.concat(item)
  }, [])
}
