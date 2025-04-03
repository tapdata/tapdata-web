<template>
  <ElDialog v-if="visible" v-model="visible" :title="$t('dfs_change_instance_title')" width="60%">
    <section class="change-container">
      <el-alert
        class="alert-primary mb-4 text-primary"
        type="info"
        :title="$t('dfs_change_instance_tip')"
        show-icon
        :closable="false"
      />
      <el-form label-position="top" ref="ruleForm">
        <ElFormItem v-if="agentList.length > 0">
          <template v-slot:label>
            <div class="font-color-dark">
              {{ $t('dfs_change_instance_object') }}
            </div>
          </template>
          <div class="border rounded-lg overflow-hidden">
            <VTable
              ref="table"
              row-key="id"
              :columns="paidDetailColumns"
              :data="agentList"
              :has-pagination="false"
            ></VTable>
          </div>
        </ElFormItem>
        <!--选择规格-->
        <ElFormItem>
          <template v-slot:label>
            <div class="font-color-dark">
              {{ $t('dfs_guide_index_xuanzejisuanyin') }}
            </div>
          </template>
          <el-row type="flex" class="flex-wrap lh-base" :gutter="16" style="row-gap: 16px">
            <el-col :span="12" v-for="(item, i) in specificationItems" :key="i">
              <div
                class="position-relative px-4 py-2 cursor-pointer active-group rounded-lg overflow-hidden border"
                :class="{
                  active: specification === item.value,
                }"
                @click="changeSpec(item.value)"
              >
                <div class="is-active position-absolute top-0 end-0">
                  <div class="is-active-triangle"></div>
                  <VIcon size="16" class="is-active-icon">check-bold</VIcon>
                </div>
                <div class="spec-li-title lh-base fw-bold font-color-dark">
                  <span class="align-middle">{{ item.name }}: {{ item.desc }}</span>
                  <ElTag v-if="item.chargeProvider === 'FreeTier'" class="bg-color-warning text-white border-0 ml-2">{{
                    platform === 'selfHost'
                      ? $t('dfs_instance_instance_mianfei')
                      : $t('dfs_instance_createagent_mianfeitiyan')
                  }}</ElTag>
                </div>
                <div
                  v-if="platform === 'selfHost'"
                  class="spec-li-title mt-1 lh-base font-color-sslight"
                  v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
                ></div>
              </div>
            </el-col>
          </el-row>
        </ElFormItem>
        <!--订阅方式-->
        <ElFormItem v-if="isFree">
          <template v-slot:label>
            <div class="font-color-dark">
              {{ $t('dfs_instance_instance_dingyuefangshi') }}
            </div>
          </template>
          <ElRadioGroup v-model="currentPackage" @input="handleChange" class="flex flex-wrap gap-4">
            <ElRadio
              v-for="(item, index) in packageItems"
              :key="index"
              :label="item.value"
              border
              class="rounded-4 subscription-radio m-0 position-relative"
            >
              <span class="inline-flex align-center">
                {{ item.label }}
                <template v-if="item.type === 'recurring' || item.periodUnit === 'year'">
                  <ElTag class="discount-tag fw-sub rounded-4 border-0 ml-2">{{
                    $t('dfs_agent_subscription_discount', {
                      val: getDiscount(item),
                    })
                  }}</ElTag>
                  <VIcon class="position-absolute discount-hot-icon">hot-o</VIcon>
                </template>
              </span>
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <!--        <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
              <ElSelect v-model="specification" @change="changeSpec" class="w-50 rounded-4">
                <ElOption v-for="(item, i) in specificationItems" :key="i" :label="item.name" :value="item.value">
                  <span>{{ item.name }}: </span>
                  <span>{{ item.desc }}</span>
                  <div
                    class="spec-li-title mt-1 lh-base font-color-sslight"
                    v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
                  ></div>
                </ElOption>
              </ElSelect>
            </ElFormItem>-->
      </el-form>
    </section>
    <template v-slot:footer>
      <span class="dialog-footer flex justify-content-end align-center">
        <span class="mr-4"
          ><span class="fs-6 font-color-dark font-weight-light">{{ $t('dfs_change_instance_price') }}：</span
          ><span class="color-primary fs-4"> {{ formatPrice(currency) }}</span></span
        >
        <el-button @click="visible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button type="primary" :loading="loadingCancelSubmit" @click="submit">{{
          $t('dfs_change_instance_submit')
        }}</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { uniqBy } from 'lodash'
