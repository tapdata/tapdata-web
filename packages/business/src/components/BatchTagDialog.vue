<script setup lang="ts">
import {
  createMetadataDefinition,
  fetchMetadataDefinitionTags,
} from '@tap/api/src/core/metadata-definitions'
import { batchApplyTaskListtags } from '@tap/api/src/core/task'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

type TagState = 'all' | 'some' | 'none'

interface TagItem {
  id: string
  value: string
  parent_id?: string
}

interface TaskTagItem {
  id: string
  value: string
  name?: string
}

interface TaskItem {
  id: string
  name?: string
  listtags?: TaskTagItem[]
}

interface SummaryItem {
  type: 'add' | 'remove'
  tag: TagItem
  count: number
}

interface Props {
  tagType?: string
  viewPage?: string
  submitTags?: (params: BatchTagSubmitParams) => Promise<any>
}

interface BatchTagSubmitParams {
  ids: string[]
  tags: Array<{
    id: string
    value: string
    desired: TagState
  }>
}

const props = withDefaults(defineProps<Props>(), {
  tagType: 'dataflow',
  viewPage: '',
  submitTags: batchApplyTaskListtags,
})

const emit = defineEmits<{
  saved: []
  tagCreated: []
  close: []
}>()

const { t } = useI18n()

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const creating = ref(false)
const searchValue = ref('')
const selectedTasks = ref<TaskItem[]>([])
const allTags = ref<TagItem[]>([])
const desiredStates = ref<Record<string, TagState>>({})
const currentTagType = ref('')

const normalizeName = (value: string) => value.trim().toLowerCase()
const getTagType = (type?: string) => type || props.viewPage || props.tagType

const flattenTags = (items: any[] = []) => {
  const result: TagItem[] = []

  const walk = (list: any[] = []) => {
    list.forEach((item) => {
      if (!item) return

      const { children, ...rest } = item
      result.push({
        id: rest.id,
        value: rest.value || rest.name || '',
        parent_id: rest.parent_id,
      })

      if (Array.isArray(children) && children.length) {
        walk(children)
      }
    })
  }

  walk(items)
  return result
}

const selectedTaskCount = computed(() => selectedTasks.value.length)

const tagUsageMap = computed(() => {
  const map = new Map<string, number>()

  selectedTasks.value.forEach((task) => {
    task.listtags?.forEach((tag) => {
      map.set(tag.id, (map.get(tag.id) || 0) + 1)
    })
  })

  return map
})

const initialState = (tagId: string): TagState => {
  const count = tagUsageMap.value.get(tagId) || 0

  if (!selectedTaskCount.value || !count) {
    return 'none'
  }

  if (count === selectedTaskCount.value) {
    return 'all'
  }

  return 'some'
}

const currentState = (tagId: string): TagState => {
  return desiredStates.value[tagId] || initialState(tagId)
}

const isModified = (tagId: string) => {
  return currentState(tagId) !== initialState(tagId)
}

const searchText = computed(() => searchValue.value.trim())
const normalizedSearch = computed(() => normalizeName(searchValue.value))

const filteredTags = computed(() => {
  if (!normalizedSearch.value) {
    return allTags.value
  }

  return allTags.value.filter((tag) =>
    normalizeName(tag.value).includes(normalizedSearch.value),
  )
})

const canCreateTag = computed(() => {
  if (!searchText.value) {
    return false
  }

  return !allTags.value.some(
    (tag) => normalizeName(tag.value) === normalizedSearch.value,
  )
})

const createTagName = computed(() => searchText.value)

const summaryItems = computed<SummaryItem[]>(() => {
  const items: SummaryItem[] = []

  allTags.value.forEach((tag) => {
    const state = currentState(tag.id)
    const count = tagUsageMap.value.get(tag.id) || 0

    if (state === 'all') {
      const addCount = selectedTaskCount.value - count
      if (addCount > 0) {
        items.push({ type: 'add', tag, count: addCount })
      }
    } else if (state === 'none' && count > 0) {
      items.push({ type: 'remove', tag, count })
    }
  })

  return items
})

const hasChanges = computed(() => summaryItems.value.length > 0)

