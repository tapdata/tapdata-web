<script setup lang="ts">
import { action } from '@formily/reactive'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { GitBook, VCodeEditor } from '@tap/component'
import SwitchNumber from '@tap/component/src/SwitchNumber.vue'
import { AsyncSelect, SchemaForm } from '@tap/form'
import i18n from '@tap/i18n'
import { uuid } from '@tap/shared'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  cloneDeep,
  debounce,
  isEmpty,
  isString,
  merge,
  uniqBy,
} from 'lodash-es'
import {
  computed,
  defineExpose,
  inject,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { CONNECTION_STATUS_MAP } from '../../../shared'
import { inspectMethod as inspectMethodMap } from '../const'
import CollateMap from './CollateMap.vue'
import { DATA_NODE_TYPES, META_INSTANCE_FIELDS, TABLE_PARAMS } from './const'
import DocsDrawer from './DocsDrawer.vue'
import FieldDialog from './FieldDialog'
import FieldSelectWrap from './FieldSelectWrap.vue'

// Types
interface TableParams {
  nodeId?: string
  nodeName?: string
  connectionId?: string
  connectionName?: string
  currentLabel?: string
  databaseType?: string
  table?: string
  sortColumn?: string
  fields?: any[]
  capabilities?: any[]
  enableCustomCollate?: boolean
  collate?: Record<string, string>
  customNullSort?: boolean
  columns?: any[]
}

interface ConditionItem {
  id: string
  source: TableParams
  target: TableParams
  showAdvancedVerification: boolean
  script: string
  webScript: string
  jsEngineName: string
  modeType: 'all' | 'custom'
}

interface Props {
  taskId?: string
  isDB?: boolean
  inspectMethod?: string
  data?: ConditionItem[]
  allStages?: any[]
  edges?: any[]
}

interface Emits {
  (e: 'update:jointErrorMessage', value: string): void
  (e: 'update:errorMessageLevel', value: string): void
  (e: 'update:autoAddTableLoading', value: boolean): void
}

interface ApiResponse<T> {
  items: T[]
  total: number
}

interface TableItem {
  id: string
  name: string
  nameFieldMap: Record<string, any>
  fields: any[]
  sortColumns?: string[]
}

interface ConnectionItem {
  id: string
  name: string
  database_type: string
  connection_type: string
  status: string
  capabilities: any[]
}

interface ConnectionResponse {
  attrs: {
    nodeId: string
    nodeName: string
    connectionId: string
    connectionName: string
    databaseType: string
  }
  name: string
  value: string
  id: string
  label: string
  databaseType: string
}

interface TableFilter {
  where?: {
    name?: {
      like?: string
    }
  }
  size?: number
  page?: number
  connectionId?: string
  nodeId?: string
}

interface TableParams {
  nodeId: string
  fields: any[]
  page: number
  pageSize: number
  tableFilter?: string
}

interface ApiResult<T> {
  data: ApiResponse<T>
}

interface FieldItem {
  id: string
  field_name: string
  primary_key_position: number
  data_type: string
  primaryKey: boolean
  unique: boolean
  type: string
  tapType: string
}

interface NodeSchemaResponse {
  items: {
    fields: FieldItem[]
    name: string
  }[]
  total: number
}

interface StageItem {
  id: string
  name: string
  connectionId: string
  attrs: {
    connectionName: string
    capabilities: any[]
  }
  databaseType: string
}

const formData = inject('formData')

const list = computed(() => formData.tasks)

// Props and Emits
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  allStages: () => [],
  edges: () => [],
})

const emit = defineEmits<Emits>()

// Refs and Reactive State
const showDoc = ref(false)
const docPath = ref('')
// const list = ref<ConditionItem[]>([])
const jointErrorMessage = ref('')
const fieldsMap = reactive<Record<string, any[]>>({})
const capabilitiesMap = reactive<Record<string, any>>({})
const autoAddTableLoading = ref(false)
const dynamicSchemaMap = reactive<Record<string, boolean>>({})
const dialogAddScriptVisible = ref(false)
const formIndex = ref('')
const webScript = ref('')
const jsEngineName = ref('graal.js')
const doc = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const autoSuggestJoinFields = ref(true)
const searchValue = ref('')
const fieldDialog = ref()

// const list = computed(() => {
//   return formData.tasks
// })

