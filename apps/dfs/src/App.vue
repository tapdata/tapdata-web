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
import { buried } from '@/plugins/buried'
import i18n from '@tap/i18n'
import axios from '@/plugins/axios'

const langMap = {
  'zh-CN': zhCn,
  'zh-TW': zhTw,
  en,
}

const locale = computed(() => {
  return langMap[i18n.global.locale || 'en']
})

provide('checkAgent', async (callback) => {
  let data = await axios.get('api/tcm/agent/agentCount')
  if (data.agentRunningCount || data.agentRunningCount > 0) {
    callback?.()
  } else {
    ElMessage.error(i18n.t('agent_error_check'))
    throw new Error(i18n.t('agent_error_check'))
  }
})
provide('buried', buried)
</script>

<style lang="scss">
#app {
  position: relative;
  height: 100%;
  min-width: 1440px;
  font-size: 14px;
}
.second-line .el-radio-button__inner {
  margin-top: 10px;
  border-left: 1px solid #dcdfe6;
}
.second-line + .second-line {
  .el-radio-button__inner {
    border-left: 0;
  }
}
</style>
