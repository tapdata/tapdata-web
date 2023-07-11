<template>
  <section>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      4、您需要自行安装一个计算引擎到您的网络环境中, 选择一种合适的方式吧。
    </div>
    <el-form label-position="top" ref="ruleForm">
      <ElFormItem :label="$t('dfs_instance_instance_dingyuefangshi')">
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
      <ElFormItem
        :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi')"
        v-if="platform === 'fullManagement'"
      >
        <div class="flex">
          <span
            class="font-color-light inline-block"
            :class="[{ 'form-label': this.$i18n.locale === 'zh-CN' }, { 'form-label-en': this.$i18n.locale === 'en' }]"
            >{{ $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang') }}</span
          >
          <ElRadioGroup v-model="provider" @input="changeProvider" class="flex gap-4">
            <ElRadio
              v-for="(item, index) in cloudProviderList"
              :key="index"
              :label="item.cloudProvider"
              border
              class="rounded-4 subscription-radio m-0 position-relative"
            >
              <span class="inline-flex align-center">
                {{ item.cloudProviderName }}
              </span>
            </ElRadio>
          </ElRadioGroup>
        </div>
        <div class="flex mt-4">
          <span
            class="font-color-light inline-block"
            :class="[{ 'form-label': this.$i18n.locale === 'zh-CN' }, { 'form-label-en': this.$i18n.locale === 'en' }]"
            >{{ $t('dfs_agent_download_subscriptionmodeldialog_diqu') }}</span
          >
          <ElRadioGroup v-model="region" class="flex gap-4" @change="changeRegion">
            <ElRadio
              v-for="(item, index) in cloudDetail"
              :key="index"
              :label="item.region"
              border
              class="rounded-4 subscription-radio m-0 position-relative"
            >
              <span class="inline-flex align-center">
                {{ item.regionName }}
              </span>
            </ElRadio>
          </ElRadioGroup>
        </div>
      </ElFormItem>
      <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
        <ul class="flex flex-wrap">
          <li
            class="spec-li cursor-pointer position-relative cursor-pointer px-4 py-2 mb-4 mr-4 rounded-4"
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
                  platform === 'selfHost'
                    ? $t('dfs_instance_instance_mianfei')
                    : $t('dfs_instance_createagent_mianfeitiyan')
                }}</ElTag
              >
            </div>
            <div
              v-if="platform === 'selfHost'"
              class="spec-li-title mt-1 lh-base font-color-sslight"
              v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
            ></div>
          </li>
        </ul>
      </ElFormItem>
    </el-form>
    <div class="spec-price flex align-items-end align-items-center ml-4">
      <div class="text-end px-3 py-1">
        {{ $t('public_total') }}:
        <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
      </div>
      <span class="font-color-dark mr-2" v-if="selected">
        {{ selected.label }}
      </span>
      <div v-if="getDiscount(selected)">
        <span class="price-detail-label text-end inline-block mr-2"
          >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(selected) }) }}:
        </span>
        <span class="color-warning fw-sub">-{{ formatPriceOff(currency) }}</span>
      </div>
    </div>
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
      selected: {},
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
      agentCount: false,
      currentPackage: '',
      specificationItems: [],
      packageItems: [],
      currencyType: '',
      agent: '',
      provider: '',
      region: '',
      cloudDetail: [],
      cloudProviderName: '',
      cloudProviderList: []
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
    this.checkAgentCount()
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
      this.defaultCurrencyType = currencyType
    }
  },
  methods: {
    //检查Agent个数
    async checkAgentCount() {
      this.agentCount = window.__agentCount__?.freeTierAgentCount || 0
      await this.getCloudProvider()
    },
    //查询规格价格
    getPrice() {
      const params = {
        productType: this.platform
      }
      this.$axios.get('api/tcm/orders/paid/price', { params }).then(data => {
        let { paidPrice = [] } = data?.[0] || {}
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
        //新人引导只取前四个规格
        this.specificationItems = this.specificationItems.splice(0, 4)
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
      this.buried('changeSubscriptionMethod')
    },
    //切换云厂商
    changeProvider() {
      let cloudProvider = this.cloudProviderList.filter(it => it.cloudProvider === this.provider) || []
      this.cloudProviderName = cloudProvider?.[0]?.cloudProviderName
      this.cloudDetail = cloudProvider?.[0].cloudDetail || []
      this.region = this.cloudDetail?.[0]?.region
      this.changeRegion()
    },
    changeRegion() {
      let region = this.cloudDetail.filter(it => it.region === this.region) || []
      this.regionName = region?.[0]?.regionName
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
    //查找云厂商
    getCloudProvider() {
      return this.$axios.get('api/tcm/orders/queryCloudProvider').then(data => {
        //数据模式（带存储）过滤只带存储的云厂商
        if (this.platform === 'realTime') {
          let original = data?.items || []
          original.forEach(it => {
            if (it.cloudDetail?.length > 0) {
              it.cloudDetail = it.cloudDetail.filter(item => item.productList.includes('mongodb')) || []
            }
          })
          this.cloudProviderList = original.filter(it => it.cloudDetail.length > 0)
        } else this.cloudProviderList = data?.items || []
        //初始化云厂商
        this.provider = this.cloudProviderList?.[0].cloudProvider
        this.changeProvider()
        this.getPrice()
      })
    },
    getAmount(item, isOriginalPrice) {
      const current = this.selected
      let amount = item?.amount

      // 基于单月算原价
      if (isOriginalPrice && (current.type === 'recurring' || current.periodUnit === 'year')) {
        if (current.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (current.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },
    getDiscount() {
      let item = this.selected
      const { locale } = this.$i18n
      if (item.type === 'recurring' && item.periodUnit === 'month') {
        return locale === 'en' ? 5 : 95
      } else if (item.periodUnit === 'year') {
        return locale === 'en' ? 10 : 9
      }
    },
    formatPriceOff() {
      let item = this.currency
      if (!item || item?.chargeProvider === 'FreeTier') return CURRENCY_SYMBOL_MAP[item.currency] + 0

      const amount = this.getAmount(item, true) - this.getAmount(item)
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
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
    submit() {
      const { type, priceId, currency, periodUnit } = this.selected
      const fastDownloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: ''
        }
      })
      const agentUrl = window.App.$router.resolve({
        name: 'Instance',
        query: {
          id: ''
        }
      })
      let params = {
        price: this.formatPrice(this.currency),
        priceOff: this.formatPriceOff(this.currency),
        subscribeType: type, // 订阅类型：one_time-一次订阅，recurring-连续订阅
        platform: this.platform,
        quantity: '',
        paymentMethod: this.agentDeploy === 'aliyun' ? 'AliyunMarketCode' : 'Stripe',
        successUrl:
          this.agentDeploy === 'fullManagement'
            ? location.origin + location.pathname + agentUrl.href
            : location.origin + location.pathname + fastDownloadUrl.href,
        cancelUrl: location.href,
        periodUnit,
        currency: this.currencyType || currency,
        subscribeItems: []
      }
      let base = {
        productId: '', // 产品ID
        priceId, // 价格ID，关联定价表
        quantity: 1, // 订阅数量，例如一次性订购2个实例时，这里填写2
        productType: 'Engine', // 产品类型：Engine,MongoDB,APIServer
        resourceId: '', // 资源ID，agent 或者 cluster id
        agentType: this.agentDeploy === 'fullManagement' ? 'Cloud' : 'Local', // 半托管-Local，全托管-Cloud
        version: '', // 实例版本
        name: '', // 实例名称
        memorySpace: this.memorySpace,
        provider: this.provider || '', // 云厂商，全托管必填
        region: this.region || '', // 地域，全托管必填
        zone: this.mdbZone || '' // 可用区，按需填写（阿里云存储需要根据资源余量选择出可用区）
      }
      params.subscribeItems.push(base)
      return params
    }
  }
}
</script>

<style scoped lang="scss">
.spec-price {
  position: absolute;
  bottom: 18px;
  right: 135px;
}
.form-label {
  width: 90px;
}
.form-label-en {
  width: 170px;
}
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
.spec-li:hover {
  border: 1px solid map-get($color, primary);
}
.spec-li {
  width: 495px;
  border: 1px solid #dedede;
  border-radius: 4px;
  .is-active {
    display: none;
  }
  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
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
  &.disabled {
    background-color: #fafafa;
    border-width: 0 !important;
    cursor: not-allowed;
    .spec-li-title {
      color: #86909c !important;
    }
  }
}
</style>
