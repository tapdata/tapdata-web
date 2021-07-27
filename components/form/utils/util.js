import { merge } from '@formily/shared'

export const getComponentByTag = (tag, transformRules, defaultProps) => {
  return {
    functional: true,
    render(h, context) {
      const data = context.data
      if (transformRules) {
        const listeners = transformRules
        Object.keys(listeners).forEach(extract => {
          if (data.on !== undefined) {
            data.on[listeners[extract]] = context.listeners[extract]
          }
        })
      }
      if (defaultProps) {
        data.props = merge(defaultProps, data.props)
      }
      return h(tag, data, context.children)
    }
  }
}
