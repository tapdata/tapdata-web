import { fetchMetadataInstances } from '@tap/api'
import { uid } from '@tap/shared'
import { merge } from 'lodash-es'
import type { Ref } from 'vue'

export const makeTree = (data: any[]) => {
  const root: any = {
    children: [],
  }

  for (const item of data) {
    const { field_name, field_alias } = item
    let parent = root
    const fields = field_name.split('.')

    for (let i = 0; i < fields.length; i++) {
      const name = fields[i]
      let child = parent.children.find((c: any) => c.name === name)

      if (!child) {
        child = {
          label: field_alias || name,
          name,
          children: [],
        }
        parent.children.push(child)
      }

      parent = child

      if (i === fields.length - 1) {
        Object.assign(parent, item, {
          label: field_alias || name,
          name,
          dataType: item.data_type.replace(/\(.+\)/, ''),
        })
      }
    }
  }

  return root.children
}

export const filterNode = (value: string, data: any) => {
  if (!value) return true
  const val = value.toLowerCase()
  return (
    data.label?.toLowerCase().includes(val) ||
    data.name?.toLowerCase().includes(val)
  )
}

interface ParamItem {
  name: string
  type: string | string[]
  defaultvalue: string
  description: string
  systemParam: boolean
  required: boolean
}

export const useDrawer = (t: any, apiApplication?: Ref<any>) => {
  const AllowedTypes = [
    'doris',
    'mongodb',
    'mysql',
    'oracle',
    'postgres',
    'sqlserver',
    'tidb',
  ]
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

  // Constants
  const isHa = import.meta.env.MODE === 'ha'
  const baseType = [
    {
      value: 'number',
      label: 'number',
    },
    {
      value: 'string',
      label: 'string',
    },
    { value: 'boolean', label: 'boolean' },
    { value: 'date', label: 'date' },
    { value: 'datetime', label: 'datetime' },
    { value: 'time', label: 'time' },
  ]
  const typeOptions = [
    ...baseType,
    { value: 'array', label: 'array', children: baseType },
  ]

  const operatorOptions = ['>', '==', '<', '>=', '<=', '!=', 'like', 'in']
  const conditionOptions = ['and', 'or']
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
  const methodColorMap = {
    GET: 'blue',
    POST: 'green',
    TOKEN: 'orange',
  }

  const getDefaultParams = (apiType: string) => {
    const params: ParamItem[] = [
      {
        name: 'page',
        type: 'number',
        defaultvalue: '1',
        description: t('packages_business_data_server_drawer_fenyebianhao'),
        systemParam: true,
        required: false,
      },
      {
        name: 'limit',
        type: 'number',
        defaultvalue: '20',
        description: t('packages_business_data_server_drawer_meigefenyefan'),
        systemParam: true,
        required: false,
      },
    ]
    if (apiType === 'defaultApi') {
      params.push({
        name: 'filter',
        type: 'object',
        defaultvalue: '',
        description: t('public_data_filter_condition'),
        systemParam: true,
        required: false,
      })
    } else if (apiType === 'customerQuery') {
      params.push({
        name: 'fields',
        type: ['array', 'string'],
        defaultvalue: '',
        description: t('public_data_fields_condition'),
        systemParam: true,
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

  const genFormData = (formData: any = {}): Record<string, any> => {
    const apiType =
      formData.apiType === 'customerApi'
        ? 'customerQuery'
        : formData.apiType || 'defaultApi'
    const pathConfig = formData?.paths?.[0] || {}
    const params =
      pathConfig.params
        ?.filter((t: any) => t.name !== 'sort')
        .map((t: any) => {
          return {
            name: t.name,
            type: t.type.split(': '),
            defaultvalue: t.defaultvalue,
            description: t.description,
            required: t.required,
          }
        }) || getDefaultParams(formData.apiType)
    if (
      apiType === 'customerQuery' &&
      !params.map((t: any) => t.name).includes('fields')
    ) {
      params.splice(2, 0, {
        name: 'fields',
        type: ['array', 'string'],
        defaultvalue: '',
        description: t('public_data_fields_condition'),
        required: false,
      })
    }

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

  const formatHander = {
    upperCase: (value: string) => value.toUpperCase(),
    lowerCase: (value: string) => value.toLowerCase(),
    snakeToCamel: (value: string) =>
      value.replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
    camelToSnake: (value: string) =>
      value.replaceAll(/([A-Z])/g, '_$1').toLowerCase(),
  }

  const getMethodClass = (method: keyof typeof methodColorMap) => {
    const color = methodColorMap[method]
    return `bg-${color}-50 text-${color}-800 border-${color}-200 dark:bg-${color}-950 dark:text-${color}-300 dark:border-${color}-800`
  }

  const changeable = (item: any, fromVal: any) => {
    if (fromVal.apiType === 'customerQuery') {
      return !item.name || !['page', 'limit', 'fields'].includes(item.name)
    } else if (fromVal.apiType === 'defaultApi') {
      return !item.name || !['page', 'limit', 'filter'].includes(item.name)
    }
    return true
  }

  return {
    rules,
    isHa,
    baseType,
    typeOptions,
    operatorOptions,
    conditionOptions,
    apiTypeOptions,
    AllowedTypes,
    methodColorMap,
    getDefaultParams,
    getInitData,
    genFormData,
    formatHander,
    getMethodClass,
    changeable,
  }
}

export const getTableOptions = async (filter: any) => {
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

  const data = await fetchMetadataInstances(newFilter)

  return {
    items: data.items.map((it: any) => ({
      name: it.original_name,
      ...it,
    })),
    total: data.total,
  }
}
