<script setup lang="ts">
import {
  createMetadataDefinition,
  deleteMetadataDefinition,
  patchMetadataDefinition,
} from '@tap/api/core/metadata-definitions'
import { fetchMetadataInstances } from '@tap/api/core/metadata-instances'
import {
  createDiscoveryTags,
  getDiscoveryDirectoryData,
} from '@tap/api/src/core/discovery'
import { createMDMTask } from '@tap/api/src/core/ldp'
import { checkTaskName } from '@tap/api/src/core/task'
import { CancelToken } from '@tap/api/src/request'
import { makeDragNodeImage, TASK_SETTINGS } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import { FieldSelect, mapFieldsData } from '@tap/form'
import { validateCron } from '@tap/form/src/shared/validate'
import { useI18n } from '@tap/i18n'
import LeaderLine from '@tap/leader-line'
import { generateId, uuid } from '@tap/shared'
import { useAnimEvent } from '@tap/shared/src/composables/useAnimEvent'
import { useIntersectionObserver } from '@vueuse/core'
import { debounce } from 'lodash-es'
import {
  computed,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  resolveComponent,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore - vuex type issue
import { useStore } from 'vuex'

// Props
interface Props {
  directory?: any
  settings?: any
  dragState?: any
  mdmConnection?: any
  mdmNotExist?: boolean
  eventDriver?: any
  loadingDirectory?: boolean
  mapCatalog: (item: any) => any
  showParentLineage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  directory: undefined,
  settings: undefined,
  dragState: undefined,
  mdmConnection: undefined,
  mdmNotExist: false,
  eventDriver: undefined,
  loadingDirectory: false,
  showParentLineage: false,
})

// Emits
const emit = defineEmits<{
  preview: [data: any, connection: any, callback?: any]
  findParent: [el: HTMLElement, data: any]
  showSettings: []
  nodeDragEnd: []
  handleConnection: []
  onScroll: []
  updateAnchor: [anchor: LeaderLine.AnchorAttachment, data: any]
}>()

// Router & Store
const router = useRouter()
const store = useStore()

// Refs
const tree = ref<InstanceType<typeof ElTree>>()
const form = ref<InstanceType<typeof ElForm>>()
const search = ref<InstanceType<typeof ElInput>>()
const treeWrap = ref<HTMLElement>()
const tableNameInput = ref<InstanceType<typeof ElInput>>()
const scrollWrap = ref<HTMLElement>()
let stopObserver: (() => void) | null

// State from mixin (formRules & cronOptions)
const { t } = useI18n()

const validateTaskName = async (_rule: any, value: string, callback: any) => {
  value = value.trim()
  if (!value) {
    callback(new Error(t('packages_business_relation_list_qingshururenwu')))
  } else {
    try {
      const isExist = await checkTaskName({ name: value })
      if (isExist) {
        callback(new Error(t('packages_dag_task_form_error_name_duplicate')))
      } else {
        callback()
      }
    } catch {
      callback()
    }
  }
}

const validatePrefix = (_rule: any, value: string, callback: any) => {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!/\w+/.test(value)) {
    callback(new Error(t('packages_business_data_server_drawer_geshicuowu')))
  } else {
    callback()
  }
}

const validateCrontabExpression = (
  _rule: any,
  value: string,
  callback: any,
) => {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!validateCron(value)) {
    callback(t('packages_dag_migration_settingpanel_cronbiao'))
  } else {
    callback()
  }
}

const cronOptions = [
  {
    label: t('packages_ldp_run_only_once'),
    value: 'once',
  },
  {
    label: t('packages_ldp_run_every_10_minutes'),
    value: '0 */10 * * * ?',
  },
  {
    label: t('packages_ldp_run_every_hour'),
    value: '0 0 * * * ?',
  },
  {
    label: t('packages_ldp_run_every_day'),
    value: '0 0 0 * * ?',
  },
  {
    label: t('packages_ldp_custom_cron_expression'),
    value: 'custom',
  },
]

const formRules: any = {
  taskName: [{ validator: validateTaskName, trigger: 'blur' }],
  newTableName: [{ required: true }],
  prefix: [{ validator: validatePrefix, trigger: 'blur' }],
  'task.crontabExpression': [
    {
      required: true,
      message: t('public_form_not_empty'),
      trigger: ['blur', 'change'],
    },
    { validator: validateCrontabExpression, trigger: ['blur', 'change'] },
  ],
}

// Computed from mixin
const startingTour = computed(() => store.getters.startingTour)

// State
const creating = ref(false)
const taskDialogConfig = ref({
  from: null as any,
  to: null as any,
  visible: false,
  prefix: 'f_',
  tableName: null as any,
  newTableName: null as any,
  notSupportedCDC: false,
  task: {
    type: 'initial_sync+cdc',
    crontabExpressionFlag: false,
    crontabExpression: '',
    crontabExpressionType: 'once',
  },
  fields: [] as any[],
  updateConditionFields: [] as any[],
  loading: false,
  tagId: undefined as any,
})

