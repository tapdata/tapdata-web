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
    const tip = self.config?.tip || ''
    let arr = [
      h('ElInput', {
        attrs: {
          maxlength: config.maxlength,
          placeholder: config.placeholder || `${self.$t('formBuilder_input_placeholderPrefix')}${config.label || ''}`
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
          input: val => {
            if (config.domType === 'number' && val) {
              val = Number(val)
            }
            self.on.input(val)
          },
          change: val => {
            val = val?.trim()
            self.on.input(val)
          }
        })
      })
    ]
    if (tip) {
      arr.push(
        h('div', { class: 'fb-switch-tip' }, [
          h('i', { class: 'el-icon-info' }),
          h('span', { class: 'fb-switch-tip__text' }, tip)
        ])
      )
    }
    return h('div', { class: 'input-item' }, arr)
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
