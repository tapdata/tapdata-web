<template>
  <div class="table-lineage h-100 position-relative">
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
      }
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

    async showNodePopover(type, data, el) {
      const connectionData = this.allEdges.find(edge => {
        return edge.source === data.source && edge.target === data.target
      })
      this.nodeMenu.tasks = Object.values(connectionData.attrs.tasks)
      this.nodeMenu.show = false
      this.nodeMenu.reference = null
      await this.$nextTick()
      this.nodeMenu.reference = el
      this.nodeMenu.type = type
      this.nodeMenu.data = data
      await this.$nextTick()
      this.nodeMenu.show = true
      this.nodeMenu.typeId = data.id
    },

    async loadLineage() {
      let dag
      try {
        const result = await lineageApi.findByTable(this.connectionId, this.tableName)
        dag = result.dag || {}
      } catch (e) {
        dag = {
          edges: [
            {
              source: '27f5add1-bbf0-48a8-8954-88c8dd69a14b',
              target: 'e28e41ef-13c3-4b58-a083-29e196b538a0',
              attrs: {
                tasks: {
                  '646cbb0a8ac72931568beb58': {
                    id: '646cbb0a8ac72931568beb58',
                    name: 'mysql-mongo migrate',
                    taskNode: {
                      type: 'database',
                      catalog: 'data',
                      isTransformed: false,
                      id: '03d98eb3-5b83-4009-8ce8-4dbed63c4bae',
                      name: 'S local mysql INSURANCE',
                      elementType: 'Node'
                    }
                  }
                }
              }
            }
          ],
          nodes: [
            {
              table: '3877_LILY_CLAIM',
              connectionName: 'AUTO_MYSQL_OP',
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
                connectionType: 'source_and_target',
                accessNodeProcessId: '',
                pdkType: 'pdk',
                pdkHash: 'a5af410b12afca476edf4a650c133ddf135bf76542a67787ed6f7f7d53ba712'
              }
            },
            {
              table: 'AA_0208_test_30506',
              connectionName: 'DB2_TESTDB',
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
      this.handleAutoLayout()
    },

    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) return

      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

      dg.setGraph({ nodesep: 60, ranksep: 240, marginx: 50, marginy: 50, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        const { width = NODE_WIDTH, height = NODE_HEIGHT } =
          document.getElementById(NODE_PREFIX + n.id)?.getBoundingClientRect() || {}
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
      edges.forEach(({ source, target, attrs }) => {
        const tasks = attrs.tasks ? Object.values(attrs.tasks) : []
        let overlays

        if (tasks.length) {
          overlays = [
            [
              'Label',
              {
                cssClass:
                  'table-lineage-connection-label clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4',
                label: tasks[0].name,
                events: {
                  click: () => {
                    this.$emit('click-task', tasks[0])
                  }
                }
                // labelStyle: {
                //   font?: string
                //   color?: string
                //   fill?: string
                //   borderStyle?: string
                //   borderWidth?: number// integer
                //   padding?: number //integer
                // }
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
      this.$refs.paperScroller.centerContent()
    },

    handleZoomIn() {
      this.$refs.paperScroller.zoomIn()
    },

    handleZoomOut() {
      this.$refs.paperScroller.zoomOut()
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
      max-width: 200px;
      z-index: 1001;
    }
  }
}
</style>
