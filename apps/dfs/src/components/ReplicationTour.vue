<template>
  <ElDialog
    :visible.sync="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :custom-class="customClass"
  >
    <div class="text-center font-color-dark">
      <VIcon size="64" class="color-success mt-3">check-circle-fill</VIcon>
      <div class="mt-4 fs-5 color-primary">{{ $t('packages_dag_tour_task_success') }}</div>
      <div class="mt-2">{{ $t('packages_dag_tour_task_success_desc') }}</div>
    </div>

    <template #footer>
      <div class="text-center">
        <el-button @click="cancel">{{ $t('public_button_close') }}</el-button>
        <el-button @click="handleDone" type="primary">{{ $t('packages_dag_access_task_list') }}</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script>
import i18n from '@/i18n'

import { driver } from 'driver.js'

export default {
  name: 'ReplicationTour',
  props: {
    value: Boolean,
    finish: Boolean
  },

  data() {
    return {
      visible: this.value,
      continueUse: '',
      suggestion: ''
    }
  },

  computed: {
    userId() {
      return this.$store.state.user.id
    },
    noEmail() {
      return !this.$store.state.user.email
    },
    customClass() {
      if (this.finish) {
        return 'tour-dialog is-finish'
      }
      return 'tour-dialog'
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
            description: i18n.t('dfs_components_taskalarmtour_dianjicichushe')
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
    },

    handleDone() {
      this.$emit('finish')
      this.$router.push({
        name: 'migrateList'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.title-cover {
  font-size: 104px;
}
</style>

<style lang="scss">
.tour-dialog {
  overflow: hidden;
  .el-dialog__header {
    padding: 0;
  }

  &.is-finish {
    background-image: url('../assets/image/teaching_completion_bg.png');
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
