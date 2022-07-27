import { defineComponent } from '@vue/composition-api'
import List from '@tap/business/src/views/connections/List'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'Connection' ? <List></List> : <router-view></router-view>
    }
  }
})
