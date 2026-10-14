import { h } from 'vue'
import { ElTooltip } from 'element-plus'

export const InnerInput = {
  name: 'InnerInput',
  props: ['value', 'readOnly'],
  emits: ['change'],
  inheritAttrs: false,
  data() {
    return {
      val: null,
    }
  },
  watch: {
    value(val) {
      this.val = val
    },
  },
  created() {
    this.val = this.value
  },
  render() {
    return h(
      ElTooltip,
      { content: this.val || '', placement: 'top', showAfter: 200 },
      {
        default: () =>
          h('input', {
            ...this.$attrs,
            class: ['px-1', this.$attrs.class],
            readOnly: this.readOnly,
            value: this.val,
            onInput: (ev) => {
              this.val = ev.target.value
            },
            onChange: (ev) => this.$emit('change', ev),
          }),
      },
    )
  },
}
