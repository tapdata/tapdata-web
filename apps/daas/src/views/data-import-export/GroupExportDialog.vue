<script setup lang="ts">
import {
  exportGroupInfoBatch,
  fetchGroupInfoList,
  type GroupInfoDto,
  type ResourceItem,
} from '@tap/api/core/group-info'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { t } from '@tap/i18n'
import { downloadBlob } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

const visible = defineModel<boolean>()

// 分组列表
const groupList = ref<GroupInfoDto[]>([])
const groupLoading = ref(false)
const selectedGroupIds = ref<string[]>([])
const currentGroupId = ref<string>('') // 当前选中的分组（用于预览）

// 导出状态
const exporting = ref(false)

// 加载分组列表
const loadGroups = async () => {
  groupLoading.value = true
  try {
    const result = await fetchGroupInfoList({
      limit: 1000,
      skip: 0,
    })
    groupList.value = result.items || []
  } catch {
    ElMessage.error('加载分组列表失败')
  } finally {
    groupLoading.value = false
  }
}

// 当前选中的分组
const currentGroup = computed(() => {
  return groupList.value.find((group) => group.id === currentGroupId.value)
})

// 树形结构数据（只显示当前选中的分组）
const treeData = computed(() => {
  if (!currentGroup.value) {
    return []
  }

  const result: any[] = []
  const group = currentGroup.value

  // 按类型分组资源
  const resourcesByType: Record<string, ResourceItem[]> = {
    SYNC_TASK: [],
    MIGRATE_TASK: [],
    MODULE: [],
  }

  group.resourceItemList?.forEach((item) => {
    if (resourcesByType[item.type]) {
      resourcesByType[item.type].push(item)
    }
  })

  // 添加类型分组节点
  if (resourcesByType.SYNC_TASK.length > 0) {
    result.push({
      id: `${group.id}-SYNC_TASK`,
      label: t('data_import_export_sync_task'),
      type: 'SYNC_TASK',
      children: resourcesByType.SYNC_TASK.map((item) => ({
        id: item.id,
        label: item.name || item.id,
        type: item.type,
      })),
    })
  }

  if (resourcesByType.MIGRATE_TASK.length > 0) {
    result.push({
      id: `${group.id}-MIGRATE_TASK`,
      label: t('data_import_export_migrate_task'),
      type: 'MIGRATE_TASK',
      children: resourcesByType.MIGRATE_TASK.map((item) => ({
        id: item.id,
        label: item.name || item.id,
        type: item.type,
      })),
    })
  }

  if (resourcesByType.MODULE.length > 0) {
    result.push({
      id: `${group.id}-MODULE`,
      label: 'API',
      type: 'MODULE',
      children: resourcesByType.MODULE.map((item) => ({
        id: item.id,
        label: item.name || item.id,
        type: item.type,
      })),
    })
  }

  return result
})

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    loadGroups()
    selectedGroupIds.value = []
    currentGroupId.value = ''
  }
})

// 导出分组
const handleExport = async () => {
  if (selectedGroupIds.value.length === 0) {
    ElMessage.warning('请至少选择一个分组')
    return
  }

  exporting.value = true

  try {
    const res = await exportGroupInfoBatch(selectedGroupIds.value)
    downloadBlob(res)
    ElMessage.success('导出成功')
    visible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="900px"
    :title="$t('data_import_export_export_group')"
    :close-on-click-modal="false"
  >
    <div
      v-loading="groupLoading"
      class="flex bg-light dark:bg-white/5 rounded-xl overflow-hidden w-100 lh-base"
      style="max-height: 400px"
    >
      <div
        class="flex-shrink-0 flex flex-column flex-1"
        style="min-width: 200px"
      >
        <div class="text-caption p-2 pb-0 pl-4">
          {{ $t('data_import_export_select_group') }}
        </div>
        <div class="p-2 pt-0 min-h-0 overflow-y-auto">
          <div class="flex flex-column gap-1">
            <div v-loading="groupLoading" class="groups-list pr-0">
              <el-checkbox-group v-model="selectedGroupIds" class="w-100">
                <div
                  v-for="group in groupList"
                  :key="group.id"
                  class="group-item"
                  :class="{ 'is-current': currentGroupId === group.id }"
                  @click="currentGroupId = group.id!"
                >
                  <el-checkbox :value="group.id" class="w-100">
                    <div class="flex flex-column gap-1 flex-1 min-w-0">
                      <div class="group-name ellipsis" :title="group.name">
                        {{ group.name }}
                      </div>
                      <div class="group-meta flex align-center gap-2">
                        <span class="fs-8 font-color-sslight">
                          {{ group.resourceItemList?.length || 0 }}
                          {{ $t('data_import_export_resource_count') }}
                        </span>
                        <span
                          v-if="group.description"
                          class="fs-8 font-color-sslight ellipsis"
                          :title="group.description"
                        >
                          {{ group.description }}
                        </span>
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>

              <el-empty
                v-if="groupList.length === 0 && !groupLoading"
                :description="$t('data_import_export_no_group')"
                :image-size="80"
              />
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
              node-key="id"
              :indent="12"
              default-expand-all
              :props="{
                label: 'label',
                children: 'children',
              }"
            >
              <template #default="{ node, data }">
                <div class="tree-node flex align-center gap-2 min-w-0">
                  <el-icon v-if="data.children" :size="16">
                    <i-lucide-folder-open v-if="node.expanded" />
                    <i-lucide-folder-closed v-else />
                  </el-icon>
                  <span class="node-label min-w-0 elipsis">
                    <overflow-tooltip
                      :text="node.label"
                      :endable="false"
                      :show-after="300"
                      :hide-after="0"
                      placement="left"
                    />
                  </span>
                  <el-tag
                    v-if="data.children"
                    size="small"
                    type="info"
                    round
                    disable-transitions
                  >
                    {{ data.children.length }}
                  </el-tag>
                </div>
              </template>
            </el-tree>

            <el-empty
              v-else
              :description="t('data_import_export_click_group_to_view')"
              :image-size="100"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          :loading="exporting"
          type="primary"
          :disabled="selectedGroupIds.length === 0"
          @click="handleExport"
        >
          导出
          {{
            selectedGroupIds.length > 0 ? `(${selectedGroupIds.length})` : ''
          }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 0;
}

.export-container {
  display: flex;
  height: 600px;
  max-height: 70vh;
}

.groups-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.groups-panel {
  width: 400px;
  border-right: 1px solid var(--el-border-color);
}

.preview-panel {
  flex: 1;
  min-width: 0;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-lighter);
  flex-shrink: 0;
}

.groups-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
      background-color: var(--fill-hover);
    }

    &.is-current {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    :deep(.el-checkbox) {
      flex: 1;
      height: auto;
      align-items: flex-start;

      .el-checkbox__label {
        flex: 1;
        min-width: 0;
        padding-left: 8px;
      }

      .el-checkbox__input {
        margin-top: 2px;
      }
    }

    .group-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .group-meta {
      margin-top: 4px;
    }
  }
}

.preview-tree {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  :deep(.el-tree) {
    background-color: transparent;
  }

  :deep(.el-tree-node__content) {
    height: 32px;
    margin-bottom: 2px;
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;

    .node-label {
      flex: 1;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
