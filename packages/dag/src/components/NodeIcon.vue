<script>
import { getNodeIconSrc } from '../util'

export default {
  functional: true,
  name: 'NodeIcon',
  props: {
    node: Object,
    size: Number
  },
  render(h, { props, data }) {
    const _data = { ...data, props: { src: getNodeIconSrc(props.node) } }

    if (props.size) {
      _data.style = {
        width: props.size + 'px',
        height: props.size + 'px'
      }
    }
    // _data.props = { src: getNodeIconSrc(props.node) }
    return _data.props.src
      ? h('ElImage', _data)
      : h('div', {
          class: 'inline-block',
          ..._data
        })
  }
}
</script>
