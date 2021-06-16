import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElSelect = getComponentByTag('el-select')
const ElOption = getComponentByTag('el-option')

const SelectOption = {
  render(h) {
    const props = this.$attrs
    const slots = this.$slots
    const options = props.options || []
    const children =
      options.length !== 0
        ? options.map(option => {
            if (typeof option === 'string') {
              return h(
                ElOption,
                { props: { label: option, value: option } },
                {}
              )
            } else {
              return h(ElOption, { props: option }, {})
            }
          })
        : slots
    return h(ElSelect, { props, on: this.$listeners }, children)
  }
}

export const Select = connect(
  SelectOption,
  mapProps({ dataSource: 'options', loading: true })
)
