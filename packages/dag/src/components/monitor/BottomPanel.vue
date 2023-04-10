<template>
  <section class="bottom-panel border-top flex-column">
    <NodeLog v-if="onlyLog" v-bind="$attrs" :currentTab="currentTab" ref="log"></NodeLog>
    <div v-else class="panel-header flex h-100">
      <ElTabs v-model="currentTab" class="setting-tabs h-100 flex-1 flex flex-column" key="bottomPanel">
        <ElTabPane :label="$t('packages_dag_monitor_bottompanel_renwujindu')" name="milestone">
          <MilestoneList
            v-if="currentTab === 'milestone'"
            v-bind="$attrs"
            :currentTab="currentTab"
            ref="milestoneList"
          ></MilestoneList>
        </ElTabPane>
        <ElTabPane :label="$t('packages_dag_monitor_bottompanel_rizhi')" name="log">
          <NodeLog v-if="currentTab === 'log'" v-bind="$attrs" :currentTab="currentTab" ref="log"></NodeLog>
        </ElTabPane>
        <ElTabPane :label="$t('packages_dag_monitor_bottompanel_yunxingjilu')" name="record">
          <Record v-if="currentTab === 'record'" v-bind="$attrs" :currentTab="currentTab"></Record>
        </ElTabPane>
        <ElTabPane :label="$t('packages_dag_monitor_bottompanel_gaojingliebiao')" name="alert">
          <Alert
            v-if="currentTab === 'alert'"
            v-bind="$attrs"
            :currentTab="currentTab"
            @change-tab="changeTab"
            @load-data="$emit('load-data')"
          ></Alert>
        </ElTabPane>
        <ElTabPane v-if="relationCount" :label="$t('packages_dag_monitor_bottompanel_guanlianrenwu')" name="relation">
          <RelationSharedList
            v-if="['logCollector'].includes($attrs.dataflow.syncType)"
            v-bind="$attrs"
            :currentTab="currentTab"
            @change-tab="changeTab"
            @load-data="$emit('load-data')"
          ></RelationSharedList>
          <RelationList
            v-else
            v-bind="$attrs"
            :currentTab="currentTab"
            @change-tab="changeTab"
            @load-data="$emit('load-data')"
          ></RelationList>
        </ElTabPane>
      </ElTabs>

      <VIcon class="close-icon" size="16" @click="$emit('showBottomPanel')">close</VIcon>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

import '@tap/component/src/directives/resize/index.scss'
import resize from '@tap/component/src/directives/resize'
import focusSelect from '@tap/component/src/directives/focusSelect'
import NodeLog from '@tap/business/src/components/logs/NodeLog'
import RelationList from '@tap/business/src/views/task/relation/List.vue'
import RelationSharedList from '@tap/business/src/views/task/relation/SharedList.vue'
import MilestoneList from '@tap/business/src/components/milestone/List'

import Record from './components/Record'
import Alert from './components/Alert'
import { logcollectorApi, taskApi } from '@tap/api'

export default {
  name: 'ConfigPanel',

  components: { Record, Alert, RelationList, RelationSharedList, NodeLog, MilestoneList },

  directives: {
    resize,
    focusSelect
  },

  props: {
    onlyLog: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentTab: 'milestone',
      name: this.activeNode?.name,
      relationCount: 0
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly'])
  },

  watch: {
    'activeNode.name'(v) {
      this.name = v
    }
  },

  mounted() {
    if (['MigrationMonitorViewer'].includes(this.$route.name)) {
      this.currentTab = 'log'
      const { start, end } = this.$route.query
      this.changeTab(this.currentTab, {
        start: start * 1,
        end: end * 1
      })
    }
    this.getRelationData()
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties', 'setNodeError', 'clearNodeError', 'setActiveType']),
    ...mapActions('dataflow', ['updateDag']),

    handleChangeName(name) {
      if (name) {
        this.updateNodeProperties({
          id: this.activeNode.id,
          properties: {
            name
          }
        })
        this.updateDag()
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
          data.nodeId &&
            this.getLogRef()?.changeItem({
              value: data.nodeId
            })
          const t = new Date(data.start).getTime()
          const len = 10 * 1000
          let start = t - len
          const end = data.end ? data.end + len : t + len
          data.start && this.getLogRef()?.$refs.timeSelect.changeTime([start, end])
        }
      })
    },

    getRelationData() {
      const { id, syncType } = this.$attrs.dataflow || {}
      const { taskRecordId } = this.$route.query || {}
      let filter = {
        taskId: this.$route.params.id || id,
        taskRecordId
      }
      if (['logCollector'].includes(syncType)) {
        filter.type = 'task_by_collector'
      }
      taskApi.taskConsoleRelations(filter).then(data => {
        this.relationCount = data?.length || 0
      })
    }
  }
}
</script>

<style scoped lang="scss">
$color: map-get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.bottom-panel {
  position: relative;
  z-index: 9;
  height: 328px;
  //min-height: 328px;
  //height: 100%;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: width;
  box-sizing: border-box;
  z-index: 11;
  &.show-record {
    width: 320px;
  }

  &-close {
  }

  .el-tabs {
    ::v-deep {
      .el-tabs__header {
        margin: 0;
      }
      .el-tabs__content {
        flex: 1;
      }
      .el-tab-pane {
        height: 100%;
      }
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

  ::v-deep {
    .config-tabs.el-tabs {
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

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}
.close-icon {
  position: absolute;
  right: 16px;
  top: 10px;
}
.tabs-header__hidden {
  ::v-deep {
    .el-tabs__header {
      display: none;
    }
  }
}
</style>
