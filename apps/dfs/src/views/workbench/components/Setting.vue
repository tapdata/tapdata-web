<template>
  <ElDialog
    custom-class="notice-setting-dialog"
    :title="$t('notify_setting')"
    width="920px"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :append-to-body="true"
    :before-close="handleClose"
  >
    <BusinessAlarmNotification></BusinessAlarmNotification>
  </ElDialog>
</template>
<script>
import { BusinessAlarmNotification } from '@tap/business'
export default {
  props: ['visible'],
  components: { BusinessAlarmNotification },
  data() {
    return {
      dialogVisible: false,
      userId: '',
      form: {
        connected: {
          email: true,
          sms: false,
          weChat: false
        },
        connectionInterrupted: {
          email: true,
          sms: false,
          weChat: false
        },
        stoppedByError: {
          email: true,
          sms: false,
          weChat: false
        },
        isOpenid: false
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
    //是否绑定微信
    this.isOpenid = window.__USER_INFO__?.openid
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
      font-weight: 400;
      font-size: 16px;
      line-height: 21px;
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
  .divider {
    width: 2px;
    height: 18px;
    margin-right: 16px;
    vertical-align: middle;
    background: map-get($color, primary);
  }
}
</style>
