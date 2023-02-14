<template>
  <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
    <header class="flex justify-content-between mb-4 mt-4">
      <div>{{ $t('packages_business_setting_alarmnotification_renwugaojingshe') }}</div>
      <div class="color-primary cursor-pointer" @click="showAlarmRlues">
        {{ $t('packages_business_setting_alarmnotification_morengaojinggui') }}
      </div>
    </header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template slot="key" slot-scope="scope">
        <span>{{ keyMapping[scope.row.key] }}</span>
      </template>
      <template slot="notify" slot-scope="scope">
        <div class="flex">
          <el-switch style="margin-right: 20px" v-model="scope.row.open"></el-switch>
          <el-checkbox-group v-model="scope.row.notify">
            <el-checkbox label="SYSTEM">{{ $t('packages_business_notify_system_notice') }}</el-checkbox>
            <el-checkbox label="EMAIL">{{ $t('packages_business_notify_email_notification') }}</el-checkbox>
            <el-checkbox label="WECHAT" v-if="!isDaas">{{
              $t('packages_business_notify_webchat_notification')
            }}</el-checkbox>
            <el-checkbox label="SMS" v-if="!isDaas">{{ $t('packages_business_notify_sms_notification') }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
      <template slot="interval" slot-scope="scope">
        <el-input-number :controls="false" style="width: 100px" v-model="scope.row.interval"></el-input-number>
        <el-select style="width: 100px" class="ml-2" v-model="scope.row.unit">
          <el-option :label="$t('packages_business_task_info_ms')" value="MS"></el-option>
          <el-option :label="$t('packages_business_task_info_s')" value="SECOND"></el-option>
          <el-option :label="$t('packages_business_task_info_m')" value="MINUTE"></el-option>
          <el-option :label="$t('packages_business_task_info_h')" value="HOUR"></el-option>
          <el-option :label="$t('packages_business_task_info_d')" value="DAY"></el-option>
          <el-option :label="$t('packages_business_task_info_w')" value="WEEK"></el-option>
        </el-select>
      </template>
    </VTable>
    <footer class="flex justify-content-end mb-4">
      <el-button size="mini" @click="remoteMethod()">{{ $t('button_cancel') }}</el-button>
      <el-button size="mini" type="primary" @click="save()">{{ $t('button_save') }}</el-button>
    </footer>
    <el-dialog
      :title="$t('packages_business_setting_alarmnotification_renwumorengao')"
      width="70%"
      append-to-body
      :visible.sync="alarmRulesVisible"
    >
      <div class="mb-4">{{ $t('packages_business_setting_alarmnotification_cichugaojinggui') }}</div>
      <VTable ref="table" class="table-list" :data="alarmData" :columns="alarmRulesColumns" :hasPagination="false">
        <template slot="keySlot" slot-scope="scope">
          <span>{{ keyMapping[scope.row.key] }}</span>
        </template>
        <template slot="valueSlot" slot-scope="scope">
          <span class="mr-2">{{ $t('packages_business_setting_alarmnotification_lianxu') }}</span>
          <el-input-number :controls="false" style="width: 100px" v-model="scope.row.point"></el-input-number>
          <span class="ml-2 mr-2"> {{ $t('packages_business_setting_alarmnotification_gedian') }}</span>
          <el-select style="width: 100px" class="mr-2" v-model="scope.row.equalsFlag">
            <el-option label=">=" :value="1"></el-option>
            <el-option label="<=" :value="-1"></el-option>
          </el-select>
          <el-input-number :controls="false" v-model="scope.row.ms" style="width: 80px"></el-input-number>
          <span class="ml-2">{{ $t('packages_business_setting_alarmnotification_msshigaojing') }}</span>
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
          label: i18n.t('packages_business_setting_alarm_notification_describtion'),
          slotName: 'key'
        },
        {
          label: i18n.t('packages_business_setting_notification_alarm_notification_gaojingtongzhi'),
          prop: 'notify',
          slotName: 'notify'
        },
        {
          label: i18n.t('packages_business_setting_alarm_notification_notify_noticeInterval'),
          prop: 'interval',
          slotName: 'interval'
        }
      ],
      keyMapping: {
        TASK_STATUS_ERROR: i18n.t('packages_business_setting_alarmnotification_dangrenwuyudao'),
        TASK_INSPECT_ERROR: i18n.t('packages_business_setting_alarmnotification_dangrenwujiaoyan'),
        TASK_FULL_COMPLETE: i18n.t('packages_business_setting_alarmnotification_dangrenwuquanliang'),
        TASK_INCREMENT_START: i18n.t('packages_business_setting_alarmnotification_dangrenwuzengliang'),
        TASK_STATUS_STOP: i18n.t('packages_business_setting_alarmnotification_dangrenwutingzhi'),
        TASK_INCREMENT_DELAY: i18n.t('packages_business_setting_alarmnotification_dangrenwudezeng'),
        DATANODE_CANNOT_CONNECT: i18n.t('packages_business_setting_alarmnotification_dangshujuwufa'),
        DATANODE_HTTP_CONNECT_CONSUME: i18n.t('packages_business_setting_alarmnotification_dangshujuyuanwang'),
        DATANODE_TCP_CONNECT_CONSUME: i18n.t('packages_business_setting_alarmnotification_dangshujuyuanxie'),
        DATANODE_AVERAGE_HANDLE_CONSUME: i18n.t('packages_business_setting_alarmnotification_dangshujuyuanjie'),
        PROCESSNODE_AVERAGE_HANDLE_CONSUME: i18n.t('packages_business_setting_alarmnotification_dangjiediandeping'),
        SYSTEM_FLOW_EGINGE_DOWN: i18n.t('packages_business_setting_alarmnotification_dangrenwustop'),
        SYSTEM_FLOW_EGINGE_UP: i18n.t('packages_business_setting_alarmnotification_dangrenwuuP')
      },
      alarmRulesColumns: [
        {
          label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'keySlot'
        },
        {
          label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'valueSlot'
        }
      ],
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
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

<style scoped></style>
