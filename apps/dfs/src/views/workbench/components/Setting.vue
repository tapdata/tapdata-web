<template>
  <ElDialog
    custom-class="notice-setting-dialog"
    :title="$t('notify_setting')"
    width="600px"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :append-to-body="true"
    :before-close="handleClose"
  >
    <ElForm ref="form" class="e-form" label-width="150px" :model="form">
      <div class="notice-setting-title">{{ $t('notify_agent_notification') }}</div>
      <ElFormItem :label="$t('notify_agent_status_offline')">
        <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>
        <ElSwitch
          v-model="form.connectionInterrupted.sms"
          size="mini"
          :disabled="$disabledReadonlyUserBtn()"
          @change="handleSettingValue"
        ></ElSwitch>
        <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>
        <ElSwitch
          v-model="form.connectionInterrupted.email"
          size="mini"
          :disabled="$disabledReadonlyUserBtn()"
          @change="handleSettingValue"
        ></ElSwitch>
      </ElFormItem>
      <ElFormItem :label="$t('notify_agent_status_running')">
        <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>
        <ElSwitch
          v-model="form.connected.sms"
          size="mini"
          :disabled="$disabledReadonlyUserBtn()"
          @change="handleSettingValue"
        ></ElSwitch>
        <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>
        <ElSwitch
          v-model="form.connected.email"
          :disabled="$disabledReadonlyUserBtn()"
          @change="handleSettingValue"
        ></ElSwitch>
      </ElFormItem>
      <!--      <div class="notice-setting-title">{{ $t('notify_task_running_notification') }}</div>-->
      <!--      <ElFormItem :label="$t('notify_agent_status_error')">-->
      <!--        <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>-->
      <!--        <ElSwitch v-model="form.stoppedByError.sms" @change="handleSettingValue"></ElSwitch>-->
      <!--        <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>-->
      <!--        <ElSwitch v-model="form.stoppedByError.email" @change="handleSettingValue"></ElSwitch>-->
      <!--      </ElFormItem>-->
    </ElForm>
  </ElDialog>
</template>
<script>
export default {
  props: ['visible'],
  data() {
    return {
      dialogVisible: false,
      userId: '',
      form: {
        connected: {
          email: true,
          sms: false
        },
        connectionInterrupted: {
          email: true,
          sms: false
        },
        stoppedByError: {
          email: true,
          sms: false
        }
      }
    }
  },
  created() {
    // 获取tm用户id
    this.$axios.get('tm/api/users/self').then(data => {
      if (data) {
        this.userId = data.id
        if (data.notification) {
          this.form = data.notification
        }
      }
    })
    this.dialogVisible = this.visible
  },
  methods: {
    handleSettingValue() {
      let data = {
        notification: this.form
      }
      this.$axios.patch(`tm/api/users/${this.userId}`, data)
    },
    handleClose() {
      this.$emit('handleDialogVisible', false)
    }
  }
}
</script>
<style lang="scss">
.notice-setting-dialog {
  .el-dialog__header {
    padding: 40px 40px 0 40px;
    .el-dialog__title {
      font-weight: 500;
      color: #000;
    }
    .el-dialog__headerbtn {
      top: 40px;
      right: 40px;
    }
  }
  .el-dialog__body {
    padding: 30px 40px;
    .notice-setting-title {
      padding-bottom: 10px;
      font-size: 12px;
      color: #2c65ff;
    }
    .notice-setting-label {
      padding: 0 8px 0 30px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
    }
    .el-form-item__label {
      text-align: left;
    }
  }
}
</style>