import dayjs from 'dayjs'
import { VTable } from '@tap/component'
import i18n from '@tap/i18n'
import { isObj } from '@tap/shared'
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '../../shared/const'
import { getPaymentMethod, getSpec } from '../../shared/util'

export default {
  name: 'ChangeSubscribe',
  components: { VTable },
  inject: ['buried'],
  data() {
    return {
      visible: false,
      loadingCancelSubmit: false,
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      specification: '',
      currency: '',
      paidDetailColumns: [
        {
          label: i18n.t('dfs_components_renew_dingyuebianhao'),
          prop: 'id',
        },
        {
          label: i18n.t('dfs_components_renew_shiliguige'),
          prop: 'specLabel',
          width: 180,
        },
        {
          label: i18n.t('dfs_instance_instance_dingyuefangshi'),
          prop: 'subscriptionMethodLabel',
          width: 180,
        },
        {
          label: i18n.t('dfs_instance_instance_daoqishijian'),
          prop: 'endAt',
          width: 180,
        },
      ],
      agentList: [],
      specificationItems: [],
      packageItems: [],
      agent: '',
      currentPackage: '',
      platform: '',
    }
  },
  computed: {
    isFree() {
      return !this.currentRow.totalAmount || this.currentRow.subscribeType === 'FreeTier'
    },
    singleMonth() {
      return this.packageItems.find((item) => item.type === 'one_time' && item.periodUnit === 'month')
    },
    singleMonthAmount() {
      return this.singleMonth?.currencyOption.find((item) => item.currency === this.currencyType)?.amount
    },
    singleYearAmount() {
      return this.singleMonthAmount ? this.singleMonthAmount * 12 : this.singleMonthAmount
    },
    defaultCurrencyType() {
      return this.$store.getters.currencyType
    },
  },
  methods: {
    openChange(item = {}) {
      let agent = item.subscribeItems?.find((it) => it.productType === 'Engine')
      let specLabel = getSpec(agent?.spec)
      //组装续订列表
      let node = {
        id: item.id,
        endAt: this.formatterTime(item.endAt),
        specLabel: specLabel,
        subscriptionMethodLabel:
          getPaymentMethod({ periodUnit: item.periodUnit, type: item.subscribeType }, item.paymentMethod || 'Stripe') ||
          '-',
      }
      this.agentList = [node]
      this.visible = true
      this.currentRow = item
      this.agent = agent
      this.currencyType = item.currency
      this.platform = item.platform
      this.getPrice(agent, agent?.agentType)
    },
    //查询规格价格
    getPrice(orw, agentType) {
      const params = {
        productType: agentType === 'Cloud' ? 'fullManagement' : 'selfHost',
      }
      this.$axios.get('api/tcm/orders/paid/price', { params }).then((data) => {
        let { paidPrice = [] } = data?.[0] || {}

        // 过滤掉按量计费的价格
        paidPrice = paidPrice.filter(t => t.usageType !== 'metered')

        const { spec: currentSpec, amount } = this.agent

        paidPrice = !amount
          ? paidPrice.filter((item) => item.chargeProvider !== 'FreeTier')
          : paidPrice.filter((item) => {
              const { cpu, memory } = item.spec
              return (
                item.chargeProvider !== 'FreeTier' &&
                (cpu > currentSpec.cpu || (cpu === currentSpec.cpu && memory > currentSpec.memory)) &&
                this.currentRow?.subscribeType === item.type &&
                this.currentRow?.periodUnit === item.periodUnit
              )
            })

        // 规格
        this.specificationItems = uniqBy(
          paidPrice.map((t) => {
            const { cpu = 0, memory = 0 } = t.spec || {}

            return {
              label: getSpec(t.spec),
              value: getSpec(t.spec),
              cpu,
              memory,
              name: t.spec.name.toUpperCase(),
              chargeProvider: t.chargeProvider,
              desc: i18n.t('dfs_agent_download_subscriptionmodeldialog_renwushujianyi', {
                val: t.limitTask,
              }),
            }
          }),
          'value',
        ).sort((a, b) => {
          return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
        })
        // 如果是单独订购存储，默认调过免费实例，避免后续step受免费实例影响
        this.specification =
          !this.agentCount && this.orderStorage ? this.specificationItems[1]?.value : this.specificationItems[0]?.value
        // 价格套餐
        this.allPackages = paidPrice.map((t) => {
          return Object.assign(t, {
            label: getPaymentMethod(t),
            value: t.priceId,
            price: t.price,
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec),
            currencyOption: t.currencyOption || [],
          })
        })
        this.changeSpec(this.specification)
        if (!this.currencyType) {
          this.currencyType = this.packageItems[0]?.currencyOption[0]?.currency
        }
      })
    },
    //查询定价列表
    getSuggestPipelineNumber(cpu, memory) {
      if (memory == 2) {
        return 3
      }
      if (memory == 4) {
        return 5
      }
      return memory / 0.8
    },
    //订购时长对应价格
    loadPackageItems() {
      const specification = this.specificationItems.find((t) => t.value === this.specification)
      this.agentSizeCap = this.updateAgentCap(specification.cpu, specification.memory)
      const specificationLabel = this.specificationItems.find((t) => t.value === this.specification)?.name
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter((it) => this.specification === it.specification)
        .map((t) => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel,
            }),
            label:
              specification?.chargeProvider !== 'FreeTier'
                ? t.label
                : this.agentDeploy !== 'selfHost'
                ? i18n.t('dfs_instance_createagent_mianfeishiyonggui')
                : i18n.t('dfs_instance_utils_baoyue'),
          })
        })
        .sort((a, b) => {
          const aType = a.type === 'recurring' ? 1 : 2
          const bType = b.type === 'recurring' ? 1 : 2
          const aOrder = a.periodUnit === 'month' ? 1 : 2
          const bOrder = b.periodUnit === 'month' ? 1 : 2

          if (aType < bType) {
            return -1
          } else if (aType > bType) {
            return 1
          } else {
            return aOrder - bOrder
          }
        })
    },
    //切换规格
    changeSpec(item, disabled) {
      if (disabled) return
      this.specification = item
      this.loadPackageItems()
      if (!this.currencyType) {
        this.currencyType = this.packageItems[0]?.currency
      }
      let currentItem = this.packageItems[0]
      this.currentPackage = currentItem?.value
      if (this.selected?.type && currentItem?.chargeProvider !== 'FreeTier' && this.selected?.type !== 'FreeTier') {
        currentItem = this.packageItems.find(
          (it) => it.type === this.selected?.type && it.periodUnit === this.selected?.periodUnit, //切换规格不改变原来的订阅方式
        )
      }
      this.selected = currentItem
      if (currentItem?.chargeProvider !== 'FreeTier') {
        this.changeCurrencyOption(currentItem)
        this.currency = this.currencyOption.find((it) => it.currency === this.currencyType) || {}
      } else {
        this.currencyOption = []
        this.currency = currentItem
      }
      this.buried('changeSpec')
    },
    updateAgentCap(cpu, memory) {
      return {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000,
      }
    },
    formatterTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    formatPrice(item, isOriginalPrice) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0

      let amount = this.getAmount(item, isOriginalPrice)
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        ' ' +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    },
    getAmount(item, isOriginalPrice) {
      const current = this.currentRow
      let amount = item?.amount

      // 基于单月算原价
      if (isOriginalPrice && (current.subscribeType === 'recurring' || current.periodUnit === 'year')) {
        if (current.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (current.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },
    changeCurrencyOption(item) {
      const options = item.currencyOption
      const { defaultCurrencyType } = this
      // 设置了默认币种, 币种选项默认的排到第一位
      if (options?.length && defaultCurrencyType && options[0] !== defaultCurrencyType) {
        options.sort((a, b) => {
          let aVal = a.currency === defaultCurrencyType ? 0 : 1
          let bVal = b.currency === defaultCurrencyType ? 0 : 1
          return aVal - bVal
        })
      }
      this.currencyOption = options
    },

    submit() {
      let { id, paymentMethod, currency, subscribeType, periodUnit } = this.currentRow
      let { resourceId } = this.agent
      const {
        type,
        priceId,
        currency: selectCurrency,
        periodUnit: selectPeriodUnit,
        label,
        specification,
      } = this.selected

      if (this.isFree) {
        subscribeType = type
        periodUnit = selectPeriodUnit
        currency = this.defaultCurrencyType || selectCurrency
      }

      let param = {
        subscribeId: id, // 原订阅ID
        subscribeType,
        periodUnit,
        currency,
        paymentMethod: paymentMethod, // 支付方式
        successUrl: location.href, // 支付成功跳转地址
        cancelUrl: location.href, // 支付失败跳转地址
        subscribeItems: [
          {
            // 跟新增订阅一样
            resourceId: resourceId, // 要变更的产品id，为空时表示新增订阅产品
            priceId: priceId, // 变更后的价格方案
            productType: 'Engine', // 产品类型：Engine,MongoDB
          },
        ],
      }
      this.loadingCancelSubmit = true
      this.$axios
        .post('api/tcm/subscribe/change', param)
        .then(async (data) => {
          this.buried('unsubscribeAgentStripe', '', {
            result: true,
            type: '',
          })
          this.$message.success(this.$t('public_message_operation_success'))
          this.visible = false
          this.loadingCancelSubmit = false
          $emit(this, 'closeVisible')

          // 连续订阅变更不需要付款
          if (subscribeType !== 'recurring' || this.isFree) {
            this.$router.push({
              name: 'payForChange',
              params: {
                id: data?.id,
              },
            })
          } else {
            await this.$axios.post('api/tcm/subscribe/payment', {
              email: this.$store.state.user.email,
              paymentMethod: 'Stripe',
              successUrl: '',
              cancelUrl: '',
              subscribeAlterId: data.id,
            })
          }

          //刷新页面
          $emit(this, 'closeVisible')
        })
        .finally(() => {
          this.showUnsubscribeDetailVisible = false
          this.loadingCancelSubmit = false
        })
    },

    getDiscount(item) {
      const { locale } = this.$i18n
      if (item.type === 'recurring' && item.periodUnit === 'month') {
        return locale === 'en' ? 5 : 95
      } else if (item.periodUnit === 'year') {
        return locale === 'en' ? 10 : 9
      }
    },

    //切换订阅方式
    handleChange(item = {}) {
      if (!isObj(item)) {
        item = this.packageItems.find((it) => it.value === item)
      }
      this.currentPackage = item.value
      this.selected = item
      if (item?.chargeProvider !== 'FreeTier') {
        this.changeCurrencyOption(item)
        this.currency = this.currencyOption.find((it) => it.currency === this.currencyType) || {}
      } else {
        this.currencyOption = []
        this.currency = item
      }
    },
  },
  emits: ['closeVisible'],
}
</script>

<style lang="scss" scoped>
.discount-tag {
  padding: 0 6px;
  color: #ff7d00;
  background: rgba(255, 125, 0, 0.1);
}
.discount-hot-icon {
  color: #ff7d00;
  right: -12px;
  top: -12px;
  font-size: 24px;
  background: #fff;
}
.subscription-radio.el-radio {
  padding: 0 12px;
  line-height: 30px;
}
.active-group {
  .is-active {
    display: none;
  }
  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
    box-shadow: 0 2px 16px rgba(44, 101, 255, 0.2);
    .is-active {
      display: block;
      &-triangle {
        width: 0;
        height: 0;
        border-top: 18px solid $primary;
        border-left: 18px solid transparent;
        border-bottom: 18px solid transparent;
        border-right: 18px solid $primary;
      }
      &-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        color: #fff;
      }
    }
  }
}
.alert-primary {
  background: #e8f3ff;
}
.change-container {
  :deep(.el-form-item) {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 16px;
    }
    .el-form-item__label {
      line-height: 22px;
      padding-bottom: 8px;
    }
  }
}
</style>
