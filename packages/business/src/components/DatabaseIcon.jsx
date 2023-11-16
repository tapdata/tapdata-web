import { defineComponent } from 'vue'
import { getNodeIconSrc } from '../shared'

export const DatabaseIcon = defineComponent({
  props: {
    item: Object,
    size: Number,
  },
  setup(props, { attrs }) {
    const _attrs = { ...attrs, src: getNodeIconSrc(props.item) }
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
