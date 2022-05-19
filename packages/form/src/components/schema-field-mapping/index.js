import FiledMapping from '../field-mapping'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

export const SchemaFiledMapping = observer(
  defineComponent({
    setup(props, { attrs, listeners }) {
      return () => {
        return <FiledMapping attrs={attrs} on={listeners} itemType="string" itemQuery="original_name" />
      }
    }
  })
)

export default SchemaFiledMapping