const expandedKeys = ref<string[]>([])
const dialogConfig = ref({
  type: 'add',
  id: '',
  gid: '',
  label: '',
  title: '',
  itemType: 'resource',
  desc: '',
  visible: false,
  item: null as any,
  isParent: true,
})

const searchIng = ref(false)
const searchValue = ref('')
const enableSearch = ref(false)
const filterTreeData = ref<any[]>([])
const tablePrefix = ref('MDM_')
const showMaterialized = ref(false)
const materializedTableName = ref('')
const createMethod = ref('transformation')
const currentKey = ref('')
const currentEl = ref<HTMLElement>()

// Search & Cancel
let cancelSource: any = null
let draggingNodeImage: any = null

// Scroll handler with useAnimEvent
const { wrappedListener: onScroll } = useAnimEvent(
  () => {
    handleScroll?.()
  },
  {
    keepLoop: 500,
    autoCleanup: true,
    enabled: true,
  },
)

// Computed
const treeData = computed(() => props.directory?.children || [])

const allowDrop = computed(() => {
  return (
    !props.mdmNotExist &&
    props.dragState.isDragging &&
    ['SOURCE', 'FDM'].includes(props.dragState.from) &&
    props.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
  )
})

const isDragSelf = computed(() => {
  return props.dragState.isDragging && props.dragState.from === 'MDM'
})

// Watch
watch(
  () => props.loadingDirectory,
  (v) => {
    if (!v) {
      setNodeExpand()
    }
  },
)

watch(
  () => props.showParentLineage,
  (v) => {
    if (!v) {
      stopObserver?.()
      stopObserver = null
    }
  },
)

// Methods from mixin
function toggleEnableSearch() {
  if (enableSearch.value) {
    searchValue.value = ''
    enableSearch.value = false
  } else {
    enableSearch.value = true
    nextTick(() => {
      search.value?.focus()
    })
  }
}

function handleSearch(val: string) {
  if (!val) {
    searchIng.value = false
    debouncedSearch.cancel()
    return
  }
  searchIng.value = true
  debouncedSearch(val)
}

function openRoute(route: any, newTab = true) {
  if (newTab) {
    window.open(router.resolve(route).href)
  } else {
    router.push(route)
  }
}

function handleClickName(task: any) {
  if (!task?.id) return

  let routeName

  if (!['edit', 'wait_start'].includes(task.status)) {
    routeName = task.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
  } else {
    routeName = task.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
  }

  openRoute({
    name: routeName,
    query: {
      tour: startingTour.value ? true : undefined,
    },
    params: {
      id: task.id,
    },
  })
}

function loadObjects(
  node: any,
  isCurrent = true,
  queryKey?: string,
  cancelToken?: any,
) {
  const where = {
    page: 1,
    pageSize: 10000,
    tagId: node.id,
    range: isCurrent ? 'current' : undefined,
    sourceType: 'table',
    queryKey,
    regUnion: false,
    fields: {
      allTags: 1,
    },
  }
  return getDiscoveryDirectoryData(where, {
    cancelToken,
  }).then((res) => {
    return res.items.map((item: any) =>
      Object.assign(item, {
        isLeaf: true,
        isObject: true,
        connectionId: item.sourceConId,
        LDP_TYPE: 'table',
        parent_id: node.id,
        isVirtual: item.status === 'noRunning',
      }),
    )
  })
}

async function searchObject(searchText: string) {
  cancelSource?.cancel()
  cancelSource = CancelToken.source()
  searchIng.value = true
  const result = await loadObjects(
    props.directory,
    false,
    searchText,
    cancelSource.token,
  )
  const map = result.reduce((obj: any, item: any) => {
    const id = item.listtags?.[0]?.id || props.directory.id
    const children = obj[id] || []
    children.push(item)
    obj[id] = children
    return obj
  }, {})

  const filterTree = (node: any): any => {
    const newNode = { ...node }

    if (node.children?.length) {
      newNode.children = node.children
        .map((child: any) => filterTree(child))
        .filter(
          (child: any) =>
            child.LDP_TYPE === 'folder' &&
            (child.name.includes(searchText) || child.children.length),
        )
    } else {
      newNode.children = []
    }

    if (map[node.id]) {
      newNode.children.push(...map[node.id].map((child: any) => ({ ...child })))
    }

    return newNode
  }

  const root = filterTree(props.directory)
  searchIng.value = false
  filterTreeData.value = root.children
}

function handleChangeCronType(val: string) {
  if (val === 'once') {
    taskDialogConfig.value.task.crontabExpressionFlag = false
  } else {
    taskDialogConfig.value.task.crontabExpressionFlag = true
    if (val !== 'custom') {
      taskDialogConfig.value.task.crontabExpression = val
    }
  }
}

// Unused but kept for potential future use
// function setExpand(id: string, isExpand: boolean) {
//   const i = expandedKeys.value.indexOf(id)
//   if (!isExpand) {
//     if (~i) expandedKeys.value.splice(i, 1)
//   } else if (!~i) expandedKeys.value.push(id)
// }

// Unused but kept for potential future use
// function handeNodeCollapse(data: any) {
//   setExpand(data.id, false)
// }