const formSchema = {
  type: 'object',
  properties: {
    nameWrap: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        minColumns: 2,
        maxColumns: 2,
        columnGap: 16,
      },
      properties: {
        source: {
          type: 'object',
          'x-component': 'FormGrid.GridColumn',
          properties: {
            databaseType: {
              type: 'string',
              'x-display': 'hidden',
            },
            fields: {
              type: 'array',
              'x-display': 'hidden',
            },
            nodeSchema: {
              type: 'array',
              'x-display': 'hidden',
              'x-reactions': [
                `{{useAsyncDataSource(loadTableFieldList, 'value', $values.source)}}`,
                {
                  target: 'source.conditions.*.key',
                  fulfill: {
                    state: {
                      loading: '{{$self.loading}}',
                      dataSource: '{{$self.value}}',
                    },
                  },
                },
              ],
            },
            enableCustomCommand: {
              title: i18n.t(
                'packages_business_components_conditionbox_laiyuanbiaoshuju',
              ),
              type: 'boolean',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                className: 'item-control-horizontal',
                layout: 'horizontal',
                tooltip: i18n.t(
                  'packages_business_components_conditionbox_enableCustomCommand_tip',
                ),
              },
              'x-component': 'Switch',
              default: false,
              'x-reactions': [
                {
                  fulfill: {
                    state: {
                      visible: `{{$values.source.capabilities && $values.source.capabilities.some(item => item.id === 'execute_command_function')}}`,
                    },
                  },
                },
              ],
            },
            customCommand: {
              type: 'object',
              properties: {
                command: {
                  title: ' ',
                  'x-decorator-props': {
                    colon: false,
                  },
                  type: 'string',
                  default: 'executeQuery',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  enum: [
                    { label: i18n.t('public_query'), value: 'executeQuery' },
                    { label: i18n.t('public_aggregate'), value: 'aggregate' },
                  ],
                  'x-reactions': {
                    dependencies: ['source.databaseType'],
                    fulfill: {
                      state: {
                        display:
                          '{{$deps[0].toLowerCase().includes("mongo")?"visible":"hidden"}}',
                      },
                    },
                  },
                },
                params: {
                  type: 'object',
                  properties: {
                    mongoQuery: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'void',
                      'x-reactions': {
                        dependencies: [
                          'source.customCommand.command',
                          'source.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="executeQuery"}}',
                          },
                        },
                      },
                      properties: {
                        op: {
                          type: 'string',
                          default: 'find',
                        },
                        collection: {
                          type: 'string',
                          'x-reactions': {
                            fulfill: {
                              state: {
                                value: '{{$values.tableName}}',
                              },
                            },
                          },
                        },
                        filter: {
                          title: ' ',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'JsonEditor',
                          'x-component-props': {
                            options: {
                              showPrintMargin: false,
                              useWrapMode: true,
                            },
                          },
                        },
                        descWrap: {
                          type: 'void',
                          title: ' ',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          'x-component': 'div',
                          'x-component-props': {
                            class: 'flex align-center flex-wrap',
                          },
                          properties: {
                            desc: {
                              type: 'void',
                              'x-component': 'div',
                              'x-component-props': {
                                style: {
                                  color: '#909399',
                                },
                              },
                              'x-content': i18n.t(
                                'packages_dag_nodes_table_jinzhichiqu',
                              ),
                            },
                            link: {
                              type: 'void',
                              'x-component': 'Button',
                              'x-component-props': {
                                text: true,
                                type: 'primary',
                                onClick: '{{openApiDrawer}}',
                              },
                              'x-content': i18n.t(
                                'packages_business_view_more_apis',
                              ),
                            },
                          },
                        },
                      },
                    },
                    mongoAgg: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'void',
                      'x-reactions': {
                        dependencies: [
                          'source.customCommand.command',
                          'source.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="aggregate"}}',
                          },
                        },
                      },
                      properties: {
                        collection: {
                          type: 'string',
                          'x-reactions': {
                            dependencies: ['source.tableName'],
                            fulfill: {
                              state: {
                                value: '{{$deps[0]}}',
                              },
                            },
                          },
                        },
                        pipeline: {
                          title: ' ',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'JsonEditor',
                          'x-component-props': {
                            options: {
                              showPrintMargin: false,
                              useWrapMode: true,
                            },
                          },
                        },
                        descWrap: {
                          type: 'void',
                          title: ' ',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          'x-component': 'div',
                          'x-component-props': {
                            class: 'flex align-center flex-wrap',
                          },
                          properties: {
                            desc: {
                              type: 'void',
                              'x-component': 'div',
                              'x-component-props': {
                                style: {
                                  color: '#909399',
                                },
                              },
                              'x-content': i18n.t(
                                'packages_dag_nodes_table_shiligro',
                              ),
                            },
                            link: {
                              type: 'void',
                              'x-component': 'Button',
                              'x-component-props': {
                                text: true,
                                type: 'primary',
                                onClick: '{{openApiDrawer}}',
                              },
                              'x-content': i18n.t(
                                'packages_business_view_more_apis',
                              ),
                            },
                          },
                        },
                      },
                    },
                    sql: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-component': 'SqlEditor',
                      'x-component-props': {
                        options: { showPrintMargin: false, useWrapMode: true },
                      },
                      'x-reactions': {
                        dependencies: [
                          'source.enableCustomCommand',
                          'source.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{!!$deps[0] && !$deps[1].toLowerCase().includes("mongo")}}',
                          },
                        },
                      },
                    },
                  },
                },
              },
              'x-reactions': [
                {
                  dependencies: ['source.enableCustomCommand'],
                  fulfill: {
                    state: {
                      visible: `{{$deps[0]}}`,
                    },
                  },
                },
              ],
            },
          },
        },
        target: {
          type: 'object',
          'x-component': 'FormGrid.GridColumn',
          properties: {
            databaseType: {
              type: 'string',
              'x-display': 'hidden',
            },
            fields: {
              type: 'array',
              'x-display': 'hidden',
            },
            nodeSchema: {
              type: 'array',
              'x-display': 'hidden',
              'x-reactions': [
                `{{useAsyncDataSource(loadTableFieldList, 'value', $values.target)}}`,
                {
                  target: 'target.conditions.*.key',
                  fulfill: {
                    state: {
                      loading: '{{$self.loading}}',
                      dataSource: '{{$self.value}}',
                    },
                  },
                },
              ],
            },
            enableCustomCommand: {
              title: i18n.t(
                'packages_business_components_conditionbox_mubiaobiaoshuju',
              ),
              type: 'boolean',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                className: 'item-control-horizontal',
                layout: 'horizontal',
                labelWrap: true,
                tooltip: i18n.t(
                  'packages_business_components_conditionbox_enableCustomCommand_tip',
                ),
              },
              'x-component': 'Switch',
              default: false,
              'x-reactions': [
                {
                  fulfill: {
                    state: {
                      visible: `{{$values.target.capabilities && $values.target.capabilities.some(item => item.id === 'execute_command_function')}}`,
                    },
                  },
                },
              ],
            },
            customCommand: {
              type: 'object',
              properties: {
                command: {
                  title: ' ',
                  'x-decorator-props': {
                    colon: false,
                  },
                  type: 'string',
                  default: 'executeQuery',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  enum: [
                    { label: i18n.t('public_query'), value: 'executeQuery' },
                    { label: i18n.t('public_aggregate'), value: 'aggregate' },
                  ],
                  'x-reactions': {
                    dependencies: ['target.databaseType'],
                    fulfill: {
                      state: {
                        display:
                          '{{$deps[0].toLowerCase().includes("mongo")?"visible":"hidden"}}',
                      },
                    },
                  },
                },
                params: {
                  type: 'object',
                  properties: {
                    mongoQuery: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'void',
                      'x-reactions': {
                        dependencies: [
                          'target.customCommand.command',
                          'target.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="executeQuery"}}',
                          },
                        },
                      },
                      properties: {
                        op: {
                          type: 'string',
                          default: 'find',
                        },
                        collection: {
                          type: 'string',
                          'x-reactions': {
                            fulfill: {
                              state: {
                                value: '{{$values.tableName}}',
                              },
                            },
                          },
                        },
                        filter: {
                          title: ' ',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'JsonEditor',
                          'x-component-props': {
                            options: {
                              showPrintMargin: false,
                              useWrapMode: true,
                            },
                          },
                        },
                        descWrap: {
                          type: 'void',
                          title: ' ',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          'x-component': 'div',
                          'x-component-props': {
                            class: 'flex align-center flex-wrap',
                          },
                          properties: {
                            desc: {
                              type: 'void',
                              'x-component': 'div',
                              'x-component-props': {
                                style: {
                                  color: '#909399',
                                },
                              },
                              'x-content': i18n.t(
                                'packages_dag_nodes_table_jinzhichiqu',
                              ),
                            },
                            link: {
                              type: 'void',
                              'x-component': 'Button',
                              'x-component-props': {
                                text: true,
                                type: 'primary',
                                onClick: '{{openApiDrawer}}',
                              },
                              'x-content': i18n.t(
                                'packages_business_view_more_apis',
                              ),
                            },
                          },
                        },
                      },
                    },
                    mongoAgg: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'void',
                      'x-reactions': {
                        dependencies: [
                          'target.customCommand.command',
                          'target.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{$deps[1].toLowerCase().includes("mongo") && $deps[0]==="aggregate"}}',
                          },
                        },
                      },
                      properties: {
                        collection: {
                          type: 'string',
                          'x-reactions': {
                            dependencies: ['target.tableName'],
                            fulfill: {
                              state: {
                                value: '{{$deps[0]}}',
                              },
                            },
                          },
                        },
                        pipeline: {
                          title: ' ',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'JsonEditor',
                          'x-component-props': {
                            options: {
                              showPrintMargin: false,
                              useWrapMode: true,
                            },
                          },
                        },
                        descWrap: {
                          type: 'void',
                          title: ' ',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            colon: false,
                            feedbackLayout: 'none',
                          },
                          'x-component': 'div',
                          'x-component-props': {
                            class: 'flex align-center flex-wrap',
                          },
                          properties: {
                            desc: {
                              type: 'void',
                              'x-component': 'div',
                              'x-component-props': {
                                style: {
                                  color: '#909399',
                                },
                              },
                              'x-content': i18n.t(
                                'packages_dag_nodes_table_shiligro',
                              ),
                            },
                            link: {
                              type: 'void',
                              'x-component': 'Button',
                              'x-component-props': {
                                text: true,
                                type: 'primary',
                                onClick: '{{openApiDrawer}}',
                              },
                              'x-content': i18n.t(
                                'packages_business_view_more_apis',
                              ),
                            },
                          },
                        },
                      },
                    },
                    sql: {
                      title: ' ',
                      'x-decorator-props': {
                        colon: false,
                      },
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-component': 'SqlEditor',
                      'x-component-props': {
                        options: { showPrintMargin: false, useWrapMode: true },
                      },
                      'x-reactions': {
                        dependencies: [
                          'target.enableCustomCommand',
                          'target.databaseType',
                        ],
                        fulfill: {
                          state: {
                            visible:
                              '{{!!$deps[0] && !$deps[1].toLowerCase().includes("mongo")}}',
                          },
                        },
                      },
                    },
                  },
                },
              },
              'x-reactions': [
                {
                  dependencies: ['target.enableCustomCommand'],
                  fulfill: {
                    state: {
                      visible: `{{$deps[0]}}`,
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
}

const schemaScope = {
  $supportFilterFunction:
    props.inspectMethod === 'row_count'
      ? 'count_by_partition_filter_function'
      : 'query_by_advance_filter_function',
  useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
    return (field) => {
      field.loading = true
      service({ field }, ...serviceParams).then(
        action.bound((data) => {
          if (fieldName === 'value') {
            field.setValue(data)
          } else field[fieldName] = data
          field.loading = false
        }),
      )
    }
  },
  async loadTableFieldList(obj, item) {
    try {
      if (!item.connectionId || !item.table) return []
      let fields = item.fields
      if (!fields?.length) {
        const params = {
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            original_name: item.table,
            'source._id': item.connectionId,
          },
          limit: 1,
        }
        const data = await metadataInstancesApi.tapTables({
          filter: JSON.stringify(params),
        })
        fields = Object.values(data.items[0]?.nameFieldMap || {}).map((t) => {
          return {
            id: t.id,
            label: t.fieldName || t.field_name,
            value: t.fieldName || t.field_name,
            field_name: t.fieldName || t.field_name,
            primary_key_position: t.primaryKey,
            data_type: t.dataType || t.data_type,
            primaryKey: t.primaryKey,
            unique: t.unique,
            type: t.dataType || t.data_type,
            tapType: JSON.stringify(t.tapType),
          }
        })
      }
      const result = fields

      if (result.length) {
        item.fields = result
      }

      return result
    } catch {
      return []
    }
  },
  openApiDrawer: (path) => {
    docPath.value = isString(path) ? path : ''
    showDoc.value = true
  },
}

// Computed Properties
const flowStages = computed(() => {
  const types = props.isDB ? ['database'] : ['table']
  return props.allStages.filter((stg) => types.includes(stg.type))
})

const isCountOrHash = computed(() => {
  return props.inspectMethod === 'row_count' || props.inspectMethod === 'hash'
})

const filteredList = computed(() => {
  if (!searchValue.value) return list.value

  const searchTerm = searchValue.value.toLowerCase()
  return list.value.filter((item) => {
    const sourceTable = (item.source.table || '').toLowerCase()
    const targetTable = (item.target.table || '').toLowerCase()

    return sourceTable.includes(searchTerm) || targetTable.includes(searchTerm)
  })
})

const paginatedList = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredList.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredList.value.length / pageSize.value)
})

