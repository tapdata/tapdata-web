<script>
import mixins from './mixin'
export default {
  name: 'FbRadio',
  mixins: [mixins],
  props: {
    value: [String, Number, Boolean],
    config: {
      require: true,
      type: Object
    }
  },
  data() {
    return {
      defaultConfig: {
        border: true,
        isVertical: true
      }
    }
  },
  render(h) {
    let self = this
    let config = Object.assign(self.defaultConfig, self.config)
    if (!config.options) {
      config.options = []
      throw new Error(`The component "FbRadio" is not config options!`)
    }
    let tip = config.options.find(item => item.value === this.value)?.tip || ''
    const outerTip = !!config.outerTip
    let innerTip = true
    if (config.innerTip !== undefined) {
      innerTip = config.innerTip
    }
    let arr = [
      h(
        'ElRadioGroup',
        {
          class: {
            'fb-radio': true,
            'radio-border': config.border,
            verical: config.isVertical,
            'radio-button': !!config.button
          },
          props: {
            value: self.value
          },
          on: self.on
        },
        config.options.map(opt => {
          let optArr = [h('span', opt.label)]
          if (innerTip && opt.tip && config.isVertical && config.border) {
            optArr.push(
              h(
                'div',
                {
                  class: 'fb-radio-option-tip'
                },
                opt.tip
              )
            )
          }
          return h(
            config.button ? 'ElRadioButton' : 'ElRadio',
            {
              class: {
                'fb-radio-option': true
              },
              props: {
                label: opt.value,
                disabled: opt.disabled,
                border: config.border
              }
            },
            optArr
          )
        })
      )
    ]
    if (outerTip && tip) {
      arr.push(
        h('div', { class: 'fb-radio-tip' }, [
          h('i', { class: 'el-icon-info color-primary' }),
          h('span', { class: 'fb-radio-tip__text' }, tip)
        ])
      )
    }
    return h('div', { class: 'fb-radio-group' }, arr)
  }
}
</script>

<style lang="scss">
.fb-radio {
  display: flex;
  width: 100%;
  .fb-radio-option {
    display: flex;
    height: 100%;
    padding: 0 10px;
    .el-radio__input {
      height: 28px;
      line-height: 28px;
      .el-radio__inner {
        vertical-align: middle;
      }
    }
    .el-radio__label {
      line-height: 28px;
      .fb-radio-option-tip {
        margin-bottom: 10px;
        color: #aaa;
        font-size: 12px;
        line-height: 14px;
        white-space: pre-wrap;
        word-break: break-word;
        font-weight: normal;
      }
    }
  }
  &.radio-border {
    display: flex;
    justify-content: space-between;
    .fb-radio-option {
      max-width: 50%;
      flex: 1;
      margin-right: 10px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &.verical.radio-border {
    display: block;
    .fb-radio-option {
      width: 100%;
      max-width: none;
      max-width: unset;
      flex: unset;
      margin-right: 0;
      height: 100%;
    }
    .el-radio.is-bordered + .el-radio.is-bordered {
      margin-top: 16px;
      margin-left: 0;
    }
  }
  &.radio-button {
    display: inline-block;
    .fb-radio-option {
      display: inline-block;
      margin-right: unset;
      padding: 0;
    }
  }
  .el-radio.is-checked {
    border: 2px solid #409eff;
  }
}
.fb-radio-tip {
  i {
    font-size: 14px;
    color: map-get($color, primary);
  }
  .fb-radio-tip__text {
    margin-left: 8px;
    font-size: 12px;
    color: map-get($fontColor, slight);
  }
}
</style>
