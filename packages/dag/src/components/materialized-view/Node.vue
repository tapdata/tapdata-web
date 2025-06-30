<script setup lang="tsx">
import { fetchConnections, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import { FieldSelect } from '@tap/form/src/components/field-select'
import AsyncSelect from '@tap/form/src/components/infinite-select/InfiniteSelect.vue'
import i18n from '@tap/i18n'
import { Time } from '@tap/shared'
import { merge, unionBy } from 'lodash-es'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { sourceEndpoint, targetEndpoint } from '../../style'
import { TableSelect } from '../form'
import NodeIcon from '../NodeIcon.vue'

// Props definition
const props = defineProps({
  position: Array,
  inputs: Array,
  schema: Array,
  parentSchema: Array,
  node: {
    type: Object,
    default: () => ({}),
  },
  data: Object,
  nodeId: {
    type: String,
    required: true,
  },
  jsPlumbIns: Object,
  getInputs: Function,
  getOutputs: Function,
  isMainTable: Boolean,
  tableOptions: Array,
  targetPathMap: Object,
  nodeSchemaMap: Object,
  nodeMap: Object,
  inputsMap: Object,
  hasTargetNode: Boolean,
  schemaLoading: Boolean,
  disabled: Boolean,
})

// Emits
const emit = defineEmits([
  'addTargetNode',
  'changeParent',
  'changePath',
  'dragStart',
  'dragMove',
  'dragStop',
  'deselectNode',
  'nodeSelected',
  'addNode',
  'loadSchema',
])

// Store and route
const store = useStore()
const route = useRoute()

// Refs
const fieldPopover = ref(null)
const dropDownMenu = ref(null)
const isDrag = ref(false)
const isNotMove = ref(false)
const onMouseDownAt = ref(undefined)
const targetPoint = ref(null)
const currentCommand = ref('')

// Store getters and actions
const nodeById = (id) => store.getters['dataflow/nodeById'](id)
const isActionActive = (action) =>
  store.getters['dataflow/isActionActive'](action)
const isNodeSelected = (nodeId) =>
  store.getters['dataflow/isNodeSelected'](nodeId)

// State
let fieldType = 'Flatten'

if (props.node.mergeType === 'updateIntoArray') {
  fieldType = 'Array'
} else if (props.node.targetPath) {
  fieldType = 'Document'
}

const state = reactive({
  loading: false,
  params: {
    where: { database_type: 'MongoDB' },
  },
  targetFields: [],
  targetPath: props.node.targetPath,
  fieldNameVisible: false,
  fieldName: '',
  fieldType,
  fieldTypeOptions: [
    {
      label: i18n.t('packages_dag_materialized_view_field_flatten'),
      value: 'Flatten',
    },
    {
      label: i18n.t('packages_dag_materialized_view_field_document'),
      value: 'Document',
    },
    {
      label: i18n.t('packages_dag_materialized_view_field_array'),
      value: 'Array',
    },
  ],
})

// Computed properties
const tableComment = computed(() => dagNode.value.attrs.tableComment)

const ins = computed(() => props.node?.__Ctor || {})

const nodeClass = computed(() => {
  const list = []
  ins.value && list.push(`node--${ins.value.group}`)
  return list
})

const nodeStyle = computed(() => {
  const [left = 0, top = 0] = props.position || []
  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

const displaySchema = computed(() => {
  return props.node.tableNode.connectionId && props.node.tableNode.tableName
})

const treeData = computed(() => {
  let schema = props.schema ? [...props.schema] : []

  if (!schema) return []

  const inputs = props.inputsMap?.[props.node.id]

  if (inputs?.length) {
    const { targetPath } = props.node
    let mergedFields = richFields(
      props.inputsMap[props.node.id],
      props.node.targetPath,
    )

    if (targetPath) {
      mergedFields = mergedFields
        .map((field) => {
          return {
            ...field,
            field_name: field.field_name.replace(
              new RegExp(`^${targetPath}\\.|^${targetPath}$`),
              '',
            ),
          }
        })
        .filter((field) => !!field.field_name)
    }

    schema = unionBy(schema, mergedFields, 'field_name')
    schema.sort((a, b) => {
      let aVal, bVal

      if (a.isPrimaryKey) aVal = 1
      else if (a.indicesUnique) aVal = 2
      else aVal = 3

      if (b.isPrimaryKey) bVal = 1
      else if (b.indicesUnique) bVal = 2
      else bVal = 3

      if (aVal === bVal) {
        return a.field_name.localeCompare(b.field_name)
      }

      return aVal - bVal
    })
  }

  return createTree(schema)
})

const transformLoading = computed(() => store.state.dataflow.transformLoading)
const taskSaving = computed(() => store.state.dataflow.taskSaving)

const sourceNodes = computed(() => {
  return findParentNodes(props.node.id, true)
})

const dagNode = computed(() => {
  return props.node.tableNode
})

const newTableOptions = computed(() => {
  return props.tableOptions.filter(({ value }) => props.node.id !== value)
})

const parentFieldOptions = computed(() => {
  return props.parentSchema
})

const treeEmptyText = computed(() => {
  if (!props.node.tableNode.connectionId) {
    return i18n.t(
      props.isMainTable
        ? 'packages_dag_materialized_view_main_talbe_tips'
        : 'packages_dag_select_database_tips',
    )
  }

  if (!props.node.tableNode.tableName) {
    return i18n.t(
      props.isMainTable
        ? 'packages_dag_materialized_view_main_talbe_tips'
        : 'packages_dag_select_table_tips',
    )
  }

  return i18n.t('public_data_no_data')
})

// Methods
function waitTaskTransform() {
  return new Promise<void>((resolve) => {
    const unwatch = watch(transformLoading, (val) => {
      if (!val) {
        unwatch()
        resolve()
      }
    })
  })
}

function waitTaskSaved() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (taskSaving.value) {
        const unwatch = watch(taskSaving, () => {
          unwatch()
          resolve()
        })
      } else {
        resolve()
      }
    }, 100)
  })
}

