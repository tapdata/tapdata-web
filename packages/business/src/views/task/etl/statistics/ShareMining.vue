<template>
  <TableList
    :data="taskList"
    :columns="columns"
    :remote-data="id"
    height="100%"
    :has-pagination="false"
    ref="tableList"
  >
    <template #status="{ row }">
      <TaskStatus :task="row" />
    </template>
    <template slot="operation" slot-scope="scope">
      <div class="operate-columns">
        <ElButton size="mini" type="text" @click="goShareCdcInfo(scope.row.id)">{{ $t('packages_business_task_info_info') }}</ElButton>
      </div>
    </template>
  </TableList>
</template>

<script>
import { logcollectorApi } from '@tap/api'
import { TableList } from '@tap/component'

import { makeStatusAndDisabled } from '../../../../shared'
import { TaskStatus } from '../../../../components'

export default {
  name: 'ShareMining',
  components: { TableList, TaskStatus },
  props: {
    id: String
  },
  data() {
    return {
      operations: ['preview'],
      taskList: [],
      columns: [
        {
          label: this.$t('packages_business_share_task_table_name'),
          prop: 'name'
        },
        {
          label: this.$t('packages_business_share_task_table_time'),
          slotName: 'sourceTimestamp'
        },
        {
          label: this.$t('packages_business_share_task_table_status'),
          slotName: 'status'
        },
        {
          label: this.$t('packages_business_column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ]
    }
  },
  mounted() {
    this.getData(this.id)
  },
  methods: {
    getData(id) {
      logcollectorApi.byTaskId(id).then(data => {
        this.taskList = (data || []).map(makeStatusAndDisabled)
      })
    },
    goShareCdcInfo(id) {
      this.$router.push({
        name: 'SharedMiningDetails',
        params: {
          id: id
        }
      })
    }
  }
}
</script>

<style scoped></style>
