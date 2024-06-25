import { defineComponent, ref } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { useForm, useField } from '@tap/form'
import { IconButton } from '@tap/component'
import { metadataInstancesApi, databaseTypesApi } from '@tap/api'
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
    const isTarget = form.values.type === 'table' && !!form.values.$inputs.length
    const isSource = form.values.type === 'table' && !form.values.$inputs.length
    const readonly = ref(props.disabled || root.$store.state.dataflow?.stateIsReadonly || !isTarget)
    let fieldChangeRules = form.values.fieldChangeRules || []
    let columnsMap = {}
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
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)

      tableName.value = schema.name
      emit('update-table-name', tableName.value)

      let { indices = [], fields = [] } = schema

      columnsMap = indices.reduce((map, item, index) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = [item.indexName, index, item.unique]))
        return map
      }, {})

      schemaData.value = mapSchema(schema)

      fields = fields
        .filter(item => !item.is_deleted)
        .map(field => {
          return {
            label: field.field_name,
            value: field.field_name,
            isPrimaryKey: field.isPrimaryKey,
            indicesUnique: field.indicesUnique,
            type: field.data_type,
            tapType: field.tapType,
            dataType: field.data_type.replace(/\(.+\)/, '')
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
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            key
          </VIcon>
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
              <VIcon size="12">fingerprint</VIcon>
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class="fingerprint-sub"
              ></span>
            </span>
          </ElTooltip>
        )
      }

      return (
        <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
          {icon}
          <span class="ellipsis">{data.label}</span>
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
