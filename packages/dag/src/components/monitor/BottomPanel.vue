<script setup lang="ts">
import { taskConsoleRelations } from '@tap/api/src/core/task'
import NodeLog from '@tap/business/src/components/logs/NodeLog'
import MilestoneList from '@tap/business/src/components/milestone/List'
import RelationList from '@tap/business/src/views/task/relation/List.vue'
import vResize from '@tap/component/src/directives/resize'
import { computed, nextTick, onMounted, ref, useAttrs } from 'vue'
import { useRoute } from 'vue-router'
import { useDataflowStore } from '../../stores/dataflow.store'
import Alert from './components/Alert'
import Record from './components/Record'
import SkipErrorTable from './components/SkipErrorTable.vue'
import TaskInspect from './components/TaskInspect.vue'
import '@tap/component/src/directives/resize/index.scss'

defineOptions({
  name: 'ConfigPanel',
  // directives: { resize, focusSelect },
})

const props = defineProps<{
  onlyLog?: boolean
  hideLog?: boolean
}>()

const emit = defineEmits<{
  action: [any]
  'load-data': []
  showBottomPanel: []
  'open-inspect': []
}>()

const dataflowStore = useDataflowStore()
const route = useRoute()
const attrs = useAttrs() as any

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const isCommunity = import.meta.env.VUE_APP_MODE === 'community'

const currentTab = ref('milestone')
const relationCount = ref(0)
const nodeId = ref('')
const logRef = ref<any>(null)

const showAlert = computed(() => {
  return !['SharedCacheMonitor'].includes(route.name as string)
})

onMounted(() => {
  if (['MigrationMonitorViewer'].includes(route.name as string)) {
    currentTab.value = 'log'
    const { start, end } = route.query
    changeTab(currentTab.value, {
      start: Number(start),
      end: Number(end),
    })
  }
  getRelationData()
})

function getLogRef() {
  return logRef.value
}

function changeAlertTab(tab: string) {
  currentTab.value = tab
}

function changeTab(tab: string, data: any) {
  currentTab.value = tab
  nextTick(() => {
    if (tab === 'log') {
      data.nodeId && getLogRef()?.changeItem(data.nodeId)
      const t = new Date(data.start).getTime()
      const len = 10 * 1000
      const start = t - len
      const end = data.end ? data.end + len : t + len
      data.start && getLogRef()?.$refs.timeSelect.changeTime([start, end])
    }
  })
}

function getRelationData() {
  const { id, syncType } = attrs.dataflow || {}
  const { taskRecordId } = route.query || {}
  const filter: any = {
    taskId: (route.params.id as string) || id,
    taskRecordId,
  }
  if (['logCollector'].includes(syncType)) {
    filter.type = 'task_by_collector'
  }
  taskConsoleRelations(filter).then((data: any) => {
    relationCount.value = data?.length || 0
  })
}

defineExpose({
  changeTab,
  changeAlertTab,
  getLogRef,
})
</script>

<template>
  <section
    v-resize.top="{
      minHeight: 328,
    }"
    class="bottom-panel flex-column rounded-2xl shadow-canvas overflow-hidden"
  >
    <NodeLog
      v-if="onlyLog"
      v-bind="$attrs"
      ref="logRef"
      :current-tab="currentTab"
      @action="emit('action', $event)"
    />
    <div v-else class="panel-header flex h-100">
      <ElTabs
        key="bottomPanel"
        v-model="currentTab"
        style="--el-tabs-padding-left: 1rem; --el-tabs-header-height: 44px"
        class="setting-tabs h-100 flex-1 flex w-100 monitor-bottom-tabs"
      >
        <ElTabPane name="milestone">
          <template #label>
            <span>
              {{ $t('packages_dag_monitor_bottompanel_renwujindu') }}
            </span>
          </template>
          <MilestoneList
            v-if="currentTab === 'milestone'"
            v-bind="$attrs"
            ref="milestoneList"
            v-model:node-id="nodeId"
            :current-tab="currentTab"
          />
        </ElTabPane>
        <ElTabPane v-if="!hideLog" name="log" class="monitor-log-pane">
          <template #label>
            <span>
              {{ $t('public_task_log') }}
            </span>
          </template>
          <NodeLog
            v-if="currentTab === 'log'"
            v-bind="$attrs"
            ref="logRef"
            v-model:node-id="nodeId"
            :current-tab="currentTab"
            @action="emit('action', $event)"
          />
        </ElTabPane>
        <ElTabPane name="record">
          <template #label>
            <span>
              {{ $t('packages_dag_monitor_bottompanel_yunxingjilu') }}
            </span>
          </template>
          <Record
            v-if="currentTab === 'record'"
            v-bind="$attrs"
            :current-tab="currentTab"
          />
        </ElTabPane>
        <ElTabPane v-if="showAlert" name="alert">
          <template #label>
            <span>
              {{ $t('packages_dag_monitor_bottompanel_gaojingliebiao') }}
            </span>
          </template>
          <Alert
            v-if="currentTab === 'alert'"
            v-bind="$attrs"
            :current-tab="currentTab"
            @change-tab="changeTab"
            @load-data="emit('load-data')"
          />
        </ElTabPane>
        <ElTabPane v-if="relationCount" name="relation">
          <template #label>
            <span>
              {{ $t('packages_dag_monitor_bottompanel_guanlianrenwu') }}
            </span>
          </template>
          <RelationList
            v-bind="$attrs"
            :current-tab="currentTab"
            :type="$attrs.dataflow.syncType"
            @change-tab="changeTab"
            @load-data="emit('load-data')"
          />
        </ElTabPane>
        <ElTabPane v-if="isDaas && !isCommunity" name="inspect">
          <template #label>
            <span>
              {{ $t('public_validation_record') }}
            </span>
          </template>
          <TaskInspect
            v-if="currentTab === 'inspect'"
            v-bind="$attrs"
            style="min-width: 1000px"
            :current-tab="currentTab"
            @open-inspect="emit('open-inspect')"
          />
        </ElTabPane>
        <SkipErrorTable
          v-if="
            $attrs.dataflow &&
            $attrs.dataflow.skipErrorEvent &&
            $attrs.dataflow.skipErrorEvent.errorMode ===
              'SkipTableForMigrateSnapshot'
          "
          name="skipErrorTable"
          :current-tab="currentTab"
          v-bind="$attrs"
        />
      </ElTabs>

      <el-button
        text
        class="close-icon"
        @click="dataflowStore.showBottom = false"
      >
        <template #icon>
          <i-lucide-x />
        </template>
      </el-button>
    </div>
  </section>
</template>

<style scoped lang="scss">
$color: var(--color-primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.bottom-panel {
  position: relative;
  height: 58vh;
  //min-height: 328px;
  //height: 100%;
  overflow: visible;
  background-color: var(--el-bg-color);
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
  right: 12px;
  top: 6px;
}
.tabs-header__hidden {
  :deep(.el-tabs__header) {
    display: none;
  }
}

.monitor-bottom-tabs {
  :deep(.el-tabs__nav-wrap) {
    margin-bottom: 0;
  }
}

.monitor-log-pane {
  :deep(.log-container) {
    min-width: 1000px;
    .node-list {
      position: sticky;
      left: 0;
      background-color: var(--el-bg-color);
      z-index: 11;
    }
  }
}
</style>
