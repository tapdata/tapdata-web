<script setup lang="ts">
import { fetchConnections } from '@tap/api/src/core/connections'
import { fetchInspects } from '@tap/api/src/core/inspects'
import { fetchTasks } from '@tap/api/src/core/task'
import { getWebhookList } from '@tap/api/src/core/webhook'
import { useI18n } from '@tap/i18n'
import { debounce, escapeRegExp } from 'lodash-es'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface ResourceOption {
  id: string
  name: string
  extra?: string
  disabled?: boolean
}

const TASK_SYNC_TYPES = ['migrate', 'sync'] as const
const PAGE_SIZE = 200

const props = withDefaults(
  defineProps<{
    mode: 'task' | 'inspect' | 'webhook' | 'connection'
    multiple?: boolean
    disabled?: boolean
    placeholder?: string
    disabledIds?: string[]
    inspectMethods?: string[]
  }>(),
  {
    multiple: true,
    disabled: false,
    disabledIds: () => [],
    inspectMethods: () => [],
  },
)

const model = defineModel<string | string[] | undefined>()
const { t } = useI18n()

const loading = ref(false)
const options = ref<ResourceOption[]>([])
const filterKeyword = ref('')

const displayOptions = computed(() => {
  const keyword = filterKeyword.value.trim().toLowerCase()
  if (!keyword) return options.value
  const selected = new Set(asIds(model.value))
  return options.value.filter(
    (item) =>
      selected.has(item.id) || item.name.toLowerCase().includes(keyword),
  )
})

