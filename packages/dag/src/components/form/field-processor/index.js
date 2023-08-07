import { debounce, cloneDeep } from 'lodash'
import { defineComponent, ref, reactive, onMounted, watch, computed } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'
import i18n from '@tap/i18n'
import { metadataInstancesApi, taskApi } from '@tap/api'
import { FormItem, useForm } from '@tap/form'
import { VIcon, EmptyItem, OverflowTooltip, VirtualList } from '@tap/component'
import { toUpperCase, toLowerCase, camelToSnake, snakeToCamel } from '@tap/shared'
import './style.scss'

const InnerInput = {
  name: 'InnerInput',
  props: ['value', 'readOnly'],
  data() {
    return {
      val: null
    }
  },
  watch: {
    value(val) {
      this.val = val
    }
  },
  created() {
    this.val = this.value
  },
  render() {
    return <input class="px-1" readOnly={this.readOnly} value={this.val} onChange={ev => this.$emit('change', ev)} />
  }
}

// onChange 懒触发前后缀的变化， 备选方案
const FormInput = defineComponent({
  props: ['value', 'disabled'],
  setup(props, { emit }) {
    const input = ref('')

    watch(
      () => props.value,
      val => {
        input.value = val
      }
    )

    onMounted(() => {
      input.value = props.value
    })

    return () => (
      <ElInput
        value={input.value}
        onInput={val => {
          input.value = val
        }}
        disabled={props.disabled}
        clearable
        onChange={val => {
          emit('change', val)
        }}
      />
    )
  }
})

