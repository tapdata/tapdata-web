import {
  getConnectionSharedCdcStatus,
  getSharedCdcEnable,
} from '@tap/api/src/core/external-storage'
import { callProxy } from '@tap/api/src/core/proxy'
import { fetchSharedCache } from '@tap/api/src/core/shared-cache'
import {
  batchStartTasks,
  checkTaskMemoryHeap,
  deleteTask,
  fetchMergeTaskCache,
  forceStopTask,
  getNodeTableInfo,
  renameTask,
  resetTask,
  saveTask,
  stopTask,
} from '@tap/api/src/core/task'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import { makeStatusAndDisabled } from '@tap/business/src/shared/task'
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import { Modal } from '@tap/component/src/modal'
import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import {
  getInitialValuesInBySchema,
  validateBySchema,
} from '@tap/form/src/shared/validate'
import { useI18n } from '@tap/i18n'
import { setPageTitle, uuid } from '@tap/shared'
import { cloneDeep, isEmpty } from 'lodash-es'
import {
  computed,
  getCurrentInstance,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useDataflowStore } from '../stores/dataflow.store'
import {
  AddConnectionCommand,
  AddNodeCommand,
  MoveNodeCommand,
  RemoveConnectionCommand,
  RemoveNodeCommand,
} from '../stores/history'
import { useHistoryStore } from '../stores/history.store'
import {
  getSchema,
  getTableRenameByConfig,
  ifTableNameConfigEmpty,
} from '../util'
import { useFormScope } from './useFormScope'

