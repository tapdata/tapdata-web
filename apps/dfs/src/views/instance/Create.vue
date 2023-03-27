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
      <ElSelect v-model="form.specification">
        <ElOption
          v-for="item in specificationItems"
          :label="item.label"
          :value="item.value"
          :key="item.value"
        ></ElOption>
      </ElSelect>
      <ul class="my-6 flex justify-content-between">
        <li
          v-for="item in packageItems"
          :key="item.value"
          class="packages-item position-relative text-center p-4 cursor-pointer"
          :class="{ active: form.package === item.value }"
          @click="handlePackage(item)"
        >
          <span v-if="item.recommend" class="recommend-item position-absolute top-0 bg-primary color-white py-1 px-6"
            >推荐</span
          >
          <p class="mb-4 pt-2 fs-6 font-color-normal">{{ item.label }}</p>
          <p class="mb-4 color-primary">
            <span class="fs-6">¥</span>
            <span class="fs-5">{{ item.number }}</span>
          </p>
          <p class="font-color-sslight fs-8">{{ item.desc }}</p>
        </li>
      </ul>
      <p class="font-color-sslight">本次订购只适用4C8G规格的实例</p>

      <p class="mt-4 mb-2">接收账单的邮箱</p>
      <ElForm :model="form" ref="from">
        <ElFormItem prop="email" :rules="emailRules">
          <ElInput v-model="form.email" placeholder="请输入您的邮箱"></ElInput>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" type="primary" @click="submit">订阅</ElButton>
      </span>
    </template>
    <div v-else class="text-center">
      <img style="height: 60px" :src="require('@tap/assets/images/passed.png')" />
      <p class="mb-4 mt-4 fs-6">账单已发送至邮箱，请查收</p>
      <div class="inline-block">
        <ElButton @click="back">返回</ElButton>
        <ElButton type="primary" @click="finish">支付完成</ElButton>
      </div>
    </div>
  </ElDialog>
</template>

<script>
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
      specificationItems: [
        {
          label: '4C8G',
          value: '4C8G'
        },
        {
          label: '8C16G',
          value: '8C16G'
        },
        {
          label: '12C24G',
          value: '12C24G'
        },
        {
          label: '16C32G',
          value: '16C32G'
        },
        {
          label: '32C64G',
          value: '32C64G'
        }
      ],
      packageItems: [
        {
          label: '连续包月',
          value: '1',
          number: 10,
          desc: '本次订购只适用4C8G规格的实例',
          recommend: true
        },
        {
          label: '连续包年',
          value: '2',
          number: 12000,
          desc: '本次订购只适用4C8G规格的实例',
          recommend: true
        },
        {
          label: '订购一个月',
          value: '3',
          number: 10,
          desc: '本次订购只适用4C8G规格的实例'
        },
        {
          label: '订购一年',
          value: '4',
          number: 12000,
          desc: '本次订购只适用4C8G规格的实例'
        }
      ],
      form: {
        specification: '',
        package: '',
        email: ''
      },
      showResult: false,
      emailRules: [
        {
          required: true,
          message: '请输入您的邮箱'
        },
        {
          type: 'email',
          message: '请输入正确的邮箱地址'
        }
      ]
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
      this.form.specification = this.specificationItems[0].value
      this.form.package = this.packageItems[0].value
    },

    handleCancel() {
      this.visible = false
      this.$emit('input', this.visible)
    },

    handlePackage(item) {
      this.form.package = item.value
    },

    submit() {
      this.$refs.from.validate(valid => {
        if (!valid) return
        const params = {
          priceId: ''
        }
        this.$axios.post('api/tcm/paid/plan/createPaidSubscribe', params).then(data => {
          console.log('api/tcm/paid/plan/createPaidSubscribe', data)
        })
        this.showResult = true
      })
    },

    back() {
      this.showResult = false
    },

    finish() {
      console.log('finish')
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
  border-radius: 10px;
  border: 1px solid map-get($borderColor, light);
  &.active {
    border-color: map-get($color, primary);
  }
}

.el-select,
.el-input {
  width: 494px;
}
</style>
