<template>
  <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
    <header class="mb-4 mt-4">任务告警设置</header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template slot="key" slot-scope="scope">
        <span>{{ keyMapping[scope.row.key] }}</span>
      </template>
      <template slot="notify" slot-scope="scope">
        <div class="flex">
          <el-switch class="mr-4" v-model="scope.row.open"></el-switch>
          <el-checkbox-group v-model="scope.row.notify">
            <el-checkbox label="SYSTEM">系统通知</el-checkbox>
            <el-checkbox label="EMAIL">邮件通知</el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
      <template slot="interval" slot-scope="scope">
        <el-input-number :controls="false" style="width: 100px" v-model="scope.row.interval"></el-input-number>
        <el-select style="width: 100px" class="ml-2" v-model="scope.row.unit">
          <el-option label="毫秒" value="MS"></el-option>
          <el-option label="秒" value="SECOND"></el-option>
          <el-option label="分" value="MINUTE"></el-option>
          <el-option label="小时" value="HOUR"></el-option>
          <el-option label="天" value="DAY"></el-option>
          <el-option label="周" value="WEEK"></el-option>
        </el-select>
      </template>
    </VTable>
    <footer class="flex justify-content-end mb-4">
      <el-button size="mini" @click="remoteMethod()">取消</el-button>
      <el-button size="mini" type="primary" @click="save()">保存</el-button>
    </footer>
  </section>
</template>

<script>
import { VTable } from '@tap/component'
import { settingsApi } from '@tap/api'
export default {
  name: 'AlarmNotification',
  components: { VTable },
  data() {
    return {
      columns: [
        {
          label: '描述',
          slotName: 'key'
        },
        {
          label: '告警通知',
          prop: 'notify',
          slotName: 'notify'
        },
        {
          label: '发送间隔',
          prop: 'interval',
          slotName: 'interval'
        }
      ],
      keyMapping: {
        TASK_STATUS_ERROR: '当任务遇到错误时',
        TASK_INSPECT_ERROR: '当任务校验出错时',
        TASK_FULL_COMPLETE: '当任务全量完成时',
        TASK_INCREMENT_COMPLETE: '当任务增量完成时',
        TASK_STATUS_STOP: '当任务停止时',
        TASK_INCREMENT_DELAY: '当任务的增量延迟',
        DATANODE_CANNOT_CONNECT: '当数据无法网路连接耗时',
        DATANODE_HTTP_CONNECT_CONSUME: '当数据源网路连接耗时',
        DATANODE_TCP_CONNECT_CONSUME: '当数据源协议连接耗时',
        DATANODE_AVERAGE_HANDLE_CONSUME: '当数据源节点的平均处理耗时',
        PROCESSNODE_AVERAGE_HANDLE_CONSUME: '当节点的平均处理耗时'
      },
      tableData: []
    }
  },
  mounted() {
    this.remoteMethod()
  },
  methods: {
    remoteMethod() {
      settingsApi.findAlarm().then(data => {
        this.tableData = data
      })
    },
    save() {
      settingsApi.saveAlarm(this.tableData).then(() => {
        this.$message.success('保存成功')
      })
    }
  }
}
</script>

<style scoped></style>
