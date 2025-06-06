<script setup lang="ts">
import { agentGroupApi, clusterApi, proxyApi, workerApi } from '@tap/api'
import { dayjs, makeDragNodeImage } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { FilterBar, IconButton, ProTable, VEmpty } from '@tap/component'
import { useI18n } from '@tap/i18n'
import { downloadJson } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import { h, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SetTag from '@/views/cluster/SetTag.vue'
import AddServe from './AddServe.vue'
import { STATUS_MAP } from './const'

const { t } = useI18n()

// Types
interface TagDialog {
  visible: boolean
  saving: boolean
  value: string
  id: string
  title: string
  rules: {
    value: {
      required: boolean
      message: string
    }
  }
}

interface SetTagDialog {
  visible: boolean
  tagList: string[]
  selection: string[]
}

interface NetStatDialog {
  visible: boolean
  data: any[]
}

interface DragState {
  isDragging: boolean
  draggingObjects: any[]
  dropNode: any
  allowDrop: boolean
}

interface SearchParams {
  keyword: string
}

interface ApiResponse<T> {
  items: T[]
}

interface ClusterData {
  uuid: string
  id?: string
  name?: string
  command?: string
  arguments?: string
  status: string
  systemInfo: {
    process_id: string
    hostname: string
    ip: string
    ips?: string[]
    uuid: string
  }
  agentName?: string
  custIP?: string
  management?: any
  engine?: any
  apiServer?: any
  customMonitorStatus?: any[]
  canUpdate?: boolean
  metricValues?: {
    CpuUsage: string
    HeapMemoryUsage: string
  }
}

interface WorkerData {
  process_id: string
  metricValues?: {
    CpuUsage: number
    HeapMemoryUsage: number
  }
}

interface LogMiningMonitor {
  timestamp: string
  pid: number
  cpuPercent: number
  memoryPercent: number
  state: string
  dataSource: string
  serviceId: string
  isAlive: boolean
  id: number
  name: string
  ip: string
  startTime: string
  status: 'running' | 'stopped'
  cpuUsage: string
  memoryUsage: string
}

// Router
const route = useRoute()
const router = useRouter()

// Refs
const childRules = ref()
const tree = ref()
const engineTable = ref()
const tagForm = ref()
const editAgentForm = ref()

// State
const hideDownload = ref(import.meta.env.VUE_APP_HIDE_CLUSTER_DOWNLOAD)
const waterfallData = ref([])
const currentData = ref(null)
const dialogForm = ref(false)
const activeIndex = ref('1')
const serveStatus = ref('')
const isStop = ref(false)
const engineState = ref('')
const managementState = ref('')
const apiServerState = ref('')
const editItem = ref({})
const timer = ref(null)
const downLoadAgetntdialog = ref(false)
const editAgentDialog = ref(false)
const deleteDialogVisible = ref(false)
const downLoadNum = ref(0)
const version = ref(null)
const ips = ref([])
const custIP = ref('')
const custId = ref('')
const agentName = ref('')
const currentNde = ref({})
const delData = ref('')
const processIdData = ref([])
const searchParams = reactive<SearchParams>({
  keyword: '',
})
const accessToken = ref('')
const filterItems = ref([
  {
    placeholder: t('daas_cluser_keyword_placeholder'),
    key: 'keyword',
    type: 'input',
  },
])
const bindWorkerMap = ref({})
const viewType = ref('cluster')
const netStatDialog = reactive<NetStatDialog>({
  visible: false,
  data: [],
})
const apiServerData = ref([])
const engineData = ref([])
const filterEngineData = ref([])
const managementData = ref([])
const tagData = ref([])
const tagDialog = reactive<TagDialog>({
  visible: false,
  saving: false,
  value: '',
  id: '',
  title: '',
  rules: {
    value: {
      required: true,
      message: t('packages_component_classification_nodeName'),
    },
  },
})
const setTagDialog = reactive<SetTagDialog>({
  visible: false,
  tagList: [],
  selection: [],
})
const treeProps = {
  label: 'name',
}
const agentId2Tag = ref({})
const tagMap = ref({})
const multipleSelection = ref([])
const tagSearch = ref('')
const showSearch = ref(false)
const dragState = reactive<DragState>({
  isDragging: false,
  draggingObjects: [],
  dropNode: null,
  allowDrop: true,
})
const draggingNodeImage = ref(null)
const loading = ref(false)
const logMiningLoading = ref(false)
const logMiningData = ref<LogMiningMonitor[]>([])

// constants
const DataSourceMap = {
  nineBridge: t('public_oracle_raw_log'),
} as const

// Watchers
watch(
  () => route.query,
  () => {
    searchParams.keyword = route.query.keyword as string
    getDataApi()
  },
)

watch(tagSearch, (val) => {
  tree.value?.filter(val)
})

// Lifecycle hooks
onMounted(() => {
  init()
  accessToken.value = Cookie.get('access_token')
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})

// Methods
const init = async () => {
  loading.value = true
  await getAllBindWorker()
  await getDataApi(true)
  await loadTags()
  handleFilterAgent()
}

const submitForm = async () => {
  const getFrom = childRules.value.ruleForm
  const status = childRules.value.data.status
  const flag = childRules.value.validateForm()

  if (status === 'running') {
    if (flag) {
      const data: {
        uuid: string
        name: string
        command: string
        arguments: string
        id?: string
      } = {
        uuid: currentData.value.uuid,
        name: getFrom.name,
        command: getFrom.command,
        arguments: getFrom.arguments ? getFrom.arguments : '',
      }

      try {
        if (getFrom.id === '') {
          await clusterApi.addMonitor(data)
        } else {
          data.id = getFrom.id
          await clusterApi.editMonitor(data)
        }
        dialogForm.value = false
        await getDataApi()
        // Show success message
      } finally {
        dialogForm.value = false
      }
    }
  } else {
    // Show error message
  }
}

const editServe = (item: any, status: string, data: any) => {
  currentData.value = data
  editItem.value = item
  dialogForm.value = true
}

const delServe = (data: any, status: string) => {
  const params = {
    uuid: data.uuid,
    id: data.id,
  }

  if (status === 'running') {
    // Show confirmation dialog
    ElMessageBox.confirm('', t('daas_cluster_del_confirm'), {
      center: true,
      customClass: 'pro-confirm',
      type: 'warning',
      confirmButtonText: t('public_button_confirm'),
      cancelButtonText: t('public_button_cancel'),
    }).then(() => {
      clusterApi.removeMonitor(params).then(() => {
        getDataApi()
        ElMessage.success(t('public_message_save_ok'))
      })
    })
  } else {
    ElMessage.error(t('cluster_startup_after_delete'))
  }
}

const addServeFn = (item: any) => {
  currentData.value = item
  editItem.value = {}
  dialogForm.value = true
}

const downServeFn = (item: any) => {
  proxyApi.supervisor(item.systemInfo?.process_id).then((data) => {
    downloadJson(
      JSON.stringify(data),
      `${item.systemInfo?.process_id}_supervisor_summary`,
    )
  })
}

const downConnectorsFn = (item: any) => {
  proxyApi.connectors(item.systemInfo?.process_id).then((data) => {
    downloadJson(
      JSON.stringify(data),
      `${item.systemInfo?.process_id}_connectors_memory`,
    )
  })
}

const startFn = (item: any, status: string, server: string) => {
  if (status === 'stopped') {
    const data = {
      uuid: item.uuid,
      server,
      operation: 'start',
    }
    // Show confirmation dialog
    operationFn(data)
  }
}

const closeFn = (item: any, status: string, server: string) => {
  if (status === 'running') {
    const data = {
      uuid: item.uuid,
      server,
      operation: 'stop',
    }
    // Show confirmation dialog
    operationFn(data)
  }
}

const restartFn = (item: any, status: string, server: string) => {
  if (status === 'running') {
    const data = {
      uuid: item.uuid,
      server,
      operation: 'restart',
    }
    // Show confirmation dialog
    operationFn(data)
  }
}

const unbind = (item: any, status: string) => {
  if (status === 'stopped') {
    // Show confirmation dialog
    const { process_id } = item.systemInfo || {}
    workerApi.unbindByProcessId(process_id).then((data) => {
      init()
      // Show success/error message
    })
  }
}

const updateFn = (item: any) => {
  const data = {
    uuid: item.uuid,
    server: 'agent',
    operation: `update:${version.value}`,
  }
  operationFn(data)
}

const getVersion = (datas: any[]) => {
  const [...waterfallData] = datas
  const [...newWaterfallData] = [[], []]
  waterfallData.forEach((item, index) => {
    if (index % 2) {
      newWaterfallData[1].push(item)
    } else {
      newWaterfallData[0].push(item)
    }
  })
  waterfallData.value = newWaterfallData
}

const operationFn = async (data: any) => {
  await clusterApi.updateStatus(data)
  await getDataApi()
}

const getUsageRate = (processId: string) => {
  const where = {
    process_id: {
      inq: processId,
    },
    worker_type: 'connector',
  }
  return workerApi.get({ filter: JSON.stringify({ where }) })
}

const getAllBindWorker = async () => {
  try {
    const data = await workerApi.queryAllBindWorker()
    bindWorkerMap.value = data.reduce((pre, current) => {
      return { ...pre, [current.processId]: current }
    }, {})
  } catch {}
}

const getDataApi = async (noFilter?: boolean) => {
  const params: any = { index: 1 }
  if (searchParams.keyword) {
    params.filter = JSON.stringify({
      where: {
        or: [
          {
            agentName: {
              like: searchParams.keyword,
            },
          },
          {
            'systemInfo.hostname': {
              like: searchParams.keyword,
            },
          },
        ],
      },
    })
  }
  loading.value = true
  const clusterResponse = (await clusterApi.get(
    params,
  )) as ApiResponse<ClusterData>
  const clusterData = clusterResponse?.items || []
  const processId = clusterData.map((it) => it?.systemInfo?.process_id)
  const workerResponse = (await getUsageRate(
    processId,
  )) as ApiResponse<WorkerData>
  const workerData = workerResponse?.items || []

  loading.value = false

  const metricValuesData: Record<
    string,
    { CpuUsage: string; HeapMemoryUsage: string }
  > = {}
  if (workerData?.length) {
    workerData.forEach((item) => {
      if (item.metricValues) {
        item.metricValues.CpuUsage = `${(item.metricValues.CpuUsage * 100).toFixed(2)}%`
        item.metricValues.HeapMemoryUsage = `${(item.metricValues.HeapMemoryUsage * 100).toFixed(2)}%`
      }
      metricValuesData[item.process_id] = item.metricValues as {
        CpuUsage: string
        HeapMemoryUsage: string
      }
    })
  }

  const _apiServerData = []
  const _engineData = []
  const _managementData = []

  for (const item of clusterData) {
    const isStopped = item.status !== 'running'
    const { management, engine, apiServer } = item

    const info = {
      hostname: item.agentName || item.systemInfo.hostname,
      ip: item.custIP || item.systemInfo.ip,
      uuid: item.uuid,
    }

    engine &&
      _engineData.push(
        Object.assign(engine, info, {
          process_id: item.systemInfo.process_id,
        }),
      )
    apiServer && _apiServerData.push(Object.assign(apiServer, info))
    management && _managementData.push(Object.assign(management, info))

    if (isStopped) {
      if (management) {
        management.status = 'stopped'
        management.serviceStatus = 'stopped'
      }
      if (engine) {
        engine.status = 'stopped'
        engine.serviceStatus = 'stopped'
        engine.netStat = []
        engine.netStatTotals = 0
      }
      if (apiServer) {
        apiServer.status = 'stopped'
        apiServer.serviceStatus = 'stopped'
      }
    }

    item.canUpdate = false
    item.metricValues = metricValuesData[item.systemInfo?.process_id]
      ? metricValuesData[item.systemInfo?.process_id]
      : { CpuUsage: '-', HeapMemoryUsage: '-' }
    if (item?.engine?.status !== 'running') {
      item.metricValues = {
        CpuUsage: '-',
        HeapMemoryUsage: '-',
      }
    }
    if (item?.engine?.netStat) {
      item.engine.netStatTotals = item.engine.netStat.reduce((total, key) => {
        return total + (key?.numbers || 0)
      }, 0)
    }
  }
  waterfallData.value = clusterData

  apiServerData.value = _apiServerData
  engineData.value = _engineData
  managementData.value = _managementData

  if (!noFilter) {
    mapAgentData()
    handleFilterAgent()
  }
}

const closeDialogForm = () => {
  dialogForm.value = false
  childRules.value?.closeDialogForm()
}

const delConfirm = (item: any) => {
  const agentName = item.agentName || item.systemInfo.hostname
  ElMessageBox.confirm(
    '',
    `${t('public_message_delete_confirm')} ${agentName}?`,
    {
      type: 'warning',
      center: true,
      customClass: 'pro-confirm',
    },
  ).then(() => {
    clusterApi.delete(item.id, item.name).then(() => {
      ElMessage.success(t('public_message_delete_ok'))
      getDataApi()
    })
  })
}

const removeNode = (id: string) => {
  clusterApi.delete(id).then(() => {
    deleteDialogVisible.value = false
    // Show success message
  })
}

const editAgent = (item: any) => {
  editAgentDialog.value = true
  custId.value = item.id
  custIP.value = item.systemInfo.ip
  ips.value = item.systemInfo.ips || []
  agentName.value = item.agentName || item.systemInfo.hostname
  currentNde.value = item.systemInfo
}

const submitEditAgent = () => {
  if (agentName.value === '') {
    agentName.value = currentNde.value.hostname
    // Show error message
    return
  }
  const data = {
    custIP: custIP.value,
    agentName: agentName.value,
  }
  clusterApi.editAgent(custId.value, data).then(() => {
    editAgentDialog.value = false
    // Show success message
  })
}

const editNameRest = () => {
  agentName.value = currentNde.value.hostname
}

const goDailyRecord = () => {
  router.push({
    name: 'dailyRecord',
  })
}

const getStatus = (type: string) => {
  return STATUS_MAP[type] || '-'
}

const openNetStatDialog = (row: any) => {
  netStatDialog.visible = true
  netStatDialog.data = row.engine.netStat || []
}

const handleAddTag = () => {
  tagDialog.visible = true
  tagDialog.title = t('dataFlow_addTag')
  tagForm.value?.clearValidate()
}

const editTag = (tag: any) => {
  tagDialog.visible = true
  tagDialog.title = t('dataFlow_editTag')
  tagDialog.value = tag.name
  tagDialog.id = tag.groupId
}

const loadTags = async () => {
  const { items } = await agentGroupApi.get({
    containWorker: false,
  })
  tagMap.value = {}
  agentId2Tag.value = items.reduce((map, item) => {
    item.agentIds?.reduce((acc, id) => {
      let arr = acc[id]
      if (!arr) {
        arr = acc[id] = []
      }
      arr.push(item.groupId)
      return acc
    }, map)

    tagMap.value[item.groupId] = item.name

    return map
  }, {})
  tagData.value = items
  mapAgentData()
}

const mapAgentData = () => {
  engineData.value = engineData.value.map((item) => {
    const tagIds = agentId2Tag.value[item.process_id]
    item.tags = tagIds?.length
      ? tagIds.map((id) => {
          return {
            id,
            name: tagMap.value[id],
          }
        })
      : []
    return item
  })
}

const saveTag = () => {
  tagForm.value?.validate((valid: boolean) => {
    if (valid) {
      tagDialog.saving = true
      const fetch = tagDialog.id
        ? agentGroupApi.update({
            name: tagDialog.value,
            groupId: tagDialog.id,
          })
        : agentGroupApi.save({
            name: tagDialog.value,
          })
      fetch
        .then(() => {
          ElMessage.success(t('public_message_save_ok'))
          hideTagDialog()
          loadTags()
        })
        .finally(() => (tagDialog.saving = false))
    }
  })
}

const hideTagDialog = () => {
  tagDialog.visible = false
  tagDialog.value = ''
  tagDialog.id = ''
  nextTick(() => {
    tagForm.value?.clearValidate()
  })
}

const handleCheckChange = (data: any, node: any) => {
  const checked = node.checked
  tree.value?.setCheckedKeys([])
  node.checked = !checked
  handleFilterAgent()
  engineTable.value?.clearSelection()
}

const handleCheck = () => {
  handleFilterAgent()
}

const handleCommand = (command: string, node: any) => {
  switch (command) {
    case 'edit':
      editTag(node.data)
      break
    case 'delete':
      deleteNode(node.key)
  }
}

const deleteNode = (id: string) => {
  ElMessageBox.confirm(
    '',
    t('packages_business_application_delete_shifouquerenshan'),
    {
      center: true,
      customClass: 'pro-confirm',
      confirmButtonText: t('public_button_delete'),
      cancelButtonText: t('packages_component_message_cancel'),
      type: 'warning',
      closeOnClickModal: false,
    },
  ).then(() => {
    agentGroupApi.delete(id).then(() => {
      loadTags()
    })
  })
}

const openSetTagDialog = () => {
  setTagDialog.visible = true
  const selection = []
  let list = multipleSelection.value.reduce((acc, item) => {
    selection.push(item.process_id)
    const list = agentId2Tag.value[item.process_id]
    if (list?.length) {
      acc.push(...list)
    }
    return acc
  }, [])

  list = [...new Set(list)]

  setTagDialog.tagList = list
  setTagDialog.selection = selection
}

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const handleSearch = () => {
  showSearch.value = !showSearch.value
  tagSearch.value = ''
}

const handleFilterTag = (value: string, data: any) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

const onSavedTag = async () => {
  await loadTags()
  handleFilterAgent()
}

const handleFilterAgent = () => {
  const keys = tree.value?.getCheckedKeys()
  if (keys?.length) {
    filterEngineData.value = engineData.value.filter((item) => {
      return agentId2Tag.value[item.process_id]?.some((id) => keys.includes(id))
    })
  } else {
    filterEngineData.value = engineData.value
  }
}

const handleDragStart = (row: any, column: any, ev: DragEvent) => {
  dragState.isDragging = true
  const selection = multipleSelection.value

  if (selection.some((it) => it.id === row.id)) {
    dragState.draggingObjects = selection
  } else {
    dragState.draggingObjects = [row]
  }

  draggingNodeImage.value = makeDragNodeImage(
    ev.currentTarget.querySelector('.tree-item-icon'),
    row.hostname,
    dragState.draggingObjects.length,
  )
  ev.dataTransfer?.setDragImage(draggingNodeImage.value, 0, 0)
}

const handleDragEnd = () => {
  dragState.isDragging = false
  dragState.draggingObjects = []
  dragState.dropNode = null
  draggingNodeImage.value?.remove()
  draggingNodeImage.value = null
}

const findParentNodeByClassName = (el: Element, cls: string) => {
  let parent = el.parentNode
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode
  }
  return parent
}

