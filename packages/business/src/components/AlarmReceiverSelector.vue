<script setup lang="ts">
import {
  fetchAlarmReceiverCandidates,
  type AlarmReceiver,
  type AlarmReceiverCandidateGroup,
  type AlarmReceiverCandidateUser,
} from '@tap/api/src/core/alarm'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'

type GroupNode = {
  id: string
  name: string
  gid?: string
  parentId?: string
  validEmailCount: number
  children?: GroupNode[]
}

const EMAIL_SPLIT = /[,;\n\r，；]+/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
const EXTERNAL_EMAIL_WARNED_KEY = 'tapdata.alarmReceiver.externalEmailWarned'

let memoryExternalEmailWarned = false

const props = withDefaults(
  defineProps<{
    modelValue?: AlarmReceiver[]
    taskId?: string
    taskIds?: string[]
    taskName?: string
    disabled?: boolean
  }>(),
  {
    modelValue: () => [],
    taskId: '',
    taskIds: () => [],
    taskName: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: AlarmReceiver[]]
  invalidChange: [value: boolean]
}>()

const { t } = useI18n()

const activeTab = ref('group')
const loading = ref(false)
const loadError = ref(false)
const candidatesLoaded = ref(false)
const users = ref<AlarmReceiverCandidateUser[]>([])
const groups = ref<AlarmReceiverCandidateGroup[]>([])
const keyword = ref('')
const emailDraft = ref('')
const invalidTokens = ref<string[]>([])
const treeRef = ref()
let syncingTree = false

const groupTree = computed(() => buildGroupTree(groups.value))
const userMap = computed(() => {
  return users.value.reduce<Record<string, AlarmReceiverCandidateUser>>(
    (result, user) => {
      if (user.id) result[user.id] = user
      return result
    },
    {},
  )
})
const groupMap = computed(() => {
  return groups.value.reduce<Record<string, AlarmReceiverCandidateGroup>>(
    (result, group) => {
      if (group.id) result[group.id] = group
      return result
    },
    {},
  )
})
const filteredUsers = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return users.value
  return users.value.filter((user) => {
    return [user.username, user.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(text))
  })
})
const selectedUserIds = computed(() => {
  return new Set(
    props.modelValue
      .filter((item) => item.type === 'USER' && item.id)
      .map((item) => item.id as string),
  )
})

watch(
  () => [props.taskId, props.taskIds.filter(Boolean).join(',')] as const,
  () => {
    void loadCandidates()
  },
  { immediate: true },
)

watch(keyword, (value) => {
  treeRef.value?.filter(value)
})

watch(
  [() => props.modelValue, groupTree],
  async () => {
    await syncCheckedGroups()
  },
  { deep: true },
)

function publishInvalid() {
  emit('invalidChange', invalidTokens.value.length > 0)
}

function buildGroupTree(items: AlarmReceiverCandidateGroup[]) {
  const nodes = items
    .filter((item) => item?.id)
    .map((item) => ({
      id: item.id,
      name: item.name || item.id,
      gid: item.gid,
      parentId:
        item.parentId ||
        (item as AlarmReceiverCandidateGroup & { parent_id?: string })
          .parent_id ||
        '',
      validEmailCount: Number(item.validEmailCount) || 0,
      children: [] as GroupNode[],
    }))
  const map = nodes.reduce<Record<string, GroupNode>>((result, node) => {
    result[node.id] = node
    return result
  }, {})
  const roots: GroupNode[] = []
  nodes.forEach((node) => {
    const parent = node.parentId ? map[node.parentId] : undefined
    if (parent && parent !== node) parent.children.push(node)
    else roots.push(node)
  })
  const compact = (list: GroupNode[]): GroupNode[] => {
    return list.map((node) => {
      const children = node.children.length ? compact(node.children) : undefined
      return {
        ...node,
        children,
      }
    })
  }
  return compact(roots)
}

function filterGroup(value: string, data: GroupNode) {
  if (!value) return true
  return data.name.toLowerCase().includes(value.trim().toLowerCase())
}

async function syncCheckedGroups() {
  await nextTick()
  if (!treeRef.value) return
  syncingTree = true
  const keys = props.modelValue
    .filter((item) => item.type === 'USER_GROUP' && item.id)
    .map((item) => item.id as string)
  treeRef.value.setCheckedKeys(keys, false)
  await nextTick()
  syncingTree = false
}

