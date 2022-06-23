import { connect, mapProps } from '@formily/vue'
import VIcon from '@/components/VIcon'
import Locale from '../mixins/locale'

const CheckboxOption = {
  props: ['option'],
  mixins: [Locale],
  render(h) {
    const props = this.$props
    const slots = this.$slots
    const option = props?.option

    if (option) {
      const children = option.label ? [option.label] : this.$slots

      if (option.tooltip) {
        children.push(
          <el-popover
            class="align-middle ml-1"
            placement="top-start"
            width="400"
            trigger="hover"
            scopedSlots={{
              reference: () => <VIcon color="#999">tishi</VIcon>
            }}
          >
            <span>{this.t(option.tooltip)}</span>
          </el-popover>
        )
      }

      const newProps = {}
      Object.assign(newProps, option)
      newProps.label = option.value
      delete newProps.value
      return h(
        'ElCheckbox',
        {
          attrs: {
            ...props,
            ...newProps
          },
          on: this.$listeners
        },
        children
      )
    }
    return h(
      'ElCheckbox',
      {
        attrs: this.$attrs,
        on: this.$listeners
      },
      slots
    )
  }
}

// export const Checkbox = connect(ElCheckbox)

export const Checkbox = connect(CheckboxOption, mapProps({ title: 'label' }))
