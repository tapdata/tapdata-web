import 'requestidlecallback'

export const requestIdle = (callback, options) => {
  return window['requestIdleCallback'](callback, options)
}

export const cancelIdle = id => {
  window['cancelIdleCallback'](id)
}
