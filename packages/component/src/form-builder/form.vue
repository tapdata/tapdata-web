<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
/**
 * 表单规则设置
 * @template {
 *
 * 		form: {},
 *
 * 		items: [
 * 			{
 * 				type: "类型",   //input,select....
 *				field: "字段名",
 *				label: "字段展示名称"，
 *              required: "是否必填",
 *
 *              //字段标题label的插槽，传一个function，参数为createElement
 * 			}
 * 		]
 *
 * }
 *
 */
import TYPE_MAPPING from './constant'
export default {
  name: 'FormBuilder',
  props: {
    value: Object,
    config: {
      require: true,
      type: Object,
    },
  },
  data() {
    return {
      show: true,
      defaultFormConfig: {
        mode: 'form',
        model: null,
        rules: null,
        inline: false,
        labelPosition: 'top',
        labelWidth: '160px',
        size: 'mini',
        inlineMessage: false,
        disabled: false,
      },
      defaultFormItemConfig: {
        show: true,
        type: 'input',
        field: '',
        label: '',
        domType: 'text',
        required: false,
        clearable: true,
        allowSpace: true,
        on: {},
      },
      form: null,
      itemsConfig: this.config.items.concat(),
      oldValue: {},
    }
  },
  watch: {
    'config.items'(configs) {
      this.itemsConfig = configs.concat()
    },
  },
  render() {
    let formConfig = Object.assign(this.defaultFormConfig, this.config.form, {
      model: this.value,
    })
    let formItems = this.itemsConfig || []

    let el = Vue.h(
      'ElForm',
      plantRenderPara({
        class: 'e-form-builder-container',
        ref: 'form',

        props: Object.assign(formConfig),
      }),
      formItems.map((item, index) => {
        return this.getFormItem(Vue.h, item, formConfig, index)
      })
    )
    if (this.show) {
      return el
    }
    return ''
  },
  methods: {
    validate(callback) {
      return this.$refs.form && this.$refs.form.validate(callback)
    },
    clearValidate() {
      return this.$refs.form && this.$refs.form.clearValidate()
    },
    resetFields() {
      return this.$refs.form && this.$refs.form.resetFields()
    },
    getFormItem(h, itemConfig, formConfig, index) {
      let self = this
      let config = Object.assign({}, this.defaultFormItemConfig, itemConfig)
      let rules = config.rules || []
      let dependOn = config.dependOn
      if (dependOn && dependOn.length) {
        /**
         * dependOn 配置说明：
         *			triggerOptions: 依赖的字段与值
         *						field: 依赖的字段
         *						value: 依赖的值
         *			triggerConfig: 依赖项满足条件后需要更新的配置
         */
        dependOn.forEach((depend) => {
          let triggerOptions = depend.triggerOptions
          let triggerConfig = depend.triggerConfig
          if (
            triggerOptions.every((opt) => opt.value === this.value[opt.field])
          ) {
            config = Object.assign(config, depend.triggerConfig)
            //需要判断本次渲染是否修改的当前值，如果是，则不走dependOn逻辑，
            //否则会导致本次值永远无法修改的情况，无限被triggerConfig.value的值覆盖
            if (
              Object.hasOwnProperty.call(triggerConfig, 'value') &&
              this.oldValue[config.field] === this.value[config.field]
            ) {
              this.value[config.field] = triggerConfig.value
            }
          }
        })
        this.oldValue[config.field] = this.value[config.field]
      }
      //改变必填项的默认提示
      if (config.required && !rules.find((r) => r.required)) {
        rules.push({
          required: true,
          validator(rule, value, callback) {
            if ((!value && value !== 0) || (value && !(value + '').trim())) {
              callback(
                new Error(
                  `${config.label}` +
                    self.$t('packages_component_formBuilder_noneText')
                )
              )
            } else {
              callback()
            }
          },
        })
      }

      let item = h(
        'ElFormItem',
        {
          class: config.customClass
            ? 'e-form-builder-item ' + config.customClass
            : 'e-form-builder-item ',
          style: formConfig.itemStyle,
          props: {
            prop: config.field,
            label: config.label,
            inlineMessage: !!config.inlineMeesage,
            rules: rules.map((r) => {
              let rule = Object.assign({}, r)
              if (rule.validator) {
                rule.validator = rule.validator.bind(this)
              }
              return rule
            }),
          },
          key: config.field || index,
        },
        [
          this.getLabel(h, config, formConfig),
          this.getBody(h, config, formConfig),
        ]
      )
      return config.show ? item : ''
    },
    getLabel(h, config, formConfig) {
      return !config.label
        ? null
        : h(
            'span',
            {
              class: 'e-form-builder-item-label',
              slot: 'label',
            },
            [
              formConfig.labelColon ? config.label + '：' : config.label,
              config.tips &&
                h(
                  'ElPopover',
                  {
                    style: { 'vertical-align': 'middle' },
                    props: {
                      trigger: 'hover',
                      placement: 'top',
                      popperClass: 'e-popover',
                    },
                  },
                  [
                    h('div', {
                      domProps: {
                        innerHTML: config.tips,
                      },
                    }),
                    h(
                      'span',
                      {
                        class: 'color-primary',
                        slot: 'reference',
                      },
                      [
                        h('i', {
                          class: 'el-icon-info e-form-builder-item-tips',
                        }),
                      ]
                    ),
                  ]
                ),
            ]
          )
    },
    getBody(h, config, formConfig) {
      let self = this
      let appendSlot = config.appendSlot
        ? config.appendSlot(h, this.value)
        : null
      let el = null
      if (config.type === 'file' && config.fileNameField) {
        let fileName = self.value[config.fileNameField]
        config.fileName = fileName
      }
      if (config.type === 'slot') {
        el = this.$slots[config.slot] && this.$slots[config.slot]()
      } else if (formConfig.mode === 'text' || config.mode === 'text') {
        el = self.value[config.field]
      } else {
        el = h(TYPE_MAPPING[config.type], {
          props: {
            value: self.value[config.field],
            config: config,
          },
          on: {
            input(val) {
              if (self.value[config.field] === undefined) {
                throw new Error(
                  `The field "${config.field}" of the model is not defined!`
                )
              }
              if (!config.allowSpace) {
                val = val.replace(/\s+/g, '')
              }
              if (config.type === 'file' && config.fileNameField) {
                let file = val
                self.value[config.fileNameField] = file?.name || ''
                val = file?.value || ''
              }
              self.value[config.field] = val
              let influences = config.influences
              if (influences && influences.length) {
                influences.forEach((it) => {
                  if (it.byValue === val) {
                    self.value[it.field] = it.value
                  }
                })
              }
              config.on.input && config.on.input(val)
              $emit(self, 'value-change', {
                field: config.field,
                value: val,
              })
            },
            change(...args) {
              config.on.change && config.on.change(...args)
            },
          },
        })
      }

      if (appendSlot) {
        return h('div', { class: { 'fb-item-group': true } }, [
          el,
          h('div', { class: { 'fb-form-item-append-slot': true } }, [
            appendSlot,
          ]),
        ])
      } else {
        return [el]
      }
    },
    setItemConfig(field, config) {
      let configs = this.itemsConfig
      for (let i = 0; i < configs.length; i++) {
        const c = configs[i]
        if (c.field === field) {
          this.itemsConfig[i] = Object.assign({}, c, config)
        }
      }
    },
    initConfig() {
      this.itemsConfig = this.config.items.concat()
    },
  },
  emits: ['value-change', 'update:value'],
}
</script>

<style lang="scss">
.e-form-builder-container {
  .color-warning {
    color: #e6a23c;
  }
  .e-form-builder-item-label {
    font-size: 14px;
    .e-form-builder-item-tips {
      margin-left: 5px;
      font-size: 14px;
    }
  }
  .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form-item {
    margin-bottom: 32px;
    .el-form-item__error {
      line-height: 20px;
    }
  }
  .fb-item-group {
    display: flex;
    align-items: center;
  }
  .fb-form-item-prepend-slot {
    margin-right: 5px;
  }
  .fb-form-item-append-slot {
    margin-left: 5px;
  }
  .fb-radio-tip__text {
    line-height: 18px;
    color: map-get($fontColor, light);
  }
}
.e-popover {
  max-width: 200px;
  background-color: rgba(0, 0, 0, 0.6) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
.e-popover .popper__arrow {
  // border-color: rgba(0, 0, 0, 0.6) !important;
  filter: drop-shadow(0 2px 12px rgba(255, 255, 255, 0.03));
  &::after {
    border-top-color: rgba(0, 0, 0, 0.6) !important;
  }
}
</style>