// Unused but kept for potential future use
// async function makeTaskName(source: string) {
//   const taskNames = await fetchTasks({
//     limit: 9999,
//     fields: { name: 1 },
//     where: { name: { like: `^${source}\\d+$` } },
//   })
//   let def = 1
//   if (taskNames?.items.length) {
//     const arr = [0]
//     taskNames.items.forEach((item: any) => {
//       const res = item.name.match(new RegExp(`^${source}(\\d+)$`))
//       if (res && res[1]) arr.push(+res[1])
//     })
//     arr.sort((a, b) => a - b)
//     def = arr.pop() + 1
//   }
//   return `${source}${def}`
// }

function findParentByClassName(parent: any, cls: string) {
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode
  }
  return parent
}

// Component specific methods
function renderContent(_h: any, { node, data }: any) {
  let icon
  let actions
  data.SWIM_TYPE = 'mdm'

  if (!data.isObject) {
    actions = h('div', { class: 'btn-menu' }, [
      h(
        IconButton,
        {
          sm: true,
          onClick: (ev: Event) => {
            ev.stopPropagation()
            showDialog(data, 'add')
          },
        },
        () => 'add',
      ),
      h(
        resolveComponent('ElDropdown'),
        {
          placement: 'bottom',
          trigger: 'click',
          onCommand: (command: string) => handleMoreCommand(command, data),
        },
        {
          default: () =>
            h(
              IconButton,
              {
                sm: true,
                onClick: (ev: Event) => {
                  ev.stopPropagation()
                },
              },
              () => 'more',
            ),
          dropdown: () =>
            h(resolveComponent('ElDropdownMenu'), {}, () => [
              h(resolveComponent('ElDropdownItem'), { command: 'edit' }, () =>
                t('public_button_edit'),
              ),
              h(resolveComponent('ElDropdownItem'), { command: 'delete' }, () =>
                t('public_button_delete'),
              ),
            ]),
        },
      ),
    ])
  }

  if (data.LDP_TYPE === 'table') {
    node.isLeaf = true
    icon = 'table'
  } else {
    node.isLeaf = false
    icon = 'folder-o'
  }

  return h(
    'div',
    {
      class: 'custom-tree-node grabbable flex justify-content-between',
      onClick: () => {
        data.isObject &&
          emit('preview', data, props.mdmConnection, {
            onDelete: () => {
              tree.value?.remove(data.id)
            },
          })
      },
      onDragenter: (ev: DragEvent) => {
        ev.stopPropagation()
        handleTreeDragEnter(ev, data)
      },
      onDragover: (ev: DragEvent) => {
        ev.stopPropagation()
        handleTreeDragOver(ev)
      },
      onDragleave: (ev: DragEvent) => {
        ev.stopPropagation()
        handleTreeDragLeave(ev)
      },
      onDrop: (ev: DragEvent) => {
        ev.stopPropagation()
        handleTreeDrop(ev, data)
      },
    },
    [
      h('div', { class: 'flex align-center flex-fill mr-2' }, [
        h('div', { class: 'flex-fill w-0 inline-flex align-items-center' }, [
          h(
            'span',
            {
              id: data.isObject ? `ldp_mdm_table_${data.id}_${data.name}` : '',
              class: 'inline-flex align-items-center overflow-hidden',
            },
            [
              icon &&
                h(
                  resolveComponent('VIcon'),
                  { size: '18', class: 'tree-item-icon mr-2' },
                  () => icon,
                ),
              h('span', { title: data.name, class: 'table-label' }, data.name),
            ],
          ),
        ]),
      ]),
      h('div', {}, [
        data.comment &&
          h('span', { class: 'font-color-sslight' }, `(${data.comment})`),
        data.isObject
          ? h(
              resolveComponent('ElTooltip'),
              {
                'show-after': 200,
                'hide-after': 0,
                enterable: false,
                content: t('packages_ldp_view_lineage'),
                placement: 'top',
              },
              {
                default: () =>
                  h(
                    resolveComponent('VIcon'),
                    {
                      size: '18',
                      class: 'lineage-icon',
                      onClick: (ev: Event) => {
                        ev.stopPropagation()
                        handleFindLineage(data)
                      },
                    },
                    () => 'suyuan',
                  ),
              },
            )
          : actions,
      ]),
    ],
  )
}

// Unused but kept for potential future use
// function handleCommand(command: string) {
//   switch (command) {
//     case 'config':
//       emit('showSettings')
//       break
//   }
// }

function handleDragOver(ev: DragEvent) {
  ev.preventDefault()
}

function handleDragEnter(ev: DragEvent) {
  ev.preventDefault()

  if (!allowDrop.value) return

  const dropNode = findParentByClassName(ev.currentTarget, 'tree-wrap')
  dropNode.classList.add('is-drop')
}

function handleDragLeave(ev: DragEvent) {
  ev.preventDefault()
  if (!allowDrop.value) return
  const target = ev.currentTarget as HTMLElement | null
  if (target && !target.contains(ev.relatedTarget as Node)) {
    removeDropEffect(ev, 'tree-wrap', 'is-drop')
  }
}

