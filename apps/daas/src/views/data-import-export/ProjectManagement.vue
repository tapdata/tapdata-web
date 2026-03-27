<script setup lang="ts">
import {
  createGroupInfo,
  deleteGroupInfo,
  fetchGroupInfoApis,
  fetchGroupInfoList,
  fetchGroupInfoTasks,
  updateGroupInfo,
  type GroupInfoDto,
  type ResourceItem,
  type ResourceType,
} from '@tap/api/core/group-info'
import { PageContainer } from '@tap/business'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { makeStatusAndDisabled } from '@tap/business/src/shared'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GitConfigDialog from './GitConfigDialog.vue'
import GroupExportDialog from './GroupExportDialog.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// 导出对话框
const exportDialogVisible = ref(false)
const exportDialogInitialGroupId = ref<string | undefined>(undefined)

// Git 配置对话框
const gitConfigDialogVisible = ref(false)

// 左侧项目列表
const groupList = ref<GroupInfoDto[]>([])
const selectedGroup = ref<GroupInfoDto | null>(null)
const groupLoading = ref(false)
const groupFilterText = ref('')
const showGroupSearch = ref(false)
const groupSearchInput = ref()

// 中间资源列表
const activeTab = ref<'SYNC_TASK' | 'MIGRATE_TASK' | 'MODULE'>('MIGRATE_TASK')
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
const tabs = computed(() => [
  {
    label: t('data_import_export_migrate_task'),
    value: 'MIGRATE_TASK',
  },
  {
    label: t('data_import_export_sync_task'),
    value: 'SYNC_TASK',
  },
  {
    label: 'API',
    value: 'MODULE',
  },
])

// 过滤后的项目列表
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

// 加载项目列表
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
    ElMessage.error(t('public_message_operation_failed'))
  } finally {
    groupLoading.value = false
  }
}

// 打开项目搜索
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

