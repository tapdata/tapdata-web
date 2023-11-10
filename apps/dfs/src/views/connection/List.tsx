import { defineComponent, getCurrentInstance } from 'vue'
import { ConnectionList } from '@tap/business'

export default defineComponent({
  setup(props) {
    const root = getCurrentInstance().appContext.config.globalProperties
    return () => {
      return root.$route.name === 'connections' ? <ConnectionList></ConnectionList> : <router-view></router-view>
    }
  },
})
