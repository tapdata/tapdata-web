import { h, toRaw } from '@vue/composition-api'

export const resolveComponent = (child, props) => {
  if (child) {
    if (typeof child === 'string' || typeof child === 'number') {
      return child
    } else if (typeof child === 'function') {
      return child(props)
    } else {
      return h(toRaw(child), { props })
    }
  }

  return null
}
