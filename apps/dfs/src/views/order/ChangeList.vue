<script>
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { VTable } from '@tap/component'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import StatusTag from '../../components/StatusTag.vue'
import { getSpec } from '../instance/utils'
export default {
  name: 'ChangeList',
  components: { StatusTag, VTable, PageContainer },
  data() {
    return {
      //变更记录
      changeList: [],
      changeColumns: [
        {
          label: i18n.t('dfs_change_number'),
          prop: 'id',
          width: 220,
        },
        {
          label: i18n.t('dfs_instance_instance_guige'),
          prop: 'specLabel',
          width: 180,
        },
        {
          label: i18n.t('dfs_change_time'),
          prop: 'createTime',
          width: 180,
        },
        {
          label: i18n.t('task_monitor_status'),
          slotName: 'statusLabel',
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'priceLabel',
        },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
        },
      ],
    }
  },
  mounted() {
    const id = this.$route.query?.id
    this.getChangeList(id)
  },
  methods: {
    getChangeList(id) {
      this.$axios.get(`api/tcm/subscribe/${id}/change`).then((data) => {
        this.changeList = (data?.items || []).map((it) => {
          it.specLabel = getSpec(it.subscribeItems[0].spec) || '-'
          it.createTime = dayjs(it.createAt).format('YYYY-MM-DD HH:mm:ss')
          it.priceLabel = this.formatterPrice(
            it.subscribe.currency,
            it.subscribeItems[0].amount,
          )
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
          maximumFractionDigits: 2,
        })
      )
    },

    openPay(row) {
      this.$router.push({
        name: 'payForChange',
        params: {
          id: row.id,
        },
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <section class="bg-white flex flex-column overflow-hidden flex-1">
      <VTable
        ref="table"
        row-key="id"
        :columns="changeColumns"
        :data="changeList"
        :has-pagination="false"
      >
        <template #statusLabel="{ row }">
          <StatusTag
            type="tag"
            :status="row.status"
            default-status="Stopped"
            target="order"
          />
        </template>
        <template #operation="{ row }">
          <ElButton
            :disabled="row.status !== 'incomplete'"
            text
            @click="openPay(row)"
            >支付</ElButton
          >
        </template>
        <template #empty>
          <div class="mt-8">
            <VIcon size="120">no-data-color</VIcon>
            <div
              class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub"
            >
              <span>{{ $t('public_data_no_data') }}</span>
            </div>
          </div>
        </template>
      </VTable>
    </section>
  </PageContainer>
</template>
