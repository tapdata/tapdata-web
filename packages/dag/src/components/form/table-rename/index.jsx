import { observer } from '@formily/reactive-vue'
import { SchemaExpressionScopeSymbol } from '@formily/vue'
import { taskApi } from '@tap/api'
import { IconButton } from '@tap/component/src/icon-button'
import { VEmpty } from '@tap/component/src/base/v-empty'
import {
  connect,
  FormGrid,
  FormItem,
  FormLayout,
  mapReadPretty,
  PreviewText,
  useForm,
} from '@tap/form'
import i18n from '@tap/i18n'
import { configProviderContextKey } from 'element-plus'
import { debounce } from 'lodash-es'
import {
  computed,
  defineComponent,
  inject,
  reactive,
  ref,
} from 'vue'
import { useStore } from 'vuex'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'
import { getTableRenameByConfig, ifTableNameConfigEmpty } from '../../../util'
import List from './List.vue'
import './style.scss'

// 源节点改变，表编辑按照批量配置重新应用，重新应用的场景如下：
// 1. 记录源节点id，表编辑节点渲染时进行判断，如果源节点和上次记录的不同，重新应用批量规则
// 2. 用户停留在表编辑节点时，监听源节点ID变化，重新应用批量规则

export const TableRenamePreview = defineComponent({
  props: ['findParentNodes', 'value', 'listStyle', 'disabled', 'taskId'],
  setup(props, { emit }) {
    const store = useStore()
    const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
    const taskId =
      SchemaExpressionScopeContext.value.$taskId || store.state.dataflow.taskId
    const itemSize = 38
    const formRef = useForm()
    const form = formRef.value
    const tableDataRef = ref([])
    const loading = ref(false)
    const valueMap = {}
    const nameMap = reactive(
      props.value
        ? props.value.reduce((obj, item) => {
            obj[item.previousTableName] = item.currentTableName
            valueMap[item.previousTableName] = item
            return obj
          }, {})
        : {},
    )
    const countByName = computed(() => {
      return tableDataRef.value.reduce((map, previousTableName) => {
        const currentTableName = nameMap[previousTableName]

        if (currentTableName) {
          if (currentTableName in map) {
            map[currentTableName]++
          } else {
            map[currentTableName] = 1
          }
        }

        return map
      }, {})
    })
    const config = reactive({
      search: '',
      replaceBefore: form.values.replaceBefore, // 替换前
      replaceAfter: form.values.replaceAfter || '', // 替换后
      prefix: form.values.prefix || '', // 前缀
      suffix: form.values.suffix || '', // 后缀
      transferCase: form.values.transferCase || '', // toUpperCase ｜ toLowerCase
      transformLoading: store.state.dataflow.transformLoading,
    })

    const globalNameMap = computed(() => {
      if (ifTableNameConfigEmpty(config)) return {}

      return tableDataRef.value.reduce((map, n) => {
        const after = getTableRenameByConfig(n, config)

        if (n !== after) {
          map[n] = after
        }

        return map
      }, {})
    })

    let prevMap = {}
    const invalidOperations = ref([])
    const makeTable = (...args) => {
      if (form.values.$inputs?.length && taskId && form.values.id) {
        loading.value = true
        taskApi
          .getNodeTableInfo({
            taskId,
            nodeId: form.values.id,
            page: 1,
            pageSize: 10000,
          })
          .then(({ items = [] }) => {
            prevMap = {}
            tableDataRef.value = items.map((item) => {
              prevMap[item.previousTableName] = item.sourceObjectName
              return item.previousTableName
            })

            invalidOperations.value = props.value.filter((op) => {
              return !prevMap[op.previousTableName]
            })

            // 新创建的源节点按表达式选表，tableNames 为空
            // 导致表编辑校验时拿不到源表名无法正确的校验
            // 这里把拿到的表名设置到源节点上（跟TM沟通，当表达式选表时，TM不会读取只会写入tableNames，所以不会影响到）
            const parents = props.findParentNodes(form.values.id)
            if (
              tableDataRef.value.length &&
              parents &&
              parents.length &&
              !parents[0].tableNames?.length &&
              parents[0].migrateTableSelectType === 'expression'
            ) {
              parents[0].tableNames = tableDataRef.value.slice()
            }
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        tableDataRef.value = []
      }
    }

    makeTable()

    // 源节点发生变化，任务保存后加载模型
    useAfterTaskSaved(formRef.value.values.$inputs, makeTable)

    const updateName = (val, name) => {
      if (val !== name) {
        nameMap[name] = val
      } else {
        delete nameMap[name]
      }
    }

    const filterNames = computed(() => {
      const txt = config.search.trim().toLowerCase()
      if (txt) {
        return tableDataRef.value.filter((n) => n.toLowerCase().includes(txt))
      }
      return tableDataRef.value
    })

    const doModify = () => {
      updateConfig()
    }

    const lazyModify = debounce(doModify, 1000)

    const doReset = () => {
      Object.assign(config, {
        search: '',
        replaceBefore: '',
        replaceAfter: '',
        prefix: '',
        suffix: '',
        transferCase: '',
      })
      updateConfig()
    }

    const resetNames = () => {
      doReset()
      const keys = Object.keys(nameMap)
      if (keys.length) {
        keys.forEach((key) => {
          delete nameMap[key]
        })
        emitChange()
      }
    }

    const emitChange = () => {
      const arr = []
      Object.entries(nameMap).forEach(
        ([previousTableName, currentTableName]) => {
          const originTableName =
            prevMap[previousTableName] ||
            valueMap[previousTableName]?.originTableName // 当表从源节点移除 originTableName 会为 undefined

          arr.push({
            originTableName,
            previousTableName,
            currentTableName,
          })
        },
      )
      emit('change', arr)
    }

    const updateConfig = () => {
      form.setValues({
        replaceBefore: config.replaceBefore, // 替换前
        replaceAfter: config.replaceAfter, // 替换后
        prefix: config.prefix, // 前缀
        suffix: config.suffix, // 后缀
        transferCase: config.transferCase, // toUpperCase ｜ toLowerCase
      })
    }

    const deleteInvalid = (name, index) => {
      delete nameMap[name]
      invalidOperations.value.splice(index, 1)
      emitChange()
    }

    const deleteAllInvalid = () => {
      invalidOperations.value.forEach((item) => {
        delete nameMap[item.previousTableName]
      })
      invalidOperations.value = []
      emitChange()
    }

    const transferOptions = [
      {
        label: i18n.t('packages_form_field_processor_index_bubian'),
        value: '',
      },
      {
        label: i18n.t('packages_form_field_processor_index_daxie'),
        value: 'toUpperCase',
      },
      {
        label: i18n.t('packages_form_field_processor_index_xiaoxie'),
        value: 'toLowerCase',
      },
    ]

    return {
      config,
      filterNames,
      updateName,
      resetNames,
      doModify,
      lazyModify,
      doReset,
      emitChange,
      nameMap,
      tableData: tableDataRef,
      loading,
      countByName,
      itemSize,
      globalNameMap,
      invalidOperations,
      deleteAllInvalid,
      deleteInvalid,
      transferOptions,
    }
  },

  render() {
    return (
      <PreviewText.Placeholder value="-">
        <div class="table-rename">
          <FormLayout feedbackLayout="none">
            <FormGrid maxColumns={3} columnGap={16}>
              <FormGrid.GridColumn>
                <FormItem.BaseItem
                  label={i18n.t(
                    'packages_form_field_processor_index_daxiaoxie',
                  )}
                  layout="horizontal"
                >
                  <PreviewText.Select
                    value={this.config.transferCase}
                    options={this.transferOptions}
                  ></PreviewText.Select>
                </FormItem.BaseItem>
              </FormGrid.GridColumn>
              <FormGrid.GridColumn>
                <FormItem.BaseItem
                  label={i18n.t('packages_form_field_processor_index_qianzhui')}
                  layout="horizontal"
                >
                  <PreviewText.Input
                    value={this.config.prefix}
                  ></PreviewText.Input>
                </FormItem.BaseItem>
              </FormGrid.GridColumn>
              <FormGrid.GridColumn>
                <FormItem.BaseItem
                  label={i18n.t('packages_form_field_processor_index_houzhui')}
                  layout="horizontal"
                >
                  <PreviewText.Input
                    value={this.config.suffix}
                  ></PreviewText.Input>
                </FormItem.BaseItem>
              </FormGrid.GridColumn>
            </FormGrid>
          </FormLayout>
          <div class="flex mt-4">
            <ElInput
              v-model={this.config.search}
              prefixIcon="el-icon-search"
              clearable
              placeholder={i18n.t(
                'packages_form_table_rename_index_sousuobiaoming',
              )}
            ></ElInput>
          </div>

          <div
            class="name-list flex flex-column border border-form rounded-xl overflow-hidden my-4"
            style={this.listStyle}
          >
            <div class="name-list-header flex flex-shrink-0">
              <div class="name-list-title px-4">
                {i18n.t('packages_form_table_rename_index_yuanbiaoming')}
              </div>
              <div class="name-list-title pl-5 pr-4">
                {i18n.t('packages_form_table_rename_index_xinbiaoming')}
              </div>
            </div>
            <div
              ref="nameList"
              class="name-list-content font-color-light overflow-auto"
            >
              {this.filterNames.length ? (
                <List
                  disabled={this.disabled}
                  items={this.filterNames}
                  itemSize={this.itemSize}
                  buffer={50}
                  countByName={this.countByName}
                  nameMap={this.nameMap}
                  globalNameMap={this.globalNameMap}
                  tableData={this.tableData}
                  updateName={this.updateName}
                  emitChange={this.emitChange}
                ></List>
              ) : (
                <EmptyItem></EmptyItem>
              )}
            </div>
          </div>
        </div>
      </PreviewText.Placeholder>
    )
  },
})

export const TableRename = connect(
  observer(
    defineComponent({
      props: ['findParentNodes', 'value', 'listStyle', 'disabled', 'taskId'],
      setup(props, { emit }) {
        const configProvider = inject(configProviderContextKey)
        console.log('config', configProvider)
        const store = useStore()

        const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
        const taskId =
          SchemaExpressionScopeContext.value.$taskId ||
          store.state.dataflow.taskId
        const itemSize = 38
        const formRef = useForm()
        const form = formRef.value
        const tableDataRef = ref([])
        const loading = ref(false)
        const valueMap = {}
        const nameMap = reactive(
          props.value
            ? props.value.reduce((obj, item) => {
                obj[item.previousTableName] = item.currentTableName
                valueMap[item.previousTableName] = item
                return obj
              }, {})
            : {},
        )
        const countByName = computed(() => {
          return tableDataRef.value.reduce((map, previousTableName) => {
            const currentTableName = nameMap[previousTableName]

            if (currentTableName) {
              if (currentTableName in map) {
                map[currentTableName]++
              } else {
                map[currentTableName] = 1
              }
            }

            return map
          }, {})
        })
        const config = reactive({
          search: '',
          replaceBefore: form.values.replaceBefore, // 替换前
          replaceAfter: form.values.replaceAfter || '', // 替换后
          prefix: form.values.prefix || '', // 前缀
          suffix: form.values.suffix || '', // 后缀
          transferCase: form.values.transferCase || '', // toUpperCase ｜ toLowerCase
          transformLoading: store.state.dataflow.transformLoading,
        })

        const globalNameMap = computed(() => {
          if (ifTableNameConfigEmpty(config)) return {}

          return tableDataRef.value.reduce((map, n) => {
            const after = getTableRenameByConfig(n, config)

            if (n !== after) {
              map[n] = after
            }

            return map
          }, {})
        })

        let prevMap = {}
        const invalidOperations = ref([])
        const makeTable = () => {
          if (form.values.$inputs?.length && taskId && form.values.id) {
            loading.value = true
            taskApi
              .getNodeTableInfo({
                taskId,
                nodeId: form.values.id,
                page: 1,
                pageSize: 10000,
              })
              .then(({ items = [] }) => {
                prevMap = {}
                tableDataRef.value = items.map((item) => {
                  prevMap[item.previousTableName] = item.sourceObjectName
                  return item.previousTableName
                })

                invalidOperations.value = props.value.filter((op) => {
                  return !prevMap[op.previousTableName]
                })

                // 新创建的源节点按表达式选表，tableNames 为空
                // 导致表编辑校验时拿不到源表名无法正确的校验
                // 这里把拿到的表名设置到源节点上（跟TM沟通，当表达式选表时，TM不会读取只会写入tableNames，所以不会影响到）
                const parents = props.findParentNodes(form.values.id)
                if (
                  tableDataRef.value.length &&
                  parents &&
                  parents.length &&
                  !parents[0].tableNames?.length &&
                  parents[0].migrateTableSelectType === 'expression'
                ) {
                  parents[0].tableNames = tableDataRef.value.slice()
                }
              })
              .finally(() => {
                loading.value = false
              })
          } else {
            tableDataRef.value = []
          }
        }

        makeTable()

        // 源节点发生变化，任务保存后加载模型
        useAfterTaskSaved(formRef.value.values.$inputs, makeTable)

        const updateName = (val, name) => {
          if (val !== name) {
            nameMap[name] = val
          } else {
            delete nameMap[name]
          }
        }

        const filterNames = computed(() => {
          const txt = config.search.trim().toLowerCase()
          if (txt) {
            return tableDataRef.value.filter((n) =>
              n.toLowerCase().includes(txt),
            )
          }
          return tableDataRef.value
        })

        const doModify = () => {
          updateConfig()
        }

        const lazyModify = debounce(doModify, 1000)

        const doReset = () => {
          Object.assign(config, {
            search: '',
            replaceBefore: '',
            replaceAfter: '',
            prefix: '',
            suffix: '',
            transferCase: '',
          })
          updateConfig()
        }

        const resetNames = () => {
          doReset()
          const keys = Object.keys(nameMap)
          if (keys.length) {
            keys.forEach((key) => {
              delete nameMap[key]
            })
            emitChange()
          }
        }

        const emitChange = () => {
          const arr = []
          Object.entries(nameMap).forEach(
            ([previousTableName, currentTableName]) => {
              const originTableName =
                prevMap[previousTableName] ||
                valueMap[previousTableName]?.originTableName // 当表从源节点移除 originTableName 会为 undefined

              arr.push({
                originTableName,
                previousTableName,
                currentTableName,
              })
            },
          )
          emit('change', arr)
        }

        const updateConfig = () => {
          form.setValues({
            replaceBefore: config.replaceBefore, // 替换前
            replaceAfter: config.replaceAfter, // 替换后
            prefix: config.prefix, // 前缀
            suffix: config.suffix, // 后缀
            transferCase: config.transferCase, // toUpperCase ｜ toLowerCase
          })
        }

        const deleteInvalid = (name, index) => {
          delete nameMap[name]
          invalidOperations.value.splice(index, 1)
          emitChange()
        }

        const deleteAllInvalid = () => {
          invalidOperations.value.forEach(
            (item) => delete nameMap[item.previousTableName],
          )
          invalidOperations.value = []
          emitChange()
        }

        return {
          config,
          filterNames,
          updateName,
          resetNames,
          doModify,
          lazyModify,
          doReset,
          emitChange,
          nameMap,
          tableData: tableDataRef,
          loading,
          countByName,
          itemSize,
          globalNameMap,
          invalidOperations,
          deleteAllInvalid,
          deleteInvalid,
        }
      },

      render() {
        const label = (
          <div class="inline-flex align-center position-absolute w-100">
            <span class="mr-2">
              {i18n.t('packages_form_table_rename_rule_config')}
            </span>
            <ElButton
              disabled={this.disabled}
              onClick={this.resetNames}
              type="primary"
              text
              tag="a"
            >
              <VIcon class="mr-1">reset</VIcon>
              {i18n.t('public_button_reset')}
            </ElButton>
          </div>
        )
        return (
          <div class="table-rename">
            {!!this.invalidOperations.length && (
              <div class="p-2 rounded-lg" style="background: #e8f3ff;">
                <span class="flex align-center gap-1 mb-2">
                  <VIcon size={18} class="color-primary">
                    info
                  </VIcon>
                  <span class="fs-7">
                    {i18n.t('packages_form_table_rename_invalid_operation')}
                  </span>
                </span>

                <div class="bg-white rounded-lg px-3 py-2 lh-base">
                  <div class="flex align-center gap-2 fw-sub">
                    <div class="flex-1">
                      {i18n.t('packages_form_table_rename_index_yuanbiaoming')}
                    </div>
                    <div class="flex-1">
                      {i18n.t('packages_form_table_rename_index_xinbiaoming')}
                    </div>
                    <div>
                      <IconButton onClick={this.deleteAllInvalid}>
                        delete
                      </IconButton>
                    </div>
                  </div>
                  {this.invalidOperations.map((data, index) => {
                    return (
                      <div class="flex align-center gap-2" key={index}>
                        <span class="flex-1 ellipsis font-color-light">
                          {data.previousTableName}
                        </span>
                        <span class="flex-1 ellipsis">
                          {data.currentTableName}
                        </span>
                        <span>
                          <IconButton
                            onClick={() =>
                              this.deleteInvalid(data.previousTableName, index)
                            }
                          >
                            delete
                          </IconButton>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <FormItem.BaseItem label={label}>
              <div class="border border-form px-4 pb-2 rounded-xl">
                <div class="flex gap-4">
                  <FormItem.BaseItem
                    class="flex-1"
                    label={i18n.t('packages_form_table_rename_search_text')}
                  >
                    <ElInput
                      v-model={this.config.replaceBefore}
                      disabled={this.disabled}
                      clearable
                      onInput={this.lazyModify}
                    />
                  </FormItem.BaseItem>
                  <FormItem.BaseItem
                    class="flex-1"
                    label={i18n.t('packages_form_table_rename_replace_with')}
                  >
                    <ElInput
                      v-model={this.config.replaceAfter}
                      disabled={this.disabled}
                      clearable
                      onInput={this.lazyModify}
                    />
                  </FormItem.BaseItem>
                </div>

                <div class="flex gap-4">
                  <FormItem.BaseItem
                    label={i18n.t(
                      'packages_form_field_processor_index_daxiaoxie',
                    )}
                    class="flex-1"
                  >
                    <ElSelect
                      v-model={this.config.transferCase}
                      disabled={this.disabled}
                      onChange={this.doModify}
                    >
                      <ElOption
                        value=""
                        label={i18n.t(
                          'packages_form_field_processor_index_bubian',
                        )}
                      />
                      <ElOption
                        value="toUpperCase"
                        label={i18n.t(
                          'packages_form_field_processor_index_daxie',
                        )}
                      />
                      <ElOption
                        value="toLowerCase"
                        label={i18n.t(
                          'packages_form_field_processor_index_xiaoxie',
                        )}
                      />
                    </ElSelect>
                  </FormItem.BaseItem>
                  <FormItem.BaseItem
                    label={i18n.t(
                      'packages_form_field_processor_index_qianzhui',
                    )}
                    class="flex-1"
                  >
                    <ElInput
                      v-model={this.config.prefix}
                      disabled={this.disabled}
                      clearable
                      onInput={this.lazyModify}
                    />
                  </FormItem.BaseItem>
                  <FormItem.BaseItem
                    label={i18n.t(
                      'packages_form_field_processor_index_houzhui',
                    )}
                    class="flex-1"
                  >
                    <ElInput
                      v-model={this.config.suffix}
                      disabled={this.disabled}
                      clearable
                      onInput={this.lazyModify}
                    />
                  </FormItem.BaseItem>
                </div>
              </div>
            </FormItem.BaseItem>

            <div class="flex mt-4">
              <ElInput
                v-model={this.config.search}
                disabled={this.disabled}
                clearable
                placeholder={i18n.t(
                  'packages_form_table_rename_index_sousuobiaoming',
                )}
              >
                {{
                  prefix: () => (
                    <ElIcon>
                      <ElIconSearch />
                    </ElIcon>
                  ),
                }}
              </ElInput>
            </div>

            <div
              class="name-list flex flex-column border border-form rounded-xl overflow-hidden my-4"
              style={this.listStyle}
            >
              <div class="name-list-header flex flex-shrink-0">
                <div class="name-list-title px-4">
                  {i18n.t('packages_form_table_rename_index_yuanbiaoming')}
                </div>
                <div class="name-list-title pl-5 pr-4">
                  {i18n.t('packages_form_table_rename_index_xinbiaoming')}
                </div>
              </div>
              <div
                ref="nameListRef"
                class="name-list-content font-color-light overflow-auto"
              >
                {this.filterNames.length ? (
                  <List
                    disabled={this.disabled}
                    items={this.filterNames}
                    itemSize={this.itemSize}
                    buffer={50}
                    countByName={this.countByName}
                    nameMap={this.nameMap}
                    globalNameMap={this.globalNameMap}
                    tableData={this.tableData}
                    updateName={this.updateName}
                    emitChange={this.emitChange}
                  ></List>
                ) : (
                  <VEmpty></VEmpty>
                )}
              </div>
            </div>
          </div>
        )
      },
    }),
  ),
  mapReadPretty(TableRenamePreview),
)
