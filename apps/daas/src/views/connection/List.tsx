import { defineComponent } from '@vue/composition-api'
import List from '@tap/business/src/views/connections/List'

export default defineComponent({
  setup() {
    return () => {
      return <List classify></List>
    }
  }
})