function findParentNodes(id, ifMyself) {
  const node = nodeById(id)
  const parents = []
  const parentIds = node.$inputs || []

  if (ifMyself && !parentIds.length) return [node]

  parentIds.forEach((pid) => {
    const parent = nodeById(pid)
    if (parent) {
      if (parent.$inputs?.length) {
        parent.$inputs.forEach((ppid) => {
          parents.push(...findParentNodes(ppid, true))
        })
      } else {
        parents.push(parent)
      }
    }
  })

  return parents
}

function __init() {
  const { id } = props.node
  const nodeId = id

  const targetParams = {
    ...targetEndpoint,
  }

  props.jsPlumbIns.makeTarget(`n_${id}`, targetParams)

  props.jsPlumbIns.draggable(document.querySelector(`#n_${nodeId}`), {
    handle: '.node-title, .node-title *',
    start: (params) => {
      onMouseDownAt.value = Time.now()
      if (params.e && !isNodeSelected(props.nodeId)) {
        props.jsPlumbIns.clearDragSelection()
        store.commit('dataflow/resetSelectedNodes')
      }

      store.commit('dataflow/addActiveAction', 'dragActive')

      emit('dragStart', params)
      return true
    },
    drag: (params) => {
      params.id = nodeId
      isDrag.value = true
      emit('dragMove', params)
    },
    stop: () => {
      isNotMove.value = false

      if (isActionActive('dragActive')) {
        props.position[0] = Number.parseFloat(
          document.getElementById(`n_${nodeId}`).style.left,
        )
        props.position[1] = Number.parseFloat(
          document.getElementById(`n_${nodeId}`).style.top,
        )
      }

      onMouseDownAt.value = undefined
      emit('dragStop', isNotMove.value, [], [])
    },
  })

  targetPoint.value = props.jsPlumbIns.addEndpoint(
    document.querySelector(`#n_${nodeId}`),
    targetParams,
    {
      uuid: `${id}_target`,
    },
  )

  props.jsPlumbIns.addEndpoint(
    document.querySelector(`#n_${nodeId}`),
    {
      ...sourceEndpoint,
      enabled: false,
      connectorStyle: {
        strokeWidth: 1,
        stroke: '#9f9f9f',
        outlineStroke: 'transparent',
        outlineWidth: 20,
      },
    },
    {
      uuid: `${id}_source`,
    },
  )
}

