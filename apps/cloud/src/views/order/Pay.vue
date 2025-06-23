<script>
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { IconButton, VEmpty, VIcon, VTable } from '@tap/component'
import { calcUnit } from '@tap/shared'
import { mapGetters } from 'vuex'
import i18n from '@/i18n'
import { AGENT_TYPE_MAP, getPaymentMethod, getSpec } from '../instance/utils'

export default {
  components: {
    VTable,
    VEmpty,
    VIcon,
    IconButton,
    PageContainer,
  },

  data() {
    const currency =
      CURRENCY_SYMBOL_MAP[this.$store.getters.isDomesticStation ? 'cny' : 'usd']

    return {
      subscribeId: '',
      subscribeAlterId: '',
      isCard: true,
      order: [],
      price: 0,
      priceOff: 0,
      subscriptionMethodLabel: '',
      subscribeItems: [],
      trafficItems: [],
      trafficColumns: [
        {
          label: i18n.t('dfs_order_list_dingyueleixing'),
          prop: 'productLabel',
          width: 360,
        },
        {
          label: i18n.t('dfs_traffic_bill_mode'),
          prop: 'specLabel',
          width: 180,
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price',
        },
      ],
      trafficBillColumns: [
        {
          label: i18n.t('dfs_bill_amount', {
            currency,
          }),
          prop: '_amount',
        },
        { label: i18n.t('dfs_egress_traffic'), prop: 'transmit' },
        { label: i18n.t('dfs_ingress_traffic'), prop: 'received' },
      ],
      trafficBillItems: [],
      orderInfo: {},
      emailRules: [
        {
          required: true,
          message: i18n.t('dfs_instance_create_qingshuruninde'),
        },
        {
          type: 'email',
          message: i18n.t('dfs_instance_create_qingshuruzhengque'),
        },
      ],
      accountLoading: false,
      bankAccount: '',
      accountInfo: {
        accountName: '',
        accountNo: '',
        bankName: '',
        bankNo: '',
      },
      agentTypeMap: AGENT_TYPE_MAP,
      payForm: {
        email: this.$store.state.user.email,
        paymentMethod: 'Stripe',
        successUrl: '',
        cancelUrl: '',
      },
      paymentParams: {},

      // 连续订阅
      isRecurring: true,
    }
  },

  computed: {
    ...mapGetters(['isDomesticStation', 'currencyType']),

    isPayForBill() {
      return this.$route.name === 'payForBill'
    },

    payMethods() {
      const payMethods = [
        {
          icon: 'pay-stripe',
          label: this.$t(
            'dfs_agent_download_subscriptionmodeldialog_zaixianzhifu',
          ),
          value: 'Stripe',
        },
      ]

      if (this.isDomesticStation && !this.isRecurring) {
        payMethods.push({
          icon: 'pay-cmbc',
          label: i18n.t('dfs_order_pay_duigonghuikuan'),
          value: 'Balance',
        })
      }

      return payMethods
    },

    isStorage() {
      return this.subscribeItems[0]?.productType === 'MongoDB'
    },

    columns() {
      return this.isStorage
        ? [
            // {
            //   label: i18n.t('dfs_order_list_dingyueleixing'),
            //   prop: 'productType'
            // },
            {
              label: i18n.t('dfs_instance_instance_guige'),
              prop: 'specLabel',
              width: 360,
            },
            {
              label: i18n.t('dfs_instance_createagent_cunchukongjian'),
              prop: 'storageSizeLabel',
              width: 180,
            },
            {
              label: i18n.t(
                'dfs_agent_download_subscriptionmodeldialog_yunfuwushang',
              ),
              prop: 'provider',
              width: 180,
            },
            {
              label: i18n.t('dfs_agent_download_subscriptionmodeldialog_diqu'),
              prop: 'region',
              width: 180,
            },
            {
              label: i18n.t('dfs_user_center_jine'),
              prop: 'price',
            },
          ]
        : [
            {
              label: i18n.t('dfs_order_list_dingyueleixing'),
              prop: 'productType',
              width: 360,
            },
            {
              label: i18n.t('dfs_instance_instance_guige'),
              prop: 'specLabel',
              width: 180,
            },
            {
              label: i18n.t(
                'dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi',
              ),
              prop: 'agentTypeLabel',
              width: 180,
            },
            {
              label: i18n.t('dfs_user_center_jine'),
              prop: 'price',
            },
          ]
    },
  },

  async created() {
    const routeName = this.$route.name
    const renew = routeName === 'payForRenew'

    if (routeName === 'pay' || renew) {
      this.paymentParams.subscribeId = this.subscribeId = this.$route.params.id
      this.paymentParams.renew = renew
      await this.loadSubscribe()
    } else if (routeName === 'payForChange') {
      this.paymentParams.subscribeAlterId = this.subscribeAlterId =
        this.$route.params.id
      await this.loadAlter()
    } else if (routeName === 'payForBill') {
      this.billId = this.$route.params.id

      Object.assign(this.paymentParams, {
        billingId: this.billId,
        currency: this.currencyType,
        successUrl:
          location.origin +
          location.pathname +
          this.$router.resolve({
            name: 'order',
          }).href,
        cancelUrl: location.href,
      })

      await this.loadBill()
    }

    await this.loadBankAccount()
  },

  methods: {
    async loadSubscribe() {
      const {
        items: [subscribe],
      } = await this.$axios.get(
        `api/tcm/subscribe?filter=${encodeURIComponent(
          JSON.stringify({
            where: {
              id: this.subscribeId,
            },
          }),
        )}`,
      )
      const currency = subscribe.currency || this.currencyType
      this.subscribe = subscribe
      this.price = this.formatterPrice(currency, subscribe.totalAmount)
      this.subscriptionMethodLabel =
        getPaymentMethod({
          periodUnit: subscribe.periodUnit,
          type: subscribe.subscribeType,
        }) || '-'
      this.isRecurring = subscribe.subscribeType === 'recurring'

      const subscribeItems = []
      const trafficItems = []

      for (const it of subscribe.subscribeItems) {
        if (it.productType === 'networkTraffic') {
          it.productLabel = '免费100G'
          it.specLabel = '超出按量计费'
          it.price = `${this.formatterPrice(currency, it.amount)}/GB`
          trafficItems.push(it)
        } else {
          if (it.productType === 'MongoDB') {
            it.specLabel = `MongoDB Atlas ${it.spec.name}`
            it.storageSizeLabel = `${it.spec.storageSize} ${it.spec.storageSize || 'GB'}`
          } else {
            it.specLabel = getSpec(it.spec) || '-'
          }
          it.price = this.formatterPrice(currency, it.amount)
          it.agentTypeLabel = this.agentTypeMap[it.agentType]
          subscribeItems.push(it)
        }
      }

      this.subscribeItems = subscribeItems
      this.trafficItems = trafficItems

      const agentUrl = this.$router.resolve({
        name: 'Instance',
        query: {
          id: subscribeItems[0].resourceId,
        },
      })

      this.payForm.successUrl = this.isStorage
        ? location.origin +
          location.pathname +
          this.$router.resolve({
            name: 'dataConsole',
          }).href
        : subscribe.platform === 'fullManagement'
          ? location.origin + location.pathname + agentUrl.href
          : location.origin +
            location.pathname +
            this.$router.resolve({
              name: 'installAgent',
              params: {
                id: subscribeItems[0].resourceId,
              },
            }).href
      this.payForm.cancelUrl = location.href
    },

    async loadAlter() {
      const alter = await this.$axios.get(
        `api/tcm/subscribe/alter/${this.subscribeAlterId}`,
      )
      const { subscribe, subscribeId } = alter
      const currency = subscribe.currency || this.currencyType

      this.price = this.formatterPrice(currency, alter.subscribeItems[0].amount)
      this.subscriptionMethodLabel =
        getPaymentMethod({
          periodUnit: subscribe.periodUnit,
          type: subscribe.subscribeType,
        }) || '-'
      this.isRecurring = subscribe.subscribeType === 'recurring'
      this.subscribeItems = alter.subscribeItems.map((it) => {
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
            id: subscribeId,
          },
        }).href
      this.payForm.cancelUrl = location.href
    },

    async loadBill() {
      this.isRecurring = false // 显示对公

      const {
        items: [bill],
      } = await this.$axios.get(
        `api/tcm/billing?filter=${encodeURIComponent(
          JSON.stringify({
            where: {
              id: this.billId,
            },
          }),
        )}`,
      )

      let totalAmount = 0
      this.trafficBillItems = bill.details.map((item) => {
        item.transmit = calcUnit(item.transmit, 'byte')
        item.received = calcUnit(item.received, 'byte')
        const _total = item.amounts.find(
          (it) => it.currency === this.currencyType,
        )?.totalAmount
        item._amount = this.formatterPrice(this.currencyType, _total)
        totalAmount += _total
        return item
      })

      this.price = this.formatterPrice(this.currencyType, totalAmount)
    },

    validateForm(ref) {
      return new Promise((resolve) => {
        this.$refs[ref].validate((valid) => {
          resolve(valid)
        })
      })
    },

    async handlePay() {
      const valid = await this.validateForm('form')

      if (!valid) return

      this.submitLoading = true
      const { paymentUrl } = await this.postPayment()

      if (this.isPayForBill) {
        this.$router.push({ name: 'waitPayForBill' })
        paymentUrl && window.open(paymentUrl, '_target')
      } else {
        paymentUrl && window.open(paymentUrl, '_self')
      }
    },

    formatterPrice(currency, price) {
      if (price === 0) {
        return 0
      }
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    },

    async loadBankAccount(onlyLoad) {
      this.accountLoading = true
      const info = await this.$axios.get('api/tcm/capital/exclusive')
      this.accountLoading = false
      Object.assign(this.accountInfo, info)

      if (
        this.payForm.paymentMethod === 'Balance' &&
        !this.accountInfo.accountNo
      ) {
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
            'Content-Type': 'application/json',
          },
        },
      )
      this.accountLoading = false
      Object.assign(this.accountInfo, info)
    },

    async handleChangePayMethod(method) {
      if (method === 'Balance') {
        await this.createAccount()
      }

      await this.postPayment()
    },

    async postPayment() {
      if (this.$route.name === 'payForBill') {
        return await this.$axios.post('api/tcm/billing/pay', {
          ...this.payForm,
          ...this.paymentParams,
        })
      }
      return await this.$axios.post('api/tcm/subscribe/payment', {
        ...this.payForm,
        ...this.paymentParams,
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #title>
      <div class="flex align-center">
        <IconButton @click="$router.push({ name: 'order' })">left</IconButton>
        <span class="fs-5 ml-2">{{ $t('dfs_pending_payment') }}</span>
      </div>
    </template>

    <section class="pay-container flex flex-column gap-4 overflow-hidden mt-2">
      <div class="flex-1 overflow-auto rounded-lg flex flex-column gap-4">
        <div class="bg-white rounded-lg">
          <template v-if="$route.name !== 'payForBill'">
            <div class="font-color-dark fw-sub text-label mb-2">
              {{ $t('dfs_spec_configuration') }}
            </div>
            <div class="rounded-lg h-auto mb-5 border overflow-hidden">
              <VTable
                ref="table"
                :columns="columns"
                :data="subscribeItems"
                :has-pagination="false"
              >
                <template #empty>
                  <VEmpty small />
                </template>
              </VTable>
            </div>

            <div class="font-color-dark fw-sub text-label mb-2">
              {{ $t('dfs_traffic_bill') }}
            </div>

            <div class="rounded-lg h-auto mb-5 border overflow-hidden">
              <VTable
                ref="table"
                :columns="trafficColumns"
                :data="trafficItems"
                :has-pagination="false"
              >
                <template #empty>
                  <VEmpty small />
                </template>
              </VTable>
            </div>
          </template>

          <template v-else>
            <div class="font-color-dark fw-sub text-label mb-2">
              {{ $t('dfs_traffic_bill') }}
            </div>
            <VTable
              ref="table"
              class="border rounded-lg h-auto mb-5"
              :columns="trafficBillColumns"
              :data="trafficBillItems"
              :has-pagination="false"
            >
              <template #empty>
                <VEmpty small />
              </template>
            </VTable>
          </template>
          <ElForm ref="form" label-position="top" :model="payForm">
            <ElFormItem prop="email" :rules="emailRules">
              <template #label>
                <span class="font-color-dark fw-sub">
                  {{ $t('dfs_instance_create_jieshouzhangdande') }}
                </span>
              </template>
              <ElInput
                v-model="payForm.email"
                :placeholder="$t('dfs_instance_create_yongyujieshoumei')"
                style="width: 300px"
              />
            </ElFormItem>
          </ElForm>
        </div>

        <div class="bg-white rounded-lg">
          <div class="font-color-dark fw-sub text-label mb-2">
            {{ $t('dfs_instance_choose_payment_method') }}
          </div>
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
            <div v-if="payForm.paymentMethod === 'Balance'">
              <div class="bg-subtle rounded-lg p-4 mb-4">
                <!--汇款账号信息-->
                <div class="font-color-dark fw-sub text-label mb-2">
                  {{ $t('dfs_agent_download_transferdialog_zhuanzhangxinxi') }}
                </div>

                <el-skeleton
                  style="width: 400px"
                  :loading="accountLoading"
                  animated
                >
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
                        {{
                          $t('dfs_agent_download_transferdialog_kaihumingcheng')
                        }}
                      </div>
                      <div>{{ accountInfo.accountName }}</div>
                      <!--开户银行-->
                      <div class="font-color-light text-end">
                        {{
                          $t('dfs_agent_download_transferdialog_kaihuyinhang')
                        }}
                      </div>
                      <div>
                        <VIcon class="align-top mr-1" size="22">bank-cmbc</VIcon
                        >{{ accountInfo.bankName }}
                      </div>
                      <!--专属汇款账号-->
                      <div class="font-color-light text-end">
                        {{
                          $t(
                            'dfs_agent_download_transferdialog_huikuanzhanghao',
                          )
                        }}
                      </div>
                      <div>
                        {{ accountInfo.accountNo }}
                      </div>
                    </div></template
                  >
                </el-skeleton>
              </div>
              <div class="font-color-light text-label">
                {{ $t('dfs_agent_download_transferdialog_reopen_tips') }}
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <div class="bg-white rounded-lg">
          <ElButton
            v-if="payForm.paymentMethod === 'Stripe'"
            class="mr-4"
            type="primary"
            size="large"
            @click="handlePay"
            >{{ $t('dfs_pay_now') }}</ElButton
          >

          <span class="mr-4">
            <span class="fw-sub font-color-dark mt-2"
              >{{ $t('dfs_order_total') }}:</span
            ><span class="color-primary fw-sub fs-5 ml-2">{{ price }}</span>
          </span>

          <span class="font-color-light">{{ subscriptionMethodLabel }}</span>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.pay-container {
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

  :deep(.label-grid) {
    display: grid;
    grid-template-columns: auto 1fr; /* 两列 */
    grid-gap: 8px;
    grid-column-gap: 4px;
  }
}
.pay-wrap {
  background-color: var(--color-submenu);
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
  :deep(.el-radio__inner) {
    vertical-align: top;
  }
}
</style>
