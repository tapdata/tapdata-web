<template>
  <ElDialog
    width="980px"
    append-to-body
    custom-class="batch-field-type-maping-table-dialog"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div slot="title" class="mb-6 font-color-dark fs-3 fw-bold">需要更多的服务？</div>
    <template v-if="!showResult">
      <p class="mt-n10 mb-4 font-color-sslight">
        请根据数据量和任务数量选择合适的实例规格进行订阅，订阅成功后，不可变更
      </p>
      <p class="font-color-light mb-2">选择实例规格</p>
      <ul class="flex justify-content-start">
        <li
          v-for="(item, index) in specificationItems"
          :key="index"
          class="specification-item cursor-pointer py-2 px-4"
          :class="{ active: form.specification === item.value, 'mr-4': index !== specificationItems.length - 1 }"
          @click="handleChange(item)"
        >
          {{ item.label }}
        </li>
      </ul>
      <p class="mt-4 mb-2">接收账单的邮箱</p>
      <ElForm :model="form" ref="from">
        <ElFormItem prop="email" :rules="getEmailRules()">
          <ElInput v-model="form.email" :placeholder="getPlaceholder()"></ElInput>
        </ElFormItem>
      </ElForm>
      <ul v-loading="loading" class="mt-6">
        <li
          v-for="(item, index) in packageItems"
          :key="item.value"
          class="packages-item position-relative text-center inline-block mb-4 p-4 cursor-pointer"
          :class="{ active: selected.value === item.value, 'mr-6': index !== packageItems.length - 1 }"
          @click="handlePackage(item)"
        >
          <span v-if="item.recommend" class="recommend-item position-absolute top-0 bg-primary color-white py-1 px-6"
            >推荐</span
          >
          <p class="mb-4 pt-2 fs-6 font-color-normal">{{ item.label }}</p>
          <p class="mb-4 color-primary">
            <span class="fs-5">{{ item.price }}</span>
          </p>
          <p class="font-color-sslight fs-8">{{ item.desc }}</p>
        </li>
      </ul>
      <!--      <p class="font-color-sslight">本次订购只适用4C8G规格的实例</p>-->

      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" type="primary" :loading="submitLoading" @click="submit">订阅</ElButton>
      </span>
    </template>
    <div v-else class="text-center">
      <div>
        <img style="height: 60px" :src="require('@tap/assets/images/passed.png')" />
      </div>
      <p v-if="selected.type === 'recurring'" class="mb-4 mt-4 fs-6">账单已发送至邮箱，请查收</p>
      <div class="inline-block">
        <ElButton @click="back">返回</ElButton>
        <ElButton type="primary" @click="finish">支付完成</ElButton>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import { uniqueArr, openUrl } from '@tap/shared'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
import { getSpec, getPaymentMethod } from './utils'

export default {
  name: 'Create',

  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      visible: false,
      loading: false,
      submitLoading: false,
      specificationItems: [],
      allPackages: [],
      packageItems: [],
      selected: {},
      form: {
        specification: '',
        email: ''
      },
      showResult: false
      // emailRules: [
      //   {
      //     required: true,
      //     message: '请输入您的邮箱'
      //   },
      //   {
      //     type: 'email',
      //     message: '请输入正确的邮箱地址'
      //   }
      // ]
    }
  },

  watch: {
    value(v) {
      this.visible = v
      v && this.init()
    }
  },

  methods: {
    init() {
      this.showResult = false
      this.form.email = window.__USER_INFO__.email
      this.loadData()
    },

    loadData() {
      const params = {
        productType: 'selfHost'
      }
      this.loading = true
      this.$axios
        .get('api/tcm/paid/plan/getPaidPlan', { params })
        .then(data => {
          const { paidPrice = [] } = data?.[0] || {}

          // 规格
          this.specificationItems = uniqueArr(
            paidPrice.map(t => {
              const { cpu = 0, memory = 0 } = t.spec || {}
              return {
                label: getSpec(t.spec),
                value: getSpec(t.spec),
                cpu,
                memory
              }
            }),
            'value'
          ).sort((a, b) => {
            return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
          })
          this.handleSpecification(this.specificationItems[0])

          // 价格套餐
          this.allPackages = paidPrice.map(t => {
            return Object.assign(t, {
              label: getPaymentMethod(t),
              value: t.priceId,
              price:
                CURRENCY_SYMBOL_MAP[t.currency] +
                (t.price / 100).toLocaleString('zh', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }),
              desc: '',
              specification: getSpec(t.spec)
            })
          })
          this.loadPackageItems()
          this.handlePackage(this.packageItems[0])
        })
        .finally(() => {
          this.loading = false
        })
    },

    loadPackageItems() {
      const specificationLabel = this.specificationItems.find(t => t.value === this.form.specification)?.label
      this.packageItems = this.allPackages
        .filter(t => this.form.specification === t.specification)
        .map(t => {
          return Object.assign(t, {
            desc: `本次订购只适用${specificationLabel}规格的实例`
          })
        })
        .sort((a, b) => {
          return a.order > b.order ? -1 : 1
        })
    },

    handleChange(item = {}) {
      this.form.specification = item.value
      this.loadPackageItems()
      this.handlePackage(this.packageItems[0])
    },

    handleCancel() {
      this.visible = false
      this.$emit('input', this.visible)
    },

    handleSpecification(item = {}) {
      this.form.specification = item.value
    },

    handlePackage(item) {
      this.selected = item
    },

    submit() {
      this.$refs.from.validate(valid => {
        if (!valid) return

        // 订阅
        const { type, priceId, currency } = this.selected
        if (type === 'recurring') {
          const params = {
            priceId,
            email: this.form.email
          }
          this.submitLoading = true
          this.$axios.post('api/tcm/paid/plan/createPaidSubscribe', params).then(data => {
            openUrl(data)
            this.submitLoading = false
            this.showResult = true
          })
          return
        }
        const params = {
          priceId,
          currency,
          successUrl: location.href,
          cancelUrl: location.href
        }
        this.submitLoading = true
        this.$axios.post('api/tcm/paid/plan/oneTime/paymentLink', params).then(data => {
          openUrl(data)
          this.submitLoading = false
          this.showResult = true
        })
      })
    },

    back() {
      this.showResult = false
    },

    finish() {
      this.$emit('finish')
      this.handleCancel()
    },

    getEmailRules() {
      return [
        {
          required: this.selected.type === 'recurring',
          message: '请输入您的邮箱'
        },
        {
          type: 'email',
          message: '请输入正确的邮箱地址'
        }
      ]
    },

    getPlaceholder() {
      return this.selected.type === 'recurring' ? '用于接收每期订阅支付账单' : '（可选）'
    }
  }
}
</script>

<style lang="scss" scoped>
.recommend-item {
  border-radius: 10px 10px 10px 0;
  transform: translateY(-50%);
  left: -1px;
}

.packages-item {
  box-shadow: 0px 4px 4px rgba(29, 33, 41, 0.05);
  border-radius: 8px;
  border: 1px solid map-get($borderColor, light);
  &.active {
    border-color: map-get($color, primary);
  }
}

.el-select,
.el-input {
  width: 494px;
}

.specification-item {
  border: 1px solid map-get($borderColor, normal);
  border-radius: 8px;
  &.active {
    border-color: map-get($color, primary);
  }
}
</style>
