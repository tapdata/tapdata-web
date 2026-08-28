<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'

interface UserOperationRecord {
  email?: string
  eventType?: string
  outcome?: string
  objectName?: unknown
  ip?: string
  failureReason?: string
  changeSummary?: string
  componentType?: string
  instanceName?: string
  i18nMessage?: string
  modular?: string
  operation?: string
  parameter1?: unknown
  sourceId?: number | string
  sourceName?: unknown
  user?: unknown
  username?: unknown
  [key: string]: unknown
}

const SOURCE_ROUTE_MAP: Record<string, string> = {
  sync: 'TaskMonitor',
  dataflow: 'TaskMonitor',
  migrate: 'MigrationMonitor',
  migration: 'MigrationMonitor',
  connection: 'connectionsEdit',
  LogCoLLector: 'SharedMiningMonitor',
  LogCollector: 'SharedMiningMonitor',
  logCollector: 'SharedMiningMonitor',
  mem_cache: 'SharedCacheMonitor',
  shareCache: 'SharedCacheMonitor',
  connHeartbeat: 'HeartbeatMonitor',
}

const props = defineProps<{
  record: UserOperationRecord
}>()

const router = useRouter()
const { t } = useI18n()

const LOGIN_FAILURE_REASON_KEYS: Record<string, string> = {
  credential_parse_failed: 'audit_login_failure_credential_parse',
  external_identity_validation_failed: 'audit_login_failure_external_identity',
  credential_validation_failed: 'audit_login_failure_credentials',
  user_pending_approval: 'audit_login_failure_pending_approval',
  user_disabled: 'audit_login_failure_user_disabled',
  too_many_login_failures: 'audit_login_failure_too_many_attempts',
}

const SERVICE_FAILURE_REASON_KEYS: Record<string, string> = {
  abnormal_service_stop_detected:
    'audit_service_failure_abnormal_stop_detected',
  abnormal_stop_handling_failed: 'audit_service_failure_abnormal_stop_handling',
  service_operation_failed: 'audit_service_failure_operation',
  cluster_node_not_found: 'audit_service_failure_cluster_node_not_found',
  cluster_service_operation_failed: 'audit_service_failure_cluster_operation',
  service_stop_failed: 'audit_service_failure_stop',
  service_status_update_failed: 'audit_service_failure_status_update',
}

const CONFIGURATION_OBJECT_KEYS: Record<string, string> = {
  systemSettings: 'audit_system_configuration',
  alarmSettings: 'audit_alarm_configuration',
}

const sourceId = computed(() => props.record.sourceId)
const hasSourceId = computed(
  () =>
    sourceId.value !== undefined &&
    sourceId.value !== null &&
    sourceId.value !== '',
)

const sourceRouteName = computed(() => {
  const modular = toText(props.record.modular)
  return modular ? SOURCE_ROUTE_MAP[modular] : ''
})

const canOpenSource = computed(
  () => hasSourceId.value && !!sourceRouteName.value,
)