async function loadDatabases(filter) {
  try {
    const { isSource, isTarget } = filter
    const _filter = {
      where: {
        createType: {
          $ne: 'System',
        },
      },
      fields: {
        name: 1,
        id: 1,
        database_type: 1,
        connection_type: 1,
        status: 1,
        accessNodeType: 1,
        accessNodeProcessId: 1,
        accessNodeProcessIdList: 1,
        pdkType: 1,
        pdkHash: 1,
        capabilities: 1,
      },
      order: ['status DESC', 'name ASC'],
    }

    if (isSource && isTarget) {
      _filter.where.connection_type = 'source_and_target'
    } else if (isSource) {
      _filter.where.connection_type = {
        like: 'source',
        options: 'i',
      }
    } else if (isTarget) {
      _filter.where.connection_type = {
        like: 'target',
        options: 'i',
      }
    }

    const result = await fetchConnections(merge(filter, _filter))

    result.items = result.items.map((item) => {
      return {
        label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
        value: item.id,
        databaseType: item.database_type,
        connectionType: item.connection_type,
        ...item,
      }
    })

    return result
  } catch (error) {
    console.error('Error loading databases:', error)
    return { items: [], total: 0 }
  }
}

async function loadTable(filter, config) {
  filter.where &&
    Object.assign(filter.where, {
      meta_type: {
        in: ['collection', 'table', 'view'],
      },
      is_deleted: false,
      sourceType: 'SOURCE',
    })
  Object.assign(filter, {
    fields: {
      original_name: true,
    },
    order: ['original_name ASC'],
  })
  if (filter.where?.value) {
    filter.where.original_name = filter.where?.value
    delete filter.where.value
  } else {
    filter.where.original_name = {
      neq: '',
    }
  }
  const data = await metadataInstancesApi.get(
    { filter: JSON.stringify(filter) },
    config,
  )
  data.items = data.items.map((item) => {
    return {
      label: item.original_name + (item.comment ? `(${item.comment})` : ''),
      value: item.original_name,
      comment: item.comment,
    }
  })
  const table = filter.where.original_name?.like
  if (table && !data.items.some((t) => t.value.includes(table))) {
    const res = await metadataInstancesApi.checkTableExist({
      connectionId: filter.where['source.id'],
      tableName: table,
    })
    if (res?.exist) {
      data.items.unshift({
        label: table,
        value: table,
      })
    }
  }
  return data
}

function createTree(data) {
  const root = { children: [] }

  for (const item of data) {
    if (item.is_deleted) continue

    const { field_name } = item
    let parent = root
    const fields = field_name.split('.')

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      let child = parent.children.find((c) => c.field_name === field)

      if (!child) {
        child = { field_name: field, children: [] }
        parent.children.push(child)
      }

      parent = child

      if (i === fields.length - 1) {
        Object.assign(parent, item, {
          field_name: field,
        })
      }
    }
  }

  return root.children
}

function renderContent(h, { data }) {
  let icon

  if (data.isPrimaryKey) {
    icon = !data.isForeignKey ? (
      <VIcon size="12" class="field-icon position-absolute">
        key
      </VIcon>
    ) : (
      <ElTooltip
        placement="top"
        content={i18n.t('public_foreign_key_tip', {
          name: data.constraints[0],
          val: data.constraints[2],
        })}
        open-delay={200}
        transition="none"
      >
        <VIcon size="12" class="field-icon position-absolute">
          key
        </VIcon>
      </ElTooltip>
    )
  } else if (data.isForeignKey) {
    const indexStr = String(data.constraints[1])
    icon = (
      <ElTooltip
        placement="top"
        content={i18n.t('public_foreign_key_tip', {
          name: data.constraints[0],
          val: data.constraints[2],
        })}
        open-delay={200}
        transition="none"
      >
        <span class="flex align-center field-icon position-absolute">
          <VIcon size="14">share</VIcon>
          {data.isMultiForeignKey && (
            <span
              style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
              class="fingerprint-sub foreign-sub"
            ></span>
          )}
        </span>
      </ElTooltip>
    )
  } else if (data.indicesUnique) {
    const indexStr = String(data.indicesUnique[1])
    icon = (
      <ElTooltip
        placement="top"
        content={`${i18n.t(data.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ${
          data.indicesUnique[0]
        }`}
        open-delay={200}
        transition="none"
      >
        {data.indicesUnique[2] ? (
          <span class="flex align-center field-icon position-absolute">
            <VIcon size="14">fingerprint</VIcon>
            {data.isMultiUniqueIndex && (
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class="fingerprint-sub unique-sub"
              ></span>
            )}
          </span>
        ) : (
          <span class="flex align-center field-icon position-absolute">
            <VIcon size="14">sort-descending</VIcon>
            {data.isMultiIndex && (
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class="fingerprint-sub index-sub"
              ></span>
            )}
          </span>
        )}
      </ElTooltip>
    )
  } else if (data.isPartitionKey) {
    icon = (
      <VIcon size="14" class="field-icon position-absolute">
        circle-dashed-letter-p
      </VIcon>
    )
  } else if (data.source === 'virtual_hash') {
    icon = (
      <VIcon size="12" class="field-icon position-absolute">
        file-hash
      </VIcon>
    )
  }

  return (
    <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
      {icon}
      <span class="ellipsis">{data.field_name}</span>
      <span class="ml-1 font-color-sslight">{data.dataType}</span>
    </div>
  )
}

