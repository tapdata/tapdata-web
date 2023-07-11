<template>
  <ElDialog :visible.sync="visible" width="480px" :close-on-click-modal="false">
    <span slot="title" class="fs-6 fw-sub font-color-dark"> 设置告警通知，实时监控任务状态 </span>

    <div class="flex gap-4">
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
      <el-button @click="visible = false">{{ $t('public_button_cancel') }}</el-button>
      <el-button type="primary" @click="gotoSettings">去设置</el-button>
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

  watch: {
    visible(v) {
      this.$emit('input', v)
    },

    value(v) {
      this.visible = v
    }
  },

  methods: {
    gotoSettings() {
      const name = 'SystemNotice'
      this.visible = false
      this.$router.push({ name }).then(() => {
        let driverObj = driver()
        const destroy = () => {
          driverObj?.destroy()
          driverObj = null
        }
        driverObj.highlight({
          element: '#alarm-settings',
          onHighlightStarted: (element, step, options) => {
            console.log('onHighlightStarted') // eslint-disable-line
            element.addEventListener('click', destroy)
          },
          onDeselected: (element, step, options) => {
            console.log('onDeselected') // eslint-disable-line
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
    }
  }
}
</script>

<style scoped lang="scss"></style>
