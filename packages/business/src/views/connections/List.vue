<script setup lang="ts">
import { connectionsApi } from '@tap/api'
import SelectList from '@tap/component/src/filter-bar/FilterItemSelect.vue'
import FilterBar from '@tap/component/src/filter-bar/Main.vue'
import { Modal } from '@tap/component/src/modal'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import {
  computed,
  h,
  inject,
  markRaw,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SceneDialog from '../../components/create-connection/SceneDialog.vue'
import PageContainer from '../../components/PageContainer.vue'
import PermissionseSettingsCreate from '../../components/permissionse-settings/Create.vue'
import SchemaProgress from '../../components/SchemaProgress.vue'
import TablePage from '../../components/TablePage.vue'
import { useHas } from '../../composables'
import { CONNECTION_STATUS_MAP, CONNECTION_TYPE_MAP } from '../../shared'
import Preview from './Preview.vue'
import Test from './Test.vue'
import UsedTaskDialog from './UsedTaskDialog.vue'
import { getConnectionIcon, verify } from './util'

// Types
interface ConnectionTaskData {
  items: any[]
  total: number
}

interface SearchParams {
  databaseType: string | null
  keyword: string
  databaseModel: string
  status: string
  panelFlag: boolean
  sourceType: string
}

interface DatabaseTypeOption {
  label: string
  value: string
}

interface ConnectionDialogProps {
  dialogMode?: boolean
}

interface ApiResponse<T> {
  data: T
  items?: any[]
  total?: number
  jobs?: any[]
  modules?: any[]
}

const checkAgent: any = inject('checkAgent')
const buried: any = inject('buried')

// Router and Route
const router = useRouter()
const route = useRoute()

// Refs
const table = ref()
const previewRef = ref()
const test = ref()
const dialog = ref()
const permissionseSettingsCreate = ref()

// State
let timeout: NodeJS.Timeout | null = null

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const showInstanceInfo = import.meta.env.VUE_APP_LICENSE_TYPE === 'PIPELINE'

const filterItems = ref([])
const dialogDatabaseTypeVisible = ref(false)
const multipleSelection = ref([])
const order = ref('last_updated DESC')

const databaseStatusOptions = [
  {
    label: i18n.t('public_select_option_all'),
    value: '',
  },
  {
    label: i18n.t('public_status_ready'),
    value: 'ready',
  },
  {
    label: i18n.t('public_status_invalid'),
    value: 'invalid',
  },
  {
    label: i18n.t('public_status_testing'),
    value: 'testing',
  },
]

const connectionTypeOptions = [
  {
    label: i18n.t('public_all'),
    value: undefined,
  },
  {
    label: i18n.t('public_connection_type_source'),
    value: 'source',
  },
  {
    label: i18n.t('public_connection_type_target'),
    value: 'target',
  },
]

const searchParams = ref<SearchParams>({
  databaseType: null,
  keyword: '',
  databaseModel: undefined,
  status: '',
  panelFlag: true,
  sourceType: '',
})

const testData = shallowRef(null)
const connectionTaskData = reactive<ConnectionTaskData>({
  items: [],
  total: 0,
})
const connectionTaskDialog = ref(false)

let connectionDialogProps: ConnectionDialogProps = {}

if (import.meta.env.VUE_APP_CONNECTION_DIALOG_PROPS) {
  try {
    connectionDialogProps = JSON.parse(
      import.meta.env.VUE_APP_CONNECTION_DIALOG_PROPS,
    )
  } catch (error) {
    console.error(error)
  }
}

const databaseTypeOptions = ref<DatabaseTypeOption[]>([])
const $has = useHas()

// Computed
const buttonShowMap = computed(() => ({
  create: $has('v2_datasource_creation'),
  copy: $has('v2_datasource_copy'),
}))

// Watch
watch(
  () => route.query,
  () => {
    table.value?.fetch(1)
  },
)

// Methods
const reloadDataOnTesting = (data: any[]) => {
  let flag = false
  data.forEach((el) => {
    if (el.status === 'testing') {
      flag = true
    }
  })
  flag &&
    setTimeout(() => {
      table.value?.fetch(null, 0, true, (value: any[]) => {
        reloadDataOnTesting(value)
      })
    }, 3000)
}

const handleSortTable = ({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) => {
  order.value = `${sortOrder ? prop : 'last_updated'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}

const getData = async ({
  page,
  tags,
}: {
  page: { current: number; size: number }
  tags?: string[]
}) => {
  const { current, size } = page
  const { keyword, databaseType, databaseModel, status, sourceType } =
    searchParams.value
  const where: any = {
    createType: {
      $ne: 'System',
    },
  }

  if (keyword && keyword.trim()) {
    where.name = { like: verify(keyword), options: 'i' }
  }
  databaseType && (where.database_type = databaseType)

  if (databaseModel) {
    where.connection_type = {
      $ne: databaseModel === 'source' ? 'target' : 'source',
    }
  }

  sourceType && (where.sourceType = sourceType)
  if (tags && tags.length) {
    where['listtags.id'] = {
      in: tags,
    }
  }
  status && (where.status = status)

  const filter = {
    order: order.value,
    limit: size,
    noSchema: 1,
    skip: (current - 1) * size,
    where,
  }

  try {
    const data = await connectionsApi.get({
      filter: JSON.stringify(filter),
    })
    let list = data?.items || []

    if (multipleSelection.value.length && list.length) {
      const tempMap = list.reduce((map: any, item: any) => {
        map[item.id] = item
        return map
      }, {})
      multipleSelection.value.forEach((item: any, i: number) => {
        const temp = tempMap[item.id]
        if (temp) {
          multipleSelection.value[i] = temp
        }
      })
    }

    list = list.map((item: any) => {
      if (item.connectionString) {
        item.connectionUrl = item.connectionString
      } else if (item.config?.uri) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
            item.config.uri,
          )
        if (regResult && regResult.groups && regResult.groups.password) {
          const { username, host, database, query } = regResult.groups
          item.connectionUrl = `mongodb://${username}:***@${host}/${database}${query ? `/${query}` : ''}`
        } else {
          item.connectionUrl = item.config.uri
        }
      } else if (item.config) {
        const { host, port, database, schema } = item.config
        item.connectionUrl = host
          ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
          : ''
      }

      item.lastUpdateTime = item.last_updated = item.last_updated
        ? dayjs(item.last_updated).format('YY-MM-DD HH:mm:ss')
        : '-'
      item.loadSchemaTimeLabel = item.loadSchemaTime
        ? dayjs(item.loadSchemaTime).format('YY-MM-DD HH:mm:ss')
        : '-'
      item.disabledLoadSchema = false
      return item
    })

    previewRef.value?.sync(list)
    return {
      total: data?.total || 0,
      data: list,
    }
  } catch (error) {
    console.error(error)
    return {
      total: 0,
      data: [],
    }
  }
}

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const preview = (row: any) => {
  previewRef.value?.open(row)
}

