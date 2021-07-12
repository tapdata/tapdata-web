import { connect, mapProps } from '@formily/vue'

const SelectOption = {
  render(h) {
    const props = this.$attrs
    const slots = this.$slots
    const {
      options = [],
      itemLabel = 'label',
      itemValue = 'value',
      itemDisabled = 'disabled'
    } = props
    const children =
      options.length !== 0
        ? options.map(option => {
            if (typeof option === 'string') {
              return h(
                'el-option',
                { props: { label: option, value: option } },
                {}
              )
            } else {
              return h(
                'el-option',
                {
                  props: {
                    label: option[itemLabel],
                    value: option[itemValue],
                    disabled: option[itemDisabled]
                  }
                },
                {}
              )
            }
          })
        : slots
    return h('el-select', { props, on: this.$listeners }, children)
  }
}

export const Select = connect(
  SelectOption,
  mapProps({ dataSource: 'options', loading: true })
)