const syncDesiredStates = () => {
  const next: Record<string, TagState> = {}

  allTags.value.forEach((tag) => {
    next[tag.id] = initialState(tag.id)
  })

  desiredStates.value = next
}

const loadTags = async (type?: string) => {
  loading.value = true

  try {
    const tagType = getTagType(type)
    currentTagType.value = tagType
    const data: any = await fetchMetadataDefinitionTags(tagType)
    const items = Array.isArray(data) ? data : data?.items || []
    allTags.value = flattenTags(items)
    syncDesiredStates()
  } catch (error) {
    console.error(error)
    ElMessage.error(t('public_message_operation_failed'))
  } finally {
    loading.value = false
  }
}

const setDesiredState = (tagId: string, state: TagState) => {
  desiredStates.value = {
    ...desiredStates.value,
    [tagId]: state,
  }
}

const toggleTag = (tag: TagItem) => {
  const initial = initialState(tag.id)
  const current = currentState(tag.id)

  if (initial === 'some') {
    const order: TagState[] = ['some', 'all', 'none']
    const nextState = order[(order.indexOf(current) + 1) % order.length]
    setDesiredState(tag.id, nextState)
    return
  }

  setDesiredState(tag.id, current === 'all' ? 'none' : 'all')
}

const getStateLabel = (tag: TagItem) => {
  const state = currentState(tag.id)
  const count = tagUsageMap.value.get(tag.id) || 0

  if (state === 'some') {
    return t('packages_business_batch_tag_dialog_state_some', {
      count,
      total: selectedTaskCount.value,
    })
  }

  if (state === 'all') {
    return isModified(tag.id)
      ? t('packages_business_batch_tag_dialog_state_add_all')
      : t('packages_business_batch_tag_dialog_state_all')
  }

  return isModified(tag.id)
    ? t('packages_business_batch_tag_dialog_state_remove_all')
    : ''
}

const exactTag = (value: string) => {
  const normalized = normalizeName(value)
  return allTags.value.find((tag) => normalizeName(tag.value) === normalized)
}

