import { defineComponent, provide } from '@vue/composition-api'
import { workerApi } from '@tap/api'
import { provideI18n, useMessage, useI18n } from './hooks'

export default defineComponent({
  setup() {
    provideI18n()
    provide('checkAgent', async cb => {
      const { $message } = useMessage()
      const i18n = useI18n()

      const data = await workerApi.getAvailableAgent()
      if (!data?.result?.length) {
        $message.error(i18n.$t('agent_check_error'))
      } else {
        cb && cb()
      }
    })
    return () => {
      return (
        <div id="app">
          <router-view />
        </div>
      )
    }
  }
})
