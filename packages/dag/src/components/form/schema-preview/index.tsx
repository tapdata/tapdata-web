import { action } from '@formily/reactive'
import { fetchDatabaseTypeByPdkHash } from '@tap/api/src/core/database-types'
import { getNodeSchemaPage } from '@tap/api/src/core/metadata-instances'
import { refreshTaskSchema } from '@tap/api/src/core/task'
import { IconButton } from '@tap/component/src/icon-button'
import { mapFieldsData, useField, useForm } from '@tap/form'
import { getUpdateConditionFields } from '@tap/form/src/components/field-select/FieldSelect'
import { computed as reactiveComputed } from '@tap/form/src/shared/reactive'
import { useI18n } from '@tap/i18n'
import { debounce, isEqual } from 'lodash-es'
import { defineComponent, ref } from 'vue'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import { useDataflowStore } from '../../../stores/dataflow.store'
import {
  errorFiledType,
  getCanUseDataTypes,
  getMatchedDataTypeLevel,
} from '../../../util'
import FieldRuleDialog from '../field-inference/Dialog.vue'
import FieldList from '../field-inference/List.vue'
import './style.scss'

export const SchemaPreview = defineComponent({
  props: ['ignoreError', 'disabled'],
  setup(props) {
    const { t } = useI18n()
    const dataflowStore = useDataflowStore()
    const formRef = useForm()
    const fieldRef = useField()
    const form = formRef.value
    const treeData = ref([])
    const loading = ref(false)
    const isTreeView = ref(true)
    const isMultiIndex = ref(false)
    const isMultiUniqueIndex = ref(false)
    const isMultiForeignKey = ref(false)
    const isTarget = reactiveComputed(() => {
      return form.values.type === 'table' && !!form.values.$inputs.length
    })
    const isSource = form.values.type === 'table' && !form.values.$inputs.length
    const readonly = ref(
      props.disabled || dataflowStore?.stateIsReadonly || !isTarget.value,
    )
    const fieldChangeRules = ref(form.values.fieldChangeRules || [])
    const visible = ref(false)

    const handleOpen = () => {
      visible.value = true
    }

    const createTree = (data) => {
      const root = { children: [] }

      for (const item of data) {
        const { label } = item
        let parent = root
        const fields = label.split('.')

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find((c) => c.label === field)

          if (!child) {
            child = { label: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              label: field,
            })
          }
        }
      }

      return root.children
    }

    const tableName = ref(form.values.tableName || form.values.name)
    const schemaData = ref({})
    const loadSchema = debounce(async () => {
      loading.value = true
      fieldRef.value.loading = fieldRef.value.displayName !== 'VoidField'
      const params = {
        nodeId: form.values.id,
        fields: [
          'original_name',
          'fields',
          'qualified_name',
          'name',
          'indices',
          'constraints',
        ],
        page: 1,
        pageSize: 20,
      }
      try {
        const {
          items: [schema = {}],
        } = await getNodeSchemaPage(params)

        tableName.value =
          schema.name || form.values.tableName || form.values.name

        // 仅仅为了动态日期后缀更新，增加这个事件有风险，会循环更新表名
        // emit('update-table-name', tableName.value)

        const {
          isMultiIndex: _isMultiIndex,
          isMultiUniqueIndex: _isMultiUniqueIndex,
          isMultiForeignKey: _isMultiForeignKey,
          fields,
        } = mapFieldsData(schema)

        isMultiIndex.value = _isMultiIndex
        isMultiUniqueIndex.value = _isMultiUniqueIndex
        isMultiForeignKey.value = _isMultiForeignKey
        schema.fields = fields
        schemaData.value = mapSchema(schema)
        treeData.value = createTree(fields)

        if (isTarget.value && !form.values.attrs?.hasCreated) {
          // 自动设置更新条件字段为主键/唯一索引
          const updateConditionFields = getUpdateConditionFields(fields)
          if (
            !form.values.updateConditionFields?.length ||
            !isEqual(form.values.updateConditionFields, updateConditionFields)
          ) {
            form.setFieldState('updateConditionFields', {
              value: updateConditionFields,
              errors: [],
            })
          }
        }
      } catch (error) {
        console.error('Failed to load schema:', error)
      } finally {
        loading.value = false
        if (fieldRef.value.displayName !== 'VoidField') {
          action.bound!(() => {
            fieldRef.value.dataSource = schemaData.value.fields || []
            fieldRef.value.loading = false
          })()
        }
      }
    }, 200)

    // 加载dataTypesJson
    const dataTypesJson = ref({})
    const loadDatatypesjson = async () => {
      const pdkHash = form.values.attrs?.pdkHash
      if (pdkHash) {
        const pdkHashData = await fetchDatabaseTypeByPdkHash(
          form.values.attrs?.pdkHash,
        )
        dataTypesJson.value = pdkHashData
          ? JSON.parse(pdkHashData?.expression || '{}')
          : {}
      }
    }

    const mapSchema = (schema) => {
      const { fields = [], findPossibleDataTypes = {} } = schema
      fields.sort((a, b) => a.columnPosition - b.columnPosition)
      //如果findPossibleDataTypes = {}，不做类型校验
      if (isTarget.value) {
        fields.forEach((field) => {
          const { dataTypes = [], lastMatchedDataType = '' } =
            findPossibleDataTypes[field.field_name] || {}
          field.canUseDataTypes =
            getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          field.matchedDataTypeLevel = getMatchedDataTypeLevel(
            field,
            field.canUseDataTypes,
            fieldChangeRules.value,
            findPossibleDataTypes,
          )
          // mapField(field)
        })
      } else {
        // 源节点 JSON.parse('{\"type\":7}').type==7
        fields.forEach((field) => {
          const { dataTypes = [], lastMatchedDataType = '' } =
            findPossibleDataTypes[field.field_name] || {}
          field.canUseDataTypes =
            getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          field.matchedDataTypeLevel = errorFiledType(field)
          // mapField(field)
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
            content={t('public_foreign_key_tip', {
              name: data.constraints[0],
              val: data.constraints[2],
            })}
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
            content={t('public_foreign_key_tip', {
              name: data.constraints[0],
              val: data.constraints[2],
            })}
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
            content={`${t(data.indicesUnique[2] ? 'public_unique_index' : 'public_normal_index')}: ${
              data.indicesUnique[0]
            }`}
            open-delay={200}
            transition="none"
          >
            <span
              class={`flex align-center field-icon position-absolute ${data.indicesUnique[3] ? 'text-primary' : ''}`}
            >
              <VIcon size="14">
                {data.indicesUnique[2] ? 'fingerprint' : 'sort-descending'}
              </VIcon>
              <span
                style={`--index: '${indexStr}';--zoom: ${1 - indexStr.length * 0.2};`}
                class={[
                  'fingerprint-sub',
                  data.indicesUnique[2] ? 'unique-sub' : 'index-sub',
                ]}
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
          {isTarget.value && (
            <el-icon class="field-grip-icon position-absolute">
              <i-lucide-grip-vertical />
            </el-icon>
          )}
          {icon}
          <span class="ellipsis">
            <span
              style={
                data.source === 'virtual_hash' ? 'font-style:italic' : null
              }
            >
              {data.label}
            </span>
          </span>
          <span class="ml-1 font-color-slight">{data.dataType}</span>
        </div>
      )
    }

    useSchemaEffect(
      () =>
        formRef.value.values.type === 'table'
          ? [formRef.value.values.tableName]
          : [],
      loadSchema,
    )

    if (!dataflowStore.taskSaving) {
      loadSchema()
    }

    loadDatatypesjson()

    const handleUpdate = (rules: any[]) => {
      form.setValuesIn('fieldChangeRules', rules)
      fieldChangeRules.value = rules
    }

    const taskId = dataflowStore.dataflow.id
    const activeNodeId = dataflowStore.selectedNode?.id
    const refreshing = ref(false)
    const refreshSchema = async () => {
      if (refreshing.value) return
      refreshing.value = true
      await refreshTaskSchema(taskId, {
        nodeIds: activeNodeId,
        keys: form.values.tableName,
      }).finally(() => {
        refreshing.value = false
      })

      if (formRef.value.values.type !== 'table') {
        loadSchema()
      }
    }

    const allowDrop = (draggingNode, dropNode, type) => {
      return type !== 'inner'
    }

    const handleNodeDrop = () => {
      const fields: { fieldName: string; columnPosition: number }[] = []
      const walk = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.field_name) {
            fields.push({
              fieldName: node.original_field_name,
              columnPosition: fields.length + 1,
            })
          }
          if (node.children?.length) {
            walk(node.children)
          }
        }
      }
      walk(treeData.value)

      // Sync columnPosition back to schemaData.fields
      const schemaFields = schemaData.value.fields || []
      for (const item of fields) {
        const target = schemaFields.find(
          (f: any) => f.field_name === item.fieldName,
        )
        if (target) {
          target.columnPosition = item.columnPosition
        }
      }

      form.setValuesIn('fieldsAfter', [
        {
          // tableName: tableName.value,
          fields,
        },
      ])
    }

    return () => (
      <div class="schema-preview pb-6">
        <ElDivider class="mt-8">
          <span class="inline-flex align-center gap-1">
            {t('public_schema')}
            <el-divider direction="vertical" class="mr-1" />
            <el-tooltip
              content={t('packages_dag_refresh_schema')}
              placement="top"
              hide-after={0}
              enterable={false}
              transition="none"
            >
              <IconButton
                disabled={props.disabled}
                onClick={refreshSchema}
                loading={refreshing.value}
              >
                refresh
              </IconButton>
            </el-tooltip>
            <el-tooltip
              content={t(
                isTreeView.value
                  ? 'packages_dag_switch_to_table_view'
                  : 'packages_dag_switch_to_tree_view',
              )}
              placement="top"
              hide-after={0}
              enterable={false}
              transition="none"
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
              'hide-foreign-sub': !isMultiForeignKey.value,
            },
          ]}
        >
          {isTreeView.value ? (
            <div class="schema-card rounded-xl inline-block overflow-hidden shadow-sm border border-light">
              <div class="schema-card-header border-bottom px-3 py-2 fs-7 lh-base text-center">
                {tableName.value}
              </div>
              <div
                class="schema-card-body p-1"
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
                <ElTree
                  indent={8}
                  draggable={isTarget.value}
                  allow-drop={allowDrop}
                  data={treeData.value}
                  render-content={renderContent}
                  onNode-drop={handleNodeDrop}
                ></ElTree>
              </div>
            </div>
          ) : (
            <>
              <FieldList
                class="w-100 overflow-hidden"
                data={schemaData.value}
                readonly={readonly.value}
                dataTypesJson={dataTypesJson.value}
                fieldChangeRules={fieldChangeRules.value}
                type={isTarget.value ? 'target' : isSource ? 'source' : ''}
                single-table
                ignore-error={!isTarget.value}
                onUpdateRules={handleUpdate}
                onOpenUpdateRules={handleOpen}
              ></FieldList>
              <FieldRuleDialog
                visible={visible.value}
                onUpdate:visible={(val: boolean) => (visible.value = val)}
                v-model:fieldChangeRules={fieldChangeRules.value}
                form={form}
                readonly={readonly.value}
              />
            </>
          )}
        </div>
      </div>
    )
  },
})
