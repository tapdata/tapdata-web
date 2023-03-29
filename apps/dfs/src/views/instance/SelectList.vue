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
        <ElButton type="text" @click="submit(row)">创建</ElButton>
      </template>
    </VTable>

    <span slot="footer" class="dialog-footer">
      <template v-if="type === 'code'">
        <ElButton size="mini" type="primary" @click="goLicense">激活授权码</ElButton>
        <ElButton size="mini" type="primary" @click="handleCreateCode">购买新实例</ElButton>
      </template>
      <ElButton v-else size="mini" type="primary" @click="create">创建新实例</ElButton>
    </span>
  </ElDialog>
</template>

<script>
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
          title: '选择授权码?',
          desc: '授权码是在阿里云市场购买生成的授权码',
          columns: [
            {
              type: 'index'
            },
            {
              label: '授权码',
              prop: 'licenseCode'
            },
            {
              label: '有效期',
              prop: 'expiredTime',
              dataType: 'time'
            },
            {
              label: '实例规格',
              prop: 'specLabel'
            },
            {
              label: '绑定实例状态',
              prop: 'bindAgent'
            },
            {
              label: '操作',
              prop: 'operation',
              slotName: 'operation',
              width: 80
            }
          ]
        },
        order: {
          title: '选择订阅？',
          desc: '可以选择已有未使用的订阅创建实例，可以创建新实例选择更多规格',
          columns: [
            {
              type: 'index'
            },
            {
              label: '订阅内容',
              prop: 'content'
            },
            {
              label: '订阅周期',
              prop: 'periodLabel',
              width: 320
            },
            {
              label: '绑定实例状态',
              prop: 'bindAgent'
            },
            {
              label: '操作',
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
              t.bindAgent = t.agentId ? '已绑定' + t.agentId : '未绑定'
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
            t.content = `${getPaymentMethod(t)} ${getSpec(t.spec)} 实例`
            const { periodStart, periodEnd } = t
            t.periodLabel =
              dayjs(periodStart).format('YYYY-MM-DD HH:mm:ss') + ' - ' + dayjs(periodEnd).format('YYYY-MM-DD HH:mm:ss')
            t.bindAgent = t.agentId ? '已绑定' + t.agentId : '未绑定'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.v-table {
  height: 400px;
}
</style>
