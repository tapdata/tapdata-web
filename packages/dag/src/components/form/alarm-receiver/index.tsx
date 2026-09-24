import { observer } from '@formily/reactive-vue'
import { useField } from '@formily/vue'
import {
  fetchAlarmReceiverPreview,
  updateTaskAlarm,
  type AlarmReceiver,
  type AlarmReceiverPreviewEmail,
  type AlarmReceiverPreviewInvalid,
  type AlarmReceiverStatus,
} from '@tap/api/src/core/alarm'
import AlarmReceiverSelector from '@tap/business/src/components/AlarmReceiverSelector.vue'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import './index.scss'

type ReceiverMode = 'SYSTEM_DEFAULT' | 'CUSTOM'

function normalizeReceiver(item: unknown): AlarmReceiver | null {
  if (!item || typeof item !== 'object') return null
  const receiver = item as AlarmReceiver
  if (receiver.type === 'EMAIL') {
    const email = String(receiver.email || '').trim()
    return email ? { type: 'EMAIL', email } : null
  }
  if (receiver.type === 'USER' || receiver.type === 'USER_GROUP') {
    const id = String(receiver.id || '').trim()
    return id ? { type: receiver.type, id } : null
  }
  return null
}

function readInitialReceivers(dataflow: {
  alarmReceivers?: unknown
  emailReceivers?: unknown
  alarmReceiverStatus?: string
}): AlarmReceiver[] {
  // 空数组是自定义空，不能再去读存量邮箱。
  if (Array.isArray(dataflow?.alarmReceivers)) {
    return dataflow.alarmReceivers
      .map(normalizeReceiver)
      .filter((item: AlarmReceiver | null): item is AlarmReceiver => !!item)
  }
  const status = dataflow?.alarmReceiverStatus as
    | AlarmReceiverStatus
    | undefined
  if (status === 'SYSTEM_DEFAULT') return []
  if (!Array.isArray(dataflow?.emailReceivers)) return []
  return dataflow.emailReceivers
    .map((email: unknown) => String(email || '').trim())
    .filter(Boolean)
    .map((email: string) => ({ type: 'EMAIL' as const, email }))
}

function readInitialMode(
  dataflow: {
    alarmReceivers?: unknown
    alarmReceiverStatus?: string
    useSystemDefaultReceivers?: boolean
  },
  receivers: AlarmReceiver[],
): ReceiverMode {
  if (Array.isArray(dataflow?.alarmReceivers)) return 'CUSTOM'
  const status = dataflow?.alarmReceiverStatus as
    | AlarmReceiverStatus
    | undefined
  if (status === 'SYSTEM_DEFAULT') return 'SYSTEM_DEFAULT'
  if (status === 'CUSTOM' || status === 'NONE') return 'CUSTOM'
  if (dataflow?.useSystemDefaultReceivers === true) return 'SYSTEM_DEFAULT'
  if (dataflow?.useSystemDefaultReceivers === false) return 'CUSTOM'
  return receivers.length ? 'CUSTOM' : 'SYSTEM_DEFAULT'
}

function cleanReceivers(receivers: AlarmReceiver[]) {
  return receivers
    .map((item) => {
      if (item.type === 'EMAIL') {
        const email = item.email?.trim()
        return email ? { type: 'EMAIL' as const, email } : null
      }
      return item.id ? { type: item.type, id: item.id } : null
    })
    .filter((item): item is AlarmReceiver => !!item)
}

