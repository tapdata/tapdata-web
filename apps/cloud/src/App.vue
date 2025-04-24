<script lang="ts" setup>
import i18n from '@tap/i18n'
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  provide,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ReplicationTour from '@/components/ReplicationTour.vue'
import axios from '@/plugins/axios'
import { buried } from '@/plugins/buried'

const langMap = {
  'zh-CN': zhCn,
  'zh-TW': zhTw,
  en,
}

const locale = computed(() => {
  return langMap[i18n.locale || 'en']
})

provide('checkAgent', async (callback) => {
  const data = await axios.get('api/tcm/agent/agentCount')
  if (data.agentRunningCount || data.agentRunningCount > 0) {
    callback?.()
  } else {
    ElMessage.error(i18n.t('agent_error_check'))
    throw new Error(i18n.t('agent_error_check'))
  }
})
provide('buried', buried)
provide('lockedFeature', {})
provide('openLocked', () => {})

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
  nextTick(() => {
    initMenuTour()
  })
}
const waitForElement = (selector, callback) => {
  const observer = new MutationObserver((mutationsList, observer) => {
    if (document.querySelector(selector)) {
      observer.disconnect()
      callback()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

let menuTour

const initMenuTour = () => {
  const domain =
    !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en'
      ? 'https://docs.tapdata.io/'
      : 'https://docs.tapdata.net/'

  const steps = [
    {
      element: '#menu-Instance',
      popover: {
        showButtons: ['next', 'previous'],
        description: `${this.$t(
          'menu_tour_instance',
        )}，<a href="${domain}quick-start/install/install-tapdata-agent/" target="_blank">${this.$t(
          'menu_tour_instance_link',
        )}</a>`,
      },
    },
    {
      element: '#menu-connections',
      popover: {
        showButtons: ['next', 'previous'],
        description: this.$t('menu_tour_connection'),
      },
    },
    {
      element: '#task-list-create',
      popover: {
        showButtons: ['next', 'previous'],
        description: this.$t('menu_tour_create_task'),
      },
    },
  ]

  const targetElement = document.querySelector(steps[0].element)

  menuTour = driver({
    overlayOpacity: 0.5,
    allowClose: false,
    allowKeyboardControl: false,
    disableActiveInteraction: true,
    showProgress: true,
    prevBtnText: this.$t('public_button_previous'),
    nextBtnText: this.$t('public_button_next'),
    doneBtnText: this.$t('public_button_understand'),
    steps,
    popoverClass: 'menu-tour-popover p-4 rounded-lg',
    onPopoverRender: (popover, { config, state }) => {},
    onHighlightStarted: (element, step, { state }) => {},
    onDestroyed: (el, step, options) => {},
  })

  if (targetElement) {
    this.startMenuTour()
  } else {
    this.waitForElement(steps[0].element, () => {
      setTimeout(() => {
        this.startMenuTour()
      }, 500)
    })
  }
}

const startMenuTour = async () => {
  if (route.name !== 'migrateList') {
    await router.push({ name: 'migrateList' })
  }
  menuTour.drive(0)
}

onMounted(() => {
  // const root = getCurrentInstance().appContext.config.globalProperties
  // const route = useRoute()
  // const unwatch = watch(route, async () => {
  //   unwatch()
  //   await nextTick()
  //   if (route.query?.tour) {
  //     const guide = await root.$axios.get('api/tcm/user_guide')
  //     // 查询是否有查看监控的行为
  //     const behavior = guide?.tour?.behavior
  //     if (behavior && behavior !== 'view-monitor') {
  //       store.commit('openCompleteReplicationTour')
  //       root.$axios.post('api/tcm/user_guide', {
  //         tour: {
  //           ...guide.tour,
  //           behavior: 'view-monitor',
  //           behaviorAt: Date.now(),
  //         },
  //       })
  //     }
  //   }
  // })
})
</script>

<template>
  <ElConfigProvider :locale="locale">
    <RouterView />

    <ReplicationTour
      :value="showReplicationTour"
      :finish="replicationTourFinish"
      @input="setShowReplicationTour"
      @start="handleStartTour"
      @finish="handleFinishTour"
    />

    <!--<CustomerSurvey :value="true"></CustomerSurvey>-->
  </ElConfigProvider>
</template>

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
