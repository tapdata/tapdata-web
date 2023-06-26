import { defineComponent, ref } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { useForm } from '@tap/form'
import { VTable, IconButton } from '@tap/component'
import { metadataInstancesApi } from '@tap/api'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import './style.scss'

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
  setup(props, { root }) {
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
        width: '60px'
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
        'min-width': '126px'
      },
      {
        label: i18n.t('packages_form_field_inference_list_feikong'),
        prop: 'is_nullable',
        slotName: 'is_nullable'
      },
      {
        label: i18n.t('packages_form_field_inference_list_ziduanzhushi'),
        prop: 'comment'
      } /*,
      {
        label: i18n.t('public_operation'),
        prop: 'operation',
        slotName: 'operation',
        headerSlot: 'operationHeader',
        width: '60px'
      }*/
    ]

    const nullableMap = {
      true: i18n.t('packages_dag_meta_table_true'),
      false: i18n.t('packages_dag_meta_table_false')
    }

    const loadSchema = async () => {
      loading.value = true
      const params = {
        nodeId: form.values.id,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [{ fields = [], indices = [] } = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)

      const columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})

      treeData.value = fields.map(f => {
        f.dataType = f.data_type.replace(/\(.+\)/, '')
        f.indicesUnique = !!columnsMap[f.field_name]
        return f
      })

      loading.value = false
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
              <div class="schema-card-header border-bottom px-3 py-2 fs-7 text-center">
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
                <ElTree data={treeData.value} render-content={renderContent}></ElTree>
              </div>
            </div>
          ) : (
            <VTable
              columns={columns}
              data={treeData.value}
              has-pagination={false}
              ref="table"
              class="border rounded-lg"
              scopedSlots={{
                field_name: scope => (
                  <span class="flex align-center">
                    <span class="ellipsis">{scope.row.field_name}</span>
                    {scope.row.primary_key_position > 0 && (
                      <VIcon size="12" class="text-warning ml-1">
                        key
                      </VIcon>
                    )}
                  </span>
                ),
                is_nullable: scope => nullableMap[!scope.row.is_nullable]
              }}
            ></VTable>
          )}
        </div>
      </div>
    )
  }
})
