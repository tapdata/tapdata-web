import { defineComponent, provide, ref } from '@vue/composition-api'
import { workerApi } from '@tap/api'
import { provideI18n, useMessage, I18n } from './hooks'
import LockedDialog from './components/LockedDialog.vue'

export default defineComponent({
  setup() {
    const showLocked = ref(false)
    const lockedFeature =
      process.env.VUE_APP_MODE === 'community'
        ? {
            sharedMiningList: true,
            dataVerificationList: true,
            alarmSetting: true,
            roleList: true,
            valid_total: true
          }
        : {}

    provideI18n()
    provide('checkAgent', async cb => {
      const Message = useMessage()
      const data = await workerApi.getAvailableAgent()
      if (!data?.result?.length) {
        Message.error(I18n.$t('agent_check_error'))
      } else {
        cb && cb()
      }
    })
    provide('buried', () => {})
    provide('lockedFeature', lockedFeature)
    provide('openLocked', () => {
      showLocked.value = true
    })
    return () => {
      return (
        <div id="app">
          <router-view />

          <LockedDialog
            visible={showLocked.value}
            on={{
              'update:visible': val => (showLocked.value = val)
            }}
          ></LockedDialog>
        </div>
      )
    }
  }
})
