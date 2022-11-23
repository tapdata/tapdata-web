import Main from './Main'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'

export const fieldInference = observer(
  defineComponent({
    setup(props, { attrs, listeners, refs, root }) {
      return () => {
        return <Main ref="fieldMapping" attrs={attrs} on={listeners} />
      }
    }
  })
)

export default fieldInference
