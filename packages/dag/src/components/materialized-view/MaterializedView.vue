<template>
  <el-drawer
    :visible="visible"
    size="100%"
    :with-header="false"
    :close-on-press-escape="false"
    @update:visible="handleUpdateVisible"
  >
    <div ref="container" class="h-100 flex flex-column" v-loading="loading" element-loading-background="#fff">
      <header class="px-4 h-48 flex align-center position-relative">
        <IconButton @click="handleUpdateVisible(false)">close</IconButton>
        <div class="fs-6 font-color-dark ml-1">{{ $t('packages_dag_materialized_view') }}</div>
        <ElButton v-if="!isDaas" type="text" class="ml-4 color-warning" @click="handleOpenHelp"
          ><VIcon class="mr-1">question-circle</VIcon>{{ $t('public_button_help') }}</ElButton
        >
        <div class="operation-center flex align-center position-absolute translate-middle-x start-50">
          <!--删除-->
          <ElTooltip v-if="!disabled" transition="tooltip-fade-in" :content="$t('public_button_delete') + '(Del)'">
            <button @click="handleDelete" class="icon-btn">
              <VIcon size="20">delete</VIcon>
            </button>
          </ElTooltip>
          <!--内容居中-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_center_content') + '(Shift + 1)'">
            <button @click="handleCenterContent" class="icon-btn">
              <VIcon size="20">compress</VIcon>
            </button>
          </ElTooltip>
          <!--自动布局-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="$t('packages_dag_button_auto_layout') + `(${commandCode} + ${optionCode} + L)`"
          >
            <button @click="handleAutoLayout" class="icon-btn">
              <VIcon size="20">auto-layout</VIcon>
            </button>
          </ElTooltip>
          <VDivider class="mx-3" vertical inset></VDivider>
          <!--缩小-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_out') + `(${commandCode} -)`">
            <button @click="handleZoomOut" class="icon-btn">
              <VIcon size="20">remove-outline</VIcon>
            </button>
          </ElTooltip>
          <div class="choose-size mx-2">
            <ElPopover placement="bottom" trigger="hover" popper-class="rounded-xl p-0">
              <div slot="reference" class="size-wrap">{{ scaleTxt }}</div>
              <div class="choose-list p-2">
                <div @click="handleZoomOut" class="choose-item pl-4 flex justify-content-between align-center">
                  <span class="title">{{ $t('packages_dag_button_zoom_out') }}</span>
                  <div class="kbd-wrap flex align-center mr-2">
                    <kbd>{{ commandCode }}</kbd
                    ><span class="mx-1">+</span><kbd>+</kbd>
                  </div>
                </div>
                <div @click="handleZoomIn" class="choose-item pl-4 flex justify-content-between align-center">
                  <span class="title">{{ $t('packages_dag_button_zoom_in') }}</span>
                  <div class="kbd-wrap flex align-center mr-2">
                    <kbd>{{ commandCode }}</kbd
                    ><span class="mx-1">+</span><kbd>–</kbd>
                  </div>
                </div>
                <VDivider class="my-2"></VDivider>
                <div v-for="val in chooseItems" :key="val" class="choose-item pl-4" @click="handleZoomTo(val)">
                  {{ val * 100 }}%
                </div>
              </div>
            </ElPopover>
          </div>
          <!--放大-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_in') + `(${commandCode} +)`">
            <button @click="handleZoomIn" class="icon-btn">
              <VIcon size="20">add-outline</VIcon>
            </button>
          </ElTooltip>
        </div>
        <ElButton
          v-if="buttonShowMap.Start"
          :disabled="isSaving || (dataflow.disabledData && dataflow.disabledData.start) || transformLoading"
          :loading="isSaving"
          class="ml-auto"
          size="medium"
          type="primary"
          @click="$emit('start')"
        >
          {{ $t('public_button_start') }}
        </ElButton>
      </header>
      <PaperScroller v-if="showPaper" class="flex-1" ref="paperScroller" @change-scale="handleChangeScale">
        <Node
          :disabled="disabled"
          v-for="node in nodes"
          :key="node.id"
          :class="{
            active: selectedNodeId === node.id
          }"
          :node="node"
          :id="node.id"
          :node-id="node.id"
          :js-plumb-ins="jsPlumbIns"
          :position="nodePositionMap[node.id]"
          :schema="nodeSchemaMap[node.id]"
          :parentSchema="nodeSchemaMap[node.parentId]"
          :getInputs="getInputs"
          :getOutputs="getOutputs"
          :inputs="inputsMap[node.id]"
          :tableOptions="tableOptions"
          :isMainTable="checkMainTable(node)"
          :inputsMap="inputsMap"
          :nodeMap="nodeMap"
          :targetPathMap="targetPathMap"
          :nodeSchemaMap="nodeSchemaMap"
          :has-target-node="!!targetNode"
          :schemaLoading="loadingSchemaNodeId === node.id"
          :getNodeById="getNodeById"
          @click.native="onClickNode(node)"
          @change-parent="handleChangeParent"
          @change-path="handleChangePath"
          @add-node="$emit('add-node', node, $event)"
          @add-target-node="$emit('add-target-node')"
          @load-schema="onLoadSchema(node.id)"
        ></Node>
        <TargetNode
          :disabled="disabled"
          v-if="targetNode"
          :id="targetNode.id"
          :node="targetNode"
          :js-plumb-ins="jsPlumbIns"
          :schema="nodeSchemaMap[targetNode.id]"
          :position="nodePositionMap[targetNode.id]"
          :schemaLoading="targetNodeSchemaLoading"
          @add-node="$emit('add-node', arguments[0], arguments[1])"
          @load-schema="onLoadTargetSchema"
        ></TargetNode>
      </PaperScroller>
    </div>

    <ElDialog append-to-body :visible.sync="helpVisible" width="52%" @closed="onClosedDialog">
      <template #title>
        <span class="fs-6 fw-sub font-color-dark">
          {{ $t('packages_dag_materialized_view_help_title') }}
        </span>
      </template>

      <div class="mt-n4">
        <p class="mb-2">
          {{ $t('packages_dag_materialized_view_help_desc') }}
        </p>
        <p class="mb-2">
          <ElLink type="primary" class="text-decoration-underline" @click="handleOpenHelpDoc"
            >{{ $t('packages_dag_materialized_view_help_tutorial_btn') }} &gt;&gt;</ElLink
          >
        </p>
        <p class="mb-2 font-color-dark fw-sub">{{ $t('packages_dag_materialized_view_help_video_desc') }}</p>
        <div v-html="iframeHtml"></div>
      </div>
    </ElDialog>
  </el-drawer>