export function useCanvasOperation() {
  const X_OFFSET = 100
  const NODE_WIDTH = 242
  const instance = getCurrentInstance()
  const $ws = (instance?.proxy as any).$ws
  const dataflowStore = useDataflowStore()
  const historyStore = useHistoryStore()
  const buried = inject('buried') as (...args: any[]) => void
  const consoleRef = ref<any>(null)
  const skipErrorRef = ref<any>(null)
  const taskOperationsRef = ref<any>(null)
  const canvasRef = ref<any>(null)
  const sharedMiningEditorRef = ref<any>(null)
  const sharedCacheDetailsRef = ref<any>(null)
  const sharedCacheEditorRef = ref<any>(null)
  const sharedCacheMap = shallowRef<Record<
    string,
    {
      id: string
      name: string
      status: string
    }
  > | null>(null)
  const formScope = useFormScope({
    canvasRef,
  })

  const buttonShowMap = reactive({
    View: true,
    Edit: true,
    Delete: true,
    Reset: true,
    Start: true,
    Stop: true,
  })

  const dag = computed(() => dataflowStore.dag)
  const { t } = useI18n()
  const store = useStore()
  const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
  const upgradeFeeVisibleTips = ref('')
  const upgradeFeeVisible = ref(false)
  const upgradeChargesVisibleTips = ref('')
  const upgradeChargesVisible = ref(false)
  const nameHasUpdated = ref(false)
  const destory = ref(false)

  const dataflow = reactiveComputed(() => ({ ...dataflowStore.dataflow }))

  const dataflowName = ref(dataflow.value.name)
  const dataflowDesc = ref(dataflow.value.desc)

  watch(
    () => dataflow.value.name,
    (v: string) => (dataflowName.value = v),
  )
  watch(
    () => dataflow.value.desc,
    (v: string) => (dataflowDesc.value = v),
  )

  const isSyncTask = computed(() => {
    return [
      'DataflowNew',
      'DataflowEditor',
      'TaskMonitor',
      'MigrationMonitorViewer', // 任务记录也加载自定节点
    ].includes(route.name)
  })

  const monitorRoute = computed(() => {
    if (dataflow.value.syncType === 'sync') return 'TaskMonitor'
    else return 'MigrationMonitor'
  })

  const syncTypeMap: Record<string, string> = {
    initial_sync: t('public_task_type_initial_sync'),
    cdc: t('public_task_type_cdc'),
    'initial_sync+cdc': t('public_task_type_initial_sync_and_cdc'),
  }

  const syncTypeLabel = computed(
    () => syncTypeMap[dataflow.value.type] || dataflow.value.type,
  )

  const hasFeature = (feature: string) => {
    return !isDaas || store.getters['feature/hasFeature']?.(feature)
  }

  const syncProcessor = [
    {
      name: 'SQL',
      type: 'duckdb_sql_processor',
    },
    {
      name: t('packages_dag_src_editor_zhuconghebing'),
      type: 'merge_table_processor',
      hidden: !hasFeature('masterSlaveMergeProcessor'),
    },
    {
      name: t('packages_dag_src_editor_zhuijiahebing'),
      type: 'union_processor',
      hidden: !hasFeature('appendMergeProcessor'),
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli_standard'),
      type: 'standard_js_processor',
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli'),
      type: 'js_processor',
      beta: true,
      hidden: !hasFeature('enhanceJsProcessor'),
    },
    {
      name: t('packages_dag_src_editor_row_filter'),
      type: 'row_filter_processor',
      hidden: !hasFeature('rowFilterProcessor'),
    },
    {
      name: t('packages_dag_src_editor_ziduanjisuan'),
      type: 'field_calc_processor',
    },
    {
      name: t('packages_dag_src_editor_leixingxiugai'),
      type: 'field_mod_type_processor',
    },
    {
      name: t('packages_dag_src_editor_ziduangaiming'),
      type: 'field_rename_processor',
    },
    {
      name: t('packages_dag_src_editor_zengshanziduan'),
      type: 'field_add_del_processor',
    },
    {
      name: t('packages_dag_date_processor'),
      type: 'date_processor',
    },
    {
      name: t('packages_dag_src_editor_leixingguolu'),
      type: 'field_mod_type_filter_processor',
    },
    {
      name: 'Unwind',
      type: 'unwind_processor',
      hidden: !hasFeature('unwindProcessor'),
    },
    {
      name: t('packages_dag_time_field_injection'),
      type: 'add_date_field_processor',
      hidden: !hasFeature('appendDatetimeFieldProcessor'),
    },
    {
      name: t('packages_dag_src_editor_huawei_drs_kafka_convertor'),
      type: 'huawei_drs_kafka_convertor',
    },
  ]
  const migrateProcessor = [
    {
      name: t('packages_dag_migrate_union'),
      type: 'migrate_union_processor',
      hidden: !hasFeature('multipleTableMergeProcessor'),
    },
    {
      name: t('packages_dag_src_migrationeditor_biaobianji'),
      type: 'table_rename_processor',
    },
    {
      name: t('packages_dag_src_migrationeditor_ziduanbianji'),
      type: 'migrate_field_rename_processor',
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli_standard'),
      type: 'standard_migrate_js_processor',
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli'),
      type: 'migrate_js_processor',
      beta: true,
      hidden: !hasFeature('enhanceJsProcessor'),
    },
    {
      name: t('packages_dag_date_processor'),
      type: 'migrate_date_processor',
    },
    {
      name: t('packages_dag_src_editor_leixingguolu'),
      type: 'migrate_field_mod_type_filter_processor',
    },
    {
      name: t('packages_dag_time_field_injection'),
      type: 'migrate_add_date_field_processor',
      hidden: !hasFeature('appendDatetimeFieldProcessor'),
    } /* ,
    {
      name: t('packages_dag_src_editor_huawei_drs_kafka_convertor'),
      type: 'migrate_huawei_drs_kafka_convertor'
    } */,
  ]

  const initNodeType = async () => {
    let nodes = isSyncTask.value ? syncProcessor : migrateProcessor
    //仅企业版有的节点
    if (isDaas && isSyncTask.value) {
      const isDaasNode = [
        {
          name: t('packages_dag_src_editor_join'),
          type: 'join_processor', //join 节点
        },
      ]
      nodes = [...isDaasNode, ...nodes]
    }
    dataflowStore.addProcessorNode(nodes.filter((item) => !item.hidden))
    // dataflowStore.addResourceIns(allResourceIns)

    if (isSyncTask.value && hasFeature('customProcessor')) {
      await dataflowStore.loadCustomNode()
    }
  }

  interface NodePositionEvent {
    id: string
    position: { x: number; y: number }
    oldPosition?: { x: number; y: number }
  }

  interface ConnectionEvent {
    source: string
    target: string
  }

  const onUpdateNodesPosition = (
    events: NodePositionEvent[],
    { trackHistory = true, trackBulk = true } = {},
  ) => {
    if (trackHistory && trackBulk) {
      historyStore.startRecordingUndo()
    }

    events.forEach(({ id, position }) => {
      updateNodePosition(id, position, { trackHistory })
    })

    if (trackHistory && trackBulk) {
      historyStore.stopRecordingUndo()
    }
  }

  function updateNodePosition(
    id: string,
    position: { x: number; y: number },
    { trackHistory = true } = {},
  ) {
    const node = dataflowStore.getNodeById(id)
    if (!node) {
      return
    }

    const oldPosition: [number, number] = [...node.attrs.position]
    const newPosition: [number, number] = [position.x, position.y]

    dataflowStore.setNodePositionById(id, newPosition)

    if (trackHistory) {
      historyStore.pushCommandToUndo(
        new MoveNodeCommand(node.id, oldPosition, newPosition, Date.now()),
      )
    }
  }

  // 用于 NodesPopover 等场景，直接传入新位置数组
  const onMoveNodePosition = (
    id: string,
    newPosition: [number, number],
    { trackHistory = true } = {},
  ) => {
    const node = dataflowStore.getNodeById(id)
    if (!node) {
      return
    }

    const oldPosition: [number, number] = [...node.attrs.position]
    dataflowStore.setNodePositionById(id, newPosition)

    if (trackHistory) {
      historyStore.pushCommandToUndo(
        new MoveNodeCommand(id, oldPosition, newPosition, Date.now()),
      )
    }
  }

  const onCreateConnection = (
    connection: ConnectionEvent,
    { trackHistory = true } = {},
  ) => {
    dataflowStore.addConnection(connection)
    if (trackHistory) {
      historyStore.pushCommandToUndo(
        new AddConnectionCommand(connection, Date.now()),
      )
    }
  }

  const onDeleteConnection = (
    connection: ConnectionEvent,
    { trackHistory = true } = {},
  ) => {
    dataflowStore.deleteConnection(connection)
    if (trackHistory) {
      historyStore.pushCommandToUndo(
        new RemoveConnectionCommand(connection, Date.now()),
      )
    }
  }

  const onClickNode = (node: any) => {
    dataflowStore.selectNode(node.data)
  }

  const deleteConnectionsByNodeId = (
    nodeId: string,
    { trackHistory = true, trackBulk = true } = {},
  ) => {
    if (trackHistory && trackBulk) {
      historyStore.startRecordingUndo()
    }

    // 先收集所有需要删除的连线，避免在遍历时修改数组导致跳过元素
    const edgesToDelete = dag.value.edges.filter(
      (edge: ConnectionEvent) =>
        edge.source === nodeId || edge.target === nodeId,
    )

    edgesToDelete.forEach((edge: ConnectionEvent) => {
      onDeleteConnection(edge, {
        trackHistory,
      })
    })

    if (trackHistory && trackBulk) {
      historyStore.stopRecordingUndo()
    }
  }

  const connectAdjacentNodes = (id: string, { trackHistory = true } = {}) => {
    const node = dataflowStore.getNodeById(id) as any
    if (!node) return

    const { $inputs = [], $outputs = [] } = node

    for (const source of $inputs) {
      for (const target of $outputs) {
        onCreateConnection(
          {
            source,
            target,
          },
          { trackHistory },
        )
      }
    }
  }

  const getBeforeNodesInSameBranch = (nodeId: string) => {
    const list: any[] = []
    const visited = new Set<string>()

    const traverse = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)

      const currentNode = dataflowStore.getNodeById(id) as any
      if (!currentNode) return

      list.push(currentNode)

      currentNode.$inputs?.forEach((inputId: string) => {
        traverse(inputId)
      })
    }

    traverse(nodeId)

    return list
  }

  const moveDownstreamNodesForward = (
    node: any,
    { trackHistory = true } = {},
  ) => {
    const outputs = node?.$outputs || []
    if (!outputs.length) return

    const movedNodeIds = new Set<string>()
    const offset =
      (node?.dimensions?.width || node?.width || NODE_WIDTH) + X_OFFSET

    const hasMultiInputOutput = outputs.some((outputId: string) =>
      dataflowStore
        .getAfterNodesInSameBranch(outputId)
        .some((outputNode: any) => (outputNode?.$inputs?.length || 0) > 1),
    )

    if (hasMultiInputOutput) {
      node.$inputs?.forEach((inputId: string) => {
        const inputNode = dataflowStore.getNodeById(inputId) as any
        const [deletedX, deletedY] = node.attrs?.position || [0, 0]
        const [inputX, inputY] = inputNode?.attrs?.position || [0, 0]
        const deltaX = deletedX - inputX
        const deltaY = deletedY - inputY

        getBeforeNodesInSameBranch(inputId).forEach((beforeNode) => {
          if (
            !beforeNode ||
            beforeNode.id === node.id ||
            movedNodeIds.has(beforeNode.id)
          ) {
            return
          }

          movedNodeIds.add(beforeNode.id)
          const [x, y] = beforeNode.attrs?.position || [0, 0]
          onMoveNodePosition(beforeNode.id, [x + deltaX, y + deltaY], {
            trackHistory,
          })
        })
      })
      return
    }

    outputs.forEach((outputId: string) => {
      const afterNodes = dataflowStore.getAfterNodesInSameBranch(outputId)

      afterNodes.forEach((afterNode: any) => {
        if (
          !afterNode ||
          afterNode.id === node.id ||
          movedNodeIds.has(afterNode.id)
        ) {
          return
        }

        movedNodeIds.add(afterNode.id)
        const [x, y] = afterNode.attrs?.position || [0, 0]
        onMoveNodePosition(afterNode.id, [x - offset, y], { trackHistory })
      })
    })
  }

  const onDeleteNode = (
    node: any,
    { trackHistory = true, trackBulk = true } = {},
  ) => {
    if (trackHistory && trackBulk) {
      historyStore.startRecordingUndo()
    }

    connectAdjacentNodes(node.id, { trackHistory })
    moveDownstreamNodesForward(node, { trackHistory })
    deleteConnectionsByNodeId(node.id, { trackHistory, trackBulk: false })

    dataflowStore.deleteNode(node)

    // 清空选中状态
    if ((dataflowStore.selectedNode as any)?.id === node.id) {
      dataflowStore.selectedNode = null
    }

    // 3. 记录节点删除
    if (trackHistory) {
      historyStore.pushCommandToUndo(new RemoveNodeCommand(node, Date.now()))
      if (trackBulk) {
        historyStore.stopRecordingUndo()
      }
    }
  }

  const onDeleteNodes = (nodes: any[]) => {
    historyStore.startRecordingUndo()
    nodes.forEach((node) => {
      onDeleteNode(node, { trackHistory: true, trackBulk: false })
    })
    historyStore.stopRecordingUndo()
  }

  const onAddNode = (node: any, { trackHistory = true } = {}) => {
    if (
      (node.type === 'table' || node.type === 'database') &&
      node.attrs?.pdkHash
    ) {
      const pdkProperties = dataflowStore.pdkPropertiesMap[node.attrs?.pdkHash]
      const nodeConfig = node.nodeConfig || {}
      if (pdkProperties) {
        const formValues = getInitialValuesInBySchema(
          {
            properties: {
              attrs: {
                type: 'object',
                default: node.attrs,
              },
              $inputs: {
                default: [],
                type: 'array',
              },
              $outputs: {
                default: [],
                type: 'array',
              },
              nodeConfig: {
                type: 'object',
                ...pdkProperties,
              },
            },
          },
          {},
        )
        Object.assign(nodeConfig, formValues.nodeConfig)
        node.nodeConfig = nodeConfig
      }
    }
    dataflowStore.addNode(node)
    if (trackHistory) {
      historyStore.pushCommandToUndo(new AddNodeCommand(node, Date.now()))
    }
  }

  // ========== Copy / Paste ==========
  const CLIPBOARD_FLAG = '__tapdata_dag_clipboard__'

  const onCopyNodes = (nodes: any[]) => {
    const nodeIds = new Set(nodes.map((n) => n.id))
    // 只保留选中节点之间的连线
    const edges = dag.value.edges.filter(
      (e: any) => nodeIds.has(e.source) && nodeIds.has(e.target),
    )
    const payload = {
      flag: CLIPBOARD_FLAG,
      nodes: cloneDeep(nodes),
      edges: cloneDeep(edges),
    }
    return JSON.stringify(payload)
  }

  /**
   * 计算粘贴节点组的包围盒尺寸
   */
  const getNodesGroupSize = (
    nodes: any[],
  ): { width: number; height: number } => {
    const NODE_WIDTH = 220
    const NODE_HEIGHT = 76
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const node of nodes) {
      const [x, y] = node.attrs?.position ?? [0, 0]
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + NODE_WIDTH)
      maxY = Math.max(maxY, y + NODE_HEIGHT)
    }
    return { width: maxX - minX, height: maxY - minY }
  }

  /**
   * 借鉴 n8n：在 lastClickPosition 附近找到一个不与现有节点重叠的位置。
   * 返回粘贴节点组左上角应放置的坐标。
   */
  const getNewNodePosition = (
    existingNodes: any[],
    clickPos: [number, number],
    groupSize: { width: number; height: number } = { width: 0, height: 0 },
  ): [number, number] => {
    const NODE_WIDTH = 220
    const NODE_HEIGHT = 76
    const GRID_SIZE = 16

    let [targetX, targetY] = clickPos
    // 将目标位置对齐到网格
    // targetX = Math.round(targetX / GRID_SIZE) * GRID_SIZE
    targetY = Math.round(targetY / GRID_SIZE) * GRID_SIZE

    const hasCollision = (x: number, y: number): boolean => {
      const right = x + Math.max(groupSize.width, NODE_WIDTH)
      const bottom = y + Math.max(groupSize.height, NODE_HEIGHT)
      return existingNodes.some((n) => {
        const [nx, ny] = n.attrs?.position ?? [0, 0]
        return (
          x < nx + NODE_WIDTH &&
          right > nx &&
          y < ny + NODE_HEIGHT &&
          bottom > ny
        )
      })
    }

    // 向右下方逐步偏移，直到找到不重叠的位置
    let attempts = 0
    while (hasCollision(targetX, targetY) && attempts < 50) {
      // targetX += GRID_SIZE
      targetY += GRID_SIZE
      attempts++
    }

    return [targetX, targetY]
  }

  /**
   * 粘贴节点，返回新节点的 ID 列表（用于后续选中和视野定位）
   */
  const onPasteNodes = (plainText: string): string[] => {
    let data: any
    try {
      data = JSON.parse(plainText)
    } catch {
      return [] // 非合法 JSON，忽略
    }
    if (data?.flag !== CLIPBOARD_FLAG || !Array.isArray(data.nodes)) return []

    const nodes: any[] = cloneDeep(data.nodes)
    const edges: any[] = cloneDeep(data.edges || [])
    if (!nodes.length) return []

    // 计算原始节点组的包围盒左上角
    let origMinX = Infinity
    let origMinY = Infinity
    for (const node of nodes) {
      const [x, y] = node.attrs?.position ?? [0, 0]
      origMinX = Math.min(origMinX, x)
      origMinY = Math.min(origMinY, y)
    }

    // 计算目标位置：lastClickPosition 附近无重叠的位置
    const groupSize =
      nodes.length > 1 ? getNodesGroupSize(nodes) : { width: 0, height: 0 }
    const [newX, newY] = getNewNodePosition(
      dag.value.nodes,
      dataflowStore.lastClickPosition,
      groupSize,
    )

    // 计算偏移量：原始左上角 → 目标位置
    const offsetX = newX - origMinX
    const offsetY = newY - origMinY

    // 旧 ID → 新 ID 映射
    const idMap: Record<string, string> = {}
    nodes.forEach((node) => {
      const newId = uuid()
      idMap[node.id] = newId
      node.id = newId
      // 按统一偏移量移动位置
      if (node.attrs?.position) {
        node.attrs.position = [
          node.attrs.position[0] + offsetX,
          node.attrs.position[1] + offsetY,
        ]
      }
      // 清除运行时引用，addNode 时会重建
      node.$inputs = []
      node.$outputs = []
      delete node.__Ctor
    })

    // 重新映射连线
    edges.forEach((edge) => {
      edge.source = idMap[edge.source]
      edge.target = idMap[edge.target]
    })

    // 批量添加，作为一个 bulk undo
    historyStore.startRecordingUndo()
    nodes.forEach((node) => {
      onAddNode(node, { trackHistory: true })
    })
    edges.forEach((edge) => {
      onCreateConnection(edge, { trackHistory: true })
    })
    historyStore.stopRecordingUndo()

    return nodes.map((n) => n.id)
  }

  // ========== Validation & Save ==========
  const router = useRouter()
  const route = useRoute()
  const isSaving = ref(false)
  const isReset = ref(false)
  let mergeTableCacheValidated = false
  const eachMap: Record<string, boolean> = {}

  const allNodes = computed(() => dataflowStore.dag.nodes)

  const hasNodeError = (id: string) =>
    store.getters['dataflow/hasNodeError'](id)
  const getCapabilitiesMap = dataflowStore.getCapabilitiesMap
  const setNodeError = (id: string) => store.commit('dataflow/setNodeError', id)
  const setNodeErrorMsg = (payload: { id: string; msg: string }) =>
    store.commit('dataflow/setNodeErrorMsg', payload)
  const clearNodeError = (id: string) =>
    store.commit('dataflow/clearNodeError', id)
  const setMaterializedViewVisible = (v: boolean) => {
    dataflowStore.materializedViewVisible = v
  }

  const findNodeById = dataflowStore.getNodeById

  const findParentNodes = (id: string, excludeId?: string): any[] => {
    const node = findNodeById(id)
    const nodes: any[] = []
    const parentIds = node?.$inputs || []

    for (const parentId of parentIds) {
      if (parentId === excludeId) continue
      const parentNode = findNodeById(parentId)
      if (
        !parentNode ||
        parentNode.__Ctor.maxInputs !== 1 ||
        parentNode.$outputs.length > 1
      )
        continue
      nodes.push(parentNode)
      if (parentNode.$inputs?.length) {
        nodes.push(...findParentNodes(parentId))
      }
    }
    return nodes
  }

  const findChildNodes = (id: string): any[] => {
    const node = findNodeById(id)
    const nodes: any[] = []
    const ids = node?.$outputs || []

    ids.forEach((childId: string) => {
      const child = findNodeById(childId)
      if (!child) return
      if (child.type === 'join_processor') {
        nodes.push(...findParentNodes(child.id, node!.id))
      } else if (child.__Ctor.maxInputs !== 1) return
      nodes.push(child)
      if (child.$outputs?.length) {
        nodes.push(...findChildNodes(childId))
      }
    })
    return nodes
  }

  const findAllChildNodes = (id: string): any[] => {
    const node = findNodeById(id)
    const nodes: any[] = []
    const ids = node?.$outputs || []

    ids.forEach((childId: string) => {
      const child = findNodeById(childId)
      if (!child) return
      nodes.push(child)
      if (child.$outputs?.length) {
        nodes.push(...findAllChildNodes(childId))
      }
    })
    return nodes
  }

  // 验证图的连通性
  const eachOutputs = (node: any) => {
    eachMap[node.id] = true
    if (node.$outputs.length > 0) {
      node.$outputs.forEach((id: string) => {
        if (eachMap[id]) return
        const output = findNodeById(id)!
        if (output.$inputs.length > 1) {
          eachInputsByFilter(output, node.id)
        }
        eachOutputs(output)
      })
    }
  }

  const eachInputsByFilter = (node: any, filterId: string) => {
    eachMap[node.id] = true
    node.$inputs.forEach((id: string) => {
      if (id !== filterId && !eachMap[id]) {
        const input = findNodeById(id)!
        eachInputs(input)
        if (input.$outputs.length > 1) {
          eachOutputsByFilter(input, node.id)
        }
      }
    })
  }

  const eachOutputsByFilter = (node: any, filterId: string) => {
    eachMap[node.id] = true
    node.$outputs.forEach((id: string) => {
      if (id !== filterId && !eachMap[id]) {
        const output = findNodeById(id)!
        eachOutputs(output)
        if (output.$inputs.length > 1) {
          eachInputsByFilter(output, node.id)
        }
      }
    })
  }

  const eachInputs = (node: any) => {
    eachMap[node.id] = true
    if (node.$inputs.length > 0) {
      node.$inputs.forEach((id: string) => {
        if (eachMap[id]) return
        const input = findNodeById(id)!
        if (input.$outputs.length > 1) {
          eachOutputsByFilter(input, node.id)
        }
        eachInputs(input)
      })
    }
  }

  // --- 单节点校验 ---
  const validateNode = async (node: any) => {
    try {
      const schema = getSchema(
        node.__Ctor.formSchema,
        node,
        dataflowStore.pdkPropertiesMap,
      )
      await validateBySchema(schema, node, formScope, undefined)
      clearNodeError(node.id)
    } catch (error: any) {
      console.error(t('packages_dag_mixins_editor_jiedianjiaoyancuo'), error)
      if (node.type === 'table_rename_processor') {
        setNodeErrorMsg({ id: node.id, msg: error[0].messages[0] })
      } else {
        setNodeError(node.id)
      }
    }
  }

  const validateAllNodes = async (nodes: any[]) => {
    await Promise.all(nodes.map((node) => validateNode(node)))
  }

  // --- DAG 结构校验 ---
  const validateDag = () => {
    let someErrorMsg = ''
    let targetDataNodeCount = 0
    allNodes.value.some((node: any) => {
      const { id } = node
      const minInputs = node.__Ctor.minInputs ?? 1
      const isDataNode = node.type === 'database' || node.type === 'table'
      const minOutputs = (node.__Ctor.minOutputs ?? !isDataNode) ? 1 : 0
      const inputNum = node.$inputs.length
      const outputNum = node.$outputs.length

      if (hasNodeError(id)) {
        someErrorMsg = t('packages_dag_src_migrationmonitor_noden', {
          val1: node.name,
        })
        return true
      }
      if (inputNum < minInputs) {
        someErrorMsg = t('packages_dag_node_none_input', {
          val1: node.name,
          val2: minInputs,
        })
        return true
      }
      if (outputNum < minOutputs) {
        someErrorMsg = t('packages_dag_node_none_output', {
          val1: node.name,
          val2: minOutputs,
        })
        return true
      }
      if (!inputNum && !outputNum) {
        someErrorMsg = t('packages_dag_node_none_connection', {
          val1: node.name,
        })
        return true
      }
      if (isDataNode && inputNum && !outputNum) {
        targetDataNodeCount += 1
      }
      if (targetDataNodeCount > 1) {
        someErrorMsg = t('packages_dag_not_support_multi_target')
        return true
      }
      return false
    })
    return someErrorMsg
  }

  // --- Agent 校验 ---
  const validateAgent = () => {
    let someErrorMsg: string | undefined
    const nodes = allNodes.value.filter(
      (node: any) => node.type === 'database' || node.type === 'table',
    )
    const accessNodeProcessIdArr = [
      ...nodes.reduce((set: Set<string>, item: any) => {
        item.attrs.accessNodeProcessId &&
          set.add(item.attrs.accessNodeProcessId)
        return set
      }, new Set<string>()),
    ]

    if (accessNodeProcessIdArr.length > 1) {
      const chooseId = dataflowStore.dataflow.accessNodeProcessId
      if (!chooseId) {
        someErrorMsg = t('packages_dag_mixins_editor_suoshuage')
      } else {
        let isError = false
        const agent = (formScope as any)?.$agentMap?.[chooseId]
        nodes.forEach((node: any) => {
          if (
            node.attrs.accessNodeProcessId &&
            chooseId !== node.attrs.accessNodeProcessId
          ) {
            setNodeErrorMsg({
              id: node.id,
              msg: t('packages_dag_mixins_editor_gaijiedianbuzhi', {
                val1: agent?.hostName,
                val2: agent?.ip,
              }),
            })
            isError = true
          }
        })
        if (isError) someErrorMsg = t('packages_dag_mixins_editor_suoshuage')
      }
    } else if (accessNodeProcessIdArr.length === 1) {
      const agentId = accessNodeProcessIdArr[0] as string
      dataflowStore.dataflow.accessNodeType =
        (formScope as any)?.$agentMap?.[agentId]?.accessNodeType ||
        'MANUALLY_SPECIFIED_BY_THE_USER'
      dataflowStore.dataflow.accessNodeProcessId = agentId
    }
    return someErrorMsg
  }

  // --- validateSetting (需要外部传入 configPanel ref) ---
  const validateSetting = async (configPanelRef?: any) => {
    try {
      await configPanelRef?.validateSetting?.()
    } catch (error) {
      console.error(t('packages_dag_mixins_editor_renwushezhiyi'), error)
      dataflowStore.toggleShowSettings(true)
      return t('packages_dag_mixins_editor_renwushezhiyi')
    }
  }

  // --- 任务类型校验 ---
  const validateTaskType = () => {
    const { type } = dataflowStore.dataflow
    if (type !== 'initial_sync') {
      let hasNoStreamReadFunction = false
      allNodes.value.forEach((node: any) => {
        if (node.$outputs.length && !node.$inputs.length) {
          const capbilitiesMap = getCapabilitiesMap(node)
          if (
            !capbilitiesMap.stream_read_function &&
            !capbilitiesMap.raw_data_callback_filter_function &&
            !capbilitiesMap.raw_data_callback_filter_function_v2 &&
            (!capbilitiesMap.query_by_advance_filter_function ||
              !capbilitiesMap.batch_read_function)
          ) {
            hasNoStreamReadFunction = true
            setNodeErrorMsg({
              id: node.id,
              msg: t('packages_dag_mixins_editor_not_support_cdc'),
            })
          }
        }
      })
      if (hasNoStreamReadFunction) {
        dataflowStore.toggleShowSettings(true)
        return t('packages_dag_mixins_editor_task_not_support_cdc')
      }
    }
  }

  // --- 连通性校验 ---
  const validateLink = () => {
    const firstSourceNode = allNodes.value.find(
      (node: any) => !node.$inputs.length,
    )
    if (!firstSourceNode) return t('packages_dag_mixins_editor_renwulianlubu')
    // 清空 eachMap
    Object.keys(eachMap).forEach((key) => delete eachMap[key])
    eachOutputs(firstSourceNode)
    if (allNodes.value.some((node: any) => !eachMap[node.id])) {
      return t('packages_dag_mixins_editor_buzhichiduotiao')
    }
  }

  // --- DDL 校验 ---
  const validateDDL = () => {
    let hasEnableDDL: boolean | undefined
    let hasEnableDDLAndIncreasesql: boolean | undefined
    let inBlacklist = false
    const blacklist = ['union_processor', 'migrate_union_processor']
    allNodes.value.forEach((node: any) => {
      if (node.ddlConfiguration === 'SYNCHRONIZATION') {
        hasEnableDDL = true
        if (node.increasePoll === 'customizeSql') {
          hasEnableDDLAndIncreasesql = true
          setNodeErrorMsg({
            id: node.id,
            msg: t('packages_dag_mixins_editor_not_support_ddl'),
          })
        }
      }
      if (blacklist.includes(node.type)) {
        inBlacklist = true
      }
    })
    if ((hasEnableDDL && inBlacklist) || hasEnableDDLAndIncreasesql) {
      return t('packages_dag_mixins_editor_renwuzhonghanyou')
    }
  }

  // --- 自定义 SQL 校验 ---
  const validateCustomSql = () => {
    let error: string | undefined
    let enable: boolean | undefined
    let notAllowTarget: boolean | undefined

    allNodes.value.some((node: any) => {
      if (node.enableCustomCommand) {
        enable = true
      }
      if (enable && notAllowTarget) {
        error = t('packages_dag_validate_customsql_target_fail')
        return true
      }
      return false
    })
    return error
  }

  // --- Unwind 校验 ---
  const validateUnwind = () => {
    if (dataflowStore.dataflow.syncType === 'migrate') return

    const nodes = allNodes.value.filter(
      (node: any) => node.type === 'unwind_processor',
    )
    for (const node of nodes) {
      const childNodes = findChildNodes(node.id).filter(
        (child: any) => child.type === 'table',
      )
      if (
        childNodes.some(
          (childNode: any) =>
            childNode.dmlPolicy?.insertPolicy !== 'just_insert',
        )
      ) {
        setNodeErrorMsg({
          id: node.id,
          msg: t('packages_dag_unwind_validate_error'),
        })
        return t('packages_dag_unwind_validate_error')
      }
    }
  }

  // --- 表编辑节点校验 ---
  const validateTableRename = async () => {
    if (dataflowStore.dataflow.syncType !== 'migrate') return

    const nodes = allNodes.value.filter(
      (node: any) => node.type === 'table_rename_processor',
    )
    if (nodes.length > 1) return t('packages_dag_table_rename_multiple')
    if (nodes.length) {
      const node = nodes[0] as any
      const parents = findParentNodes(node.id)
      const sourceNode = parents?.[0]

      if (sourceNode?.type === 'database') {
        let tableNames = sourceNode.tableNames

        if (sourceNode.migrateTableSelectType === 'expression') {
          const { items } = await getNodeTableInfo({
            taskId: dataflowStore.dataflow.id,
            nodeId: node.id,
            page: 1,
            pageSize: 10000,
          })
          tableNames = items.map((item: any) => item.sourceObjectName)
        }

        const ifConfigEmpty = ifTableNameConfigEmpty(node)
        if (ifConfigEmpty && !node.tableNames?.length) return

        const nameTemp: Record<string, number> = {}
        const renameMap = node.tableNames.reduce((obj: any, item: any) => {
          obj[item.previousTableName] = item.currentTableName
          return obj
        }, {})

        for (const name of tableNames) {
          let newName = name
          if (name in renameMap) {
            newName = renameMap[name]
          } else if (!ifConfigEmpty) {
            newName = getTableRenameByConfig(name, node)
          }
          if (newName in nameTemp) {
            const msg = `${t('packages_dag_nodes_tableprocessor_biaomingchongfu')}: ${newName}`
            setNodeErrorMsg({ id: node.id, msg })
            return msg
          }
          nameTemp[newName] = 1
        }
      }
    }
  }

  // --- MigrateUnion 校验 ---
  const validateMigrateUnion = () => {
    if (dataflowStore.dataflow.syncType !== 'migrate') return
    const nodes = allNodes.value.filter(
      (node: any) => node.type === 'migrate_union_processor',
    )
    if (nodes.length > 1) return t('packages_dag_migrate_union_multiple')
  }

  // --- MergeTable 校验 ---
  const validateMergeTableProcessor = async () => {
    if (dataflowStore.dataflow.syncType !== 'sync') return

    const nodes = allNodes.value.filter(
      (node: any) => node.type === 'merge_table_processor',
    )

    const validateMergeProperties = (
      items: any[],
      isFirstLevel = true,
    ): string => {
      for (const item of items) {
        if (!isFirstLevel) {
          if (!item.joinKeys?.length) {
            return t('packages_dag_join_keys_empty', {
              tableName: item.tableName,
            })
          }
          for (const [index, joinKey] of item.joinKeys.entries()) {
            if (!joinKey.source || !joinKey.target) {
              return t('packages_dag_join_keys_field_empty', {
                tableName: item.tableName,
                index: index + 1,
              })
            }
          }
        }
        if (item.children?.length) {
          const childrenError = validateMergeProperties(item.children, false)
          if (childrenError) return childrenError
        }
      }
      return ''
    }

    for (const node of nodes) {
      const error = validateMergeProperties((node as any).mergeProperties)
      if (error) {
        setNodeErrorMsg({ id: (node as any).id, msg: error })
        return error
      }

      const nextNodes = findAllChildNodes((node as any).id)
      if (nextNodes.some((n: any) => n.type === 'standard_js_processor')) {
        return t('packages_dag_merge_table_js_node_error')
      }

      const targetNode = nextNodes.find(
        (n: any) =>
          n.type === 'table' &&
          !dataflowStore.hasCapability(n, 'master_slave_merge'),
      )
      if (targetNode) {
        return t('packages_dag_merge_table_table_not_allow_target', {
          val: (targetNode as any).databaseType,
        })
      }

      if (mergeTableCacheValidated) continue

      try {
        const cache = await fetchMergeTaskCache(
          dataflowStore.dataflow.id,
          (node as any).id,
          true,
        )
        const needRebuild = cache.some((item: any) => item.needRebuild)
        if (needRebuild) {
          setNodeErrorMsg({
            id: (node as any).id,
            msg: t('packages_dag_cache_expired'),
          })
          dataflowStore.selectNode(node)
          mergeTableCacheValidated = true
          return t('packages_dag_cache_expired')
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  // --- DML 策略校验 ---
  const validateDmlPolicy = () => {
    if (dataflowStore.dataflow.syncType !== 'migrate') return

    const target = allNodes.value.find(
      (node: any) => node.type === 'database' && !node.$outputs.length,
    )

    if (target && isEmpty((target as any).dmlPolicy)) {
      const capabilities = getCapabilitiesMap(target)
      const insertPolicy = capabilities.dml_insert_policy
      const updatePolicy = capabilities.dml_update_policy
      const deletePolicy = capabilities.dml_delete_policy

      const insertOptions = [
        'update_on_exists',
        'ignore_on_exists',
        'just_insert',
      ]
      const updateOptions = [
        'ignore_on_nonexists',
        'insert_on_nonexists',
        'log_on_nonexists',
      ]
      const deleteOptions = ['ignore_on_nonexists', 'log_on_nonexists']
      const dmlPolicy: Record<string, string> = {}

      if (insertPolicy?.alternatives?.length) {
        dmlPolicy.insertPolicy = insertOptions[0]!
        const alternatives = insertPolicy.alternatives.filter((key: string) =>
          insertOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.insertPolicy = alternatives[0]!
      }
      if (updatePolicy?.alternatives?.length) {
        dmlPolicy.updatePolicy = updateOptions[0]!
        const alternatives = updatePolicy.alternatives.filter((key: string) =>
          updateOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.updatePolicy = alternatives[0]!
      }
      if (deletePolicy?.alternatives?.length) {
        dmlPolicy.deletePolicy = deleteOptions[0]!
        const alternatives = deletePolicy.alternatives.filter((key: string) =>
          deleteOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.deletePolicy = alternatives[0]!
      }

      ;(target as any).dmlPolicy = dmlPolicy
    }
  }

  const validateSharedCdc = async () => {
    if (
      dataflowStore.dataflow.shareCdcEnable &&
      dataflowStore.dataflow.enforceShareCdc
    ) {
      const sharedCdc = await getSharedCdcEnable().catch(() => null)
      if (!sharedCdc?.enabled) return

      // 收集所有源节点的 connectionId
      const sourceNodes = allNodes.value.filter(
        (node: any) => !node.$inputs?.length && node.connectionId,
      )
      const connectionIds = sourceNodes.map((node: any) => node.connectionId)
      if (!connectionIds.length) return

      // connectionId -> pdkHash 映射，用于展示图标
      const connPdkHashMap: Record<string, string> = {}
      sourceNodes.forEach((node: any) => {
        if (node.connectionId && node.attrs?.pdkHash) {
          connPdkHashMap[node.connectionId] = node.attrs.pdkHash
        }
      })

      const result = await getConnectionSharedCdcStatus(connectionIds).catch(
        () => null,
      )
      const unenabledConnections = result?.connections
      if (!unenabledConnections?.length) return

      const connList = unenabledConnections.map((conn: any) => ({
        ...conn,
        pdkHash: connPdkHashMap[conn.id],
      }))

      const openConnEdit = (id: string, pdkHash: string) => {
        const { href } = router.resolve({
          name: 'connectionsEdit',
          params: { id },
          query: { pdkHash },
        })
        window.open(href, '_blank')
      }

      return await Modal.confirm(
        t('packages_dag_validate_shared_cdc_title'),
        h(
          'ul',
          { class: 'list-style-none p-0 m-0' },
          connList.map((conn: any) =>
            h(
              'li',
              {
                class:
                  'flex align-items-center gap-2 px-2 py-1 rounded-lg hover:bg-fill-color-light',
              },
              [
                // 左：图标容器
                h('img', {
                  class: 'connection-img',
                  src: getConnectionIcon(conn.pdkHash),
                  alt: '',
                  style: 'width: 16px; height: 16px; object-fit: contain;',
                }),
                // 中：连接名称
                h(
                  'span',
                  {
                    class: 'flex-1 text-truncate',
                    style: 'min-width: 0;',
                    title: conn.name,
                  },
                  conn.name,
                ),
                // 右：编辑按钮
                h(ElButton, {
                  class: 'flex-shrink-0',
                  text: true,
                  icon: IconLucidePencilLine,
                  size: 'small',
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    openConnEdit(conn.id, conn.pdkHash)
                  },
                }),
              ],
            ),
          ),
        ),
        {
          customStyle: {
            maxWidth: '500px',
          },
        },
      )
    }
  }

  // --- 顺序执行校验 ---
  const eachValidate = async (...fns: Array<() => any>) => {
    for (const fn of fns) {
      let result = fn()
      if (result) {
        if (result instanceof Promise) {
          result = await result
          if (!result) continue
        }
        return result
      }
    }
  }

  // --- 主校验入口 ---
  const validate = async () => {
    if (!dataflowStore.dataflow.name)
      return t('packages_dag_editor_cell_validate_empty_name')

    const nodes = allNodes.value.filter((node: any) => {
      return !node.disabled && !node.attrs.disabled
    })

    if (nodes.length < 2) {
      return t('packages_dag_editor_cell_validate_none_data_node')
    }

    await validateAllNodes(nodes)

    return await eachValidate(
      validateSetting,
      validateDag,
      validateAgent,
      validateTaskType,
      validateLink,
      validateDDL,
      validateCustomSql,
      validateUnwind,
      validateTableRename,
      validateMigrateUnion,
      validateMergeTableProcessor,
      validateDmlPolicy,
    )
  }

  // --- 准备保存数据 ---
  const getDataflowDataToSave = () => {
    return {
      ...dataflowStore.dataflow,
      dag: dataflowStore.dag,
      editVersion: dataflowStore.editVersion,
      pageVersion: dataflowStore.pageVersion,
    }
  }

  // --- 处理保存响应 ---
  const reformDataflow = (data: any, fromWS?: boolean) => {
    makeStatusAndDisabled(data)
    if (data.status === 'edit') data.btnDisabled.start = false
    dataflowStore.dataflow.status = data.status
    dataflowStore.dataflow.btnDisabled = data.btnDisabled
    dataflowStore.dataflow.taskRecordId = data.taskRecordId
    dataflowStore.dataflow.stopTime = data.stopTime
    dataflowStore.dataflow.startTime = data.startTime
    dataflowStore.dataflow.lastStartDate = data.lastStartDate
    dataflowStore.dataflow.pingTime = data.pingTime
    dataflowStore.dataflow.autoIncrementalBatchSize =
      data.autoIncrementalBatchSize
    dataflowStore.dataflow.attrs = data.attrs

    delete data.dag

    if (!fromWS) {
      Object.keys(data).forEach((key) => {
        dataflowStore.dataflow[key] = data[key]
      })
    }
  }

  // 升级专业版
  const handleShowUpgradeFee = (msg: any) => {
    upgradeFeeVisibleTips.value = msg
    upgradeFeeVisible.value = true
  }

  // 升级规格
  const handleShowUpgradeCharges = (msg: any) => {
    upgradeChargesVisibleTips.value = msg
    upgradeChargesVisible.value = true
  }

  const handleShowUpgradeDialog = (err: any) => {
    if (isDaas) return
    const { proxy } = getCurrentInstance()!
    ;(proxy as any).$axios
      .get(
        `api/tcm/agent?filter=${encodeURIComponent(
          JSON.stringify({
            size: 100,
            page: 1,
          }),
        )}`,
      )
      .then((data: any) => {
        const { items = [] } = data

        if (items.some((t: any) => t.status === 'Stopped')) {
          ElMessage.error(t('public_task_error_schedule_limit'))
          return
        }

        items.length <= 1 &&
        items.some(
          (t: any) =>
            t.orderInfo?.chargeProvider === 'FreeTier' || !t.orderInfo?.amount,
        )
          ? handleShowUpgradeFee(err.message)
          : handleShowUpgradeCharges(err.message)
      })
  }

  const handleError = (
    error: any,
    msg = t('packages_dag_src_editor_chucuole'),
  ) => {
    const code = error?.code
    if (code === 'Task.ListWarnMessage') {
      const names = []
      if (error?.data) {
        const keys = Object.keys(error.data)
        keys.forEach((key) => {
          const node = dataflowStore.findNodeById(key)
          if (node) {
            names.push(node.name)
            store.commit('dataflow/setNodeErrorMsg', {
              id: node.id,
              msg: error.data[key][0].msg,
            })
          }
        })
        if (!names.length && keys.length && msg) {
          // 兼容错误信息id不是节点id的情况
          const msg = error.data[keys[0]!][0]?.msg
          if (msg) {
            ElMessage.error(msg)
            return
          }
        }
      }
    } else if (code === 'Task.OldVersion') {
      Modal.confirm(t('packages_dag_task_old_version_confirm'), {
        confirmButtonText: t('public_button_refresh'),
      }).then((resFlag) => {
        resFlag && location.reload()
      })
    } else if (
      ['Task.ScheduleLimit', 'Task.ManuallyScheduleLimit'].includes(code)
    ) {
      handleShowUpgradeDialog(error)
    } else {
      showErrorMessage(error)
    }
  }

  const titleSet = () => {
    setPageTitle(`${dataflowStore.dataflow.name} - ${t(route.meta.title)}`)
  }

  const onNameInputChange = (value: string) => {
    const oldName = dataflowStore.dataflow.name
    nameHasUpdated.value = true
    dataflowStore.dataflow.name = value
    renameTask(dataflowStore.dataflow.id, value).then(
      () => {
        ElMessage.success(t('packages_dag_message_task_rename_success'))
        titleSet()
      },
      (error) => {
        dataflowStore.dataflow.name = oldName
        handleError(error)
      },
    )
  }

  const beforeStartTask = () => {
    const { over } = consoleRef.value?.getData() || {}
    if (!over) {
      setTimeout(beforeStartTask, 800)
    } else {
      startTask()
    }
  }

  const startTask = () => {
    const buriedCode =
      dataflowStore.dataflow.syncType === 'sync'
        ? 'taskStart'
        : 'migrationStart'
    batchStartTasks([dataflowStore.dataflow.id], {
      silenceMessage: true,
    })
      .then(() => {
        buried(buriedCode, { result: true })
        router.push({
          name: monitorRoute.value,
          params: {
            id: dataflowStore.dataflow.id,
          },
        })
      })
      .catch((error) => {
        buried(buriedCode, { result: false })
        handleError(error)
      })
  }

  const validateDropTableEnabled = async () => {
    if (dataflow.value.type === 'cdc') return true

    if (
      dag.value.nodes.some(
        (node) =>
          node.existDataProcessMode === 'dropTable' && !node.$outputs.length,
      )
    ) {
      return await Modal.confirm(
        t('packages_dag_drop_table_enabled_confirm'),
        t('packages_dag_existDataProcessMode_desc'),
      )
    }
    return true
  }

  const validateMemoryHeap = async () => {
    try {
      const mongoNode = dag.value.nodes.find(
        (node) => node.databaseType === 'MongoDB' && !node.$inputs.length,
      )
      if (!mongoNode) return true

      const result = await checkTaskMemoryHeap(dataflow.value.id)
      if (result?.isSafe) {
        return true
      }
      return await Modal.confirm(
        t('packages_dag_memory_heap_risk_title'),
        t('packages_dag_memory_heap_risk_message'),
      )
    } catch (error) {
      console.error('checkTaskMemoryHeap error:', error)
      return true
    }
  }

  const handleSave = async (needStart?: boolean) => {
    isSaving.value = true

    const errorMsg = await validate()

    if (errorMsg) {
      setMaterializedViewVisible(false)
      ElMessage.error(errorMsg)
      isSaving.value = false
      return false
    }

    // 验证数据校验是否支持开启
    const result = await taskOperationsRef.value.validateDataValidation()

    if (!result) {
      isSaving.value = false
      return
    }

    const enableSharedCdc = await validateSharedCdc()

    if (enableSharedCdc === false) {
      isSaving.value = false
      return
    }

    dataflowStore.showConsole = true
    dataflowStore.consoleAutoLoadType = 'checkDag'

    const data = getDataflowDataToSave()
    let isOk = false

    try {
      const result = await saveTask(data)
      reformDataflow(result)

      if (needStart) {
        if (['edit', 'wait_start'].includes(result.status)) {
          const dropTableEnabled = await validateDropTableEnabled()
          if (!dropTableEnabled) {
            isSaving.value = false
            return
          }
        }

        const memoryHeap = await validateMemoryHeap()
        if (!memoryHeap) {
          isSaving.value = false
          return
        }
      } else {
        ElMessage.success(t('public_message_save_ok'))
      }

      dataflowStore.editVersion = result.editVersion
      isOk = true
    } catch (error: any) {
      handleError?.(error)
    }
    isSaving.value = false
    return isOk
  }

  const openDataCapture = () => {
    window.open(
      router.resolve({
        name: 'DataCapture',
        params: { id: dataflowStore.dataflow.id },
      }).href,
      `DataCapture-${dataflowStore.dataflow.id}`,
    )
  }

  const handleStart = async (isDebug = false) => {
    buried('taskStart')
    isSaving.value = true

    try {
      const hasError = await skipErrorRef.value!.checkError(dataflow.value)
      if (hasError) {
        isSaving.value = false
        return
      }

      if (dataflowStore.stateIsReadonly) {
        wsAgentLive()
        await (startTask as any)(dataflow.value.id, {
          silenceMessage: true,
        })

        ElMessage.success(t('public_message_operation_success'))
        isSaving.value = false
        isReset.value = false
        dataflowStore.showBottom = true
        isDebug && openDataCapture()

        return
      }

      const flag = await handleSave(true)

      if (flag) {
        dataflowStore.dataflow.btnDisabled.edit = true
        dataflowStore.dataflow.btnDisabled.start = true
        dataflowStore.dataflow.btnDisabled.stop = true
        dataflowStore.dataflow.btnDisabled.reset = true
        beforeStartTask()
        isDebug && openDataCapture()
        buried('taskStart', { result: true })
      } else {
        buried('taskStart', { result: false })
      }
    } catch (error) {
      handleError(error)
      isSaving.value = false
      buried('taskStart', { result: false })
    }
  }

  const handleStop = () => {
    const message = getConfirmMessage('stop')

    Modal.confirm(message).then(async (resFlag) => {
      if (!resFlag) {
        return
      }
      initWS()
      dataflowStore.dataflow.btnDisabled.stop = true
      await stopTask(dataflow.value.id).catch((error) => {
        handleError(error, t('packages_dag_message_operation_error'))
      })
      ElMessage.success(t('public_message_operation_success'))
    })
  }

  const handleForceStop = () => {
    const msg = getConfirmMessage('force_stop')
    Modal.confirm(msg).then(async (resFlag) => {
      if (!resFlag) {
        return
      }
      initWS()
      dataflowStore.dataflow.btnDisabled.stop = true
      await forceStopTask(dataflow.value.id)
    })
  }

  const getConfirmMessage = (operateStr: string) => {
    const message = `${operateStr}_confirm_message`
    const strArr = t(`packages_dag_dataFlow_${message}`).split('xxx')
    const msg = h(
      'p',
      {
        class: 'break-all',
      },
      [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary',
          },
          dataflowStore.dataflow.name,
        ),
        strArr[1],
      ],
    )
    return msg
  }

  const responseHandler = (data: any, msg: string) => {
    const failList = data?.fail || []
    if (failList.length) {
      const msgMapping: Record<string, string> = {
        5: t('packages_dag_dataFlow_multiError_notFound'),
        6: t('packages_dag_dataFlow_multiError_statusError'),
        7: t('packages_dag_dataFlow_multiError_otherError'),
        8: t('packages_dag_dataFlow_multiError_statusError'),
      }
      const nameMapping: Record<string, string> = {}
      // this.table.list.forEach((item) => {
      //   nameMapping[item.id] = item.name
      // })
      ElMessage.warning({
        dangerouslyUseHTMLString: true,
        message: failList
          .map((item: any) => {
            return `<div style="line-height: 24px;"><span style="color: #409EFF">${
              nameMapping[item.id]
            }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
          })
          .join(''),
      })
    } else if (msg) {
      ElMessage.success(msg)
    }
  }

  const handleEditFlush = (result: any) => {
    if (result.data) {
      if (result.data.id !== dataflow.value.id) return
      reformDataflow(result.data, true)
      dataflowStore.transformLoading = !result.data.transformed

      if (!sharedCacheMap.value || !Object.keys(sharedCacheMap.value).length) {
        // 在重置后的任务监控页面启动,首次 initShareCache 获取不到数据
        initShareCache()
      } else {
        const { usedShareCache = {} } = dataflow.value?.attrs || {}
        setNodeShareCache(usedShareCache)
      }
    }
  }

  const initWS = () => {
    $ws.off('editFlush', handleEditFlush)
    $ws.on('editFlush', handleEditFlush)
    $ws.send({
      type: 'editFlush',
      taskId: dataflowStore.dataflow.id,
      data: {
        opType: 'subscribe',
      },
    })
  }

  const wsAgentLive = () => {
    $ws.send({
      type: 'editFlush',
      taskId: dataflow.value.id,
      data: {
        opType: 'subscribe',
      },
    })
  }

  const handleReset = () => {
    const msg = getConfirmMessage('initialize')
    Modal.confirm(msg).then(async (resFlag) => {
      if (!resFlag) {
        return
      }
      try {
        initWS()
        dataflowStore.dataflow.btnDisabled.reset = true
        const data = await resetTask(dataflowStore.dataflow.id)
        responseHandler(data, t('public_message_operation_success'))
        dataflowStore.showConsole = true
        dataflowStore.showBottom = false
        dataflowStore.consoleAutoLoadType = 'reset'
      } catch (error) {
        handleError(error, t('packages_dag_message_operation_error'))
      }
    })
  }

  const handleEdit = () => {
    switch (dataflow.value.syncType) {
      case 'migrate':
        router.push({
          name: 'MigrateEditor',
          params: { id: dataflow.value.id },
        })
        break
      case 'sync':
        router.push({
          name: 'DataflowEditor',
          params: { id: dataflow.value.id },
        })
        break
      case 'logCollector':
        sharedMiningEditorRef.value?.open(dataflow.value.id)
        break
      case 'shareCache':
        sharedCacheEditorRef.value?.open(dataflow.value.id)
        break
    }
  }

  const previewData = shallowRef(null)
  const previewLoading = ref(false)
  const handlePreview = async (nodeId: string) => {
    previewLoading.value = true
    dataflowStore.selectNodeById(nodeId)

    nextTick(() => {
      formScope?.formTab?.setActiveKey('previewTab')
    })

    const data = await callProxy({
      className: 'TaskPreviewService',
      method: 'preview',
      args: [
        JSON.stringify({
          id: dataflow.value.id,
          dag: {
            edges: dataflowStore.dag.edges,
            nodes: dataflowStore.dag.nodes,
          },
        }),
        [],
        1,
      ],
    }).finally(() => (previewLoading.value = false))

    if (data.code !== 200) {
      ElMessage.error(data.message || 'Internal error')
      return
    }

    previewData.value = data.nodeResult
  }

  const listRouteMap: any = {
    sync: 'dataflowList',
    migrate: 'migrateList',
    logCollector: 'sharedMining',
    shareCache: 'sharedCache',
    connHeartbeat: 'heartbeatTable',
  }

  const route2ListMap: Record<string, string> = {
    DataflowNew: 'dataflowList',
    DataflowEditor: 'dataflowList',
    DataflowViewer: 'dataflowList',
    TaskMonitor: 'dataflowList',
    MigrateCreate: 'migrateList',
    MigrateEditor: 'migrateList',
    MigrateViewer: 'migrateList',
    MigrationMonitor: 'migrateList',
    MigrationMonitorViewer: 'migrateList',
    SharedMiningMonitor: 'sharedMiningList',
    HeartbeatMonitor: 'HeartbeatTableList',
  }

  const handlePageReturn = () => {
    const listRoute = dataflow.value.syncType
      ? listRouteMap[dataflow.value.syncType]
      : route2ListMap[route.name]

    if (!dataflowStore.dag.nodes.length && dataflow.value.id) {
      Modal.confirm(
        t('packages_dag_page_return_confirm_title'),
        t('packages_dag_page_return_confirm_content'),
        {
          confirmButtonText: t('packages_dag_page_return_confirm_ok_text'),
          cancelButtonText: t('packages_dag_page_return_confirm_cancel_text'),
        },
      ).then((res) => {
        if (res) {
          deleteTask(dataflow.value.id)
        }
        router.push({
          name: listRoute,
        })
        window.name = ''
      })
    } else {
      router.push({
        name: listRoute,
      })
      window.name = ''
    }
  }

  const handleOpenInspect = () => {
    taskOperationsRef.value.handleOpenValidation()
  }

  function handleOpenSharedCache(row: any = {}) {
    sharedCacheDetailsRef.value?.getData(row.id)
  }

  async function initShareCache() {
    const { usedShareCache = {} } = dataflow.value?.attrs || {}
    if (Object.keys(usedShareCache).length) {
      await loadSharedCache(usedShareCache)
      setNodeShareCache(usedShareCache)
    }
  }

  async function loadSharedCache(usedShareCache: any) {
    const sharedCacheRes = await fetchSharedCache({
      where: {
        name: {
          $in: Object.keys(usedShareCache),
        },
      },
    })
    sharedCacheMap.value =
      sharedCacheRes.items?.reduce(
        (
          pre: Record<string, { id: string; name: string; status: string }>,
          task: any,
        ) => {
          const { id, name, status } = makeStatusAndDisabled(task)
          pre[name] = { id, name, status }
          return pre
        },
        {},
      ) ?? null
  }

  function setNodeShareCache(usedShareCache: Record<string, string[]>) {
    allNodes.value.forEach((node: any) => {
      const sharedCache: { name: string; id: string; status: string }[] = []

      for (const key of Object.keys(usedShareCache)) {
        if (usedShareCache[key]?.includes(node.id)) {
          const item = sharedCacheMap.value?.[key]
          if (item?.id) {
            sharedCache.push({
              name: key,
              id: item.id,
              status: item.status,
            })
          }
        }
      }

      node.attrs.sharedCache = sharedCache
    })
  }

  onBeforeUnmount(() => {
    destory.value = true
    $ws.off('editFlush', handleEditFlush)
  })

  return {
    dataflow,
    dataflowName,
    dataflowDesc,
    dag,
    buttonShowMap,
    historyStore,
    formScope,
    consoleRef,
    isSaving,
    skipErrorRef,
    taskOperationsRef,
    previewData,
    previewLoading,
    canvasRef,
    syncTypeLabel,
    sharedMiningEditorRef,
    sharedCacheDetailsRef,
    sharedCacheEditorRef,
    isSyncTask,

    initNodeType,
    onUpdateNodesPosition,
    onMoveNodePosition,
    onCreateConnection,
    onDeleteConnection,
    onClickNode,
    onDeleteNode,
    onDeleteNodes,
    onAddNode,
    onCopyNodes,
    onPasteNodes,
    validate,
    handleSave,
    reformDataflow,
    getDataflowDataToSave,
    setMaterializedViewVisible,
    onNameInputChange,
    handleReset,
    initWS,
    handleStart,
    startTask,
    handleEdit,
    handlePreview,
    handleStop,
    handleForceStop,
    handlePageReturn,
    handleOpenInspect,
    handleOpenSharedCache,
    initShareCache,
  }
}
