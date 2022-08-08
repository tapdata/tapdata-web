import { defineComponent } from '@vue/composition-api'
import List from '@tap/business/src/views/connections/List'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'connections' ? (
        <List class="route-page-container"></List>
      ) : (
        <router-view></router-view>
      )
    }
  }
})
