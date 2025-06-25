import { computed, defineComponent } from 'vue'
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
    const _attrs = { ...attrs }

    const src = computed(() => {
      const pdkHash = props.pdkHash || props.item?.pdkHash || props.node?.pdkHash || props.node?.attrs?.pdkHash
      if (pdkHash) {
        return getConnectionIcon(pdkHash)
      }
      return getNodeIconSrc(props.item || props.node)
    })

    let style

    if (props.size) {
      style = {
        width: props.size + 'px',
        height: props.size + 'px',
      }
    }

    return () => <ElImage style={style} {..._attrs} src={src.value} />
  },
})

export const NodeIcon = DatabaseIcon
