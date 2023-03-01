import { defineComponent } from 'vue'
import { ConnectionList } from '@tap/business'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'connections' ? <ConnectionList></ConnectionList> : <router-view></router-view>
    }
  }
})
