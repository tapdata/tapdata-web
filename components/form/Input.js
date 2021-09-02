import { connect, mapProps, mapReadPretty } from '@formily/vue'
import PreviewText from 'web-core/components/form/preview-text'

const ElInput = {
  functional: true,
  render(h, context) {
    const data = context.data
    const append = data.attrs?.append
    data.on.input = context.listeners.change
    if (append) {
      context.children.push(h('template', { slot: 'append' }, append))
      delete data.attrs.append
    }
    return h('el-input', data, context.children)
  }
}

export const Input = connect(ElInput, mapProps({ readOnly: 'readonly' }), mapReadPretty(PreviewText.Input))
