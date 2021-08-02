const ElRow = {
  functional: true,
  props: ['gap'],
  render(h, context) {
    return h('el-row', { ...context.data, style: { gap: context.props.gap } }, context.children)
  }
}

export const Row = ElRow
