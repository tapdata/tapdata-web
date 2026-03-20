<script setup>
import {
  getNodeSchemaMapByIds,
  getNodeSchemaPage,
} from '@tap/api/src/core/metadata-instances'
import VDivider from '@tap/component/src/base/VDivider.vue'
import { IconButton } from '@tap/component/src/icon-button'
import { mapFieldsData } from '@tap/form'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import dagre from 'dagre'
import Mousetrap from 'mousetrap'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useStore } from 'vuex'
import { useDataflowStore } from '../../stores/dataflow.store'
import TransformLoading from '../TransformLoading.vue'
import Node from './Node.vue'
import TargetNode from './TargetNode.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const props = defineProps({
  visible: Boolean,
  disabled: Boolean,
  isSaving: Boolean,
  dataflow: Object,
  buttonShowMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'add-node',
  'add-target-node',
  'update:visible',
  'delete-node',
  'start',
])

const buried = inject('buried')
const vuexStore = useStore()
const dataflowStore = useDataflowStore()

// VueFlow instance with unique id
const {
  fitView,
  zoomTo: vfZoomTo,
  getViewport,
  findNode: vfFindNode,
} = useVueFlow({ id: 'materialized-view-flow' })

const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const nodes = ref([])
const nodeSchemaMap = reactive({})
const inputsMap = reactive({})
const outputsMap = reactive({})
const scale = ref(1)
const chooseItems = [4, 2, 1.5, 1, 0.5, 0.25]
const commandCode = isMacOs ? '⌘' : 'Ctrl'
const optionCode = isMacOs ? 'Option' : 'Alt'
const loading = ref(false)
const schemaLoading = ref(false)
const targetNodeSchemaLoading = ref(false)
const selectedNodeId = ref('')
const loadingSchemaNodeId = ref('')
const helpVisible = ref(false)
const docUrl = ref('')
const iframeHtml = ref('')
const container = useTemplateRef('container')

let unwatchMergeProperties = null

// VueFlow nodes & edges
const flowNodes = computed(() => {
  const result = []
  for (const node of nodes.value) {
    result.push({
      id: node.id,
      type: 'mv-node',
      position: { x: 0, y: 0 },
      data: { node },
    })
  }
  if (targetNodeData.value) {
    result.push({
      id: targetNodeData.value.id,
      type: 'mv-target-node',
      position: { x: 0, y: 0 },
      data: { node: targetNodeData.value },
    })
  }
  return result
})

const flowEdges = computed(() => {
  const result = []
  for (const sourceId in outputsMap) {
    const targets = outputsMap[sourceId]
    if (targets) {
      for (const targetId of targets) {
        result.push({
          id: `${sourceId}->${targetId}`,
          source: sourceId,
          target: targetId,
          style: { strokeWidth: 1, stroke: '#9f9f9f' },
        })
      }
    }
  }
  return result
})

// Computed
const isDomesticStation = computed(() => vuexStore.getters.isDomesticStation)

const activeNode = computed(() => dataflowStore.selectedNode)

const nodeById = (id) => dataflowStore.findNodeById(id)

const transformLoading = computed(() => dataflowStore.transformLoading)

const taskSaving = computed(() => dataflowStore.taskSaving)

const scaleTxt = computed(() => `${Math.round(scale.value * 100)}%`)

const showPaper = computed(
  () => props.visible && activeNode.value?.type === 'merge_table_processor',
)

const targetNodeData = computed(() => {
  const node = activeNode.value
  if (!node) return undefined
  const { $outputs } = node
  if (!$outputs?.length) return undefined
  return nodeById($outputs[0])
})

const viewNodes = computed(() =>
  nodes.value.concat(targetNodeData.value ? [targetNodeData.value] : []),
)

const tableOptions = computed(() =>
  nodes.value.map((node) => ({
    label: node.tableNode?.tableName,
    value: node.id,
  })),
)

const nodeMap = computed(() =>
  nodes.value.reduce((map, node) => {
    map[node.id] = node
    return map
  }, {}),
)

const targetPathMap = computed(() =>
  nodes.value.reduce((map, node) => {
    if (node.targetPath) {
      map[node.targetPath] = node
    }
    return map
  }, {}),
)

// Methods
function updateDag() {
  dataflowStore.patchDataflowDebounce?.()
}

function bindEvent() {
  Mousetrap(container.value).bind(['backspace', 'del'], () => {
    props.visible && !props.disabled && handleDelete()
  })
  Mousetrap(container.value).bind(['option+command+l', 'ctrl+alt+l'], (e) => {
    e.preventDefault()
    props.visible && handleAutoLayout()
  })
}

