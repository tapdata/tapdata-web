import { Fragment, h } from '@formily/vue'
import { defineComponent, onBeforeUnmount } from 'vue'

const PortalMap = new Map()

export const createPortalProvider = (id) => {
  const Portal = defineComponent({
    name: 'ProtalProvider',
    props: {
      id: {
        type: [String, Symbol],
        default: id,
      },
    },

    setup(props) {
      onBeforeUnmount(() => {
        const { id } = props
        if (id && PortalMap.has(id)) {
          PortalMap.delete(id)
        }
      })
    },

    render() {
      const { id } = this
      if (id && !PortalMap.has(id)) {
        PortalMap.set(id, this)
      }

      return h(Fragment, {}, this.$slots)
    },
  })

  return Portal
}

export function getProtalContext(id) {
  return PortalMap.get(id)
}