const handleTreeDragEnter = (ev: DragEvent, data: any) => {
  ev.preventDefault()

  if (data.readOnly || !dragState.isDragging) return

  const dropNode = findParentNodeByClassName(
    ev.currentTarget as Element,
    'el-tree-node',
  )
  dropNode?.classList.add('is-drop-inner')
}

const handleTreeDragOver = (ev: DragEvent) => {
  ev.preventDefault()
}

const handleTreeDragLeave = (ev: DragEvent, data: any) => {
  ev.preventDefault()

  if (data.readOnly) return

  if (!ev.currentTarget.contains(ev.relatedTarget as Node)) {
    const dropNode = findParentNodeByClassName(
      ev.currentTarget as Element,
      'el-tree-node',
    )
    dropNode?.classList.remove('is-drop-inner')
  }
}

const handleTreeDrop = async (ev: DragEvent, data: any) => {
  const { draggingObjects } = dragState
  const dropNode = findParentNodeByClassName(
    ev.currentTarget as Element,
    'el-tree-node',
  )

  if (!draggingObjects?.length || !dropNode) return
  dropNode.classList.remove('is-drop-inner')

  const list = []
  for (const row of draggingObjects) {
    if (!data.agentIds?.includes(row.process_id)) {
      list.push(
        agentGroupApi.addAgent({
          groupId: data.groupId,
          agentId: row.process_id,
        }),
      )
    }
  }

  if (list.length) {
    await Promise.all(list)
    // Show success message
    await onSavedTag()
  } else {
    // Show info message
  }
}

