import { observer } from '@formily/reactive-vue'
import {
  computed as reactiveComputed,
  RecursionField,
  useFieldSchema,
  useForm,
  type Schema,
} from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref } from 'vue'
import { TableLevelConfigDialog } from './TableLevelConfigDialog'

function buildPerTableSchema(originalSchema: Schema) {
  const filteredProperties = originalSchema.reduceProperties(
    (acc, fieldSchema, key) => {
      if (fieldSchema['x-perTable'] === true) {
        // 直接标记的字段
        acc[key] = fieldSchema.toJSON()
      } else if (fieldSchema.type === 'object' && fieldSchema.properties) {
        // 嵌套 object，递归向下找
        const nested = buildPerTableSchema(fieldSchema)
        if (Object.keys(nested.properties || {}).length > 0) {
          acc[key] = {
            ...fieldSchema.toJSON(),
            properties: nested.properties,
          }
        }
      }
      return acc
    },
    {} as Record<string, any>,
  )

  return { type: 'object', properties: filteredProperties }
}

export const PdkNodeConfig = observer(
  defineComponent({
    setup(_props, { slots }) {
      const schemaRef = useFieldSchema()
      const formRef = useForm()
      const nodeId = formRef.value.values.id
      const formSchema = buildPerTableSchema(
        schemaRef.value.properties!.nodeConfig as Schema,
      )
      const showTableConfigBtn = computed(() => {
        const schema = schemaRef.value.toJSON()
        const properties = schema.properties as Record<string, any> | undefined
        const scope = properties?.nodeConfig?.['x-tableConfigScope']
        if (!scope) return false
        return (
          (scope.includes('source') && !formRef.value.values.$inputs.length) ||
          (scope.includes('target') && formRef.value.values.$inputs.length)
        )
      })
      const tableCount = reactiveComputed(() => {
        const tableConfig = formRef.value.values.tableNodeConfig || {}
        return Object.keys(tableConfig).length
      })
      const { t } = useI18n()
      const activeNames = ref(['pdk'])
      const dialogVisible = ref(false)

      const openDialog = (event: MouseEvent) => {
        event.stopPropagation()
        dialogVisible.value = true
      }

      return () => (
        <ElCollapse
          modelValue={activeNames.value}
          onUpdate:modelValue={(val: any) => (activeNames.value = val)}
          expand-icon-position="left"
          class="formily-element-plus-form-collapse advanced-collapse"
        >
          <ElCollapseItem name="pdk">
            {{
              title: () => (
                <div class="flex align-items-center flex-1">
                  <span>{t('packages_dag_config_datasource')}</span>
                  <div class="flex-grow-1"></div>
                  {showTableConfigBtn.value && (
                    <el-button
                      onClick={openDialog}
                      bg={tableCount.value > 0}
                      icon={IconLucideSettings2}
                    >
                      {t('packages_dag_pdk_node_config_table_level')}

                      {tableCount.value > 0 && (
                        <el-tag
                          size="small"
                          round
                          class="is-code ml-1"
                          type="info"
                        >
                          {tableCount.value}
                        </el-tag>
                      )}
                    </el-button>
                  )}
                </div>
              ),
              default: () => slots.default?.(),
            }}
          </ElCollapseItem>

          <TableLevelConfigDialog
            v-model={dialogVisible.value}
            nodeId={nodeId}
            form={formRef.value}
          >
            {{
              default: (tableName: string) => (
                <RecursionField
                  onlyRenderProperties={true}
                  name={`tableNodeConfig.${tableName}`}
                  schema={formSchema}
                ></RecursionField>
              ),
            }}
          </TableLevelConfigDialog>
        </ElCollapse>
      )
    },
  }),
)
