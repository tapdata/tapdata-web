<template>
  <div class="milestone-container">
    <div class="inline-flex align-items-center fs-7 font-color-dark fw-bolder cursor-pointer" @click="toggleFnc">
      <span>{{ $t('task_monitor_mission_milestone') }}</span>
      <VIcon v-if="isFold" class="v-icon ml-1">arrow-right</VIcon>
      <VIcon v-else class="v-icon ml-1">arrow-down</VIcon>
    </div>
    <TableList
      :empty-text="$t('task_monitor_no_milestone_data')"
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
          {{ $t('milestone.btn_check_error') }}
        </ElButton>
      </template>
      <template slot="status" slot-scope="scope">
        <span :class="['status-' + scope.row.status, 'fs-8', 'px-2', 'py-1', 'rounded-md']">
          {{ $t('milestone_list_status_' + scope.row.status) }}
        </span>

        <!-- <StatusTag type="text" target="milestone" :status="getMilestoneStatus(scope.row.status)"></StatusTag> -->
      </template>
    </TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import VIcon from '@/components/VIcon'

export default {
  name: 'Milestone',
  components: { TableList, VIcon },
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
          label: this.$t('task_info_milestone'),
          prop: 'label',
          slotName: 'label'
        },
        {
          label: this.$t('task_monitor_status'),
          prop: 'status',
          slotName: 'status',
          width: 100
        },
        {
          label: this.$t('task_monitor_time'),
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
      if (['draft', 'paused', 'error'].includes(this.taskStatus) && status === 'running') {
        result = 'paused'
      }
      return result
    },
    checkError(msg) {
      this.$confirm(msg, this.$t('task_info_error'), {
        type: 'warning',
        width: '850px'
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