function handleLogMiningDetail(item: LogMiningMonitor) {
  // 这里可以实现详情弹窗或跳转
}

const fetchLogMiningData = async () => {
  logMiningLoading.value = true
  const data = await clusterApi.findRawServerInfo()

  logMiningLoading.value = false

  logMiningData.value = data.items.map((item) => {
    item.timestamp = dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')
    item.dataSource = DataSourceMap[item.dataSource]
    item.cpuUsage = (item.reportedData.cpuPercent * 100).toFixed(2)
    item.memoryUsage = (item.reportedData.memoryPercent * 100).toFixed(2)
    item.startTime = dayjs(item.reportedData.createTime).format(
      'YYYY-MM-DD HH:mm:ss',
    )
    return item
  })
}

const handleTabChange = (tab: string) => {
  if (tab === 'logMining') {
    fetchLogMiningData()
  }
}
</script>

<template>
  <PageContainer
    mode="auto"
    container-class="bg-white rounded-xl shadow-sm gap-1"
    content-class="flex-1 min-h-0 overflow-auto px-6 pb-5 position-relative flex flex-column"
  >
    <el-tabs
      v-model="viewType"
      class="position-sticky top-0 z-10 bg-white"
      @tab-change="handleTabChange"
    >
      <el-tab-pane :label="$t('daas_cluster_cluster_view')" name="cluster" />
      <el-tab-pane
        :label="$t('daas_cluster_component_view')"
        name="component"
      />
      <el-tab-pane :label="$t('public_log_mining_monitor')" name="logMining" />
    </el-tabs>

    <section class="clusterManagement-container">
      <div class="section-wrap-box">
        <div v-if="viewType !== 'logMining'" class="search-bar mb-4">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="getDataApi()"
          />
        </div>
      </div>

      <div class="main">
        <section
          v-if="viewType === 'component'"
          v-loading="loading"
          class="content h-100"
        >
          <div class="border rounded-xl mb-4">
            <div class="flex align-center justify-content-between p-4 py-3">
              <span class="section-title font-color-dark fs-6 fw-sub">{{
                $t('cluster_sync_gover')
              }}</span>
              <ElButton
                :disabled="!multipleSelection.length"
                type="primary"
                @click="openSetTagDialog"
                >{{ $t('dataExplorer_tag_title') }}</ElButton
              >
            </div>
            <div class="flex border-top">
              <div class="tag-tree-wrapper border-end p-3 pt-0">
                <div class="flex align-center mb-2 h-40 gap-0">
                  <span class="font-color-dark fw-sub flex-1">{{
                    $t('public_tags')
                  }}</span>
                  <IconButton @click="handleSearch">magnify</IconButton>
                  <IconButton @click="handleAddTag">add</IconButton>
                </div>
                <ElInput
                  v-if="showSearch"
                  v-model="tagSearch"
                  class="search mb-2"
                  clearable
                >
                  <template #prefix>
                    <VIcon size="14" class="h-100">magnify</VIcon>
                  </template>
                </ElInput>
                <ElTree
                  ref="tree"
                  check-strictly
                  show-checkbox
                  node-key="groupId"
                  :props="treeProps"
                  :data="tagData"
                  icon-class="p-0 pl-2"
                  :filter-node-method="handleFilterTag"
                  class="engine-tag-tree has-dropdown"
                  @node-click="handleCheckChange"
                  @check="handleCheck"
                >
                  <template #default="{ node, data }">
                    <div
                      class="flex align-center flex-1"
                      @dragenter.stop="handleTreeDragEnter($event, data, node)"
                      @dragover.stop="handleTreeDragOver($event, data, node)"
                      @dragleave.stop="handleTreeDragLeave($event, data, node)"
                      @drop.stop="handleTreeDrop($event, data, node)"
                    >
                      <VIcon size="12" class="color-primary mr-1"
                        >folder-fill</VIcon
                      >
                      <span class="flex-1 text-ellipsis">{{ data.name }}</span>
                      <ElDropdown
                        class="tree-node-dropdown"
                        @command="handleCommand($event, node)"
                      >
                        <IconButton sm @click.stop>more</IconButton>
                        <template #dropdown>
                          <ElDropdownMenu>
                            <ElDropdownItem command="edit">{{
                              $t('public_button_edit')
                            }}</ElDropdownItem>
                            <ElDropdownItem command="delete">{{
                              $t('public_button_delete')
                            }}</ElDropdownItem>
                          </ElDropdownMenu>
                        </template>
                      </ElDropdown>
                    </div>
                  </template>
                </ElTree>
              </div>
              <ProTable
                ref="engineTable"
                :data="filterEngineData"
                row-class-name="grabbable"
                row-key="process_id"
                draggable
                @selection-change="handleSelectionChange"
                @row-dragstart="handleDragStart"
                @row-dragend="handleDragEnd"
              >
                <ElTableColumn
                  type="selection"
                  width="32"
                  align="center"
                  :reserve-selection="true"
                />
                <ElTableColumn
                  :label="$t('daas_cluster_engine_hostname')"
                  prop="name"
                >
                  <template #default="{ row }">
                    <div>
                      {{ row.hostname
                      }}<span class="ip ml-1">{{ row.ip }}</span>
                    </div>
                    <span
                      v-if="row.tags"
                      class="justify-content-start ellipsis block"
                    >
                      <span
                        v-for="item in row.tags"
                        :key="item.id"
                        class="tag inline-block"
                        >{{ item.name }}</span
                      >
                    </span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('daas_cluster_connection_count')"
                  prop="netStatTotals"
                />
                <ElTableColumn :label="$t('public_status')" prop="status">
                  <template #default="{ row }">
                    <span :class="[`status-${row.status}`, 'status']">{{
                      getStatus(row.status)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('cluster_service_status')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <span :class="[`status-${row.serviceStatus}`, 'status']">{{
                      getStatus(row.serviceStatus)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('public_operation')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <div v-readonlybtn="'Cluster_operation'" class="btn">
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'stopped' ? false : true"
                        @click="startFn(row, row.status, 'engine')"
                        >{{ $t('public_button_start') }}
                      </ElButton>
                      <ElDivider class="mx-1" direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="closeFn(row, row.status, 'engine')"
                        >{{ $t('public_button_close') }}
                      </ElButton>
                      <ElDivider class="mx-1" direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="restartFn(row, row.status, 'engine')"
                        >{{ $t('public_button_restart') }}
                      </ElButton>
                      <ElDivider
                        v-if="bindWorkerMap[row.process_id]"
                        class="mx-1"
                        direction="vertical"
                      />
                      <ElButton
                        v-if="bindWorkerMap[row.process_id]"
                        text
                        type="primary"
                        :disabled="row.status == 'stopped' ? false : true"
                        @click="unbind(row, row.status, 'engine')"
                        >{{ $t('daas_unbind_license') }}
                      </ElButton>
                    </div>
                  </template>
                </ElTableColumn>
              </ProTable>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-1 border rounded-xl p-4">
              <div class="flex align-center justify-content-between mb-3">
                <span class="section-title font-color-dark fs-6 fw-sub">{{
                  $t('cluster_manage_sys')
                }}</span>
              </div>
              <ElTable :data="managementData">
                <ElTableColumn
                  :label="$t('daas_cluster_engine_hostname')"
                  prop="name"
                >
                  <template #default="{ row }">
                    <div>{{ row.hostname }}</div>
                    <span class="ip">{{ row.ip }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn :label="$t('public_status')" prop="status">
                  <template #default="{ row }">
                    <span :class="[`status-${row.status}`, 'status']">{{
                      getStatus(row.status)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('cluster_service_status')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <span :class="[`status-${row.serviceStatus}`, 'status']">{{
                      getStatus(row.serviceStatus)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('public_operation')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <div v-readonlybtn="'Cluster_operation'" class="btn">
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'stopped' ? false : true"
                        @click="startFn(row, row.status, 'management', 'start')"
                        >{{ $t('public_button_start') }}
                      </ElButton>
                      <ElDivider direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="closeFn(row, row.status, 'management', 'stop')"
                        >{{ $t('public_button_close') }}
                      </ElButton>
                      <ElDivider direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="
                          restartFn(row, row.status, 'management', 'restart')
                        "
                        >{{ $t('public_button_restart') }}
                      </ElButton>
                    </div>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
            <div class="flex-1 border rounded-xl p-4">
              <div class="flex align-center justify-content-between mb-3">
                <span class="section-title font-color-dark fs-6 fw-sub"
                  >API server</span
                >
              </div>
              <ElTable :data="apiServerData">
                <ElTableColumn
                  :label="$t('daas_cluster_engine_hostname')"
                  prop="name"
                >
                  <template #default="{ row }">
                    <div>{{ row.hostname }}</div>
                    <span class="ip">{{ row.ip }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn :label="$t('public_status')" prop="status">
                  <template #default="{ row }">
                    <span :class="[`status-${row.status}`, 'status']">{{
                      getStatus(row.status)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('cluster_service_status')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <span :class="[`status-${row.serviceStatus}`, 'status']">{{
                      getStatus(row.serviceStatus)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  :label="$t('public_operation')"
                  prop="netStatTotals"
                >
                  <template #default="{ row }">
                    <div v-readonlybtn="'Cluster_operation'" class="btn">
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'stopped' ? false : true"
                        @click="startFn(row, row.status, 'apiServer')"
                        >{{ $t('public_button_start') }}
                      </ElButton>
                      <ElDivider direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="closeFn(row, row.status, 'apiServer')"
                        >{{ $t('public_button_close') }}
                      </ElButton>
                      <ElDivider direction="vertical" />
                      <ElButton
                        text
                        type="primary"
                        :disabled="row.status == 'running' ? false : true"
                        @click="restartFn(row, row.status, 'apiServer')"
                        >{{ $t('public_button_restart') }}
                      </ElButton>
                    </div>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
          </div>
        </section>
        <div
          v-else-if="viewType === 'cluster'"
          v-loading="loading"
          class="content h-100"
        >
          <el-row
            v-if="waterfallData.length"
            class="waterfall"
            :gutter="24"
            style="row-gap: 24px"
          >
            <el-col
              v-for="item in waterfallData"
              :key="item.id"
              class="list"
              :md="12"
              :sm="24"
            >
              <div class="grid-content list-box border rounded-xl">
                <div class="list-box-header">
                  <div class="list-box-header-left">
                    <img
                      class="mr-4 rounded-xl"
                      src="../../assets/images/serve.svg"
                    />
                    <i
                      class="circular mr-2 mt-2"
                      :class="item.status !== 'running' ? 'bgred' : 'bggreen'"
                    />
                    <div class="list-box-header-main">
                      <h2 class="name fs-6">
                        {{ item.agentName || item.systemInfo.hostname }}
                      </h2>
                      <div class="uuid fs-8 my-1">
                        {{ item.systemInfo.uuid }}
                      </div>
                      <span class="ip">{{
                        item.custIP ? item.custIP : item.systemInfo.ip
                      }}</span>
                    </div>
                  </div>
                  <div
                    v-readonlybtn="'Cluster_operation'"
                    class="operation-bar flex align-self-start align-center"
                  >
                    <ElButton
                      v-if="item.canUpdate"
                      type="danger"
                      @click="
                        updateFn(
                          item,
                          item.management.status,
                          'management',
                          'update',
                        )
                      "
                      >{{ $t('cluster_update') }}
                    </ElButton>
                    <template
                      v-if="item.engine.status === 'running' && !hideDownload"
                    >
                      <el-tooltip
                        :content="$t('instance_details_xianchengziyuanxia')"
                        placement="top"
                      >
                        <el-button
                          text
                          @click="downServeFn(item)"
                        >
                          <template #icon>
                            <i-lucide:monitor-down />
                          </template>
                        </el-button>
                      </el-tooltip>
                      <el-tooltip
                        :content="$t('instance_details_shujuyuanziyuan')"
                        placement="top"
                      >
                        <el-button
                          text
                          @click="downConnectorsFn(item)"
                        >
                          <template #icon>
                            <i-lucide:hard-drive-download />
                          </template>
                        </el-button>
                      </el-tooltip>
                    </template>

                    <el-tooltip
                      :content="$t('cluster_add_server_mon')"
                      placement="top"
                    >
                      <el-button text @click="addServeFn(item)">
                        <template #icon>
                          <i-lucide:square-plus />
                        </template>
                      </el-button>
                  </el-tooltip>
                    

                    <el-button
                      text
                      @click="editAgent(item)"
                    >
                      <template #icon>
                        <i-lucide:settings />
                      </template>
                    </el-button>
                    <template v-if="item.status !== 'running'">
                      <ElDivider direction="vertical" />
                      <ElButton text type="danger" @click="delConfirm(item)">
                        <template #icon>
                          <i-lucide:trash-2 />
                        </template>
                      </ElButton>
                    </template>
                  </div>
                </div>
                <div v-if="item.metricValues" class="list-box-main">
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">
                      {{ item.metricValues.CpuUsage }}
                    </div>
                    {{ $t('cluster_cpu_usage') }}
                  </div>
                  <div class="line" />
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">
                      {{ item.metricValues.HeapMemoryUsage }}
                    </div>
                    {{ $t('cluster_heap_memory_usage') }}
                  </div>
                </div>
                <!-- 监控数据 -->
                <div class="list-box-footer">
                  <el-row :gutter="16" class="list-box-footer-header">
                    <el-col :span="6">
                      <span class="txt fw-sub">{{ $t('cluster_name') }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span class="txt fw-sub">{{ $t('cluster_status') }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span class="txt fw-sub">{{
                        $t('cluster_service_status')
                      }}</span>
                    </el-col>
                    <el-col :span="10">
                      <div class="btn txt fw-sub">
                        {{ $t('public_operation') }}
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16" class="data-list">
                    <el-col :span="6">
                      <span class="txt fw-normal">{{
                        $t('cluster_manage_sys')
                      }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[`status-${item.management.status}`, 'status']"
                        >{{ getStatus(item.management.status) }}</span
                      >
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[
                          `status-${item.management.serviceStatus}`,
                          'status',
                        ]"
                        >{{ getStatus(item.management.serviceStatus) }}</span
                      >
                    </el-col>
                    <el-col :span="10">
                      <div v-readonlybtn="'Cluster_operation'" class="btn">
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.management.status == 'stopped' ? false : true
                          "
                          @click="
                            startFn(
                              item,
                              item.management.status,
                              'management',
                              'start',
                            )
                          "
                          >{{ $t('public_button_start') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.management.status == 'running' ? false : true
                          "
                          @click="
                            closeFn(
                              item,
                              item.management.status,
                              'management',
                              'stop',
                            )
                          "
                          >{{ $t('public_button_close') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.management.status == 'running' ? false : true
                          "
                          @click="
                            restartFn(
                              item,
                              item.management.status,
                              'management',
                              'restart',
                            )
                          "
                          >{{ $t('public_button_restart') }}
                        </ElButton>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16" class="data-list">
                    <el-col :span="6">
                      <span class="txt fw-normal">{{
                        $t('cluster_sync_gover')
                      }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[`status-${item.engine.status}`, 'status']"
                        >{{ getStatus(item.engine.status) }}</span
                      >
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[
                          `status-${item.engine.serviceStatus}`,
                          'status',
                        ]"
                        >{{ getStatus(item.engine.serviceStatus) }}</span
                      >
                    </el-col>
                    <el-col :span="10">
                      <div v-readonlybtn="'Cluster_operation'" class="btn">
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.engine.status == 'stopped' ? false : true
                          "
                          @click="startFn(item, item.engine.status, 'engine')"
                          >{{ $t('public_button_start') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.engine.status == 'running' ? false : true
                          "
                          @click="closeFn(item, item.engine.status, 'engine')"
                          >{{ $t('public_button_close') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.engine.status == 'running' ? false : true
                          "
                          @click="restartFn(item, item.engine.status, 'engine')"
                          >{{ $t('public_button_restart') }}
                        </ElButton>
                        <ElDivider
                          v-if="bindWorkerMap[item.systemInfo.process_id]"
                          direction="vertical"
                        />
                        <ElButton
                          v-if="bindWorkerMap[item.systemInfo.process_id]"
                          text
                          type="primary"
                          :disabled="
                            item.engine.status == 'stopped' ? false : true
                          "
                          @click="unbind(item, item.engine.status, 'engine')"
                          >{{ $t('daas_unbind_license') }}
                        </ElButton>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16" class="data-list">
                    <el-col :span="6">
                      <span class="txt fw-normal">API server</span>
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[`status-${item.apiServer.status}`, 'status']"
                        >{{ getStatus(item.apiServer.status) }}</span
                      >
                    </el-col>
                    <el-col :span="4">
                      <span
                        :class="[
                          `status-${item.apiServer.serviceStatus}`,
                          'status',
                        ]"
                        >{{ getStatus(item.apiServer.status) }}</span
                      >
                    </el-col>
                    <el-col :span="10">
                      <div v-readonlybtn="'Cluster_operation'" class="btn">
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.apiServer.status == 'stopped' ? false : true
                          "
                          @click="
                            startFn(item, item.apiServer.status, 'apiServer')
                          "
                          >{{ $t('public_button_start') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.apiServer.status == 'running' ? false : true
                          "
                          @click="
                            closeFn(item, item.apiServer.status, 'apiServer')
                          "
                          >{{ $t('public_button_close') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          :disabled="
                            item.apiServer.status == 'running' ? false : true
                          "
                          @click="
                            restartFn(item, item.apiServer.status, 'apiServer')
                          "
                          >{{ $t('public_button_restart') }}
                        </ElButton>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row
                    v-for="child in item.customMonitorStatus"
                    :key="child.id"
                    :gutter="16"
                    class="data-list"
                  >
                    <el-col :span="6">
                      <span class="txt">{{ child.name }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span :class="child.status">{{ child.status }}</span>
                    </el-col>
                    <el-col :span="4">
                      <span :class="child.status">{{ child.status }}</span>
                    </el-col>
                    <el-col v-readonlybtn="'Cluster_operation'" :md="10">
                      <div class="btn">
                        <ElButton
                          text
                          type="primary"
                          @click="delServe(child, item.status)"
                          >{{ $t('public_button_delete') }}
                        </ElButton>
                        <ElDivider direction="vertical" />
                        <ElButton
                          text
                          type="primary"
                          @click="editServe(child, item.status, item)"
                          >{{ $t('public_button_edit') }}
                        </ElButton>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div
                  class="fs-6 font-color-dark flex align-center justify-content-between p-4 pt-2"
                >
                  <span
                    >{{ $t('daas_cluster_cluster_lianjiezongshu') }}:
                    {{ item.engine ? item.engine.netStatTotals || 0 : 0 }}</span
                  >
                  <el-button type="primary" @click="openNetStatDialog(item)"
                    >{{ $t('public_view_details') }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-empty v-else />
        </div>
        <div
          v-else-if="viewType === 'logMining'"
          v-loading="logMiningLoading"
          class="content flex-1"
        >
          <el-row
            v-if="logMiningData.length"
            class="waterfall"
            :gutter="24"
            style="row-gap: 24px"
          >
            <el-col
              v-for="item in logMiningData"
              :key="item.id"
              class="list"
              :md="12"
              :sm="24"
            >
              <div class="grid-content list-box border rounded-xl">
                <div class="list-box-header">
                  <div class="list-box-header-left">
                    <img
                      class="mr-4 rounded-xl"
                      src="../../assets/images/serve.svg"
                    />
                    <i
                      class="circular mr-2 mt-2"
                      :class="!item.isAlive ? 'bgred' : 'bggreen'"
                    />
                    <div class="list-box-header-main">
                      <h2 class="name fs-6 mb-1">{{ item.serviceId }}</h2>
                      <span class="ip">{{ item.dataSource }}</span>
                    </div>
                  </div>
                  <div
                    class="flex flex-column align-items-end justify-content-between"
                  >
                    <el-tag v-if="item.isAlive" type="success">{{
                      $t('public_status_running')
                    }}</el-tag>
                    <el-tag v-else type="danger">{{
                      $t('public_status_stop')
                    }}</el-tag>
                    <span class="font-color-light"
                      >{{ $t('packages_business_task_preview_startTime') }}:
                      {{ item.startTime }}</span
                    >
                  </div>
                </div>
                <div class="list-box-main">
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">{{ item.cpuUsage }}</div>
                    CPU 使用率
                  </div>
                  <div class="line" />
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">
                      {{ item.memoryUsage }}
                    </div>
                    堆内存使用率
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-empty v-else />
        </div>
      </div>

      <el-dialog
        v-model="dialogForm"
        :title="$t('cluster_add_server_mon')"
        class="serverDialog"
        :append-to-body="true"
        :lock-scroll="false"
        :close-on-click-modal="false"
        width="600px"
        @close="closeDialogForm()"
      >
        <AddServe ref="childRules" :data="currentData" :edit-item="editItem" />
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="closeDialogForm()">{{
              $t('public_button_cancel')
            }}</ElButton>
            <ElButton type="primary" @click="submitForm('ruleForm')"
              >{{ $t('public_button_confirm') }}
            </ElButton>
          </div>
        </template>
      </el-dialog>
      <el-dialog
        v-model="editAgentDialog"
        :title="$t('cluster_agentSetting')"
        class="serverDialog"
        :lock-scroll="false"
        :close-on-click-modal="false"
        width="600px"
        @close="editAgentDialog = false"
      >
        <el-form
          ref="editAgentForm"
          label-width="100px"
          class="edit-agent-form"
          label-position="top"
        >
          <el-form-item :label="$t('cluster_server_name')">
            <div class="flex gap-2 w-100">
              <el-input
                v-model="agentName"
                show-word-limit
                :placeholder="$t('cluster_placeholder_mon_server')"
              />
              <ElButton text type="primary" @click="editNameRest">{{
                $t('public_button_reduction')
              }}</ElButton>
            </div>
          </el-form-item>
          <el-form-item :label="$t('cluster_ip_display')" prop="command">
            <el-select
              v-model="custIP"
              :placeholder="$t('cluster_ip_display')"
            >
              <el-option
                v-for="item in ips"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <div class="ip-tip pt-2">{{ $t('cluster_ip_tip') }}</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="editAgentDialog = false">{{
              $t('public_button_cancel')
            }}</ElButton>
            <ElButton
              type="primary"
              @click="submitEditAgent('editAgentForm')"
              >{{ $t('public_button_confirm') }}</ElButton
            >
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="netStatDialog.visible"
        :title="$t('daas_cluster_cluster_lianjieshuliang_detail')"
        custom-class="serverDialog"
        :append-to-body="true"
        width="600px"
      >
        <ElTable :data="netStatDialog.data">
          <ElTableColumn
            prop="ip"
            :label="$t('daas_cluster_cluster_mubiaoIPhe')"
          />
          <ElTableColumn
            prop="numbers"
            :label="$t('daas_cluster_cluster_lianjieshuliang')"
          />
        </ElTable>
      </el-dialog>

      <ElDialog
        v-model="tagDialog.visible"
        :title="tagDialog.title"
        width="30%"
        :close-on-click-modal="false"
        @close="hideTagDialog"
      >
        <ElForm
          ref="tagForm"
          :model="tagDialog"
          :rules="tagDialog.rules"
          @submit.native.prevent
        >
          <ElFormItem prop="value" required>
            <ElInput
              v-model="tagDialog.value"
              :placeholder="$t('packages_component_classification_nodeName')"
              maxlength="50"
              show-word-limit
            />
          </ElFormItem>
        </ElForm>

        <template #footer>
          <ElButton @click="hideTagDialog">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton
            :disabled="tagDialog.saving"
            type="primary"
            @click="saveTag()"
          >
            {{ $t('public_button_save') }}
          </ElButton>
        </template>
      </ElDialog>

      <SetTag
        v-model:visible="setTagDialog.visible"
        :tag-data="tagData"
        :tag-map="tagMap"
        :tree-props="treeProps"
        :selection="setTagDialog.selection"
        :tag-list="setTagDialog.tagList"
        @closed="setTagDialog.tagList = []"
        @saved="onSavedTag"
      />
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.h-40 {
  height: 40px;
}
.tag-tree-wrapper {
  width: 228px;
}
.tag {
  padding: 2px 5px;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 14px;
  color: map.get($color, tag);
  border: 1px solid map.get($bgColor, tag);
  border-radius: 2px;
  margin-left: 5px;
}
.view-radio-group {
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: map.get($color, primary);
    color: #fff;
  }
}

.section-title {
  position: relative;
  padding-left: 12px;

  &::before {
    content: '';
    position: absolute;
    width: 4px;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: 10px;
    background-color: map.get($color, primary);
  }
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;

  & > :first-child {
    grid-column: span 2;
  }
}

.clusterManagement-container {
  display: contents;
  .status {
    display: inline-block;
    padding: 5px 10px;
    font-weight: 500;
    border-radius: 6px;
    line-height: 1;
  }

  .ip {
    display: inline-block;
    padding: 2px 10px;
    color: map.get($color, primary);
    background-color: #ebf3fd;
    border-radius: 6px;
  }

  .header {
    padding: 15px 20px;
    background: map.get($bgColor, white);
    overflow: hidden;
    border-bottom: 1px solid #dedee4;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    .title {
      font-size: 16px;
      color: map.get($fontColor, dark);
      font-weight: 600;
    }

    .log_btn {
      font-size: 14px;
      color: map.get($color, primary);
      cursor: pointer;
      float: right;
    }
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;

    .search-bar {
      display: flex;
      padding-left: 10px;

      li + li {
        margin-left: 10px;
      }
    }

    .content {
      .waterfall {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .list {
        padding-left: 0;
        overflow: hidden;
        box-sizing: border-box;

        .list-box {
          background-color: map.get($bgColor, white);
          //height: 340px;
          .list-box-header {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 12px 16px;

            .list-box-header-left {
              display: flex;
              flex-direction: row;

              img {
                width: 43px;
                height: 43px;
              }

              .circular {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
              }

              .list-box-header-main {
                .name {
                  margin: 0;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  color: map.get($fontColor, dark);
                }

                .uuid {
                  color: map.get($fontColor, slight);
                }
              }
            }

            .iconfont {
              // color: #999;
              cursor: pointer;
              margin-left: 10px;
            }

            .addBtn {
              span {
                font-size: 12px;
              }
            }
          }

          .list-box-main {
            display: flex;
            justify-content: center;
            padding: 16px 0;
            text-align: center;
            border-top: 1px solid map.get($borderColor, light);

            .usageRate {
              width: 50%;
              text-align: center;
              font-size: 12px;
              font-weight: 400;
              color: map.get($fontColor, slight);

              div {
                color: map.get($fontColor, dark);
              }
            }

            .line {
              width: 1px;
              height: 50px;
              background-color: #f2f2f2;
            }
          }

          .list-box-footer {
            display: flex;
            flex-direction: column;
            padding: 10px 16px;
            justify-content: center;

            .list-box-footer-header {
              width: 100%;
              height: 35px;
              margin: 0 !important;
              line-height: 35px;
              font-size: 12px;
              background-color: map.get($bgColor, normal);

              .txt {
                font-size: $fontBaseTitle;
                color: map.get($fontColor, light);
              }
            }

            .data-list {
              width: 100%;
              margin: 0 !important;
              margin-bottom: 5px;
              line-height: 35px;
              border-bottom: 1px solid map.get($borderColor, light);

              .txt {
                display: inline-block;
                width: 120px;
                font-size: $fontBaseTitle;
                color: map.get($fontColor, dark);
                text-overflow: ellipsis;
                white-space: nowrap;

                i {
                  padding-right: 5px;
                }
              }

              .btn {
                display: inline;

                :deep(.el-button) {
                  span {
                    font-weight: 400;
                  }
                }
              }

              // .popover-tip {
              //   display: inline-block;
              //   color: #f00;
              //   transform: rotate(180deg);
              //   cursor: pointer;
              // }
            }

            // .running {
            //   color: #178061;
            //   background-color: #c4f3cb;
            // }
            // .stopped {
            //   color: #d44d4d;
            //   background-color: #ffecec;
            // }
          }
        }

        .info {
          .usageRate {
            padding-left: 12px;
            font-size: 12px;
            color: map.get($fontColor, light);
          }

          .uuid {
            padding: 5px 0;
            font-size: 12px;
            color: map.get($fontColor, light);
          }

          span {
            font-size: 14px;
            color: map.get($fontColor, normal);
          }
        }
      }

      .screen {
        padding-right: 15px;
      }

      .red {
        color: map.get($color, danger);
      }

      .bgred {
        background-color: #ee5353 !important;
      }

      .green {
        color: map.get($color, primary);
      }

      .bggreen {
        background-color: #71c179 !important;
      }
    }
  }

  .no-text {
    display: flex;
    height: calc(100% - 60px);
    align-items: center;
    justify-content: center;
    color: map.get($color, primary);
    font-size: 16px;
    background-color: map.get($bgColor, white);
  }

  .edit-agent-form {
    .rest-btn {
      display: inline-block;
      margin-left: 10px;
      cursor: pointer;
    }

    .ip-tip {
      color: rgba(0, 0, 0, 0.46);
      font-size: 12px;
      line-height: 15px;
    }
  }

  .netstat {
    border-top: 1px solid #f2f2f2;
  }

  .netstat__list {
    max-height: 190px;
  }
}
</style>

<style lang="scss">
.clusterManagement-container {
  .edit-agent-form {
    .el-form-item {
      margin-bottom: 15px;
    }
  }
}

.serverDialog {
  .el-form {
    .el-form-item__label,
    .el-form-item__content {
      line-height: 28px;

      .el-form-item__error {
        padding-top: 1px;
        line-height: 12px;
      }
    }
  }
}

.has-dropdown {
  .el-tree-node__content {
    .tree-node-dropdown {
      display: none;
    }

    &:hover {
      .tree-node-dropdown {
        display: block;
      }
    }
  }
}
.engine-tag-tree {
  .el-tree-node__content {
    height: 32px;
    overflow: hidden;
  }
}
</style>