function handleDrop(ev: DragEvent) {
  ev.preventDefault()

  removeDropEffect(ev, 'tree-wrap', 'is-drop')

  if (!allowDrop.value) return

  showTaskDialog()
}

function showTaskDialog(tagId?: string) {
  const {
    draggingObjects: [object],
  } = props.dragState

  taskDialogConfig.value.from = object.parent.data
  taskDialogConfig.value.tableName = object.data.name
  taskDialogConfig.value.newTableName = object.data.name.replace(/^FDM_/, '')
  taskDialogConfig.value.tagId = tagId
  taskDialogConfig.value.visible = true
  form.value?.resetFields()
  taskDialogConfig.value.task.crontabExpressionFlag = false
  taskDialogConfig.value.task.crontabExpression = ''

  const capbilitiesMap = taskDialogConfig.value.from.capabilities.reduce(
    (map: any, item: any) => {
      map[item.id] = true
      return map
    },
    {},
  )

  if (
    !capbilitiesMap.stream_read_function &&
    !capbilitiesMap.raw_data_callback_filter_function &&
    !capbilitiesMap.raw_data_callback_filter_function_v2 &&
    (!capbilitiesMap.query_by_advance_filter_function ||
      !capbilitiesMap.batch_read_function)
  ) {
    taskDialogConfig.value.notSupportedCDC = true
    taskDialogConfig.value.task.type = 'initial_sync'
  } else {
    taskDialogConfig.value.notSupportedCDC = false
  }

  loadFields()
}

function taskDialogSubmit(start: boolean, confirmTable?: boolean) {
  form.value?.validate(async (valid: boolean) => {
    if (!valid) return
    const {
      tableName,
      from,
      newTableName,
      tagId,
      task: settings,
    } = taskDialogConfig.value
    const task = Object.assign(
      makeTask(from, tableName, tablePrefix.value + newTableName),
      settings,
    )
    creating.value = true
    try {
      const result = await createMDMTask(task, {
        silenceMessage: true,
        params: { tagId, confirmTable, start },
      })
      taskDialogConfig.value.visible = false
      ElMessage.success({
        message: h(
          'span',
          {
            class: 'color-primary fs-7 clickable',
            onClick: () => {
              handleClickName(result)
            },
          },
          t('packages_business_task_created_success'),
        ),
      })
      setTimeout(() => {
        setNodeExpand(tagId)
      }, 1000)
    } catch (error: any) {
      const code = error?.data?.code
      const data = error?.data?.data
      if (code === 'Ldp.MdmTargetNoPrimaryKey' && data) {
        taskDialogConfig.value.visible = false
        ElMessage.warning({
          duration: 6000,
          showClose: true,
          message: h(
            'span',
            {
              class: 'color-primary fs-7 clickable',
              onClick: () => {
                handleClickName(data)
              },
            },
            t('packages_business_task_created_fail_no_primary_key'),
          ),
        })
        setTimeout(() => {
          setNodeExpand(tagId)
        }, 1000)
      } else if (code === 'Ldp.RepeatTableName') {
        ElMessageBox.confirm(
          t('packages_business_mdm_table_duplication_confirm'),
          '',
          {},
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }
          taskDialogSubmit(start, true)
        })
      } else if (code === 'Task.ListWarnMessage' && data) {
        const keys = Object.keys(data)
        const firstKey = keys[0]
        const msg = firstKey ? data[firstKey]?.[0]?.msg : undefined
        ElMessage.error(
          msg || error.data.message || t('public_message_save_fail'),
        )
      } else {
        ElMessage.error(error.data.message || t('public_message_save_fail'))
      }
    }
    creating.value = false
  })
}

function makeTask(from: any, tableName: string, newTableName: string) {
  const source = getTableNode(from, tableName)
  const target: any = getTableNode(props.mdmConnection, newTableName)

  target.updateConditionFields = taskDialogConfig.value.updateConditionFields

  return {
    ...TASK_SETTINGS,
    syncType: 'sync',
    name: getTaskName(from, tableName, newTableName),
    dag: {
      edges: [{ source: source.id, target: target.id }],
      nodes: [source, target],
    },
  }
}

function getTableNode(db: any = {}, tableName: string) {
  return {
    id: uuid(),
    type: 'table',
    name: tableName,
    tableName,
    connectionId: db.id,
    databaseType: db.database_type,
    attrs: {
      connectionName: db.name,
      connectionType: db.connection_type,
      accessNodeProcessId: db.accessNodeProcessId,
      pdkType: db.pdkType,
      pdkHash: db.pdkHash,
      capabilities: db.capabilities || [],
      hasCreated: false,
      db_version: db.db_version,
      connectionTags: db.definitionTags,
    },
  }
}

function getTaskName(from: any, tableName: string, newTableName: string) {
  return `${from.name}_Sync_${tableName}_To_MDM_${newTableName}_${generateId(6)}`
}

