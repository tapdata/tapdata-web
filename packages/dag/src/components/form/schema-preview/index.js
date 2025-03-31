import { defineComponent, ref, onBeforeUnmount, getCurrentInstance } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { useForm, useField } from '@tap/form'
import { IconButton } from '@tap/component'
import { metadataInstancesApi, databaseTypesApi, taskApi } from '@tap/api'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import { getCanUseDataTypes, getMatchedDataTypeLevel, errorFiledType } from '../../../util'
import FieldList from '../field-inference/List'
import './style.scss'
import { action } from '@formily/reactive'

export const SchemaPreview = defineComponent({
  props: ['ignoreError', 'disabled'],
  setup(props, { root, refs, emit }) {
    const formRef = useForm()
    const fieldRef = useField()
    const form = formRef.value
    const treeData = ref([])
    const loading = ref(false)
    const isTreeView = ref(true)
    const isMultiIndex = ref(false)
    const isMultiUniqueIndex = ref(false)
    const isMultiForeignKey = ref(false)
    const isTarget = form.values.type === 'table' && !!form.values.$inputs.length
    const isSource = form.values.type === 'table' && !form.values.$inputs.length
    const readonly = ref(props.disabled || root.$store.state.dataflow?.stateIsReadonly || !isTarget)
    let fieldChangeRules = form.values.fieldChangeRules || []
    let columnsMap = {}
    let constraintMap = {}
    let partitionFieldMap = {}
    const createTree = data => {
      const root = { children: [] }

      for (const item of data) {
        const { label } = item
        let parent = root
        const fields = label.split('.')

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find(c => c.label === field)

          if (!child) {
            child = { label: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              label: field
            })
          }
        }
      }

      return root.children
    }

    const tableName = ref(form.values.tableName || form.values.name)
    const schemaData = ref({})
    const loadSchema = async () => {
      loading.value = true
      fieldRef.value.loading = fieldRef.value.displayName !== 'VoidField'
      const params = {
        nodeId: form.values.id,
        fields: ['original_name', 'fields', 'qualified_name', 'name', 'indices', 'constraints'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)

      tableName.value = schema.name || form.values.tableName || form.values.name
      emit('update-table-name', tableName.value)

      let {
        constraints = [],
        indices = [],
        fields = [],
        partitionInfo: { partitionFields = [] } = { partitionFields: [] }
      } = schema

      indices = indices.filter(item => item.primaryKey !== true && item.primaryKey !== 'true')

      let indexCount = 0
      let uniqueIndexCount = 0
      let foreignKeyCount = 0

      const pkMap = fields.reduce((map, field) => {
        if (field.primary_key_position > 0) {
          map[field.field_name] = true
        }
        return map
      }, {})

      columnsMap = indices.reduce((map, item, index) => {
        if (item.unique) {
          uniqueIndexCount++
        } else {
          indexCount++
        }
        item.columns.forEach(({ columnName }) => (map[columnName] = [item.indexName, index, item.unique]))
        return map
      }, {})

      constraintMap = constraints.reduce((map, item, index) => {
        if (item.type === 'FOREIGN_KEY') {
          let temp = 0
          item.mappingFields.forEach(({ foreignKey, referenceKey }) => {
            map[foreignKey] = [item.name, index, `${item.referencesTableName}.${referenceKey}`]
            if (!pkMap[foreignKey]) {
              temp++
            }
          })
          if (temp > 0) foreignKeyCount++
        }

        return map
      }, {})

      isMultiIndex.value = indexCount > 1
      isMultiUniqueIndex.value = uniqueIndexCount > 1
      isMultiForeignKey.value = foreignKeyCount > 1

      partitionFields.reduce((map, item) => {
        map[item.name] = true
        return map
      }, partitionFieldMap)

      schemaData.value = mapSchema(schema)

      fields = fields
        .filter(item => !item.is_deleted)
        .map(field => {
          return {
            label: field.field_name,
            value: field.field_name,
            isPrimaryKey: field.isPrimaryKey,
            indicesUnique: field.indicesUnique,
            isForeignKey: constraintMap[field.field_name],
            constraints: constraintMap[field.field_name],
            type: field.data_type,
            tapType: field.tapType,
            source: field.source,
            dataType: field.data_type.replace(/\(.+\)/, ''),
            isMultiIndex: isMultiIndex.value,
            isMultiUniqueIndex: isMultiUniqueIndex.value,
            isMultiForeignKey: isMultiForeignKey.value
          }
        })

      treeData.value = createTree(fields)
      loading.value = false

      if (fieldRef.value.displayName !== 'VoidField') {
        action.bound(() => {
          fieldRef.value.dataSource = fields
          fieldRef.value.loading = false
        })()
      }
    }

    // 加载dataTypesJson
    const dataTypesJson = ref({})
    const loadDatatypesjson = async () => {
      const pdkHash = form.values.attrs?.pdkHash
      if (pdkHash) {
        const pdkHashData = await databaseTypesApi.pdkHash(form.values.attrs?.pdkHash)
        dataTypesJson.value = pdkHashData ? JSON.parse(pdkHashData?.expression || '{}') : {}
      }
    }

    const mapSchema = schema => {
      const { fields = [], findPossibleDataTypes = {} } = schema
      const mapField = field => {
        /*if (columnsMap[field.field_name]) {
          field.indicesUnique = columnsMap[field.field_name][0]
          field.indicesUniqueIndex = columnsMap[field.field_name][1]
          field.indicesIfUnique = columnsMap[field.field_name][2]
        }*/
        field.indicesUnique = columnsMap[field.field_name]
        field.isPrimaryKey = field.primary_key_position > 0
        field.isPartitionKey = partitionFieldMap[field.field_name]
      }
      fields.sort((a, b) => a.columnPosition - b.columnPosition)
      //如果findPossibleDataTypes = {}，不做类型校验
      if (isTarget) {
        fields.forEach(field => {
          const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[field.field_name] || {}
          field.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          field.matchedDataTypeLevel = getMatchedDataTypeLevel(
            field,
            field.canUseDataTypes,
            fieldChangeRules,
            findPossibleDataTypes
          )
          mapField(field)
        })
      } else {
        // 源节点 JSON.parse('{\"type\":7}').type==7
        fields.forEach(field => {
          const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[field.field_name] || {}
          field.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          field.matchedDataTypeLevel = errorFiledType(field)
          mapField(field)
        })
      }
      return schema
    }

    const renderContent = (h, { node, data, store }) => {
      let icon

      if (data.isPrimaryKey) {
        icon = !data.isForeignKey ? (
          <VIcon size="12" class="field-icon position-absolute">
            key
          </VIcon>
        ) : (
          <ElTooltip
            placement="top"
            content={i18n.t('public_foreign_key_tip', { name: data.constraints[0], val: data.constraints[2] })}
            open-delay={200}
            transition="none"
          >
            <VIcon size="12" class="field-icon position-absolute">
              key
            </VIcon>
          </ElTooltip>
        )
      } else if (data.isForeignKey) {
        const indexStr = String(data.constraints[1])
        icon = (
          <ElTooltip
            placement="top"
            content={i18n.t('public_foreign_key_tip', { name: data.constraints[0], val: data.constraints[2] })}
            open-delay={200}
            transition="none"
          >
            <span class="flex align-center field-icon position-absolute">
              <VIcon size="14">share</VIcon>
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class="fingerprint-sub foreign-sub"
              ></span>
            </span>
          </ElTooltip>
        )
      } else if (data.indicesUnique) {
        const indexStr = String(data.indicesUnique[1])
        icon = (
          <ElTooltip
            placement="top"
            content={
              `${i18n.t(data.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ` +
              data.indicesUnique[0]
            }
            open-delay={200}
            transition="none"
          >
            <span class="flex align-center field-icon position-absolute">
              <VIcon size="14">{data.indicesUnique[2] ? 'fingerprint' : 'sort-descending'}</VIcon>
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class={['fingerprint-sub', data.indicesUnique[2] ? 'unique-sub' : 'index-sub']}
              ></span>
            </span>
          </ElTooltip>
        )
      } else if (data.isPartitionKey) {
        icon = (
          <VIcon size="14" class="field-icon position-absolute">
            circle-dashed-letter-p
          </VIcon>
        )
      } else if (data.source === 'virtual_hash') {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            file-hash
          </VIcon>
        )
      }

      return (
        <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
          {icon}
          <span class="ellipsis">
            <span style={data.source === 'virtual_hash' ? 'font-style:italic' : null}>{data.label}</span>
          </span>
          <span class="ml-1 font-color-slight">{data.dataType}</span>
        </div>
      )
    }

    useSchemaEffect(root, () => [formRef.value.values.tableName], loadSchema)

    if (!root.$store.state.dataflow.taskSaving) {
      loadSchema()
    }

    loadDatatypesjson()

    const handleUpdate = rules => {
      form.setValuesIn('fieldChangeRules', rules)
      fieldChangeRules = rules
    }

    const { taskId, activeNodeId } = root.$store.state?.dataflow || {}
    const refreshing = ref(false)
    const refreshSchema = async () => {
      if (refreshing.value) return
      refreshing.value = true
      await taskApi
        .refreshSchema(taskId, {
          nodeIds: activeNodeId,
          keys: form.values.tableName
        })
        .finally(() => {
          refreshing.value = false
        })
    }

    function remove(children, vm) {
      const index = children.indexOf(vm)
      if (index > -1) {
        children.splice(index, 1)
      }
    }

    onBeforeUnmount(() => {
      console.log('onBeforeUnmount')
      return
    })

    return () => (
      <div class="schema-preview pb-6">
        <ElDivider class="mt-8">
          <span class="inline-flex align-center gap-1">
            {i18n.t('public_schema')}
            <el-divider direction="vertical" class="mx-0" staticClass="mx-1" />
            <el-tooltip transition="tooltip-fade-in" content={i18n.t('packages_dag_refresh_schema')} placement="top">
              <IconButton disabled={props.disabled} onClick={refreshSchema} loading={refreshing.value}>
                refresh
              </IconButton>
            </el-tooltip>
            <el-tooltip
              transition="tooltip-fade-in"
              content={i18n.t(
                isTreeView.value ? 'packages_dag_switch_to_table_view' : 'packages_dag_switch_to_tree_view'
              )}
              placement="top"
            >
              <IconButton
                onClick={() => {
                  isTreeView.value = !isTreeView.value
                }}
              >
                {isTreeView.value ? 'table-grid' : 'tree-view'}
              </IconButton>
            </el-tooltip>
          </span>
        </ElDivider>
        <div
          class={[
            'flex justify-content-center',
            {
              'hide-index-sub': !isMultiIndex.value,
              'hide-unique-sub': !isMultiUniqueIndex.value,
              'hide-foreign-sub': !isMultiForeignKey.value
            }
          ]}
        >
          {isTreeView.value ? (
            <div class="schema-card rounded-lg inline-block overflow-hidden shadow-sm">
              <div class="schema-card-header border-bottom px-3 py-2 fs-7 lh-base text-center">{tableName.value}</div>
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
              dataTypesJson={dataTypesJson.value}
              fieldChangeRules={fieldChangeRules}
              type={isTarget ? 'target' : isSource ? 'source' : ''}
              single-table
              ignore-error={!isTarget}
              on={{
                'update-rules': handleUpdate
              }}
            ></FieldList>
          )}
        </div>
      </div>
    )
  }
})