function unbindEvent() {
  if (!container.value) return
  Mousetrap(container.value).unbind(['backspace', 'del'])
  Mousetrap(container.value).unbind(['option+command+l', 'ctrl+alt+l'])
}

function watchMergeProperties() {
  unwatchMergeProperties?.()
  unwatchMergeProperties = watch(
    () => activeNode.value?.mergeProperties,
    () => {
      updateDag()
    },
    { deep: true },
  )
}

function handleUpdateVisible(val) {
  emit('update:visible', val)
}

function handleCenterContent() {
  fitView({ duration: 300, padding: 0.1 })
}

async function handleDelete() {
  if (!selectedNodeId.value || nodes.value.length === 1) return

  const id = selectedNodeId.value
  const node = nodeMap.value[id]
  if (!node) return
  const childrenNodes = node.children || []
  const parentNode = nodeMap.value[node.parentId]
  const parentId = node.parentId || targetNodeData.value?.id
  const index = nodes.value.findIndex((n) => n.id === id)
  if (~index) nodes.value.splice(index, 1)

  if (parentNode) {
    const indexOfParent = parentNode.children.findIndex((n) => n.id === id)
    if (~indexOfParent) parentNode.children.splice(indexOfParent, 1)
    parentNode.children.push(...childrenNodes)

    // 从父节点的输入上删除
    const oldIndex = inputsMap[parentNode.id]?.indexOf(id)
    if (oldIndex !== undefined && ~oldIndex) {
      inputsMap[parentNode.id].splice(oldIndex, 1)
    }
  } else {
    const { mergeProperties } = activeNode.value
    const index = mergeProperties.findIndex((n) => n.id === id)
    if (~index) mergeProperties.splice(index, 1)
    mergeProperties.push(...childrenNodes)
  }

  delete nodeSchemaMap[id]

  for (const childrenNode of childrenNodes) {
    const childId = childrenNode.id
    const oldIndex = outputsMap[childId]?.indexOf(id)
    if (oldIndex !== undefined && ~oldIndex) {
      outputsMap[childId].splice(oldIndex, 1, parentId)
    }

    if (parentId) {
      if (!inputsMap[parentId]) inputsMap[parentId] = []
      inputsMap[parentId].push(childId)
    }

    childrenNode.parentId = parentId
  }

  delete inputsMap[id]
  delete outputsMap[id]

  emit('delete-node', id)

  // 同步 mergeProperties 到后端
  dataflowStore.patchDataflowDebounce()

  await nextTick()
  handleAutoLayout()
  await afterTaskSaved()
  await onLoadTargetSchema()
}

function handleZoomIn() {
  const currentZoom = getViewport().zoom
  const newZoom = Math.min(currentZoom + 0.1, 10)
  vfZoomTo(newZoom, { duration: 200 })
  scale.value = newZoom
}

function handleZoomOut() {
  const currentZoom = getViewport().zoom
  const newZoom = Math.max(currentZoom - 0.1, 0.1)
  vfZoomTo(newZoom, { duration: 200 })
  scale.value = newZoom
}

function handleZoomTo(val) {
  vfZoomTo(val, { duration: 200 })
  scale.value = val
}

