<script setup lang="ts">
import {
  createGroupInfo,
  deleteGroupInfo,
  fetchGroupInfoList,
  updateGroupInfo,
  type GroupInfoDto,
  type ResourceItem,
  type ResourceType,
} from '@tap/api/core/group-info'
import { fetchApiModules } from '@tap/api/core/modules'
import { fetchTasks } from '@tap/api/core/task'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'

const visible = defineModel<boolean>()
const emit = defineEmits(['saved'])

// 左侧分组列表
const groupList = ref<GroupInfoDto[]>([])
const selectedGroup = ref<GroupInfoDto | null>(null)
const groupLoading = ref(false)
const groupFilterText = ref('')
const showGroupSearch = ref(false)
const groupSearchInput = ref()

// 中间资源列表
const activeTab = ref<'SYNC_TASK' | 'MIGRATE_TASK' | 'MODULE'>('SYNC_TASK')
const searchKeyword = ref('')
const resourceList = ref<any[]>([])
const resourceLoading = ref(false)
const selectedResources = ref<string[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPage = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 右侧已选资源
const addedResources = ref<ResourceItem[]>([])
const selectedAddedResources = ref<string[]>([])
const treeRef = ref()

// Tab 配置
const tabs = [
  { label: '复制任务', value: 'SYNC_TASK', icon: 'i-lucide-copy' },
  { label: '开发任务', value: 'MIGRATE_TASK', icon: 'i-lucide-code' },
  { label: 'API', value: 'MODULE', icon: 'i-lucide-globe' },
]

// 过滤后的分组列表
const filteredGroupList = computed(() => {
  if (!groupFilterText.value) {
    return groupList.value
  }
  const keyword = groupFilterText.value.toLowerCase()
  return groupList.value.filter(
    (group) =>
      group.name.toLowerCase().includes(keyword) ||
      group.description?.toLowerCase().includes(keyword),
  )
})

// 加载分组列表
const loadGroups = async () => {
  groupLoading.value = true
  try {
    const result = await fetchGroupInfoList({
      order: 'createAt DESC',
    })
    groupList.value = result.items || []
    if (groupList.value.length > 0 && !selectedGroup.value) {
      selectedGroup.value = groupList.value[0]
    }
  } catch {
    ElMessage.error('加载分组列表失败')
  } finally {
    groupLoading.value = false
  }
}

// 打开分组搜索
const openGroupSearch = () => {
  showGroupSearch.value = !showGroupSearch.value
  if (showGroupSearch.value) {
    nextTick(() => {
      groupSearchInput.value?.focus()
    })
  } else {
    groupFilterText.value = ''
  }
}

// 添加分组
const handleAddGroup = async () => {
  ElMessageBox.prompt('请输入分组名称', '新增分组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '分组名称不能为空',
  })
    .then(async ({ value }) => {
      try {
        const newGroup = await createGroupInfo({
          name: value,
          description: '',
          resourceItemList: [],
        })
        ElMessage.success('创建成功')
        await loadGroups()
        selectedGroup.value = newGroup
      } catch {
        ElMessage.error('创建失败')
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 编辑分组
const handleEditGroup = async (group: GroupInfoDto) => {
  ElMessageBox.prompt('请输入分组名称', '编辑分组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '分组名称不能为空',
    inputValue: group.name,
  })
    .then(async ({ value }) => {
      try {
        await updateGroupInfo({
          ...group,
          name: value,
        })
        ElMessage.success('修改成功')
        await loadGroups()
      } catch {
        ElMessage.error('修改失败')
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 删除分组
const handleDeleteGroup = async (group: GroupInfoDto) => {
  ElMessageBox.confirm(`确定要删除分组"${group.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteGroupInfo(group.id!)
        ElMessage.success('删除成功')
        if (selectedGroup.value?.id === group.id) {
          selectedGroup.value = null
        }
        await loadGroups()
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 分组命令处理
const handleGroupCommand = (command: string, group: GroupInfoDto) => {
  if (command === 'edit') {
    handleEditGroup(group)
  } else if (command === 'delete') {
    handleDeleteGroup(group)
  }
}

// 加载资源列表
const loadResources = async () => {
  resourceLoading.value = true
  try {
    let result: any
    const filter: any = {
      limit: pageSize.value,
      skip: (currentPage.value - 1) * pageSize.value,
      where: {},
    }

    if (searchKeyword.value) {
      filter.where.name = { like: searchKeyword.value, options: 'i' }
    }

    switch (activeTab.value) {
      case 'SYNC_TASK':
        filter.where.syncType = 'migrate'
        result = await fetchTasks(filter)
        break
      case 'MIGRATE_TASK':
        filter.where.syncType = 'sync'
        result = await fetchTasks(filter)
        break
      case 'MODULE':
        result = await fetchApiModules(filter)
        break
    }

    resourceList.value = (result?.items || result || []).map((item: any) => ({
      id: item.id,
      name: item.name || item.value || item.tableName,
      type: activeTab.value,
    }))
    totalCount.value = result?.total || 0
  } catch {
    ElMessage.error('加载资源列表失败')
  } finally {
    resourceLoading.value = false
  }
}

// 判断资源是否已添加
const isResourceAdded = (id: string) => {
  return addedResources.value.some((item) => item.id === id)
}

// 切换资源选中状态
const toggleResourceSelection = (resource: any) => {
  if (isResourceAdded(resource.id)) {
    return
  }
  const index = selectedResources.value.indexOf(resource.id)
  if (index !== -1) {
    selectedResources.value.splice(index, 1)
  } else {
    selectedResources.value.push(resource.id)
  }
}

// 添加单个资源
const addSingleResource = (resource: any) => {
  if (!isResourceAdded(resource.id)) {
    addedResources.value.push({
      id: resource.id,
      name: resource.name,
      type: resource.type as ResourceType,
    })
  }
}

// 批量添加资源
const addSelectedResources = () => {
  selectedResources.value.forEach((id) => {
    const resource = resourceList.value.find((item) => item.id === id)
    if (resource && !isResourceAdded(id)) {
      addSingleResource(resource)
    }
  })
  selectedResources.value = []
}

// 移除选中的资源
const removeSelectedResources = () => {
  addedResources.value = addedResources.value.filter(
    (item) => !selectedAddedResources.value.includes(item.id),
  )
  selectedAddedResources.value = []
  // 清空树的选中状态
  nextTick(() => {
    treeRef.value?.setCheckedKeys([])
  })
}

// 保存修改
const saving = ref(false)
const handleSave = async () => {
  if (!selectedGroup.value) {
    ElMessage.warning('请选择一个分组')
    return
  }

  saving.value = true
  try {
    await updateGroupInfo({
      ...selectedGroup.value,
      resourceItemList: addedResources.value.map((item) => ({
        id: item.id,
        type: item.type,
      })),
    })
    ElMessage.success('保存成功')
    emit('saved')
    // visible.value = false
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 按类型分组的已选资源（树形结构数据）
const treeData = computed(() => {
  const groups: Record<string, ResourceItem[]> = {
    SYNC_TASK: [],
    MIGRATE_TASK: [],
    MODULE: [],
  }

  addedResources.value.forEach((item) => {
    if (groups[item.type]) {
      groups[item.type].push(item)
    }
  })

  return [
    {
      id: 'group-SYNC_TASK',
      label: '复制任务',
      type: 'SYNC_TASK',
      children: groups.SYNC_TASK,
    },
    {
      id: 'group-MIGRATE_TASK',
      label: '开发任务',
      type: 'MIGRATE_TASK',
      children: groups.MIGRATE_TASK,
    },
    {
      id: 'group-MODULE',
      label: 'API',
      type: 'MODULE',
      children: groups.MODULE,
    },
  ]
})

// 已选资源总数
const totalSelectedCount = computed(() => addedResources.value.length)

// 可批量添加的数量
const canAddCount = computed(() => selectedResources.value.length)

// 监听分组切换
watch(selectedGroup, (newGroup) => {
  if (newGroup) {
    addedResources.value = [...(newGroup.resourceItemList || [])]
    selectedAddedResources.value = []
    // 清空树的选中状态
    nextTick(() => {
      treeRef.value?.setCheckedKeys([])
    })
  }
})

// 监听 tab 切换
watch(activeTab, () => {
  searchKeyword.value = ''
  selectedResources.value = []
  currentPage.value = 1
  loadResources()
})

// 监听搜索关键词
watch(searchKeyword, () => {
  currentPage.value = 1
  loadResources()
})

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    currentPage.value = 1
    loadGroups()
    loadResources()
  }
})

// 全选/取消全选可用资源
const isAllSelected = computed(() => {
  const availableResources = resourceList.value.filter(
    (item) => !isResourceAdded(item.id),
  )
  return (
    availableResources.length > 0 &&
    availableResources.every((item) =>
      selectedResources.value.includes(item.id),
    )
  )
})

const handleSelectAll = (checked: any) => {
  if (checked) {
    const availableResources = resourceList.value.filter(
      (item) => !isResourceAdded(item.id),
    )
    selectedResources.value = availableResources.map((item) => item.id)
  } else {
    selectedResources.value = []
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="1200px"
    class="group-management-modal p-0 overflow-hidden"
    :close-on-click-modal="false"
  >
    <template #header="{ titleClass }">
      <div class="pt-5 px-6">
        <div class="flex align-center justify-between">
          <div class="flex align-center gap-3">
            <!-- <div
              class="flex align-center justify-center p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
            > -->
            <el-icon size="20" color="var(--el-color-primary)">
              <i-lucide-layers />
            </el-icon>
            <!-- </div> -->
            <div :class="titleClass">Group Management</div>
          </div>
        </div>
      </div>
    </template>

    <div class="modal-body">
      <!-- 左侧：分组列表 -->
      <div class="groups-panel">
        <div class="panel-header p-3 pb-0">
          <div class="flex align-center gap-1" style="--btn-space: 0">
            <div class="fs-6 flex-1">
              <span class="fw-sub font-color-dark">GROUPS</span>
            </div>
            <el-button
              text
              :class="{ 'is-active': showGroupSearch }"
              @click="openGroupSearch"
            >
              <template #icon>
                <i-lucide-search />
              </template>
            </el-button>
            <el-button text @click="handleAddGroup">
              <template #icon>
                <i-lucide-plus />
              </template>
            </el-button>
          </div>
        </div>

        <div v-if="showGroupSearch" class="px-2 pb-2 mt-2">
          <el-input
            ref="groupSearchInput"
            v-model="groupFilterText"
            placeholder="搜索分组..."
            clearable
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>

        <div v-loading="groupLoading" class="groups-list">
          <div
            v-for="group in filteredGroupList"
            :key="group.id"
            class="group-item"
            :class="{ 'is-active': selectedGroup?.id === group.id }"
            @click="selectedGroup = group"
          >
            <div class="flex align-center gap-2 flex-1 min-w-0">
              <el-icon size="18">
                <i-lucide-folder />
              </el-icon>
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="group-name ellipsis" :title="group.name">
                  {{ group.name }}
                </div>
                <div
                  v-if="group.description && selectedGroup?.id === group.id"
                  class="group-desc ellipsis"
                  :title="group.description"
                >
                  {{ group.description }}
                </div>
              </div>
              <el-dropdown
                class="btn-menu"
                @command="handleGroupCommand($event, group)"
              >
                <el-button text size="small" @click.stop>
                  <template #icon>
                    <i-lucide-more-vertical />
                  </template>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon class="mr-2">
                        <i-lucide-edit />
                      </el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" class="is-danger">
                      <el-icon class="mr-2">
                        <i-lucide-trash-2 />
                      </el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-empty
            v-if="!groupLoading && filteredGroupList.length === 0"
            description="暂无分组"
            :image-size="60"
          />
        </div>
      </div>

      <!-- 中间：资源选择 -->
      <div class="resources-panel">
        <div class="panel-header p-3">
          <el-input
            v-model="searchKeyword"
            placeholder="Search resources..."
            clearable
            @input="loadResources"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Tab 切换 -->
        <div class="resource-tabs">
          <el-segmented
            v-model="activeTab"
            :options="tabs"
            block
            class="w-100 rounded-0 px-2"
          />
        </div>

        <!-- 资源列表 -->
        <div v-loading="resourceLoading" class="resources-list">
          <div class="list-body">
            <div
              v-for="resource in resourceList"
              :key="resource.id"
              class="resource-item rounded-xl"
              :class="{ 'is-disabled': isResourceAdded(resource.id) }"
              @click="toggleResourceSelection(resource)"
            >
              <el-checkbox
                v-model="selectedResources"
                :label="resource.id"
                :disabled="isResourceAdded(resource.id)"
                @click.stop
              >
                <div class="resource-content">
                  <div class="resource-name">{{ resource.name }}</div>
                  <el-tag
                    v-if="isResourceAdded(resource.id)"
                    size="small"
                    type="info"
                    disable-transitions
                  >
                    Added
                  </el-tag>
                </div>
              </el-checkbox>
              <el-button
                v-if="!isResourceAdded(resource.id)"
                text
                class="add-btn"
                @click.stop="addSingleResource(resource)"
              >
                <template #icon>
                  <el-icon><i-lucide-plus /></el-icon>
                </template>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 批量添加按钮和分页 -->
        <div class="panel-footer">
          <div class="flex align-center gap-3 px-3 py-3">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="selectedResources.length > 0 && !isAllSelected"
              @change="handleSelectAll"
            >
              Select All Available
            </el-checkbox>
            <span class="font-color-sslight fs-8">
              {{ resourceList.length }} items
            </span>
            <el-button
              class="ml-auto"
              type="primary"
              :disabled="canAddCount === 0"
              @click="addSelectedResources"
            >
              Add {{ canAddCount > 0 ? canAddCount : '' }} Selected
              <el-icon class="ml-1.5"><i-lucide-arrow-right /></el-icon>
            </el-button>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            hide-on-single-page
            class="table-pagination justify-center border-top py-2"
            layout="prev, jumper, slot, next"
            :total="totalCount"
            :page-size="pageSize"
            @change="loadResources()"
          >
            <span class="mx-3">/</span>
            <span class="mr-2">{{ totalPage }}</span>
          </el-pagination>
        </div>
      </div>

      <!-- 右侧：已选资源树 -->
      <div class="selected-panel">
        <div class="panel-header p-3">
          <span class="fw-sub font-color-dark lh-6">Selected</span>
          <el-button
            v-if="selectedAddedResources.length > 0"
            text
            type="danger"
            size="small"
            @click="removeSelectedResources"
          >
            <template #icon>
              <el-icon><i-lucide-trash-2 /></el-icon>
            </template>
            Remove ({{ selectedAddedResources.length }})
          </el-button>
        </div>

        <div class="selected-tree">
          <el-tree
            ref="treeRef"
            :data="treeData"
            node-key="id"
            :indent="8"
            show-checkbox
            default-expand-all
            :props="{
              label: (data: any) => data.name || data.label,
              children: 'children',
            }"
            @check="
              (_data: any, { checkedKeys }: any) => {
                selectedAddedResources = checkedKeys.filter(
                  (key: string) => !key.startsWith('group-'),
                )
              }
            "
          >
            <template #default="{ node, data }">
              <div class="tree-node pr-2">
                <!-- <el-icon v-if="!data.children">
                  <component :is="getResourceIcon(data.type)" />
                </el-icon> -->
                <el-icon v-if="data.children">
                  <i-lucide-folder />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
                <el-tag
                  v-if="data.children?.length"
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
            v-if="totalSelectedCount === 0"
            description="暂无选中资源"
            :image-size="80"
          />
        </div>

        <!-- 底部统计和保存 -->
        <div class="panel-footer p-3">
          <el-button
            class="w-100"
            type="primary"
            :loading="saving"
            :disabled="!selectedGroup"
            block
            @click="handleSave"
          >
            <template #icon>
              <el-icon><i-lucide-save /></el-icon>
            </template>
            Save Changes
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.group-management-modal {
  max-height: 80vh;
}

.modal-body {
  display: flex;
  height: 70vh;
  min-height: 500px;
  max-height: 700px;
  border-top: 1px solid var(--el-border-color);
}

// 左侧分组面板
.groups-panel {
  width: 220px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-fill-color-lighter);
  border-right: 1px solid var(--el-border-color);

  .panel-header {
    padding: 16px;
    // border-bottom: 1px solid var(--el-border-color);
    // font-size: 12px;
    letter-spacing: 0.5px;
  }

  .groups-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .group-item {
    padding: 8px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background-color: var(--el-fill-color);

      .btn-menu {
        opacity: 1;
      }
    }

    &.is-active {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      color: var(--el-color-primary);
      .group-name {
        font-weight: 600;
      }
    }

    .group-name {
      font-size: 14px;
      font-weight: 500;
    }

    .group-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-menu {
      opacity: 0;
      transition: opacity 0.2s;
    }
  }
}

// 中间资源面板
.resources-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color);

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color);
  }

  .resource-tabs {
    border-bottom: 1px solid var(--el-border-color);
  }

  .resources-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color);
      background-color: var(--el-fill-color-lighter);
    }

    .list-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color-darker);
        border-radius: 3px;
      }
    }
  }

  .resource-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color);

      .add-btn {
        opacity: 1;
      }
    }

    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: var(--el-fill-color-lighter);
    }

    .resource-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .resource-name {
      font-size: 14px;
    }

    .add-btn {
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  .panel-footer {
    border-top: 1px solid var(--el-border-color);
    // background-color: var(--el-fill-color-lighter);

    .table-pagination {
      :deep(.el-pagination__jump) {
        margin-left: 0;
      }
    }
  }
}

// 右侧已选面板
.selected-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color);
    // font-size: 12px;
    // letter-spacing: 0.5px;
  }

  .selected-tree {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    // &::-webkit-scrollbar {
    //   width: 6px;
    // }

    // &::-webkit-scrollbar-thumb {
    //   background-color: var(--el-border-color-darker);
    //   border-radius: 3px;
    // }

    // :deep(.el-tree) {
    //   background-color: transparent;
    // }

    :deep(.el-tree-node__content) {
      height: 32px;
      margin-bottom: 2px;
    }

    :deep(.el-tree-node__expand-icon) {
      font-size: 14px;
    }

    :deep(.el-checkbox) {
      height: auto;
    }

    :deep(.el-checkbox__inner) {
      width: 16px;
      height: 16px;
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

  .panel-footer {
    padding: 16px;
    border-top: 1px solid var(--el-border-color);
    // background-color: var(--el-fill-color-lighter);

    .footer-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      margin-bottom: 12px;
      background-color: white;
      border-radius: 8px;
      font-size: 14px;
    }
  }
}
</style>
