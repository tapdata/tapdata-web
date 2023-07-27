<template>
  <section class="pay-container flex flex-column gap-4 overflow-hidden">
    <div class="bg-white rounded-lg p-4">
      <div class="flex align-center">
        <IconButton @click="$router.push({ name: 'order' })">left</IconButton>
        <span class="fs-5 ml-2">待支付</span>
      </div>
    </div>

    <div class="flex-1 overflow-auto rounded-lg flex flex-column gap-4">
      <div class="bg-white rounded-lg p-4">
        <div class="font-color-dark fw-sub text-label mb-2">所选配置</div>
        <VTable
          class="border rounded-lg h-auto mb-5"
          :columns="columns"
          :data="subscribeItems"
          ref="table"
          :has-pagination="false"
        >
          <template #empty>
            <VEmpty small></VEmpty>
          </template>
        </VTable>
        <ElForm ref="form" label-position="top" :model="payForm">
          <ElFormItem prop="email" :rules="emailRules">
            <span slot="label" class="font-color-dark fw-sub">
              {{ $t('dfs_instance_create_jieshouzhangdande') }}
            </span>
            <ElInput
              v-model="payForm.email"
              :placeholder="$t('dfs_instance_create_yongyujieshoumei')"
              style="width: 300px"
            ></ElInput>
          </ElFormItem>
        </ElForm>
      </div>

      <div class="bg-white rounded-lg p-4">
        <div class="font-color-dark fw-sub text-label mb-2">{{ $t('dfs_instance_choose_payment_method') }}</div>
        <ElRadioGroup
          v-model="payForm.paymentMethod"
          class="flex gap-4 mb-4"
          size="default"
          @input="handleChangePayMethod"
        >
          <ElRadio
            v-for="(item, index) in payMethods"
            :key="index"
            :label="item.value"
            border
            class="rounded-4 payment-radio m-0 px-3 py-0 position-relative inline-flex align-center"
          >
            <div class="flex align-center gap-2">
              <VIcon size="24">{{ item.icon }}</VIcon>
              <span>{{ item.label }}</span>
            </div>
          </ElRadio>
        </ElRadioGroup>

        <el-collapse-transition>
          <div v-if="payForm.paymentMethod === 'CMBC'">
            <div class="bg-subtle rounded-lg p-4 mb-4">
              <!--汇款账号信息-->
              <div class="font-color-dark fw-sub text-label mb-2">
                {{ $t('dfs_agent_download_transferdialog_zhuanzhangxinxi') }}
              </div>

              <el-skeleton style="width: 400px" :loading="accountLoading" animated>
                <template #template>
                  <div class="label-grid gap-3">
                    <el-skeleton-item variant="h1" style="width: 100px" />
                    <el-skeleton-item variant="h1" />

                    <el-skeleton-item variant="h1" style="width: 100px" />
                    <el-skeleton-item variant="h1" />

                    <el-skeleton-item variant="h1" style="width: 100px" />
                    <el-skeleton-item variant="h1" />
                  </div>
                </template>
                <template>
                  <div class="label-grid text-label font-color-dark">
                    <!--开户名称-->
                    <div class="font-color-light text-end">
                      {{ $t('dfs_agent_download_transferdialog_kaihumingcheng') }}
                    </div>
                    <div>{{ accountInfo.accountName }}</div>
                    <!--开户银行-->
                    <div class="font-color-light text-end">
                      {{ $t('dfs_agent_download_transferdialog_kaihuyinhang') }}
                    </div>
                    <div><VIcon class="align-top mr-1" size="22">bank-cmbc</VIcon>{{ accountInfo.bankName }}</div>
                    <!--专属汇款账号-->
                    <div class="font-color-light text-end">
                      {{ $t('dfs_agent_download_transferdialog_huikuanzhanghao') }}
                    </div>
                    <div>
                      {{ accountInfo.accountNo }}
                    </div>
                  </div></template
                >
              </el-skeleton>
            </div>
            <div class="font-color-light text-label">{{ $t('dfs_agent_download_transferdialog_reopen_tips') }}</div>
          </div>
        </el-collapse-transition>
      </div>

      <div class="bg-white rounded-lg p-4">
        <ElButton v-if="payForm.paymentMethod === 'Stripe'" class="mr-4" type="primary" size="large" @click="handlePay"
          >立即支付</ElButton
        >

        <span class="mr-4">
          <span class="fw-sub font-color-dark mt-2">合计:</span
          ><span class="color-primary fw-sub fs-5 ml-2">{{ price }}</span>
        </span>

        <span class="font-color-light">{{ subscriptionMethodLabel }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import i18n from '@/i18n'
import { VTable, IconButton, VEmpty, VIcon } from '@tap/component'
import { AGENT_TYPE_MAP, getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'

export default {
  components: {
    VTable,
    VEmpty,
    VIcon,
    IconButton
  },

  data() {
    let isDomesticStation = true

    if (window.__config__?.station) {
      isDomesticStation = window.__config__?.station === 'domestic' //默认是国内站 国际站是 international
    }

    const payMethods = [
      {
        icon: 'pay-stripe',
        label: '在线支付',
        value: 'Stripe'
      }
    ]

    if (isDomesticStation) {
      payMethods.push({
        icon: 'pay-cmbc',
        label: '对公汇款',
        value: 'CMBC'
      })
    }

    return {
      isDomesticStation,
      payMethods,
      subscribeId: '',
      subscribeAlterId: '',
      isCard: true,
      order: [],
      price: 0,
      priceOff: 0,
      subscriptionMethodLabel: '',
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
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentTypeLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price'
        }
      ],
      paymentMethod: 'Stripe',
      subscribeItems: [],
      orderInfo: {},
      emailRules: [
        {
          required: true,
          message: i18n.t('dfs_instance_create_qingshuruninde')
        },
        {
          type: 'email',
          message: i18n.t('dfs_instance_create_qingshuruzhengque')
        }
      ],
      accountLoading: false,
      bankAccount: '',
      accountInfo: {
        accountName: '',
        accountNo: '',
        bankName: '',
        bankNo: ''
      },
      agentTypeMap: AGENT_TYPE_MAP,
      payForm: {
        email: this.$store.state.user.email,
        paymentMethod: 'Stripe',
        successUrl: '',
        cancelUrl: ''
      }
    }
  },

  async created() {
    const routeName = this.$route.name
    if (this.$route.name === 'pay') {
      this.targetField = 'subscribeId'
      this.subscribeId = this.$route.params.id
      await this.loadSubscribe()
    } else if (routeName === 'payForChange') {
      this.targetField = 'subscribeAlterId'
      this.subscribeAlterId = this.$route.params.id
      await this.loadAlter()
    }
    this.loadBankAccount()
    // await this.loadOrderInfo(this.$route.query.id)

    // this.$nextTick(() => {
    //   //格式化items
    //   let subscribeItems = this.orderInfo?.subscribeItems || []
    //   const { subscriptionMethodLabel, originalPrice, priceOff } = this.orderInfo
    //   this.subscribeItems = subscribeItems.map(it => {
    //     it.subscriptionMethodLabel = subscriptionMethodLabel
    //     it.price = originalPrice
    //     return it
    //   })
    //   this.priceOff = priceOff === 0 ? 0 : '-' + priceOff
    // })
  },

  methods: {
    async loadSubscribe() {
      const {
        items: [subscribe]
      } = await this.$axios.get(
        `api/tcm/subscribe?filter=${encodeURIComponent(
          JSON.stringify({
            where: {
              id: this.subscribeId
            }
          })
        )}`
      )
      const currency = subscribe.currency || window.__config__?.currencyType
      this.subscribe = subscribe

      this.price = this.formatterPrice(currency, subscribe.totalAmount)
      this.subscriptionMethodLabel =
        getPaymentMethod({ periodUnit: subscribe.periodUnit, type: subscribe.subscribeType }) || '-'

      let subscribeItems = subscribe.subscribeItems || []
      this.subscribeItems = subscribeItems.map(it => {
        it.price = this.formatterPrice(currency, it.amount)
        it.agentTypeLabel = this.agentTypeMap[it.agentType]
        it.specLabel = getSpec(it.spec) || '-'
        return it
      })

      // const subscribe = await this.$axios.get(`api/tcm/subscribe/${this.subscribeId}`)
      console.log('subscribe', subscribe) // eslint-disable-line

      const fastDownloadUrl = this.$router.resolve({
        name: 'FastDownload',
        query: {
          id: subscribeItems[0].resourceId
        }
      })
      const agentUrl = window.App.$router.resolve({
        name: 'Instance',
        query: {
          id: subscribeItems[0].resourceId
        }
      })

      this.payForm.successUrl =
        subscribe.platform === 'fullManagement'
          ? location.origin + location.pathname + agentUrl.href
          : location.origin + location.pathname + fastDownloadUrl.href
      this.payForm.cancelUrl = location.href
    },

    async loadAlter() {
      const alter = await this.$axios.get(`api/tcm/subscribe/alter/${this.subscribeAlterId}`)
      const { subscribe, subscribeId } = alter
      const currency = subscribe.currency || window.__config__?.currencyType

      this.price = this.formatterPrice(currency, alter.subscribeItems[0].amount)
      this.subscriptionMethodLabel =
        getPaymentMethod({ periodUnit: subscribe.periodUnit, type: subscribe.subscribeType }) || '-'
      this.subscribeItems = alter.subscribeItems.map(it => {
        it.price = this.price
        it.agentTypeLabel = this.agentTypeMap[it.agentType]
        it.specLabel = getSpec(it.spec) || '-'
        return it
      })

      this.payForm.successUrl =
        location.origin +
        location.pathname +
        this.$router.resolve({
          name: 'changeList',
          query: {
            id: subscribeId
          }
        }).href
      this.payForm.cancelUrl = location.href
    },

    validateForm(ref) {
      return new Promise(resolve => {
        this.$refs[ref].validate(valid => {
          resolve(valid)
        })
      })
    },

    async handlePay() {
      const valid = await this.validateForm('form')

      if (!valid) return

      this.submitLoading = true
      const { paymentUrl } = await this.postPayment()
      window.open(paymentUrl, '_self')
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

    async loadBankAccount(onlyLoad) {
      this.accountLoading = true
      const info = await this.$axios.get('api/tcm/capital/exclusive')
      this.accountLoading = false
      Object.assign(this.accountInfo, info)

      if (this.payForm.paymentMethod === 'CMBC' && !this.accountInfo.accountNo) {
        await this.createAccount()
      }
    },

    async createAccount() {
      if (this.accountInfo.accountNo) return

      this.accountLoading = true
      const info = await this.$axios.post(
        'api/tcm/capital/exclusive',
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      this.accountLoading = false
      Object.assign(this.accountInfo, info)
    },

    handleChangePayMethod(method) {
      if (method === 'CMBC') this.createAccount()

      this.postPayment()
    },

    async postPayment() {
      return await this.$axios.post('api/tcm/subscribe/payment', {
        ...this.payForm,
        [this.targetField]: this[this.targetField]
      })
    }
  }
}
</script>

<style scoped lang="scss">
.pay-container {
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

    .label-grid {
      display: grid;
      grid-template-columns: auto 1fr; /* 两列 */
      grid-gap: 8px;
      grid-column-gap: 4px;
    }
  }
}
.pay-wrap {
  background-color: map-get($color, submenu);
}
.pay-main {
  width: 80%;
  height: 100vh;
  margin: 0 auto;
  padding-top: 65px;
}
.card {
  padding: 16px 24px;
  border-radius: 8px;
  border-top: 1px solid var(--unnamed, #e5e6eb);
  background: #fff;
}

.text-label {
  font-size: 0.875rem;
  line-height: 22px;
}

.payment-radio {
  ::v-deep {
    .el-radio__inner {
      vertical-align: top;
    }
  }
}
</style>
