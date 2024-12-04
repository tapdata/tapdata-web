<template>
  <section class="layout-wrap vh-100 flex flex-column min-h-0 bg-secondary-100">
    <header class="layout-header flex align-center border-bottom px-4 text-nowrap bg-white" style="flex: 0 0 64px">
      <button @click="handlePageReturn" class="icon-btn mr-2">
        <VIcon size="18">left</VIcon>
      </button>
      <span class="fw-bold">{{ $t('public_data_capture') }}</span>
      <VDivider class="mx-3" vertical inset></VDivider>
      <div class="overflow-hidden">
        <div class="flex align-items-center">
          <TextEditable
            class="overflow-hidden"
            v-model="name"
            :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
            :input-min-width="32"
            :maxlength="200"
            @change="onNameInputChange"
          />
          <TaskStatus :task="dataflow" :agent-map="agentMap" class="ml-4" />
        </div>
        <div class="flex align-items-center font-color-light mt-1">
          <span class="mr-2">{{ syncType[dataflow.type] }}</span>
          <span>{{ $t('packages_dag_monitor_topheader_zuijinyiciqi') }}</span>
          <span>{{ lastStartDate }}</span>
        </div>
      </div>
    </header>

    <section class="layout-wrap position-relative font-color-light p-4 overflow-auto">
      <div class="mb-4 text-center">
        <el-input v-model="keyword" placeholder="请输入关键字" style="width: 300px" clearable @input="onInput">
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </el-input>
      </div>
      <div v-if="list.length" class="flex flex-column gap-4 data-capture-collapse">
        <div
          v-for="item in list"
          :name="item.id"
          :key="item.id"
          class="rounded-lg overflow-hidden bg-white collapse-item"
        >
          <div class="p-2">
            <div
              class="p-2 collapse-item-header flex align-center gap-4 rounded-lg cursor-pointer"
              @click="toggleCollapse(item.id)"
            >
              <el-descriptions
                size="medium"
                :column="4"
                style="margin-bottom: -10px"
                contentClassName="fw-bold font-color-dark"
              >
                <el-descriptions-item label="原表名">{{ item.partitionTableId || item.tableId }}</el-descriptions-item>
                <el-descriptions-item label="事件类型">{{ item.type }}</el-descriptions-item>
                <el-descriptions-item label="事件时间">{{ item.time }}</el-descriptions-item>
                <el-descriptions-item label="事件ID">{{ item.id }}</el-descriptions-item>
                <el-descriptions-item label="原始数据" contentClassName="ellipsis">
                  <div class="flex align-center overflow-hidden">
                    <span class="ellipsis">{{ item.originalData }}</span>

                    <el-button v-if="item.originalData" type="text" class="px-1 py-0.5 font-color-dark" @click="handleCopy(item)">
                      <VIcon class="mr-1">copy</VIcon>
                      <span class="">{{ $t('public_button_copy') }}</span>
                    </el-button>
                  </div>
                </el-descriptions-item>
              </el-descriptions>

              <i
                class="el-collapse-item__arrow el-icon-arrow-right fs-6 m-0"
                :class="{ 'is-active': activeName === item.id }"
              ></i>
            </div>
          </div>

          <el-collapse-transition>
            <div v-if="activeName === item.id">
              <div class="p-2">
                <CaptureItem :data="item.data" :nodes="item.nodes"></CaptureItem>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>

      <v-empty v-else-if="isCancel && !list.length"></v-empty>

      <div class="flex justify-content-center px-4 mt-4">
        <el-button v-if="hasMore && isCancel" type="primary" :loading="loading" @click="run">加载更多</el-button>
        <span v-else-if="!isCancel"> <i class="el-icon-loading"></i> 拼命加载中 </span>
        <span v-else>到底了</span>
      </div>
    </section>
  </section>
</template>

