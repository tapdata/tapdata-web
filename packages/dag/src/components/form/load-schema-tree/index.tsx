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
      const loadStatus = ref('')
      const isTransformed = ref(true)
      const formIsChange = ref(false)

      watch(
        () => dataflowStore.editVersion,
        () => {
          formIsChange.value = true
        },
      )

      async function getTask() {
        const taskId =
          dataflowStore.dataflow?.taskId || dataflowStore.dataflow?.id
        if (!taskId) {
          throw new Error('Task id is unavailable')
        }
        const { parent_task_sign } = route.query || {}
        return await getTaskById(taskId, {}, { parent_task_sign })
      }

      let timer: ReturnType<typeof setTimeout> | undefined
      let saveTimer: ReturnType<typeof setTimeout> | undefined

      async function getSchemaData(check = false, retry = 0) {
        if (check) {
          try {
            const { transformed } = (await getTask()) || {}
            isTransformed.value = !!transformed
          } catch (error) {
            loadStatus.value = true
            errorMsg.value =
              error?.data?.message ||
              error?.message ||
              i18n.t('packages_form_load_schema_tree_load_fail')
            loading.value = false
            return
          }

          if (!isTransformed.value) {
            if (retry >= 15) {
              loadStatus.value = true
              errorMsg.value = i18n.t(
                'packages_form_load_schema_tree_load_fail',
              )
              loading.value = false
              return
            }
            timer && clearTimeout(timer)
            timer = setTimeout(() => {
              getSchemaData(check, retry + 1)
            }, 2000)
            return
          }
        }
        getNodeSchema(nodeId)
          .then((data) => {
            fieldList.value = data?.[0]?.fields || []
          })
          .catch((error) => {
            loadStatus.value = true
            errorMsg.value =
              error?.data?.message ||
              i18n.t('packages_form_load_schema_tree_load_fail')
          })
          .finally(() => {
            loading.value = false
          })
      }

      function refreshSchemaAfterTaskSave() {
        let saveStarted = dataflowStore.taskSaving
        const unwatchSaving = watch(
          () => dataflowStore.taskSaving,
          (saving) => {
            if (saving) {
              saveStarted = true
            } else if (saveStarted) {
              clearTimeout(saveTimer)
              saveTimer = undefined
              unwatchSaving()
              getSchemaData(true)
            }
          },
        )
        saveTimer = setTimeout(() => {
          unwatchSaving()
          saveTimer = undefined
          loadStatus.value = true
          errorMsg.value = i18n.t(
            'packages_form_load_schema_tree_load_fail',
          )
          loading.value = false
        }, 30000)

        if (!saveStarted) {
          dataflowStore.patchDataflowDebounce()
        }
      }

      function handleLoadSchema() {
        const getState = form.getState()
        const formValues = getState?.values || {}
        const { nodeConfig, connectionId } = formValues
        const { tableNameField } = props
        const params = {
          className: 'DiscoverSchemaService',
          method: 'discoverSchema',
          nodeId,
          args: [
            connectionId,
            Object.assign({ file: 'file', nodeId }, nodeConfig),
          ],
        }
        loading.value = true
        isTransformed.value = true
        form
          .validate()
          .then(() => {
            callProxy(params)
              .then(() => {
                const filter = {
                  where: {
                    'source.id': connectionId,
                    meta_type: {
                      in: ['collection', 'table', 'view'],
                    },
                    is_deleted: false,
                    sourceType: 'SOURCE',
                    original_name: {
                      neq: '',
                    },
                  },
                  page: 1,
                  size: 20,
                  fields: {
                    original_name: true,
                  },
                  order: ['original_name ASC'],
                }
                getConnectionNoSchema(connectionId).then((con) => {
                  if (con.loadFieldErrMsg) {
                    errorMsg.value = con.loadFieldErrMsg
                    loadStatus.value = true
                    loading.value = false
                  } else {
                    fetchMetadataInstances(filter)
                      .then((metaData) => {
                        const table = metaData.items?.[0]?.original_name
                        const fieldName = tableNameField || 'tableName'

                        if (!table) {
                          loadStatus.value = true
                          errorMsg.value = i18n.t(
                            'packages_form_load_schema_tree_load_fail',
                          )
                          loading.value = false
                          return
                        }

                        loadStatus.value = false
                        errorMsg.value = ''

                        if (form.getValuesIn(fieldName) === table) {
                          refreshSchemaAfterTaskSave()
                          return
                        }

                        form.setValuesIn(fieldName, table)
                        refreshSchemaAfterTaskSave()
                      })
                      .catch((error) => {
                        loadStatus.value = true
                        const msg = error?.data?.message
                        errorMsg.value = msg
                        if (msg) {
                          ElMessage.error(msg)
                        }
                        loading.value = false
                      })
                  }
                })
              })
              .catch((error) => {
                loadStatus.value = true
                const msg = error?.data?.message
                errorMsg.value = msg
                ElMessage.error(msg)
                loading.value = false
              })
          })
          .catch(() => {
            ElMessage.error(i18n.t('packages_form_qingjianchajiedian'))
            loading.value = false
          })
      }

      onMounted(() => {
        loading.value = true
        getSchemaData()
      })

      onUnmounted(() => {
        timer && clearTimeout(timer)
        saveTimer && clearTimeout(saveTimer)
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
