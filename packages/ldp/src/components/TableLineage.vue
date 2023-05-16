<template>
  <div class="table-lineage h-100">
    <PaperScroller ref="paperScroller">
      <TableNode
        v-for="node in allNodes"
        :data="node"
        :key="node.id"
        :node-id="node.id"
        :id="NODE_PREFIX + node.id"
        :js-plumb-ins="jsPlumbIns"
        @drag-stop="onNodeDragStop"
      ></TableNode>
    </PaperScroller>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import dagre from 'dagre'

import { config, PaperScroller, jsPlumb, NODE_PREFIX, NODE_WIDTH, NODE_HEIGHT } from '@tap/dag'
import { lineageApi } from '@tap/api'
import TableNode from './TableNode'
import { connectorActiveStyle } from '@tap/dag/src/style'
import i18n from '@tap/i18n'
import { AddConnectionCommand, MoveNodeCommand, RemoveConnectionCommand } from '@tap/dag/src/command'
import Vue from 'vue'
export default {
  name: 'TableLineage',

  props: {
    connectionId: String,
    tableName: String,
    isShow: Boolean
  },

  components: { PaperScroller, TableNode },

  data() {
    return {
      NODE_PREFIX,
      jsPlumbIns: jsPlumb.getInstance(config)
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
          this.reset()
          this.initNodeView()
          this.loadLineage()
        }
      }
    )
    // this.initNodeView()
    // this.loadLineage()
  },

  destroyed() {
    this.unwatch?.()
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

        info.connection.bind('click', () => {
          if (this.stateIsReadonly) return
          this.handleDeselectAllConnections()
          info.connection.showOverlay('removeConn')
          info.connection.showOverlay('addNodeOnConn')
          info.connection.addClass('connection-selected')
          this.selectConnection(connection)
        })
      })
    },

    async loadLineage() {
      let dag
      try {
        dag = await lineageApi.findByTable(this.connectionId, this.tableName)
      } catch (e) {
        dag = {
          edges: [
            {
              source: '27f5add1-bbf0-48a8-8954-88c8dd69a14b',
              target: 'e28e41ef-13c3-4b58-a083-29e196b538a0'
            }
          ],
          nodes: [
            {
              tableName: '3877_LILY_CLAIM',
              isFilter: false,
              increaseReadSize: 500,
              maxTransactionDuration: 12,
              existDataProcessMode: 'keepData',
              xmlIncludeFile: false,
              esFragmentNum: 3,
              cdcPollingInterval: 0,
              cdcPollingBatchSize: 0,
              enableCustomCommand: false,
              connectionId: '6448979341682d0fb19db48f',
              databaseType: 'Mysql',
              readBatchSize: 500,
              writeStrategy: 'updateOrInsert',
              type: 'table',
              catalog: 'data',
              isTransformed: false,
              id: '27f5add1-bbf0-48a8-8954-88c8dd69a14b',
              name: '3877_LILY_CLAIM',
              elementType: 'Node',
              attrs: {
                position: [-84, 388.5],
                connectionName: 'AUTO_MYSQL_OP',
                connectionType: 'source_and_target',
                accessNodeProcessId: '',
                pdkType: 'pdk',
                pdkHash: 'a5af410b12afca476edf4a650c133ddf135bf76542a67787ed6f7f7d53ba712'
              }
            },
            {
              tableName: 'AA_0208_test_30506',
              isFilter: false,
              increaseReadSize: 500,
              maxTransactionDuration: 12,
              existDataProcessMode: 'keepData',
              xmlIncludeFile: false,
              esFragmentNum: 3,
              cdcPollingInterval: 0,
              cdcPollingBatchSize: 0,
              enableCustomCommand: false,
              connectionId: '63d5f6136ac9b97f716611b2',
              databaseType: 'DB2',
              readBatchSize: 500,
              writeStrategy: 'updateOrInsert',
              type: 'table',
              catalog: 'data',
              isTransformed: false,
              id: 'e28e41ef-13c3-4b58-a083-29e196b538a0',
              name: 'AA_0208_test_30506',
              elementType: 'Node',
              attrs: {
                position: [351, 472.5],
                connectionName: 'DB2_TESTDB',
                connectionType: 'source_and_target',
                accessNodeProcessId: '',
                pdkType: 'pdk',
                pdkHash: 'fa04a47253db3b86af1baf020d829fd7d9c012564b7d5d7388cd6a97cf51d40f'
              }
            }
          ]
        }
      }
      this.setEdges(dag.edges)
      await this.$nextTick()
      await this.addNodes(dag)
      await this.$nextTick()

      this.$refs.paperScroller.initVisibleArea(true)
      this.handleAutoLayout()
    },

    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) return

      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

      dg.setGraph({ nodesep: 60, ranksep: 120, marginx: 50, marginy: 50, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        dg.setNode(NODE_PREFIX + n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
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
        this.$refs.paperScroller.centerContent()
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

        this.addNode(node)
      })

      await this.$nextTick()

      // 连线
      edges.forEach(({ source, target }) => {
        this.jsPlumbIns.connect({ uuids: [`${NODE_PREFIX}${source}_source`, `${NODE_PREFIX}${target}_target`] })
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
    }
  }
}
</script>

<style scoped lang="scss"></style>