async function handleNodeExpand(
  data: any,
  node: any,
  forceLoadTable?: boolean,
) {
  // 十秒内加载过资源，不再继续加载
  if (!forceLoadTable && node.loadTime && Date.now() - node.loadTime < 10000)
    return

  node.loadTime = Date.now()
  node.loading = true
  const objects = await loadObjects(data)
  node.loading = false

  const childrenMap = data.children
    ? data.children.reduce(
        (map: any, item: any) => ((map[item.id] = true), map),
        {},
      )
    : {}

  objects.forEach((item: any) => {
    if (childrenMap[item.id]) {
      delete childrenMap[item.id]
      return
    }
    item.parent_id = data.id
    item.isObject = true
    item.connectionId = item.sourceConId
    tree.value?.append(item, node as any)
  })

  // 删除不存在的模型节点
  Object.entries(childrenMap).forEach(([key, item]: [string, any]) => {
    if (item && item.isObject) {
      tree.value?.remove(key as any)
    }
  })
}

function setNodeExpand(tagId?: string, forceLoadTable?: boolean) {
  if (!tagId || tagId === props.directory?.id) {
    props.directory?.id &&
      handleNodeExpand(props.directory, tree.value?.root, forceLoadTable)
  } else {
    const node = tree.value?.getNode(tagId)
    if (node) {
      handleNodeExpand(node.data, node, forceLoadTable)
      expandedKeys.value = [tagId]
    }
  }
}

function handleTreeDragOver(ev: DragEvent) {
  ev.preventDefault()
}

function handleTreeDragEnter(ev: DragEvent, data: any) {
  ev.preventDefault()

  if (allowDrop.value && data.isObject) return
  if (!allowDrop.value && !isDragSelf.value) return

  const dropNode = findParentNodeByClassName(ev.currentTarget, 'el-tree-node')
  dropNode.classList.add('is-drop-inner')
}

function handleTreeDragLeave(ev: DragEvent) {
  ev.preventDefault()
  if (!allowDrop.value && !isDragSelf.value) return
  const target = ev.currentTarget as HTMLElement | null
  if (target && !target.contains(ev.relatedTarget as Node)) {
    removeDropEffect(ev, 'el-tree-node')
    if (!ev.relatedTarget) {
      removeDropEffect(ev, 'tree-wrap', 'is-drop')
    }
  }
}

function handleTreeDrop(ev: DragEvent, data: any) {
  ev.preventDefault()

  if (!allowDrop.value) return

  removeDropEffect(ev, 'el-tree-node')
  removeDropEffect(ev, 'tree-wrap', 'is-drop')

  showTaskDialog(!data.isObject ? data.id : undefined)
}

function handleSelfDrop(draggingNode: any, dropNode: any) {
  if (dropNode.data.isObject) return
  if (!draggingNode.data.isObject) {
    patchMetadataDefinition({
      id: draggingNode.data.id,
      parent_id: dropNode.data.id || '',
    })
      .then(() => {
        ElMessage.success(t('public_message_operation_success'))
        draggingNode.data.parent_id = dropNode.data.id
      })
      .catch((error) => {
        ElMessage.error(error.message)
      })
  } else {
    moveTag(draggingNode.data.parent_id, dropNode.data.id, [draggingNode.data])
  }
}

function findParentNodeByClassName(el: any, cls: string) {
  let parent = el.parentNode
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode
  }
  return parent
}

function removeDropEffect(
  ev: DragEvent,
  cls = 'wrap__item',
  removeCls = 'is-drop-inner',
) {
  const dropNode = findParentByClassName(ev.currentTarget, cls)
  dropNode.classList.remove(removeCls)
}

function handleDragStart(draggingNodeParam: any, ev: DragEvent) {
  const wrappedNode = {
    ...draggingNodeParam,
    parent: {
      data: props.mdmConnection,
    },
  }
  draggingNodeImage = makeDragNodeImage(
    (ev.currentTarget as HTMLElement).querySelector('.tree-item-icon'),
    wrappedNode.data.name,
  )
  ;(ev.dataTransfer as DataTransfer).setDragImage(draggingNodeImage, 4, 4)
  ;(ev.dataTransfer as DataTransfer).effectAllowed = 'copy'
  // Mutate dragState as expected by parent (Dashboard)
  Object.assign(props.dragState, {
    isDragging: true,
    draggingObjects: [wrappedNode],
    from: 'MDM',
  })
}

function handleDragEnd() {
  emit('nodeDragEnd')
}

function showDialog(data: any, dialogType: string) {
  const type = dialogType || 'add'
  let itemType = 'resource'
  if (data && data.item_type) {
    itemType = data.item_type?.join('')
  }
  dialogConfig.value = {
    itemType,
    visible: true,
    type,
    item: data,
    id: data ? data.id : '',
    gid: data?.gid || '',
    label: type === 'edit' ? data.name : '',
    isParent: true,
    desc: type === 'edit' ? data?.desc : '',
    title:
      type === 'add'
        ? t('packages_component_classification_addChildernNode')
        : t('public_button_edit'),
  }
}

function hideDialog() {
  dialogConfig.value.visible = false
}

