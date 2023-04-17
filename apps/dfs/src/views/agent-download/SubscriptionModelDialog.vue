<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')"
    width="75%"
    :before-close="close"
    custom-class="tap-dialog"
  >
    <div class="subscription-steps-wrap">
      <el-steps class="subscription-steps bg-transparent mx-auto" :active="activeStep" simple>
        <el-step v-for="(step, i) in steps" :key="i" :title="step.title">
          <span slot="icon">{{ i + 1 }}</span>
        </el-step>
      </el-steps>
    </div>

    <div class="subscription-steps-content mt-4">
      <div v-if="activeStep === 1" class="flex gap-6 px-5">
        <div
          class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable"
          :class="{
            active: productType === 'selfHost'
          }"
          @click="productType = 'selfHost'"
        >
          <div class="is-active position-absolute top-0 end-0">
            <div class="is-active-triangle"></div>
            <VIcon size="16" class="is-active-icon">check-bold</VIcon>
          </div>
          <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
            <el-image class="w-100 product-type-image" :src="require('@/assets/image/self_host_managed.png')" />
          </div>
          <div class="px-6 mb-4 flex-1">
            <div class="text-center font-color-dark fs-5 mb-2">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_bantuoguanmoshi') }}
            </div>
            <div class="text-center font-color-light fs-7">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi2') }}
            </div>
          </div>
          <div class="px-6 mb-6">
            <div class="fs-6 text-center font-color-dark mb-2">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongbantuoguan') }}
            </div>
            <div class="flex justify-content-center">
              <ul>
                <li>
                  <VIcon size="16" class="mr-2">check-bold</VIcon
                  >{{ $t('dfs_agent_download_subscriptionmodeldialog_chengbengengdichong') }}
                </li>
                <li>
                  <VIcon size="16" class="mr-2">check-bold</VIcon
                  >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiaanquanyong') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable disabled"
          :class="{
            active: productType === 'fullManagement'
          }"
        >
          <div class="is-active position-absolute top-0 end-0">
            <div class="is-active-triangle"></div>
            <VIcon size="16" class="is-active-icon">check-bold</VIcon>
          </div>
          <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
            <el-image class="w-100 product-type-image" :src="require('@/assets/image/fully_managed.png')" />
          </div>
          <div class="px-6 mb-4 flex-1">
            <div class="product-type-card-title text-center font-color-dark fs-5 mb-2">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_quantuoguanmoshi') }}
            </div>
            <div class="text-center font-color-light fs-7">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi') }}
            </div>
          </div>
          <div class="px-6 mb-6">
            <div class="fs-6 text-center font-color-dark mb-2">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongquantuoguan') }}
            </div>
            <div class="flex justify-content-center">
              <ul>
                <li>
                  <VIcon size="16" class="mr-2">check-bold</VIcon
                  >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiafangbianmian') }}
                </li>
                <li>
                  <VIcon size="16" class="mr-2">check-bold</VIcon
                  >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiakekaoyou') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeStep === 2" class="px-1">
        <ElForm v-if="productType !== 'aliyun'" label-position="top">
          <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
            <ElSelect v-model="specification" @change="changeSpec" class="w-50 rounded-4">
              <ElOption
                v-for="(item, i) in specificationItems"
                :key="i"
                :label="item.name"
                :value="item.value"
                :disabled="agentCount > 0 && item.chargeProvider === 'FreeTier'"
              >
                <span>{{ item.name }}: </span>
                <span>{{ item.desc }}</span>
              </ElOption>
            </ElSelect>
            <div>
              {{ $t('dfs_agent_download_subscriptionmodeldialog_guigeshuomingci') }}{{ agentSizeCap.mem
              }}{{ $t('dfs_agent_download_subscriptionmodeldialog_keyongneicunjian') }}{{ agentSizeCap.pipeline
              }}{{ $t('dfs_agent_download_subscriptionmodeldialog_geyugumeimiao') }}{{ agentSizeCap.tps
              }}{{ $t('dfs_agent_download_subscriptionmodeldialog_zuoyou') }}
            </div>
          </ElFormItem>
          <ElFormItem :label="$t('dfs_instance_instance_dingyuefangshi')">
            <ElRadioGroup v-model="currentPackage" @input="handleChange">
              <ElRadio
                v-for="(item, index) in packageItems"
                :key="index"
                :label="item.value"
                border
                class="rounded-4"
                >{{ item.label }}</ElRadio
              >
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem
            :label="$t('dfs_agent_download_subscriptionmodeldialog_xuanzebizhong')"
            v-if="currencyOption && currencyOption.length > 0"
          >
            <ElRadioGroup v-model="currencyType" @input="changeCurrency">
              <ElRadio
                v-for="(item, index) in currencyOption"
                :key="index"
                :label="item.currency"
                border
                class="rounded-4"
                >{{ CURRENCY_MAP[item.currency] }}</ElRadio
              >
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_meiyuefeiyongyu')">
            <div class="border rounded-4">
              <div class="border-bottom px-3 py-1">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_jisuan') }}{{ formatPrice(currency) }}
              </div>
              <div class="text-end px-3 py-1">
                {{ $t('public_total') }}: <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
              </div>
            </div>
          </ElFormItem>
        </ElForm>

        <section v-else v-loading="aliyunLoading">
          <div class="aliyun-main">
            <div v-if="hiddenNewCode">
              <VTable
                :columns="columns"
                :data="codeData"
                :has-pagination="false"
                ref="tables"
                class="subscript-table"
                max-height="280px"
              >
                <template #operation="{ row }">
                  <ElButton type="text" @click="submit(row)">{{
                    $t('public_button_create') + ' ' + $t('public_agent')
                  }}</ElButton>
                </template>
              </VTable>
              <div class="mt-4 cursor-pointer color-primary" @click="handleNewCode(false)">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_jihuoxinshouquan') }}
              </div>
            </div>
            <div v-else>
              <div class="flex justify-content-center align-items-center">
                <img class="text-center" :src="getAliiyunImg('aliyun-license-code')" />
              </div>
              <ul class="step mt-4">
                <li class="flex align-items-center">
                  <span>{{ $t('dfs_aliyun_market_license_dianjidakai') }}</span>
                  <a
                    class="color-primary text-decoration-underline"
                    href="https://market.aliyun.com/products/56024006/cmgj00061912.html?spm=5176.730005.result.4.519c3524QzKxHM&innerSource=search_tapdata#sku=yuncode5591200001"
                    target="_blank"
                    >{{ $t('dfs_aliyun_market_license_aliyunshichang') }}</a
                  >
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_goumai') }}
                </li>
                <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
                <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
              </ul>
              <div class="flex mt-4">
                <span class="label-code mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
                <el-input v-model="licenseCode" type="textarea" rows="2" autofocus></el-input>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="activeStep === 3" class="px-1">
        <div class="border rounded-4 p-4">
          <div class="fs-6 font-color-dark mb-4">
            {{ $t('dfs_agent_download_subscriptionmodeldialog_peizhizhaiyao') }}
          </div>

          <ElForm
            :model="form"
            ref="confirmForm"
            :label-width="this.$i18n.locale === 'en' ? '200px' : '130px'"
            label-position="right"
          >
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_jisuanziyuan')">
              <span class="font-color-dark">
                {{ specMap[currentSpecName] || currentSpecName }}
              </span>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_instance_instance_dingyuefangshi') + ':'">
              <span class="font-color-dark">
                {{ selected.label }}
              </span>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_instance_create_jieshouzhangdande')" prop="email" :rules="getEmailRules()">
              <ElInput v-model="form.email" :placeholder="getPlaceholder()" style="width: 300px"></ElInput>
            </ElFormItem>
            <ElFormItem :label="$t('public_total')">
              <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
            </ElFormItem>
          </ElForm>
        </div>
      </div>
    </div>

    <div slot="footer" class="flex">
      <el-link v-if="activeStep === 1" type="primary" @click="changeProductType">{{
        $t('dfs_agent_download_subscriptionmodeldialog_zhijieshiyonga')
      }}</el-link>

      <el-link
        v-if="activeStep === 2 && productType === 'aliyun' && !hiddenNewCode && codeData.length > 0"
        type="primary"
        @click="handleNewCode(true)"
        >{{ $t('dfs_agent_download_subscriptionmodeldialog_ninyouyijihuo') }}</el-link
      >
      <div class="flex-grow-1"></div>

      <el-button v-if="activeStep > 1" @click="prevStep">{{ $t('public_button_previous') }}</el-button>

      <template v-if="productType !== 'aliyun'">
        <el-button v-if="activeStep < steps.length" type="primary" @click="next('second')">{{
          $t('public_button_next')
        }}</el-button>
        <el-button v-else-if="activeStep === steps.length" type="primary" @click="submit()">{{
          $t('public_button_confirm')
        }}</el-button>
      </template>
      <template v-else>
        <el-button v-if="!hiddenNewCode" type="primary" :loading="saveLoading" @click="save()"
          >{{ $t('dfs_aliyun_market_license_jihuo')
          }}{{ $t('dfs_agent_download_subscriptionmodeldialog_bingbushu') }}</el-button
        >
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { isStr, isObj, openUrl, uniqueArr } from '@tap/shared'
import { VTable } from '@tap/component'
import { getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP } from '@tap/business'
import i18n from '@/i18n'
import { dayjs } from '@tap/business/src/shared/dayjs'

