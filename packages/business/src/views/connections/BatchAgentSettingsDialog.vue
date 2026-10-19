<script setup lang="ts">
import { action } from '@formily/reactive'
import SchemaToForm from '@tap/form/src/SchemaToForm.vue'
import { useI18n } from '@tap/i18n'
import { uuid } from '@tap/shared'
import { computed, ref } from 'vue'
import {
  AGENT_GROUP_ALLOCATION,
  AUTOMATIC_AGENT_ALLOCATION,
  MANUAL_AGENT_ALLOCATION,
  createAgentSettingsProperties,
  loadAccessNodeOptions,
  type AgentAllocationType,
  type BatchAgentSettingsPayload,
} from './agentSettingsSchema'

interface ConnectionRow {
  id: string
  name?: string
  shareCdcEnable?: boolean
}

const emit = defineEmits<{
  submit: [payload: BatchAgentSettingsPayload]
}>()

const { t } = useI18n()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const visible = ref(false)
const selectedConnections = ref<ConnectionRow[]>([])
const schemaForm = ref<InstanceType<typeof SchemaToForm> | null>(null)
const formValues = ref<Record<string, any>>({})
const formKey = ref(0)

const schema = computed(() => ({
  type: 'object',
  properties: {
    __TAPDATA: {
      type: 'object',
      properties: {
        shareCdcEnable: {
          type: 'boolean',
          'x-display': 'hidden',
        },
        shareCDCExternalStorageId: {
          type: 'string',
          'x-display': 'hidden',
        },
        ...createAgentSettingsProperties((key) => t(key), isDaas),
      },
    },
  },
}))

const formScope = {
  $isDaas: isDaas,
  useAsyncDataSource: (
    service: (...args: any[]) => Promise<any>,
    fieldName = 'dataSource',
    ...serviceParams: any[]
  ) => {
    return (field: any) => {
      field.loading = true
      service({ field }, ...serviceParams).then(
        action.bound((data) => {
          if (fieldName === 'value') {
            field.setValue(data)
          } else {
            field[fieldName] = data
          }
          field.loading = false
        }),
      )
    }
  },
  loadAccessNode: loadAccessNodeOptions,
}

const open = (connections: ConnectionRow[]) => {
  selectedConnections.value = [...connections]
  const hasSharedCdcConnection = connections.some(
    (connection) => connection.shareCdcEnable,
  )
  const requiresManualAgent = !isDaas && hasSharedCdcConnection

  formValues.value = {
    __TAPDATA: {
      shareCdcEnable: hasSharedCdcConnection,
      shareCDCExternalStorageId: '',
      accessNodeType: requiresManualAgent
        ? MANUAL_AGENT_ALLOCATION
        : AUTOMATIC_AGENT_ALLOCATION,
      accessNodeProcessId: '',
      priorityProcessId: '',
    },
  }
  formKey.value += 1
  visible.value = true
}

const handleClose = () => {
  visible.value = false
  selectedConnections.value = []
}

const handleSubmit = async () => {
  const form = schemaForm.value?.getForm()
  if (!form) return

  try {
    await form.validate()
  } catch {
    document
      .querySelector('.formily-element-plus-form-item-error')
      ?.scrollIntoView({ block: 'center' })
    return
  }

  const { __TAPDATA = {} } = schemaForm.value?.getFormValues() || {}
  const accessNodeType = __TAPDATA.accessNodeType as AgentAllocationType
  const usesAgent = accessNodeType !== AUTOMATIC_AGENT_ALLOCATION
  const payload: BatchAgentSettingsPayload = {
    requestId: uuid(),
    connectionIds: selectedConnections.value.map(({ id }) => id),
    settings: {
      accessNodeType,
      accessNodeProcessId: usesAgent
        ? __TAPDATA.accessNodeProcessId || null
        : null,
      priorityProcessId:
        accessNodeType === AGENT_GROUP_ALLOCATION
          ? __TAPDATA.priorityProcessId || null
          : null,
    },
  }

  emit('submit', payload)
}

defineExpose({ open, close: handleClose })
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="t('packages_business_agent_settings_dialog_title')"
    width="560px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @closed="handleClose"
  >
    <div class="mb-4 text-muted">
      {{
        t('packages_business_agent_settings_dialog_subtitle', {
          count: selectedConnections.length,
        })
      }}
    </div>
    <SchemaToForm
      :key="formKey"
      ref="schemaForm"
      :schema="schema"
      :scope="formScope"
      :value="formValues"
      layout="vertical"
      label-width="100%"
      class="w-100"
    />
    <template #footer>
      <ElButton @click="handleClose">{{ t('public_button_cancel') }}</ElButton>
      <ElButton
        type="primary"
        :disabled="!selectedConnections.length"
        @click="handleSubmit"
      >
        {{ t('public_button_confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
