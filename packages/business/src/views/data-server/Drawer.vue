<script setup lang="ts">
import { EditPen, InfoFilled } from '@element-plus/icons-vue'
import {
  createApiModule,
  databaseTypesApi,
  fetchApiServerToken,
  listAllConnections,
  metadataInstancesApi,
  roleApi,
  updateApiModule,
  updateApiModulePermissions,
  updateApiModuleTags,
  workerApi,
} from '@tap/api'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import Drawer from '@tap/component/src/Drawer.vue'
import { Modal } from '@tap/component/src/modal'

import i18n from '@tap/i18n'
import { uid } from '@tap/shared'
import axios from 'axios'
import { cloneDeep, isEqual } from 'lodash-es'
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  watch,
  type Component,
} from 'vue'
import ListSelect from '../api-application/ListSelect.vue'
import getTemplate from './template'

// API Response Types
interface ApiResponse<T = any> {
  items?: T[]
  data?: T
}

interface ListTag {
  id: string
  value: string
}

interface FormDataPath {
  name?: string
  method?: string
  result?: string
  type?: string
  params?: Array<{
    name: string
    type: string
    defaultvalue?: string
    description: string
    required?: boolean
  }>
  where?: any[]
  sort?: any[]
  fields?: Field[]
  path?: string
  acl?: string[]
}

interface FormData {
  id?: string
  name?: string
  description?: string
  apiType?: string
  connectionType?: string
  connectionName?: string
  connectionId?: string
  tableName?: string
  basePath?: string
  apiVersion?: string
  prefix?: string
  pathAccessMethod?: string
  status?: string
  paths?: FormDataPath[]
  listtags?: ListTag[]
  fields?: Field[]
  connection?: string
  source?: {
    database_type: string
    name: string
  }
  datasource?: string
  tablename?: string
  readConcern?: string
  readPreference?: string
  readPreferenceTag?: string
  operationType?: string
}

// Types
interface Field {
  id: string
  field_name: string
  data_type: string
  comment?: string
}

// Constants
const typeOptions = ['number', 'string', 'boolean', 'date', 'datetime', 'time']
const operatorOptions = ['>', '==', '<', '>=', '<=', '!=', 'like']
const conditionOptions = ['null', 'and', 'or']
const apiTypeMap = {
  defaultApi: i18n.t('packages_business_data_server_drawer_morenchaxun'),
  customerQuery: i18n.t('packages_business_data_server_drawer_zidingyichaxun'),
}

interface Props {
  host?: string
  tag?: string | Component
  inDialog?: boolean
  disableApp?: boolean
  readonly?: boolean
  params?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  tag: Drawer,
  inDialog: false,
  disableApp: false,
  readonly: false,
})

const emit = defineEmits(['visible', 'update:loading', 'save', 'update'])

const apiApplication = inject('apiApplication', null)

// Refs
const form = ref<any>({
  pathAccessMethod: 'customize',
  apiVersion: 'v1',
  prefix: '',
  basePath: '',
  acl: ['admin'],
  appValue: '',
  appLabel: '',
})
const visible = ref(false)
const loading = ref(false)
const data = ref<any>({})
let initialFormData = {}
const tab = ref('form')
const isEdit = ref(false)
const debugParams = ref<any>(null)
const debugMethod = ref('GET')
const debugResult = ref('')
const templateType = ref('java')
const token = ref('')
const roles = ref([])
const workerStatus = ref('')
const intervalId = ref(0)
const allFields = ref([])
const fieldLoading = ref(false)
const databaseTypes = ref<string[] | null>(null)
const connectionOptions = ref<any[] | null>(null)
const tableOptions = ref<any[]>([])
const templates = ref<Record<string, string>>({})

// Template refs
const form_ref = ref()
const fieldTable = ref()
const tabs = ref()

// Regex validation patterns
const PARAM_PATTERN = /^[a-z$_\u4E00-\u9FA5][\w$\u4E00-\u9FA5]*$/i
const PATH_PATTERN = /^[\w$-]+$/

// Validation rules
const validateParams = (rule: any, value: string, callback: Function) => {
  if (PARAM_PATTERN.test(value)) {
    callback()
  } else {
    callback(i18n.t('packages_business_data_server_drawer_geshicuowu'))
  }
}

const validateBasePath = (rule: any, value: string, callback: Function) => {
  if (!value || PATH_PATTERN.test(value)) {
    callback()
  } else {
    callback(i18n.t('packages_business_data_server_drawer_validate'))
  }
}

const validatePrefix = (rule: any, value: string, callback: Function) => {
  if (PATH_PATTERN.test(value) || value === '') {
    callback()
  } else {
    callback(i18n.t('packages_business_data_server_drawer_validate'))
  }
}

