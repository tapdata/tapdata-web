import { defineComponent } from 'vue'
import { getNodeIconSrc } from '../shared'
import { getConnectionIcon } from '../views/connections/util'

export const DatabaseIcon = defineComponent({
  props: {
    item: Object,
    node: Object,
    size: Number,
    pdkHash: String
  },
  setup(props, { attrs }) {
    const _attrs = { ...attrs, src: getConnectionIcon(props.pdkHash || props.item?.pdkHash || props.node?.pdkHash) }
    let style

    if (props.size) {
      style = {
        width: props.size + 'px',
        height: props.size + 'px',
      }
    }

    return () => <ElImage style={style} {..._attrs} />
  },
})

export const NodeIcon = DatabaseIcon
