<template>
  <section class="operation-logs-wrapper g-panel-container" v-if="$route.name === 'order'">
    <el-tabs class="flex flex-column overflow-hidden" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane class="order-flex overflow-hidden h-100" label="我的订阅" name="first">
        <div class="main">
          <div class="list-operation">
            <div class="list-operation-left flex justify-content-between">
              <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
              <ElButton type="primary" @click="handleCreateAgent" :disabled="$disabledReadonlyUserBtn()">
                <span>{{ $t('dfs_order_list_xinzengdingyue') }}</span>
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
            <template #agentType="{ row }">
              <span>{{ agentTypeMap[row.agentType || 'local'] }}</span>
            </template>
            <template #bindAgent="{ row }">
              <ElLink v-if="row.agentId && row.status === 'pay'" type="primary" @click="handleAgent(row)">{{
                row.agentId
              }}</ElLink>
              <span v-else>-</span>
            </template>
            <template #operation="{ row }">
              <ElButton
                v-if="['expire', 'pay', 'cancelSubscribe'].includes(row.status) && row.type === 'one_time'"
                type="text"
                @click="handleRenew(row)"
                >{{ $t('public_button_renew') }}</ElButton
              >
              <ElButton v-if="['payFail', 'unPay'].includes(row.status)" type="text" @click="handlePay(row)">{{
                $t('public_button_pay')
              }}</ElButton>
            </template>
          </VTable>
        </div>
      </el-tab-pane>
      <el-tab-pane class="order-flex flex-column overflow-hidden h-100" label="授权码" name="second">
        <section class="flex flex-column overflow-hidden">
          <div class="mt-2 flex justify-content-end">
            <el-button class="mr-2" @click="goReceipt">{{ $t('dfs_user_center_kaifapiao') }}</el-button>
            <el-button type="primary" @click="goLicense">{{
              $t('dfs_aliyun_market_checklicnese_jihuoshouquanma')
            }}</el-button>
          </div>
          <VTable
            :columns="codeColumns"
            :remoteMethod="codeRemoteMethod"
            :page-options="{
              layout: 'total, ->, prev, pager, next, sizes, jumper'
            }"
            ref="tableCode"
            class="mt-4"
          >
            <template #agentType="{ row }">
              <span>{{ agentTypeMap[row.agentType || 'local'] }}</span>
            </template>
            <template #bindAgent="{ row }">
              <ElLink v-if="row.agentId" type="primary" @click="handleAgent(row)">{{
                $t('dfs_instance_selectlist_yibangding') + ' ' + $t('public_agent') + ' : ' + row.agentId
              }}</ElLink>
              <span v-else>{{ $t('user_Center_weiBangDing') }}</span>
            </template>
            <template #operation="{ row }">
              <ElButton type="text" @click="handleRenewal(row)">{{ $t('public_button_renewal') }}</ElButton>
            </template>
          </VTable>
        </section>
      </el-tab-pane>
    </el-tabs>

    <!--转账支付-->
    <transferDialog :visible.sync="showTransferDialogVisible" :price="pricePay"></transferDialog>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { FilterBar, VTable } from '@tap/component'
import transferDialog from '../agent-download/transferDialog'
import { openUrl } from '@tap/shared'

import i18n from '@/i18n'
import { isEmpty } from '@/util'
import { CURRENCY_SYMBOL_MAP, NUMBER_MAP, ORDER_STATUS_MAP, TIME_MAP } from '@tap/business'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import dayjs from 'dayjs'

