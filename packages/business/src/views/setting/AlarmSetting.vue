<script setup lang="ts">
import { alarmApi, alarmMailApi, alarmRuleApi, settingsApi } from '@tap/api'
import { VTable } from '@tap/component/src/base/v-table'
import {
  AdminOutlined,
  FilterOutlined,
  MemberOutlined,
} from '@tap/component/src/icon'
import { Modal } from '@tap/component/src/modal'
import i18n from '@tap/i18n'
import { cloneDeep } from 'lodash-es'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import EmailTemplateDialog from './EmailTemplateDialog.vue'

// Types
interface AlarmRule {
  key: string
  point: number
  ms: number
  equalsFlag: number
  open: boolean
  notify: string[]
  interval: number
  unit: string
}

interface AlarmRecipient {
  channel: string
  value: string
}

interface NotificationForm {
  connected: {
    email: boolean
    sms: boolean
    weChat: boolean
  }
  connectionInterrupted: {
    email: boolean
    sms: boolean
    weChat: boolean
  }
  stoppedByError: {
    email: boolean
    sms: boolean
    weChat: boolean
  }
}

interface Channel {
  type: string
}

interface User {
  id: string
  email?: string
  notification?: NotificationForm
  openid?: string
}

// Props & Emits
interface Props {
  inDialog?: boolean
}

interface Emits {
  (e: 'updateVisible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  inDialog: false,
})

const emit = defineEmits<Emits>()

// Router
const router = useRouter()

// Refs
const table = ref()
const form = ref()
const templateDialog = ref()

// Reactive Data
const columns = ref([
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
])

const keyMapping = reactive({
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
  TASK_INSPECT_DIFFERENCE: i18n.t('packages_dag_task_inspect_difference_alarm'),
})

const alarmRulesColumns = ref([
  {
    label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
    slotName: 'keySlot',
  },
  {
    label: i18n.t('packages_business_setting_alarmnotification_gaojingzhibiao'),
    slotName: 'valueSlot',
  },
])

const alarmRecipientColumns = ref([
  {
    label: i18n.t('packages_business_setting_alarmnotification_channel'),
    slotName: 'keySlot',
  },
  {
    label: i18n.t('packages_business_setting_alarmnotification_recipient'),
    slotName: 'valueSlot',
    headerSlot: 'valueHeader',
  },
])

const channelMap = reactive({
  EMAIL: i18n.t('packages_business_notify_email_notification'),
})

// Computed
const isDaas = computed(() => import.meta.env.VUE_APP_PLATFORM === 'DAAS')

// State
const alarmRulesVisible = ref(false)
const alarmRecipientVisible = ref(false)
const savingRecipient = ref(false)
const loadingRecipient = ref(false)
const alarmData = ref<AlarmRule[]>([])
const alarmRecipientData = ref<AlarmRecipient[]>([
  {
    channel: 'EMAIL',
    value: '',
  },
])
const tableData = ref<AlarmRule[]>([])
const isOpenid = ref(false)
const formData = reactive<NotificationForm>({
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
})
const userId = ref('')
const currentData = ref<AlarmRule[]>([])
const channels = ref<string[]>(['wechat', 'system', 'sms', 'email'])

// Methods
const remoteMethod = async (type?: string) => {
  try {
    const data = await settingsApi.findAlarm()
    tableData.value = data
    if (!isDaas.value && type) {
      emit('updateVisible', false)
    }
    // 过滤掉agent停止时
    currentData.value = data.filter(
      (item: AlarmRule) => item.key === 'SYSTEM_FLOW_EGINGE_DOWN',
    )
    tableData.value = tableData.value.filter(
      (item: AlarmRule) => item.key !== 'SYSTEM_FLOW_EGINGE_DOWN',
    )
  } catch (error) {
    console.error('Failed to load alarm settings:', error)
  }
}

const save = async () => {
  try {
    // 合并agent停止时
    const data = [...tableData.value, ...currentData.value]
    await settingsApi.saveAlarm(data)
    ElMessage.success(i18n.t('public_message_save_ok'))
    if (!isDaas.value) {
      emit('updateVisible', false)
    }
  } catch (error) {
    console.error('Failed to save alarm settings:', error)
    ElMessage.error('保存失败')
  }
}

const showAlarmRlues = () => {
  alarmRulesVisible.value = true
  getAlarmData()
}

