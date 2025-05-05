import { observable } from '@formily/reactive'
import {
  databaseTypesApi,
  dataPermissionApi,
  sharedCacheApi,
  taskApi,
} from '@tap/api'
import { makeStatusAndDisabled } from '@tap/business'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import resize from '@tap/component/src/directives/resize'
import { computed as reactiveComputed } from '@tap/form'
import { validateBySchema } from '@tap/form/src/shared/validate'
import i18n from '@tap/i18n'
import { setPageTitle } from '@tap/shared'
import dagre from 'dagre'
import dayjs from 'dayjs'
import { merge } from 'lodash-es'
import Mousetrap from 'mousetrap'
import { h, markRaw } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
import {
  AddConnectionCommand,
  AddNodeCommand,
  AddNodeOnConnectionCommand,
  CommandManager,
  MoveNodeCommand,
  QuickAddSourceCommand,
  QuickAddTargetCommand,
  RemoveConnectionCommand,
  RemoveNodeCommand,
} from '../command'
import {
  DEFAULT_SETTINGS,
  NODE_HEIGHT,
  NODE_PREFIX,
  NODE_WIDTH,
} from '../constants'
import { connectorActiveStyle } from '../style'
import {
  getSchema,
  getTableRenameByConfig,
  ifTableNameConfigEmpty,
} from '../util'

