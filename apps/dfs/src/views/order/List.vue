<template>
  <section class="operation-logs-wrapper g-panel-container" v-if="$route.name === 'order'">
    <el-tabs class="flex flex-column overflow-hidden flex-1" v-model="activeName">
      <el-tab-pane class="order-flex overflow-hidden h-100" :label="$t('dfs_order_list_wodedingyue')" name="first">
        <div class="main" v-loading="loadingSubscribe">
          <div class="list-operation">
            <div class="list-operation-left flex justify-content-between">
              <FilterBar v-model="searchParams" :items="filterItems" @fetch="remoteMethod"> </FilterBar>
              <ElButton type="primary" @click="handleCreateAgent" :disabled="$disabledReadonlyUserBtn()">
                <span>{{ $t('dfs_order_list_xinzengdingyue') }}</span>
              </ElButton>
            </div>
          </div>
          <ul class="mt-4 overflow-auto flex-1">
            <li class="sub-li mb-4" v-for="item in subscribeList" :key="item.id">
              <div class="sub-li-header flex justify-content-between">
                <div>
                  <span class="font-color-dark fw-sub mr-2"
                    >{{ $t('dfs_components_renew_dingyuebianhao') }}{{ item.id }}</span
                  >
                  <el-divider direction="vertical"></el-divider>
                  <span class="font-color-dark fw-sub mr-2"
                    ><span class="font-color-light">{{ $t('dfs_order_list_zongjine') }}</span>
                    {{ formatterPrice(item.currency, item.totalAmount) || 0 }}</span
                  >
                  <el-divider direction="vertical"></el-divider>
                  <span class="font-color-light fw-sub mr-2"
                    ><span>{{ $t('dfs_instance_selectlist_dingyuezhouqi') }}: </span>
                    {{ formatterTime(item.startAt) }} ~ {{ formatterTime(item.endAt) }}</span
                  >
                  <el-divider direction="vertical"></el-divider>
                  <span class="font-color-dark fw-sub mr-2">
                    <StatusTag type="tag" :status="item.status" default-status="Stopped" target="order"></StatusTag
                  ></span>
                </div>
                <div class="flex justify-content-center align-items-center">
                  <ElButton
                    :disabled="
                      !['active'].includes(item.status) || item.totalAmount === 0 || item.subscribeType === 'recurring'
                    "
                    class="mr-2"
                    type="text"
                    @click="openRenew(item)"
                    >{{ $t('public_button_renew') }}</ElButton
                  >
                  <el-divider direction="vertical"></el-divider>
                  <ElButton v-if="['incomplete'].includes(item.status)" type="text" @click="handlePay(item)">{{
                    $t('public_button_pay')
                  }}</ElButton>
                  <!--                  <el-divider direction="vertical"></el-divider>-->
                  <!--                  <ElButton-->
                  <!--                    type="text"-->
                  <!--                    v-if="-->
                  <!--                      item.subscribeItems &&-->
                  <!--                      item.subscribeItems.length > 1 &&-->
                  <!--                      ['active', 'past_due'].includes(item.status)-->
                  <!--                    "-->
                  <!--                    class="color-subscribe"-->
                  <!--                    @click="openUnsubscribe(item, 'all')"-->
                  <!--                  >-->
                  <!--                    一键退订-->
                  <!--                  </ElButton>-->
                </div>
              </div>
              <div>
                <VTable :columns="columns" :data="item.subscribeItems" ref="table" :has-pagination="false">
                  <template #subscriptionMethodLabel="{ row }">
                    <span :class="{ 'color-success': row.amount === 0 }">{{ row.subscriptionMethodLabel }}</span>
                  </template>
                  <template #agentType="{ row }">
                    <span>{{ agentTypeMap[row.agentType || 'local'] }}</span>
                  </template>
                  <template #price="{ row }">
                    <div>{{ formatterPrice(item.currency, row.amount) }}</div>
                  </template>
                  <template #statusLabel="{ row }">
                    <StatusTag
                      v-if="row.agentType === 'Cloud' && row.status === 'Creating'"
                      type="tag"
                      status="Deploying"
                      default-status="Stopped"
                      target="instance"
                    ></StatusTag>
                    <StatusTag
                      v-else
                      type="tag"
                      :status="row.status"
                      default-status="Stopped"
                      :target="row.productType === 'Engine' ? 'instance' : 'mdb'"
                    ></StatusTag>
                  </template>
                  <template #operation="{ row }">
                    <ElButton
                      :disabled="disableUnsubscribe(row) || ['incomplete'].includes(item.status)"
                      type="text"
                      @click="openUnsubscribe(item, row.productType)"
                      >{{ $t('public_button_unsubscribe') }}</ElButton
                    >
                  </template>
                </VTable>
              </div>
            </li>
          </ul>
          <el-pagination
            background
            class="pagination mt-3"
            :current-page.sync="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="page.size"
            layout="total, sizes, ->, prev, pager, next, jumper"
            :total="page.total"
            @current-change="remoteMethod"
          >
          </el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane
        class="order-flex flex-column overflow-hidden h-100"
        :label="$t('dfs_instance_selectlist_shouquanma')"
        name="second"
      >
        <section class="flex flex-column overflow-hidden flex-1">
          <div class="mt-2 flex justify-content-end">
            <el-button class="mr-2" @click="goReceipt">{{ $t('dfs_user_center_kaifapiao') }}</el-button>
            <!--            <el-button type="primary" @click="goLicense">{{-->
            <!--              $t('dfs_aliyun_market_checklicnese_jihuoshouquanma')-->
            <!--            }}</el-button>-->
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

    <!--转账{{$t('public_button_pay')}}-->
    <transferDialog :visible.sync="showTransferDialogVisible" :price="pricePay"></transferDialog>
    <!--退订-->
    <Unsubscribe ref="UnsubscribeDetailDialog" @closeVisible="remoteMethod"></Unsubscribe>
    <!--续订-->
    <Renew ref="RenewDetailDialog" @closeVisible="remoteMethod"></Renew>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { FilterBar, VTable } from '@tap/component'
