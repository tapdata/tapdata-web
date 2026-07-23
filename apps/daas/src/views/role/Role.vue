<script setup lang="ts">
import { fetchPermissions } from '@tap/api/src/core/permissions'
import { fetchRoleMappings } from '@tap/api/src/core/role-mappings'
import { fetchRoles } from '@tap/api/src/core/roles'
import { updatePermissionRoleMapping } from '@tap/api/src/core/users'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
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

// ---- 模块图标映射 ----
const MODULE_ICONS: Record<string, any> = {
  'v2_data-console': IconLucideLayoutDashboard,
  v2_datasource_menu: IconLucideDatabase,
  v2_data_pipeline: IconLucideGitBranch,
  v2_advanced_features: IconLucideBoxes,
  'v2_data-server': IconLucideServerCog,
  'v2_system-management': IconLucideSettings,
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
      {
        name: 'v2_data_check',
        buttons: [
          {
            label: t('public_task_create'),
            name: 'v2_data_check_creation',
            checked: false,
          },
          {
            label: t('public_task_import'),
            name: 'v2_data_check_import',
            checked: false,
          },
          {
            label: t('public_task_export'),
            name: 'v2_data_check_export',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_data_check_all_data' },
          { label: t('public_edit_all'), name: 'v2_data_check_all_data_Edit' },
          {
            label: t('public_delete_all'),
            name: 'v2_data_check_all_data_Delete',
          },
          {
            label: t('public_start_all'),
            name: 'v2_data_check_all_data_Start',
          },
          { label: t('public_stop_all'), name: 'v2_data_check_all_data_Stop' },
        ],
      },
    ],
  },
  {
    name: 'v2_data-server',
    children: [
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
      {
        name: 'v2_log_collector',
        filterData: [
          { label: t('public_view_all'), name: 'v2_log_collector_all_data' },
          {
            label: t('public_edit_all'),
            name: 'v2_log_collector_all_data_Edit',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_log_collector_all_data_Delete',
          },
          {
            label: t('public_reset_all'),
            name: 'v2_log_collector_all_data_Reset',
          },
          {
            label: t('public_start_all'),
            name: 'v2_log_collector_all_data_Start',
          },
          {
            label: t('public_stop_all'),
            name: 'v2_log_collector_all_data_Stop',
          },
        ],
      },
      { name: 'v2_function_management' },
      { name: 'v2_custom_node' },
      {
        name: 'v2_shared_cache',
        buttons: [
          {
            label: t('public_task_create'),
            name: 'v2_shared_cache_creation',
            checked: false,
          },
          {
            label: t('public_task_import'),
            name: 'v2_shared_cache_import',
            checked: false,
          },
          {
            label: t('public_task_export'),
            name: 'v2_shared_cache_export',
            checked: false,
          },
        ],
        filterData: [
          { label: t('public_view_all'), name: 'v2_shared_cache_all_data' },
          {
            label: t('public_edit_all'),
            name: 'v2_shared_cache_all_data_Edit',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_shared_cache_all_data_Delete',
          },
          {
            label: t('public_reset_all'),
            name: 'v2_shared_cache_all_data_Reset',
          },
          {
            label: t('public_start_all'),
            name: 'v2_shared_cache_all_data_Start',
          },
          {
            label: t('public_stop_all'),
            name: 'v2_shared_cache_all_data_Stop',
          },
        ],
      },
      {
        name: 'v2_conn_heartbeat',
        filterData: [
          { label: t('public_view_all'), name: 'v2_conn_heartbeat_all_data' },
          {
            label: t('public_delete_all'),
            name: 'v2_conn_heartbeat_all_data_Delete',
          },
          {
            label: t('public_reset_all'),
            name: 'v2_conn_heartbeat_all_data_Reset',
          },
          {
            label: t('public_start_all'),
            name: 'v2_conn_heartbeat_all_data_Start',
          },
          {
            label: t('public_stop_all'),
            name: 'v2_conn_heartbeat_all_data_Stop',
          },
        ],
      },
      {
        name: 'v2_project_management',
        buttons: [
          {
            label: t('data_import_export_add_group'),
            name: 'v2_project_management_creation',
            checked: false,
          },
          {
            label: t('data_import_export_git_config'),
            name: 'v2_project_management_git_config',
            checked: false,
          },
        ],
        filterData: [
          {
            label: t('public_view_all'),
            name: 'v2_project_management_all_data',
          },
          {
            label: t('public_edit_all'),
            name: 'v2_project_management_all_data_Edit',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_project_management_all_data_Delete',
          },
        ],
      },
      {
        name: 'v2_project_import_and_export',
        buttons: [
          {
            label: t('data_import_export_import'),
            name: 'v2_project_import_and_export_import',
            checked: false,
          },
          {
            label: t('data_import_export_export'),
            name: 'v2_project_import_and_export_export',
            checked: false,
          },
        ],
        filterData: [
          {
            label: t('public_view_all'),
            name: 'v2_project_import_and_export_all_data',
          },
        ],
      },
      {
        name: 'v2_task_rebalance',
        buttons: [
          {
            label: t('daas_task_rebalance_create'),
            name: 'v2_task_rebalance_Edit',
            checked: false,
          },
        ],
      },
    ],
  },
  {
    name: 'v2_system-management',
    children: [
      { name: 'v2_cluster-management_menu' },
      { name: 'v2_external-storage_menu' },
      {
        name: 'v2_user_management_menu',
        buttons: [
          {
            label: t('public_button_create'),
            name: 'v2_user_management_menu_creation',
            checked: false,
          },
        ],
        filterData: [
          {
            label: t('public_view_all'),
            name: 'v2_user_management_menu_all_data',
          },
          {
            label: t('public_edit_all'),
            name: 'v2_user_management_menu_all_data_Edit',
          },
          {
            label: t('public_delete_all'),
            name: 'v2_user_management_menu_all_data_Delete',
          },
        ],
      },
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
const expandedPages = reactive<Record<string, boolean>>({})
const roleDetail = ref<any>({})

const roleName = computed(
  () => roleDetail.value.name || (route.query.name as string) || '',
)
const roleDescription = computed(
  () => roleDetail.value.description || t('role_permission_overview_subtitle'),
)
const isDefaultRole = computed(
  () => roleDetail.value.register_user_default === true,
)

// ---- 计算属性 ----

function getCheckedStats(items: any[] = []) {
  return {
    total: items.length,
    enabled: items.filter((item: any) => item.checked).length,
  }
}

function getModuleIcon(name: string) {
  return MODULE_ICONS[name] || IconLucidePanelTop
}

function getPageAccessLabel(page: any) {
  return `${page.description} ${t('role_permission_page_access')}`
}

function getPageStats(page: any) {
  return {
    functions: getCheckedStats(page.buttons),
    data: getCheckedStats(page.filterData),
  }
}

function getModuleStats(item: any) {
  return getCheckedStats(item.children)
}

const overviewStats = computed(() => {
  const modules = dataList.value
  const pages = modules.flatMap((item: any) => item.children || [])
  const permissions = pages.flatMap((page: any) => [
    ...(page.buttons || []),
    ...(page.filterData || []),
  ])
  const enabledPermissions = pages.reduce((total: number, page: any) => {
    if (!page.checked) return total
    return (
      total +
      [...(page.buttons || []), ...(page.filterData || [])].filter(
        (permission: any) => permission.checked,
      ).length
    )
  }, 0)

  return {
    pages: getCheckedStats(pages),
    permissions: {
      enabled: enabledPermissions,
      total: permissions.length,
    },
    modules: modules.filter((item: any) =>
      item.children?.some((page: any) => page.checked),
    ).length,
    coverage: permissions.length
      ? Math.round((enabledPermissions / permissions.length) * 100)
      : 0,
  }
})

const overviewProgressStyle = computed(() => ({
  width: `${overviewStats.value.coverage}%`,
}))

const filteredDataList = computed(() => {
  if (!searchKeyword.value) return dataList.value
  const keyword = searchKeyword.value.trim().toLowerCase()

  return dataList.value
    .map((item: any) => {
      const moduleMatched = item.description?.toLowerCase().includes(keyword)
      const children = moduleMatched
        ? item.children
        : item.children?.filter((child: any) =>
            child.description?.toLowerCase().includes(keyword),
          )
      return { ...item, children }
    })
    .filter((item: any) => item.children?.length)
})

function isExpanded(name: string) {
  return expandedPages[name] ?? false
}

function toggleExpand(name: string) {
  expandedPages[name] = !isExpanded(name)
}

function expandAll() {
  filteredDataList.value.forEach((item: any) => {
    item.children?.forEach((page: any) => {
      expandedPages[page.name] = true
    })
  })
}

function collapseAll() {
  Object.keys(expandedPages).forEach((key) => {
    expandedPages[key] = false
  })
}

// ---- API 逻辑 ----

function getMappingData(pageData: any[]) {
  loading.value = true
  const filter = { where: { roleId: route.query.id } }
  fetchRoleMappings(filter)
    .then((data: any) => {
      selectRole.value = []
      roleusers.value = []
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
      }

      pageData?.forEach((item: any) => {
        item.children?.forEach((childItem: any) => {
          childItem.checked = selectRole.value.includes(childItem.name)
          childItem.checkOrigin = childItem.checked
          childItem.buttons?.forEach((permission: any) => {
            permission.checked = selectRole.value.includes(permission.name)
            permission.checkOrigin = permission.checked
          })
          childItem.filterData?.forEach((permission: any) => {
            permission.checked = selectRole.value.includes(permission.name)
            permission.checkOrigin = permission.checked
          })
        })
      })
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
        dataList.value.forEach((item: any) => {
          item.children?.forEach((page: any) => {
            expandedPages[page.name] = true
          })
        })
        getMappingData(dataList.value)
      }
    })
    .finally(() => {
      permissLoading.value = false
    })
}

