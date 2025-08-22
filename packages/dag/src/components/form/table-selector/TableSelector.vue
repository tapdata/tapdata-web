<script setup lang="ts">
import { metadataInstancesApi, taskApi } from '@tap/api'
import { VEmpty } from '@tap/component/src/base/v-empty'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { RightBoldOutlined } from '@tap/component/src/RightBoldOutlined'
import { useI18n } from '@tap/i18n'
import { computed, nextTick, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useStore } from 'vuex'

import { getPrimaryKeyTablesByType } from '../../../util'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const store = useStore()
const { t } = useI18n()

// Props
const props = defineProps({
  connectionId: {
    type: String,
    required: true,
  },
  value: {
    type: Array,
    default: () => [],
  },
  disabled: Boolean,
  hideReload: Boolean,
  alwaysShowReload: Boolean,
  reloadTime: [String, Number],
  filterType: String,
  syncPartitionTableEnable: Boolean,
  hasPartition: Boolean,
  nodeId: String,
  taskId: String,
})

// Emits
const emit = defineEmits(['update:value', 'change'])

// State
const leftScroller = ref(null)
const rightScroller = ref(null)
const loading = ref(false)
const schemaLoading = ref(false)
const isOpenClipMode = ref(false)
const isFocus = ref(false)
const clipboardValue = ref('')
const errorTables = ref({})
const tableMap = ref({})
const table = ref({
  tables: [] as string[],
  checked: [] as string[],
  isCheckAll: false,
  searchKeyword: '',
})

const selected = ref({
  tables: [] as string[],
  checked: [] as string[],
  isCheckAll: false,
  searchKeyword: '',
})

// Computed
const isIndeterminate = computed(() => {
  return (
    table.value.checked.length > 0 &&
    table.value.checked.length < filteredData.value.length
  )
})

const selectedIsIndeterminate = computed(() => {
  return (
    selected.value.checked.length > 0 &&
    selected.value.checked.length < filteredRightTableNames.value.length
  )
})

const leftTableData = computed(() => {
  const allTables = getPrimaryKeyTablesByType(
    table.value.tables,
    props.filterType,
    tableMap.value,
  )
  return allTables.filter(
    (tableName: string) => !selected.value.tables.includes(tableName),
  )
})

const filteredLeftTableNames = computed(() => {
  const searchKeyword = table.value.searchKeyword?.toLowerCase()

  if (!searchKeyword) return leftTableData.value

  return leftTableData.value.filter((name: string) =>
    name.toLowerCase().includes(searchKeyword),
  )
})

const filteredData = computed(() => {
  return filteredLeftTableNames.value.map((name: string) => ({ name }))
})

const filteredRightTableNames = computed(() => {
  const searchKeyword = selected.value.searchKeyword?.toLowerCase()
  if (!searchKeyword) return selected.value.tables
  return selected.value.tables.filter((name: string) =>
    name.toLowerCase().includes(searchKeyword),
  )
})

const filterSelectedData = computed(() => {
  return filteredRightTableNames.value.map((name) => ({ name }))
})

