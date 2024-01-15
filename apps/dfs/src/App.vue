<template>
  <ElConfigProvider :locale="locale">
    <RouterView />

    <ReplicationTour
      :value="showReplicationTour"
      @input="setShowReplicationTour"
      :finish="replicationTourFinish"
      @start="handleStartTour"
      @finish="handleFinishTour"
    ></ReplicationTour>
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { watch, computed, onMounted, provide, getCurrentInstance, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { buried } from '@/plugins/buried'
import i18n from '@tap/i18n'
import axios from '@/plugins/axios'
import ReplicationTour from '@/components/ReplicationTour.vue'

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

const store = useStore()
const showReplicationTour = computed(() => store.state.showReplicationTour)
const replicationTourFinish = computed(() => store.state.replicationTourFinish)

const router = useRouter()
const setShowReplicationTour = (flag) => {
  store.commit('setShowReplicationTour', flag)
}
const handleStartTour = async () => {
  setShowReplicationTour(false)
  await router.push({ name: 'migrateList' })
  store.commit('startTour')
}
const handleFinishTour = () => {
  setShowReplicationTour(false)
}

onMounted(() => {
  const vm = getCurrentInstance()
  const route = useRoute()
  const unwatch = watch(route, async () => {
    unwatch()
    await nextTick()
    if (route.query?.tour) {
      const guide = await vm.$axios.get('api/tcm/user_guide')
      // 查询是否有查看监控的行为
      const behavior = guide?.tour?.behavior
      if (behavior && behavior !== 'view-monitor') {
        store.commit('openCompleteReplicationTour')
        vm.$axios.post('api/tcm/user_guide', {
          tour: {
            ...guide.tour,
            behavior: 'view-monitor',
            behaviorAt: Date.now(),
          },
        })
      }
    }
  })
})
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