const edit = async (id: string, item: any) => {
  const { pdkHash, definitionPdkId: pdkId } = item

  if (item.agentType === 'Local') {
    try {
      const confirmed = await Modal.confirm(
        i18n.t('packages_business_connections_list_dangqianlianjie') +
          item.name +
          i18n.t('packages_business_connections_list_zhengzaizuoweiF'),
      )

      if (!confirmed) return

      if (connectionDialogProps.dialogMode) {
        dialog.value?.editConnection(item)
        return
      }

      router.push({
        name: 'connectionsEdit',
        params: {
          id,
        },
        query: {
          pdkHash,
          pdkId,
        },
      })
    } catch {
      return
    }
  } else {
    if (connectionDialogProps.dialogMode) {
      dialog.value?.editConnection(item)
      return
    }

    router.push({
      name: 'connectionsEdit',
      params: {
        id,
      },
      query: {
        pdkHash,
        pdkId,
      },
    })
  }
}

const copy = async (data: any) => {
  const headersName = { 'lconname-name': data.name }
  data.copyLoading = true
  try {
    await connectionsApi.copy(data.id, {
      uri: `${data.id}/copy`,
      headers: headersName,
    })
    table.value?.fetch()
    ElMessage.success(i18n.t('public_message_copy_success'))
  } catch (error) {
    console.error(error)
  } finally {
    data.copyLoading = false
  }
}

