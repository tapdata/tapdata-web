<template>
  <section class="flex flex-1 flex-column ml-4 mr-4">
    <header class="mb-4 mt-4">任务告警设置</header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template slot="systemNotify" slot-scope="scope">
        <el-switch v-model="scope.row.systemNotify"></el-switch>
      </template>
      <template slot="emailNotify" slot-scope="scope">
        <el-switch v-model="scope.row.emailNotify"></el-switch>
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
          prop: 'key'
        },
        {
          label: '系统通知',
          prop: 'systemNotify',
          slotName: 'systemNotify'
        },
        {
          label: '邮件通知',
          prop: 'emailNotify',
          slotName: 'emailNotify'
        },
        {
          label: '发送间隔',
          prop: 'interval',
          slotName: 'interval'
        }
      ],
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
