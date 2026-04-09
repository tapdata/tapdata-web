<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { fetchPermissions } from '@tap/api/src/core/permissions'
import { fetchRoleMappings } from '@tap/api/src/core/role-mappings'
import { updatePermissionRoleMapping } from '@tap/api/src/core/users'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const emit = defineEmits<{
  saveBack: []
}>()

// ---- 模块图标映射（与 menu.ts 中 icon 对应） ----
const MODULE_ICONS: Record<string, string> = {
  'v2_data-console': 'process-platform',
  v2_datasource_menu: 'agent',
  v2_data_pipeline: 'migrate',
  v2_advanced_features: 'vip-one',
  'v2_data-server': 'apiServer_navbar',
  'v2_system-management': 'setting',
}

// ---- pageSort 配置 ----
const pageSort = [
  { name: 'v2_data-console', children: [{ name: 'v2_data-console' }] },
  {
    name: 'v2_datasource_menu',
    children: [
      {
        name: 'v2_datasource_menu',
        buttons: [
          {
            label: t('public_connection_button_create'),
            name: 'v2_datasource_creation',
          },
          {
            label: t('public_connection_button_copy'),
            name: 'v2_datasource_copy',
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_datasource_all_data' },
          { label: t('public_edit_all'), name: 'v2_datasource_all_data_Edit' },
          {
            label: t('public_delete_all'),
            name: 'v2_datasource_all_data_Delete',
          },
        ],
      },
    ],
  },
  {
    name: 'v2_data_pipeline',
    children: [
      {
        name: 'v2_data_replication',
        buttons: [
          {
            label: t('public_task_create'),
            name: 'v2_data_replication_creation',
            checked: false,
          },
          {
            label: t('public_task_copy'),
            name: 'v2_data_replication_copy',
            checked: false,
          },
          {
            label: t('public_task_import'),
            name: 'v2_data_replication_import',
            checked: false,
          },
          {
            label: t('public_task_export'),
            name: 'v2_data_replication_export',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_data_replication_all_data' },
          {
            label: t('public_edit_all'),
            name: 'v2_data_replication_all_data_Edit',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_data_replication_all_data_Delete',
          },
          {
            label: t('public_reset_all'),
            name: 'v2_data_replication_all_data_Reset',
          },
          {
            label: t('public_start_all'),
            name: 'v2_data_replication_all_data_Start',
          },
          {
            label: t('public_stop_all'),
            name: 'v2_data_replication_all_data_Stop',
          },
        ],
      },
      {
        name: 'v2_data_flow',
        buttons: [
          {
            label: t('public_task_create'),
            name: 'v2_data_flow_creation',
            checked: false,
          },
          {
            label: t('public_task_copy'),
            name: 'v2_data_flow_copy',
            checked: false,
          },
          {
            label: t('public_task_import'),
            name: 'v2_data_flow_import',
            checked: false,
          },
          {
            label: t('public_task_export'),
            name: 'v2_data_flow_export',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_data_flow_all_data' },
          { label: t('public_edit_all'), name: 'v2_data_flow_all_data_Edit' },
          {
            label: t('public_delete_all'),
            name: 'v2_data_flow_all_data_Delete',
          },
          { label: t('public_reset_all'), name: 'v2_data_flow_all_data_Reset' },
          { label: t('public_start_all'), name: 'v2_data_flow_all_data_Start' },
          { label: t('public_stop_all'), name: 'v2_data_flow_all_data_Stop' },
        ],
      },
      { name: 'v2_data_check' },
    ],
  },
  {
    name: 'v2_data-server',
    children: [
      { name: 'v2_api-application' },
      {
        name: 'v2_data-server-list',
        buttons: [
          {
            label: t('packages_business_chuangjianfuwu'),
            name: 'v2_data-server-list_creation',
            checked: false,
          },
          {
            label: t('packages_business_copy_server'),
            name: 'v2_data-server-list_copy',
            checked: false,
          },
          {
            label: t('packages_business_import_server'),
            name: 'v2_data-server-list_import',
            checked: false,
          },
          {
            label: t('packages_business_export_server'),
            name: 'v2_data-server-list_export',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_data-server-list_all_data' },
          {
            label: t('public_edit_all'),
            name: 'v2_data-server-list_all_data_Edit',
          },
          {
            label: t('public_publish_all'),
            name: 'v2_data-server-list_all_data_Publish',
          },
          {
            label: t('public_revoke_all'),
            name: 'v2_data-server-list_all_data_Revoke',
          },
          {
            label: t('public_export_all'),
            name: 'v2_data-server-list_all_data_Export',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_data-server-list_all_data_Delete',
          },
        ],
      },
      {
        name: 'v2_api-client',
        buttons: [
          {
            label: t('application_create'),
            name: 'v2_api-client_creation',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_api-client_all_data' },
          { label: t('public_edit_all'), name: 'v2_api-client_all_data_Edit' },
          {
            label: t('public_delete_all'),
            name: 'v2_api-client_all_data_Delete',
          },
        ],
      },
      {
        name: 'v2_api-servers',
        buttons: [
          {
            label: t('api_server_create_server'),
            name: 'v2_api-servers_creation',
            checked: false,
          },
          {
            label: t('api_server_download_API_Server_config'),
            name: 'v2_api-servers_download',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_api-servers_all_data' },
          { label: t('public_edit_all'), name: 'v2_api-servers_all_data_Edit' },
          {
            label: t('public_delete_all'),
            name: 'v2_api-servers_all_data_Delete',
          },
        ],
      },
      { name: 'v2_data_server_audit' },
      { name: 'v2_api_monitor' },
    ],
  },
  {
    name: 'v2_advanced_features',
    children: [
      { name: 'v2_log_collector' },
      { name: 'v2_function_management' },
      { name: 'v2_custom_node' },
      { name: 'v2_shared_cache' },
      { name: 'v2_project_management' },
      { name: 'v2_project_import_and_export' },
    ],
  },
  {
    name: 'v2_system-management',
    children: [
      { name: 'v2_cluster-management_menu' },
      { name: 'v2_external-storage_menu' },
      { name: 'v2_user_management_menu' },
      { name: 'v2_role_management' },
    ],
  },
]

// ---- 状态 ----
const loading = ref(false)
const saveloading = ref(false)
const permissLoading = ref(false)
const dataList = ref<any[]>([])
const permissionList = ref<any[]>([])
const selectRole = ref<string[]>([])
const roleusers = ref<string[]>([])
const adds = ref<any[]>([])
const deletes = ref<any[]>([])
const searchKeyword = ref('')
const expandedModules = reactive<Record<string, boolean>>({})

const roleName = computed(() => (route.query.name as string) || '')

// ---- 计算属性 ----

// 计算每个模块的权限统计
function getModuleStats(item: any) {
  let total = 0
  let enabled = 0
  item.children?.forEach((child: any) => {
    total++ // 页面权限
    if (child.checked) enabled++
    child.buttons?.forEach((btn: any) => {
      total++
      if (btn.checked) enabled++
    })
    child.filterData?.forEach((fd: any) => {
      total++
      if (fd.checked) enabled++
    })
  })
  return { total, enabled }
}

const filteredDataList = computed(() => {
  if (!searchKeyword.value) return dataList.value
  const kw = searchKeyword.value.toLowerCase()
  return dataList.value.filter((item: any) => {
    // 匹配模块名
    if (item.description?.toLowerCase().includes(kw)) return true
    // 匹配页面权限名称
    return item.children?.some((child: any) =>
      child.description?.toLowerCase().includes(kw),
    )
  })
})

function isExpanded(name: string) {
  return expandedModules[name] ?? false
}

function toggleExpand(name: string) {
  expandedModules[name] = !isExpanded(name)
}

function expandAll() {
  filteredDataList.value.forEach((item: any) => {
    expandedModules[item.name] = true
  })
}

function collapseAll() {
  Object.keys(expandedModules).forEach((key) => {
    expandedModules[key] = false
  })
}

// ---- API 逻辑 ----

function getMappingData(pageData: any[]) {
  loading.value = true
  const filter = { where: { roleId: route.query.id } }
  fetchRoleMappings(filter)
    .then((data: any) => {
      if (data?.length) {
        data.forEach((item: any) => {
          if (item.principalType === 'USER') {
            roleusers.value.push(item.principalId)
          }
          if (item.principalType === 'PERMISSION') {
            const selected = permissionList.value.filter(
              (v: any) => v.name === item.principalId,
            )
            if (selected?.length > 0) {
              selected[0].self_only = item.self_only
              selectRole.value.push(selected[0].name)
            }
          }
        })

        pageData?.forEach((item: any) => {
          item.children?.forEach((childItem: any) => {
            childItem.checked = selectRole.value.includes(childItem.name)
            childItem.checkOrigin = selectRole.value.includes(childItem.name)
            childItem.buttons?.forEach((el: any) => {
              el.checked = selectRole.value.includes(el.name)
              el.checkOrigin = selectRole.value.includes(el.name)
            })
            childItem.filterData?.forEach((el: any) => {
              el.checked = selectRole.value.includes(el.name)
              el.checkOrigin = selectRole.value.includes(el.name)
            })
          })
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function getPermission() {
  permissLoading.value = true
  const filter = { where: { version: 'v2' } }

  fetchPermissions(filter)
    .then((data: any) => {
      if (data?.length) {
        permissionList.value = data
        const pageMap: Record<string, any> = {}
        permissionList.value.forEach((item: any) => {
          pageMap[item.name] = item
        })
        const pageMenu = (items: any[]): any[] => {
          return items.map((item) => {
            const page = pageMap[item.name]
            const menu = Object.assign({}, item, page)
            if (menu.children) {
              menu.children = pageMenu(menu.children)
            }
            return menu
          })
        }
        dataList.value = pageMenu(pageSort)
        // 默认全部展开
        dataList.value.forEach((item: any) => {
          expandedModules[item.name] = true
        })
        getMappingData(dataList.value)
      }
    })
    .finally(() => {
      permissLoading.value = false
    })
}

// ---- 复选框逻辑 ----

function handleCheckChange(data: any, parentData: any, type = 'page') {
  updateData(data.checked, data)

  if (type === 'page' && data.checked) {
    data.buttons?.forEach((el: any) => {
      el.checked = true
      updateData(el.checked, el)
    })
  }

  if (type === 'page' && !data.checked) {
    if (
      !!parentData.children?.every((t: any) => !t.checked) &&
      !checkPrincipalId(deletes.value, parentData.name)?.length
    ) {
      parentData.checked = false
      updateData(false, parentData)
    }
    data.buttons?.forEach((el: any) => {
      el.checked = false
      updateData(el.checked, el)
    })
  }

  if (type === 'button' && data.checked) {
    parentData.checked = true
    updateData(parentData.checked, parentData)
  }
}

// ---- 数据权限全选 ----

function isDataAllChecked(second: any) {
  return (
    second.filterData?.length > 0 &&
    second.filterData.every((d: any) => d.checked)
  )
}

function isDataIndeterminate(second: any) {
  if (!second.filterData?.length) return false
  const checkedCount = second.filterData.filter((d: any) => d.checked).length
  return checkedCount > 0 && checkedCount < second.filterData.length
}

function toggleDataAll(checked: any, second: any) {
  second.filterData?.forEach((sItem: any) => {
    sItem.checked = checked
    updateData(checked, sItem)
  })
  if (checked) {
    second.checked = true
    updateData(true, second)
  }
}

function updateData(checked: boolean, data: any) {
  const roleId = route.query.id as string
  if (checked) {
    if (
      checked !== data.checkOrigin &&
      checkPrincipalId(adds.value, data.name)?.length === 0
    ) {
      adds.value.push({
        principalType: 'PERMISSION',
        principalId: data.name,
        roleId,
      })
    }
    const index = deletes.value.findIndex(
      (del: any) => del.principalId === data.name,
    )
    if (index !== -1) deletes.value.splice(index, 1)
  } else {
    if (
      checked !== data.checkOrigin &&
      checkPrincipalId(deletes.value, data.name)
    ) {
      deletes.value.push({
        principalType: 'PERMISSION',
        principalId: data.name,
        roleId,
      })
    }
    const index = adds.value.findIndex(
      (add: any) => add.principalId === data.name,
    )
    if (index !== -1) adds.value.splice(index, 1)
  }
}

function checkPrincipalId(data: any[], principalId: string) {
  return data.filter((item: any) => item.principalId === principalId) || []
}

// ---- 保存 / 返回 ----

function save() {
  const roleId = route.query.id as string
  saveloading.value = true
  const payload = { adds: adds.value, deletes: deletes.value }
  updatePermissionRoleMapping(roleId, payload)
    .then(() => {
      emit('saveBack')
      ElMessage.success(t('public_message_save_ok'))
      adds.value = []
      deletes.value = []
      router.push({ name: 'roleList' })
    })
    .finally(() => {
      saveloading.value = false
    })
}

function back() {
  if (!adds.value.length && !deletes.value.length) {
    router.push({ name: 'roles' })
    return
  }
  Modal.confirm(
    t('public_message_title_prompt'),
    t('daas_role_role_ninhaiweibaocun'),
  ).then((flag: any) => {
    flag && save()
  })
}

onMounted(() => {
  getPermission()
})
</script>

<template>
  <PageContainer mode="auto">
    <template #left-actions>
      <el-divider direction="vertical" />
      <span class="flex align-center gap-2 bg-color-main rounded-lg px-2 py-1">
        <span class="font-color-light">{{ t('role_currentRole') }}</span>
        <el-tag type="primary" class="border-0 bg-white shadow-sm">{{
          roleName
        }}</el-tag>
      </span>
    </template>
    <template #actions>
      <el-button type="primary" :loading="saveloading" @click="save">
        <template #icon><Check /></template>
        {{ t('public_button_save') }}
      </el-button>
    </template>

    <div v-loading="loading" class="role-permission-wrap">
      <!-- 工具栏：搜索 + 展开/收起 -->
      <div class="role-toolbar">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('public_input_placeholder_search')"
          clearable
          class="role-toolbar__search"
        >
          <template #prefix>
            <el-icon><i-lucide-search /></el-icon>
          </template>
        </el-input>
        <div class="role-toolbar__actions">
          <el-button text @click="expandAll">
            <template #icon><i-lucide-unfold-vertical /></template>
            {{ t('public_button_expand_all') }}
          </el-button>
          <el-button text @click="collapseAll">
            <template #icon><i-lucide-fold-vertical /></template>
            {{ t('public_button_collapse_all') }}
          </el-button>
        </div>
      </div>

      <!-- 模块卡片列表 -->
      <div v-if="filteredDataList.length" class="role-module-list">
        <div
          v-for="item in filteredDataList"
          :key="item.name"
          class="role-module-card"
        >
          <!-- 卡片头部 -->
          <div
            class="role-module-card__header"
            @click="toggleExpand(item.name)"
          >
            <span class="role-module-card__icon">
              <VIcon size="20">{{
                MODULE_ICONS[item.name] || 'setting'
              }}</VIcon>
            </span>
            <div class="role-module-card__info">
              <span class="role-module-card__name">{{ item.description }}</span>
              <span class="role-module-card__stats">
                {{ getModuleStats(item).enabled }} /
                {{ getModuleStats(item).total }}
                {{ t('public_permissions_enabled') }}
              </span>
            </div>
            <div class="role-module-card__progress">
              <div class="role-progress-bar">
                <div
                  class="role-progress-bar__fill"
                  :style="{
                    width: getModuleStats(item).total
                      ? `${
                          (getModuleStats(item).enabled /
                            getModuleStats(item).total) *
                          100
                        }%`
                      : '0%',
                  }"
                />
              </div>
            </div>
            <el-button
              text
              class="role-module-card__arrow"
              :class="{ 'is-expanded': isExpanded(item.name) }"
            >
              <template #icon>
                <!-- <el-icon
                  class="role-module-card__arrow"
                  :class="{ 'is-expanded': isExpanded(item.name) }"
                >
                  <i-lucide-chevron-down />
                </el-icon> -->
                <i-lucide-chevron-down />
              </template>
            </el-button>
          </div>

          <!-- 卡片内容 -->
          <div v-show="isExpanded(item.name)" class="role-module-card__body">
            <div
              v-for="(second, secondIndex) in item.children"
              :key="secondIndex"
              class="role-permission-row"
              :class="{ 'role-permission-row--bordered': secondIndex !== 0 }"
            >
              <!-- 页面权限 -->
              <div class="role-permission-col role-permission-col--page">
                <div class="role-permission-col__title">
                  {{ t('daas_role_role_yemianquanxian') }}
                </div>
                <div v-if="second.id" class="role-checkbox-item">
                  <el-checkbox
                    v-model="second.checked"
                    @change="handleCheckChange(second, item, 'page')"
                  >
                    {{ second.description }}
                  </el-checkbox>
                </div>
              </div>

              <!-- 功能权限 -->
              <div class="role-permission-col role-permission-col--func">
                <div class="role-permission-col__title">
                  {{ t('daas_role_role_gongnengquanxian') }}
                </div>
                <div
                  v-if="!second.buttons || !second.buttons.length"
                  class="role-checkbox-item"
                >
                  <el-checkbox :model-value="true" disabled>
                    {{ t('daas_role_role_quanbugongneng') }}
                  </el-checkbox>
                </div>
                <div v-else class="role-checkbox-group">
                  <div
                    v-for="(sItem, sIndex) in second.buttons"
                    :key="sIndex"
                    class="role-checkbox-item"
                  >
                    <el-checkbox
                      v-model="sItem.checked"
                      @change="handleCheckChange(sItem, second, 'button')"
                    >
                      {{ sItem.label }}
                    </el-checkbox>
                  </div>
                </div>
              </div>

              <!-- 数据权限 -->
              <div class="role-permission-col role-permission-col--data">
                <div class="role-permission-col__title">
                  {{ t('role_dataPermission') }}
                </div>
                <div v-if="!second.filterData" class="role-permission-empty">
                  <span class="font-color-light fs-7">--</span>
                </div>
                <div v-else class="role-checkbox-group">
                  <div class="role-checkbox-item role-checkbox-item--all">
                    <el-checkbox
                      :model-value="isDataAllChecked(second)"
                      :indeterminate="isDataIndeterminate(second)"
                      @change="(val: any) => toggleDataAll(val, second)"
                    >
                      {{ t('public_select_all') }}
                    </el-checkbox>
                  </div>
                  <div
                    v-for="(sItem, sIndex) in second.filterData"
                    :key="sIndex"
                    class="role-checkbox-item"
                  >
                    <el-checkbox
                      v-model="sItem.checked"
                      @change="handleCheckChange(sItem, second, 'data')"
                    >
                      {{ sItem.label }}
                    </el-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="role-empty">
        <el-empty :description="t('public_data_no_data') || '没有匹配的模块'" />
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.role-permission-wrap {
  // max-width: 1200px;
  margin: 0 auto;
}

// 提示信息栏
.role-tip-bar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #f0faf0;
  border: 1px solid #b7e4b7;
  border-radius: 8px;
  color: #2e7d32;
  font-size: 13px;
  line-height: 1.6;

  &__icon {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 16px;
  }
}

// 工具栏
.role-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  &__search {
    max-width: 300px;
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}

// 模块卡片列表
.role-module-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 模块卡片
.role-module-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #fafafa;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 8px;
    color: var(--el-color-primary, #4caf50);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-title, #1a1a1a);
  }

  &__stats {
    font-size: 12px;
    color: var(--text-light, #999);
  }

  &__progress {
    margin-left: auto;
    width: 100px;
    flex-shrink: 0;
  }

  &__arrow {
    // flex-shrink: 0;
    // font-size: 16px;
    // transition: transform 0.25s;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }

  &__body {
    border-top: 1px solid #f0f0f0;
    padding: 0 20px;
  }
}

// 进度条
.role-progress-bar {
  height: 6px;
  border-radius: 3px;
  background: #e8e8e8;
  overflow: hidden;

  &__fill {
    height: 100%;
    border-radius: 3px;
    background: var(--el-color-primary, #4caf50);
    transition: width 0.3s;
  }
}

// 权限行
.role-permission-row {
  display: flex;
  padding: 16px 0;

  &--bordered {
    border-top: 1px solid #f0f0f0;
  }
}

// 权限列
.role-permission-col {
  &--page {
    flex: 0 0 calc(2 / 12 * 100%);
    min-width: 0;
  }

  &--func {
    flex: 0 0 calc(5 / 12 * 100%);
    min-width: 0;
  }

  &--data {
    flex: 0 0 calc(5 / 12 * 100%);
    min-width: 0;
  }

  &__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-light, #999);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
}

// 复选框
.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.role-checkbox-item {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }

  :deep(.el-checkbox) {
    --el-checkbox-height: 20px;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-radius: 4px;
  }

  :deep(.el-checkbox__inner) {
    border-radius: 4px;
  }

  &--all {
    font-weight: 500;
    margin-bottom: 2px;
  }
}

.role-permission-empty {
  padding: 3px 6px;
  font-style: italic;
}

// 空状态
.role-empty {
  padding: 60px 0;
  text-align: center;
}
</style>
