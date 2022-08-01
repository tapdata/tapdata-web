<template>
  <TableList
    :data="taskList"
    :columns="columns"
    :remote-data="id"
    height="100%"
    :has-pagination="false"
    ref="tableList"
  >
    <template slot="status" slot-scope="scope">
      <StatusTag type="text" target="shareCdc" :status="scope.row.status" only-img></StatusTag>
    </template>
    <template slot="operation" slot-scope="scope">
      <div class="operate-columns">
        <ElButton size="mini" type="text" @click="goShareCdcInfo(scope.row.id)">{{ $t('task_info_info') }}</ElButton>
      </div>
    </template>
  </TableList>
</template>

<script>
import { logcollectorApi } from '@tap/api'
import { TableList } from '@tap/component'
import { StatusTag } from '@tap/business'

export default {
  name: 'ShareMining',
  components: { TableList, StatusTag },
  props: {
    id: String
  },
  data() {
    return {
      operations: ['preview'],
      taskList: [],
      columns: [
        {
          label: this.$t('share_task_table_name'),
          prop: 'name'
        },
        {
          label: this.$t('share_task_table_time'),
          slotName: 'sourceTimestamp'
        },
        {
          label: this.$t('share_task_table_status'),
          slotName: 'status'
        },
        {
          label: this.$t('column_operation'),
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
      logcollectorApi.bySubTaskId(id).then(data => {
        this.taskList = data || []
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
