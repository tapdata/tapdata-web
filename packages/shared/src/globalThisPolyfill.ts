function getGlobalThis() {
  try {
    if (typeof self !== 'undefined') {
      return self
    }
  } catch {}
  try {
    if (typeof globalThisPolyfill !== 'undefined') {
      return globalThisPolyfill
    }
  } catch {}
  try {
    if (typeof global !== 'undefined') {
      return global
    }
  } catch {}
  return new Function('return this')()
}
export const globalThisPolyfill: Window = getGlobalThis()
