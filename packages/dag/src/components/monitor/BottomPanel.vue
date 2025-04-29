<script>
import { taskApi } from '@tap/api'

import NodeLog from '@tap/business/src/components/logs/NodeLog'
import MilestoneList from '@tap/business/src/components/milestone/List'
import RelationList from '@tap/business/src/views/task/relation/List.vue'
import focusSelect from '@tap/component/src/directives/focusSelect'
import resize from '@tap/component/src/directives/resize'
import { mapActions, mapGetters, mapMutations } from 'vuex'

import Alert from './components/Alert'
import Record from './components/Record'
import TaskInspect from './components/TaskInspect'
import '@tap/component/src/directives/resize/index.scss'

export default {
  name: 'ConfigPanel',
  components: {
    Record,
    Alert,
    RelationList,
    NodeLog,
    MilestoneList,
    TaskInspect,
  },
  directives: {
    resize,
    focusSelect,
  },
  props: {
    onlyLog: {
      type: Boolean,
      default: false,
    },
    hideLog: Boolean,
  },
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      isCommunity: import.meta.env.VUE_APP_MODE === 'community',
      currentTab: 'milestone',
      name: this.activeNode?.name,
      relationCount: 0,
      nodeId: '',
    }
  },
  computed: {
    ...mapGetters('dataflow', [
      'activeType',
      'activeNode',
      'nodeById',
      'stateIsReadonly',
    ]),

    showAlert() {
      return !['SharedCacheMonitor'].includes(this.$route.name)
    },
  },
  watch: {
    'activeNode.name': function (v) {
      this.name = v
    },
  },
  mounted() {
    if (['MigrationMonitorViewer'].includes(this.$route.name)) {
      this.currentTab = 'log'
      const { start, end } = this.$route.query
      this.changeTab(this.currentTab, {
        start: start * 1,
        end: end * 1,
      })
    }
    this.getRelationData()
  },
  methods: {
    ...mapMutations('dataflow', [
      'updateNodeProperties',
      'setNodeError',
      'clearNodeError',
      'setActiveType',
    ]),
    ...mapActions('dataflow', ['updateDag']),

    handleChangeName(name) {
      if (name) {
        this.updateNodeProperties({
          id: this.activeNode.id,
          properties: {
            name,
          },
        })
        this.updateDag({ vm: this })
      } else {
        this.name = this.activeNode.name
      }
    },

    async validateForm() {
      await this.$refs.formPanel?.validate()
    },

    getLogRef() {
      return this.$refs.log
    },
    changeAlertTab(tab) {
      this.currentTab = tab
    },

    changeTab(tab, data) {
      this.currentTab = tab
      this.$nextTick(() => {
        if (tab === 'log') {
          data.nodeId && this.getLogRef()?.changeItem(data.nodeId)
          const t = new Date(data.start).getTime()
          const len = 10 * 1000
          const start = t - len
          const end = data.end ? data.end + len : t + len
          data.start &&
            this.getLogRef()?.$refs.timeSelect.changeTime([start, end])
        }
      })
    },

    getRelationData() {
      const { id, syncType } = this.$attrs.dataflow || {}
      const { taskRecordId } = this.$route.query || {}
      const filter = {
        taskId: this.$route.params.id || id,
        taskRecordId,
      }
      if (['logCollector'].includes(syncType)) {
        filter.type = 'task_by_collector'
      } else if (['sync'].includes(syncType)) {
        // filter.type = 'task_by_collector'
      }
      taskApi.taskConsoleRelations(filter).then((data) => {
        this.relationCount = data?.length || 0
      })
    },
  },
  emits: [
    'action',
    'load-data',
    'showBottomPanel',
    'load-data',
    'showBottomPanel',
  ],
}
</script>

