<script setup lang="ts">
import { EditPen, InfoFilled } from '@element-plus/icons-vue'
import {
  createApiModule,
  fetchApiServerToken,
  fetchConnections,
  fetchDatabaseTypes,
  metadataInstancesApi,
  roleApi,
  updateApiModule,
  updateApiModulePermissions,
  updateApiModuleTags,
  workerApi,
} from '@tap/api'
import SortConditionDisplay from '@tap/component/src/api-server/SortConditionDisplay.vue'
import WhereConditionDisplay from '@tap/component/src/api-server/WhereConditionDisplay.vue'
import Highlight from '@tap/component/src/base/Highlight'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import Drawer from '@tap/component/src/Drawer.vue'
import { EditOutlined } from '@tap/component/src/icon'
import { Modal } from '@tap/component/src/modal'
import InfiniteSelect from '@tap/form/src/components/infinite-select/InfiniteSelect.vue'

import { useI18n } from '@tap/i18n'
import { uid } from '@tap/shared'
import axios from 'axios'
import { cloneDeep, isEmpty, isEqual, merge } from 'lodash-es'
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  watch,
  type Component,
} from 'vue'
import { DatabaseIcon } from '../../components/DatabaseIcon'
import MqlHelpDialog from '../../components/MqlHelpDialog.vue'
import ListSelect from '../api-application/ListSelect.vue'
import MqlEditor from './MqlEditor.vue'
import getTemplate from './template'

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

const { t } = useI18n()

// Constants
const isHa = import.meta.env.MODE === 'ha'
const typeOptions = ['number', 'string', 'boolean', 'date', 'datetime', 'time']
const operatorOptions = ['>', '==', '<', '>=', '<=', '!=', 'like']
const conditionOptions = ['and', 'or']
const apiTypeMap = {
  defaultApi: t('packages_business_data_server_drawer_morenchaxun'),
  customerQuery: t('packages_business_data_server_drawer_zidingyichaxun'),
}
const apiTypeOptions = [
  {
    label: t('packages_business_data_server_drawer_morenchaxun'),
    value: 'defaultApi',
  },
  {
    label: t('packages_business_data_server_drawer_zidingyichaxun'),
    value: 'customerQuery',
  },
]

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

const getDefaultParams = (apiType: string) => {
  const params = [
    {
      name: 'page',
      type: 'number',
      defaultvalue: '1',
      description: t('packages_business_data_server_drawer_fenyebianhao'),
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      defaultvalue: '20',
      description: t('packages_business_data_server_drawer_meigefenyefan'),
      required: true,
    },
  ]
  if (apiType === 'defaultApi') {
    params.push({
      name: 'filter',
      type: 'object',
      defaultvalue: '',
      description: t('public_data_filter_condition'),
      required: false,
    })
  }
  return params
}

const getInitData = () => {
  return {
    id: undefined,
    apiType: 'defaultApi',
    pathAccessMethod: 'customize',
    apiVersion: 'v1',
    prefix: '',
    basePath: uid(11, 'a'),
    acl: ['admin'],
    appValue: '',
    appLabel: '',
    limit: 0,
    pathSetting: [],
    connectionType: '',
    connectionId: '',
    tableName: '',

    // paths
    fields: [],
    fullCustomQuery: false,
    where: [],
    sort: [],
    params: getDefaultParams('defaultApi'),
    customWhere: '',
  }
}

// Refs
const form = ref<any>(getInitData())

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
const tempFields = ref<Field[]>([])
const fieldLoading = ref(false)
const databaseTypes = ref<any[] | null>(null)
const templates = ref<Record<string, string>>({})
const mqlEditor = ref<any>(null)
const containerRef = ref<HTMLElement | null>(null)
const paramsTableRef = ref<InstanceType<typeof ElTable>>()
const parameterSelectRef = ref<InstanceType<typeof ElSelect>[]>([])
const helpVisible = ref(false)

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
    callback(t('packages_business_data_server_drawer_geshicuowu'))
  }
}

const validateBasePath = (rule: any, value: string, callback: Function) => {
  if (!value || PATH_PATTERN.test(value)) {
    callback()
  } else {
    callback(t('packages_business_data_server_drawer_validate'))
  }
}

