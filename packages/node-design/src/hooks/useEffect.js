import { onBeforeUnmount, watch } from 'vue-demi'

export function useEffect(func, dependency) {
  const disposes = []

  watch(
    dependency,
    () => {
      disposes.forEach((fn) => fn?.())
      disposes.push(func())
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    disposes.forEach((fn) => fn?.())
  })
}
