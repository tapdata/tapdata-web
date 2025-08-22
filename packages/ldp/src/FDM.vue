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
  provide,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
import FdmTaskDialog from './components/FdmTaskDialog.vue'

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
const expandedKeys = ref<string[]>([])
const searchIng = ref(false)
const searchValue = ref('')
const enableSearch = ref(false)
const filterTreeData = ref<any[]>([])
const startedTags = ref<string[]>([])
const autoUpdateObjectsTimer = ref<number>()
const cancelSource = ref<any>()
const debouncedSearch = ref<any>()
const draggingNode = ref<any>()
const draggingNodeImage = ref<any>()
const tag2Task = ref<Record<string, any>>({})
const searchExpandedKeys = ref<string[]>([])

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
    props.dragState.from === 'SOURCE'
    // props.dragState.draggingObjects[0]?.data.LDP_TYPE === 'table'
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
    fdmTaskDialog.value?.open(object.data, null)
  } else if (object.data.type === 'table') {
    fdmTaskDialog.value?.open(object.parent.data, object.data.name)
  }
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

function setNodeExpand(connectionId: string) {
  const target = treeData.value.find(
    (item: any) => item.linkId === connectionId,
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

function findSourceAndSinkNodes({ nodes, edges }) {
  const allNodes = new Set(nodes.map((node) => node.id))
  const hasIncoming = new Set()
  const hasOutgoing = new Set()

  // 遍历边，标记有入边和出边的节点
  edges.forEach((edge) => {
    hasOutgoing.add(edge.source)
    hasIncoming.add(edge.target)
  })

  // 源节点：没有入边的节点
  const sourceNode = nodes.find(
    (node) =>
      !hasIncoming.has(node.id) &&
      (node.type === 'table' || node.type === 'database'),
  )

  // 目标节点：没有出边的节点
  const targetNode = nodes.find(
    (node) =>
      !hasOutgoing.has(node.id) &&
      (node.type === 'table' || node.type === 'database'),
  )

  const renameNode = nodes.find(
    (node) => node.type === 'table_rename_processor',
  )

  return { sourceNode, targetNode, renameNode }
}

async function loadTask() {
  if (!treeData.value.length) return

  const map = await ldpApi.getTaskByTag(
    treeData.value.map((item: any) => item.id).join(','),
  )
  const newMap: Record<string, any> = {}
  for (const tagId of Object.keys(map)) {
    let task = map[tagId].find(
      (task: any) =>
        !['deleting', 'delete_failed'].includes(task.status) &&
        !task.is_deleted &&
        task.fdmMain,
    )
    if (task) {
      task = makeStatusAndDisabled(task)
      const { sourceNode, targetNode, renameNode } = findSourceAndSinkNodes(
        task.dag,
      )

      newMap[tagId] = {
        id: task.id,
        name: task.name,
        type: task.type,
        crontabExpressionFlag: task.crontabExpressionFlag,
        crontabExpression: task.crontabExpression,
        status: task.status,
        disabledData: task.disabledData,
        sourceNode,
        targetNode,
        renameNode,
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

const fdmTaskDialog = ref<InstanceType<typeof FdmTaskDialog>>()

async function handleTaskSuccess(connectionId: string, task: any) {
  await loadFDMDirectory()
  setNodeExpand(connectionId)
}

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

provide('tag2Task', tag2Task)
provide('treeData', treeData)
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

    <FdmTaskDialog
      ref="fdmTaskDialog"
      :fdm-connection="fdmConnection"
      @success="handleTaskSuccess"
    />
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