function findParentNodes(id, ifMyself) {
  const node = nodeById(id)
  const parents = []
  const parentIds = node?.$inputs || []

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

async function transformToDag() {
  let mergeProperties = activeNode.value?.mergeProperties
  nodes.value = []

  // 清空 inputsMap/outputsMap
  Object.keys(inputsMap).forEach((k) => delete inputsMap[k])
  Object.keys(outputsMap).forEach((k) => delete outputsMap[k])

  if (!mergeProperties?.length) {
    // 主从合并没有源和目标
    mergeProperties = activeNode.value.mergeProperties = []
    initMainNode()
    await afterTaskSaved()
  } else {
    const nodeList = []
    const edgeList = []
    const localTargetPathMap = {} // path: Node
    const traverse = (children, _target) => {
      for (const item of children) {
        const source = item.id
        let target = _target
        const tableNode = findParentNodes(item.id, true)[0]

        item.parentId = target
        item.tableNode = tableNode
        nodeList.push(item)

        if (item.targetPath) {
          const arr = item.targetPath.split('.')

          if (arr.length > 1) {
            const parentPath = arr.slice(0, -1).join('.')
            target = localTargetPathMap[parentPath] || target
          }

          localTargetPathMap[item.targetPath] = item.id
        }

        if (target) {
          edgeList.push({ source, target })

          let outputs = outputsMap[source]
          let inputs = inputsMap[target]

          if (!outputs) {
            outputs = outputsMap[source] = []
          }
          outputs.push(target)

          if (!inputs) {
            inputs = inputsMap[target] = []
          }
          inputs.push(source)
        }

        if (item.children?.length) {
          traverse(item.children, item.id)
        }
      }
    }
    traverse(mergeProperties, targetNodeData.value?.id)
    nodes.value = nodeList
  }

  initTargetNode()
}

function initMainNode() {
  const mergeProperties = activeNode.value?.mergeProperties

  emit(
    'add-node',
    {
      children: mergeProperties,
    },
    {
      mergeType: 'updateOrInsert', // 主表默认是更新已存在或插入新数据
    },
  )
}

function initTargetNode() {
  if (!targetNodeData.value?.id) return
  inputsMap[targetNodeData.value.id] = inputsMap[targetNodeData.value.id] || []
  outputsMap[targetNodeData.value.id] =
    outputsMap[targetNodeData.value.id] || []
}

/**
 * 自动布局 - uses dagre for layout, then updates VueFlow node positions
 */
function handleAutoLayout() {
  const allNodes = viewNodes.value
  if (!allNodes.length) return

  const dg = new dagre.graphlib.Graph()

  dg.setGraph({
    nodesep: 60,
    ranksep: 120,
    marginx: 50,
    marginy: 50,
    rankdir: 'LR',
  })
  dg.setDefaultEdgeLabel(() => ({}))

  // Set nodes with estimated sizes
  allNodes.forEach((n) => {
    const el = document.querySelector(
      `[data-id="materialized-view-flow"] [data-id="${n.id}"]`,
    )
    const width = el?.offsetWidth || 260
    const height = el?.offsetHeight || 200
    dg.setNode(n.id, { width, height })
  })

  // Set edges from outputsMap
  for (const sourceId in outputsMap) {
    const targets = outputsMap[sourceId]
    if (targets) {
      for (const targetId of targets) {
        dg.setEdge(sourceId, targetId)
      }
    }
  }

  dagre.layout(dg)

  // Update VueFlow node positions
  dg.nodes().forEach((nId) => {
    const dagreNode = dg.node(nId)
    const vfNode = vfFindNode(nId)
    if (vfNode && dagreNode) {
      vfNode.position = {
        x: Math.round(dagreNode.x - dagreNode.width / 2),
        y: Math.round(dagreNode.y - dagreNode.height / 2),
      }
    }
  })

  nextTick(() => {
    fitView({ duration: 300, padding: 0.1 })
  })
}

function resetView() {
  // VueFlow handles cleanup automatically
  nodes.value = []
  Object.keys(inputsMap).forEach((k) => delete inputsMap[k])
  Object.keys(outputsMap).forEach((k) => delete outputsMap[k])
  Object.keys(nodeSchemaMap).forEach((k) => delete nodeSchemaMap[k])
}

async function loadSchema() {
  schemaLoading.value = true
  const params = {
    nodeIds: viewNodes.value.map((node) => node.id).join(','),
    fields: ['original_name', 'fields', 'qualified_name'],
  }
  const data = await getNodeSchemaMapByIds(params)

  for (const nodeId in data) {
    const [schema = {}] = data[nodeId]
    setNodeSchema(nodeId, schema)
  }

  schemaLoading.value = false
}

function setNodeSchema(nodeId, schema) {
  const { fields } = mapFieldsData(schema)
  nodeSchemaMap[nodeId] = fields
}

async function loadNodeSchema(nodeId) {
  const params = {
    nodeId,
    fields: ['original_name', 'fields', 'qualified_name', 'name', 'indices'],
    page: 1,
    pageSize: 20,
  }
  const {
    items: [schema = {}],
  } = await getNodeSchemaPage(params)
  setNodeSchema(nodeId, schema)
}

function getInputs(nodeId) {
  return inputsMap[nodeId]
}

function getOutputs(nodeId) {
  return outputsMap[nodeId]
}

function checkMainTable(node) {
  const nodeId = node.id
  return (
    !node.parentId ||
    (targetNodeData.value &&
      outputsMap?.[nodeId]?.[0] === targetNodeData.value.id)
  )
}

function handleChangeParent(node, parentId) {
  const oldParentId = node.parentId
  const oldParent = nodeMap.value[oldParentId]
  const newParent = nodeMap.value[parentId]
  const index = oldParent?.children?.indexOf(node) ?? -1

  if (~index) {
    oldParent.children.splice(index, 1)
  }

  node.parentId = parentId
  if (newParent) {
    newParent.children.push(node)
  }

  if (!node.targetPath) {
    updateSourceTarget(node.id, oldParentId, parentId)
  }

  // 同步 mergeProperties 到后端
  dataflowStore.patchDataflowDebounce()
}

async function handleChangePath(node, path) {
  node.targetPath = path
  const arr = path.split('.')
  const outputs = outputsMap[node.id]
  let { parentId } = node

  if (!checkMainTable(node)) {
    if (arr.length > 1) {
      const parentPath = arr.slice(0, -1).join('.')
      const parentNode = nodes.value.find((n) => n.targetPath === parentPath)
      parentId = parentNode?.id || parentId
    }

    if (parentId !== outputs?.[0]) {
      updateSourceTarget(node.id, outputs?.[0], parentId)
    }
  }

  // 同步 mergeProperties 到后端
  dataflowStore.patchDataflowDebounce()

  if (targetNodeData.value?.id) {
    // 更新目标节点schema
    await afterTaskSaved()
    await onLoadTargetSchema()
  }
}

function updateSourceTarget(source, target, newTarget) {
  const inputs = inputsMap[target]
  if (inputs) {
    const inputIndex = inputs.indexOf(source)
    if (~inputIndex) inputs.splice(inputIndex, 1)
  }

  const outputs = outputsMap[source]
  if (outputs) {
    const outputIndex = outputs.indexOf(target)
    if (~outputIndex) outputs.splice(outputIndex, 1)
    outputs.push(newTarget)
  }

  if (!inputsMap[newTarget]) {
    inputsMap[newTarget] = []
  }
  inputsMap[newTarget].push(source)

  nextTick(() => {
    handleAutoLayout()
  })
}

function onClickNode(node) {
  selectedNodeId.value = node.id
}

function addNode(node) {
  const { id: source, parentId: target } = node
  nodes.value.push(node)

  if (target) {
    if (!inputsMap[target]) {
      inputsMap[target] = []
    }
    inputsMap[target].push(source)
    outputsMap[source] = [target]

    nextTick(() => {
      handleAutoLayout()
    })
  }

  // 同步 mergeProperties 到后端
  dataflowStore.patchDataflowDebounce()
}

async function addTargetNode(node) {
  const mergeProperties = activeNode.value?.mergeProperties
  inputsMap[node.id] = []
  const inputs = inputsMap[node.id]
  await nextTick()
  mergeProperties?.forEach((item) => {
    item.parentId = node.id
    inputs.push(item.id)
    outputsMap[item.id] = [node.id]
  })
  handleAutoLayout()
  // 同步 mergeProperties 到后端
  dataflowStore.patchDataflowDebounce()
  await afterTaskSaved()
  await onLoadTargetSchema()
}

async function onLoadSchema(id) {
  loadingSchemaNodeId.value = id

  try {
    await loadNodeSchema(id)
  } finally {
    loadingSchemaNodeId.value = ''
  }

  await onLoadTargetSchema()
}

async function onLoadTargetSchema() {
  if (!targetNodeData.value?.id) return

  targetNodeSchemaLoading.value = true

  try {
    await loadNodeSchema(targetNodeData.value.id)
  } finally {
    targetNodeSchemaLoading.value = false
  }
}

function afterTaskSaved() {
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

function handleOpenHelp() {
  helpVisible.value = true
  buried?.('openMaterializedViewHelp')
}

function handleOpenHelpDoc() {
  window.open(docUrl.value, '_blank')
  buried?.('openMaterializedViewDoc')
}

// Watch visible
watch(
  () => props.visible,
  async (val) => {
    if (!val) {
      resetView()
      unwatchMergeProperties?.()
      unbindEvent()
      return
    }

    await nextTick()
    loading.value = true
    await transformToDag()
    await loadSchema().catch((error) => {
      console.error('load error', error)
    })
    loading.value = false
    await nextTick()
    handleAutoLayout()
    watchMergeProperties()
    bindEvent()
  },
)

// Watch viewport zoom to sync scale
watch(
  () => getViewport()?.zoom,
  (zoom) => {
    if (zoom) scale.value = zoom
  },
)

onMounted(() => {
  if (!isDomesticStation.value) {
    docUrl.value =
      'https://docs.tapdata.io/user-guide/data-pipeline/data-development/create-materialized-view/'
    iframeHtml.value = `<iframe
          class="block"
          width="100%"
          height="360"
          src="https://www.youtube.com/embed/gcJew9u2uxY?si=zpvhZIjI8A9A9O5y"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`
  } else {
    docUrl.value =
      'https://docs.tapdata.net/user-guide/data-pipeline/data-development/create-materialized-view/'
    iframeHtml.value = `<iframe class="block" width="100%" height="360" src="//player.bilibili.com/player.html?bvid=BV1eN411T7wG&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
  }
})

onBeforeUnmount(() => {
  unbindEvent()
})

// Expose methods for parent component
defineExpose({
  addNode,
  addTargetNode,
})
</script>

<template>
  <el-drawer
    :model-value="visible"
    size="100%"
    class="materialized-view-drawer"
    :with-header="false"
    :close-on-press-escape="false"
    @update:model-value="handleUpdateVisible"
  >
    <div
      ref="container"
      v-loading="loading"
      class="h-100 flex flex-column"
      element-loading-background="#fff"
    >
      <header class="px-4 h-48 flex align-center position-relative">
        <IconButton @click="handleUpdateVisible(false)">close</IconButton>
        <div class="fs-6 font-color-dark ml-1">
          {{ $t('packages_dag_materialized_view') }}
        </div>
        <ElButton
          v-if="!isDaas"
          text
          type="primary"
          class="ml-4 color-warning"
          @click="handleOpenHelp"
          ><VIcon class="mr-1">question-circle</VIcon
          >{{ $t('public_button_help') }}</ElButton
        >
        <div
          class="operation-center flex align-center position-absolute translate-middle-x start-50"
        >
          <!--删除-->
          <ElTooltip
            v-if="!disabled"
            transition="tooltip-fade-in"
            :content="`${$t('public_button_delete')}(Del)`"
          >
            <button class="icon-btn" @click="handleDelete">
              <VIcon size="20">delete</VIcon>
            </button>
          </ElTooltip>
          <!--内容居中-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="`${$t('packages_dag_button_center_content')}(Shift + 1)`"
          >
            <button class="icon-btn" @click="handleCenterContent">
              <VIcon size="20">compress</VIcon>
            </button>
          </ElTooltip>
          <!--自动布局-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="`${$t(
              'packages_dag_button_auto_layout',
            )}(${commandCode} + ${optionCode} + L)`"
          >
            <button class="icon-btn" @click="handleAutoLayout">
              <VIcon size="20">auto-layout</VIcon>
            </button>
          </ElTooltip>
          <VDivider class="mx-3" vertical inset />
          <!--缩小-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="`${$t('packages_dag_button_zoom_out')}(${commandCode} -)`"
          >
            <button class="icon-btn" @click="handleZoomOut">
              <VIcon size="20">remove-outline</VIcon>
            </button>
          </ElTooltip>
          <div class="choose-size mx-2">
            <ElPopover
              placement="bottom"
              trigger="hover"
              popper-class="rounded-xl p-0"
            >
              <template #reference>
                <div class="size-wrap">{{ scaleTxt }}</div>
              </template>
              <div class="choose-list p-2">
                <div
                  class="choose-item pl-4 flex justify-content-between align-center"
                  @click="handleZoomOut"
                >
                  <span class="title">{{
                    $t('packages_dag_button_zoom_out')
                  }}</span>
                  <div class="kbd-wrap flex align-center mr-2">
                    <kbd>{{ commandCode }}</kbd
                    ><span class="mx-1">+</span><kbd>+</kbd>
                  </div>
                </div>
                <div
                  class="choose-item pl-4 flex justify-content-between align-center"
                  @click="handleZoomIn"
                >
                  <span class="title">{{
                    $t('packages_dag_button_zoom_in')
                  }}</span>
                  <div class="kbd-wrap flex align-center mr-2">
                    <kbd>{{ commandCode }}</kbd
                    ><span class="mx-1">+</span><kbd>–</kbd>
                  </div>
                </div>
                <VDivider class="my-2" />
                <div
                  v-for="val in chooseItems"
                  :key="val"
                  class="choose-item pl-4"
                  @click="handleZoomTo(val)"
                >
                  {{ val * 100 }}%
                </div>
              </div>
            </ElPopover>
          </div>
          <!--放大-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="`${$t('packages_dag_button_zoom_in')}(${commandCode} +)`"
          >
            <button class="icon-btn" @click="handleZoomIn">
              <VIcon size="20">add-outline</VIcon>
            </button>
          </ElTooltip>
        </div>
        <ElButton
          v-if="buttonShowMap.Start"
          :disabled="
            isSaving ||
            (dataflow.disabledData && dataflow.disabledData.start) ||
            transformLoading
          "
          :loading="isSaving"
          class="ml-auto"
          type="primary"
          @click="$emit('start')"
        >
          {{ $t('public_button_start') }}
        </ElButton>
      </header>
      <div class="flex-1 min-h-0 position-relative">
        <VueFlow
          v-if="showPaper"
          id="materialized-view-flow"
          data-id="materialized-view-flow"
          :nodes="flowNodes"
          :edges="flowEdges"
          :max-zoom="10"
          :min-zoom="0.1"
          :delete-key-code="null"
          :apply-changes="false"
          class="materialized-view-flow"
        >
          <template #node-mv-node="nodeProps">
            <Node
              :disabled="disabled"
              :class="{
                active: selectedNodeId === nodeProps.data.node.id,
              }"
              :node="nodeProps.data.node"
              :node-id="nodeProps.data.node.id"
              :schema="nodeSchemaMap[nodeProps.data.node.id]"
              :parent-schema="nodeSchemaMap[nodeProps.data.node.parentId]"
              :get-inputs="getInputs"
              :get-outputs="getOutputs"
              :inputs="inputsMap[nodeProps.data.node.id]"
              :table-options="tableOptions"
              :is-main-table="checkMainTable(nodeProps.data.node)"
              :inputs-map="inputsMap"
              :node-map="nodeMap"
              :target-path-map="targetPathMap"
              :node-schema-map="nodeSchemaMap"
              :has-target-node="!!targetNodeData"
              :schema-loading="loadingSchemaNodeId === nodeProps.data.node.id"
              @click="onClickNode(nodeProps.data.node)"
              @change-parent="handleChangeParent"
              @change-path="handleChangePath"
              @add-node="$emit('add-node', nodeProps.data.node, $event)"
              @add-target-node="$emit('add-target-node')"
              @load-schema="onLoadSchema(nodeProps.data.node.id)"
            />
          </template>
          <template #node-mv-target-node="nodeProps">
            <TargetNode
              :disabled="disabled"
              :node="nodeProps.data.node"
              :data="nodeProps.data.node"
              :schema="nodeSchemaMap[nodeProps.data.node.id]"
              :schema-loading="targetNodeSchemaLoading"
              @add-node="$emit('add-node', $event)"
              @load-schema="onLoadTargetSchema"
            />
          </template>
        </VueFlow>
        <TransformLoading :show="transformLoading" />
      </div>
    </div>

    <ElDialog v-model="helpVisible" append-to-body width="52%">
      <template #header="{ titleClass }">
        <span :class="titleClass">
          {{ $t('packages_dag_materialized_view_help_title') }}
        </span>
      </template>

      <div>
        <p class="mb-2">
          {{ $t('packages_dag_materialized_view_help_desc') }}
        </p>
        <p class="mb-2">
          <ElLink
            type="primary"
            class="text-decoration-underline"
            @click="handleOpenHelpDoc"
            >{{
              $t('packages_dag_materialized_view_help_tutorial_btn')
            }}
            &gt;&gt;</ElLink
          >
        </p>
        <p class="mb-2 font-color-dark fw-sub">
          {{ $t('packages_dag_materialized_view_help_video_desc') }}
        </p>
        <div class="pb-5" v-html="iframeHtml" />
      </div>
    </ElDialog>
  </el-drawer>
</template>

<style lang="scss" scoped>
$sidebarW: 236px;
$hoverBg: #eef3ff;
$radius: 6px;
$baseHeight: 26px;
$sidebarBg: #fff;

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  padding: 4px;
  color: #4e5969;
  background: #fff;
  outline: none;
  border: 1px solid transparent;
  border-radius: $radius;
  transition:
    background,
    color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;
  &.active,
  &:hover {
    color: var(--color-primary);
    background: $hoverBg;
  }
}
.icon-btn + .icon-btn {
  margin-left: 12px;
}
.h-48 {
  height: 48px;
}

.materialized-view-flow {
  width: 100%;
  height: 100%;
  background-color: #f2f4f7;
}

:global(.materialized-view-drawer .el-drawer__body) {
  padding: 0 !important;
}
</style>

<style>
.materialized-view-help-dialog {
  z-index: 10000;
}
</style>