async function loadFields() {
  taskDialogConfig.value.loading = true
  taskDialogConfig.value.fields = []
  taskDialogConfig.value.updateConditionFields = []

  const {
    items: [schema = {}],
  } = await fetchMetadataInstances({
    page: 1,
    size: 1,
    where: {
      'source.id': taskDialogConfig.value.from.id,
      meta_type: { in: ['collection', 'table', 'view'] },
      is_deleted: false,
      sourceType: 'SOURCE',
      original_name: taskDialogConfig.value.tableName,
    },
    fields: {
      original_name: true,
      fields: true,
      qualified_name: true,
      name: true,
      indices: true,
      constraints: true,
    },
  }).finally(() => {
    taskDialogConfig.value.loading = false
  })

  const { fields } = mapFieldsData(schema)
  taskDialogConfig.value.fields = fields

  let defaultList = fields.filter((item: any) => item.isPrimaryKey)

  if (!defaultList.length) {
    defaultList = fields.filter((item: any) => item.indicesUnique)
  }

  if (!defaultList.length) {
    defaultList = fields.filter((item: any) => item.source === 'virtual_hash')
  }

  taskDialogConfig.value.updateConditionFields = defaultList.map(
    (item: any) => item.value,
  )
}

async function dialogSubmit() {
  const config = dialogConfig.value
  const value = config.label
  const id = config.id
  const itemType = [config.itemType]
  let method = createMetadataDefinition

  if (!value || value.trim() === '') {
    ElMessage.error(t('packages_component_classification_nodeName'))
    return
  }

  const params: any = {
    item_type: itemType,
    desc: config.desc,
    value,
  }

  if (config.type === 'edit') {
    method = patchMetadataDefinition
    params.id = id
    delete params.item_type
  } else if (id) {
    params.parent_id = id
  }

  try {
    const data = await method(params)
    hideDialog()
    ElMessage.success(t('public_message_operation_success'))
    if (data && config.type === 'add') {
      dialogConfig.value.item.children.push(props.mapCatalog(data))
    } else if (config.type === 'edit') {
      dialogConfig.value.item.name = params.value
      dialogConfig.value.item.desc = params.desc
    }
  } catch (error: any) {
    ElMessage.error(error.message)
  }
}

function checkAllowDrop(draggingNode: any, dropNode: any, type: string) {
  return type === 'inner' && isDragSelf.value && !dropNode.data.isObject
}

async function moveTag(from: string, to: string, objects: any[]) {
  if (from === to) return

  const tagBindingParams = objects.map((t) => {
    return {
      id: t.id,
      objCategory: t.category,
    }
  })

  await createDiscoveryTags({
    tagBindingParams,
    tagIds: [to],
    oldTagIds: [from],
  })
  objects.forEach((item) => (item.parent_id = to))
  ElMessage.success(t('public_message_operation_success'))
}

function handleMoreCommand(command: string, data: any) {
  switch (command) {
    case 'add':
    case 'edit':
      showDialog(data, command)
      break
    case 'delete':
      deleteNode(data)
  }
}

function deleteNode(data: any) {
  ElMessageBox.confirm(
    `${t('public_message_delete_confirm')}: ${data.name}?`,
    t('packages_business_catalog_delete_confirm_message'),
    {
      confirmButtonText: t('public_button_delete'),
    },
  ).then((resFlag) => {
    if (!resFlag) {
      return
    }
    deleteMetadataDefinition(data.id).then(() => {
      tree.value?.remove(data.id)

      // 删除目录刷新上一级加载被删除目录下的表
      setNodeExpand(data.parent_id, true)
    })
  })
}

function handleFindLineage(data: any) {
  const el = document.querySelector(
    `#ldp_mdm_table_${data.id}_${data.name}`,
  ) as HTMLElement

  if (el) {
    currentKey.value = data.id
    currentEl.value = el || undefined
    stopObserver?.()
    stopObserver = useIntersectionObserver(
      el,
      ([entry]) => {
        if (!props.showParentLineage) return
        const visible = entry?.isIntersecting || false

        if (!visible) {
          const container = scrollWrap.value!
          const containerRect = container.getBoundingClientRect()
          const targetRect = el.getBoundingClientRect()

          // 计算目标元素相对于容器的位置
          const targetTop =
            targetRect.top - containerRect.top + container.scrollTop
          const targetBottom = targetTop + targetRect.height
          const containerHeight = containerRect.height

          if (targetTop < container.scrollTop) {
            emit(
              'updateAnchor',
              LeaderLine.pointAnchor(container, {
                x: '50%',
                y: 0,
              })!,
              data,
            )
          } else if (targetBottom > container.scrollTop + containerHeight) {
            emit(
              'updateAnchor',
              LeaderLine.pointAnchor(container, {
                x: '50%',
                y: '100%',
              }),
              data,
            )
          }
        } else {
          emit('updateAnchor', el, data)
        }
      },
      {
        immediate: true,
        threshold: 0.5,
      },
    ).stop

    emit('findParent', el, data)
  }
}

function handleScroll() {
  if (!props.showParentLineage) return
  emit('onScroll')
}

