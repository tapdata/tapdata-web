import { defineComponent } from '@vue/composition-api'
import { EtlList } from '@tap/business'

export default defineComponent({
  setup(props, { root }) {
    return () => {
      return root.$route.name === 'dataflowList' ? <EtlList></EtlList> : <router-view></router-view>
    }
  }
})
