import { LifeCycleTypes } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import {
  fetchMetadataInstances,
  getNodeSchema,
} from '@tap/api/src/core/metadata-instances'
import { callProxy } from '@tap/api/src/core/proxy'
import { getTaskById } from '@tap/api/src/core/task'
import { useForm } from '@tap/form'
import i18n from '@tap/i18n'

import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDataflowStore } from '../../../stores/dataflow.store'
import './style.scss'

function getErrorMessage(error: unknown) {
  const details = error as
    | { data?: { message?: string }; message?: string }
    | undefined
  return details?.data?.message || details?.message
}

export const loadSchemaTree = observer(
  defineComponent({
    props: ['findParentNode', 'value', 'tableNameField'],
    setup(props) {
      const dataflowStore = useDataflowStore()
      const route = useRoute()
      const formRef = useForm()
      const form = formRef.value
      const loading = ref(false)
      const fieldList = ref()
      fieldList.value = form.getValuesIn('loadSchemaTree')
      const title = i18n.t('packages_form_load_schema_tree_button_title')
      const nodeId = form.getValuesIn('id')
      const errorMsg = ref('')
      const loadStatus = ref(false)
      const formIsChange = ref(false)
      let unmounted = false
      let cancelPollDelay: (() => void) | undefined

      watch(
        () => dataflowStore.editVersion,
        () => {
          formIsChange.value = true
        },
      )

      function getTask(taskId: string) {
        const { parent_task_sign } = route.query || {}
        return getTaskById(taskId, {}, { parent_task_sign })
      }

      function showLoadError(message = '') {
        loadStatus.value = true
        errorMsg.value = message
      }

      async function getSchemaData() {
        const data = await getNodeSchema(nodeId)
        if (!unmounted) {
          fieldList.value = data?.[0]?.fields || []
        }
      }

      function waitForNextPoll() {
        return new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 2000)
          cancelPollDelay = () => {
            clearTimeout(timer)
            resolve()
          }
        })
      }

      async function waitForTransform(
        taskId: string,
        previousTransformUuid: string | null | undefined,
        isCurrent: () => boolean,
      ) {
        for (let attempt = 0; attempt <= 15 && isCurrent(); attempt++) {
          const task = await getTask(taskId)
          if (!isCurrent()) return false
          if (
            task?.transformed &&
            task.transformUuid &&
            task.transformUuid !== previousTransformUuid
          ) {
            return true
          }
          if (attempt < 15) await waitForNextPoll()
        }
        return false
      }

      async function handleLoadSchema() {
        if (loading.value) return

        const pageVersion = dataflowStore.pageVersion
        const isCurrent = () =>
          !unmounted && dataflowStore.pageVersion === pageVersion
        const { nodeConfig, connectionId } = form.getState()?.values || {}
        const fieldName = props.tableNameField || 'tableName'
        loading.value = true
        loadStatus.value = false
        errorMsg.value = ''

        try {
          try {
            await form.validate()
          } catch {
            if (isCurrent()) {
              ElMessage.error(i18n.t('packages_form_qingjianchajiedian'))
            }
            return
          }
          if (!isCurrent()) return

          await callProxy({
            className: 'DiscoverSchemaService',
            method: 'discoverSchema',
            nodeId,
            args: [
              connectionId,
              Object.assign({ file: 'file', nodeId }, nodeConfig),
            ],
          })
          if (!isCurrent()) return

          const connection = await getConnectionNoSchema(connectionId)
          if (!isCurrent()) return
          if (connection.loadFieldErrMsg) {
            showLoadError(connection.loadFieldErrMsg)
            return
          }

          const metadata = await fetchMetadataInstances({
            where: {
              'source.id': connectionId,
              meta_type: { in: ['collection', 'table', 'view'] },
              is_deleted: false,
              sourceType: 'SOURCE',
              original_name: { neq: '' },
            },
            page: 1,
            size: 20,
            fields: { original_name: true },
            order: ['original_name ASC'],
          })
          if (!isCurrent()) return

          const table = metadata?.items?.[0]?.original_name
          const taskId =
            dataflowStore.dataflow?.taskId || dataflowStore.dataflow?.id
          if (!table || !taskId) {
            showLoadError()
            return
          }

          const previousTask = await getTask(taskId)
          if (!isCurrent()) return

          const previousTable = form.getValuesIn(fieldName)
          if (previousTable !== table) {
            form.setValuesIn(fieldName, table)
          }
          form.notify(LifeCycleTypes.ON_FORM_INPUT_CHANGE)
          const saved = await dataflowStore.saveDataflowNow()
          if (!isCurrent()) return

          if (!saved) {
            if (
              previousTable !== table &&
              form.getValuesIn(fieldName) === table
            ) {
              form.setValuesIn(fieldName, previousTable)
            }
            showLoadError()
            return
          }

          const transformed = await waitForTransform(
            taskId,
            previousTask?.transformUuid,
            isCurrent,
          )
          if (!isCurrent()) return
          if (!transformed) {
            showLoadError()
            return
          }

          await getSchemaData()
        } catch (error) {
          if (isCurrent()) showLoadError(getErrorMessage(error))
        } finally {
          if (!unmounted) {
            loading.value = false
          }
        }
      }

      onMounted(() => {
        loading.value = true
        getSchemaData()
          .catch((error) => {
            if (!unmounted) showLoadError(getErrorMessage(error))
          })
          .finally(() => {
            if (!unmounted) loading.value = false
          })
      })

      onUnmounted(() => {
        unmounted = true
        cancelPollDelay?.()
      })

      const loadStatusDom = () => {
        return loadStatus.value ? (
          <el-tooltip
            disabled={!errorMsg.value}
            content={errorMsg.value}
            placement="top"
            class="ml-2"
          >
            <span className="inline-flex align-content-center">
              <VIcon
                size="16"
                class="mr-1 color-danger"
                style="padding-bottom: 2px"
              >
                info
              </VIcon>
              <span class="color-danger">
                {i18n.t('packages_form_load_schema_tree_load_fail')}
              </span>
            </span>
          </el-tooltip>
        ) : (
          ''
        )
      }

      const formValuesChangeDom = () => {
        return formIsChange.value ? (
          <span class="ml-2 color-warning">
            {i18n.t('packages_form_load_schema_tree_form_values_change')}
          </span>
        ) : (
          ''
        )
      }

      return () => {
        return (
          <div>
            <div class="mb-2">
              <el-button
                type="primary"
                plain
                loading={loading.value}
                onClick={handleLoadSchema}
              >
                {title}
              </el-button>
              {loadStatusDom()}
              {formValuesChangeDom()}
            </div>
            {/*<el-tree
              loading={loading.value}
              ref="tree"
              data={fieldList.value}
              node-key="id"
              default-expand-all={true}
              class="schema-tree"
              scopedSlots={{
                default: ({ data }) => (
                  <span class="row" slot-scope="{  data }">
                    <span class="inline-block" style="width: 20px">
                      {data.primary_key_position > 0 ? (
                        <VIcon size="12" class="text-warning ml-1">
                          key
                        </VIcon>
                      ) : (
                        ''
                      )}
                    </span>
                    <span>{data.field_name}</span>
                    <span class="schema-tree__type ml-2 color-light">{data.data_type}</span>
                  </span>
                )
              }}
            ></el-tree>*/}
          </div>
        )
      }
    },
  }),
)
