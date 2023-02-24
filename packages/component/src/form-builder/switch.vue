<script>
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
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
  render() {
    let self = this
    const tip = self.config?.tip || ''
    let arr = [
      Vue.h(
        'ElSwitch',
        plantRenderPara({
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
    return Vue.h('div', plantRenderPara({ class: 'switch-item' }), arr)
  },
  emits: ['update:value']
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
