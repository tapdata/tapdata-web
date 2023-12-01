<template>
  <ElDialog
    v-model="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="tour-dialog"
  >
    <template #header>
      <div v-if="!finish" class="text-center title-cover">
        <ElImage :src="require('@/assets/image/tour-cover.png')"></ElImage>
      </div>
      <div v-else class="text-center title-cover pt-4">🎉</div>
    </template>

    <div v-if="!finish" class="lh-base font-color-dark text-center mt-n4">
      <h1 class="fs-5 fw-sub font-color-dark mb-2">Welcome to Tapdata Cloud.</h1>
      <p class="lh-base">{{ $t('dfs_replication_tour_dialog_desc') }}</p>

      <p class="text-primary fw-sub my-2">
        {{ $t('dfs_replication_tour_dialog_steps') }}
      </p>
      <p>{{ $t('dfs_replication_tour_dialog_lets_go') }}</p>
    </div>
    <div v-else class="lh-base font-color-dark text-center mt-n4">
      <h1 class="fs-5 fw-sub font-color-dark mb-2">
        {{ $t('dfs_replication_tour_dialog_success_title') }}
      </h1>
    </div>

    <template #footer>
      <div v-if="!finish" class="text-center">
        <el-button @click="$emit('start')" type="primary">{{ $t('dfs_replication_tour_dialog_start') }}</el-button>
      </div>
      <div v-else class="text-center">
        <el-button @click="$emit('finish')" type="primary">{{ $t('dfs_replication_tour_dialog_finish') }}</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import i18n from '@/i18n'

import { driver } from 'driver.js'

export default {
  name: 'ReplicationTour',
  props: {
    value: Boolean,
    finish: Boolean,
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
  emits: ['start', 'finish', 'update:value', 'finish', , 'update:value'],
}
</script>

<style lang="scss" scoped>
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
}
</style>
