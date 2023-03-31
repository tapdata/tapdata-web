<template>
  <ElDialog
    width="980px"
    append-to-body
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div slot="title" class="mb-6 font-color-dark fs-3 fw-bold">{{ options.title }}</div>
    <p class="mt-n10 mb-4 font-color-sslight">{{ options.desc }}</p>

    <VTable
      :columns="options.columns"
      :remoteMethod="options.remoteMethod"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      :has-pagination="false"
      ref="table"
      class="mt-4 v-table"
    >
      <template #operation="{ row }">
        <ElTooltip v-if="type === 'code'" placement="top" :content="getContent(row)">
          <ElButton type="text" @click="submit(row)">{{ $t('public_button_create') + $t('public_agent') }}</ElButton>
        </ElTooltip>
        <ElButton v-else type="text" @click="submit(row)">{{ $t('public_button_create') }}</ElButton>
      </template>
    </VTable>

    <span slot="footer" class="dialog-footer">
      <template v-if="type === 'code'">
        <ElButton size="mini" type="primary" @click="goLicense">{{
          $t('dfs_aliyun_market_checklicnese_jihuoshouquanma')
        }}</ElButton>
        <ElButton size="mini" type="primary" @click="handleCreateCode">{{
          $t('dfs_instance_selectlist_goumaixinshili')
        }}</ElButton>
      </template>
      <ElButton v-else size="mini" type="primary" @click="create">{{
        $t('dfs_instance_selectlist_chuangjianxinshili')
      }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import i18n from '@/i18n'
import { VTable } from '@tap/component'
import { openUrl } from '@tap/shared'
import { dayjs } from '@tap/business/src/shared/dayjs'

import { getPaymentMethod, getSpec } from './utils'

export default {
  name: 'SelectList',

  components: { VTable },

  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'code'
    }
  },

  data() {
    return {
      visible: false,
      map: {
        code: {
          title: i18n.t('dfs_instance_selectlist_xuanzeshouquanma'),
          desc: i18n.t('dfs_instance_selectlist_shouquanmashizai'),
          columns: [
            {
              type: 'index'
            },
            {
              label: i18n.t('dfs_instance_selectlist_shouquanma'),
              prop: 'licenseCode'
            },
            {
              label: i18n.t('dfs_instance_selectlist_youxiaoqi'),
              prop: 'expiredTime',
              dataType: 'time'
            },
            {
              label: i18n.t('dfs_instance_selectlist_shiliguige'),
              prop: 'specLabel'
            },
            {
              label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
              prop: 'bindAgent'
            },
            {
              label: i18n.t('public_operation'),
              prop: 'operation',
              slotName: 'operation',
              width: 80
            }
          ]
        },
        order: {
          title: i18n.t('dfs_instance_selectlist_xuanzedingyue'),
          desc: i18n.t('dfs_instance_selectlist_keyixuanzeyi'),
          columns: [
            {
              type: 'index'
            },
            {
              label: i18n.t('dfs_instance_selectlist_dingyueneirong'),
              prop: 'content'
            },
            {
              label: i18n.t('dfs_instance_selectlist_dingyuezhouqi'),
              prop: 'periodLabel',
              width: 320
            },
            {
              label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
              prop: 'bindAgent'
            },
            {
              label: i18n.t('public_operation'),
              prop: 'operation',
              slotName: 'operation',
              width: 80
            }
          ]
        }
      }
    }
  },

  computed: {
    options() {
      return Object.assign(this.map[this.type], {
        remoteMethod: this.type === 'code' ? this.codeRemoteMethod : this.orderRemoteMethod
      })
    }
  },

  watch: {
    value(v) {
      this.visible = v
      v && this.init()
    }
  },

  methods: {
    init() {
      this.$refs.table?.fetch()
    },

    codeRemoteMethod() {
      return this.$axios.get('api/tcm/aliyun/market/license/available').then(data => {
        return {
          total: data.length,
          data:
            data.map((t = {}) => {
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              t.specLabel = getSpec(t.spec)
              return t
            }) || []
        }
      })
    },

    orderRemoteMethod() {
      return this.$axios.get('api/tcm/paid/plan/queryAvailableSubscribe').then(data => {
        const items =
          data.map((t = {}) => {
            t.content = `${getPaymentMethod(t)} ${getSpec(t.spec)} ${i18n.t('public_agent')}`
            const { periodStart, periodEnd } = t
            t.periodLabel =
              dayjs(periodStart).format('YYYY-MM-DD HH:mm:ss') + ' - ' + dayjs(periodEnd).format('YYYY-MM-DD HH:mm:ss')
            t.bindAgent = t.agentId
              ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
              : i18n.t('user_Center_weiBangDing')
            return t
          }) || []
        return {
          total: data.length,
          data: items
        }
      })
    },

    handleCancel() {
      this.visible = false
      this.$emit('input', this.visible)
    },

    handleCreateCode() {
      const href =
        'https://market.aliyun.com/products/56024006/cmgj00061912.html?spm=5176.730005.result.4.519c3524QzKxHM&innerSource=search_tapdata#sku=yuncode5591200001'
      openUrl(href)
    },

    create() {
      this.$emit(this.type === 'code' ? 'create-code' : 'create')
      this.handleCancel()
    },

    submit(row = {}) {
      const map = {
        code: {
          chargeProvider: 'Aliyun',
          licenseId: row.id
        },
        order: {
          chargeProvider: 'Stripe',
          subscriptionId: row.id
        }
      }
      this.$emit('new-agent', map[this.type])
      setTimeout(this.handleCancel, 1200)
    },
    goLicense() {
      this.$router.push({
        name: 'aliyunMarketLicense'
      })
    },
    getContent(row = {}) {
      return `使用这个订阅创建 ${row.specLabel} Agent`
    }
  }
}
</script>

<style lang="scss" scoped>
.v-table {
  height: 400px;
}
</style>
