import Settings from '../field-mapping/Settings'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

export const fieldChangeRules = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      return () => {
        return <Settings ref="fieldMapping" attrs={attrs} on={listeners} />
      }
    }
  })
)

export default fieldChangeRules