export default {
  directives: {
    resize,
  },
  inject: ['buried'],
  data() {
    const dataflow = observable({
      ...DEFAULT_SETTINGS,
      id: '',
      name: '',
      status: '',
    })

    return {
      dataflow,
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      buttonShowMap: {
        View: true,
        Edit: true,
        Delete: true,
        Reset: true,
        Start: true,
        Stop: true,
      },
    }
  },
  computed: {
    ...mapState('dataflow', [
      'activeNodeId',
      'showConsole',
      'transformLoading',
    ]),
    ...mapGetters('dataflow', [
      'allNodes',
      'allEdges',
      'activeType',
      'isActionActive',
      'nodeById',
      'stateIsDirty',
      'stateIsReadonly',
      'processorNodeTypes',
      'hasNodeError',
    ]),

    selectBoxStyle() {
      const attr = this.selectBoxAttr
      return attr
        ? {
            left: `${attr.x}px`,
            top: `${attr.y}px`,
            width: `${attr.w}px`,
            height: `${attr.h}px`,
          }
        : null
    },

    materializedViewVisible: {
      get() {
        return this.$store.state.dataflow.materializedViewVisible
      },

      set(visible) {
        this.setMaterializedViewVisible(visible)
      },
    },
  },
  watch: {
    '$route.params.id': function (n, o) {
      if (!o) return
      this.initView()
    },
  },
  beforeUnmount() {
    this.destory = true
    this.stopDagWatch?.()
    this.stopLoopTask()
    this.$ws.off('editFlush', this.handleEditFlush)
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
      'setPdkSchemaFreeMap',
      'setPdkDoubleActiveMap',
      'setMaterializedViewVisible',
    ]),

    ...mapActions('dataflow', ['addNodeAsync', 'updateDag', 'loadCustomNode']),

    async addNodes({ nodes, edges }) {
      if (!nodes?.length) return
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const outputsMap = {}
      const inputsMap = {}

      edges.forEach(({ source, target }) => {
        const _source = outputsMap[source]
        const _target = inputsMap[target]

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

      nodes.forEach((node) => {
        const { alarmRules = [] } = node

        // alarmRules.forEach(rule => {
        //   rule._point = Math.ceil(rule.point / 12) < 1 ? 1 : Math.ceil(rule.point / 12)
        //   rule._ms = Math.ceil(rule.ms / 1000) < 1 ? 1 : Math.ceil(rule.ms / 1000)
        // })

        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []

        // 数据兼容
        node.attrs = node.attrs ?? {}
        node.attrs.position = node.attrs.position ?? [0, 0]
        node.attrs.capabilities = node.attrs.capabilities ?? []

        const ins = getResourceIns(node)
        Object.defineProperty(node, '__Ctor', {
          value: ins,
          enumerable: false,
        })

        // 需要隐藏的内容
        node.hiddenMap = {
          setting: this.loadNodeHiddenSetting(node),
          totalData: this.loadNodeHiddenTotalData(node),
        }
        this.addNode(node)
      })

      await this.$nextTick()

      // 连线
      edges.forEach(({ source, target }) => {
        this.jsPlumbIns.connect({
          uuids: [
            `${NODE_PREFIX}${source}_source`,
            `${NODE_PREFIX}${target}_target`,
          ],
          cssClass: this.nodeById(source).attrs.disabled
            ? 'connection-disabled'
            : '',
        })
      })
    },

    async initShareCache() {
      const { usedShareCache = {} } = this.dataflow?.attrs || {}
      if (Object.keys(usedShareCache).length) {
        await this.loadSharedCache(usedShareCache)
        this.setNodeShareCache(usedShareCache)
      }
    },

    async loadSharedCache(usedShareCache) {
      const sharedCacheRes = await sharedCacheApi.get({
        filter: JSON.stringify({
          limit: 1000,
          where: {
            name: {
              $in: Object.keys(usedShareCache),
            },
          },
        }),
      })
      this.sharedCacheMap = sharedCacheRes.items?.reduce((pre, task) => {
        const { id, name, status } = makeStatusAndDisabled(task)
        pre[name] = { id, name, status }
        return pre
      }, {})
    },

    setNodeShareCache(usedShareCache) {
      this.allNodes.forEach((node) => {
        const sharedCache = []

        for (const key in usedShareCache) {
          if (usedShareCache[key].includes(node.id)) {
            const item = this.sharedCacheMap[key] || {}
            item.id &&
              sharedCache.push({
                name: key,
                id: item.id,
                status: item.status,
              })
          }
        }

        node.attrs.sharedCache = sharedCache
      })
    },

    loadNodeHiddenSetting(node = {}) {
      let flag = false
      const { syncType } = this.dataflow || {}
      const { type } = node
      // 心跳任务、共享缓存
      if (['connHeartbeat', 'shareCache'].includes(syncType)) {
        flag = true
      } else if (
        ['logCollector'].includes(syncType) &&
        type === 'hazelcastIMDG'
      ) {
        // 共享挖掘，目标节点
        flag = true
      }
      return flag
    },

    loadNodeHiddenTotalData(node = {}) {
      let flag = false
      const { syncType } = this.dataflow || {}
      if (['shareCache'].includes(syncType) && node.type === 'mem_cache') {
        flag = true
      }
      return flag
    },

    getRealId(str) {
      return str.replace(new RegExp(`^${NODE_PREFIX}`), '')
    },

    checkAsTarget(target, showMsg) {
      let { allowSource } = target.__Ctor
      allowSource = typeof allowSource === 'boolean' ? allowSource : true
      const connectionType = target.attrs.connectionType
      if (
        !allowSource ||
        (connectionType && !connectionType.includes('target'))
      ) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_node_only_as_source', {
              val1: target.name,
            }),
          )
        return false
      }
      return true
    },

    checkAsSource(source, showMsg) {
      let { allowTarget } = source.__Ctor
      allowTarget = typeof allowTarget === 'boolean' ? allowTarget : true
      const connectionType = source.attrs.connectionType
      if (
        !allowTarget ||
        (connectionType && !connectionType.includes('source'))
      ) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_node_only_as_target', {
              val1: source.name,
            }),
          )
        return false
      }
      return true
    },

    checkTargetMaxInputs(target, showMsg) {
      const maxInputs = target.__Ctor.maxInputs ?? -1
      const connections = this.jsPlumbIns.getConnections({
        target: NODE_PREFIX + target.id,
      })

      if (maxInputs !== -1 && connections.length >= maxInputs) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_mixins_editor_gaijiedianyijing'),
          )
        return false
      }
      return true
    },

    checkSourceMaxOutputs(source, showMsg) {
      const maxOutputs = source.__Ctor.maxOutputs ?? -1
      const connections = this.jsPlumbIns.getConnections({
        source: NODE_PREFIX + source.id,
      })

      if (maxOutputs !== -1 && connections.length >= maxOutputs) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_mixins_editor_gaijiedianyijing'),
          )
        return false
      }
      return true
    },

    checkAllowTargetOrSource(source, target, showMsg) {
      const { allowSource } = target.__Ctor
      const { allowTarget } = source.__Ctor

      if (typeof allowSource === 'function' && !allowSource(source, target)) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_mixins_editor_gaijiedianta', {
              val1: target.name,
              val2: source.name,
            }),
          )
        return false
      }
      if (typeof allowTarget === 'function' && !allowTarget(target, source)) {
        showMsg &&
          this.$message.error(
            i18n.t('packages_dag_mixins_editor_source', {
              val1: source.name,
              val2: target.name,
            }),
          )
        return false
      }
      return true
    },

    checkCanBeConnected(sourceId, targetId, showMsg) {
      if (sourceId === targetId) return false
      if (this.isConnected(sourceId, targetId)) return false

      const source = this.nodeById(sourceId)
      const target = this.nodeById(targetId)

      if (target.attrs.disabled) return false
      if (!this.checkAsTarget(target, showMsg)) return false
      if (!this.checkTargetMaxInputs(target, showMsg)) return false
      return (
        this.allowConnect(sourceId, targetId) &&
        this.checkAllowTargetOrSource(source, target, showMsg)
      )
    },

    checkGotoViewer() {
      if (this.dataflow.disabledData?.edit) {
        // 不可编辑
        this.gotoViewer()
        this.setStateReadonly(true)
        return true
      }
    },

    async newDataflow(name) {
      if (!name) {
        name = await this.makeTaskName(`${i18n.t('public_task')} `)
      }

      this.dataflow.name = name
      await this.saveAsNewDataflow()
      this.titleSet()
    },

    async makeTaskName(source) {
      const taskNames = await taskApi.get({
        filter: JSON.stringify({
          limit: 9999,
          fields: { name: 1 },
          where: { name: { like: `^${source}\\d+$` } },
        }),
      })
      let def = 1
      if (taskNames?.items.length) {
        const arr = [0]
        taskNames.items.forEach((item) => {
          const res = item.name.match(new RegExp(`^${source}(\\d+)$`))
          if (res && res[1]) arr.push(+res[1])
        })
        arr.sort((a, b) => a - b)
        def = arr.pop() + 1
      }
      return `${source}${def}`
    },

    // async makeTaskName(source) {
    //   const taskNames = await taskApi.get({
    //     filter: JSON.stringify({
    //       fields: { name: 1 },
    //       where: { name: { like: `^${source} +` } }
    //     })
    //   })
    //   let def = 1
    //   if (taskNames?.items.length) {
    //     let arr = [0]
    //     taskNames.items.forEach(item => {
    //       const res = item.name.match(/\+(\d+)$/)
    //       if (res && res[1]) arr.push(+res[1])
    //     })
    //     arr.sort()
    //     def = arr.pop() + 1
    //   }
    //   return `${source} +${def}`
    // },

    onNodeDragStart() {
      if (this.ifNodeDragStart) {
        this.ifNodeDragStart = false
        return
      }
      this.ifNodeDragStart = true
    },

    onNodeDragMove(param) {
      if (!this.ifNodeDragStart) return
      const { id, pos } = param
      const nw = param.el.offsetWidth
      const nh = param.el.offsetHeight
      const diffPos = { x: 0, y: 0 }
      let horiArr = []
      let verArr = []
      let rangeX = 10
      let rangeY = 10

      this.allNodes.forEach((item) => {
        if (item.id !== id) {
          const [x, y] = item.attrs.position
          const _x = x - pos[0]
          const _y = y - pos[1]
          if (Math.abs(_x) <= Math.abs(rangeX)) {
            if (_x === rangeX) {
              verArr.push(y)
            } else {
              rangeX = _x
              verArr = [y]
            }
            diffPos.x = rangeX
          }
          if (Math.abs(_y) <= Math.abs(rangeY)) {
            if (_y === rangeY) {
              horiArr.push(x)
            } else {
              rangeY = _y
              horiArr = [x]
            }
            diffPos.y = rangeY
          }
        }
      })

      pos[0] += diffPos.x
      pos[1] += diffPos.y

      param.el.style.left = `${pos[0]}px`
      param.el.style.top = `${pos[1]}px`
      this.jsPlumbIns.revalidate(param.el) // 重绘

      let t = pos[1],
        b = pos[1] + nh,
        l = pos[0],
        r = pos[0] + nw
      verArr.forEach((y) => {
        t = Math.min(y + nh, t)
        b = Math.max(y, b)
      })
      horiArr.forEach((x) => {
        l = Math.min(x + nw, l)
        r = Math.max(x, r)
      })

      // 组装导航线
      const lines = []
      if (t < pos[1]) {
        const top = `${t}px`,
          height = `${pos[1] - t}px`
        lines.push(
          {
            top,
            left: `${pos[0]}px`,
            height,
          },
          {
            top,
            left: `${pos[0] + nw}px`,
            height,
          },
        )
      }
      if (b > pos[1] + nh) {
        const top = `${pos[1] + nh}px`,
          height = `${b - pos[1] - nh}px`
        lines.push(
          {
            top,
            left: `${pos[0]}px`,
            height,
          },
          {
            top,
            left: `${pos[0] + nw}px`,
            height,
          },
        )
      }

      if (l < pos[0]) {
        const left = `${l}px`,
          width = `${pos[0] - l}px`
        lines.push(
          {
            top: `${pos[1]}px`,
            left,
            width,
          },
          {
            top: `${pos[1] + nh}px`,
            left,
            width,
          },
        )
      }

      if (r > pos[0] + nw) {
        const left = `${pos[0] + nw}px`,
          width = `${r - pos[0] - nw}px`
        lines.push(
          {
            top: `${pos[1]}px`,
            left,
            width,
          },
          {
            top: `${pos[1] + nh}px`,
            left,
            width,
          },
        )
      }
      this.navLines = lines
    },

    onNodeDragStop(isNotMove, oldProperties, newProperties) {
      this.ifNodeDragStart = false
      this.navLines = []

      this.$refs.paperScroller.autoResizePaper()

      !isNotMove &&
        this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
    },

    nodeSelectedById(id, setActive, deselectAllOthers) {
      if (deselectAllOthers) {
        this.deselectAllNodes()
      }

      const node = this.nodeById(id)
      if (node?.hiddenMap?.setting) return
      node && this.nodeSelected(node)
      if (setActive) {
        this.setActiveNode(node.id)
        /*if (node.type === 'merge_table_processor') {
        this.materializedViewVisible = true
      } else {
        this.setActiveNode(node.id)
      }*/
      }
    },

    nodeSelected(node) {
      this.addSelectedNode(node)
      const nodeElement = `node-${node.id}`
      this.jsPlumbIns.addToDragSelection(nodeElement)

      document.getElementById(nodeElement).focus()
    },

    nodeDeselected(node) {
      this.removeNodeFromSelection(node)
      const nodeElement = NODE_PREFIX + node.id
      this.jsPlumbIns.removeFromDragSelection(nodeElement)
    },

    nodeDeselectedById(id) {
      const node = this.nodeById(id)
      if (node) {
        this.nodeDeselected(node)
      }
    },

    /**
     * 取消选择所有节点
     */
    deselectAllNodes() {
      this.jsPlumbIns.clearDragSelection()
      this.resetSelectedNodes()
      this.handleDeselectAllConnections()
    },

    /**
     * 取消选中连线
     */
    handleDeselectAllConnections() {
      const selectedConnections = this.$store.state.dataflow.selectedConnections
      if (!selectedConnections.length) return

      const { NODE_PREFIX, jsPlumbIns } = this

      selectedConnections.forEach(({ target, source }) => {
        const conn = jsPlumbIns.select({
          target: NODE_PREFIX + target,
          source: NODE_PREFIX + source,
        })

        if (conn) {
          conn.removeClass('connection-selected')
          conn.hideOverlay('removeConn')
          conn.hideOverlay('addNodeOnConn')
        }
      })

      this.deselectAllConnections()
    },

    onHideSidebar() {
      const activeType = this.$store.getters['dataflow/activeType']
      if (activeType === 'connection') {
        this.handleDeselectAllConnections(...arguments)
      }
      this.setActiveType(null)
    },

    getNodesInSelection(selectBoxAttr) {
      const $node = this.$refs.layoutContent.querySelector('.df-node')
      if (!$node) return []
      const nw = $node.offsetWidth
      const nh = $node.offsetHeight
      const { x, y, bottom, right } = selectBoxAttr

      return this.allNodes.filter((node) => {
        const [left, top] = node.attrs.position
        return left + nw > x && left < right && bottom > top && y < top + nh
      })
    },

    // 循环检查检查链路的末尾节点类型是否是表节点
    isEndOfTable(source, sourceMap, nodeMap) {
      if (!sourceMap[source.id]) {
        // 末位节点
        return source.type === 'database'
      }

      for (const edge of sourceMap[source.id]) {
        if (!this.isEndOfTable(nodeMap[edge.target], sourceMap, nodeMap)) {
          return false
        }
      }

      return true
    },

    reformDataflow(data, fromWS) {
      makeStatusAndDisabled(data)
      if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动
      this.dataflow.status = data.status
      this.dataflow.disabledData = data.btnDisabled
      this.dataflow.taskRecordId = data.taskRecordId
      this.dataflow.stopTime = data.stopTime
      this.dataflow.startTime = data.startTime
      this.dataflow.lastStartDate = data.lastStartDate
      this.dataflow.pingTime = data.pingTime

      if (data.currentEventTimestamp) {
        this.dataflow.currentEventTimestampLabel = dayjs(
          data.currentEventTimestamp,
        ).format('YYYY-MM-DD HH:mm:ss')
      }

      // 前端不关心的属性
      this.dataflow.attrs = data.attrs

      if (!fromWS) {
        Object.keys(data).forEach((key) => {
          if (!['dag'].includes(key)) {
            // 坑啊...formily响应式observable和vue2搭配需要加个避免属性不更新Field
            this.dataflow[key] = data[key]
            this.dataflow[key] = data[key]
          }
        })
      }
    },

    async confirmMessage(
      message,
      headline,
      type,
      confirmButtonText,
      cancelButtonText,
    ) {
      try {
        await this.$confirm(message, headline, {
          confirmButtonText,
          cancelButtonText,
          type,
          dangerouslyUseHTMLString: true,
        })
        return true
      } catch {
        return false
      }
    },

    async initView(first) {
      const { id } = this.$route.params
      const routeName = this.$route.name

      this.stopDagWatch?.()

      if (!first) {
        this.resetWorkspace()
        this.initNodeView()
      }

      if (
        [
          'DataflowViewer',
          'MigrationMonitor',
          'MigrateViewer',
          'TaskMonitor',
        ].includes(routeName)
      ) {
        await this.openDataflow(id)
        this.setStateReadonly(true)
        if (
          routeName === 'MigrateViewer' ||
          (routeName === 'DataflowViewer' &&
            ['renewing', 'renew_failed'].includes(this.dataflow.status))
        ) {
          this.handleConsoleAutoLoad()
        }
      } else {
        if (id) {
          await this.openDataflow(id)
          // 检查任务是否可编辑
          if (this.checkGotoViewer()) return // 跳转到viewer不需要继续往下走
        } else {
          await this.newDataflow()

          this.setStateDirty(false)
          this.setStateReadonly(false)
          this.startLoopTask(id)
          this.initWS()
          this.checkMaterializedView()
        }

        this.stopDagWatch = this.$watch(
          () => this.allNodes.length + this.allEdges.length,
          () => {
            this.updateDag({ vm: this })
          },
        )
      }

      this.initWS()
    },

    initCommand() {
      this.command = new CommandManager(this.$store, this.jsPlumbIns)
      Mousetrap(this.$refs.layoutContent).bind('mod+c', () => {
        !this.stateIsReadonly && this.copyNodes()
      })
      Mousetrap(this.$refs.layoutContent).bind('mod+v', () => {
        if (!this.stateIsReadonly) {
          this.pasteNodes(this.command)
          this.handleCenterContent()
        }
      })
      Mousetrap(this.$refs.layoutContent).bind('mod+z', (e) => {
        e.preventDefault()
        !this.stateIsReadonly && this.command.undo()
      })
      Mousetrap(this.$refs.layoutContent).bind('mod+shift+z', () => {
        !this.stateIsReadonly && this.command.redo()
      })
      Mousetrap(this.$refs.layoutContent).bind('mod+shift+o', () => {
        this.$refs.paperScroller.toggleMiniView()
      })
      Mousetrap(this.$refs.layoutContent).bind(['backspace', 'del'], () => {
        if (
          !this.stateIsReadonly &&
          document
            .querySelector('#dfEditorContent')
            .contains(document.activeElement)
        ) {
          this.handleDelete()
        }
      })
      Mousetrap(this.$refs.layoutContent).bind(
        ['option+command+l', 'ctrl+alt+l'],
        (e) => {
          e.preventDefault()
          this.handleAutoLayout()
        },
      )
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
          if (
            this.stateIsReadonly ||
            connectionIns.hasClass('connection-disabled')
          )
            return
          this.handleDeselectAllConnections()
          info.connection.showOverlay('removeConn')
          info.connection.showOverlay('addNodeOnConn')
          info.connection.addClass('connection-selected')
          this.selectConnection(connection)
        })
        info.connection.bind('mouseover', () => {
          if (
            this.stateIsReadonly ||
            connectionIns.hasClass('connection-disabled')
          )
            return

          info.connection.showOverlay('removeConn')
          info.connection.showOverlay('addNodeOnConn')
        })
        info.connection.bind('mouseout', () => {
          if (
            connectionIns.hasClass('connection-selected') ||
            connectionIns.hasClass('connection-disabled') /* ||
            (this.nodeMenu.show && this.nodeMenu.reference === connectionIns.canvas)*/
          )
            return
          connectionIns.hideOverlay('removeConn')
          connectionIns.hideOverlay('addNodeOnConn')
        })

        // 添加新增按钮，并且绑定事件，默认不可见
        info.connection.addOverlay([
          'Custom',
          {
            id: 'addNodeOnConn',
            location: 0.35,
            create() {
              const div = document.createElement('div')
              div.title = i18n.t(
                'packages_dag_components_dfnode_tianjiajiedian',
              )
              div.classList.add('conn-btn__wrap')
              div.innerHTML = `<div class="conn-btn"><span class="v-icon"> <svg class="v-icon__svg"><use xlink:href="#icon-plus"></use></svg> </span></div>`
              return div
            },
            visible: false,
            events: {
              click: async (overlay) => {
                const rect = info.connection.canvas.getBoundingClientRect()
                this.nodeMenu.connectionCenterPos = [
                  rect.x + rect.width / 2,
                  rect.y + rect.height / 2,
                ]
                await this.showNodePopover(
                  'connection',
                  connection,
                  overlay.canvas,
                )
              },
            },
          },
        ])

        info.connection.addOverlay([
          'Custom',
          {
            id: 'removeConn',
            location: 0.65,
            create() {
              const div = document.createElement('div')
              div.title = i18n.t('packages_dag_mixins_editor_shanchulianjie')
              div.classList.add('conn-btn__wrap')
              div.innerHTML = `<div class="conn-btn"><span class="v-icon"> <svg class="v-icon__svg"><use xlink:href="#icon-close"></use></svg> </span></div>`
              return div
            },
            visible: false,
            events: {
              click: () => {
                this.command.exec(
                  new RemoveConnectionCommand({
                    source,
                    target,
                  }),
                )
              },
            },
          },
        ])

        // 拖动连接
        if (event) {
          this.addConnection(connection)

          this.command.exec(new AddConnectionCommand(connection), true)
        }
      })

      jsPlumbIns.bind('beforeDrop', (info) => {
        if (this.stateIsReadonly) return false
        const { sourceId, targetId } = info

        return this.checkCanBeConnected(
          this.getRealId(sourceId),
          this.getRealId(targetId),
          true,
        )
      })

      jsPlumbIns.bind('beforeDrag', ({ sourceId }) => {
        if (this.stateIsReadonly) return false
        // 根据连接类型判断，节点是否仅支持作为目标
        const node = this.nodeById(this.getRealId(sourceId))

        if (node.disabled || node.attrs.disabled) return false

        return this.checkAsSource(node, true)
      })

      // 连线拖动时，可以被连的节点在画布上凸显
      jsPlumbIns.bind('connectionDrag', (info) => {
        if (this.stateIsReadonly) return false
        const source = this.nodeById(this.getRealId(info.sourceId))
        const canBeConnectedNodes = this.allNodes.filter(
          (target) =>
            !target.attrs.disabled &&
            this.checkCanBeConnected(source.id, target.id),
        )
        this.setCanBeConnectedNodeIds(canBeConnectedNodes.map((n) => n.id))
      })

      jsPlumbIns.bind('connectionDragStop', () => {
        if (this.stateIsReadonly) return false
        this.setCanBeConnectedNodeIds([])
      })
    },

    getDataflowDataToSave(syncType = 'migrate') {
      const dag = this.$store.getters['dataflow/dag']
      const { editVersion, pageVersion } = this.$store.state.dataflow
      return {
        ...this.dataflow,
        dag,
        editVersion,
        pageVersion,
        syncType,
      }
    },

    async save(needStart) {
      this.isSaving = true
      const errorMsg = await this.validate()
      if (errorMsg) {
        this.$message.error(errorMsg)
        this.isSaving = false
        return
      }

      if (!this.dataflow.id) {
        return this.saveAsNewDataflow()
      }

      this.initWS()

      this.toggleConsole(true)
      this.$refs.console?.autoLoad() // 信息输出自动加载

      const data = this.getDataflowDataToSave()
      let isOk = false

      try {
        const result = await taskApi[needStart ? 'saveAndStart' : 'save'](data)
        this.reformDataflow(result)
        !needStart && this.$message.success(this.$t('public_message_save_ok'))
        this.setEditVersion(result.editVersion)
        this.isSaving = false
        isOk = true
      } catch (error) {
        this.handleError(error)
      }
      this.isSaving = false
      if (!needStart) this.$refs.console?.loadData() // 再load一下信息输出，并且停掉计时器
      return isOk
    },

    handleUndo() {
      this.command.undo()
    },

    handleRedo() {
      this.command.redo()
    },

    /**
     * 删除选中的节点
     */
    handleDelete() {
      const selectNodes = this.$store.getters['dataflow/getSelectedNodes']
      this.command.exec(new RemoveNodeCommand(selectNodes))
      this.resetSelectedNodes()
      this.deleteSelectedConnections()
    },

    handleDeleteById(id) {
      const node = this.nodeById(id)
      this.command.exec(new RemoveNodeCommand(node))
      this.nodeDeselected(node)

      this.nodeMenu.show = false // 防止节点删除后，popover仍在显示
    },

    findParentNodes(id, excludeId) {
      const node = this.scope.findNodeById(id)
      const nodes = []
      const parentIds = node.$inputs || []

      for (const parentId of parentIds) {
        if (parentId === excludeId) continue

        const node = this.scope.findNodeById(parentId)

        if (!node || node.__Ctor.maxInputs !== 1 || node.$outputs.length > 1)
          continue

        nodes.push(node)

        if (node.$inputs?.length) {
          nodes.push(...this.findParentNodes(parentId))
        }
      }

      return nodes
    },

    findChildNodes(id) {
      const node = this.scope.findNodeById(id)
      const nodes = []
      const ids = node.$outputs || []

      ids.forEach((id) => {
        const child = this.scope.findNodeById(id)

        if (!child) return

        // Join 节点特殊处理，整个Join链路禁用
        if (child.type === 'join_processor') {
          nodes.push(...this.findParentNodes(child.id, node.id))
        } else if (child.__Ctor.maxInputs !== 1) return

        nodes.push(child)

        if (child.$outputs?.length) {
          nodes.push(...this.findChildNodes(id))
        }
      })

      return nodes
    },

    findAllChildNodes(id) {
      const node = this.scope.findNodeById(id)
      const nodes = []
      const ids = node.$outputs || []

      ids.forEach((id) => {
        const child = this.scope.findNodeById(id)

        if (!child) return

        nodes.push(child)

        if (child.$outputs?.length) {
          nodes.push(...this.findChildNodes(id))
        }
      })

      return nodes
    },

    handleDisableNode(node, value = true) {
      node.disabled = value
      node.attrs.disabled = value

      const parents = this.findParentNodes(node.id)
      const children = this.findChildNodes(node.id)
      const nodes = parents.concat(children)
      const connections = []

      connections.push(
        ...this.jsPlumbIns.getConnections({
          target: NODE_PREFIX + node.id,
        }),
      )

      connections.push(
        ...this.jsPlumbIns.getConnections({
          source: NODE_PREFIX + node.id,
        }),
      )

      nodes.forEach((node) => {
        node.attrs.disabled = value
        connections.push(
          ...this.jsPlumbIns.getConnections({
            target: NODE_PREFIX + node.id,
          }),
        )
        connections.push(
          ...this.jsPlumbIns.getConnections({
            source: NODE_PREFIX + node.id,
          }),
        )
      })

      const handler = value ? 'addClass' : 'removeClass'
      connections.forEach((connection) => {
        connection[handler]('connection-disabled')
      })

      this.updateDag({ vm: this })
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

    handleShowSettings() {
      this.deselectAllNodes()
      if (this.activeType === 'settings') {
        this.setActiveType(null)
      } else {
        this.setActiveType('settings')
      }
    },

    /**
     * 画布内容居中在可视区域
     */
    handleCenterContent() {
      this.$refs.paperScroller.centerContent()
    },

    /**
     * 自动布局
     */
    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) return

      let hasMove = false
      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

      dg.setGraph({
        nodesep: 60,
        ranksep: 120,
        marginx: 50,
        marginy: 50,
        rankdir: 'LR',
      })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach((n) => {
        dg.setNode(NODE_PREFIX + n.id, {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
      })
      this.jsPlumbIns.getAllConnections().forEach((edge) => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)
      dg.nodes().forEach((n) => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          hasMove = true
          oldProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: nodePositionMap[n],
              },
            },
          })
          newProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top],
              },
            },
          })
        }
      })

      hasMove &&
        this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
      this.$refs.paperScroller.autoResizePaper()
      this.$refs.paperScroller.centerContent()
    },

    /**
     * 判断node之间是否相连
     * @param s
     * @param t
     * @returns {boolean}
     */
    isConnected(s, t) {
      s = NODE_PREFIX + s
      t = NODE_PREFIX + t
      return this.nodeELIsConnected(s, t)
    },

    nodeELIsConnected(s, t) {
      // const connections = this.jsPlumbIns.getConnections('*')

      // console.log('connections', connections)
      return this.jsPlumbIns
        .getConnections('*')
        .some((c) => String(c.sourceId) === s && String(c.targetId) === t)
    },

    allowConnect(sourceId, targetId) {
      const allEdges = this.allEdges
      const map = allEdges.reduce((map, item) => {
        const target = map[item.target]
        if (target) {
          target.push(item.source)
        } else {
          map[item.target] = [item.source]
        }
        return map
      }, {})

      if (!map[sourceId]) return true

      return !this.isParent(sourceId, targetId, map)
    },

    // 循环检查target是否是source的上级
    isParent(sourceId, targetId, map) {
      let flag = false
      if (!map[sourceId]) return flag
      for (const id of map[sourceId]) {
        flag = id === targetId
        if (flag || this.isParent(id, targetId, map)) return true
      }
      return flag
    },

    resetWorkspace() {
      Object.assign(this.dataflow, {
        ...DEFAULT_SETTINGS,
        id: '',
        name: '',
      })
      /*this.dataflow = merge(
      {
        id: '',
        name: ''
      },
      DEFAULT_SETTINGS
    )*/
      this.nameHasUpdated = false
      this.jsPlumbIns.reset()
      this.deselectAllNodes()
      this.reset()
      this.setActiveNode(null)
      this.resetSelectedNodes()
    },

    async validateNode(node) {
      try {
        const schema = getSchema(
          node.__Ctor.formSchema,
          node,
          this.$store.state.dataflow.pdkPropertiesMap,
        )
        await validateBySchema(schema, node, this.formScope || this.scope)
        this.clearNodeError(node.id)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(
          i18n.t('packages_dag_mixins_editor_jiedianjiaoyancuo'),
          error,
        )
        if (node.type === 'table_rename_processor') {
          // 节点的特殊处理，直接拿表单校验结果设置错误信息
          this.setNodeErrorMsg({
            id: node.id,
            msg: error[0].messages[0],
          })
        } else {
          this.setNodeError(node.id)
        }
      }
    },

    async validateAllNodes(nodes) {
      await Promise.all(
        nodes.map((node) => {
          if (this.activeNodeId === node.id) {
            return this.$refs.configPanel.validateForm()
          } else {
            return this.validateNode(node)
          }
        }),
      )
    },

    validateDag() {
      let someErrorMsg = ''
      // 检查每个节点的源节点个数、连线个数、节点的错误状态
      this.allNodes.some((node) => {
        const { id } = node
        const minInputs = node.__Ctor.minInputs ?? 1
        // 非数据节点至少有一个目标
        const minOutputs =
          (node.__Ctor.minOutputs ??
          (node.type !== 'database' && node.type !== 'table'))
            ? 1
            : 0
        const inputNum = node.$inputs.length
        const outputNum = node.$outputs.length

        if (this.hasNodeError(id)) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
            val1: node.name,
          })
          this.handleLocateNode(node)
          return true
        }

        if (inputNum < minInputs) {
          someErrorMsg = i18n.t('packages_dag_node_none_input', {
            val1: node.name,
            val2: minInputs,
          })
          return true
        }

        if (outputNum < minOutputs) {
          someErrorMsg = i18n.t('packages_dag_node_none_output', {
            val1: node.name,
            val2: minOutputs,
          })
          return true
        }

        if (!inputNum && !outputNum) {
          // 存在没有连线的节点
          someErrorMsg = i18n.t('packages_dag_node_none_connection', {
            val1: node.name,
          })
          return true
        }
      })
      return someErrorMsg
    },

    /**
     * 校验agent设置
     * @returns {*}
     */
    validateAgent() {
      let someErrorMsg
      const nodes = this.allNodes.filter(
        (node) => node.type === 'database' || node.type === 'table',
      )
      const accessNodeProcessIdArr = [
        ...nodes.reduce((set, item) => {
          item.attrs.accessNodeProcessId &&
            set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set()),
      ]

      if (accessNodeProcessIdArr.length > 1) {
        // 所属agent节点冲突
        const chooseId = this.dataflow.accessNodeProcessId

        if (!chooseId) {
          // someErrorMsg = `请配置任务运行agent`
          someErrorMsg = i18n.t('packages_dag_mixins_editor_suoshuage') // 一样提示冲突
        } else {
          let isError = false
          const agent = this.scope.$agentMap[chooseId]
          nodes.forEach((node) => {
            if (
              node.attrs.accessNodeProcessId &&
              chooseId !== node.attrs.accessNodeProcessId
            ) {
              this.setNodeErrorMsg({
                id: node.id,
                msg: i18n.t('packages_dag_mixins_editor_gaijiedianbuzhi', {
                  val1: agent.hostName,
                  val2: agent.ip,
                }),
              })
              isError = true
            }
          })
          isError &&
            (someErrorMsg = i18n.t('packages_dag_mixins_editor_suoshuage'))
        }
      } else if (accessNodeProcessIdArr.length === 1) {
        // 如果画布上仅有一个所属agent，自动设置为任务的agent
        const agentId = accessNodeProcessIdArr[0]
        this.dataflow.accessNodeType =
          this.scope.$agentMap[agentId]?.accessNodeType ||
          'MANUALLY_SPECIFIED_BY_THE_USER'
        this.dataflow.accessNodeProcessId = agentId
      }
      return someErrorMsg
    },

    async validateSetting() {
      try {
        await this.$refs.configPanel.validateSetting()
      } catch {
        this.setActiveType('settings')
        return i18n.t('packages_dag_mixins_editor_renwushezhiyi')
      }
    },

    validateTaskType() {
      const { type } = this.dataflow
      if (type !== 'initial_sync') {
        let hasNoStreamReadFunction = false
        this.allNodes.forEach((node) => {
          if (node.$outputs.length && !node.$inputs.length) {
            const capbilitiesMap = node.attrs.capabilities.reduce(
              (map, item) => {
                map[item.id] = true
                return map
              },
              {},
            )

            if (
              !capbilitiesMap.stream_read_function &&
              !capbilitiesMap.raw_data_callback_filter_function &&
              !capbilitiesMap.raw_data_callback_filter_function_v2 &&
              (!capbilitiesMap.query_by_advance_filter_function ||
                !capbilitiesMap.batch_read_function)
            ) {
              // 源不支持增量
              hasNoStreamReadFunction = true
              this.setNodeErrorMsg({
                id: node.id,
                msg: i18n.t('packages_dag_mixins_editor_not_support_cdc'),
              })
            }
          }
        })
        if (hasNoStreamReadFunction) {
          this.setActiveType('settings')
          return i18n.t('packages_dag_mixins_editor_task_not_support_cdc')
        }
      }
    },

    loadLeafNode(node) {
      const arr = []
      if (node.$outputs.length) {
        node.$outputs.forEach((id) => {
          console.log('this.loadLeafNode(this.nodeById(id))', this.loadLeafNode(this.nodeById(id))) // eslint-disable-line
          arr.push(...this.loadLeafNode(this.nodeById(id)))
        })
      } else {
        arr.push(node.id)
      }
      return arr
    },

    eachOutputs(node) {
      this.eachMap[node.id] = true
      const size = node.$outputs.length
      if (size > 0) {
        node.$outputs.forEach((id) => {
          if (this.eachMap[id]) return
          const output = this.nodeById(id)
          if (output.$inputs.length > 1) {
            this.eachInputsByFilter(output, node.id)
          }
          this.eachOutputs(output)
        })
      }
    },

    eachInputsByFilter(node, filterId) {
      this.eachMap[node.id] = true
      node.$inputs.forEach((id) => {
        if (id !== filterId && !this.eachMap[id]) {
          const input = this.nodeById(id)
          this.eachInputs(input)
          if (input.$outputs.length > 1) {
            this.eachOutputsByFilter(input, node.id)
          }
        }
      })
    },

    eachOutputsByFilter(node, filterId) {
      this.eachMap[node.id] = true
      node.$outputs.forEach((id) => {
        if (id !== filterId && !this.eachMap[id]) {
          const output = this.nodeById(id)
          this.eachOutputs(output)
          if (output.$inputs.length > 1) {
            this.eachInputsByFilter(output, node.id)
          }
        }
      })
    },

    eachInputs(node) {
      this.eachMap[node.id] = true
      const size = node.$inputs.length
      if (size > 0) {
        node.$inputs.forEach((id) => {
          if (this.eachMap[id]) return
          const input = this.nodeById(id)
          if (input.$outputs.length > 1) {
            this.eachOutputsByFilter(input, node.id)
          }
          this.eachInputs(input)
        })
      }
    },

    validateLink() {
      const firstSourceNode = this.allNodes.find((node) => !node.$inputs.length)
      if (!firstSourceNode)
        return i18n.t('packages_dag_mixins_editor_renwulianlubu')
      this.eachMap = {}
      this.eachOutputs(firstSourceNode)

      if (this.allNodes.some((node) => !this.eachMap[node.id])) {
        return i18n.t('packages_dag_mixins_editor_buzhichiduotiao')
      }
    },

    validateDDL() {
      let hasEnableDDL
      let hasEnableDDLAndIncreasesql
      let inBlacklist = false
      const blacklist = [
        'js_processor',
        'custom_processor',
        'migrate_js_processor',
        'union_processor',
        'migrate_union_processor',
        'standard_js_processor',
        'standard_migrate_js_processor',
      ]
      this.allNodes.forEach((node) => {
        // 开启了DDL
        if (node.ddlConfiguration === 'SYNCHRONIZATION') {
          hasEnableDDL = true
          if (node.increasePoll === 'customizeSql') {
            hasEnableDDLAndIncreasesql = true
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_mixins_editor_not_support_ddl'),
            })
          }
        }
        if (blacklist.includes(node.type)) {
          inBlacklist = true
        }
      })
      if ((hasEnableDDL && inBlacklist) || hasEnableDDLAndIncreasesql) {
        return i18n.t('packages_dag_mixins_editor_renwuzhonghanyou')
      }
    },

    // 当开启了全量自定义查询后，处理节点仅支持使用JS节点
    validateCustomSql() {
      let error
      let enable
      let notAllowTarget
      const schemaFree = this.$store.state.dataflow.pdkSchemaFreeMap

      this.allNodes.some((node) => {
        if (node.enableCustomCommand) {
          enable = true
        }

        // 目标是否是弱schema类型
        // if (node.$inputs.length && !node.$outputs.length && !schemaFree[node.attrs.pdkHash]) {
        //   notAllowTarget = true
        // }

        if (enable && notAllowTarget) {
          error = i18n.t('packages_dag_validate_customsql_target_fail')
          return true
        }
      })

      return error
    },

    validateUnwind() {
      if (this.dataflow.syncType === 'migrate') return

      const nodes = this.allNodes.filter(
        (node) => node.type === 'unwind_processor',
      )
      for (const node of nodes) {
        const childNodes = this.findChildNodes(node.id).filter(
          (child) => child.type === 'table',
        )
        // console.log('childNodes', childNodes)
        if (
          childNodes.some(
            (childNode) => childNode.dmlPolicy?.insertPolicy !== 'just_insert',
          )
        ) {
          this.setNodeErrorMsg({
            id: node.id,
            msg: i18n.t('packages_dag_unwind_validate_error'),
          })
          return i18n.t('packages_dag_unwind_validate_error')
        }
      }
    },

    async validateTableRename() {
      if (this.dataflow.syncType !== 'migrate') return

      const nodes = this.allNodes.filter(
        (node) => node.type === 'table_rename_processor',
      )

      // 只允许存在1个表编辑节点
      if (nodes.length > 1) return i18n.t('packages_dag_table_rename_multiple')
      if (nodes.length) {
        // 表重名检查
        const node = nodes[0]
        const parents = this.scope.findParentNodes(node.id)
        const sourceNode = parents?.[0]

        if (sourceNode?.type === 'database') {
          let tableNames = sourceNode.tableNames

          // 按表达式匹配表
          if (sourceNode.migrateTableSelectType === 'expression') {
            const { items } = await taskApi.getNodeTableInfo({
              taskId: this.dataflow.id,
              nodeId: node.id,
              page: 1,
              pageSize: 10000,
            })
            tableNames = items.map((item) => item.sourceObjectName)
          }

          const ifConfigEmpty = ifTableNameConfigEmpty(node)

          if (ifConfigEmpty && !node.tableNames?.length) return

          const nameTemp = {}
          const renameMap = node.tableNames.reduce((obj, item) => {
            obj[item.previousTableName] = item.currentTableName
            return obj
          }, {})

          for (const name of tableNames) {
            let newName = name

            if (name in renameMap) {
              newName = renameMap[name]
            } else if (!ifConfigEmpty) {
              newName = getTableRenameByConfig(name, node)
            }

            if (newName in nameTemp) {
              const msg = `${i18n.t('packages_dag_nodes_tableprocessor_biaomingchongfu')}: ${newName}`

              this.setNodeErrorMsg({
                id: node.id,
                msg,
              })

              return msg
            }

            nameTemp[newName] = 1
          }
        }
      }
    },

    async validateMigrateUnion() {
      if (this.dataflow.syncType !== 'migrate') return

      const nodes = this.allNodes.filter(
        (node) => node.type === 'migrate_union_processor',
      )

      if (nodes.length > 1) return i18n.t('packages_dag_migrate_union_multiple')
    },

    async validateMergeTableProcessor() {
      if (this.dataflow.syncType === 'migrate') return

      const nodes = this.allNodes.filter(
        (node) => node.type === 'merge_table_processor',
      )

      const validateMergeProperties = (items, isFirstLevel = true) => {
        for (const item of items) {
          // 跳过第一级，只检查 children 层级的 joinKeys
          if (!isFirstLevel) {
            // 检查 joinKeys 是否为空数组
            if (!item.joinKeys?.length) {
              return i18n.t('packages_dag_join_keys_empty', {
                tableName: item.tableName,
              })
            }

            // 检查每个 joinKey 的 source/target
            for (const [index, joinKey] of item.joinKeys.entries()) {
              if (!joinKey.source || !joinKey.target) {
                return i18n.t('packages_dag_join_keys_field_empty', {
                  tableName: item.tableName,
                  index: index + 1,
                })
              }
            }
          }

          // 递归检查子项
          if (item.children?.length) {
            const childrenError = validateMergeProperties(item.children, false)
            if (childrenError) {
              return childrenError
            }
          }
        }
        return ''
      }

      for (const node of nodes) {
        const error = validateMergeProperties(node.mergeProperties)
        if (error) {
          this.setNodeErrorMsg({
            id: node.id,
            msg: error,
          })
          return error
        }

        // 校验主从合并后面是否有js节点
        const nextNodes = this.findAllChildNodes(node.id)

        if (
          nextNodes.some(
            (nextNode) => nextNode.type === 'standard_js_processor',
          )
        ) {
          return i18n.t('packages_dag_merge_table_js_node_error')
        }

        // 目标需要有 master_slave_merge 能力
        const targetNode = nextNodes.find(
          (nextNode) =>
            nextNode.type === 'table' &&
            !nextNode.attrs?.capabilities?.find(
              ({ id }) => id === 'master_slave_merge',
            ),
        )

        if (targetNode) {
          return i18n.t('packages_dag_merge_table_table_not_allow_target', {
            val: targetNode.databaseType,
          })
        }
      }
    },

    async eachValidate(...fns) {
      for (const fn of fns) {
        let result = fn()
        if (result) {
          if (result instanceof Promise) {
            result = await result
            if (!result) continue
          }
          return result
        }
      }
    },

    async validate() {
      if (!this.dataflow.name)
        return this.$t('packages_dag_editor_cell_validate_empty_name')

      const nodes = this.allNodes.filter((node) => {
        return !node.disabled && !node.attrs.disabled
      })

      if (nodes.length < 2) {
        return this.$t('packages_dag_editor_cell_validate_none_data_node')
      }

      await this.validateAllNodes(nodes)

      return await this.eachValidate(
        this.validateSetting,
        this.validateDag,
        this.validateAgent,
        this.validateLink,
        this.validateDDL,
        this.validateCustomSql,
        this.validateUnwind,
        this.validateTableRename,
        this.validateMigrateUnion,
        this.validateMergeTableProcessor,
      )
    },

    /**
     * 从侧边栏拖拽节点时，判断是否能放置到连线，并且高亮可以放置的线
     * @param item
     * @param position
     * @param el
     */
    handleDragMoveNode(item, position, el) {
      this.jsPlumbIns.select().removeClass('connection-highlight')
      const $elemBelow = document.elementFromPoint(...position)

      if (
        $elemBelow?.nodeName === 'path' &&
        $elemBelow.parentElement._jsPlumb
      ) {
        $elemBelow.parentElement.classList.add('connection-highlight')
      }

      const lines = []

      if (document.querySelector('#dfEditorContent').contains($elemBelow)) {
        el.style.transition = `transform 0.3s`
        el.style.transform = `scale(${this.scale})`
        const nw = el.offsetWidth
        const nh = el.offsetHeight
        const pos = this.$refs.paperScroller.getDropPositionWithinPaper(
          position,
          {
            width: nw,
            height: nh,
          },
        )
        const diffPos = { x: 0, y: 0 }
        let horiArr = []
        let verArr = []
        let rangeX = 10
        let rangeY = 10

        this.allNodes.forEach((item) => {
          const [x, y] = item.attrs.position
          const _x = x - pos[0]
          const _y = y - pos[1]
          if (Math.abs(_x) <= Math.abs(rangeX)) {
            if (_x === rangeX) {
              verArr.push(y)
            } else {
              rangeX = _x
              verArr = [y]
            }
            diffPos.x = rangeX
          }
          if (Math.abs(_y) <= Math.abs(rangeY)) {
            if (_y === rangeY) {
              horiArr.push(x)
            } else {
              rangeY = _y
              horiArr = [x]
            }
            diffPos.y = rangeY
          }
        })

        pos[0] += diffPos.x
        pos[1] += diffPos.y

        // console.log('diffPos', diffPos.x, diffPos.y)
        el.style.left = `${Number.parseInt(el.style.left) + diffPos.x * this.scale}px`
        el.style.top = `${Number.parseInt(el.style.top) + diffPos.y * this.scale}px`

        let t = pos[1],
          b = pos[1] + nh,
          l = pos[0],
          r = pos[0] + nw
        verArr.forEach((y) => {
          t = Math.min(y + nh, t)
          b = Math.max(y, b)
        })
        horiArr.forEach((x) => {
          l = Math.min(x + nw, l)
          r = Math.max(x, r)
        })

        // 组装导航线
        if (t < pos[1]) {
          const top = `${t}px`,
            height = `${pos[1] - t}px`
          lines.push(
            {
              top,
              left: `${pos[0]}px`,
              height,
            },
            {
              top,
              left: `${pos[0] + nw}px`,
              height,
            },
          )
        }
        if (b > pos[1] + nh) {
          const top = `${pos[1] + nh}px`,
            height = `${b - pos[1] - nh}px`
          lines.push(
            {
              top,
              left: `${pos[0]}px`,
              height,
            },
            {
              top,
              left: `${pos[0] + nw}px`,
              height,
            },
          )
        }

        if (l < pos[0]) {
          const left = `${l}px`,
            width = `${pos[0] - l}px`
          lines.push(
            {
              top: `${pos[1]}px`,
              left,
              width,
            },
            {
              top: `${pos[1] + nh}px`,
              left,
              width,
            },
          )
        }

        if (r > pos[0] + nw) {
          const left = `${pos[0] + nw}px`,
            width = `${r - pos[0] - nw}px`
          lines.push(
            {
              top: `${pos[1]}px`,
              left,
              width,
            },
            {
              top: `${pos[1] + nh}px`,
              left,
              width,
            },
          )
        }
      } else {
        el.style.transition = `transform 0.3s`
        el.style.transform = 'scale(1)'
      }

      this.navLines = lines
    },

    /**
     * 通过拖拽添加节点
     * 🎉 支持拖到连线上快速添加
     * @param item
     * @param position
     * @param rect
     */
    handleAddNodeByDrag(item, position, rect) {
      const paper = this.$refs.paperScroller
      // const newPosition = paper.getDropPositionWithinPaper(position, rect)
      const point = paper.getMouseToPage(rect)
      const newPosition = [point.x, point.y]
      const $elemBelow = document.elementFromPoint(...position)

      // 节点拖放在连线上
      if ($elemBelow.nodeName === 'path' && $elemBelow.parentElement._jsPlumb) {
        const connection = $elemBelow.parentElement._jsPlumb
        const source = this.getRealId(connection.sourceId)
        const target = this.getRealId(connection.targetId)
        this.addNodeOnConn(item, newPosition, source, target)
        this.jsPlumbIns.select().removeClass('connection-highlight')
      } else {
        this.handleAddNodeToPos(newPosition, item)
      }

      paper.autoResizePaper()
      // 重置导航线
      this.navLines = []
    },

    handleAddNodeToPos(position, item) {
      const node = this.createNode(position, item)
      this.command.exec(new AddNodeCommand(node))
      return node
    },

    handleAddNode(item) {
      const { x, y } = this.$refs.paperScroller.getPaperCenterPos()
      const position = this.getNewNodePosition(
        [x - NODE_WIDTH / 2, y - NODE_HEIGHT / 2],
        [120, 0],
      )
      const node = this.handleAddNodeToPos(position, item)
      if (position[1] !== y) {
        this.$refs.paperScroller.centerNode(node)
      }
      return node
    },

    handleMouseSelect(ifMoved, showSelectBox, selectBoxAttr) {
      // 取消选中所有节点
      this.deselectAllNodes()
      // 清空激活状态
      // this.setActiveType(null)

      if (!ifMoved) {
        this.setActiveType(null)
      } else if (showSelectBox) {
        const selectedNodes = this.getNodesInSelection(selectBoxAttr)
        selectedNodes.forEach((node) => this.nodeSelected(node))
      }
    },

    handleChangeScale(scale) {
      this.scale = scale
      this.jsPlumbIns.setZoom(scale)
    },

    isSource(node) {
      const id = node.id
      const allEdges = this.allEdges
      return allEdges.some(({ source }) => source === id)
    },

    /**
     * 快速添加目标节点
     * @param source 源节点
     * @param nodeType 节点的类型对象
     */
    quickAddNode(source, nodeType) {
      const spaceX = 120
      const spaceY = 120

      const newPosition = [
        source.attrs.position[0] + NODE_WIDTH + spaceX,
        source.attrs.position[1],
      ]
      let movePosition = [spaceX, 0]

      if (this.isSource(source)) {
        newPosition[1] += spaceY
        movePosition = [0, spaceY]
      }

      const position = this.getNewNodePosition(newPosition, movePosition)
      const target = this.createNode(position, nodeType)

      if (!this.checkAsSource(source, true)) return
      if (!this.checkSourceMaxOutputs(source, true)) return
      if (!this.checkAllowTargetOrSource(source, target, true)) return
      this.command.exec(new QuickAddTargetCommand(source.id, target))

      return target
    },

    quickAddSourceNode(target, nodeType) {
      const spaceX = 120
      const spaceY = 120

      const newPosition = [
        target.attrs.position[0] - NODE_WIDTH - spaceX,
        target.attrs.position[1],
      ]
      let movePosition = [-spaceX, 0]

      if (target.$inputs.length) {
        newPosition[1] += spaceY
        movePosition = [0, spaceY]
      }

      const position = this.getNewNodePosition(newPosition, movePosition)
      const source = this.createNode(position, nodeType)

      this.command.exec(new QuickAddSourceCommand(target.id, source))

      return source
    },

    /**
     * 在连线上添加节点
     * @param nodeType
     * @param position
     * @param source 连线源节点的id
     * @param target 连线目标节点的id
     */
    addNodeOnConn(nodeType, position, source, target) {
      const a = this.nodeById(source)
      const b = this.createNode(position, nodeType)
      const c = this.nodeById(target)

      // 表和数据库节点不允许即使源又是目标的情况
      if ('table' === nodeType.type || 'database' === nodeType.type) return
      if (!this.checkAsTarget(b, true)) return
      if (!this.checkAsSource(b, true)) return
      if (!this.checkTargetMaxInputs(b, true)) return
      if (!this.checkSourceMaxOutputs(b, true)) return
      if (!this.checkAllowTargetOrSource(a, b, true)) return
      if (!this.checkAllowTargetOrSource(b, c, true)) return

      this.command.exec(
        new AddNodeOnConnectionCommand(
          {
            source,
            target,
          },
          b,
        ),
      )
    },

    addNodeOnConnByNodeMenu(nodeType) {
      const { nodeMenu } = this
      const position = this.$refs.paperScroller.getDropPositionWithinPaper(
        nodeMenu.connectionCenterPos,
        {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        },
      )
      this.addNodeOnConn(
        nodeType,
        position,
        nodeMenu.data.source,
        nodeMenu.data.target,
      )
      this.$nextTick(() => {
        this.handleAutoLayout()
      })
    },

    canUsePosition(position1, position2) {
      if (
        Math.abs(position1[0] - position2[0]) <= NODE_WIDTH &&
        Math.abs(position1[1] - position2[1]) <= NODE_HEIGHT
      ) {
        return false
      }

      return true
    },

    getNewNodePosition(newPosition, movePosition) {
      newPosition = newPosition.slice()

      if (!movePosition) {
        movePosition = [50, 50]
      }

      let conflictFound = false // 查找冲突
      let i, node
      do {
        conflictFound = false
        for (i = 0; i < this.allNodes.length; i++) {
          node = this.allNodes[i]
          if (!this.canUsePosition(node.attrs.position, newPosition)) {
            conflictFound = true
            break
          }
        }

        if (conflictFound === true) {
          newPosition[0] += movePosition[0]
          newPosition[1] += movePosition[1]
        }
      } while (conflictFound === true)

      return newPosition
    },

    handleError(error, msg = i18n.t('packages_dag_src_editor_chucuole')) {
      const code = error?.data?.code
      if (code === 'Task.ListWarnMessage') {
        const names = []
        if (error.data?.data) {
          const keys = Object.keys(error.data.data)
          keys.forEach((key) => {
            const node = this.$store.state.dataflow.NodeMap[key]
            if (node) {
              names.push(node.name)
              this.setNodeErrorMsg({
                id: node.id,
                msg: error.data.data[key][0].msg,
              })
            }
          })
          if (!names.length && keys.length && msg) {
            // 兼容错误信息id不是节点id的情况
            const msg = error.data.data[keys[0]][0]?.msg
            if (msg) {
              this.$message.error(msg)
              return
            }
          }
        }
      } else if (code === 'Task.OldVersion') {
        this.$confirm('', i18n.t('packages_dag_task_old_version_confirm'), {
          onlyTitle: true,
          type: 'warning',
          closeOnClickModal: false,
          confirmButtonText: i18n.t('public_button_refresh'),
        }).then((resFlag) => {
          resFlag && location.reload()
        })
      } else if (
        ['Task.ScheduleLimit', 'Task.ManuallyScheduleLimit'].includes(code)
      ) {
        this.handleShowUpgradeDialog(error.data)
      } else {
        showErrorMessage(error?.data)
      }
    },

    async handleUpdateName(name) {
      const oldName = this.dataflow.name
      this.nameHasUpdated = true
      this.dataflow.name = name
      taskApi.rename(this.dataflow.id, name).then(
        () => {
          this.$message.success(
            this.$t('packages_dag_message_task_rename_success'),
          )
          this.titleSet()
        },
        (error) => {
          this.dataflow.name = oldName
          this.handleError(error)
        },
      )
    },

    handleEditFlush(result) {
      // console.debug(i18n.t('packages_dag_mixins_editor_debug5', { val1: result.data?.status }), result.data) // eslint-disable-line
      if (result.data) {
        if (result.data.id !== this.dataflow.id) {
          // console.debug(i18n.t('packages_dag_mixins_editor_wsshoudaole'), result.data)
          return
        }
        this.reformDataflow(result.data, true)
        this.setTransformLoading(!result.data.transformed)
      }
    },

    handleLocateNode(node) {
      this.nodeSelectedById(node.id, true, true)
      setTimeout(() => {
        this.$refs.paperScroller.centerNode(node)
      }, 300)
    },

    async handleStart() {
      const routeName = this.$route.name
      const isDataflow = [
        'DataflowNew',
        'DataflowEditor',
        'DataflowViewer',
        'TaskMonitor',
      ].includes(routeName)
      const buriedCode = isDataflow ? 'taskStart' : 'migrationStart'
      this.buried(buriedCode)

      const flag = await this.save(true)
      if (flag) {
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        this.buried(buriedCode, { result: true })
        this.gotoViewer()
      } else {
        this.buried(buriedCode, { result: false })
      }
    },

    handleStop() {
      const message = this.getConfirmMessage('stop')

      this.$confirm(message, '', {
        type: 'warning',
        showClose: false,
      }).then(async (resFlag) => {
        if (!resFlag) {
          return
        }
        this.initWS()
        this.dataflow.disabledData.stop = true
        await taskApi.stop(this.dataflow.id).catch((error) => {
          this.handleError(
            error,
            this.$t('packages_dag_message_operation_error'),
          )
        })
        this.$message.success(this.$t('public_message_operation_success'))
      })
    },

    handleForceStop() {
      const msg = this.getConfirmMessage('force_stop')
      this.$confirm(msg, '', {
        type: 'warning',
        showClose: false,
      }).then(async (resFlag) => {
        if (!resFlag) {
          return
        }
        this.initWS()
        this.dataflow.disabledData.stop = true
        await taskApi.forceStop(this.dataflow.id)
        // this.startLoop(true)
      })
    },

    handleReset() {
      const msg = this.getConfirmMessage('initialize')
      this.$confirm(msg, '', {
        type: 'warning',
      }).then(async (resFlag) => {
        if (!resFlag) {
          return
        }
        try {
          this.initWS()
          this.dataflow.disabledData.reset = true
          this.toggleConsole(true)
          this.$refs.console?.startAuto('reset') // 信息输出自动加载
          const data = await taskApi.reset(this.dataflow.id)
          this.responseHandler(
            data,
            this.$t('public_message_operation_success'),
          )
        } catch (error) {
          this.handleError(
            error,
            this.$t('packages_dag_message_operation_error'),
          )
        }
      })
    },

    getConfirmMessage(operateStr) {
      const message = `${operateStr}_confirm_message`
      const strArr = this.$t(`packages_dag_dataFlow_${message}`).split('xxx')
      const msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary',
          },
          this.dataflow.name,
        ),
        strArr[1],
      ])
      return msg
    },

    responseHandler(data, msg) {
      const failList = data?.fail || []
      if (failList.length) {
        const msgMapping = {
          5: this.$t('packages_dag_dataFlow_multiError_notFound'),
          6: this.$t('packages_dag_dataFlow_multiError_statusError'),
          7: this.$t('packages_dag_dataFlow_multiError_otherError'),
          8: this.$t('packages_dag_dataFlow_multiError_statusError'),
        }
        const nameMapping = {}
        this.table.list.forEach((item) => {
          nameMapping[item.id] = item.name
        })
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map((item) => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join(''),
        })
      } else if (msg) {
        this.$message.success(msg)
      }
    },

    async loadDataflow(id, params) {
      this.loading = true
      try {
        const { parent_task_sign } = this.$route.query || {}
        const data = await taskApi.get(id, params, { parent_task_sign })
        if (!data) {
          this.$message.error(
            i18n.t('packages_dag_mixins_editor_renwubucunzai'),
          )
          this.handlePageReturn()
          return
        }

        if (data.errorEvents?.length) {
          // 清除 stacks
          data.errorEvents.forEach((event) => {
            delete event.stacks
          })
        }

        data.dag = data.temp || data.dag // 和后端约定了，如果缓存有数据则获取temp
        // 共享缓存
        data.syncType = data.shareCache ? 'shareCache' : data.syncType
        this.reformDataflow(data)
        this.setTaskInfo({
          id: data.id,
          syncType: data.syncType,
          testTaskId: data.testTaskId,
          taskRecordId: data.taskRecordId,
        })
        this.startLoopTask(id)
        this.titleSet()
        return data
      } catch (error) {
        console.error(error)
        this.$message.error(i18n.t('packages_dag_mixins_editor_renwujiazaichu'))
        this.handlePageReturn()
      } finally {
        this.loading = false
      }
    },

    startLoopTask(id) {
      // console.debug(i18n.t('packages_dag_mixins_editor_debug4')) // eslint-disable-line
      clearTimeout(this.startLoopTaskTimer)
      if (!id) return
      this.startLoopTaskTimer = setTimeout(async () => {
        const { parent_task_sign } = this.$route.query || {}
        const data = await taskApi.get(id, {}, { parent_task_sign })
        if (this.destory) return
        if (data) {
          if (data.errorEvents?.length) {
            // 清除 stacks
            data.errorEvents.forEach((event) => {
              delete event.stacks
            })
          }

          // 同步下任务上的属性，重置后会改变
          this.dataflow.attrs = data.attrs

          makeStatusAndDisabled(data)
          // console.debug(
          //   i18n.t('packages_dag_mixins_editor_debug3', { val1: this.dataflow.status, val2: data.status }),
          //   data
          // ) // eslint-disable-line
          if (this.dataflow.status !== data.status) {
            // console.debug(i18n.t('packages_dag_mixins_editor_debug2')) // eslint-disable-line
            this.dataflow.status = data.status
          }
          // 需要实时更新的字段
          this.dataflow.lastStartDate = data.lastStartDate
          this.dataflow.startTime = data.startTime
          this.dataflow.pingTime = data.pingTime
          this.dataflow.shareCdcStop = data.shareCdcStop
          this.dataflow.shareCdcStopMessage = data.shareCdcStopMessage
          this.dataflow.timeDifference = data.timeDifference
          this.dataflow.currentEventTimestamp = data.currentEventTimestamp
          this.dataflow.functionRetryStatus = data.functionRetryStatus
          this.dataflow.taskRetryStartTime = data.taskRetryStartTime

          if (data.currentEventTimestamp) {
            this.dataflow.currentEventTimestampLabel = dayjs(
              data.currentEventTimestamp,
            ).format('YYYY-MM-DD HH:mm:ss')
          }

          if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动
          Object.assign(this.dataflow.disabledData, data.btnDisabled)

          $emit(this, 'loop-task')
          this.startLoopTask(id)
        }
      }, 5000)
    },

    stopLoopTask() {
      clearTimeout(this.startLoopTaskTimer)
    },

    initWS() {
      // console.debug(i18n.t('packages_dag_mixins_editor_debug'), this.$ws.ws) // eslint-disable-line
      this.$ws.off('editFlush', this.handleEditFlush)
      this.$ws.on('editFlush', this.handleEditFlush)
      this.$ws.send({
        type: 'editFlush',
        taskId: this.dataflow.id,
        data: {
          opType: 'subscribe',
        },
      })
    },

    // ws 探活
    wsAgentLive() {
      this.$ws.send({
        type: 'editFlush',
        taskId: this.dataflow.id,
        data: {
          opType: 'subscribe',
        },
      })
    },

    deleteSelectedConnections() {
      const selectedConnections = this.$store.state.dataflow.selectedConnections
      if (!selectedConnections.length) return

      selectedConnections.forEach(({ target, source }) => {
        const conn = this.jsPlumbIns.select({
          target: NODE_PREFIX + target,
          source: NODE_PREFIX + source,
        })

        if (conn) {
          this.command.exec(
            new RemoveConnectionCommand({
              source,
              target,
            }),
          )
        }
      })

      this.deselectAllConnections()
    },

    async showNodePopover(type, data, el) {
      type === 'node' && this.handleDeselectAllConnections()
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

    handleClickNodePopover(node) {
      this.nodeMenu.show = false
      if (this.nodeMenu.type === 'node') {
        this.quickAddNode(this.nodeMenu.data, node)
      } else {
        this.addNodeOnConnByNodeMenu(node)
      }
    },

    handleToggleExpand() {
      this.showLeftSider = !this.showLeftSider
      if (this.activeType === 'node') {
        this.deselectAllNodes()
        this.setActiveNode(null)
      }
    },

    handleConsoleAutoLoad() {
      this.toggleConsole(true)
      const logType = ['renewing', 'renew_failed'].includes(
        this.dataflow.status,
      )
        ? 'reset'
        : 'checkDag'
      this.$refs.console?.startAuto(logType)
    },

    /**
     * 防止node重叠
     */
    preventNodeOverlap(nodes) {
      if (nodes?.length) {
        const map = {}
        const ifOverlap = nodes.some((node) => {
          const pos = node.attrs.position.join(',')
          if (map[pos]) return true
          map[pos] = true
          return false
        })
        if (ifOverlap) {
          this.handleAutoLayout()
        }
      }
    },

    titleSet() {
      setPageTitle(`${this.dataflow.name} - ${this.$t(this.$route.meta.title)}`)
    },

    async initPdkProperties() {
      const databaseItems = await databaseTypesApi.get({
        filter: JSON.stringify({
          fields: {
            messages: true,
            tags: true,
            pdkHash: true,
            properties: true,
          },
        }),
      })
      const tagsMap = {}
      const doubleActiveMap = {}
      const propertiesMap = {}

      databaseItems.forEach(({ properties, pdkHash, tags }) => {
        const nodeProperties = properties?.node

        if (nodeProperties) {
          propertiesMap[pdkHash] = nodeProperties
        }
        if (tags?.includes('schema-free')) {
          tagsMap[pdkHash] = true
        }
        if (tags?.includes('doubleActive')) {
          doubleActiveMap[pdkHash] = true
        }
      })
      this.setPdkPropertiesMap(propertiesMap)
      this.setPdkSchemaFreeMap(tagsMap)
      this.setPdkDoubleActiveMap(doubleActiveMap)

      // console.log(propertiesMap, tagsMap) // eslint-disable-line
    },

    getIsDataflow() {
      const routeName = this.$route.name
      return [
        'DataflowNew',
        'DataflowEditor',
        'DataflowViewer',
        'TaskMonitor',
      ].includes(routeName)
    },

    beforeStartTask() {
      const { over } = this.$refs.console?.getData() || {}
      if (!over) {
        setTimeout(this.beforeStartTask, 800)
      } else {
        this.startTask()
      }
    },

    startTask() {
      const buriedCode = this.getIsDataflow() ? 'taskStart' : 'migrationStart'
      taskApi
        .batchStart([this.dataflow.id], {
          silenceMessage: true,
        })
        .then(() => {
          this.buried(buriedCode, { result: true })
          this.gotoViewer()
        })
        .catch((error) => {
          this.buried(buriedCode, { result: false })
          this.handleError(error)
        })
    },
    // 获取任务的按钮权限
    async getTaskPermissions() {
      if (!this.isDaas) return
      const id = this.dataflow.id || this.$route.params?.id
      if (!id) return
      const data = await dataPermissionApi.dataActions({
        dataType: 'Task',
        dataId: id,
      })
      for (const key in this.buttonShowMap) {
        this.buttonShowMap[key] = data.includes(key)
      }
    },

    // 升级专业版
    handleShowUpgradeFee(msg) {
      this.upgradeFeeVisibleTips = msg
      this.upgradeFeeVisible = true
    },

    // 升级规格
    handleShowUpgradeCharges(msg) {
      this.upgradeChargesVisibleTips = msg
      this.upgradeChargesVisible = true
    },

    handleShowUpgradeDialog(err) {
      !this.isDaas &&
        this.$axios
          .get(
            `api/tcm/agent?filter=${encodeURIComponent(
              JSON.stringify({
                size: 100,
                page: 1,
              }),
            )}`,
          )
          .then(async (data) => {
            const { items = [] } = data

            if (items.some((t) => t.status === 'Stopped')) {
              this.$message.error(this.$t('public_task_error_schedule_limit'))
              return
            }

            items.length <= 1 &&
            items.some(
              (t) =>
                t.orderInfo?.chargeProvider === 'FreeTier' ||
                !t.orderInfo?.amount,
            )
              ? this.handleShowUpgradeFee(err.message)
              : this.handleShowUpgradeCharges(err.message)
          })
    },

    handleAddNodeToCenter(item) {
      const { x, y } = this.$refs.paperScroller.getPaperCenterPos()
      const position = this.getNewNodePosition(
        [x - NODE_WIDTH / 2, y - NODE_HEIGHT / 2],
        [0, 120],
      )
      const node = this.handleAddNodeToPos(position, item)
      if (position[1] !== y) {
        this.$refs.paperScroller.centerNode(node)
      }

      return node
    },

    handleAddNodeToConnect(item) {
      if (!this.allNodes.length) {
        this.handleAddNodeToCenter(item)
        return
      }

      const source = this.allNodes.find((n) => !n.$outputs.length)
      const target = this.quickAddNode(source, item)
      this.$refs.paperScroller.centerNode(target)
    },

    openDataCapture() {
      window.open(
        this.$router.resolve({
          name: 'DataCapture',
          params: { id: this.dataflow.id },
        }).href,
        `DataCapture-${this.dataflow.id}`,
      )
    },

    hasFeature(feature) {
      return (
        !this.isDaas || this.$store.getters['feature/hasFeature']?.(feature)
      )
    },
  },
}
