<script>
import mixins from './mixin'

export default {
  name: 'FbInput',
  mixins: [mixins],
  props: {
    value: [String, Number],
    config: {
      require: true,
      type: Object
    }
  },
  render(h) {
    let self = this
    let config = self.config
    return h('ElInput', {
      attrs: {
        maxlength: config.maxlength,
        placeholder:
          config.placeholder ||
          `${self.$t('formBuilder.input.placeholderPrefix')}${
            config.label || ''
          }`
      },
      props: {
        value: self.value,
        type: config.domType || 'text',
        clearable: config.clearable,
        disabled: config.disabled || false,
        showPassword: config.showPassword,
        showWordLimit: config.showWordLimit,
        rows: config.rows || '',
        autocomplete: config.domType === 'password' ? 'new-password' : 'off'
      },
      class: {
        'el-input-maxlength': config.showWordLimit
      },
      on: Object.assign({}, this.on, {
        input: (val) => {
          if (config.domType === 'number' && val) {
            val = Number(val)
          }
          self.on.input(val)
        }
      })
    })
  }
}
</script>

<style lang="scss">
.el-input-maxlength {
  .el-input__inner {
    padding-right: 60px;
  }

  &.el-input--suffix .el-input__inner {
    padding-right: 80px;
  }
}
</style>
