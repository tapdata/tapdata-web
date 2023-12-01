<template>
  <ElConfigProvider :locale="locale">
    <RouterView />
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { computed, provide } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import i18n from '@tap/i18n'
import { workerApi } from '@tap/api'
import { provideI18n, useMessage, I18n } from './hooks'

const langMap = {
  'zh-CN': zhCn,
  'zh-TW': zhTw,
  en,
}

const locale = computed(() => {
  return langMap[i18n.global.locale || 'en']
})

provideI18n()
provide('checkAgent', async (cb) => {
  const Message = useMessage()
  const data = await workerApi.getAvailableAgent()
  if (!data?.result?.length) {
    Message.error(I18n.$t('agent_check_error'))
  } else {
    cb && cb()
  }
})
provide('buried', () => {})
</script>
