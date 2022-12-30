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
    />
    <section class="layout-wrap layout-has-sider position-relative">
      <!--左侧边栏-->
      <VExpandXTransition>
        <LeftSider
          v-if="!stateIsReadonly"
          @move-node="handleDragMoveNode"
          @drop-node="handleAddNodeByDrag"
          @add-node="handleAddNode"
          @toggle-expand="handleToggleExpand"
        />
      </VExpandXTransition>
      <section class="layout-wrap flex-1">
        <!--内容体-->
        <main id="dfEditorContent" ref="layoutContent" class="layout-content flex-1 overflow-hidden">
          <PaperScroller
            ref="paperScroller"
            :nav-lines="navLines"
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
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
            <VEmpty large />
          </div>
          <!--<PaperEmpty v-else-if="!allNodes.length"></PaperEmpty>-->
          <TransformLoading :show="transformLoading" />
          <NodePopover
            :popover="nodeMenu"
            @click-node="handleClickNodePopover"
            @hide="nodeMenu.typeId = ''"
          ></NodePopover>
        </main>
        <ConsolePanel ref="console"></ConsolePanel>
      </section>

      <!--配置面板-->
      <ConfigPanel ref="configPanel" :settings="dataflow" :scope="scope" @hide="onHideSidebar" />
    </section>
  </section>
</template>

<script>
import i18n from '@tap/i18n'

import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSider from './components/migration/LeftSider'
import DFNode from './components/DFNode'
import { jsPlumb, config } from './instance'
import { NODE_PREFIX } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import ConfigPanel from './components/migration/ConfigPanel'
import { uuid } from '@tap/shared'
import { taskApi } from '@tap/api'
import resize from '@tap/component/src/directives/resize'
import { merge } from 'lodash'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import NodePopover from './components/NodePopover'
import TransformLoading from './components/TransformLoading'
import { VExpandXTransition, VEmpty } from '@tap/component'
import ConsolePanel from './components/migration/ConsolePanel'

