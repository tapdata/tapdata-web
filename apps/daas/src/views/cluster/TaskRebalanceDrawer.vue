<script setup lang="ts">
import {
  createTaskRebalance,
  previewTaskRebalance,
  type SchedulableStatus,
  type TaskPreview,
  type TaskRebalancePreviewVo,
} from '@tap/api/src/core/task-rebalance'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { useI18n } from '@tap/i18n'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const { t } = useI18n()
const router = useRouter()

interface AgentInfo {
  agentId: string
  name: string
  online: boolean
  cpuUsage: number
  memUsage: number
}

interface DrawerTask extends TaskPreview {
  currentAgentId: string
}

const props = defineProps<{
  agents?: AgentInfo[]
}>()

const visible = defineModel<boolean>()

const loading = ref(false)
const submitting = ref(false)
const reason = ref<string | null>(null)
const previewTasks = ref<DrawerTask[]>([])
const draggingTaskId = ref<string | null>(null)
const dragOverAgentId = ref<string | null>(null)

const SCHEDULABLE_REASON_MAP: Record<SchedulableStatus, string> = {
  OK: '',
  AGENT_OFFLINE: 'daas_task_rebalance_reason_agent_offline',
  STATUS_ERROR: 'daas_task_rebalance_reason_status_error',
  MANUAL_AGENT: 'daas_task_rebalance_reason_manual_agent',
  INCREMENTAL_NOT_STARTED: 'daas_task_rebalance_reason_incremental',
}

const TYPE_LABEL_MAP: Record<string, string> = {
  initial_sync: 'daas_task_rebalance_type_initial_sync',
  cdc: 'daas_task_rebalance_type_cdc',
  'initial_sync+cdc': 'daas_task_rebalance_type_full_cdc',
}

const SYNC_TYPE_LABEL_MAP: Record<string, string> = {
  migrate: 'public_task_type_migrate',
  sync: 'public_task_type_sync',
  logCollector: 'public_task_type_log_collector',
  mem_cache: 'page_title_shared_cache',
  connHeartbeat: 'public_task_type_heartbeat',
}

const SYNC_TYPE_TAG_MAP: Record<
  string,
  'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  migrate: 'primary',
  sync: 'success',
  logCollector: 'danger',
  mem_cache: 'success',
  connHeartbeat: 'warning',
}

const REASON_MAP: Record<string, string> = {
  'task.rebalance.onlyOneAgent': 'daas_task_rebalance_reason_only_one_agent',
}

const hasTasks = computed(() => previewTasks.value.length > 0)

const reasonText = computed(() => {
  if (!reason.value) return t('daas_task_rebalance_empty')
  const key = REASON_MAP[reason.value]
  return key ? t(key) : reason.value
})

const agentList = computed<AgentInfo[]>(() => {
  const infoMap = new Map<string, AgentInfo>()
  for (const agent of props.agents || []) {
    infoMap.set(agent.agentId, agent)
  }
  const result = new Map<string, AgentInfo>()
  for (const task of previewTasks.value) {
    for (const id of [
      task.sourceAgentId,
      task.targetAgentId,
      task.currentAgentId,
    ]) {
      if (id && !result.has(id)) {
        result.set(
          id,
          infoMap.get(id) || {
            agentId: id,
            name: id,
            online: true,
            cpuUsage: 0,
            memUsage: 0,
          },
        )
      }
    }
  }
  return [...result.values()]
})

const columns = computed(() => {
  return agentList.value.map((agent) => {
    const beforeCount = previewTasks.value.filter(
      (task) => task.sourceAgentId === agent.agentId,
    ).length
    const tasks = previewTasks.value
      .filter((task) => task.currentAgentId === agent.agentId)
      .sort(
        (a, b) =>
          Number(b.currentAgentId !== b.sourceAgentId) -
          Number(a.currentAgentId !== a.sourceAgentId),
      )
    return {
      ...agent,
      beforeCount,
      afterCount: tasks.length,
      delta: tasks.length - beforeCount,
      tasks,
    }
  })
})

async function loadPreview() {
  loading.value = true
  try {
    const res = await previewTaskRebalance()
    reason.value = res?.reason || null
    previewTasks.value = (res?.tasks || []).map((task) => ({
      ...task,
      currentAgentId:
        task.movable && task.targetAgentId
          ? task.targetAgentId
          : task.sourceAgentId,
    }))
  } finally {
    loading.value = false
  }
}