async function loadCandidates() {
  loading.value = true
  loadError.value = false
  try {
    const data = await fetchAlarmReceiverCandidates({
      taskId: props.taskId || undefined,
      taskIds: props.taskIds.length ? props.taskIds : undefined,
    })
    users.value = Array.isArray(data?.users) ? data.users : []
    groups.value = Array.isArray(data?.groups) ? data.groups : []
    candidatesLoaded.value = true
  } catch (error) {
    console.error(error)
    loadError.value = true
    candidatesLoaded.value = false
  } finally {
    loading.value = false
  }
}

function updateReceivers(next: AlarmReceiver[]) {
  emit('update:modelValue', next)
}

function onGroupCheck() {
  if (syncingTree) return
  if (props.disabled) {
    void syncCheckedGroups()
    return
  }
  const nodes = (treeRef.value?.getCheckedNodes(false, false) ||
    []) as GroupNode[]
  const groupReceivers: AlarmReceiver[] = nodes.map((node) => ({
    type: 'USER_GROUP',
    id: node.id,
  }))
  updateReceivers([
    ...groupReceivers,
    ...props.modelValue.filter((item) => item.type !== 'USER_GROUP'),
  ])
}

function isUserSelected(id: string) {
  return selectedUserIds.value.has(id)
}

function toggleUser(user: AlarmReceiverCandidateUser, checked: boolean) {
  const others = props.modelValue.filter(
    (item) => item.type !== 'USER' || item.id !== user.id,
  )
  updateReceivers(checked ? [...others, { type: 'USER', id: user.id }] : others)
}

function removeReceiver(index: number) {
  updateReceivers(
    props.modelValue.filter((_, itemIndex) => itemIndex !== index),
  )
}

function parentIdOf(group?: AlarmReceiverCandidateGroup) {
  if (!group) return ''
  return (
    group.parentId ||
    (group as AlarmReceiverCandidateGroup & { parent_id?: string }).parent_id ||
    ''
  )
}

function groupPath(id?: string) {
  const names: string[] = []
  const seen = new Set<string>()
  let current = id ? groupMap.value[id] : undefined
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    names.unshift(current.name || current.id)
    const parentId = parentIdOf(current)
    current = parentId ? groupMap.value[parentId] : undefined
  }
  return names.join(' / ')
}

function directChildCount(id?: string) {
  if (!id) return 0
  return groups.value.filter((group) => parentIdOf(group) === id).length
}

function tagLabel(item: AlarmReceiver) {
  if (item.type === 'USER_GROUP') {
    const name = groupMap.value[item.id || '']?.name || item.id || ''
    return t('packages_dag_alarm_receiver_group_chip', { name })
  }
  if (item.type === 'USER') {
    const user = userMap.value[item.id || '']
    return user?.username || user?.email || item.id || ''
  }
  return item.email || ''
}

function groupTip(item: AlarmReceiver) {
  const id = item.id || ''
  const path = groupPath(id) || tagLabel(item)
  return t('packages_dag_alarm_receiver_group_tip', {
    path,
    count: groupMap.value[id]?.validEmailCount || 0,
    children: directChildCount(id),
  })
}

function receiverNames() {
  return props.modelValue
    .map((item) => tagLabel(item))
    .filter(Boolean)
    .join('、')
}

defineExpose({
  receiverNames,
})

function tagKey(item: AlarmReceiver, index: number) {
  return `${item.type}-${item.id || item.email || index}`
}

function splitEmails(text: string) {
  return text
    .split(EMAIL_SPLIT)
    .map((item) => item.trim())
    .filter(Boolean)
}

function hasWarnedExternalEmail() {
  if (memoryExternalEmailWarned) return true
  try {
    return localStorage.getItem(EXTERNAL_EMAIL_WARNED_KEY) === '1'
  } catch {
    return false
  }
}

function markExternalEmailWarned() {
  memoryExternalEmailWarned = true
  try {
    localStorage.setItem(EXTERNAL_EMAIL_WARNED_KEY, '1')
  } catch {
    // localStorage can be unavailable; the in-memory flag still limits this page.
  }
}

function warnExternalEmails(emails: string[]) {
  if (!candidatesLoaded.value || hasWarnedExternalEmail()) return
  const known = new Set(
    users.value
      .map((user) => user.email?.trim().toLowerCase())
      .filter((email): email is string => !!email),
  )
  const hasExternal = emails.some((email) => !known.has(email.toLowerCase()))
  if (!hasExternal) return
  markExternalEmailWarned()
  ElMessage.warning(
    props.taskName
      ? t('packages_dag_alarm_receiver_external_email_named', {
          name: props.taskName,
        })
      : t('packages_dag_alarm_receiver_external_email'),
  )
}

