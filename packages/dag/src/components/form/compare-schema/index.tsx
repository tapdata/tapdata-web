import { action } from '@formily/reactive'
import {
  getCompareResultStatistics,
  type CompareResultStatistics,
} from '@tap/api/src/core/metadata-instances'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { useForm } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import CompareResultDialog from '../field-inference/CompareResultDialog.vue'

const CompareSchema = defineComponent({
  setup() {
    const store = useDataflowStore()
    const { t } = useI18n()

    const formRef = useForm()
    const form = formRef.value
    const nodeId = form.values.id
    const taskId = store.dataflow.id
    const dialogOpen = ref(false)
    const compareResultStatistics = ref<CompareResultStatistics | null>(null)
    const singleTable = form.values.type === 'table'

    const applyCompareRule = form.values.applyCompareRule
    const applyCompareRules = applyCompareRule
      ? form.values.applyCompareRules
      : []
    const ignoreCase = ref(form.values.compareIgnoreCase)

    const taskSaving = computed(() => {
      return store.dataflow.taskSaving
    })

    const fetchCompareResultStatistics = async () => {
      const res = await getCompareResultStatistics({
        nodeId,
        taskId,
      })
      compareResultStatistics.value = res
    }

    if (applyCompareRule === undefined) {
      // 旧任务 applyCompareRule === false, 不影响已有任务
      handleChangeRules(['Different', 'Precision'])
    } else {
      fetchCompareResultStatistics()
    }

    const openCompareResult = () => {
      dialogOpen.value = true
    }

    const handleLoadSchema = () => {}

    const alertTitle = computed(() => {
      const map = compareResultStatistics.value?.differentFieldNumberMap
      const time1 = dayjs(compareResultStatistics.value?.finishTime).fromNow()
      const time2 = dayjs(
        compareResultStatistics.value?.targetSchemaLoadTime,
      ).fromNow()
      let type = 'info'

      if (!map) {
        return {
          type,
          title: t('packages_dag_compare_result_no_schema', {
            time1,
          }),
        }
      }

      const details = []
      const total =
        (map.CannotWrite || 0) +
        (map.Missing || 0) +
        (map.Different || 0) +
        (map.PrimaryKeyInconsistency || 0)
      const resolved =
        (map.CannotWriteApply || 0) +
        (map.MissingApply || 0) +
        (map.DifferentApply || 0)

      if (!total)
        return {
          type,
          title: t('packages_dag_compare_result_alert', {
            time1,
            time2,
            result: t('packages_dag_compare_no_diff'),
          }),
        }

      if (resolved === total)
        return {
          type,
          title: t('packages_dag_compare_result_alert', {
            time1,
            time2,
            result: t('packages_dag_compare_result_with_diff_resolved', {
              count: total,
            }),
          }),
        }

      type = 'warning'

      if (resolved > 0)
        return {
          type,
          title: t('packages_dag_compare_result_alert', {
            time1,
            time2,
            result: t('packages_dag_compare_result_with_diff_partial', {
              count: total,
              resolved,
              remaining: total - resolved,
            }),
          }),
        }

      if (map.CannotWrite) {
        details.push(
          t('packages_dag_compare_result_detail_readonly', {
            readonly: map.CannotWrite,
          }),
        )
      }

      if (map.Missing) {
        details.push(
          t('packages_dag_compare_result_detail_missing', {
            missing: map.Missing,
          }),
        )
      }

      if (map.Different) {
        details.push(
          t('packages_dag_compare_result_detail_different', {
            different: map.Different,
          }),
        )
      }

      if (map.PrimaryKeyInconsistency) {
        details.push(
          t('packages_dag_compare_result_detail_primary_key_inconsistency', {
            primaryKeyInconsistency: map.PrimaryKeyInconsistency,
          }),
        )
      }

      return {
        type,
        title: t('packages_dag_compare_result_alert', {
          time1,
          time2,
          result:
            details.length > 1
              ? t('packages_dag_compare_result_with_diff', {
                  count: total,
                  details: `(${details.join(',')})`,
                })
              : details[0],
        }),
      }
    })

    function afterTaskSaved() {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (taskSaving.value) {
            const unwatch = watch(taskSaving, () => {
              unwatch()
              resolve(true)
            })
          } else {
            resolve(true)
          }
        }, 300)
      })
    }

    async function handleChangeRules(value: string[]) {
      const handler = action.bound((applyCompareRule, applyCompareRules) => {
        form.setValuesIn('applyCompareRule', applyCompareRule)
        form.setValuesIn('applyCompareRules', applyCompareRules)
      })

      if (value.length === 0) {
        handler(false, [])
      } else {
        handler(true, value)
      }

      await afterTaskSaved()

      fetchCompareResultStatistics()
    }

    const renderAlert = () => {
      return (
        <el-alert
          type={alertTitle.value.type}
          show-icon
          closable={false}
          class="fit-content"
          v-slots={{
            title: () => (
              <div class="flex align-center gap-2">
                <span>{alertTitle.value.title}</span>
                <el-button
                  type="primary"
                  text
                  class="ml-auto"
                  onClick={openCompareResult}
                >
                  {t('public_button_check')}
                </el-button>
              </div>
            ),
          }}
        />
      )
    }

    const handleIgnoreCaseChange = (value: boolean) => {
      ignoreCase.value = value
      form.setValuesIn('compareIgnoreCase', value)
    }

    return () => {
      return (
        compareResultStatistics.value && (
          <div class="flex flex-column gap-2 my-2">
            {renderAlert()}
            <CompareResultDialog
              v-model={dialogOpen.value}
              nodeId={nodeId}
              singleTable={singleTable}
              rules={applyCompareRules}
              ignoreCase={ignoreCase.value}
              onLoadSchema={handleLoadSchema}
              onChangeRules={handleChangeRules}
              onClose={fetchCompareResultStatistics}
              onUpdate:ignoreCase={handleIgnoreCaseChange}
            />
          </div>
        )
      )
    }
  },
})

export { CompareSchema }
