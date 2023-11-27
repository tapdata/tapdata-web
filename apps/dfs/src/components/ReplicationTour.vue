<template>
  <ElDialog
    :visible.sync="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :custom-class="customClass"
  >
    <template v-if="!finish">
      <div class="text-center title-cover" slot="title">
        <ElImage :src="require('@/assets/image/tour-cover.png')"></ElImage>
      </div>

      <div class="lh-base font-color-dark text-center mt-n4">
        <h1 class="fs-5 fw-sub font-color-dark mb-2">Welcome to Tapdata Cloud.</h1>
        <p class="lh-base">{{ $t('dfs_replication_tour_dialog_desc') }}</p>

        <p class="text-primary fw-sub my-2">{{ $t('dfs_replication_tour_dialog_steps') }}</p>
        <p>{{ $t('dfs_replication_tour_dialog_lets_go') }}</p>
      </div>

      <div slot="footer" class="text-center">
        <el-button @click="$emit('start')" type="primary">{{ $t('dfs_replication_tour_dialog_start') }}</el-button>
      </div>
    </template>

    <template v-else>
      <div class="text-center font-color-dark">
        <VIcon size="64" class="color-success mt-3">check-circle-fill</VIcon>
        <div class="mt-4 fs-5 color-primary">{{ $t('dfs_replication_tour_dialog_finished') }}</div>
        <div class="mt-2">{{ $t('dfs_replication_tour_dialog_finished_subtitle') }}</div>
        <div class="mt-12 fw-sub">{{ $t('dfs_replication_tour_dialog_finished_survey_title') }}</div>
        <ElRadioGroup v-model="continueUse" class="inline-flex gap-4 mt-4">
          <ElRadio label="yes" class="m-0 bg-white" border>{{ $t('public_yes') }}</ElRadio>
          <ElRadio label="no" class="m-0 bg-white" border>{{ $t('public_no') }}</ElRadio>
        </ElRadioGroup>
        <div class="px-6 mt-4">
          <ElInput
            v-model="suggestion"
            type="textarea"
            :placeholder="$t('dfs_replication_tour_dialog_finished_survey_placeholder')"
            :rows="2"
            :maxlength="200"
            show-word-limit
          ></ElInput>
        </div>
      </div>

      <div slot="footer" class="text-center">
        <el-button @click="handleDone" type="primary">{{ $t('dfs_replication_tour_dialog_finish') }}</el-button>
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

      const { expand } = this.$store.state.guide

      Object.assign(expand, { continueUse: this.continueUse, suggestion: this.suggestion })

      this.$axios.post('api/tcm/user_guide', {
        expand
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
