<template>
  <section class="pay-wrap">
    <TheHeader></TheHeader>
    <!--费用清单-->
    <section v-if="orderInfo" class="pay-main" ref="details">
      <div class="mb-4" :class="{ card: isCard, 'mt-6 ': !isCard }">
        <div class="font-color-dark fw-sub fs-5 mb-4">所选配置</div>
        <VTable :columns="columns" :data="subscribeItems" ref="table" :has-pagination="false"></VTable>
      </div>
      <div :class="{ card: isCard }">
        <ElForm ref="form" :model="orderInfo">
          <p class="mt-4 mb-2">{{ $t('dfs_instance_create_jieshouzhangdande') }}</p>

          <ElFormItem prop="email" :rules="getEmailRules()">
            <ElInput v-model="orderInfo.email" :placeholder="$t('dfs_instance_create_yongyujieshoumei')"></ElInput>
          </ElFormItem>

          <div>选择支付方式</div>
          <ElRadioGroup v-model="payType" class="flex gap-4 mt-4 mb-4">
            <ElRadio
              v-for="(item, index) in types"
              :key="index"
              :label="item.value"
              border
              class="rounded-4 subscription-radio m-0 position-relative"
            >
              <span>{{ item.label }}</span>
            </ElRadio>
          </ElRadioGroup>
        </ElForm>
      </div>
      <ul class="mt-4" :class="{ card: isCard }" v-if="orderInfo">
        <li v-if="orderInfo.priceOff && orderInfo.price !== 0">
          <span class="price-detail-label text-end inline-block mr-2"
            >{{ $t('dfs_agent_subscription_discount', { val: orderInfo.priceDiscount }) }}:
          </span>
          <span class="ml-2"> {{ priceOff }}</span>
        </li>
        <li v-if="orderInfo.price">
          <span class="fw-sub font-color-dark mt-2 mr-4">实付金额:</span
          ><span class="color-primary fw-sub fs-5">{{ orderInfo.price }}</span>
        </li>

        <div class="mt-4">
          <ElButton type="primary" size="large" @click="handlePay">立即支付</ElButton>
        </div>
      </ul>
    </section>
  </section>
</template>

<script>
import i18n from '@/i18n'
import { VTable } from '@tap/component'
import TheHeader from '@/components/the-header'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
export default {
  components: {
    TheHeader,
    VTable
  },

  data() {
    return {
      isCard: true,
      order: [],
      priceOff: 0,
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
          label: i18n.t('dfs_instance_instance_dingyuefangshi'),
          prop: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price'
        }
      ],
      payType: 'Stripe',
      subscribeItems: [],
      types: [
        {
          label: '在线支付',
          value: 'Stripe'
        }
      ],
      orderInfo: null
    }
  },

  async created() {
    await this.loadOrderInfo(this.$route.query.id)

    this.$nextTick(() => {
      //格式化items
      let subscribeItems = this.orderInfo?.subscribeItems || []
      const { subscriptionMethodLabel, originalPrice, priceOff } = this.orderInfo
      this.subscribeItems = subscribeItems.map(it => {
        it.subscriptionMethodLabel = subscriptionMethodLabel
        it.price = originalPrice
        return it
      })
      this.priceOff = priceOff === 0 ? 0 : '-' + priceOff
    })
  },

  methods: {
    getEmailRules() {
      return [
        {
          required: true,
          message: i18n.t('dfs_instance_create_qingshuruninde')
        },
        {
          type: 'email',
          message: i18n.t('dfs_instance_create_qingshuruzhengque')
        }
      ]
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
      this.$axios
        .post('api/tcm/subscribe/payment', this.orderInfo)
        .then(data => {
          const payUrl = data?.payUrl || data.paymentUrl
          if (payUrl) {
            window.open(payUrl, '_self')
          } else {
            this.$router.push({
              name: 'changeList',
              query: {
                id: data.subscribeId
              }
            })
          }
        })
        .catch(() => {
          this.submitLoading = false
        })
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
    async loadOrderInfo(id) {
      if (!id) return
      const alter = await this.$axios.get(`api/tcm/subscribe/alter/${id}`)
      const { subscribe } = alter
      const route = this.$router.resolve({
        name: 'changeList',
        query: {
          id: alter.subscribeId
        }
      })
      const price = this.formatterPrice(subscribe.currency, alter.subscribeItems[0].amount)
      const orderInfo = {
        email: this.$store.state.user.email,
        price,
        originalPrice: price,
        subscriptionMethodLabel:
          getPaymentMethod(
            { periodUnit: alter.periodUnit, type: alter.subscribeType },
            alter.paymentMethod || 'Stripe'
          ) || '-',
        successUrl: location.origin + location.pathname + route.href,
        cancelUrl: location.origin + location.pathname + route.href,
        subscribeAlterId: alter.id,
        subscribeType: alter.subscribeType,
        subscribeItems: alter.subscribeItems.map(it => {
          it.specLabel = getSpec(it.spec) || '-'
          return it
        }),
        paymentMethod: alter.paymentMethod,
        periodUnit: alter.periodUnit,
        currency: alter.currency || window.__config__?.currencyType
      }

      this.orderInfo = orderInfo
    }
  }
}
</script>

<style scoped lang="scss">
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
</style>
