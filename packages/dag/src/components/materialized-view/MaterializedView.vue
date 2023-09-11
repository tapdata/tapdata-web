<template>
  <el-drawer :visible="visible" size="calc(100% - 260px)" :with-header="false" @update:visible="handleUpdateVisible">
    <div class="h-100 flex flex-column">
      <header class="px-4 h-48 flex align-center">
        <div class="fs-6 font-color-dark">构建物化视图</div>
      </header>
      <PaperScroller v-if="showPaper" class="flex-1" ref="paperScroller">
        <Node
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :id="node.id"
          :node-id="node.id"
          :js-plumb-ins="jsPlumbIns"
          :position="nodePositionMap[node.id]"
        ></Node>
        <TargetNode
          :id="targetNode.id"
          :node="targetNode"
          :js-plumb-ins="jsPlumbIns"
          :position="nodePositionMap[targetNode.id]"
        ></TargetNode>
      </PaperScroller>
    </div>
  </el-drawer>
</template>

<script>
import dagre from 'dagre'
import { mapGetters } from 'vuex'
import PaperScroller from '../PaperScroller'
import Node from './Node'
import TargetNode from './TargetNode'
import { config, jsPlumb } from '../../instance'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH } from '../../constants'
import { connectorActiveStyle } from '../../style'

export default {
  name: 'MaterializedView',

  props: {
    visible: Boolean
  },

  components: { PaperScroller, TargetNode, Node },

  data() {
    return {
      nodes: [],
      nodePositionMap: {},
      jsPlumbIns: jsPlumb.getInstance(config)
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

    showPaper() {
      return this.visible && this.activeNode?.type === 'merge_table_processor'
    },

    targetNode() {
      const { $outputs } = this.activeNode

      if (!$outputs.length) return

      return this.nodeById($outputs[0])
    }
  },

  watch: {
    visible(val) {
      if (!val) return
      this.transformToDag()
      setTimeout(() => {
        this.handleAutoLayout()
      }, 1000)
    }
  },

  mounted() {
    const { jsPlumbIns } = this
    jsPlumbIns.setContainer('#node-view')
  },

  methods: {
    handleUpdateVisible(val) {
      this.$emit('update:visible', val)
    },

    async transformToDag() {
      const { mergeProperties } = this.activeNode
      const nodes = []
      const edges = []
      const traverse = (children, target) => {
        for (const item of children) {
          nodes.push(this.nodeById(item.id))
          this.$set(this.nodePositionMap, item.id, [0, 0]) // 初始化坐标
          target && edges.push({ source: item.id, target })

          if (item.children?.length) {
            traverse(item.children, item.id)
          }
        }
      }

      traverse(mergeProperties, this.targetNode?.id)

      this.$set(this.nodePositionMap, this.targetNode?.id, [0, 0]) // 初始化坐标

      this.nodes = nodes

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
      const nodes = [...this.nodes, this.targetNode]

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
    }
  }
}
</script>

<style scoped lang="scss">
.h-48 {
  height: 48px;
}
</style>