const showAlarmRecipient = () => {
  alarmRecipientVisible.value = true
  loadAlarmRecipient()
}

// 告警设置 单独请求接口 单独提交数据
const getAlarmData = async () => {
  try {
    const data = await alarmRuleApi.find()
    alarmData.value = data.map((item: AlarmRule) => {
      item.point = getPoints(item.point)
      item.ms = getSecond(item.ms)
      return item
    })
  } catch (error) {
    console.error('Failed to load alarm rules:', error)
  }
}

const loadAlarmRecipient = async () => {
  loadingRecipient.value = true
  try {
    const { emailAddressList = [] } = await alarmMailApi.get()
    alarmRecipientData.value[0].value = emailAddressList.join(',')
  } catch (error) {
    console.error('Failed to load alarm recipients:', error)
  } finally {
    loadingRecipient.value = false
  }
}

const getPoints = (data: number): number => {
  // 5s一个点 向上取整 ，1分钟12个点
  return Math.max(Math.ceil(data / 12), 1)
}

const getSecond = (data: number): number => {
  // ms => s 1000ms = 1s
  return Math.max(Math.ceil(data / 1000), 1)
}

const saveAlarmRules = async () => {
  try {
    // 告警设置单独保存
    let data = cloneDeep(alarmData.value)
    data = data.map((item: AlarmRule) => {
      item.point = Math.max(Math.ceil(item.point * 12), 1)
      item.ms = Math.max(Math.ceil(item.ms * 1000), 1)
      return item
    })
    await alarmRuleApi.save(data)
    alarmRulesVisible.value = false
    ElMessage.success(i18n.t('public_message_save_ok'))
  } catch (error) {
    console.error('Failed to save alarm rules:', error)
    ElMessage.error('保存失败')
  }
}

const saveAlarmRecipient = async () => {
  savingRecipient.value = true
  try {
    const value = alarmRecipientData.value[0].value?.trim()
    await alarmMailApi.save({
      type: 'EMAIL',
      emailAddressList: value
        ? value.split(',').map((item: string) => item.trim())
        : [],
    })
    alarmRecipientVisible.value = false
    ElMessage.success(i18n.t('public_message_save_ok'))
  } catch (error) {
    console.error('Failed to save alarm recipients:', error)
    ElMessage.error(i18n.t('public_message_save_fail'))
  } finally {
    savingRecipient.value = false
  }
}

const handleSettingValue = async () => {
  try {
    const data = {
      notification: formData,
    }
    // 这里需要根据实际的API调用方式调整
    // await $axios.patch(`tm/api/users/${userId.value}`, data)
  } catch (error) {
    console.error('Failed to update user settings:', error)
  }
}

// 获取支持通知方式
const getChannels = async () => {
  try {
    const data = await alarmApi.channels()
    channels.value = data.map((item: Channel) => item.type)
  } catch (error) {
    console.error('Failed to load channels:', error)
  }
}

const handleCheckMail = async (val: boolean) => {
  const email = (window as any).__USER_INFO__?.email
  if (isDaas.value || email || !val) {
    return
  }
  const confirmed = await Modal.confirm(
    i18n.t('public_message_title_prompt'),
    i18n.t('packages_business_setting_alarmsetting_jiancedaoninhai'),
    {
      confirmButtonText: i18n.t(
        'packages_business_setting_alarmsetting_qubangding',
      ),
    },
  )
  if (confirmed) {
    router.push({
      name: 'userCenter',
      query: {
        bind: 'email',
      },
    })
  }
}

const showCustomMailTemplate = () => {
  templateDialog.value.open(tableData.value)
}

const handleSaveMailTemplate = (rulesList: any) => {
  tableData.value.forEach((item: AlarmRule, index: number) => {
    item.emailAlarmTitle = rulesList[index].emailAlarmTitle
    item.emailAlarmContent = rulesList[index].emailAlarmContent
  })

  save()
}

// Lifecycle
onMounted(async () => {
  await remoteMethod()
  if (!isDaas.value) {
    try {
      // 是否绑定微信
      // 获取tm用户id
      // const data = await $axios.get('tm/api/users/self')
      // if (data) {
      //   userId.value = data.id
      //   if (data.notification) {
      //     Object.assign(formData, data.notification)
      //   }
      // }
      isOpenid.value = !!(window as any).__USER_INFO__?.openid
      await getChannels()
    } catch (error) {
      console.error('Failed to initialize user data:', error)
    }
  }
})
</script>