function getRoleDetail() {
  const roleId = route.query.id as string
  if (!roleId) return

  fetchRoles({ where: { id: roleId }, limit: 1 }).then((data: any) => {
    roleDetail.value = data?.items?.[0] || data?.[0] || {}
  })
}

// ---- 权限联动 ----

function handlePageAccessChange(page: any, module: any) {
  updateData(page.checked, page)

  if (
    !page.checked &&
    module.children?.every((item: any) => !item.checked) &&
    !checkPrincipalId(deletes.value, module.name)?.length
  ) {
    module.checked = false
    updateData(false, module)
  }
}

function ensurePageAccess(page: any) {
  if (!page.checked) {
    page.checked = true
    updateData(true, page)
  }
}

function handlePermissionChange(permission: any, page: any) {
  updateData(permission.checked, permission)
  if (permission.checked) ensurePageAccess(page)
}

function isPermissionAllChecked(items: any[] = []) {
  return items.length > 0 && items.every((item: any) => item.checked)
}

function togglePermissionAll(checked: any, page: any, key: string) {
  page[key]?.forEach((permission: any) => {
    permission.checked = checked
    updateData(checked, permission)
  })
  if (checked) ensurePageAccess(page)
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

onMounted(() => {
  getRoleDetail()
  getPermission()
})
</script>

<template>
  <PageContainer mode="auto">
    <template #actions>
      <el-button type="primary" :loading="saveloading" @click="save">
        <template #icon><i-lucide-save /></template>
        {{ t('public_button_save') }}
      </el-button>
    </template>

    <div v-loading="loading || permissLoading" class="role-permission-wrap">
      <section class="role-overview" aria-labelledby="role-overview-title">
        <div class="role-overview__content">
          <div class="role-overview__identity">
            <span class="role-overview__icon">
              <el-icon :size="26"><i-lucide-shield-check /></el-icon>
            </span>
            <div class="role-overview__copy">
              <div class="role-overview__title-row">
                <h2 id="role-overview-title" class="role-overview__title">
                  {{ roleName }}
                </h2>
                <span v-if="isDefaultRole" class="role-overview__tag">
                  {{ t('role_permission_default_role') }}
                </span>
              </div>
              <p class="role-overview__description">{{ roleDescription }}</p>
            </div>
          </div>

          <dl class="role-overview__metrics">
            <div class="role-overview__metric">
              <dt>{{ t('role_permission_accessible_pages') }}</dt>
              <dd>
                {{ overviewStats.pages.enabled }}/{{
                  overviewStats.pages.total
                }}
              </dd>
            </div>
            <div class="role-overview__metric">
              <dt>{{ t('role_permission_enabled_permissions') }}</dt>
              <dd>
                {{ overviewStats.permissions.enabled }}/{{
                  overviewStats.permissions.total
                }}
              </dd>
            </div>
            <div class="role-overview__metric">
              <dt>{{ t('role_permission_enabled_modules') }}</dt>
              <dd>{{ overviewStats.modules }}</dd>
            </div>
          </dl>
        </div>
        <div
          class="role-overview__progress"
          role="progressbar"
          :aria-label="t('role_permission_coverage')"
          :aria-valuenow="overviewStats.coverage"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span :style="overviewProgressStyle" />
        </div>
      </section>

      <div class="role-toolbar">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('role_permission_search_placeholder')"
          clearable
          class="role-toolbar__search"
        >
          <template #prefix>
            <el-icon><i-lucide-search /></el-icon>
          </template>
        </el-input>
        <div class="role-toolbar__actions">
          <el-button @click="expandAll">
            <template #icon><i-lucide-unfold-vertical /></template>
            {{ t('public_button_expand_all') }}
          </el-button>
          <el-button @click="collapseAll">
            <template #icon><i-lucide-fold-vertical /></template>
            {{ t('public_button_collapse_all') }}
          </el-button>
        </div>
      </div>

      <div v-if="filteredDataList.length" class="role-module-list">
        <section
          v-for="item in filteredDataList"
          :key="item.name"
          class="role-module-group"
        >
          <header class="role-module-group__header">
            <span class="role-module-group__icon">
              <el-icon :size="16">
                <component :is="getModuleIcon(item.name)" />
              </el-icon>
            </span>
            <h3 class="role-module-group__title">{{ item.description }}</h3>
            <span class="role-module-group__count">
              {{ getModuleStats(item).enabled }}/{{
                getModuleStats(item).total
              }}
            </span>
            <span class="role-module-group__line" aria-hidden="true" />
          </header>

          <div class="role-module-group__pages">
            <article
              v-for="second in item.children"
              :key="second.name"
              class="role-page-card"
              :class="{
                'is-expanded': isExpanded(second.name),
                'is-inaccessible': !second.checked,
              }"
            >
              <header class="role-page-card__header">
                <div class="role-page-card__access">
                  <el-switch
                    v-model="second.checked"
                    :aria-label="getPageAccessLabel(second)"
                    @change="handlePageAccessChange(second, item)"
                  />
                </div>

                <button
                  type="button"
                  class="role-page-card__summary"
                  :aria-expanded="isExpanded(second.name)"
                  @click="toggleExpand(second.name)"
                >
                  <span class="role-page-card__identity">
                    <span class="role-page-card__title-row">
                      <span class="role-page-card__title">
                        {{ second.description }}
                      </span>
                      <span
                        v-if="!second.checked"
                        class="role-page-card__status"
                      >
                        {{ t('role_permission_inaccessible') }}
                      </span>
                    </span>
                    <span class="role-page-card__description">
                      {{ t('role_permission_page_subtitle') }}
                    </span>
                  </span>

                  <span class="role-page-card__summary-stats">
                    <span class="role-page-card__summary-stat">
                      {{ t('daas_role_role_gongnengquanxian') }}
                      <span
                        v-if="getPageStats(second).functions.total"
                        class="role-page-card__summary-count"
                      >
                        {{ getPageStats(second).functions.enabled }}/{{
                          getPageStats(second).functions.total
                        }}
                      </span>
                      <span v-else class="role-page-card__summary-empty"
                        >&mdash;</span
                      >
                    </span>
                    <span class="role-page-card__summary-stat">
                      {{ t('role_dataPermission') }}
                      <span
                        v-if="getPageStats(second).data.total"
                        class="role-page-card__summary-count"
                      >
                        {{ getPageStats(second).data.enabled }}/{{
                          getPageStats(second).data.total
                        }}
                      </span>
                      <span v-else class="role-page-card__summary-empty"
                        >&mdash;</span
                      >
                    </span>
                  </span>

                  <span
                    class="role-page-card__chevron"
                    :class="{ 'is-expanded': isExpanded(second.name) }"
                  >
                    <el-icon :size="18"><i-lucide-chevron-down /></el-icon>
                  </span>
                </button>
              </header>

              <div
                v-show="isExpanded(second.name)"
                class="role-page-card__body"
                :class="{ 'is-inactive': !second.checked }"
              >
                <section
                  v-if="second.buttons?.length"
                  class="role-permission-section"
                >
                  <header class="role-permission-section__header">
                    <div class="role-permission-section__heading">
                      <span class="role-permission-section__icon is-function">
                        <el-icon :size="16"><i-lucide-zap /></el-icon>
                      </span>
                      <div>
                        <div class="role-permission-section__title-row">
                          <h4>{{ t('daas_role_role_gongnengquanxian') }}</h4>
                          <span class="role-permission-section__count">
                            {{ getPageStats(second).functions.enabled }}/{{
                              getPageStats(second).functions.total
                            }}
                          </span>
                        </div>
                        <p>{{ t('role_permission_function_description') }}</p>
                      </div>
                    </div>
                    <el-button
                      text
                      type="primary"
                      @click="
                        togglePermissionAll(
                          !isPermissionAllChecked(second.buttons),
                          second,
                          'buttons',
                        )
                      "
                    >
                      {{
                        isPermissionAllChecked(second.buttons)
                          ? t('role_permission_deselect_all')
                          : t('public_select_all')
                      }}
                    </el-button>
                  </header>

                  <div class="role-permission-options">
                    <el-checkbox
                      v-for="permission in second.buttons"
                      :key="permission.name"
                      v-model="permission.checked"
                      class="role-permission-option"
                      :class="{ 'is-selected': permission.checked }"
                      @change="handlePermissionChange(permission, second)"
                    >
                      {{ permission.label }}
                    </el-checkbox>
                  </div>
                </section>

                <section
                  v-if="second.filterData?.length"
                  class="role-permission-section"
                >
                  <header class="role-permission-section__header">
                    <div class="role-permission-section__heading">
                      <span class="role-permission-section__icon is-data">
                        <el-icon :size="16"><i-lucide-database /></el-icon>
                      </span>
                      <div>
                        <div class="role-permission-section__title-row">
                          <h4>{{ t('role_dataPermission') }}</h4>
                          <span class="role-permission-section__count">
                            {{ getPageStats(second).data.enabled }}/{{
                              getPageStats(second).data.total
                            }}
                          </span>
                        </div>
                        <p>{{ t('role_permission_data_description') }}</p>
                      </div>
                    </div>
                    <el-button
                      text
                      type="primary"
                      @click="
                        togglePermissionAll(
                          !isPermissionAllChecked(second.filterData),
                          second,
                          'filterData',
                        )
                      "
                    >
                      {{
                        isPermissionAllChecked(second.filterData)
                          ? t('role_permission_deselect_all')
                          : t('public_select_all')
                      }}
                    </el-button>
                  </header>

                  <div class="role-permission-options">
                    <el-checkbox
                      v-for="permission in second.filterData"
                      :key="permission.name"
                      v-model="permission.checked"
                      class="role-permission-option"
                      :class="{ 'is-selected': permission.checked }"
                      @change="handlePermissionChange(permission, second)"
                    >
                      {{ permission.label }}
                    </el-checkbox>
                  </div>
                </section>

                <div
                  v-if="!second.buttons?.length && !second.filterData?.length"
                  class="role-page-card__empty"
                >
                  <el-icon :size="18"><i-lucide-circle-check /></el-icon>
                  <span>{{ t('role_permission_no_extra_config') }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="role-empty">
        <el-empty
          :description="
            searchKeyword
              ? t('daas_role_role_no_matching_module')
              : t('public_data_no_data')
          "
        />
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.role-permission-wrap {
  --role-border: #dfe3eb;
  --role-border-subtle: #e9ecf2;
  --role-canvas: #f7f8fb;
  --role-text: #20222a;
  --role-text-secondary: #6f7482;
  --role-text-muted: #9da2ad;

  margin: 0 auto;
  padding-bottom: 32px;
  color: var(--role-text);
}

.role-overview {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--role-border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(31, 35, 48, 0.1);

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 24px 28px 26px;
  }

  &__identity {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 16px;
  }

  &__icon {
    display: inline-flex;
    flex: 0 0 52px;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }

  &__copy {
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  &__title {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--role-text);
    font-size: 20px;
    font-weight: 650;
    line-height: 1.35;
  }

  &__tag {
    flex-shrink: 0;
    padding: 3px 8px;
    color: var(--role-text-secondary);
    background: #f1f2f5;
    border: 1px solid #e1e4ea;
    border-radius: 999px;
    font-size: 12px;
    line-height: 18px;
  }

  &__description {
    margin: 4px 0 0;
    overflow-wrap: anywhere;
    color: var(--role-text-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  &__metrics {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(3, minmax(112px, auto));
    margin: 0;
  }

  &__metric {
    min-width: 112px;
    padding: 0 24px;
    border-left: 1px solid var(--role-border-subtle);

    dt {
      color: var(--role-text-secondary);
      font-size: 12px;
      line-height: 18px;
    }

    dd {
      margin: 4px 0 0;
      color: var(--role-text);
      font-size: 22px;
      font-variant-numeric: tabular-nums;
      font-weight: 650;
      line-height: 28px;
    }
  }

  &__progress {
    height: 4px;
    background: #eceef3;

    span {
      display: block;
      height: 100%;
      background: var(--el-color-primary);
      transition: width 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }
  }
}

.role-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0 28px;

  &__search {
    flex: 1;
    min-width: 0;

    :deep(.el-input__wrapper) {
      min-height: 42px;
      border-radius: 8px;
    }
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;

    :deep(.el-button) {
      min-height: 42px;
      margin: 0;
      border-radius: 8px;
    }
  }
}

.role-module-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.role-module-group {
  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 34px;
    margin-bottom: 10px;
  }

  &__icon {
    display: inline-flex;
    flex: 0 0 32px;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }

  &__title {
    margin: 0;
    color: var(--role-text-secondary);
    font-size: 13px;
    font-weight: 650;
    line-height: 20px;
    text-transform: uppercase;
  }

  &__count {
    flex-shrink: 0;
    padding: 2px 8px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 20px;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: var(--role-border-subtle);
  }

  &__pages {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.role-page-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--role-border);
  border-radius: 8px;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;

  &.is-expanded {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 3px rgba(31, 35, 48, 0.12);
  }

  &.is-inaccessible {
    .role-page-card__title,
    .role-page-card__description {
      color: var(--role-text-muted);
    }
  }

  &__header {
    display: flex;
    align-items: stretch;
    min-height: 80px;
  }

  &__access {
    display: flex;
    flex: 0 0 72px;
    align-items: center;
    justify-content: center;
    padding-left: 8px;
  }

  &__summary {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(220px, 1fr) auto 40px;
    align-items: center;
    gap: 20px;
    min-width: 0;
    padding: 14px 18px 14px 4px;
    color: inherit;
    text-align: left;
    background: transparent;
    border: 0;
    cursor: pointer;

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--el-color-primary-light-5) inset;
      outline: 0;
    }
  }

  &__identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    overflow-wrap: anywhere;
    color: var(--role-text);
    font-size: 15px;
    font-weight: 650;
    line-height: 22px;
  }

  &__status {
    flex-shrink: 0;
    padding: 2px 7px;
    color: var(--role-text-muted);
    background: #f1f2f5;
    border-radius: 999px;
    font-size: 11px;
    line-height: 18px;
  }

  &__description {
    overflow-wrap: anywhere;
    color: var(--role-text-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  &__summary-stats {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 22px;
    color: var(--role-text-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  &__summary-stat {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  &__summary-count {
    padding: 2px 7px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
  }

  &__summary-empty {
    min-width: 20px;
    color: #c3c7cf;
    font-size: 14px;
    text-align: center;
  }

  &__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--role-text-secondary);
    background: var(--role-canvas);
    border-radius: 8px;
    transition:
      color 180ms ease,
      transform 180ms ease;

    &.is-expanded {
      color: var(--el-color-primary);
      transform: rotate(180deg);
    }
  }

  &__body {
    padding: 22px 24px 24px;
    background: var(--role-canvas);
    border-top: 1px solid var(--role-border-subtle);

    &.is-inactive {
      .role-permission-section__heading,
      .role-page-card__empty {
        opacity: 0.55;
      }

      .role-permission-option {
        --el-checkbox-checked-bg-color: #aeb3bd;
        --el-checkbox-checked-input-border-color: #aeb3bd;

        background: #f2f3f5;
        border-color: #e2e5ea;

        &.is-selected {
          background: #eceef2;
          border-color: #d9dce3;
        }

        :deep(.el-checkbox__label) {
          color: var(--role-text-muted);
        }
      }

      :deep(.el-button:not(.is-disabled)) {
        color: var(--role-text-muted);
      }
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: var(--role-text-secondary);
    font-size: 13px;
  }
}

.role-permission-section {
  & + & {
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid var(--role-border-subtle);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 14px;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 10px;
  }

  &__icon {
    display: inline-flex;
    flex: 0 0 32px;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;

    &.is-function {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.is-data {
      color: #18775b;
      background: #eaf6f1;
    }
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 9px;

    h4 {
      margin: 0;
      color: var(--role-text);
      font-size: 14px;
      font-weight: 650;
      line-height: 20px;
    }
  }

  &__count {
    padding: 1px 7px;
    color: var(--role-text-secondary);
    background: #eceef3;
    border-radius: 999px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    line-height: 18px;
  }

  p {
    margin: 2px 0 0;
    color: var(--role-text-muted);
    font-size: 12px;
    line-height: 18px;
  }
}

.role-permission-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.role-permission-option {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 0 14px;
  margin: 0;
  background: #fff;
  border: 1px solid var(--role-border);
  border-radius: 6px;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;

  &.is-selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }

  :deep(.el-checkbox__label) {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--role-text-secondary);
    font-size: 13px;
    line-height: 20px;
    white-space: normal;
  }

  &.is-selected :deep(.el-checkbox__label) {
    color: var(--role-text);
  }
}

.role-empty {
  padding: 60px 0;
  text-align: center;
}

@media (hover: hover) {
  .role-page-card__summary:hover {
    background: #fafbfc;
  }

  .role-permission-option:not(.is-disabled):hover {
    border-color: var(--el-color-primary-light-5);
  }
}

@media (max-width: 960px) {
  .role-overview {
    &__content {
      align-items: flex-start;
      flex-direction: column;
      gap: 22px;
    }

    &__metrics {
      width: 100%;
    }

    &__metric {
      padding: 0 20px;

      &:first-child {
        padding-left: 0;
        border-left: 0;
      }
    }
  }

  .role-page-card__summary {
    grid-template-columns: minmax(180px, 1fr) 40px;
    gap: 12px;
  }

  .role-page-card__summary-stats {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
  }

  .role-page-card__chevron {
    grid-column: 2;
    grid-row: 1;
  }

  .role-permission-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .role-overview {
    &__content {
      padding: 18px;
    }

    &__identity {
      align-items: flex-start;
    }

    &__icon {
      flex-basis: 44px;
      width: 44px;
      height: 44px;
    }

    &__title-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 5px;
    }

    &__title {
      font-size: 18px;
    }

    &__metrics {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    &__metric {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 0;
      padding: 12px 0 0;
      border-top: 1px solid var(--role-border-subtle);
      border-left: 0;

      &:first-child {
        padding-top: 0;
        border-top: 0;
      }

      dd {
        margin: 0;
        font-size: 19px;
      }
    }
  }

  .role-toolbar {
    align-items: stretch;
    flex-direction: column;

    &__actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      :deep(.el-button) {
        width: 100%;
      }
    }
  }

  .role-module-group__title {
    overflow-wrap: anywhere;
  }

  .role-page-card {
    &__header {
      align-items: flex-start;
    }

    &__access {
      flex-basis: 56px;
      min-height: 68px;
      padding-left: 6px;
    }

    &__summary {
      grid-template-columns: minmax(0, 1fr) 40px;
      padding: 14px 12px 14px 0;
    }

    &__summary-stats {
      flex-wrap: wrap;
      gap: 8px 16px;
    }

    &__body {
      padding: 18px 16px 20px;
    }
  }

  .role-permission-section__header {
    gap: 8px;
  }

  .role-permission-options {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .role-overview__progress span,
  .role-page-card,
  .role-page-card__chevron,
  .role-permission-option {
    transition: none;
  }
}
</style>