const clipboardTables = computed(() => {
  return clipboardValue.value
    .split(/[,，\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
})

watch(
  () => props.filterType,
  () => {
    table.value.checked = table.value.checked.filter((name: string) => {
      return leftTableData.value.includes(name)
    })
  },
)

watch(
  () => store.state.dataflow.schemaRefreshing,
  (v) => {
    if (!v) {
      getTables()
    }
  },
)

// Methods
const getTables = () => {
  const { connectionId } = props

  if (!connectionId) return

  loading.value = true

  const fn = props.hasPartition
    ? metadataInstancesApi.pagePartitionTables({
        connectionId,
        limit: 0,
        syncPartitionTableEnable: props.syncPartitionTableEnable,
      })
    : metadataInstancesApi.pageTables({ connectionId, limit: 0 })

  fn.then((res = {}) => {
    const data = res.items || []
    const tables = data.map((it) => it.tableName)
    const map = {}
    data.forEach((el = {}) => {
      const {
        tableName,
        tableComment,
        primaryKeyCounts = 0,
        uniqueIndexCounts = 0,
      } = el
      if (tableComment || primaryKeyCounts || uniqueIndexCounts) {
        map[tableName] = { tableComment, primaryKeyCounts, uniqueIndexCounts }
      }
    })
    tableMap.value = map
    tables.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
    table.value.tables = Object.freeze(tables)
  }).finally(() => {
    loading.value = false
  })
}

const loadSchema = async () => {
  schemaLoading.value = true
  const nodeId = props.nodeId || store.state?.dataflow.activeNodeId
  const taskId = props.taskId || store.state?.dataflow.taskId

  await taskApi
    .refreshSchema(taskId, {
      nodeIds: nodeId,
      keys: table.value.searchKeyword,
    })
    .finally(() => {
      schemaLoading.value = false
    })

  getTables()
}

const checkAll = (val: boolean, type: 'table' | 'selected') => {
  if (type === 'table') {
    table.value.checked = val
      ? Array.from(
          new Set([...table.value.checked, ...filteredLeftTableNames.value]),
        )
      : table.value.checked.filter(
          (name) => !filteredLeftTableNames.value.includes(name),
        )
  } else {
    selected.value.checked = val
      ? Array.from(
          new Set([
            ...selected.value.checked,
            ...filteredRightTableNames.value,
          ]),
        )
      : selected.value.checked.filter(
          (name) => !filteredRightTableNames.value.includes(name),
        )
  }
}

const isLeftCheckAll = computed(() => {
  return filteredLeftTableNames.value.length
    ? filteredLeftTableNames.value.every((name: string) =>
        table.value.checked.includes(name),
      )
    : false
})

const isRightCheckAll = computed(() => {
  return filteredRightTableNames.value.length
    ? filteredRightTableNames.value.every((name) =>
        selected.value.checked.includes(name),
      )
    : false
})

const emitChange = () => {
  emit('change', selected.value.tables)
  emit('update:value', selected.value.tables)
}

const add = () => {
  if (isOpenClipMode.value || props.disabled) return

  selected.value.tables = [
    ...new Set([...selected.value.tables, ...table.value.checked]),
  ]

  table.value.checked = []
  table.value.isCheckAll = false
  emitChange()
}

const remove = () => {
  if (isOpenClipMode.value || props.disabled) return

  selected.value.tables = selected.value.tables.filter(
    (t) => !selected.value.checked.includes(t),
  )

  selected.value.checked = []
  selected.value.isCheckAll = false
  emitChange()
}

const changeSeletedMode = () => {
  isOpenClipMode.value = !isOpenClipMode.value
  if (isOpenClipMode.value) {
    clipboardValue.value = selected.value.tables.join(', ')
  }
}

const getErrorTables = (tables: string[]) => {
  const errors = {}

  const allTables = getPrimaryKeyTablesByType(
    table.value.tables,
    props.filterType,
    tableMap.value,
  )

  if (!loading.value) {
    tables.forEach((table) => {
      if (!allTables.includes(table)) {
        errors[table] = t(
          'packages_form_component_table_selector_error_not_exit',
        )
      }
    })
  }

  errorTables.value = errors
  return errors
}

const submitClipboard = () => {
  const errorTables = getErrorTables(clipboardTables.value)

  if (Object.keys(errorTables).length) return

  selected.value.tables = Array.from(
    new Set(selected.value.tables.concat(clipboardTables.value)),
  )
  isOpenClipMode.value = false
  emitChange()
}

const autofix = () => {
  if (isOpenClipMode.value) {
    clipboardValue.value = clipboardTables.value
      .filter((t) => !errorTables.value[t])
      .join(', ')
    errorTables.value = {}
  } else {
    selected.value.tables = selected.value.tables.filter(
      (t) => !errorTables.value[t],
    )
    emitChange()
  }
}

const getTableInfo = (table: string) => {
  return tableMap.value[table] || {}
}

const handleLeftScrollEnd = () => {
  leftScroller.value?.scrollToItem(0)
  nextTick(() => {
    leftScroller.value?.updateVisibleItems(true)
  })
}

const handleRightScrollEnd = () => {
  rightScroller.value?.scrollToItem(0)
}

// Watch
watch(
  () => props.value,
  (val: string[]) => {
    selected.value.tables = val || []
  },
  { immediate: true },
)

// Initialize
getTables()
</script>

<template>
  <div v-loading="loading" class="table-selector">
    <!-- 候选区 -->
    <div class="candidate-panel selector-panel rounded-xl">
      <div class="selector-panel__header flex-shrink-0">
        <div class="flex-1 flex align-center">
          <ElCheckbox
            v-if="table.tables.length"
            :model-value="isLeftCheckAll"
            :disabled="disabled"
            :indeterminate="isIndeterminate"
            @change="checkAll($event, 'table')"
          >
            <span>{{
              $t('packages_form_component_table_selector_candidate_label')
            }}</span>
          </ElCheckbox>
          <span v-else>{{
            $t('packages_form_component_table_selector_candidate_label')
          }}</span>
          <span v-if="table.tables.length" class="font-color-light ml-2"
            >({{ table.checked.length }}/{{ filteredData.length }})</span
          >
        </div>
      </div>

      <div class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput
            id="table-selector-left-filter-input"
            v-model="table.searchKeyword"
            clearable
            :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
            @input="handleLeftScrollEnd"
          >
            <template #prefix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
        </div>
        <ElCheckboxGroup
          v-show="filteredData.length"
          v-model="table.checked"
          :disabled="disabled"
          class="selector-panel__list"
        >
          <RecycleScroller
            ref="leftScroller"
            class="selector-panel__scroller"
            :item-size="36"
            :buffer="100"
            :items="filteredData"
            key-field="name"
          >
            <template #default="{ item: { name: item } }">
              <ElCheckbox class="selector-panel__item" :value="item">
                <OverflowTooltip
                  :text="
                    item +
                    (getTableInfo(item).tableComment
                      ? `(${getTableInfo(item).tableComment})`
                      : '')
                  "
                  placement="left"
                  :enterable="false"
                >
                  <span>
                    <VIcon
                      v-if="!!getTableInfo(item).primaryKeyCounts"
                      size="12"
                      class="text-warning mr-1"
                      >key</VIcon
                    >
                    <VIcon
                      v-if="!!getTableInfo(item).uniqueIndexCounts"
                      size="12"
                      class="text-text-dark mr-1"
                      >fingerprint</VIcon
                    >
                    <span>{{ item }}</span>
                    <span
                      v-if="getTableInfo(item).tableComment"
                      class="font-color-sslight"
                      >{{ `(${getTableInfo(item).tableComment})` }}</span
                    >
                  </span>
                </OverflowTooltip>
              </ElCheckbox>
            </template>
          </RecycleScroller>
        </ElCheckboxGroup>
        <div
          v-if="!filteredData.length"
          class="flex-1 flex flex-column justify-center"
        >
          <VEmpty v-if="selected.tables.length && !table.searchKeyword">
            <span>{{
              $t('packages_dag_table_selector_all_tables_selected')
            }}</span>
          </VEmpty>
          <VEmpty v-else>
            <span class="align-middle"
              >{{
                $t(
                  table.searchKeyword || alwaysShowReload
                    ? 'packages_form_component_table_selector_error_not_exit'
                    : 'public_data_no_data',
                )
              }},</span
            >
            <el-button
              class="ml-1"
              text
              type="primary"
              :loading="schemaLoading"
              @click="loadSchema"
            >
              {{ $t('packages_form_button_reload') }}
            </el-button>
          </VEmpty>
        </div>
      </div>
    </div>
    <!-- 左右箭头 按钮 -->
    <div class="selector-center">
      <div class="selector-btns">
        <el-button
          id="table-selector-add-btn"
          :disabled="isOpenClipMode || disabled || !table.checked.length"
          class="p-1"
          :type="
            table.checked.length > 0 && !isOpenClipMode && !disabled
              ? 'primary'
              : 'default'
          "
          style="width: 28px; height: 28px"
          @click="add"
        >
          <template #icon>
            <RightBoldOutlined />
          </template>
        </el-button>

        <el-button
          id="table-selector-remove-btn"
          :disabled="isOpenClipMode || disabled || !selected.checked.length"
          :type="
            selected.checked.length > 0 && !isOpenClipMode && !disabled
              ? 'primary'
              : 'default'
          "
          class="p-1 ml-0"
          style="width: 28px; height: 28px"
          @click="remove"
        >
          <template #icon>
            <RightBoldOutlined class="rotate-180" />
          </template>
        </el-button>
      </div>
    </div>
    <!-- 已选择区 -->
    <div class="checked-panel selector-panel rounded-xl">
      <div class="selector-panel__header flex-shrink-0">
        <div class="flex-1 flex align-center">
          <ElCheckbox
            v-if="selected.tables.length && !isOpenClipMode"
            :model-value="isRightCheckAll"
            :disabled="disabled"
            :indeterminate="selectedIsIndeterminate"
            @change="checkAll($event, 'selected')"
          >
            <span>{{
              $t('packages_form_component_table_selector_checked_label')
            }}</span>
          </ElCheckbox>
          <span v-else>{{
            $t('packages_form_component_table_selector_checked_label')
          }}</span>
          <span
            v-if="selected.tables.length && !isOpenClipMode"
            class="font-color-light ml-2"
            >({{ selected.checked.length }}/{{
              filteredRightTableNames.length
            }})</span
          >
        </div>

        <slot name="right-extra">
          <ElButton
            v-if="!disabled"
            text
            type="primary"
            @click="changeSeletedMode()"
          >
            <div class="flex align-center">
              <span v-if="!isOpenClipMode">{{
                $t('packages_form_component_table_selector_bulk_name')
              }}</span>
              <span v-else>{{
                $t('packages_form_component_table_selector_bulk_pick')
              }}</span>
              <VIcon class="ml-1" size="9">icon_table_selector_bulk_pick</VIcon>
            </div>
          </ElButton>
        </slot>
      </div>
      <div class="selector-panel__body" :class="{ isOpenClipMode }">
        <div v-show="!isOpenClipMode" class="selector-panel__search">
          <ElInput
            id="table-selector-right-filter-input"
            v-model="selected.searchKeyword"
            clearable
            :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
            @input="handleRightScrollEnd"
          >
            <template #prefix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
        </div>
        <ElCheckboxGroup
          v-show="filterSelectedData.length && !isOpenClipMode"
          v-model="selected.checked"
          class="selector-panel__list"
          :disabled="disabled"
        >
          <RecycleScroller
            ref="rightScroller"
            class="selector-panel__scroller"
            :item-size="36"
            :buffer="50"
            :items="filterSelectedData"
            key-field="name"
          >
            <template #default="{ item: { name: item } }">
              <ElCheckbox class="selector-panel__item" :value="item">
                <OverflowTooltip
                  v-if="!errorTables[item]"
                  :text="
                    item +
                    (getTableInfo(item).tableComment
                      ? `(${getTableInfo(item).tableComment})`
                      : '')
                  "
                  placement="left"
                  :enterable="false"
                >
                  <span>
                    <VIcon
                      v-if="!!getTableInfo(item).primaryKeyCounts"
                      size="12"
                      class="text-warning mr-1"
                      >key</VIcon
                    >
                    <VIcon
                      v-if="!!getTableInfo(item).uniqueIndexCounts"
                      size="12"
                      class="text-text-dark mr-1"
                      >fingerprint</VIcon
                    >
                    <slot name="right-item" :row="item"
                      ><span>{{ item }}</span></slot
                    >
                    <span
                      v-if="getTableInfo(item).tableComment"
                      class="font-color-sslight"
                      >{{ `(${getTableInfo(item).tableComment})` }}</span
                    >
                  </span>
                </OverflowTooltip>
                <ElTooltip
                  v-else
                  class="ellipsis"
                  placement="left"
                  :enterable="false"
                  :content="errorTables[item]"
                >
                  <div :class="{ 'color-danger': errorTables[item] }">
                    <VIcon
                      v-if="!!getTableInfo(item).primaryKeyCounts"
                      size="12"
                      class="text-warning mr-1 mt-n1"
                      >key</VIcon
                    >
                    <VIcon
                      v-if="!!getTableInfo(item).uniqueIndexCounts"
                      size="12"
                      class="text-dark mr-1 mt-n1"
                    >
                      fingerprint
                    </VIcon>
                    <slot name="right-item" :row="item">{{ item }}</slot>
                    <span
                      v-if="getTableInfo(item).tableComment"
                      class="font-color-sslight"
                      >{{ `(${getTableInfo(item).tableComment})` }}</span
                    >
                  </div>
                </ElTooltip>
              </ElCheckbox>
            </template>
          </RecycleScroller>
        </ElCheckboxGroup>
        <div
          v-if="!isOpenClipMode && !filterSelectedData.length"
          class="flex-1 flex flex-column justify-center"
        >
          <VEmpty
            :description="`${$t('packages_form_component_table_selector_not_checked')}`"
          />
        </div>
        <div v-if="isOpenClipMode" class="selector-clipboard flex flex-column">
          <div
            v-show="!isFocus"
            class="selector-clipboard__view"
            @click="
              ;((isFocus = true),
                (clipboardValue = clipboardTables.concat().join(', ')))
            "
          >
            <template v-if="clipboardTables.length">
              <ElTooltip
                v-for="(t, i) in clipboardTables"
                :key="t"
                placement="top"
                :enterable="false"
                :disabled="!errorTables[t]"
                :content="errorTables[t]"
              >
                <span :class="{ 'color-danger': errorTables[t] }"
                  >{{ t
                  }}<template v-if="i < clipboardTables.length - 1"
                    >,&nbsp;</template
                  ></span
                >
              </ElTooltip>
            </template>
            <span v-else class="selector-clipboard__view--empty">{{
              $t('packages_form_component_table_selector_clipboard_placeholder')
            }}</span>
          </div>
          <ElInput
            v-show="isFocus"
            ref="textarea"
            v-model="clipboardValue"
            autosize
            class="selector-clipboard__textarea"
            type="textarea"
            resize="none"
            :placeholder="
              $t('packages_form_component_table_selector_clipboard_placeholder')
            "
            @blur="isFocus = false"
          />
        </div>
      </div>
      <div class="selector-panel__footer">
        <div
          v-if="Object.keys(errorTables).length"
          class="selector-error flex align-center"
        >
          <span class="color-danger"
            >*{{ $t('packages_form_component_table_selector_error') }}</span
          >
          <el-button text class="ml-1" type="primary" @click="autofix">{{
            $t('packages_form_component_table_selector_autofix')
          }}</el-button>
        </div>
        <div v-if="isOpenClipMode" class="px-4 pb-4 text-end">
          <el-button type="primary" @click="submitClipboard">{{
            $t('public_button_confirm')
          }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-selector {
  display: flex;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}
.selector-panel {
  flex: 1;
  //height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-light);
  border-radius: 2px;
  overflow: hidden;
}
.selector-panel__header {
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  height: 40px;
  color: var(--text-normal);
  font-size: 14px;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}
.selector-panel__body {
  padding: 12px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.isOpenClipMode {
    flex: unset;
    overflow: auto;
  }
}
.selector-panel__search {
  padding: 0 12px;
}
.selector-panel__list {
  margin-top: 8px;
  flex: 1;
  height: calc(100% - 32px);
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.selector-panel__scroller {
  height: 100%;
}
.selector-panel__item {
  padding: 0 16px;
  width: 100%;
  line-height: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: var(--bg-disable);
  }
  > :deep(.el-checkbox__label) {
    overflow: hidden;
    line-height: normal; // 微软雅黑下字符会溢出
  }
}
.selector-center {
  width: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .selector-btns {
    width: 28px;
  }
  .btn-transfer {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    min-width: 28px;
    width: 28px;
    height: 28px;
    line-height: 28px;
    border-radius: 2px;
    font-size: 14px;
    background: var(--bg-main);
    color: var(--text-normal);
    text-align: center;
    cursor: pointer;
    &:hover {
      background: var(--color-primary);
      color: var(--text-white);
    }
    &.btn-transfer--disabled {
      background: var(--bg-main);
      color: var(--text-normal);
      cursor: not-allowed;
    }
    &.btn-transfer--primary {
      background: var(--color-primary);
      color: var(--text-white);
    }
  }
}
.selector-error {
  padding: 16px;
  font-size: 12px;
}
.selector-clipboard {
  padding: 0 16px;
}
.selector-clipboard__view {
  flex: 1;
  //overflow: auto;
  cursor: text;
  white-space: pre-wrap;
  > span {
    display: inline-block;
    line-height: 20px;
    //height: 20px;
    font-size: 12px;
    color: var(--text-normal);
    word-break: break-word;
  }
  .selector-clipboard__view--empty {
    padding: 5px 11px;
    color: var(--text-slight);
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
  }
}
.selector-clipboard__textarea {
  flex: 1;
  :deep(.el-textarea__inner) {
    height: 100%;
    border: none;
    //padding: 0;
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