const nullsLastState = computed(() => {
  return Object.keys(capabilitiesMap).reduce(
    (cur, pre) => {
      const tags = capabilitiesMap[pre]?.tags || []
      if (tags.includes('NullsLast')) {
        cur[pre] = true
      }
      return cur
    },
    {} as Record<string, boolean>,
  )
})

// Watchers
// watch(
//   () => props.taskId,
//   (v1, v2) => {
//     if (v1 !== v2) {
//       clearList()
//     }
//   },
// )

// watch(
//   () => props.data,
//   () => {
//     loadList()
//   },
//   { deep: true },
// )

watch(
  list,
  () => {
    debounceValidate()
    // Reset to page 1 if list is empty
    if (list.value.length === 0) {
      currentPage.value = 1
    }
  },
  { deep: true },
)

watch(searchValue, () => {
  // Reset to page 1 when search filter changes
  currentPage.value = 1
})

// Methods
const getConnectionsListMethod = async (
  filter: any,
): Promise<ApiResponse<ConnectionResponse>> => {
  if (props.taskId) {
    return getConnectionsInTask(filter)
  }
  try {
    const _filter = {
      where: {
        createType: {
          $ne: 'System',
        },
      },
      fields: {
        name: 1,
        id: 1,
        database_type: 1,
        connection_type: 1,
        status: 1,
        accessNodeType: 1,
        accessNodeProcessId: 1,
        accessNodeProcessIdList: 1,
        pdkType: 1,
        pdkHash: 1,
        capabilities: 1,
      },
      order: ['status DESC', 'name ASC'],
    }
    const result = await connectionsApi.get({
      filter: JSON.stringify(merge(filter, _filter)),
    })

    const response: ApiResponse<ConnectionResponse> = {
      items: result.data.items.map((item: ConnectionItem) => {
        const findDynamicSchema = item.capabilities.find(
          (t: any) => t.id === 'dynamic_schema',
        )
        if (findDynamicSchema) {
          dynamicSchemaMap[item.id] = true
        }
        const connectionId = item.id
        const connectionName = item.name
        const databaseType = item.database_type
        return {
          attrs: {
            nodeId: '',
            nodeName: '',
            connectionId,
            connectionName,
            databaseType,
          },
          name: connectionName,
          value: connectionId,
          id: connectionId,
          label: `${connectionName} ${
            item.status
              ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})`
              : ''
          }`,
          databaseType,
        }
      }),
      total: result.data.total,
    }

    return response
  } catch {
    return { items: [], total: 0 }
  }
}

const getTableListMethod = async (
  filter: TableFilter = {},
): Promise<ApiResponse<string>> => {
  const { connectionId, nodeId } = filter
  if (!connectionId) {
    return { items: [], total: 0 }
  }
  if (props.taskId) {
    return getTablesInTask(nodeId, connectionId, filter)
  }
  try {
    const size = filter.size || 20
    const page = filter.page || 1
    const params = {
      where: {
        meta_type: 'table',
        sourceType: 'SOURCE',
        is_deleted: false,
        'source.id': connectionId,
        ...(filter.where?.name?.like ? { name: filter.where.name } : {}),
      },
      skip: (page - 1) * size,
      limit: size,
      order: 'createTime DESC',
    }
    const res = await metadataInstancesApi.tapTables({
      filter: JSON.stringify(params),
    })
    const result: ApiResponse<string> = {
      items: res.data.items.map((t: TableItem) => t.name),
      total: res.data.total,
    }
    res.data.items.forEach((el: TableItem) => {
      // 缓存起来
      setFieldsByItem(
        [nodeId, connectionId, el.name],
        Object.values(el.nameFieldMap || {}).map((t: any) => {
          const {
            id,
            fieldName,
            primaryKeyPosition,
            fieldType,
            data_type,
            primaryKey,
            unique,
          } = t
          return {
            id,
            field_name: fieldName,
            primary_key_position: primaryKeyPosition,
            fieldType,
            data_type,
            primaryKey,
            unique,
            type: t.data_type,
            tapType: JSON.stringify(t.tapType),
          }
        }),
      )
    })
    return result
  } catch {
    return { items: [], total: 0 }
  }
}

const getTablesInTask = async (
  nodeId: string,
  connectionId: string,
  filter: TableFilter = {},
): Promise<ApiResponse<string>> => {
  if (!flowStages.value?.length || !props.taskId) {
    return { items: [], total: 0 }
  }
  const { isDB } = props

  const findNode = flowStages.value.find((t: StageItem) => t.id === nodeId)
  if (!findNode) {
    return { items: [], total: 0 }
  }

  const params: TableParams = {
    nodeId,
    fields: ['original_name', 'fields', 'qualified_name', 'name'],
    page: filter?.page || 1,
    pageSize: filter?.size || 20,
    ...(filter.where?.name?.like
      ? { tableFilter: filter.where.name.like }
      : {}),
  }

  const res = await metadataInstancesApi.nodeSchemaPage(params)

  const tableList = res.data.items?.map((t: TableItem) => t.name) || []
  const total = res.data.total
  res.data.items.forEach((el: TableItem) => {
    setFieldsByItem(
      [nodeId, connectionId, el.name],
      el.fields.map((t: any) => {
        const {
          id,
          field_name,
          primary_key_position,
          data_type,
          primaryKey,
          unique,
        } = t
        return {
          id,
          field_name,
          primary_key_position: primaryKeyPosition,
          data_type,
          primaryKey,
          unique,
        }
      }),
    )
  })
  let tableNames = tableList
  if (isDB) {
    if (!findNode.outputLanes.length) {
      const { tablePrefix, tableSuffix, tableNameTransform } = findNode
      tableNames = tableNames.map((t: string) => {
        const name = (tablePrefix || '') + t + (tableSuffix || '')
        return tableNameTransform ? String(name)[tableNameTransform]() : name
      })
    }
    return { items: tableNames, total }
  }
  if (filter.where?.name?.like) {
    tableNames = tableNames.filter((t: string) =>
      t.toLowerCase().includes(filter.where!.name!.like!.toLowerCase()),
    )
  }
  return { items: tableNames, total: tableNames.length }
}

const getConnectionsInTask = async (
  filter: any = {},
): Promise<ApiResponse<ConnectionResponse>> => {
  const keyword = filter.where?.name?.like
  const id = filter.where?.id
  let arr: StageItem[] = []
  if (id) {
    const item = flowStages.value.find(
      (item: StageItem) => item.connectionId === id,
    )
    item && arr.push(item)
  } else if (keyword) {
    arr = flowStages.value.filter((t: StageItem) =>
      t.attrs?.connectionName.includes(filter.where?.name?.like),
    )
  } else {
    arr = flowStages.value
  }
  const result = uniqBy(
    arr.map((t: StageItem) => {
      const nodeId = t.id
      const nodeName = t.name
      const connectionId = t.connectionId
      const connectionName = t.attrs?.connectionName
      const databaseType = t.databaseType
      const findDynamicSchema = t.attrs?.capabilities.find(
        (t: any) => t.id === 'dynamic_schema',
      )
      if (findDynamicSchema) {
        dynamicSchemaMap[t.connectionId] = true
      }
      return {
        attrs: {
          nodeId,
          nodeName,
          connectionId,
          connectionName,
          databaseType,
        },
        name: `${nodeName} / ${connectionName}`,
        value: connectionId,
        id: connectionId,
        label: `${nodeName} / ${connectionName}`,
        databaseType,
      }
    }),
    'value',
  )

  // Add await to ensure this is truly async
  await Promise.resolve()
  return { items: result, total: result.length }
}

const getLinkData = (value: string, data: any[] = [], flag = false) => {
  const f = data.find((t) => t[flag ? 'source' : 'target'] === value)
  return f ? getLinkData(f[!flag ? 'source' : 'target'], data, flag) : value
}

const getMatchNodeList = () => {
  const edgesList = cloneDeep(props.edges)
  const result = uniqBy(
    edgesList.map((t: any) => {
      const source = getLinkData(t.source, edgesList)
      const target = getLinkData(t.target, edgesList, true)
      const key = `${source}_${target}`
      return {
        source,
        target,
        key,
      }
    }),
    'key',
  )

  return result.map((re: any) => {
    const el = flowStages.value.find((t: any) => t.id === re.source)
    const targetNode = flowStages.value.find((t: any) => t.id === re.target)
    let updateConditionFieldMap = {}
    let tableNames = []
    let tableNameRelation = {}
    let objectNames = []
    if (targetNode.type === 'database') {
      tableNames = el.tableNames
      updateConditionFieldMap = targetNode.updateConditionFieldMap || {}
      tableNameRelation = targetNode.syncObjects?.[0]?.tableNameRelation || []
      objectNames = targetNode.syncObjects?.[0]?.objectNames || []
    } else if (targetNode.type === 'table') {
      tableNames = [el.tableName, targetNode.tableName] // 加上源表名，否则源和目标表名不一致时，源表关联字段不会自动填充
      updateConditionFieldMap[targetNode.tableName] =
        targetNode.updateConditionFields || []
      tableNameRelation[el.tableName] = targetNode.tableName
    }

    return {
      source: el.id,
      sourceName: el.name,
      target: targetNode.id,
      targetName: targetNode.name,
      sourceConnectionId: el.connectionId,
      sourceConnectionName: el.attrs?.connectionName,
      targetConnectionId: targetNode.connectionId,
      targetConnectionName: targetNode.attrs?.connectionName,
      sourceDatabaseType: el.databaseType,
      targetDatabaseType: targetNode.databaseType,
      updateConditionFieldMap,
      tableNames,
      objectNames,
      tableName: targetNode.tableName,
      tableNameRelation,
    }
  })
}

const handleClear = () => {
  ElMessageBox.confirm(
    i18n.t('packages_business_components_conditionbox_shifouqingkongsuo'),
    i18n.t('public_message_title_prompt'),
    {
      type: 'warning',
    },
  ).then((res) => {
    if (!res) {
      return
    }
    clearList()
  })
}

const handleClearIndexEmpty = () => {
  ElMessageBox.confirm(
    i18n.t('packages_business_components_conditionbox_shifouquerenqing'),
    i18n.t('public_message_title_prompt'),
    {
      type: 'warning',
    },
  ).then((res) => {
    if (!res) {
      return
    }

    formData.tasks = formData.tasks.filter(
      (t) => t.source.sortColumn && t.target.sortColumn,
    )
  })
}

const clearList = () => {
  formData.tasks = []
  currentPage.value = 1
  validate()
}

const getItemOptions = () => {
  return {
    id: uuid(),
    source: Object.assign({}, TABLE_PARAMS),
    target: Object.assign({}, TABLE_PARAMS),
    showAdvancedVerification: false,
    script: '', //后台使用 需要拼接function头尾
    webScript: '', //前端使用 用于页面展示
    jsEngineName: 'graal.js',
    modeType: 'all', // 待校验模型的类型
  }
}

const addItem = () => {
  list.value.push(getItemOptions())
  // Navigate to the last page when adding a new item
  currentPage.value = totalPages.value
}

const removeItem = (id: string) => {
  const index = formData.tasks.findIndex((t) => t.id === id)
  if (index !== -1) {
    formData.tasks.splice(index, 1)
  }

  // If current page is now empty and it's not the first page, go to previous page
  if (paginatedList.value.length === 0 && currentPage.value > 1) {
    currentPage.value--
  }
}

const autoAddTable = async () => {
  if (!props.taskId || formData.tasks.length) return
  autoAddTableLoading.value = true
  updateAutoAddTableLoading()
  const connectionSet = new Set()
  const tableNames = []
  const matchNodeList = getMatchNodeList()

  matchNodeList.forEach((m: any) => {
    connectionSet.add(m.sourceConnectionId)
    connectionSet.add(m.targetConnectionId)
    tableNames.push(...m.tableNames, ...m.objectNames)
  })

  const connectionIds = [...connectionSet]

  // 加载数据源的Capabilities
  const capabilitiesMap = await getCapabilities(connectionIds)

  if (!matchNodeList.length) {
    autoAddTableLoading.value = false
    updateAutoAddTableLoading()
    if (props.allStages.length > flowStages.value.length)
      return ElMessage.error(
        i18n.t(
          'packages_business_components_conditionbox_cunzaichulijiedian_wufazidong',
        ),
      )
    return ElMessage.error(
      i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'),
    )
  }
  const where = {
    meta_type: {
      inq: DATA_NODE_TYPES,
    },
    'source.id': {
      inq: connectionIds,
    },
    original_name: {
      inq: Array.from(new Set(tableNames)),
    },
    taskId: props.taskId,
  }
  metadataInstancesApi
    .findInspect({
      where,
      fields: META_INSTANCE_FIELDS,
    })
    .then((data: any) => {
      const newItems = []
      matchNodeList.forEach((m: any) => {
        const {
          source,
          target,
          sourceName,
          targetName,
          sourceConnectionId,
          targetConnectionId,
          sourceConnectionName,
          targetConnectionName,
          sourceDatabaseType,
          targetDatabaseType,
          updateConditionFieldMap,
          tableNameRelation,
        } = m

        const sourceTableList = Object.keys(tableNameRelation)
        sourceTableList.forEach((ge: string) => {
          const item = getItemOptions()
          // 填充source
          item.source.nodeId = source
          item.source.nodeName = sourceName
          item.source.databaseType = sourceDatabaseType
          item.source.connectionId = sourceConnectionId
          item.source.connectionName = sourceConnectionName
          item.source.currentLabel = `${sourceName} / ${sourceConnectionName}`
          item.source.table = ge // findTable.original_name
          item.source.capabilities =
            capabilitiesMap[sourceConnectionId]?.capabilities || []
          // 填充target
          item.target.nodeId = target
          item.target.nodeName = targetName
          item.target.databaseType = targetDatabaseType
          item.target.connectionId = targetConnectionId
          item.target.connectionName = targetConnectionName
          item.target.currentLabel = `${targetName} / ${targetConnectionName}`
          item.target.table = tableNameRelation[ge] // findTargetTable.original_name
          item.target.capabilities =
            capabilitiesMap[targetConnectionId]?.capabilities || []

          const updateList = cloneDeep(
            updateConditionFieldMap[tableNameRelation[ge]] || [],
          ).filter((t: string) => t !== '_no_pk_hash')
          const findTable = data.find(
            (t: any) =>
              t.source.id === sourceConnectionId && t.original_name === ge,
          )
          const findTargetTable = data.find(
            (t: any) =>
              t.source.id === targetConnectionId &&
              t.original_name === tableNameRelation[ge],
          )

          if (findTable) {
            let sourceSortColumn = updateList.length
              ? updateList.join(',')
              : findTable.sortColumns?.join(',') ||
                getPrimaryKeyFieldStr(findTable.fields)

            if (updateList.length && findTargetTable?.fields?.length) {
              const fieldMap = findTargetTable?.fields?.reduce(
                (acc: any, t: any) => {
                  acc[t.field_name] = t.original_field_name
                  return acc
                },
                {},
              )
              sourceSortColumn = updateList
                .reduce((acc: string[], t: string) => {
                  fieldMap[t] && acc.push(fieldMap[t])
                  return acc
                }, [])
                .join(',')
            }

            item.source.fields = findTable.fields.map((t: any) => {
              t.isPrimaryKey = t.primary_key_position > 0
              return t
            })
            item.source.sortColumn = sourceSortColumn

            const key = [
              source || '',
              sourceConnectionId,
              item.source.table,
            ].join()
            fieldsMap[key] = item.source.fields
          }

          if (findTargetTable) {
            const targetSortColumn = updateList.length
              ? updateList.join(',')
              : findTargetTable.sortColumns?.join(',') ||
                getPrimaryKeyFieldStr(findTargetTable.fields)

            item.target.fields = findTargetTable.fields.map((t: any) => {
              t.isPrimaryKey = t.primary_key_position > 0
              return t
            })

            item.target.sortColumn = targetSortColumn
            const key = [
              target || '',
              targetConnectionId,
              item.target.table,
            ].join()
            fieldsMap[key] = item.target.fields
          }

          if (
            autoSuggestJoinFields.value &&
            !item.source.sortColumn &&
            !item.target.sortColumn
          ) {
            let sourceFields = item.source.fields.filter(
              (t: any) => !t.is_nullable,
            )
            let targetFields = item.target.fields.filter(
              (t: any) => !t.is_nullable,
            )

            sourceFields = sourceFields.length
              ? sourceFields
              : item.source.fields
            targetFields = targetFields.length
              ? targetFields
              : item.target.fields

            item.source.sortColumn = sourceFields
              .map((t: any) => t.field_name)
              .join(',')
            item.target.sortColumn = targetFields
              .map((t: any) => t.field_name)
              .join(',')
          }

          newItems.push(item)
        })
      })
      if (!newItems.length) {
        return ElMessage.error(
          i18n.t('packages_business_components_conditionbox_suoxuanrenwuque'),
        )
      }
      formData.tasks = newItems

      // 显示提示
      validate()
    })
    .finally(() => {
      autoAddTableLoading.value = false
      updateAutoAddTableLoading()
    })
}

const loadList = () => {
  const data = cloneDeep(props.data)
  data.forEach((el: any) => {
    el.modeType = el.source.columns ? 'custom' : 'all'
  })
  formData.tasks = data
}

const getList = () => {
  const listData = formData.tasks
  if (props.taskId) {
    listData.forEach((el: any) => {
      if (el.modeType === 'all') {
        el.source.columns = null
        el.target.columns = null
      }
    })
  }
  return listData
}

const handleChangeConnection = async (opt: any, item: any) => {
  item.currentLabel = ''
  item.table = '' // 重选连接，清空表
  item.sortColumn = '' // 重选连接，清空表
  item.databaseType = opt.databaseType

  if (capabilitiesMap?.[opt.attrs?.connectionId]) {
    item.capabilities =
      capabilitiesMap[opt.attrs?.connectionId]?.capabilities || []
  } else {
    const { capabilities, tags } = await getConnectionCapabilities(
      opt.attrs?.connectionId,
    )
    item.capabilities = capabilities
    capabilitiesMap[opt.attrs?.connectionId] = {
      capabilities,
      tags,
    }
  }

  if (!props.taskId) {
    item.connectionName = opt.attrs?.connectionName
    item.currentLabel = item.connectionName
    return
  }
  const { nodeId, nodeName, connectionName } = opt.attrs || {}
  item.nodeId = nodeId
  item.nodeName = nodeName
  item.connectionName = connectionName
  item.currentLabel = `${nodeName} / ${connectionName}`
}

const getReverseNodeInfo = (data: any = {}) => {
  const {
    source,
    target,
    sourceName,
    targetName,
    sourceConnectionId,
    targetConnectionId,
    sourceConnectionName,
    targetConnectionName,
    sourceDatabaseType,
    targetDatabaseType,
    updateConditionFieldMap,
    tableNames,
    tableName,
  } = data
  return {
    source: target,
    target: source,
    sourceName: targetName,
    targetName: sourceName,
    sourceConnectionId: targetConnectionId,
    targetConnectionId: sourceConnectionId,
    sourceConnectionName: targetConnectionName,
    targetConnectionName: sourceConnectionName,
    sourceDatabaseType: targetDatabaseType,
    targetDatabaseType: sourceDatabaseType,
    updateConditionFieldMap,
    tableNames,
    tableName,
  }
}

const handleChangeTable = (
  val: string,
  item: any,
  index: number,
  type: string,
) => {
  const fields = getFieldsByItem(item, type)
  item[type].fields = fields
  item[type].sortColumn = getPrimaryKeyFieldStr(fields)

  if (item.modeType === 'custom') {
    item.source.columns = []
    item.target.columns = []
  }

  // 绑定任务，则自动填充目标信息
  if (!props.taskId) {
    return
  }

  // 获取连线信息
  const matchNodeList = getMatchNodeList()
  let matchNode = matchNodeList.find((t: any) =>
    [t.source, t.target].includes(item[type].nodeId),
  )
  if (!matchNode) {
    return
  }

  if (matchNode.target === item[type].nodeId) {
    matchNode = getReverseNodeInfo(matchNode)
  }
  const {
    target,
    targetName,
    targetConnectionId,
    targetConnectionName,
    sourceDatabaseType,
    targetDatabaseType,
    updateConditionFieldMap,
    tableName,
    tableNameRelation = {},
  } = matchNode

  // 自动填充索引字段
  const updateList = updateConditionFieldMap[val] || {}
  item[type].sortColumn = updateList.length
    ? updateList.join(',')
    : getPrimaryKeyFieldStr(fields)

  if (type === 'target') {
    item.target.databaseType = targetDatabaseType
    return
  }
  // 自动填充目标连接和表
  item.source.databaseType = sourceDatabaseType

  item.target.nodeId = target
  item.target.nodeName = targetName
  item.target.connectionId = targetConnectionId
  item.target.connectionName = targetConnectionName
  item.target.currentLabel = `${targetName} / ${targetConnectionName}`
  item.target.table = tableName ? tableName : tableNameRelation[val]

  item.target.capabilities =
    capabilitiesMap[targetConnectionId]?.capabilities || []

  const key = [target || '', targetConnectionId, item.target.table].join()
  if (fieldsMap[key]) {
    item.target.fields = fieldsMap[key]
    // 设置主键
    item.target.sortColumn = updateList.length
      ? updateList.join(',')
      : getPrimaryKeyFieldStr(item.target.fields)
    return
  }

  // 加载目标的字段
  const params = {
    nodeId: target,
    tableFilter: item.target.table,
    page: 1,
    pageSize: 1,
  }
  metadataInstancesApi.nodeSchemaPage(params).then((data: any) => {
    item.target.fields =
      data.data.items?.[0]?.fields.map((t: any) => {
        const { id, field_name, primary_key_position, primaryKey, unique } = t
        return { id, field_name, primary_key_position, primaryKey, unique }
      }) || []
    // 设置主键
    item.target.sortColumn = updateList.length
      ? updateList.join(',')
      : getPrimaryKeyFieldStr(item.target.fields)

    fieldsMap[key] = item.target.fields
  })
}

const handleChangeAdvanced = (item: any) => {
  Object.assign(item.target, {
    targeFilterFalg: false,
    where: '',
  })
}

const addScript = (index: number) => {
  formIndex.value = index
  webScript.value = ''
  jsEngineName.value = 'graal.js'
  dialogAddScriptVisible.value = true
}

const handleAddScriptClose = () => {
  webScript.value = ''
  formIndex.value = ''
  jsEngineName.value = 'graal.js'
  dialogAddScriptVisible.value = false
}

const submitScript = () => {
  const task = formData.tasks
  const currentFormIndex = formIndex.value
  task[currentFormIndex].webScript = webScript.value
  task[currentFormIndex].jsEngineName = jsEngineName.value
  jsEngineName.value = ''
  webScript.value = ''
  formIndex.value = ''
  dialogAddScriptVisible.value = false
}

const editScript = (index: number) => {
  formIndex.value = index
  const task = paginatedList.value
  const script = JSON.parse(JSON.stringify(task[formIndex.value].webScript))
  jsEngineName.value = JSON.parse(
    JSON.stringify(task[formIndex.value].jsEngineName || 'nashorn'),
  )
  webScript.value = script
  dialogAddScriptVisible.value = true
}

const removeScript = (item: any) => {
  ElMessageBox.confirm(
    i18n.t('packages_business_verification_message_confirm_delete_script'),
    i18n.t('public_button_delete'),
    {
      type: 'warning',
    },
  ).then((resFlag) => {
    if (!resFlag) {
      return
    }
    item.webScript = ''
  })
}

const setFieldsByItem = (item: any[] = [], data: any[] = []) => {
  const key = item.filter((t) => t).join()
  fieldsMap[key] = data
}

const getFieldsByItem = (item: any, type = 'source') => {
  const { nodeId, connectionId, table } = item[type] || {}
  return (
    fieldsMap[[nodeId || '', connectionId, table].filter((t) => t).join()] || []
  )
}

const getPrimaryKeyFieldStr = (data: any[] = []) => {
  const sortField = (fields: any[]) => {
    return (
      fields?.sort((a, b) => {
        return a.field_name > b.field_name ? -1 : 1
      }) || []
    )
  }
  return sortField(data)
    .filter((f) => !!f.primaryKey)
    .map((t) => t.field_name)
    .join(',')
}

const debounceValidate = debounce(() => {
  validate()
}, 200)

const validate = async () => {
  const tasks = getList()

  if (!tasks.length) {
    updateErrorMsg('')
    return
  }

  let index = 0
  let message = ''
  const SHOW_COUNT = 20
  // 检查是否选择表
  const haveTableArr = tasks.filter((c) => c.source.table && c.target.table)
  const noTableArr = tasks.filter((c) => !c.source.table || !c.target.table)

  if (!haveTableArr.length) {
    message = i18n.t(
      'packages_business_verification_form_validate_table_is_empty',
    )
    updateErrorMsg(message, 'error')
    return message
  }

  if (noTableArr.length) {
    message = i18n.t(
      'packages_business_verification_form_validate_table_is_empty1',
    )
    noTableArr.forEach((el, elIndex) => {
      if (elIndex <= SHOW_COUNT) {
        message += `${elIndex > 0 ? ', ' : ''}${el.source.connectionName}`
        message += `${elIndex > 0 ? ', ' : ''}${el.target.connectionName}`
      }
    })
    if (noTableArr.length > SHOW_COUNT) {
      message += ` ...`
    }
    updateErrorMsg(message, 'warn')
    return
  }

  if (['field', 'jointField'].includes(props.inspectMethod)) {
    // 检查数据源的能力
    message = validateCapabilities(tasks, 'query_by_advance_filter_function')
    if (message) return message

    // 索引字段为空
    const haveIndexFieldArr = tasks.filter(
      (c) => c.source.sortColumn && c.target.sortColumn,
    )
    const noIndexFieldArr = tasks.filter(
      (c) => !c.source.sortColumn || !c.target.sortColumn,
    )

    if (!haveIndexFieldArr.length) {
      message = i18n.t('packages_business_verification_form_condition_is_empty')
      updateErrorMsg(message, 'error')
      return message
    }

    if (noIndexFieldArr.length) {
      message = i18n.t(
        'packages_business_verification_form_index_field_is_empty',
      )
      noIndexFieldArr.forEach((el, elIndex) => {
        if (elIndex <= SHOW_COUNT) {
          message += `${elIndex > 0 ? ', ' : ''}${el.source.table}`
        }
      })
      if (noIndexFieldArr.length > SHOW_COUNT) {
        message += ` ...`
      }
      updateErrorMsg(message, 'warn')
      return
    }

    // 判断表字段校验时，索引字段是否个数一致
    const countNotArr = tasks.filter(
      (c) =>
        c.source.sortColumn.split(',').length !==
        c.target.sortColumn.split(',').length,
    )
    if (countNotArr.length) {
      message = i18n.t(
        'packages_business_verification_form_index_field_count_is_not_equal',
      )
      countNotArr.forEach((el, elIndex) => {
        if (elIndex <= SHOW_COUNT) {
          message += `${el.source.table} `
          message += `${el.target.table} `
        }
      })
      if (countNotArr.length > SHOW_COUNT) {
        message += `...${countNotArr.length - SHOW_COUNT}`
      }
      updateErrorMsg(message, 'warn')
      return
    }

    // 判断过滤设置是否填写完整
    let schemaToFormFlag = false
    for (const [i, task] of tasks.entries()) {
      await fieldDialog.value?.[`schemaToForm_${task.id}`]?.[0]
        ?.validate?.()
        .catch(() => {
          index = i + 1
          schemaToFormFlag = true
        })
    }
    if (schemaToFormFlag) {
      message = i18n.t(
        'packages_business_verification_message_error_joint_table_target_or_source_filter_not_set',
        {
          val: index,
        },
      )
      updateErrorMsg(message, 'error')
      return message
    }

    // 开启高级校验后，JS校验逻辑不能为空
    if (
      props.inspectMethod === 'field' &&
      tasks.some((c, i) => {
        index = i + 1
        return c.showAdvancedVerification && !c.webScript
      })
    ) {
      message = i18n.t(
        'packages_business_verification_message_error_script_no_enter',
      )
      updateErrorMsg(message, 'error')
      return message
    }
  } else if (props.inspectMethod === 'row_count') {
    // 检查数据源的能力
    message = validateCapabilities(tasks, 'batch_count_function')
    if (message) return message
  } else if (props.inspectMethod === 'hash') {
    message = validateCapabilities(
      tasks,
      'query_hash_by_advance_filter_function',
    )
    if (message) return message
  }

  updateErrorMsg('')
}

const validateCapabilities = (tasks: any[], capability: string) => {
  const noSupportList = new Set()
  tasks.forEach((item) => {
    if (!item.source.capabilities?.find((c: any) => c.id === capability)) {
      noSupportList.add(item.source.databaseType)
    }

    if (!item.target.capabilities?.find((c: any) => c.id === capability)) {
      noSupportList.add(item.target.databaseType)
    }
  })

  let message = ''

  if (noSupportList.size) {
    message = i18n.t('packages_business_not_support_validation', {
      connection: [...noSupportList].join(', '),
      method: inspectMethodMap[props.inspectMethod],
    })
    updateErrorMsg(message, 'error')
    ElMessage.error(message)
  }

  return message
}

const loadDoc = () => {
  if (i18n.locale === 'en') {
    doc.value = `##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
\`\`\`\`javascript
function validate(sourceRow){
// step 1
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// step 2
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// step 3
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed', message: "Inconsistent records", data: targetRow}
}
}
\`\`\`\``
  } else if (i18n.locale === 'zh-TW') {
    doc.value = `##### 高級校驗說明
**第一步** 函數入參為源表數據，可以根據源表數據調用**內置函數**查詢出目標數據<br>
**第二步** 自定義校驗邏輯<br>
**第三步** 函數返回結果<br>

- **result**：是否通過校驗（passed：校驗通過，failed：校驗失敗），如果不填或填其它字符則校驗失敗，必填項<br>
- **message**：校驗異常信息，建議校驗失敗返回，選填項<br>
- **data**：當前校驗目標數據，建議校驗失敗返回，選填項<br>


完整示例：此為MongoDB查詢示例
\`\`\`javascript
function validate(sourceRow){
// 第1步
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// 第2步
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// 第3步
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed',message: "記錄不一致",data: targetRow}
}
}
\`\`\``
  } else {
    doc.value = `##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
\`\`\`javascript
function validate(sourceRow){
// 第1步
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// 第2步
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// 第3步
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed',message: "记录不一致",data: targetRow}
}
}
\`\`\`
`
  }
}

const getModeTypeDisabled = (item: any) => {
  return (
    !item.source.connectionId ||
    !item.source.table ||
    !item.target.connectionId ||
    !item.target.table
  )
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  // If changing page size would put us on a non-existent page, reset to page 1
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
}

const handleCustomFields = (item: any, index: number) => {
  fieldDialog.value.open(item, index, {
    source: dynamicSchemaMap[item.source.connectionId],
    target: dynamicSchemaMap[item.target.connectionId],
  })
}

const handleChangeModeType = (val: string, item: any, index: number) => {
  if (val !== 'custom') {
    item.source.columns = null
    item.target.columns = null
  } else {
    handleCustomFields(item, index)
  }

  // item.modeType = val // 防止 SchemaToForm 回流
}

const handleChangeFields = (data: any[] = [], index: number) => {
  const item = formData.tasks[index]
  item.source.columns = data.map((t) => t.source)
  item.target.columns = data.map((t) => t.target)
  // // 设置modeType
  // fieldDialog.value[`schemaToForm_${item.id}`].form.setValuesIn(
  //   'modeType',
  //   'custom',
  // )
}

const handleFocus = (opt: any = {}, visible) => {
  if (!visible || opt.fields?.length) {
    return
  }

  const connectionId = opt.connectionId
  const params = {
    where: {
      meta_type: 'table',
      sourceType: 'SOURCE',
      original_name: opt.table,
      'source._id': connectionId,
    },
    limit: 1,
  }
  metadataInstancesApi
    .tapTables({
      filter: JSON.stringify(params),
    })
    .then((data: any = {}) => {
      if (isEmpty(data.items[0]?.nameFieldMap)) {
        return
      }
      opt.fields = Object.values(data.items[0]?.nameFieldMap || {}).map(
        (t: any) => {
          return {
            id: t.id,
            label: t.fieldName,
            value: t.fieldName,
            field_name: t.fieldName,
            primary_key_position: t.primaryKey,
            data_type: t.dataType,
            primaryKey: t.primaryKey,
            unique: t.unique,
            type: t.dataType,
            tapType: JSON.stringify(t.tapType),
          }
        },
      )
    })
}

const getCapabilities = async (connectionIds: string[] = []) => {
  if (!connectionIds.length) return

  const map = {}

  await Promise.all(
    connectionIds.map(async (id) => {
      const { capabilities, tags } = await getConnectionCapabilities(id)
      map[id] = {
        capabilities,
        tags,
      }
    }),
  )

  // 重置 capabilitiesMap 后再更新
  Object.keys(capabilitiesMap).forEach((key) => {
    delete capabilitiesMap[key]
  })
  Object.assign(capabilitiesMap, map)

  return map
}

const getMatchCapabilitiesMap = () => {
  const list = cloneDeep(props.allStages)
  return list.reduce((cur: any, pre: any) => {
    cur[pre.connectionId] = pre.attrs?.capabilities
    return cur
  }, {})
}

const getConnectionCapabilities = async (id: string) => {
  const data = await connectionsApi.getNoSchema(id)
  return {
    capabilities: data?.capabilities || [],
    tags: data?.definitionTags || [],
  }
}

const updateErrorMsg = (msg: string, level = '') => {
  emit('update:jointErrorMessage', msg)
  emit('update:errorMessageLevel', level)
}

const updateAutoAddTableLoading = () => {
  emit('update:autoAddTableLoading', autoAddTableLoading.value)
}

const toggleCollate = (item: any, value: boolean) => {
  if (value) {
    const fields = Object.keys(item.collate || {})

    if (fields.length || !item.sortColumn) return

    const sortColumn = item.sortColumn.split(',')

    item.collate = sortColumn.reduce((acc: any, key: string) => {
      acc[key] = ''
      return acc
    }, {})
  }
}

// Lifecycle Hooks
onMounted(() => {
  loadDoc()
})

// Expose methods to parent component
defineExpose({
  autoAddTable,
  getList,
  validate,
  getCapabilities,
})
</script>

<template>
  <div class="joint-table rounded-lg" :class="{ error: !!jointErrorMessage }">
    <div
      class="joint-table-header px-4 py-2 flex align-items-center border-bottom"
    >
      <span class="fs-6">{{
        $t('packages_business_verification_verifyCondition')
      }}</span>
      <span
        class="ml-2 rounded-pill font-color-light px-2 text-center"
        style="min-width: 32px; background-color: #818b981f"
        >{{ filteredList.length }}</span
      >
      <span v-if="!list.length" class="ml-4 color-danger">{{
        $t('packages_business_verification_message_error_joint_table_not_set')
      }}</span>
      <span class="color-danger ml-6">{{ jointErrorMessage }}</span>
      <div class="flex-1" />
      <ElInput
        v-model="searchValue"
        :placeholder="$t('packages_form_table_rename_index_sousuobiaoming')"
        class="w-auto mr-4"
        clearable
      >
        <template #prefix>
          <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
        </template>
      </ElInput>
      <ElButton
        v-if="
          !isCountOrHash &&
          list.some((t) => !t.source.sortColumn || !t.target.sortColumn)
        "
        text
        type="primary"
        :disabled="!list.length"
        @click="handleClearIndexEmpty"
        >{{ $t('packages_business_components_conditionbox_yijianqingchusuo') }}
      </ElButton>
      <ElButton
        text
        type="primary"
        :disabled="!list.length"
        @click="handleClear"
        >{{ $t('packages_business_verification_clear') }}
      </ElButton>
    </div>
    <!-- Replace virtual scroller with standard list -->
    <div
      id="data-verification-form"
      class="joint-table-main scroller px-2 py-1 h-100"
    >
      <!-- <SchemaForm
        :model-value="formData"
        :schema="{
          type: 'object',
          properties: {
            name: {
              type: 'string',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
            },
          },
        }"
        :colon="true"
        class="w-100"
        label-width="130"
      /> -->
      <div
        v-for="(item, index) in paginatedList"
        :key="item.id"
        class="joint-table-item"
      >
        <div class="joint-table-setting overflow-hidden">
          <div class="flex justify-content-between">
            <div class="cond-item__title flex align-items-center">
              <span class="font-color-main fs-7">{{
                $t('packages_business_components_conditionbox_jianyantiaojian')
              }}</span>
              <span class="ml-1">{{
                (currentPage - 1) * pageSize + index + 1
              }}</span>
            </div>
            <div class="flex align-items-center">
              <ElButton type="danger" text @click.stop="removeItem(item.id)">{{
                $t('public_button_delete')
              }}</ElButton>
            </div>
          </div>
          <div :key="`connection${item.id}`" class="setting-item mt-4">
            <label class="item-label"
              >{{
                $t(
                  'packages_business_components_conditionbox_daijiaoyanlianjie',
                )
              }}:</label
            >
            <AsyncSelect
              :key="`sourceConnectionId${item.id}`"
              v-model="item.source.connectionId"
              :method="getConnectionsListMethod"
              item-query="name"
              item-value="id"
              filterable
              class="item-select"
              @option-select="handleChangeConnection($event, item.source)"
            />
            <span class="item-icon fs-6">
              <el-icon><el-icon-arrow-right /></el-icon>
            </span>
            <AsyncSelect
              :key="`targetConnectionId${item.id}`"
              v-model="item.target.connectionId"
              :method="getConnectionsListMethod"
              item-query="name"
              item-value="id"
              filterable
              class="item-select"
              @option-select="handleChangeConnection($event, item.target)"
            />
          </div>
          <div :key="`table${item.id}`" class="setting-item mt-4">
            <label class="item-label"
              >{{
                $t('packages_business_components_conditionbox_laiyuanbiao')
              }}:</label
            >
            <AsyncSelect
              :key="`sourceTable${item.id}`"
              v-model="item.source.table"
              :method="getTableListMethod"
              :params="{
                connectionId: item.source.connectionId,
                nodeId: item.source.nodeId,
              }"
              item-query="name"
              item-type="string"
              lazy
              filterable
              class="item-select"
              @change="handleChangeTable($event, item, index, 'source')"
            />
            <span class="item-icon"
              >{{
                $t('packages_business_components_conditionbox_mubiaobiao')
              }}:</span
            >
            <AsyncSelect
              :key="`targetTable${item.id}`"
              v-model="item.target.table"
              :method="getTableListMethod"
              :params="{
                connectionId: item.target.connectionId,
                nodeId: item.target.nodeId,
              }"
              item-query="name"
              item-type="string"
              lazy
              filterable
              class="item-select"
              @change="handleChangeTable($event, item, index, 'target')"
            />
          </div>
          <div
            :key="`SchemaToForm${item.id}${index}${inspectMethod}`"
            class="setting-item mt-4"
          >
            <SchemaForm
              :ref="`schemaToForm_${item.id}`"
              :model-value="item"
              :schema="formSchema"
              :scope="schemaScope"
              :colon="true"
              class="w-100"
              label-width="130"
            />
          </div>
          <template v-if="!isCountOrHash">
            <div class="setting-item mt-4">
              <label class="item-label"
                >{{ $t('packages_business_verification_indexField') }}:
              </label>
              <FieldSelectWrap
                v-model:value="item.source.sortColumn"
                :options="item.source.fields"
                class="flex-1"
                @visible-change="handleFocus(item.source, $event)"
              />
              <span class="item-icon" />
              <FieldSelectWrap
                v-model:value="item.target.sortColumn"
                :options="item.target.fields"
                class="flex-1"
                @visible-change="handleFocus(item.target, $event)"
              />
            </div>

            <div class="setting-item mt-4">
              <label class="item-label"
                >{{ $t('packages_business_custom_collate') }}:
              </label>
              <div class="flex-1">
                <div class="flex gap-3 align-center">
                  <ElSwitch
                    v-model="item.source.enableCustomCollate"
                    @change="toggleCollate(item.source, $event)"
                  />

                  <ElButton
                    text
                    type="primary"
                    @click="schemaScope.openApiDrawer('inspect-collate')"
                  >
                    <VIcon class="mr-1">question-circle</VIcon>
                    {{ $t('public_view_docs') }}
                  </ElButton>
                </div>

                <div v-if="item.source.enableCustomCollate">
                  <CollateMap
                    v-model:value="item.source.collate"
                    :sort-coldumn="item.source.sortColumn"
                    :fields="item.source.fields"
                  />
                </div>
              </div>
              <span class="item-icon" />
              <div class="flex-1">
                <div class="flex gap-3 align-center">
                  <ElSwitch
                    v-model="item.target.enableCustomCollate"
                    @change="toggleCollate(item.target, $event)"
                  />

                  <ElButton
                    text
                    type="primary"
                    @click="schemaScope.openApiDrawer('inspect-collate')"
                  >
                    <VIcon class="mr-1">question-circle</VIcon>
                    {{ $t('public_view_docs') }}
                  </ElButton>
                </div>

                <div v-if="item.target.enableCustomCollate">
                  <CollateMap
                    v-model:value="item.target.collate"
                    :sort-column="item.target.sortColumn"
                    :fields="item.target.fields"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="
                nullsLastState[item.source.connectionId] ||
                nullsLastState[item.target.connectionId]
              "
              class="setting-item mt-4 align-items-center"
            >
              <label
                v-if="nullsLastState[item.source.connectionId]"
                class="item-label"
                >{{ $t('packages_business_nulls_first') }}
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :content="$t('packages_business_nulls_first_tip')"
                >
                  <i
                    class="el-tooltip el-icon-info"
                    style="color: #909399; font-size: 14px"
                  /> </el-tooltip
                >:
              </label>
              <label v-else class="item-label" />
              <div class="flex-1">
                <SwitchNumber
                  v-if="nullsLastState[item.source.connectionId]"
                  v-model:value="item.source.customNullSort"
                />
              </div>

              <span
                v-if="nullsLastState[item.target.connectionId]"
                class="item-icon"
                >{{ $t('packages_business_nulls_first')
                }}<el-tooltip
                  effect="dark"
                  placement="top"
                  :content="$t('packages_business_nulls_first_tip')"
                >
                  <i
                    class="el-tooltip el-icon-info"
                    style="color: #909399; font-size: 14px"
                  /> </el-tooltip
                >:</span
              >
              <div
                v-if="nullsLastState[item.target.connectionId]"
                class="flex-1"
              >
                <SwitchNumber v-model:value="item.target.customNullSort" />
              </div>
            </div>
          </template>

          <div
            v-if="inspectMethod === 'field'"
            class="setting-item align-items-center mt-4"
          >
            <label class="item-label"
              >{{
                $t('packages_business_components_fieldbox_daijiaoyanmoxing')
              }}:</label
            >
            <ElRadioGroup
              v-model="item.modeType"
              :disabled="getModeTypeDisabled(item)"
              @change="handleChangeModeType(arguments[0], item, index)"
            >
              <ElRadio label="all">{{
                $t('packages_business_components_fieldbox_quanziduan')
              }}</ElRadio>
              <ElRadio label="custom">{{
                $t('packages_business_connections_databaseform_zidingyi')
              }}</ElRadio>
            </ElRadioGroup>
            <ElLink
              v-if="item.modeType === 'custom'"
              type="primary"
              class="ml-4"
              @click="handleCustomFields(item, index)"
            >
              {{
                $t('packages_business_components_conditionbox_chakanzidingyi')
              }}
              ({{ item.source.columns ? item.source.columns.length : 0 }})
            </ElLink>
          </div>
          <div v-show="inspectMethod === 'field'" class="setting-item mt-4">
            <ElCheckbox
              v-model="item.showAdvancedVerification"
              @change="handleChangeAdvanced(item)"
              >{{ $t('packages_business_verification_advanceVerify') }}
            </ElCheckbox>
          </div>
          <div
            v-if="item.showAdvancedVerification && inspectMethod === 'field'"
            class="setting-item mt-4"
          >
            <label class="item-label"
              >{{ $t('packages_business_verification_JSVerifyLogic') }}:
            </label>
            <ElButton
              v-if="!item.webScript || item.webScript === ''"
              @click="addScript(index)"
              >{{ $t('packages_business_verification_addJS') }}
            </ElButton>
            <template v-else>
              <ElButton
                text
                type="primary"
                class="ml-4"
                @click="editScript(index)"
                >{{ $t('public_button_edit') }}</ElButton
              >
              <ElButton
                text
                type="primary"
                class="ml-4"
                @click="removeScript(item)"
                >{{ $t('public_button_delete') }}
              </ElButton>
            </template>
          </div>
          <div
            v-if="
              inspectMethod === 'field' &&
              item.showAdvancedVerification &&
              item.webScript
            "
            class="setting-item mt-4"
          >
            <pre class="item-script">{{ item.webScript }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Add pagination controls -->

    <div class="joint-table-footer flex align-center">
      <ElButton @click="addItem">{{
        $t('packages_business_verification_addTable')
      }}</ElButton>
      <ElButton
        v-if="taskId"
        type="primary"
        :disabled="!!list.length"
        :loading="autoAddTableLoading"
        @click="autoAddTable"
        >{{ $t('packages_business_verification_button_auto_add_table') }}
      </ElButton>

      <template v-if="!isCountOrHash">
        <el-divider class="mx-3" direction="vertical" />
        <div class="inline-flex align-items-center">
          <span class="fs-7">{{
            $t('packages_business_auto_fill_join_fields')
          }}</span>
          <el-tooltip class="color-primary" effect="dark" placement="top">
            <template #content>
              <div>
                {{ $t('packages_business_auto_fill_join_tooltip_title') }}
              </div>
              <div>
                {{ $t('packages_business_auto_fill_join_tooltip_primary') }}
              </div>
              <div>
                {{ $t('packages_business_auto_fill_join_tooltip_notnull') }}
              </div>
              <div>
                {{ $t('packages_business_auto_fill_join_tooltip_all') }}
              </div>
            </template>
            <i class="el-icon-question" />
          </el-tooltip>
          <el-switch v-model="autoSuggestJoinFields" class="ml-3" />
        </div>
      </template>

      <div
        v-if="filteredList.length > 0"
        class="pagination-container text-center ml-auto"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          hide-on-single-page
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="filteredList.length"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <ElDialog
      v-model="dialogAddScriptVisible"
      width="60%"
      :title="$t('packages_business_verification_JSVerifyLogic')"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox">
          <div class="js-fixText">
            <span style="color: #0000ff">function </span
            ><span> validate(sourceRow){</span>
          </div>
          <VCodeEditor
            v-model:value="webScript"
            height="500"
            class="js-editor"
          />
          <div class="js-fixText">}</div>
        </div>
        <GitBook
          v-resize.left="{
            minWidth: 350,
            maxWidth: 500,
          }"
          :value="doc"
          class="example ml-4 color-primary"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleAddScriptClose">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="submitScript">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
    <FieldDialog ref="fieldDialog" @save="handleChangeFields" />

    <DocsDrawer v-model="showDoc" :path="docPath" />
  </div>
