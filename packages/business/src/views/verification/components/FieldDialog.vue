<script setup lang="ts">
import { metadataInstancesApi } from '@tap/api'
import { VIcon, VirtualSelect } from '@tap/component'
import i18n from '@tap/i18n'
import { ElButton, ElDialog, ElIcon, ElInput, ElMessage } from 'element-plus'
import { cloneDeep, uniqueId } from 'lodash-es'
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'

interface Field {
  id: string
  key?: string
  label: string
  value: string
  field_name: string
  primary_key_position?: number
  used?: boolean
}

interface ListItem {
  id: string
  source: string
  target: string
}

interface DialogItem {
  id?: string
  source: {
    nodeId?: string
    table: string
    connectionId: string
    columns?: any[]
  }
  target: {
    nodeId?: string
    table: string
    connectionId: string
    columns?: any[]
  }
}

interface SchemaMap {
  source?: boolean
  target?: boolean
}

interface NodeSchemaResponse {
  items?: Array<{
    fields?: Array<{
      id: string
      original_field_name: string
      field_name: string
      primary_key_position?: number
    }>
  }>
}

interface MetadataResponse {
  items: Array<{
    nameFieldMap?: Record<
      string,
      {
        id: string
        fieldName: string
        primaryKey?: number
      }
    >
  }>
}

defineOptions({
  name: 'FieldDialog',
})

const emit = defineEmits(['save'])
const visible = ref(false)
const loading = ref(false)
const list = ref<ListItem[]>([])
const index = ref('')
const keyword = ref('')
const sourceFields = ref<Field[]>([])
const targetFields = ref<Field[]>([])
const sourceDynamicSchema = ref(false)
const targetDynamicSchema = ref(false)
const virtualScroller = ref()

const filterList = computed(() => {
  const searchKeyword = keyword.value?.trim().toLowerCase()

  if (!searchKeyword) {
    return [...list.value]
  }

  return list.value.filter((t) =>
    (t.source + t.target).toLowerCase().includes(searchKeyword),
  )
})

async function loadList(item: DialogItem) {
  const source = item.source.columns || []
  const target = item.target.columns || []

  if (source?.length) {
    const newList: ListItem[] = []
    source.forEach((el, i) => {
      newList.push({
        id: uniqueId('field_'),
        source: el,
        target: target[i],
      })
    })
    list.value = newList.filter((t) => t.source || t.target)
    return
  }

  if (!item.target.nodeId) {
    loading.value = true
    sourceFields.value = await getFields(
      item.source.table,
      item.source.connectionId,
    )
    targetFields.value = await getFields(
      item.target.table,
      item.target.connectionId,
    )

    const newList = sourceFields.value.map((el) => {
      const findTarget =
        targetFields.value.find((t) => t.value === el.value) || {}
      findTarget.used = true
      return {
        source: el.value,
        target: findTarget.value || '',
      }
    })

    newList.push(
      ...targetFields.value
        .filter((t) => !t.used)
        .map((t) => ({ source: '', target: t.value })),
    )

    list.value = newList.map((t) => ({
      ...t,
      id: uniqueId('field_'),
    }))
    loading.value = false
    return
  }

  // 加载目标的字段
  const params = {
    nodeId: item.target.nodeId,
    tableFilter: item.target.table,
    page: 1,
    pageSize: 1,
  }
  loading.value = true
  const nodeSchemaPage = (await metadataInstancesApi.nodeSchemaPage(
    params,
  )) as NodeSchemaResponse
  const sourceNodeSchemaPage = (await metadataInstancesApi.nodeSchemaPage({
    nodeId: item.source.nodeId,
    tableFilter: item.source.table,
    page: 1,
    pageSize: 1,
  })) as NodeSchemaResponse

  const fieldMap: Record<string, string> = {}
  const nodeSchemaPageFields = nodeSchemaPage.items?.[0]?.fields || []
  nodeSchemaPageFields.forEach((t) => {
    fieldMap[t.original_field_name] = t.field_name
  })

  sourceFields.value = cloneDeep(
    (sourceNodeSchemaPage.items?.[0]?.fields || []).map((t) => ({
      id: t.id,
      key: t.id,
      label: t.original_field_name,
      value: t.original_field_name,
      field_name: t.original_field_name,
      primary_key_position: t.primary_key_position,
    })),
  )

  targetFields.value = cloneDeep(
    nodeSchemaPageFields.map((t) => ({
      id: t.id,
      key: t.id,
      label: t.field_name,
      value: t.field_name,
      field_name: t.field_name,
      primary_key_position: t.primary_key_position,
    })),
  )

  const sourceList = sourceFields.value
  const targetList = targetFields.value.map((t) => ({
    ...t,
    used: false,
  }))

  const newList = [
    ...Object.keys(fieldMap).map((t) => ({
      source: t,
      target: fieldMap[t],
    })),
    ...sourceList
      .filter((t) => !fieldMap[t.value])
      .map((t) => ({
        source: t.value,
        target: t.value,
      })),
    ...targetList
      .filter((t) => !Object.values(fieldMap).includes(t.value))
      .map((t) => ({
        source: t.value,
        target: t.value,
      })),
  ]

  list.value = newList.map((t) => ({
    ...t,
    id: uniqueId('field_'),
  }))
  loading.value = false
}

