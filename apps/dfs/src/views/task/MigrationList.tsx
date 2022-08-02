import { defineComponent } from '@vue/composition-api'
import List from '@tap/business/src/views/task/migrate/List'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'migrateList' ? (
        <List class="route-page-container"></List>
      ) : (
        <router-view></router-view>
      )
    }
  }
})
