<script>
import { plantRenderPara } from '../../utils/gogocodeTransfer'
import * as Vue from 'vue'
export default {
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  render() {
    let record = this.record
    let activeTextStyle = 'color: #2C65FF; padding-right: 5px;'
    return Vue.h(
      'div',
      plantRenderPara({
        class: 'user-operation-wrap'
      }),
      [
        this.$t('notification_account') + ' ',
        Vue.h('span', plantRenderPara({ style: activeTextStyle }), record.username || record.email),
        this.$t('notification_operation_' + record.operation),
        this.$t('notification_modular_' + record.modular) + ' ',
        Vue.h('span', plantRenderPara({ style: activeTextStyle }), record.parameter1)
      ]
    )
  }
}
</script>

<style lang="scss" scoped>
.user-operation-wrap {
  display: inline-block;
  color: map-get($fontColor, light);
}
</style>
