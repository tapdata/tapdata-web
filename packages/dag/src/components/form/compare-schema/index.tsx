import { action } from '@formily/reactive'
import {
  getCompareResultStatistics,
  type CompareResultStatistics,
} from '@tap/api'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { useForm } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import CompareResultDialog from '../field-inference/CompareResultDialog.vue'

const CompareSchema = defineComponent({
  setup() {
    const store = useStore()
    const { t } = useI18n()

    const formRef = useForm()
    const form = formRef.value
    const nodeId = form.values.id
    const taskId = store.state.dataflow.taskId
    const dialogOpen = ref(false)
    const compareResultStatistics = ref<CompareResultStatistics | null>(null)
    const singleTable = form.values.type === 'table'

    const applyCompareRule = form.values.applyCompareRule
    const applyCompareRules = applyCompareRule
      ? form.values.applyCompareRules
      : []

    const taskSaving = computed(() => {
      return store.state.dataflow.taskSaving
    })

    const fetchCompareResultStatistics = async () => {
      const res = await getCompareResultStatistics({
        nodeId,
        taskId,
      })
      compareResultStatistics.value = res
    }

    fetchCompareResultStatistics()

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
        (map.CannotWrite || 0) + (map.Missing || 0) + (map.Different || 0)
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

      return {
        type,
        title: t('packages_dag_compare_result_alert', {
          time1,
          time2,
          result: t('packages_dag_compare_result_with_diff', {
            count: total,
            details: `(${details.join(',')})`,
          }),
        }),
      }
    })

    const afterTaskSaved = () => {
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

    const handleChangeRules = async (value: string[]) => {
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

    return () => {
      return (
        compareResultStatistics.value && (
          <div class="flex flex-column gap-2 my-2">
            {renderAlert()}
            {/* <el-alert
            type="info"
            show-icon
            closable={false}
            class="fit-content"
            v-slots={{
              title: () => (
                <div class="flex align-center gap-2">
                  <span>1 小时前对比数据库模型无差异</span>
                  <el-button
                    type="primary"
                    text
                    class="ml-auto"
                    onClick={openCompareResult}
                  >
                    查看
                  </el-button>
                </div>
              ),
            }}
          ></el-alert>
          <el-alert
            type="info"
            show-icon
            closable={false}
            class="fit-content"
            v-slots={{
              title: () => (
                <div class="flex align-center gap-2">
                  <span>2 小时前未找到数据库模型，暂未进行对比</span>
                  <el-button
                    type="primary"
                    text
                    class="ml-auto"
                    onClick={openCompareResult}
                  >
                    查看
                  </el-button>
                </div>
              ),
            }}
          ></el-alert>
          <el-alert
            type="info"
            show-icon
            closable={false}
            class="fit-content"
            v-slots={{
              title: () => (
                <div class="flex align-center gap-2">
                  <span>
                    5 分钟前对比数据库模型，发现 6 个字段差异（1 个只读，5
                    个缺失），已处理
                  </span>
                  <el-button
                    type="primary"
                    text
                    class="ml-auto"
                    onClick={openCompareResult}
                  >
                    查看
                  </el-button>
                </div>
              ),
            }}
          />
          <el-alert
            type="warning"
            show-icon
            closable={false}
            class="fit-content"
            v-slots={{
              title: () => (
                <div class="flex align-center gap-2">
                  <span>
                    5 分钟前对比数据库模型，发现 6 个字段差异（1 个只读，5
                    个缺失）
                  </span>
                  <el-button
                    type="primary"
                    text
                    class="ml-auto"
                    onClick={openCompareResult}
                  >
                    查看
                  </el-button>
                </div>
              ),
            }}
          /> */}

            <CompareResultDialog
              v-model={dialogOpen.value}
              nodeId={nodeId}
              singleTable={singleTable}
              rules={applyCompareRules}
              onLoadSchema={handleLoadSchema}
              onChangeRules={handleChangeRules}
              onClose={fetchCompareResultStatistics}
            />
          </div>
        )
      )
    }
  },
})

export { CompareSchema }
