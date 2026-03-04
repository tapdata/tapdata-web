<script setup lang="ts">
import {
  exportGroupInfoBatch,
  exportGroupInfoBatchGit,
  fetchGroupInfoList,
  type GroupInfoDto,
  type ResourceItem,
} from '@tap/api/core/group-info'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { t } from '@tap/i18n'
import { downloadBlob } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GitConfigDialog from './GitConfigDialog.vue'

const visible = defineModel<boolean>()
const router = useRouter()

// Props
const props = defineProps<{
  initialGroupId?: string
}>()

const emit = defineEmits(['createProject'])

// 分组列表
const groupList = ref<GroupInfoDto[]>([])
const groupLoading = ref(false)
const selectedGroupIds = ref<string[]>([])
const currentGroupId = ref<string>('') // 当前选中的分组（用于预览）
const searchKeyword = ref('') // 搜索关键词

// 导出状态
const exporting = ref(false)
const groupTransferType = ref<'FILE' | 'GIT'>('FILE') // 导出类型
const gitBranchName = ref('') // 分支名
const gitPrTitle = ref('') // PR 标题
const gitPrDescription = ref('') // PR 描述

// Git 配置弹窗
const gitConfigDialogVisible = ref(false)
const currentConfigGroup = ref<GroupInfoDto | null>(null)

// 加载分组列表
const loadGroups = async () => {
  groupLoading.value = true
  try {
    const result = await fetchGroupInfoList({
      limit: 1000,
      order: 'createAt DESC',
      skip: 0,
    })
    groupList.value = result.items || []
  } catch {
    ElMessage.error('加载分组列表失败')
  } finally {
    groupLoading.value = false
  }
}

// 过滤后的分组列表
const filteredGroupList = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return groupList.value.filter(
    (group) =>
      group.name.toLowerCase().includes(keyword) ||
      group.description?.toLowerCase().includes(keyword),
  )
})

// 当前选中的分组
const currentGroup = computed(() => {
  return groupList.value.find((group) => group.id === currentGroupId.value)
})

// 当前选中的项目是否有 Git 配置
const hasGitConfig = computed(() => {
  if (!currentGroup.value) return false
  return !!(
    currentGroup.value.gitInfo?.repoUrl && currentGroup.value.gitInfo?.token
  )
})

// 是否需要显示 Git 配置入口
const needGitConfig = computed(() => {
  return groupTransferType.value === 'GIT' && !hasGitConfig.value
})

// 是否需要显示 Git 字段输入框
const needGitFields = computed(() => {
  return groupTransferType.value === 'GIT' && hasGitConfig.value
})

const defaultExpandedKeys = computed(() => {
  return treeData.value.map((item) => item.id)
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

  if (resourcesByType.MIGRATE_TASK.length > 0) {
    result.push({
      id: `MIGRATE_TASK`,
      label: t('data_import_export_migrate_task'),
      type: 'MIGRATE_TASK',
      children: resourcesByType.MIGRATE_TASK.map((item) => ({
        id: item.id,
        label: item.name,
        type: item.type,
        rerun: item.rerun || false,
        _resource: item, // 保存原始资源引用
      })),
    })
  }

  // 添加类型分组节点
  if (resourcesByType.SYNC_TASK.length > 0) {
    result.push({
      id: `SYNC_TASK`,
      label: t('data_import_export_sync_task'),
      type: 'SYNC_TASK',
      children: resourcesByType.SYNC_TASK.map((item) => ({
        id: item.id,
        label: item.name,
        type: item.type,
        rerun: item.rerun || false,
        _resource: item, // 保存原始资源引用
      })),
    })
  }

  if (resourcesByType.MODULE.length > 0) {
    result.push({
      id: `MODULE`,
      label: 'API',
      type: 'MODULE',
      children: resourcesByType.MODULE.map((item) => ({
        id: item.id,
        label: item.name,
        type: item.type,
      })),
    })
  }

  return result
})

