import AsyncSelect from '../async-select'
import { useField } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import { MetadataInstances } from '@daas/api'

const metadataApi = new MetadataInstances()

const loadTable = async (filter, config) => {
  filter.where &&
    Object.assign(filter.where, {
      meta_type: {
        in: ['collection', 'table', 'view'] //,
      },
      is_deleted: false
    })
  Object.assign(filter, {
    fields: {
      original_name: true
    }
  })
  if (!filter.where.original_name) {
    filter.where.original_name = {
      // regexp: '^[^\\s]+$'
      neq: ''
    }
  }
  const data = await metadataApi.get({ filter: JSON.stringify(filter) }, config)
  data.items = data.items.map(item => item.original_name)
  return data
}

export const TableSelect = observer(
  defineComponent({
    setup(props, { attrs, listeners }) {
      const fieldRef = useField()
      const createValidate = v => /^[a-zA-Z][0-9a-zA-Z_.-]*$/.test(v)
      const handleCreate = v => {
        if (!createValidate(v)) {
          fieldRef.value.setFeedback({
            triggerType: 'onFocus',
            type: 'warning',
            code: 'ValidateWarning',
            messages: '输入的表名不合法'
          })
          console.log('表名格式错误') // eslint-disable-line
        }
      }
      return () => {
        const connectionId = fieldRef.value.query('connectionId').value()
        const params = { where: { 'source.id': connectionId } }
        console.log('TableSelect', params, attrs) // eslint-disable-line
        return (
          <AsyncSelect
            attrs={attrs}
            on={listeners}
            vOn:create={handleCreate}
            itemType="string"
            itemQuery="original_name"
            method={loadTable}
            createValidate={createValidate}
            params={params}
          ></AsyncSelect>
        )
      }
    }
  })
)

export default TableSelect
