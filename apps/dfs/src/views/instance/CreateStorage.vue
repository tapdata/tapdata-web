<template>
  <section class="flex flex-column flex-1 overflow-hidden create-storage-container gap-4">
    <div class="bg-white rounded-lg p-4">
      <div class="flex align-center">
        <IconButton @click="$router.back()">left</IconButton>
        <span class="fs-5 ml-2">{{ $t('page_title_subscribe_storage') }}</span>
      </div>
    </div>

    <div class="flex flex-column bg-white rounded-lg overflow-hidden px-6">
      <div v-if="!loading" class="px-4 py-2 mt-4 lh-base color-primary-light-9 rounded-lg">
        <div class="mb-1 flex align-center">
          <VIcon class="text-primary mr-2" size="18">info</VIcon>
          <div class="font-color-dark fs-6 fw-sub">{{ $t('dfs_subscribe_storage_tip_title') }}</div>
        </div>
        <div
          class="lh-lg"
          v-html="$t(mdbPrices > 0 ? 'dfs_subscribe_storage_tip_content' : 'dfs_subscribe_free_storage_tip_content')"
        ></div>
      </div>
      <ElForm label-position="top" class="flex-1 overflow-x-hidden overflow-y-auto mt-4">
        <!--存储地区-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_subscribe_storage_deploy_region') }}
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

            <el-skeleton :loading="loading || loadingProvider" animated>
              <template slot="template">
                <div class="flex gap-4">
                  <el-skeleton-item v-for="i in 2" :key="i" class="rounded-4 h-32" variant="button" />
                </div>
              </template>
              <template>
                <ElRadioGroup v-model="provider" @change="changeProvider" class="flex flex-wrap gap-4">
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

            <span class="font-color-light inline-block">{{
              $t('dfs_agent_download_subscriptionmodeldialog_diqu')
            }}</span>
            <el-skeleton :loading="loading || loadingProvider" animated>
              <template slot="template">
                <div class="flex gap-4">
                  <el-skeleton-item v-for="i in 2" :key="i" class="rounded-4 h-32" variant="button" />
                </div>
              </template>
              <template>
                <ElRadioGroup v-model="region" class="flex flex-wrap gap-4" @change="changeRegion">
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
        <!--请选择您需要的存储资源规格-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_subscribe_storage_specification') }}
          </div>
          <el-skeleton :loading="loadingProvider || loadingMongoCluster" animated>
            <template slot="template">
              <div class="flex gap-4">
                <el-skeleton-item v-for="i in 4" :key="i" class="rounded-4 h-32" variant="button" />
              </div>
            </template>
            <template>
              <ElRadioGroup v-model="current.clusterTier" @change="handleChangeTier" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in tierOptions"
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
            </template>
          </el-skeleton>
        </ElFormItem>
        <!--请选择您需要的存储空间-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_instance_createagent_qingxuanzeninxu') }}
          </div>
          <el-skeleton :loading="loadingProvider || loadingMongoCluster" animated>
            <template slot="template">
              <div class="flex gap-4">
                <el-skeleton-item v-for="i in 2" :key="i" class="rounded-4 h-32" variant="button" />
              </div>
            </template>
            <template>
              <ElRadioGroup v-model="current.storageSize" @change="handleChangeSize" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in sizeOptions"
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
            </template>
          </el-skeleton>
        </ElFormItem>
        <!--订阅方式-->
        <ElFormItem>
          <div slot="label" class="font-color-dark fw-sub">
            {{ $t('dfs_instance_instance_dingyuefangshi') }}
          </div>
          <el-skeleton :loading="loadingProvider || loadingMongoCluster" animated>
            <template slot="template">
              <div class="flex gap-4">
                <el-skeleton-item v-for="i in 2" :key="i" class="rounded-4 h-32" variant="button" />
              </div>
            </template>
            <template>
              <ElRadioGroup v-model="current.priceId" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in periodOptions"
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
            </template>
          </el-skeleton>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="bg-white rounded-lg px-6 py-4 flex align-center gap-4">
      <ElButton type="primary" :loading="submitLoading" @click="submit">{{
        $t('public_button_subscription')
      }}</ElButton>
      <div class="flex align-items-end lh-1">
        <span>{{ $t('public_total') }}:</span>
        <span class="color-primary fs-5 ml-1">{{ priceLabel }}</span>
        <span class="font-color-dark mx-2" v-if="periodLabel">
          {{ periodLabel }}
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import { uniqBy } from 'lodash'

