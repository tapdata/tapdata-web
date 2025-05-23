<script setup lang="tsx">
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { AsyncSelect } from '@tap/form'
import i18n from '@tap/i18n'
import { ClickOutside, Time } from '@tap/shared'
import { merge } from 'lodash-es'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { NODE_PREFIX } from '../../constants'
import { targetEndpoint } from '../../style'
import { TableSelect } from '../form'
import NodeIcon from '../NodeIcon.vue'

interface Props {
  position?: [number, number]
  schema?: any[]
  node: {
    id?: string
    name?: string
    connectionId?: string
    tableName?: string
    attrs?: Record<string, any>
    __Ctor?: any
    targetPath?: string
  }
  data: any
  jsPlumbIns: any
  schemaLoading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: () => [0, 0],
  schema: () => [],
  schemaLoading: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'dragStart', params: any): void
  (e: 'dragMove', params: any): void
  (
    e: 'dragStop',
    isNotMove: boolean,
    oldProperties: any[],
    newProperties: any[],
  ): void
  (e: 'deselectNode', nodeId: string): void
  (e: 'nodeSelected', nodeId: string, active: boolean): void
  (e: 'addNode', nodeData: any, options: any): void
  (e: 'deselectAllNodes'): void
  (e: 'loadSchema'): void
}>()

const store = useStore()
const isDrag = ref(false)
const isNotMove = ref(false)
const onMouseDownAt = ref<number>()

const params = {
  isTarget: true,
  where: {
    database_type: {
      in: ['MongoDB', 'MongoDB Atlas'],
    },
  },
}

const ins = computed(() => props.node?.__Ctor || {})

const nodeClass = computed(() => {
  const list: string[] = []
  if (ins.value) {
    list.push(`node--${ins.value.group}`)
  }
  return list
})

const nodeStyle = computed(() => {
  const [left = 0, top = 0] = props.position || []
  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

const treeData = computed(() => (props.schema ? createTree(props.schema) : []))

const treeEmptyText = computed(() => {
  if (!props.node.connectionId) {
    return i18n.t('packages_dag_select_database_tips')
  }

  if (!props.node.tableName) {
    return i18n.t('packages_dag_select_table_tips')
  }

  return i18n.t('public_data_no_data')
})

const transformLoading = computed(() => store.state.dataflow.transformLoading)
const taskSaving = computed(() => store.state.dataflow.taskSaving)

onMounted(() => {
  if (props.node.id) {
    init()
  }
})

function init() {
  const { id } = props.node
  const nodeId = id

  const targetParams = {
    ...targetEndpoint,
  }

  props.jsPlumbIns.makeTarget(`n_${id}`, targetParams)

  props.jsPlumbIns.draggable(document.querySelector(`#n_${id}`), {
    handle: '.node-title, .node-title *',
    start: (params: any) => {
      onMouseDownAt.value = Time.now()
      if (params.e && !isNodeSelected(props.node.id)) {
        props.jsPlumbIns.clearDragSelection()
        store.commit('dataflow/resetSelectedNodes')
      }

      store.commit('dataflow/addActiveAction', 'dragActive')

      emit('dragStart', params)
      return true
    },
    drag: (params: any) => {
      params.id = nodeId
      isDrag.value = true
      emit('dragMove', params)
    },
    stop: () => {
      isNotMove.value = false
      const { position } = props.data.attrs
      const newProperties: any[] = []
      const oldProperties: any[] = []

      if (store.getters['dataflow/isActionActive']('dragActive')) {
        const moveNodes = [...store.getters['dataflow/getSelectedNodes']]

        if (!isNodeSelected(props.node.id)) {
          moveNodes.push(props.data)
        }

        const element = document.querySelector(
          `#n_${props.node.id}`,
        ) as HTMLElement
        const x = Number.parseFloat(element.style.left)
        const y = Number.parseFloat(element.style.top)

        const distance = Math.hypot(x - position[0], y - position[1])

        if (x === position[0] && y === position[1]) {
          isNotMove.value = true
          store.commit('dataflow/removeActiveAction', 'dragActive')
        }

        if (distance < 4 || Time.now() - (onMouseDownAt.value || 0) < 10) {
          store.commit('dataflow/removeActiveAction', 'dragActive')
        }

        moveNodes.forEach((node) => {
          const nodeElement = NODE_PREFIX + node.id
          const element = document.querySelector(
            `#${nodeElement}`,
          ) as HTMLElement
          if (!element) {
            return
          }

          const newNodePosition = [
            Number.parseFloat(element.style.left),
            Number.parseFloat(element.style.top),
          ]

          const updateInformation = {
            id: node.id,
            properties: {
              attrs: { position: newNodePosition },
            },
          }

          oldProperties.push({
            id: node.id,
            properties: {
              attrs: { position },
            },
          })
          newProperties.push(updateInformation)
        })
      }

      onMouseDownAt.value = undefined
      emit('dragStop', isNotMove.value, oldProperties, newProperties)
    },
  })

  props.jsPlumbIns.addEndpoint(
    document.querySelector(`#n_${id}`),
    targetParams,
    {
      uuid: `${id}_target`,
    },
  )
}

function isNodeSelected(nodeId: string) {
  return store.getters['dataflow/getSelectedNodes'].some(
    (node: any) => node.id === nodeId,
  )
}

interface DatabaseItem {
  name: string
  id: string
  database_type: string
  connection_type: string
  status: string
  accessNodeType: string
  accessNodeProcessId: string
  accessNodeProcessIdList: string[]
  pdkType: string
  pdkHash: string
  capabilities: string[]
}

interface DatabaseResponse {
  items: DatabaseItem[]
  total: number
}

interface TableItem {
  original_name: string
  comment?: string
}

interface TableResponse {
  items: TableItem[]
  total: number
}

interface FilterParams {
  where?: {
    createType?: { $ne: string }
    connection_type?: string | { like: string; options: string }
    meta_type?: { in: string[] }
    is_deleted?: boolean
    sourceType?: string
    original_name?: string | { neq: string } | { like: string }
    value?: string
    'source.id'?: string
  }
  fields?: Record<string, boolean>
  order?: string[]
}

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
          resolve(true)
        })
      } else {
        resolve(true)
      }
    }, 100)
  })
}

