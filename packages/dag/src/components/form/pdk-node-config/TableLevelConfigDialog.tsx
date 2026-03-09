import { getNodeSchemaPage } from '@tap/api/src/core/metadata-instances'
import { computed as reactiveComputed } from '@tap/form'
import { useI18n } from '@tap/i18n'
import { computed, defineComponent, ref, type PropType } from 'vue'
import type { Form } from '@formily/core'
import './style.scss'

export const TableLevelConfigDialog = defineComponent({
  props: {
    form: {
      type: Object as PropType<Form>,
      required: true,
    },
    nodeId: {
      type: String,
    },
  },
  setup(props, { slots }) {
    const { t } = useI18n()
    const selectedTable = ref('')
    const searchKeyword = ref('')
    const addTableValue = ref('')
    const tableNames = ref<{ name: string }[]>([])
    const loading = ref(false)

    const configuredTables = reactiveComputed(() => {
      const tableConfig = props.form.values.tableNodeConfig || {}
      return Object.keys(tableConfig)
    })

    const fetchTables = async () => {
      const params = {
        nodeId: props.nodeId,
        fields: ['original_name'],
        page: 1,
        pageSize: 99999999,
      }
      loading.value = true
      const result = await getNodeSchemaPage(params)
      tableNames.value = result.items.map((item: any) => ({
        name: item.original_name,
      }))
      loading.value = false
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
      return tableNames.value.filter((t) => !configured.has(t.name))
    })

    const addTable = (tableName: string) => {
      if (!tableName) return
      props.form.setValuesIn(`tableNodeConfig.${tableName}`, {})
      selectedTable.value = tableName
      addTableValue.value = ''
    }

    const delTable = (tableName: string) => {
      const basePath = `tableNodeConfig.${tableName}`
      // 清除字段图状态，否则再次添加时 schema default 不会重新生效
      props.form.clearFormGraph(basePath)
      props.form.clearFormGraph(`${basePath}.*`)
      props.form.deleteValuesIn(basePath)
      if (selectedTable.value === tableName) {
        selectedTable.value = configuredTables.value[0] ?? ''
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
          header: ({ titleClass }: { titleClass: string }) => (
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
                <ElSelectV2
                  modelValue={addTableValue.value}
                  onUpdate:modelValue={(val: string) => {
                    addTable(val)
                  }}
                  placeholder={`+ ${t('packages_dag_pdk_node_config_add_table')}`}
                  class="w-100 mb-3 add-table-select"
                  loading={loading.value}
                  filterable
                  options={availableTables.value}
                  props={{ label: 'name', value: 'name' }}
                />

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
