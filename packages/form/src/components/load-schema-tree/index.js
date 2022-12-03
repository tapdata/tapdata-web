import { defineComponent, ref } from 'vue-demi'
import { observer } from '@formily/reactive-vue'
import { useForm } from '@formily/vue'
import { computed, onMounted, onUnmounted } from '@vue/composition-api'

import { metadataInstancesApi, proxyApi } from '@tap/api'

import './style.scss'

export const loadSchemaTree = observer(
  defineComponent({
    props: ['findParentNode', 'value', 'tableNameField'],
    setup(props, { root }) {
      const formRef = useForm()
      const form = formRef.value
      const loading = ref(false)
      const fieldList = ref()
      fieldList.value = form.getValuesIn('loadSchemaTree')
      const title = root.$t('packages_form_load_schema_tree_button_title')
      const nodeId = form.getValuesIn('id')

      const transformLoading = computed(() => {
        return root.$store.state.dataflow.transformLoading
      })

      let timer

      function getSchemaData(check = false) {
        metadataInstancesApi
          .nodeSchema(nodeId)
          .then(data => {
            fieldList.value = data?.[0]?.fields || []
            if (check && transformLoading.value) {
              timer && clearTimeout(timer)
              timer = setTimeout(() => {
                getSchemaData(check)
              }, 2000)
            }
          })
          .finally(() => {
            if (!check || (check && !transformLoading.value)) {
              loading.value = false
            }
          })
      }

      function handleLoadSchema() {
        const getState = form.getState()
        const formValues = getState?.values || {}
        const { nodeConfig, connectionId } = formValues
        const { tableNameField } = props
        let params = {
          className: 'DiscoverSchemaService',
          method: 'discoverSchema',
          nodeId,
          args: [connectionId, Object.assign({ file: 'file', nodeId }, nodeConfig)]
        }
        loading.value = true
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
                      in: ['collection', 'table', 'view']
                    },
                    is_deleted: false,
                    sourceType: 'SOURCE',
                    original_name: {
                      neq: ''
                    }
                  },
                  page: 1,
                  size: 20,
                  fields: {
                    original_name: true
                  },
                  order: ['original_name ASC']
                }
                metadataInstancesApi
                  .get({ filter: JSON.stringify(filter) })
                  .then(metaData => {
                    const table = metaData.items?.[0]?.original_name
                    form.setValuesIn(tableNameField || 'tableName', '')
                    setTimeout(() => {
                      form.setValuesIn(tableNameField || 'tableName', table)
                      root.$store.commit('dataflow/setTransformLoading', true)
                      getSchemaData(true)
                    }, 200)
                  })
                  .catch(() => {
                    loading.value = false
                  })
              })
              .catch(err => {
                root.$message.error(err?.msg)
                loading.value = false
              })
          })
          .catch(() => {
            root.$message.error(root.$t('packages_form_qingjianchajiedian'))
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

      return () => {
        return (
          <div>
            <el-button class="mb-2" loading={loading.value} onClick={handleLoadSchema}>
              {title}
            </el-button>
            <el-tree
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
            ></el-tree>
          </div>
        )
      }
    }
  })
)
