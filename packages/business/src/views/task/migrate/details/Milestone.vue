<template>
  <div class="milestone-container">
    <div class="inline-flex align-items-center fs-7 font-color-dark cursor-pointer" @click="toggleFnc">
      <span>{{ $t('packages_business_task_monitor_mission_milestone') }}</span>
      <VIcon v-if="isFold" class="v-icon ml-1">arrow-right</VIcon>
      <VIcon v-else class="v-icon ml-1">arrow-down</VIcon>
    </div>
    <VTable
      :empty-text="$t('packages_business_task_monitor_no_milestone_data')"
      :data="milestoneList"
      :columns="milestoneColumns"
      max-height="300"
      fit
      :class="[{ 'is-fold': isFold }, { unfold: !isFold }]"
      hide-on-single-page
    >
      <template slot="label" slot-scope="scope">
        <span>{{ scope.row.label }}</span>
        <ElButton
          v-if="scope.row.status === 'error'"
          class="ml-2"
          size="mini"
          type="text"
          @click="checkError(scope.row.errorMessage)"
        >
          {{ $t('packages_business_milestone_btn_check_error') }}
        </ElButton>
      </template>
      <template slot="status" slot-scope="scope">
        <span :class="['status-' + scope.row.status, 'fs-8', 'px-2', 'py-1', 'rounded-md']">
          {{ $t('packages_business_milestone_list_status_' + getMilestoneStatus(scope.row.status)) }}
        </span>

        <!-- <StatusTag type="text" target="milestone" :status="getMilestoneStatus(scope.row.status)"></StatusTag> -->
      </template>
    </VTable>
  </div>
</template>

<script>
import { VIcon, VTable } from '@tap/component'

export default {
  name: 'Milestone',
  components: { VTable, VIcon },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    taskStatus: {
      type: String,
      default: ''
    },
    fold: {
      type: Boolean,
      default: true // 默认折叠
    }
  },
  data() {
    return {
      isFold: this.fold,
      milestoneColumns: [
        {
          label: this.$t('packages_business_task_info_milestone'),
          prop: 'label',
          slotName: 'label'
        },
        {
          label: this.$t('packages_business_task_monitor_status'),
          prop: 'status',
          slotName: 'status',
          width: 100
        },
        {
          label: this.$t('packages_business_task_monitor_time'),
          prop: 'fromNow',
          width: 160
        }
      ]
    }
  },
  computed: {
    milestoneList() {
      return this.list || []
    }
  },
  methods: {
    getMilestoneStatus(status) {
      let result = status
      if (['edit', 'stop', 'error'].includes(this.taskStatus) && status === 'running') {
        result = 'paused'
      }
      return result
    },
    checkError(msg) {
      this.$confirm(msg, this.$t('public_status_error'), {
        type: 'warning',
        width: '850px',
        customClass: 'milestone-check-error-container'
      })
    },
    toggleFnc() {
      this.isFold = !this.isFold
    }
  }
}
</script>

<style lang="scss" scoped>
.table-list {
  transition: 0.3s;
  &:not(.is-fold) {
    margin-top: 20px;
  }
}
.v-icon {
  color: map-get($fontColor, slight);
  transition: 0.6s;
}
.is-fold {
  height: 0 !important;
}
</style>

<style lang="scss">
.milestone-check-error-container {
  display: inline-flex !important;
  flex-direction: column;
  max-height: 80vh;
  .el-message-box__content {
    flex: 1;
    overflow: auto;
  }
}
</style>