const rules = {
  name: [
    {
      required: true,
      message: i18n.t('packages_business_data_server_drawer_qingshurufuwu'),
      trigger: 'blur',
    },
  ],
  acl: [
    {
      required: true,
      message: i18n.t('packages_business_data_server_drawer_selectPermissions'),
      trigger: 'blur',
    },
  ],
  connectionType: [
    {
      required: true,
      message: i18n.t('packages_business_data_server_drawer_qingxuanzelianjie'),
      trigger: 'blur',
    },
  ],
  connectionId: [
    {
      required: true,
      message: i18n.t('public_input_placeholder') + i18n.t('public_connection'),
      trigger: 'blur',
    },
  ],
  tableName: [
    {
      required: true,
      message: i18n.t(
        'packages_business_data_server_drawer_qingxuanzeduixiang',
      ),
      trigger: 'blur',
    },
  ],
  param: [
    {
      required: true,
      validator: validateParams,
      trigger: ['blur', 'change'],
    },
  ],
  basePath: [
    {
      required: true,
      message:
        i18n.t('public_input_placeholder') +
        i18n.t('packages_business_data_server_drawer_base_path'),
      trigger: ['blur', 'change'],
    },
    { validator: validateBasePath, trigger: ['blur', 'change'] },
  ],
  prefix: [
    {
      required: false,
      validator: validatePrefix,
      trigger: ['blur', 'change'],
    },
  ],
  apiVersion: [
    {
      required: false,
      validator: validateBasePath,
      trigger: ['blur', 'change'],
    },
  ],
  appValue: [
    {
      required: true,
      message: i18n.t('packages_business_data_server_drawer_qingxuanzesuoshu'),
      trigger: ['blur'],
    },
  ],
}

// Computed properties
const parameterOptions = computed(() => {
  return (
    form.value?.params?.filter(
      (item: any) => item.name && !['page', 'limit'].includes(item.name),
    ) || []
  )
})

const customizePath = computed(() => {
  const arr = []
  if (form.value?.apiVersion && form.value?.apiVersion !== '') {
    arr.push(form.value?.apiVersion)
  }
  if (form.value?.prefix && form.value?.prefix !== '') {
    arr.push(form.value?.prefix)
  }
  if (form.value?.basePath && form.value?.basePath !== '') {
    arr.push(form.value?.basePath)
  }
  return `/api/${arr.join('/')}`
})

const urlList = computed(() => {
  const baseUrl = props.host + customizePath.value

  return [
    {
      method: 'POST',
      url: `${baseUrl}/find`,
    },
    {
      method: 'GET',
      url: String(baseUrl),
    },
    {
      method: 'TOKEN',
      url: `${location.origin + location.pathname}oauth/token`,
    },
  ]
})

const urlsMap = computed(() => {
  return urlList.value.reduce((acc: Record<string, string>, item) => {
    acc[item.method] = item.url
    return acc
  }, {})
})

const formatData = (formData: FormData = {}) => {
  // 兼容老数据类型
  if (formData.apiType === 'customerApi') {
    formData.apiType = 'customerQuery'
  }
  const path = formData?.paths?.[0] || {}
  const {
    id,
    name,
    description,
    status,
    connectionType,
    connectionName,
    connectionId,
    tableName,
    basePath,
    apiVersion,
    prefix,
    pathAccessMethod,
    listtags,
    appLabel: _appLabel,
    appValue: _appValue,
    limit = 0,
  } = formData

  const appData = listtags?.[0] || {}
  const appValue = apiApplication?.value?.id || _appValue || appData.id || ''
  const appLabel =
    apiApplication?.value?.value || _appLabel || appData.value || ''

  const apiType = formData?.apiType || 'defaultApi'
  const fields = formData.paths?.[0]?.fields || []

  data.value = {
    status: status || 'generating',
    id,
    name,
    description,
    apiType,
    connectionType,
    connectionName,
    connectionId,
    tableName,
    basePath,
    apiVersion,
    prefix,
    pathAccessMethod,
    method: path.method || 'GET',
    fields,
    params:
      path.params?.filter((t: any) => t.name !== 'sort') ||
      getDefaultParams(apiType),
    where: path.where || [],
    sort: path.sort || [],
    path: path.path || '',
    acl: path.acl || ['admin'],
    appValue,
    appLabel,
    limit,
  }
  form.value = cloneDeep(data.value)

  if (data.value.status === 'active') {
    getAPIServerToken((token: string) => {
      templates.value = getTemplate(props.host + data.value.path, token)
    })
  }
}

const getDefaultParams = (apiType: string) => {
  const params = [
    {
      name: 'page',
      type: 'number',
      defaultvalue: '1',
      description: i18n.t('packages_business_data_server_drawer_fenyebianhao'),
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultvalue: '20',
      description: i18n.t('packages_business_data_server_drawer_meigefenyefan'),
      required: true,
    },
  ]
  if (apiType === 'defaultApi') {
    params.push({
      name: 'filter',
      type: 'object',
      defaultvalue: '',
      description: i18n.t('public_data_filter_condition'),
      required: false,
    })
  }
  return params
}

const getDatabaseTypes = async () => {
  databaseTypes.value = null
  const data = await databaseTypesApi.get().catch(() => {
    databaseTypes.value = []
    return []
  })

  databaseTypes.value =
    data
      .filter((it: any) =>
        [
          'mysql',
          'sqlserver',
          'oracle',
          'mongodb',
          'postgres',
          'tidb',
          'doris',
        ].includes(it.pdkId),
      )
      .map((it: any) => it.name) || []
  await getConnectionOptions()
}

const getConnectionOptions = async () => {
  const filter = {
    fields: {
      id: true,
      name: true,
      connection_type: true,
      status: true,
      user_id: true,
      database_type: true,
    },
    where: {
      database_type: form.value.connectionType
        ? form.value.connectionType
        : {
            in: databaseTypes.value,
          },
      connection_type:
        import.meta.env.VUE_APP_MODE !== 'msa'
          ? {
              in: ['source_and_target', 'target'],
            }
          : undefined,
    },
  }

  connectionOptions.value = null
  const data = await listAllConnections(filter).catch(() => {
    connectionOptions.value = []
    return []
  })

  connectionOptions.value =
    data.map((it: any) => ({
      name: it.name,
      type: it.database_type,
      id: it.id,
    })) || []
}

