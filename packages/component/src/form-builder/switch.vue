<script>
import mixins from './mixin'
export default {
  name: 'FbSwitch',
  mixins: [mixins],
  props: {
    value: [Boolean, String, Number],
    config: {
      require: true,
      type: Object
    }
  },
  render(h) {
    let self = this
    const tip = self.config?.tip || ''
    let arr = [
      h('ElSwitch', {
        props: {
          value: self.value,
          disabled: self.config.disabled,
          activeValue: self.config.activeValue,
          inactiveValue: self.config.inactiveValue
        },
        style: {
          'user-select': 'none'
        },
        on: this.on
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
    return h('div', { class: 'switch-item' }, arr)
  }
}
</script>

<style lang="scss">
.fb-switch-tip {
  font-size: 12px;
  color: map-get($fontColor, slight);
  i {
    font-size: 14px;
    color: map-get($color, primary);
  }
  .fb-switch-tip__text {
    margin-left: 8px;
    font-size: 12px;
    color: map-get($fontColor, slight);
  }
}
</style>