import i18n from '@tap/i18n'
import { IconButton } from '@tap/component'
import { isObj } from '@tap/shared'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP, PERIOD_MAP } from '@tap/business'

import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import { dayjs } from '@tap/business/src/shared/dayjs'

export default {
  name: 'CreateAgent',

  inject: ['buried'],

  components: { IconButton },

  data() {
    return {
      activeStep: 1,
      platform: 'realTime',
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
      CURRENCY_MAP: CURRENCY_MAP,
      submitLoading: false,
      submitOnlineLoading: false,
      agentCount: 0,
      currentSpecName: '1C2G',
      currencyOption: [],
      currency: '',
      currencyType: '',
      agentSizeCap: {
        mem: '-',
        pipeline: '-',
        tps: '-'
      },
      currentPackage: '',
      //是否有存储Agent
      mdbCount: false, //默认没有存储
      mdbFreeCount: 0, //免费存储个数
      mdbZone: '',
      spec2Zone: null,
      loadingCloudMdbSource: false,
      loading: true,
      loadingProvider: false,
      loadingMongoCluster: true,

      priceList: [],
      current: {
        clusterTier: '',
        storageSize: '',
        priceId: ''
      }
    }
  },

  computed: {
    providerMap() {
      return this.cloudProviderList.reduce((prev, curr) => ((prev[curr.cloudProvider] = curr), prev), {})
    },

    priceMap() {
      return this.paidPrice.reduce((map, curr) => ((map[curr.priceId] = curr), map), {})
    },

    priceLabel() {
      const item = this.priceMap[this.current.priceId]

      if (!item) return

      return this.formatAmount(item.price)
    },

    periodLabel() {
      const item = this.priceMap[this.current.priceId]

      if (!item) return

      return PERIOD_MAP[`${item.type}_${item.periodUnit}`]?.label
    },

    clusterTierMap() {
      return this.paidPrice.reduce((map, curr) => {
        const { name, storageSize } = curr.spec
        let tier = map[name]

        if (!tier) {
          tier = map[name] = {}
        }

        let periodArr = tier[storageSize]

        if (!periodArr) {
          periodArr = tier[storageSize] = []
        }

        periodArr.push(curr)
        return map
      }, {})
    },

    tierOptions() {
      return Object.keys(this.clusterTierMap).map(name => ({
        label: `MongoDB Atlas ${name}`,
        value: name
      }))
    },

    sizeOptions() {
      const { clusterTier } = this.current
      const sizeMap = this.clusterTierMap[clusterTier] || {}

      return Object.keys(sizeMap).map(size => ({
        label: `${size} G`,
        value: size
      }))
    },

    periodOptions() {
      const { clusterTier, storageSize } = this.current
      const sizeMap = this.clusterTierMap[clusterTier] || {}
      const list = sizeMap[storageSize] || []

      return list
        .filter(item => item.type === 'recurring')
        .sort(
          (item1, item2) =>
            PERIOD_MAP[`${item1.type}_${item1.periodUnit}`].order -
            PERIOD_MAP[`${item2.type}_${item2.periodUnit}`].order
        )
        .map(item => {
          return {
            label: PERIOD_MAP[`${item.type}_${item.periodUnit}`].label,
            value: item.priceId
          }
        })
    }
  },

  async created() {
    this.loading = true
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
      this.defaultCurrencyType = currencyType
    }

    //获取是否有存储实例
    await this.getMdbCount()
    // 获取云厂商
    await this.getCloudProvider()
    // 获取存储规格
    await this.getMongoCluster()
    this.loading = false
  },

  methods: {
    //切换云厂商
    changeProvider() {
      let cloudProvider = this.providerMap[this.provider]
      this.cloudProviderName = cloudProvider.cloudProviderName
      this.cloudDetail = cloudProvider.cloudDetail || []
      this.region = this.cloudDetail[0].region
      this.changeRegion()
    },

    changeRegion() {
      this.getMongoCluster()
    },

    //查找云厂商
    async getCloudProvider() {
      this.loadingProvider = true
      const data = await this.$axios.get('api/tcm/orders/queryCloudProvider')
      this.loadingProvider = false
      //数据模式（带存储）过滤只带存储的云厂商
      let original = data?.items || []
      this.cloudProviderList = original.filter(it => {
        // 暂时过滤掉阿里云
        it.cloudDetail =
          it.cloudDetail.filter(item => item.productList.includes('mongodb') && it.cloudProvider !== 'AliCloud') || []
        return it.cloudDetail.length
      })

      //初始化云厂商
      this.provider = this.cloudProviderList[0].cloudProvider
      this.changeProvider()
    },

    //获取存储价格
    async getMongoCluster() {
      this.loadingMongoCluster = true
      const data = await this.$axios.get('api/tcm/orders/paid/price', {
        params: {
          productType: 'mongoCluster',
          region: this.region,
          cloudProvider: this.provider
        }
      })
      this.loadingMongoCluster = false
      const { paidPrice = [] } = data?.[0] || {}
      this.paidPrice = paidPrice
      this.current.clusterTier = this.tierOptions[0].value
      this.current.storageSize = this.sizeOptions[0].value
      this.current.priceId = this.periodOptions[0].value
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

    //是否有存储agent
    getMdbCount() {
      return this.$axios.get('api/tcm/mdb/stats').then(data => {
        this.mdbCount = data?.totalCount > 0
        this.mdbFreeCount = data?.freeCount
      })
    },

    //提交订单
    async submit(row = {}, paymentType = 'online') {
      const { type, priceId, currency, periodUnit, productId, spec } = this.priceMap[this.current.priceId]

      if (paymentType === 'online') {
        this.submitOnlineLoading = true
      } else {
        this.submitLoading = true
      }

      //组装参数
      let params = {
        onlyMdb: true,
        subscribeType: type, // 订阅类型：one_time-一次订阅，recurring-连续订阅
        platform: 'realTime',
        quantity: '',
        successUrl:
          location.origin +
          location.pathname +
          this.$router.resolve({
            name: 'dataConsole'
          }).href,
        cancelUrl: location.href,
        periodUnit,
        currency: this.currencyType || currency,
        subscribeItems: [
          {
            productId, // 产品ID
            priceId, // 价格ID，关联定价表
            quantity: 1, // 订阅数量，例如一次性订购2个实例时，这里填写2
            productType: 'MongoDB', // 产品类型：Engine,MongoDB,APIServer
            resourceId: '', // 资源ID，agent 或者 cluster id
            agentType: 'Cloud', // 半托管-Local，全托管-Cloud
            version: '', // 实例版本
            name: '', // 实例名称
            memorySpace: spec.storageSize,
            provider: this.provider || '', // 云厂商，全托管必填
            region: this.region || '' // 地域，全托管必填
          }
        ]
      }

      this.buried('newStorageStripe', '', {
        type
      })
      this.$axios
        .post('api/tcm/orders/subscribeV2', params)
        .then(data => {
          this.buried('newStorageStripe', '', {
            type,
            result: true
          })

          this.$router.push(
            data.status === 'active'
              ? {
                  name: 'dataConsole'
                }
              : {
                  name: 'pay',
                  params: {
                    id: data.subscribe
                  }
                }
          )
        })
        .catch(() => {
          this.buried('newStorageStripe', '', {
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

    handleChangeTier() {
      const { clusterTier, storageSize } = this.current
      const sizeMap = this.clusterTierMap[clusterTier]

      if (!sizeMap[storageSize]) {
        this.current.storageSize = this.sizeOptions[0].value
      }

      this.current.priceId = this.periodOptions[0].value
    },

    handleChangeSize() {
      this.current.priceId = this.periodOptions[0].value
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
