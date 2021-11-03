<template>
  <div>
    <TableList
      empty-text="此任务尚未启动或已被重置，暂无运行里程碑数据"
      :data="milestoneList"
      :columns="milestoneColumns"
      height="100%"
      fit
      class="mt-6"
      :has-pagination="false"
    >
      <template slot="status" slot-scope="scope">
        <StatusTag type="text" target="milestone" :status="getMilestoneStatus(scope.row.status)" only-img></StatusTag>
      </template>
    </TableList>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import TableList from '@/components/TableList'

export default {
  name: 'Milestone',
  components: { StatusTag, TableList },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      milestoneColumns: [
        {
          label: '里程碑',
          prop: 'label'
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
      let list = this.task?.milestones || []
      return list.map(m => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
        return {
          label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage,
          tipDisabled: true
        }
      })
    }
  },
  methods: {
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    }
  }
}
</script>