const validatePrefix = (rule: any, value: string, callback: Function) => {
  if (PATH_PATTERN.test(value) || value === '') {
    callback()
  } else {
    callback(t('packages_business_data_server_drawer_validate'))
  }
}

const rules = {
  name: [
    {
      required: true,
      message: t('packages_business_data_server_drawer_qingshurufuwu'),
      trigger: 'blur',
    },
  ],
  acl: [
    {
      required: true,
      message: t('packages_business_data_server_drawer_selectPermissions'),
      trigger: 'change',
    },
  ],
  connectionType: [
    {
      required: true,
      message: t('packages_business_data_server_drawer_qingxuanzelianjie'),
      trigger: 'change',
    },
  ],
  connectionId: [
    {
      required: true,
      message: t('public_input_placeholder') + t('public_connection'),
      trigger: 'change',
    },
  ],
  tableName: [
    {
      required: true,
      message: t('packages_business_data_server_drawer_qingxuanzeduixiang'),
      trigger: 'change',
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
        t('public_input_placeholder') +
        t('packages_business_data_server_drawer_base_path'),
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
      message: t('packages_business_data_server_drawer_qingxuanzesuoshu'),
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
  const setting = form.value.pathSetting ? form.value.pathSetting : []
  const settingMapping = {}
  //@ts-ignore
  setting.forEach((item) => {
    //@ts-ignore
    settingMapping[item.type] = {
      method: item.method,
      url: baseUrl + (!item.path?.startsWith('/') ? '/' : ''),
      last: item.path,
      canEdit: true,
      type: item.type,
    }
  })
  return [
    //@ts-ignore
    settingMapping.DEFAULT_POST || {
      method: 'POST',
      url: `${baseUrl}/`,
      last: `find`,
      canEdit: true,
      type: 'DEFAULT_POST',
    },
    //@ts-ignore
    settingMapping.DEFAULT_GET || {
      method: 'GET',
      url: String(baseUrl),
      last: ``,
      canEdit: true,
      type: 'DEFAULT_GET',
    },
    {
      method: 'TOKEN',
      url: `${location.origin + location.pathname}oauth/token`,
      last: ``,
      canEdit: false,
    },
  ]
})

const urlsMap = computed(() => {
  return urlList.value.reduce((acc: Record<string, string>, item) => {
    acc[item.method] = item.url + (item.last || '')
    return acc
  }, {})
})

const genFormData = (formData: any = {}): Record<string, any> => {
  const apiType =
    formData.apiType === 'customerApi'
      ? 'customerQuery'
      : formData.apiType || 'defaultApi'
  const pathConfig = formData?.paths?.[0] || {}
  const params =
    pathConfig.params?.filter((t: any) => t.name !== 'sort') ||
    getDefaultParams(formData.apiType)

  const {
    id,
    name,
    status = 'generating',
    description,
    connectionType,
    connectionName,
    connectionId,
    tableName,
    basePath,
    apiVersion,
    prefix,
    pathAccessMethod = 'customize',
    listtags,
    limit = 0,
    pathSetting,
  } = formData

  const {
    fields,
    method = 'GET',
    fullCustomQuery = false,
    customWhere = '',
    where = [],
    sort = [],
    path = '',
    acl = ['admin'],
  } = pathConfig

  const appData = listtags?.[0] || {}
  const appValue =
    apiApplication?.value?.id || formData.appValue || appData.id || ''
  const appLabel =
    apiApplication?.value?.value || formData.appLabel || appData.value || ''

  return {
    id,
    name,
    apiType,
    status,
    description,
    connectionType,
    connectionName,
    connectionId,
    tableName,
    basePath,
    apiVersion,
    prefix,
    pathAccessMethod,

    appValue,
    appLabel,
    limit,
    pathSetting,

    // paths
    method,
    fields,
    fullCustomQuery,
    customWhere,
    where,
    sort,
    path,
    acl,
    params,
  }
}

const formatData = (formData: any = {}) => {
  form.value = genFormData(formData)

  if (form.value.status === 'active') {
    getAPIServerToken((token: string) => {
      templates.value = getTemplate(props.host + form.value.path, token)
    })
  }
}

const fieldTableData = computed(() => {
  return isEdit.value ? allFields.value : form.value.fields
})

const AllowedTypes = [
  'Doris',
  'MongoDB',
  'Mysql',
  'Oracle',
  'PostgreSQL',
  'SQL Server',
  'Tidb',
]

const getDatabaseTypes = async () => {
  const data = await fetchDatabaseTypes().catch(() => {
    return []
  })

  databaseTypes.value =
    data
      .filter((it: any) => AllowedTypes.includes(it.name))
      .map((it: any) => {
        return {
          name: it.name,
          pdkHash: it.pdkHash,
        }
      }) || []
}

const getConnectionOptions = async (filter: any) => {
  const _filter = {
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
            in: AllowedTypes,
          },
      connection_type:
        import.meta.env.VUE_APP_MODE !== 'msa'
          ? {
              in: ['source_and_target', 'target'],
            }
          : undefined,
    },
  }

  const result = await fetchConnections(merge(filter, _filter))

  return {
    items: result.items.map((it: any) => ({
      name: it.name,
      type: it.database_type,
      id: it.id,
    })),
    total: result.total,
  }
}

