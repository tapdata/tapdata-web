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
        this.$t('notification.account') + ' ',
        h('span', { style: activeTextStyle }, record.username || record.email),
        this.$t('notification.operation.' + record.operation),
        this.$t('notification.modular.' + record.modular) + ' ',
        h('span', { style: activeTextStyle }, record.parameter1)
      ]
    )
  }
}
</script>

<style scoped lang="scss">
.user-operation-wrap {
  display: inline-block;
  color: #666;
}
</style>