function commitEmails(text: string, includeTail: boolean) {
  const parts = splitEmails(text)
  const endsWithSeparator = /[,;\n\r，；]\s*$/.test(text)
  let tail = ''
  if (!includeTail && parts.length && !endsWithSeparator) {
    tail = parts.pop() || ''
  }
  const valid: string[] = []
  const invalid: string[] = []
  parts.forEach((part) => {
    if (EMAIL_PATTERN.test(part)) valid.push(part)
    else invalid.push(part)
  })
  const existingEmails = new Set(
    props.modelValue
      .filter((item) => item.type === 'EMAIL' && item.email)
      .map((item) => String(item.email).toLowerCase()),
  )
  const added = valid.filter((email) => {
    const key = email.toLowerCase()
    if (existingEmails.has(key)) return false
    existingEmails.add(key)
    return true
  })
  invalidTokens.value = Array.from(
    new Set([...invalidTokens.value, ...invalid]),
  )
  publishInvalid()
  if (added.length) {
    warnExternalEmails(added)
    updateReceivers([
      ...props.modelValue,
      ...added.map((email) => ({ type: 'EMAIL' as const, email })),
    ])
  }
  emailDraft.value = tail
}

function onEmailInput(value: string) {
  emailDraft.value = value
  if (EMAIL_SPLIT.test(value)) commitEmails(value, false)
}

function onEmailBlur() {
  if (!emailDraft.value.trim()) return
  commitEmails(emailDraft.value, true)
}

function removeInvalid(token: string) {
  invalidTokens.value = invalidTokens.value.filter((item) => item !== token)
  publishInvalid()
}

function userLabel(user: AlarmReceiverCandidateUser) {
  if (!user.email) return user.username || user.id
  return t('packages_dag_alarm_receiver_user_with_email', {
    username: user.username || user.id,
    email: user.email,
  })
}
</script>