const handleChangeConnectionType = () => {
  form.value.connectionName = ''
  form.value.connectionId = ''
  form.value.tableName = ''
  form.value.fields = []
  allFields.value = []

  setTimeout(() => {
    form_ref.value?.clearValidate('connectionType')
    form_ref.value?.clearValidate('connectionId')
    form_ref.value?.clearValidate('tableName')
  }, 100)
}

const handleChangeConnection = (connection: any) => {
  form.value.connectionType = connection.type
  form.value.connectionId = connection.id
  form.value.connectionName = connection.name
  form.value.tableName = ''
  form.value.fields = []
  allFields.value = []

  form_ref.value?.clearValidate('connectionType')
  form_ref.value?.clearValidate('connectionId')
  form_ref.value?.clearValidate('tableName')
}

const getTableOptions = async (filter: any) => {
  const { connectionId } = filter
  if (!connectionId) {
    return { items: [], total: 0 }
  }

  const newFilter = merge(filter, {
    fields: {
      original_name: true,
    },
    order: ['original_name ASC'],
    where: {
      meta_type: {
        in: ['collection', 'table', 'view'], //,
      },
      is_deleted: false,
      sourceType: 'SOURCE',
      'source.id': connectionId,
    },
  })

  if (newFilter.where?.name) {
    newFilter.where.original_name = filter.where?.name
    delete newFilter.where.value
  } else {
    newFilter.where.original_name = {
      // regexp: '^[^\\s]+$'
      neq: '',
    }
  }

  const data = await metadataInstancesApi.get({
    filter: JSON.stringify(newFilter),
  })

  return {
    items: data.items.map((it: any) => ({
      name: it.original_name,
      ...it,
    })),
    total: data.total,
  }
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
        field_alias: it.field_alias,
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

const getAPIServerToken = async (callback?: (token: string) => void) => {
  token.value = await fetchApiServerToken()
  callback?.(token.value)
}

// Methods
const open = (formData?: any) => {
  tab.value = 'form'
  visible.value = true
  isEdit.value = false
  debugParams.value = null
  debugMethod.value = 'GET'
  debugResult.value = ''
  allFields.value = []
  workerStatus.value = ''

  if (isEmpty(formData)) {
    form.value = getInitData()
    form_ref.value?.resetFields()

    edit()
  } else {
    formatData(Object.assign(getInitData(), cloneDeep(formData)))

    const { connectionId, tableName } = formData

    if (connectionId && tableName) {
      getFields()
    }

    if (!formData.id) {
      edit()
    }
  }

  getDatabaseTypes()

  nextTick(() => {
    containerRef.value?.parentElement?.scrollTo({ top: 0 })
  })
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
      status,
      connectionType,
      connectionName,
      apiVersion,
      prefix,
      pathAccessMethod,
      appLabel,
      appValue,
      limit,

      // paths
      method,
      fullCustomQuery,
      customWhere,
      path,
      acl,
    } = form.value

    if (fullCustomQuery) {
      const validation = mqlEditor.value?.validateJSON(customWhere)
      if (!validation.isValid) {
        ElMessage.error(
          `${t('public_json_format_error')}: ${validation.error.message}`,
        )
        return
      }
    }

    const params = form.value?.params?.filter((t: any) => t.name)
    const sort = form.value?.sort?.filter((t: any) => t.fieldName)
    const where = form.value?.where?.filter(
      (t: any) => t.fieldName && t.parameter,
    )
    const fields = form.value.fields.filter((f: any) => !!f)

    if (params.some((it: any) => !it.name.trim())) {
      ElMessage.error(t('packages_business_data_server_drawer_qingshurucanshu'))
      return
    }

    loading.value = true
    emit('update:loading', true)

    try {
      const pathSettingList: any[] = []
      urlList.value.forEach((item: any) => {
        if (item.type && item.canEdit) {
          pathSettingList.push({
            type: item.type,
            path: item.last,
            method: item.method,
          })
        }
      })
      const formData: any = {
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
            fields,
            path,
            fullCustomQuery,
            customWhere,
          },
        ],
        pathSetting: pathSettingList,
      }

      if (!type && connectionId && tableName) {
        const fieldList = await getAllFields()

        const map = fields.reduce((acc: any, field: any) => {
          acc[field.id] = field
          return acc
        }, {})

        formData.fields = fieldList.map((f: any) => {
          return {
            ...f,
            field_alias: map[f.id]?.field_alias || '',
          }
        })
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
    form.value.fields?.forEach((f: any) => {
      const field = allFields.value.find((it: any) => it.id === f.id) as any
      if (field) {
        field.field_alias = f.field_alias || ''
        fieldTable.value?.toggleRowSelection(field)
      } else {
        console.log('field not found', f.field_name, f)
      }
    })
  })
}