const remove = async (row: any) => {
  let strArr = i18n
    .t('packages_business_connection_deteleDatabaseMsg')
    .split('xxx')
  if (row.agentType === 'Local') {
    const str = i18n.t('packages_business_connections_list_dangqianlianjiex')
    strArr = str.split('xxx')
  }
  const msg = h('p', null, [
    strArr[0],
    h(
      'span',
      {
        class: 'color-primary',
      },
      row.name,
    ),
    strArr[1],
  ])

  try {
    const confirmed = await Modal.confirm(msg)

    if (!confirmed) return

    const data = await connectionsApi.checkConnectionTask(row.id)
    if (data?.items?.length === 0) {
      const result = await connectionsApi.delete(row.id)
      const jobs = result?.data?.jobs || []
      const modules = result?.data?.modules || []
      if (jobs.length > 0 || modules.length > 0) {
        ElMessage.error(i18n.t('packages_business_connection_checkMsg'))
      } else {
        ElMessage.success(i18n.t('public_message_delete_ok'))
        table.value?.fetch()
      }
    } else {
      connectionTaskData.items = data?.items || []
      connectionTaskData.total = data?.total || 0
      connectionTaskDialog.value = true
    }
  } catch {
    // User cancelled
  }
}

const handleSelectTag = () => {
  const tagList = []
  const tagMap: Record<string, boolean> = {}

  multipleSelection.value.forEach((row: any) => {
    row.listtags?.forEach((item: any) => {
      if (!tagMap[item.id]) {
        tagList.push(item)
        tagMap[item.id] = true
      }
    })
  })

  return tagList
}

const handleOperationClassify = async (listtags: any[]) => {
  const attributes = {
    id: multipleSelection.value.map((r: any) => r.id),
    listtags,
  }
  try {
    await connectionsApi.batchUpdateListtags(attributes)
    table.value?.fetch()
    ElMessage.success(i18n.t('public_message_save_ok'))
  } catch (error) {
    console.error(error)
  }
}

const handleDialogDatabaseTypeVisible = () => {
  dialogDatabaseTypeVisible.value = false
}

const handleDatabaseType = (item: any) => {
  handleDialogDatabaseTypeVisible()
  const { pdkHash, pdkId } = item
  router.push({
    name: 'connectionCreate',
    query: { pdkHash, pdkId },
  })
}

const checkTestConnectionAvailable = () => {
  if (import.meta.env.DEV) {
    dialogDatabaseTypeVisible.value = true
    return
  }
  // Replace with actual buried point tracking
  buried('connectionCreateDialog')
  // Replace with actual agent check
  checkAgent(() => {
    dialogDatabaseTypeVisible.value = true
  })
}

const testConnection = (item: any) => {
  const loading = ElLoading.service()
  buried('connectionTest')

  checkAgent(async () => {
    testData.value = markRaw(item)
    try {
      await connectionsApi.updateById(
        item.id,
        Object.assign(
          {},
          {
            status: 'testing',
          },
        ),
      )
      test.value?.start()
      table.value?.fetch()
    } catch {
      // Replace with actual buried point tracking
      buried('connectionTestFail')
    } finally {
      loading.close()
    }
  }).catch(() => {
    buried('connectionTestAgentFail')
    loading.close()
  })
}

