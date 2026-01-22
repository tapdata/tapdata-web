<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'

const { t } = useI18n()

interface RecordDetail {
  resourceName: string
  resourceType: 'SYNC_TASK' | 'MIGRATE_TASK' | 'MODULE'
  action: 'IMPORTED' | 'EXPORTED' | 'REPLACED' | 'ERRORED'
  message?: string
}

interface GroupDetail {
  groupId: string
  groupName: string
  message?: string
  recordDetails: RecordDetail[]
}

interface GitOperationStep {
  stepName: string
  status: 'SUCCESS' | 'FAILED'
  message: string
  timestamp: number
  durationMs: number
  stackTrace?: string
}

interface ImportRecord {
  id: string
  type: 'import' | 'export'
  operationTime: string
  operator: string
  status: string
  fileName: string
  details: GroupDetail[]
  progress: number
  gitOperationSteps?: GitOperationStep[]
}

const props = defineProps<{
  record: ImportRecord | null
}>()

const visible = defineModel<boolean>()

const currentGroupId = ref<string>('') // 当前选中的分组（用于预览）

// 获取类型文本
const getTypeText = (type: string) => {
  return type === 'import'
    ? t('data_import_export_import')
    : t('data_import_export_export')
}

const title = computed(() => {
  const record = props.record!
  return record ? `${getTypeText(record.type)}: ${record.fileName}` : ''
})

// 当前选中的分组
const currentGroup = computed(() => {
  if (!props.record?.details) return null
  return props.record.details.find(
    (group) => group.groupId === currentGroupId.value,
  )
})

