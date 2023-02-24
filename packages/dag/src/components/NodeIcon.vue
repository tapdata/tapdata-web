<script>
import * as Vue from 'vue'
import { getNodeIconSrc } from '../util'

export default function render(_props, _context) {
  const context = {
    ..._context,
    props: _props,
    data: _context.attr,
    children: _context.slots
  }
  const { props, data } = context
  const _data = { ...data, props: { src: getNodeIconSrc(props.node) } }
  if (props.size) {
    _data.style = {
      width: props.size + 'px',
      height: props.size + 'px'
    }
  }
  // _data.props = { src: getNodeIconSrc(props.node) }
  return Vue.h('ElImage', _data)
}
</script>
