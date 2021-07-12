import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

// const ElRow = getComponentByTag('el-row')

const ElRow = {
  functional: true,
  props: ['gap'],
  render(h, context) {
    return h(
      'el-row',
      { ...context.data, style: { gap: context.props.gap } },
      context.children
    )
  }
}

export const Row = ElRow
