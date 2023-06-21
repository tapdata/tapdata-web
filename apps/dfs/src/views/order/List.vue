<template>
  <section class="operation-logs-wrapper g-panel-container" v-if="$route.name === 'order'">
    <el-tabs class="flex flex-column overflow-hidden flex-1" v-model="activeName">
      <el-tab-pane class="order-flex overflow-hidden h-100" :label="$t('dfs_order_list_wodedingyue')" name="first">
        <div class="main">
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
                  <span class="color-primary fw-sub mr-2">订阅编号: {{ item.id }}</span>
                  <span class="font-color-dark fw-sub mr-2"
                    >总金额: {{ formatterPrice(item.currency, item.totalAmount) || 0 }}</span
                  >
                  <span class="font-color-dark fw-sub mr-2"
                    >订阅周期: {{ formatterTime(item.startAt) }} ~ {{ formatterTime(item.endAt) }}</span
                  >
                  <span class="font-color-dark fw-sub mr-2"
                    >订阅状态:
                    <StatusTag type="tag" :status="item.status" default-status="Stopped" target="order"></StatusTag
                  ></span>
                </div>
                <div class="flex justify-content-center align-items-center">
                  <ElButton class="mr-2" type="text" @click="openRenew(item)">{{ $t('public_button_renew') }}</ElButton>
                  <ElButton v-if="['incomplete'].includes(item.status)" type="text" @click="handlePay(item)"
                    >支付</ElButton
                  >
                  <div
                    v-if="item.subscribeItems && item.subscribeItems.length > 1"
                    class="color-warning cursor-pointer"
                    @click="allUnsubscribe(item)"
                  >
                    一键退订
                  </div>
                </div>
              </div>
              <div>
                <VTable :columns="columns" :data="item.subscribeItems" ref="table" class="mt-4" :has-pagination="false">
                  <template #agentType="{ row }">
                    <span>{{ agentTypeMap[row.agentType || 'local'] }}</span>
                  </template>
                  <template #price="{ row }">
                    <div>{{ formatterPrice(item.currency, row.amount) }}</div>
                  </template>
                  <template #statusLabel="{ row }">
                    <StatusTag
                      type="tag"
                      :status="row.status"
                      default-status="Stopped"
                      :target="row.productType === 'Engine' ? 'instance' : 'mdb'"
                    ></StatusTag>
                  </template>
                  <template #operation="{ row }">
                    <!--                    <ElButton-->
                    <!--                      v-if="['past_due', 'active'].includes(item.status) && item.subscribeType === 'one_time'"-->
                    <!--                      type="text"-->
                    <!--                      @click="handleRenew(item)"-->
                    <!--                      >{{ $t('public_button_renew') }}</ElButton-->
                    <!--                    >-->
                    <!--                    <ElButton-->
                    <!--                      v-if="['active', 'past_due'].includes(item.status)"-->
                    <!--                      type="text"-->
                    <!--                      @click="getUnsubscribePrice(item, row.productType)"-->
                    <!--                      >{{ $t('public_button_unsubscribe') }}</ElButton-->
                    <!--                    >-->
                    <ElButton type="text" @click="getUnsubscribePrice(item, row.productType)">{{
                      $t('public_button_unsubscribe')
                    }}</ElButton>
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
    <ElDialog
      v-if="showUnsubscribeDetailVisible"
      :visible.sync="showUnsubscribeDetailVisible"
      :title="$t('dfs_instance_instance_tuidingshili')"
      width="60%"
    >
      <section>
        <ul class="subscription-ul">
          <li class="mt-2">
            {{ $t('dfs_instance_instance_tuidingjineji') }}
            <el-link style="vertical-align: top" :href="unsubscribeHelpDocumentation" type="primary" target="_blank">{{
              $t('dfs_instance_instance_tuifeiguize')
            }}</el-link>
          </li>
          <li class="mt-2">{{ $t('dfs_instance_instance_tuidingzhituihuan') }}</li>
          <li class="mt-2">{{ $t('dfs_instance_instance_qingzixihedui') }}</li>
        </ul>
        <div class="mt-4 fs-6 font-color-dark">{{ $t('dfs_instance_instance_tuidingshili') }}</div>
        <div v-if="agentList.length > 0">
          <VTable
            ref="table"
            row-key="id"
            :columns="paidDetailColumns"
            :data="agentList"
            height="100%"
            :has-pagination="false"
            class="mt-4 mb-4"
          >
            <template #expiredTime="{ row }">
              <div>{{ row.periodStart }}</div>
              <div>{{ row.periodEnd }}</div>
            </template>
            <template #actualAmount="{ row }">
              <span class="font-color-dark fw-normal">{{ row.actualAmount }}</span>
            </template>
            <template #spentAmount="{ row }">
              <span class="color-danger fw-normal"> -{{ row.spentAmount }}</span>
            </template>
            <template #refundAmount="{ row }">
              <span class="color-primary fw-normal">{{ row.refundAmount }}</span>
            </template>
          </VTable>
        </div>
        <div v-if="memoryList.length > 0">
          <VTable
            ref="table"
            row-key="id"
            :columns="memoryColumns"
            :data="memoryList"
            height="100%"
            :has-pagination="false"
            class="mt-4 mb-4"
          >
            <template #expiredTime="{ row }">
              <div>{{ row.periodStart }}</div>
              <div>{{ row.periodEnd }}</div>
            </template>
            <template #actualAmount="{ row }">
              <span class="font-color-dark fw-normal">{{ row.actualAmount }}</span>
            </template>
            <template #spentAmount="{ row }">
              <span class="color-danger fw-normal"> -{{ row.spentAmount }}</span>
            </template>
            <template #refundAmount="{ row }">
              <span class="color-primary fw-normal">{{ row.refundAmount }}</span>
            </template>
          </VTable>
        </div>
        <el-form label-position="top" :model="form" :rules="rules" ref="ruleForm">
          <el-form-item :label="$t('dfs_instance_instance_tuidingyuanyin')" required>
            <el-radio-group v-model="form.refundReason">
              <el-radio class="mt-2" label="configurationOptionError">{{
                $t('dfs_instance_instance_peizhixuanxiangcuo')
              }}</el-radio>
              <el-radio class="mt-2" label="unableDeployProperly">{{
                $t('dfs_instance_instance_wufazhengchangbu')
              }}</el-radio>
              <el-radio class="mt-2" label="notconsistentWithExpectations">{{
                $t('dfs_instance_instance_xingnenghuozhegong')
              }}</el-radio>
              <el-radio class="mt-2" label="unsubscribeAfterBusinessTesting">{{
                $t('dfs_instance_instance_yewuceshiwan')
              }}</el-radio>
              <el-radio class="mt-2" label="other">{{ $t('dfs_instance_instance_qita') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.refundReason === 'other'" prop="refundDescribe">
            <el-input
              v-model="form.refundDescribe"
              type="textarea"
              :placeholder="$t('dfs_instance_instance_qingshurutuiding')"
              show-word-limit
            >
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('dfs_instance_instance_tuikuanqudao')">
            <el-input v-model="form.refundChannel" disabled show-word-limit style="width: 200px"> </el-input>
          </el-form-item>
        </el-form>
      </section>
      <span slot="footer" class="dialog-footer">
        <span class="mr-4"
          ><span class="fs-6 font-color-dark font-weight-light">{{ $t('dfs_instance_instance_ketuidingjine') }}</span
          ><span class="color-primary fs-4"> {{ refundAmount }}</span></span
        >
        <el-button @click="showUnsubscribeDetailVisible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button :disabled="!form.refundReason" type="primary" :loading="loadingCancelSubmit" @click="cancelSubmit">{{
          $t('public_button_unsubscribe')
        }}</el-button>
      </span>
    </ElDialog>
    <!--续订-->
    <ElDialog :visible.sync="showRenewDetailVisible" :title="$t('dfs_instance_instance_tuidingshili')" width="60%">
      <section>
        <div class="mt-4 fs-6 font-color-dark">{{ $t('dfs_instance_instance_tuidingshili') }}</div>
        <div v-if="renewList.length > 0">
          <VTable
            ref="table"
            row-key="id"
            :columns="renewColumns"
            :data="renewList"
            height="100%"
            :has-pagination="false"
            class="mt-4 mb-4"
          >
          </VTable>
        </div>
        <el-form label-position="top" ref="ruleForm">
          <el-form-item label="续订时长">
            <el-input-number v-model="quantity" :min="1" controls-position="right"></el-input-number>
            <span class="ml-2">{{ currentRenewRow.periodUnit === 'month' ? '月' : '年' }}</span>
            <div>续订后到期时间：</div>
          </el-form-item>
        </el-form>
      </section>
      <span slot="footer" class="dialog-footer">
        <span class="mr-4"
          ><span class="fs-6 font-color-dark font-weight-light">续订金额</span
          ><span class="color-primary fs-4">
            {{ formatterPrice(currentRenewRow.currency, currentPrice * quantity) }}</span
          ></span
        >
        <el-button @click="showRenewDetailVisible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button
          :disabled="!currentPrice * quantity"
          type="primary"
          :loading="loadingRenewSubmit"
          @click="handleRenew"
          >续订</el-button
        >
      </span>
    </ElDialog>
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

