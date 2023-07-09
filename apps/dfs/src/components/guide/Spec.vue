<template>
  <section>
    <div>4、您需要自行安装一个计算引擎到您的网络环境中, 选择一种合适的方式吧。</div>
    <el-form label-position="top" ref="ruleForm">
      <ElFormItem :label="$t('dfs_instance_instance_dingyuefangshi')">
        <ElRadioGroup v-model="currentPackage" @input="handleChange" class="flex gap-4">
          <ElRadio
            v-for="(item, index) in packageItems"
            :key="index"
            :label="item.value"
            border
            class="rounded-4 subscription-radio m-0 position-relative"
          >
            <span class="inline-flex align-center">
              {{ item.label }}
              <ElTag
                v-if="item.type === 'recurring' || item.periodUnit === 'year'"
                class="discount-tag fw-sub rounded-4 border-0 ml-2"
                >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(item) }) }}</ElTag
              >

              <VIcon
                v-if="item.type === 'recurring' && item.periodUnit === 'year'"
                class="position-absolute discount-hot-icon"
                >hot-o</VIcon
              >
            </span>
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
        <ul class="flex flex-wrap">
          <li
            class="spec-li cursor-pointer position-relative cursor-pointer px-4 py-2 mt-4 mr-4 rounded-4"
            :class="{
              active: specification === item.value,
              disabled: agentCount > 0 && item.chargeProvider === 'FreeTier'
            }"
            v-for="(item, i) in specificationItems"
            :key="i"
            @click="changeSpec(item.value, agentCount > 0 && item.chargeProvider === 'FreeTier')"
          >
            <div class="is-active position-absolute top-0 end-0">
              <div class="is-active-triangle"></div>
              <VIcon size="16" class="is-active-icon">check-bold</VIcon>
            </div>
            <div class="spec-li-title mt-1 lh-base fw-bold font-color-dark">
              <span class="align-middle">{{ item.name }}: {{ item.desc }}</span>
              <ElTag
                v-if="item.chargeProvider === 'FreeTier'"
                size="small"
                class="bg-color-warning text-white border-0 ml-2"
                >{{
                  agentDeploy === 'selfHost'
                    ? $t('dfs_instance_instance_mianfei')
                    : $t('dfs_instance_createagent_mianfeitiyan')
                }}</ElTag
              >
            </div>
            <div
              v-if="agentDeploy === 'selfHost'"
              class="spec-li-title mt-1 lh-base font-color-sslight"
              v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
            ></div>
          </li>
        </ul>
      </ElFormItem>
    </el-form>
  </section>
