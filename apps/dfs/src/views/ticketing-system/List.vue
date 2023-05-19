<template>
  <section class="ticket-system-wrapper g-panel-container" v-if="$route.name === 'TicketSystem'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left flex justify-content-between">
          <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
          <ElButton type="primary">
            <span @click="createDialog = true">新建工单</span>
          </ElButton>
        </div>
      </div>
      <VTable
        :columns="columns"
        :remoteMethod="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        ref="table"
        class="mt-4"
      >
        <template #name="{ row }">
          <span class="cursor-pointer ticket-name ellipsis inline-block" @click="handleDetails(row)">{{
            row.name
          }}</span>
        </template>
        <template #operation="{ row }">
          <ElButton type="text" @click="handleDetails(row)">详情</ElButton>
          <ElButton>关闭</ElButton>
        </template>
      </VTable>
    </div>
    <!--转账支付-->
    <ElDialog title="新建工单" :visible.sync="createDialog" width="620px">
      <span>
        <el-form label-position="top">
          <el-form-item label="选择数据源">
            <el-select v-model="createForm.task" placeholder="请选择选择任务" class="w-100">
              <el-option v-for="item in agentTypeMap" :key="item" :label="item">{{ item }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择任务">
            <el-select v-model="createForm.task" placeholder="请选择选择任务" class="w-100">
              <el-option v-for="item in agentTypeMap" :key="item" :label="item">{{ item }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="问题">
            <el-input v-model="createForm.problem" type="textarea" placeholder="请输入工单金额"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="create">创建</el-button>
      </span>
    </ElDialog>
    <Details ref="details" width="380px"></Details>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { FilterBar, VTable } from '@tap/component'
import Details from './Details'

import i18n from '@/i18n'
import { isEmpty } from '@/util'
import { CURRENCY_SYMBOL_MAP, ORDER_STATUS_MAP, TIME_MAP } from '@tap/business'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import dayjs from 'dayjs'

export default {
  components: { FilterBar, VTable, Details },
  inject: ['buried'],
  data() {
    return {
      loading: true,
      createDialog: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        agentDeploy: '',
        status: ''
      },
      search: '',
      filterItems: [],
      createForm: {
        problem: '',
        task: '',
        connection: ''
      },
      columns: [
        {
          label: '问题',
          prop: 'content'
        },
        {
          label: '工单编号',
          prop: 'periodLabel',
          width: 320
        },
        {
          label: '工单编号',
          prop: 'quantity'
        },
        {
          label: '工单状态',
          prop: 'quantity'
        },
        {
          label: '提交时间',
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'extendArray',
          slotName: 'operation'
        }
      ]
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  created() {
    this.getFilterItems()
  },
  watch: {
    $route(route) {
      if (route.name === 'TicketSystem') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = isEmpty(query) ? undefined : 1
        this.table.fetch(pageNum)
      }
    }
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: '输入工单名称',
          label: '输入工单名称',
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    remoteMethod({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {
        status: {
          $ne: 'invalid' //过滤 invild
        }
      }
      keyword && (where.name = keyword)
      let filter = {
        limit: size,
        skip: size * (current - 1),
        sort: ['createAt desc'],
        where: where
      }
      return this.$axios
        .get(`api/tcm/paid/plan/paidSubscribe?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(data => {
          let items = data.items || []
          return {
            total: data.total,
            data:
              items.map(t => {
                t.statusLabel = ORDER_STATUS_MAP[t.status]
                const { spec, type, periodUnit, period } = t || {}
                t.subscriptionMethodLabel = getPaymentMethod({
                  type,
                  periodUnit,
                  period
                })
                t.agentDeploy = this.agentTypeMap[t.agentDeploy || 'selfHost']
                t.content = `${t.subscriptionMethodLabel} ${getSpec(spec)} ${i18n.t('public_agent')}`
                t.periodLabel =
                  t.status === 'unPay'
                    ? '-'
                    : dayjs(t.periodStart).format('YYYY-MM-DD HH:mm:ss') +
                      ' - ' +
                      dayjs(t.periodEnd).format('YYYY-MM-DD HH:mm:ss')
                t.priceSuffix = t.type === 'recurring' ? '/' + TIME_MAP[t.periodUnit] : ''
                t.formatPrice =
                  CURRENCY_SYMBOL_MAP[t.currency] +
                  (t.price / 100).toLocaleString('zh', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                t.priceLabel = t.formatPrice + t.priceSuffix
                t.bindAgent = t.agentId
                  ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                  : i18n.t('user_Center_weiBangDing')
                return t
              }) || []
          }
        })
    },
    handleDetails(row) {
      this.$refs.details.getData(row.id)
    },
    //提交工单
    create() {}
  }
}
</script>

<style lang="scss" scoped>
.ticket-system-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .operation-logs-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
  }
  .ticket-name {
    &:hover {
      color: map-get($color, primary);
    }
  }
}
</style>
