<template>
  <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
    <header class="flex justify-content-between mb-4 mt-4">
      <div>任务告警设置</div>
      <div class="color-primary cursor-pointer" @click="showAlarmRlues">默认告警规则</div>
    </header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template slot="key" slot-scope="scope">
        <span>{{ keyMapping[scope.row.key] }}</span>
      </template>
      <template slot="notify" slot-scope="scope">
        <div class="flex">
          <el-switch style="margin-right: 80px" v-model="scope.row.open"></el-switch>
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
    <el-dialog title="任务默认告警规则设置" width="70%" :visible.sync="alarmRulesVisible">
      <div class="mb-4">
        此处告警规则设置为系统全局告警规则设置，任务运行监控页面的告警规则设置优先级高于系统全局设置
      </div>
      <VTable ref="table" class="table-list" :data="alarmData" :columns="alarmRulesColumns" :hasPagination="false">
        <template slot="keySlot" slot-scope="scope">
          <span>{{ keyMapping[scope.row.key] }}</span>
        </template>
        <template slot="valueSlot" slot-scope="scope">
          <span class="mr-2">连续</span>
          <el-input-number :controls="false" style="width: 100px" v-model="scope.row.point"></el-input-number>
          <span class="ml-2 mr-2"> 个点</span>
          <el-select style="width: 100px" class="mr-2" v-model="scope.row.equalsFlag">
            <el-option label=">=" :value="1"></el-option>
            <el-option label="<=" :value="-1"></el-option>
          </el-select>
          <el-input-number :controls="false" v-model="scope.row.ms" style="width: 80px"></el-input-number>
          <span class="ml-2">ms时告警</span>
        </template>
      </VTable>
      <footer class="flex justify-content-end mt-4">
        <el-button size="mini" @click="alarmRulesVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="saveAlarmRules()">保存</el-button>
      </footer>
    </el-dialog>
  </section>
</template>

<script>
import { VTable } from '@tap/component'
import { alarmRuleApi, settingsApi } from '@tap/api'
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
      alarmRulesColumns: [
        {
          label: '告警指标',
          slotName: 'keySlot'
        },
        {
          label: '告警指标',
          slotName: 'valueSlot'
        }
      ],
      alarmRulesVisible: false,
      alarmData: [],
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
    },
    showAlarmRlues() {
      this.alarmRulesVisible = true
      this.getAlarmData()
    },
    //告警设置 单独请求接口 单独提交数据
    getAlarmData() {
      alarmRuleApi.find().then(data => {
        this.alarmData = data
      })
    },
    saveAlarmRules() {
      //告警设置单独保存
      alarmRuleApi.save(this.alarmData).then(() => {
        this.$message.success(this.$t('message_save_ok'))
      })
    }
  }
}
</script>

<style scoped></style>
