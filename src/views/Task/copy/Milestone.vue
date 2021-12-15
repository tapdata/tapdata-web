<template>
  <div class="milestone-container">
    <div class="inline-flex align-items-center fs-7 font-color-main fw-bolder cursor-pointer" @click="toggleFnc">
      <span>任务里程碑</span>
      <VIcon v-if="isFold" class="v-icon ml-1">arrow-right</VIcon>
      <VIcon v-else class="v-icon ml-1">arrow-down</VIcon>
    </div>
    <TableList
      empty-text="此任务尚未启动或已被重置，暂无运行里程碑数据"
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
        <StatusTag type="text" target="milestone" :status="getMilestoneStatus(scope.row.status)" only-img></StatusTag>
      </template>
    </TableList>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import TableList from '@/components/TableList'
import VIcon from '@/components/VIcon'

export default {
  name: 'Milestone',
  components: { StatusTag, TableList, VIcon },
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
          label: '里程碑',
          prop: 'label',
          slotName: 'label'
        },
        {
          label: '状态',
          prop: 'status',
          slotName: 'status',
          width: 100
        },
        {
          label: '时间',
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
      this.$confirm(msg, '错误', {
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
  color: map-get($fontColor, sub);
  transition: 0.6s;
}
.is-fold {
  height: 0 !important;
}
</style>