<template>
  <section class="bottom-panel border-top flex-column">
    <NodeLog
      v-if="onlyLog"
      v-bind="$attrs"
      ref="log"
      :current-tab="currentTab"
      @action="$emit('action', arguments[0])"
    />
    <div v-else class="panel-header flex h-100">
      <ElTabs
        key="bottomPanel"
        v-model="currentTab"
        style="--el-tabs-padding-left: 1rem"
        class="setting-tabs h-100 flex-1 flex w-100"
      >
        <ElTabPane
          :label="$t('packages_dag_monitor_bottompanel_renwujindu')"
          name="milestone"
        >
          <MilestoneList
            v-if="currentTab === 'milestone'"
            v-bind="$attrs"
            ref="milestoneList"
            v-model:node-id="nodeId"
            :current-tab="currentTab"
          />
        </ElTabPane>
        <ElTabPane v-if="!hideLog" :label="$t('public_task_log')" name="log">
          <NodeLog
            v-if="currentTab === 'log'"
            v-bind="$attrs"
            ref="log"
            v-model:node-id="nodeId"
            :current-tab="currentTab"
            @action="$emit('action', arguments[0])"
          />
        </ElTabPane>
        <ElTabPane
          :label="$t('packages_dag_monitor_bottompanel_yunxingjilu')"
          name="record"
        >
          <Record
            v-if="currentTab === 'record'"
            v-bind="$attrs"
            :current-tab="currentTab"
          />
        </ElTabPane>
        <ElTabPane
          v-if="showAlert"
          :label="$t('packages_dag_monitor_bottompanel_gaojingliebiao')"
          name="alert"
        >
          <Alert
            v-if="currentTab === 'alert'"
            v-bind="$attrs"
            :current-tab="currentTab"
            @change-tab="changeTab"
            @load-data="$emit('load-data')"
          />
        </ElTabPane>
        <ElTabPane
          v-if="relationCount"
          :label="$t('packages_dag_monitor_bottompanel_guanlianrenwu')"
          name="relation"
        >
          <RelationList
            v-bind="$attrs"
            :current-tab="currentTab"
            :type="$attrs.dataflow.syncType"
            @change-tab="changeTab"
            @load-data="$emit('load-data')"
          />
        </ElTabPane>
        <ElTabPane
          v-if="isDaas && !isCommunity"
          :label="$t('public_validation_record')"
          name="inspect"
        >
          <TaskInspect
            v-if="currentTab === 'inspect'"
            v-bind="$attrs"
            :current-tab="currentTab"
            @open-inspect="$emit('open-inspect')"
          />
        </ElTabPane>
      </ElTabs>

      <VIcon class="close-icon" size="16" @click="$emit('showBottomPanel')"
        >close</VIcon
      >
    </div>
  </section>
</template>

<style scoped lang="scss">
$color: map.get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.bottom-panel {
  position: relative;
  height: 328px;
  //min-height: 328px;
  //height: 100%;
  overflow: visible;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: width;
  box-sizing: border-box;
  z-index: 11;
  :deep(.el-tabs__content) {
    > div {
      max-width: 100%;
      overflow-x: auto;
      > div {
        //min-width: 1200px;
      }
      //.milestone-main, .node-log-main, .record-wrap, .alert-main {
      //  width: 0;
      //}
    }
  }
  &.show-record {
    width: 320px;
  }

  &-close {
  }

  .el-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__content) {
      flex: 1;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .panel-header {
    //height: $headerHeight;

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  .panel-content {
    position: relative;
    overflow: hidden;
  }

  .header-icon {
    color: $color;
    font-size: 18px;
  }

  .setting-panel-wrap {
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #fff;
  }

  :deep(.config-tabs.el-tabs) {
    height: 100%;

    > .el-tabs__header {
      margin: 0;
      .el-tabs__nav-wrap {
        padding-left: $tabsHeaderWidth + 32px;
        padding-right: 16px;

        &::after {
          height: 1px;
        }
      }
      .el-tabs__active-bar {
        background-color: $color;
      }

      .el-tabs__item {
        font-weight: 400;

        &.is-active,
        &:hover {
          color: $color;
        }
      }
    }

    > .el-tabs__content {
      height: calc(100% - 40px);
      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
.close-icon {
  position: absolute;
  right: 16px;
  top: 10px;
}
.tabs-header__hidden {
  :deep(.el-tabs__header) {
    display: none;
  }
}
</style>
