<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
import { getSpec } from '../instance/utils'
import dayjs from 'dayjs'
import StatusTag from '../../components/StatusTag.vue'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
export default {
  name: 'ChangeList',
  components: { StatusTag, VTable },
  data() {
    return {
      //变更记录
      changeList: [],
      changeColumns: [
        {
          label: i18n.t('dfs_change_number'),
          prop: 'id',
          width: 220
        },
        {
          label: i18n.t('dfs_instance_instance_guige'),
          prop: 'specLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_change_time'),
          prop: 'createTime',
          width: 180
        },
        {
          label: i18n.t('task_monitor_status'),
          slotName: 'statusLabel'
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'priceLabel'
        },
        {
          label: i18n.t('public_operation'),
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
        this.changeList = (data?.items || []).map(it => {
          it.specLabel = getSpec(it.subscribeItems[0].spec) || '-'
          it.createTime = dayjs(it.createAt).format('YYYY-MM-DD HH:mm:ss')
          it.priceLabel = this.formatterPrice(it.subscribe.currency, it.subscribeItems[0].amount)
          return it
        })
      })
    },

    formatterPrice(currency, price) {
      if (price === 0) {
        return 0
      }
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },

    openPay(row) {
      this.$router.push({
        name: 'payForChange',
        params: {
          id: row.id
        }
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
      <template #statusLabel="{ row }">
        <StatusTag type="tag" :status="row.status" default-status="Stopped" target="order"></StatusTag>
      </template>
      <template #operation="{ row }">
        <ElButton :disabled="row.status !== 'incomplete'" type="text" @click="openPay(row)">支付</ElButton>
      </template>
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
