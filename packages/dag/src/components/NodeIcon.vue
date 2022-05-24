<script>
import { getNodeIconSrc } from '../util'

export default {
  functional: true,
  name: 'NodeIcon',
  props: {
    node: Object
  },
  render(h, { props, data }) {
    data.props = { src: getNodeIconSrc(props.node) }
    return h('ElImage', data)
  }
}
</script>
