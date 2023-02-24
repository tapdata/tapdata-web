<script>
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
import mixins from './mixin'
import TYPE_MAPPING from './constant'

export default {
  name: 'FbGroup',
  mixins: [mixins],
  props: {
    value: [String, Array],
    config: {
      require: true,
      type: Object,
    },
  },
  render() {
    let self = this
    let config = self.config
    let values = this.value || config.items.map(() => '')

    return Vue.h(
      'div',
      plantRenderPara({
        class: 'fb-group',
      }),
      config.items.map((it, index) =>
        Vue.h(TYPE_MAPPING[it.type], {
          class: 'fb-group-item',
          props: {
            value: values[index],
            config: it,
          },
          on: Object.assign({}, this.on, {
            input: (val) => {
              values[index] = val
              this.on.input(values)
            },
          }),
        })
      )
    )
  },
  emits: ['update:value'],
}
</script>

<style lang="scss">
.fb-group {
  display: flex;
  align-items: center;
  width: 100%;
  .fb-group-item {
    margin-right: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
