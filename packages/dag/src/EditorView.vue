<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, onMounted, provide, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Canvas from './Canvas.vue'
import NodesPanel from './components/NodesPanel.vue'
import TaskOperations from './components/TaskOperations.vue'
import { allResourceIns } from './nodes/loader'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const route = useRoute()
const store = useStore()
const { t } = useI18n()

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

const buttonShowMap = reactive({
  View: true,
  Edit: true,
  Delete: true,
  Reset: true,
  Start: true,
  Stop: true,
})

const dag = computed(() => dataflowStore.dag)
const dataflow = computed(() => dataflowStore.dataflow)

const hasFeature = (feature) => {
  return !isDaas || store.getters['feature/hasFeature']?.(feature)
}

const initNodeType = async () => {
  let nodes = [
    {
      name: t('packages_dag_src_editor_zhuconghebing'),
      type: 'merge_table_processor',
      hidden: !hasFeature('masterSlaveMergeProcessor'),
    },
    {
      name: t('packages_dag_src_editor_zhuijiahebing'),
      type: 'union_processor',
      hidden: !hasFeature('appendMergeProcessor'),
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli_standard'),
      type: 'standard_js_processor',
    },
    {
      name: t('packages_dag_src_migrationeditor_jSchuli'),
      type: 'js_processor',
      beta: true,
      hidden: !hasFeature('enhanceJsProcessor'),
    },
    {
      name: t('packages_dag_src_editor_row_filter'),
      type: 'row_filter_processor',
      hidden: !hasFeature('rowFilterProcessor'),
    },
    {
      name: t('packages_dag_src_editor_ziduanjisuan'),
      type: 'field_calc_processor',
    },
    {
      name: t('packages_dag_src_editor_leixingxiugai'),
      type: 'field_mod_type_processor',
    },
    {
      name: t('packages_dag_src_editor_ziduangaiming'),
      type: 'field_rename_processor',
    },
    {
      name: t('packages_dag_src_editor_zengshanziduan'),
      type: 'field_add_del_processor',
    },
    {
      name: t('packages_dag_date_processor'),
      type: 'date_processor',
    },
    {
      name: t('packages_dag_src_editor_leixingguolu'),
      type: 'field_mod_type_filter_processor',
    },
    {
      name: 'Unwind',
      type: 'unwind_processor',
      hidden: !hasFeature('unwindProcessor'),
    },
    {
      name: t('packages_dag_time_field_injection'),
      type: 'add_date_field_processor',
      hidden: !hasFeature('appendDatetimeFieldProcessor'),
    },
    {
      name: t('packages_dag_src_editor_huawei_drs_kafka_convertor'),
      type: 'huawei_drs_kafka_convertor',
    },
  ]
  //仅企业版有的节点
  if (isDaas) {
    const isDaasNode = [
      {
        name: t('packages_dag_src_editor_join'),
        type: 'join_processor', //join 节点
      },
    ]
    nodes = [...isDaasNode, ...nodes]
  }
  dataflowStore.addProcessorNode(nodes.filter((item) => !item.hidden))
  dataflowStore.addResourceIns(allResourceIns)

  if (hasFeature('customProcessor')) {
    await dataflowStore.loadCustomNode()
  }
}

onMounted(async () => {
  await initNodeType()
  await dataflowStore.fetchDataflow(route.params.id as string)
})

provide('dag', dag)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
</script>

<template>
  <div id="dataflow-container" class="w-100 h-100 position-relative">
    <div
      class="task-detail lh-8 position-absolute top-3 start-3 z-10 bg-card rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button text>
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <div>
        {{ dataflowStore.dataflow.name }}
      </div>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations />
    </div>
    <NodesPanel />
    <Canvas />
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