</template>
<script>
import i18n from '@/i18n'
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
import { isObj, openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { uniqBy } from 'lodash'
import { getPaymentMethod, getSpec } from '../../views/instance/utils'

export default {
  name: 'ChangeSubscribe',
  inject: ['buried'],
  props: ['platform'],
  data() {
    return {
      loadingCancelSubmit: false,
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      specification: '',
      currency: '',
      paidDetailColumns: [
        {
          label: i18n.t('dfs_components_renew_dingyuebianhao'),
          prop: 'id'
        },
        {
          label: i18n.t('dfs_components_renew_shiliguige'),
          prop: 'specLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_dingyuefangshi'),
          prop: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_daoqishijian'),
          prop: 'endAt',
          width: 180
        }
      ],
      currentPackage: '',
      specificationItems: [],
      packageItems: [],
      agent: ''
    }
  },
  computed: {
    singleMonth() {
      return this.packageItems.find(item => item.type === 'one_time' && item.periodUnit === 'month')
    },
    singleMonthAmount() {
      return this.singleMonth?.currencyOption.find(item => item.currency === this.currencyType)?.amount
    },
    singleYearAmount() {
      return this.singleMonthAmount ? this.singleMonthAmount * 12 : this.singleMonthAmount
    }
  },
  mounted() {
    this.getPrice()
  },
  methods: {
    //查询规格价格
    getPrice() {
      const params = {
        productType: this.platform
      }
      this.$axios.get('api/tcm/orders/paid/price', { params }).then(data => {
        let { paidPrice = [] } = data?.[0] || {}
        //当前priceID 找打productID
        let productId = paidPrice.find(it => it.priceId === this.agent?.priceId)?.productId
        paidPrice = paidPrice.filter(
          it =>
            it.productId === productId &&
            it.priceId > this.agent?.priceId &&
            it.chargeProvider !== 'FreeTier' &&
            this.currentRow?.subscribeType === it.type &&
            this.currentRow?.periodUnit === it.periodUnit
        )
        // 规格
        this.specificationItems = uniqBy(
          paidPrice.map(t => {
            const { cpu = 0, memory = 0 } = t.spec || {}
            let desc =
              i18n.t('dfs_agent_download_subscriptionmodeldialog_renwushujianyi') +
              this.getSuggestPipelineNumber(cpu, memory) +
              i18n.t('dfs_agent_download_subscriptionmodeldialog_ge')
            if (t.chargeProvider == 'FreeTier') {
              desc = i18n.t('dfs_agent_download_subscriptionmodeldialog_mianfeishilizui')
            }
            return {
              label: getSpec(t.spec),
              value: getSpec(t.spec),
              cpu,
              memory,
              name: t.spec.name.toUpperCase(),
              chargeProvider: t.chargeProvider,
              desc: desc
            }
          }),
          'value'
        ).sort((a, b) => {
          return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
        })
        // 如果是单独订购存储，默认调过免费实例，避免后续step受免费实例影响
        this.specification =
          !this.agentCount && this.orderStorage ? this.specificationItems[1]?.value : this.specificationItems[0]?.value
        // 价格套餐
        this.allPackages = paidPrice.map(t => {
          return Object.assign(t, {
            label: getPaymentMethod(t),
            value: t.priceId,
            price: t.price,
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec),
            currencyOption: t.currencyOption || []
          })
        })
        this.changeSpec(this.specification)
        if (!this.currencyType) {
          this.currencyType = this.packageItems[0]?.currencyOption[0]?.currency
        }
        console.log('specificationItems', this.specificationItems) // eslint-disable-line
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
      const specification = this.specificationItems.find(t => t.value === this.specification)
      this.agentSizeCap = this.updateAgentCap(specification.cpu, specification.memory)
      const specificationLabel = this.specificationItems.find(t => t.value === this.specification)?.name
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter(t => this.specification === t.specification)
        .map(t => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel
            }),
            label:
              specification?.chargeProvider !== 'FreeTier'
                ? t.label
                : this.agentDeploy !== 'selfHost'
                ? i18n.t('dfs_instance_createagent_mianfeishiyonggui')
                : i18n.t('dfs_instance_utils_baoyue')
          })
        })
        .sort((a, b) => {
          const aType = a.type === 'recurring' ? 1 : 2
          const bType = b.type === 'recurring' ? 1 : 2
          const aOrder = a.order
          const bOrder = b.order
          return aType + aOrder - (bType + bOrder)
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
      if (this.selected?.type && currentItem?.chargeProvider !== 'FreeTier' && this.selected?.type !== 'FreeTier') {
        currentItem = this.packageItems.find(
          it => it.type === this.selected?.type && it.periodUnit === this.selected?.periodUnit //切换规格不改变原来的订阅方式
        )
      }
      this.handleChange(currentItem)
      this.buried('changeSpec')
    },
    //切换订阅方式
    handleChange(item = {}) {
      if (!isObj(item)) {
        item = this.packageItems.find(it => it.value === item)
      }
      this.currentPackage = item.value
      this.selected = item
      if (item?.chargeProvider !== 'FreeTier') {
        this.changeCurrencyOption(item)
        this.currency = this.currencyOption.find(it => it.currency === this.currencyType) || {}
      } else {
        this.currencyOption = []
        this.currency = item
      }
      //更新存储价格
      this.changeMongodbMemory()
      this.buried('changeSubscriptionMethod')
    },
    updateAgentCap(cpu, memory) {
      return {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
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
          maximumFractionDigits: 2
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
    //退订
    cancelSubmit() {
      let { id, paymentMethod } = this.currentRow
      let { resourceId } = this.agent
      let { priceId } = this.selected
      let param = {
        subscribeId: id, // 原订阅ID
        paymentMethod: paymentMethod, // 支付方式
        successUrl: location.href, // 支付成功跳转地址
        cancelUrl: location.href, // 支付失败跳转地址
        subscribeItems: [
          {
            // 跟新增订阅一样
            resourceId: resourceId, // 要变更的产品id，为空时表示新增订阅产品
            priceId: priceId, // 变更后的价格方案
            productType: 'Engine' // 产品类型：Engine,MongoDB
          }
        ]
      }
      this.$axios
        .post('api/tcm/subscribe/change', param)
        .then(data => {
          this.buried('unsubscribeAgentStripe', '', {
            result: true,
            type: ''
          })
          this.$message.success(this.$t('public_message_operation_success'))
          this.visible = false
          this.loadingCancelSubmit = false
          //刷新页面
          this.$emit('closeVisible')
          openUrl(data.payUrl)
          this.buried('renewAgentStripe', '', {
            result: true
          })
          //刷新页面
          this.$emit('closeVisible')
        })
        .finally(() => {
          this.showUnsubscribeDetailVisible = false
          this.loadingCancelSubmit = false
        })
    }
  }
}
</script>

<style scoped lang="scss"></style>
