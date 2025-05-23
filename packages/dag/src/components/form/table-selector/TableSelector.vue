<script setup lang="ts">
import {
  connectionsApi,
  metadataInstancesApi,
  taskApi,
  workerApi,
} from '@tap/api'
import { VEmpty } from '@tap/component'
import VIcon from '@tap/component/src/base/VIcon'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { computed, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useStore } from 'vuex'

import { getPrimaryKeyTablesByType } from '../../../util'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const store = useStore()

// Props
const props = defineProps({
  connectionId: {
    type: String,
    required: true,
  },
  value: {
    type: Array as PropType<string[]>,
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
    selected.value.checked.length < selected.value.tables.length
  )
})

const leftTableData = computed(() => {
  return getPrimaryKeyTablesByType(
    table.value.tables,
    props.filterType,
    tableMap.value,
  )
})

const filteredData = computed(() => {
  const searchKeyword = table.value.searchKeyword?.toLowerCase()

  if (!searchKeyword) return leftTableData.value.map((name) => ({ name }))

  return leftTableData.value
    .filter((name: string) => name.toLowerCase().includes(searchKeyword))
    .map((name) => ({ name }))
})

const filterSelectedData = computed(() => {
  const searchKeyword = selected.value.searchKeyword?.toLowerCase()

  if (!searchKeyword) return selected.value.tables.map((name) => ({ name }))

  return selected.value.tables
    .filter((item: string) => item.toLowerCase().includes(searchKeyword))
    .map((name) => ({ name }))
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

// Methods
const getTables = async () => {
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
  const target = type === 'table' ? table : selected
  target.value.checked = val ? target.value.tables : []
  target.value.isCheckAll = val
  emit('change', selected.value.tables)
}

const checkedChange = (type: 'table' | 'selected') => {
  const target = type === 'table' ? table : selected
  target.value.isCheckAll =
    target.value.checked.length === target.value.tables.length
  if (type === 'selected') {
    emit('change', selected.value.tables)
  }
}

const add = () => {
  if (isOpenClipMode.value || props.disabled) return
  selected.value.tables = [
    ...new Set([...selected.value.tables, ...table.value.checked]),
  ]
  table.value.checked = []
  table.value.isCheckAll = false
  emit('change', selected.value.tables)
}

const remove = () => {
  if (isOpenClipMode.value || props.disabled) return
  selected.value.tables = selected.value.tables.filter(
    (t) => !selected.value.checked.includes(t),
  )
  selected.value.checked = []
  selected.value.isCheckAll = false
  emit('change', selected.value.tables)
}

const changeSeletedMode = () => {
  isOpenClipMode.value = !isOpenClipMode.value
  if (isOpenClipMode.value) {
    clipboardValue.value = selected.value.tables.join(', ')
  }
}

const submitClipboard = () => {
  selected.value.tables = clipboardTables.value
  isOpenClipMode.value = false
  emit('change', selected.value.tables)
}

const autofix = () => {
  selected.value.tables = selected.value.tables.filter(
    (t) => !errorTables.value[t],
  )
  emit('change', selected.value.tables)
}

const getTableInfo = (table: string) => {
  return tableMap.value[table] || {}
}

// Watch
watch(
  () => props.value,
  (val) => {
    selected.value.tables = val || []
  },
  { immediate: true },
)

// Initialize
getTables()

/* export default {
  components: { RecycleScroller, OverflowTooltip, ConnectionTest, VIcon, VEmpty },
  props: {
    connectionId: {
      type: String,
      required: true,
    },
    value: Array,
    disabled: Boolean,
    hideReload: Boolean,
    alwaysShowReload: Boolean,
    reloadTime: [String, Number],
    filterType: String,
    syncPartitionTableEnable: Boolean,
    hasPartition: Boolean,
    nodeId: String,
    taskId: String
  },
  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      loading: false,
      table: {
        isCheckAll: false,
        searchKeyword: '',
        checked: [],
        tables: [],
      },
      selected: {
        isCheckAll: false,
        searchKeyword: '',
        checked: [],
        tables: this.value,
      },
      showProgress: false,
      progress: '',
      loadFieldsStatus: 'finished',
      errorTables: {},
      isOpenClipMode: false,
      clipboardValue: '',
      isFocus: false,
      tableMap: {},
      schemaLoading: false,
    }
  },
  computed: {
    ...mapGetters('dataflow', ['schemaRefreshing']),

    filteredData() {
      let { searchKeyword, tables } = this.table
      try {
        let reg = new RegExp(searchKeyword, 'i')
        return getPrimaryKeyTablesByType(
          tables.filter((item) => reg.test(item)),
          this.filterType,
          this.tableMap,
        )
      } catch (error) {
        return []
      }
    },
    filterSelectedData() {
      let { searchKeyword, tables } = this.selected
      let errorTables = this.getErrorTables(tables)
      let reg = new RegExp(searchKeyword, 'i')
      let filterTables = tables.filter((item) => reg.test(item))
      filterTables = filterTables.sort((t1, t2) => {
        if (errorTables[t1]) {
          return -1
        }
        if (errorTables[t2]) {
          return 1
        }
        return 0
      })
      return getPrimaryKeyTablesByType(filterTables, this.filterType, this.tableMap)
    },


    rightData() {
      return this.filterSelectedData.map(name => ({name}))
    },

    clipboardTables() {
      //支持换行符 /n
      let value = this.clipboardValue?.replace(/(\n)/g, ',')
      value = value?.replace(/\s+/g, '')
      let tables = value ? value.split(',') : []
      return Array.from(new Set(tables.filter((it) => !!it && it.trim())))
    },
    isIndeterminate() {
      const checkedLength = this.table.checked.length
      const tablesLength = this.filteredData.length
      return checkedLength > 0 && checkedLength < tablesLength
    },
    selectedIsIndeterminate() {
      const checkedLength = this.selected.checked.length
      const tablesLength = this.filterSelectedData.length
      return checkedLength > 0 && checkedLength < tablesLength
    },
  },
  watch: {
    isFocus(v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs?.textarea?.focus()
        })
      }
    },
    value(v = []) {
      this.selected.tables = v.concat()
    },
    'table.checked'() {
      this.updateAllChecked()
    },
    'filteredData.length'() {
      this.updateAllChecked()
    },
    'selected.checked'() {
      this.updateSelectedAllChecked()
    },
    'filterSelectedData.length'() {
      this.updateSelectedAllChecked()
    },
    reloadTime() {
      this.getProgress(true)
    },
    filterType() {
      this.handleFilterType()
    },
    schemaRefreshing(v) {
      if (!v) {
        this.getTables()
      }
    },
    syncPartitionTableEnable() {
      this.getTables()
    }
  },
  created() {
    let id = this.connectionId
    if (id) {
      this.getTables()
    }
  },
  methods: {
    submitClipboard() {
      let tables = this.clipboardTables
      let errorTables = this.getErrorTables(tables)
      if (!Object.keys(errorTables).length) {
        this.changeSeletedMode()
        //保留当前选中 以及当前所手动输入
        this.selected.tables = Array.from(new Set([...this.selected.tables, ...this.clipboardTables.concat()]))
        $emit(this, 'update:value', this.selected.tables)
        // $emit(this, 'change', this.selected.tables)
      }
    },
    add() {
      if (this.isOpenClipMode || this.disabled) {
        return
      }
      let tables = this.selected.tables.concat(this.table.checked)
      if (tables.length) {
        tables = Array.from(new Set(tables))
        this.selected.tables = Object.freeze(tables)
        $emit(this, 'update:value', this.selected.tables)
        // $emit(this, 'change', this.selected.tables)
      } else {
        this.$message.warning(this.$t('packages_form_component_table_selector_not_checked'))
      }
    },
    remove() {
      if (this.isOpenClipMode || this.disabled) {
        return
      }
      let tables = this.selected.checked
      if (tables.length) {
        this.selected.tables = Object.freeze(this.selected.tables.filter((it) => !tables.includes(it)))
        this.selected.checked = []
        this.selected.isCheckAll = false
        $emit(this, 'update:value', this.selected.tables)
        // $emit(this, 'change', this.selected.tables)
      } else {
        this.$message.warning(this.$t('packages_form_component_table_selector_not_checked'))
      }
    },
    autofix() {
      if (this.isOpenClipMode) {
        this.clipboardValue = this.clipboardTables.filter((t) => !this.errorTables[t]).join(', ')
        this.errorTables = {}
      } else {
        this.selected.tables = Object.freeze(this.selected.tables.filter((t) => !this.errorTables[t]))
        $emit(this, 'update:value', this.selected.tables)
        // $emit(this, 'change', this.selected.tables)
      }
    },
    getErrorTables(tables) {
      let allTables = this.table.tables
      let errorTables = {}

      if (!this.loading) {
        tables.forEach((t) => {
          if (!allTables.includes(t)) {
            errorTables[t] = this.$t('packages_form_component_table_selector_error_not_exit')
          }
        })
      }

      this.errorTables = errorTables
      return errorTables
    },
    checkAll(flag, name) {
      if (flag) {
        this[name].checked = name === 'table' ? this.filteredData : this.filterSelectedData
      } else {
        this[name].checked = []
      }
    },
    checkedChange(name) {
      let { checked, tables } = this[name]
      if (checked.length === tables.length) {
        this[name].isCheckAll = true
      } else {
        this[name].isCheckAll = false
      }
    },
    changeSeletedMode() {
      this.isOpenClipMode = !this.isOpenClipMode
      this.errorTables = {}
      if (this.isOpenClipMode) {
        this.clipboardValue = this.selected.tables?.join(',') || ''
        this.isFocus = true
      } else {
        this.getErrorTables(this.selected.tables)
      }
    },
    // 获取所有表
    getTables() {
      this.loading = true
      const { connectionId } = this

      const fn = this.hasPartition
        ? metadataInstancesApi.pagePartitionTables({
            connectionId,
            limit: 0,
            syncPartitionTableEnable: this.syncPartitionTableEnable
          })
        : metadataInstancesApi.pageTables({ connectionId, limit: 0 })

      fn.then((res = {}) => {
        let data = res.items || []
        let tables = data.map((it) => it.tableName)
        let map = {}
        data.forEach((el = {}) => {
          const { tableName, tableComment, primaryKeyCounts = 0, uniqueIndexCounts = 0 } = el
          if (tableComment || primaryKeyCounts || uniqueIndexCounts) {
            map[tableName] = { tableComment, primaryKeyCounts, uniqueIndexCounts }
          }
        })
        this.tableMap = map
        tables.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
        this.table.tables = Object.freeze(tables)
      }).finally(() => {
        this.loading = false
      })
    },
    //重新加载模型
    async reload() {
      const data = await workerApi.getAvailableAgent()
      if (!data?.result?.length) {
        this.$message.error(this.$t('packages_form_agent_check_error'))
      } else {
        let config = {
          title: this.$t('packages_form_connection_reload_schema_confirm_title'),
          Message: this.$t('packages_form_connection_reload_schema_confirm_msg'),
        }
        this.$confirm(config.Message + '?', config.title, {
          type: 'warning',
          closeOnClickModal: false,
        }).then((resFlag) => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.testSchema()
          }
        })
      }
    },
    //请求测试连接并获取进度
    testSchema() {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading',
      }
      this.loadFieldsStatus = 'loading'
      connectionsApi.updateById(this.connectionId, parms).then((res) => {
        if (this?.$refs?.test) {
          let data = res
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          this.$refs.test.startByConnection(data, true)
          this.getProgress()
        }
      })
    },
    // 获取加载进度
    getProgress(check = false) {
      connectionsApi
        .getNoSchema(this.connectionId)
        .then((res) => {
          let data = res
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              const nodeId = this.nodeId || this.$store.state?.dataflow.activeNodeId
              const taskId = this.taskId || this.$store.state?.dataflow.taskId

              if (!check && taskId && nodeId) {
                metadataInstancesApi
                  .deleteLogicSchema(taskId, {
                    nodeId,
                  })
                  .then(() => {
                    this.getTables() //更新schema
                  })
              } else {
                this.getTables() //更新schema
              }
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            setTimeout(() => {
              if (this?.$refs?.test) {
                this.getProgress(true)
              }
            }, 1000)
          }
        })
        .catch(() => {
          // this.$message.error(this.$t('packages_form_connection_reload_schema_fail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },

    updateAllChecked() {
      this.table.isCheckAll =
        this.filteredData.length > 0 && this.filteredData.every((item) => this.table.checked.indexOf(item) > -1)
    },

    updateSelectedAllChecked() {
      this.selected.isCheckAll =
        this.filterSelectedData.length > 0 &&
        this.filterSelectedData.every((item) => this.selected.checked.indexOf(item) > -1)
    },

    getTableInfo(table) {
      return this.tableMap[table] || {}
    },

    handleFilterType() {
      this.table.checked = []
      this.selected.checked = []
      if (this.filterType === 'All') return

      // 待复制表
      this.table.isCheckAll = false

      // 已选择表
      this.selected.tables = Object.freeze(
        getPrimaryKeyTablesByType(this.selected.tables, this.filterType, this.tableMap),
      )
      this.selected.isCheckAll = false
      this.$emit('input', this.selected.tables)
      // this.$emit('change', this.selected.tables)
    },

    async loadSchema() {
      this.schemaLoading = true
      const nodeId = this.nodeId || this.$store.state?.dataflow.activeNodeId
      const taskId = this.taskId || this.$store.state?.dataflow.taskId

      await taskApi
        .refreshSchema(taskId, {
          nodeIds: nodeId,
          keys: this.table.searchKeyword,
        })
        .finally(() => {
          this.schemaLoading = false
        })

      this.getTables()
    },
  },
} */
</script>

<template>
  <div v-loading="loading" class="table-selector">
    <!-- 候选区 -->
    <div class="candidate-panel selector-panel rounded-lg">
      <div class="selector-panel__header">
        <div class="flex-1 flex align-center">
          <ElCheckbox
            v-if="table.tables.length"
            v-model="table.isCheckAll"
            :disabled="disabled"
            :indeterminate="isIndeterminate"
            @change="checkAll($event, 'table')"
          />
          <span class="ml-3">{{
            $t('packages_form_component_table_selector_candidate_label')
          }}</span>
          <span v-if="table.tables.length" class="font-color-light ml-2"
            >({{ table.checked.length }}/{{ filteredData.length }})</span
          >
        </div>
        <span v-if="showProgress" class="ml-2 color-primary">
          <el-icon class="mx-2"><el-icon-loading /></el-icon>
          <span>{{ progress }}%</span>
        </span>
      </div>

      <div class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput
            v-model="table.searchKeyword"
            clearable
            :placeholder="$t('public_input_placeholder_search')"
          >
            <template #suffix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
        </div>
        <ElCheckboxGroup
          v-show="filteredData.length"
          v-model="table.checked"
          :disabled="disabled"
          class="selector-panel__list"
          @change="checkedChange('table')"
        >
          <RecycleScroller
            class="selector-panel__scroller"
            :item-size="36"
            :buffer="50"
            :items="filteredData"
            key-field="name"
          >
            <template #default="{ item: { name: item } }">
              <ElCheckbox class="selector-panel__item" :label="item">
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
                      class="text-warning mr-1 mt-n1"
                      >key</VIcon
                    >
                    <VIcon
                      v-if="!!getTableInfo(item).uniqueIndexCounts"
                      size="12"
                      class="text-text-dark mr-1 mt-n1"
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
          <VEmpty
            v-if="!table.searchKeyword && !alwaysShowReload"
            :description="`${$t('packages_form_component_table_selector_tables_empty')}~`"
          />
          <VEmpty v-else>
            <span
              >{{
                $t('packages_form_component_table_selector_error_not_exit')
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
        <span
          class="btn-transfer rounded-4"
          :class="{
            'btn-transfer--disabled': isOpenClipMode || disabled,
            'btn-transfer--primary':
              table.checked.length > 0 && !isOpenClipMode && !disabled,
          }"
          @click="add"
        >
          <el-icon><el-icon-arrow-right /></el-icon>
        </span>
        <span
          class="btn-transfer rounded-4 mt-4 rounded-4"
          :class="{
            'btn-transfer--disabled': isOpenClipMode || disabled,
            'btn-transfer--primary':
              selected.checked.length > 0 && !isOpenClipMode && !disabled,
          }"
          @click="remove"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
        </span>
      </div>
    </div>
    <!-- 已选择区 -->
    <div class="checked-panel selector-panel rounded-lg">
      <div class="selector-panel__header">
        <div class="flex-1 flex align-center">
          <ElCheckbox
            v-if="selected.tables.length && !isOpenClipMode"
            v-model="selected.isCheckAll"
            :disabled="disabled"
            :indeterminate="selectedIsIndeterminate"
            @change="checkAll($event, 'selected')"
          />
          <span class="ml-3">{{
            $t('packages_form_component_table_selector_checked_label')
          }}</span>
          <span
            v-if="selected.tables.length && !isOpenClipMode"
            class="font-color-light ml-2"
            >({{ selected.checked.length }}/{{ selected.tables.length }})</span
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
            v-model="selected.searchKeyword"
            clearable
            :placeholder="$t('public_input_placeholder_search')"
          >
            <template #suffix>
              <ElIcon><ElIconSearch /></ElIcon>
            </template>
          </ElInput>
        </div>
        <ElCheckboxGroup
          v-show="filterSelectedData.length && !isOpenClipMode"
          v-model="selected.checked"
          class="selector-panel__list"
          :disabled="disabled"
          @change="checkedChange('selected')"
        >
          <RecycleScroller
            class="selector-panel__scroller"
            :item-size="36"
            :buffer="50"
            :items="filterSelectedData"
            key-field="name"
          >
            <template #default="{ item: { name: item } }">
              <ElCheckbox
                :key="item"
                class="selector-panel__item"
                :label="item"
              >
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
                      class="text-warning mr-1 mt-n1"
                      >key</VIcon
                    >
                    <VIcon
                      v-if="!!getTableInfo(item).uniqueIndexCounts"
                      size="12"
                      class="text-text-dark mr-1 mt-n1"
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
            :description="`${$t('packages_form_component_table_selector_not_checked')}~`"
          />
        </div>
        <div v-if="isOpenClipMode" class="selector-clipboard flex flex-column">
          <div
            v-show="!isFocus"
            class="selector-clipboard__view"
            @click="
              ;(isFocus = true),
                (clipboardValue = clipboardTables.concat().join(', '))
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
          <ElLink class="ml-2" type="primary" @click="autofix">{{
            $t('packages_form_component_table_selector_autofix')
          }}</ElLink>
        </div>
        <div v-if="isOpenClipMode" class="px-4 pb-4 text-end">
          <!--          <ElButton @click="changeSeletedMode()">{{ $t('public_button_cancel') }}</ElButton>-->
          <ElButton type="primary" @click="submitClipboard">{{
            $t('public_button_confirm')
          }}</ElButton>
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
  border: 1px solid map.get($borderColor, light);
  border-radius: 2px;
  overflow: hidden;
}
.selector-panel__header {
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  height: 40px;
  color: map.get($fontColor, normal);
  font-size: 13px;
  font-weight: 500;
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
    background-color: map.get($bgColor, disable);
  }
  > :deep(.el-checkbox__label) {
    overflow: hidden;
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
    background: map.get($bgColor, main);
    color: map.get($fontColor, normal);
    text-align: center;
    cursor: pointer;
    &:hover {
      background: map.get($color, primary);
      color: map.get($fontColor, white);
    }
    &.btn-transfer--disabled {
      background: map.get($bgColor, main);
      color: map.get($fontColor, normal);
      cursor: not-allowed;
    }
    &.btn-transfer--primary {
      background: map.get($color, primary);
      color: map.get($fontColor, white);
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
    color: map.get($fontColor, normal);
    word-break: break-word;
  }
  .selector-clipboard__view--empty {
    padding: 5px 11px;
    color: map.get($fontColor, slight);
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
