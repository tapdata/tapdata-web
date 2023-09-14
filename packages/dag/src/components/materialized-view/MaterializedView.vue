<template>
  <el-drawer
    :visible="visible"
    size="100%"
    :with-header="false"
    :close-on-press-escape="false"
    @update:visible="handleUpdateVisible"
  >
    <div class="h-100 flex flex-column">
      <header class="px-4 h-48 flex align-center position-relative">
        <IconButton @click="handleUpdateVisible(false)">close</IconButton>
        <div class="fs-6 font-color-dark ml-1">构建物化视图</div>
        <div class="operation-center flex align-center position-absolute translate-middle-x start-50">
          <!--删除-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('public_button_delete') + '(Del)'">
            <button @click="$emit('delete')" class="icon-btn">
              <VIcon size="20">delete</VIcon>
            </button>
          </ElTooltip>
          <!--内容居中-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_center_content') + '(Shift + 1)'">
            <button @click="$emit('center-content')" class="icon-btn">
              <VIcon size="20">compress</VIcon>
            </button>
          </ElTooltip>
          <!--自动布局-->
          <ElTooltip
            transition="tooltip-fade-in"
            :content="$t('packages_dag_button_auto_layout') + `(${commandCode} + ${optionCode} + L)`"
          >
            <button @click="$emit('auto-layout')" class="icon-btn">
              <VIcon size="20">auto-layout</VIcon>
            </button>
          </ElTooltip>
          <!--&lt;!&ndash;拖选画布&ndash;&gt;
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_mouse_selection')">
            <button @click="toggleShiftKeyPressed()" class="icon-btn" :class="{ active: shiftKeyPressed }">
              <VIcon size="20">kuangxuan</VIcon>
            </button>
          </ElTooltip>-->
          <VDivider class="mx-3" vertical inset></VDivider>
          <!--缩小-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_out') + `(${commandCode} -)`">
            <button @click="$emit('zoom-out')" class="icon-btn">
              <VIcon size="20">remove-outline</VIcon>
            </button>
          </ElTooltip>
          <div class="choose-size mx-2">
            <ElPopover placement="bottom" trigger="hover" popper-class="rounded-xl p-0">
              <div slot="reference" class="size-wrap">{{ scaleTxt }}</div>
              <div class="choose-list p-2">
                <div @click="$emit('zoom-in')" class="choose-item pl-4 flex justify-content-between align-center">
                  <span class="title">{{ $t('packages_dag_button_zoom_out') }}</span>
                  <div class="kbd-wrap flex align-center mr-2"><kbd>⌘</kbd><span class="mx-1">+</span><kbd>+</kbd></div>
                </div>
                <div @click="$emit('zoom-out')" class="choose-item pl-4 flex justify-content-between align-center">
                  <span class="title">{{ $t('packages_dag_button_zoom_in') }}</span>
                  <div class="kbd-wrap flex align-center mr-2"><kbd>⌘</kbd><span class="mx-1">+</span><kbd>–</kbd></div>
                </div>
                <VDivider class="my-2"></VDivider>
                <div v-for="val in chooseItems" :key="val" class="choose-item pl-4" @click="$emit('zoom-to', val)">
                  {{ val * 100 }}%
                </div>
              </div>
            </ElPopover>
          </div>
          <!--放大-->
          <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_in') + `(${commandCode} +)`">
            <button @click="$emit('zoom-in')" class="icon-btn">
              <VIcon size="20">add-outline</VIcon>
            </button>
          </ElTooltip>
        </div>
      </header>
      <PaperScroller v-if="showPaper" class="flex-1" ref="paperScroller" @change-scale="handleChangeScale">
        <Node
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :id="node.id"
          :node-id="node.id"
          :js-plumb-ins="jsPlumbIns"
          :position="nodePositionMap[node.id]"
          :schema="nodeSchemaMap[node.id]"
          :parentSchema="nodeSchemaMap[node.parentId]"
          :getInputs="getInputs"
          :getOutputs="getOutputs"
          :tableOptions="tableOptions"
          :isMainTable="checkMainTable(node.id)"
          @change-parent="handleChangeParent"
          @change-path="handleChangePath"
        ></Node>
        <TargetNode
          :id="targetNode.id"
          :node="targetNode"
          :js-plumb-ins="jsPlumbIns"
          :schema="nodeSchemaMap[targetNode.id]"
          :position="nodePositionMap[targetNode.id]"
        ></TargetNode>
      </PaperScroller>
    </div>
  </el-drawer>
</template>

