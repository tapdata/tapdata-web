<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
export default {
  name: 'ChangeList',
  components: { VTable },
  data() {
    return {
      //变更记录
      changeList: [],
      changeColumns: [
        {
          label: '订阅编号',
          prop: 'productType'
        },
        {
          label: i18n.t('dfs_instance_instance_guige'),
          prop: 'specLabel',
          width: 180
        },
        {
          label: '变更申请时间',
          slotName: 'time',
          width: 180
        },
        {
          label: i18n.t('task_monitor_status'),
          slotName: 'statusLabel'
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price',
          slotName: 'price'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'extendArray',
          slotName: 'operation'
        }
      ]
    }
  },
  mounted() {
    let id = this.$route.query?.id
    this.getChangeList(id)
  },
  methods: {
    getChangeList(id) {
      this.$axios.get('api/tcm/subscribe/' + id + '/change').then(data => {
        this.changeList = data?.items || []
      })
    }
  }
}
</script>

<template>
  <section class="bg-white flex flex-column overflow-hidden flex-1">
    <VTable
      ref="table"
      row-key="id"
      :columns="changeColumns"
      :data="changeList"
      :has-pagination="false"
      class="mt-4 mb-4 ml-4"
    >
      <div class="mt-8" slot="empty">
        <VIcon size="120">no-data-color</VIcon>
        <div class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub">
          <span>{{ $t('public_data_no_data') }}</span>
        </div>
      </div>
    </VTable>
  </section>
</template>

<style scoped lang="scss"></style>
