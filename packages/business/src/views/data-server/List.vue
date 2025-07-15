<script setup lang="ts">
import {
  apiServerApi,
  batchUpdateApiModules,
  batchUpdateApiModuleTags,
  databaseTypesApi,
  deleteApiModule,
  exportApiDocumentation,
  exportApiModules,
  fetchApiModules,
  fetchApps,
  metadataInstancesApi,
  updateApiModule,
  useRequest,
} from '@tap/api'
import FilterBar from '@tap/component/src/filter-bar/Main.vue'
import {
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@tap/component/src/icon'
import { useI18n } from '@tap/i18n'

import { ElInput, ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp } from 'lodash-es'
import {
  computed,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import Upload from '../../components/UploadDialog.vue'
import Delete from '../api-application/Delete.vue'
import Editor from '../api-application/Editor.vue'
import DownloadSdkDialog from './DownloadSdkDialog.vue'
import Drawer from './Drawer.vue'

interface Props {
  showFilter?: boolean
  columns?: any[]
  params?: Record<string, any>
  inAppList?: boolean
}

interface SearchParams {
  type: string
  status: string
  keyword: string
  appId: string
}

interface StatusOption {
  label: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  showFilter: true,
  columns: () => [],
  params: () => ({}),
  inAppList: false,
})

const emit = defineEmits<{
  drawerVisible: [visible: boolean]
}>()

const route = useRoute()
const { t } = useI18n()

// Refs
const table = ref<InstanceType<typeof TablePage>>()
const drawer = ref<InstanceType<typeof Drawer>>()
const upload = ref<InstanceType<typeof Upload>>()
const searchInput = ref<InstanceType<typeof ElInput>>()
const showAppList = ref(true)
const dragState = shallowRef<any>({})
const appEditor = ref<InstanceType<typeof Editor>>()
const appDelete = ref<InstanceType<typeof Delete>>()
const currentApp = ref<any>()

// Reactive data
const filterItems = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const order = ref('createAt DESC')
const apiServerHost = ref('')
const intervalId = ref<number | null>(null)

const searchParams = ref<SearchParams>({
  type: '',
  status: '',
  keyword: '',
  appId: '',
})

const statusOptions: StatusOption[] = [
  {
    label: t('public_select_option_all'),
    value: '',
  },
  {
    label: t('public_status_published'),
    value: 'active',
  },
  {
    label: t('public_status_unpublished'),
    value: 'pending',
  },
  {
    label: t('public_status_to_be_generated'),
    value: 'generating',
  },
]

const { data: appList, refresh: refreshAppList } = useRequest(async () => {
  const { items } = await fetchApps({
    where: {
      item_type: 'app',
    },
    order: 'createTime DESC',
    limit: 1000,
  })
  return items
})

// Computed properties

const filterAppList = computed(() => {
  const search = filterText.value.toLowerCase()

  if (!search) {
    return appList.value || []
  }

  return (
    appList.value?.filter((t) => t.value.toLowerCase().includes(search)) || []
  )
})

// 选中的已发布数据
const multipleSelectionActive = computed(() => {
  return multipleSelection.value.filter((t) => t.status === 'active')
})

const pendingSelection = computed(() => {
  return multipleSelection.value.filter((t) => t.status === 'pending')
})

// Watchers
watch(
  () => route.query,
  () => {
    table.value?.fetch(1)
  },
)

// Lifecycle hooks
onBeforeMount(() => {
  Object.assign(searchParams.value, route.query)
  getFilterItems()
  getApiServerHost()
})

onBeforeUnmount(() => {
  intervalId.value && clearTimeout(intervalId.value)
})

// Methods
const getFilterItems = () => {
  filterItems.value = [
    // {
    //   label: t('packages_business_application_list_yingyongmingcheng'),
    //   key: 'appId',
    //   type: 'select-inner',
    //   items: async () => {
    //     const res = await fetchApps({
    //       where: {
    //         item_type: 'app',
    //       },
    //       order: 'createTime DESC',
    //       limit: 1000,
    //     })
    //     const data =
    //       (res as any).items?.map((t: any) => {
    //         return {
    //           label: t.value,
    //           value: t.id,
    //         }
    //       }) || []
    //     //默认全部
    //     const all = {
    //       label: t('public_select_option_all'),
    //       value: '',
    //     }
    //     data.unshift(all)
    //     return data
    //   },
    // },
    {
      label: t('public_connection_form_database_type'),
      key: 'type', //对象分类
      type: 'select-inner',
      items: async () => {
        let data = await databaseTypesApi.get()
        data = data || []
        let databaseTypes: any[] = []
        databaseTypes =
          (data as any)?.filter?.((it: any) =>
            ['mysql', 'sqlserver', 'oracle', 'mongodb', 'pg', 'tidb'].includes(
              it.pdkId,
            ),
          ) || []
        const databaseTypeOptions = databaseTypes.sort((t1: any, t2: any) =>
          t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1,
        )
        //默认全部
        const all = {
          name: t('public_select_option_all'),
          type: '',
        }
        databaseTypeOptions.unshift(all)
        return databaseTypeOptions.map((item: any) => {
          return {
            label: item.name,
            value: item.type,
          }
        })
      },
    },
    {
      label: t('public_status'),
      key: 'status', //对象类型
      type: 'select-inner',
      items: statusOptions,
    },
    {
      placeholder: t('public_button_search'),
      key: 'keyword', //输入搜索名称
      type: 'input',
    },
  ]
}

const getData = ({
  page = {},
}: {
  page?: { current?: number; size?: number }
}) => {
  const { current, size } = page
  const { type, status, keyword, appId } = searchParams.value
  const where: any = {}
  if (keyword?.trim()) {
    const obj = { like: escapeRegExp(keyword), options: 'i' }
    where.or = [
      { name: obj },
      { tableName: obj },
      { basePath: obj },
      { prefix: obj },
      { apiVersion: obj },
    ]
  }
  if (type) {
    where.connectionType = type
  }
  if (appId) {
    where['listtags.id'] = appId
  }

  status && (where.status = status)

  const filter = {
    order: order.value,
    limit: size,
    skip: (current! - 1) * size!,
    where,
  }

  if (props.params) {
    Object.assign(filter, props.params)
  }

  return fetchApiModules(filter).then((data: any) => {
    const list = (data?.items || []).map((item: any) => {
      item.statusFmt =
        statusOptions.find((it) => it.value === item.status)?.label || '-'
      item.appName = item.listtags?.[0]?.value || '-'

      const pathJoin: string[] = []
      item.apiVersion && pathJoin.push(item.apiVersion)
      item.prefix && pathJoin.push(item.prefix)
      item.basePath && pathJoin.push(item.basePath)
      item._path = `/${pathJoin.join('/')}`
      return item
    })
    // doLayout()
    return {
      total: data?.total,
      data: list,
    }
  })
}

const getApiServerHost = async () => {
  const showError = () => {
    ElMessage.error(t('packages_business_data_server_list_huoqufuwuyu'))
  }
  const data = await apiServerApi.get().catch(() => {
    showError()
  })
  apiServerHost.value = (data as any)?.items?.[0]?.clientURI || ''
  if (!apiServerHost.value) {
    showError()
  }
}

//列表全选
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const removeServer = async (row: any) => {
  const flag = await ElMessageBox.confirm(
    t('packages_business_data_server_list_querenshanchufu'),
  )
  if (flag) {
    await deleteApiModule(row.id)
    table.value?.fetch()
  }
}

const changeStatus = async (row: any) => {
  let msg = t('packages_business_data_server_list_quedingfabugai')
  if (row.status === 'active') {
    msg = t('packages_business_data_server_list_quedingchexiaogai')
  }
  const flag = await ElMessageBox.confirm(msg)
  if (flag) {
    await updateApiModule({
      id: row.id,
      status: row.status === 'active' ? 'pending' : 'active',
      tableName: row.tableName,
    })
    table.value?.fetch()
  }
}

const output = (row: any) => {
  metadataInstancesApi.download(
    {
      _id: {
        in: [row.id],
      },
    },
    'Modules',
  )
}

const showDrawer = (item?: any) => {
  drawer.value?.open(item)
}

const fetch = (...args: any[]) => {
  table.value?.fetch(...args)
}

const handleExport = () => {
  const ids = multipleSelection.value.map((t) => t.id)
  exportApiModules(ids)
}

const handleImport = () => {
  upload.value?.show()
}

const handleExportApiDoc = () => {
  const ids = multipleSelectionActive.value.map((t) => t.id)
  exportApiDocumentation(ids, apiServerHost.value)
}

const batchPublish = async () => {
  if (!pendingSelection.value.length) return

  await batchUpdateApiModules(
    pendingSelection.value.map((item) => ({
      id: item.id,
      status: 'active',
      tableName: item.tableName,
    })),
  )

  ElMessage.success(t('public_message_publish_successful'))
  fetch()
}

const doLayout = () => {
  nextTick(() => {
    table.value?.doLayout()
  })
}

// Additional variables and methods for template
const showSearch = ref(false)
const filterText = ref('')
const authority = ref('')

const openSearch = () => {
  showSearch.value = !showSearch.value
  filterText.value = ''

  if (showSearch.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const handleAppSelect = (app?: any) => {
  const appId = app?.id || ''
  const needFetch = searchParams.value.appId !== appId

  searchParams.value.appId = appId
  currentApp.value = app

  needFetch && fetch(1)
}

const findParentNodeByClassName = (el: HTMLElement, cls: string) => {
  let parent = el
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode
  }
  return parent
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()

  if (!dragState.value.isDragging) return

  const dropNode = findParentNodeByClassName(
    event.currentTarget as HTMLElement,
    'list-item-hover',
  )
  dropNode?.classList.add('is-active')
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()

  if (!event.currentTarget?.contains?.(event.relatedTarget)) {
    const dropNode = findParentNodeByClassName(
      event.currentTarget as HTMLElement,
      'list-item-hover',
    )
    dropNode?.classList.remove('is-active')
  }
}

const handleDrop = async (event: DragEvent, app: any) => {
  const { draggingObjects } = dragState.value
  const dropNode = findParentNodeByClassName(
    event.currentTarget as HTMLElement,
    'list-item-hover',
  )

  if (!draggingObjects?.length || !dropNode) return
  dropNode?.classList.remove('is-active')

  const ids = draggingObjects.map((item) => item.id)

  if (ids.length) {
    await batchUpdateApiModuleTags({
      id: ids,
      listtags: [
        {
          id: app.id,
          value: app.value,
        },
      ],
    })
    ElMessage.success(t('public_message_operation_success'))
    refreshAppList()
    fetch(1)
  }
}

const handleAppCommand = (command: string, app: any) => {
  if (command === 'edit') {
    appEditor.value?.openEdit(app)
  } else if (command === 'delete') {
    appDelete.value?.init(app)
  }
}

provide('apiApplication', currentApp)

// Expose methods
defineExpose({
  fetch,
})
</script>

<template>
  <PageContainer>
    <template #title>
      <slot name="title" />
    </template>
    <template #actions>
      <ElButton
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        @click="handleImport"
      >
        <template #icon>
          <ImportOutlined />
        </template>
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </ElButton>
      <!-- <el-button @click="downloadSdkDialogVisible = true">
        <template #icon>
          <i-lucide:download />
        </template>
        {{ $t('public_download_sdk') }}
      </el-button> -->
      <ElButton
        class="btn btn-create"
        type="primary"
        @click.stop="showDrawer()"
      >
        <span>{{
          $t('packages_business_data_server_drawer_chuangjianfuwu')
        }}</span>
      </ElButton>
    </template>

    <Editor ref="appEditor" @success="refreshAppList" />
    <Delete ref="appDelete" width="380px" @success="fetch(1)" />

    <div class="flex w-100 h-100 gap-4">
      <div
        v-if="showAppList && !inAppList"
        class="py-0 bg-light rounded-xl mt-n2 ml-n2 flex flex-column h-100"
        style="width: 240px"
      >
        <div
          class="h-8 flex align-center gap-1 p-2 mt-2"
          style="--btn-space: 0"
        >
          <el-button text @click="showAppList = !showAppList">
            <template #icon>
              <VIcon class="rotate-180">expand-list</VIcon>
            </template>
          </el-button>
          <div class="fs-6 flex-1">
            <span>{{ $t('public_application') }}</span>
          </div>
          <el-button
            text
            :class="{ 'is-active': showSearch }"
            @click="openSearch"
          >
            <template #icon>
              <i-mingcute:search-line />
            </template>
          </el-button>
          <el-button text @click="appEditor.open()">
            <template #icon>
              <i-mingcute:add-line />
            </template>
          </el-button>
        </div>
        <div v-if="showSearch" class="mt-2 px-2">
          <ElInput ref="searchInput" v-model="filterText" clearable>
            <template #prefix>
              <VIcon size="14">magnify</VIcon>
            </template>
          </ElInput>
        </div>

        <el-scrollbar class="flex-1 min-h-0" wrap-class="p-2">
          <div class="flex flex-column gap-1">
            <div
              class="list-item-hover rounded-lg p-2 flex align-center gap-2 cursor-pointer font-color-light position-relative"
              :class="{
                'bg-white shadow-sm font-color-dark': !searchParams.appId,
              }"
              @click="handleAppSelect()"
            >
              <el-icon size="18">
                <i-fluent:folder-link-16-regular />
              </el-icon>
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="flex align-center gap-1">
                  <span class="ellipsis">{{ $t('public_all') }}</span>
                </div>
              </div>
            </div>
            <div
              v-for="app in filterAppList"
              :key="app.id"
              class="list-item-hover rounded-lg p-2 flex align-center gap-2 cursor-pointer font-color-light position-relative"
              :class="{
                'bg-white shadow-sm font-color-dark':
                  app.id === searchParams.appId,
              }"
              @click="handleAppSelect(app)"
              @dragenter.stop="handleDragEnter($event)"
              @dragover.stop="handleDragOver($event)"
              @dragleave.stop="handleDragLeave($event)"
              @drop.stop="handleDrop($event, app)"
            >
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="flex align-center gap-2">
                  <el-icon size="18">
                    <i-fluent:folder-link-16-regular />
                  </el-icon>
                  <span class="ellipsis lh-6" :title="app.value">{{
                    app.value
                  }}</span>
                  <el-tag size="small" type="info" disable-transitions
                    >{{ app.publishedApiCount }}/{{ app.apiCount }}</el-tag
                  >
                  <ElDropdown
                    class="btn-menu align-center ml-auto"
                    @command="handleAppCommand($event, app)"
                  >
                    <el-button text size="small" @click.stop>
                      <template #icon>
                        <VIcon>more</VIcon>
                      </template>
                    </el-button>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem command="edit">
                          <el-icon class="mr-2">
                            <EditOutlined />
                          </el-icon>
                          {{ $t('public_button_edit') }}</ElDropdownItem
                        >
                        <ElDropdownItem
                          id="test"
                          command="delete"
                          class="is-danger"
                        >
                          <el-icon class="mr-2">
                            <!-- <i-mingcute:delete-2-line /> -->
                            <i-lucide:trash-2 />
                          </el-icon>
                          {{ $t('public_button_delete') }}</ElDropdownItem
                        >
                      </ElDropdownMenu>
                    </template>
                  </ElDropdown>
                </div>
                <span
                  v-if="app.desc && app.id === searchParams.appId"
                  class="color-info ellipsis fs-8"
                  :title="app.desc"
                  >{{ app.desc }}</span
                >
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <TablePage
        ref="table"
        v-model:drag-state="dragState"
        row-key="id"
        :draggable="showAppList && !inAppList"
        :tree-props="{
          showCheckbox: false,
        }"
        :remote-method="getData"
        @selection-change="handleSelectionChange"
      >
        <template v-if="!inAppList" #search>
          <el-button
            v-if="!showAppList"
            text
            @click="showAppList = !showAppList"
          >
            <template #icon>
              <VIcon>expand-list</VIcon>
            </template>
          </el-button>
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table?.fetch(1)"
          />
        </template>

        <template #multipleSelectionActions>
          <ElButton v-show="pendingSelection.length > 0" @click="batchPublish">
            <template #icon>
              <i-lucide:cloud-upload />
            </template>
            <span> {{ $t('public_batch_publish') }}</span>
          </ElButton>
          <ElButton v-readonlybtn="'SYNC_job_export'" @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            <span> {{ $t('public_button_export') }}</span>
          </ElButton>
          <ElButton
            v-readonlybtn="'SYNC_job_export'"
            class="btn"
            @click="handleExportApiDoc"
          >
            <template #icon>
              <ExportOutlined />
            </template>
            <span>{{
              $t('packages_business_data_server_list_apIwendang')
            }}</span>
          </ElButton>
        </template>

        <el-table-column
          v-if="!inAppList"
          type="selection"
          width="32"
          align="center"
          :reserve-selection="true"
        />
        <el-table-column
          :label="$t('packages_business_data_server_list_fuwumingcheng')"
          prop="name"
          :min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <ElLink
              class="ellipsis"
              type="primary"
              style="display: block; line-height: 20px"
              @click.stop="showDrawer(row)"
            >
              {{ row.name }}
            </ElLink>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_data_server_list_fuwuzhuangtai')"
          prop="statusFmt"
          :min-width="106"
        >
          <template #default="{ row }">
            <span class="status-block" :class="`status-${row.status}`">{{
              row.statusFmt
            }}</span>
          </template>
        </el-table-column>
        <template v-if="!inAppList">
          <el-table-column
            v-if="!showAppList"
            :label="$t('packages_business_application_list_yingyongmingcheng')"
            prop="appName"
            :min-width="140"
          />
          <el-table-column
            :label="$t('public_connection_type')"
            prop="connectionType"
            :min-width="120"
          />
          <el-table-column
            :label="$t('public_connection_name')"
            prop="connectionName"
            :min-width="200"
          />
          <el-table-column
            :label="$t('packages_business_data_server_list_guanlianduixiang')"
            prop="tableName"
            :min-width="180"
          />
          <el-table-column
            :label="$t('daas_data_server_drawer_path')"
            prop="_path"
            :min-width="130"
          >
            <template #default="{ row }">
              <el-tag type="info" class="is-code">
                {{ row._path }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <el-table-column
          :label="$t('public_operation')"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton
              v-if="row.status !== 'active'"
              :disabled="row.status !== 'pending'"
              text
              type="primary"
              @click="changeStatus(row)"
              >{{ $t('public_button_public') }}</ElButton
            >
            <ElButton
              v-if="row.status === 'active'"
              text
              type="primary"
              @click="changeStatus(row)"
              >{{ $t('public_button_unpublish') }}</ElButton
            >
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton text type="primary" @click="output(row)">{{
              $t('public_button_export')
            }}</ElButton>
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton text type="primary" @click="removeServer(row)">{{
              $t('public_button_delete')
            }}</ElButton>
          </template>
        </el-table-column>
      </TablePage>
    </div>

    <Drawer
      ref="drawer"
      :host="apiServerHost"
      @save="fetch(1)"
      @update="fetch()"
      @visible="emit('drawerVisible', $event)"
    />
    <!-- 导入 -->
    <Upload ref="upload" type="Modules" :show-tag="false" @success="fetch(1)" />

    <!-- <DownloadSdkDialog v-model="downloadSdkDialogVisible" /> -->
  </PageContainer>
</template>

<style lang="scss" scoped>
.data-server-wrapper {
  height: 100%;
  overflow: hidden;
}
.list-item-hover {
  .btn-menu {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: 8px;
  }
  .btn-menu:has(button[aria-expanded='true']) {
    opacity: 1;
    pointer-events: auto;
    position: static;
  }
  &:hover {
    .btn-menu {
      opacity: 1;
      pointer-events: auto;
      position: static;
    }
  }
}
</style>
