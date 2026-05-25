<script setup>
import { fetchConnections } from '@tap/api/src/core/connections'
import { findOneLiveDataPlatform } from '@tap/api/src/core/live-data-platform'
import { fetchMetadataInstances } from '@tap/api/src/core/metadata-instances'
import { createTask, fetchTasks } from '@tap/api/src/core/task'
import MonacoSqlEditor from '@tap/component/src/MonacoSqlEditor.vue'
import { useI18n } from '@tap/i18n'
import { uuid } from '@tap/shared'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible', 'generate'])

const generating = ref(false)

// State
const sqlText = ref('')
const outputTableName = ref('New_Materialized_View')
const parsedTables = ref([])
const parsing = ref(false)
const targetConnectionId = ref('')
const connections = ref([])
const fdmConnectionId = ref('')
const mdmConnectionId = ref('')
const sqlEditorRef = ref(null)
let parseTimer = null

// Load LDP settings for FDM/MDM defaults
const loadLdpSettings = async () => {
  try {
    const setting = await findOneLiveDataPlatform()
    if (setting) {
      fdmConnectionId.value = setting.fdmStorageConnectionId || ''
      mdmConnectionId.value = setting.mdmStorageConnectionId || ''
      targetConnectionId.value = mdmConnectionId.value
    }
  } catch (error) {
    console.error('Failed to load LDP settings', error)
  }
}

// Load all connections
const loadConnections = async () => {
  try {
    const data = await fetchConnections({
      limit: 999,
      where: {
        createType: { $ne: 'System' },
      },
    })
    connections.value = data?.items || []
  } catch (error) {
    console.error('Failed to load connections', error)
  }
}

// Target connections for dropdown
const targetConnections = computed(() => {
  return connections.value
    .filter((c) => ['target', 'source_and_target'].includes(c.connection_type))
    .map((c) => ({
      label: `${c.name} (${c.database_type})`,
      value: c.id,
    }))
})

