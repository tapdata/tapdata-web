<script>
import { CancelToken, lineageApi } from '@tap/api'
import { makeStatusAndDisabled } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import PaperScroller from '@tap/dag/src/components/PaperScroller.vue'
import { config } from '@tap/dag/src/config'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH } from '@tap/dag/src/constants'
import { jsPlumb } from '@tap/dag/src/instance'
import { connectorActiveStyle } from '@tap/dag/src/style'
import dagre from 'dagre'
import { mapGetters, mapMutations } from 'vuex'
import LinePopover from './LinePopover'
import TableNode from './TableNode'
export default {
  name: 'TableLineage',
  components: { PaperScroller, TableNode, IconButton, LinePopover },
  props: {
    connectionId: String,
    tableName: String,
    isShow: Boolean,
  },
  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)
    return {
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt',
      NODE_PREFIX,
      jsPlumbIns: jsPlumb.getInstance(config),
      nodeMenu: {
        show: false,
        type: '',
        typeId: '',
        reference: null,
        data: null,
        connectionData: {},
        tasks: [],
      },
      loading: false,
      isFullscreen: false,
      fullscreenDisabled: false,
      fullscreenTip: this.$t('packages_form_js_editor_fullscreen'),
    }
  },
  computed: {
    ...mapGetters('dataflow', ['allNodes', 'allEdges', 'nodeById']),
  },
  watch: {},
  mounted() {
    this.initView()
    this.unwatch = this.$watch(
      () => [this.connectionId, this.tableName, this.isShow],
      () => {
        this.initView()
      },
    )
  },
  unmounted() {
    this.unwatch?.()
    this.jsPlumbIns?.destroy()
    this.resetState()
    this.cancelSource?.cancel()
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
    ]),

    async initView() {
      if (!this.isShow) return

      this.reset()
      await this.$nextTick()
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
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()
      try {
        const result = await lineageApi.findByTable(
          this.connectionId,
          this.tableName,
          {
            cancelToken: this.cancelSource.token,
          },
        )
        dag = result.dag || {}
        this.setEdges(dag.edges)
        // await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.handleAutoLayout()
      } catch (error) {
        console.log(error) // eslint-disable-line
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

      dg.setGraph({
        nodesep: 220,
        ranksep: 220,
        marginx: 0,
        marginy: 0,
        rankdir: 'LR' /*, ranker: 'tight-tree' */,
      })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach((n) => {
        let { width = NODE_WIDTH, height = NODE_HEIGHT } =
          document
            .getElementById(NODE_PREFIX + n.id)
            ?.getBoundingClientRect() || {}
        width /= scale
        height /= scale
        dg.setNode(NODE_PREFIX + n.id, { width, height })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
      })
      this.jsPlumbIns.getAllConnections().forEach((edge) => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)

      this.jsPlumbIns.setSuspendDrawing(true)

      dg.nodes().forEach((n) => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          this.updateNodeProperties({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top],
              },
            },
          })
        }
      })

      this.$nextTick(() => {
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
        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []

        // 数据兼容
        const defaultAttrs = {
          position: [0, 0],
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
        const tasks = attrs.tasks
          ? Object.values(attrs.tasks).map(makeStatusAndDisabled)
          : []
        let overlays

        if (tasks.length) {
          overlays = [
            [
              'Custom',
              {
                id: 'taskTag',
                create: () => {
                  const size = tasks.length
                  const taskName = tasks[0].name
                  const div = document.createElement('div')

                  div.className = `table-lineage-connection-label flex align-center overflow-hidden rounded-4 task-status-${
                    tasks[0].status
                  }`
                  div.innerHTML = `<span title="${taskName}" class="overflow-hidden clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4">${taskName}</span>`

                  if (size > 1) {
                    const handleClick = (ev) => {
                      ev.stopPropagation()
                      this.showNodePopover(ev.target, tasks.slice(1))
                    }
                    const dropdownSlot = document.createElement('span')
                    dropdownSlot.className =
                      'clickable ellipsis px-1 el-tag el-tag--small el-tag--light rounded-4 flex-shrink-0'
                    dropdownSlot.innerHTML = `+${size - 1}<i tabindex="0" class="el-icon-arrow-down"></i>`
                    dropdownSlot.addEventListener('click', handleClick)
                    div.classList.add('compact-tag')
                    div.append(dropdownSlot)

                    div.destroy = () => {
                      dropdownSlot.removeEventListener('click', handleClick)
                    }
                  }

                  return div
                },
                events: {
                  click: () => {
                    this.$emit('click-task', tasks[0])
                  },
                },
              },
            ],
          ]
        }

        this.jsPlumbIns.connect({
          uuids: [
            `${NODE_PREFIX}${source}_source`,
            `${NODE_PREFIX}${target}_target`,
          ],
          overlays,
        })
      })
    },

    reset() {
      // 解绑overlay事件
      this.jsPlumbIns.getConnections().forEach((connection) => {
        const taskTag = connection.getOverlay('taskTag')

        if (taskTag) {
          const $el = taskTag.getElement()
          $el.destroy?.()
        }
      })
      this.jsPlumbIns.reset()
      this.resetState()
      this.setStateReadonly(true)
    },

    onNodeDragStop(isNotMove, oldProperties, newProperties) {
      this.$refs.paperScroller.autoResizePaper()
      !isNotMove &&
        newProperties.forEach((prop) => {
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

      const table = {
        ...node,
        id: node.metadata.id,
        name: node.table,
        LDP_TYPE: 'table',
        isObject: true,
      }

      this.$emit('node-dblclick', table)
    },

    toggleFullscreen() {
      this.fullscreenDisabled = true
      this.isFullscreen = !this.isFullscreen
      // 加速关闭 tooltip
      this.$refs.fullscreenTooltip.setExpectedState(false)
      this.$refs.fullscreenTooltip.handleClosePopper()
      setTimeout(() => {
        this.handleCenterContent()
        this.$nextTick(() => {
          this.fullscreenDisabled = false
          this.fullscreenTip = this.$t(
            this.isFullscreen
              ? 'packages_form_js_editor_exit_fullscreen'
              : 'packages_form_js_editor_fullscreen',
          )
        })
      }, 15)
    },

    handleChangeScale(scale) {
      this.jsPlumbIns.setZoom(scale)
    },
  },
  emits: ['click-task', 'node-dblclick'],
}
</script>