const getTableOptions = async (id: string) => {
  tableOptions.value = []
  const data = await metadataInstancesApi
    .getTablesValue({ connectionId: id })
    .catch(() => {
      tableOptions.value = []
      return []
    })
  tableOptions.value = data || []
}

const getFields = async () => {
  fieldLoading.value = true
  const filter = {
    where: {
      'source.id': form.value.connectionId,
      original_name: form.value.tableName,
      is_deleted: false,
      sourceType: 'SOURCE',
    },
  }

  try {
    const data = await metadataInstancesApi.get({
      filter: JSON.stringify(filter),
    })

    allFields.value =
      data.items?.[0]?.fields?.map((it: any) => ({
        ...it,
        id: it.id,
        field_name: it.field_name,
        originalDataType: it.data_type,
        comment: it.comment,
      })) || []

    if (!form.value.id) {
      form.value.fields = cloneDeep(allFields.value)
      nextTick(() => {
        fieldTable.value?.toggleAllSelection()
      })
    }
  } finally {
    fieldLoading.value = false
  }
}

const handleFieldsSelection = () => {
  const fields = data.value.fields || []
  fields.forEach((row: any) => {
    const targetRow = allFields.value.find((it: any) => it.id === row.id)

    if (targetRow) {
      fieldTable.value?.toggleRowSelection(targetRow, true)
    }
  })
}

const getAPIServerToken = async (callback?: (token: string) => void) => {
  token.value = await fetchApiServerToken()
  callback?.(token.value)
}

// Methods
const open = async (formData?: any) => {
  data.value = formData || {}
  tab.value = 'form'
  visible.value = true
  isEdit.value = false
  debugParams.value = null
  debugMethod.value = 'GET'
  debugResult.value = ''
  allFields.value = []
  workerStatus.value = ''
  form.value = {
    pathAccessMethod: 'customize',
    apiVersion: 'v1',
    prefix: '',
    basePath: '',
    acl: ['admin'],
    appValue: '',
    appLabel: '',
    limit: 0,
  }

  formatData(formData || {})

  form.value.pathAccessMethod = data.value?.pathAccessMethod || 'customize'
  getDatabaseTypes()
  const { connectionId, tableName } = form.value
  if (connectionId) {
    getTableOptions(connectionId)
  }
  if (connectionId && tableName) {
    getFields()
  }
  if (!data.value.id) {
    form.value.basePath = uid(11, 'a')
    edit()
  }

  if (form_ref.value) {
    nextTick(() => {
      form_ref.value.clearValidate()
      form_ref.value.$el.scrollTop = 0
    })
  }
}

const save = async (type?: boolean) => {
  const valid = await form_ref.value?.validate()
  if (valid) {
    const {
      id,
      name,
      description,
      apiType,
      basePath,
      connectionId,
      tableName,
      params,
      where,
      sort,
      fields,
      method,
      path,
      status,
      acl,
      connectionType,
      connectionName,
      apiVersion,
      prefix,
      pathAccessMethod,
      appLabel,
      appValue,
      limit,
    } = form.value

    if (params.some((it: any) => !it.name.trim())) {
      ElMessage.error(
        i18n.t('packages_business_data_server_drawer_qingshurucanshu'),
      )
      return
    }

    loading.value = true
    emit('update:loading', true)

    try {
      const formData: FormData = {
        id,
        status: basePath && basePath !== '' ? 'pending' : status,
        name,
        description,
        apiType,
        connectionId,
        connectionName,
        connectionType,
        operationType: method,
        tableName,
        basePath,
        readConcern: '',
        readPreference: '',
        readPreferenceTag: '',
        limit,
        datasource: connectionId,
        tablename: tableName,
        apiVersion,
        prefix,
        pathAccessMethod,
        listtags: [
          {
            id: appValue,
            value: appLabel,
          },
        ],
        paths: [
          {
            name: apiType === 'customerQuery' ? 'customerQuery' : 'findPage',
            result: 'Page<Document>',
            type: apiType === 'customerQuery' ? 'customerQuery' : 'preset',
            acl,
            method,
            params,
            where,
            sort,
            fields: fields.filter((f: any) => !!f),
            path,
          },
        ],
      }

      if (!type && connectionId && tableName) {
        await loadAllFields()
        formData.fields = allFields.value
      }

      const func = id ? updateApiModule : createApiModule
      const data = await func(formData)

      data.connection = connectionId
      data.source = {
        database_type: connectionType,
        name: connectionName,
      }
      formatData(data)
      emit('save', data)
      isEdit.value = false
    } finally {
      loading.value = false
      emit('update:loading', false)
    }
  }
}

const edit = () => {
  form.value.status = 'pending'
  isEdit.value = true
  initialFormData = cloneDeep(form.value)
  nextTick(() => {
    data.value.fields.forEach((f: any) => {
      const field = allFields.value.find((it: any) => it.id === f.id)
      if (field) {
        fieldTable.value?.toggleRowSelection(field)
      } else {
        console.log('field not found', f.field_name, f)
      }
    })
  })
}

// Watch effects
watch(visible, (v) => {
  if (!v) {
    intervalId.value && clearTimeout(intervalId.value)
  }
})