function openMaterializedDialog() {
  materializedTableName.value = ''
  showMaterialized.value = true
  createMethod.value = 'transformation'
}

function createMaterializedView() {
  const tableName = materializedTableName.value.trim()

  if (!tableName) return

  router.push({
    name: 'DataflowNew',
    query: {
      by:
        createMethod.value === 'transformation'
          ? 'transformation-materialized'
          : 'materialized-view',
      connectionId: props.mdmConnection?.id || '',
      tableName: tablePrefix.value + tableName,
    },
  })
}

function handleDialogOpened() {
  nextTick(() => {
    tableNameInput.value?.focus()
  })
}

// Methods for Dashboard.vue to call
function handleFindTreeDom(val: any = {}) {
  const el = document.querySelector(
    `#ldp_mdm_table_${val.metadata?.id}_${val.table}`,
  ) as HTMLElement
  return el
}

function searchByKeywordList(val: any[] = []) {
  const searchExpandedKeys: string[] = []
  filterTreeData.value = val.map((t) => {
    searchExpandedKeys.push(t.connectionId)
    return {
      LDP_TYPE: 'connection',
      id: t.connectionId,
      name: t.connectionName,
      status: 'ready',
      isLeaf: false,
      level: 0,
      disabled: false,
      children: [
        {
          id: t.tableId,
          name: t.table,
          connectionId: t.connectionId,
          isLeaf: true,
          isObject: true,
          type: 'table',
          LDP_TYPE: 'table',
        },
      ],
    }
  })
  // Note: If you need searchExpandedKeys ref, add it to the component state
}

// Debounced search
const debouncedSearch = debounce(searchObject, 300)

// Lifecycle
onMounted(() => {
  if (!props.loadingDirectory) {
    nextTick(() => {
      setNodeExpand()
    })
  }
})

onUnmounted(() => {
  debouncedSearch?.cancel()
  cancelSource?.cancel()
  stopObserver?.()
})

// Expose methods that might be called from Dashboard.vue
defineExpose({
  handleFindTreeDom,
  searchByKeywordList,
  setNodeExpand,
})
</script>

