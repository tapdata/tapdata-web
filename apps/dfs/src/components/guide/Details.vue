<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
export default {
  name: 'Pay',
  components: { VTable },
  props: ['isCard', 'orderInfo', 'email'],
  data() {
    const isDomesticStation = window.__config__?.station === 'domestic' //默认是国内站 国际站是 international
    return {
      isDomesticStation,
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
      ]
    }
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
      <ElForm ref="from">
        <ElFormItem prop="email" :rules="getEmailRules()">
          <ElInput v-model="email" :placeholder="$t('dfs_instance_create_yongyujieshoumei')"></ElInput>
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
      <li>
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
