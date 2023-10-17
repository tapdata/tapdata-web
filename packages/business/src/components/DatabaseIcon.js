import { defineComponent } from '@vue/composition-api'
import { getConnectionIcon } from '../views/connections/util'

export const DatabaseIcon = defineComponent({
  props: {
    item: Object,
    size: Number
  },
  setup(props, { attrs }) {
    const _attrs = { ...attrs, src: getConnectionIcon(props.item.pdkHash) }
    let style

    if (props.size) {
      style = {
        width: props.size + 'px',
        height: props.size + 'px'
      }
    }

    return () => <ElImage style={style} attrs={{ ..._attrs }} />
  }
})
