<template>
  <section class="flex flex-column flex-1 overflow-hidden create-storage-container gap-4">
    <div class="bg-white rounded-lg p-4">
      <div class="flex align-center">
        <IconButton @click="$router.back()">left</IconButton>
        <span class="fs-5 ml-2">{{ $t('page_title_subscribe_storage') }}</span>
      </div>
    </div>

    <div class="flex flex-column bg-white rounded-lg overflow-hidden px-6">
      <div class="px-4 py-2 my-4 lh-base color-primary-light-9 rounded-lg">
        <div class="mb-1 flex align-center">
          <VIcon class="text-primary mr-2" size="18">info</VIcon>
          <div class="font-color-dark fs-6 fw-sub">{{ $t('dfs_subscribe_storage_tip_title') }}</div>
        </div>
        <div class="lh-lg" v-html="$t('dfs_subscribe_storage_tip_content')"></div>
      </div>
      <ElForm label-position="top" class="flex-1 overflow-x-hidden overflow-y-auto">
        <!--存储地区-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi') }}
          </div>

          <div class="cloud-region-grid">
            <span
              class="font-color-light inline-block"
              :class="[
                { 'form-label': this.$i18n.locale === 'zh-CN' },
                { 'form-label-en': this.$i18n.locale === 'en' }
              ]"
              >{{ $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang') }}</span
            >
            <ElRadioGroup v-model="provider" @input="changeProviderInStorage" class="flex gap-4">
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
            <span
              class="font-color-light inline-block"
              :class="[
                { 'form-label': this.$i18n.locale === 'zh-CN' },
                { 'form-label-en': this.$i18n.locale === 'en' }
              ]"
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
        <!--请选择您需要的存储资源规格-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_instance_createagent_qingxuanzeninxu2') }}
          </div>
          <el-skeleton :loading="loadingCloudMdbSource || loadingMongoCluster" animated>
            <template slot="template">
              <div class="flex gap-4">
                <el-skeleton-item v-for="i in 4" :key="i" class="rounded-4 h-32" variant="button" />
              </div>
            </template>
            <template>
              <ElRadioGroup v-model="mongodbSpec" @change="changeMongodbMemory" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in mongodbSpecItems"
                  :key="index"
                  :label="item.value"
                  border
                  class="rounded-4 subscription-radio m-0 position-relative"
                >
                  <span class="inline-flex align-center">
                    {{ item.name }}
                  </span>
                </ElRadio>
              </ElRadioGroup>
            </template>
          </el-skeleton>
        </ElFormItem>
        <!--请选择您需要的存储空间-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_instance_createagent_qingxuanzeninxu') }}
          </div>
          <ElRadioGroup v-model="memorySpace" class="flex gap-4" @change="changeMongodbMemory">
            <ElRadio
              v-for="(item, index) in memoryMap"
              :key="index"
              :label="item.key"
              border
              class="rounded-4 subscription-radio m-0 position-relative"
            >
              <span class="inline-flex align-center">
                {{ item.value }}
              </span>
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <!--订阅方式-->
        <ElFormItem v-show="mdbPrices > 0">
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_instance_instance_dingyuefangshi') }}
          </div>
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
              </span>
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="bg-white rounded-lg px-6 py-4 flex align-center gap-4">
      <ElButton type="primary" :loading="submitLoading" @click="submit">{{
        $t('public_button_subscription')
      }}</ElButton>
      <div class="flex align-items-end lh-1">
        <span>{{ $t('public_total') }}:</span>
        <span class="color-primary fs-5 ml-1">{{ mongodbSpecPrice }}</span>
        <span class="font-color-dark mx-2" v-if="selected">
          {{ selected.label }}
        </span>
        <!--<div v-if="getDiscount(selected)">
          <span class="price-detail-label text-end inline-block mr-2"
            >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(selected) }) }}:
          </span>
          <span class="color-warning fw-sub">-{{ mongodbSpecPrice }}</span>
        </div>-->
      </div>
    </div>
  </section>
</template>

<script>
import { uniqBy } from 'lodash'

