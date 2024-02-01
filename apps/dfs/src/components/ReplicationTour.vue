<template>
  <ElDialog
    v-model="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :class="customClass"
  >
    <template v-if="!finish" #header>
      <div class="text-center title-cover">
        <ElImage :src="require('@/assets/image/tour-cover.png')"></ElImage>
      </div>
    </template>

    <div v-if="!finish" class="lh-base font-color-dark text-center">
      <h1 class="fs-5 fw-sub font-color-dark mb-2">Welcome to Tapdata Cloud.</h1>
      <p class="lh-base">{{ $t('dfs_replication_tour_dialog_desc') }}</p>

      <p class="text-primary fw-sub my-2">{{ $t('dfs_replication_tour_dialog_steps') }}</p>
      <p>{{ $t('dfs_replication_tour_dialog_lets_go') }}</p>
    </div>
    <div v-else class="text-center font-color-dark">
      <VIcon size="64" class="color-success mt-10">check-circle-fill</VIcon>
      <div class="mt-4 fs-5 color-primary">{{ $t('dfs_replication_tour_dialog_finished') }}</div>
      <div class="mt-2">{{ $t('dfs_replication_tour_dialog_finished_subtitle') }}</div>
      <div class="mt-12 fw-sub">{{ $t('dfs_replication_tour_dialog_finished_survey_title') }}</div>
      <ElRadioGroup v-model="continueUse" class="flex flex-column gap-2 mt-4 text-start px-10 align-items-stretch">
        <ElRadio label="yes" class="m-0 bg-white" border>{{
          $t('dfs_replication_tour_dialog_finished_option_yes')
        }}</ElRadio>
        <ElRadio label="no_plan_no_sure" class="m-0 bg-white" border>{{
          $t('dfs_replication_tour_dialog_finished_option_no_plan_1')
        }}</ElRadio>
        <ElRadio label="no_plan_no_project" class="m-0 bg-white" border>{{
          $t('dfs_replication_tour_dialog_finished_option_no_plan_2')
        }}</ElRadio>
        <ElRadio label="no_plan_data_security" class="m-0 bg-white" border>{{
          $t('dfs_replication_tour_dialog_finished_option_no_plan_3')
        }}</ElRadio>
        <ElRadio label="other" class="m-0 bg-white" border>{{
          $t('dfs_replication_tour_dialog_finished_option_other')
        }}</ElRadio>
      </ElRadioGroup>
      <div class="px-10 mt-2" v-if="continueUse === 'other'">
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

    <template #footer>
      <div v-if="!finish" class="text-center">
        <el-button @click="$emit('start')" type="primary">{{ $t('dfs_replication_tour_dialog_start') }}</el-button>
      </div>
      <div v-else class="text-center">
        <el-button key="doneBtn" :disabled="!continueUse" @click="handleDone" type="primary">{{
          $t('dfs_replication_tour_dialog_finish')
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
  name: 'ReplicationTour',
  props: {
    value: Boolean,
    finish: Boolean,
  },
  data() {
    return {
      visible: this.value,
      continueUse: '',
      suggestion: '',
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

    handleDone() {
      this.$emit('finish')

      const { expand } = this.$store.state.guide

      Object.assign(expand, { continueUse: this.continueUse, suggestion: this.suggestion })

      this.$axios.post('api/tcm/user_guide', {
        expand,
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
    padding: 0 !important;
    margin-right: 0;
  }

  .el-dialog__body {
    padding: 0 !important;
  }

  &.is-finish {
    background-image: url('../assets/image/teaching_completion_bg.png');
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