export const FieldRenameProcessor = observer(
  defineComponent({
    props: ['value', 'nodeId', 'disabled'],
    setup(props, { emit, refs, root }) {
      const formRef = useForm()
      const form = formRef.value
      const list = ref([])
      const tableList = ref([])
      const defaultOperation = {
        prefix: '',
        suffix: '',
        capitalized: ''
      }
      let fieldsOperation = form.values.fieldsOperation || { ...defaultOperation }

      const config = reactive({
        visible: false,
        loadingNav: true,
        loadingTable: true,
        selectTableRow: '',
        currentFieldRow: '',
        fieldCount: '',
        checkAll: false,
        checkedTables: [],
        checkedFields: [],
        position: 0,
        dataFlow: '',
        searchTable: '',
        searchField: '',
        operation: {
          ...fieldsOperation
        },
        page: {
          size: 10,
          current: 1,
          total: 0,
          count: 1
        },
        transformLoading: root.$store.state.dataflow.transformLoading
      })
      const updateDeletedNum = item => {
        item.userDeletedNum = item.fieldsMapping.filter(field => !field.isShow).length
        return item
      }

      const resetParams = () => {
        config.searchTable = ''
        config.page.current = 1
      }
      //数据初始化
      const loadData = silence => {
        config.loadingNav = !silence
        config.loadingTable = !silence

        const where = {
          taskId: root.$route.params.id,
          taskRecordId: root.$route.query?.taskRecordId,
          nodeId: props.nodeId,
          searchTable: config.searchTable,
          page: config.page.current,
          pageSize: config.page.size
        }

        taskApi
          .getNodeTableInfo(where)
          .then(res => {
            let { total, items = [] } = res
            list.value = items.map(updateDeletedNum)
            config.page.total = total
            config.page.count = Math.ceil(total / 10) === 0 ? 1 : Math.ceil(total / 10)
            updateView(config.position)
          })
          .finally(() => {
            config.loadingNav = false
            config.loadingTable = false
          })
      }
      //搜索
      const doSearchTables = debounce(function () {
        config.page.current = 1
        loadData()
      }, 200)

      const doSearchField = () => {
        if (config.searchField.trim()) {
          config.searchField = config.searchField.trim().toString() //去空格
          tableList.value = config.target.filter(v => {
            let str = (v.sourceFieldName + '' + v.targetFieldName).toLowerCase()
            return str.indexOf(config.searchField.toLowerCase()) > -1
          })
        } else {
          tableList.value = config.target
        }
      }

      const columns = [
        {
          type: 'selection'
        },
        {
          label: i18n.t('public_serial_number'),
          type: 'index',
          align: 'center'
        },
        {
          label: i18n.t('packages_form_dag_dialog_field_mapping_field'),
          showOverflowTooltip: true,
          prop: 'sourceFieldName',
          slot: 'sourceFieldName',
          width: 140
        },
        {
          label: i18n.t('packages_form_field_processor_index_xinziduanming'),
          showOverflowTooltip: true,
          prop: 'targetFieldName',
          slot: 'targetFieldName',
          class: 'p-0 pt-1',
          width: 140
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          // width: 60,
          slot: 'operation'
        }
      ]

      const filterFieldList = computed(() => {
        const search = config.searchField.trim().toLowerCase()
        if (search) {
          return tableList.value.filter(v => {
            let str = (v.sourceFieldName + '' + v.targetFieldName).toLowerCase()
            return str.includes(search)
          })
        } else {
          return tableList.value
        }
      })

      let fieldsMapping = form.values.fieldsMapping
      const restOp = {
        prefix: '',
        suffix: '',
        capitalized: ''
      }
      //转成mapping table级别
      const mapping = data => {
        let map = {}
        if (!data || data?.length === 0) return map
        data.forEach(t => {
          if (!map[t.qualifiedName]) {
            map[t.qualifiedName] = {
              qualifiedName: t?.qualifiedName,
              previousTableName: t?.previousTableName,
              originTableName: t?.originTableName,
              operation: t?.operation,
              fields: t.fields || []
            }
          }
        })
        return map
      }
      //转成mapping Field级别
      const mappingField = data => {
        let map = {}
        if (!data || data?.length === 0) return map
        data.forEach(t => {
          if (!map[t.sourceFieldName]) {
            map[t.sourceFieldName] = {
              sourceFieldName: t?.sourceFieldName,
              targetFieldName: t?.targetFieldName,
              isShow: t.isShow
            }
          }
        })
        return map
      }
      //map -> array
      const toList = map => {
        let list = []
        for (let key in map) {
          if (key && key !== 'undefined') {
            list.push(map[key])
          }
        }
        return list
      }
      //更新字段名 生成配置
      const doUpdateField = (row, target, val) => {
        let map = mapping(fieldsMapping) || {}
        let qualifiedName = config.selectTableRow?.sourceQualifiedName
        let sourceObjectName = config.selectTableRow?.sourceObjectName
        let targetObjectName = config.selectTableRow?.sinkObjectName
        if (!map[qualifiedName]) {
          map[qualifiedName] = {
            qualifiedName: qualifiedName,
            previousTableName: targetObjectName,
            originTableName: sourceObjectName,
            operation: {
              prefix: '',
              suffix: '',
              capitalized: ''
            },
            fields: []
          }
        }
        let fields = mappingField(map[qualifiedName]?.fields) || {}
        if (target === 'rest' && fields[row.sourceFieldName]?.sourceFieldName === row.sourceFieldName) {
          delete fields[row.sourceFieldName]
        } else {
          //先生成所有fields
          fields[row.sourceFieldName] = {
            sourceFieldName: row.sourceFieldName,
            targetFieldName: target === 'rename' ? val : row.targetFieldName,
            isShow: target === 'del' ? val : row.isShow,
            migrateType: 'custom'
          }
        }

        map[qualifiedName].fields = toList(fields)
        fieldsMapping = toList(map)
        // eslint-disable-next-line
        form.values.fieldsMapping = fieldsMapping
        // emit('change', fieldsMapping)
      }

      //选择右侧字段
      const doSelectionField = value => {
        config.checkedFields = value
      }

      // 清空选中字段
      const doClearSelection = () => {
        config.checkedFields = []
      }

      const updateView = index => {
        refs.table?.clearSelection()
        config.position = index
        config.selectTableRow = list.value[index]
        config.target = config.selectTableRow?.fieldsMapping || []
        tableList.value = config.target
        config.fieldCount = config.selectTableRow?.sourceFieldCount - config.selectTableRow?.userDeletedNum || 0
      }

      //单个修改字段名
      const updateName = (row, name) => {
        //修改名字 生成配置
        updateFieldViews(row?.sourceFieldName, name)
        doUpdateField(row, 'rename', name)
      }

      //批量操作
      const doOperationSave = () => {
        /*let map = mapping(fieldsMapping)
      if (config.checkedTables?.length > 0) {
        //表级别
        config.checkedTables.forEach(t => {
          map[t?.sourceQualifiedName] = {
            qualifiedName: t?.sourceQualifiedName,
            originTableName: t?.sourceObjectName,
            previousTableName: t?.sinkObjectName,
            operation: cloneDeep(config.operation),
            fields: []
          }
        })
        fieldsMapping = toList(map)
        emit('change', fieldsMapping)
        setTimeout(() => {
          loadData(true)
        }, 2000)
      }
      if (config.checkedFields?.length > 0) {
        //字段级别
        config.checkedFields.forEach(t => {
          let newField = config.operation.prefix + t?.sourceFieldName + config.operation.suffix
          if (config.operation.capitalized) {
            const map = {
              toUpperCase,
              toLowerCase,
              toSnakeCase: camelToSnake,
              toCamelCase: snakeToCamel
            }
            newField = map[config.operation.capitalized](newField)
          }
          updateFieldViews(t?.sourceFieldName, newField)
          doUpdateField(t, 'rename', newField)
        })
      }
      nextTick(() => {
        refs.table?.clearSelection()
        config.checkedTables = []
        config.checkAll = false
        Object.assign(config.operation, restOp)
      })
      doVisible('visible', false)*/
      }

      //重置
      const doOperationRest = () => {
        fieldsMapping = []
        Object.assign(fieldsOperation, defaultOperation)
        metadataInstancesApi
          .resetTable({
            taskId: root.$route.params.id,
            nodeId: props.nodeId
          })
          .then(() => {
            resetParams()
            loadData() //更新整个数据
          })
      }

      //单个删除字段
      const doShowRow = row => {
        for (let i = 0; i < tableList.value.length; i++) {
          if (tableList.value[i].sourceFieldName === row.sourceFieldName) {
            tableList.value[i]['isShow'] = true
          }
        }
        updateDeletedNum(config.selectTableRow)
        doUpdateField(row, 'del', true)
      }

      const doDeleteRow = row => {
        for (let i = 0; i < tableList.value.length; i++) {
          if (tableList.value[i].sourceFieldName === row.sourceFieldName) {
            tableList.value[i]['isShow'] = false
          }
        }
        doUpdateField(row, 'del', false)
        updateDeletedNum(config.selectTableRow)
      }

      const tableRowClassName = ({ row }) => {
        if (!row.isShow) {
          return 'row-deleted'
        }
      }

      //前端读取配置及时反馈
      const updateFieldViews = (key, value) => {
        for (let i = 0; i < tableList.value.length; i++) {
          if (tableList.value[i].sourceFieldName === key) {
            tableList.value[i]['targetFieldName'] = value
          }
        }
      }
      //右侧表格slot渲染
      const renderSourceNode = ({ row }) => {
        let show = row?.primary_key_position ? (
          <span>
            {row.sourceFieldName}
            <VIcon size="12" class="color-darkorange">
              key
            </VIcon>
          </span>
        ) : (
          <span>{row.sourceFieldName}</span>
        )
        return show
      }
      const renderNode = ({ row }) => {
        return row.isShow && !props.disabled ? (
          <div
            class={[
              'cursor-pointer',
              {
                'color-primary': row.sourceFieldName !== row.targetFieldName
              }
            ]}
          >
            <InnerInput
              readOnly={props.disabled}
              class="rename-table-item-input px-1"
              value={row.targetFieldName}
              onChange={event => {
                const val = event.target.value?.trim()
                if (val) {
                  row.targetFieldName = val
                  updateName(row, val)
                } else {
                  event.target.value = row.targetFieldName
                }
              }}
            ></InnerInput>
          </div>
        ) : (
          <div class="cursor-pointer pt-1 pl-1">
            <span class="col-new-field-name inline-block ellipsis align-middle">{row.targetFieldName}</span>
          </div>
        )
      }
      const renderOpNode = ({ row }) => {
        let show = row.isShow ? (
          <span class="text-primary cursor-pointer" onClick={() => doDeleteRow(row)}>
            {i18n.t('packages_form_field_processor_index_pingbi')}
          </span>
        ) : (
          <span class="text-primary cursor-pointer" onClick={() => doShowRow(row)}>
            {i18n.t('packages_form_field_processor_index_huifu')}
          </span>
        )
        let disabled = row.isShow ? (
          <span>{i18n.t('packages_form_field_processor_index_pingbi')}</span>
        ) : (
          <span>{i18n.t('packages_form_field_processor_index_huifu')}</span>
        )
        return props.disabled ? disabled : show
      }

      const showBatchRemove = computed(() => {
        return config.checkedFields.some(field => !!field.isShow)
      })

      const updateFieldsShow = isShow => {
        let qualifiedName = config.selectTableRow?.sourceQualifiedName
        let table = fieldsMapping.find(map => map.qualifiedName === qualifiedName)
        let originTableName = config.selectTableRow?.sourceObjectName
        let previousTableName = config.selectTableRow?.sinkObjectName

        if (!table) {
          table = {
            qualifiedName,
            previousTableName,
            originTableName,
            operation: {
              prefix: '',
              suffix: '',
              capitalized: ''
            },
            fields: []
          }
          fieldsMapping.push(table)
        }

        let fieldMap = mappingField(table.fields) || {}
        config.checkedFields.forEach(field => {
          field.isShow = isShow
          fieldMap[field.sourceFieldName] = {
            sourceFieldName: field.sourceFieldName,
            targetFieldName: field.targetFieldName,
            isShow,
            migrateType: 'custom'
          }
        })

        table.fields = toList(fieldMap)
        form.fieldsMapping = fieldsMapping
        emit('change', fieldsMapping)
        updateDeletedNum(config.selectTableRow)
      }

      const batchRemove = () => {
        updateFieldsShow(false)
      }

      const batchShow = () => {
        updateFieldsShow(true)
      }

      watch(
        () => root.$store.state.dataflow.transformLoading,
        v => {
          config.transformLoading = root.$store.state.dataflow.transformLoading
          if (!v) {
            loadData()
          }
        }
      )

      loadData()

      return () => {
        const label = (
          <div class="inline-flex align-center position-absolute w-100">
            <span class="mr-2 flex-1">{i18n.t('packages_form_table_rename_rule_config')}</span>
            <ElLink disabled={props.disabled} onClick={doOperationRest} size="mini" type="primary">
              <div class="flex align-center px-1">
                <VIcon class="mr-1">reset</VIcon>
                {i18n.t('public_button_reset')}
              </div>
            </ElLink>
          </div>
        )

        return (
          <div class="processor-field-mapping flex flex-column" v-loading={config.transformLoading}>
            <FormItem.BaseItem class="mb-4" label={label}>
              <div class="border border-form px-4 pb-2 rounded-4">
                <div class="flex gap-4">
                  <FormItem.BaseItem label={i18n.t('packages_form_field_processor_filed_name_daxiaoxie')}>
                    <ElSelect
                      value={fieldsOperation.capitalized}
                      disabled={props.disabled}
                      onChange={val => {
                        console.log('fieldsOperation.capitalized', fieldsOperation.capitalized) // eslint-disable-line
                        fieldsOperation.capitalized = val
                        doModify()
                      }}
                      class="w-auto"
                    >
                      <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                      <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                      <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
                      <ElOption
                        value="toCamelCase"
                        label={i18n.t('packages_form_field_processor_index_snake_to_camel')}
                      />
                      <ElOption
                        value="toSnakeCase"
                        label={i18n.t('packages_form_field_processor_index_camel_to_snake')}
                      />
                    </ElSelect>
                  </FormItem.BaseItem>
                  <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_qianzhui')}>
                    {/*<FormInput
                      value={fieldsOperation.prefix}
                      disabled={props.disabled}
                      onChange={val => {
                        fieldsOperation.prefix = val
                        doModify()
                      }}
                    ></FormInput>*/}
                    <ElInput
                      value={fieldsOperation.prefix}
                      disabled={props.disabled}
                      clearable
                      onInput={val => {
                        fieldsOperation.prefix = val
                        doModify()
                      }}
                    />
                  </FormItem.BaseItem>
                  <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
                    <ElInput
                      value={fieldsOperation.suffix}
                      disabled={props.disabled}
                      clearable
                      onInput={val => {
                        fieldsOperation.suffix = val
                        doModify()
                      }}
                    />
                  </FormItem.BaseItem>
                </div>
              </div>
            </FormItem.BaseItem>

            <div class="task-form-body rounded-4">
              <div class="task-form-left pt-0 border-0 flex flex-column">
                <div class="flex p-2">
                  <ElInput
                    size="mini"
                    placeholder={i18n.t('packages_form_field_mapping_list_qingshurubiaoming')}
                    prefix-icon="el-icon-search"
                    clearable
                    value={config.searchTable}
                    onInput={val => {
                      config.searchTable = val
                      doSearchTables()
                    }}
                  ></ElInput>
                </div>
                <div class="bg-main flex justify-content-between line-height processor-ml-10 table-checkbox-wrap">
                  <span>
                    <span class="table-name ml-2">{i18n.t('packages_form_field_mapping_list_biaoming')}</span>
                  </span>
                </div>
                <div class="task-form-left__ul flex flex-column" v-loading={config.loadingNav}>
                  {list.value.length > 0 ? (
                    <ul>
                      {list.value.map((item, index) => (
                        <li
                          key={index}
                          class={[config.position === index ? 'active' : '']}
                          onClick={() => updateView(index)}
                        >
                          <div class="task-form-text-box">
                            <OverflowTooltip
                              class="w-100 text-truncate target"
                              text={item.sinkObjectName}
                              placement="right"
                              open-delay={400}
                            />
                            <div class="select" onClick={() => updateView(index)}>
                              <span>
                                <span>{i18n.t('packages_form_dag_dialog_field_mapping_selected')}</span>
                                {item.sourceFieldCount - item.userDeletedNum} /{item.sourceFieldCount}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div class="task-form-left__ul flex flex-column align-items-center">
                      <EmptyItem></EmptyItem>
                    </div>
                  )}
                </div>
                <ElPagination
                  small
                  class="flex mt-3 din-font"
                  layout="total, prev, slot, next"
                  on={{
                    'current-change': page => {
                      config.page.current = page
                      loadData()
                    }
                  }}
                  current-page={config.page.current}
                  total={config.page.total}
                  pager-count={5}
                >
                  <div class="text-center">
                    <span class="page__current" style="min-width: 22px">
                      {config.page.current}
                    </span>
                    <span class="icon-color" style="min-width: 22px">
                      /
                    </span>
                    <span class="icon-color" style="min-width: 22px">
                      {config.page.count}
                    </span>
                  </div>
                </ElPagination>
              </div>
              <div class="main pt-0">
                <div class="flex p-2 justify-content-between fields-toolbar">
                  <div class="flex field-search-input-wrap">
                    <ElInput
                      size="mini"
                      placeholder={i18n.t('packages_form_field_mapping_list_qingshuruziduan')}
                      prefix-icon="el-icon-search"
                      clearable
                      value={config.searchField}
                      onInput={val => {
                        config.searchField = val
                        doSearchField()
                      }}
                    ></ElInput>
                  </div>
                  <div class="item px-2">
                    <ElButton
                      key="batchRemove"
                      type="text"
                      class="btn-operation"
                      onClick={batchRemove}
                      disabled={
                        (config.checkedTables.length === 0 && config.checkedFields.length === 0) || props.disabled
                      }
                    >
                      {i18n.t('packages_form_field_processor_index_pingbi')}
                    </ElButton>
                    <ElButton
                      key="batchShow"
                      type="text"
                      class="btn-operation"
                      onClick={batchShow}
                      disabled={
                        (config.checkedTables.length === 0 && config.checkedFields.length === 0) || props.disabled
                      }
                    >
                      {i18n.t('packages_form_field_processor_index_huifu')}
                    </ElButton>
                  </div>
                </div>
                <VirtualList
                  ref="table"
                  data={filterFieldList.value}
                  columns={columns}
                  item-key="sourceFieldName"
                  scopedSlots={{
                    sourceFieldName: renderSourceNode,
                    targetFieldName: renderNode,
                    operation: renderOpNode
                  }}
                  row-class-name={tableRowClassName}
                  on-selection-change={doSelectionField}
                  on-clear-selection={doClearSelection}
                  border
                  class="flex-fill h-0"
                ></VirtualList>
              </div>
            </div>

            {/*<ElDialog
            title={i18n.t('public_button_bulk_operation')}
            visible={config.visible}
            append-to-body
            before-close={() => doVisible('visible', false)}
          >
            <div>
              <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_qianzhui')}>
                <ElInput v-model={config.operation.prefix} clearable />
              </FormItem.BaseItem>
              <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
                <ElInput v-model={config.operation.suffix} clearable />
              </FormItem.BaseItem>

              <FormItem.BaseItem label={i18n.t('packages_form_field_processor_filed_name_daxiaoxie')}>
                <ElSelect v-model={config.operation.capitalized}>
                  <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                  <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                  <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
                  <ElOption value="toCamelCase" label={i18n.t('packages_form_field_processor_index_snake_to_camel')} />
                  <ElOption value="toSnakeCase" label={i18n.t('packages_form_field_processor_index_camel_to_snake')} />
                </ElSelect>
              </FormItem.BaseItem>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button onClick={() => doVisible('visible', false)}>
                {i18n.t('packages_form_field_mapping_dialog_quxiao')}
              </el-button>
              <el-button type="primary" onClick={() => doOperationSave()}>
                {i18n.t('packages_form_field_mapping_dialog_queding')}
              </el-button>
            </span>
          </ElDialog>*/}
          </div>
        )
      }
    }
  })
)