const handleCancel = () => {
  isEdit.value = false
  form.value = initialFormData
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
    form.value.params?.forEach((p: any) => {
      newDebugParams[p.name] = p.defaultvalue || ''
    })
    debugParams.value = newDebugParams
    getWorkers()
  } else {
    clearTimeout(intervalId.value)
  }
}

const handleChangeApiType = () => {
  form.value.params = getDefaultParams(form.value.apiType)
}

const handleChangeTable = () => {
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
    if (list.length) {
      lastItem.condition = 'and'
    }
  }

  form.value[key].push(cloneDeep(map[key]))
}

const removeItem = (key: 'params' | 'where' | 'sort', index: number) => {
  const removed = form.value[key][index]
  form.value[key].splice(index, 1)
  if (
    'sort' === key &&
    removed.fieldName &&
    removed &&
    !tempFields.value.find((f) => f.field_name === removed.fieldName)
  ) {
    tempFields.value.splice(0, 0, {
      field_name: removed.fieldName,
      id: removed.id,
      data_type: removed.data_type,
    })
  }
}

const handleAddParameter = (index: number) => {
  addItem('params')

  nextTick(() => {
    const input = paramsTableRef.value?.$el.querySelector(
      `tbody tr:nth-child(${form.value.params.length}) td:first-child input`,
    )
    if (input) {
      parameterSelectRef.value?.[index]?.blur()
      nextTick(() => {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth' })
      })
    }
  })
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
  ElMessage.success(t('public_message_operation_success'))
}

const handleUpdateRole = async () => {
  if (!form.value.id) return

  await updateApiModulePermissions({
    moduleId: form.value.id,
    acl: form.value.acl,
  })
  emit('update')
  ElMessage.success(t('public_message_operation_success'))
}

const handleUpdateApp = async () => {
  if (!form.value.id) return

  const { appLabel, appValue } = form.value
  await updateApiModuleTags({
    moduleId: form.value.id,
    listtags: [
      {
        id: appValue,
        value: appLabel,
      },
    ],
  })

  emit('update')
  ElMessage.success(t('public_message_operation_success'))
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

const getAllFields = async () => {
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
  const allFieldsOld = allFields.value
  return (
    data?.items?.[0]?.fields?.map((it: any) => {
      const fItem = allFieldsOld.find((f: any) => f.id === it.id)
      return {
        ...it,
        id: it.id,
        field_name: it.field_name,
        field_alias: it.field_alias || fItem.field_alias || '',
        originalDataType: it.data_type,
        comment: '',
      }
    }) || []
  )
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
      const isConfirm = await Modal.confirm(t('public_current_is_editing'))

      isConfirm && done()
    } else {
      done()
    }
  } else {
    done()
  }
}

