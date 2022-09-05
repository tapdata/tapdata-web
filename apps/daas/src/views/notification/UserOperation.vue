<script>
export default {
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  render(h) {
    let record = this.record
    let activeTextStyle = 'color: #2C65FF; padding-right: 5px;'
    return h(
      'div',
      {
        class: 'user-operation-wrap'
      },
      [
        this.$t('notification_account') + ' ',
        h('span', { style: activeTextStyle }, record.username || record.email),
        this.$t('notification_operation_' + record.operation),
        this.$t('notification_modular_' + record.modular) + ' ',
        h('span', { style: activeTextStyle }, record.parameter1)
      ]
    )
  }
}
</script>

<style scoped lang="scss">
.user-operation-wrap {
  display: inline-block;
  color: map-get($fontColor, light);
}
</style>