function handleAddJoinKey() {
  if (!props.node.joinKeys) {
    props.node.joinKeys = [
      {
        source: '',
        target: '',
      },
    ]
    return
  }
  props.node.joinKeys.push({
    source: '',
    target: '',
  })
}

function handleFieldSelectVisible(visible) {
  if (visible) loadTargetField()
}

async function loadTargetField() {
  const fields = await metadataInstancesApi.getMergerNodeParentFields(
    route.params.id,
    props.node.id,
  )

  state.targetFields = fields.map((item) => {
    let label = item.field_name
    const arr = label.split('.')

    if (arr.length > 1) {
      const parentPath = arr.slice(0, -1).join('.')
      const tableName = props.targetPathMap[parentPath]?.tableNode?.tableName
      if (tableName) {
        label = `${tableName}.${arr.pop()}`
      }
    }

    return {
      label,
      value: item.field_name,
      isPrimaryKey: item.primary_key_position > 0,
    }
  })
}

function handleCommand(command) {
  currentCommand.value = command
  switch (command) {
    case 'Flatten':
      state.fieldName = ''
      handleAddTableNode()
      break
    case 'Document':
    case 'Array':
      state.fieldName = ''
      state.fieldNameVisible = true
      nextTick(() => {
        fieldPopover.value.querySelector('input')?.focus()
      })
      break
  }
}

function handleAddTableNode() {
  // Emit to parent instead of directly modifying props
  emit('addNode', {
    mergeType:
      currentCommand.value === 'Array' ? 'updateIntoArray' : 'updateWrite',
    targetPath: state.fieldName
      ? `${props.node.targetPath ? `${props.node.targetPath}.` : ''}${state.fieldName}`
      : props.node.targetPath || '',
  })
}

function include() {
  return [dropDownMenu.value?.$el, fieldPopover.value]
}

function onClickOutside() {
  state.fieldNameVisible = false
}

function onSaveFieldName() {
  state.fieldNameVisible = false
  handleAddTableNode()
}

function onConnectionSelect(connection) {
  const nodeAttrs = {
    connectionName: connection.name,
    connectionType: connection.connection_type,
    accessNodeProcessId: connection.accessNodeProcessId,
    pdkType: connection.pdkType,
    pdkHash: connection.pdkHash,
    capabilities: connection.capabilities || [],
    db_version: connection.db_version,
  }
  dagNode.value.databaseType = connection.databaseType
  Object.keys(nodeAttrs).forEach((key) => {
    dagNode.value.attrs[key] = nodeAttrs[key]
  })
}

async function onChangeConnection() {
  dagNode.value.tableName = ''
  await store.dispatch('dataflow/updateDag', { vm: this, isNow: true })
}

async function onChangeTable(table) {
  props.node.tableName = table
  dagNode.value.name = table
  await nextTick()
  // await store.dispatch('dataflow/updateDag', { isNow: true })
  setTimeout(async () => {
    await waitTaskSaved()
    await waitTaskTransform()
    emit('loadSchema')
  }, 100)
}

function onTableSelect(table) {
  dagNode.value.attrs.tableComment = table.comment
}

function onChangeType(type) {
  if (type === 'Array') {
    props.node.mergeType = 'updateIntoArray'
  } else {
    props.node.mergeType = 'updateWrite'

    if (type === 'Flatten') {
      state.targetPath = ''
      emit('changePath', props.node, '')
    }
  }
}

