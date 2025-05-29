import { getCurrentInstance } from 'vue'

export function useHas() {
  const instance = getCurrentInstance()
  const $has = instance?.appContext.config.globalProperties.$has
  if (!$has) {
    console.warn('$has is not defined on globalProperties')
  }
  return $has
}
