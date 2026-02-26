import { fetchCustomNodes } from '@tap/api/src/core/custom-node'
import { fetchDatabaseTypes } from '@tap/api/src/core/database-types'
import {
  getTaskById,
  patchTask,
  type Dag,
  type Edge,
  type Node,
} from '@tap/api/src/core/task'
import { isCancel } from '@tap/api/src/Http'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { isObject } from '@tap/shared'
import { debounce, isString } from 'lodash-es'
import { defineStore } from 'pinia'
import { markRaw, ref, shallowRef } from 'vue'
import { DEFAULT_SETTINGS } from '../constants'
import { CustomProcessor } from '../nodes/extends/CustomProcessor'

const createEmptyDataflow = (): any => ({
  ...DEFAULT_SETTINGS,
})

function hasCycle(
  source: string,
  target: string,
  map: Record<string, string[]>,
) {
  let flag = false
  if (!map[source]) return flag
  for (const id of map[source]) {
    flag = id === target
    if (flag || hasCycle(id, target, map)) return true
  }
  return flag
}

export const useDataflowStore = defineStore('dataflow', () => {
  const { t } = useI18n()
  const dataflow = ref<any>(createEmptyDataflow())
  const dag = ref<Dag>({
    nodes: [],
    edges: [],
  })
  const allResourceIns = ref([])
  const processorNodeTypes = ref([])
  const pdkPropertiesMap = shallowRef({})
  const pdkSchemaFreeMap = shallowRef({})
  const pdkDoubleActiveMap = shallowRef({})
  const editVersion = ref(null)
  const pageVersion = ref(Date.now().toString())
  const selectedNode = ref(null)
  const selectedNodeId = ref(null)
  const stateIsReadonly = ref(false)
  const showSettings = ref(false)

  // VueFlow 节点位置同步回调（由 Canvas.vue 注册）
  let vueFlowUpdateNodePosition:
    | ((id: string, position: { x: number; y: number }) => void)
    | null = null

  function registerVueFlowUpdateCallback(
    callback: (id: string, position: { x: number; y: number }) => void,
  ) {
    vueFlowUpdateNodePosition = callback
  }

  function unregisterVueFlowUpdateCallback() {
    vueFlowUpdateNodePosition = null
  }

  function getResourceInsByNode(node) {
    return allResourceIns.value.find((ins) => ins.selector(node))
  }

  function loadNodeHiddenSetting(node) {
    let flag = false
    const { syncType } = dataflow.value
    const { type } = node
    // 心跳任务、共享缓存
    if (['connHeartbeat', 'shareCache'].includes(syncType)) {
      flag = true
    } else if (
      ['logCollector'].includes(syncType) &&
      type === 'hazelcastIMDG'
    ) {
      // 共享挖掘，目标节点
      flag = true
    }
    return flag
  }

  function loadNodeHiddenTotalData(node = {}) {
    let flag = false
    const { syncType } = dataflow.value
    if (['shareCache'].includes(syncType) && node.type === 'mem_cache') {
      flag = true
    }
    return flag
  }

  function setNodeResouce(node = {}) {
    const ins = getResourceInsByNode(node)
    Object.defineProperty(node, '__Ctor', {
      value: ins,
      enumerable: false,
    })
    return node
  }

  function initialDag({ nodes, edges }) {
    if (!nodes?.length) return { nodes, edges }
    const outputsMap = {}
    const inputsMap = {}

    edges.forEach(({ source, target }) => {
      const _source = outputsMap[source]
      const _target = inputsMap[target]

      if (!_source) {
        outputsMap[source] = [target]
      } else {
        _source.push(target)
      }

      if (!_target) {
        inputsMap[target] = [source]
      } else {
        _target.push(source)
      }
    })

    nodes.forEach((node) => {
      node.$inputs = inputsMap[node.id] || []
      node.$outputs = outputsMap[node.id] || []

      // 数据兼容
      node.attrs = node.attrs ?? {}
      node.attrs.position = node.attrs.position ?? [0, 0]
      node.attrs.capabilities = node.attrs.capabilities ?? []

      setNodeResouce(node)

      // 需要隐藏的内容
      node.hiddenMap = {
        setting: loadNodeHiddenSetting(node),
        totalData: loadNodeHiddenTotalData(node),
      }
    })

    return {
      nodes,
      edges,
    }
  }

  function setDataflow(data) {
    dataflow.value = {
      ...data,
    }
  }

  async function fetchDataflow(id: string) {
    const response = await getTaskById(id)
    const { dag: dagData, ...dataflowData } = response
    const { nodes, edges } = initialDag(dagData)

    dag.value.nodes = nodes
    dag.value.edges = edges

    setDataflow(dataflowData)
  }

  const taskSaving = ref(false)
  async function patchDataflow() {
    taskSaving.value = true
    try {
      const data = await patchTask(
        {
          id: dataflow.value.id,
          editVersion: editVersion.value,
          pageVersion: pageVersion.value,
          dag: dag.value,
        },
        {
          silenceMessage: true,
        },
      )

      editVersion.value = data?.editVersion || editVersion.value
    } catch (error) {
      console.error(error)

      if (isCancel(error)) return

      if (error?.code === 'Task.OldVersion') {
        const confirmed = await Modal.confirm(
          t('packages_dag_task_old_version_confirm'),
          {
            confirmButtonText: t('public_button_refresh'),
          },
        )
        if (confirmed) {
          location.reload()
        }
      } else if (error?.message) {
        ElMessage.error(error.message)
      }
    }
    taskSaving.value = false
  }

  const patchDataflowDebounce = debounce(patchDataflow, 100)

  function addProcessorNode(nodes) {
    processorNodeTypes.value.push(...nodes)
  }

  function addResourceIns(data) {
    allResourceIns.value.push(...data)
  }

  async function loadCustomNode() {
    const { items } = await fetchCustomNodes({
      limit: 1000,
    })
    const insArr = []

    addProcessorNode(
      items.map((item) => {
        const node = {
          name: item.name,
          type: 'custom_processor',
          customNodeId: item.id,
        }

        const ins = new CustomProcessor({
          customNodeId: item.id,
          formSchema: item.formSchema,
        })

        insArr.push(ins)

        Object.defineProperty(node, '__Ctor', {
          value: markRaw(ins),
          enumerable: false,
          configurable: true,
        })

        return node
      }),
    )

    addResourceIns(insArr)
  }

  function findNodeById(id) {
    return dag.value.nodes.find((node) => node.id === id)
  }

  function addNode(node) {
    if (!node.__Ctor) {
      setNodeResouce(node)
    }
    if (!node.$inputs) node.$inputs = []
    if (!node.$outputs) node.$outputs = []

    dag.value.nodes.push(node)
  }

  function deleteConnectionsByNodeId(nodeId) {
    dag.value.edges = dag.value.edges.filter(
      ({ source, target }) => nodeId !== source && nodeId !== target,
    )
  }

  function connectAdjacentNodes(node) {
    const { $inputs = [], $outputs = [] } = node

    // TODO: 节点连线检查
    for (const source of $inputs) {
      for (const target of $outputs) {
        addConnection({
          source,
          target,
        })
      }
    }
  }

  function deleteNode(node) {
    const nodeId = node.id

    // connectAdjacentNodes(node)
    // deleteConnectionsByNodeId(nodeId)

    if (node.$outputs?.length) {
      node.$outputs.forEach((id) => {
        const { $inputs = [] } = findNodeById(id)
        const i = $inputs.indexOf(nodeId)
        if (~i) $inputs.splice(i, 1)
      })
    }

    if (node.$inputs?.length) {
      node.$inputs.forEach((id) => {
        const { $outputs = [] } = findNodeById(id)
        const i = $outputs.indexOf(nodeId)
        if (~i) $outputs.splice(i, 1)
      })
    }

    const index = dag.value.nodes.findIndex((n) => n.id === node.id)
    if (~index) dag.value.nodes.splice(index, 1)
  }

  // 从 nodes 数组中移除节点，并清理 $inputs/$outputs 引用
  // 不执行 connectAdjacentNodes 副作用
  // 用于历史记录的撤销操作
  function removeNodeById(id: string) {
    const node = findNodeById(id)
    if (!node) return

    // 清理其他节点对该节点的引用
    if (node.$outputs?.length) {
      node.$outputs.forEach((outputId) => {
        const outputNode = findNodeById(outputId)
        if (outputNode?.$inputs) {
          const i = outputNode.$inputs.indexOf(id)
          if (~i) outputNode.$inputs.splice(i, 1)
        }
      })
    }

    if (node.$inputs?.length) {
      node.$inputs.forEach((inputId) => {
        const inputNode = findNodeById(inputId)
        if (inputNode?.$outputs) {
          const i = inputNode.$outputs.indexOf(id)
          if (~i) inputNode.$outputs.splice(i, 1)
        }
      })
    }

    // 删除相关连线
    deleteConnectionsByNodeId(id)

    // 从数组中移除节点
    const index = dag.value.nodes.findIndex((n) => n.id === id)
    if (~index) dag.value.nodes.splice(index, 1)
  }

  function setNodePositionById(id: string, position: XYPosition) {
    const node = findNodeById(id)
    if (node) {
      console.log('setNodePositionById', id, position)
      node.attrs.position = position
      // 同步更新 VueFlow 的内部状态
      if (vueFlowUpdateNodePosition) {
        console.log('calling vueFlowUpdateNodePosition callback')
        vueFlowUpdateNodePosition(id, { x: position[0], y: position[1] })
      }
    }
  }

  function addConnection(connection) {
    const { source, target } = connection
    const index = dag.value.edges.findIndex(
      (item) => item.source === source && item.target === target,
    )
    const sourceNode = findNodeById(source)
    const targetNode = findNodeById(target)

    if (!sourceNode || !targetNode) return

    const { $outputs = [] } = sourceNode
    const { $inputs = [] } = targetNode

    if (!~index) dag.value.edges.push(connection)

    if (!$outputs.includes(target)) {
      $outputs.push(target)
      sourceNode.$outputs = $outputs
    }

    if (!$inputs.includes(source)) {
      $inputs.push(source)
      targetNode.$inputs = $inputs
    }

    // dag.value.edges.push({
    //   source: connection.source,
    //   target: connection.target,
    // })
  }

  function deleteConnection(connection) {
    const { source, target } = connection
    const index = dag.value.edges.findIndex(
      (item) => item.source === source && item.target === target,
    )
    if (~index) dag.value.edges.splice(index, 1)

    const sourceNode = findNodeById(source)
    const targetNode = findNodeById(target)

    const { $outputs = [] } = sourceNode
    const { $inputs = [] } = targetNode

    const ti = $outputs.indexOf(target)
    const si = $inputs.indexOf(source)

    if (~ti) $outputs.splice(ti, 1)
    if (~si) $inputs.splice(si, 1)
  }

  async function initPdkProperties() {
    const databaseItems = await fetchDatabaseTypes({
      fields: {
        messages: true,
        tags: true,
        pdkHash: true,
        properties: true,
      },
    })

    const tagsMap = {}
    const doubleActiveMap = {}
    const propertiesMap = {}

    databaseItems.forEach(({ properties, pdkHash, tags }) => {
      const nodeProperties = properties?.node

      if (nodeProperties) {
        propertiesMap[pdkHash] = nodeProperties
      }
      if (tags?.includes('schema-free')) {
        tagsMap[pdkHash] = true
      }
      if (tags?.includes('doubleActive')) {
        doubleActiveMap[pdkHash] = true
      }
    })

    pdkPropertiesMap.value = propertiesMap
    pdkSchemaFreeMap.value = tagsMap
    pdkDoubleActiveMap.value = doubleActiveMap
  }

  function selectNode(node: any) {
    selectedNode.value = node
    showSettings.value = false
  }

  function toggleShowSettings() {
    showSettings.value = !showSettings.value
    selectedNode.value = null
  }

  function nodeById(id: string) {
    return dag.value.nodes.find((node: any) => node.id === id)
  }

  function updateNodeProperties(updateInformation: Record<string, any>) {
    // console.log('updateNodeProperties', updateInformation)
    const filterProps = [
      'id',
      'isSource',
      'isTarget',
      'attrs.position',
      'sourceNode',
      '$inputs',
      '$outputs',
    ] // 排除属性的更新
    const node = nodeById(updateInformation.id)

    const syncRecursive = (target, source, path = '') => {
      const pathPrefix = path ? `${path}.` : ''

      if (!stateIsReadonly.value) {
        for (const key in target) {
          if (
            !source.hasOwnProperty(key) &&
            !filterProps.includes(`${pathPrefix}${key}`)
          ) {
            delete target[key]
          }
        }
      }

      // 更新或新增 source 中存在的属性到 target
      for (const key in source) {
        const sourceValue = source[key]
        const targetValue = target[key]

        if (isObject(sourceValue) && targetValue) {
          syncRecursive(targetValue, sourceValue, `${pathPrefix}${key}`)
        } else if (targetValue !== sourceValue) {
          target[key] = sourceValue
        }
      }
    }

    if (node) {
      syncRecursive(node, updateInformation.properties)
    }

    patchDataflowDebounce()
  }

  function getAfterNodesInSameBranch(node) {
    const currentNode = isString(node) ? findNodeById(node) : node

    if (!currentNode) return []
    const list: Node[] = [currentNode]

    const traverse = (root: Node, callback: (node: Node) => void) => {
      if (root) {
        const outgoers = root.$outputs.map((id) => findNodeById(id))

        if (outgoers.length) {
          outgoers.forEach((node) => {
            callback(node)
            traverse(node, callback)
          })
        }
      }
    }
    traverse(currentNode, (node) => {
      list.push(node)
    })

    return list
  }

  function checkAsSource(source: Node, showMsg?: boolean) {
    let { allowTarget } = source.__Ctor
    allowTarget = typeof allowTarget === 'boolean' ? allowTarget : true
    const connectionType = source.attrs.connectionType
    if (
      !allowTarget ||
      (connectionType && !connectionType.includes('source'))
    ) {
      showMsg &&
        ElMessage.error(
          t('packages_dag_node_only_as_target', {
            val1: source.name,
          }),
        )
      return false
    }
    return true
  }

  function checkAsTarget(target: Node, showMsg?: boolean) {
    let { allowSource } = target.__Ctor
    allowSource = typeof allowSource === 'boolean' ? allowSource : true
    const connectionType = target.attrs.connectionType
    if (
      !allowSource ||
      (connectionType && !connectionType.includes('target'))
    ) {
      showMsg &&
        ElMessage.error(
          t('packages_dag_node_only_as_source', {
            val1: target.name,
          }),
        )
      return false
    }
    return true
  }

  function checkTargetMaxInputs(targetNode: Node, showMsg?: boolean) {
    const maxInputs = targetNode.__Ctor.maxInputs ?? -1
    const connections = dag.value.edges.filter(
      (item) => item.target === targetNode.id,
    )

    if (maxInputs !== -1 && connections.length >= maxInputs) {
      showMsg &&
        ElMessage.error(t('packages_dag_mixins_editor_gaijiedianyijing'))
      return false
    }
    return true
  }

  function checkSourceMaxOutputs(sourceNode: Node, showMsg?: boolean) {
    const maxOutputs = sourceNode.__Ctor.maxOutputs ?? -1
    const connections = dag.value.edges.filter(
      (item) => item.source === sourceNode.id,
    )

    if (maxOutputs !== -1 && connections.length >= maxOutputs) {
      showMsg &&
        ElMessage.error(t('packages_dag_mixins_editor_gaijiedianyijing'))
      return false
    }
    return true
  }

  function checkAllowTargetOrSource(
    sourceNode: Node,
    targetNode: Node,
    showMsg?: boolean,
  ) {
    const { allowSource } = targetNode.__Ctor
    const { allowTarget } = sourceNode.__Ctor

    if (
      typeof allowSource === 'function' &&
      !allowSource(sourceNode, targetNode)
    ) {
      showMsg &&
        ElMessage.error(
          t('packages_dag_mixins_editor_gaijiedianta', {
            val1: targetNode.name,
            val2: sourceNode.name,
          }),
        )
      return false
    }
    if (
      typeof allowTarget === 'function' &&
      !allowTarget(targetNode, sourceNode)
    ) {
      showMsg &&
        ElMessage.error(
          t('packages_dag_mixins_editor_source', {
            val1: sourceNode.name,
            val2: targetNode.name,
          }),
        )
      return false
    }
    return true
  }

  function allowConnect(source: string, target: string) {
    const map = dag.value.edges.reduce(
      (map: Record<string, string[]>, item) => {
        const target = map[item.target]
        if (target) {
          target.push(item.source)
        } else {
          map[item.target] = [item.source]
        }
        return map
      },
      {},
    )

    if (!map[source]) return true

    return !hasCycle(source, target, map)
  }

  function isValidConnection({ source, target }: Edge) {
    if (source === target) return false

    const sourceNode = findNodeById(source)!
    const targetNode = findNodeById(target)!

    if (sourceNode.attrs.disabled || targetNode.attrs.disabled) return false

    if (!checkAsSource(sourceNode)) return false
    if (!checkAsTarget(targetNode)) return false

    return (
      allowConnect(source, target) &&
      checkAllowTargetOrSource(sourceNode, targetNode)
    )
  }

  return {
    dataflow,
    dag,
    fetchDataflow,
    patchDataflow,
    patchDataflowDebounce,
    processorNodeTypes,
    selectedNode,
    stateIsReadonly,
    taskSaving,
    showSettings,

    addNode,
    deleteNode,
    addProcessorNode,
    addResourceIns,
    loadCustomNode,
    getResourceInsByNode,
    setNodePositionById,
    removeNodeById,
    addConnection,
    deleteConnection,
    initPdkProperties,
    pdkPropertiesMap,
    pdkSchemaFreeMap,
    pdkDoubleActiveMap,
    selectNode,
    toggleShowSettings,
    nodeById,
    getNodeById: nodeById,
    updateNodeProperties,
    getAfterNodesInSameBranch,
    isValidConnection,
    checkAsSource,
    checkAsTarget,
    checkTargetMaxInputs,
    checkSourceMaxOutputs,
    checkAllowTargetOrSource,
    allowConnect,
    registerVueFlowUpdateCallback,
    unregisterVueFlowUpdateCallback,
  }
})