</template>

<style lang="scss" scoped>
.joint-table {
  border-radius: 4px;
  border: 1px solid #e8e8e8;

  &.error {
    border-color: map.get($color, danger);
  }
}

.joint-table-header {
  background: map.get($bgColor, normal);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.joint-table-footer {
  padding: 16px 24px;
}

.joint-table-main {
  max-height: 500px;
  overflow-y: auto;

  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid map.get($borderColor, light);
  }

  .joint-table-setting {
    flex: 1;
    background-color: map.get($bgColor, white);
  }

  .setting-item {
    display: flex;
    margin-bottom: 0;

    .el-form-item__content {
      display: flex;
      align-items: center;
      line-height: 1;
    }

    .item-label {
      width: 120px;
      line-height: 32px;
      text-align: left;
      color: map.get($fontColor, light);
    }

    .item-icon {
      margin: 0 10px;
      width: 120px;
      line-height: 32px;
      color: map.get($fontColor, light);
      text-align: center;
    }

    .item-time-picker,
    .item-input,
    .item-select,
    .item-filter {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-filter-body {
      padding: 16px;
      background: map.get($fontColor, normal);
      border-radius: 2px;
      color: map.get($fontColor, slight);

      .filter-example-label {
        margin-top: 8px;
        color: #bfd0ff;
        line-height: 17px;
      }

      .filter-example {
        margin-top: 8px;
        padding: 8px;
        line-height: 30px;
        background: #262838;
        color: #82b290;
      }
    }

    .item-value-text {
      flex: 1;
      line-height: 32px;
      padding: 0 16px;
    }

    .item-script {
      margin: 0;
      padding: 16px 24px;
      width: 100%;
      max-height: 130px;
      overflow: auto;
      border-radius: 5px;
      border-left: 5px solid map.get($color, primary);
      background: #eff1f4;
      font-size: 12px;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      line-height: 17px;
    }
  }
}

.FieldList {
  height: 280px;
}

.empty-data {
  :deep(.el-select) {
    .el-input__inner {
      border-color: #d44d4d;
    }
  }
}

.scheme-to-form {
  :deep(
    .formily-element-plus-form-item-layout-horizontal
      .formily-element-plus-form-item-control-content-component
      > .el-switch
  ) {
    height: 32px;
    line-height: 32px;
  }
}
</style>

<style lang="scss">
.condition-js-doc-content {
  color: rgb(48, 54, 63);
  font-size: 16px;
  font-weight: 400;
  -webkit-font-smoothing: subpixel-antialiased;
  line-height: 1.5;
  overflow-wrap: break-word;
  hyphens: auto;

  p {
    margin-block-start: 12px;
    margin-block-end: 24px;
    text-align: justify;
  }

  > :first-child,
  section > :first-child,
  td > :first-child {
    margin-block-start: 0px !important;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    position: relative;
    margin-block-start: 24px;
    margin-block-end: 12px;
    font-weight: 600;
    margin: 0px;
  }

  h1 + h2,
  h2 + h3,
  h3 + h4,
  h4 + h5,
  h5 + h6 {
    margin-block-start: 12px;
  }

  h1,
  h2,
  h3 {
    letter-spacing: 0.05em;
  }

  h2 {
    font-size: 24px;
    line-height: 36px;
  }

  h3 {
    font-size: 20px;
    line-height: 36px;
  }

  h4 {
    font-size: 18px;
    line-height: 24px;
  }

  ul {
    list-style-type: disc;
  }

  ul,
  ol {
    padding-inline-start: 32px;
  }

  ul,
  ol,
  dl {
    margin-block-start: 12px;
    margin-block-end: 24px;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    line-height: 1.8;
    list-style-type: unset;
  }
}
</style>
