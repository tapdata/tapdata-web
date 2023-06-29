import { get, set, merge } from 'lodash'
import { defineComponent, ref, computed } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { useForm } from '@tap/form'
import { VTable, IconButton } from '@tap/component'
import { metadataInstancesApi } from '@tap/api'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import { getMatchedDataTypeLevel, errorFiledType } from '../../../util'
import FieldList from '../field-inference/List'
import './style.scss'
import DataTypeDialog from './DataTypeDialog'

// public static final byte TYPE_DATETIME = 1;
// public static final byte TYPE_ARRAY = 2;
// public static final byte TYPE_BOOLEAN = 3;
// public static final byte TYPE_MAP = 4;
// public static final byte TYPE_YEAR = 5;
// public static final byte TYPE_TIME = 6;
// public static final byte TYPE_RAW = 7;
// public static final byte TYPE_NUMBER = 8;
// public static final byte TYPE_BINARY = 9;
// public static final byte TYPE_STRING = 10;
// public static final byte TYPE_DATE = 11;

export const SchemaPreview = defineComponent({
  props: ['ignoreError', 'disabled'],
  setup(props, { root, refs }) {
    const formRef = useForm()
    const form = formRef.value
    const treeData = ref([])
    const loading = ref(false)
    const isTreeView = ref(true)
    const columns = [
      {
        label: i18n.t('packages_form_field_mapping_list_xuhao'),
        type: 'index',
        prop: 'index',
        minWidth: '40px'
      },
      {
        label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
        prop: 'field_name',
        slotName: 'field_name',
        'min-width': '90px',
        'show-overflow-tooltip': true
      },
      {
        label: i18n.t('packages_form_dag_dialog_field_mapping_type'),
        prop: 'data_type',
        slotName: 'data_type',
        'min-width': '126px'
      },
      {
        label: i18n.t('packages_form_field_inference_list_feikong'),
        prop: 'is_nullable',
        slotName: 'is_nullable',
        width: '60px'
      },
      {
        label: i18n.t('packages_form_field_inference_list_ziduanzhushi'),
        prop: 'comment'
      },
      {
        label: i18n.t('public_operation'),
        prop: 'operation',
        slotName: 'operation',
        headerSlot: 'operationHeader',
        width: '60px'
      }
    ]
    const nullableMap = {
      true: i18n.t('packages_dag_meta_table_true'),
      false: i18n.t('packages_dag_meta_table_false')
    }
    const isTarget = form.values.type === 'table' && !!form.values.$inputs.length
    const isSource = form.values.type === 'table' && !form.values.$inputs.length
    const readonly = ref(props.disabled || !isTarget)
    let fieldChangeRules = form.values.fieldChangeRules || []
    let columnsMap = {}
    const createTree = data => {
      const root = { children: [] }

      for (const item of data) {
        const { field_name } = item
        let parent = root
        const fields = field_name.split('.')
        item.dataType = item.data_type.replace(/\(.+\)/, '')
        item.indicesUnique = !!columnsMap[field_name]

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find(c => c.field_name === field)

          if (!child) {
            child = { field_name: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              field_name: field
            })
          }
        }
      }

      return root.children
    }

    const schemaData = ref({})
    const loadSchema = async () => {
      loading.value = true
      const params = {
        nodeId: form.values.id,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        // items: [{ fields = [], indices = [] } = {}]
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)
      const { fields = [], indices = [] } = schema

      schemaData.value = mapSchema(schema)
      columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})
      treeData.value = createTree(fields)
      loading.value = false
    }

    const mapSchema = schema => {
      const { fields = [], findPossibleDataTypes = {} } = schema
      //如果findPossibleDataTypes = {}，不做类型校验
      if (isTarget) {
        fields.forEach(el => {
          el.canUseDataTypes = []
          el.matchedDataTypeLevel = getMatchedDataTypeLevel(
            el,
            el.canUseDataTypes,
            fieldChangeRules,
            findPossibleDataTypes
          )
        })
      } else {
        // 源节点 JSON.parse('{\"type\":7}').type==7
        fields.forEach(el => {
          el.canUseDataTypes = []
          el.matchedDataTypeLevel = errorFiledType(el)
        })
      }
      return schema
    }

    const renderContent = (h, { node, data, store }) => {
      let icon

      if (data.primary_key_position > 0) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            key
          </VIcon>
        )
      } else if (data.indicesUnique) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            fingerprint
          </VIcon>
        )
      }

      return (
        <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
          {icon}
          <span class="ellipsis">{data.field_name}</span>
          <span class="ml-1 font-color-slight">{data.dataType}</span>
        </div>
      )
    }

    // 源节点发生变化，任务保存后加载模型
    console.log('源节点发生变化，任务保存后加载模型', formRef.value.values.tableName) // eslint-disable-line
    useSchemaEffect(root, () => [formRef.value.values.tableName], loadSchema)

    loadSchema()

    const openDialog = row => {
      refs.dialog.open(row)
    }

    const getDataType = (row = {}) => {
      if (!fieldChangeRules.length) return row.dataTypeTemp
      return row.data_type
    }

    const getCanUseDataTypesTooltip = matchedDataTypeLevel => {
      const map = {
        error: isTarget
          ? i18n.t('packages_dag_field_inference_list_gaiziduanshuju')
          : i18n.t('packages_dag_field_inference_list_gaiziduanwufa')
        // warning: i18n.t('packages_dag_field_inference_list_gaiziduanyingshe')
      }
      return map[matchedDataTypeLevel]
    }

    const canRevokeRules = computed(() => {
      const { qualified_name } = schemaData.value
      return fieldChangeRules.filter(t => t.scope === 'Field' && t.namespace?.[1] === qualified_name) || []
    })

    const handleUpdate = rules => {
      form.setValuesIn('fieldChangeRules', rules)
      fieldChangeRules = rules
    }

    const revokeAll = () => {
      if (!canRevokeRules.length) {
        return
      }
      root
        .$confirm(i18n.t('packages_form_field_inference_list_ninquerenyaohui'), '', {
          type: 'warning',
          closeOnClickModal: false
        })
        .then(resFlag => {
          if (resFlag) {
            const { qualified_name } = schemaData.value
            handleUpdate(fieldChangeRules.filter(t => !(t.scope === 'Field' && t.namespace?.[1] === qualified_name)))
            root.$message.success(i18n.t('public_message_operation_success'))
          }
        })
    }

    const getFieldScope = (row = {}) => {
      return fieldChangeRules.find(t => t.id === row.changeRuleId)?.scope
    }

    const getRevokeColorClass = (row = {}) => {
      const map = {
        Node: 'color-warning',
        Field: 'color-primary'
      }
      return map[getFieldScope(row)] || 'color-disable'
    }

    const getRevokeDisabled = row => {
      return !fieldChangeRules.find(t => t.id === row.changeRuleId)?.scope
    }

    const findInRulesById = id => {
      return fieldChangeRules.find(t => t.id === id)
    }

    const revoke = row => {
      if (getRevokeDisabled(row)) return
      const f = findInRulesById(row.changeRuleId)
      if (!f) return
      if (f.scope === 'Node') {
        return
      }
      if (f.scope === 'Field') {
        row.data_type = f.accept
        const index = fieldChangeRules.findIndex(t => t.id === f.id)
        fieldChangeRules.splice(index, 1)
      }
      row.data_type = row.dataTypeTemp
      this.handleUpdate()
    }

    return () => (
      <div class="schema-preview pb-6">
        <ElDivider class="mt-8">
          <span class="inline-flex align-center gap-1">
            {i18n.t('public_schema')}
            <IconButton
              onClick={() => {
                isTreeView.value = !isTreeView.value
              }}
            >
              {isTreeView.value ? 'table-grid' : 'tree-view'}
            </IconButton>
          </span>
        </ElDivider>
        <div class="flex justify-content-center">
          {isTreeView.value ? (
            <div class="schema-card rounded-lg inline-block overflow-hidden shadow-sm">
              <div class="schema-card-header border-bottom px-3 py-2 fs-7 lh-base text-center">
                {form.values.tableName || form.values.name}
              </div>
              <div
                class="schema-card-body"
                {...{
                  directives: [
                    {
                      name: 'loading',
                      value: loading.value
                    }
                  ]
                }}
                directives={[
                  {
                    name: 'loading',
                    value: loading.value
                  }
                ]}
              >
                <ElTree indent={8} data={treeData.value} render-content={renderContent}></ElTree>
              </div>
            </div>
          ) : (
            <FieldList
              ref="table"
              class="w-100 border rounded-lg overflow-hidden"
              data={schemaData.value}
              readonly={readonly.value}
              fieldChangeRules={fieldChangeRules}
              type={isTarget ? 'target' : isSource ? 'source' : ''}
              hide-batch
              ignore-error={!isTarget}
              on={{
                'update-rules': handleUpdate
              }}
            ></FieldList>
            /*<VTable
              row-key="id"
              columns={columns}
              data={treeData.value}
              has-pagination={false}
              tree-props={{ children: 'children', hasChildren: 'hasChildren' }}
              ref="table"
              default-expand-all
              class="border rounded-lg"
              indent={8}
              scopedSlots={{
                field_name: scope => (
                  <span>
                    <span>{scope.row.field_name}</span>
                    {scope.row.primary_key_position > 0 && (
                      <VIcon size="12" class="text-warning ml-1">
                        key
                      </VIcon>
                    )}
                  </span>
                ),
                data_type: scope => (
                  <div
                    staticClass="position-relative"
                    class="{ 'pl-5': !ignoreError && !!getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel) }"
                  >
                    {props.ignoreError && (
                      <ElTooltip
                        transition="tooltip-fade-in"
                        disabled={scope.row.matchedDataTypeLevel !== 'error'}
                        content={getCanUseDataTypesTooltip(scope.row.matchedDataTypeLevel)}
                        class="type-warning position-absolute"
                      >
                        <VIcon size="16" class="color-warning" class={{ 'opacity-0': !scope.row.matchedDataTypeLevel }}>
                          warning
                        </VIcon>
                      </ElTooltip>
                    )}
                    {readonly.value ? (
                      <span>{getDataType(scope.row)}</span>
                    ) : (
                      <div class="cursor-pointer inline-block" onClick={() => openDialog(scope.row)}>
                        <span>{getDataType(scope.row)}</span>
                        <VIcon class="ml-2">arrow-down</VIcon>
                      </div>
                    )}
                  </div>
                ),
                is_nullable: scope => nullableMap[!scope.row.is_nullable],
                operationHeader: scope => (
                  <VIcon class={canRevokeRules.length ? 'color-primary' : 'color-disable'} onClick={revokeAll}>
                    revoke
                  </VIcon>
                ),
                operation: (
                  <ElTooltip
                    disabled={getFieldScope(scope.row) !== 'Node'}
                    content={i18n.t('packages_form_field_inference_main_gepiliangxiugai')}
                    placement="top"
                  >
                    <VIcon class={getRevokeColorClass(scope.row)} onClick="revoke(scope.row)">
                      revoke
                    </VIcon>
                  </ElTooltip>
                )
              }}
            ></VTable>*/
          )}
        </div>
        {/*<DataTypeDialog
          ref="dialog"
          data={schemaData.value}
          getDataType={getDataType}
          activeNode={form.values}
          fieldChangeRules={fieldChangeRules}
        ></DataTypeDialog>*/}
      </div>
    )
  }
})