export default {
  name: 'MigrationEditor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  components: {
    ConsolePanel,
    VExpandXTransition,
    NodePopover,
    VEmpty,
    ConfigPanel,
    PaperScroller,
    TopHeader,
    DFNode,
    LeftSider,
    TransformLoading
  },

  inject: ['buried'],

  data() {
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

      scale: 1,
      showLeftSider: true
    }
  },

  watch: {
    'dataflow.status'(v) {
      this.checkGotoViewer()
      if (['DataflowViewer', 'MigrateViewer'].includes(this.$route.name) && ['renewing', 'renew_failed'].includes(v)) {
        this.handleConsoleAutoLoad()
      }
    }
  },

  mounted() {
    this.setValidateLanguage()
    this.initNodeType()
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
    this.unWatchStatus?.()
    this.toggleConsole(false)
  },

  methods: {
    initNodeType() {
      this.addProcessorNode([
        {
          name: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
          type: 'table_rename_processor'
        },
        {
          name: i18n.t('packages_dag_src_migrationeditor_ziduanbianji'),
          type: 'migrate_field_rename_processor'
        },
        {
          name: i18n.t('packages_dag_src_migrationeditor_jSchuli'),
          type: 'migrate_js_processor'
        }
      ])
      this.addResourceIns(allResourceIns)
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)

      if (data) {
        if (this.destory) return
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
        this.preventNodeOverlap(dag.nodes)
      }
    },

    gotoViewer(newTab) {
      if (this.$route.name === 'MigrationMonitor') return
      if (newTab) {
        window.open(
          this.$router.resolve({
            name: 'MigrationMonitor',
            query: {
              id: this.dataflow.id
            },
            params: {
              id: this.dataflow.id
            }
          }).href,
          `MigrateStatistics_${this.dataflow.id}`
        )
      } else {
        this.$router.push({
          name: 'MigrationMonitor',
          query: {
            id: this.dataflow.id
          },
          params: {
            id: this.dataflow.id
          }
        })
      }
    },

    async saveAsNewDataflow() {
      this.buried('migrationSubmit')
      this.isSaving = true
      const data = this.getDataflowDataToSave()
      try {
        const dataflow = await taskApi.post(data)
        this.buried('migrationSubmit', { result: true })
        this.reformDataflow(dataflow)
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        this.setTaskInfo(this.dataflow)
        // this.$message.success(this.$t('packages_dag_message_save_ok'))
        await this.$router.replace({
          name: 'MigrateEditor',
          params: { id: dataflow.id, action: 'dataflowEdit' }
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(i18n.t('packages_dag_src_editor_renwubaocunchu'), e)
        this.buried('migrationSubmit', { result: false })
        if (e?.data?.code === 'Task.RepeatName') {
          const newName = await this.makeTaskName(data.name)
          this.newDataflow(newName)
        } else if (e?.data?.code === 'InvalidPaidPlan') {
          this.$router.push({
            name: 'migrateList'
          })
        } else {
          this.handleError(e)
        }
      }
      this.isSaving = false
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
      if (!this.allNodes.length && !this.nameHasUpdated && this.$store.state.dataflow.taskId) {
        this.$confirm(
          this.$t('packages_dag_page_return_confirm_content'),
          this.$t('packages_dag_page_return_confirm_title'),
          {
            type: 'warning',
            closeOnClickModal: false,
            confirmButtonText: this.$t('packages_dag_page_return_confirm_ok_text'),
            cancelButtonText: this.$t('packages_dag_page_return_confirm_cancel_text')
          }
        ).then(res => {
          if (res) {
            taskApi.delete(this.dataflow.id)
          }
          this.$router.push({
            name: 'migrateList'
          })
        })
      } else {
        this.$router.push({
          name: 'migrateList'
        })
      }
    },

    handleEdit() {
      this.$router.push({
        name: 'MigrateEditor',
        params: { id: this.dataflow.id, action: 'dataflowEdit' }
      })
    },

    handleDetail() {
      this.$router.push({
        name: 'MigrationMonitor',
        query: {
          id: this.dataflow.id
        },
        params: {
          id: this.dataflow.id
        }
      })
    },

    async save(needStart) {
      this.isSaving = true
      const errorMsg = await this.validate()
      if (errorMsg) {
        if (this.destory) return
        this.$message.error(errorMsg)
        this.isSaving = false
        return
      }

      if (!this.dataflow.id) {
        return this.saveAsNewDataflow()
      }

      const data = this.getDataflowDataToSave()
      let isOk = false

      try {
        this.initWS()
        const result = await taskApi[needStart ? 'saveAndStart' : 'save'](data)
        this.reformDataflow(result)
        !needStart && this.$message.success(this.$t('packages_dag_message_save_ok'))
        this.setEditVersion(result.editVersion)
        this.isSaving = false
        isOk = true
      } catch (e) {
        this.handleError(e)
      }
      this.isSaving = false
      this.toggleConsole(true)
      this.$refs.console?.startAuto('checkDag') // 信息输出自动加载
      if (!needStart) {
        // this.$refs.console?.stopAuto() // 再load一下信息输出，并且停掉计时器
        // this.$refs.console?.loadData() // 再load一下信息输出，并且停掉计时器
      }
      return isOk
    },

    async handleStart() {
      this.buried('migrationStart')
      this.unWatchStatus?.()
      this.unWatchStatus = this.$watch('dataflow.status', v => {
        if (['error', 'complete', 'running', 'stop', 'schedule_failed'].includes(v)) {
          this.$refs.console?.loadData()
          if (v !== 'running') {
            this.$refs.console?.stopAuto()
          } else {
            this.toggleConsole(false)
            this.gotoViewer(false)
          }
          // this.unWatchStatus()
        }
        if (['MigrateViewer'].includes(this.$route.name)) {
          if (['renewing'].includes(v)) {
            this.handleConsoleAutoLoad()
          } else {
            this.toggleConsole(false)
          }
        }
      })
      const flag = await this.save(true)
      if (flag) {
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        // this.gotoViewer()
        this.buried('taskSubmit', { result: true })
      } else {
        this.buried('taskSubmit', { result: false })
      }
    },

    checkGotoViewer() {
      console.log('editor:checkGotoViewer') // eslint-disable-line
      if (this.dataflow.disabledData.edit) {
        // 不可编辑
        // this.gotoViewer()
        this.setStateReadonly(true)
        return true
      } else {
        this.setStateReadonly(false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarW: 260px;
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
