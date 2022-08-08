import { defineComponent } from '@vue/composition-api'
import List from '@tap/business/src/views/task/migrate/List'

export default defineComponent({
  setup() {
    return () => {
      return <List classify canImport></List>
    }
  }
})