function open(item: Partial<DialogItem> = {}, schemaMap: SchemaMap = {}) {
  index.value = item.id || ''
  const { source, target } = schemaMap
  sourceDynamicSchema.value = !!source
  targetDynamicSchema.value = !!target
  loadList(item as DialogItem)
  visible.value = true
}

function getItem(): ListItem {
  return {
    id: uniqueId('field_'),
    source: '',
    target: '',
  }
}

function handleAdd() {
  list.value.unshift(getItem())
  virtualScroller.value?.scrollToItem(0)
}

function handleDelete(id: string) {
  const idx = list.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    list.value.splice(idx, 1)
  }
}

function handleClose() {
  visible.value = false
}

function handleSave() {
  if (list.value.some((t) => !t.source || !t.target)) {
    ElMessage.error(
      i18n.t('packages_business_components_fielddialog_ziduanbuyunxu'),
    )
    return
  }

  emit('save', cloneDeep(list.value), index.value)
  handleClose()
}

async function getFields(
  table: string,
  connectionId: string,
): Promise<Field[]> {
  const response = (await metadataInstancesApi.tapTables({
    filter: JSON.stringify({
      where: {
        meta_type: 'table',
        sourceType: 'SOURCE',
        original_name: table,
        'source._id': connectionId,
      },
      limit: 1,
    }),
  })) as unknown as MetadataResponse

  return Object.values(response.items[0]?.nameFieldMap || {}).map((t) => ({
    id: t.id,
    label: t.fieldName,
    value: t.fieldName,
    field_name: t.fieldName,
    primary_key_position: t.primaryKey,
  }))
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('packages_business_components_fielddialog_zidingyiziduan')"
    :append-to-body="true"
    width="1200px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <div v-if="visible">
      <div class="mb-4">
        <ElInput
          v-model="keyword"
          class="search-input"
          :placeholder="
            $t('packages_business_components_fieldbox_qingshuruziduan')
          "
          clearable
        >
          <template #prefix>
            <ElIcon>
              <ElIconSearch />
            </ElIcon>
          </template>
        </ElInput>
      </div>
      <div class="position-relative">
        <div class="list-table__header flex justify-content-between">
          <span class="fw-sub"
            >{{ $t('packages_business_components_fieldbox_ziduan') }}

            <span
              class="line__index flex-shrink-0 px-2 py-1 mr-2 text-center bg-color-disable rounded-pill"
            >
              {{ list.length }}
            </span>
          </span>
          <ElButton text type="primary" @click="handleAdd">
            <VIcon class="mr-1">plus</VIcon>
            {{ $t('packages_business_components_fieldbox_tianjiahang') }}
          </ElButton>
        </div>
        <div v-loading="loading">
          <RecycleScroller
            ref="virtualScroller"
            :items="filterList"
            :item-size="44"
            key-field="id"
            class="list-table__content scroller h-100"
          >
            <template #default="{ item }">
              <div class="list-table__line flex pt-3 align-items-center">
                <div
                  class="line__index flex-shrink-0 px-2 py-1 mr-2 text-center bg-color-disable rounded-pill"
                >
                  {{ filterList.indexOf(item) + 1 }}
                </div>
                <VirtualSelect
                  v-model="item.source"
                  :item-size="30"
                  :options="sourceFields"
                  :class="['flex-fill', { 'empty-data': !item.source }]"
                  :allow-create="sourceDynamicSchema"
                  :placeholder="
                    sourceDynamicSchema
                      ? $t('packages_business_select_placeholder')
                      : $t('public_select_placeholder')
                  "
                  filterable
                  class="flex-fill"
                />
                <VirtualSelect
                  v-model="item.target"
                  :item-size="34"
                  :options="targetFields"
                  :class="['flex-fill ml-5', { 'empty-data': !item.target }]"
                  :allow-create="targetDynamicSchema"
                  :placeholder="
                    targetDynamicSchema
                      ? $t('packages_business_select_placeholder')
                      : $t('public_select_placeholder')
                  "
                  filterable
                />
                <ElButton
                  text
                  type="primary"
                  class="mx-2 flex-shrink-0"
                  @click="handleDelete(item.id)"
                >
                  <template #icon>
                    <VIcon size="18">delete</VIcon>
                  </template>
                </ElButton>
              </div>
            </template>
          </RecycleScroller>
        </div>
      </div>
    </div>
    <template #footer>
      <ElButton @click="handleClose">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton type="primary" @click="handleSave">{{
        $t('public_button_save')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.el-select {
  &.empty-data {
    :deep(.el-input__inner) {
      border-color: #d44d4d;
    }
  }
}

.list-table__content {
  max-height: 450px;
}

.line__index {
  min-width: 36px;
  white-space: nowrap;
}
</style>
