<script setup lang="ts">
import {
  CancelToken,
  discoveryApi,
  ldpApi,
  metadataDefinitionsApi,
  taskApi,
} from '@tap/api'
import { DatabaseIcon } from '@tap/business/src/components/DatabaseIcon'
import {
  makeDragNodeImage,
  makeStatusAndDisabled,
  TASK_SETTINGS,
} from '@tap/business/src/shared'
import { VExpandXTransition } from '@tap/component/src/base/v-expand-x-transition'
import VIcon from '@tap/component/src/base/VIcon.vue'
import { IconButton } from '@tap/component/src/icon-button'
import { validateCron } from '@tap/form/src/shared/validate'
import { useI18n } from '@tap/i18n'
import { generateId, uuid } from '@tap/shared'
import { useResizeObserver } from '@vueuse/core'
import { cloneDeep, debounce } from 'lodash-es'
import {
  computed,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

// Props
interface Props {
  dragState: any
  settings: any
  fdmConnection: any
  fdmNotExist: boolean
  directory: any
  eventDriver: any
  mapCatalog: Function
  showParentLineage: boolean
  loadingDirectory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingDirectory: false,
})

// Emits
const emit = defineEmits<{
  'node-drag-end': []
  preview: [data: any, connection: any]
  'show-settings': []
  'load-directory': []
  'on-scroll': []
  'find-parent': [parentNode: any]
}>()

// Router and i18n
const router = useRouter()
const { t } = useI18n()

// Refs
const tree = ref()
const treeWrap = ref()
const search = ref()
const form = ref()

// Reactive data
const fixedPrefix = ref('FDM_')
const maxPrefixLength = ref(10)
const keyword = ref('')
const taskType = ref('')
const creating = ref(false)
const expandedKeys = ref<string[]>([])
const searchIng = ref(false)
const searchValue = ref('')
const enableSearch = ref(false)
const filterTreeData = ref<any[]>([])
const checkCanStartIng = ref(false)
const startedTags = ref<string[]>([])
const prefixMap = ref<Record<string, string>>({})
const autoUpdateObjectsTimer = ref<number>()
const cancelSource = ref<any>()
const debouncedSearch = ref<any>()
const draggingNode = ref<any>()
const draggingNodeImage = ref<any>()
const tag2Task = ref<Record<string, any>>({})
const searchExpandedKeys = ref<string[]>([])

// Task dialog config
const taskDialogConfig = ref({
  from: null as any,
  to: null as any,
  visible: false,
  prefix: '',
  tableName: null as string | null,
  canStart: false,
  notSupportedCDC: false,
  task: {
    type: 'initial_sync+cdc',
    crontabExpressionFlag: false,
    crontabExpression: '',
    crontabExpressionType: 'once',
  },
})

// Dialog config
const dialogConfig = ref({
  type: 'add',
  id: '',
  gid: '',
  label: '',
  title: '',
  itemType: 'resource',
  desc: '',
  visible: false,
})

const treeHeight = ref(0)
const treeWrapRef = useTemplateRef('treeWrapRef')

const { stop } = useResizeObserver(treeWrapRef, (entries) => {
  for (const entry of entries) {
    treeHeight.value = entry.contentRect.height
  }
})

// Computed
const showSearch = computed(() => {
  return searchValue.value || searchIng.value
})

const allowDrop = computed(() => {
  return (
    !props.fdmNotExist &&
    props.dragState.isDragging &&
    props.dragState.from === 'SOURCE' &&
    props.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
  )
})

const treeData = computed(() => {
  return props.directory?.children || []
})

console.log('treeData', treeData)

const treeMap = computed(() => {
  return treeData.value.reduce(
    (obj: any, item: any) => ((obj[item.id] = item), obj),
    {},
  )
})

// Cron options
const cronOptions = ref([
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
])

// Form rules
const formRules = ref({
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
})

