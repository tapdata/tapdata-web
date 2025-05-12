<script>
import { h } from 'vue'
import { plantRenderPara } from '../../../utils/gogocodeTransfer'
export default {
  props: {
    record: {
      type: Object,
      required: true,
    },
  },
  render() {
    const record = this.record
    const activeTextStyle = 'color: #2C65FF; padding-right: 5px;'
    return h(
      'div',
      plantRenderPara({
        class: 'user-operation-wrap',
      }),
      [
        `${this.$t('notification_account')} `,
        h(
          'span',
          plantRenderPara({ style: activeTextStyle }),
          record.username || record.email,
        ),
        this.$t(`notification_operation_${record.operation}`),
        `${this.$t(`notification_modular_${record.modular}`)} `,
        h(
          'span',
          plantRenderPara({ style: activeTextStyle }),
          record.parameter1,
        ),
      ],
    )
  },
}
</script>

<style lang="scss" scoped>
.user-operation-wrap {
  display: inline-block;
  color: map.get($fontColor, light);
}
</style>