<script>
import { makeStatusAndDisabled } from '@tap/business'
import { dataPermissionApi, taskApi } from '@tap/api'
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, reactive, set } from '@vue/composition-api'
import { TextEditable, VIcon, VEmpty, VDivider } from '@tap/component'
import { TaskStatus } from '@tap/business'
import syncTaskAgent from '@tap/business/src/mixins/syncTaskAgent'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { proxyApi } from '@tap/api'
import CaptureItem from './CaptureItem.vue'
import { allResourceIns } from '../nodes/loader'
import { setPageTitle } from '@tap/shared'
import { useRequest } from 'vue-request'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import axios from 'axios'
import Cookie from '@tap/shared/src/cookie'
import { copyToClipboard } from '@tap/shared'

export default defineComponent({
  name: 'DataCapture',
  components: {
    VDivider,
    VEmpty,
    CaptureItem,
    VIcon,
    TaskStatus,
    TextEditable,
    DynamicScroller,
    DynamicScrollerItem
  },
  mixins: [syncTaskAgent],

  setup(props, { root }) {
    // Data
    const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
    const dataflow = ref({
      status: ''
    })
    const keyword = ref('')
    const activeName = ref('')
    const name = ref('')
    const list = ref([])
    const nodes = ref([])
    const hasMore = ref(true)
    const isCancel = ref(false)
    let startLoopTaskTimer

    const syncType = {
      initial_sync: i18n.t('public_task_type_initial_sync'),
      cdc: i18n.t('public_task_type_cdc'),
      'initial_sync+cdc': i18n.t('public_task_type_initial_sync_and_cdc')
    }
    const buttonShowMap = reactive({
      View: true,
      Edit: true,
      Delete: true,
      Reset: true,
      Start: true,
      Stop: true
    })

    // Computed
    const lastStartDate = computed(() => {
      const { lastStartDate } = dataflow.value
      return lastStartDate ? dayjs(lastStartDate).format('YYYY-MM-DD HH:mm:ss') : '-'
    })

    const NodeMap = computed(() =>
      nodes.value.reduce((map, node) => {
        map[node.id] = node
        return map
      }, {})
    )

    const DataMap = computed(() =>
      list.value.reduce((map, item) => {
        map[item.id] = item
        return map
      }, {})
    )

    // Watch
    watch(
      () => dataflow.value.name,
      v => {
        name.value = v
      }
    )

    // Methods

    const loadData = async () => {
      const res = await proxyApi.call({
        className: 'CatchDataService',
        method: 'getCatchData',
        // taskId
        args: [dataflow.value.id, 10, keyword.value || null],
        subscribeIds: [`processId_${dataflow.value.agentId}`]
      })
      // type: '', //事件类型 type=300: insert，type=302 update, type=301 delete
      const TYPE = {
        300: 'insert',
        301: 'delete',
        302: 'update'
      }

      hasMore.value = res.hasMore

      const resData = res.data
        .map(item => {
          item.time = dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss')
          item.type = TYPE[item.type.split('=').pop()]
          item.id = item.id.split('=').pop()

          const includeNodeIds = Object.keys(item.data)
          let target = item.data[includeNodeIds[0]]

          if (includeNodeIds.length > 1) {
            const id = includeNodeIds.find(id => {
              const node = NodeMap.value[id]
              return node.$outputs.length && !node.$inputs.length
            })
            target = item.data[id]
          }

          if (target) {
            item.originalData = JSON.stringify(target.data)
            target.logTags.forEach(tag => {
              const arr = tag.split('=')
              if (arr.length === 2 && (arr[0] === 'tableId' || arr[0] === 'partitionTableId')) {
                item[arr[0]] = arr[1]
              }
            })
          }

          item.nodes = genNodes(item.data)

          return item
        })
        .filter(item => {
          if (DataMap.value[item.id]) {
            Object.assign(DataMap.value[item.id], item)
            return false
          }
          return true
        })

      list.value.push(...resData)
    }

    const initNodeType = async () => {
      root.$store.commit('dataflow/addResourceIns', allResourceIns)
      await root.$store.dispatch('dataflow/loadCustomNode')
    }

    // 获取任务的按钮权限
    const getTaskPermissions = async () => {
      if (!isDaas) return
      const id = dataflow.value.id || root.$route.params?.id
      if (!id) return
      const data = await dataPermissionApi.dataActions({
        dataType: 'Task',
        dataId: id
      })
      for (let key in buttonShowMap) {
        buttonShowMap[key] = data.includes(key)
      }
    }

    const handleEditFlush = result => {
      if (result.data) {
        if (result.data.id !== dataflow.value.id) {
          return
        }
        reformDataflow(result.data, true)
      }
    }

    const initWS = () => {
      root.$ws.off('editFlush', handleEditFlush)
      root.$ws.on('editFlush', handleEditFlush)
      root.$ws.send({
        type: 'editFlush',
        taskId: dataflow.value.id,
        data: {
          opType: 'subscribe'
        }
      })
    }

    const initData = async () => {
      await proxyApi.call({
        className: 'CatchDataService',
        method: 'openCatchData',
        args: [dataflow.value.id, null, 60],
        returnClass: 'java.lang.Boolean',
        subscribeIds: [`processId_${dataflow.value.agentId}`]
      })
    }

    const initView = async () => {
      const { id } = root.$route.params

      await openDataflow(id)

      initWS()
    }

    const onNameInputChange = () => {
      if (!name.value) {
        name.value = dataflow.value.name
      } else {
        root.$emit('change-name', name.value)
      }
    }

    const handlePageReturn = () => {
      const map = {
        migrate: 'migrateList',
        logCollector: 'sharedMining',
        shareCache: 'sharedCache',
        connHeartbeat: 'heartbeatTable'
      }
      root.$router.push({
        name: map[dataflow.syncType] || 'dataflowList'
      })
      window.name = null
    }

    const titleSet = () => {
      setPageTitle(`${dataflow.value.name} - ${root.$t(root.$route.meta.title)}`)
    }

    const startLoopTask = id => {
      // console.debug(i18n.t('packages_dag_mixins_editor_debug4')) // eslint-disable-line
      clearTimeout(startLoopTaskTimer)
      if (!id) return
      startLoopTaskTimer = setTimeout(async () => {
        const { parent_task_sign } = root.$route.query || {}
        const data = await taskApi.get(id, {}, { parent_task_sign })

        if (data) {
          if (data.errorEvents?.length) {
            // 清除 stacks
            data.errorEvents.forEach(event => {
              delete event.stacks
            })
          }

          // 同步下任务上的属性，重置后会改变
          dataflow.value.attrs = data.attrs

          makeStatusAndDisabled(data)

          if (dataflow.value.status !== data.status) {
            dataflow.value.status = data.status
          }
          // 需要实时更新的字段
          dataflow.value.lastStartDate = data.lastStartDate
          dataflow.value.startTime = data.startTime
          dataflow.value.pingTime = data.pingTime
          dataflow.value.shareCdcStop = data.shareCdcStop
          dataflow.value.shareCdcStopMessage = data.shareCdcStopMessage
          dataflow.value.timeDifference = data.timeDifference
          dataflow.value.currentEventTimestamp = data.currentEventTimestamp
          dataflow.value.functionRetryStatus = data.functionRetryStatus
          dataflow.value.taskRetryStartTime = data.taskRetryStartTime

          if (data.currentEventTimestamp) {
            dataflow.value.currentEventTimestampLabel = dayjs(data.currentEventTimestamp).format('YYYY-MM-DD HH:mm:ss')
          }

          if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动

          Object.assign(dataflow.value.disabledData, data.btnDisabled)

          root.$emit('loop-task')
          startLoopTask(id)
        }
      }, 5000)
    }

    const stopLoopTask = () => {
      clearTimeout(startLoopTaskTimer)
    }

    const loadDataflow = async (id, params) => {
      try {
        const { parent_task_sign } = root.$route.query || {}
        const data = await taskApi.get(id, params, { parent_task_sign })
        if (!data) {
          root.$message.error(i18n.t('packages_dag_mixins_editor_renwubucunzai'))
          handlePageReturn()
          return
        }

        if (data.errorEvents?.length) {
          // 清除 stacks
          data.errorEvents.forEach(event => {
            delete event.stacks
          })
        }

        data.dag = data.temp || data.dag // 和后端约定了，如果缓存有数据则获取temp
        // 共享缓存
        data.syncType = data.shareCache ? 'shareCache' : data.syncType
        reformDataflow(data)

        name.value = data.name

        startLoopTask(id)
        titleSet()
        return data
      } catch (e) {
        console.error(e)
        root.$message.error(i18n.t('packages_dag_mixins_editor_renwujiazaichu'))
        handlePageReturn()
      }
    }

    const reformDataflow = (data, fromWS) => {
      makeStatusAndDisabled(data)
      if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动
      dataflow.value.status = data.status
      dataflow.value.disabledData = data.btnDisabled
      dataflow.value.taskRecordId = data.taskRecordId
      dataflow.value.stopTime = data.stopTime
      dataflow.value.startTime = data.startTime
      dataflow.value.lastStartDate = data.lastStartDate
      dataflow.value.pingTime = data.pingTime

      if (data.currentEventTimestamp) {
        dataflow.value.currentEventTimestampLabel = dayjs(data.currentEventTimestamp).format('YYYY-MM-DD HH:mm:ss')
      }

      // this.$set(this.dataflow, 'shareCdcStop', data.shareCdcStop)
      // this.$set(this.dataflow, 'shareCdcStopMessage', data.shareCdcStopMessage)
      // 前端不关心的属性
      dataflow.value.attrs = data.attrs

      if (!fromWS) {
        Object.keys(data).forEach(key => {
          if (!['dag'].includes(key)) {
            // dataflow[key] = data[key]
            set(dataflow.value, key, data[key])
          }
        })
      }
    }

    const openDataflow = async id => {
      const getResourceIns = root.$store.getters['dataflow/getResourceIns']

      const data = await loadDataflow(id)

      if (data) {
        const { dag } = data
        const outputsMap = {}
        const inputsMap = {}

        dag.edges.forEach(({ source, target }) => {
          const _source = outputsMap[source]
          const _target = inputsMap[target]

          if (!_source) {
            outputsMap[source] = [target]
          } else {
            _source.push(target)
          }

          if (!_target) {
            inputsMap[target] = [source]
          } else {
            _target.push(source)
          }
        })

        dag.nodes.forEach(node => {
          node.$inputs = inputsMap[node.id] || []
          node.$outputs = outputsMap[node.id] || []

          const ins = getResourceIns(node)
          Object.defineProperty(node, '__Ctor', {
            value: ins,
            enumerable: false
          })
        })

        nodes.value = dag.nodes
      }
    }

    const genNodes = nodeDataMap => {
      const includeNodeIds = Object.keys(nodeDataMap)

      if (includeNodeIds.length === 1) {
        return [nodes.value.find(node => node.id === includeNodeIds[0])]
      }

      const index = includeNodeIds.findIndex(id => {
        const node = NodeMap.value[id]
        return node.$outputs.length && !node.$inputs.length
      })

      if (index !== -1) {
        const sourceId = includeNodeIds[index]
        includeNodeIds.splice(index, 1)

        if (includeNodeIds.length === 1) {
          return [NodeMap.value[sourceId], NodeMap.value[includeNodeIds[0]]]
        }

        const recursiveOutput = id => {
          const node = NodeMap.value[id]
          const arr = [node]

          if (includeNodeIds.length && node.$outputs.length) {
            for (let nodeId of node.$outputs) {
              const index = includeNodeIds.indexOf(nodeId)

              if (index > -1) {
                const target = includeNodeIds[index]
                includeNodeIds.splice(index, 1)
                arr.push(...recursiveOutput(target))
              }
            }
          }

          return arr
        }

        return recursiveOutput(sourceId)
      }

      return []
    }

    const closeCapture = () => {
      // 使用 sendBeacon 发送请求
      const formData = new FormData()
      formData.append('className', 'CatchDataService')
      formData.append('method', 'closeCatchData')
      formData.append('args', JSON.stringify([dataflow.value.id]))
      formData.append('subscribeIds', JSON.stringify([`processId_${dataflow.value.agentId}`]))

      const body = {
        className: 'CatchDataService',
        method: 'closeCatchData',
        args: [dataflow.value.id],
        subscribeIds: [`processId_${dataflow.value.agentId}`]
      }
      const headers = {
        type: 'application/json'
      }
      const blob = new Blob([JSON.stringify(body)], headers)
      const accessToken = Cookie.get('access_token')

      return navigator.sendBeacon(`${axios.defaults.baseURL}api/proxy/call?access_token=${accessToken}`, blob)
    }

    const { run, cancel, loading } = useRequest(loadData, {
      manual: true,
      pollingInterval: 5000,
      debounceInterval: 200,
      onAfter: () => {
        if (list.value.length > 50) {
          isCancel.value = true
          cancel()
        }
      }
    })

    const handleBeforeUnload = event => {
      closeCapture()
      event.preventDefault()
      event.returnValue = ''
    }

    const toggleCollapse = id => {
      activeName.value = activeName.value === id ? '' : id
    }

    const onInput = () => {
      activeName.value = ''
      list.value = []
      run()
    }

    const handleCopy = item => {
      copyToClipboard(JSON.stringify(Object.values(item.data)))
      root.$message.success(i18n.t('public_message_copy_success'))
    }

    // Lifecycle
    onMounted(async () => {
      window.addEventListener('beforeunload', handleBeforeUnload)

      await getTaskPermissions()
      await initNodeType()
      await initView(true)
      await initData(true)

      run()
    })

    onBeforeUnmount(() => {
      // 移除事件监听
      window.removeEventListener('beforeunload', handleBeforeUnload)
      stopLoopTask()
      root.$ws.off('editFlush', handleEditFlush)
      cancel()
      closeCapture()
    })

    return {
      keyword,
      isCancel,
      hasMore,
      loading,
      run,
      name,
      activeName,
      dataflow,
      list,
      nodes,
      syncType,
      NodeMap,
      lastStartDate,
      startLoopTask,
      stopLoopTask,
      genNodes,
      onNameInputChange,
      handlePageReturn,
      toggleCollapse,
      onInput,
      handleCopy
    }
  }
})
</script>

