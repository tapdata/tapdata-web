<script setup lang="ts">
import { renameTask } from '@tap/api/src/core/task'
import { showErrorMessage } from '@tap/business/src/components/error-message'
import { TextEditable } from '@tap/component/src/base/text-editable'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { setPageTitle } from '@tap/shared'
import { getCurrentInstance, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Canvas from './Canvas.vue'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store = useStore()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

const {
  dag,
  dataflow,
  buttonShowMap,
  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onAddNode,
  onMoveNodePosition,
  onClickConnectionAdd,
  onUpdateNodesPosition,
  onClickNode,
} = useCanvasOperation()

const isInitialized = ref(false)
const nameHasUpdated = ref(false)
const upgradeFeeVisibleTips = ref('')
const upgradeFeeVisible = ref(false)

const init = async () => {
  await initNodeType()
  await dataflowStore.initPdkProperties()
  await dataflowStore.fetchDataflow(route.params.id as string)

  isInitialized.value = true
}

watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
  if (isInitialized.value) {
    dataflowStore.patchDataflowDebounce()
  }
})

init()

const titleSet = () => {
  setPageTitle(`${dataflowStore.dataflow.name} - ${t(route.meta.title)}`)
}

// 升级专业版
const handleShowUpgradeFee = (msg) => {
  upgradeFeeVisibleTips.value = msg
  upgradeFeeVisible.value = true
}

// 升级规格
const handleShowUpgradeCharges = (msg) => {
  upgradeChargesVisibleTips.value = msg
  upgradeChargesVisible.value = true
}

const handleShowUpgradeDialog = (err) => {
  if (isDaas) return
  const { proxy } = getCurrentInstance()
  proxy.$axios
    .get(
      `api/tcm/agent?filter=${encodeURIComponent(
        JSON.stringify({
          size: 100,
          page: 1,
        }),
      )}`,
    )
    .then(async (data) => {
      const { items = [] } = data

      if (items.some((t) => t.status === 'Stopped')) {
        ElMessage.error(t('public_task_error_schedule_limit'))
        return
      }

      items.length <= 1 &&
      items.some(
        (t) =>
          t.orderInfo?.chargeProvider === 'FreeTier' || !t.orderInfo?.amount,
      )
        ? handleShowUpgradeFee(err.message)
        : handleShowUpgradeCharges(err.message)
    })
}

const handleError = (error, msg = t('packages_dag_src_editor_chucuole')) => {
  const code = error?.code
  if (code === 'Task.ListWarnMessage') {
    const names = []
    if (error?.data) {
      const keys = Object.keys(error.data)
      keys.forEach((key) => {
        const node = store.state.dataflow.NodeMap[key]
        if (node) {
          names.push(node.name)
          store.commit('dataflow/setNodeErrorMsg', {
            id: node.id,
            msg: error.data[key][0].msg,
          })
        }
      })
      if (!names.length && keys.length && msg) {
        // 兼容错误信息id不是节点id的情况
        const msg = error.data[keys[0]][0]?.msg
        if (msg) {
          ElMessage.error(msg)
          return
        }
      }
    }
  } else if (code === 'Task.OldVersion') {
    Modal.confirm(t('packages_dag_task_old_version_confirm'), {
      confirmButtonText: t('public_button_refresh'),
    }).then((resFlag) => {
      resFlag && location.reload()
    })
  } else if (
    ['Task.ScheduleLimit', 'Task.ManuallyScheduleLimit'].includes(code)
  ) {
    handleShowUpgradeDialog(error)
  } else {
    showErrorMessage(error)
  }
}

const onNameInputChange = (value: string) => {
  const oldName = dataflowStore.dataflow.name
  nameHasUpdated.value = true
  dataflowStore.dataflow.name = value
  renameTask(dataflowStore.dataflow.id, value).then(
    () => {
      ElMessage.success(t('packages_dag_message_task_rename_success'))
      titleSet()
    },
    (error) => {
      dataflowStore.dataflow.name = oldName
      handleError(error)
    },
  )
}

// Control NodesPanel visibility
const nodesPanelExpanded = ref(true)

const toggleExpandNodes = () => {
  nodesPanelExpanded.value = !nodesPanelExpanded.value
}

const handlePageReturn = () => {
  if (!dag.value.nodes.length && dataflow.value.id) {
    Modal.confirm(
      t('packages_dag_page_return_confirm_title'),
      t('packages_dag_page_return_confirm_content'),
      {
        confirmButtonText: t('packages_dag_page_return_confirm_ok_text'),
        cancelButtonText: t('packages_dag_page_return_confirm_cancel_text'),
      },
    ).then((res) => {
      if (res) {
        deleteTask(dataflow.value.id)
      }
      router.push({
        name: 'dataflowList',
      })
      window.name = null
    })
  } else {
    router.push({
      name: 'dataflowList',
    })
    window.name = null
  }
}

provide('dag', dag)
provide('nodesPanelExpanded', nodesPanelExpanded)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
</script>

<template>
  <div
    id="dataflow-container"
    class="w-100 h-100 position-relative overflow-hidden"
  >
    <div
      class="task-detail position-absolute top-3 start-3 z-10 bg-card rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button text @click="handlePageReturn">
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <!-- <el-divider direction="vertical" class="mx-0" /> -->
      <div>
        <TextEditable
          v-model:value="dataflowStore.dataflow.name"
          class="overflow-hidden"
          :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
          :maxlength="200"
          hidden-icon
          @change="onNameInputChange"
        />
      </div>
      <el-button text @click="toggleExpandNodes">
        <template #icon>
          <VIcon>expand-list</VIcon>
        </template>
      </el-button>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations @show-settings="toggleShowSettings" />
    </div>
    <Canvas
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:connection:add="onClickConnectionAdd"
      @click:node="onClickNode"
    />
  </div>
</template>

<style scoped lang="scss">
.header {
  top: 28px;
}
:deep(.btn-shadow) {
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;
}
</style>
