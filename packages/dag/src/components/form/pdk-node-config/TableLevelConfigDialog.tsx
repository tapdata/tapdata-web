import { getNodeSchemaPage } from '@tap/api/src/core/metadata-instances'
import { computed as reactiveComputed } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref } from 'vue'
import './style.scss'

interface TableConfig {
  tableName: string
  syncMode: string
  primaryKey: string
  batchSize: number
  filterEnabled: boolean
  fieldMappingEnabled: boolean
}

export const TableLevelConfigDialog = defineComponent({
  props: {
    form: Object,
    nodeId: {
      type: String,
    },
  },
  setup(props, { slots }) {
    const { t } = useI18n()
    const selectedTable = ref('')
    const searchKeyword = ref('')
    const addTableValue = ref('')
    const tableNames = ref<string[]>([])

    const configuredTables = reactiveComputed(() => {
      const tableConfig = props.form.values.tableConfig || {}
      return Object.keys(tableConfig)
    })

    const fetchTables = async () => {
      const params = {
        nodeId: props.nodeId,
        fields: ['original_name'],
        page: 1,
        pageSize: 99999999,
      }
      const result = await getNodeSchemaPage(params)
      tableNames.value = result.items.map((item: any) => item.original_name)
    }

    const configuredCount = computed(() => configuredTables.value.length)

    const filteredTables = computed(() => {
      if (!searchKeyword.value) return configuredTables.value
      return configuredTables.value.filter((name) =>
        name.toLowerCase().includes(searchKeyword.value.toLowerCase()),
      )
    })

    const availableTables = computed(() => {
      const configured = new Set(configuredTables.value)
      return tableNames.value.filter((name) => !configured.has(name))
    })

    const addTable = (tableName: string) => {
      if (!tableName) return
      props.form.setValuesIn(`tableConfig.${tableName}`, {})
      selectedTable.value = tableName
      addTableValue.value = ''
    }

    const delTable = (tableName: string) => {
      const basePath = `tableConfig.${tableName}`
      // 清除字段图状态，否则再次添加时 schema default 不会重新生效
      props.form.clearFormGraph(basePath)
      props.form.clearFormGraph(`${basePath}.*`)
      props.form.deleteValuesIn(basePath)
      if (selectedTable.value === tableName) {
        selectedTable.value = configuredTables.value[0]
      }
    }

    const handleOpen = () => {
      fetchTables()
    }

    return () => (
      <ElDialog
        width="800px"
        class="p-0 table-level-config-dialog"
        close-on-click-modal={false}
        onOpen={handleOpen}
      >
        {{
          header: ({ titleClass }) => (
            <div class="pt-5 px-6 flex align-center gap-2">
              <div class={titleClass}>
                {t('packages_dag_pdk_node_config_table_level')}
              </div>
              {configuredCount.value > 0 && (
                <ElTag type="info" class="is-code" size="small">
                  {configuredCount.value}
                </ElTag>
              )}
            </div>
          ),
          default: () => (
            <div class="table-level-config-dialog__body border-top">
              {/* Left Panel */}
              <div class="table-level-config-dialog__left">
                <ElSelect
                  modelValue={addTableValue.value}
                  onUpdate:modelValue={(val: string) => {
                    addTable(val)
                  }}
                  placeholder={`+ ${t('packages_dag_pdk_node_config_add_table')}`}
                  class="w-100 mb-3 add-table-select"
                  filterable
                >
                  {availableTables.value.map((name) => (
                    <ElOption key={name} label={name} value={name} />
                  ))}
                </ElSelect>

                {configuredCount.value > 0 ? (
                  <>
                    <ElInput
                      modelValue={searchKeyword.value}
                      onUpdate:modelValue={(val: string) =>
                        (searchKeyword.value = val)
                      }
                      placeholder={t(
                        'packages_dag_pdk_node_config_search_configured',
                      )}
                      clearable
                      class="mb-3"
                    >
                      {{
                        prefix: () => (
                          <ElIcon>
                            <ElIconSearch />
                          </ElIcon>
                        ),
                      }}
                    </ElInput>
                    <ElScrollbar class="table-level-config-dialog__table-list">
                      {filteredTables.value.map((item) => (
                        <div
                          key={item}
                          class={[
                            'table-level-config-dialog__table-item flex align-center gap-2',
                            { active: selectedTable.value === item },
                          ]}
                          style="margin-bottom: 1px;"
                          onClick={() => (selectedTable.value = item)}
                        >
                          <ILucideTable />
                          {item}

                          <ElButton
                            class="ml-auto del-btn"
                            size="small"
                            text
                            icon={IconLucideTrash2}
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation()
                              delTable(item)
                            }}
                          ></ElButton>
                        </div>
                      ))}
                    </ElScrollbar>
                  </>
                ) : (
                  <ElEmpty
                    imageSize={32}
                    description={t('packages_dag_add_table_from_top')}
                  ></ElEmpty>
                )}
              </div>

              {/* Right Panel */}
              <div class="table-level-config-dialog__right">
                {selectedTable.value ? (
                  slots.default?.(selectedTable.value)
                ) : (
                  <ElEmpty
                    description={t('packages_dag_select_table_from_left')}
                    image-size={64}
                  ></ElEmpty>
                )}
              </div>
            </div>
          ),
        }}
      </ElDialog>
    )
  },
})
