import { defineComponent } from 'vue'
import { MigrateList } from '@tap/business'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'migrateList' ? <MigrateList></MigrateList> : <router-view></router-view>
    }
  }
})