<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_mdm') }}</span>
      <div class="flex-grow-1" />
      <ElTooltip
        placement="top"
        :content="$t('packages_dag_build_materialized_view')"
      >
        <IconButton :disabled="mdmNotExist" @click="openMaterializedDialog"
          >materialized</IconButton
        >
      </ElTooltip>
      <IconButton :disabled="mdmNotExist" @click="showDialog(directory, 'add')"
        >folder-plus</IconButton
      >
      <IconButton
        :disabled="mdmNotExist"
        :class="{ active: enableSearch }"
        @click="toggleEnableSearch"
        >search-outline</IconButton
      >
    </div>
    <div
      ref="treeWrap"
      class="flex flex-column flex-1 position-relative min-h-0 tree-wrap"
      @dragover.stop="handleDragOver"
      @dragenter.stop="handleDragEnter"
      @dragleave.stop="handleDragLeave"
      @drop.stop="handleDrop"
    >
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput
          ref="search"
          v-model="searchValue"
          clearable
          @keydown.stop
          @keyup.stop
          @click.stop
          @input="handleSearch"
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </div>

      <div
        ref="scrollWrap"
        class="flex-1 min-h-0 position-relative overflow-y-auto p-1"
        @scroll="onScroll"
      >
        <div
          v-if="searchValue || searchIng"
          v-loading="searchIng"
          class="search-view position-absolute top-0 left-0 w-100 h-100 bg-white"
        >
          <ElTree
            ref="tree"
            class="ldp-tree"
            node-key="id"
            :data="filterTreeData"
            draggable
            default-expand-all
            height="100%"
            wrapper-class-name="p-2"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="checkAllowDrop"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-drop="handleSelfDrop"
            @node-expand="handleNodeExpand"
          />
        </div>
        <template v-else>
          <ElTree
            ref="tree"
            class="ldp-tree"
            node-key="id"
            :data="treeData"
            draggable
            height="100%"
            wrapper-class-name="p-2"
            empty-text=""
            :default-expanded-keys="expandedKeys"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="checkAllowDrop"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-drop="handleSelfDrop"
            @node-expand="handleNodeExpand"
          />
          <div
            v-if="!treeData.length"
            class="flex justify-center align-center absolute-fill fs-7 font-color-light px-3"
          >
            <span
              class="text-center lh-base"
              v-html="$t('packages_business_mdm_empty_text')"
            />
          </div>
        </template>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop && !isDragSelf }"
      >
        Clone To MDM
      </div>
      <div
        v-if="mdmNotExist"
        class="drop-mask pe-auto flex justify-center align-center absolute-fill font-color-dark fs-6"
      >
        {{ $t('packages_ldp_connection_expired') }}
      </div>
    </div>

    <ElDialog v-model="taskDialogConfig.visible" :close-on-click-modal="false">
      <template #header>
        <span class="font-color-dark fs-6 fw-sub">{{
          $t('packages_business_create_sync_task')
        }}</span>
      </template>
      <ElForm
        ref="form"
        :model="taskDialogConfig"
        label-width="180px"
        :rules="formRules"
        @submit.prevent
      >
        <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
          {{ $t('packages_business_mdm_create_task_dialog_desc_prefix') }}
          <ul>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li1') }}
            </li>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li2') }}
            </li>
            <li>
              {{ $t('packages_business_fdm_create_task_dialog_desc_li3') }}
            </li>
          </ul>
          <div>
            {{ $t('packages_business_mdm_create_task_dialog_desc_suffix') }}
          </div>
          <div>
            {{ $t('packages_business_mdm_create_task_dialog_desc_table_name') }}
          </div>
        </div>
        <ElFormItem :label="$t('public_table_name')">
          <ElInput v-model="taskDialogConfig.newTableName">
            <template #prepend>{{ tablePrefix }}</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem
          :label="$t('packages_dag_task_setting_sync_type')"
          prop="task.type"
        >
          <ElRadioGroup v-model="taskDialogConfig.task.type">
            <ElTooltip
              :disabled="!taskDialogConfig.notSupportedCDC"
              :content="$t('packages_ldp_not_support_increments')"
            >
              <ElRadio
                label="initial_sync+cdc"
                :disabled="taskDialogConfig.notSupportedCDC"
              >
                {{ $t('packages_dag_task_setting_initial_sync_cdc') }}
              </ElRadio>
            </ElTooltip>

            <ElRadio label="initial_sync">
              {{ $t('public_task_type_initial_sync') }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <div
          v-if="taskDialogConfig.task.type === 'initial_sync'"
          class="flex align-center gap-3"
        >
          <ElFormItem
            :label="$t('packages_dag_task_setting_crontabExpressionFlag')"
            prop="task.crontabExpressionType"
            class="flex-1"
          >
            <ElSelect
              v-model="taskDialogConfig.task.crontabExpressionType"
              @change="handleChangeCronType"
            >
              <ElOption v-for="(opt, i) in cronOptions" v-bind="opt" :key="i" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="taskDialogConfig.task.crontabExpressionType === 'custom'"
            prop="task.crontabExpression"
            class="flex-1"
            label-width="auto"
            :label="$t('public_crontabExpression')"
          >
            <ElInput v-model="taskDialogConfig.task.crontabExpression" />
          </ElFormItem>
        </div>
        <ElFormItem
          :label="$t('packages_dag_nodes_table_gengxintiaojianzi')"
          prop="updateConditionFields"
        >
          <FieldSelect
            v-model="taskDialogConfig.updateConditionFields"
            :options="taskDialogConfig.fields"
            multiple
            :loading="taskDialogConfig.loading"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="taskDialogConfig.visible = false">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton :loading="creating" @click="taskDialogSubmit(false)">{{
            $t('packages_business_save_only')
          }}</ElButton>
          <ElButton
            :loading="creating"
            type="primary"
            @click="taskDialogSubmit(true)"
          >
            {{ $t('packages_business_save_and_run_now') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="dialogConfig.visible"
      width="30%"
      :close-on-click-modal="false"
    >
      <template #header>
        <span class="fs-6 fw-sub">{{ dialogConfig.title }}</span>
      </template>
      <ElForm
        ref="form"
        :model="dialogConfig"
        label-width="90px"
        label-position="top"
      >
        <ElFormItem
          :label="
            $t('packages_component_src_discoveryclassification_mulumingcheng')
          "
        >
          <ElInput
            v-model="dialogConfig.label"
            :placeholder="$t('packages_component_classification_nodeName')"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem
          :label="
            $t('packages_component_src_discoveryclassification_mulumiaoshu')
          "
        >
          <ElInput
            v-model="dialogConfig.desc"
            type="textarea"
            :placeholder="
              $t('packages_component_src_discoveryclassification_qingshurumulu')
            "
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="hideDialog()">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="dialogSubmit()">
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="showMaterialized"
      width="480px"
      :close-on-click-modal="false"
      @opened="handleDialogOpened"
    >
      <template #header>
        <span class="fs-6 fw-sub">{{
          $t('packages_dag_build_materialized_view')
        }}</span>
      </template>
      <ElForm
        ref="form"
        label-width="90px"
        label-position="top"
        @submit.prevent
      >
        <ElFormItem :label="$t('packages_dag_materialized_view_storage_table')">
          <ElInput ref="tableNameInput" v-model="materializedTableName">
            <template #prepend>{{ tablePrefix }}</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('packages_ldp_mdm_create_method')">
          <ElRadioGroup v-model="createMethod">
            <ElRadio label="transformation">{{
              $t('packages_ldp_mdm_create_method_transformation')
            }}</ElRadio>
            <ElRadio label="materialized">{{
              $t('packages_ldp_mdm_create_method_materialized')
            }}</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="showMaterialized = false">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton
            type="primary"
            :disabled="!materializedTableName.trim()"
            @click="createMaterializedView"
          >
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.ldp-tree {
  :deep(.el-tree-node__content) {
    .lineage-icon {
      color: var(--color-info);
    }
    &:hover {
      .lineage-icon {
        color: var(--color-primary);
      }
    }
  }
}
</style>
