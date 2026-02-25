import { useI18n } from '@tap/i18n'
import { computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { allResourceIns } from '../nodes/loader'
import { useDataflowStore } from '../stores/dataflow.store'
import {
  AddConnectionCommand,
  AddNodeCommand,
  MoveNodeCommand,
  RemoveConnectionCommand,
  RemoveNodeCommand,
} from '../stores/history'
import { useHistoryStore } from '../stores/history.store'

export function useCanvasOperation() {
  const dataflowStore = useDataflowStore()
  const historyStore = useHistoryStore()

  const buttonShowMap = reactive({
    View: true,
    Edit: true,
    Delete: true,
    Reset: true,
    Start: true,
    Stop: true,
  })

  const dag = computed(() => dataflowStore.dag)
  const dataflow = computed(() => dataflowStore.dataflow)
  const { t } = useI18n()
  const store = useStore()
  const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

  // watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
  //   // 触发保存Task
  //   console.log('触发保存Task', dag.value)
  // })

  const hasFeature = (feature: string) => {
    return !isDaas || store.getters['feature/hasFeature']?.(feature)
  }

  const initNodeType = async () => {
    let nodes = [
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
    //仅企业版有的节点
    if (isDaas) {
      const isDaasNode = [
        {
          name: t('packages_dag_src_editor_join'),
          type: 'join_processor', //join 节点
        },
      ]
      nodes = [...isDaasNode, ...nodes]
    }
    dataflowStore.addProcessorNode(nodes.filter((item) => !item.hidden))
    dataflowStore.addResourceIns(allResourceIns)

    if (hasFeature('customProcessor')) {
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
    dataflowStore.selectNode(node)
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

  return {
    dataflow,
    dag,
    buttonShowMap,
    initNodeType,
    onUpdateNodesPosition,
    onMoveNodePosition,
    onCreateConnection,
    onDeleteConnection,
    onClickConnectionAdd,
    onClickNode,
    onDeleteNode,
    onAddNode,
    historyStore,
  }
}