<style scoped lang="scss">
$sidebarW: 236px;
$hoverBg: #eef3ff;
$radius: 6px;
$baseHeight: 26px;
$sidebarBg: #fff;

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  padding: 4px;
  color: #4e5969;
  background: #fff;
  outline: none;
  border: 1px solid transparent;
  border-radius: $radius;
  transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;

  &.active,
  &:not(.disabled):hover {
    color: map-get($color, primary);
    background: $hoverBg;
  }
}

.data-capture-collapse {
  .collapse-item-header {
    transition: background 0.3s;

    &:hover {
      background: #f4f4f5;
    }

    ::v-deep .el-descriptions__body {
      background: transparent;
    }
  }
}
</style>

<style lang="scss">
.data-capture-collapse.el-collapse {
  .el-collapse-item > div[role='tab'] {
    padding: 8px;
  }

  .el-collapse-item__header {
    border-radius: 8px;
    transition: background 0.3s;

    &:hover {
      background: #f4f4f5;
    }

    .el-descriptions__body {
      background: transparent;
    }
  }

  .el-collapse-item__header:hover {
    background: #f4f4f5;
  }

  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border: 0;
  }

  .el-collapse-item__arrow {
    font-size: 16px;
    margin-right: 16px;
  }

  .el-collapse-item__header {
    height: auto;
  }

  .el-collapse-item__content {
    padding-bottom: 0;
  }
}
</style>
