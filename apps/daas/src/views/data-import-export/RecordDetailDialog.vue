<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { computed, ref } from 'vue'

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

interface ImportRecord {
  id: string
  type: 'import' | 'export'
  operationTime: string
  operator: string
  status: string
  fileName: string
  details: GroupDetail[]
  progress: number
}

const props = defineProps<{
  record: ImportRecord | null
}>()

const visible = defineModel<boolean>()

const currentGroupId = ref<string>('') // 当前选中的分组（用于预览）

// 获取类型文本
const getTypeText = (type: string) => {
  return type === 'import' ? '导入' : '导出'
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

  // 添加类型分组节点
  if (resourcesByType.SYNC_TASK.length > 0) {
    result.push({
      id: `${group.groupId}-SYNC_TASK`,
      label: '复制任务',
      type: 'SYNC_TASK',
      children: resourcesByType.SYNC_TASK.map((item, index) => ({
        id: `${group.groupId}-SYNC_TASK-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
        message: item.message,
      })),
    })
  }

  if (resourcesByType.MIGRATE_TASK.length > 0) {
    result.push({
      id: `${group.groupId}-MIGRATE_TASK`,
      label: '开发任务',
      type: 'MIGRATE_TASK',
      children: resourcesByType.MIGRATE_TASK.map((item, index) => ({
        id: `${group.groupId}-MIGRATE_TASK-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
        message: item.message,
      })),
    })
  }

  if (resourcesByType.MODULE.length > 0) {
    result.push({
      id: `${group.groupId}-MODULE`,
      label: 'API',
      type: 'MODULE',
      children: resourcesByType.MODULE.map((item, index) => ({
        id: `${group.groupId}-MODULE-${index}`,
        label: item.resourceName,
        type: item.resourceType,
        action: item.action,
        message: item.message,
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
      style="max-height: 500px"
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
                  {{ group.recordDetails?.length || 0 }} 个资源
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
            <el-tree
              v-if="treeData.length > 0"
              :data="treeData"
              :props="{ children: 'children', label: 'label' }"
              default-expand-all
              node-key="id"
              class="resource-tree"
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
                  <OverflowTooltip
                    class="node-label min-w-0 elipsis"
                    :text="data.label"
                    :endable="false"
                    :show-after="300"
                    :hide-after="0"
                    placement="left"
                  />
                  <el-tag
                    v-if="data.children"
                    size="small"
                    type="info"
                    disable-transitions
                    class="flex-shrink-0"
                  >
                    {{ data.children.length }}
                  </el-tag>
                  <div class="flex-1" />
                  <el-tag
                    v-if="data.action"
                    size="small"
                    :type="getActionType(data.action)"
                    disable-transitions
                    class="flex-shrink-0"
                  >
                    {{ data.action }}
                  </el-tag>
                  <el-tooltip
                    v-if="data.message"
                    :content="data.message"
                    placement="top"
                    :enterable="false"
                    :hide-after="0"
                  >
                    <el-icon class="color-warning flex-shrink-0" size="14">
                      <i-lucide-alert-circle />
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-tree>

            <el-empty
              v-else
              description="请在左侧点击分组查看资源"
              :image-size="100"
            />
          </div>
        </div>
      </div>
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
</style>