<template>
  <div class="alarm-receiver-selector">
    <div v-if="modelValue.length" class="alarm-receiver-tags">
      <span
        v-for="(item, index) in modelValue"
        :key="tagKey(item, index)"
        class="alarm-receiver-chip"
        :class="`is-${item.type}`"
      >
        <svg
          v-if="item.type === 'USER_GROUP'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <circle cx="5.5" cy="6" r="2" />
          <circle cx="10.5" cy="6.5" r="1.6" />
          <path d="M1.5 13c.4-2 2-3 4-3s3.6 1 4 3" />
          <path d="M9 13c.3-1.4 1.4-2.2 2.8-2.2 1.2 0 2.2.6 2.7 2.2" />
        </svg>
        <svg
          v-else-if="item.type === 'USER'"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <circle cx="8" cy="5.5" r="2.2" />
          <path d="M3 13.2c.6-2.3 2.4-3.4 5-3.4s4.4 1.1 5 3.4" />
        </svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="4" width="12" height="8" rx="1.2" />
          <path d="M2.5 4.8 8 9l5.5-4.2" />
        </svg>
        <ElTooltip
          v-if="item.type === 'USER_GROUP'"
          :content="groupTip(item)"
          placement="top"
        >
          <span>{{ tagLabel(item) }}</span>
        </ElTooltip>
        <span v-else>{{ tagLabel(item) }}</span>
        <button
          v-if="!disabled"
          type="button"
          class="alarm-receiver-chip-remove"
          @click="removeReceiver(index)"
        >
          ×
        </button>
      </span>
    </div>

    <ElInput
      v-model="keyword"
      clearable
      :placeholder="$t('packages_dag_alarm_receiver_search')"
    />

    <ElAlert v-if="loadError" type="error" :closable="false" show-icon>
      <div class="alarm-receiver-alert">
        <span>{{ $t('packages_dag_alarm_receiver_candidates_failed') }}</span>
        <ElButton text type="primary" @click="loadCandidates">
          {{ $t('public_button_retry') }}
        </ElButton>
      </div>
    </ElAlert>

    <div v-loading="loading" class="alarm-receiver-picker">
      <div class="alarm-receiver-tabs">
        <button
          v-for="tab in ['group', 'user', 'email']"
          :key="tab"
          type="button"
          :class="{ 'is-active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ $t(`packages_dag_alarm_receiver_tab_${tab}`) }}
        </button>
      </div>

      <div v-show="activeTab === 'group'" class="alarm-receiver-panel">
        <ElTree
          v-if="groupTree.length"
          ref="treeRef"
          :class="{ 'is-locked': disabled }"
          :data="groupTree"
          node-key="id"
          show-checkbox
          check-strictly
          default-expand-all
          :props="{ label: 'name', children: 'children' }"
          :filter-node-method="filterGroup"
          @check="onGroupCheck"
        >
          <template #default="{ data }">
            <div class="alarm-receiver-group-node">
              <span>{{ data.name }}</span>
              <span class="alarm-receiver-group-meta">
                {{
                  $t('packages_dag_alarm_receiver_group_emails', {
                    count: data.validEmailCount || 0,
                  })
                }}
                <template v-if="data.children?.length">
                  ·
                  {{
                    $t('packages_dag_alarm_receiver_group_children', {
                      count: data.children.length,
                    })
                  }}
                </template>
                <span
                  v-if="!data.validEmailCount"
                  class="alarm-receiver-group-warning"
                >
                  {{ $t('packages_dag_alarm_receiver_no_valid_email') }}
                </span>
              </span>
            </div>
          </template>
        </ElTree>
        <div v-else class="alarm-receiver-empty">
          {{ $t('packages_dag_alarm_receiver_no_group') }}
        </div>
      </div>

      <div v-show="activeTab === 'user'" class="alarm-receiver-panel">
        <ElCheckbox
          v-for="user in filteredUsers"
          :key="user.id"
          class="alarm-receiver-user"
          :model-value="isUserSelected(user.id)"
          :disabled="disabled"
          @change="(checked) => toggleUser(user, !!checked)"
        >
          <span>{{ user.username || user.id }}</span>
          <span v-if="user.email" class="alarm-receiver-user-email">
            {{ user.email }}
          </span>
        </ElCheckbox>
        <div v-if="!filteredUsers.length" class="alarm-receiver-empty">
          {{ $t('packages_dag_alarm_receiver_no_user') }}
        </div>
      </div>

      <div v-show="activeTab === 'email'" class="alarm-receiver-panel">
        <ElInput
          :model-value="emailDraft"
          type="textarea"
          :rows="3"
          :disabled="disabled"
          :placeholder="$t('packages_dag_alarm_receiver_email_placeholder')"
          @update:model-value="onEmailInput"
          @blur="onEmailBlur"
        />
        <div v-if="invalidTokens.length" class="alarm-receiver-invalid-list">
          <div
            v-for="token in invalidTokens"
            :key="token"
            class="alarm-receiver-invalid"
          >
            <span>{{ token }}</span>
            <span>{{ $t('packages_dag_alarm_receiver_email_invalid') }}</span>
            <ElButton
              v-if="!disabled"
              text
              type="danger"
              @click="removeInvalid(token)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.alarm-receiver-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.alarm-receiver-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.alarm-receiver-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 6px;
  background: #eef5ff;
  color: var(--el-color-primary);
  font-size: 13px;
  line-height: 22px;
}

.alarm-receiver-chip svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  flex: none;
}

.alarm-receiver-chip.is-EMAIL {
  background: #f4f4f5;
  color: var(--el-text-color-regular);
}

.alarm-receiver-chip-remove {
  border: 0;
  padding: 0 0 0 2px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  line-height: 1;
}

.alarm-receiver-picker {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 8px 12px 12px;
}

.alarm-receiver-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.alarm-receiver-tabs button {
  border: 0;
  padding: 4px 0;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}

.alarm-receiver-tabs button.is-active {
  color: var(--el-color-primary);
  box-shadow: inset 0 -2px 0 var(--el-color-primary);
}

.alarm-receiver-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.alarm-receiver-panel {
  max-height: 280px;
  overflow: auto;
}

.alarm-receiver-group-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding-right: 8px;
  line-height: 1.4;
}

.alarm-receiver-group-meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.alarm-receiver-group-warning {
  color: var(--el-color-warning);
  font-size: 12px;
}

.alarm-receiver-user {
  display: flex;
  height: auto;
  margin-right: 0;
  padding: 4px 0;
  white-space: normal;
}

.alarm-receiver-user-email {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.alarm-receiver-empty {
  padding: 12px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.alarm-receiver-invalid-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.alarm-receiver-invalid {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1.4;
}

.is-locked {
  pointer-events: none;
}

:deep(.el-tree-node__content) {
  height: auto;
  align-items: flex-start;
  min-height: 32px;
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
