<template>
  <div
    class="table-lineage h-100 position-relative"
    v-loading="loading"
    :element-loading-text="`${$t('packages_business_loading')}...\n${$t('packages_ldp_lineage_loading_tips')}`"
  >
    <PaperScroller ref="paperScroller">
      <TableNode
        v-for="node in allNodes"
        :data="node"
        :key="node.id"
        :node-id="node.id"
        :id="NODE_PREFIX + node.id"
        :js-plumb-ins="jsPlumbIns"
        :class="{
          active: node.table === tableName && node.connectionId === connectionId
        }"
        @dblclick.native="handleNodeDblClick(node)"
        @drag-stop="onNodeDragStop"
      ></TableNode>
    </PaperScroller>

    <div class="paper-toolbar position-absolute flex gap-1 bg-white p-1 rounded-lg shadow-sm">
      <IconButton clickAndRotate @click="handleRefresh">refresh</IconButton>
      <IconButton @click="handleCenterContent">compress</IconButton>
      <IconButton @click="handleZoomOut">remove-outline</IconButton>
      <IconButton @click="handleZoomIn">add-outline</IconButton>
    </div>

    <LinePopover :popover="nodeMenu" @click-task="$emit('click-task', $event)"></LinePopover>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import dagre from 'dagre'

import { config, PaperScroller, jsPlumb, NODE_PREFIX, NODE_WIDTH, NODE_HEIGHT } from '@tap/dag'
import { lineageApi } from '@tap/api'
import { IconButton } from '@tap/component'
import TableNode from './TableNode'
import { connectorActiveStyle } from '@tap/dag/src/style'
import i18n from '@tap/i18n'
import { AddConnectionCommand, MoveNodeCommand, RemoveConnectionCommand } from '@tap/dag/src/command'
import Vue from 'vue'
import LinePopover from './LinePopover'
export default {
  name: 'TableLineage',

  props: {
    connectionId: String,
    tableName: String,
    isShow: Boolean
  },

  components: { PaperScroller, TableNode, IconButton, LinePopover },

  data() {
    return {
      NODE_PREFIX,
      jsPlumbIns: jsPlumb.getInstance(config),
      nodeMenu: {
        show: false,
        type: '',
        typeId: '',
        reference: null,
        data: null,
        connectionData: {},
        tasks: []
      },
      loading: false
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes', 'allEdges', 'nodeById'])
  },

  watch: {},

  mounted() {
    this.unwatch = this.$watch(
      () => [this.connectionId, this.tableName, this.isShow],
      () => {
        if (this.isShow) {
          this.initView()
        }
      }
    )
    // this.initNodeView()
    // this.loadLineage()
  },

  destroyed() {
    this.unwatch?.()
    this.jsPlumbIns?.destroy()
    this.resetState()
  },

  methods: {
    ...mapMutations('dataflow', [
      'setStateDirty',
      'setStateReadonly',
      'setEdges',
      'setTaskId',
      'setTaskInfo',
      'addResourceIns',
      'updateNodeProperties',
      'setActiveNode',
      'setActiveConnection',
      'resetSelectedNodes',
      'addSelectedNode',
      'addConnection',
      'removeConnection',
      'removeNode',
      'removeNodeFromSelection',
      'removeAllNodes',
      'reset',
      'addNode',
      'setActiveType',
      'setFormSchema',
      'setTransformStatus',
      'setTransformLoading',
      'setEditVersion',
      'copyNodes',
      'pasteNodes',
      'setNodeError',
      'setNodeErrorMsg',
      'clearNodeError',
      'resetState',
      'selectConnection',
      'deselectAllConnections',
      'setCanBeConnectedNodeIds',
      'setValidateLanguage',
      'addProcessorNode',
      'toggleConsole',
      'setPdkPropertiesMap',
      'setPdkSchemaFreeMap'
    ]),

    initView() {
      this.reset()
      this.$refs.paperScroller.initVisibleArea(true)
      this.initNodeView()
      this.loadLineage()
    },

    getRealId(str) {
      return str.replace(new RegExp(`^${NODE_PREFIX}`), '')
    },

    initNodeView() {
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
      jsPlumbIns.registerConnectionType('active', connectorActiveStyle)

      jsPlumbIns.bind('connection', (info, event) => {
        const { sourceId, targetId } = info
        const source = this.getRealId(sourceId)
        const target = this.getRealId(targetId)
        const connection = { source, target }
        const connectionIns = info.connection

        /*info.connection.bind('click', async () => {
          const rect = info.connection.canvas.getBoundingClientRect()
          this.nodeMenu.connectionCenterPos = [rect.x + rect.width / 2, rect.y + rect.height / 2]
          await this.showNodePopover('connection', connection, info.connection.canvas)
        })*/

        /*info.connection.bind('mouseover', async () => {
          const rect = info.connection.canvas.getBoundingClientRect()
          this.nodeMenu.connectionCenterPos = [rect.x + rect.width / 2, rect.y + rect.height / 2]
          await this.showNodePopover('connection', connection, info.connection.canvas)
        })

        info.connection.bind('mouseout', async () => {
          console.log('mouseout') // eslint-disable-line
          this.nodeMenu.show = false
        })*/
      })
    },

    async showNodePopover(el, tasks) {
      this.nodeMenu.tasks = tasks
      this.nodeMenu.show = false
      this.nodeMenu.reference = null
      await this.$nextTick()
      this.nodeMenu.reference = el
      await this.$nextTick()
      this.nodeMenu.show = true
    },

    async loadLineage() {
      let dag
      this.loading = true
      try {
        const result = await lineageApi.findByTable(this.connectionId, this.tableName)
        dag = result.dag || {}
        this.setEdges(dag.edges)
        // await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.handleAutoLayout()
      } catch (e) {
        console.log(e) // eslint-disable-line
      }
      this.loading = false
    },

    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) {
        this.$refs.paperScroller.centerContent(false, 24)
        return
      }

      const scale = this.$refs.paperScroller.getPaperScale()
      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()

      dg.setGraph({ nodesep: 220, ranksep: 220, marginx: 0, marginy: 0, rankdir: 'LR' /*, ranker: 'tight-tree' */ })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        let { width = NODE_WIDTH, height = NODE_HEIGHT } =
          document.getElementById(NODE_PREFIX + n.id)?.getBoundingClientRect() || {}
        width /= scale
        height /= scale
        dg.setNode(NODE_PREFIX + n.id, { width, height })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
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

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          this.updateNodeProperties({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top]
              }
            }
          })
        }
      })

      Vue.nextTick(() => {
        this.jsPlumbIns.setSuspendDrawing(false, true)
        this.$refs.paperScroller.autoResizePaper()
        this.$refs.paperScroller.centerContent(false, 24)
      })
    },

    async addNodes({ nodes, edges }) {
      if (!nodes?.length) return
      const outputsMap = {}
      const inputsMap = {}

      edges.forEach(({ source, target }) => {
        let _source = outputsMap[source]
        let _target = inputsMap[target]

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

      nodes.forEach(node => {
        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []

        // 数据兼容
        const defaultAttrs = {
          position: [0, 0]
        }

        if (!node.attrs) node.attrs = defaultAttrs
        else if (!node.attrs.position) Object.assign(node.attrs, defaultAttrs)

        if (node.type === 'apiserverLineage') {
          node.module = Object.values(node.modules)[0]
        }

        this.addNode(node)
      })

      await this.$nextTick()

      // 连线
      edges.forEach(({ source, target, attrs }) => {
        const tasks = attrs.tasks ? Object.values(attrs.tasks) : []
        let overlays

        if (tasks.length) {
          overlays = [
            [
              'Custom',
              {
                create() {
                  const size = tasks.length
                  const taskName = tasks[0].name
                  const div = document.createElement('div')
                  div.classList.add('table-lineage-connection-label', 'flex', 'overflow-hidden')
                  div.innerHTML =
                    size > 1
                      ? `<div class="flex align-center compact-tag overflow-hidden">
                    <span title="${taskName}" class="overflow-hidden clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">${taskName}</span>
                    <span data-more="true" class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4 flex-shrink-0">+ ${
                      size - 1
                    }</span>
                    </div>`
                      : `<span title="${taskName}" class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">${taskName}</span>`
                  return div
                },
                events: {
                  click: (overlay, ev) => {
                    if (tasks.length > 1 && ev.target.dataset.more) {
                      this.showNodePopover(ev.target, tasks.slice(1))
                      return
                    }
                    this.$emit('click-task', tasks[0])
                  }
                }
              }
            ]
          ]
        }

        this.jsPlumbIns.connect({
          uuids: [`${NODE_PREFIX}${source}_source`, `${NODE_PREFIX}${target}_target`],
          overlays
        })
      })
    },

    reset() {
      this.jsPlumbIns.reset()
      this.resetState()
      this.setStateReadonly(true)
    },

    onNodeDragStop(isNotMove, oldProperties, newProperties) {
      this.$refs.paperScroller.autoResizePaper()
      !isNotMove &&
        newProperties.forEach(prop => {
          this.updateNodeProperties(prop)
        })
    },

    handleRefresh() {
      this.initView()
    },

    handleCenterContent() {
      this.$refs.paperScroller.centerContent(false, 24)
    },

    handleZoomIn() {
      this.$refs.paperScroller.zoomIn()
    },

    handleZoomOut() {
      this.$refs.paperScroller.zoomOut()
    },

    handleNodeDblClick(node) {
      if (node.type === 'apiserverLineage') return
      if (!node.metadata.id) return

      console.log('handleNodeDblClick', node) // eslint-disable-line
      const table = {
        ...node,
        id: node.metadata.id,
        name: node.table,
        LDP_TYPE: 'table',
        isObject: true
      }
      const connection = {
        id: node.connectionId,
        name: node.connectionName,
        pdkHash: node.pdkHash
      }

      this.$emit('node-dblclick', table, null, true)
    }
  }
}
</script>

<style scoped lang="scss">
.paper-toolbar {
  right: 16px;
  top: 16px;
}
.table-lineage {
  ::v-deep {
    .table-lineage-connection-label {
      max-width: 180px;
      z-index: 1001;
      .compact-tag {
        .el-tag:first-child {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        .el-tag:last-child {
          margin-left: -1px;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
        }
      }
    }

    .el-loading-text {
      white-space: pre-wrap;
    }
  }
}
</style>
