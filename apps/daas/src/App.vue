<script lang="ts" setup>
import { workerApi } from '@tap/api'
import { useI18n } from '@tap/i18n'
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import { computed, provide, ref } from 'vue'

const { t, locale: i18nLocale } = useI18n()

const langMap = {
  'zh-CN': zhCn,
  'zh-TW': zhTw,
  en,
}

const locale = computed(() => {
  return langMap[i18nLocale.value || 'en']
})

const linkProps = {
  underline: 'never',
}

provide('checkAgent', async (cb) => {
  const data = await workerApi.getAvailableAgent()
  if (!data?.result?.length) {
    ElMessage.error(t('agent_check_error'))
  } else {
    cb && cb()
  }
})
provide('buried', () => {})

const showLocked = ref(false)
const lockedFeature =
  import.meta.env.VUE_APP_MODE === 'community'
    ? {
        sharedMiningList: true,
        dataVerificationList: true,
        alarmSetting: true,
        roleList: true,
        valid_total: true,
      }
    : {}

provide('lockedFeature', lockedFeature)
provide('openLocked', () => {
  showLocked.value = true
})
</script>

<template>
  <ElConfigProvider :locale="locale" :link="linkProps">
    <RouterView />
    <LockedDialog v-model:visible="showLocked" />
  </ElConfigProvider>
</template>