/**自定义URL后缀*/
const editingIndex = ref(-1)
const editingValue = ref('')
const editInput = ref<InstanceType<typeof ElInput>[]>([])
const startEdit = (index: number, currentValue: string) => {
  if (!urlList.value[index].canEdit || !isEdit.value) return
  if (editingIndex.value === index) return
  editingIndex.value = index
  editingValue.value = currentValue || ''
  const currentUrl = urlList.value[index].url
  if (!currentUrl.endsWith('/')) {
    urlList.value[index].url = `${currentUrl}/`
  }
  nextTick(() => {
    editInput.value?.[0]?.focus()
    editInput.value?.[0]?.select()
  })
}

const saveEdit = (index: number) => {
  if (editingIndex.value === index) {
    const trimmedValue = editingValue.value.trim()
    if (!trimmedValue) {
      urlList.value[index].url = urlList.value[index].url.replace(/\/$/, '')
      urlList.value[index].last = ''
    } else {
      urlList.value[index].last = trimmedValue.replace(/^\//, '')
    }
    editingIndex.value = -1
    editingValue.value = ''
  }
}

const handleFormat = () => {
  mqlEditor.value?.format()
}

watch(
  allFields,
  (newVal) => {
    tempFields.value = newVal.filter(
      (field) =>
        !form.value?.sort?.some(
          (sortField) => sortField.fieldName === field.field_name,
        ),
    )
  },
  { immediate: true },
)

function onFieldSelected(field: Field) {
  tempFields.value = allFields.value
    .filter(
      (f) =>
        !form.value?.sort?.some(
          (sortField) => sortField.fieldName === f.field_name,
        ),
    )
    .filter((f) => f.field_name !== field.field_name)
}

function openHelp() {
  helpVisible.value = true
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
    header-class="pb-0"
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
            invisible: !(tab === 'form' && form.status !== 'active' && !isEdit),
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

    <div ref="containerRef" class="flex flex-column">
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
          <ElTabPane name="form">
            <template #label>
              <span>{{
                $t('packages_business_data_server_drawer_peizhi')
              }}</span>
            </template>
          </ElTabPane>
          <ElTabPane
            v-if="form.status === 'active'"
            :label="$t('packages_business_data_server_drawer_tiaoshi')"
            name="debug"
          >
            <template #label>
              <span>{{
                $t('packages_business_data_server_drawer_tiaoshi')
              }}</span>
            </template>
          </ElTabPane>
        </ElTabs>
      </div>

      <ElForm
        ref="form_ref"
        hide-required-asterisk
        class="data-server__form overflow-auto flex-1"
        label-position="top"
        scroll-to-error
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
            </ElFormItem>
          </div>
          <div class="flex-1 mt-3 mb-3">
            <ElFormItem
              class="flex-1 form-item-name"
              prop="description"
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
                {{ form.name }}
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

        <div class="fs-7 data-server-panel__title mt-4 mb-3">
          {{ $t('public_data_source') }}
        </div>

        <div class="flex gap-4">
          <ElFormItem
            style="flex: 0.5"
            :label="$t('public_connection_type')"
            prop="connectionType"
          >
            <ElSelect
              v-model="form.connectionType"
              class="w-100"
              filterable
              :disabled="!isEdit"
              :loading="!databaseTypes"
              @change="handleChangeConnectionType"
            >
              <ElOption
                v-for="item in databaseTypes"
                :key="item"
                :value="item.name"
                :label="item.name"
              >
                <div class="flex align-items-center gap-2">
                  <DatabaseIcon :pdk-hash="item.pdkHash" :size="16" />
                  <span>{{ item.name }}</span>
                </div>
              </ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            class="flex-1"
            :label="$t('public_connection_name')"
            prop="connectionId"
          >
            <InfiniteSelect
              v-model="form.connectionId"
              :disabled="!isEdit"
              :method="getConnectionOptions"
              :params="{
                connectionType: form.connectionType,
              }"
              :current-label="form.connectionName"
              lazy
              item-query="name"
              item-value="id"
              item-label="name"
              filterable
              @option-select="handleChangeConnection"
            />
          </ElFormItem>
          <ElFormItem
            class="flex-1"
            :label="$t('public_table_name')"
            prop="tableName"
          >
            <InfiniteSelect
              v-model="form.tableName"
              :disabled="!isEdit"
              :method="getTableOptions"
              :params="{
                connectionId: form.connectionId,
              }"
              item-type="string"
              item-query="name"
              item-value="name"
              item-label="name"
              filterable
              @option-select="handleChangeTable"
            >
              <template #option="{ item }">
                <div class="flex align-items-center gap-2">
                  <span>{{ item.name }}</span>
                  <span v-if="item.comment" class="font-color-sslight">{{
                    `(${item.comment})`
                  }}</span>
                </div>
              </template>
            </InfiniteSelect>
          </ElFormItem>
        </div>

        <template v-if="tab === 'form'">
          <!-- 访问路径设置-->
          <section v-if="isEdit">
            <div class="fs-7 data-server-panel__title mt-4 mb-3">
              {{ $t('packages_business_data_server_drawer_aPI_path_Settings') }}
            </div>

            <div class="flex gap-4">
              <ElFormItem
                style="flex: 0.5"
                :label="$t('public_version')"
                prop="apiVersion"
                :rules="rules.apiVersion"
              >
                <ElInput v-model="form.apiVersion" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                style="flex: 0.5"
                :label="$t('packages_business_data_server_drawer_prefix')"
                prop="prefix"
              >
                <ElInput v-model="form.prefix" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                class="flex-1"
                :label="$t('packages_business_data_server_drawer_base_path')"
                prop="basePath"
              >
                <ElInput v-model="form.basePath" :disabled="!isEdit" />
              </ElFormItem>
            </div>
            <ElFormItem v-if="isHa" class="flex-1" prop="limit">
              <template #label>
                <el-text>
                  <span>{{ $t('packages_business_request_speed_limit') }}</span>
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
          <ul class="data-server-path flex flex-column gap-3 pb-3">
            <li
              v-for="(item, index) in urlList"
              :key="item.method"
              class="data-server-path__item rounded-lg px-2 py-2"
              :class="`method-item-${item.method.toLowerCase()}`"
            >
              <div class="data-server-path__method fs-8 mr-4">
                {{ item.method }}
              </div>
              <div v-if="!isEdit" class="data-server-path__value line-height">
                {{ item.url + item.last }}
              </div>
              <div
                v-else
                class="data-server-path__value line-height flex-1 flex align-items-center"
              >
                <span>{{ item.url }}</span>
                <template v-if="editingIndex === index">
                  <ElInput
                    ref="editInput"
                    v-model="editingValue"
                    size="small"
                    class="ml-1 fs-7"
                    style="width: 160px"
                    :maxlength="20"
                    @blur="saveEdit(index)"
                    @keyup.enter="saveEdit(index)"
                  />
                </template>
                <template v-else>
                  <span
                    :class="{
                      'cursor-pointer': item.canEdit,
                    }"
                    @click="item.canEdit && startEdit(index, item.last)"
                  >
                    {{ item.last || '' }}
                  </span>
                  <el-button
                    v-if="item.canEdit"
                    text
                    size="small"
                    class="ml-1"
                    @click="startEdit(index, item.last)"
                  >
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </el-button>
                </template>
              </div>
            </li>
          </ul>
        </template>

        <!-- 輸入参数 -->
        <div
          class="data-server-panel__title mt-4 mb-3 justify-content-start gap-3"
        >
          <span>{{
            $t('packages_business_data_server_drawer_shurucanshu')
          }}</span>
          <el-segmented
            v-model="form.apiType"
            :options="apiTypeOptions"
            :disabled="!isEdit"
            @change="handleChangeApiType"
          />
        </div>

        <ElTable ref="paramsTableRef" class="flex-1" :data="form.params">
          <ElTableColumn
            :label="$t('packages_business_data_server_drawer_canshumingcheng')"
            prop="name"
            min-width="80"
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
          <ElTableColumn :label="$t('public_type')" prop="type" min-width="80">
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
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
                    <i-mingcute:close-line />
                  </el-icon>
                </template>
              </el-button>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="isEdit && form.apiType === 'customerQuery'" class="mt-2">
          <el-button
            class="w-100 border-dashed"
            size="small"
            @click="addItem('params')"
          >
            <template #icon>
              <i-mingcute:add-line />
            </template>
            {{ $t('public_add_parameter') }}
          </el-button>
        </div>

        <template
          v-if="
            data.apiType === 'customerQuery' || form.apiType === 'customerQuery'
          "
        >
          <!-- 筛选条件 -->
          <div
            class="data-server-panel__title mt-7 mb-3 align-items-center justify-content-start gap-3"
            style="--btn-space: 0"
          >
            <span>{{
              $t('packages_business_data_server_drawer_shaixuantiaojian')
            }}</span>

            <el-segmented
              v-model="form.fullCustomQuery"
              :disabled="!isEdit"
              :options="[
                {
                  label: $t('public_form_mode'),
                  value: false,
                },
                {
                  label: $t('public_json_mode'),
                  value: true,
                },
              ]"
            />

            <div class="flex-1" />

            <el-button
              v-if="form.fullCustomQuery && isEdit"
              text
              @click="handleFormat"
            >
              <el-icon class="mr-1"><i-mingcute:brush-line /></el-icon>
              {{ $t('public_format') }}
            </el-button>
            <el-button v-if="form.fullCustomQuery" text @click="openHelp">
              <el-icon class="mr-1"><i-mingcute:question-line /></el-icon>
              {{ $t('public_button_help') }}
            </el-button>
          </div>
          <template v-if="isEdit">
            <ul v-if="!form.fullCustomQuery" class="flex flex-column gap-2">
              <li
                v-for="(item, index) in form.where"
                :key="index"
                class="flex align-items-center"
              >
                <ElSelect
                  v-model="item.fieldName"
                  class="mr-4"
                  :placeholder="$t('public_select_field')"
                >
                  <ElOption
                    v-for="opt in allFields"
                    :key="opt.id"
                    :value="opt.field_name"
                    :label="opt.field_name"
                  />
                </ElSelect>
                <ElSelect v-model="item.operator" class="mr-4">
                  <ElOption
                    v-for="op in operatorOptions"
                    :key="op"
                    :value="op"
                    :label="op"
                  />
                </ElSelect>
                <ElSelect
                  ref="parameterSelectRef"
                  v-model="item.parameter"
                  class="mr-4"
                  :placeholder="$t('public_select_parameter')"
                >
                  <ElOption
                    v-for="opt in parameterOptions"
                    :key="opt.name"
                    :value="opt.name"
                    :label="opt.name"
                  />
                  <template #empty>
                    <div>
                      <el-empty class="p-0" :image-size="32">
                        <template #description>
                          <el-button
                            size="small"
                            @click="handleAddParameter(index)"
                          >
                            <template #icon>
                              <i-mingcute:add-line />
                            </template>
                            {{ $t('public_add_parameter') }}
                          </el-button>
                        </template>
                      </el-empty>
                    </div>
                  </template>
                </ElSelect>
                <ElSelect v-model="item.condition" class="mr-4">
                  <template v-for="condition in conditionOptions">
                    <ElOption
                      v-if="
                        condition !== 'null' || index === form.where.length - 1
                      "
                      :key="condition"
                      :value="condition"
                      :label="condition"
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
                    <i-mingcute:close-line />
                  </template>
                </el-button>
              </li>
              <li>
                <el-button
                  class="w-100 border-dashed"
                  size="small"
                  @click="addItem('where')"
                >
                  <template #icon>
                    <i-mingcute:add-line />
                  </template>
                  {{ $t('public_add_condition') }}
                </el-button>
              </li>
            </ul>
            <MqlEditor
              v-else
              ref="mqlEditor"
              v-model="form.customWhere"
              :fields="allFields"
              :variables="form.params"
            />
          </template>

          <template v-else>
            <div v-if="form.fullCustomQuery">
              <Highlight
                class="custom-where-pre"
                :code="form.customWhere"
                language="json"
              />
            </div>
            <WhereConditionDisplay v-else :conditions="form.where" />
          </template>

          <!-- 排列条件 -->
          <div class="data-server-panel__title mt-7 mb-3">
            <div class="flex align-items-center">
              <span>{{
                $t('packages_business_data_server_drawer_pailietiaojian')
              }}</span>
            </div>
          </div>
          <ul v-if="isEdit" class="flex flex-column gap-2">
            <li
              v-for="(item, index) in form.sort"
              :key="index"
              class="flex align-items-center gap-4"
            >
              <ElSelect
                v-model="item.fieldName"
                class="flex-1"
                :placeholder="$t('public_select_field')"
              >
                <ElOption
                  v-for="opt in tempFields"
                  :key="opt.id"
                  :selectable="tempFields.length <= 0"
                  :value="opt.field_name"
                  :label="opt.field_name"
                  @click="onFieldSelected(opt)"
                />
              </ElSelect>

              <el-segmented
                v-model="item.type"
                style="flex: 0.5"
                :options="[
                  { label: $t('public_asc'), value: 'asc' },
                  { label: $t('public_desc'), value: 'desc' },
                ]"
              />

              <el-button
                class="flex-shrink-0"
                text
                size="small"
                @click="removeItem('sort', index)"
              >
                <template #icon>
                  <i-mingcute:close-line />
                </template>
              </el-button>
            </li>
            <li>
              <el-button
                class="w-100 border-dashed"
                size="small"
                @click="addItem('sort')"
              >
                <template #icon>
                  <i-mingcute:add-line />
                </template>
                {{ $t('public_add_condition') }}
              </el-button>
            </li>
          </ul>
          <SortConditionDisplay v-else :orders="form.sort" />
        </template>

        <!-- 输出结果 -->
        <template v-if="tab === 'form'">
          <div class="data-server-panel__title mt-7 mb-3">
            {{ $t('packages_business_data_server_drawer_shuchujieguo') }}
          </div>
          <ElTable
            ref="fieldTable"
            :data="fieldTableData"
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
              min-width="100"
            />
            <ElTableColumn
              :label="$t('public_alias')"
              prop="field_alias"
              min-width="120"
            >
              <template #default="{ row }">
                <ElInput v-if="isEdit" v-model="row.field_alias" />
                <span v-else>{{ row.field_alias }}</span>
              </template>
            </ElTableColumn>
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
      <ElButton v-if="form.id" @click="handleCancel">{{
        $t('public_button_cancel')
      }}</ElButton>
      <ElButton
        :disabled="!form.fields.length"
        type="primary"
        @click="save()"
        >{{ $t('public_button_save') }}</ElButton
      >
    </template>

    <MqlHelpDialog v-model="helpVisible" />
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
}

.method-item-post {
  color: oklch(44.8% 0.119 151.328);
  border: 1px solid oklch(92.5% 0.084 155.995);
  background-color: oklch(98.2% 0.018 155.826);

  .data-server-path__method {
    background-color: oklch(62.7% 0.194 149.214);
  }
}

.method-item-get {
  color: oklch(42.4% 0.199 265.638);
  border: 1px solid oklch(88.2% 0.059 254.128);
  background: oklch(97% 0.014 254.604);

  .data-server-path__method {
    background-color: oklch(54.6% 0.245 262.881);
  }
}

.method-item-token {
  color: oklch(47% 0.157 37.304);
  border: 1px solid oklch(90.1% 0.076 70.697);
  background: oklch(98% 0.016 73.684);

  .data-server-path__method {
    background-color: oklch(64.6% 0.222 41.116);
  }
}

.data-server-path__method {
  margin-right: 40px;
  width: 60px;
  line-height: 22px;
  text-align: center;
  border-radius: 6px;
  font-weight: 500;
  color: #fff;
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

.data-server-path__value {
  letter-spacing: 0.1px;
}

.custom-where-pre {
  :deep(.hljs) {
    background: #f8f9fa;
    border-radius: var(--el-border-radius-large);
  }
}
</style>
