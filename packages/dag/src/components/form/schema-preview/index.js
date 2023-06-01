import { defineComponent, ref } from '@vue/composition-api'
import { useForm } from '@tap/form'
import { metadataInstancesApi } from '@tap/api'
import { useSchemaEffect } from '../../../hooks/useAfterTaskSaved'
import './style.scss'

export const SchemaPreview = defineComponent({
  setup(props, { root }) {
    const formRef = useForm()
    const form = formRef.value
    const treeData = ref([])

    const loadSchema = async () => {
      const params = {
        nodeId: form.values.id,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [{ fields }]
      } = await metadataInstancesApi.nodeSchemaPage(params)

      treeData.value = fields
      console.log('fields', fields) // eslint-disable-line
    }

    const renderContent = (h, { node, data, store }) => {
      return (
        <div>
          <span>{data.field_name}</span>
          <span class="ml-1 font-color-slight">{data.data_type}</span>
        </div>
      )
    }

    // 源节点发生变化，任务保存后加载模型
    console.log('源节点发生变化，任务保存后加载模型', formRef.value.values.tableName) // eslint-disable-line
    useSchemaEffect(root, () => [formRef.value.values.tableName], loadSchema)

    loadSchema()

    return () => (
      <div class="schema-preview">
        <ElDivider class="mt-8">模型</ElDivider>
        <div class="flex">
          <div class="schema-card rounded-lg inline-block overflow-hidden shadow-sm">
            <div class="schema-card-header border-bottom px-3 py-1 fs-6 text-center">表名</div>
            <div class="schema-card-body">
              <ElTree data={treeData.value} render-content={renderContent}></ElTree>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