// 树形结构数据（只显示当前选中的分组）
const treeData = computed(() => {
  if (!currentGroup.value) {
    return []
  }

  const result: any[] = []
  const group = currentGroup.value

  // 按类型分组资源
  const resourcesByType: Record<string, RecordDetail[]> = {
    SYNC_TASK: [],
    MIGRATE_TASK: [],
    MODULE: [],
  }

  group.recordDetails?.forEach((item) => {
    if (resourcesByType[item.resourceType]) {
      resourcesByType[item.resourceType].push(item)
    }
  })

  if (resourcesByType.MIGRATE_TASK.length > 0) {
    result.push({
      id: `MIGRATE_TASK`,
      label: t('data_import_export_migrate_task'),
      type: 'MIGRATE_TASK',
      children: resourcesByType.MIGRATE_TASK.map((item, index) => ({
        id: `${group.groupId}-MIGRATE_TASK-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
        message: item.message,
        reset: item.reset,
      })),
    })
  }

  // 添加类型分组节点
  if (resourcesByType.SYNC_TASK.length > 0) {
    result.push({
      id: `SYNC_TASK`,
      label: t('data_import_export_sync_task'),
      type: 'SYNC_TASK',
      children: resourcesByType.SYNC_TASK.map((item, index) => ({
        id: `${group.groupId}-SYNC_TASK-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
        message: item.message,
        reset: item.reset,
      })),
    })
  }

  if (resourcesByType.MODULE.length > 0) {
    result.push({
      id: `MODULE`,
      label: 'API',
      type: 'MODULE',
      children: resourcesByType.MODULE.map((item, index) => ({
        id: `${group.groupId}-MODULE-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
      })),
    })
  }

  return result
})

// 获取操作类型的标签类型
const getActionType = (action: string) => {
  switch (action) {
    case 'IMPORTED':
    case 'EXPORTED':
      return 'success'
    case 'REPLACED':
      return 'warning'
    case 'ERRORED':
      return 'danger'
    default:
      return 'info'
  }
}

// Git 操作步骤（从 record 直接获取）
const gitSteps = computed(() => {
  return props.record?.gitOperationSteps || []
})

// 是否有 Git 操作步骤
const hasGitSteps = computed(() => {
  return gitSteps.value.length > 0
})

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return '--'
  // 使用 dayjs 格式化时间
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化持续时间
const formatDuration = (durationMs: number) => {
  if (!durationMs) return '--'
  if (durationMs < 1000) {
    return `${durationMs}ms`
  }
  const seconds = (durationMs / 1000).toFixed(2)
  return `${seconds}s`
}

// 获取 Git 步骤状态类型
const getGitStepType = (status: string) => {
  return status === 'SUCCESS' ? 'success' : 'danger'
}

// 监听弹窗打开，自动选中第一个分组
const handleOpen = () => {
  if (props.record?.details && props.record.details.length > 0) {
    currentGroupId.value = props.record.details[0].groupId
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="900px"
    :title="title"
    :close-on-click-modal="false"
    @open="handleOpen"
  >
    <div
      v-if="record"
      class="flex bg-light dark:bg-white/5 rounded-xl overflow-hidden w-100 lh-base"
    >
      <!-- 左侧：分组列表 -->
      <div class="flex-shrink-0 flex flex-column" style="min-width: 280px">
        <div class="p-2 min-h-0 overflow-y-auto pr-0">
          <div class="flex flex-column gap-1">
            <div
              v-for="group in record.details"
              :key="group.groupId"
              class="group-item list-item-hover"
              :class="{ 'is-active': currentGroupId === group.groupId }"
              @click="currentGroupId = group.groupId"
            >
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="flex align-center gap-2">
                  <span class="group-name ellipsis" :title="group.groupName">
                    {{ group.groupName }}
                  </span>
                  <el-tooltip
                    v-if="group.message"
                    :content="group.message"
                    placement="top"
                    :enterable="false"
                    :hide-after="0"
                  >
                    <el-icon class="color-warning" size="16">
                      <i-lucide-alert-circle />
                    </el-icon>
                  </el-tooltip>
                </div>
                <div class="group-meta fs-8 font-color-sslight">
                  {{ group.recordDetails?.length || 0 }}
                  {{ t('data_import_export_resource_count') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-2 flex-1 min-w-0 flex flex-column">
        <div
          class="bg-card rounded-xl min-h-0 flex flex-column flex-1 overflow-auto"
          style="border: 1px solid #f2f4f7"
        >
          <div class="p-2 min-h-0 overflow-y-auto">
            <el-tree-v2
              v-if="treeData.length > 0"
              :data="treeData"
              :props="{ children: 'children', label: 'label' }"
              :default-expanded-keys="['MIGRATE_TASK', 'SYNC_TASK', 'MODULE']"
              node-key="id"
              class="resource-tree"
              :item-size="32"
              :height="480"
            >
              <template #default="{ node, data }">
                <div class="flex align-center gap-2 flex-1 min-w-0 pr-2">
                  <el-icon
                    v-if="!data.children"
                    size="16"
                    class="flex-shrink-0"
                  >
                    <i-lucide-file />
                  </el-icon>
                  <el-icon v-if="data.children" :size="16">
                    <i-lucide-folder-open v-if="node.expanded" />
                    <i-lucide-folder-closed v-else />
                  </el-icon>
                  <div
                    v-if="data.label"
                    class="node-label min-w-0 elipsis flex align-center gap-1"
                    :class="{
                      'color-primary': data.reset,
                    }"
                  >
                    <OverflowTooltip
                      class="min-w-0 elipsis"
                      :text="data.label"
                      :endable="false"
                      :show-after="300"
                      :hide-after="0"
                      placement="left"
                    />
                    <el-icon v-if="data.reset">
                      <i-lucide-rotate-ccw />
                    </el-icon>
                  </div>

                  <span
                    v-else
                    class="font-color-slight text-decoration-line-through"
                    >{{ t('data_import_export_nonexistent') }}</span
                  >
                  <el-tag
                    v-if="data.children"
                    size="small"
                    type="info"
                    disable-transitions
                    class="flex-shrink-0"
                    round
                  >
                    {{ data.children.length }}
                  </el-tag>
                  <template v-else>
                    <!-- <el-tag v-if="data.reset" size="small" class="border-0">
                      <el-icon>
                        <i-lucide-rotate-ccw />
                      </el-icon>
                      重跑
                    </el-tag> -->
                    <div class="flex-1" />
                    <el-tooltip
                      v-if="data.message"
                      :content="data.message"
                      placement="top"
                      :enterable="false"
                      :hide-after="0"
                    >
                      <el-tag
                        size="small"
                        :type="getActionType(data.action)"
                        disable-transitions
                        class="flex-shrink-0"
                      >
                        <el-icon class="color-warning flex-shrink-0" size="14">
                          <i-lucide-alert-circle />
                        </el-icon>
                        {{
                          data.action
                            ? t(
                                `data_import_export_action_${data.action.toLowerCase()}`,
                              )
                            : '--'
                        }}
                      </el-tag>
                    </el-tooltip>
                    <el-tag
                      v-else
                      size="small"
                      :type="getActionType(data.action)"
                      disable-transitions
                      class="flex-shrink-0"
                    >
                      {{
                        data.action
                          ? t(
                              `data_import_export_action_${data.action.toLowerCase()}`,
                            )
                          : '--'
                      }}
                    </el-tag>
                  </template>
                </div>
              </template>
            </el-tree-v2>

            <el-empty
              v-else
              :description="t('data_import_export_click_group_to_view')"
              :image-size="100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Git 操作记录 -->
    <div v-if="hasGitSteps" class="mt-4">
      <el-collapse>
        <el-collapse-item name="git">
          <template #title>
            <div class="flex align-center gap-2">
              <el-icon>
                <i-lucide-git-branch />
              </el-icon>
              <span class="fw-sub">{{
                $t('data_import_export_git_operation_records')
              }}</span>
              <el-tag size="small" type="info" round>
                {{ gitSteps.length }}
              </el-tag>
            </div>
          </template>
          <div class="git-steps-list">
            <div
              v-for="(step, index) in gitSteps"
              :key="index"
              class="git-step-item"
            >
              <div class="flex align-center gap-2 mb-1">
                <el-tag
                  size="small"
                  :type="getGitStepType(step.status)"
                  disable-transitions
                >
                  {{ step.status }}
                </el-tag>
                <span class="fw-sub">{{ step.stepName }}</span>
                <div class="flex-1" />
                <span class="fs-7 font-color-light">
                  {{ formatDuration(step.durationMs) }}
                </span>
              </div>
              <div class="fs-7 font-color-light mb-1">
                {{ formatTimestamp(step.timestamp) }}
              </div>
              <div v-if="step.message" class="fs-7 font-color-secondary mb-1">
                {{ step.message }}
              </div>
              <!-- 堆栈信息 -->
              <div v-if="step.stackTrace" class="mt-2">
                <el-collapse>
                  <el-collapse-item name="stackTrace">
                    <template #title>
                      <div class="flex align-center gap-1">
                        <el-icon size="14">
                          <i-lucide-bug />
                        </el-icon>
                        <span class="fs-7 font-color-secondary">{{
                          $t('data_import_export_stack_trace')
                        }}</span>
                      </div>
                    </template>
                    <pre class="stack-trace-content">{{ step.stackTrace }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 0;
}

.group-item {
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &.is-current {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  .group-name {
    font-weight: 500;
    // color: var(--el-text-color-primary);
  }

  .group-meta {
    color: var(--el-text-color-secondary);
  }
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--el-border-color-lighter);

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-lighter);
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
}

.resource-tree {
  background-color: transparent;

  :deep(.el-tree-node__content) {
    height: auto;
    min-height: 32px;
    padding: 4px 0;
  }

  :deep(.el-tree-node__label) {
    flex: 1;
    overflow: hidden;
  }
}

.git-steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.git-step-item {
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  border-left: 3px solid var(--el-color-primary);

  .stack-trace-content {
    margin: 0;
    padding: 12px;
    background-color: var(--el-fill-color-dark);
    border-radius: 4px;
    font-family:
      'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