<template>
  <div
    v-loading="loading"
    class="table-lineage h-100 position-relative"
    :class="{
      fullscreen: isFullscreen,
    }"
    :element-loading-text="`${$t('packages_business_loading')}...\n${$t('packages_ldp_lineage_loading_tips')}`"
  >
    <PaperScroller ref="paperScroller" @change-scale="handleChangeScale">
      <TableNode
        v-for="node in allNodes"
        :id="NODE_PREFIX + node.id"
        :key="node.id"
        class="shadow-sm"
        :data="node"
        :node-id="node.id"
        :js-plumb-ins="jsPlumbIns"
        :class="{
          active:
            node.table === tableName && node.connectionId === connectionId,
        }"
        @dblclick="handleNodeDblClick(node)"
        @drag-stop="onNodeDragStop"
      />
    </PaperScroller>

    <div
      class="paper-toolbar position-absolute flex gap-1 bg-white p-1 rounded-lg shadow-sm"
      style="--btn-space: 0"
    >
      <IconButton click-and-rotate @click="handleRefresh">refresh</IconButton>
      <ElTooltip
        transition="tooltip-fade-in"
        :open-delay="50"
        :content="`${$t('packages_dag_button_center_content')}(Shift + 1)`"
      >
        <IconButton @click="handleCenterContent">compress</IconButton>
      </ElTooltip>
      <ElTooltip
        transition="tooltip-fade-in"
        :open-delay="50"
        :content="`${$t('packages_dag_button_zoom_out')}(${commandCode} -)`"
      >
        <IconButton @click="handleZoomOut">remove-outline</IconButton>
      </ElTooltip>
      <ElTooltip
        transition="tooltip-fade-in"
        :open-delay="50"
        :content="`${$t('packages_dag_button_zoom_in')}(${commandCode} +)`"
      >
        <IconButton @click="handleZoomIn">add-outline</IconButton>
      </ElTooltip>
      <ElTooltip
        ref="fullscreenTooltip"
        transition="tooltip-fade-in"
        :open-delay="50"
        :disabled="fullscreenDisabled"
        :content="fullscreenTip"
      >
        <IconButton @click="toggleFullscreen">{{
          isFullscreen ? 'suoxiao' : 'fangda'
        }}</IconButton>
      </ElTooltip>
    </div>

    <LinePopover
      :popover="nodeMenu"
      @click-task="$emit('click-task', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.paper-toolbar {
  right: 16px;
  top: 16px;
}
.table-lineage {
  &.fullscreen {
    position: fixed !important;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }

  :deep(.table-lineage-connection-label) {
    max-width: 180px;
    z-index: 1001;
    .el-tag {
      background-color: inherit;
      color: inherit;
      border-color: currentColor;
    }
    &.compact-tag {
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

  :deep(.el-loading-text) {
    white-space: pre-wrap;
  }
}
</style>
