<template>
  <el-drawer :visible="visible" size="100%" :with-header="false" @update:visible="handleUpdateVisible">
    <div class="h-100 flex flex-column">
      <header class="px-4 h-48 flex align-center">
        <IconButton @click="handleUpdateVisible(false)">close</IconButton>
        <div class="fs-6 font-color-dark ml-1">构建物化视图</div>
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
import { mapGetters } from 'vuex'
import { IconButton } from '@tap/component'
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

  components: { PaperScroller, TargetNode, Node, IconButton },

  data() {
    return {
      nodes: [],
      nodePositionMap: {},
      nodeSchemaMap: {},
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
    },

    viewNodes() {
      return this.nodes.concat(this.targetNode ? [this.targetNode] : [])
    }
  },

  watch: {
    visible(val) {
      if (!val) {
        this.resetView()
        return
      }
      this.initView()
      this.transformToDag()
      this.loadSchema()
      setTimeout(() => {
        this.handleAutoLayout()
      }, 1000)
    }
  },

  // mounted() {
  //   const { jsPlumbIns } = this
  //   jsPlumbIns.setContainer('#node-view')
  // },

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

    createTree(data, columnsMap) {
      const root = { children: [] }

      for (const item of data) {
        if (item.is_deleted) continue

        const { field_name } = item
        let parent = root
        const fields = field_name.split('.')
        item.dataType = item.data_type.replace(/\(.+\)/, '')
        item.indicesUnique = !!columnsMap[field_name]

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find(c => c.field_name === field)

          if (!child) {
            child = { field_name: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              field_name: field
            })
          }
        }
      }

      return root.children
    },

    loadSchema() {
      Promise.all(this.viewNodes.map(node => this.loadNodeSchema(node.id)))
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

      const treeData = this.createTree(
        fields.sort((a, b) => a.columnPosition - b.columnPosition),
        columnsMap
      )

      this.$set(
        this.nodeSchemaMap,
        nodeId,
        fields
          .sort((a, b) => a.columnPosition - b.columnPosition)
          .map(item => {
            item.dataType = item.data_type.replace(/\(.+\)/, '')
            item.indicesUnique = !!columnsMap[item.field_name]
            return item
          })
      )
      console.log(this.nodeSchemaMap)
    },

    handleChangeScale(scale) {
      this.scale = scale
      this.jsPlumbIns.setZoom(scale)
    }
  }
}
</script>

<style scoped lang="scss">
.h-48 {
  height: 48px;
}
</style>
