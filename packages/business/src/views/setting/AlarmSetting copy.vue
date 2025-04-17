<script>
import { alarmApi, alarmMailApi, alarmRuleApi, settingsApi } from '@tap/api'
import { VTable } from '@tap/component'
import { cloneDeep } from 'lodash'

import i18n from '@/i18n'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'
import PageContainer from '../../components/PageContainer.vue'

export default {
  name: 'AlarmNotification',
  components: { VTable, PageContainer },
  props: {
    inDialog: Boolean,
  },
  emits: ['updateVisible'],
  data() {
    return {
      columns: [
        {
          label: i18n.t('public_description'),
          slotName: 'key',
        },
        {
          label: i18n.t(
            'packages_business_setting_notification_alarm_notification_gaojingtongzhi',
          ),
          prop: 'notify',
          slotName: 'notify',
        },
        {
          label: i18n.t(
            'packages_business_setting_alarm_notification_notify_noticeInterval',
          ),
          prop: 'interval',
          slotName: 'interval',
        },
      ],
      keyMapping: {
        TASK_STATUS_ERROR: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwuyudao',
        ),
        TASK_INSPECT_ERROR: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwujiaoyan',
        ),
        TASK_FULL_COMPLETE: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwuquanliang',
        ),
        TASK_INCREMENT_START: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwuzengliang',
        ),
        TASK_STATUS_STOP: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwutingzhi',
        ),
        TASK_INCREMENT_DELAY: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwudezeng',
        ),
        DATANODE_CANNOT_CONNECT: i18n.t(
          'packages_business_setting_alarmnotification_dangshujuwufa',
        ),
        DATANODE_HTTP_CONNECT_CONSUME: i18n.t(
          'packages_business_setting_alarmnotification_dangshujuyuanwang',
        ),
        DATANODE_TCP_CONNECT_CONSUME: i18n.t(
          'packages_business_setting_alarmnotification_dangshujuyuanxie',
        ),
        DATANODE_AVERAGE_HANDLE_CONSUME: i18n.t(
          'packages_business_setting_alarmnotification_dangshujuyuanjie',
        ),
        PROCESSNODE_AVERAGE_HANDLE_CONSUME: i18n.t(
          'packages_business_setting_alarmnotification_dangjiediandeping',
        ),
        INSPECT_TASK_ERROR: i18n.t(
          'packages_business_setting_alarmnotification_dangjiaoyanrenwucuowu',
        ),
        INSPECT_COUNT_ERROR: i18n.t(
          'packages_business_setting_alarmnotification_dangjiaoyanrenwushuliangcuowu',
        ),
        INSPECT_VALUE_ERROR: i18n.t(
          'packages_business_setting_alarmnotification_dangjiaoyanrenwuzhicuowu',
        ),
        SYSTEM_FLOW_EGINGE_DOWN: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwustop',
        ),
        SYSTEM_FLOW_EGINGE_UP: i18n.t(
          'packages_business_setting_alarmnotification_dangrenwuuP',
        ),
      },
      alarmRulesColumns: [
        {
          label: i18n.t(
            'packages_business_setting_alarmnotification_gaojingzhibiao',
          ),
          slotName: 'keySlot',
        },
        {
          label: i18n.t(
            'packages_business_setting_alarmnotification_gaojingzhibiao',
          ),
          slotName: 'valueSlot',
        },
      ],
      alarmRecipientColumns: [
        {
          label: i18n.t('packages_business_setting_alarmnotification_channel'),
          slotName: 'keySlot',
        },
        {
          label: i18n.t(
            'packages_business_setting_alarmnotification_recipient',
          ),
          slotName: 'valueSlot',
          headerSlot: 'valueHeader',
        },
      ],
      channelMap: {
        EMAIL: i18n.t('packages_business_notify_email_notification'),
      },
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
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
        this.currentData = data.filter(
          (item) => item.key === 'SYSTEM_FLOW_EGINGE_DOWN',
        )
        this.tableData = this.tableData.filter(
          (item) => item.key !== 'SYSTEM_FLOW_EGINGE_DOWN',
        )
      })
    },
    save() {
      //合并agent停止时
      const data = [...this.tableData, ...this.currentData]
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
      return Math.max(Math.ceil(data / 12), 1)
    },
    getSecond(data) {
      //ms => s 1000ms = 1s
      return Math.max(Math.ceil(data / 1000), 1)
    },
    saveAlarmRules() {
      //告警设置单独保存
      let data = cloneDeep(this.alarmData)
      data = data.map((item) => {
        item.point = Math.max(Math.ceil(item.point * 12), 1)
        item.ms = Math.max(Math.ceil(item.ms * 1000), 1)
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
          emailAddressList: value
            ? value.split(',').map((item) => item.trim())
            : [],
        })
        this.alarmRecipientVisible = false
        this.$message.success(this.$t('public_message_save_ok'))
      } catch {
        this.$message.error(this.$t('public_message_save_fail'))
      }
      this.savingRecipient = false
    },
    handleSettingValue() {
      const data = {
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
          confirmButtonText: i18n.t(
            'packages_business_setting_alarmsetting_qubangding',
          ),
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
}
</script>

<template>
  <!--这个页面在云版作为Dialog 使用，调整的时候慎重处理，记得两个版本同时验证-->
  <PageContainer>
    <section class="flex flex-1 flex-column ml-4 mr-4 overflow-hidden">
      <header class="flex mb-4 mt-4 gap-3">
        <div class="flex-1">
          {{
            $t('packages_business_setting_alarmnotification_renwugaojingshe')
          }}
        </div>
        <ElButton v-if="!isDaas" text type="primary" @click="showAlarmRecipient"
          >{{
            $t('packages_business_setting_alarmnotification_recipient_default')
          }}
        </ElButton>
        <ElButton text type="primary" @click="showAlarmRlues"
          >{{
            $t('packages_business_setting_alarmnotification_morengaojinggui')
          }}
        </ElButton>
      </header>
      <VTable
        ref="table"
        class="table-list"
        :data="tableData"
        :columns="columns"
        :has-pagination="false"
        :height="inDialog ? undefined : '100%'"
      >
        <template #key="scope">
          <span>{{ keyMapping[scope.row.key] }}</span>
        </template>
        <template #notify="scope">
          <div class="flex">
            <el-switch v-model="scope.row.open" style="margin-right: 20px" />
            <el-checkbox-group v-model="scope.row.notify">
              <el-checkbox v-if="channels.includes('system')" label="SYSTEM"
                >{{ $t('packages_business_notify_system_notice') }}
              </el-checkbox>
              <el-checkbox
                v-if="channels.includes('email')"
                label="EMAIL"
                @change="handleCheckMail"
                >{{ $t('packages_business_notify_email_notification') }}
              </el-checkbox>
              <div v-if="!isDaas">
                <el-tooltip
                  v-if="!isOpenid"
                  placement="top"
                  :content="
                    $t('packages_business_notify_no_webchat_notification')
                  "
                >
                  <el-checkbox
                    v-if="channels.includes('webchat')"
                    label="WECHAT"
                    :disabled="!isOpenid"
                    >{{ $t('packages_business_notify_webchat_notification') }}
                  </el-checkbox>
                </el-tooltip>
                <el-checkbox
                  v-if="channels.includes('webchat') && isOpenid"
                  label="WECHAT"
                  >{{ $t('packages_business_notify_webchat_notification') }}
                </el-checkbox>
                <el-checkbox v-if="channels.includes('sms')" label="SMS"
                  >{{ $t('packages_business_notify_sms_notification') }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </template>
        <template #interval="scope">
          <el-input-number
            v-model="scope.row.interval"
            :controls="false"
            style="width: 100px"
          />
          <el-select v-model="scope.row.unit" style="width: 100px" class="ml-2">
            <el-option :label="$t('public_time_ms')" value="MS" />
            <el-option :label="$t('public_time_s')" value="SECOND" />
            <el-option :label="$t('public_time_m')" value="MINUTE" />
            <el-option :label="$t('public_time_h')" value="HOUR" />
            <el-option :label="$t('public_time_d')" value="DAY" />
            <el-option
              :label="$t('packages_business_task_info_w')"
              value="WEEK"
            />
          </el-select>
        </template>
      </VTable>
      <section v-if="!isDaas">
        <header
          class="flex justify-content-between mb-4 mt-4"
          style="border-bottom: 1px solid #ebeef5"
        >
          <div class="mb-4">
            {{ $t('packages_business_notify_alarm_title') }}
          </div>
        </header>
        <ElForm
          ref="form"
          class="e-form"
          label-position="left"
          label-width="390px"
          :model="form"
        >
          <ElFormItem
            :label="$t('notify_agent_status_offline')"
            style="border-bottom: 1px solid #ebeef5"
          >
            <el-checkbox
              v-if="channels.includes('sms')"
              v-model="form.connectionInterrupted.sms"
              @change="handleSettingValue"
              >{{ $t('notify_sms_notification') }}
            </el-checkbox>
            <el-checkbox
              v-model="form.connectionInterrupted.email"
              @change="handleSettingValue"
              >{{ $t('notify_email_notification') }}
            </el-checkbox>
            <br />
            <el-tooltip
              v-if="!isOpenid && channels.includes('wechat')"
              placement="top"
              :content="$t('packages_business_notify_no_webchat_notification')"
            >
              <el-checkbox
                v-model="form.connectionInterrupted.weChat"
                label="WECHAT"
                :disabled="!isOpenid"
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
          <ElFormItem
            :label="$t('notify_agent_status_running')"
            style="border-bottom: 1px solid #ebeef5"
          >
            <el-checkbox
              v-if="channels.includes('sms')"
              v-model="form.connected.sms"
              @change="handleSettingValue"
              >{{ $t('notify_sms_notification') }}
            </el-checkbox>
            <el-checkbox
              v-if="channels.includes('email')"
              v-model="form.connected.email"
              @change="handleSettingValue"
              >{{ $t('notify_email_notification') }}
            </el-checkbox>
            <br />
            <el-tooltip
              v-if="!isOpenid && channels.includes('wechat')"
              placement="top"
              :content="$t('packages_business_notify_no_webchat_notification')"
            >
              <el-checkbox
                v-if="!isDaas"
                v-model="form.connected.weChat"
                label="WECHAT"
                :disabled="!isOpenid"
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
      <footer
        class="flex justify-content-end"
        :class="inDialog ? 'pt-4' : 'py-4'"
      >
        <el-button @click="remoteMethod('close')">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button type="primary" @click="save()">{{
          $t('public_button_save')
        }}</el-button>
      </footer>
      <el-dialog
        v-model="alarmRulesVisible"
        :title="$t('packages_business_setting_alarmnotification_renwumorengao')"
        width="70%"
        append-to-body
      >
        <div class="mb-4">
          {{
            $t('packages_business_setting_alarmnotification_cichugaojinggui')
          }}
        </div>
        <VTable
          ref="table"
          class="table-list"
          :data="alarmData"
          :columns="alarmRulesColumns"
          :has-pagination="false"
        >
          <template #keySlot="scope">
            <span>{{ keyMapping[scope.row.key] }}</span>
          </template>
          <template #valueSlot="scope">
            <span class="mr-2">{{
              $t('packages_business_setting_alarmnotification_lianxu')
            }}</span>
            <el-input-number
              v-model="scope.row.point"
              :controls="false"
              :precision="0"
              :min="1"
              style="width: 100px"
            />
            <span class="ml-2 mr-2"> {{ $t('public_time_m') }}</span>
            <el-select
              v-model="scope.row.equalsFlag"
              style="width: 100px"
              class="mr-2"
            >
              <el-option label=">=" :value="1" />
              <el-option label="<=" :value="-1" />
            </el-select>
            <el-input-number
              v-model="scope.row.ms"
              :controls="false"
              :precision="0"
              :min="1"
              style="width: 80px"
            />
            <span class="ml-2">{{
              $t('packages_business_setting_alarmnotification_msshigaojing')
            }}</span>
          </template>
        </VTable>
        <footer class="flex justify-content-end mt-4">
          <el-button @click="alarmRulesVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button type="primary" @click="saveAlarmRules()">{{
            $t('public_button_save')
          }}</el-button>
        </footer>
      </el-dialog>

      <el-dialog
        v-model="alarmRecipientVisible"
        :title="
          $t('packages_business_setting_alarmnotification_recipient_setting')
        "
        width="70%"
        append-to-body
      >
        <div class="mb-4">
          {{ $t('packages_business_setting_alarmnotification_recipient_desc') }}
        </div>
        <VTable
          ref="table"
          v-loading="loadingRecipient"
          class="table-list"
          :data="alarmRecipientData"
          :columns="alarmRecipientColumns"
          :has-pagination="false"
        >
          <template #keySlot="{ row }">
            <span>{{ channelMap[row.channel] }}</span>
          </template>
          <template #valueSlot="{ row }">
            <ElInput
              v-model="row.value"
              :placeholder="
                $t('packages_business_setting_alarmnotification_recipient_tip')
              "
              type="textarea"
            />
          </template>
          <template #valueHeader>
            <span class="mr-1">{{
              $t('packages_business_setting_alarmnotification_recipient')
            }}</span>
            <ElTooltip
              :content="
                $t('packages_business_setting_alarmnotification_recipient_tip')
              "
              placement="top"
            >
              <i class="el-icon-info" />
            </ElTooltip>
          </template>
        </VTable>
        <footer class="flex justify-content-end mt-4">
          <el-button @click="alarmRecipientVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button
            type="primary"
            :loading="savingRecipient"
            @click="saveAlarmRecipient"
            >{{ $t('public_button_save') }}
          </el-button>
        </footer>
      </el-dialog>
    </section>
  </PageContainer>
</template>
