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
      try {
        const result = await lineageApi.findByTable(this.connectionId, this.tableName)
        dag = result.dag || {}
      } catch (e) {
        dag = {
          edges: [
            {
              name: 'mysql-mongo migrate',
              attrs: {
                tasks: {
                  '646cbb0a8ac72931568beb58': {
                    id: '646cbb0a8ac72931568beb58',
                    name: 'mysql-mongo migrate',
                    taskNode: {
                      id: '03d98eb3-5b83-4009-8ce8-4dbed63c4bae',
                      name: 'S local mysql INSURANCE',
                      type: 'database',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'migrate',
                    status: 'stop'
                  },

                  '646cbb0a8ac72931568beb58COPY': {
                    id: '646cbb0a8ac72931568beb58',
                    name: 'mysql-mongo migrate__COPY',
                    taskNode: {
                      id: '03d98eb3-5b83-4009-8ce8-4dbed63c4bae',
                      name: 'S local mysql INSURANCE__COPY',
                      type: 'database',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'migrate',
                    status: 'stop'
                  }
                }
              },
              source: '645ddfceaf6c2557f6a0a319_CAR_CLAIM',
              target: '64589ddf1146c232392a7faf_CAR_CLAIM1'
            },
            {
              name: 'CAR_CLAIM_MERGE',
              attrs: {
                tasks: {
                  '646cbb418ac72931568bed0a': {
                    id: '646cbb418ac72931568bed0a',
                    name: 'CAR_CLAIM_MERGE',
                    taskNode: {
                      id: '610ac4c4-8af9-49c7-af05-bf611a94e3e0',
                      name: 'CAR_POLICY1',
                      type: 'table',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'sync',
                    status: 'stop'
                  }
                }
              },
              source: '64589ddf1146c232392a7faf_CAR_POLICY1',
              target: '64589ddf1146c232392a7faf_CAR_CLAIM_MERGE'
            },
            {
              name: 'CAR_CLAIM_MERGE',
              attrs: {
                tasks: {
                  '646cbb418ac72931568bed0a': {
                    id: '646cbb418ac72931568bed0a',
                    name: 'CAR_CLAIM_MERGE',
                    taskNode: {
                      id: 'fd99479c-9e1c-4f13-b211-94255f3daec0',
                      name: 'CAR_CLAIM1',
                      type: 'table',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'sync',
                    status: 'stop'
                  }
                }
              },
              source: '64589ddf1146c232392a7faf_CAR_CLAIM1',
              target: '64589ddf1146c232392a7faf_CAR_CLAIM_MERGE'
            },
            {
              name: 'CAR_CLAIM_MERGE',
              attrs: {
                tasks: {
                  '646cbb418ac72931568bed0a': {
                    id: '646cbb418ac72931568bed0a',
                    name: 'CAR_CLAIM_MERGE',
                    taskNode: {
                      id: 'e7751819-ccdf-4a3b-91db-737273324a2f',
                      name: 'CUSTOMER1',
                      type: 'table',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'sync',
                    status: 'stop'
                  }
                }
              },
              source: '64589ddf1146c232392a7faf_CUSTOMER1',
              target: '64589ddf1146c232392a7faf_CAR_CLAIM_MERGE'
            },
            {
              name: 'mysql-mongo migrate',
              attrs: {
                tasks: {
                  '646cbb0a8ac72931568beb58': {
                    id: '646cbb0a8ac72931568beb58',
                    name: 'mysql-mongo migrate',
                    taskNode: {
                      id: '03d98eb3-5b83-4009-8ce8-4dbed63c4bae',
                      name: 'S local mysql INSURANCE',
                      type: 'database',
                      catalog: 'data',
                      taskNodePos: 'source',
                      dataNode: true,
                      transformed: false,
                      logCollectorNode: false
                    },
                    syncType: 'migrate',
                    status: 'stop'
                  }
                }
              },
              source: '645ddfceaf6c2557f6a0a319_CAR_POLICY',
              target: '64589ddf1146c232392a7faf_CAR_POLICY1'
            }
          ],
          nodes: [
            {
              datasource: '64589ddf1146c232392a7faf',
              table: 'CAR_CLAIM_MERGE',
              modules: {
                '646db91544b48902dfdbf99b': {
                  datasource: '64589ddf1146c232392a7faf',
                  table: 'CAR_CLAIM_MERGE',
                  basePath: 't0fa103221e',
                  status: 'active',
                  appName: 'car claim merge app',
                  id: '646db91544b48902dfdbf99b',
                  attrKey: 'modules',
                  name: 'car claim merge'
                }
              },
              type: 'apiserverLineage',
              catalog: 'data',
              isTransformed: false,
              id: '645ddfceaf6c2557f6a0a319_CAR_POLICY',
              elementType: 'Node'
            },
            {
              table: 'CAR_CLAIM_MERGE',
              connectionId: '64589ddf1146c232392a7faf',
              connectionName: 'T local mongo',
              pdkHash: '4335aaa005ec1a74a4e2166bded2962e939ad50239f48b023b884f35b54129a5',
              tasks: {
                '646cbb418ac72931568bed0a': {
                  id: '646cbb418ac72931568bed0a',
                  name: 'CAR_CLAIM_MERGE',
                  taskNode: {
                    taskNodePos: 'target',
                    type: 'table',
                    catalog: 'data',
                    isTransformed: false,
                    id: '8b64a24e-b7f0-4b78-8dfb-0343b9e30e47',
                    name: 'CAR_CLAIM_MERGE',
                    elementType: 'Node'
                  },
                  syncType: 'sync',
                  status: 'stop'
                }
              },
              type: 'tableLineage',
              catalog: 'data',
              isTransformed: false,
              id: '64589ddf1146c232392a7faf_CAR_CLAIM_MERGE',
              elementType: 'Node'
            },
            {
              table: 'CUSTOMER1',
              connectionId: '64589ddf1146c232392a7faf',
              connectionName: 'T local mongo',
              pdkHash: '4335aaa005ec1a74a4e2166bded2962e939ad50239f48b023b884f35b54129a5',
              tasks: {
                '646cbb418ac72931568bed0a': {
                  id: '646cbb418ac72931568bed0a',
                  name: 'CAR_CLAIM_MERGE',
                  taskNode: {
                    taskNodePos: 'source',
                    type: 'table',
                    catalog: 'data',
                    isTransformed: false,
                    id: 'e7751819-ccdf-4a3b-91db-737273324a2f',
                    name: 'CUSTOMER1',
                    elementType: 'Node'
                  },
                  syncType: 'sync',
                  status: 'stop'
                }
              },
              type: 'tableLineage',
              catalog: 'data',
              isTransformed: false,
              id: '64589ddf1146c232392a7faf_CUSTOMER1',
              elementType: 'Node'
            },
            {
              table: 'CAR_POLICY1',
              connectionId: '64589ddf1146c232392a7faf',
              connectionName: 'T local mongo',
              pdkHash: '4335aaa005ec1a74a4e2166bded2962e939ad50239f48b023b884f35b54129a5',
              tasks: {
                '646cbb0a8ac72931568beb58': {
                  id: '646cbb0a8ac72931568beb58',
                  name: 'mysql-mongo migrate',
                  taskNode: {
                    taskNodePos: 'target',
                    type: 'database',
                    catalog: 'data',
                    isTransformed: false,
                    id: 'd2e0284d-1d7d-4418-b07c-a900bfdcd963',
                    name: 'T local mongo',
                    elementType: 'Node'
                  },
                  syncType: 'migrate',
                  status: 'stop'
                },
                '646cbb418ac72931568bed0a': {
                  id: '646cbb418ac72931568bed0a',
                  name: 'CAR_CLAIM_MERGE',
                  taskNode: {
                    taskNodePos: 'source',
                    type: 'table',
                    catalog: 'data',
                    isTransformed: false,
                    id: '610ac4c4-8af9-49c7-af05-bf611a94e3e0',
                    name: 'CAR_POLICY1',
                    elementType: 'Node'
                  },
                  syncType: 'sync',
                  status: 'stop'
                }
              },
              type: 'tableLineage',
              catalog: 'data',
              isTransformed: false,
              id: '64589ddf1146c232392a7faf_CAR_POLICY1',
              elementType: 'Node'
            },
            {
              table: this.tableName,
              connectionId: this.connectionId,
              connectionName: 'T local mongo',
              pdkHash: '4335aaa005ec1a74a4e2166bded2962e939ad50239f48b023b884f35b54129a5',
              tasks: {
                '646cbb0a8ac72931568beb58': {
                  id: '646cbb0a8ac72931568beb58',
                  name: 'mysql-mongo migrate',
                  taskNode: {
                    taskNodePos: 'target',
                    type: 'database',
                    catalog: 'data',
                    isTransformed: false,
                    id: 'd2e0284d-1d7d-4418-b07c-a900bfdcd963',
                    name: 'T local mongo',
                    elementType: 'Node'
                  },
                  syncType: 'migrate',
                  status: 'stop'
                },
                '646cbb418ac72931568bed0a': {
                  id: '646cbb418ac72931568bed0a',
                  name: 'CAR_CLAIM_MERGE',
                  taskNode: {
                    taskNodePos: 'source',
                    type: 'table',
                    catalog: 'data',
                    isTransformed: false,
                    id: 'fd99479c-9e1c-4f13-b211-94255f3daec0',
                    name: 'CAR_CLAIM1',
                    elementType: 'Node'
                  },
                  syncType: 'sync',
                  status: 'stop'
                }
              },
              type: 'tableLineage',
              catalog: 'data',
              isTransformed: false,
              id: '64589ddf1146c232392a7faf_CAR_CLAIM1',
              elementType: 'Node'
            },
            {
              table: 'CAR_CLAIM',
              connectionId: '645ddfceaf6c2557f6a0a319',
              connectionName: 'S local mysql INSURANCE',
              pdkHash: 'a5af410b12afca476edf4a650c133ddf135bf76542a67787ed6f7f7d53ba712',
              tasks: {
                '646cbb0a8ac72931568beb58': {
                  id: '646cbb0a8ac72931568beb58',
                  name: 'mysql-mongo migrate',
                  taskNode: {
                    taskNodePos: 'source',
                    type: 'database',
                    catalog: 'data',
                    isTransformed: false,
                    id: '03d98eb3-5b83-4009-8ce8-4dbed63c4bae',
                    name: 'S local mysql INSURANCE',
                    elementType: 'Node'
                  },
                  syncType: 'migrate',
                  status: 'stop'
                }
              },
              type: 'tableLineage',
              catalog: 'data',
              isTransformed: false,
              id: '645ddfceaf6c2557f6a0a319_CAR_CLAIM',
              elementType: 'Node'
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
                  const div = document.createElement('div')
                  div.title = tasks[0].name
                  div.classList.add('table-lineage-connection-label')
                  div.innerHTML =
                    size > 1
                      ? `<div class="flex align-center compact-tag">
                    <span class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">${
                      tasks[0].name
                    }</span>
                    <span data-more="true" class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">+ ${
                      size - 1
                    }</span>
                    </div>`
                      : `<span class="clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">${tasks[0].name}</span>`
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
      this.$refs.paperScroller.centerContent()
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
  }
}
</style>