// Event handlers
const tabChanged = (tab: string) => {
  if (tab === 'debug') {
    isEdit.value = false
    const newDebugParams: Record<string, any> = {}
    data.value.params?.forEach((p: any) => {
      newDebugParams[p.name] = p.defaultvalue || ''
    })
    debugParams.value = newDebugParams
    getWorkers()
  } else {
    clearTimeout(intervalId.value)
  }
}

const apiTypeChanged = () => {
  form.value.params = getDefaultParams(form.value.apiType)
}

const connectionTypeChanged = () => {
  getConnectionOptions()
  form.value.connectionName = ''
  form.value.tableName = ''
  form.value.fields = []
  allFields.value = []
  form_ref.value?.clearValidate('connectionType')
}

const connectionNameChanged = () => {
  // 选择连接名时自动填充连接类型
  const connection = connectionOptions.value?.find(
    (it) => it.name === form.value.connectionName,
  )
  if (connection) {
    form.value.connectionType = connection.type
    form.value.connectionId = connection.id
    form.value.tableName = ''
    form.value.fields = []
    allFields.value = []
    getTableOptions(connection.id)
    form_ref.value?.clearValidate('connectionId')
  }
}

const tableChanged = () => {
  form.value.fields = []
  allFields.value = []
  getFields()
  form_ref.value?.clearValidate('tableName')
}

const fieldsChanged = (val: any[]) => {
  form.value.fields = val
}

const addItem = (key: 'params' | 'where' | 'sort') => {
  const map = {
    params: { name: '', type: 'string', description: '', defaultvalue: '' },
    where: {
      fieldName: '',
      parameter: '',
      operator: '>',
      condition: 'and',
    },
    sort: { fieldName: '', type: 'asc' },
  }
  if (key === 'where') {
    const list = form.value.where
    const lastItem = list.at(-1)
    if (list.length && lastItem.condition === 'null') {
      lastItem.condition = 'and'
    }
  }
  form.value[key].push(cloneDeep(map[key]))
}

const removeItem = (key: 'params' | 'where' | 'sort', index: number) => {
  form.value[key].splice(index, 1)
}

const debugDisabled = computed(() => {
  return workerStatus.value !== 'running'
})

const debugData = async () => {
  const http = axios.create()
  let params = debugParams.value
  const method = debugMethod.value
  if (method === 'TOKEN') {
    debugResult.value = JSON.stringify(
      {
        access_token: token.value,
        expires_in: 1209599,
        scope: 'admin',
        token_type: 'Bearer',
      },
      null,
      2,
    )
  } else {
    const url = `${urlsMap.value[debugMethod.value]}?access_token=${token.value}`
    if (params) {
      const newParams: Record<string, any> = {}
      Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value) {
          newParams[key] = value
        }
      })
      params = method === 'GET' ? { params: newParams } : newParams
    }
    try {
      const result = await http[method.toLowerCase()](url, params)
      debugResult.value = JSON.stringify(result?.data, null, 2)
    } catch (error: any) {
      const result = error?.response?.data
      debugResult.value = result ? JSON.stringify(result, null, 2) : ''
    }
  }
}

const getWorkers = () => {
  const where = {
    worker_type: 'api-server',
    ping_time: {
      gte: '$serverDate',
      gte_offset: 30000,
    },
  }
  const filter = {
    order: 'ping_time DESC',
    limit: 1,
    fields: {
      worker_status: true,
    },
    where,
  }
  workerApi
    .get({
      filter: JSON.stringify(filter),
    })
    .then((data) => {
      if (data?.items?.length) {
        const record = data.items[0] || {}
        const worker = record.workerStatus || record.worker_status || {}
        workerStatus.value = worker.status
      } else {
        workerStatus.value = 'stop'
      }
    })
    .finally(() => {
      intervalId.value = setTimeout(getWorkers, 2000)
    })
}

// Expose key methods
defineExpose({
  open,
  save,
  edit,
})

// Add event handlers
const handleChangePermissionsAndSave = async () => {
  if (isEdit.value) return
  const valid = await form_ref.value?.validate()
  if (!valid) return

  const {
    id,
    apiType,
    params,
    where,
    sort,
    fields,
    method,
    path,
    acl,
    appLabel,
    appValue,
  } = form.value

  const formData = {
    id,
    listtags: [
      {
        id: appValue,
        value: appLabel,
      },
    ],
    paths: [
      {
        name: apiType === 'customerQuery' ? 'customerQuery' : 'findPage',
        result: 'Page<Document>',
        type: apiType === 'customerQuery' ? 'customerQuery' : 'preset',
        acl,
        method,
        params,
        where,
        sort,
        fields,
        path,
      },
    ],
  }

  await updateApiModule(formData)
  ElMessage.success(i18n.t('public_message_operation_success'))
}

const handleUpdateRole = async () => {
  if (!data.value.id) return

  await updateApiModulePermissions({
    moduleId: data.value.id,
    acl: form.value.acl,
  })
  emit('update')
  ElMessage.success(i18n.t('public_message_operation_success'))
}

const handleUpdateApp = async () => {
  if (!data.value.id) return

  const { appLabel, appValue } = form.value
  await updateApiModuleTags({
    moduleId: data.value.id,
    listtags: [
      {
        id: appValue,
        value: appLabel,
      },
    ],
  })

  emit('update')
  ElMessage.success(i18n.t('public_message_operation_success'))
}

// Add after the watch effects
onMounted(() => {
  getRoles()
})

const getRoles = async () => {
  const filter = {
    limit: 500,
    skip: 0,
  }
  const data = await roleApi.get({
    filter: JSON.stringify(filter),
  })
  roles.value = data?.items || []
}

