import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
export default {
  data() {
    let self = this
    return {
      isFirst: true,
      on: {
        input: (...args) => {
          $emit(self, 'update:value', ...args)
          self.config.on &&
            self.config.on.input &&
            self.config.on.input(...args)
        },
        change: (...args) => {
          $emit(self, 'change', ...args)
          self.config.on &&
            self.config.on.change &&
            self.config.on.change(...args)
        },
      },
    }
  },
  mounted() {
    let defaultValue = this.config?.defaultValue
    if (this.isFirst && defaultValue && !this.value) {
      this.on.input(defaultValue)
    }
  },
  emits: ['update:value', 'change'],
}
