<template>
  <section class="layout-wrap vh-100">
    <TopHeader
      is-monitor
      :status="status"
      :status-bt-map="statusBtMap"
      :creat-user-id="creatUserId"
      @showSettings="handleShowSettings"
    ></TopHeader>

    <section class="layout-wrap layout-has-sider">
      <!--内容体-->
      <main class="layout-content flex flex-column">
        <section class="flex-fill" @wheel="wheelScroll">
          <div id="node-view-background" class="node-view-background" :style="backgroundStyle"></div>
          <div id="node-view" class="node-view" :style="dataflowStyle">
            <DFNode
              v-for="n in nodes"
              :key="n.id"
              :node-id="n.id"
              :id="NODE_PREFIX + n.id"
              :js-plumb-ins="jsPlumbIns"
              @nodeSelected="nodeSelectedById"
              @deselectAllNodes="deselectAllNodes"
            ></DFNode>
          </div>
        </section>
        <section
          class="border-top"
          style="height: 320px"
          v-resize.top="{
            minWidth: 180
          }"
        >
          <ElTabs class="border-0 flex flex-column h-100" type="border-card">
            <!--任务里程碑-->
            <ElTabPane :label="$t('editor.ui.sidebar.milestone')">
              <Milestone v-if="dataflow" :milestones="milestones" :dataflow="dataflow" />
            </ElTabPane>
            <!--运行日志-->
            <ElTabPane :label="$t('editor.ui.sidebar.logs')">
              <DebugLogs :dataflowId="dataflowId" />
            </ElTabPane>
            <!--<ElTabPane :label="$t('editor.ui.sidebar.progress')">
              <TaskProgress></TaskProgress>
            </ElTabPane>-->
          </ElTabs>
        </section>
      </main>
      <!--右侧边栏-->
      <RightSidebar is-monitor>
        <ElTabs class="border-0 flex flex-column h-100 absolute-fill" type="border-card">
          <ElTabPane label="统计">
            <Statistical v-if="dataflow" :dataflow="dataflow"></Statistical>
          </ElTabPane>
          <ElTabPane v-if="activeType" label="配置">
            <FormPanel is-monitor></FormPanel>
          </ElTabPane>
        </ElTabs>
      </RightSidebar>
    </section>
  </section>
</template>

<script>
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import Statistical from '@/views/dataflow/components/Statistical'
import Milestone from '@/views/dataflow/components/Milestone'
import DebugLogs from '@/views/dataflow/components/DebugLogs'
import TopHeader from '@/views/dataflow/components/TopHeader'
import jsPlumbIns from './instance'
import DataFlows from '@/api/DataFlows'
import { DEFAULT_SETTINGS, NODE_PREFIX } from '@/views/dataflow/constants'
import { mapGetters, mapMutations } from 'vuex'
import DFNode from '@/views/dataflow/components/DFNode'
import { ctorTypes, nodeTypes } from '@/nodes/loader'
import DataFlowFormSchemas from '@/api/DataFlowFormSchemas'
import moveDataflow from './mixins/moveDataflow'
import { statusBtMap } from '@/editor/states'
import ws from '@/api/ws'
import { getDataflowCorners } from '@/views/dataflow/helpers'
import RightSidebar from '@/views/dataflow/components/RightSidebar'
import FormPanel from '@/views/dataflow/components/FormPanel'
import DatabaseTypes from '@/api/DatabaseTypes'
import { connectorActiveStyle } from '@/views/dataflow/style'

const databaseTypesApi = new DatabaseTypes()
const dataFlowsApi = new DataFlows()
const dataFlowFormSchemasApi = new DataFlowFormSchemas()
const NODE_SIZE = 160
const SIDEBAR_WIDTH = 0
const HEADER_HEIGHT = 0

