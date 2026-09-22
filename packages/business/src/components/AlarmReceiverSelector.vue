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
const groupKeyword = ref('')
const userKeyword = ref('')
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
  const keyword = userKeyword.value.trim().toLowerCase()
  if (!keyword) return users.value
  return users.value.filter((user) => {
    return [user.username, user.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
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

watch(groupKeyword, (value) => {
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

function tagLabel(item: AlarmReceiver) {
  if (item.type === 'USER_GROUP') {
    return groupMap.value[item.id || '']?.name || item.id || ''
  }
  if (item.type === 'USER') {
    const user = userMap.value[item.id || '']
    if (!user) return item.id || ''
    if (!user.email) return user.username || user.id
    return t('packages_dag_alarm_receiver_user_with_email', {
      username: user.username || user.id,
      email: user.email,
    })
  }
  return item.email || ''
}

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
      <ElTag
        v-for="(item, index) in modelValue"
        :key="tagKey(item, index)"
        :closable="!disabled"
        :type="item.type === 'EMAIL' ? 'info' : undefined"
        @close="removeReceiver(index)"
      >
        {{ tagLabel(item) }}
      </ElTag>
    </div>

    <ElAlert v-if="loadError" type="error" :closable="false" show-icon>
      <div class="alarm-receiver-alert">
        <span>{{ $t('packages_dag_alarm_receiver_candidates_failed') }}</span>
        <ElButton text type="primary" @click="loadCandidates">
          {{ $t('public_button_retry') }}
        </ElButton>
      </div>
    </ElAlert>

    <div v-loading="loading">
      <ElTabs v-model="activeTab">
        <ElTabPane
          :label="$t('packages_dag_alarm_receiver_tab_group')"
          name="group"
        >
          <ElInput
            v-model="groupKeyword"
            class="mb-2"
            clearable
            :placeholder="$t('packages_dag_alarm_receiver_search_group')"
          />
          <div class="alarm-receiver-panel">
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
                      $t('packages_dag_alarm_receiver_group_meta', {
                        count: data.validEmailCount || 0,
                      })
                    }}
                  </span>
                  <span
                    v-if="!data.validEmailCount"
                    class="alarm-receiver-group-warning"
                  >
                    {{ $t('packages_dag_alarm_receiver_no_valid_email') }}
                  </span>
                </div>
              </template>
            </ElTree>
            <div v-else class="alarm-receiver-empty">
              {{ $t('packages_dag_alarm_receiver_no_group') }}
            </div>
          </div>
        </ElTabPane>
        <ElTabPane
          :label="$t('packages_dag_alarm_receiver_tab_user')"
          name="user"
        >
          <ElInput
            v-model="userKeyword"
            class="mb-2"
            clearable
            :placeholder="$t('packages_dag_alarm_receiver_search_user')"
          />
          <div class="alarm-receiver-panel">
            <ElCheckbox
              v-for="user in filteredUsers"
              :key="user.id"
              class="alarm-receiver-user"
              :model-value="isUserSelected(user.id)"
              :disabled="disabled"
              @change="(checked) => toggleUser(user, !!checked)"
            >
              {{ userLabel(user) }}
            </ElCheckbox>
            <div v-if="!filteredUsers.length" class="alarm-receiver-empty">
              {{ $t('packages_dag_alarm_receiver_no_user') }}
            </div>
          </div>
        </ElTabPane>
        <ElTabPane
          :label="$t('packages_dag_alarm_receiver_tab_email')"
          name="email"
        >
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
        </ElTabPane>
      </ElTabs>
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
  gap: 6px;
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
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
  line-height: 1.4;
  white-space: normal;
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
