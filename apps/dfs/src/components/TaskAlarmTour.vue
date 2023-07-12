<template>
  <ElDialog :visible.sync="visible" width="480px" :close-on-click-modal="false">
    <span slot="title" class="fs-6 fw-sub font-color-dark"> 设置告警通知，实时监控任务状态 </span>

    <el-alert
      v-if="noEmail"
      class="alert-primary text-primary mb-4"
      type="info"
      title="检测到您未绑定邮箱，请先绑定邮箱用于接收任务告警通知"
      show-icon
      :closable="false"
    />
    <div class="flex gap-4 justify-content-between">
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24" class="text-primary">email</VIcon>
        <span>邮件通知</span>
      </div>
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24" class="text-primary">sms</VIcon>
        <span>短信通知</span>
      </div>
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24">wechat</VIcon>
        <span>微信通知</span>
      </div>
    </div>

    <div slot="footer">
      <el-button @click="cancel">{{ $t('public_button_cancel') }}</el-button>
      <el-button v-if="noEmail" type="primary" @click="gotoBindEmail">绑定邮箱</el-button>
      <el-button v-else type="primary" @click="gotoSettings">去设置</el-button>
    </div>
  </ElDialog>
</template>

<script>
import { driver } from 'driver.js'

export default {
  name: 'TaskAlarmTour',
  props: {
    value: Boolean
  },

  data() {
    return {
      visible: this.value
    }
  },

  computed: {
    userId() {
      return this.$store.state.user.id
    },
    noEmail() {
      return !this.$store.state.user.email
    }
  },

  watch: {
    visible(v) {
      this.$emit('input', v)
    },

    value(v) {
      this.visible = v
    }
  },

  methods: {
    cancel() {
      localStorage[`completeAlarm-${this.userId}`] = Date.now()
      this.visible = false
    },
    gotoSettings() {
      const name = 'SystemNotice'
      this.visible = false
      localStorage[`completeAlarm-${this.userId}`] = Date.now()
      this.$router.push({ name }).then(() => {
        let driverObj = driver()
        const destroy = () => {
          driverObj?.destroy()
          driverObj = null
        }
        driverObj.highlight({
          element: '#alarm-settings',
          onHighlightStarted: (element, step, options) => {
            element.addEventListener('click', destroy)
          },
          onDeselected: (element, step, options) => {
            element.removeEventListener('click', destroy)
          },
          popover: {
            description: '点击此处设置任务告警'
          }
        })

        const unwatch = this.$watch('$route', () => {
          destroy()
          unwatch()
        })
      })
    },

    gotoBindEmail() {
      this.visible = false
      this.$router.push({
        name: 'userCenter',
        query: {
          bind: 'email'
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.alert-primary {
  background: #e8f3ff;
}
</style>