<script>
import dagre from 'dagre'
import { mapActions, mapGetters } from 'vuex'
import { IconButton, VDivider, VIcon } from '@tap/component'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import PaperScroller from '../PaperScroller'
import Node from './Node'
import TargetNode from './TargetNode'
import { config, jsPlumb } from '../../instance'
import tree from 'element-ui/packages/tree'

export default {
  name: 'MaterializedView',

  props: {
    visible: Boolean
  },

  components: { VIcon, VDivider, PaperScroller, TargetNode, Node, IconButton },

  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)

    return {
      nodes: [],
      nodePositionMap: {},
      nodeSchemaMap: {},
      inputsMap: {},
      outputsMap: {},
      jsPlumbIns: jsPlumb.getInstance(config),
      scale: 1,
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt'
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'allNodes',
      'allEdges',
      'activeType',
      'activeNode',
      'isActionActive',
      'nodeById',
      'stateIsDirty',
      'stateIsReadonly',
      'processorNodeTypes',
      'hasNodeError'
    ]),

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
    }
  },

  watch: {
    async visible(val) {
      if (!val) {
        this.resetView()
        return
      }
      this.initView()
      this.transformToDag()
      await this.loadSchema()
      this.handleAutoLayout()
    }
  },

  // mounted() {
  //   const { jsPlumbIns } = this
  //   jsPlumbIns.setContainer('#node-view')
  // },

  methods: {
    ...mapActions('dataflow', ['updateDag']),

    handleUpdateVisible(val) {
      this.$emit('update:visible', val)
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
      const { mergeProperties } = this.activeNode
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

          // 递归
          if (item.children?.length) {
            traverse(item.children, item.id)
          }
        }
      }

      traverse(mergeProperties, this.targetNode?.id)

      this.$set(this.nodePositionMap, this.targetNode?.id, [0, 0]) // 初始化坐标
      this.nodes = nodes
      this.inputsMap = inputsMap
      this.outputsMap = outputsMap
      this.targetPathMap = targetPathMap

      await this.$nextTick()

      edges.forEach(({ source, target }) => {
        this.jsPlumbIns.connect({ uuids: [`${source}_source`, `${target}_target`] })
      })
      console.log('transformToDag', nodes, edges)
    },

    /**
     * 自动布局
     */
    handleAutoLayout() {
      const nodes = this.viewNodes

      if (nodes.length < 2) return

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
        this.$refs.paperScroller.autoResizePaper()
        this.$refs.paperScroller.centerContent(false, 24)
      })
    },

    initView() {
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
    },

    resetView() {
      this.jsPlumbIns.reset()
    },

    loadSchema() {
      return Promise.all(this.viewNodes.map(node => this.loadNodeSchema(node.id)))
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
      const { fields = [], indices = [] } = schema

      let columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})

      this.$set(
        this.nodeSchemaMap,
        nodeId,
        fields
          .sort((a, b) => a.columnPosition - b.columnPosition)
          .map(item => {
            item.dataType = item.data_type.replace(/\(.+\)/, '')
            item.indicesUnique = !!columnsMap[item.field_name]
            item.isPrimaryKey = item.primary_key_position > 0
            return item
          })
      )
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

    checkMainTable(nodeId) {
      console.log('checkMainTable', this.targetNode && this.outputsMap?.[nodeId]?.[0] === this.targetNode.id)
      return this.targetNode && this.outputsMap?.[nodeId]?.[0] === this.targetNode.id
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
      this.updateDag({ vm: this })

      if (!node.targetPath) {
        this.updateSourceTarget(node.id, oldParentId, parentId)
      }
    },

    handleChangePath(node, path) {
      const arr = path.split('.')
      const outputs = this.outputsMap[node.id]
      let { parentId } = node

      if (arr.length > 1) {
        const parentPath = arr.slice(0, arr.length - 1).join('.')
        const parentNode = this.nodes.find(node => node.targetPath === parentPath)
        parentId = parentNode?.id || parentId
      }

      if (parentId !== outputs[0]) {
        this.updateSourceTarget(node.id, outputs[0], parentId)
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
        newTargetInputs = this.inputsMap[newTarget] = []
      }

      ~inputIndex && inputs.splice(inputIndex, 1)
      ~outputIndex && outputs.splice(outputIndex, 1)
      outputs.push(newTarget)
      newTargetInputs.push(source)
      this.jsPlumbIns.deleteConnection(connectionIns)
      this.jsPlumbIns.connect({ uuids: [source + '_source', newTarget + '_target'] })
      this.handleAutoLayout()
    }
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
