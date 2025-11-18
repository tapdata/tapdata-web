import { fetchCustomNodes } from '@tap/api/src/core/custom-node'
import { getTaskById } from '@tap/api/src/core/task'
import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import { DEFAULT_SETTINGS } from '../constants'
import { CustomProcessor } from '../nodes/extends/CustomProcessor'

const createEmptyDataflow = (): any => ({
  ...DEFAULT_SETTINGS,
})

export const useDataflowStore = defineStore('dataflow', () => {
  const dataflow = ref<any>(createEmptyDataflow())
  const dag = ref<any>({
    nodes: [],
    edges: [],
  })
  const allResourceIns = ref([])
  const processorNodeTypes = ref([])

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

  return {
    dataflow,
    dag,
    fetchDataflow,
    processorNodeTypes,

    addProcessorNode,
    addResourceIns,
    loadCustomNode,
    getResourceInsByNode,
  }
})