// Validation functions
async function validateTaskName(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('packages_business_relation_list_qingshururenwu')))
  } else {
    try {
      const isExist = await taskApi.checkName({
        name: value,
      })
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

function validatePrefix(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!/\w+/.test(value)) {
    callback(new Error(t('packages_business_data_server_drawer_geshicuowu')))
  } else {
    callback()
  }
}

function validateCrontabExpression(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!validateCron(value)) {
    callback(t('packages_dag_migration_settingpanel_cronbiao'))
  } else {
    callback()
  }
}

// Methods
function autoUpdateObjects() {
  autoUpdateObjectsTimer.value = setInterval(() => {
    if (showSearch.value) return
    expandedKeys.value.forEach((id) => {
      updateObject(id)
    })
    loadTask()
  }, 5000)
}

async function updateObject(id: string) {
  const node = tree.value?.getNode(id)

  if (node) {
    node.loadTime = Date.now()
    const objects = await loadObjects(node.data)
    tree.value?.updateKeyChildren(id, objects)
  }
}

function openRoute(route: any, newTab = true) {
  if (newTab) {
    window.open(router.resolve(route).href)
  } else {
    router.push(route)
  }
}

function renderContent(h: any, { node, data }: { node: any; data: any }) {
  let icon
  const className = [
    'custom-tree-node',
    'overflow-visible',
    'position-relative',
    'min-width-0',
  ]

  if (data.isObject) {
    className.push('grabbable')
  }

  if (data.LDP_TYPE === 'table') {
    node.isLeaf = true
    icon = 'table'
  } else {
    node.isLeaf = false
    icon = 'folder-o'
  }

  const actions = []

  if (!data.isObject) {
    if (data.children.some((child: any) => child.isVirtual)) {
      actions.push(
        h(
          IconButton,
          {
            sm: true,
            disabled: node.loading,
            onClick: () => {
              startTagTask(data, node)
            },
          },
          { default: () => 'play-circle' },
        ),
      )
    }
    actions.push(
      h(
        'ElDropdown',
        {
          placement: 'bottom',
          trigger: 'click',
          onCommand: (command: string) => handleMoreCommand(command, data),
        },
        {
          default: () =>
            h(
              IconButton,
              { sm: true, class: 'ml-2' },
              { default: () => 'more' },
            ),
          dropdown: () =>
            h(
              'ElDropdownMenu',
              {},
              {
                default: () =>
                  h(
                    'ElDropdownItem',
                    { command: 'edit' },
                    { default: () => t('public_button_edit') },
                  ),
              },
            ),
        },
      ),
    )
  }

  data.SWIM_TYPE = 'fdm'

  return h(
    'div',
    {
      class: className,
      onClick: () => {
        data.isObject && emit('preview', data, props.fdmConnection)
      },
      onDrop: handleTreeNodeDrop,
    },
    [
      data.isObject &&
        data.isVirtual &&
        h('div', {
          class: 'table-status-dot rounded-circle position-absolute',
        }),
      h(
        'div',
        {
          class: [
            'w-0 flex-1 overflow-hidden flex align-center',
            {
              'opacity-50': data.isObject && data.isVirtual,
            },
          ],
        },
        [
          !data.isObject &&
            h(
              VExpandXTransition,
              {},
              {
                default: () =>
                  data.showProgress &&
                  h('el-progress', {
                    class: 'mr-2',
                    color: '#2c65ff',
                    width: 16,
                    'stroke-width': 2,
                    type: 'circle',
                    percentage: 50,
                    'show-text': false,
                  }),
              },
            ),
          h(
            'span',
            {
              id: data.isObject
                ? `fdm_table_${data.connectionId}_${data.name}`
                : `connection_${data.id}`,
              class: 'inline-flex align-items-center overflow-hidden',
            },
            [
              icon &&
                h(VIcon, { size: 18, class: 'tree-item-icon mr-2' }, icon),
              h('span', { class: 'table-label', title: data.name }, data.name),
            ],
          ),
          data.comment &&
            h('span', { class: 'font-color-sslight' }, `(${data.comment})`),
          !data.isObject && h('div', { class: 'btn-menu ml-auto' }, actions),
        ],
      ),
    ],
  )
}