// 添加项目
const handleAddGroup = async () => {
  ElMessageBox.prompt(
    t('data_import_export_group_name_placeholder'),
    t('data_import_export_add_group'),
    {
      confirmButtonText: t('public_button_confirm'),
      cancelButtonText: t('public_button_cancel'),
      inputPattern: /\S+/,
      inputErrorMessage: t('data_import_export_group_name_required'),
    },
  )
    .then(async ({ value }) => {
      try {
        const newGroup = await createGroupInfo({
          name: value,
          description: '',
          resourceItemList: [],
        })
        ElMessage.success(t('public_message_create_ok'))
        await loadGroups()
        selectedGroup.value = newGroup
      } catch {
        ElMessage.error(t('public_message_create_fail'))
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 编辑项目
const handleEditGroup = async (group: GroupInfoDto) => {
  ElMessageBox.prompt(
    t('data_import_export_group_name_placeholder'),
    t('data_import_export_edit_group'),
    {
      confirmButtonText: t('public_button_confirm'),
      cancelButtonText: t('public_button_cancel'),
      inputPattern: /\S+/,
      inputErrorMessage: t('data_import_export_group_name_required'),
      inputValue: group.name,
    },
  )
    .then(async ({ value }) => {
      try {
        await updateGroupInfo({
          ...group,
          name: value,
        })
        ElMessage.success(t('public_message_update_ok'))
        await loadGroups()
      } catch {
        ElMessage.error(t('public_message_update_fail'))
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 删除项目
const handleDeleteGroup = async (group: GroupInfoDto) => {
  ElMessageBox.confirm(
    t('data_import_export_delete_group_confirm', { name: group.name }),
    t('data_import_export_delete_confirm_title'),
    {
      confirmButtonText: t('public_button_confirm'),
      cancelButtonText: t('public_button_cancel'),
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        await deleteGroupInfo(group.id!)
        ElMessage.success(t('public_message_delete_ok'))
        if (selectedGroup.value?.id === group.id) {
          selectedGroup.value = null
        }
        await loadGroups()
      } catch {
        ElMessage.error(t('public_message_delete_fail'))
      }
    })
    .catch(() => {
      // 用户取消
    })
}

// 项目命令处理
const handleGroupCommand = (command: string, group: GroupInfoDto) => {
  if (command === 'edit') {
    handleEditGroup(group)
  } else if (command === 'delete') {
    handleDeleteGroup(group)
  }
}

// 判断资源是否属于其他分组
const isResourceInOtherGroup = (resource: any) => {
  return (
    resource.groupId &&
    selectedGroup.value?.id &&
    resource.groupId !== selectedGroup.value.id
  )
}

// 点击分组名称跳转到对应分组
const handleNavigateToGroup = (resource: any) => {
  const targetGroup = groupList.value.find((g) => g.id === resource.groupId)
  if (targetGroup) {
    selectedGroup.value = targetGroup
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

    const type = activeTab.value

    const mapTask = (item: any) => {
      makeStatusAndDisabled(item)

      return {
        id: item.id,
        name: item.name,
        status: item.status,
        type,
        groupId: item.groupId || null,
        groupName: item.groupName || null,
      }
    }

    switch (type) {
      case 'SYNC_TASK':
        filter.where.syncType = 'sync'
        result = await fetchGroupInfoTasks(filter)
        resourceList.value = result.items.map(mapTask)
        break
      case 'MIGRATE_TASK':
        filter.where.syncType = 'migrate'
        result = await fetchGroupInfoTasks(filter)
        resourceList.value = result.items.map(mapTask)
        break
      case 'MODULE':
        result = await fetchGroupInfoApis(filter)
        resourceList.value = result.items.map((item: any) => {
          const pathJoin: string[] = []
          item.apiVersion && pathJoin.push(item.apiVersion)
          item.prefix && pathJoin.push(item.prefix)
          item.basePath && pathJoin.push(item.basePath)
          return {
            id: item.id,
            name: item.name,
            path: `/${pathJoin.join('/')}`,
            type,
            groupId: item.groupId || null,
            groupName: item.groupName || null,
          }
        })
        break
    }

    totalCount.value = result?.total || 0
  } catch (error) {
    ElMessage.error(t('data_import_export_load_resource_failed'))
    console.error(error)
  } finally {
    resourceLoading.value = false
  }
}

// 判断资源是否已添加
const isResourceAdded = (id: string) => {
  return addedResources.value.some((item) => item.id === id)
}

// 判断资源是否不可操作（已添加或属于其他分组）
const isResourceDisabled = (resource: any) => {
  return isResourceAdded(resource.id) || isResourceInOtherGroup(resource)
}

// 切换资源选中状态
const toggleResourceSelection = (resource: any) => {
  if (isResourceDisabled(resource)) {
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

// 计算已选资源总数
const totalSelectedCount = computed(() => addedResources.value.length)

// 计算不存在的资源数量
const nonExistentResourcesCount = computed(() => {
  return addedResources.value.filter((item) => !item.name).length
})

// 一键清理不存在的资源
const removeNonExistentResources = () => {
  addedResources.value = addedResources.value.filter((item) => item.name)
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
    ElMessage.warning(t('data_import_export_select_group_tip'))
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
    ElMessage.success(t('public_message_save_ok'))
    // emit('saved')
    // visible.value = false
  } catch {
    console.error('保存失败:', error)
    ElMessage.error(t('public_message_save_fail'))
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

  const data: any[] = []

  if (groups.MIGRATE_TASK.length > 0) {
    data.push({
      id: 'group-MIGRATE_TASK',
      label: t('data_import_export_migrate_task'),
      type: 'MIGRATE_TASK',
      children: groups.MIGRATE_TASK,
    })
  }

  if (groups.SYNC_TASK.length > 0) {
    data.push({
      id: 'group-SYNC_TASK',
      label: t('data_import_export_sync_task'),
      type: 'SYNC_TASK',
      children: groups.SYNC_TASK,
    })
  }

  if (groups.MODULE.length > 0) {
    data.push({
      id: 'group-MODULE',
      label: 'API',
      type: 'MODULE',
      children: groups.MODULE,
    })
  }

  return data
})

// 已选资源总数
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

// 打开导出对话框
const handleExport = () => {
  if (selectedGroup.value?.id) {
    exportDialogInitialGroupId.value = selectedGroup.value.id
  } else {
    exportDialogInitialGroupId.value = undefined
  }
  exportDialogVisible.value = true
}

// 打开 Git 配置对话框
const handleGitConfig = () => {
  if (!selectedGroup.value) {
    ElMessage.warning(t('data_import_export_select_group_tip'))
    return
  }
  gitConfigDialogVisible.value = true
}

// 页面加载时初始化
onMounted(() => {
  currentPage.value = 1
  loadGroups()
  loadResources()

  // 检查是否需要打开新建项目弹窗
  if (route.query.action === 'create') {
    router.replace({ query: {} })
    nextTick(() => {
      handleAddGroup()
    })
  }
})

// 全选/取消全选可用资源
const isAllSelected = computed(() => {
  const availableResources = resourceList.value.filter(
    (item) => !isResourceDisabled(item),
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
      (item) => !isResourceDisabled(item),
    )
    selectedResources.value = availableResources.map((item) => item.id)
  } else {
    selectedResources.value = []
  }
}
</script>

<template>
  <PageContainer>
    <template #title>
      <div class="flex align-center gap-2">
        <span
          class="fs-5 font-color-dark lh-8 ellipsis flex gap-2 align-center"
        >
          <span class="font-color-light">{{ $t($route.meta.title) }}</span>
          <template v-if="selectedGroup">
            <el-icon :size="24"><i-lucide-chevron-right /></el-icon>
            {{ selectedGroup?.name }}
          </template>
        </span>
      </div>
    </template>
    <template #actions>
      <el-button @click="handleGitConfig">
        <template #icon>
          <i-lucide-github />
        </template>
        {{ t('data_import_export_git_config') }}
      </el-button>
      <el-button @click="handleExport">
        <template #icon>
          <i-lucide-download />
        </template>
        {{ t('data_import_export_export') }}
      </el-button>
    </template>
    <div class="flex w-100 h-100 bg-light rounded-xl">
      <!-- 左侧：项目列表 -->
      <div class="groups-panel bg-light rounded-xl">
        <div class="panel-header p-3 pb-0">
          <div class="flex align-center gap-1" style="--btn-space: 0">
            <div class="fs-6 flex-1">
              <span class="fw-sub font-color-dark">{{
                t('data_import_export_groups').toUpperCase()
              }}</span>
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

        <div v-if="showGroupSearch" class="px-2 mt-2">
          <el-input
            ref="groupSearchInput"
            v-model="groupFilterText"
            :placeholder="t('data_import_export_search_group')"
            clearable
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-scrollbar v-loading="groupLoading" class="flex-1 min-h-0">
          <div class="groups-list flex flex-column gap-1">
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
                  <div class="group-name ellipsis">
                    <OverflowTooltip
                      :text="group.name"
                      :endable="false"
                      :show-after="300"
                      :hide-after="0"
                      placement="left"
                    />
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
                        {{ t('public_button_edit') }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" class="is-danger">
                        <el-icon class="mr-2">
                          <i-lucide-trash-2 />
                        </el-icon>
                        {{ t('public_button_delete') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <el-empty
              v-if="!groupLoading && filteredGroupList.length === 0"
              :description="t('data_import_export_no_group')"
              :image-size="60"
            >
              <template #description>
                <el-button @click="handleAddGroup">
                  <template #icon>
                    <i-lucide-plus />
                  </template>
                  {{ t('data_import_export_add_group') }}
                </el-button>
              </template>
            </el-empty>
          </div>
        </el-scrollbar>
      </div>
      <div class="m-2 bg-card rounded-xl overflow-hidden shadow-sm flex flex-1">
        <div class="resources-panel">
          <div class="panel-header p-3 py-2">
            <el-input
              v-model="searchKeyword"
              :placeholder="t('data_import_export_search_name')"
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
                :class="{
                  'is-disabled': isResourceDisabled(resource),
                  'is-other-group': isResourceInOtherGroup(resource),
                }"
                @click="toggleResourceSelection(resource)"
              >
                <el-checkbox
                  v-model="selectedResources"
                  :label="resource.id"
                  :disabled="isResourceDisabled(resource)"
                  @click.stop
                >
                  <div class="resource-content">
                    <div class="resource-name">{{ resource.name }}</div>
                    <el-tag
                      v-if="activeTab === 'MODULE'"
                      type="info"
                      class="is-code is-wrap px-1.5 font-mono"
                      disable-transitions
                    >
                      {{ resource.path }}
                    </el-tag>
                    <TaskStatus v-else :task="resource" class="zoom-xs" />
                  </div>
                </el-checkbox>
                <el-tag
                  v-if="isResourceInOtherGroup(resource)"
                  type="warning"
                  class="group-tag"
                  disable-transitions
                  @click.stop="handleNavigateToGroup(resource)"
                >
                  <el-icon class="mr-1"><i-lucide-folder /></el-icon>
                  {{ resource.groupName }}
                </el-tag>
                <el-button
                  v-else-if="!isResourceAdded(resource.id)"
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
            <div
              class="flex align-center justify-content-between gap-3 px-3 py-3 position-relative"
            >
              <el-checkbox
                :model-value="isAllSelected"
                :indeterminate="selectedResources.length > 0 && !isAllSelected"
                @change="handleSelectAll"
              >
                {{ t('public_all_selected') }}
                ({{ resourceList.length }})
              </el-checkbox>
              <el-pagination
                v-model:current-page="currentPage"
                hide-on-single-page
                class="table-pagination position-absolute start-50 top-50 translate-middle z-10"
                layout="prev, jumper, slot, next"
                :total="totalCount"
                :page-size="pageSize"
                @change="loadResources()"
              >
                <span class="mx-3">/</span>
                <span class="mr-2">{{ totalPage }}</span>
              </el-pagination>
              <el-button
                type="primary"
                :disabled="canAddCount === 0"
                @click="addSelectedResources"
              >
                {{ t('data_import_export_add_selected') }}
                {{ canAddCount > 0 ? canAddCount : '' }}
                <el-icon class="ml-1.5"><i-lucide-arrow-right /></el-icon>
              </el-button>
            </div>

            <!-- 分页 -->
          </div>
        </div>

        <!-- 右侧：已选资源树 -->
        <div class="selected-panel">
          <div class="panel-header p-3" style="height: 49px">
            <span class="fw-sub font-color-dark">{{
              t('data_import_export_selected')
            }}</span>
            <div class="flex gap-2" style="--btn-space: 0">
              <el-button
                v-if="nonExistentResourcesCount > 0"
                text
                type="warning"
                @click="removeNonExistentResources"
              >
                <template #icon>
                  <el-icon><i-lucide-trash-2 /></el-icon>
                </template>
                {{ t('data_import_export_clean_nonexistent') }} ({{
                  nonExistentResourcesCount
                }})
              </el-button>
              <el-button
                v-if="selectedAddedResources.length > 0"
                text
                type="danger"
                @click="removeSelectedResources"
              >
                <template #icon>
                  <el-icon><i-lucide-trash-2 /></el-icon>
                </template>
                {{ t('data_import_export_remove_selected') }} ({{
                  selectedAddedResources.length
                }})
              </el-button>
            </div>
          </div>

          <div class="selected-tree">
            <el-tree
              v-if="totalSelectedCount > 0"
              ref="treeRef"
              empty-text=""
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
                <div class="tree-node pr-2 min-w-0">
                  <el-icon v-if="data.children" :size="16">
                    <i-lucide-folder-open v-if="node.expanded" />
                    <i-lucide-folder-closed v-else />
                  </el-icon>
                  <OverflowTooltip
                    v-if="node.label"
                    class="node-label min-w-0 elipsis"
                    :text="node.label"
                    :endable="false"
                    :show-after="300"
                    :hide-after="0"
                    placement="left"
                  />
                  <span
                    v-else
                    class="font-color-slight text-decoration-line-through"
                    >{{ t('data_import_export_nonexistent') }}</span
                  >
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
              v-else
              :description="t('data_import_export_no_selected_resource')"
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
              {{ t('public_button_save') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <GroupExportDialog
      v-model="exportDialogVisible"
      :initial-group-id="exportDialogInitialGroupId"
      @create-project="handleAddGroup"
    />

    <!-- Git 配置对话框 -->
    <GitConfigDialog v-model="gitConfigDialogVisible" :group="selectedGroup" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.project-management-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  display: flex;
  flex: 1;
  // background-color: var(--fill-quaternary);
  gap: 12px;
  overflow: hidden;
  min-height: 0;
}

// 左侧项目面板
.groups-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-fill-color-lighter);
  // border-right: 1px solid var(--el-border-color);

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
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background-color: var(--fill-hover);

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

    &.is-other-group {
      opacity: 0.7;
      border-color: var(--el-color-warning-light-5);
      background-color: var(--el-color-warning-light-9);
    }

    .group-tag {
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        opacity: 0.8;
      }
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
      :deep(.el-pagination__goto) {
        display: none;
      }
    }
  }
}

// 右侧已选面板
.selected-panel {
  width: 360px;
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

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .node-label {
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
