<template>
  <ElDialog v-model:visible="visible" width="480px" :close-on-click-modal="false" @close="cancel">
    <template #header>
      <span class="fs-6 fw-sub font-color-dark">{{ $t('dfs_alarm_setting_tour_title') }}</span>
    </template>

    <el-alert
      v-if="noEmail"
      class="alert-primary text-primary mb-4"
      type="info"
      :title="$t('dfs_components_taskalarmtour_jiancedaoninwei')"
      show-icon
      :closable="false"
    />
    <div class="flex gap-4 justify-content-between">
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24" class="text-primary">email</VIcon>
        <span>{{ $t('notify_email_notification').replace(' Notification', '') }}</span>
      </div>
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24" class="text-primary">sms</VIcon>
        <span>{{ $t('notify_sms_notification').replace(' Notification', '') }}</span>
      </div>
      <div class="rounded-4 bg-secondary-100 px-4 py-2 flex align-center gap-2">
        <VIcon size="24">wechat</VIcon>
        <span>{{ $t('notify_webchat_notification').replace(' Notification', '') }}</span>
      </div>
    </div>

    <template v-slot:footer>
      <div>
        <el-button @click="cancel">{{ $t('public_button_cancel') }}</el-button>
        <el-button v-if="noEmail" type="primary" @click="gotoBindEmail">{{
          $t('operation_log_List_bangDingYouXiang')
        }}</el-button>
        <el-button v-else type="primary" @click="gotoSettings">{{
          $t('dfs_components_taskalarmtour_qushezhi')
        }}</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import i18n from '@/i18n'

import { driver } from 'driver.js'

export default {
  name: 'TaskAlarmTour',
  props: {
    value: Boolean,
  },
  data() {
    return {
      visible: this.value,
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.id
    },
    noEmail() {
      return !this.$store.state.user.email
    },
  },
  watch: {
    visible(v) {
      $emit(this, 'update:value', v)
    },

    value(v) {
      this.visible = v
    },
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
            description: i18n.t('dfs_components_taskalarmtour_dianjicichushe'),
          },
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
          bind: 'email',
        },
      })
    },
  },
  emits: ['update:value'],
}
</script>

<style lang="scss" scoped>
.alert-primary {
  background: #e8f3ff;
}
</style>