// Parse SQL to extract table names
const extractTableNames = (sql) => {
  if (!sql || !sql.trim()) return []
  const cleaned = sql
    .replaceAll(/--.*$/gm, '')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()

  const tablePattern =
    /\b(?:FROM|JOIN|INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|NATURAL\s+JOIN)\s+(["'`]?)(\w+)\1/gi
  const sqlKeywords = new Set([
    'select',
    'where',
    'group',
    'having',
    'limit',
    'union',
    'values',
    'set',
    'into',
  ])
  const tables = new Set()
  let match
  while ((match = tablePattern.exec(cleaned)) !== null) {
    const quoted = match[1] // quote character, empty if unquoted
    const tableName = match[2]
    // If the name is quoted, it's always a table name (e.g. "Order")
    // If unquoted, skip SQL keywords
    if (quoted || !sqlKeywords.has(tableName.toLowerCase())) {
      tables.add(tableName)
    }
  }
  return [...tables]
}

// Search which connections contain a given table name
const searchTableInConnections = async (tableName) => {
  try {
    const data = await fetchMetadataInstances({
      limit: 100,
      where: {
        meta_type: { in: ['collection', 'table'] },
        is_deleted: false,
        original_name: tableName,
      },
      fields: {
        original_name: true,
        source: true,
      },
    })
    const items = data?.items || []
    const connectionMap = new Map()
    items.forEach((item) => {
      if (item.source?.id && !connectionMap.has(item.source.id)) {
        const conn = connections.value.find((c) => c.id === item.source.id)
        if (conn) {
          connectionMap.set(item.source.id, {
            id: conn.id,
            name: conn.name,
            database_type: conn.database_type,
            connection_type: conn.connection_type,
            accessNodeProcessId: conn.accessNodeProcessId,
            pdkType: conn.pdkType,
            pdkHash: conn.pdkHash,
            capabilities: conn.capabilities || [],
          })
        }
      }
    })
    return [...connectionMap.values()]
  } catch {
    return []
  }
}

// Real-time parse tables from SQL
const parseTables = async () => {
  const tableNames = extractTableNames(sqlText.value)
  if (!tableNames.length) {
    parsedTables.value = []
    return
  }
  parsing.value = true
  const results = await Promise.all(
    tableNames.map(async (name) => {
      const matchedConnections = await searchTableInConnections(name)
      let selectedConnectionId = ''
      let status = 'not_found'
      if (matchedConnections.length === 1) {
        selectedConnectionId = matchedConnections[0].id
        status = 'resolved'
      } else if (matchedConnections.length > 1) {
        // Try to auto-select FDM connection
        const fdmMatch = matchedConnections.find(
          (c) => c.id === fdmConnectionId.value,
        )
        if (fdmMatch) {
          selectedConnectionId = fdmMatch.id
          status = 'resolved'
        } else {
          status = 'ambiguous'
        }
      }
      return {
        name,
        matchedConnections,
        selectedConnectionId,
        status,
      }
    }),
  )
  parsedTables.value = results
  parsing.value = false
}

// Debounced parse
const debouncedParse = () => {
  clearTimeout(parseTimer)
  parseTimer = setTimeout(() => {
    parseTables()
  }, 800)
}

// All tables resolved?
const allResolved = computed(() => {
  if (!parsedTables.value.length) return false
  return parsedTables.value.every((t) => t.status === 'resolved')
})

// Status text
const statusReady = computed(() => {
  return allResolved.value && targetConnectionId.value && outputTableName.value
})

// Get connection options for a table card
const getConnectionOptions = (table) => {
  return table.matchedConnections.map((c) => ({
    label: `${c.name} (${c.database_type})`,
    value: c.id,
  }))
}

// Handle connection selection change
const handleConnectionChange = (table, connectionId) => {
  table.selectedConnectionId = connectionId
  table.status = connectionId ? 'resolved' : 'ambiguous'
}

// Insert sample SQL
const insertSampleSql = () => {
  const sample = `SELECT
    c.customer_id,
    c.full_name,
    c.nationality,
    c.risk_level,

    -- Calculate customer age
    date_diff('year', c.birthday, current_date) AS age,

    a.account_no,
    a.account_type,
    a.currency,
    a.balance,

    t.transaction_id,
    t.transaction_type,
    t.amount,
    t.fee_amount,

    -- Calculate net transaction amount
    (t.amount - t.fee_amount) AS net_amount,

    t.channel,
    t.merchant_name,
    t.transaction_time,

    -- Transaction amount classification
    CASE
        WHEN t.amount >= 100000 THEN 'HIGH_VALUE'
        WHEN t.amount >= 10000 THEN 'MEDIUM_VALUE'
        ELSE 'NORMAL'
    END AS transaction_level,

    -- Risk detection logic
    CASE
        WHEN c.risk_level = 'HIGH'
             AND t.amount > 100000
        THEN 'SUSPICIOUS'

        WHEN t.country_code <> 'PH'
        THEN 'CROSS_BORDER'

        ELSE 'NORMAL'
    END AS risk_tag,

    -- Normalize transaction status
    UPPER(t.transaction_status) AS transaction_status

FROM FDM___customer c

LEFT JOIN FDM___bank_account a
       ON c.customer_id = a.customer_id

LEFT JOIN FDM___transaction_record t
       ON a.account_id = t.account_id

WHERE t.transaction_status IS NOT NULL

ORDER BY t.transaction_time DESC;`
  sqlText.value = sample
  sqlEditorRef.value?.setValue(sample)
}

// Generate task name
const makeTaskName = async (prefix) => {
  const taskNames = await fetchTasks({
    limit: 9999,
    fields: { name: 1 },
    where: { name: { like: `^${prefix}\\d+$` } },
  })

  if (!taskNames?.items?.length) return `${prefix}1`

  const existingNumbers = new Set()
  taskNames.items.forEach((item) => {
    const res = item.name.match(new RegExp(`^${prefix}(\\d+)$`))
    if (res?.[1]) existingNumbers.add(Number.parseInt(res[1]))
  })

  let def = 1
  while (existingNumbers.has(def)) def++
  return `${prefix}${def}`
}

// Generate DAG and create task
const handleGenerate = async () => {
  if (!statusReady.value || generating.value) return

  const targetConn = connections.value.find(
    (c) => c.id === targetConnectionId.value,
  )
  if (!targetConn) return

  generating.value = true

  try {
    // Build source table nodes
    const sourceNodes = parsedTables.value.map((table) => {
      const conn = table.matchedConnections.find(
        (c) => c.id === table.selectedConnectionId,
      )
      return {
        id: uuid(),
        type: 'table',
        name: table.name,
        tableName: table.name,
        connectionId: conn.id,
        databaseType: conn.database_type,
        attrs: {
          connectionName: conn.name,
          connectionType: conn.connection_type,
          accessNodeProcessId: conn.accessNodeProcessId,
          pdkType: conn.pdkType,
          pdkHash: conn.pdkHash,
          capabilities: conn.capabilities || [],
          hasCreated: false,
        },
      }
    })

    // Build DuckDB processor node
    const duckDbNode = {
      id: uuid(),
      // customNodeId: '6a13981485d8acd034a94849',
      type: 'custom_processor',
      name: 'DuckDB',
      attrs: {
        key: 'duckdb',
      },
      form: {
        sql: sqlText.value,
      },
    }

    // Build target node
    const targetNode = {
      id: uuid(),
      type: 'table',
      name: outputTableName.value,
      tableName: outputTableName.value,
      connectionId: targetConn.id,
      databaseType: targetConn.database_type,
      attrs: {
        connectionName: targetConn.name,
        connectionType: targetConn.connection_type,
        accessNodeProcessId: targetConn.accessNodeProcessId,
        pdkType: targetConn.pdkType,
        pdkHash: targetConn.pdkHash,
        capabilities: targetConn.capabilities || [],
        hasCreated: false,
      },
    }

    // Build edges: source -> duckdb -> target
    const edges = []
    sourceNodes.forEach((node) => {
      edges.push({ source: node.id, target: duckDbNode.id })
    })
    edges.push({ source: duckDbNode.id, target: targetNode.id })

    const nodes = [...sourceNodes, duckDbNode, targetNode]

    // Create task via API
    const taskName = await makeTaskName(`${t('public_task')} `)
    const taskData = await createTask({
      name: taskName,
      syncType: 'sync',
      type: 'initial_sync+cdc',
      isAutoCreateIndex: true,
      isOpenAutoDDL: false,
      accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
      dag: { nodes, edges },
    })

    emit('generate', { taskId: taskData.id })
  } catch (error) {
    console.error('Failed to create task', error)
  } finally {
    generating.value = false
  }
}

// Watch sql changes -> real-time parse
watch(sqlText, () => {
  debouncedParse()
})

// Watch dialog visible
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await loadConnections()
      await loadLdpSettings()
    } else {
      sqlText.value = ''
      parsedTables.value = []
      outputTableName.value = 'New_Materialized_View'
      targetConnectionId.value = mdmConnectionId.value
    }
  },
)