function showTaskDialog() {
  const connectionId = taskDialogConfig.value.from?.id

  taskDialogConfig.value.prefix = getSmartPrefix(
    taskDialogConfig.value.from.name,
  )
  taskDialogConfig.value.visible = true
  form.value?.resetFields()

  // 读取缓存
  if (prefixMap.value[connectionId]) {
    taskDialogConfig.value.prefix = prefixMap.value[connectionId]
  }

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

  checkCanStart()
}

async function checkCanStart() {
  taskDialogConfig.value.canStart = false
  checkCanStartIng.value = true
  const tag = treeData.value.find(
    (item: any) => item.linkId === taskDialogConfig.value.from.id,
  )
  const task = tag2Task.value[tag?.id]

  if (task) {
    taskDialogConfig.value.task.type = task.type
    taskDialogConfig.value.task.crontabExpressionFlag =
      task.crontabExpressionFlag
    taskDialogConfig.value.task.crontabExpression = task.crontabExpression
    taskDialogConfig.value.canStart = await ldpApi.checkCanStartByTag(tag.id)
  } else {
    taskDialogConfig.value.canStart = true
  }

  checkCanStartIng.value = false
}

async function taskDialogSubmit(start: boolean) {
  form.value?.validate(async (valid: boolean) => {
    if (!valid) return

    const {
      tableName,
      from = {},
      task: settings,
      prefix,
    } = taskDialogConfig.value
    const task = Object.assign(makeMigrateTask(from, tableName), settings)
    // 缓存表名前缀
    prefixMap.value[from.id] = prefix

    creating.value = true
    try {
      const result = await ldpApi.createFDMTask(task, {
        silenceMessage: true,
        params: { start },
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
    } catch (error: any) {
      console.log(error)
      let msg

      if (error?.data?.code === 'Task.ListWarnMessage' && error.data.data) {
        const keys = Object.keys(error.data.data)
        msg = error.data.data[keys[0]]?.[0]?.msg
      }

      ElMessage.error(
        msg || error?.data?.message || t('public_message_save_fail'),
      )
    }

    await loadFDMDirectory()
    setNodeExpand()

    creating.value = false
  })
}

async function loadFDMDirectory() {
  const { items } = await metadataDefinitionsApi.get({
    filter: JSON.stringify({
      where: {
        item_type: { $nin: ['database', 'dataflow', 'api'] },
        parent_id: props.directory.id,
      },
    }),
  })

  props.directory.children = items.map((item: any) => {
    item = props.mapCatalog(item)
    const children = treeMap.value[item.id]?.children

    if (children?.length) {
      item.children = cloneDeep(children)
    }

    return item
  })
  await nextTick()
  tree.value?.$forceUpdate()
}

function handleDragOver(ev: DragEvent) {
  ev.preventDefault()
}

function handleDragEnter(ev: DragEvent) {
  ev.preventDefault()

  if (!allowDrop.value) return

  const dropNode = findParentByClassName(
    ev.currentTarget as Element,
    'tree-wrap',
  )
  dropNode?.classList.add('is-drop')
}

function handleDragLeave(ev: DragEvent) {
  ev.preventDefault()

  if (!allowDrop.value) return
  if (!(ev.currentTarget as Element).contains(ev.relatedTarget as Element)) {
    removeDropEffect(ev, 'tree-wrap', 'is-drop')
  }
}

function handleDrop(ev: DragEvent) {
  ev.preventDefault()

  if (!allowDrop.value) return

  removeDropEffect(ev, 'tree-wrap', 'is-drop')

  const { draggingObjects } = props.dragState
  if (!draggingObjects.length) return
  const object = draggingObjects[0]

  if (object.data.type === 'connection') {
    taskDialogConfig.value.from = object.data
    taskDialogConfig.value.tableName = null
  } else if (object.data.type === 'table') {
    taskDialogConfig.value.from = object.parent.data
    taskDialogConfig.value.tableName = object.data.name
  }

  showTaskDialog()
}

function removeDropEffect(
  ev: DragEvent,
  cls = 'wrap__item',
  removeCls = 'is-drop-inner',
) {
  const dropNode = findParentByClassName(ev.currentTarget as Element, cls)
  dropNode?.classList.remove(removeCls)
}

function handleTreeNodeDrop(ev: DragEvent) {
  ev.stopPropagation()
  handleDrop(ev)
}

function findParentByClassName(
  parent: Element | null,
  cls: string,
): Element | null {
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode as Element
  }
  return parent
}

function makeMigrateTask(from: any, tableName: string) {
  const source = getSourceNode(from, tableName)
  const target = getDatabaseNode(props.fdmConnection)
  const tableReNameNode = getTableReNameNode()
  return {
    ...TASK_SETTINGS,
    syncType: 'migrate',
    name: getTaskName(from),
    dag: {
      edges: [
        { source: source.id, target: tableReNameNode.id },
        { source: tableReNameNode.id, target: target.id },
      ],
      nodes: [source, tableReNameNode, target],
    },
  }
}

function getSourceNode(from: any, tableName: string) {
  const source = getDatabaseNode(from)

  Object.assign(
    source,
    tableName
      ? {
          migrateTableSelectType: 'custom',
          tableNames: [tableName],
        }
      : {
          migrateTableSelectType: 'expression',
          tableExpression: '.*',
        },
  )

  return source
}

function getTaskName(from: any) {
  return `${from.name}_Clone_To_FDM_${generateId(6)}`
}

function getDatabaseNode(db: any) {
  return {
    id: uuid(),
    type: 'database',
    name: db.name,
    connectionId: db.id,
    databaseType: db.database_type,
    attrs: {
      connectionName: db.name,
      connectionType: db.connection_type,
      accessNodeProcessId: db.accessNodeProcessId,
      pdkType: db.pdkType,
      pdkHash: db.pdkHash,
      capabilities: db.capabilities || [],
    },
  }
}

function getTableReNameNode() {
  return {
    id: uuid(),
    type: 'table_rename_processor',
    name: t('packages_business_swimlane_fdm_biaobianji'),
    prefix: `${fixedPrefix.value}${taskDialogConfig.value.prefix}_`,
  }
}

async function handleNodeExpand(data: any, node: any, forceLoad?: boolean) {
  setExpand(data.id, true)
  // 十秒内加载过资源，不再继续加载
  if (!forceLoad && node.loadTime && Date.now() - node.loadTime < 10000) return

  node.loadTime = Date.now()
  node.loading = true
  const objects = await loadObjects(data)
  node.loading = false
  tree.value?.updateKeyChildren(data.id, objects)
}

function handeNodeCollapse(data: any) {
  setExpand(data.id, false)
}

function checkAllowDrag(node: any) {
  return node.data.LDP_TYPE === 'table'
}

function handleDragStart(draggingNode: any, ev: DragEvent) {
  draggingNode = {
    ...draggingNode,
    parent: {
      data: props.fdmConnection,
    },
  }
  draggingNode.value = draggingNode
  draggingNodeImage.value = makeDragNodeImage(
    (ev.currentTarget as Element).querySelector('.tree-item-icon'),
    draggingNode.data.name,
  )
  ev.dataTransfer?.setDragImage(draggingNodeImage.value, 4, 4)
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'copy'
  }
  props.dragState.isDragging = true
  props.dragState.draggingObjects = [draggingNode]
  props.dragState.from = 'FDM'
}

