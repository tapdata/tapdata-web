<script>
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
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
  render() {
    let self = this
    let config = self.config
    const tip = self.config?.tip || ''
    let arr = [
      Vue.h(
        'ElInput',
        plantRenderPara({
          attrs: {
            maxlength: config.maxlength,
            placeholder:
              config.placeholder ||
              `${self.$t('packages_component_formBuilder_input_placeholderPrefix')}${config.label || ''}`
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
      )
    ]
    if (tip) {
      arr.push(
        Vue.h('div', plantRenderPara({ class: 'fb-switch-tip' }), [
          Vue.h('i', plantRenderPara({ class: 'el-icon-info' })),
          Vue.h('span', plantRenderPara({ class: 'fb-switch-tip__text' }), tip)
        ])
      )
    }
    return Vue.h('div', plantRenderPara({ class: 'input-item' }), arr)
  },
  emits: ['update:value']
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