export default {
  name: 'Monitor',
  components: { FormPanel, RightSidebar, DFNode, TopHeader, DebugLogs, Milestone, Statistical },

  directives: {
    resize
  },

  mixins: [moveDataflow],

  data() {
    return {
      NODE_PREFIX,
      jsPlumbIns,
      status: 'draft',
      executeMode: 'normal',
      milestones: [],
      dataflowId: this.$route.params.id,
      dataflow: null,
      statusBtMap,
      mapping: this.$route.query?.mapping,
      creatUserId: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', {
      nodes: 'allNodes',
      isActionActive: 'isActionActive',
      nodeById: 'nodeById',
      stateIsDirty: 'getStateIsDirty',
      nodeViewOffsetPosition: 'getNodeViewOffsetPosition',
      activeType: 'activeType'
    }),

    dataflowStyle() {
      const offsetPosition = this.nodeViewOffsetPosition
      return {
        left: offsetPosition[0] + 'px',
        top: offsetPosition[1] + 'px'
      }
    },

    backgroundStyle() {
      const offsetPosition = this.nodeViewOffsetPosition
      return {
        transform: `scale(${this.nodeViewScale})`,
        'background-position': `right ${-offsetPosition[0]}px bottom ${-offsetPosition[1]}px`
      }
    },

    selectBoxStyle() {
      let attr = this.selectBoxAttr
      return attr
        ? {
            left: attr.x + 'px',
            top: attr.y + 'px',
            width: attr.w + 'px',
            height: attr.h + 'px'
          }
        : null
    },

    isEditable() {
      return ['draft', 'error', 'paused'].includes(this.status)
    }
  },

  watch: {
    $route: 'initView'
  },

  mounted() {
    this.jsPlumbIns.ready(async () => {
      try {
        this.initNodeView()
        await this.initView()
      } catch (error) {
        console.error(error)
      }
    })
  },

  destroyed() {
    clearInterval(this.timer)
    this.resetWorkspace()
  },

  methods: {
    ...mapMutations('dataflow', [
      'setStateDirty',
      'setDataflowId',
      'setDataflowName',
      'setDataflowSettings',
      'setNodeTypes',
      'setCtorTypes',
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
      'addNode',
      'setActiveType',
      'setFormSchema'
    ]),

    async initView() {
      this.dataflowId = this.$route.params.id
      if (this.dataflowId) {
        await this.initNodeType()
        await this.openDataflow(this.dataflowId)
      }
    },

    initNodeView() {
      // let container = this.$refs.layoutContent
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
      jsPlumbIns.registerConnectionType('active', connectorActiveStyle)

      jsPlumbIns.bind('connection', info => {
        console.log('connectionEvent', info)
        const { sourceId: source, targetId: target } = info
        const sourceId = this.getRealId(source)
        const targetId = this.getRealId(target)

        info.connection.bind('click', conn => {
          console.log('connectionClickEvent', conn)
          // 设置按钮可见
          // info.connection.showOverlay('remove-connection')
          // 高亮连接
          info.connection.addClass('connection-selected')

          this.setActiveConnection({
            sourceId,
            targetId
          })
        })

        // 添加删除按钮，并且绑定事件，默认不可见
        info.connection.addOverlay([
          'Label',
          {
            id: 'remove-connection',
            location: 0.25,
            label: '<div class="remove-connection-btn" title="删除连接"></span>',
            cssClass: 'remove-connection-label cursor-pointer',
            visible: false,
            events: {
              mousedown: () => {
                this.__removeConnection(source, target)
              }
            }
          }
        ])

        console.log('连接状态', this.isConnected(sourceId, targetId))

        // this.setDependsOn(info.sourceId, info.targetId)
        // this.checkConnect()
        // this.checkOutputStep()
        this.addConnection({
          sourceId,
          targetId
        })

        return
      })

      // 连接线拖动结束事件
      /*jsPlumbIns.bind('connectionDragStop', (conn, event) => {
        console.log('connectionDragStopEvent', conn)
        let $node = this.$refs.layoutContent.querySelector('.df-node')
        if (!$node) return
        const pos = this.getMousePositionWithinNodeView(event)
        console.log({ ...pos }, [...this.nodeViewOffsetPosition])
        pos.x -= this.nodeViewOffsetPosition[0]
        pos.y -= this.nodeViewOffsetPosition[1]
        let sourceId = this.getRealId(conn.sourceId)
        let nw = $node.offsetWidth
        let nh = $node.offsetHeight
        let isConnected = false

        for (let n of this.nodes) {
          if (n.id !== sourceId) {
            const [x, y] = n.position
            console.log([x, y], pos)
            if (pos.x > x && pos.x < x + nw && pos.y > y && pos.y < y + nh) {
              console.log('in Node')
              if (!this.isConnected(sourceId, n.id) && !this.isParent(sourceId, n.id)) {
                jsPlumbIns.connect({
                  source: jsPlumbIns.getEndpoint(conn.sourceId + '_source'),
                  target: jsPlumbIns.getEndpoint(NODE_PREFIX + n.id + '_target')
                })
                isConnected = true
              }
              break
            }
          }
        }

        if (!isConnected && conn.targetId) {
          // 恢复连接
          jsPlumbIns.connect({
            source: jsPlumbIns.getEndpoint(conn.sourceId + '_source'),
            target: jsPlumbIns.getEndpoint(conn.targetId + '_target')
          })
          console.log('没有连接')
        }
      })*/

      // 连线移动到其他节点
      jsPlumbIns.bind('connectionMoved', info => {
        console.log('connectionMoved', info)
      })
      // 连线移动到其他节点
      jsPlumbIns.bind('connectionDetached', info => {
        console.log('connectionDetachedEvent', info)
      })

      const _instance = {
        getConnections(params) {
          console.log('_instance', params)
          if (typeof params === 'object') {
            if (params.target) params.target = NODE_PREFIX + params.target
            if (params.source) params.source = NODE_PREFIX + params.source
          }
          return jsPlumbIns.getConnections(params)
        }
      }

      jsPlumbIns.bind('beforeDrop', info => {
        console.log('beforeDrop', info)
        const { sourceId, targetId } = info

        const source = this.nodeById(this.getRealId(sourceId))
        const target = this.nodeById(this.getRealId(targetId))

        // target.__Ctor.allowSource(source)

        if (!this.nodeELIsConnected(sourceId, targetId) && !this.isParent(source.id, target.id)) {
          return target.__Ctor.allowSource(source) && source.__Ctor.allowTarget(target, source, _instance)
        }

        return false

        // return this.isParent(
        //   this.getRealId(e.sourceId),
        //   this.getRealId(e.targetId)
        // )
      })

      /*this.conSelections = []

      jsPlumbIns.bind('click', function (conn, evt) {
        console.log('click', conn, evt)
      })

      // 连接线开始拖动事件
      jsPlumbIns.bind('connectionDrag', function (e) {
        e.setHover(true)
        _.dragPoint = e.endpoints[1].getElement()
        _.allNodeDom = container.querySelectorAll('.flow-node')
      })

      // 连接线拖动结束事件
      jsPlumbIns.bind('connectionDragStop', function (e) {
        if (_.dragOverNode) {
          let sourceNodeId = e.sourceId
          let targetNodeId = _.dragOverNode.getAttribute('id')
          let sourceId = sourceNodeId + '_source'
          let targetId = targetNodeId + '_target'
          if (
            !_.isConnected(sourceId, targetId) &&
            !_.isParent(_.getRealId(sourceNodeId), _.getRealId(targetNodeId))
          ) {
            jsPlumbIns.connect({
              source: jsPlumbIns.getEndpoint(sourceId),
              target: jsPlumbIns.getEndpoint(targetId)
            })
          }
        }
        e.setHover(false)
        _.dragPoint = undefined
        _.allNodeDom = undefined
      })

      // 在target的Endpoint上面drop会触发该事件
      jsPlumbIns.bind('beforeDrop', e => {
        return this.isParent(
          this.getRealId(e.sourceId),
          this.getRealId(e.targetId)
        )
      })*/
    },

    async initNodeType() {
      let _nodeTypes = nodeTypes
      let dataFlowType
      if (this.mapping === 'cluster-clone') {
        dataFlowType = 'database-migration' // 数据库迁移
        const dbTypes = await this.loadDatabaseTypes(nodeTypes)
        _nodeTypes = _nodeTypes.filter(item => item.type === 'database')
        _nodeTypes.push(...dbTypes)
      }
      this.setNodeTypes(_nodeTypes)
      this.setCtorTypes(ctorTypes)

      dataFlowType && (await this.setSchema(dataFlowType))
    },

    async setSchema(dataFlowType) {
      const { data } = await dataFlowFormSchemasApi.get({
        filter: {
          dataFlowType
        }
      })
      const item = data[0]
      if (!item) return
      this.setFormSchema({
        node: item.nodeSchema,
        link: item.linkSchema
      })
      console.log('data', data)
    },

    /**
     * 加载插件化数据源节点
     * @param allNodeTypes
     * @returns {Promise<*>}
     */
    async loadDatabaseTypes(allNodeTypes) {
      // 临时过滤本地的数据库节点
      const localTypes = allNodeTypes.map(item => item.attr.databaseType)

      const { data } = await databaseTypesApi.get({
        filter: {
          fields: {
            id: 1,
            type: 1,
            name: 1
          },
          where: {
            type: {
              nin: localTypes
            }
          }
        }
      })

      return data.map(item => {
        return {
          name: item.name,
          icon: 'tigerdb',
          group: 'plugin',
          type: 'database',
          constructor: 'Database',
          attr: {
            databaseType: item.type
          }
        }
      })
    },

    async openDataflow(dataflowId) {
      this.resetWorkspace()

      let result
      try {
        result = await dataFlowsApi.get([dataflowId])
        this.creatUserId = result.data.user_id
      } catch (e) {
        this.$showError(e, '数据流加载出错', '加载数据流出现的问题:')
        return
      }

      const { data } = result
      const excludeKeys = ['stages', 'setting']
      this.dataflow = Object.keys(data)
        .filter(k => !excludeKeys.includes(k))
        .reduce((obj, k) => ((obj[k] = data[k]), obj), {})
      this.status = data.status
      this.setDataflowId(dataflowId)
      this.setDataflowName({ newName: data.name, setStateDirty: false })
      this.setDataflowSettings(data.setting)
      await this.addNodes(data.stages)
      this.setStateDirty(false)
      this.zoomToFit()
      this.milestones = data.milestones
      this.wsWatch()
    },

    async addNodes(nodes) {
      if (!nodes || !nodes.length) return
      const { getters } = this.$store
      // const allNodes = getters['dataflow/allNodeTypes']
      const getNodeType = getters['dataflow/nodeType']
      const getCtor = getters['dataflow/getCtor']

      let nodeType
      nodes.forEach(node => {
        nodeType = getNodeType(node)

        if (nodeType !== null) {
          const Ctor = getCtor(nodeType.constructor)
          const ins = new Ctor(nodeType)

          Object.defineProperty(node, '__Ctor', {
            value: ins,
            enumerable: false
          })

          this.addNode(node)
        }
      })

      await this.$nextTick()

      this.nodes.forEach(node => {
        let t = NODE_PREFIX + node.id + '_target',
          tp = this.jsPlumbIns.getEndpoint(t)
        if (node.inputLanes && node.inputLanes.length) {
          node.inputLanes.forEach(nid => {
            let s = NODE_PREFIX + nid + '_source',
              sp = this.jsPlumbIns.getEndpoint(s)
            this.jsPlumbIns.connect({ source: sp, target: tp })
          })
        }
      })
    },

    resetWorkspace() {
      if (this.jsPlumbIns) {
        this.jsPlumbIns.deleteEveryEndpoint()
      }

      this.deselectAllNodes()
      this.removeAllNodes()
      this.setDataflowId(null)
      this.setDataflowName({ newName: '', setStateDirty: false })
      this.setDataflowSettings(DEFAULT_SETTINGS)
    },

    /**
     * 取消选择所有节点
     */
    deselectAllNodes() {
      console.log('deselectAllNodes')
      this.jsPlumbIns.clearDragSelection()
      this.resetSelectedNodes()
      this.setActiveNode(null)
      this.deselectConnection()
    },

    deselectConnection() {
      const activeConnection = this.$store.getters['dataflow/activeConnection']
      if (!activeConnection) return

      const { NODE_PREFIX, jsPlumbIns } = this
      const conn = jsPlumbIns.select({
        target: NODE_PREFIX + activeConnection.targetId,
        source: NODE_PREFIX + activeConnection.sourceId
      })

      if (conn) {
        conn.removeClass('connection-selected')
        conn.hideOverlay('remove-connection')
      }

      this.setActiveConnection(null)
    },

    wheelScroll(e) {
      //* Control + scroll zoom
      if (e.ctrlKey) {
        if (e.deltaY > 0) {
          this.zoomOut()
        } else {
          this.zoomIn()
        }

        e.preventDefault()
        return
      }
      this.wheelMoveDataflow(e)
    },

    wsWatch() {
      ws.on('watch', data => {
        this.initDataflow(data.data.fullDocument)
      })

      clearInterval(this.timer)
      this.timer = setInterval(async () => {
        const { data } = await dataFlowsApi.get([this.dataflowId])
        this.initDataflow(data)
      }, 5000)
    },

    initDataflow(dataflow) {
      this.status = dataflow.status
      this.executeMode = dataflow.executeMode
      this.milestones = dataflow.milestones

      if (!this.statusBtMap[this.status].start) {
        this.executeMode = 'normal'
      }
    },

    zoomToFit() {
      const nodes = this.nodes

      if (nodes.length === 0) {
        return
      }

      const { minX, minY, maxX, maxY } = getDataflowCorners(nodes)

      console.log('minX, minY, maxX, maxY', minX, minY, maxX, maxY)

      const PADDING = NODE_SIZE * 4

      const editorWidth = window.innerWidth
      const diffX = maxX - minX + SIDEBAR_WIDTH + PADDING
      const scaleX = editorWidth / diffX

      const editorHeight = window.innerHeight
      const diffY = maxY - minY + HEADER_HEIGHT + PADDING
      const scaleY = editorHeight / diffY

      // const zoomLevel = Math.min(scaleX, scaleY, 1)
      const zoomLevel = 1
      let xOffset = minX * -1 * zoomLevel + SIDEBAR_WIDTH // find top right corner
      xOffset += (editorWidth - SIDEBAR_WIDTH - (maxX - minX + NODE_SIZE) * zoomLevel) / 2 // add padding to center workflow

      let yOffset = minY * -1 * zoomLevel + HEADER_HEIGHT // find top right corner
      yOffset += (editorHeight - HEADER_HEIGHT - (maxY - minY + NODE_SIZE * 2) * zoomLevel) / 2 // add padding to center workflow

      this.setZoomLevel(zoomLevel)
      this.$store.commit('dataflow/setNodeViewOffsetPosition', { newOffset: [xOffset, yOffset] })
    },

    setZoomLevel(zoomLevel) {
      this.nodeViewScale = zoomLevel // important for background
      const element = this.jsPlumbIns.getContainer()

      // https://docs.jsplumbtoolkit.com/community/current/articles/zooming.html
      const prependProperties = ['webkit', 'moz', 'ms', 'o']
      const scaleString = 'scale(' + zoomLevel + ')'

      for (let i = 0; i < prependProperties.length; i++) {
        // @ts-ignore
        element.style[prependProperties[i] + 'Transform'] = scaleString
      }
      element.style['transform'] = scaleString

      this.jsPlumbIns.setZoom(zoomLevel)
    },

    nodeSelectedById(id, setActive, deselectAllOthers) {
      if (deselectAllOthers) {
        this.deselectAllNodes()
      }

      const node = this.nodeById(id)

      node && this.nodeSelected(node)

      setActive && this.setActiveNode(node.id)
    },

    nodeSelected(node) {
      this.addSelectedNode(node)
      const nodeElement = `node-${node.id}`
      this.jsPlumbIns.addToDragSelection(nodeElement)
    },

    handleShowSettings() {
      /*const activeType = this.$store.getters['dataflow/activeType']
      if (activeType === 'connection') {
        this.deselectConnection(...arguments)
      } else if (activeType === 'node') {
        this.setActiveNode(null)
      }*/
      this.deselectAllNodes()
      this.setActiveType('settings')
    }
  }
}
</script>