function handleDragEnd() {
  emit('node-drag-end')
}

function setNodeExpand() {
  const target = treeData.value.find(
    (item: any) => item.linkId === taskDialogConfig.value.from.id,
  )
  if (target) {
    const node = tree.value?.getNode(target.id)
    node && (node.loading = true)
    setTimeout(async () => {
      setExpand(target.id, true)
      let objects = await loadObjects(target)
      objects = objects.map((item: any) => {
        item.parent_id = target.id
        item.isObject = true
        item.connectionId = item.sourceConId
        return item
      })
      tree.value?.updateKeyChildren(target.id, objects)
      node && (node.loading = false)
    }, 1000)
  } else {
    emit('load-directory')
  }
}

function setExpand(id: string, isExpand: boolean) {
  const i = expandedKeys.value.indexOf(id)
  if (!isExpand) {
    if (~i) expandedKeys.value.splice(i, 1)
  } else if (!~i) expandedKeys.value.push(id)
}

function getSmartPrefix(connectionName: string) {
  connectionName = connectionName
    .replaceAll(/[\u4E00-\u9FA5\s]+/g, '')
    .replace(/^[-_]+/, '')
  const planA = connectionName.split('_').shift() || ''
  const planB = connectionName.split('-').shift() || ''

  return (planA.length < planB.length ? planA : planB).slice(0, 5)
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
    metadataDefinitionsApi.delete(data.id).then(() => {
      tree.value?.remove(data.id)
    })
  })
}

