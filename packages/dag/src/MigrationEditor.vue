<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @undo="handleUndo"
      @redo="handleRedo"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @zoom-to="handleZoomTo"
      @showSettings="handleShowSettings"
      @center-content="handleCenterContent"
      @auto-layout="handleAutoLayout"
      @change-name="handleUpdateName"
      @locate-node="handleLocateNode"
      @start="handleStart"
      @stop="handleStop"
      @forceStop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @detail="handleDetail"
    >
      <template #status="{ result }">
        <span v-if="result && result[0]" :class="['status-' + result[0].status, 'status-block', 'mr-2']">
          {{ t('task_preview_status_' + result[0].status) }}
        </span>
      </template>
    </TopHeader>
    <section class="layout-wrap layout-has-sider position-relative">
      <!--左侧边栏-->
      <VExpandXTransition>
        <LeftSider
          v-if="!stateIsReadonly"
          v-show="showLeftSider"
          @move-node="handleDragMoveNode"
          @drop-node="handleAddNodeByDrag"
          @add-node="handleAddNode"
          @toggle-expand="handleToggleExpand"
        />
      </VExpandXTransition>
      <div
        v-if="!stateIsReadonly"
        v-show="!showLeftSider"
        class="sider-expand-wrap flex justify-center align-center rotate-180"
      >
        <VIcon size="24" class="font-color-light" @click.stop="handleToggleExpand">expand</VIcon>
      </div>
      <!--内容体-->
      <main id="dfEditorContent" ref="layoutContent" class="layout-content flex-1 overflow-hidden">
        <PaperScroller
          ref="paperScroller"
          :nav-lines="navLines"
          @add-node="handleAddNodeToPos"
          @mouse-select="handleMouseSelect"
          @change-scale="handleChangeScale"
          @click-blank="showLeftSider = true"
        >
          <DFNode
            v-for="n in allNodes"
            :key="n.id"
            :node-id="n.id"
            :id="NODE_PREFIX + n.id"
            :js-plumb-ins="jsPlumbIns"
            :class="{
              'options-active': nodeMenu.typeId === n.id
            }"
            @drag-start="onNodeDragStart"
            @drag-move="onNodeDragMove"
            @drag-stop="onNodeDragStop"
            @deselectAllNodes="deselectAllNodes"
            @deselectNode="nodeDeselectedById"
            @nodeSelected="nodeSelectedById"
            @delete="handleDeleteById"
            @show-node-popover="showNodePopover"
          ></DFNode>
        </PaperScroller>
        <div v-if="!allNodes.length && stateIsReadonly" class="absolute-fill flex justify-center align-center">
          <EmptyItem></EmptyItem>
        </div>
        <!--<PaperEmpty v-else-if="!allNodes.length"></PaperEmpty>-->
        <NodePopover
          :popover="nodeMenu"
          @click-node="handleClickNodePopover"
          @hide="nodeMenu.typeId = ''"
        ></NodePopover>
      </main>
      <!--配置面板-->
      <ConfigPanel ref="configPanel" :settings="dataflow" :scope="formScope" @hide="onHideSidebar" />
    </section>
  </section>
</template>

<script>
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSider from './components/migration/LeftSider'
import DFNode from './components/DFNode'
import { jsPlumb, config } from './instance'
import { NODE_PREFIX } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from './components/migration/ConfigPanel'
import { uuid } from '@tap/shared'
import { taskApi } from '@tap/api'
import resize from 'web-core/directives/resize'
import { merge } from 'lodash'
import EmptyItem from './components/EmptyItem'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import NodePopover from './components/NodePopover'
import { VIcon } from '@tap/component'
import { VExpandXTransition } from '@tap/component'
import { observable } from '@formily/reactive'
import Locale from './mixins/locale'

