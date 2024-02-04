<template>
  <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
    <header class="flex mb-4 mt-4 gap-3">
      <div class="flex-1">
        {{ $t('packages_business_setting_alarmnotification_renwugaojingshe') }}
      </div>
      <ElLink type="primary" @click="showAlarmRecipient"
        >{{ $t('packages_business_setting_alarmnotification_recipient_default') }}
      </ElLink>
      <ElLink type="primary" @click="showAlarmRlues"
        >{{ $t('packages_business_setting_alarmnotification_morengaojinggui') }}
      </ElLink>
    </header>
    <VTable ref="table" class="table-list" :data="tableData" :columns="columns" :hasPagination="false">
      <template v-slot:key="scope">
        <span>{{ keyMapping[scope.row.key] }}</span>
      </template>
      <template v-slot:notify="scope">
        <div class="flex">
          <el-switch style="margin-right: 20px" v-model="scope.row.open"></el-switch>
          <el-checkbox-group v-model="scope.row.notify">
            <el-checkbox label="SYSTEM" v-if="channels.includes('system')"
              >{{ $t('packages_business_notify_system_notice') }}
            </el-checkbox>
            <el-checkbox label="EMAIL" v-if="channels.includes('email')" @change="handleCheckMail"
              >{{ $t('packages_business_notify_email_notification') }}
            </el-checkbox>
            <div v-if="!isDaas">
              <el-tooltip
                placement="top"
                :content="$t('packages_business_notify_no_webchat_notification')"
                v-if="!isOpenid"
              >
                <el-checkbox label="WECHAT" v-if="channels.includes('webchat')" :disabled="!isOpenid"
                  >{{ $t('packages_business_notify_webchat_notification') }}
                </el-checkbox>
              </el-tooltip>
              <el-checkbox label="WECHAT" v-if="channels.includes('webchat') && isOpenid"
                >{{ $t('packages_business_notify_webchat_notification') }}
              </el-checkbox>
              <el-checkbox label="SMS" v-if="channels.includes('sms')"
                >{{ $t('packages_business_notify_sms_notification') }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </template>
      <template v-slot:interval="scope">
        <el-input-number :controls="false" style="width: 100px" v-model="scope.row.interval"></el-input-number>
        <el-select style="width: 100px" class="ml-2" v-model="scope.row.unit">
          <el-option :label="$t('public_time_ms')" value="MS"></el-option>
          <el-option :label="$t('public_time_s')" value="SECOND"></el-option>
          <el-option :label="$t('public_time_m')" value="MINUTE"></el-option>
          <el-option :label="$t('public_time_h')" value="HOUR"></el-option>
          <el-option :label="$t('public_time_d')" value="DAY"></el-option>
          <el-option :label="$t('packages_business_task_info_w')" value="WEEK"></el-option>
        </el-select>
      </template>
    </VTable>
    <section v-if="!isDaas">
      <header class="flex justify-content-between mb-4 mt-4" style="border-bottom: 1px solid #ebeef5">
        <div class="mb-4">{{ $t('packages_business_notify_alarm_title') }}</div>
      </header>
      <ElForm ref="form" class="e-form" label-position="left" label-width="390px" :model="form">
        <ElFormItem :label="$t('notify_agent_status_offline')" style="border-bottom: 1px solid #ebeef5">
          <el-checkbox
            v-if="channels.includes('sms')"
            v-model="form.connectionInterrupted.sms"
            @change="handleSettingValue"
            >{{ $t('notify_sms_notification') }}
          </el-checkbox>
          <el-checkbox v-model="form.connectionInterrupted.email" @change="handleSettingValue"
            >{{ $t('notify_email_notification') }}
          </el-checkbox>
          <br />
          <el-tooltip
            placement="top"
            :content="$t('packages_business_notify_no_webchat_notification')"
            v-if="!isOpenid && channels.includes('wechat')"
          >
            <el-checkbox label="WECHAT" v-model="form.connectionInterrupted.weChat" :disabled="!isOpenid"
              >{{ $t('packages_business_notify_webchat_notification') }}
            </el-checkbox>
          </el-tooltip>
          <el-checkbox
            v-if="isOpenid && channels.includes('wechat')"
            v-model="form.connectionInterrupted.weChat"
            :disabled="!isOpenid"
            @change="handleSettingValue"
          >
            {{ $t('notify_webchat_notification') }}
          </el-checkbox>
        </ElFormItem>
        <ElFormItem :label="$t('notify_agent_status_running')" style="border-bottom: 1px solid #ebeef5">
          <el-checkbox v-if="channels.includes('sms')" v-model="form.connected.sms" @change="handleSettingValue"
            >{{ $t('notify_sms_notification') }}
          </el-checkbox>
          <el-checkbox v-if="channels.includes('email')" v-model="form.connected.email" @change="handleSettingValue"
            >{{ $t('notify_email_notification') }}
          </el-checkbox>
          <br />
          <el-tooltip
            placement="top"
            :content="$t('packages_business_notify_no_webchat_notification')"
            v-if="!isOpenid && channels.includes('wechat')"
          >
            <el-checkbox label="WECHAT" v-if="!isDaas" v-model="form.connected.weChat" :disabled="!isOpenid"
              >{{ $t('packages_business_notify_webchat_notification') }}
            </el-checkbox>
          </el-tooltip>
          <el-checkbox
            v-if="isOpenid && channels.includes('wechat')"
            v-model="form.connected.weChat"
            @change="handleSettingValue"
            >{{ $t('notify_webchat_notification') }}
          </el-checkbox>
        </ElFormItem>
      </ElForm>
    </section>
    <footer class="flex justify-content-end mt-4">
      <el-button @click="remoteMethod('close')">{{ $t('public_button_cancel') }}</el-button>
      <el-button type="primary" @click="save()">{{ $t('public_button_save') }}</el-button>
    </footer>
    <el-dialog
      :title="$t('packages_business_setting_alarmnotification_renwumorengao')"
      width="70%"
      append-to-body
      v-model="alarmRulesVisible"
    >
      <div class="mb-4">
        {{ $t('packages_business_setting_alarmnotification_cichugaojinggui') }}
      </div>
      <VTable ref="table" class="table-list" :data="alarmData" :columns="alarmRulesColumns" :hasPagination="false">
        <template v-slot:keySlot="scope">
          <span>{{ keyMapping[scope.row.key] }}</span>
        </template>
        <template v-slot:valueSlot="scope">
          <span class="mr-2">{{ $t('packages_business_setting_alarmnotification_lianxu') }}</span>
          <el-input-number
            :controls="false"
            :precision="0"
            :min="1"
            style="width: 100px"
            v-model="scope.row.point"
          ></el-input-number>
          <span class="ml-2 mr-2"> {{ $t('public_time_m') }}</span>
          <el-select style="width: 100px" class="mr-2" v-model="scope.row.equalsFlag">
            <el-option label=">=" :value="1"></el-option>
            <el-option label="<=" :value="-1"></el-option>
          </el-select>
          <el-input-number
            :controls="false"
            :precision="0"
            :min="1"
            v-model="scope.row.ms"
            style="width: 80px"
          ></el-input-number>
          <span class="ml-2">{{ $t('packages_business_setting_alarmnotification_msshigaojing') }}</span>
        </template>
      </VTable>
      <footer class="flex justify-content-end mt-4">
        <el-button @click="alarmRulesVisible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button type="primary" @click="saveAlarmRules()">{{ $t('public_button_save') }}</el-button>
      </footer>
    </el-dialog>

    <el-dialog
      :title="$t('packages_business_setting_alarmnotification_recipient_setting')"
      width="70%"
      append-to-body
      v-model:visible="alarmRecipientVisible"
    >
      <div class="mb-4">{{ $t('packages_business_setting_alarmnotification_recipient_desc') }}</div>
      <VTable
        v-loading="loadingRecipient"
        ref="table"
        class="table-list"
        :data="alarmRecipientData"
        :columns="alarmRecipientColumns"
        :hasPagination="false"
      >
        <template #keySlot="{ row }">
          <span>{{ channelMap[row.channel] }}</span>
        </template>
        <template #valueSlot="{ row }">
          <ElInput
            v-model="row.value"
            :placeholder="$t('packages_business_setting_alarmnotification_recipient_tip')"
            type="textarea"
          ></ElInput>
        </template>
        <template #valueHeader>
          <span class="mr-1">{{ $t('packages_business_setting_alarmnotification_recipient') }}</span>
          <ElTooltip :content="$t('packages_business_setting_alarmnotification_recipient_tip')" placement="top">
            <i class="el-icon-info"></i>
          </ElTooltip>
        </template>
      </VTable>
      <footer class="flex justify-content-end mt-4">
        <el-button size="mini" @click="alarmRecipientVisible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button size="mini" type="primary" :loading="savingRecipient" @click="saveAlarmRecipient"
          >{{ $t('public_button_save') }}
        </el-button>
      </footer>
    </el-dialog>
  </section>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import i18n from '@/i18n'

import { VTable } from '@tap/component'
import { alarmRuleApi, settingsApi, alarmApi, alarmMailApi } from '@tap/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'AlarmNotification',
  components: { VTable },
  data() {
    return {
      columns: [
        {
          label: i18n.t('public_description'),
          slotName: 'key',
        },
        {
          label: i18n.t('packages_business_setting_notification_alarm_notification_gaojingtongzhi'),
          prop: 'notify',
          slotName: 'notify',
        },
        {
          label: i18n.t('packages_business_setting_alarm_notification_notify_noticeInterval'),
          prop: 'interval',
          slotName: 'interval',
        },
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
        INSPECT_TASK_ERROR: i18n.t('packages_business_setting_alarmnotification_dangjiaoyanrenwucuowu'),
        INSPECT_COUNT_ERROR: i18n.t('packages_business_setting_alarmnotification_dangjiaoyanrenwushuliangcuowu'),
        INSPECT_VALUE_ERROR: i18n.t('packages_business_setting_alarmnotification_dangjiaoyanrenwuzhicuowu'),
        SYSTEM_FLOW_EGINGE_DOWN: i18n.t('packages_business_setting_alarmnotification_dangrenwustop'),
        SYSTEM_FLOW_EGINGE_UP: i18n.t('packages_business_setting_alarmnotification_dangrenwuuP'),
      },
      alarmRulesColumns: [
        {
          label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'keySlot',
        },
        {
          label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
          slotName: 'valueSlot',
        },
      ],
      alarmRecipientColumns: [
        {
          label: i18n.t('packages_business_setting_alarmnotification_channel'),
          slotName: 'keySlot',
        },
        {
          label: i18n.t('packages_business_setting_alarmnotification_recipient'),
          slotName: 'valueSlot',
          headerSlot: 'valueHeader',
        },
      ],
      channelMap: {
        EMAIL: i18n.t('packages_business_notify_email_notification'),
      },
      isDaas: import.meta.env.VITE_PLATFORM === 'DAAS',
      alarmRulesVisible: false,
      alarmRecipientVisible: false,
      savingRecipient: false,
      loadingRecipient: false,
      alarmData: [],
      alarmRecipientData: [
        {
          channel: 'EMAIL',
          value: '',
        },
      ],
      tableData: [],
      isOpenid: false,
      form: {
        connected: {
          email: true,
          sms: false,
          weChat: false,
        },
        connectionInterrupted: {
          email: true,
          sms: false,
          weChat: false,
        },
        stoppedByError: {
          email: true,
          sms: false,
          weChat: false,
        },
      },
      userId: '',
      currentData: [],
      channels: ['wechat', 'system', 'sms', 'email'],
    }
  },
  mounted() {
    this.remoteMethod()
    if (!this.isDaas) {
      //是否绑定微信
      // 获取tm用户id
      this.$axios.get('tm/api/users/self').then((data) => {
        if (data) {
          this.userId = data.id
          if (data.notification) {
            this.form = data.notification
          }
        }
      })
      this.isOpenid = window.__USER_INFO__?.openid
      this.getChannels()
    }
  },
  methods: {
    remoteMethod(type) {
      settingsApi.findAlarm().then((data) => {
        this.tableData = data
        if (!this.isDaas && type) {
          $emit(this, 'updateVisible', false)
        }
        //过滤掉agent停止时
        this.currentData = data.filter((item) => item.key === 'SYSTEM_FLOW_EGINGE_DOWN')
        this.tableData = this.tableData.filter((item) => item.key !== 'SYSTEM_FLOW_EGINGE_DOWN')
      })
    },
    save() {
      //合并agent停止时
      let data = [...this.tableData, ...this.currentData]
      settingsApi.saveAlarm(data).then(() => {
        this.$message.success(i18n.t('public_message_save_ok'))
        if (!this.isDaas) {
          $emit(this, 'updateVisible', false)
        }
      })
    },
    showAlarmRlues() {
      this.alarmRulesVisible = true
      this.getAlarmData()
    },
    showAlarmRecipient() {
      this.alarmRecipientVisible = true
      this.loadAlarmRecipient()
    },
    //告警设置 单独请求接口 单独提交数据
    getAlarmData() {
      alarmRuleApi.find().then((data) => {
        this.alarmData = data.map((item) => {
          item.point = this.getPoints(item.point)
          item.ms = this.getSecond(item.ms)
          return item
        })
      })
    },
    async loadAlarmRecipient() {
      this.loadingRecipient = true
      const { emailAddressList = [] } = await alarmMailApi.get()
      this.alarmRecipientData[0].value = emailAddressList.join(',')
      this.loadingRecipient = false
    },
    getPoints(data) {
      //5s一个点 向上取整 ，1分钟12个点
      return Math.ceil(data / 12) < 1 ? 1 : Math.ceil(data / 12)
    },
    getSecond(data) {
      //ms => s 1000ms = 1s
      return Math.ceil(data / 1000) < 1 ? 1 : Math.ceil(data / 1000)
    },
    saveAlarmRules() {
      //告警设置单独保存
      let data = cloneDeep(this.alarmData)
      data = data.map((item) => {
        item.point = Math.ceil(item.point * 12) < 1 ? 1 : Math.ceil(item.point * 12)
        item.ms = Math.ceil(item.ms * 1000) < 1 ? 1 : Math.ceil(item.ms * 1000)
        return item
      })
      alarmRuleApi.save(data).then(() => {
        this.alarmRulesVisible = false
        this.$message.success(this.$t('public_message_save_ok'))
      })
    },
    async saveAlarmRecipient() {
      this.savingRecipient = true
      try {
        const value = this.alarmRecipientData[0].value?.trim()
        await alarmMailApi.save({
          type: 'EMAIL',
          emailAddressList: value ? value.split(',').map((item) => item.trim()) : [],
        })
        this.alarmRecipientVisible = false
        this.$message.success(this.$t('public_message_save_ok'))
      } catch (e) {
        this.$message.error(this.$t('public_message_save_fail'))
      }
      this.savingRecipient = false
    },
    handleSettingValue() {
      let data = {
        notification: this.form,
      }
      this.$axios.patch(`tm/api/users/${this.userId}`, data)
    },

    //获取支持通知方式
    getChannels() {
      alarmApi.channels().then((data) => {
        this.channels = []
        this.channels = data.map((item) => item.type)
      })
    },

    handleCheckMail(val) {
      const email = window.__USER_INFO__?.email
      if (this.isDaas || email || !val) {
        return
      }
      this.$confirm(
        i18n.t('packages_business_setting_alarmsetting_jiancedaoninhai'),
        this.$t('public_message_title_prompt'),
        {
          type: 'warning',
          confirmButtonText: i18n.t('packages_business_setting_alarmsetting_qubangding'),
        },
      ).then((flag) => {
        if (flag) {
          this.$router.push({
            name: 'userCenter',
            query: {
              bind: 'email',
            },
          })
        }
      })
    },
  },
  emits: ['updateVisible'],
}
</script>