// 生成默认分支名
const generateBranchName = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`
  return `feat_${timestamp}`
}

// 监听弹窗打开
watch(visible, async (val) => {
  if (val) {
    await loadGroups()

    // 重置导出类型和字段
    groupTransferType.value = 'FILE'
    gitBranchName.value = generateBranchName()
    gitPrTitle.value = ''
    gitPrDescription.value = ''

    // 如果有初始项目 ID，自动选中
    if (props.initialGroupId) {
      selectedGroupIds.value = [props.initialGroupId]
      currentGroupId.value = props.initialGroupId
    } else if (groupList.value.length > 0) {
      // 默认选择第一个项目
      selectedGroupIds.value = [groupList.value[0].id!]
      currentGroupId.value = groupList.value[0].id!
    } else {
      selectedGroupIds.value = []
      currentGroupId.value = ''
    }
  }
})

// 处理 rerun 状态变化
const handleRerunChange = (treeNode: any, value: string | number | boolean) => {
  // 同步到原始资源对象
  const boolValue = Boolean(value)
  if (treeNode._resource) {
    treeNode._resource.rerun = boolValue
  }
}

// 处理项目选择（单选）
const handleSelectGroup = (groupId: string) => {
  if (!selectedGroupIds.value.includes(groupId)) {
    selectedGroupIds.value = [groupId]
    currentGroupId.value = groupId
  }
}

// 处理导出类型切换
const handleTransferTypeChange = (
  _type: string | number | boolean | undefined,
) => {
  // 切换到 GIT 时重新生成分支名
  if (_type === 'GIT') {
    gitBranchName.value = generateBranchName()
  }
}

// 打开 Git 配置弹窗
const handleOpenGitConfig = () => {
  if (!currentGroup.value) return
  currentConfigGroup.value = currentGroup.value
  gitConfigDialogVisible.value = true
}

// Git 配置保存成功后的回调
const handleGitConfigSaved = async () => {
  // 重新加载分组列表以获取最新的 Git 配置
  await loadGroups()
}

// 导出分组
const handleExport = async () => {
  if (selectedGroupIds.value.length === 0) {
    ElMessage.warning('请至少选择一个分组')
    return
  }

  // 如果是 GIT 导出，验证必填项
  if (groupTransferType.value === 'GIT' && !hasGitConfig.value) {
    ElMessage.warning('请先配置 Git 信息')
    return
  }

  exporting.value = true

  try {
    // 收集开启了 rerun 的任务
    const rerunData: { [groupId: string]: string[] } = {}

    selectedGroupIds.value.forEach((groupId) => {
      const group = groupList.value.find((g) => g.id === groupId)
      if (!group?.resourceItemList) return

      const rerunTaskIds = group.resourceItemList
        .filter(
          (item) =>
            item.rerun &&
            (item.type === 'SYNC_TASK' || item.type === 'MIGRATE_TASK'),
        )
        .map((item) => item.id)

      if (rerunTaskIds.length > 0) {
        rerunData[groupId] = rerunTaskIds
      }
    })

    if (groupTransferType.value === 'FILE') {
      // 调用导出接口
      const res = await exportGroupInfoBatch({
        groupIds: selectedGroupIds.value,
        groupTransferType: groupTransferType.value,
        groupResetTask: rerunData,
      })
      downloadBlob(res)
    } else {
      // 调用导出接口
      await exportGroupInfoBatchGit({
        groupIds: selectedGroupIds.value,
        groupTransferType: groupTransferType.value,
        groupResetTask: rerunData,
        gitBranchName: gitBranchName.value,
        gitPrTitle: gitPrTitle.value,
        gitPrDescription: gitPrDescription.value,
      })
    }

    ElMessage.success(t('public_message_export_ok'))
    visible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(t('public_message_export_fail'))
  } finally {
    exporting.value = false
  }
}

// 跳转到项目管理页面并新建项目
const handleCreateProject = () => {
  visible.value = false
  // 不在当前路由时，跳转到项目管理页面并新建项目
  if (router.currentRoute.value.name !== 'projectManagement') {
    router.push({
      name: 'projectManagement',
      query: { action: 'create' },
    })
  } else {
    // 如果已经在项目管理页面，则调用新增项目方法
    emit('createProject')
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
    >
      <div class="flex-shrink-0 flex flex-column" style="width: 280px">
        <div class="flex flex-column flex-1 min-h-0">
          <div class="flex align-center gap-2 p-2">
            <!-- 搜索框 -->
            <el-input
              v-model="searchKeyword"
              :placeholder="$t('public_button_search')"
              clearable
            >
              <template #prefix>
                <i-lucide-search class="fs-6" />
              </template>
            </el-input>
          </div>

          <!-- 项目列表 -->
          <el-scrollbar v-loading="groupLoading" class="flex-1 min-h-0 px-2">
            <div class="groups-list gap-1 flex flex-column">
              <div
                v-for="group in filteredGroupList"
                :key="group.id"
                class="group-item"
                :class="{
                  'is-selected': selectedGroupIds.includes(group.id!),
                  'is-current': currentGroupId === group.id,
                }"
                @click="handleSelectGroup(group.id!)"
              >
                <div class="flex align-center gap-2 flex-1 min-w-0">
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
                  <VIcon
                    v-if="selectedGroupIds.includes(group.id!)"
                    class="text-primary"
                  >
                    check
                  </VIcon>
                </div>
              </div>

              <el-empty
                v-if="filteredGroupList.length === 0 && !groupLoading"
                :description="
                  searchKeyword
                    ? $t('public_data_no_result')
                    : $t('data_import_export_no_group')
                "
                :image-size="80"
              >
                <template #description>
                  <el-button v-if="!searchKeyword" @click="handleCreateProject">
                    <template #icon>
                      <i-lucide-plus />
                    </template>
                    {{ $t('data_import_export_add_group') }}
                  </el-button>
                  <span v-else>
                    {{ $t('public_data_no_result') }}
                  </span>
                </template>
              </el-empty>
            </div>
          </el-scrollbar>

          <el-button
            v-if="filteredGroupList.length || searchKeyword"
            class="border-dashed m-2"
            @click="handleCreateProject"
          >
            <template #icon>
              <i-lucide-plus />
            </template>
            {{ $t('data_import_export_add_group') }}
          </el-button>
        </div>
      </div>
      <div class="p-2 pl-0 flex-1 min-w-0 flex flex-column">
        <div
          class="bg-card rounded-xl min-h-0 flex flex-column flex-1 overflow-auto"
          style="border: 1px solid #f2f4f7"
        >
          <!-- 导出类型选择 -->
          <div class="p-3 border-bottom">
            <div class="mb-1">
              <span class="fw-sub">{{
                $t('data_import_export_transfer_type')
              }}</span>
            </div>
            <el-radio-group
              v-model="groupTransferType"
              class="w-100"
              @change="handleTransferTypeChange"
            >
              <el-radio value="FILE">
                <div class="flex align-center gap-1">
                  <el-icon>
                    <i-lucide-file-archive />
                  </el-icon>
                  {{ $t('data_import_export_file_export') }}
                </div>
              </el-radio>
              <el-radio value="GIT">
                <div class="flex align-center gap-1">
                  <el-icon>
                    <i-lucide-git-branch />
                  </el-icon>
                  {{ $t('data_import_export_git_export') }}
                </div>
              </el-radio>
            </el-radio-group>

            <!-- Git 配置入口 -->
            <div v-if="needGitConfig" class="mt-2">
              <el-alert type="warning" :closable="false" show-icon>
                <template #title>
                  <div class="flex align-center gap-2">
                    <span>{{
                      $t('data_import_export_git_config_required')
                    }}</span>
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click="handleOpenGitConfig"
                    >
                      {{ $t('data_import_export_config_git') }}
                    </el-button>
                  </div>
                </template>
              </el-alert>
            </div>

            <!-- Git 分支名 / PR 标题 / PR 描述 -->
            <template v-if="needGitFields">
              <div class="mt-2">
                <div class="mb-1">
                  <span class="fs-7 fw-sub">分支名</span>
                </div>
                <el-input
                  v-model="gitBranchName"
                  placeholder="请输入分支名"
                  clearable
                />
              </div>
              <div class="mt-2">
                <div class="mb-1">
                  <span class="fs-7 fw-sub">PR 标题</span>
                </div>
                <el-input
                  v-model="gitPrTitle"
                  placeholder="请输入 PR 标题"
                  clearable
                />
              </div>
              <div class="mt-2">
                <div class="mb-1">
                  <span class="fs-7 fw-sub">PR 描述</span>
                </div>
                <el-input
                  v-model="gitPrDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入 PR 描述"
                />
              </div>
            </template>
          </div>

          <div class="p-2 min-h-0">
            <el-tree-v2
              v-if="treeData.length > 0"
              :data="treeData"
              node-key="id"
              :default-expanded-keys="defaultExpandedKeys"
              :indent="12"
              :expand-on-click-node="false"
              :props="{
                label: 'label',
                children: 'children',
              }"
              :item-size="32"
              :height="384"
              class="preview-tree"
            >
              <template #default="{ node, data }">
                <div
                  class="tree-node flex align-center gap-2 min-w-0 flex-1 pr-2"
                >
                  <el-icon v-if="data.children" :size="16">
                    <i-lucide-folder-open v-if="node.expanded" />
                    <i-lucide-folder-closed v-else />
                  </el-icon>
                  <span v-if="node.label" class="node-label min-w-0 elipsis">
                    <overflow-tooltip
                      :text="node.label"
                      :endable="false"
                      :show-after="300"
                      :hide-after="0"
                      placement="left"
                    />
                  </span>
                  <span
                    v-else
                    class="font-color-slight text-decoration-line-through"
                    >{{ t('data_import_export_nonexistent') }}</span
                  >
                  <el-tag
                    v-if="data.children"
                    size="small"
                    type="info"
                    round
                    disable-transitions
                  >
                    {{ data.children.length }}
                  </el-tag>
                  <el-switch
                    v-else-if="
                      (node.label && data.type === 'MIGRATE_TASK') ||
                      data.type === 'SYNC_TASK'
                    "
                    v-model="data.rerun"
                    class="ml-auto"
                    size="small"
                    inline-prompt
                    :active-text="$t('data_import_export_rerun')"
                    inactive-text=""
                    @change="(val) => handleRerunChange(data, val)"
                  />
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

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button
          :loading="exporting"
          type="primary"
          :disabled="selectedGroupIds.length === 0"
          @click="handleExport"
        >
          {{ $t('public_button_export') }}
          {{
            selectedGroupIds.length > 0 ? `(${selectedGroupIds.length})` : ''
          }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Git 配置弹窗 -->
  <git-config-dialog
    v-if="currentConfigGroup"
    v-model="gitConfigDialogVisible"
    :group="currentConfigGroup"
    @saved="handleGitConfigSaved"
  />
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

  .group-item {
    padding: 8px 12px;
    border-radius: 12px;
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

    &.is-selected {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    .group-name {
      font-size: 14px;
      font-weight: 500;
      // color: var(--el-text-color-primary);
    }
  }
}

.preview-tree {
  // flex: 1;
  // overflow-y: auto;
  // padding: 16px;

  // :deep(.el-tree) {
  //   background-color: transparent;
  // }

  // :deep(.el-tree-node__content) {
  //   height: 32px;
  //   margin-bottom: 2px;
  // }

  :deep(.el-tree-node__content .el-switch .is-text) {
    padding: 0 2px 0 4px;
  }

  // .tree-node {
  //   display: flex;
  //   align-items: center;
  //   gap: 8px;
  //   flex: 1;
  //   min-width: 0;

  //   .node-label {
  //     flex: 1;
  //     font-size: 14px;
  //     overflow: hidden;
  //     text-overflow: ellipsis;
  //     white-space: nowrap;
  //   }
  // }
}
</style>
