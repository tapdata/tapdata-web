import { debounce } from 'lodash'
import i18n from '@tap/i18n'
import { defineComponent, ref, reactive, nextTick, watch } from '@vue/composition-api'
import { metadataInstancesApi, taskApi } from '@tap/api'
import { FormItem } from '@tap/form'
import { useForm } from '@tap/form'
import './style.scss'
import { VIcon, EmptyItem, OverflowTooltip } from '@tap/component'

export const FieldRenameProcessor = defineComponent({
  props: ['value', 'nodeId', 'disabled'],
  setup(props, { emit, refs, root }) {
    const formRef = useForm()
    const form = formRef.value
    const list = ref([])
    const tableList = ref([])

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
      operationVisible: false,
      newFieldName: '',
      operation: {
        prefix: '',
        suffix: '',
        capitalized: ''
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
    let fieldsMapping = props.value || []
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
          operation: config.operation,
          fields: []
        }
      }
      let fields = mappingField(map[qualifiedName]?.fields) || {}
      if (target === 'rest' && fields[row.sourceFieldName]?.sourceFieldName === row.sourceFieldName) {
        delete fields[row.sourceFieldName]
      } else {
        //先生成所有fields
        val = val?.trim()
        if (target === 'rename' && val === '') {
          val = row.sourceFieldName //字段名不能为空
        }
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
      form.fieldsMapping = fieldsMapping
      emit('change', fieldsMapping)
    }
    //选择左侧table
    const doCheckAllChange = val => {
      config.checkAll = val
      if (val) {
        config.checkedTables = list.value
        nextTick(() => {
          tableList.value.forEach(row => {
            refs.table?.toggleAllSelection(row, true)
          })
        })
      } else {
        config.checkedTables = []
        nextTick(() => {
          refs.table?.clearSelection()
        })
      }
    }
    const doCheckedTablesChange = value => {
      let checkedCount = value.length
      config.checkAll = checkedCount === list.value.length
      //当前table是否被选中
      if (checkedCount > 0) {
        let index = value.findIndex(t => t.sourceQualifiedName === config.selectTableRow.sourceQualifiedName)
        if (index > -1) {
          //联调右侧表格全选
          nextTick(() => {
            tableList.value.forEach(row => {
              refs.table?.toggleRowSelection(row, true)
            })
          })
        }
        if (index === -1) {
          //否则全不选
          nextTick(() => {
            refs.table?.clearSelection()
          })
        }
      } else if (checkedCount === 0) {
        //否则全不选
        nextTick(() => {
          refs.table?.clearSelection()
        })
      }
    }
    //选择右侧字段
    const doSelectionField = value => {
      config.checkedFields = value
    }
    const doVisible = (target, val) => {
      config[target] = val
    }
    const updateView = index => {
      config.position = index
      config.selectTableRow = list.value[index]
      config.target = config.selectTableRow?.fieldsMapping || []
      tableList.value = config.target
      config.fieldCount = config.selectTableRow?.sourceFieldCount - config.selectTableRow?.userDeletedNum || 0
      //是否选中右侧表
      doCheckedTablesChange(config.checkedTables)
    }
    //单个修改字段名
    const updateName = (row, name) => {
      //修改名字 生成配置
      updateFieldViews(row?.sourceFieldName, name)
      doUpdateField(row, 'rename', name)
    }
    //批量操作
    const doOperationSave = () => {
      let map = mapping(fieldsMapping)
      if (config.checkedTables?.length > 0) {
        //表级别
        config.checkedTables.forEach(t => {
          map[t?.sourceQualifiedName] = {
            qualifiedName: t?.sourceQualifiedName,
            originTableName: t?.sourceObjectName,
            previousTableName: t?.sinkObjectName,
            operation: config.operation,
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
            newField = newField[config.operation.capitalized]()
          }
          updateFieldViews(t?.sourceFieldName, newField)
          doUpdateField(t, 'rename', newField)
        })
      }
      nextTick(() => {
        refs.table?.clearSelection()
        config.checkedTables = []
        config.checkAll = false
        config.operation = restOp
      })
      doVisible('visible', false)
    }
    //重置
    const doOperationRest = () => {
      let where = {
        taskId: root.$route.params.id,
        nodeId: props.nodeId
      }
      fieldsMapping = []
      emit('change', [])
      metadataInstancesApi.resetTable(where).then(() => {
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
          <input
            readOnly={props.disabled}
            class="rename-table-item-input px-2"
            value={row.targetFieldName}
            onChange={event => {
              const val = event.target.value
              if (val) {
                row.targetFieldName = val
                updateName(row, event.target.value)
              } else {
                event.target.value = row.targetFieldName
              }
            }}
          />
        </div>
      ) : (
        <div class="cursor-pointer">
          <span class="col-new-field-name inline-block ellipsis align-middle  mr-4 ">{row.targetFieldName}</span>
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
    return {
      list,
      tableList,
      config,
      loadData,
      doVisible,
      doOperationSave,
      doCheckAllChange,
      doCheckedTablesChange,
      doSelectionField,
      tableRowClassName,
      renderNode,
      renderSourceNode,
      renderOpNode,
      updateView,
      doOperationRest,
      doSearchField,
      doSearchTables
    }
  },
  render() {
    return (
      <div class="processor-field-mapping flex flex-column" v-loading={this.config.transformLoading}>
        <div class="task-form-body" style={this.listStyle}>
          <div class="task-form-left flex flex-column">
            <div class="flex mb-2 ml-2 mr-2">
              <div class="flex">
                <ElInput
                  size="mini"
                  placeholder={i18n.t('packages_form_field_mapping_list_qingshurubiaoming')}
                  suffix-icon="el-icon-search"
                  clearable
                  v-model={this.config.searchTable}
                  onInput={this.doSearchTables}
                ></ElInput>
              </div>
            </div>
            <div class="bg-main flex justify-content-between line-height processor-ml-10">
              <span>
                <el-checkbox v-model={this.config.checkAll} onChange={this.doCheckAllChange}></el-checkbox>
                <span class="table-name ml-2">{i18n.t('packages_form_field_mapping_list_biaoming')}</span>
              </span>
            </div>
            <div class="task-form-left__ul flex flex-column" v-loading={this.config.loadingNav}>
              {this.list.length > 0 ? (
                <ul>
                  <el-checkbox-group v-model={this.config.checkedTables} onChange={this.doCheckedTablesChange}>
                    {this.list.map((item, index) => (
                      <li
                        key={index}
                        class={[this.config.position === index ? 'active' : '']}
                        onClick={() => this.updateView(index)}
                      >
                        <el-checkbox nativeOnClick={event => event.stopPropagation()} label={item}>
                          <br />
                        </el-checkbox>
                        <div class="task-form-text-box">
                          <OverflowTooltip
                            class="w-100 text-truncate target"
                            text={item.sinkObjectName}
                            placement="right"
                            open-delay={400}
                          />
                          <div class="select" onClick={() => this.updateView(index)}>
                            <span>
                              <span>{i18n.t('packages_form_dag_dialog_field_mapping_selected')}</span>
                              {item.sourceFieldCount - item.userDeletedNum} /{item.sourceFieldCount}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </el-checkbox-group>
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
                  this.config.page.current = page
                  this.loadData()
                }
              }}
              current-page={this.config.page.current}
              total={this.config.page.total}
              pager-count={5}
            >
              <div class="text-center">
                <span class="page__current" style="min-width: 22px">
                  {this.config.page.current}
                </span>
                <span class="icon-color" style="min-width: 22px">
                  /
                </span>
                <span class="icon-color" style="min-width: 22px">
                  {this.config.page.count}
                </span>
              </div>
            </ElPagination>
          </div>
          <div class="main">
            <div class="flex ml-2 text-start justify-content-between" style="margin-bottom: 8px">
              <div class="flex">
                <ElInput
                  size="mini"
                  placeholder={i18n.t('packages_form_field_mapping_list_qingshuruziduan')}
                  suffix-icon="el-icon-search"
                  clearable
                  v-model={this.config.searchField}
                  onInput={this.doSearchField}
                ></ElInput>
              </div>
              <div class="item ml-2">
                <ElButton
                  type="text"
                  class="btn-operation"
                  disabled={
                    (this.config.checkedTables.length === 0 && this.config.checkedFields.length === 0) || this.disabled
                  }
                  onClick={() => this.doVisible('visible', true)}
                >
                  {i18n.t('public_button_bulk_operation')}
                </ElButton>
                <ElButton type="text" class="btn-rest mr-2" disabled={this.disabled} onClick={this.doOperationRest}>
                  {i18n.t('public_button_reset')}
                </ElButton>
              </div>
            </div>
            <ElTable
              class="field-mapping-table"
              height="100%"
              ref={'table'}
              data={this.tableList}
              v-loading={this.config.loadingTable}
              row-class-name={this.tableRowClassName}
              onSelection-change={this.doSelectionField}
            >
              <ElTableColumn type="selection" width="55"></ElTableColumn>
              <ElTableColumn
                type="index"
                width="55"
                label={i18n.t('packages_form_field_mapping_list_xuhao')}
              ></ElTableColumn>
              <ElTableColumn
                show-overflow-tooltip
                label={i18n.t('packages_form_dag_dialog_field_mapping_field')}
                prop="sourceFieldName"
                scopedSlots={{
                  default: this.renderSourceNode
                }}
              ></ElTableColumn>
              <ElTableColumn
                show-overflow-tooltip
                label={i18n.t('packages_form_field_processor_index_xinziduanming')}
                prop="targetFieldName"
                scopedSlots={{
                  default: this.renderNode
                }}
              ></ElTableColumn>
              <ElTableColumn
                show-overflow-tooltip
                label={i18n.t('public_operation')}
                prop="isShow"
                width={'60px'}
                scopedSlots={{
                  default: this.renderOpNode
                }}
              ></ElTableColumn>
              <div class="field-mapping-table__empty" slot="empty">
                <EmptyItem></EmptyItem>
              </div>
            </ElTable>
          </div>
        </div>
        <ElDialog
          title={i18n.t('packages_form_ddl_event_checkbox_index_xiugaiziduanming')}
          width={'30%'}
          visible={this.config.operationVisible}
          append-to-body
          before-close={() => this.doVisible('operationVisible', false)}
        >
          <FormItem.BaseItem>
            <ElInput v-model={this.config.newFieldName} clearable />
          </FormItem.BaseItem>
          <span slot="footer" className="dialog-footer">
            <el-button onClick={() => this.doVisible('operationVisible', false)}>
              {i18n.t('packages_form_field_mapping_dialog_quxiao')}
            </el-button>
            <el-button type="primary" onClick={() => this.doEditNameSave()}>
              {i18n.t('packages_form_field_mapping_dialog_queding')}
            </el-button>
          </span>
        </ElDialog>
        <ElDialog
          title={i18n.t('public_button_bulk_operation')}
          visible={this.config.visible}
          append-to-body
          before-close={() => this.doVisible('visible', false)}
        >
          <div>
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_qianzhui')}>
              <ElInput v-model={this.config.operation.prefix} clearable />
            </FormItem.BaseItem>
            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_houzhui')}>
              <ElInput v-model={this.config.operation.suffix} clearable />
            </FormItem.BaseItem>

            <FormItem.BaseItem label={i18n.t('packages_form_field_processor_index_daxiaoxie')}>
              <ElSelect v-model={this.config.operation.capitalized}>
                <ElOption value="" label={i18n.t('packages_form_field_processor_index_bubian')} />
                <ElOption value="toUpperCase" label={i18n.t('packages_form_field_processor_index_daxie')} />
                <ElOption value="toLowerCase" label={i18n.t('packages_form_field_processor_index_xiaoxie')} />
              </ElSelect>
            </FormItem.BaseItem>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button onClick={() => this.doVisible('visible', false)}>
              {i18n.t('packages_form_field_mapping_dialog_quxiao')}
            </el-button>
            <el-button type="primary" onClick={() => this.doOperationSave()}>
              {i18n.t('packages_form_field_mapping_dialog_queding')}
            </el-button>
          </span>
        </ElDialog>
      </div>
    )
  }
})
