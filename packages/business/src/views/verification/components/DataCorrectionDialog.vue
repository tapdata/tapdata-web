<template>
  <ElDialog
    :model-value="visible"
    @open="onOpen"
    @update:visible="$emit('update:visible', $event)"
    :title="$t('packages_business_confirmExecuteDataRepair')"
    width="520px"
    custom-class="pro-dialog"
  >
    <div>
      <div>
        <div class="grid-list align-center" v-loading="loading">
          <div class="grid-list-item-title font-color-dark">{{ $t('packages_business_checkTaskInfo') }}</div>

          <span class="grid-list-item-label font-color-sslight">{{ $t('packages_business_taskName') }}</span>
          <span class="grid-list-item-content font-color-dark">{{ inspectRecoveryVerifyData.flowName }}</span>

          <span class="grid-list-item-label font-color-sslight">{{ $t('packages_business_taskStatus') }}</span>
          <span class="grid-list-item-content font-color-dark">
            <TaskStatus :task="inspectRecoveryVerifyData"></TaskStatus>
          </span>

          <span class="grid-list-item-label font-color-sslight">{{
            $t('packages_business_task_monitor_mission_milestone')
          }}</span>
          <span class="grid-list-item-content font-color-dark">
            <SyncStatus :status="inspectRecoveryVerifyData.flowMilestoneStage" />
          </span>

          <span
            class="grid-list-item-label font-color-sslight"
            :class="{
              'color-warning': delayWarning,
            }"
            >{{ $t('packages_business_taskIncrementDelay') }}</span
          >
          <span
            class="grid-list-item-content font-color-dark"
            :class="{
              'color-warning': delayWarning,
            }"
            >{{ replicateLag }}</span
          >

          <div class="grid-list-item-title font-color-dark">
            <span>{{ $t('packages_business_checkDetails') }}</span>
          </div>

          <span class="grid-list-item-label font-color-sslight">{{ $t('packages_business_diffThreshold') }}</span>
          <span class="grid-list-item-content font-color-dark">{{ inspectRecoveryVerifyData.diffLimit }}</span>

          <span
            class="grid-list-item-label font-color-sslight"
            :class="{
              'color-warning': diffWarning,
            }"
            >{{ $t('packages_business_diffTotal') }}</span
          >
          <span
            class="grid-list-item-content font-color-dark"
            :class="{
              'color-warning': diffWarning,
            }"
            >{{ inspectRecoveryVerifyData.diffTotals }}
          </span>

          <span class="grid-list-item-label font-color-sslight">{{ $t('packages_business_sourceOnly') }}</span>
          <span class="grid-list-item-content font-color-dark">{{ inspectRecoveryVerifyData.sourceOnly }}</span>
          <span class="grid-list-item-label font-color-sslight">{{ $t('packages_business_targetOnly') }}</span>
          <span class="grid-list-item-content font-color-dark">{{ inspectRecoveryVerifyData.targetOnly }}</span>

          <div v-if="diffWarning" class="grid-list-item-block">
            <el-alert :title="$t('packages_business_diffExceededAlert')" type="warning" show-icon :closable="false" />
          </div>

          <div class="grid-list-item-title font-color-dark">{{ $t('packages_business_correctionDetails') }}</div>

          <span class="grid-list-item-label font-color-sslight">{{
            $t('packages_business_correctionDataVolume')
          }}</span>
          <span class="grid-list-item-content font-color-dark">{{ inspectRecoveryVerifyData.recoveryDataTotals }}</span>

          <span class="grid-list-item-label font-color-sslight">{{
            $t('packages_business_correctionTableCount')
          }}</span>
          <span class="grid-list-item-content font-color-dark">{{
            inspectRecoveryVerifyData.recoveryTableTotals
          }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="$emit('update:visible', false)">{{ $t('public_button_cancel') }}</ElButton>
      <ElTooltip :disabled="!tipContent" :content="tipContent" placement="top">
        <ElButton :disabled="correctionDisabled" :loading="starting" type="primary" @click="handleStart">{{
          $t('packages_business_correction')
        }}</ElButton>
      </ElTooltip>
    </template>
  </ElDialog>
</template>

<script>
import { calcTimeUnit } from '@tap/shared'
import { inspectApi } from '@tap/api'
import TaskStatus from '../../../components/TaskStatus.vue'
import SyncStatus from '../../../components/SyncStatus'

export default {
  name: 'DataCorrectionDialog',
  components: { SyncStatus, TaskStatus },
  props: {
    visible: Boolean,
    inspectId: String,
  },
  data() {
    return {
      loading: false,
      starting: false,
      inspectRecoveryVerifyData: {
        status: '',
        inspectId: '',
        agentId: '',
        flowId: '',
        flowName: '',
        flowType: '',
        flowStatus: '',
        flowSyncStatus: '',
        flowMilestoneStage: '',
        flowDelay: null,
        diffLimit: null,
        diffTotals: null,
        recoveryDataTotals: null,
        recoveryTableTotals: null,
        canRecovery: true,
        errorCodes: [],
        sourceOnly: null,
        targetOnly: null,
      },
    }
  },

  computed: {
    delayWarning() {
      return this.inspectRecoveryVerifyData.flowDelay >= 60000
    },
    diffWarning() {
      return this.inspectRecoveryVerifyData.diffTotals > this.inspectRecoveryVerifyData.diffLimit
    },
    replicateLag() {
      const replicateLag = this.inspectRecoveryVerifyData.flowDelay

      return replicateLag != null
        ? calcTimeUnit(replicateLag, 2, {
            autoHideMs: true,
          })
        : '-'
    },
    correctionDisabled() {
      return (
        this.loading ||
        this.starting ||
        !this.inspectRecoveryVerifyData.canRecovery ||
        this.inspectRecoveryVerifyData.errorCodes.length > 0 ||
        !this.inspectRecoveryVerifyData.recoveryDataTotals
      )
    },
    tipContent() {
      if (!this.inspectRecoveryVerifyData.recoveryDataTotals) {
        return this.$t('packages_business_no_data_correction')
      }
      return null
    },
  },

  methods: {
    async onOpen() {
      this.loading = true
      const result = await inspectApi.getVerifyInfo(this.inspectId)
      this.loading = false

      result.status = result.flowStatus
      Object.assign(this.inspectRecoveryVerifyData, result)
    },
    async handleStart() {
      this.starting = true

      try {
        await inspectApi.startRecovery(this.inspectId)

        this.starting = false
        this.$message.success(this.$t('packages_business_correctionTaskStarted'))
        this.$emit('started')
      } catch (e) {
        console.error(e)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.grid-list {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 8px;

  &-item-block {
    grid-column: span 2;
  }

  .el-alert {
    max-width: max-content;
  }

  &-item-title {
    position: relative;
    padding-left: 12px;
    grid-column: span 2;
    font-size: 16px;
    $bar-width: 3px;

    &:not(:first-child) {
      margin-top: 8px;
    }

    &::before {
      content: '';
      width: $bar-width;
      border-radius: calc($bar-width / 2);
      left: 0;
      top: 0;
      bottom: 0;
      position: absolute;
      background-color: map.get($color, primary);
      //background-color: #bcbfc3;
    }
  }
}
</style>