const loadAllFields = async () => {
  const filter = {
    where: {
      'source.id': form.value.connectionId,
      original_name: form.value.tableName,
      is_deleted: false,
      sourceType: 'SOURCE',
    },
  }
  const data = await metadataInstancesApi.get({
    filter: JSON.stringify(filter),
  })
  allFields.value =
    data?.items?.[0]?.fields?.map((it: any) => ({
      ...it,
      id: it.id,
      field_name: it.field_name,
      originalDataType: it.data_type,
      comment: '',
    })) || []
}

const handleBeforeClose = async (done: () => void) => {
  if (isEdit.value) {
    const hasChanges = Object.keys(form.value).some((key) => {
      if (['status', 'path'].includes(key)) {
        return false
      }
      return !isEqual(initialFormData[key], form.value[key])
    })

    if (hasChanges) {
      const isConfirm = await Modal.confirm(i18n.t('public_current_is_editing'))

      isConfirm && done()
    } else {
      done()
    }
  } else {
    done()
  }
}

const openEdit = () => {
  isEdit.value = true
  nextTick(() => {
    handleFieldsSelection()
  })
}
</script>

<template>
  <component
    :is="tag"
    v-model="visible"
    v-loading="loading"
    :title="$t('packages_business_data_server_drawer_fuwuxiangqing')"
    body-class="pt-0"
    class="overflow-hidden"
    width="850px"
    :before-close="handleBeforeClose"
    @visible="$emit('visible', $event)"
  >
    <template #header="{ titleClass }">
      <div :class="titleClass" class="flex align-center gap-3">
        <span>{{
          $t('packages_business_data_server_drawer_fuwuxiangqing')
        }}</span>
        <el-button
          text
          type="primary"
          :class="{
            invisible: !(tab === 'form' && data.status !== 'active' && !isEdit),
          }"
          @click="edit"
        >
          <el-icon class="mr-1">
            <EditPen />
          </el-icon>
          {{ $t('public_button_edit') }}
        </el-button>
      </div>
    </template>

    <div class="flex flex-column">
      <!-- 顶部 标题 Tab -->
      <div
        v-if="!inDialog"
        class="flex position-sticky top-0 bg-white z-10"
        style="line-height: 48px"
      >
        <ElTabs
          v-if="!readonly"
          ref="tabs"
          v-model="tab"
          class="data-server__tabs flex-1"
          @tab-change="tabChanged"
        >
          <ElTabPane
            :label="$t('packages_business_data_server_drawer_peizhi')"
            name="form"
          />
          <ElTabPane
            v-if="data.status === 'active'"
            :label="$t('packages_business_data_server_drawer_tiaoshi')"
            name="debug"
          />
        </ElTabs>
      </div>

      <ElForm
        ref="form_ref"
        hide-required-asterisk
        class="data-server__form overflow-auto flex-1"
        label-position="top"
        :model="form"
        :rules="rules"
      >
        <template v-if="!inDialog">
          <div class="flex justify-content-between align-items-start">
            <ElFormItem
              class="flex-1 form-item-name"
              prop="name"
              :label="$t('daas_data_server_list_fuwumingcheng')"
            >
              <ElInput
                v-model="form.name"
                :disabled="!isEdit"
                maxlength="50"
                :placeholder="
                  $t('public_input_placeholder') +
                  $t('daas_data_server_list_fuwumingcheng')
                "
              />
              <!-- <div v-else class="fw-sub fs-7 font-color-normal">
                {{ data.name }}
              </div> -->
            </ElFormItem>
            <!-- <template v-if="tab === 'form' && data.status !== 'active'">
              <div v-if="isEdit" class="ml-4">
                <ElButton v-if="data.id" @click="isEdit = false">{{
                  $t('public_button_cancel')
                }}</ElButton>
                <ElButton type="primary" @click="save()">{{
                  $t('public_button_save')
                }}</ElButton>
              </div>
              <ElButton v-else class="ml-4" type="primary" @click="edit">{{
                $t('public_button_edit')
              }}</ElButton>
            </template> -->
          </div>
          <div class="flex-1 mt-3 mb-3">
            <ElFormItem
              class="flex-1 form-item-name"
              prop="name"
              :label="$t('public_description')"
            >
              <ElInput
                v-model="form.description"
                type="textarea"
                :placeholder="
                  $t('public_input_placeholder') + $t('public_description')
                "
                :disabled="!isEdit"
              />
            </ElFormItem>
          </div>
          <div class="flex gap-4">
            <ElFormItem
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_quanxianfanwei')"
              prop="acl"
            >
              <ElSelect
                v-model="form.acl"
                multiple
                class="w-100"
                :disabled="readonly"
                @change="handleUpdateRole"
              >
                <ElOption
                  v-for="item in roles"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem
              v-if="tag !== 'div'"
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_suoshuyingyong')"
              prop="appValue"
            >
              <ListSelect
                v-model:value="form.appValue"
                v-model:label="form.appLabel"
                :disabled="disableApp || readonly"
                class="w-100"
                @change="handleUpdateApp"
              />
            </ElFormItem>
          </div>
        </template>
        <template v-else>
          <div class="flex gap-4">
            <ElFormItem
              :label="$t('public_name')"
              class="flex-1 form-item-name"
              prop="name"
            >
              <ElInput
                v-if="isEdit"
                v-model="form.name"
                :placeholder="$t('public_input_placeholder_name')"
              />
              <div v-else class="fw-sub fs-7 font-color-normal">
                {{ data.name }}
              </div>
            </ElFormItem>
            <ElFormItem
              class="flex-1"
              :label="$t('packages_business_quanxianfanwei')"
              prop="acl"
            >
              <ElSelect
                v-model="form.acl"
                multiple
                :disabled="!isEdit"
                class="w-100"
                @change="handleUpdateRole"
              >
                <ElOption
                  v-for="item in roles"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              v-if="!params.to"
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_suoshuyingyong')"
              prop="appValue"
            >
              <ListSelect
                v-model:value="form.appValue"
                v-model:label="form.appLabel"
                @change="handleUpdateApp"
              />
            </ElFormItem>
          </div>
          <ElFormItem
            :label="$t('public_description')"
            class="flex-1 form-item-name"
            prop="description"
          >
            <ElInput
              v-model="form.description"
              type="textarea"
              :placeholder="$t('function_describe_placeholder')"
              :disabled="!isEdit"
            />
          </ElFormItem>
        </template>

        <!-- 基础信息 -->
        <ul
          v-if="tab === 'form'"
          class="flex flex-wrap bg-subtle p-2 rounded-lg"
        >
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_caozuoleixing')"
              label-width="86px"
            >
              <div class="text">{{ $t('public_button_inquire') }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_fabujiedian')"
              label-width="86px"
            >
              <div class="text">{{ $t('public_select_option_all') }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_jiekouleixing')"
              label-width="86px"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.apiType"
                class="w-100"
                @change="apiTypeChanged"
              >
                <ElOption
                  v-for="(label, value) in apiTypeMap"
                  :key="value"
                  :value="value"
                  :label="label"
                />
              </ElSelect>
              <div v-else class="text">{{ apiTypeMap[data.apiType] }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('public_connection_type')"
              label-width="86px"
              prop="connectionType"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionType"
                class="w-100"
                filterable
                :loading="!databaseTypes"
                @change="connectionTypeChanged"
              >
                <ElOption
                  v-for="item in databaseTypes"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </ElSelect>
              <div v-else class="text">{{ data.connectionType }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('public_connection_name')"
              label-width="86px"
              prop="connectionId"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionName"
                class="w-100"
                filterable
                :loading="!connectionOptions"
                @change="connectionNameChanged"
              >
                <ElOption
                  v-for="item in connectionOptions"
                  :key="item.id"
                  :value="item.name"
                  :label="item.name"
                />
              </ElSelect>
              <div v-else class="text">{{ data.connectionName }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('object_list_name')"
              label-width="86px"
              prop="tableName"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.tableName"
                class="w-100"
                filterable
                :loading="!tableOptions"
                @change="tableChanged"
              >
                <ElOption
                  v-for="item in tableOptions"
                  :key="item.tableName"
                  :value="item.tableName"
                >
                  <span>{{ item.tableName }}</span>
                  <span v-if="item.tableComment" class="font-color-sslight">{{
                    `(${item.tableComment})`
                  }}</span>
                </ElOption>
              </ElSelect>
              <div v-else class="text">{{ data.tableName }}</div>
            </ElFormItem>
          </li>
        </ul>
        <template v-if="tab === 'form'">
          <!-- 访问路径设置-->
          <section v-if="isEdit">
            <div class="fs-7 data-server-panel__title mt-4 mb-3">
              {{ $t('packages_business_data_server_drawer_aPI_path_Settings') }}
            </div>

            <div class="flex gap-4">
              <ElFormItem
                class="flex-1"
                :label="$t('public_version')"
                prop="apiVersion"
                :rules="rules.apiVersion"
              >
                <ElInput v-model="form.apiVersion" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                class="flex-1"
                :label="$t('packages_business_data_server_drawer_prefix')"
                prop="prefix"
              >
                <ElInput v-model="form.prefix" :disabled="!isEdit" />
              </ElFormItem>
            </div>
            <div class="flex gap-4">
              <ElFormItem
                class="flex-1"
                :label="$t('packages_business_data_server_drawer_base_path')"
                prop="basePath"
              >
                <ElInput v-model="form.basePath" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem class="flex-1" prop="limit">
                <template #label>
                  <el-text>
                    <span>{{
                      $t('packages_business_request_speed_limit')
                    }}</span>
                    <el-tooltip
                      :content="$t('packages_business_request_speed_limit_tip')"
                      placement="top"
                      ><el-icon color="#909399" class="ml-1"
                        ><InfoFilled
                      /></el-icon>
                    </el-tooltip>
                  </el-text>
                </template>
                <el-input-number
                  v-model="form.limit"
                  :min="0"
                  :disabled="!isEdit"
                  :controls="false"
                />
              </ElFormItem>
            </div>
          </section>
          <!--服务访问 -->
          <div
            class="data-server-panel__title mt-4 mb-3 justify-content-start gap-2"
          >
            <span>{{ $t('packages_business_fuwufangwen') }}</span>

            <el-tag v-if="form.limit" type="warning">
              {{
                $t('packages_business_request_speed_limit_tag', {
                  val: form.limit,
                })
              }}
            </el-tag>
          </div>
          <ul class="data-server-path flex flex-column gap-2">
            <li
              v-for="item in urlList"
              :key="item.method"
              class="data-server-path__item bg-subtle rounded-4 pl-1 py-1"
            >
              <div
                class="data-server-path__method rounded-4 mr-4"
                :class="`method--${item.method}`"
              >
                {{ item.method }}
              </div>
              <div class="data-server-path__value line-height">
                {{ item.url }}
              </div>
            </li>
          </ul>
        </template>

        <!-- 輸入参数 -->
        <div class="data-server-panel__title mt-4 mb-3">
          <div class="flex align-items-center">
            <span>{{
              $t('packages_business_data_server_drawer_shurucanshu')
            }}</span>
            <el-button
              v-if="isEdit && form.apiType === 'customerQuery'"
              text
              size="small"
              type="primary"
              class="ml-1"
              @click="addItem('params')"
            >
              <template #icon>
                <el-icon-circle-plus />
              </template>
            </el-button>
          </div>
        </div>
        <ElTable class="flex-1" :data="isEdit ? form.params : data.params">
          <ElTableColumn
            :label="$t('packages_business_data_server_drawer_canshumingcheng')"
            prop="name"
            min-width="120"
          >
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
              >
                <ElFormItem
                  :prop="`params.${$index}.name`"
                  :error="!form.params[$index].name ? 'true' : ''"
                  :show-message="false"
                  :rules="rules.param"
                  class="mb-0"
                >
                  <ElInput v-model="form.params[$index].name" />
                </ElFormItem>
              </div>
              <div v-else>{{ row.name }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('public_type')" prop="type">
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
                min-width="60"
              >
                <ElSelect v-model="form.params[$index].type">
                  <ElOption
                    v-for="type in typeOptions"
                    :key="type"
                    :value="type"
                    :label="type"
                  />
                </ElSelect>
              </div>
              <div v-else>{{ row.type }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="tab === 'form'"
            :label="$t('public_data_default')"
            prop="defaultvalue"
            min-width="60"
          >
            <template #default="{ row, $index }">
              <div v-if="isEdit && row.defaultvalue !== undefined">
                <ElInput v-model="form.params[$index].defaultvalue" />
              </div>
              <div v-else>{{ row.defaultvalue }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('public_description')"
            prop="description"
            min-width="100"
          >
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
              >
                <ElInput v-model="form.params[$index].description" />
              </div>
              <div v-else>{{ row.description }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="debugParams"
            :label="$t('packages_business_data_server_drawer_canshuzhi')"
            min-width="100"
          >
            <template #default="{ row }">
              <ElInputNumber
                v-if="row.type === 'number'"
                v-model="debugParams[row.name]"
                :precision="0"
                :step="1"
                :min="0"
              />
              <ElInput v-else v-model="debugParams[row.name]" />
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="isEdit && form.apiType === 'customerQuery'"
            align="center"
            width="60"
          >
            <template #default="{ $index }">
              <el-button
                v-if="$index > 1"
                text
                size="small"
                @click="removeItem('params', $index)"
              >
                <template #icon>
                  <el-icon>
                    <el-icon-remove />
                  </el-icon>
                </template>
              </el-button>
            </template>
          </ElTableColumn>
        </ElTable>

        <template
          v-if="
            data.apiType === 'customerQuery' || form.apiType === 'customerQuery'
          "
        >
          <!-- 筛选条件 -->
          <div class="data-server-panel__title mt-4 mb-3">
            <div class="flex align-items-center">
              <span>{{
                $t('packages_business_data_server_drawer_shaixuantiaojian')
              }}</span>
              <el-button
                v-if="isEdit"
                text
                size="small"
                type="primary"
                class="ml-1"
                @click="addItem('where')"
              >
                <template #icon>
                  <el-icon-circle-plus />
                </template>
              </el-button>
            </div>
          </div>
          <ul v-if="isEdit" class="flex flex-column gap-2">
            <li
              v-for="(item, index) in form.where"
              :key="index"
              class="flex align-items-center"
            >
              <ElSelect v-model="form.where[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].operator" class="mr-4">
                <ElOption
                  v-for="item in operatorOptions"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].parameter" class="mr-4">
                <ElOption
                  v-for="opt in parameterOptions"
                  :key="opt.name"
                  :value="opt.name"
                  :label="opt.name"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].condition" class="mr-4">
                <template v-for="item in conditionOptions">
                  <ElOption
                    v-if="item !== 'null' || index === form.where.length - 1"
                    :value="item"
                    :label="item"
                  />
                </template>
              </ElSelect>

              <el-button
                text
                size="small"
                class="flex-shrink-0"
                @click="removeItem('where', index)"
              >
                <template #icon>
                  <el-icon-remove />
                </template>
              </el-button>
            </li>
          </ul>
          <ul v-else class="flex flex-column gap-2">
            <li
              v-for="(item, index) in data.where"
              :key="index"
              class="flex align-items-center"
            >
              <span class="mr-4">{{ item.fieldName }}</span>
              <span class="mr-4">{{ item.operator }}</span>
              <span class="mr-4">{{ item.parameter }}</span>
              <span>{{ item.condition }}</span>
            </li>
          </ul>

          <!-- 排列条件 -->
          <div class="data-server-panel__title mt-4 mb-3">
            <div class="flex align-items-center">
              <span>{{
                $t('packages_business_data_server_drawer_pailietiaojian')
              }}</span>
              <el-button
                v-if="isEdit"
                text
                size="small"
                type="primary"
                class="ml-1"
                @click="addItem('sort')"
              >
                <template #icon>
                  <el-icon-circle-plus />
                </template>
              </el-button>
            </div>
          </div>
          <ul v-if="isEdit" class="flex flex-column gap-2">
            <li
              v-for="(item, index) in form.sort"
              :key="index"
              class="flex align-items-center"
            >
              <ElSelect v-model="form.sort[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                />
              </ElSelect>
              <ElSelect v-model="form.sort[index].type" class="mr-4">
                <ElOption value="asc" label="ASC" />
                <ElOption value="desc" label="DESC" />
              </ElSelect>
              <el-button
                class="flex-shrink-0"
                text
                size="small"
                @click="removeItem('sort', index)"
              >
                <template #icon>
                  <el-icon-remove />
                </template>
              </el-button>
            </li>
          </ul>
          <ul v-else class="flex flex-column gap-2">
            <li
              v-for="(item, index) in data.sort"
              :key="index"
              class="flex align-items-center"
            >
              <span class="mr-4">{{ item.fieldName }}</span>
              <span>{{ item.type }}</span>
            </li>
          </ul>
        </template>

        <!-- 输出结果 -->
        <template v-if="tab === 'form'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_shuchujieguo') }}
          </div>
          <ElTable
            ref="fieldTable"
            :data="isEdit ? allFields : data.fields"
            :loading="fieldLoading"
            @selection-change="fieldsChanged"
          >
            <ElTableColumn
              v-if="isEdit"
              type="selection"
              width="32"
              align="center"
            />
            <ElTableColumn
              :label="$t('public_name')"
              prop="field_name"
              min-width="150"
            />
            <ElTableColumn
              :label="$t('public_type')"
              prop="originalDataType"
              min-width="100"
            />
            <ElTableColumn
              :label="$t('public_description')"
              prop="comment"
              min-width="150"
            />
          </ElTable>
        </template>

        <!-- {{$t('packages_business_data_server_drawer_diaoyongfangshi')}} -->
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_diaoyongfangshi') }}
          </div>
          <div class="flex gap-4">
            <el-input :model-value="urlsMap[debugMethod]" readonly>
              <template #prepend>
                <ElSelect v-model="debugMethod" style="width: 100px">
                  <ElOption
                    v-for="(item, i) in urlList"
                    :key="i"
                    :value="item.method"
                  />
                </ElSelect>
              </template>
            </el-input>

            <ElButton
              type="primary"
              :disabled="debugDisabled"
              @click="debugData"
              >{{ $t('public_button_submit') }}
            </ElButton>
          </div>
        </template>
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_fanhuijieguo') }}
          </div>
          <VCodeEditor
            class="rounded-lg"
            height="280"
            lang="json"
            :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
            :value="debugResult"
          />
        </template>

        <!--  {{$t('packages_business_data_server_drawer_shilidaima2')}} -->
        <template v-if="tab === 'debug'">
          <div class="position-relative mt-4 mb-3">
            <div
              class="fs-7 fw-sub font-color-dark flex align-center"
              style="line-height: 36px; height: 36px"
            >
              <span class="data-server-panel__title my-0">
                {{ $t('packages_business_data_server_drawer_shilidaima') }}
              </span>
            </div>
            <ElTabs v-model="templateType" class="data-server__tabs flex-1">
              <ElTabPane label="JAVA" name="java" />
              <ElTabPane label="JS" name="javascript" />
              <ElTabPane label="PYTHON" name="python" />
            </ElTabs>
          </div>
          <VCodeEditor
            class="rounded-lg"
            height="280"
            :lang="templateType"
            :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
            :value="templates[templateType]"
          />
        </template>
      </ElForm>
    </div>

    <template v-if="isEdit" #footer>
      <ElButton v-if="data.id" @click="isEdit = false">{{
        $t('public_button_cancel')
      }}</ElButton>
      <ElButton type="primary" @click="save()">{{
        $t('public_button_save')
      }}</ElButton>
    </template>
  </component>
</template>

<style lang="scss" scoped>
.icon-button {
  font-size: 15px;
  cursor: pointer;
}

.el-icon-remove {
  color: var(--icon-n2);
}

.line-height {
  line-height: 22px;
}

.data-server__tabs {
  // --el-tabs-header-height: 48px;
  // :deep(.el-tabs__header.is-top) {
  //   margin: 0;
  // }
}

.data-server__form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
    .el-form-item__content {
      .el-select {
        width: 100%;
      }
    }
  }

  :deep(.el-form-item__label) {
    padding-bottom: 0;
  }
}

.data-server-form-base__item {
  padding: 4px 8px;
  width: 30%;

  .text {
    font-size: 12px;
    word-break: break-word;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.data-server-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 16px;
  height: 22px;
  line-height: 22px;
  font-weight: 500;
  font-size: 14px;
  color: var(--text-dark);
  user-select: none;

  position: relative;
  padding-left: 12px;
  $bar-width: 3px;

  &::before {
    content: '';
    width: $bar-width;
    height: 1.2em;
    border-radius: calc($bar-width / 2);
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    background-color: var(--color-primary);
    //background-color: #bcbfc3;
  }
}

.data-server-path__item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-family:
    PingFangSC-Regular,
    PingFang SC;
}

.data-server-path__method {
  margin-right: 40px;
  width: 62px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 2px;
  color: var(--text-white);

  &.method--POST {
    background: #478c6c;
  }

  &.method--GET {
    background: #09819c;
  }

  &.method--TOKEN {
    background: #f2994b;
  }
}

.data-server-debug__url {
  border: 1px solid var(--border-form);
  background: var(--bg-form);
  border-radius: 4px;
}

.data-server__form {
  :deep(.form-item-name) {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}

.data-server-debug__method {
  :deep(.el-input__inner) {
    border: none;
    background: transparent;
  }
}
</style>
