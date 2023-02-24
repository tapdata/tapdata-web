<template>
  <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
    <header class="flex justify-content-between mb-4 mt-4">
      <div>{{ $t('daas_setting_alarmnotification_renwugaojingshe') }}</div>
      <div class="color-primary cursor-pointer" @click="showAlarmRlues">
        {{ $t('daas_setting_alarmnotification_morengaojinggui') }}
      </div>
    </header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template v-slot:key="scope">
        <span>{{ keyMapping[scope.row.key] }}</span>
      </template>
      <template v-slot:notify="scope">
        <div class="flex">
          <el-switch style="margin-right: 80px" v-model:value="scope.row.open"></el-switch>
          <el-checkbox-group v-model:value="scope.row.notify">
            <el-checkbox label="SYSTEM">{{ $t('notify_system_notice') }}</el-checkbox>
            <el-checkbox label="EMAIL">{{ $t('notify_email_notice') }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
      <template v-slot:interval="scope">
        <el-input-number :controls="false" style="width: 100px" v-model:value="scope.row.interval"></el-input-number>
        <el-select style="width: 100px" class="ml-2" v-model:value="scope.row.unit">
          <el-option :label="$t('task_info_ms')" value="MS"></el-option>
          <el-option :label="$t('dag_data_setting_second')" value="SECOND"></el-option>
          <el-option :label="$t('dataFlow_min')" value="MINUTE"></el-option>
          <el-option :label="$t('dag_data_setting_hour')" value="HOUR"></el-option>
          <el-option :label="$t('task_info_d')" value="DAY"></el-option>
          <el-option :label="$t('timeToLive_w')" value="WEEK"></el-option>
        </el-select>
      </template>
    </VTable>
    <footer class="flex justify-content-end mb-4">
      <el-button size="mini" @click="remoteMethod()">{{ $t('button_cancel') }}</el-button>
      <el-button size="mini" type="primary" @click="save()">{{ $t('button_save') }}</el-button>
    </footer>
    <el-dialog
      :title="$t('daas_setting_alarmnotification_renwumorengao')"
      width="70%"
      v-model:visible="alarmRulesVisible"
    >
      <div class="mb-4">
        {{ $t('daas_setting_alarmnotification_cichugaojinggui') }}
      </div>
      <VTable ref="table" class="table-list" :data="alarmData" :columns="alarmRulesColumns" :hasPagination="false">
        <template v-slot:keySlot="scope">
          <span>{{ keyMapping[scope.row.key] }}</span>
        </template>
        <template v-slot:valueSlot="scope">
          <span class="mr-2">{{ $t('daas_setting_alarmnotification_lianxu') }}</span>
          <el-input-number :controls="false" style="width: 100px" v-model:value="scope.row.point"></el-input-number>
          <span class="ml-2 mr-2"> {{ $t('daas_setting_alarmnotification_gedian') }}</span>
          <el-select style="width: 100px" class="mr-2" v-model:value="scope.row.equalsFlag">
            <el-option label=">=" :value="1"></el-option>
            <el-option label="<=" :value="-1"></el-option>
          </el-select>
          <el-input-number :controls="false" v-model:value="scope.row.ms" style="width: 80px"></el-input-number>
          <span class="ml-2">{{ $t('daas_setting_alarmnotification_msshigaojing') }}</span>
        </template>
      </VTable>
      <footer class="flex justify-content-end mt-4">
        <el-button size="mini" @click="alarmRulesVisible = false">{{ $t('button_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="saveAlarmRules()">{{ $t('button_save') }}</el-button>
      </footer>
    </el-dialog>
  </section>
</template>

<script>
import i18n from '@/i18n'

import { VTable } from '@tap/component'
import { alarmRuleApi, settingsApi } from '@tap/api'
export default {
  name: 'AlarmNotification',
  components: { VTable },
  data() {
    return {
      columns: [
        {
          label: i18n.t('module_form_describtion'),
          slotName: 'key'
        },
        {
          label: i18n.t('daas_notification_alarmnotification_gaojingtongzhi'),
          prop: 'notify',
          slotName: 'notify'
        },
        {
          label: i18n.t('notify_noticeInterval'),
          prop: 'interval',
          slotName: 'interval'
        }
      ],
      keyMapping: {
        TASK_STATUS_ERROR: i18n.t('daas_setting_alarmnotification_dangrenwuyudao'),
        TASK_INSPECT_ERROR: i18n.t('daas_setting_alarmnotification_dangrenwujiaoyan'),
        TASK_FULL_COMPLETE: i18n.t('daas_setting_alarmnotification_dangrenwuquanliang'),
        TASK_INCREMENT_START: i18n.t('daas_setting_alarmnotification_dangrenwuzengliang'),
        TASK_STATUS_STOP: i18n.t('daas_setting_alarmnotification_dangrenwutingzhi'),
        TASK_INCREMENT_DELAY: i18n.t('daas_setting_alarmnotification_dangrenwudezeng'),
        DATANODE_CANNOT_CONNECT: i18n.t('daas_setting_alarmnotification_dangshujuwufa'),
        DATANODE_HTTP_CONNECT_CONSUME: i18n.t('daas_setting_alarmnotification_dangshujuyuanwang'),
        DATANODE_TCP_CONNECT_CONSUME: i18n.t('daas_setting_alarmnotification_dangshujuyuanxie'),
        DATANODE_AVERAGE_HANDLE_CONSUME: i18n.t('daas_setting_alarmnotification_dangshujuyuanjie'),
        PROCESSNODE_AVERAGE_HANDLE_CONSUME: i18n.t('daas_setting_alarmnotification_dangjiediandeping'),
        SYSTEM_FLOW_EGINGE_DOWN: i18n.t('daas_setting_alarmnotification_dangrenwustop')
      },
      alarmRulesColumns: [
        {
          label: i18n.t('daas_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'keySlot'
        },
        {
          label: i18n.t('daas_setting_alarmnotification_gaojingzhibiao'),
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
        this.$message.success(i18n.t('message_save_ok'))
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
        this.alarmRulesVisible = false
        this.$message.success(this.$t('message_save_ok'))
      })
    }
  }
}
</script>
