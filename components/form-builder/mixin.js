export default {
  data() {
    let self = this
    return {
      on: {
        input: (...args) => {
          self.$emit('input', ...args)
          self.config.on && self.config.on.input && self.config.on.input(...args)
        },
        change: (...args) => {
          self.$emit('change', ...args)
          self.config.on && self.config.on.change && self.config.on.change(...args)
        }
      }
    }
  }
}