const handleLoadSchema = (row: any) => {
  const loading = ElLoading.service()
  row.disabledLoadSchema = true
  testData.value = markRaw(row)

  checkAgent(() => {
    nextTick(async () => {
      await test.value?.triggerLoadSchema().finally(() => {
        row.disabledLoadSchema = false
        loading.close()
      })

      table.value?.fetch(null, 0, true)
    })
  }).catch(() => {
    loading.close()
  })

  // previewRef.value.setConnectionData(row)
  // previewRef.value.reload?.(table.value?.fetch(null, 0, true))
  // setTimeout(() => {
  //   row.disabledLoadSchema = false
  // }, 3000)
}

const returnTestData = (data: any) => {
  if (!data.status || data.status === null) return
  const status = data.status
  if (status === 'ready') {
    ElMessage.success(
      i18n.t('public_connection_button_test') + i18n.t('public_status_ready'),
    )
  } else {
    ElMessage.error(
      i18n.t('public_connection_button_test') + i18n.t('public_status_invalid'),
    )
  }

  // Replace with actual buried point tracking
  buried('connectionTest', '', {
    result: status === 'ready',
  })
  table.value?.fetch()
}

const getFilterItems = () => {
  filterItems.value = [
    {
      slotName: 'connectionType',
      key: 'databaseModel',
    },
    {
      label: i18n.t('packages_business_connection_list_status'),
      key: 'status',
      type: 'select-inner',
      items: databaseStatusOptions,
    },
    {
      slotName: 'databaseType',
      label: i18n.t('packages_business_connection_list_form_database_type'),
      key: 'databaseType',
      type: 'select-inner',
      width: 250,
      filterable: true,
      items: async () => {
        const data = await connectionsApi.getDatabaseTypes()

        if (!data?.length) {
          return []
        }

        data.sort((t1: any, t2: any) =>
          t1.databaseType.localeCompare(t2.databaseType),
        )

        return data.map((item: any) => {
          return {
            label: item.databaseType,
            value: item.databaseType,
          }
        })
      },
    },
    {
      placeholder: i18n.t('packages_business_connection_list_name'),
      key: 'keyword',
      type: 'input',
      id: 'name-filter-input',
    },
  ]
}

const isFileSource = (row: any) => {
  return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(row?.database_type)
}

const getStatus = (status: string) => {
  return CONNECTION_STATUS_MAP[status]?.text || '-'
}

const getType = (type: string) => {
  return CONNECTION_TYPE_MAP[type]?.text || '-'
}

const havePermission = (data: string[] = [], type: string = '') => {
  if (!isDaas) return true
  return data.includes(type)
}

const handlePermissionsSettings = () => {
  permissionseSettingsCreate.value?.open(multipleSelection.value)
}

const fetchDatabaseTypeOptions = async () => {
  const data = await connectionsApi.getDatabaseTypes()

  if (!data?.length) {
    return []
  }

  data.sort((t1: any, t2: any) =>
    t1.databaseType.localeCompare(t2.databaseType),
  )

  databaseTypeOptions.value = data.map((item: any) => {
    return { label: item.databaseType, value: item.databaseType }
  })
}

const handleChangeDatabaseType = (value: string) => {
  const query: Record<string, any> = {}

  filterItems.value.forEach((item) => {
    if (!item.slotName && item.value) {
      query[item.key] = item.value
    }
  })

  if (value) {
    query.databaseType = value
  }

  router.replace({
    query,
  })
}

// Lifecycle hooks
onMounted(() => {
  const { action, create } = route.query || {}

  if (create) {
    dialogDatabaseTypeVisible.value = true
  }

  if (action === 'create') {
    checkTestConnectionAvailable()
  }

  Object.keys(searchParams.value).forEach((key) => {
    if (key in route.query) {
      searchParams.value[key as keyof SearchParams] = route.query[key] as string
    }
  })

  timeout = setInterval(() => {
    table.value?.fetch(null, 0, true)
  }, 10000)
  getFilterItems()
})