async function dialogSubmit() {
  const config = dialogConfig.value
  const value = config.label
  const id = config.id
  const itemType = [config.itemType]
  let method = 'post'

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
    method = 'changeById'
    params.id = id
    delete params.item_type
  } else if (id) {
    params.parent_id = id
  }

  try {
    const data = await metadataDefinitionsApi[method](params)
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

async function loadTask() {
  if (!treeData.value.length) return

  const map = await ldpApi.getTaskByTag(
    treeData.value.map((item: any) => item.id).join(','),
  )
  const newMap: Record<string, any> = {}
  for (const tagId in map) {
    let task = map[tagId].find(
      (task: any) =>
        !['deleting', 'delete_failed'].includes(task.status) &&
        !task.is_deleted &&
        task.fdmMain,
    )
    if (task) {
      task = makeStatusAndDisabled(task)
      newMap[tagId] = {
        id: task.id,
        name: task.name,
        type: task.type,
        crontabExpressionFlag: task.crontabExpressionFlag,
        crontabExpression: task.crontabExpression,
        status: task.status,
        disabledData: task.disabledData,
      }
    }
  }
  tag2Task.value = newMap
  checkStartedTag()
}

function checkStartedTag() {
  startedTags.value = startedTags.value.filter((tagId) => {
    const task = tag2Task.value[tagId]
    const node = tree.value?.getNode(tagId)
    if (
      node &&
      task &&
      ['running', 'complete', 'stop', 'error'].includes(task.status)
    ) {
      handleNodeExpand(node.data, node, true)
      return false
    }
    return true
  })
}

async function startTagTask(tag: any, node: any) {
  if (!startedTags.value.includes(tag.id)) startedTags.value.push(tag.id)

  node.loading = true
  node.expanded = false
  setExpand(tag.id, false)
  await ldpApi.batchStart(tag.id, {})
  ElMessage.success(t('public_message_operation_success'))
}

function handleFindTreeDom(val: any = {}, getParent = false) {
  const el = document.getElementById(
    `fdm_table_${val.connectionId}_${val.table}`,
  )
  return getParent
    ? el?.parentNode
    : findParentByClassName(el, 'el-tree-node__content')
}

async function searchByKeywordList(val: any[] = []) {
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
  searchExpandedKeys.value = searchExpandedKeys
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

// Common mixin methods
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
    debouncedSearch.value?.cancel()
    return
  }
  searchIng.value = true
  debouncedSearch.value(val)
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
      tour: false, // TODO: get from store
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
  return discoveryApi
    .discoveryList(where, {
      cancelToken,
    })
    .then((res: any) => {
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

async function searchObject(search: string) {
  cancelSource.value?.cancel()
  cancelSource.value = CancelToken.source()
  searchIng.value = true
  const result = await loadObjects(
    props.directory,
    false,
    search,
    cancelSource.value.token,
  )
  const map = result.reduce((obj: any, item: any) => {
    const id = item.listtags?.[0]?.id || props.directory.id
    const children = obj[id] || []
    children.push(item)
    obj[id] = children
    return obj
  }, {})

  const filterTree = (node: any) => {
    const newNode = { ...node }

    if (node.children?.length) {
      newNode.children = node.children
        .map((child: any) => filterTree(child))
        .filter(
          (child: any) =>
            child.LDP_TYPE === 'folder' &&
            (child.name.includes(search) || child.children.length),
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

const handleScroll = debounce(function () {
  emit('on-scroll')
}, 200)

// Watchers
watch(
  () => props.loadingDirectory,
  (v) => {
    if (!v) {
      loadTask()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (!props.loadingDirectory) {
    nextTick(() => {
      loadTask()
    })
  }
  autoUpdateObjects()
  debouncedSearch.value = debounce(searchObject, 300)
})

onBeforeUnmount(() => {
  if (autoUpdateObjectsTimer.value) {
    clearInterval(autoUpdateObjectsTimer.value)
  }
  debouncedSearch.value?.cancel()
  cancelSource.value?.cancel()
  stop()
})

// Expose methods and properties for external use
defineExpose({
  handleFindTreeDom,
  searchByKeywordList,
})
</script>

<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ t('packages_business_data_console_fdm') }}</span>
      <div class="flex-grow-1" />
      <IconButton
        :disabled="fdmNotExist"
        :class="{ active: enableSearch }"
        @click="toggleEnableSearch"
        >search-outline</IconButton
      >
      <!--<ElDropdown trigger="click" @command="handleCommand">
            <IconButton class="ml-3">more</IconButton>
            <ElDropdownMenu slot="dropdown">
              <ElDropdownItem command="config"> Configure </ElDropdownItem>
            </ElDropdownMenu>
          </ElDropdown>-->
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
        v-if="!showParentLineage"
        ref="treeWrapRef"
        class="flex-1 min-h-0 position-relative p-1 overflow-y-auto"
      >
        <div
          v-if="showSearch"
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
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
          />
        </div>
        <template v-else>
          <ElTree
            ref="tree"
            class="ldp-tree"
            node-key="id"
            :data="treeData"
            draggable
            empty-text=""
            :default-expanded-keys="expandedKeys"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @node-expand="handleNodeExpand"
            @node-collapse="handeNodeCollapse"
          >
            <!-- <template #default="{ node, data }">
              <div
                class="custom-tree-node position-relative min-w-0 flex align-center"
                :class="{
                  grabbable: node.isLeaf,
                }"
              >
                <div
                  v-if="data.isVirtual && node.isLeaf"
                  class="table-status-dot rounded-circle position-absolute"
                />

                <div
                  class="w-0 flex-1 overflow-hidden flex align-center"
                  :class="{
                    'opacity-50': data.isObject && data.isVirtual,
                  }"
                >
                  <VExpandXTransition v-if="node.isLeaf">
                    <el-progress
                      v-if="data.showProgress"
                      class="mr-2"
                      :width="16"
                      :stroke-width="2"
                      type="circle"
                      :show-text="false"
                      color="#2c65ff"
                      :percentage="50"
                    />
                  </VExpandXTransition>

                  <span
                    :id="
                      node.isLeaf
                        ? `fdm_table_${data.connectionId}_${data.name}`
                        : `connection_${data.id}`
                    "
                    class="inline-flex align-items-center overflow-hidden"
                  >
                    <VIcon size="18" class="tree-item-icon mr-2">{{
                      !node.isLeaf ? 'folder-o' : 'table'
                    }}</VIcon>
                    <span class="table-label" :title="data.name">{{
                      data.name
                    }}</span>
                  </span>
                  <div class="flex-1 overflow-hidden text-ellipsis" />
                </div>
              </div>
            </template> -->
          </ElTree>
          <div
            v-if="!treeData.length"
            class="flex justify-center align-center absolute-fill fs-7 font-color-light px-3"
          >
            <span
              class="text-center lh-base"
              v-html="t('packages_business_fdm_empty_text')"
            />
          </div>
        </template>
      </div>
      <div v-else class="flex-1 min-h-0 position-relative">
        <div
          class="search-view position-absolute top-0 left-0 w-100 h-100 bg-white"
        >
          <ElTree
            ref="tree"
            class="ldp-tree h-100"
            node-key="id"
            :data="filterTreeData"
            draggable
            default-expand-all
            height="100%"
            :render-content="renderContent"
            :render-after-expand="false"
            :expand-on-click-node="false"
            :allow-drop="() => false"
            :allow-drag="checkAllowDrag"
            @node-drag-start="handleDragStart"
            @node-drag-end="handleDragEnd"
            @handle-scroll="handleScroll"
          />
        </div>
      </div>

      <div
        class="drop-mask justify-center align-center absolute-fill font-color-dark fs-6"
        :class="{ flex: allowDrop }"
      >
        Clone To FDM
      </div>

      <div
        v-if="fdmNotExist"
        class="drop-mask pe-auto flex justify-center align-center absolute-fill font-color-dark fs-6"
      >
        {{ t('packages_ldp_connection_expired') }}
      </div>
    </div>
    <ElDialog v-model="taskDialogConfig.visible" :close-on-click-modal="false">
      <template #header>
        <span class="font-color-dark fs-6 fw-sub">{{
          $t('packages_business_create_clone_task')
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
          <span>{{
            $t('packages_business_fdm_create_task_dialog_desc_prefix')
          }}</span
          ><span
            v-if="taskDialogConfig.from"
            class="inline-flex align-center px-1 font-color-dark fw-sub align-top"
            ><DatabaseIcon
              :key="taskDialogConfig.from.pdkHash"
              :item="taskDialogConfig.from"
              :size="20"
              class="mr-1"
            />
            <span>{{ taskDialogConfig.from.name }}</span> </span
          ><span
            v-if="taskDialogConfig.tableName"
            class="inline-flex font-color-dark fw-sub"
            >/<span class="px-1">{{ taskDialogConfig.tableName }}</span> </span
          ><span>{{
            $t('packages_business_fdm_create_task_dialog_desc_suffix')
          }}</span>
        </div>

        <ElFormItem :label="$t('packages_business_table_prefix')" prop="prefix">
          <ElInput
            v-model="taskDialogConfig.prefix"
            :maxlength="maxPrefixLength"
            class="inline-flex inline-flex-input"
          >
            <template #prepend>{{ fixedPrefix }}</template>
            <template #append>
              <span
                v-if="taskDialogConfig.tableName"
                :title="taskDialogConfig.tableName"
              >
                _{{ taskDialogConfig.tableName }}
              </span>
              <span v-else> _&lt;original_table_name&gt; </span>
            </template>
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
          >
            <ElSelect
              v-model="taskDialogConfig.task.crontabExpressionType"
              class="flex-1"
              @change="handleChangeCronType"
            >
              <ElOption v-for="(opt, i) in cronOptions" v-bind="opt" :key="i" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="taskDialogConfig.task.crontabExpressionType === 'custom'"
            prop="task.crontabExpression"
            label-width="0"
          >
            <ElInput v-model="taskDialogConfig.task.crontabExpression" />
          </ElFormItem>
        </div>
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
            :loading="creating || checkCanStartIng"
            :disabled="!taskDialogConfig.canStart"
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
      <ElForm ref="form" :model="dialogConfig" label-width="90px">
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
        <!--<ElFormItem
              :label="$t('packages_component_src_discoveryclassification_mulufenlei')"
              v-if="dialogConfig.isParent"
            >
              <ElSelect v-model="dialogConfig.itemType" :disabled="dialogConfig.type === 'edit'">
                <el-option
                  :label="$t('packages_component_src_discoveryclassification_ziyuanmulu')"
                  value="resource"
                ></el-option>
                &lt;!&ndash;            <el-option label="任务目录" value="task"></el-option>&ndash;&gt;
              </ElSelect>
            </ElFormItem>-->
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
  </div>
</template>

<style lang="scss" scoped>
.form-item-inner {
  height: 32px;
}
.pipeline-desc {
  background-color: #f8f8fa;
  border-left: 4px solid var(--color-primary);
  line-height: 22px;
  li {
    margin-left: 20px;
    padding-left: 4px;
    list-style-type: circle;
  }
}
.inline-flex-input {
  .el-input-group__prepend {
    flex-shrink: 0;
  }
  .el-input-group__append,
  .el-input-group__prepend {
    width: auto;
    line-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  input {
    width: auto;
  }
}
</style>