async function loadDatabases(filter: FilterParams): Promise<DatabaseResponse> {
  try {
    const { isSource, isTarget } = filter
    const _filter: FilterParams = {
      where: {
        createType: {
          $ne: 'System',
        },
      },
      fields: {
        name: true,
        id: true,
        database_type: true,
        connection_type: true,
        status: true,
        accessNodeType: true,
        accessNodeProcessId: true,
        accessNodeProcessIdList: true,
        pdkType: true,
        pdkHash: true,
        capabilities: true,
      },
      order: ['status DESC', 'name ASC'],
    }

    if (isSource && isTarget) {
      _filter.where!.connection_type = 'source_and_target'
    } else if (isSource) {
      _filter.where!.connection_type = {
        like: 'source',
        options: 'i',
      }
    } else if (isTarget) {
      _filter.where!.connection_type = {
        like: 'target',
        options: 'i',
      }
    }

    const result = await connectionsApi.get({
      filter: JSON.stringify(merge(filter, _filter)),
    })

    return {
      items: result.items.map((item: DatabaseItem) => ({
        label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
        value: item.id,
        databaseType: item.database_type,
        connectionType: item.connection_type,
        ...item,
      })),
      total: result.total,
    }
  } catch (error) {
    console.error('Failed to load databases:', error)
    return { items: [], total: 0 }
  }
}

