import { useI18n } from '@tap/i18n'
import { computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { allResourceIns } from '../nodes/loader'
import { useDataflowStore } from '../stores/dataflow.store'

export function useCanvasOperation() {
  const dataflowStore = useDataflowStore()

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
  const { t } = useI18n()
  const store = useStore()
  const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

  watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
    // 触发保存Task
    console.log('触发保存Task', dag.value)
  })

  const hasFeature = (feature: string) => {
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

  const onUpdateNodesPosition = (events) => {
    events.forEach(({ id, position }) => {
      dataflowStore.setNodePositionById(id, position)
    })
  }

  const onCreateConnection = (connection) => {
    dataflowStore.addConnection(connection)
  }

  const onDeleteConnection = (connection) => {
    dataflowStore.deleteConnection(connection)
  }

  const onClickConnectionAdd = (connection) => {
    // dataflowStore.addConnection(connection)
  }

  const onClickNode = (node) => {
    dataflowStore.selectNode(node)
  }

  return {
    dataflow,
    dag,
    buttonShowMap,
    initNodeType,
    onUpdateNodesPosition,
    onCreateConnection,
    onDeleteConnection,
    onClickConnectionAdd,
    onClickNode,
  }
}