function onNodeExpandAndCollapse() {
  let animationStartTime
  let animationId

  const revalidate = (timestamp) => {
    if (!animationStartTime) {
      animationStartTime = timestamp
    }

    const elapsedTime = timestamp - animationStartTime

    props.jsPlumbIns.revalidate(`n_${props.node.id}`)

    if (elapsedTime < 350) {
      animationId = requestAnimationFrame(revalidate)
    } else {
      cancelAnimationFrame(animationId)
    }
  }

  animationId = requestAnimationFrame(revalidate)
}

/**
 * 根据写入路径，收集上游字段
 */
function richFields(inputs, targetPath) {
  let arr = []

  for (const input of inputs) {
    const inputNode = props.nodeMap[input]
    let fields = props.nodeSchemaMap[input]

    if (!fields) continue

    const nodeTargetPath = inputNode.targetPath

    if (nodeTargetPath) {
      fields = fields.map((field) => {
        return {
          ...field,
          field_name: `${nodeTargetPath}.${field.field_name}`,
        }
      })

      fields.unshift({
        field_name: nodeTargetPath,
        dataType:
          inputNode.mergeType === 'updateIntoArray' ? 'ARRAY' : 'DOCUMENT',
      })
    }

    if (props.inputsMap[input]?.length) {
      const newFields = richFields(props.inputsMap[input], nodeTargetPath)
      arr = unionBy(arr, fields, newFields, 'field_name')
    } else {
      arr = unionBy(arr, fields)
    }
  }

  return arr
}

// Init component
onMounted(() => {
  if (props.node && ins.value) {
    __init()
  }
})
</script>