const AlarmReceiverFieldComponent = defineComponent({
  name: 'AlarmReceiverField',
  props: {
    disabled: Boolean,
    taskId: {
      type: String,
      default: '',
    },
    taskName: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { t } = useI18n()
    const fieldRef = useField()
    const dataflowStore = useDataflowStore()
    const ready = ref(false)
    const mode = ref<ReceiverMode>('SYSTEM_DEFAULT')
    const receivers = ref<AlarmReceiver[]>([])
    const invalid = ref(false)
    const previewCount = ref<number | null>(null)
    const previewEmails = ref<AlarmReceiverPreviewEmail[]>([])
    const previewInvalid = ref<AlarmReceiverPreviewInvalid[]>([])
    const previewFailed = ref(false)
    const previewStale = ref(false)
    const detailOpen = ref(false)
    let persistVersion = 0

    const hydrate = () => {
      const initialReceivers = readInitialReceivers(dataflowStore.dataflow)
      receivers.value = initialReceivers
      mode.value = readInitialMode(dataflowStore.dataflow, initialReceivers)
    }

    const taskIdOf = () => {
      if (props.taskId && !props.taskId.includes('{{')) return props.taskId
      const id = dataflowStore.dataflow?.id
      return id ? String(id) : ''
    }

    const loadPreview = async () => {
      const taskId = taskIdOf()
      if (!taskId) return
      try {
        const data = await fetchAlarmReceiverPreview(String(taskId))
        previewEmails.value = Array.isArray(data?.emails) ? data.emails : []
        previewInvalid.value = Array.isArray(data?.invalid) ? data.invalid : []
        previewCount.value = previewEmails.value.length
        previewFailed.value = false
        previewStale.value = false
      } catch (error) {
        console.error(error)
        previewFailed.value = true
      }
    }

    const persist = async () => {
      const taskId = taskIdOf()
      if (!ready.value || !taskId) return
      if (mode.value === 'CUSTOM' && invalid.value) return
      const version = ++persistVersion
      const payload =
        mode.value === 'SYSTEM_DEFAULT'
          ? {
              taskId,
              useSystemDefaultReceivers: true,
            }
          : {
              taskId,
              alarmReceivers: cleanReceivers(receivers.value),
            }
      try {
        await updateTaskAlarm(payload)
        if (version !== persistVersion) return
        await loadPreview()
      } catch (error) {
        console.error(error)
        if (version === persistVersion) {
          ElMessage.error(t('public_message_save_fail'))
        }
      }
    }

    const debouncedPersist = debounce(() => {
      void persist()
    }, 400)

    hydrate()

    watch(
      [mode, receivers, invalid],
      () => {
        if (!ready.value) return
        previewStale.value = true
        if (mode.value === 'CUSTOM' && invalid.value) return
        debouncedPersist()
      },
      { deep: true },
    )

    onMounted(() => {
      ready.value = true
      void loadPreview()
    })

    onBeforeUnmount(() => {
      debouncedPersist.cancel()
    })

    return () => {
      const disabled =
        fieldRef.value?.pattern === 'editable' ? false : !!props.disabled
      const showEmptyWarning =
        mode.value === 'CUSTOM' &&
        !previewStale.value &&
        previewCount.value === 0
      const showSystemDefaultEmpty =
        mode.value === 'SYSTEM_DEFAULT' &&
        !previewStale.value &&
        previewCount.value === 0
      const typeLabel = (type?: string) => {
        if (type === 'USER') return t('packages_dag_alarm_receiver_type_user')
        if (type === 'USER_GROUP')
          return t('packages_dag_alarm_receiver_type_group')
        if (type === 'EMAIL') return t('packages_dag_alarm_receiver_type_email')
        return type || '-'
      }

      return (
        <div class="alarm-receiver-field flex flex-column gap-3">
          <div>
            <div class="mb-2">{t('packages_dag_alarm_receiver_mode')}</div>
            <ElRadioGroup
              class="alarm-receiver-mode"
              modelValue={mode.value}
              disabled={disabled}
              onUpdate:modelValue={(value: ReceiverMode) => {
                mode.value = value
              }}
            >
              <ElRadio label="SYSTEM_DEFAULT" border>
                {t('packages_dag_alarm_receiver_system_default')}
              </ElRadio>
              <ElRadio label="CUSTOM" border>
                {t('packages_dag_alarm_receiver_custom')}
              </ElRadio>
            </ElRadioGroup>
          </div>
          <div
            style={{ display: mode.value === 'CUSTOM' ? undefined : 'none' }}
          >
            <div class="mb-2">{t('packages_dag_alarm_receivers')}</div>
            <AlarmReceiverSelector
              modelValue={receivers.value}
              taskId={props.taskId || dataflowStore.dataflow?.id}
              taskName={
                props.taskName && !props.taskName.includes('{{')
                  ? props.taskName
                  : dataflowStore.dataflow?.name || ''
              }
              disabled={disabled}
              onUpdate:modelValue={(value: AlarmReceiver[]) => {
                receivers.value = value
              }}
              onInvalidChange={(value: boolean) => {
                invalid.value = value
              }}
            />
          </div>
          {showEmptyWarning && (
            <div class="alarm-receiver-empty-banner">
              <div>{t('packages_dag_alarm_receiver_empty_warning')}</div>
              <div>
                {previewInvalid.value.length
                  ? t('packages_dag_alarm_receiver_deleted_hint')
                  : t('packages_dag_alarm_receiver_empty_keep')}
              </div>
            </div>
          )}
          {showEmptyWarning && previewInvalid.value.length > 0 && (
            <table class="alarm-receiver-invalid-table">
              <thead>
                <tr>
                  <th>{t('packages_dag_alarm_receiver_col_object')}</th>
                  <th>{t('packages_dag_alarm_receiver_col_type')}</th>
                  <th>{t('packages_dag_alarm_receiver_col_status')}</th>
                </tr>
              </thead>
              <tbody>
                {previewInvalid.value.map((item, index) => (
                  <tr key={`${item.type || ''}-${item.id || index}`}>
                    <td>{item.id || '-'}</td>
                    <td>{typeLabel(item.type)}</td>
                    <td class="is-danger">
                      {t('packages_dag_alarm_receiver_deleted')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {showSystemDefaultEmpty && (
            <div class="alarm-receiver-empty-banner">
              {t('packages_dag_alarm_receiver_system_empty')}
            </div>
          )}
          {previewCount.value !== null && (
            <div class="alarm-receiver-preview-bar">
              <span>
                {t('packages_dag_alarm_receiver_preview', {
                  count: previewCount.value,
                })}
              </span>
              <ElButton
                text
                type="primary"
                onClick={() => {
                  detailOpen.value = !detailOpen.value
                }}
              >
                {detailOpen.value
                  ? t('packages_dag_alarm_receiver_preview_hide')
                  : t('packages_dag_alarm_receiver_preview_detail')}
              </ElButton>
            </div>
          )}
          {detailOpen.value && (
            <div class="alarm-receiver-preview-detail">
              {previewEmails.value.length ? (
                previewEmails.value.map((item) => (
                  <div key={item.email} class="alarm-receiver-preview-email">
                    <span>{item.email}</span>
                    <span>{(item.sources || []).join('、')}</span>
                  </div>
                ))
              ) : (
                <div>
                  {mode.value === 'SYSTEM_DEFAULT'
                    ? t('packages_dag_alarm_receiver_system_empty')
                    : t('packages_dag_alarm_receiver_empty_warning')}
                </div>
              )}
            </div>
          )}
          {previewFailed.value && (
            <div class="flex align-center gap-2 fs-7">
              <span>{t('packages_dag_alarm_receiver_preview_failed')}</span>
              <ElButton text type="primary" onClick={() => loadPreview()}>
                {t('public_button_retry')}
              </ElButton>
            </div>
          )}
        </div>
      )
    }
  },
})

export const AlarmReceiverField = observer(AlarmReceiverFieldComponent)
