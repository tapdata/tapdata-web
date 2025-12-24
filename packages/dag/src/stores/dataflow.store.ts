import { fetchCustomNodes } from '@tap/api/src/core/custom-node'
import { fetchDatabaseTypes } from '@tap/api/src/core/database-types'
import { getTaskById, patchTask } from '@tap/api/src/core/task'
import { isCancel } from '@tap/api/src/Http'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { isObject } from '@tap/shared'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'
import { markRaw, ref, shallowRef } from 'vue'
import { DEFAULT_SETTINGS } from '../constants'
import { CustomProcessor } from '../nodes/extends/CustomProcessor'

const createEmptyDataflow = (): any => ({
  ...DEFAULT_SETTINGS,
})

export const useDataflowStore = defineStore('dataflow', () => {
  const { t } = useI18n()
  const dataflow = ref<any>(createEmptyDataflow())
  const dag = ref<any>({
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

  function initialDag({ nodes, edges }) {
    if (!nodes?.length) return
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

      const ins = getResourceInsByNode(node)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false,
      })

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
    dag.value.nodes.push(node)
  }

  function deleteNode(node) {
    const index = dag.value.nodes.findIndex((n) => n.id === node.id)
    if (~index) dag.value.nodes.splice(index, 1)
  }

  function setNodePositionById(id: string, position: { x: number; y: number }) {
    findNodeById(id).attrs.position = [position.x, position.y]
  }

  function addConnection(connection) {
    dag.value.edges.push({
      source: connection.source,
      target: connection.target,
    })
  }

  function deleteConnection(connection) {
    const index = dag.value.edges.findIndex(
      (item) =>
        item.source === connection.source && item.target === connection.target,
    )
    if (~index) dag.value.edges.splice(index, 1)
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
    selectedNodeId.value = node.id
    selectedNode.value = node
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

  return {
    dataflow,
    dag,
    fetchDataflow,
    patchDataflow,
    processorNodeTypes,
    selectedNode,
    stateIsReadonly,

    addNode,
    deleteNode,
    addProcessorNode,
    addResourceIns,
    loadCustomNode,
    getResourceInsByNode,
    setNodePositionById,
    addConnection,
    deleteConnection,
    initPdkProperties,
    pdkPropertiesMap,
    pdkSchemaFreeMap,
    pdkDoubleActiveMap,
    selectNode,
    nodeById,
    updateNodeProperties,
  }
})
