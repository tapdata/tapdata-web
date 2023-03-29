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
      highlight-current-row
      @current-change="handleCurrentChange"
    >
    </VTable>

    <span slot="footer" class="dialog-footer">
      <ElButton size="mini" type="primary" @click="create">创建新订阅</ElButton>
      <ElButton size="mini" type="primary" @click="submit">创建实例</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import { VTable } from '@tap/component'
import { getPaymentMethod, getSpec } from './utils'
import { dayjs } from '@tap/business/src/shared/dayjs'

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
      currentRow: {},
      map: {
        code: {
          title: '选择授权码?',
          desc: '授权码是在阿里云市场购买生成的授权码',
          columns: [
            {
              type: 'selection'
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
              prop: 'extendArray'
            },
            {
              label: '绑定实例状态',
              prop: 'licenseStatus'
            }
          ]
        },
        order: {
          title: '选择订阅？',
          desc: '可以选择已有未使用的订阅创建实例，可以创建新订阅选择更多规格',
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
    init() {},

    codeRemoteMethod() {
      return this.$axios.get('api/tcm/aliyun/market/license/available').then(data => {
        return {
          total: data.length,
          data: data || []
        }
      })
    },

    orderRemoteMethod() {
      return this.$axios.get('api/tcm/paid/plan/queryAvailableSubscribe').then(data => {
        const items =
          data.map((t = {}, i) => {
            t.id = t.id + i
            t.content = `${getPaymentMethod(t)} ${getSpec(t.spec)} 实例`
            const { periodStart, periodEnd } = t
            t.periodLabel =
              dayjs(periodStart).format('YYYY-MM-DD HH:mm:ss') + ' - ' + dayjs(periodEnd).format('YYYY-MM-DD HH:mm:ss')
            t.bindAgent = t.agentId ? '已绑定' + t.agentId : '未绑定'
            return t
          }) || []
        !this.currentRow?.id && this.setCurrent(items[0])
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

    create() {
      this.$emit('create')
      this.handleCancel()
    },

    submit() {
      const map = {
        code: {
          chargeProvider: 'Aliyun',
          licenseId: this.currentRow.id
        },
        order: {
          chargeProvider: 'Stripe',
          subscriptionId: this.currentRow.id
        }
      }
      this.$emit('new-agent', map[this.type])
      this.handleCancel()
    },

    setCurrent(row) {
      this.$nextTick(() => {
        this.$refs.table?.table?.setCurrentRow(row)
      })
    },

    handleCurrentChange(val) {
      this.currentRow = val
    }
  }
}
</script>

<style lang="scss" scoped>
.v-table {
  height: 400px;
  ::v-deep {
    .el-table__row {
      cursor: pointer;
    }
  }
}
</style>