</template>

<script>
import dagre from 'dagre'
import { mapActions, mapGetters, mapState } from 'vuex'
import Mousetrap from 'mousetrap'
import { IconButton, VDivider, VIcon } from '@tap/component'
import { metadataInstancesApi } from '@tap/api'
import PaperScroller from '../PaperScroller'
import Node from './Node'
import TargetNode from './TargetNode'
import { config, jsPlumb } from '../../instance'

export default {
  name: 'MaterializedView',

  inject: ['buried'],

  props: {
    visible: Boolean,
    disabled: Boolean,
    isSaving: Boolean,
    dataflow: Object,
    buttonShowMap: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  components: { VIcon, VDivider, PaperScroller, TargetNode, Node, IconButton },

  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)

    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      nodes: [],
      nodePositionMap: {},
      nodeSchemaMap: {},
      inputsMap: {},
      outputsMap: {},
      jsPlumbIns: jsPlumb.getInstance(config),
      scale: 1,
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt',
      loading: false,
      schemaLoading: false,
      targetNodeSchemaLoading: false,
      selectedNodeId: '',
      loadingSchemaNodeId: '',
      helpVisible: false,
      docUrl: '',
      iframeHtml: ''
    }
  },

  computed: {
    isDomesticStation() {
      return this.$store.getters.isDomesticStation
    },
    ...mapGetters('dataflow', ['allNodes', 'activeNode', 'nodeById', 'transformLoading']),
    ...mapState('dataflow', ['taskSaving']),

    scaleTxt() {
      return Math.round(this.scale * 100) + '%'
    },

    showPaper() {
      return this.visible && this.activeNode?.type === 'merge_table_processor'
    },

    targetNode() {
      const { $outputs } = this.activeNode

      if (!$outputs.length) return

      return this.nodeById($outputs[0])
    },

    viewNodes() {
      return this.nodes.concat(this.targetNode ? [this.targetNode] : [])
    },

    tableOptions() {
      return this.nodes.map(node => ({
        label: node.tableNode.tableName,
        value: node.id
      }))
    },

    nodeMap() {
      return this.nodes.reduce((map, node) => {
        map[node.id] = node
        return map
      }, {})
    },

    targetPathMap() {
      return this.nodes.reduce((map, node) => {
        if (node.targetPath) {
          map[node.targetPath] = node
        }
        return map
      }, {})
    }
  },

  watch: {
    async visible(val) {
      if (!val) {
        this.resetView()
        this.unwatchMergeProperties?.()
        return
      }

      this.initView()
      this.loading = true
      await this.transformToDag()
      await this.loadSchema()
      this.loading = false
      this.handleAutoLayout()
      this.watchMergeProperties()
    }
  },

  mounted() {
    Mousetrap(this.$refs.container).bind(['backspace', 'del'], () => {
      this.visible && !this.disabled && this.handleDelete()
    })
    Mousetrap(this.$refs.container).bind(['option+command+l', 'ctrl+alt+l'], e => {
      e.preventDefault()
      this.visible && this.handleAutoLayout()
    })

    if (!this.isDomesticStation) {
      this.docUrl = 'https://docs.tapdata.io/user-guide/data-pipeline/data-development/create-materialized-view/'
      this.iframeHtml = `<iframe
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
      this.docUrl = 'https://docs.tapdata.net/user-guide/data-pipeline/data-development/create-materialized-view/'
      this.iframeHtml = `<iframe class="block" width="100%" height="360" src="//player.bilibili.com/player.html?bvid=BV1eN411T7wG&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
    }
  },

  methods: {
    ...mapActions('dataflow', ['updateDag']),

    // activeNode.mergeProperties
    watchMergeProperties() {
      this.unwatchMergeProperties?.()
      this.unwatchMergeProperties = this.$watch(
        'activeNode.mergeProperties',
        () => {
          console.log('watchMergeProperties')
          this.updateDag({ vm: this })
        },
        { deep: true }
      )
    },

    handleUpdateVisible(val) {
      this.$emit('update:visible', val)
    },

    handleCenterContent() {
      const allNodes = this.viewNodes.map(node => {
        return {
          id: node.id,
          attrs: {
            position: this.nodePositionMap[node.id]
          }
        }
      })
      this.$refs.paperScroller.centerContent(false, 24, allNodes, '')
    },

    async handleDelete() {
      if (!this.selectedNodeId || this.nodes.length === 1) return

      const { selectedNodeId: id } = this
      const managedElements = this.jsPlumbIns.getManagedElements()
      const el = document.getElementById(id)

      this.jsPlumbIns.removeAllEndpoints(id)
      this.jsPlumbIns.destroyDraggable(el)
      this.jsPlumbIns.destroyDroppable(el)
      delete managedElements[id] // 删除managed可以出发锚点位置更新

      const node = this.nodeMap[id]
      const childrenNodes = node.children
      const parentNode = this.nodeMap[node.parentId]
      const { parentId = this.targetNode?.id } = node
      const index = this.nodes.findIndex(n => n.id === id)
      ~index && this.nodes.splice(index, 1)

      if (parentNode) {
        const indexOfParent = parentNode.children.findIndex(n => n.id === id)
        ~indexOfParent && parentNode.children.splice(indexOfParent, 1)
        parentNode.children.push(...childrenNodes)

        // 从父节点的输入上删除
        const oldIndex = this.inputsMap[parentNode.id].indexOf(id)
        this.inputsMap[parentNode.id].splice(oldIndex, 1)
      } else {
        const { mergeProperties } = this.activeNode
        const index = mergeProperties.findIndex(n => n.id === id)
        ~index && mergeProperties.splice(index, 1)
        mergeProperties.push(...childrenNodes)
      }

      this.$delete(this.nodePositionMap, id)
      this.$delete(this.nodeSchemaMap, id)
      this.$delete(this.inputsMap, id)
      this.$delete(this.outputsMap, id)

      for (const childrenNode of childrenNodes) {
        const childId = childrenNode.id
        const oldIndex = this.outputsMap[childId].indexOf(id)
        this.outputsMap[childId].splice(oldIndex, 1, parentId)

        if (parentId) {
          this.inputsMap[parentId].push(childId)
          this.jsPlumbIns.connect({ uuids: [childId + '_source', parentId + '_target'] })
        }

        childrenNode.parentId = parentId
      }

      this.$emit('delete-node', id)

      await this.afterTaskSaved()
      await this.onLoadTargetSchema(this.targetNode.id)
    },

    handleZoomIn() {
      this.$refs.paperScroller.zoomIn()
    },

    handleZoomOut() {
      this.$refs.paperScroller.zoomOut()
    },

    handleZoomTo(scale) {
      this.$refs.paperScroller.zoomTo(scale)
    },

    findParentNodes(id, ifMyself) {
      let node = this.nodeById(id)
      const parents = []
      let parentIds = node.$inputs || []

      if (ifMyself && !parentIds.length) return [node]

      parentIds.forEach(pid => {
        let parent = this.nodeById(pid)
        if (parent) {
          if (parent.$inputs?.length) {
            parent.$inputs.forEach(ppid => {
              parents.push(...this.findParentNodes(ppid, true))
            })
          } else {
            parents.push(parent)
          }
        }
      })

      return parents
    },

    async transformToDag() {
      let mergeProperties = this.activeNode.mergeProperties
      this.nodes = []

      if (!mergeProperties?.length) {
        // 主从合并没有源和目标
        mergeProperties = this.activeNode.mergeProperties = []
        this.initMainNode()
        await this.afterTaskSaved()
      } else {
        const nodes = []
        const edges = []
        const inputsMap = {}
        const outputsMap = {}
        const targetPathMap = {} // path: Node
        const traverse = (children, _target) => {
          for (const item of children) {
            let source = item.id
            let target = _target
            let tableNode = this.findParentNodes(item.id, true)[0]

            item.parentId = target
            item.tableNode = tableNode
            nodes.push(item)
            this.$set(this.nodePositionMap, item.id, [0, 0]) // 初始化坐标

            if (item.targetPath) {
              const arr = item.targetPath.split('.')

              if (arr.length > 1) {
                const parentPath = arr.slice(0, arr.length - 1).join('.')
                target = targetPathMap[parentPath] || target
              }

              targetPathMap[item.targetPath] = item.id
            }

            if (target) {
              // 连线
              edges.push({ source, target })

              // 上下游节点ID数组
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

            // 递归
            if (item.children?.length) {
              traverse(item.children, item.id)
            }
          }
        }
        traverse(mergeProperties, this.targetNode?.id)
        this.nodes = nodes
        this.inputsMap = inputsMap
        this.outputsMap = outputsMap
        await this.$nextTick()
        edges.forEach(({ source, target }) => {
          this.jsPlumbIns.connect({ uuids: [`${source}_source`, `${target}_target`] })
        })
      }

      this.initTargetNode()
    },

    initMainNode() {
      let mergeProperties = this.activeNode.mergeProperties

      this.$emit(
        'add-node',
        {
          children: mergeProperties
        },
        {
          mergeType: 'updateOrInsert' // 主表默认是更新已存在或插入新数据
        }
      )
    },

    initTargetNode() {
      if (!this.targetNode?.id) return

      this.inputsMap[this.targetNode.id] = []
      this.outputsMap[this.targetNode.id] = []
      this.$set(this.nodePositionMap, this.targetNode.id, [0, 0]) // 初始化坐标
    },

    /**
     * 自动布局
     */
    handleAutoLayout() {
      const nodes = this.viewNodes

      // if (nodes.length < 2) return

      const scale = this.$refs.paperScroller.getPaperScale()
      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

      dg.setGraph({ nodesep: 60, ranksep: 120, marginx: 50, marginy: 50, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        let { width, height } = document.getElementById(n.id)?.getBoundingClientRect() || {}
        width /= scale
        height /= scale
        dg.setNode(n.id, { width, height })
      })

      this.jsPlumbIns.getAllConnections().forEach(edge => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)

      this.jsPlumbIns.setSuspendDrawing(true)

      dg.nodes().forEach(n => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)
        nodePositionMap[n] = [left, top]
      })

      this.nodePositionMap = nodePositionMap

      this.$nextTick(() => {
        this.jsPlumbIns.setSuspendDrawing(false, true)
        // this.$refs.paperScroller.initVisibleArea()
        const allNodes = this.viewNodes.map(node => {
          return {
            id: node.id,
            attrs: {
              position: this.nodePositionMap[node.id]
            }
          }
        })
        this.$refs.paperScroller.autoResizePaper(allNodes, '')
        this.$refs.paperScroller.centerContent(false, 24, allNodes, '')
      })
    },

    initView() {
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
    },

    resetView() {
      this.jsPlumbIns.reset()
    },

    async loadSchema() {
      this.schemaLoading = true
      const params = {
        nodeIds: this.viewNodes.map(node => node.id).join(','),
        fields: ['original_name', 'fields', 'qualified_name']
      }
      const data = await metadataInstancesApi.getNodeSchemaMapByIds(params)

      for (let nodeId in data) {
        const [schema = {}] = data[nodeId]
        this.setNodeSchema(nodeId, schema)
      }

      this.schemaLoading = false
    },

    setNodeSchema(nodeId, { fields = [], indices = [] }) {
      let columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})

      this.$set(
        this.nodeSchemaMap,
        nodeId,
        fields
          .map(item => {
            item.dataType = item.data_type.replace(/\(.+\)/, '')
            item.indicesUnique = !!columnsMap[item.field_name]
            item.isPrimaryKey = item.primary_key_position > 0
            return item
          })
          .sort((a, b) => {
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
      )
    },

    async loadNodeSchema(nodeId) {
      const params = {
        nodeId,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)
      this.setNodeSchema(nodeId, schema)
    },

    handleChangeScale(scale) {
      this.scale = scale
      this.jsPlumbIns.setZoom(scale)
    },

    getInputs(nodeId) {
      return this.inputsMap[nodeId]
    },

    getOutputs(nodeId) {
      return this.outputsMap[nodeId]
    },

    checkMainTable(node) {
      let nodeId = node.id
      return !node.parentId || (this.targetNode && this.outputsMap?.[nodeId]?.[0] === this.targetNode.id)
    },

    handleChangeParent(node, parentId) {
      const oldParentId = node.parentId
      const oldParent = this.nodeMap[oldParentId]
      const newParent = this.nodeMap[parentId]
      const index = oldParent.children.indexOf(node)

      if (~index) {
        oldParent.children.splice(index, 1)
      }

      node.parentId = parentId
      newParent.children.push(node)
      // this.updateDag({ vm: this })

      if (!node.targetPath) {
        this.updateSourceTarget(node.id, oldParentId, parentId)
      }
    },

    async handleChangePath(node, path) {
      this.$set(node, 'targetPath', path)
      const arr = path.split('.')
      const outputs = this.outputsMap[node.id]
      let { parentId } = node

      if (!this.checkMainTable(node)) {
        if (arr.length > 1) {
          const parentPath = arr.slice(0, arr.length - 1).join('.')
          const parentNode = this.nodes.find(node => node.targetPath === parentPath)
          parentId = parentNode?.id || parentId
        }

        if (parentId !== outputs[0]) {
          this.updateSourceTarget(node.id, outputs[0], parentId)
        }
      }

      if (this.targetNode?.id) {
        // 更新目标节点schema
        await this.afterTaskSaved()
        await this.onLoadTargetSchema(this.targetNode.id)
      }
    },

    updateSourceTarget(source, target, newTarget) {
      const inputs = this.inputsMap[target]
      const inputIndex = inputs.indexOf(source)
      const outputs = this.outputsMap[source]
      const outputIndex = outputs.indexOf(target)
      let newTargetInputs = this.inputsMap[newTarget]
      const connectionIns = this.jsPlumbIns.getConnections({
        source,
        target
      })[0]

      if (!newTargetInputs) {
        this.$set(this.inputsMap, newTarget, [])
        newTargetInputs = this.inputsMap[newTarget]
      }

      ~inputIndex && inputs.splice(inputIndex, 1)
      ~outputIndex && outputs.splice(outputIndex, 1)
      outputs.push(newTarget)
      newTargetInputs.push(source)
      this.jsPlumbIns.deleteConnection(connectionIns)
      this.jsPlumbIns.connect({ uuids: [source + '_source', newTarget + '_target'] })
      this.handleAutoLayout()
    },

    onClickNode(node) {
      this.selectedNodeId = node.id
    },

    addNode(node) {
      const { id: source, parentId: target } = node
      this.nodes.push(node)
      this.$set(this.nodePositionMap, source, [0, 0]) // 初始化坐标

      if (target) {
        let inputs = this.inputsMap[target]

        if (!inputs) {
          this.$set(this.inputsMap, target, [])
          inputs = this.inputsMap[target]
        }

        inputs.push(source)
        this.$set(this.outputsMap, source, [target])

        this.$nextTick(() => {
          this.jsPlumbIns.connect({ uuids: [node.id + '_source', node.parentId + '_target'] })
          this.handleAutoLayout()
        })
      }
    },

    async addTargetNode(node) {
      console.log('addTargetNode', node)
      let mergeProperties = this.activeNode.mergeProperties
      this.$set(this.inputsMap, node.id, [])
      let inputs = this.inputsMap[node.id]
      this.$set(this.nodePositionMap, node.id, [0, 0]) // 初始化坐标
      await this.$nextTick()
      mergeProperties.forEach(item => {
        item.parentId = node.id
        inputs.push(item.id)
        this.outputsMap[item.id] = [node.id]
        this.jsPlumbIns.connect({ uuids: [item.id + '_source', node.id + '_target'] })
      })
      this.handleAutoLayout()
      await this.afterTaskSaved()
      await this.onLoadTargetSchema()
    },

    async onLoadSchema(id) {
      this.loadingSchemaNodeId = id

      try {
        await this.loadNodeSchema(id)
      } finally {
        this.loadingSchemaNodeId = ''
      }

      this.jsPlumbIns.revalidate(id)
      await this.onLoadTargetSchema()
    },

    async onLoadTargetSchema() {
      if (!this.targetNode?.id) return

      this.targetNodeSchemaLoading = true

      try {
        await this.loadNodeSchema(this.targetNode.id)
      } finally {
        this.targetNodeSchemaLoading = false
      }

      this.jsPlumbIns.revalidate(this.targetNode.id)
    },

    afterTaskSaved() {
      return new Promise(resolve => {
        setTimeout(() => {
          if (this.taskSaving) {
            let unwatch = this.$watch('taskSaving', () => {
              unwatch()
              resolve()
            })
          } else {
            resolve()
          }
        }, 100)
      })
    },

    getNodeById() {},

    handleOpenHelp() {
      this.helpVisible = true
      this.buried('openMaterializedViewHelp')
    },

    handleOpenHelpDoc() {
      window.open(this.docUrl, '_blank')
      this.buried('openMaterializedViewDoc')
    },

    onClosedDialog() {}
  }
}
</script>

<style scoped lang="scss">
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
  transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;

  &.active,
  &:hover {
    color: map-get($color, primary);
    background: $hoverBg;
  }
}

.icon-btn + .icon-btn {
  margin-left: 12px;
}
.h-48 {
  height: 48px;
}
</style>
<style>
.materialized-view-help-dialog {
  z-index: 10000;
}
</style>
