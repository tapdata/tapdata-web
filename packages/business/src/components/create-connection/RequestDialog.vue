<template>
  <ElDialog
    :title="$t('packages_business_request_connector_title')"
    :visible="visible"
    @close="handleClose"
    @closed="afterClose"
    :append-to-body="true"
    width="520px"
  >
    <el-result
      v-if="hasRequest"
      icon="info"
      :title="$t('packages_business_request_connector_pending')"
      :subTitle="$t('packages_business_request_connector_pending_desc')"
    >
      <template #icon>
        <VIcon class="color-primary" size="48">time</VIcon>
      </template>
    </el-result>
    <el-alert
      v-else
      class="alert-primary text-primary mb-4"
      type="info"
      :title="
        $t('packages_business_request_connector_alert', {
          ...meta
        })
      "
      :closable="false"
      show-icon
    />

    <ElForm ref="form" :model="form" label-position="top" :disabled="hasRequest" :rules="rules">
      <ElFormItem :label="$t('packages_business_request_connector_use_plan')" prop="summary" required>
        <ElInput v-model="form.summary" type="textarea"></ElInput>
      </ElFormItem>
      <div class="flex gap-4">
        <ElFormItem :label="$t('public_phone')" class="flex-1" prop="phone">
          <ElInput v-model="form.phone" maxlength="50" type="phone"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('public_email')" class="flex-1" prop="email">
          <ElInput v-model="form.email" type="email"></ElInput>
        </ElFormItem>
      </div>
      <ElFormItem :label="$t('packages_business_request_connector_use_time')" prop="hoursOfAvailability">
        <ElRadioGroup v-model="form.hoursOfAvailability">
          <ElRadioButton label="5">{{ $t('packages_business_request_connector_use_time_option1') }}</ElRadioButton>
          <ElRadioButton label="180">{{ $t('packages_business_request_connector_use_time_option2') }}</ElRadioButton>
          <ElRadioButton label="365">{{ $t('packages_business_request_connector_use_time_option3') }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <!--<ElFormItem label="您期望什么时间联系您">
        <el-date-picker
          v-model="form.contactTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </ElFormItem>-->
    </ElForm>

    <template #footer>
      <div>
        <el-button @click="handleClose">{{ $t('public_button_cancel') }}</el-button>
        <el-button v-if="hasRequest" type="primary" :loading="saving" @click="handleClose">{{
          $t('public_button_confirm')
        }}</el-button>
        <el-button v-else type="primary" :loading="saving" @click="handleSubmit">{{
          $t('public_button_submit')
        }}</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script>
export default {
  name: 'RequestDialog',
  props: {
    visible: Boolean,
    meta: Object
  },
  data() {
    const user = this.$store.state.user
    return {
      form: {
        phone: user.telephone,
        email: user.email,
        summary: '',
        hoursOfAvailability: 365,
        contactTime: {
          start: null,
          end: null
        }
      },
      rules: {
        summary: {
          required: true,
          message: this.$t('packages_business_request_connector_use_plan_placeholder'),
          trigger: 'blur'
        }
      },

      saving: false,
      hasRequest: false
    }
  },

  methods: {
    async handleOpen() {
      const requestList = await this.queryRequest()

      if (requestList.some(item => item.status === 'APPROVED')) {
        // 审核通过
        return false
      }

      // 先显示Dialog > Form，后面resetFields才能生效
      this.$emit('update:visible', true)
      this.hasRequest = false

      await this.$nextTick()

      const request = requestList.find(item => item.status === 'PENDING')

      if (request) {
        // 审核中
        this.hasRequest = true
        // 填充form
        Object.assign(this.form, {
          summary: request.summary,
          phone: request.phone,
          email: request.email
        })
      }

      return true
    },
    handleClose() {
      this.$emit('update:visible', false)
    },

    afterClose() {
      this.$refs.form.resetFields()
    },

    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saving = true
          this.$axios
            .post('api/tcm/feature/connector', {
              ...this.form,
              metadata: this.meta
            })
            .then(() => {
              this.handleClose()
            })
            .finally(() => (this.saving = false))
        }
      })
    },

    async queryRequest() {
      const result = await this.$axios.get(`api/tcm/feature/connector`, {
        params: {
          filter: JSON.stringify({
            where: {
              'metadata.type': this.meta.type
            }
          })
        }
      })

      return result?.items || []
    }
  }
}
</script>

<style scoped lang="scss">
.form-item-width-md {
  width: 198px;
}
</style>