import transferDialog from '../agent-download/transferDialog'
import { openUrl } from '@tap/shared'

import i18n from '@/i18n'
import { isEmpty } from '@/util'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import dayjs from 'dayjs'
import StatusTag from '../../components/StatusTag.vue'
import Unsubscribe from '../../components/Unsubscribe.vue'
import Renew from '../../components/Renew.vue'

export default {
  components: { Unsubscribe, StatusTag, FilterBar, VTable, transferDialog, Renew },
  inject: ['buried'],
  data() {
    return {
      activeName: 'first',
      loading: true,
      loadingCancelSubmit: false,
      loadingSubscribe: false,
      showUnsubscribeDetailVisible: false, //退订详情
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      refundAmount: '',
      showTransferDialogVisible: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        agentDeploy: '',
        productType: '',
        status: ''
      },
      search: '',
      filterItems: [],
      //授权码
      codeColumns: [
        {
          label: i18n.t('dfs_instance_selectlist_shouquanma'),
          prop: 'licenseCode',
          width: 320
        },
        {
          label: i18n.t('dfs_user_center_jihuoshijian2'),
          prop: 'activateTimeLabel'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('dfs_user_center_guoqishijian2'),
          prop: 'expiredTimeLabel'
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
          label: i18n.t('dfs_order_list_dingyueleixing'),
          prop: 'productType'
        },
        {
          label: i18n.t('dfs_instance_instance_guige'),
          prop: 'specLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_dingyuefangshi'),
          slotName: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_createagent_cunchukongjian'),
          prop: 'storageSize'
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price',
          slotName: 'price'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('task_monitor_status'),
          slotName: 'statusLabel'
        }
        // {
        //   label: i18n.t('public_operation'),
        //   prop: 'extendArray',
        //   slotName: 'operation'
        // }
      ],
      //订阅列表
      subscribeList: [],
      page: {
        current: 1,
        size: 10
      },
      loadingRenewSubmit: false,
      currentPrice: 0
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  created() {
    this.getFilterItems()
    if (window.__config__?.station === 'international') {
      this.refundAmount = 'https://docs.tapdata.io/cloud/billing/refund'
    } else {
      this.refundAmount = 'https://docs.tapdata.net/cloud/billing/refund'
    }
    this.remoteMethod()
  },
  watch: {
    $route(route) {
      if (route.name === 'order') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        this.page.current = 1
        this.remoteMethod()
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
              value: 'incomplete'
            },
            {
              label: this.$t('packages_business_shared_const_yizhifu'),
              value: 'active'
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
              value: 'past_due'
            },
            {
              label: this.$t('packages_business_shared_const_tuikuanzhong'),
              value: 'refunding'
            },
            {
              label: this.$t('packages_business_shared_const_shixiao'),
              value: 'incomplete_expired'
            },
            {
              label: this.$t('packages_business_shared_const_yiquxiao'),
              value: 'canceled'
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
        },
        {
          label: i18n.t('dfs_order_list_dingyueleixing'),
          key: 'productType',
          type: 'select-inner',
          items: [
            {
              label: this.$t('public_select_option_all'),
              value: ''
            },
            {
              label: 'Engine',
              value: 'Engine'
            },
            {
              label: 'MongoDB',
              value: 'MongoDB'
            }
          ]
        }
      ]
    },
    //我的订阅
    remoteMethod() {
      let { current, size } = this.page
      let { agentType, status, productType } = this.searchParams
      let where = {
        status: {
          $ne: 'invalid' //过滤 invild
        }
      }
      agentType && (where['subscribeItems.agentType'] = agentType)
      productType && (where['subscribeItems.productType'] = productType)
      status && (where.status = status)
      let filter = {
        limit: size,
        skip: size * (current - 1),
        sort: ['createAt desc'],
        where: where
      }
      this.loadingSubscribe = true

      return this.$axios.get(`api/tcm/subscribe?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        this.loadingSubscribe = false
        let items = data.items || []
        this.page.total = data.total
        this.subscribeList = items.map(item => {
          if (item.totalAmount !== 0) {
            item.subscriptionMethodLabel =
              getPaymentMethod(
                { periodUnit: item.periodUnit, type: item.subscribeType },
                item.paymentMethod || 'Stripe'
              ) || '-'
          } else {
            item.subscriptionMethodLabel = i18n.t('dfs_instance_instance_mianfei')
          }

          if (item.subscribeItems && item.subscribeItems.length > 0) {
            item.subscribeItems = item.subscribeItems.map(it => {
              it.specLabel = getSpec(it.spec) || '-'
              it.storageSize = it.spec?.storageSize ? it.spec?.storageSize + 'GB' : '-'
              it.subscriptionMethodLabel = item.subscriptionMethodLabel
              it.status = it.resource?.status || ''
              return it
            })
          }
          return item
        })
      })
    },
    formatterTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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
    //是否可退订
    disableUnsubscribe(row) {
      if (row.productType === 'Engine') {
        if (row.agentType === 'Cloud') {
          return !['Running', 'Approving', 'Stopped', 'Error'].includes(row.status)
        } else {
          return !['Running', 'Creating', 'Stopped', 'Error'].includes(row.status)
        }
      } else {
        if (row?.resource?.scope === 'Private') {
          return !['Activated'].includes(row.status)
        } else {
          return !['Assigned'].includes(row.status)
        }
      }
    },
    //退订详情
    openUnsubscribe(row, type) {
      this.$refs?.UnsubscribeDetailDialog.getUnsubscribePrice(row, type)
    },
    //续订
    openRenew(row) {
      this.$refs?.RenewDetailDialog.openRenew(row)
    },
    formatPrice(currency, price) {
      if (price === 0) return 0
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
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
.sub-li {
  border: 1px solid #ebeef5;
  //border-bottom: none;
}
.color-subscribe {
  color: map-get($color, warning);
}
.sub-li-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  background: #f7f8fa;
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
  .el-tabs__content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
}
</style>