function asIds(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function asItems(data: unknown): any[] {
  if (Array.isArray(data)) return data
  const items = (data as { items?: unknown } | null)?.items
  return Array.isArray(items) ? items : []
}

function isDisabled(id: string) {
  return props.disabledIds.includes(id)
}

function toOption(
  item: any,
  extra?: string | ((item: any) => string | undefined),
): ResourceOption | null {
  const id = item?.id || item?._id
  if (!id) return null
  const idText = String(id)
  return {
    id: idText,
    name: item.name || item.mark || item.url || idText,
    extra: typeof extra === 'function' ? extra(item) : extra || item.status,
    disabled: isDisabled(idText),
  }
}

async function loadTasks(keyword?: string, ids?: string[]) {
  const where: Record<string, any> = {}
  if (ids?.length) {
    where.id = { in: ids }
  } else if (keyword) {
    where.name = { like: escapeRegExp(keyword), options: 'i' }
  }

  if (ids?.length) {
    const data = await fetchTasks({
      where,
      limit: ids.length,
      order: 'last_updated DESC',
    })
    return asItems(data)
      .map((item) => toOption(item))
      .filter(Boolean) as ResourceOption[]
  }

  // Task list always queries a string syncType. An empty where hits TaskFilter's
  // $nin path and is not the same API the 数据复制/数据开发 lists use.
  const lists = await Promise.all(
    TASK_SYNC_TYPES.map(async (syncType) => {
      const data = await fetchTasks({
        where: { ...where, syncType },
        limit: PAGE_SIZE,
        order: 'last_updated DESC',
      })
      return asItems(data)
        .map((item) => toOption(item))
        .filter(Boolean) as ResourceOption[]
    }),
  )
  const map = new Map<string, ResourceOption>()
  lists.flat().forEach((item) => map.set(item.id, item))
  return [...map.values()]
}

async function loadInspects(keyword?: string, ids?: string[]) {
  const where: Record<string, any> = {}
  if (ids?.length) {
    where.id = { in: ids }
  } else if (keyword) {
    where.name = { like: escapeRegExp(keyword), options: 'i' }
  }
  if (!ids?.length && props.inspectMethods?.length) {
    where.inspectMethod = { in: props.inspectMethods }
  }
  const data = await fetchInspects({
    where,
    limit: ids?.length ? ids.length : PAGE_SIZE,
    order: 'last_updated DESC',
  })
  const selected = new Set(ids || [])
  return asItems(data)
    .filter((item) => {
      const id = String(item?.id || item?._id || '')
      if (!id) return false
      if (selected.has(id) || !props.inspectMethods?.length) return true
      return props.inspectMethods.includes(item.inspectMethod)
    })
    .map((item) => toOption(item, item.inspectMethod))
    .filter(Boolean) as ResourceOption[]
}

async function loadWebhooks(keyword?: string, ids?: string[]) {
  const data = await getWebhookList({
    filter: JSON.stringify({ order: 'createTime DESC', limit: 100 }),
  })
  const items = asItems(data)
    .map((item) => toOption(item, item.open === false ? 'closed' : undefined))
    .filter(Boolean) as ResourceOption[]
  return items.filter((item) => {
    if (ids?.length) return ids.includes(item.id)
    if (!keyword) return true
    return item.name.toLowerCase().includes(keyword.toLowerCase())
  })
}

async function loadConnections(keyword?: string, ids?: string[]) {
  const where: Record<string, any> = {}
  if (ids?.length) {
    where.id = { in: ids }
  } else if (keyword) {
    where.name = { like: escapeRegExp(keyword), options: 'i' }
  }
  const data = await fetchConnections({
    where,
    limit: ids?.length ? ids.length : PAGE_SIZE,
    order: 'last_updated DESC',
    noSchema: 1,
  } as any)
  return asItems(data)
    .map((item) => toOption(item, item.database_type || item.status))
    .filter(Boolean) as ResourceOption[]
}

function loadByMode(keyword?: string, ids?: string[]) {
  if (props.mode === 'task') return loadTasks(keyword, ids)
  if (props.mode === 'inspect') return loadInspects(keyword, ids)
  if (props.mode === 'webhook') return loadWebhooks(keyword, ids)
  return loadConnections(keyword, ids)
}

async function query(keyword?: string, ids?: string[], merge = false) {
  loading.value = true
  try {
    const next = await loadByMode(keyword, ids)
    if (merge) {
      mergeOptions(next)
    } else {
      options.value = next
    }
  } catch {
    if (!merge) options.value = []
  } finally {
    loading.value = false
  }
}

function mergeOptions(next: ResourceOption[]) {
  const map = new Map(options.value.map((item) => [item.id, item]))
  next.forEach((item) => map.set(item.id, item))
  options.value = [...map.values()]
}

async function ensureSelected() {
  const ids = asIds(model.value)
  if (!ids.length) return
  const missing = ids.filter(
    (id) => !options.value.some((item) => item.id === id),
  )
  if (!missing.length) return
  mergeOptions(await loadByMode(undefined, missing))
}

const searchByKeyword = debounce((keyword: string) => {
  if (!keyword) return
  query(keyword, undefined, true)
}, 300)

function onFilter(keyword: string) {
  filterKeyword.value = keyword
  searchByKeyword(keyword.trim())
}

function onVisibleChange(open: boolean) {
  if (!open) {
    filterKeyword.value = ''
    return
  }
  if (!options.value.length && !loading.value) {
    query()
  }
}

onMounted(async () => {
  await query()
  await ensureSelected()
})

onUnmounted(() => {
  searchByKeyword.cancel()
})

watch(
  () => model.value,
  () => {
    ensureSelected()
  },
)

watch(
  () => (props.inspectMethods || []).join(','),
  (next, prev) => {
    if (next === prev) return
    query()
  },
)

watch(
  () => props.disabledIds,
  () => {
    options.value = options.value.map((item) => ({
      ...item,
      disabled: isDisabled(item.id),
    }))
  },
)
</script>

<template>
  <ElSelect
    v-model="model"
    filterable
    clearable
    collapse-tags
    collapse-tags-tooltip
    fit-input-width
    :multiple="multiple"
    :reserve-keyword="multiple"
    :disabled="disabled"
    :loading="loading"
    :placeholder="
      placeholder || t('packages_business_workflow_select_resource')
    "
    :filter-method="onFilter"
    class="w-100"
    @visible-change="onVisibleChange"
  >
    <ElOption
      v-for="item in displayOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
      :disabled="item.disabled"
    >
      <div class="flex justify-content-between gap-2">
        <span class="ellipsis">{{ item.name }}</span>
        <span v-if="item.extra" class="font-color-sslight fs-7">{{
          item.extra
        }}</span>
      </div>
    </ElOption>
    <template #empty>
      <div class="el-select-dropdown__empty">
        {{ loading ? t('public_message_loading') : t('public_data_no_data') }}
      </div>
    </template>
  </ElSelect>
</template>
