import { defineComponent, ref } from 'vue'
import i18n from '@tap/i18n'
import { useForm } from '@tap/form'
import { IconButton } from '@tap/component'
import { metadataInstancesApi, databaseTypesApi } from '@tap/api'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import { getCanUseDataTypes, getMatchedDataTypeLevel, errorFiledType } from '../../../util'
import FieldList from '../field-inference/List'
import './style.scss'
import { useStore } from 'vuex'

export const SchemaPreview = defineComponent({
  props: ['ignoreError', 'disabled'],
  setup(props) {
    const store = useStore()
    const formRef = useForm()
    const form = formRef.value
    const treeData = ref([])
    const loading = ref(false)
    const isTreeView = ref(true)
    const isTarget = form.values.type === 'table' && !!form.values.$inputs.length
    const isSource = form.values.type === 'table' && !form.values.$inputs.length
    const readonly = ref(props.disabled || store.state.dataflow?.stateIsReadonly || !isTarget)
    let fieldChangeRules = form.values.fieldChangeRules || []
    let columnsMap = {}
    const createTree = (data) => {
      const root = { children: [] }

      for (const item of data) {
        if (item.is_deleted) continue

        const { field_name } = item
        let parent = root
        const fields = field_name.split('.')
        item.dataType = item.data_type.replace(/\(.+\)/, '')
        item.indicesUnique = !!columnsMap[field_name]

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find((c) => c.field_name === field)

          if (!child) {
            child = { field_name: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              field_name: field,
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
        pageSize: 20,
      }
      const {
        // items: [{ fields = [], indices = [] } = {}]
        items: [schema = {}],
      } = await metadataInstancesApi.nodeSchemaPage(params)
      const { fields = [], indices = [] } = schema

      schemaData.value = mapSchema(schema)
      columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})
      treeData.value = createTree(fields.sort((a, b) => a.columnPosition - b.columnPosition))
      loading.value = false
    }

    // 加载dataTypesJson
    const dataTypesJson = ref({})
    const loadDatatypesjson = async () => {
      const pdkHashData = await databaseTypesApi.pdkHash(form.values.attrs?.pdkHash)
      dataTypesJson.value = pdkHashData ? JSON.parse(pdkHashData?.expression || '{}') : {}
    }


    const mapSchema = (schema) => {
      const { fields = [], findPossibleDataTypes = {} } = schema
      //如果findPossibleDataTypes = {}，不做类型校验
      if (isTarget) {
        fields.forEach((el) => {
          const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[el.field_name] || {}
          el.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          el.matchedDataTypeLevel = getMatchedDataTypeLevel(
            el,
            el.canUseDataTypes,
            fieldChangeRules,
            findPossibleDataTypes,
          )
        })
      } else {
        // 源节点 JSON.parse('{\"type\":7}').type==7
        fields.forEach((el) => {
          const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[el.field_name] || {}
          el.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
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

    useSchemaEffect(() => [formRef.value.values.tableName], loadSchema)

    loadSchema()

    loadDatatypesjson()

    const handleUpdate = (rules) => {
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
              <div class="schema-card-header border-bottom px-3 py-2 fs-7 lh-base text-center">
                {form.values.tableName || form.values.name}
              </div>
              <div
                class="schema-card-body"
                {...{
                  directives: [
                    {
                      name: 'loading',
                      value: loading.value,
                    },
                  ],
                }}
                directives={[
                  {
                    name: 'loading',
                    value: loading.value,
                  },
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
                'update-rules': handleUpdate,
              }}
            ></FieldList>
          )}
        </div>
      </div>
    )
  },
})