onUnmounted(() => {
  if (timeout) {
    clearInterval(timeout)
  }
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-if="buttonShowMap.create"
        id="connection-list-create"
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        @click="checkTestConnectionAvailable"
      >
        <span> {{ $t('public_connection_button_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      :classify="
        isDaas
          ? {
              authority: 'datasource_catalog_management',
              types: ['database'],
              viewPage: 'connections',
              title: $t('public_tags'),
            }
          : null
      "
      :remote-method="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        >
          <template #connectionType>
            <el-segmented
              v-model="searchParams.databaseModel"
              :options="connectionTypeOptions"
              @change="table.fetch(1)"
            />
          </template>

          <template #databaseType>
            <SelectList
              v-model="searchParams.databaseType"
              :label="
                $t('packages_business_connection_list_form_database_type')
              "
              :items="databaseTypeOptions"
              filterable
              clearable
              @change="handleChangeDatabaseType"
              @visible-change="fetchDatabaseTypeOptions"
            />
          </template>
        </FilterBar>
      </template>
      <template v-if="isDaas" #multipleSelectionActions>
        <ElButton @click="handlePermissionsSettings"
          >{{
            $t('packages_business_permissionse_settings_create_quanxianshezhi')
          }}
        </ElButton>
        <ElButton
          v-readonlybtn="'datasource_category_application'"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <span> {{ $t('public_button_bulk_tag') }}</span>
        </ElButton>
      </template>
      <ElTableColumn
        v-if="isDaas"
        type="selection"
        width="32"
        align="center"
        :reserve-selection="true"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="name"
        min-width="250"
        :label="$t('public_connection_name')"
      >
        <template #default="{ row }">
          <div class="connection-name flex flex-wrap gap-1">
            <div class="flex align-center gap-1 overflow-hidden">
              <img
                class="connection-img"
                :src="getConnectionIcon(row.pdkHash)"
                alt=""
              />
              <ElLink
                underline="never"
                class="ellipsis block lh-base"
                type="primary"
                @click.stop="preview(row)"
              >
                {{ row.name }}
              </ElLink>
            </div>
            <div
              v-if="row.listtags"
              class="justify-content-start ellipsis flex flex-wrap align-center gap-1"
            >
              <span
                v-for="(item, i) in row.listtags"
                :key="i"
                class="tag ellipsis"
                :title="item.value"
              >
                {{ item.value }}
              </span>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="showInstanceInfo"
        show-overflow-tooltip
        :label="$t('packages_business_instance_info')"
        min-width="160"
      >
        <template #default="{ row }">
          <el-tag>
            {{ row.datasourceInstanceTag || '-' }}
          </el-tag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        :label="$t('public_connection_information')"
        min-width="160"
      >
        <template #default="scope">
          {{ scope.row.connectionUrl }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="status"
        :label="$t('packages_business_connection_dataBaseStatus')"
        min-width="100"
      >
        <template #default="{ row }">
          <div>
            <span :class="[`status-connection-${row.status}`, 'status-block']">
              {{ getStatus(row.status) }}
            </span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        width="125"
        prop="connection_type"
        min-width="135"
        :label="$t('public_connection_type')"
      >
        <template #default="scope">
          {{ getType(scope.row.connection_type) }}
        </template>
      </ElTableColumn>
      <ElTableColumn min-width="125">
        <template #header>
          <div class="flex align-center">
            <span>{{ $t('public_connection_schema_status') }}</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              :content="$t('public_connection_schema_status_tip')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
        <template #default="scope">
          <div v-if="isFileSource(scope.row)">-</div>
          <SchemaProgress :data="scope.row" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="loadSchemaTime"
        sortable="loadSchemaTime"
        min-width="180"
        :label="$t('public_connection_table_structure_update_time')"
      >
        <template #default="scope">
          {{ scope.row.loadSchemaTimeLabel }}
        </template>
      </ElTableColumn>
      <ElTableColumn fixed="right" width="320" :label="$t('public_operation')">
        <template #header>
          <div v-if="isDaas" class="flex align-center">
            <span>{{ $t('public_operation_available') }}</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              :content="
                $t('packages_business_connections_list_wuquanxiandecao')
              "
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
        <template #default="scope">
          <ElButton
            data-testid="test-connection"
            text
            type="primary"
            @click="testConnection(scope.row)"
            >{{ $t('public_connection_button_test') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElTooltip
            :disabled="!isFileSource(scope.row)"
            :content="$t('packages_business_connections_list_wenjianleixingde')"
            placement="top"
          >
            <span>
              <ElButton
                text
                type="primary"
                data-testid="load-schema"
                :disabled="
                  isFileSource(scope.row) || scope.row.disabledLoadSchema
                "
                @click="handleLoadSchema(scope.row)"
                >{{ $t('public_connection_button_load_schema') }}
              </ElButton>
            </span>
          </ElTooltip>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-if="havePermission(scope.row.permissionActions, 'Edit')"
            v-readonlybtn="'datasource_edition'"
            text
            type="primary"
            data-testid="edit-connection"
            :disabled="
              $disabledByPermission(
                'datasource_edition_all_data',
                scope.row.user_id,
              ) || scope.row.agentType === 'Cloud'
            "
            @click="edit(scope.row.id, scope.row)"
            >{{ $t('public_button_edit') }}
          </ElButton>
          <ElDivider
            v-if="havePermission(scope.row.permissionActions, 'Edit')"
            v-readonlybtn="'datasource_edition'"
            class="mx-1"
            direction="vertical"
          />
          <ElButton
            v-if="buttonShowMap.copy"
            v-readonlybtn="'datasource_creation'"
            text
            type="primary"
            data-testid="copy-connection"
            :loading="scope.row.copyLoading"
            :disabled="scope.row.agentType === 'Cloud'"
            @click="copy(scope.row)"
            >{{ $t('public_button_copy') }}
          </ElButton>
          <ElDivider
            v-if="buttonShowMap.copy"
            v-readonlybtn="'datasource_creation'"
            class="mx-1"
            direction="vertical"
          />
          <ElButton
            v-if="havePermission(scope.row.permissionActions, 'Delete')"
            v-readonlybtn="'datasource_delete'"
            text
            type="primary"
            data-testid="delete-connection"
            :disabled="
              $disabledByPermission(
                'datasource_delete_all_data',
                scope.row.user_id,
              ) || scope.row.agentType === 'Cloud'
            "
            @click="remove(scope.row)"
            >{{ $t('public_button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <Preview
      ref="previewRef"
      @test="testConnection"
      @load-schema="handleLoadSchema"
    />
    <SceneDialog
      ref="dialog"
      v-model:visible="dialogDatabaseTypeVisible"
      selector-type="source_and_target"
      v-bind="connectionDialogProps"
      @selected="handleDatabaseType"
      @success="table.fetch(1)"
    />
    <Test
      ref="test"
      :connection="testData"
      @return-test-data="returnTestData"
    />
    <UsedTaskDialog v-model="connectionTaskDialog" :data="connectionTaskData" />
    <PermissionseSettingsCreate ref="permissionseSettingsCreate" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.paddingLeft0 {
  padding-left: 0 !important;
}

.connection-list-wrap {
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.connection-name {
  display: flex;
  align-items: center;
}

.tag {
  padding: 0 4px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: map.get($color, tag);
  border: 1px solid map.get($bgColor, tag);
  border-radius: 4px;
}

.connection-img {
  width: 18px;
  height: 18px;
}

.btn-text {
  // color: map.get($color, primary);
  font-size: 12px;
  padding-right: 5px;
}

.error {
  color: #f56c6c;
}

.success {
  color: #67c23a;
}

.warning {
  color: #e6a23c;
}

.connections-status__icon {
  font-size: 14px;
}

.search-bar {
  display: flex;

  .item {
    margin-right: 10px;
  }
}

.btn + .btn {
  margin-left: 5px;
}

.btn {
  i.iconfont {
    font-size: 12px;
  }

  &.btn-dropdowm {
    margin-left: 5px;
  }

  &.btn-create {
    margin-left: 5px;
  }
}
</style>
