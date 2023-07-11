<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
import { getPaymentMethod, getSpec } from '../../views/instance/utils'
export default {
  name: 'Pay',
  components: { VTable },
  props: ['isCard', 'orderInfo'],
  data() {
    return {
      order: [],
      form: {
        email: ''
      },
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
          slotName: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_user_center_jine'),
          prop: 'price',
          slotName: 'price'
        }
      ],
      payType: 'Stripe',
      subscribeItems: [],
      types: [
        {
          label: '在线支付',
          value: 'Stripe'
        }
      ]
    }
  },
  mounted() {
    this.form.email = window.__USER_INFO__.email
    //格式化items
    this.subscribeItems = this.orderInfo?.subscribeItems || []
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
    getEmail() {
      return this.form.email
    }
  }
}
</script>
<template>
  <section>
    <div class="mb-4" :class="{ card: isCard, 'mt-6 ': !isCard }">
      <div class="font-color-dark fw-sub fs-5 mb-4">所选配置</div>
      <VTable :columns="columns" :data="subscribeItems" ref="table" :has-pagination="false"></VTable>
    </div>
    <div :class="{ card: isCard }">
      <p class="mt-4 mb-2">{{ $t('dfs_instance_create_jieshouzhangdande') }}</p>
      <ElForm :model="form" ref="from">
        <ElFormItem prop="email" :rules="getEmailRules()">
          <ElInput v-model="form.email" :placeholder="$t('dfs_instance_create_yongyujieshoumei')"></ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <div class="mt-4" :class="{ card: isCard }">
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
    </div>
    <ul class="mt-4" :class="{ card: isCard }" v-if="orderInfo">
      <li v-if="orderInfo.priceOff">
        <span class="mr-4">95折</span>：<span class="ml-2"> -{{ orderInfo.priceOff }}</span>
      </li>
      <li v-if="orderInfo.price">
        <span class="fw-sub font-color-dark mt-2 mr-4">实付金额</span>:<span class="color-primary fw-sub fs-5 ml-2">{{
          orderInfo.price
        }}</span>
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
