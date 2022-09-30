import ClipboardDialog from '../clipboard-dialog'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

export const ClipboardBtn = observer(
  defineComponent({
    setup(props, { attrs, listeners }) {
      return () => {
        return <ClipboardDialog attrs={attrs} on={listeners} itemType="string" itemQuery="original_name" />
      }
    }
  })
)

export default ClipboardBtn