export default {
  components: { FilterBar, VTable, transferDialog },
  inject: ['buried'],
  data() {
    return {
      activeName: 'first',
      loading: true,
      showTransferDialogVisible: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        agentDeploy: '',
        status: ''
      },
      search: '',
      filterItems: [],
      //授权码
      codeColumns: [
        {
          label: i18n.t('dfs_instance_selectlist_shouquanma'),
          prop: 'licenseCode'
        },
        {
          label: i18n.t('dfs_user_center_jihuoshijian2'),
          prop: 'activateTimeLabel',
          width: 320
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('dfs_user_center_guoqishijian2'),
          prop: 'expiredTimeLabel',
          width: 320
        },
        {
          label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
          prop: 'bindAgent',
          slotName: 'bindAgent'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'extendArray',
          slotName: 'operation',
          width: 100
        }
      ],
      columns: [
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
          label: i18n.t('dfs_user_center_dingyueshuliang'),
          prop: 'quantity'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'priceLabel'
        },
        {
          label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
          prop: 'agentId',
          slotName: 'bindAgent'
        },
        {
          label: i18n.t('task_monitor_status'),
          prop: 'statusLabel'
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
      if (route.name === 'order') {
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
          label: i18n.t('dfs_order_list_dingyuezhuangtai'),
          key: 'status',
          type: 'select-inner',
          items: [
            {
              label: this.$t('public_select_option_all'),
              value: ''
            },
            {
              label: this.$t('packages_business_shared_const_weizhifu'),
              value: 'unPay'
            },
            {
              label: this.$t('packages_business_shared_const_yizhifu'),
              value: 'pay'
            },
            {
              label: this.$t('packages_business_shared_const_zhifushibai'),
              value: 'payFail'
            },
            {
              label: this.$t('packages_business_shared_const_yituikuan'),
              value: 'refund'
            },
            {
              label: this.$t('packages_business_shared_const_tuikuanshibai'),
              value: 'refundFail'
            },
            {
              label: this.$t('packages_business_shared_const_tuikuanzhong'),
              value: 'refunding'
            },
            {
              label: this.$t('packages_business_shared_const_shixiao'),
              value: 'expire'
            },
            {
              label: this.$t('packages_business_shared_const_yiquxiao'),
              value: 'cancelSubscribe'
            }
          ],
          selectedWidth: '200px'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          key: 'agentType',
          type: 'select-inner',
          items: [
            {
              label: this.$t('public_select_option_all'),
              value: ''
            },
            {
              label: this.$t('dfs_instance_utils_quantuoguan'),
              value: 'Cloud'
            },
            {
              label: this.$t('dfs_instance_utils_bantuoguan'),
              value: 'Local'
            }
          ]
        }
      ]
    },
    //我的订阅
    remoteMethod({ page }) {
      let { current, size } = page
      let { agentType, status } = this.searchParams
      let where = {
        status: {
          $ne: 'invalid' //过滤 invild
        }
      }
      agentType && (where.agentType = agentType)
      status && (where.status = status)
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
    //续订
    handleRenew(row = {}) {
      const { period, periodUnit } = row
      const label =
        NUMBER_MAP[period] +
        (i18n?.locale === 'en' ? ' ' : '') +
        (periodUnit === 'year' ? i18n.t('public_time_year') : i18n.t('dfs_instance_utils_geyue'))
      this.$confirm(
        i18n.t('dfs_user_center_ninjiangxudingr', {
          val1: row.content,
          val2: label
        }),
        i18n.t('dfs_user_center_xudingfuwu'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(res => {
        if (res) {
          const { agentId } = row
          const params = {
            agentId,
            successUrl: location.href,
            cancelUrl: location.href
          }
          this.buried('renewAgentStripe')
          this.$axios
            .post('api/tcm/orders/renew', params)
            .then(data => {
              openUrl(data.paymentUrl)
              this.buried('renewAgentStripe', '', {
                result: true
              })
            })
            .catch(() => {
              this.buried('renewAgentStripe', '', {
                result: false
              })
            })
        }
      })
    },
    //支付
    handlePay(row = {}) {
      this.buried('payAgentStripe')
      if (row.paymentType === 'offline') {
        this.showTransferDialogVisible = true
        this.pricePay = row.formatPrice
      } else {
        openUrl(row.payUrl)
        this.$confirm(
          i18n.t('dfs_user_center_ninjiangzhifur', { val1: row.content }),
          i18n.t('dfs_user_center_zhifufuwu'),
          {
            type: 'warning',
            confirmButtonText: i18n.t('dfs_instance_create_zhifuwancheng')
          }
        ).then(() => {
          this.$refs.table?.fetch()
        })
      }
    },
    handleCreateAgent() {
      this.$router.push({
        name: 'createAgent'
      })
      this.buried('newAgentStripeDialog')
    },
    handleAgent(row = {}) {
      this.$router.push({
        name: 'Instance',
        query: {
          keyword: row.agentId
        }
      })
    },
    codeRemoteMethod() {
      return this.$axios.get('api/tcm/aliyun/market/license/list').then(data => {
        const items = data.items || []
        return {
          total: data.total,
          data:
            items.map(t => {
              let activateTime = new Date(t.activateTime.replace('Z', '+08:00')).toLocaleString()
              let expiredTime = new Date(t.expiredTime.replace('Z', '+08:00')).toLocaleString()
              t.activateTimeLabel = t.activateTime ? dayjs(activateTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              t.expiredTimeLabel = t.expiredTime ? dayjs(expiredTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              return t
            }) || []
        }
      })
    },
    goLicense() {
      this.$router.push({
        name: 'aliyunMarketLicense'
      })
    },
    goReceipt() {
      const href = 'https://market.console.aliyun.com/receipt/index.htm'
      openUrl(href)
    },
    handleRenewal() {
      this.buried('goRenewalAliyunCode')
      const href = 'https://market.console.aliyun.com/imageconsole/index.htm'
      openUrl(href)
    }
  }
}
</script>

<style lang="scss" scoped>
.order-flex {
  display: flex;
}
.operation-logs-wrapper {
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
}
::v-deep {
  .el-dropdown-menu__item.dropdown-item--disabled {
    color: map-get($color, disable);
    cursor: default;
    &:hover {
      background: unset;
      color: map-get($color, disable);
    }
  }
}
</style>