const createTag = async () => {
  const name = searchText.value
  if (!name || creating.value) return

  const existed = exactTag(name)
  if (existed) {
    setDesiredState(existed.id, 'all')
    searchValue.value = ''
    return
  }

  creating.value = true
  try {
    const tagType = currentTagType.value || getTagType()
    await createMetadataDefinition({
      item_type: [tagType],
      value: name,
    })
    await loadTags(tagType)
    const created = exactTag(name)
    if (created) {
      setDesiredState(created.id, 'all')
    }
    searchValue.value = ''
    emit('tagCreated')
    ElMessage.success(t('public_message_operation_success'))
  } catch (error) {
    console.error(error)
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    creating.value = false
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if ((event as any).isComposing || (event as any).keyCode === 229) return
  if (event.key !== 'Enter') return

  const name = searchText.value
  if (!name) return

  const existed = exactTag(name)
  if (existed) {
    setDesiredState(existed.id, 'all')
    searchValue.value = ''
    return
  }

  createTag()
}

const resetDialogState = () => {
  loading.value = false
  saving.value = false
  creating.value = false
  searchValue.value = ''
  selectedTasks.value = []
  allTags.value = []
  desiredStates.value = {}
  currentTagType.value = ''
}

const handleClosed = () => {
  resetDialogState()
  emit('close')
}

const closeDialog = () => {
  visible.value = false
}

const handleSave = async () => {
  if (!hasChanges.value || !selectedTasks.value.length) return

  saving.value = true
  try {
    await props.submitTags({
      ids: selectedTasks.value.map((task) => task.id),
      tags: allTags.value
        .filter((tag) => isModified(tag.id))
        .map((tag) => ({
          id: tag.id,
          value: tag.value,
          desired: currentState(tag.id),
        })),
    })
    ElMessage.success(t('public_message_save_ok'))
    emit('saved')
    closeDialog()
  } catch (error) {
    console.error(error)
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  closeDialog()
}

const open = async (tasks: TaskItem[], type?: string) => {
  selectedTasks.value = tasks.map((task) => ({
    ...task,
    listtags: (task.listtags || []).map((tag) => ({
      id: tag.id,
      value: tag.value || tag.name || '',
    })),
  }))
  searchValue.value = ''
  visible.value = true
  await loadTags(type)
}

defineExpose({
  open,
  close: handleClose,
})
</script>

<template>
  <el-dialog
    v-model="visible"
    class="batch-tag-dialog"
    width="560px"
    :show-close="false"
    :close-on-click-modal="true"
    :append-to-body="true"
    :destroy-on-close="true"
    @closed="handleClosed"
  >
    <template #header="{ titleClass }">
      <div class="batch-tag-dialog__header">
        <div class="flex justify-content-between">
          <div :class="titleClass">
            {{ t('packages_business_batch_tag_dialog_title') }}
          </div>
          <el-button text :disabled="loading || saving" @click="handleClose">
            <template #icon>
              <el-icon :size="18"><i-lucide-x /></el-icon>
            </template>
          </el-button>
        </div>
        <div class="batch-tag-dialog__subtitle">
          {{
            t('packages_business_batch_tag_dialog_subtitle', {
              count: selectedTaskCount,
            })
          }}
        </div>
      </div>
    </template>

    <div v-loading="loading || saving" class="batch-tag-dialog__body">
      <el-input
        v-model="searchValue"
        class="batch-tag-dialog__search"
        :placeholder="
          t('packages_business_batch_tag_dialog_search_placeholder')
        "
        clearable
        @keydown="handleSearchKeydown"
      >
        <template #prefix>
          <el-icon :size="16" class="batch-tag-dialog__search-icon">
            <i-lucide-search />
          </el-icon>
        </template>
      </el-input>

      <div class="batch-tag-dialog__list">
        <button
          v-if="searchText && canCreateTag"
          type="button"
          class="batch-tag-dialog__create-row flex align-center"
          :disabled="creating"
          @click="createTag"
        >
          <span class="batch-tag-dialog__tri batch-tag-dialog__tri--create">
            <el-icon :size="16"><i-lucide-plus /></el-icon>
          </span>
          <span class="batch-tag-dialog__create-text">
            {{
              t('packages_business_batch_tag_dialog_create_tag', {
                name: createTagName,
              })
            }}
          </span>
        </button>

        <button
          v-for="tag in filteredTags"
          :key="tag.id"
          type="button"
          class="batch-tag-dialog__row"
          :class="{ 'is-active': isModified(tag.id) }"
          @click="toggleTag(tag)"
        >
          <span
            class="batch-tag-dialog__tri"
            :class="`is-${currentState(tag.id)}`"
            aria-hidden="true"
          >
            <el-icon v-if="currentState(tag.id) === 'all'" :size="16">
              <i-lucide-check />
            </el-icon>
            <el-icon v-else-if="currentState(tag.id) === 'some'" :size="16">
              <i-lucide-minus />
            </el-icon>
          </span>

          <el-icon class="batch-tag-dialog__tag-icon" :size="16">
            <i-lucide-tag />
          </el-icon>

          <span class="batch-tag-dialog__name">{{ tag.value }}</span>

          <span
            class="batch-tag-dialog__state"
            :class="{ 'is-muted': !getStateLabel(tag) }"
          >
            {{ getStateLabel(tag) || ' ' }}
          </span>
        </button>

        <div
          v-if="!loading && !filteredTags.length && !canCreateTag"
          class="batch-tag-dialog__empty"
        >
          {{ t('packages_business_batch_tag_dialog_empty') }}
        </div>
      </div>

      <div class="batch-tag-dialog__summary p-3 rounded-xl">
        <template v-if="summaryItems.length">
          <div class="batch-tag-dialog__summary-title">
            {{ t('packages_business_batch_tag_dialog_summary_title') }}
          </div>
          <div class="flex flex-column gap-1">
            <div
              v-for="item in summaryItems"
              :key="`${item.type}-${item.tag.id}`"
              class="batch-tag-dialog__summary-item"
            >
              <el-tag
                size="small"
                :type="item.type === 'add' ? 'success' : 'danger'"
                effect="light"
                round
                class="batch-tag-dialog__summary-pill"
              >
                <el-icon :size="14" class="batch-tag-dialog__summary-pill-icon">
                  <i-lucide-plus v-if="item.type === 'add'" />
                  <i-lucide-minus v-else />
                </el-icon>
                {{
                  item.type === 'add'
                    ? t('packages_business_batch_tag_dialog_add')
                    : t('packages_business_batch_tag_dialog_remove')
                }}
              </el-tag>
              <span class="batch-tag-dialog__summary-name">{{
                item.tag.value
              }}</span>
              <el-icon :size="14" class="batch-tag-dialog__summary-arrow">
                <i-lucide-arrow-right />
              </el-icon>
              <span class="batch-tag-dialog__summary-count">
                {{
                  t('packages_business_batch_tag_dialog_task_count', {
                    count: item.count,
                  })
                }}
              </span>
            </div>
          </div>
        </template>

        <div v-else class="batch-tag-dialog__summary-empty">
          {{ t('packages_business_batch_tag_dialog_no_changes') }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ t('public_button_cancel') }}
      </el-button>
      <el-button
        type="primary"
        :disabled="!hasChanges"
        :loading="saving"
        @click="handleSave"
      >
        {{ t('packages_business_batch_tag_dialog_save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.batch-tag-dialog {
  :deep(.el-dialog__body) {
    padding-top: 0;
    padding-bottom: 0;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 24px 24px 0;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
  }
}

.batch-tag-dialog__header {
  width: 100%;
}

.batch-tag-dialog__subtitle {
  margin-top: 4px;
  font-size: 14px;
  line-height: 22px;
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__close {
  flex: none;
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.batch-tag-dialog__search-icon {
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__list {
  max-height: 18rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.batch-tag-dialog__create-row,
.batch-tag-dialog__row {
  display: grid;
  grid-template-columns: 20px 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.batch-tag-dialog__create-row:hover,
.batch-tag-dialog__row:hover {
  background: color-mix(in srgb, var(--el-fill-color-light) 72%, transparent);
}

.batch-tag-dialog__create-row:disabled {
  cursor: default;
  opacity: 0.75;
}

.batch-tag-dialog__row.is-active {
  background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
}

.batch-tag-dialog__tri {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.batch-tag-dialog__row:hover .batch-tag-dialog__tri {
  border-color: var(--el-text-color-secondary);
}

.batch-tag-dialog__tri.is-all {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  color: var(--el-color-white);
}

.batch-tag-dialog__tri.is-some {
  border-color: color-mix(
    in srgb,
    var(--el-color-primary) 60%,
    var(--el-border-color)
  );
  background: color-mix(
    in srgb,
    var(--el-color-primary) 15%,
    var(--el-bg-color)
  );
  color: var(--el-color-primary);
}

.batch-tag-dialog__tri.is-none {
  color: transparent;
}

.batch-tag-dialog__tri--create {
  border-style: dashed;
  border-color: color-mix(
    in srgb,
    var(--el-color-primary) 55%,
    var(--el-border-color)
  );
  background: color-mix(
    in srgb,
    var(--el-color-primary) 6%,
    var(--el-bg-color)
  );
  color: var(--el-color-primary);
}

.batch-tag-dialog__tag-icon {
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__name {
  min-width: 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-tag-dialog__state {
  justify-self: end;
  font-size: 12px;
  line-height: 22px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.batch-tag-dialog__state.is-muted {
  color: transparent;
}

.batch-tag-dialog__create-text {
  font-size: 14px;
  line-height: 22px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.batch-tag-dialog__empty {
  padding: 24px 0 8px;
  font-size: 14px;
  line-height: 22px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.batch-tag-dialog__summary {
  margin-top: 4px;
  background: color-mix(in srgb, var(--el-fill-color-lighter) 80%, transparent);
}

.batch-tag-dialog__summary-title {
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 22px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-tag-dialog__summary-pill-icon,
.batch-tag-dialog__summary-arrow {
  margin-right: 4px;
}

.batch-tag-dialog__summary-name,
.batch-tag-dialog__summary-count {
  font-size: 12px;
  line-height: 22px;
  color: var(--el-text-color-primary);
}

.batch-tag-dialog__summary-count {
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__summary-empty {
  font-size: 12px;
  line-height: 22px;
  color: var(--el-text-color-secondary);
}

.batch-tag-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px 24px;
}
</style>