onBeforeUnmount(() => {
  clearTimeout(parseTimer)
})

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="t('public_duckdb_dialog_title')"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    destroy-on-close
    class="duckdb-sql-dialog p-0"
    @close="handleClose"
  >
    <template #header>
      <div class="p">
        <div class="text-lg font-semibold">
          {{ t('public_duckdb_dialog_title') }}
        </div>
        <div class="text-xs" style="color: var(--el-text-color-secondary)">
          {{ t('public_duckdb_dialog_subtitle') }}
        </div>
      </div>
    </template>

    <div
      class="duckdb-content flex border-top border-bottom"
      style="height: 520px"
    >
      <!-- Left Column: SQL Editor -->
      <div
        class="flex flex-column"
        style="flex: 3; border-right: 1px solid var(--el-border-color)"
      >
        <div class="flex justify-between align-center px-4 py-2">
          <span class="font-semibold text-sm">{{
            t('public_duckdb_sql_label')
          }}</span>
          <span
            class="text-xs cursor-pointer"
            style="color: var(--el-color-primary)"
            @click="insertSampleSql"
            >{{ t('public_duckdb_insert_sample') }}</span
          >
        </div>
        <MonacoSqlEditor
          ref="sqlEditorRef"
          v-model="sqlText"
          class="flex-1 min-h-0"
          placeholder="SELECT ... FROM SourceTable JOIN AnotherTable ..."
        />
      </div>

      <!-- Right Column: Connection Mapping -->
      <div
        class="flex flex-column"
        style="flex: 2; background: var(--el-fill-color-extra-light)"
      >
        <!-- Target Configuration -->
        <div
          class="p-4"
          style="
            background: var(--el-bg-color);
            border-bottom: 1px solid var(--el-border-color);
          "
        >
          <div class="font-semibold text-sm mb-3">
            {{ t('public_duckdb_target_config') }}
          </div>
          <div class="mb-3">
            <div
              class="text-xs mb-1"
              style="color: var(--el-text-color-regular)"
            >
              {{ t('public_duckdb_output_table_name') }}
            </div>
            <ElInput v-model="outputTableName" size="default" />
          </div>
          <div>
            <div
              class="text-xs mb-1"
              style="color: var(--el-text-color-regular)"
            >
              {{ t('public_duckdb_target_connection') }}
            </div>
            <ElSelect v-model="targetConnectionId" class="w-100" size="default">
              <ElOption
                v-for="opt in targetConnections"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
        </div>

        <!-- Source Table Validation -->
        <div class="flex-1 min-h-0 flex flex-column">
          <div class="font-semibold text-sm px-4 py-2">
            {{ t('public_duckdb_source_validation') }}
          </div>
          <ElScrollbar class="flex-1">
            <div class="px-4 pb-4">
              <!-- Empty state -->
              <div
                v-if="!parsedTables.length && !parsing"
                class="flex flex-column align-center justify-center py-12"
                style="color: var(--el-text-color-placeholder)"
              >
                <el-icon size="48" class="mb-3"><i-lucide-database /></el-icon>
                <span class="text-sm">{{ t('public_duckdb_empty_hint') }}</span>
              </div>

              <!-- Loading -->
              <div
                v-else-if="parsing"
                v-loading="true"
                class="py-12"
                style="min-height: 100px"
              />

              <!-- Table Cards -->
              <template v-else>
                <div
                  v-for="table in parsedTables"
                  :key="table.name"
                  class="mb-3 p-3 rounded-lg"
                  :style="{
                    background: 'var(--el-bg-color)',
                    border:
                      table.status === 'ambiguous'
                        ? '1px solid var(--el-color-warning)'
                        : '1px solid var(--el-border-color)',
                  }"
                >
                  <!-- Card Header -->
                  <div class="flex align-center justify-between mb-2">
                    <div class="flex align-center gap-2">
                      <el-icon
                        :style="{
                          color:
                            table.status === 'resolved'
                              ? 'var(--el-color-success)'
                              : table.status === 'ambiguous'
                                ? 'var(--el-color-warning)'
                                : 'var(--el-color-danger)',
                        }"
                      >
                        <i-lucide-check-circle
                          v-if="table.status === 'resolved'"
                        />
                        <i-lucide-alert-circle v-else />
                      </el-icon>
                      <span class="font-semibold">{{ table.name }}</span>
                    </div>
                    <ElTag
                      v-if="table.status === 'not_found'"
                      type="danger"
                      size="small"
                      >{{ t('public_duckdb_not_found') }}</ElTag
                    >
                    <ElTag
                      v-else-if="
                        table.status === 'ambiguous' ||
                        table.matchedConnections.length > 1
                      "
                      type="warning"
                      size="small"
                      >{{ t('public_duckdb_multiple_matches') }}</ElTag
                    >
                  </div>

                  <!-- Connection Select -->
                  <ElSelect
                    v-if="table.matchedConnections.length > 0"
                    :model-value="table.selectedConnectionId"
                    class="w-100"
                    size="default"
                    :placeholder="t('public_duckdb_select_connection')"
                    :class="{
                      'is-ambiguous': table.status === 'ambiguous',
                    }"
                    @change="handleConnectionChange(table, $event)"
                  >
                    <ElOption
                      v-for="opt in getConnectionOptions(table)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </ElSelect>
                  <div
                    v-if="table.status === 'not_found'"
                    class="text-xs mt-1"
                    style="color: var(--el-color-danger)"
                  >
                    {{ t('public_duckdb_not_found') }}
                  </div>
                  <div
                    v-if="
                      table.status === 'ambiguous' &&
                      table.matchedConnections.length > 1
                    "
                    class="text-xs mt-1"
                    style="color: var(--el-color-warning)"
                  >
                    {{
                      t('public_duckdb_ambiguous_hint', {
                        count: table.matchedConnections.length,
                      })
                    }}
                  </div>
                </div>
              </template>
            </div>
          </ElScrollbar>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between align-center">
        <div class="flex align-center gap-2">
          <el-icon
            v-if="statusReady"
            style="color: var(--el-color-success)"
            size="16"
          >
            <i-lucide-check-circle />
          </el-icon>
          <el-icon v-else style="color: var(--el-color-warning)" size="16">
            <i-lucide-alert-circle />
          </el-icon>
          <span
            class="text-sm"
            :style="{
              color: statusReady
                ? 'var(--el-color-success)'
                : 'var(--el-color-warning)',
            }"
          >
            {{
              statusReady
                ? t('public_duckdb_ready')
                : t('public_duckdb_resolve_ambiguous')
            }}
          </span>
        </div>
        <div class="flex gap-2">
          <ElButton @click="handleClose">{{
            t('public_duckdb_cancel')
          }}</ElButton>
          <ElButton
            type="primary"
            :disabled="!statusReady"
            :loading="generating"
            @click="handleGenerate"
          >
            {{ t('public_duckdb_generate_dag') }}
            <el-icon class="ml-1"><i-lucide-arrow-right /></el-icon>
          </ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.duckdb-sql-dialog {
  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
  }

  .is-ambiguous {
    .el-input__wrapper {
      border-color: var(--el-color-warning) !important;
      box-shadow: 0 0 0 1px var(--el-color-warning) inset !important;
    }
  }
}
</style>