export default {
  name: 'MigrationEditor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor, Locale],

  components: {
    VExpandXTransition,
    NodePopover,
    EmptyItem,
    ConfigPanel,
    PaperScroller,
    TopHeader,
    DFNode,
    LeftSider,
    VIcon
  },

  data() {
    const dataflow = observable({
      id: '',
      name: ''
    })

    return {
      NODE_PREFIX,
      status: 'draft',
      loading: false,
      editable: false,
      isSaving: false,
      jsPlumbIns: jsPlumb.getInstance(config),
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false,

      nodeMenu: {
        show: false,
        type: '',
        typeId: '',
        reference: null,
        data: null,
        connectionData: {}
      },

      dataflow,

      scale: 1,
      showLeftSider: true
    }
  },

  computed: {
    formScope() {
      return {
        ...this.scope,
        $settings: this.dataflow
      }
    }
  },

  watch: {
    'allNodes.length'(v) {
      if (v === 0) {
        this.showLeftSider = true
      }
    }
  },

  async created() {
    if (this.$route.name === 'DataflowViewer') {
      this.setStateReadonly(true)
    }
    this.setValidateLanguage()
    await this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
        // this.initWS()
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    })
  },

  beforeDestroy() {
    this.command = null
    this.jsPlumbIns?.destroy()
    this.resetWorkspace()
    this.resetState()
    this.$ws.off('editFlush', this.handleEditFlush)
  },

  methods: {
    async initNodeType() {
      this.addProcessorNode([
        {
          name: '表编辑',
          type: 'table_rename_processor'
        },
        {
          name: '字段编辑',
          type: 'migrate_field_rename_processor'
        } /*,
        {
          name: '字段编辑',
          type: 'migrate_field_rename_processor'
        }*/ /*,
        {
          name: 'JS处理',
          type: 'migrate_js_processor'
        }*/
      ])
      this.addResourceIns(allResourceIns)
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)

      if (data) {
        const { dag } = data
        this.setStateReadonly(this.$route.name === 'MigrateViewer' ? true : this.dataflow.disabledData.edit)
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.$refs.paperScroller.autoResizePaper()
        this.handleCenterContent()
      }
    },

    gotoViewer() {
      this.$router
        .push({
          name: 'MigrateViewer',
          params: {
            id: this.dataflow.id,
            action: 'dataflowViewer'
          }
        })
        .catch(() => {
          console.log('Current route: DataflowViewer') // eslint-disable-line
        })
    },

    /*async validate() {
      if (!this.dataflow.name) return this.t('editor_cell_validate_empty_name')

      // 至少两个数据节点
      const dataNodes = this.allNodes.filter(node => node.type === 'database' || node.type === 'table')
      // if (dataNodes.length < 2) {
      //   return this.t('editor_cell_validate_none_data_node')
      // }

      await this.validateAllNodes()

      const sourceMap = {},
        targetMap = {},
        edges = this.allEdges
      edges.forEach(item => {
        let _source = sourceMap[item.source]
        let _target = targetMap[item.target]

        if (!_source) {
          sourceMap[item.source] = [item]
        } else {
          _source.push(item)
        }

        if (!_target) {
          targetMap[item.target] = [item]
        } else {
          _target.push(item)
        }
      })

      let someErrorMsg = ''
      // 检查每个节点的源节点个数、连线个数、节点的错误状态
      this.allNodes.some(node => {
        const { id } = node
        const minInputs = node.__Ctor.minInputs ?? 1
        const minOutputs = node.__Ctor.minOutputs ?? (node.type !== 'database' && node.type !== 'table') ? 1 : 0
        const inputNum = node.$inputs.length
        const outputNum = node.$outputs.length

        if (!sourceMap[id] && !targetMap[id]) {
          // 存在没有连线的节点
          someErrorMsg = `「 ${node.name} 」没有任何连线`
          return true
        }

        if (inputNum < minInputs) {
          someErrorMsg = `「 ${node.name} 」至少需要${minInputs}个源节点`
          return true
        }

        // 非数据节点至少有一个目标
        if (outputNum < minOutputs) {
          someErrorMsg = `「 ${node.name} 」至少需要${minOutputs}个目标节点`
          return true
        }

        if (this.hasNodeError(id)) {
          someErrorMsg = `「 ${node.name} 」配置异常`
          return true
        }
      })

      if (someErrorMsg) return someErrorMsg

      someErrorMsg = this.validateAgent(dataNodes)

      if (someErrorMsg) return someErrorMsg

      someErrorMsg = this.validateLink(dataNodes)

      if (someErrorMsg) return someErrorMsg

      // 检查链路的末尾节点类型是否是表节点
      // const firstNodes = this.allNodes.filter(node => !targetMap[node.id]) // 链路的首节点
      // const nodeMap = this.allNodes.reduce((map, node) => ((map[node.id] = node), map), {})
      // if (firstNodes.some(node => !this.isEndOfTable(node, sourceMap, nodeMap))) return `链路的末位需要是一个数据节点`

      return null
    },*/

    async saveAsNewDataflow() {
      try {
        this.isSaving = true
        const data = this.getDataflowDataToSave()
        const dataflow = await taskApi.post(data)
        this.isSaving = false
        this.reformDataflow(dataflow)
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        // this.$message.success(this.t('message_save_ok'))
        await this.$router.replace({
          name: 'MigrateEditor',
          params: { id: dataflow.id, action: 'dataflowEdit' }
        })
      } catch (e) {
        // this.$showError(e, '任务保存出错', '出现的问题:')
        // eslint-disable-next-line no-console
        console.error('任务保存出错', e)
        this.handleError(e)
      }
    },

    createNode(position, item) {
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const node = merge(
        {
          id: uuid(),
          attrs: { position }
        },
        item
      )

      const ins = item.__Ctor || getResourceIns(item)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false
      })

      return node
    },

    handlePageReturn() {
      this.$router.push({
        name: 'migrateList'
      })
    },

    handleEdit() {
      this.$router.push({
        name: 'MigrateEditor',
        params: { id: this.dataflow.id, action: 'dataflowEdit' }
      })
    },

    handleDetail() {
      let subId = this.dataflow.statuses[0]?.id || ''
      if (!subId) {
        this.$message.error('该复制任务没有子任务')
        return
      }

      this.$router.push({
        name: 'MigrateStatistics',
        query: {
          id: this.dataflow.id,
          subId: subId
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarW: 320px;
$hoverBg: #e1e1e1;
$radius: 3px;
$baseHeight: 26px;
$sidebarBg: #fff;

.layout-sidebar {
  position: relative;
  z-index: 10;
  display: flex;
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
  min-width: 0;
  min-height: 0;
  &.layout-has-sider {
    flex-direction: row;
  }
}

.layout-content {
  position: relative;
  background-color: #f9f9f9;
  /*background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJ2LTc2IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZGVmcyBpZD0idi03NSI+PHBhdHRlcm4gaWQ9InBhdHRlcm5fMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCBpZD0idi03NyIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0FBQUFBQSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgaWQ9InYtNzkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl8wKSIvPjwvc3ZnPg==);
  background-color: #f5f8fe;*/

  ::v-deep {
    .connection-highlight,
    .connection-selected {
      path:nth-child(2) {
        stroke: #2c65ff;
      }
      path:nth-child(3) {
        fill: #2c65ff;
        stroke: #2c65ff;
      }
    }

    .remove-connection-label {
      z-index: 1001;
      position: relative;
      padding: 4px;
      border-radius: 100%;
      background-color: #fa6303;
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

    .conn-btn__wrap {
      z-index: 1002;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      &:hover {
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }
    .conn-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 20px;
      background-color: #9bb6ff;
      border-radius: 100%;
      pointer-events: none;
      .v-icon {
        width: 16px;
        height: 16px;
        font-size: 12px;
        background-color: #2c65ff;
        color: #fff;
        border-radius: 100%;
        &__svg {
          width: 1em;
          height: 1em;
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
  background: rgba(23, 159, 251, 0.1);
  border: 1px solid #179ffb;
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

.sider-expand-wrap {
  position: absolute;
  z-index: 2;
  left: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0px 0px 30px rgb(0 0 0 / 6%);

  &:hover .v-icon {
    color: map-get($color, primary);
  }
}
</style>
