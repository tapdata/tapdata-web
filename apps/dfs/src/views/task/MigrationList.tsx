import { defineComponent } from '@vue/composition-api'
import { MigrateList } from '@tap/business'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'migrateList' ? <MigrateList></MigrateList> : <router-view></router-view>
    }
  }
})
