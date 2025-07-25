<script>
import { CURRENCY_MAP, CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'

import { IconButton, VTable } from '@tap/component'
import i18n from '@tap/i18n'
import { isObj, isStr } from '@tap/shared'
import { uniqBy } from 'lodash-es'

import { AGENT_TYPE_MAP, getPaymentMethod, getSpec } from '../instance/utils'

export default {
  name: 'CreateAgent',
  components: { IconButton, PageContainer },

  inject: ['buried'],

  data() {
    return {
      loading: false,
      submitLoading: false,
      platform: 'selfHost',
      platformOptions: [
        {
          name: 'selfHost',
          title: this.$t('dfs_components_taskalarmtour_deployment_bukeyi'),
          description: this.$t(
            'dfs_components_taskalarmtour_deployment_wodeshujuku',
          ),
        },
        {
          name: 'fullManagement',
          title: this.$t('dfs_components_taskalarmtour_deployment_keyi'),
          description: this.$t(
            'dfs_components_taskalarmtour_deployment_yunshujuku',
          ),
        },
      ],
      provider: '',
      cloudProviderList: [],
      region: '',
      cloudDetail: [],
      specification: '',
      specificationItems: [],
      currentPackage: '',
      packageItems: [],
      currency: '',
      selected: {},
      hasFreeAgent: false,
      currencyType: '',
      currencyOption: [],
      CURRENCY_MAP,
      lang: {
        en: {
          AliCloud: 'Alibaba Cloud',
          'cn-beijing': 'Beijing',
          'cn-hongkong': 'Hong Kong',
        },
      },
      trafficPriceList: [],
      trafficGiftMap: {
        one_time_month: 10,
        recurring_month: 15,
        recurring_year: 20,
      },
    }
  },

  computed: {
    singleMonth() {
      return this.packageItems.find(
        (item) => item.type === 'one_time' && item.periodUnit === 'month',
      )
    },
    singleMonthAmount() {
      return this.singleMonth?.currencyOption.find(
        (item) => item.currency === this.currencyType,
      )?.amount
    },
    singleYearAmount() {
      return this.singleMonthAmount
        ? this.singleMonthAmount * 12
        : this.singleMonthAmount
    },
    defaultCurrencyType() {
      return this.$store.getters.isDomesticStation ? 'cny' : 'usd'
    },

    trafficPriceObj() {
      // 目前流量计费只区分云厂商
      return this.trafficPriceList.find(
        (item) => item.provider === this.provider,
      )
    },

    trafficPrice() {
      const priceObj = this.trafficPriceObj
      let amount
      if (priceObj) {
        amount = priceObj.currencyOption?.find(
          (it) => it.currency === this.currencyType,
        )?.amount
      }

      if (amount) {
        amount = (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }

      return `${CURRENCY_SYMBOL_MAP[this.currencyType]} ${amount || '-'}`
    },
    // freeAgentCount() {
    //   return this.$store.state.agentCount.freeTierAgentCount
    // }
  },

  async created() {
    this.currencyType = this.defaultCurrencyType

    await this.loadAgentCount()

    this.handleChangePlatform('selfHost')
  },

  methods: {
    loadAgentCount() {
      return this.$axios.get('api/tcm/agent/agentCount').then((data) => {
        this.hasFreeAgent = data.freeTierAgentCount > 0
        this.$store.commit('setAgentCount', data)
      })
    },

    //查询规格价格
    getPrice() {
      const params = {
        productType: this.platform,
      }
      return this.$axios
        .get('api/tcm/orders/paid/price', { params })
        .then((data) => {
          let { paidPrice = [] } = data?.[0] || {}

          // 过滤掉按量计费的价格
          paidPrice = paidPrice.filter((t) => t.usageType !== 'metered')

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
                desc: i18n.t(
                  'dfs_agent_download_subscriptionmodeldialog_renwushujianyi',
                  {
                    val: t.limitTask,
                  },
                ),
              }
            }),
            'value',
          ).sort((a, b) => {
            return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
          })
          if (this.hasFreeAgent) {
            this.specificationItems = this.specificationItems.filter(
              (it) => it.chargeProvider !== 'FreeTier',
            )
          }

          this.specification = this.specificationItems[0]?.value
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
            this.currencyType =
              this.packageItems[0]?.currencyOption[0]?.currency
          }
        console.log('specificationItems', this.specificationItems) // eslint-disable-line
        })
    },

    async loadTrafficPrice() {
      const [{ paidPrice }] = await this.$axios.get(
        'api/tcm/orders/paid/price',
        {
          params: { productType: 'networkTraffic' },
        },
      )
      console.log('data', paidPrice, this.currencyType)
      this.trafficPriceList = paidPrice
    },

    getSuggestPipelineNumber(cpu, memory) {
      if (memory == 2) {
        return 3
      }
      if (memory == 4) {
        return 5
      }
      return memory / 0.8
    },

    //查找云厂商
    async getCloudProvider() {
      const data = await this.$axios.get('api/tcm/orders/queryCloudProvider')

      this.cloudProviderList = (data?.items || []).map((item) => {
        item.cloudProviderName =
          this.lang[this.$i18n.locale]?.[item.cloudProvider] ||
          item.cloudProviderName
        return item
      })

      this.provider = this.cloudProviderList?.[0].cloudProvider
      this.changeProvider()
      await this.getPrice()
    },

    async handleChangePlatform(platform) {
      this.loading = true
      this.platform = platform

      if (this.platform === 'fullManagement') {
        await this.getCloudProvider()
        await this.loadTrafficPrice()
      } else {
        await this.getPrice()
      }
      this.loading = false
    },

    //切换云厂商
    changeProvider() {
      const cloudProvider =
        this.cloudProviderList.filter(
          (it) => it.cloudProvider === this.provider,
        ) || []
      this.cloudProviderName = cloudProvider?.[0]?.cloudProviderName
      this.cloudDetail = (cloudProvider?.[0].cloudDetail || []).map((item) => {
        item.regionName =
          this.lang[this.$i18n.locale]?.[item.region] || item.regionName
        return item
      })
      this.region = this.cloudDetail?.[0]?.region
      this.changeRegion()
      //数据初始化
      this.mdbPriceId = 'FreeTier'
      this.mongodbSpecPrice = ''
      this.mdbPrices = 0
      this.mongodbSpec = '0-0'
      this.memorySpace = 5
    },

    changeRegion() {
      const region =
        this.cloudDetail.filter((it) => it.region === this.region) || []
      this.regionName = region?.[0]?.regionName
    },

    //切换规格
    changeSpec(item, disabled) {
      if (disabled) return
      this.specification = item
      this.loadPackageItems()
      this.handleChange(this.packageItems[0]) // 更新订阅方式
      if (!this.currencyType) {
        this.currencyType = this.packageItems[0]?.currency
      }
      let currentItem = this.packageItems[0]
      if (
        this.selected?.type &&
        currentItem?.chargeProvider !== 'FreeTier' &&
        this.selected?.type !== 'FreeTier'
      ) {
        currentItem = this.packageItems.find(
          (it) =>
            it.type === this.selected?.type &&
            it.periodUnit === this.selected?.periodUnit, //切换规格不改变原来的订阅方式
        )
      }
      this.handleChange(currentItem)
      this.buried('changeSpec')
    },

    //订购时长对应价格
    loadPackageItems() {
      const specification = this.specificationItems.find(
        (t) => t.value === this.specification,
      )
      this.agentSizeCap = this.updateAgentCap(
        specification.cpu,
        specification.memory,
      )
      const specificationLabel = this.specificationItems.find(
        (t) => t.value === this.specification,
      )?.name
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter(it => this.specification === it.specification)
        .map(t => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel,
            }),
            label:
              specification?.chargeProvider !== 'FreeTier'
                ? t.label
                : this.platform !== 'selfHost'
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

    updateAgentCap(cpu, memory) {
      return {
        mem: `${Number.parseInt(memory * 1.1 + 2)}G`,
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000,
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
        this.currency =
          this.currencyOption.find((it) => it.currency === this.currencyType) ||
          {}
      } else {
        this.currencyOption = []
        this.currency = item
      }
      this.buried('changeSubscriptionMethod')

      console.log('currentPackage', this.currentPackage, this.selected)
    },

    //切换币种
    changeCurrency(item) {
      if (isStr(item)) {
        this.currencyType = item
        this.currency = this.currencyOption.find((it) => it.currency === item)
      } else {
        this.currencyType = item.currency
        this.currency = item
      }
      //更新存储资源价格
      // this.changeMongodbMemory()
    },

    changeCurrencyOption(item) {
      const options = item.currencyOption
      const { defaultCurrencyType } = this
      // 设置了默认币种, 币种选项默认的排到第一位
      if (
        options?.length &&
        defaultCurrencyType &&
        options[0] !== defaultCurrencyType
      ) {
        options.sort((a, b) => {
          const aVal = a.currency === defaultCurrencyType ? 0 : 1
          const bVal = b.currency === defaultCurrencyType ? 0 : 1
          return aVal - bVal
        })
      }
      this.currencyOption = options
    },

    getAmount(item, isOriginalPrice) {
      const current = this.selected
      let amount = item?.amount

      // 基于单月算原价
      if (
        isOriginalPrice &&
        (current.type === 'recurring' || current.periodUnit === 'year')
      ) {
        if (current.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (current.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },

    getDiscount(item) {
      const { locale } = this.$i18n
      if (item.type === 'recurring' && item.periodUnit === 'month') {
        return locale === 'en' ? 5 : 95
      } else if (item.periodUnit === 'year') {
        return locale === 'en' ? 10 : 9
      }
    },

    formatPrice(item, isOriginalPrice) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0

      const amount = this.getAmount(item, isOriginalPrice)
      return `${CURRENCY_SYMBOL_MAP[item.currency]} ${(
        amount / 100
      ).toLocaleString('zh', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    },

    formatPriceOff() {
      const item = this.currency
      if (!item || item?.chargeProvider === 'FreeTier')
        return CURRENCY_SYMBOL_MAP[item.currency] + 0

      const amount = this.getAmount(item, true) - this.getAmount(item)
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    },

    submit() {
      const { type, priceId, currency, periodUnit, label, specification } =
        this.selected
      const agentUrl = this.$router.resolve({
        name: 'Instance',
        query: {
          id: '',
        },
      })
      const params = {
        price: this.formatPrice(this.currency),
        priceOff: this.formatPriceOff(this.currency),
        priceDiscount: this.getDiscount(this.selected),
        originalPrice: this.formatPrice(this.currency, true),
        subscribeType: type, // 订阅类型：one_time-一次订阅，recurring-连续订阅
        subscriptionMethodLabel: label || '',
        platform: this.platform,
        quantity: '',
        // paymentMethod: 'Stripe',
        successUrl: location.origin + location.pathname + agentUrl.href,
        cancelUrl: location.origin + location.pathname + agentUrl.href,
        periodUnit,
        currency: this.currencyType || currency,
        subscribeItems: [],
        email: this.$store.state.user.email,
      }
      const base = {
        productId: '', // 产品ID
        priceId, // 价格ID，关联定价表
        quantity: 1, // 订阅数量，例如一次性订购2个实例时，这里填写2
        productType: 'Engine', // 产品类型：Engine,MongoDB,APIServer
        resourceId: '', // 资源ID，agent 或者 cluster id
        agentType: this.platform === 'fullManagement' ? 'Cloud' : 'Local', // 半托管-Local，全托管-Cloud
        version: '', // 实例版本
        name: '', // 实例名称
        specLabel: specification,
        memorySpace: this.memorySpace,
        provider: this.provider || '', // 云厂商，全托管必填
        region: this.region || '', // 地域，全托管必填
        zone: this.mdbZone || '', // 可用区，按需填写（阿里云存储需要根据资源余量选择出可用区）
      }
      params.subscribeItems.push(base)

      if (this.platform === 'fullManagement' && this.trafficPriceObj) {
        params.subscribeItems.push({
          productType: 'networkTraffic',
          priceId: this.trafficPriceObj.priceId,
        })
      }

      this.buried('newAgentStripe', '', {
        type,
      })
      this.$axios
        .post('api/tcm/orders/subscribeV2', params)
        .then((data) => {
          this.buried('newAgentStripe', '', {
            type,
            result: true,
          })

          if (data.status === 'incomplete') {
            this.$router.push({
              name: 'pay',
              params: {
                id: data.subscribe,
              },
            })
          } else {
            const agentId = data.subscribeItems[0].resourceId
            const params = agentId ? { id: agentId } : {}
            this.$router.push(
              this.platform === 'fullManagement'
                ? {
                    name: 'Instance',
                    query: params,
                  }
                : {
                    name: 'installAgent',
                    params,
                  },
            )
          }
        })
        .catch(() => {
          this.buried('newAgentStripe', '', {
            type,
            result: false,
          })
        })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #title>
      <div class="flex align-center">
        <IconButton @click="$router.back()">left</IconButton>
        <span class="fs-5 ml-2">{{ $t('public_agent_button_create') }}</span>
      </div>
    </template>

    <section
      class="flex flex-column flex-1 overflow-hidden create-agent-container gap-4 h-100"
    >
      <div class="flex flex-column bg-white rounded-lg overflow-hidden">
        <div class="py-4 fs-6 fw-sub lh-base">
          <div class="create-agent-title position-relative pl-3">
            {{ $t('dfs_agent_information') }}
          </div>
        </div>
        <ElForm
          label-position="top"
          class="flex-1 overflow-x-hidden overflow-y-auto"
        >
          <ElFormItem>
            <template #label>
              <div class="font-color-dark fw-sub">
                {{ $t('dfs_components_taskalarmtour_deployment_qingwen') }}
              </div>
            </template>
            <div class="flex gap-6 lh-base w-100">
              <div
                v-for="item in platformOptions"
                :key="item.name"
                :class="{
                  active: platform === item.name,
                }"
                class="flex flex-column flex-1 position-relative cursor-pointer overflow-hidden rounded-lg border active-group"
                @click="handleChangePlatform(item.name)"
              >
                <div class="flex p-4">
                  <div>
                    <div class="fs-6 fw-bold mb-1 font-color-dark">
                      {{ item.title }}
                    </div>
                    <div class="font-color-light">{{ item.description }}</div>
                  </div>
                </div>
                <div class="is-active position-absolute top-0 end-0">
                  <div class="is-active-triangle" />
                  <VIcon size="16" class="is-active-icon">check-bold</VIcon>
                </div>
              </div>
            </div>
          </ElFormItem>

          <ElFormItem v-if="platform === 'fullManagement'">
            <template #label>
              <div class="font-color-dark fw-sub">
                {{
                  $t(
                    'dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi',
                  )
                }}
              </div>
            </template>
            <div class="cloud-region-grid">
              <span class="font-color-light text-end">{{
                $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang')
              }}</span>

              <el-skeleton :loading="loading" animated>
                <template #template>
                  <div class="flex gap-4">
                    <el-skeleton-item
                      v-for="i in 2"
                      :key="i"
                      class="rounded-4 h-8"
                      variant="button"
                    />
                  </div>
                </template>
                <template #default>
                  <ElRadioGroup
                    v-model="provider"
                    class="flex gap-4"
                    @change="changeProvider"
                  >
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
                </template>
              </el-skeleton>
              <span
                class="font-color-light text-end"
                :class="[
                  { 'form-label': $i18n.locale === 'zh-CN' },
                  { 'form-label-en': $i18n.locale === 'en' },
                ]"
                >{{
                  $t('dfs_agent_download_subscriptionmodeldialog_diqu')
                }}</span
              >

              <el-skeleton :loading="loading" animated>
                <template #template>
                  <div class="flex gap-4">
                    <el-skeleton-item
                      v-for="i in 4"
                      :key="i"
                      class="rounded-4 h-8"
                      variant="button"
                    />
                  </div>
                </template>
                <template #default>
                  <ElRadioGroup
                    v-model="region"
                    class="flex gap-4"
                    @change="changeRegion"
                  >
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
                </template>
              </el-skeleton>
            </div>
          </ElFormItem>

          <ElFormItem>
            <template #label>
              <div class="font-color-dark fw-sub">
                {{ $t('dfs_guide_index_xuanzejisuanyin') }}
              </div>
            </template>
            <el-skeleton :loading="loading" animated>
              <template #template>
                <div class="flex gap-4">
                  <el-skeleton-item
                    v-for="i in 4"
                    :key="i"
                    class="rounded-4 h-8"
                    variant="button"
                  />
                </div>
              </template>
              <template #default>
                <el-row
                  type="flex"
                  class="flex-wrap lh-base"
                  :gutter="16"
                  style="row-gap: 16px"
                >
                  <el-col
                    v-for="(item, i) in specificationItems"
                    :key="i"
                    :span="8"
                  >
                    <div
                      class="position-relative px-4 py-2 cursor-pointer active-group rounded-lg overflow-hidden border"
                      :class="{
                        active: specification === item.value,
                        disabled:
                          hasFreeAgent && item.chargeProvider === 'FreeTier',
                      }"
                      @click="
                        changeSpec(
                          item.value,
                          hasFreeAgent && item.chargeProvider === 'FreeTier',
                        )
                      "
                    >
                      <div class="is-active position-absolute top-0 end-0">
                        <div class="is-active-triangle" />
                        <VIcon size="16" class="is-active-icon"
                          >check-bold</VIcon
                        >
                      </div>
                      <div
                        class="spec-li-title lh-base fw-bold font-color-dark"
                      >
                        <span class="align-middle"
                          >{{ item.name }}: {{ item.desc }}</span
                        >
                        <ElTag
                          v-if="item.chargeProvider === 'FreeTier'"
                          class="bg-color-warning text-white border-0 ml-2"
                          >{{
                            platform === 'selfHost'
                              ? $t('dfs_instance_instance_mianfei')
                              : $t('dfs_instance_createagent_mianfeitiyan')
                          }}
                        </ElTag>
                      </div>
                      <div
                        v-if="platform === 'selfHost'"
                        class="spec-li-title mt-1 lh-base font-color-sslight"
                        v-html="
                          $t(
                            'dfs_agent_specification_description',
                            updateAgentCap(item.cpu, item.memory),
                          )
                        "
                      />
                    </div>
                  </el-col>
                </el-row>
              </template>
            </el-skeleton>
          </ElFormItem>

          <ElFormItem v-if="platform === 'fullManagement'">
            <template #label>
              <div class="font-color-dark fw-sub">
                {{ $t('dfs_traffic_billing') }}
                <span class="fw-normal font-color-sslight">{{
                  $t('dfs_traffic_billing_desc')
                }}</span>
                <span class="fw-normal color-warning">{{
                  $t('dfs_traffic_billing_prefix', {
                    trafficPrice,
                    gift: trafficGiftMap[
                      `${selected.type}_${selected.periodUnit}`
                    ],
                  })
                }}</span>
              </div>
            </template>

            <el-skeleton :loading="loading" animated>
              <template #template>
                <div class="flex gap-4">
                  <el-skeleton-item
                    v-for="i in 1"
                    :key="i"
                    class="rounded-4 h-8"
                    variant="button"
                  />
                </div>
              </template>
              <template>
                <ElRadioGroup value="true" class="flex gap-4">
                  <ElRadio
                    label="true"
                    border
                    class="subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ trafficPrice }}/GB
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </template>
            </el-skeleton>
          </ElFormItem>

          <ElFormItem>
            <template #label>
              <div class="font-color-dark fw-sub">
                {{ $t('dfs_instance_instance_dingyuefangshi') }}
              </div>
            </template>

            <el-skeleton :loading="loading" animated>
              <template #template>
                <div class="flex gap-4">
                  <el-skeleton-item
                    v-for="i in 4"
                    :key="i"
                    class="rounded-4 h-8"
                    variant="button"
                  />
                </div>
              </template>
              <template #default>
                <ElRadioGroup
                  v-model="currentPackage"
                  class="flex gap-4"
                  @change="handleChange"
                >
                  <ElRadio
                    v-for="(item, index) in packageItems"
                    :key="index"
                    :label="item.value"
                    border
                    class="subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ item.label }}
                      <ElTag
                        v-if="
                          item.type === 'recurring' ||
                          item.periodUnit === 'year'
                        "
                        class="discount-tag fw-sub rounded-4 border-0 ml-2"
                        >{{
                          $t('dfs_agent_subscription_discount', {
                            val: getDiscount(item),
                          })
                        }}</ElTag
                      >

                      <VIcon
                        v-if="
                          item.type === 'recurring' &&
                          item.periodUnit === 'year'
                        "
                        class="position-absolute discount-hot-icon"
                        >hot-o</VIcon
                      >
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </template>
            </el-skeleton>
          </ElFormItem>

          <!--选择币种-->
          <!--<ElFormItem v-if="currencyOption && currencyOption.length > 0">
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_agent_download_subscriptionmodeldialog_xuanzebizhong') }}
          </div>
          <ElRadioGroup v-model="currencyType" @input="changeCurrency" class="flex gap-4">
            <ElRadio
              v-for="(item, index) in currencyOption"
              :key="index"
              :label="item.currency"
              border
              class="rounded-4 m-0"
              >{{ CURRENCY_MAP[item.currency] }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>-->
        </ElForm>
      </div>

      <div class="bg-white rounded-lg flex align-center gap-4">
        <ElButton
          size="large"
          type="primary"
          :loading="submitLoading"
          @click="submit"
          >{{ $t('public_button_subscription') }}
        </ElButton>
        <div class="flex align-items-end lh-1">
          <span>{{ $t('public_total') }}:</span>
          <span class="color-primary fs-5 ml-1">{{
            formatPrice(currency)
          }}</span>
          <span v-if="selected" class="font-color-dark mx-2">
            {{ selected.label }}
          </span>
          <div v-if="getDiscount(selected)">
            <span class="price-detail-label text-end inline-block mr-2"
              >{{
                $t('dfs_agent_subscription_discount', {
                  val: getDiscount(selected),
                })
              }}:
            </span>
            <span class="color-warning fw-sub"
              >-{{ formatPriceOff(currency) }}</span
            >
          </div>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.create-agent-container {
  .create-agent-title {
    &:before {
      position: absolute;
      content: '';
      width: 4px;
      left: 0;
      top: 2px;
      bottom: 2px;
      background-color: var(--color-primary);
      border-radius: 2px;
    }
  }

  .active-group {
    .is-active {
      display: none;
    }

    &.active {
      $primary: var(--color-primary);
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

  .subscription-radio.el-radio {
    padding: 0 12px;
    line-height: 30px;
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

  .cloud-region-grid {
    display: grid;
    grid-template-columns: auto 1fr; /* 两列 */
    grid-gap: 16px;
  }

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