<style lang="scss">
.connection-selected {
  path:nth-child(2) {
    stroke: var(--primary);
  }
  path:nth-child(3) {
    fill: var(--primary);
    stroke: var(--primary);
  }
}

.remove-connection-label {
  position: relative;
  padding: 4px;
  border-radius: 100%;
  background-color: red;
  box-sizing: border-box;

  .remove-connection-btn {
    width: 1em;
    height: 1em;
    font-size: 6px;
    background: transparent
      url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")
      center/1em auto no-repeat;
    transition: font-size 0.15s ease-in-out;
  }

  &:hover {
    .remove-connection-btn {
      font-size: 10px;
    }
  }
}
</style>

<style lang="scss" scoped>
$sidebarW: 249px;
$hoverBg: #e1e1e1;
$radius: 3px;
$baseHeight: 26px;
$sidebarBg: #fff;

.layout-sidebar {
  position: relative;
  z-index: 10;
  width: $sidebarW;
  height: 100%;
  background-color: $sidebarBg;
  overflow: auto;

  &.--right {
    width: 726px;
  }
}

.layout-wrap {
  display: flex;
  flex: auto;
  flex-direction: column;
  min-height: 0;

  &.layout-has-sider {
    flex-direction: row;
  }
}

.layout-content {
  position: relative;
  width: 0;
  flex: auto;
  background-color: #f9f9f9;

  ::v-deep {
    .connection-selected {
      path:nth-child(2) {
        stroke: var(--primary);
      }
      path:nth-child(3) {
        fill: var(--primary);
        stroke: var(--primary);
      }
    }

    .remove-connection-label {
      position: relative;
      padding: 4px;
      border-radius: 100%;
      background-color: red;
      box-sizing: border-box;

      .remove-connection-btn {
        width: 1em;
        height: 1em;
        font-size: 6px;
        background: transparent
          url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")
          center/1em auto no-repeat;
        transition: font-size 0.15s ease-in-out;
      }

      &:hover {
        .remove-connection-btn {
          font-size: 10px;
        }
      }
    }
  }
}

.nav-line {
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  border-top: 1px dashed #ff5b37;
  border-left: 1px dashed #ff5b37;
}

.select-box {
  position: absolute;
  background: rgba(215, 215, 215, 0.2);
  border: 1px solid #b2b2b3;
}

.node-view {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.node-view-background {
  position: absolute;
  width: 10000px;
  height: 10000px;
  top: -5000px;
  left: -5000px;
}

.flex.el-tabs {
  ::v-deep {
    .el-tabs__content {
      padding: 0;
      flex: 1;
    }
    .el-tab-pane {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