const auditValues = computed(() => {
  const action = toText(props.record.operation)
  const actionKey = `notification_operation_${action}`
  const translatedAction = action ? t(actionKey) : ''
  let actionText =
    translatedAction && translatedAction !== actionKey
      ? translatedAction.trim()
      : `${t('audit_message_action')} ${action || t('audit_unknown')}`
  const auditActionKeyMap: Record<string, string> = {
    createUser: 'audit_action_create_user',
    updateUser: 'audit_action_update_user',
    disableUser: 'audit_action_disable_user',
    enableUser: 'audit_action_enable_user',
    grantRole: 'audit_action_grant_role',
    revokeRole: 'audit_action_revoke_role',
    abnormalStop: 'audit_action_abnormal_stop',
    restart: 'audit_action_restart_service',
  }
  if (auditActionKeyMap[action]) {
    actionText = t(auditActionKeyMap[action])
  }
  const isLoginAction = action === 'login'
  const isLogoutAction = action === 'logout'
  if (isLoginAction) {
    actionText = t('audit_action_login_system')
  } else if (isLogoutAction) {
    actionText = t('audit_action_logout_system')
  } else if (
    action === 'save' &&
    props.record.eventType === 'configurationChange'
  ) {
    actionText = t('audit_action_save')
  }
  let objectName = toText(props.record.objectName || props.record.parameter1)
  if (props.record.eventType === 'configurationChange') {
    const objectKey = CONFIGURATION_OBJECT_KEYS[objectName]
    objectName = objectKey
      ? t(objectKey)
      : objectName || t('audit_system_configuration')
  }
  const componentType = toText(props.record.componentType)
  if (props.record.eventType === 'serviceLifecycle' && componentType) {
    const componentKeyMap: Record<string, string> = {
      engine: 'cluster_sync_gover',
      backend: 'cluster_sync_gover',
      management: 'cluster_manage_sys',
      apiServer: 'audit_cluster_api_server',
    }
    const componentKey = componentKeyMap[componentType]
    const componentName = componentKey
      ? t(componentKey)
      : t('audit_cluster_custom_component', { componentType })
    const instanceName = toText(props.record.instanceName)
    objectName = instanceName
      ? t('audit_cluster_component_instance', {
          component: componentName,
          instance: instanceName,
        })
      : componentName
  }
  const targetName =
    props.record.operation === 'copy' ? toText(props.record.parameter2) : ''
  const modular =
    props.record.modular === 'migrate' ? 'migration' : props.record.modular
  const modularKey = `notification_modular_${modular}`
  const translatedModular = modular ? t(modularKey) : ''
  const modularText =
    modular && modular !== 'system' && translatedModular !== modularKey
      ? translatedModular.trim()
      : ''
  const eventTypeKeyMap: Record<string, string> = {
    login: 'audit_event_login',
    adminOperation: 'audit_event_admin',
    configurationChange: 'audit_event_config',
    serviceLifecycle: 'audit_event_service',
    userOperation: 'audit_event_other',
  }
  const eventTypeKey = eventTypeKeyMap[toText(props.record.eventType)]
  const roleName = toText(props.record.changeSummary).replace(/^roles=/, '')

  return {
    action: actionText,
    module: modularText,
    object: objectName || t('audit_unknown'),
    target: targetName,
    role: roleName || t('audit_unknown'),
    isRoleAssignment: action === 'grantRole' || action === 'revokeRole',
    showObject: !isLoginAction && !isLogoutAction,
    eventType: eventTypeKey ? t(eventTypeKey) : t('audit_unknown'),
    outcome: props.record.outcome
      ? t(`audit_outcome_${props.record.outcome}`)
      : t('audit_unknown'),
    ip: props.record.ip || t('audit_unavailable'),
    failureReason: getFailureReasonLabel(props.record.failureReason),
  }
})

const message = computed(() => {
  if (props.record.eventType) {
    const auditMetadata = [
      `，${t('audit_event_type')} {eventType}`,
      `，${t('audit_outcome')} {outcome}`,
      auditValues.value.failureReason
        ? `，${t('audit_failure_reason')} {failureReason}`
        : '',
      `，${t('audit_source_ip')} {ip}`,
    ]
    if (auditValues.value.isRoleAssignment) {
      return [
        t('audit_message_user'),
        ' {user}',
        '{action}',
        '{object}',
        ' ',
        t('audit_role'),
        ' {role}',
        ...auditMetadata,
      ].join('')
    }
    return [
      t('audit_message_user'),
      ' {user}',
      '{action}',
      auditValues.value.module ? '{module}' : '',
      auditValues.value.showObject ? '{object}' : '',
      auditValues.value.target ? ` ${t('audit_copy_as')} {target}` : '',
      ...auditMetadata,
    ].join('')
  }

  if (props.record.i18nMessage) {
    return props.record.i18nMessage
  }

  const modular =
    props.record.modular === 'migrate' ? 'migration' : props.record.modular

  return [
    `${t('notification_account')} `,
    '{user}',
    t(`notification_operation_${props.record.operation}`),
    `${t(`notification_modular_${modular}`)} `,
    '{sourceName}',
  ].join('')
})