async function loadTable(
  filter: FilterParams,
  config: any,
): Promise<TableResponse> {
  if (filter.where) {
    Object.assign(filter.where, {
      meta_type: {
        in: ['collection', 'table', 'view'],
      },
      is_deleted: false,
      sourceType: 'SOURCE',
    })
  }

  Object.assign(filter, {
    fields: {
      original_name: true,
    },
    order: ['original_name ASC'],
  })

  if (filter.where?.value) {
    filter.where.original_name = filter.where.value
    delete filter.where.value
  } else {
    filter.where!.original_name = {
      neq: '',
    }
  }

  const result = await metadataInstancesApi.get(
    { filter: JSON.stringify(filter) },
    config,
  )

  const items = result.items.map((item: TableItem) => ({
    label: item.original_name + (item.comment ? `(${item.comment})` : ''),
    value: item.original_name,
  }))

  const table = filter.where?.original_name?.like
  if (table && !items.some((t) => t.value.includes(table))) {
    const res = await metadataInstancesApi.checkTableExist({
      connectionId: filter.where!['source.id'],
      tableName: table,
    })
    if (res?.data?.exist) {
      items.unshift({
        label: table,
        value: table,
      })
    }
  }

  return {
    items,
    total: result.total,
  }
}

function createTree(data: any[]) {
  const root = { children: [] }

  for (const item of data) {
    if (item.is_deleted) continue

    const { field_name } = item
    let parent = root
    const fields = field_name.split('.')

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      let child = parent.children.find((c: any) => c.field_name === field)

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

function renderContent(h: any, { data }: { data: any }) {
  let icon

  if (data.primary_key_position > 0) {
    icon = (
      <VIcon size={12} class="field-icon position-absolute">
        key
      </VIcon>
    )
  } else if (data.indicesUnique) {
    icon = (
      <VIcon size={12} class="field-icon position-absolute">
        fingerprint
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

function onConnectionSelect(connection: any) {
  const nodeAttrs = {
    connectionName: connection.name,
    connectionType: connection.connection_type,
    accessNodeProcessId: connection.accessNodeProcessId,
    pdkType: connection.pdkType,
    pdkHash: connection.pdkHash,
    capabilities: connection.capabilities || [],
    db_version: connection.db_version,
  }

  store.commit('dataflow/updateNodeProperties', {
    id: props.node.id,
    properties: {
      attrs: nodeAttrs,
    },
  })
}

async function onChangeConnection() {
  props.node.tableName = ''
  await store.dispatch('dataflow/updateDag', { isNow: true })
}

async function onChangeTable() {
  await store.dispatch('dataflow/updateDag', { isNow: true })
  setTimeout(async () => {
    await waitTaskSaved()
    await waitTaskTransform()
    emit('loadSchema')
  }, 100)
}

function onNodeExpandAndCollapse() {
  let animationStartTime: number
  let animationId: number

  const revalidate = (timestamp: number) => {
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
</script>

<template>
  <div
    :id="`n_${node.id}`"
    class="materialized-view-node --target position-absolute rounded-lg bg-white"
    :class="nodeClass"
    :style="nodeStyle"
  >
    <div class="node-header bg-primary">
      <div class="node-title text-white lh-base flex align-center px-2 py-1">
        <VIcon class="mr-1">drag</VIcon
        ><span class="ellipsis">{{ node.name }}</span>
      </div>
      <div class="flex gap-1 p-1">
        <AsyncSelect
          v-model="node.connectionId"
          :disabled="disabled"
          :placeholder="$t('packages_dag_select_database_tips')"
          :method="loadDatabases"
          :params="params"
          item-value="id"
          item-query="name"
          @option-select="onConnectionSelect"
          @change="onChangeConnection"
        >
          <template v-if="node.connectionId" #prefix>
            <div class="flex align-center h-100">
              <NodeIcon :node="node" :size="20" />
            </div>
          </template>
          <template #prepend-item>
            <div class="px-5 py-2 fs-7 font-color-sslight">
              {{ $t('packages_dag_only_mongodb') }}
            </div>
          </template>
        </AsyncSelect>
        <TableSelect
          v-model="node.tableName"
          :placeholder="$t('packages_dag_select_table_tips')"
          :disabled="!node.connectionId || disabled"
          :method="loadTable"
          :connection-id="node.connectionId"
          item-type="object"
          item-query="value"
          allow-create
          @change="onChangeTable"
        />
      </div>
    </div>
    <div v-loading="schemaLoading" class="p-2 node-body">
      <div class="flex align-center">
        <code class="color-success-light-5 mr-2">{</code>
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