<template>
  <!--这个页面在云版作为Dialog 使用，调整的时候慎重处理，记得两个版本同时验证-->
  <PageContainer
    mode="auto"
    content-class="flex flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <template #actions>
      <ElButton v-if="!isDaas" text @click="showAlarmRecipient">
        <el-icon class="mr-1"><MemberOutlined /></el-icon>
        {{
          $t('packages_business_setting_alarmnotification_recipient_default')
        }}
      </ElButton>
      <ElButton text @click="showAlarmRlues">
        <el-icon class="mr-1"><FilterOutlined /></el-icon>
        {{ $t('packages_business_setting_alarmnotification_morengaojinggui') }}
      </ElButton>

      <ElButton text @click="showCustomMailTemplate">
        <el-icon class="mr-1"><AdminOutlined /></el-icon
        >{{ $t('packages_business_custom_mail_template') }}
      </ElButton>
    </template>

    <section class="flex flex-1 flex-column alarm-setting">
      <VTable
        ref="table"
        class="table-list"
        :data="tableData"
        :columns="columns"
        :has-pagination="false"
      >
        <template #key="scope">
          <span>{{
            keyMapping[scope.row.key as keyof typeof keyMapping]
          }}</span>
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
          :model="formData"
        >
          <ElFormItem
            :label="$t('notify_agent_status_offline')"
            style="border-bottom: 1px solid #ebeef5"
          >
            <el-checkbox
              v-if="channels.includes('sms')"
              v-model="formData.connectionInterrupted.sms"
              @change="handleSettingValue"
              >{{ $t('notify_sms_notification') }}
            </el-checkbox>
            <el-checkbox
              v-model="formData.connectionInterrupted.email"
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
                v-model="formData.connectionInterrupted.weChat"
                label="WECHAT"
                :disabled="!isOpenid"
                >{{ $t('packages_business_notify_webchat_notification') }}
              </el-checkbox>
            </el-tooltip>
            <el-checkbox
              v-if="isOpenid && channels.includes('wechat')"
              v-model="formData.connectionInterrupted.weChat"
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
              v-model="formData.connected.sms"
              @change="handleSettingValue"
              >{{ $t('notify_sms_notification') }}
            </el-checkbox>
            <el-checkbox
              v-if="channels.includes('email')"
              v-model="formData.connected.email"
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
                v-model="formData.connected.weChat"
                label="WECHAT"
                :disabled="!isOpenid"
                >{{ $t('packages_business_notify_webchat_notification') }}
              </el-checkbox>
            </el-tooltip>
            <el-checkbox
              v-if="isOpenid && channels.includes('wechat')"
              v-model="formData.connected.weChat"
              @change="handleSettingValue"
              >{{ $t('notify_webchat_notification') }}
            </el-checkbox>
          </ElFormItem>
        </ElForm>
      </section>
      <div class="position-sticky py-6 bottom-0 bg-white z-10">
        <el-button type="primary" @click="save()">{{
          $t('public_button_save')
        }}</el-button>
        <el-button @click="remoteMethod('close')">{{
          $t('public_button_cancel')
        }}</el-button>
      </div>
      <el-dialog
        v-model="alarmRulesVisible"
        :title="$t('packages_business_setting_alarmnotification_renwumorengao')"
        width="70%"
        append-to-body
      >
        <ElAlert
          class="mb-4"
          :closable="false"
          :title="
            $t('packages_business_setting_alarmnotification_cichugaojinggui')
          "
          type="info"
          show-icon
        />

        <VTable
          ref="table"
          class="table-list"
          :data="alarmData"
          :columns="alarmRulesColumns"
          :has-pagination="false"
        >
          <template #keySlot="scope">
            <span>{{
              keyMapping[scope.row.key as keyof typeof keyMapping]
            }}</span>
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
            <span>{{
              channelMap[row.channel as keyof typeof channelMap]
            }}</span>
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
      <EmailTemplateDialog
        ref="templateDialog"
        :key-mapping="keyMapping"
        @save="handleSaveMailTemplate"
      />
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.alarm-setting {
  .el-checkbox {
    --el-checkbox-checked-text-color: var(--el-checkbox-text-color);
  }
}
</style>