export default {
  name: 'subscriptionModelDialog',
  inject: ['buried'],
  components: { VTable },
  props: {
    visible: {
      type: Boolean
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.checkAgentCount()
        this.activeStep = 1
        this.productType = 'selfHost'
      }
    }
  },
  data() {
    return {
      activeStep: 1,
      productType: 'selfHost',
      activeName: 'first',
      allPackages: '',
      packageItems: [],
      specificationItems: [],
      specification: '',
      email: '',
      selected: {},
      form: {
        email: ''
      },
      specMap: {
        '1C2G': i18n.t('dfs_agent_download_subscriptionmodeldialog_extra')
      },
      CURRENCY_MAP: CURRENCY_MAP,
      licenseCode: '',
      saveLoading: false,
      submitLoading: false,
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
      currentPackage: ''
    }
  },

  computed: {
    steps() {
      const steps = [
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_xuanzebushulei')
        },
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_peizhibushugui')
        },
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_chakanbingqueren')
        }
      ]

      if (this.productType === 'aliyun') {
        steps.pop()
      }

      return steps
    }
  },

  mounted() {
    this.checkAgentCount()
    this.form.email = window.__USER_INFO__.email
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
      this.defaultCurrencyType = currencyType
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    prevStep() {
      this.activeStep--
      if (this.productType === 'aliyun') {
        this.productType = 'selfHost'
      }
    },
    next() {
      this.activeStep++
      this.buried('productTypeNext')
    },
    //选择订阅模式
    changeProductType() {
      this.productType = 'aliyun'
      this.activeName = 'second'
      this.activeStep = 2
      this.getAvailableCode()
      this.buried('productTypeAliyunCode')
    },
    //切换规格
    changeSpec() {
      this.loadPackageItems()
      if (!this.currencyType) {
        this.currencyType = this.packageItems[0]?.currency
      }
      this.handleChange(this.packageItems[0])
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
    //切换币种
    changeCurrency(item) {
      if (isStr(item)) {
        this.currencyType = item
        this.currency = this.currencyOption.find(it => it.currency === item)
      } else {
        this.currencyType = item.currency
        this.currency = item
      }
    },
    changeCurrencyOption(item) {
      const options = item.currencyOption
      const { defaultCurrencyType } = this
      // 设置了默认币种, 币种选项默认的排到第一位
      if (options.length && defaultCurrencyType && options[0] !== defaultCurrencyType) {
        options.sort((a, b) => {
          let aVal = a.currency === defaultCurrencyType ? 0 : 1
          let bVal = b.currency === defaultCurrencyType ? 0 : 1
          return aVal - bVal
        })
      }
      this.currencyOption = options
    },
    //格式化价格
    formatPrice(item) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        (item.amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    selectProductType() {
      this.buried('productTypeSelfHost')
    },
    checkAgentCount() {
      let filter = { where: { 'orderInfo.chargeProvider': 'FreeTier' } }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.agentCount = data?.total
        this.getPrice()
      })
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
      this.agentSizeCap = {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
      }
    },
    getPrice() {
      const params = {
        productType: this.productType
      }
      this.$axios.get('api/tcm/paid/plan/getPaidPlan', { params }).then(data => {
        const { paidPrice = [] } = data?.[0] || {}
        // 规格
        this.specificationItems = uniqueArr(
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
        this.specification = this.agentCount > 0 ? this.specificationItems[1]?.value : this.specificationItems[0]?.value
        // 价格套餐
        this.allPackages = paidPrice.map(t => {
          return Object.assign(t, {
            label: getPaymentMethod(t),
            value: t.priceId,
            price: t.price,
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec),
            currencyOption: t.currencyOption
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
    loadPackageItems() {
      const specification = this.specificationItems.find(t => t.value === this.specification)
      this.updateAgentCap(specification.cpu, specification.memory)
      const specificationLabel = this.specificationItems.find(t => t.value === this.specification)?.name
      const chargeProvider = this.specificationItems.find(t => t.value === this.specification)?.chargeProvider
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter(t => this.specification === t.specification)
        .map(t => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel
            })
          })
        })
        .sort((a, b) => {
          return a.order < b.order ? -1 : a.periodUnit < b.periodUnit ? -1 : 1
        })
      if (chargeProvider === 'FreeTier') {
        this.packageItems = [
          {
            label: i18n.t('dfs_agent_download_subscriptionmodeldialog_yongjiu'),
            price: 0,
            value: '0',
            chargeProvider: 'FreeTier',
            currencyOption: []
          }
        ]
      }
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

    //提交订单
    async submit(row = {}) {
      const { type, priceId, currency, chargeProvider } = this.selected
      const { email } = this.form

      const fastDownloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: ''
        }
      })
      let params = {}

      if (this.productType === 'aliyun') {
        params = {
          agentType: 'Local',
          chargeProvider: 'Aliyun',
          licenseId: row?.id
        }
        this.buried('selectAgentAliyun')
      } else {
        const valid = await this.validateForm('confirmForm')

        if (!valid) return

        params = {
          agentType: 'Local',
          chargeProvider,
          priceId,
          currency: this.currencyType || currency,
          successUrl: location.origin + location.pathname + fastDownloadUrl.href,
          cancelUrl: location.href,
          email,
          type
        }
      }

      this.buried('newAgentStripe', '', {
        type
      })
      this.submitLoading = true
      this.$axios
        .post('api/tcm/orders', params)
        .then(data => {
          if (chargeProvider === 'FreeTier' || this.productType === 'aliyun') {
            let downloadUrl = window.App.$router.resolve({
              name: 'FastDownload',
              query: {
                id: data?.agentId
              }
            })

            window.open(downloadUrl.href, '_blank')
          } else {
            window.open(data?.paymentUrl, '_blank')
          }
          this.finish()
          this.buried('newAgentStripe', '', {
            type,
            result: true
          })
          this.submitLoading = false
        })
        .catch(() => {
          this.buried('newAgentStripe', '', {
            type,
            result: false
          })
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    finish() {
      this.$message.success(this.$t('public_message_operation_success'))
      this.close()
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
            this.submit(data)
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
              t.specLabel = getSpec(t.spec)
              t.expiredTimeLabel = t.expiredTime ? dayjs(t.expiredTime).format('YYYY-MM-DD') : '-'
              return t
            }) || []
          this.hiddenNewCode = this.codeData?.length > 0
          this.aliyunLoading = false
        })
        .finally(() => {
          this.aliyunLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.configure-main {
  padding: 20px 40px 0 40px;
}
.spec-main {
  padding: 20px 40px;
  height: 467px;
}
.aliyun-main {
  padding: 0 40px;
}
.width50 {
  width: 50%;
}
.img-box {
  width: 400px;
  height: 310px;
  img {
    width: 100%;
    height: 100%;
  }
}
.content-right {
  margin-left: 30px;
}
.btn {
  size: 16px;
  font-weight: 500;
  padding: 12px 0;
  width: 120px;
  text-align: center;
  border: 1px solid map-get($borderColor, normal);
}
.price-list {
  border-radius: 4px;
  border: 1px solid map-get($borderColor, normal);
  width: 260px;
  height: 300px;
  margin-top: 66px;
}
.title {
  size: 16px;
  font-weight: 500;
  line-height: 36px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  border-bottom: 1px solid map-get($borderColor, normal);
}
.item {
  size: 16px;
  font-weight: 500;
  padding: 16px;
}
.total {
  text-align: right;
  padding: 8px;
  border-top: 1px solid map-get($borderColor, normal);
}
.review {
  height: 541px;
}
.specification-item {
  border: 1px solid map-get($borderColor, normal);
  border-radius: 8px;
  &.active {
    border-color: map-get($color, primary);
  }
}
.label {
  width: 268px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
.label-code {
  width: 70px;
}
.price {
  font-weight: 400;
  font-size: 24px;
  color: map-get($color, primary);
}
.subscript-table {
  ::v-deep {
    .subscript-table thead .el-table-column--selection .cell {
      display: none;
    }
  }
}
.agent_size {
  padding-bottom: 50px;
  font-size: 18px;
}

.agent_size_cap {
  line-height: 2;
}
.agent_plan {
  margin-left: 50px;
}
.payment_plan {
  font-size: 16px;
  padding-top: 20px;
  color: #2c65ff;
}

.subscription-steps {
  ::v-deep {
    .el-step {
      &.is-simple:not(:last-of-type) .el-step__title {
        max-width: unset;
      }

      .el-step__icon {
        width: 24px;
        height: 24px;
        font-size: 14px;
      }

      .el-step__head.is-finish {
        .el-step__icon {
          color: #fff;
          background-color: map-get($color, primary);
        }
      }

      .el-step__head.is-process {
        color: #86909c;
        border-color: #86909c;
      }
      .el-step__title.is-process {
        color: #86909c;
        font-weight: 400;
      }
    }
  }
}

.subscription-steps-content {
  ::v-deep {
    .el-input__inner,
    .el-textarea__inner {
      border-radius: 6px;
    }
  }
}

.product-type-card {
  .product-type-image {
    height: 176px;
  }
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
  &.disabled {
    background-color: #fafafa;
    border-width: 0 !important;
    cursor: not-allowed;

    .product-type-card-title {
      color: #86909c !important;
    }
  }
}
</style>

<style lang="scss">
.tap-dialog {
  .el-dialog__header {
    height: 64px;
    min-height: 64px;
    border-bottom: 1px solid #dee2e6;
  }

  .el-dialog__body {
    padding: 16px 24px;
  }

  .el-dialog__footer {
    padding: 24px;
  }
}
</style>