function getTypeLabel(type: string) {
  const key = TYPE_LABEL_MAP[type]
  return key ? t(key) : type
}

function getSyncTypeLabel(syncType: string) {
  const key = SYNC_TYPE_LABEL_MAP[syncType]
  return key ? t(key) : syncType
}

function getSyncTypeTagType(syncType: string) {
  return SYNC_TYPE_TAG_MAP[syncType] || 'info'
}

function getLockedReason(task: DrawerTask) {
  if (task.reason) return task.reason
  const key = SCHEDULABLE_REASON_MAP[task.schedulableStatus]
  return key ? t(key) : ''
}

function isMoved(task: DrawerTask) {
  return task.currentAgentId !== task.sourceAgentId
}

function onDragStart(task: DrawerTask, ev: DragEvent) {
  if (!task.movable) {
    ev.preventDefault()
    return
  }
  draggingTaskId.value = task.taskId
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggingTaskId.value = null
  dragOverAgentId.value = null
}

function onDragOver(agentId: string) {
  dragOverAgentId.value = agentId
}

function onDragLeave(agentId: string) {
  if (dragOverAgentId.value === agentId) {
    dragOverAgentId.value = null
  }
}

function onDrop(agentId: string) {
  const task = previewTasks.value.find(
    (item) => item.taskId === draggingTaskId.value,
  )
  if (task && task.movable) {
    task.currentAgentId = agentId
  }
  draggingTaskId.value = null
  dragOverAgentId.value = null
}

function buildPayload(): TaskRebalancePreviewVo {
  const tasks: TaskPreview[] = previewTasks.value.map(
    ({ currentAgentId, ...task }) => ({
      ...task,
      targetAgentId: currentAgentId,
      changed: currentAgentId !== task.sourceAgentId,
    }),
  )
  return {
    tasks,
    moveCount: tasks.filter((task) => task.changed).length,
    reason: reason.value,
  }
}