const UserOperationContent = () => renderMessage()

function renderMessage() {
  return message.value.split(/(\{[^{}]+\})/g).map((chunk) => {
    const key = chunk.match(/^\{([^{}]+)\}$/)?.[1]?.trim()
    if (!key) return chunk

    const text = getPlaceholderText(key)
    return renderPlaceholder(key, text || chunk, !!text)
  })
}

function renderPlaceholder(key: string, text: string, replaced: boolean) {
  if (
    (key === 'parameter1' || key === 'object') &&
    replaced &&
    canOpenSource.value
  ) {
    return h(
      ElLink,
      {
        class: 'user-operation-link color-primary',
        underline: true,
        type: 'primary',
        onClick: (event: MouseEvent) => {
          event.stopPropagation()
          openSource()
        },
      },
      () => [
        text,
        h(
          ElIcon,
          {
            class: 'user-operation-link-icon ml-1',
            size: 16,
          },
          () => h(IconLucideExternalLink),
        ),
      ],
    )
  }

  let className = replaced ? 'color-primary' : ''
  const style: Record<string, string> = {}
  if (props.record.eventType) {
    if (key === 'user') {
      style.color = 'var(--color-primary)'
      style.marginRight = '4px'
    }
    if (key === 'action') {
      className = ''
      style.color = 'var(--text-normal)'
      if (auditValues.value.module || auditValues.value.showObject) {
        style.marginRight = '4px'
      }
    }
    if (key === 'module') {
      className = ''
      style.color = 'var(--text-normal)'
      style.marginRight = '4px'
    }
    if (key === 'eventType') {
      className = ''
      style.color = 'var(--text-light)'
    }
    if (key === 'outcome' || key === 'failureReason') {
      className = ''
      style.color =
        props.record.outcome === 'failure'
          ? 'var(--el-color-danger)'
          : 'var(--el-color-success)'
    }
    if (key === 'ip') {
      className = ''
      style.color = 'var(--text-light)'
    }
    if (key === 'object' || key === 'target' || key === 'role') {
      style.color = 'var(--color-primary)'
    }
  }

  return h('span', { class: className, style }, text)
}

function toText(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value)
}

function getFailureReasonLabel(reason: unknown) {
  const value = toText(reason)
  if (!value) return value
  const reasonKeys =
    props.record.eventType === 'login'
      ? LOGIN_FAILURE_REASON_KEYS
      : props.record.eventType === 'serviceLifecycle'
        ? SERVICE_FAILURE_REASON_KEYS
        : undefined
  const key = reasonKeys?.[value]
  return key ? t(key) : value
}

function getPlaceholderText(key: string) {
  if (key === 'user') {
    const username = toText(props.record.username)
    const email = toText(props.record.email)
    const user = username.includes('*') && email ? email : username || email
    return user === 'UNAUTHENTICATED' ? t('audit_unauthenticated') : user
  }

  if (props.record.eventType && key in auditValues.value) {
    return toText(auditValues.value[key as keyof typeof auditValues.value])
  }

  return toText(props.record[key])
}

function openSource() {
  if (!canOpenSource.value) return

  const route = router.resolve({
    name: sourceRouteName.value,
    params: {
      id: sourceId.value,
    },
  })

  window.open(route.href, '_blank')
}
</script>

<template>
  <div
    class="user-operation-wrap flex flex-fill flex-wrap align-center text-prewrap lh-bae min-w-0 break-all"
  >
    <UserOperationContent />
  </div>
</template>
