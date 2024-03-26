<script>
import { mapGetters } from 'vuex'
import { VTable } from '@tap/component'
import i18n from '@/i18n'
export default {
  name: 'Pay',
  components: { VTable },
  props: ['isCard', 'orderInfo', 'email'],
  data() {
    return {
      order: [],
      priceOff: 0,
      columns: [
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
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_zaixianzhifu'),
          value: 'Stripe'
        }
      ],

      formRules: {
        email: [
          {
            validator: (rule, value, callback) => {
              let { email } = this.orderInfo
              email = email?.trim()
              if (!email) {
                callback(new Error(i18n.t('dfs_instance_create_qingshuruninde')))
                return
              }
              if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
                callback(new Error(i18n.t('dfs_instance_create_qingshuruzhengque')))
                return
              }
              callback()
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['isDomesticStation'])
  },
  mounted() {
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
    validateForm(ref) {
      return new Promise(resolve => {
        this.$refs[ref].validate(valid => {
          resolve(valid)
        })
      })
    }
  }
}
</script>
<template>
  <section>
    <div class="mb-4" :class="{ card: isCard, 'mt-6 ': !isCard }">
      <div class="font-color-dark fw-sub fs-5 mb-4">{{ $t('dfs_instance_create_spec_summary') }}</div>
      <VTable :columns="columns" :data="subscribeItems" ref="table" :has-pagination="false"></VTable>
    </div>
    <div :class="{ card: isCard }">
      <p class="mt-4 mb-2">{{ $t('dfs_instance_create_jieshouzhangdande') }}</p>
      <ElForm ref="from" :mode="orderInfo" :rules="formRules">
        <ElFormItem prop="email">
          <ElInput v-model="orderInfo.email" :placeholder="$t('dfs_instance_create_yongyujieshoumei')"></ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <!--国内显示选择支付方式-->
    <div v-if="isDomesticStation" class="mt-4" :class="{ card: isCard }">
      <div>{{ $t('dfs_instance_choose_payment_method') }}</div>
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
    </div>
    <ul class="mt-4" :class="{ card: isCard }" v-if="orderInfo">
      <li v-if="orderInfo.priceOff && orderInfo.price !== 0">
        <span class="price-detail-label text-end inline-block mr-2"
          >{{ $t('dfs_agent_subscription_discount', { val: orderInfo.priceDiscount }) }}:
        </span>
        <span class="ml-2"> {{ priceOff }}</span>
      </li>
      <li v-if="orderInfo.price">
        <span class="fw-sub font-color-dark mt-2 mr-4">{{ $t('dfs_instance_instance_shifujine') }}</span
        >:<span class="color-primary fw-sub fs-5 ml-2">{{ orderInfo.price }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.card {
  padding: 16px 24px;
  border-radius: 8px;
  border-top: 1px solid var(--unnamed, #e5e6eb);
  background: #fff;
}
</style>
