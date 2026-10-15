import { h } from 'vue'

export const InnerInput = {
  name: 'InnerInput',
  props: ['value', 'readOnly'],
  emits: ['change'],
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
    return h('input', {
      class: 'px-1',
      readOnly: this.readOnly,
      value: this.val,
      onInput: (ev) => {
        this.val = ev.target.value
      },
      onChange: (ev) => this.$emit('change', ev),
    })
  },
}