import i18n from '@tap/i18n'
import { IconButton } from '@tap/component'
import { isObj } from '@tap/shared'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP } from '@tap/business'

import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import { dayjs } from '@tap/business/src/shared/dayjs'

export default {
  name: 'CreateAgent',

  inject: ['buried'],

  components: { IconButton },

  data() {
    return {
      activeStep: 1,
      agentDeploy: 'selfHost',
      platform: 'integration',
      allPackages: '',
      packageItems: [],
      cloudProviderList: [],
      cloudDetail: [],
      region: '',
      provider: '',
      regionName: '',
      cloudProviderName: '',
      specificationItems: [],
      specification: '',
      currentAliyunCode: '',
      specificationAliyunCode: '',
      currentAliyunAgentType: '',
      email: '',
      selected: {},
      form: {
        email: ''
      },
      mongodbSpecItems: [],
      mongodbUrl: '',
      mdbPriceId: 'FreeTier', //价格ID
      mongodbSpecPrice: '', //格式化存储价格
      memorySpace: 5, //存储空间
      mdbPrices: 0, //存储价格 与计算资源计算
      mongodbSpec: '0-0', //存储规格
      paidPrice: [], //原始所有存储价格
      currentMemorySpecName: i18n.t('dfs_instance_createagent_mianfeishiyonggui'),
      specMap: {
        '1C2G': i18n.t('dfs_agent_download_subscriptionmodeldialog_extra')
      },
      realTimeTag: [
        {
          value: i18n.t('dfs_instance_createagent_apIkuaisu'),
          class: 'col-4'
        },
        {
          value: i18n.t('dfs_instance_createagent_shishishucang'),
          class: 'col-5'
        },
        {
          value: i18n.t('dfs_instance_createagent_bIkanbangong'),
          class: 'col-3'
        },
        {
          value: i18n.t('dfs_instance_createagent_kehu'),
          class: 'col-4'
        },
        {
          value: i18n.t('dfs_instance_createagent_shangpinzhongxin'),
          class: 'col-5'
        },
        {
          value: i18n.t('dfs_instance_createagent_minjieshujuzhong'),
          class: 'col-3'
        }
      ],
      interTag: [
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shishishujutong'),
          class: 'col-1'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujushangyunkua'),
          class: 'col-2'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujuEtl'),
          class: 'col-3'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_redis_gongshu'),
          class: 'col-1'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujukuguochan'),
          class: 'col-2'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_kafka'),
          class: 'col-3'
        }
      ],
      CURRENCY_MAP: CURRENCY_MAP,
      agentTypeMap: AGENT_TYPE_MAP,
      licenseCode: '',
      saveLoading: false,
      submitLoading: false,
      submitOnlineLoading: false,
      codeData: [],
      agentCount: 0,
      currentCode: {},
      hiddenNewCode: false,
      aliyunLoading: false,
      currentSpecName: '1C2G',
      currencyOption: [],
      currency: '',
      currencyType: '',
      agentSizeCap: {
        mem: '-',
        pipeline: '-',
        tps: '-'
      },
      columns: [
        {
          label: i18n.t('dfs_instance_selectlist_shouquanma'),
          prop: 'licenseCode',
          minWidth: 300
        },
        {
          label: i18n.t('dfs_instance_selectlist_youxiaoqi'),
          prop: 'expiredTimeLabel'
        },
        {
          label: i18n.t('dfs_instance_selectlist_shiliguige'),
          prop: 'specLabel'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
        },
        {
          label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
          prop: 'bindAgent'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          slotName: 'operation',
          width: 120
        }
      ],
      currentPackage: '',
      disabledAliyunCode: false,
      //是否有存储Agent
      mdbCount: false, //默认没有存储
      mdbFreeCount: 0, //免费存储个数
      mdbZone: '',
      spec2Zone: null,
      orderStorage: false,
      isDomesticStation: true,
      loadingCloudMdbSource: false,
      loadingMongoCluster: false
    }
  },

  computed: {
    memoryMap() {
      if (this.mdbPrices === 0) {
        return [
          {
            key: 5,
            value: '5GB'
          }
        ]
      }
      return [
        {
          key: 100,
          value: '100GB'
        },
        {
          key: 500,
          value: '500GB'
        },
        {
          key: 1000,
          value: '1000GB'
        }
      ]
    },

    singleMonth() {
      return this.packageItems.find(item => item.type === 'one_time' && item.periodUnit === 'month')
    },
    singleMonthAmount() {
      return this.singleMonth?.currencyOption.find(item => item.currency === this.currencyType)?.amount
    },
    singleYearAmount() {
      return this.singleMonthAmount ? this.singleMonthAmount * 12 : this.singleMonthAmount
    },
    freeAgentCount() {
      return this.$store.state.agentCount.freeTierAgentCount
    }
  },

  async created() {
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
      this.defaultCurrencyType = currencyType
    }

    //获取是否有存储实例
    await this.getMdbCount()
    this.orderStorage = true
    this.platform = 'realTime'
    this.agentDeploy = 'fullManagement'
    await this.checkAgentCount()
    await this.getCloudMdbSource()
    this.getMongoCluster()

    //获取是否有存储实例
    // await this.getMdbCount()
    // await this.getCloudProvider()
    // await this.getCloudMdbSource()
    // this.getMongoCluster()
  },

  methods: {
    prevStep() {
      //存储点击上一步需要清掉存储规格以及价格
      if (this.platform === 'realTime') {
        this.mdbPriceId = 'FreeTier'
        this.mongodbSpecPrice = ''
        this.mdbPrices = 0
        this.mongodbSpec = '0-0'
        this.memorySpace = 5
      }
      this.activeStep--
      //授权码 带存储 不加不减步数
      if (this.agentDeploy === 'aliyun' && this.mdbCount) {
        this.activeStep++
      }
      //授权码 特殊的第二步
      if (this.agentDeploy === 'aliyun' && this.activeStep === 1) {
        this.agentDeploy = 'selfHost'
      }
    },
    async next() {
      if (
        this.activeStep === 4 &&
        this.platform === 'realTime' &&
        this.agentDeploy === 'selfHost' &&
        this.mongodbUrl === ''
      ) {
        this.$message.error(i18n.t('dfs_instance_createagent_qingtianxieninzi'))
        return
      }
      //检测 mdbPriceId, 价格不能为空
      if ((this.mdbPriceId === '' || !this.mdbPriceId) && this.activeStep === 4 && this.platform === 'realTime') {
        this.$message.error(i18n.t('dfs_instance_createagent_meiyouhuoqudao'))
        return
      }
      this.activeStep++
      this.buried('productTypeNext')
      //存储方案请求接口得到存储价格
      if (this.activeStep === 4 && this.platform === 'realTime') {
        // await this.getCloudMdbSource()
        await this.getMongoCluster()
        if (this.provider === 'GCP') {
          this.mongodbSpec = this.mongodbSpecItems[0]?.value || ''
        }
        this.changeMongodbMemory()
      }
      //第一次选择授权码 返回托管模式选择 不切换类型，导致价格丢失
      if ([1, 2].includes(this.activeStep) && this.agentDeploy !== 'aliyun') {
        this.getPrice()
      }
    },
    //选择平台
    changePlatform(type) {
      this.platform = type
      this.loadPackageItems()
      //更新存储资源价格
      this.changeMongodbMemory()
      //云厂商
      this.getCloudProvider()
      //数据初始化
      this.mdbPriceId = 'FreeTier'
      this.mongodbSpecPrice = ''
      this.mdbPrices = 0
      this.mongodbSpec = '0-0'
      this.memorySpace = 5
    },
    //选择订阅模式
    changeAgentDeploy(type) {
      this.cancelPrice() //数据初始化
      this.agentDeploy = type
      this.getCloudProvider()
      if (type === 'aliyun') {
        this.activeStep++
        this.getAvailableCode()
        this.buried('productTypeAliyunCode')
      } else {
        this.getPrice()
      }
      //有存储 不加步数
      if (type === 'aliyun' && this.mdbCount) {
        this.activeStep--
      }
    },
    //价格初始化
    cancelPrice() {
      //数据初始化
      this.mdbPriceId = 'FreeTier'
      this.mongodbSpecPrice = ''
      this.selected = {}
      this.currency = ''
      this.mdbPrices = 0
      this.mongodbSpec = '0-0'
      this.memorySpace = 5
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
      if (this.selected?.type && currentItem?.chargeProvider !== 'FreeTier' && this.selected?.type !== 'FreeTier') {
        currentItem = this.packageItems.find(
          it => it.type === this.selected?.type && it.periodUnit === this.selected?.periodUnit //切换规格不改变原来的订阅方式
        )
      }
      this.handleChange(currentItem)
      this.buried('changeSpec')
    },
    async changeProviderInStorage() {
      this.changeProvider()
      await this.getMongoCluster()
      this.mongodbSpec = this.mongodbSpecItems[0]?.value || ''
      this.changeMongodbMemory()
    },
    //切换云厂商
    changeProvider() {
      let cloudProvider = this.cloudProviderList.filter(it => it.cloudProvider === this.provider) || []
      this.cloudProviderName = cloudProvider?.[0]?.cloudProviderName
      this.cloudDetail = cloudProvider?.[0].cloudDetail || []
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
      let region = this.cloudDetail.filter(it => it.region === this.region) || []
      this.regionName = region?.[0]?.regionName
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
    //切换币种
    // changeCurrency(item) {
    //   if (isStr(item)) {
    //     this.currencyType = item
    //     this.currency = this.currencyOption.find(it => it.currency === item)
    //   } else {
    //     this.currencyType = item.currency
    //     this.currency = item
    //   }
    //   //更新存储资源价格
    //   this.changeMongodbMemory()
    // },
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
    getAmount(item, isOriginalPrice) {
      const current = this.selected
      let amount = item.amount

      // 基于单月算原价
      if (isOriginalPrice && (current.type === 'recurring' || current.periodUnit === 'year')) {
        if (this.selected.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (this.selected.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },
    formatPriceOff(item) {
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
    //格式化价格
    formatPrice(item, isOriginalPrice) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0

      let amount = this.getAmount(item, isOriginalPrice) + this.mdbPrices
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        ' ' +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    specPrice(item, isOriginalPrice) {
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

    //检查Agent个数
    async checkAgentCount() {
      await this.getCloudProvider()
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.jpg`)
    },
    getAliiyunImg(name) {
      return require(`../../../public/images/dashboard/${name}.svg`)
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
    updateAgentCap(cpu, memory) {
      return {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
      }
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
    //查询规格价格
    getPrice() {
      const params = {
        productType: this.agentDeploy
      }
      this.$axios.get('api/tcm/orders/paid/price', { params }).then(data => {
        const { paidPrice = [] } = data?.[0] || {}
        // 规格
        this.specificationItems = uniqBy(
          paidPrice.map(t => {
            const { cpu = 0, memory = 0 } = t.spec || {}
            let desc = i18n.t('dfs_agent_download_subscriptionmodeldialog_renwushujianyi', {
              val: this.getSuggestPipelineNumber(cpu, memory)
            })
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
        // 已体验过免费
        if (this.freeAgentCount > 0) {
          this.specificationItems = this.specificationItems.filter(it => it.chargeProvider !== 'FreeTier')
        }
        // 如果是单独订购存储，默认调过免费实例，避免后续step受免费实例影响
        this.specification =
          !this.freeAgentCount && this.orderStorage
            ? this.specificationItems[1]?.value
            : this.specificationItems[0]?.value
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
        this.loadPackageItems()
        // this.changeCurrency(this.packageItems[0])
        if (!this.currencyType) {
          this.currencyType = this.packageItems[0]?.currencyOption[0]?.currency
        }
        this.handleChange(this.packageItems[0])

        console.log('specificationItems', this.specificationItems) // eslint-disable-line
      })
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

    //获取存储价格
    getMongoCluster() {
      const params = {
        productType: 'mongoCluster',
        region: this.region,
        cloudProvider: this.provider
      }
      this.loadingMongoCluster = true
      return this.$axios
        .get('api/tcm/orders/paid/price', { params })
        .then(data => {
          const { paidPrice = [] } = data?.[0] || {}
          this.paidPrice = paidPrice
          //根据订阅方式再过滤一层
          let prices = paidPrice?.filter(
            t =>
              (t.periodUnit === this.selected.periodUnit && t.type === this.selected.type) ||
              t.chargeProvider === 'FreeTier'
          )
          this.mongodbPaidPrice = prices
          // 规格
          let items = uniqBy(
            prices.map(t => {
              const { cpu = 0, memory = 0 } = t.spec || {}
              return {
                value: `${cpu}-${memory}`,
                cpu,
                memory,
                name:
                  t.chargeProvider === 'FreeTier'
                    ? i18n.t('dfs_instance_createagent_mianfeishiyonggui')
                    : `MongoDB ${cpu}C${memory}G`,
                chargeProvider: t.chargeProvider,
                mdbSpec: t.mdbSpec
              }
            }),
            'name'
          ).sort((a, b) => {
            return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
          })
          // 已体验过免费
          if (this.mdbFreeCount > 0) {
            items = items.filter(it => it.chargeProvider !== 'FreeTier')
            //默认值取第一个
            this.mongodbSpec = items[0]?.value
            this.memorySpace = 100
          }

          const { spec2Zone } = this
          // 过滤不支持的
          if (this.provider === 'AliCloud') {
            items = items.filter(({ mdbSpec }) => {
              return !mdbSpec || !spec2Zone || spec2Zone[mdbSpec]
            })
          }

          this.mongodbSpecItems = items
          this.changeMongodbMemory()
        })
        .finally(() => {
          this.loadingMongoCluster = false
        })
    },
    //判断是否可选存储规格
    async getCloudMdbSource(provider = 'AliCloud') {
      this.loadingCloudMdbSource = true
      //选择存储规格时，需要判断mdbSpec 是否有可用区
      try {
        const data = await this.$axios.get('api/tcm/orders/paid/getCloudMdbSource')
        let original = data.find(it => it.cloudProvider === provider)
        let { mdbRegionProvider = [] } = original
        this.spec2Zone = mdbRegionProvider.reduce((map, item) => {
          return item.mdbZoneProvider.reduce((_map, it) => {
            return it.mdbProvider.reduce((__map, specItem) => {
              if (!__map[specItem.mdbSpec]) {
                _map[specItem.mdbSpec] = it.zone
              }
              return __map
            }, _map)
          }, map)
        }, {})
      } catch (e) {
        console.log(e) // eslint-disable-line
      }
      this.loadingCloudMdbSource = false
    },

    //选择存储规格
    changeMongodbMemory() {
      let values = this.mongodbSpec.split('-')
      let cpu = Number(values[0])
      let memory = Number(values[1])
      this.mdbZone = '' //初始化
      //根据订阅方式再过滤一层
      this.mongodbPaidPrice = this.paidPrice?.filter(
        t =>
          (t.periodUnit === this.selected.periodUnit && t.type === this.selected.type) ||
          t.chargeProvider === 'FreeTier'
      )
      if (cpu === 0 && memory === 0) {
        this.mongodbSpecPrice = CURRENCY_SYMBOL_MAP[this.currencyType] + 0
        this.mdbPrices = 0
        this.mdbPriceId = this.mongodbPaidPrice?.[0]?.priceId
        this.currentMemorySpecName = i18n.t('dfs_instance_createagent_mianfeishiyonggui')
        this.memorySpace = 5
        return
      } else {
        if (this.memorySpace === 5) {
          //非免费规格 需要初始化存储空间
          this.memorySpace = 100
        }
      }
      this.currentMemorySpecName = `MongoDB ${cpu}C${memory}G`
      let price = this.mongodbPaidPrice.find(
        t => t.spec.storageSize === this.memorySpace && cpu === t.spec.cpu && memory === t.spec.memory
      )
      console.log('price', price) // eslint-disable-line
      //需要改变mdbPriceId 因为存储空间改变了
      this.mdbPriceId = price?.priceId
      this.mdbPrice(price?.currencyOption?.find(item => item.currency === this.currencyType)?.amount || 0)
      if (this.provider !== 'AliCloud') return
      this.mdbZone = this.spec2Zone[price?.mdbSpec]
    },
    //存储价格
    mdbPrice(price) {
      this.mdbPrices = price
      this.mongodbSpecPrice = this.formatAmount(price)
    },
    formatAmount(price) {
      return (
        CURRENCY_SYMBOL_MAP[this.currencyType] +
        ' ' +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },

    getEmailRules() {
      return [
        {
          required: this.selected.type === 'recurring',
          message: i18n.t('dfs_instance_create_qingshuruninde')
        },
        {
          type: 'email',
          message: i18n.t('dfs_instance_create_qingshuruzhengque')
        }
      ]
    },

    getPlaceholder() {
      return this.selected.type === 'recurring'
        ? i18n.t('dfs_instance_create_yongyujieshoumei')
        : i18n.t('dfs_instance_create_kexuan')
    },

    validateForm(ref) {
      return new Promise(resolve => {
        this.$refs[ref].validate(valid => {
          resolve(valid)
        })
      })
    },
    //是否有存储agent
    getMdbCount() {
      this.$axios.get('api/tcm/mdb/stats').then(data => {
        this.mdbCount = data?.totalCount > 0
        this.mdbFreeCount = data?.freeCount
      })
    },
    //提交订单
    async submit(row = {}, paymentType = 'online') {
      const { type, priceId, currency, periodUnit } = this.selected
      const { email } = this.form

      if (paymentType === 'online') {
        this.submitOnlineLoading = true
      } else {
        this.submitLoading = true
      }

      //组装参数
      let params = {
        onlyMdb: true,
        subscribeType: type, // 订阅类型：one_time-一次订阅，recurring-连续订阅
        platform: this.platform,
        quantity: '',
        // paymentMethod: this.agentDeploy === 'aliyun' ? 'AliyunMarketCode' : 'Stripe',
        successUrl:
          location.origin +
          location.pathname +
          this.$router.resolve({
            name: 'dataConsole'
          }).href,
        cancelUrl: location.href,
        email,
        periodUnit,
        currency: this.currencyType || currency,
        subscribeItems: [
          {
            productId: '', // 产品ID
            priceId: this.mdbPriceId, // 价格ID，关联定价表
            quantity: 1, // 订阅数量，例如一次性订购2个实例时，这里填写2
            productType: 'MongoDB', // 产品类型：Engine,MongoDB,APIServer
            resourceId: '', // 资源ID，agent 或者 cluster id
            agentType: this.agentDeploy === 'fullManagement' ? 'Cloud' : 'Local', // 半托管-Local，全托管-Cloud
            version: '', // 实例版本
            name: '', // 实例名称
            memorySpace: this.memorySpace,
            provider: this.provider || '', // 云厂商，全托管必填
            region: this.region || '', // 地域，全托管必填
            zone: this.mdbZone || '' // 可用区，按需填写（阿里云存储需要根据资源余量选择出可用区）
          }
        ]
      }

      this.buried('newAgentStripe', '', {
        type
      })
      this.$axios
        .post('api/tcm/orders/subscribeV2', params)
        .then(data => {
          this.buried('newAgentStripe', '', {
            type,
            result: true
          })

          this.$router.push({
            name: 'pay',
            params: {
              id: data.subscribe
            }
          })

          /*if (data.status === 'incomplete') {
            //订单需要付款
            if (paymentType === 'online') {
              //在线支付 打开付款页面
              this.finish()
              window.open(data?.payUrl, '_self')
            } else {
              //转账支付 打开支付详情弹窗
              if (this.type === 'newDialog') {
                this.$emit('closeVisible', false)
              }
              this.$router.push({
                name: 'Instance',
                params: {
                  showTransferDialogVisible: true,
                  price: this.formatPrice(this.currency)
                }
              })
            }
          } else {
            //订单不需要付款，只需对应跳转不同页面
            if (params.onlyMdb) {
              //单独存储
              this.finish()
              this.$router.push({
                name: 'Instance',
                query: {
                  active: 'storage'
                }
              })
            } else if (this.agentDeploy === 'Aliyun' && row.agentType === 'Local') {
              //半托管-授权码-部署页面
              this.finish()
              let downloadUrl = window.App.$router.resolve({
                name: 'FastDownload',
                query: {
                  id: data?.agentId
                }
              })
              window.open(downloadUrl.href, '_self')
            } else {
              this.finish()
              if (this.type === 'newDialog') {
                this.$emit('closeVisible', false)
              }
              this.$router.push({
                name: 'Instance'
              })
            }
          }*/
        })
        .catch(() => {
          this.buried('newAgentStripe', '', {
            type,
            result: false
          })
          if (paymentType === 'online') {
            this.submitOnlineLoading = false
          } else {
            this.submitLoading = false
          }
        })
    },
    finish() {
      this.$message.success(this.$t('public_message_operation_success'))
    },
    //创建agent
    handleNewAgentActiveCode(row) {
      this.currentAliyunAgentType = row?.agentType
      if (row?.agentType === 'Cloud') {
        //全托管，跳转到下一步
        this.saveCurrentAliyun(row)
      } else {
        //半托管直接创建订单
        this.submit(row)
      }
    },
    //授权码下一步数据保留
    saveCurrentAliyun(row) {
      this.activeStep++
      this.currentAliyunCode = row
      this.specificationAliyunCode = row.spec
      this.specificationAliyunCode.name = this.specificationAliyunCode.name?.toUpperCase()
      this.agentSizeCap = this.updateAgentCap(this.specificationAliyunCode.cpu, this.specificationAliyunCode.memory)
    },
    //激活
    handleNewCode(val) {
      this.hiddenNewCode = val
      this.buried('goActivateCode')
    },
    save() {
      this.saveLoading = true
      this.buried('activateAliyunCode')
      this.$axios
        .post('api/tcm/aliyun/market/license/activate', { licenseCode: this.licenseCode })
        .then(data => {
          if (data.licenseStatus === 'ACTIVATED') {
            if (data?.agentType === 'Cloud') {
              this.saveCurrentAliyun(data)
            } else {
              this.submit(data)
            }
            this.buried('activateAliyunCode', '', {
              result: true
            })
          } else {
            this.close()
            this.buried('activateAliyunCode', '', {
              result: false
            })
          }
        })
        .catch(() => {
          this.buried('activateAliyunCode', '', {
            result: false
          })
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    getAvailableCode() {
      this.aliyunLoading = true
      this.$axios
        .get('api/tcm/aliyun/market/license/available')
        .then(data => {
          this.codeData =
            data.map((t = {}) => {
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              t.specLabel = t.spec?.name?.toUpperCase()
              t.expiredTimeLabel = t.expiredTime ? dayjs(t.expiredTime).format('YYYY-MM-DD') : '-'
              return t
            }) || []
          this.hiddenNewCode = this.codeData?.length > 0
          this.aliyunLoading = false
        })
        .finally(() => {
          this.aliyunLoading = false
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
    checkSpecDisabled({ mdbSpec }) {
      if (this.provider !== 'AliCloud' || !mdbSpec) return false
      return this.spec2Zone && !this.spec2Zone[mdbSpec]
    }
  }
}
</script>

<style lang="scss" scoped>
.create-storage-container {
  .h-32 {
    height: 32px;
  }

  .color-primary-light-9 {
    background-color: #e8f3ff;
  }

  .create-agent-title {
    &:before {
      position: absolute;
      content: '';
      width: 4px;
      left: 0;
      top: 2px;
      bottom: 2px;
      background-color: map-get($color, primary);
      border-radius: 2px;
    }
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

  ::v-deep {
    .el-form-item {
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
}
</style>