<template>
  <div
    :id="`n_${node.id}`"
    tabindex="1"
    class="materialized-view-node position-absolute rounded-lg bg-white"
    :class="{
      '--main-table': props.isMainTable,
    }"
    :style="nodeStyle"
  >
    <div class="node-header overflow-hidden">
      <div class="node-title text-white lh-base flex align-center p-1">
        <VIcon class="mr-1">drag</VIcon
        ><span class="ellipsis">{{ dagNode.name }} </span>
        <span
          v-if="tableComment"
          class="ml-1 flex-shrink-0 ellipsis"
          style="color: rgba(255, 255, 255, 0.8)"
          >({{ tableComment }})</span
        >
        <ElButton
          v-if="
            !props.hasTargetNode &&
            props.isMainTable &&
            dagNode.connectionId &&
            dagNode.tableName
          "
          size="small"
          class="ml-auto"
          @click="emit('addTargetNode')"
        >
          <VIcon class="mr-1">add</VIcon>
          {{ $t('packages_dag_write_target') }}</ElButton
        >
      </div>
      <div class="flex gap-1 p-1">
        <AsyncSelect
          v-model="dagNode.connectionId"
          :disabled="props.disabled"
          :placeholder="$t('packages_dag_select_database_tips')"
          :method="loadDatabases"
          :params="{ isSource: true }"
          item-value="id"
          item-query="name"
          lazy
          :current-label="dagNode.attrs.connectionName"
          @option-select="onConnectionSelect"
          @change="onChangeConnection"
        >
          <template v-if="dagNode.connectionId" #prefix>
            <div class="flex align-center h-100">
              <NodeIcon :node="dagNode" :size="20" />
            </div>
          </template>
        </AsyncSelect>
        <TableSelect
          v-model="dagNode.tableName"
          class="table-select"
          :placeholder="$t('packages_dag_select_table_tips')"
          :disabled="!dagNode.connectionId || props.disabled"
          collapse-tags
          :method="loadTable"
          :connection-id="dagNode.connectionId"
          item-type="object"
          item-query="value"
          lazy
          @option-select="onTableSelect"
          @change="onChangeTable"
        />
      </div>
      <ElForm
        class="node-form px-1"
        label-position="top"
        :disabled="props.disabled"
        @submit.prevent
      >
        <template v-if="!props.isMainTable">
          <ElFormItem :label="$t('packages_dag_join_table')">
            <ElSelect
              :model-value="props.node.parentId"
              class="w-100"
              @change="emit('changeParent', props.node, $event)"
            >
              <ElOption
                v-for="option in newTableOptions"
                v-bind="option"
                :key="option.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <template #label>
              <div class="flex align-center justify-content-between">
                <span>{{
                  $t('packages_dag_nodes_mergetable_guanliantiaojian')
                }}</span>
                <ElButton
                  text
                  :disabled="props.disabled"
                  type="primary"
                  size="small"
                  @click="handleAddJoinKey"
                >
                  <VIcon class="mr-1">add</VIcon>
                  {{ $t('public_button_add') }}</ElButton
                >
              </div>
            </template>
            <ElButton
              v-if="!props.node.joinKeys || !props.node.joinKeys.length"
              type="ghost"
              class="w-100 fs-8"
              :disabled="props.disabled"
              @click="handleAddJoinKey"
            >
              <VIcon class="mr-1">add</VIcon>
              {{ $t('public_button_add') }}
            </ElButton>
            <div v-else class="flex flex-column gap-2 w-100">
              <div
                v-for="(keys, i) in props.node.joinKeys"
                :key="i"
                class="flex w-100 align-center gap-1"
              >
                <FieldSelect
                  v-model="keys.source"
                  class="flex-1"
                  :options="props.schema"
                  :fit-input-width="292"
                />
                <span>=</span>
                <FieldSelect
                  v-model="keys.target"
                  class="flex-1"
                  :options="state.targetFields"
                  :fit-input-width="292"
                  @visible-change="handleFieldSelectVisible"
                />
                <IconButton
                  :disabled="props.disabled"
                  @click="node.joinKeys.splice(i, 1)"
                  >delete</IconButton
                >
              </div>
            </div>
          </ElFormItem>
        </template>

        <template v-if="props.node.parentId || props.hasTargetNode">
          <ElFormItem :label="$t('packages_dag_materialized_view_field_type')">
            <ElSelect
              v-model="state.fieldType"
              class="w-100"
              @change="onChangeType"
            >
              <ElOption
                v-for="(option, i) in state.fieldTypeOptions"
                v-bind="option"
                :key="i"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            :label="$t('packages_dag_nodes_mergetable_guanlianhouxieru')"
          >
            <ElInput
              v-model="state.targetPath"
              @change="emit('changePath', props.node, $event)"
            />
          </ElFormItem>
        </template>

        <ElFormItem
          v-if="
            !props.isMainTable && props.node.mergeType === 'updateIntoArray'
          "
          :label="$t('packages_dag_nodes_mergetable_neiqianshuzupi')"
        >
          <FieldSelect
            v-model="props.node.arrayKeys"
            class="w-100"
            item-label="field_name"
            item-value="field_name"
            :options="props.schema"
            multiple
          />
        </ElFormItem>
      </ElForm>
    </div>
    <ElDivider class="my-0" />
    <div v-loading="props.schemaLoading" class="p-2 node-body">
      <div class="flex align-center">
        <code class="color-success-light-5 mr-2">{</code>
        <ElPopover
          v-if="displaySchema && !props.disabled"
          placement="top"
          width="240"
          :visible="state.fieldNameVisible"
        >
          <div ref="fieldPopover">
            <ElInput
              v-model="state.fieldName"
              autofocus
              :placeholder="
                $t('packages_business_components_fieldbox_qingshuruziduan')
              "
              @keydown.enter="onSaveFieldName"
            />
            <div class="mt-2 text-end">
              <el-button text @click="state.fieldNameVisible = false">{{
                $t('public_button_cancel')
              }}</el-button>
              <el-button type="primary" @click="onSaveFieldName">{{
                $t('public_button_confirm')
              }}</el-button>
            </div>
          </div>
          <template #reference>
            <ElDropdown trigger="click" @command="handleCommand">
              <ElButton
                v-click-outside="{
                  handler: onClickOutside,
                  include,
                }"
                text
                type="primary"
              >
                <VIcon class="mr-1">add</VIcon>
                {{ $t('packages_dag_add_field') }}
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu ref="dropDownMenu">
                  <ElDropdownItem
                    v-for="(option, i) in state.fieldTypeOptions"
                    :key="i"
                    :command="option.value"
                    >{{ option.label }}</ElDropdownItem
                  >
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElPopover>
      </div>
      <ElTree
        class="fs-8 node-schema-tree overflow-y-auto"
        :indent="8"
        :data="treeData"
        :render-content="renderContent"
        :empty-text="treeEmptyText"
        @node-expand="onNodeExpandAndCollapse"
        @node-collapse="onNodeExpandAndCollapse"
      />
      <code class="color-success-light-5">}</code>
    </div>
  </div>
</template>

<style lang="scss">
@import 'style';
</style>
