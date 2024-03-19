<template>
  <ElDialog
    title="申请试用 Alpha/Beta 数据源"
    :visible="visible"
    @close="handleClose"
    @closed="afterClose"
    :append-to-body="true"
    width="520px"
  >
    <el-result v-if="hasRequest" icon="info" title="审批中" subTitle="你已提交申请，请等待审批">
      <template #icon>
        <VIcon class="color-primary" size="48">time</VIcon>
      </template>
    </el-result>
    <el-alert
      v-else
      class="alert-primary text-primary mb-4"
      type="info"
      :title="`您正在申请使用 ${meta.qcType} 版本的 ${meta.type} 数据源， 请提供您的联系方式并允许我们的支持人员联系您以帮助您成功运行任务。`"
      :closable="false"
      show-icon
    />

    <ElForm ref="form" :model="form" label-position="top" :disabled="hasRequest">
      <ElFormItem label="您计划使用此连接器的场景" prop="summary">
        <ElInput v-model="form.summary" type="textarea"></ElInput>
      </ElFormItem>
      <div class="flex gap-4">
        <ElFormItem label="手机" class="flex-1" prop="phone">
          <ElInput v-model="form.phone" maxlength="50" type="phone"></ElInput>
        </ElFormItem>
        <ElFormItem label="邮箱" class="flex-1" prop="email">
          <ElInput v-model="form.email" type="email"></ElInput>
        </ElFormItem>
      </div>
      <ElFormItem label="预计使用时间" prop="hoursOfAvailability">
        <ElRadioGroup v-model="form.hoursOfAvailability">
          <ElRadioButton label="5">5天</ElRadioButton>
          <ElRadioButton label="180">半年</ElRadioButton>
          <ElRadioButton label="365">1年</ElRadioButton>
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
        <el-button @click="handleClose">取 消</el-button>
        <el-button v-if="hasRequest" type="primary" :loading="saving" @click="handleClose">确 定</el-button>
        <el-button v-else type="primary" :loading="saving" @click="handleSubmit">提 交</el-button>
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

      saving: false,
      hasRequest: false
    }
  },

  methods: {
    async handleOpen() {
      const request = await this.queryRequest()
      console.log('request', request)

      if (request?.status === 'APPROVED') {
        // 审核通过
        return false
      }

      // 先显示Dialog > Form，后面resetFields才能生效
      this.$emit('update:visible', true)
      this.hasRequest = false

      await this.$nextTick()

      if (request?.status === 'PENDING') {
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

      console.log('result', result)
      return result?.items?.[0]
    }
  }
}
</script>

<style scoped lang="scss">
.form-item-width-md {
  width: 198px;
}
</style>
