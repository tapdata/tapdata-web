<script>
import Details from '@/components/guide/Details.vue'
import TheHeader from '@/components/the-header'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
export default {
  components: {
    Details,
    TheHeader
  },

  data() {
    return {
      orderInfo: null
    }
  },

  created() {
    this.loadOrderInfo(this.$route.query.id)
  },

  methods: {
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
      subscribe.originalPrice = this.formatterPrice(subscribe.currency, subscribe.subscribeItems[0].amount)
      subscribe.price = subscribe.originalPrice
      subscribe.priceOff = 0
      subscribe.subscriptionMethodLabel =
        getPaymentMethod(
          { periodUnit: subscribe.periodUnit, type: subscribe.subscribeType },
          subscribe.paymentMethod || 'Stripe'
        ) || '-'
      subscribe.subscribeItems.forEach(it => {
        it.specLabel = getSpec(it.spec) || '-'
      })
      this.orderInfo = subscribe
    }
  }
}
</script>

<template>
  <section class="pay-wrap">
    <TheHeader></TheHeader>
    <!--费用清单-->
    <Details v-if="orderInfo" class="pay-main" ref="details" :isCard="true" :orderInfo="orderInfo" />
  </section>
</template>

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
</style>
