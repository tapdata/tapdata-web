import { connect, mapProps } from '@formily/vue'

const ElCol = {
  functional: true,
  props: ['flex'],
  render(h, context) {
    const data = context.data
    return h(
      'el-col',
      { ...data, style: { flex: context.props.flex } },
      context.children
    )
  }
}

export const Col = connect(ElCol, mapProps({}))
