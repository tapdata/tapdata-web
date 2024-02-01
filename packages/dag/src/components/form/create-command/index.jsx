import ClipboardDialog from '../clipboard-dialog'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue'

export const ClipboardBtn = observer(
  defineComponent({
    setup(props, { attrs }) {
      return () => {
        return <ClipboardDialog {...attrs} itemType="string" itemQuery="original_name" />
      }
    },
  }),
)

export default ClipboardBtn
