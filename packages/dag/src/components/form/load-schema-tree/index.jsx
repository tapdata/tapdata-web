import { observer } from '@formily/reactive-vue'
import {
  getConnectionNoSchema,
  metadataInstancesApi,
  proxyApi,
  taskApi,
} from '@tap/api'
import { useForm } from '@tap/form'
import i18n from '@tap/i18n'

import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

import { useStore } from 'vuex'
import './style.scss'

export const loadSchemaTree = observer(
  defineComponent({
    props: ['findParentNode', 'value', 'tableNameField'],
    setup(props) {
      const store = useStore()
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
        () => store.state.dataflow.editVersion,
        () => {
          formIsChange.value = true
        },
      )

      async function getTask() {
        const taskId = store.state.dataflow?.taskId
        const { parent_task_sign } = this.$route.query || {}
        return await taskApi.get(taskId, {}, { parent_task_sign })
      }

      let timer

      async function getSchemaData(check = false) {
        if (check) {
          const { transformed } = (await getTask()) || {}
          isTransformed.value = !!transformed
          if (!isTransformed.value) {
            timer && clearTimeout(timer)
            timer = setTimeout(() => {
              getSchemaData(check)
            }, 2000)
            return
          }
        }
        metadataInstancesApi
          .nodeSchema(nodeId)
          .then((data) => {
            fieldList.value = data?.[0]?.fields || []
          })
          .finally(() => {
            loading.value = false
          })
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
            proxyApi
              .call(params)
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
                    metadataInstancesApi
                      .get({ filter: JSON.stringify(filter) })
                      .then((metaData) => {
                        const table = metaData.items?.[0]?.original_name
                        form.setValuesIn(tableNameField || 'tableName', '')
                        setTimeout(() => {
                          form.setValuesIn(tableNameField || 'tableName', table)
                          isTransformed.value = false
                          const unwatchSaving = watch(
                            () => store.state.dataflow.taskSaving,
                            (v) => {
                              if (!v) {
                                getSchemaData(true)
                                unwatchSaving()
                              }
                            },
                          )
                        }, 3000)
                      })
                      .finally(() => {
                        loadStatus.value = false
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