async function handleConfirm() {
  submitting.value = true
  try {
    await createTaskRebalance(buildPayload())
    ElMessage.success(t('daas_task_rebalance_create_success'))
    visible.value = false
    router.push({
      name: 'taskRebalanceHistory',
    })
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  visible.value = false
}

watch(visible, (val) => {
  if (val) {
    loadPreview()
  } else {
    previewTasks.value = []
    reason.value = null
    draggingTaskId.value = null
    dragOverAgentId.value = null
  }
})
</script>

<template>
  <el-drawer
    v-model="visible"
    size="100%"
    :with-header="false"
    :show-close="false"
    modal-class="bg-transparent"
    class="task-rebalance-drawer"
    :destroy-on-close="true"
    :close-on-press-escape="false"
  >
    <div class="rb-wrap flex flex-column h-100 bg-white">
      <header
        class="rb-header flex align-start justify-content-between px-6 border-bottom"
      >
        <div class="flex flex-column">
          <span class="fs-6 fw-sub font-color-dark">{{
            t('daas_task_rebalance_title')
          }}</span>
          <span class="rb-subtitle">{{
            t('daas_task_rebalance_subtitle')
          }}</span>
        </div>
        <el-button text class="align-self-center" @click="handleClose">
          <template #icon>
            <i-lucide-x />
          </template>
        </el-button>
      </header>

      <div v-loading="loading" class="rb-body flex-1 min-h-0">
        <el-empty
          v-if="!loading && (!!reason || !hasTasks)"
          :description="reasonText"
        />
        <div v-else class="rb-kanban">
          <div
            v-for="col in columns"
            :key="col.agentId"
            class="rb-col"
            :class="{ 'rb-col--over': dragOverAgentId === col.agentId }"
            @dragover.prevent="onDragOver(col.agentId)"
            @dragleave="onDragLeave(col.agentId)"
            @drop="onDrop(col.agentId)"
          >
            <div class="rb-col-head">
              <div class="flex align-center justify-content-between mb-3 gap-2">
                <span class="rb-col-name text-ellipsis" :title="col.name">{{
                  col.name
                }}</span>
                <span class="rb-col-count flex align-items-end gap-1">
                  <span class="rb-col-count-num">{{ col.afterCount }}</span>
                  <span
                    v-if="col.delta !== 0"
                    :class="col.delta > 0 ? 'rb-delta-up' : 'rb-delta-down'"
                  >
                    {{ col.delta > 0 ? '+' : '' }}{{ col.delta }}
                  </span>
                </span>
              </div>
              <div class="rb-metric">
                <i-lucide-cpu class="rb-metric-icon" />
                <span class="rb-metric-label">CPU</span>
                <el-progress
                  class="flex-1"
                  :percentage="col.cpuUsage"
                  :stroke-width="6"
                />
              </div>
              <div class="rb-metric">
                <i-lucide-memory-stick class="rb-metric-icon" />
                <span class="rb-metric-label">{{
                  t('api_monitor_memory')
                }}</span>
                <el-progress
                  class="flex-1"
                  :percentage="col.memUsage"
                  :stroke-width="6"
                />
              </div>
            </div>
            <div class="rb-col-body">
              <el-tooltip
                v-for="task in col.tasks"
                :key="task.taskId"
                :disabled="task.movable"
                :content="getLockedReason(task)"
                placement="top"
              >
                <div
                  class="rb-card"
                  :class="{
                    'rb-card--locked': !task.movable,
                    'rb-card--moved': isMoved(task),
                    'rb-card--dragging': draggingTaskId === task.taskId,
                  }"
                  :draggable="task.movable"
                  @dragstart="onDragStart(task, $event)"
                  @dragend="onDragEnd"
                >
                  <div
                    class="rb-card-title text-ellipsis"
                    :title="task.taskName"
                  >
                    {{ task.taskName }}
                  </div>
                  <div class="rb-card-tags flex align-center gap-1 flex-wrap">
                    <el-tag
                      size="small"
                      :type="getSyncTypeTagType(task.syncType)"
                      disable-transitions
                      >{{ getSyncTypeLabel(task.syncType) }}</el-tag
                    >
                    <el-tag size="small" type="info" disable-transitions>{{
                      getTypeLabel(task.type)
                    }}</el-tag>
                    <TaskStatus class="zoom-xs" :task="task" />
                  </div>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

      <footer
        class="rb-footer flex align-center justify-content-between px-6 border-top"
      >
        <div class="flex align-center gap-4 fs-7 text-secondary">
          <span class="flex align-center gap-1">
            <i class="rb-legend rb-legend--move" />
            {{ t('daas_task_rebalance_legend_move') }}
          </span>
          <span class="flex align-center gap-1">
            <i class="rb-legend rb-legend--locked" />
            {{ t('daas_task_rebalance_legend_locked') }}
          </span>
        </div>
        <div class="flex align-center">
          <el-button @click="handleClose">{{
            t('daas_task_rebalance_cancel')
          }}</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            :disabled="!hasTasks || !!reason"
            @click="handleConfirm"
            >{{ t('daas_task_rebalance_confirm') }}</el-button
          >
        </div>
      </footer>
    </div>
  </el-drawer>
</template>

<style lang="scss">
.task-rebalance-drawer.el-drawer {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  border-left: none;
  overflow: hidden;

  .el-drawer__body {
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
.rb-header {
  padding-top: 16px;
  padding-bottom: 16px;
  flex-shrink: 0;
}

.rb-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rb-footer {
  height: 64px;
  flex-shrink: 0;
}

.rb-body {
  overflow: hidden;
}

.rb-kanban {
  display: flex;
  height: 100%;
  gap: 16px;
  padding: 16px 24px;
  overflow-x: auto;
}

.rb-col {
  display: flex;
  width: 380px;
  flex-direction: column;
  flex-shrink: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background-color: var(--el-fill-color-blank);
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &--over {
    border-color: var(--color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}

.rb-col-head {
  flex-shrink: 0;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.rb-col-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.rb-col-count-num {
  font-size: 1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.rb-col-count-unit {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rb-metric {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rb-metric-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--el-text-color-secondary);
}

.rb-metric-label {
  width: 40px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rb-delta-up {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-success);
}

.rb-delta-down {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-danger);
}

.rb-col-body {
  flex: 1;
  min-height: 120px;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rb-card {
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background-color: var(--el-fill-color-blank);
  cursor: grab;
  transition:
    box-shadow 0.2s,
    opacity 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  }

  &--moved {
    border-left: 3px solid var(--el-color-warning);
  }

  &--locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--dragging {
    opacity: 0.4;
    border-style: dashed;
  }
}

.rb-card-title {
  margin-bottom: 6px;
  font-weight: 500;
}

.rb-legend {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;

  &--move {
    background-color: var(--el-color-warning);
  }

  &--locked {
    background-color: var(--el-text-color-disabled);
  }
}
</style>
