import { callProxy } from '@tap/api/src/core/proxy'
import {
  batchStartTasks,
  deleteTask,
  fetchMergeTaskCache,
  forceStopTask,
  getNodeTableInfo,
  renameTask,
  resetTask,
  saveAndStartTask,
  saveTask,
  stopTask,
} from '@tap/api/src/core/task'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import { makeStatusAndDisabled } from '@tap/business/src/shared/task'
import { Modal } from '@tap/component/src/modal'
import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { validateBySchema } from '@tap/form/src/shared/validate'
import { useI18n } from '@tap/i18n'
import { setPageTitle } from '@tap/shared'
import { isEmpty } from 'lodash-es'
import {
  computed,
  getCurrentInstance,
  h,
  inject,
  nextTick,
  reactive,
  ref,
  shallowRef,
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
  const instance = getCurrentInstance()
  const $ws = (instance?.proxy as any).$ws
  const dataflowStore = useDataflowStore()
  const historyStore = useHistoryStore()
  const formScope = useFormScope()
  const buried = inject('buried')
  const consoleRef = ref(null)
  const skipErrorRef = ref(null)
  const taskOperationsRef = ref(null)

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
  const nameHasUpdated = ref(false)

  const dataflow = reactiveComputed(() => ({ ...dataflowStore.dataflow }))

  const editorRoute = computed(() => {
    if (dataflow.value.syncType === 'sync') return 'DataflowEditor'
    else return 'MigrateEditor'
  })

  const monitorRoute = computed(() => {
    if (dataflow.value.syncType === 'sync') return 'TaskMonitor'
    else return 'MigrationMonitor'
  })

  const hasFeature = (feature: string) => {
    return !isDaas || store.getters['feature/hasFeature']?.(feature)
  }

  const syncProcessor = [
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

  const initNodeType = async (syncType: string) => {
    let nodes = syncType === 'sync' ? syncProcessor : migrateProcessor
    //仅企业版有的节点
    if (isDaas && syncType === 'sync') {
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

    if (syncType === 'sync' && hasFeature('customProcessor')) {
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
    position: CanvasNode['position'],
    { trackHistory = true } = {},
  ) {
    const node = dataflowStore.getNodeById(id)
    if (!node) {
      return
    }

    const oldPosition: XYPosition = [...node.attrs.position]
    const newPosition: XYPosition = [position.x, position.y]

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

    const oldPosition: XYPosition = [...node.attrs.position]
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

  const onClickConnectionAdd = (_connection: ConnectionEvent) => {
    // dataflowStore.addConnection(connection)
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
    const node = dataflowStore.getNodeById(id)

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

  const onDeleteNode = (
    node: any,
    { trackHistory = true, trackBulk = true } = {},
  ) => {
    if (trackHistory && trackBulk) {
      historyStore.startRecordingUndo()
    }

    connectAdjacentNodes(node.id, { trackHistory })
    deleteConnectionsByNodeId(node.id, { trackHistory, trackBulk: false })

    dataflowStore.deleteNode(node)

    // 清空选中状态
    if (dataflowStore.selectedNode?.id === node.id) {
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

  const onAddNode = (node: any, { trackHistory = true } = {}) => {
    dataflowStore.addNode(node)
    if (trackHistory) {
      historyStore.pushCommandToUndo(new AddNodeCommand(node, Date.now()))
    }
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
  const setActiveType = (type: string | null) =>
    store.commit('dataflow/setActiveType', type)
  const setActiveNode = (id: string) =>
    store.commit('dataflow/setActiveNode', id)
  const setEditVersion = (v: any) => store.commit('dataflow/setEditVersion', v)
  const setTaskId = (id: string) => store.commit('dataflow/setTaskId', id)
  const toggleConsole = (flag?: boolean) =>
    store.commit('dataflow/toggleConsole', flag)
  const setMaterializedViewVisible = (v: boolean) =>
    store.commit('dataflow/setMaterializedViewVisible', v)

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
        nodes.push(...findParentNodes(child.id, node.id))
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
        const output = findNodeById(id)
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
        const input = findNodeById(id)
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
        const output = findNodeById(id)
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
        const input = findNodeById(id)
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
        store.state.dataflow.pdkPropertiesMap,
      )
      await validateBySchema(schema, node, formScope)
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
    await Promise.all(nodes.map((node) => validateNode(node, formScope)))
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
        const agent = formScope?.$agentMap?.[chooseId]
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
        formScope?.$agentMap?.[agentId]?.accessNodeType ||
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
      console.log(t('packages_dag_mixins_editor_renwushezhiyi'), error)
      setActiveType('settings')
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
        setActiveType('settings')
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
    const blacklist = [
      'js_processor',
      'custom_processor',
      'migrate_js_processor',
      'union_processor',
      'migrate_union_processor',
      'standard_js_processor',
      'standard_migrate_js_processor',
    ]
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
          !n.attrs?.capabilities?.find(
            ({ id }: any) => id === 'master_slave_merge',
          ),
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
          setActiveNode((node as any).id)
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
        dmlPolicy.insertPolicy = insertOptions[0]
        const alternatives = insertPolicy.alternatives.filter((key: string) =>
          insertOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.insertPolicy = alternatives[0]
      }
      if (updatePolicy?.alternatives?.length) {
        dmlPolicy.updatePolicy = updateOptions[0]
        const alternatives = updatePolicy.alternatives.filter((key: string) =>
          updateOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.updatePolicy = alternatives[0]
      }
      if (deletePolicy?.alternatives?.length) {
        dmlPolicy.deletePolicy = deleteOptions[0]
        const alternatives = deletePolicy.alternatives.filter((key: string) =>
          deleteOptions.includes(key),
        )
        if (alternatives.length === 1) dmlPolicy.deletePolicy = alternatives[0]
      }

      ;(target as any).dmlPolicy = dmlPolicy
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

    if (!fromWS) {
      Object.keys(data).forEach((key) => {
        if (!['dag'].includes(key)) {
          dataflowStore.dataflow[key] = data[key]
        }
      })
    }
  }

  // 升级专业版
  const handleShowUpgradeFee = (msg) => {
    upgradeFeeVisibleTips.value = msg
    upgradeFeeVisible.value = true
  }

  // 升级规格
  const handleShowUpgradeCharges = (msg) => {
    upgradeChargesVisibleTips.value = msg
    upgradeChargesVisible.value = true
  }

  const handleShowUpgradeDialog = (err) => {
    if (isDaas) return
    const { proxy } = getCurrentInstance()
    proxy.$axios
      .get(
        `api/tcm/agent?filter=${encodeURIComponent(
          JSON.stringify({
            size: 100,
            page: 1,
          }),
        )}`,
      )
      .then(async (data) => {
        const { items = [] } = data

        if (items.some((t) => t.status === 'Stopped')) {
          ElMessage.error(t('public_task_error_schedule_limit'))
          return
        }

        items.length <= 1 &&
        items.some(
          (t) =>
            t.orderInfo?.chargeProvider === 'FreeTier' || !t.orderInfo?.amount,
        )
          ? handleShowUpgradeFee(err.message)
          : handleShowUpgradeCharges(err.message)
      })
  }

  const handleError = (error, msg = t('packages_dag_src_editor_chucuole')) => {
    const code = error?.code
    if (code === 'Task.ListWarnMessage') {
      const names = []
      if (error?.data) {
        const keys = Object.keys(error.data)
        keys.forEach((key) => {
          const node = store.state.dataflow.NodeMap[key]
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
          const msg = error.data[keys[0]][0]?.msg
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

    dataflowStore.showConsole = true
    dataflowStore.consoleAutoLoadType = 'checkDag'

    const data = getDataflowDataToSave()
    let isOk = false

    try {
      const result = await (needStart ? saveAndStartTask : saveTask)(data)
      reformDataflow(result)
      if (!needStart) ElMessage.success(t('public_message_save_ok'))
      setEditVersion(result.editVersion)
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
    // this.unWatchStatus?.()
    // this.unWatchStatus = this.$watch('dataflow.status', (v) => {
    //   if (
    //     ['error', 'complete', 'running', 'stop', 'schedule_failed'].includes(v)
    //   ) {
    //     this.$refs.console?.loadData()
    //     if (v !== 'running') {
    //       this.$refs.console?.stopAuto()
    //     } else {
    //       this.toggleConsole(false)
    //       this.gotoViewer()
    //     }
    //     // this.unWatchStatus()
    //   }
    //   if (['MigrateViewer', 'DataflowViewer'].includes(this.$route.name)) {
    //     if (['renewing'].includes(v)) {
    //       this.handleConsoleAutoLoad()
    //     } else {
    //       this.toggleConsole(false)
    //     }
    //   }
    // })

    isSaving.value = true

    try {
      const hasError = await skipErrorRef.value!.checkError(dataflow)
      if (hasError) return

      if (dataflowStore.stateIsReadonly) {
        wsAgentLive()
        await startTask(dataflow.value.id, {
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
      const msgMapping = {
        5: t('packages_dag_dataFlow_multiError_notFound'),
        6: t('packages_dag_dataFlow_multiError_statusError'),
        7: t('packages_dag_dataFlow_multiError_otherError'),
        8: t('packages_dag_dataFlow_multiError_statusError'),
      }
      const nameMapping = {}
      // this.table.list.forEach((item) => {
      //   nameMapping[item.id] = item.name
      // })
      ElMessage.warning({
        dangerouslyUseHTMLString: true,
        message: failList
          .map((item) => {
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
      reformDataflow(result.data, true)
      dataflowStore.transformLoading = !result.data.transformed
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
        dataflowStore.showConsole = true
        dataflowStore.showBottom = false
        dataflowStore.consoleAutoLoadType = 'reset'
        const data = await resetTask(dataflowStore.dataflow.id)
        responseHandler(data, t('public_message_operation_success'))
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
        vm.$refs.sharedMiningEditor.open(dataflow.value.id)
        break
      case 'shareCache':
        vm.$refs.sharedCacheEditor.open(dataflow.value.id)
        break
    }
  }

  const previewData = shallowRef(null)
  const previewLoading = ref(false)
  const handlePreview = async (nodeId) => {
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

  const handlePageReturn = () => {
    const listRoute =
      dataflow.value.syncType === 'sync' ? 'dataflowList' : 'migrateList'

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
        window.name = null
      })
    } else {
      router.push({
        name: listRoute,
      })
      window.name = null
    }
  }

  return {
    dataflow,
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

    initNodeType,
    onUpdateNodesPosition,
    onMoveNodePosition,
    onCreateConnection,
    onDeleteConnection,
    onClickConnectionAdd,
    onClickNode,
    onDeleteNode,
    onAddNode,
    validate,
    handleSave,
    reformDataflow,
    getDataflowDataToSave,
    setEditVersion,
    toggleConsole,
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
  }
}