export default {
  components: { StatusTag, FilterBar, VTable, transferDialog },
  inject: ['buried'],
  data() {
    return {
      activeName: 'first',
      loading: true,
      loadingCancelSubmit: false,
      showUnsubscribeDetailVisible: false, //退订详情
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      refundAmount: '',
      showTransferDialogVisible: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        agentDeploy: '',
        status: ''
      },
      form: {
        refundReason: '',
        refundDescribe: '',
        refundChannel: i18n.t('dfs_instance_instance_yuanlutuihui')
      },
      rules: {
        refundDescribe: [{ required: true, message: i18n.t('dfs_instance_instance_qingshurutuiding'), trigger: 'blur' }]
      },
      memoryColumns: [
        {
          label: i18n.t('dfs_instance_createagent_cunchuguige'),
          prop: 'spec',
          minWidth: 120
        },
        {
          label: i18n.t('dfs_instance_createagent_cunchukongjian'),
          prop: 'storageSize',
          width: 120
        },
        {
          label: i18n.t('dfs_instance_selectlist_dingyuezhouqi'),
          slotName: 'expiredTime',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_shifujine'),
          prop: 'actualAmount',
          slotName: 'actualAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_yixiaohaojine'),
          prop: 'spentAmount',
          slotName: 'spentAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_tuidingjine'),
          prop: 'refundAmount',
          slotName: 'refundAmount'
        }
      ],
      paidDetailColumns: [
        {
          label: this.$t('agent_name'),
          prop: 'agentName',
          minWidth: 120
        },
        {
          label: this.$t('dfs_instance_instance_guige'),
          prop: 'spec',
          width: 120
        },
        {
          label: i18n.t('dfs_instance_selectlist_dingyuezhouqi'),
          slotName: 'expiredTime',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_shifujine'),
          prop: 'actualAmount',
          slotName: 'actualAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_yixiaohaojine'),
          prop: 'spentAmount',
          slotName: 'spentAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_tuidingjine'),
          prop: 'refundAmount',
          slotName: 'refundAmount'
        }
      ],
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
          label: '订阅类型',
          prop: 'productType'
        },
        {
          label: '订阅规格',
          prop: 'specLabel',
          width: 180
        },
        {
          label: '订阅方式',
          prop: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: '存储',
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
        },
        {
          label: i18n.t('public_operation'),
          prop: 'extendArray',
          slotName: 'operation'
        }
      ],
      renewColumns: [
        {
          label: '资源ID',
          prop: 'resourceId'
        },
        {
          label: '订阅规格',
          prop: 'specLabel',
          width: 180
        },
        {
          label: '到期时间',
          prop: 'endAt',
          width: 180,
          dataType: 'time'
        }
      ],
      agentList: [],
      memoryList: [],
      //订阅列表
      subscribeList: [],
      page: {
        current: 1,
        size: 10
      },
      quantity: 1,
      showRenewDetailVisible: false,
      renewList: [],
      currentRenewRow: '',
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
        let pageNum = isEmpty(query) ? undefined : 1
        this.remoteMethod(pageNum)
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
    remoteMethod() {
      let { current, size } = this.page
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

      return this.$axios.get(`api/tcm/subscribe?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        let items = data.items || []
        this.page.total = data.total
        this.subscribeList = items.map(item => {
          item.subscriptionMethodLabel =
            getPaymentMethod(
              { periodUnit: item.periodUnit, type: item.subscribeType },
              item.paymentMethod || 'Stripe'
            ) || '-'
          if (item.subscribeItems && item.subscribeItems.length > 0) {
            item.subscribeItems = item.subscribeItems.map(it => {
              it.specLabel = getSpec(it.spec) || '-'
              it.storageSize = it.spec?.storageSize ? it.spec?.storageSize + 'GB' : '-'
              it.subscriptionMethodLabel = item.subscriptionMethodLabel
              it.status = item.resource?.status || ''
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
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    //续订
    openRenew(item) {
      this.renewList = item?.subscribeItems
      this.showRenewDetailVisible = true
      this.currentRenewRow = item
      this.$axios.get('/api/tcm/orders/paid/price/' + item?.subscribeItems[0].priceId).then(data => {
        this.currentPrice = data.price
      })
    },
    handleRenew() {
      let { id } = this.currentRenewRow
      const params = {
        subscribeId: id,
        quantity: this.quantity,
        successUrl: location.href,
        cancelUrl: location.href
      }
      this.loadingRenewSubmit = true
      this.buried('renewAgentStripe')
      this.$axios
        .post('api/tcm/subscribe/renew', params)
        .then(data => {
          this.showRenewDetailVisible = false
          this.loadingRenewSubmit = false
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
        .finally(() => {
          this.showRenewDetailVisible = false
          this.loadingRenewSubmit = false
        })
    },
    //退订 //退订详情费用
    getUnsubscribePrice(row = {}, type) {
      if (row?.refund) {
        let param = {
          instanceId: row.agentId
        }
        this.$axios.post('api/tcm/subscribe/{subscribeId}/refund', param).then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.table.fetch(1)
        })
        return
      }
      let url = `api/tcm/subscribe/${row.subscribeId}/refund`
      this.currentRow = row
      this.$axios.get(url).then(res => {
        console.log(res)
        this.showUnsubscribeDetailVisible = true
      })
    },
    allUnsubscribe(row) {
      this.getUnsubscribePrice(row, 'all')
    },
    formatPrice(currency, price) {
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    //退订
    cancelSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.loadingCancelSubmit = true
          const { paidType, id } = this.currentRow
          const { refundReason, refundDescribe } = this.form
          let param = {
            subscribeId: id,
            refundReason,
            refundDescribe
          }
          this.$axios
            .post('api/tcm/orders/cancel', param)
            .then(() => {
              this.fetch()
              this.buried('unsubscribeAgentStripe', '', {
                result: true,
                type: paidType
              })
              this.$message.success(this.$t('public_message_operation_success'))
              this.showUnsubscribeDetailVisible = false
              this.loadingCancelSubmit = false
            })
            .finally(() => {
              this.showUnsubscribeDetailVisible = false
              this.loadingCancelSubmit = false
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
.sub-li {
  border: 1px solid #ebeef5;
  //border-bottom: none;
}
.sub-li-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
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
