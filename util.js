export const uuid = function () {
  // credit: http://stackoverflow.com/posts/2117523/revisions

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0
    var v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getConnectionTypeImg = function (type) {
  try {
    return require(`./assets/icons/node/${type}.svg`)
  } catch (e) {
    return null
  }
}
export const getConnectionTypeDialogImg = function (type) {
  try {
    return require(`./assets/icons/node/${type}.svg`)
  } catch (e) {
    return null
  }
}

let timeout = null
export function delayTrigger(func, t) {
  if (t) {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func && func()
      timeout = null
    }, t)
  } else {
    func && func()
  }
}

export function toRegExp(word) {
  let arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-']
  for (let i = 0; i < arr.length; i++) {
    let str = '\\' + arr[i]
    word = word.replace(new RegExp(str, 'g'), '\\' + arr[i])
  }
  return word
}
// @params1: time 2021-12-29 16:29:58
export function splitTime(time, type) {
  let result = time
  switch (type) {
    case 'second':
      result = time.substring(11, 19)
      break
    case 'minute':
      result = time.substring(11, 16)
      break
    case 'hour':
      result = time.substring(11, 16)
      break
    case 'day':
      result = time.substring(6, 10)
  }
  return result
}
