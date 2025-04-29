<script setup lang="ts">
import { User, WarningFilled } from '@element-plus/icons-vue'
import { licensesApi, settingsApi, timeStampApi, usersApi } from '@tap/api'
import { VIcon } from '@tap/component'
import { useI18n } from '@tap/i18n'
import {
  getCurrentLanguage,
  langMenu,
  setCurrentLanguage,
} from '@tap/i18n/src/shared/util'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'

import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import logoImg from '@/assets/images/logo.svg'
import { DropdownList as OriginalDropdownList } from '@/router/menu'
import { signOut as utilSignOut } from '@/utils/util'
import NotificationPopover from '@/views/notification/NotificationPopover.vue'

// Composition API setup
const i18n = useI18n()
const router = useRouter()
const store = useStore()

// Injected properties
const hasPermissionByCode = inject<(string) => boolean>('hasPermissionByCode')

// Constants
const isCommunity = import.meta.env.VUE_APP_MODE === 'community'
const isOP = import.meta.env.VUE_APP_MODE === 'OP'
const domain = i18n.locale.value === 'en' ? 'io' : 'net'

// Reactive state
const logoUrl = ref(window._TAPDATA_OPTIONS_?.logoUrl || '')
const languages = ref(langMenu)
const currentLang = ref(getCurrentLanguage())
const settingCode = ref(
  hasPermissionByCode?.('system_settings') &&
    hasPermissionByCode?.('system_settings_menu'),
)
const userName = ref('')
const email = ref('')
const dialogVisible = ref(false)
const isShowCustomerService = ref(false)
const licenseExpire = ref<string | number>('')
const licenseExpireVisible = ref(false)
const licenseExpireDate = ref('')
const IS_IFRAME = ref(sessionStorage.getItem('IS_IFRAME') === 'true')

// Compute properties for UI visibility
const showNotification = computed(() => {
  return window.getSettingByKey && window.getSettingByKey('SHOW_NOTIFICATION')
})

const showQaAndHelp = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_QA_AND_HELP &&
    window.getSettingByKey?.('SHOW_QA_AND_HELP')
  )
})

const showSettingButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_SETTING_BUTTON &&
    window.getSettingByKey?.('SHOW_SETTING_BUTTON') &&
    (hasPermissionByCode?.('home_notice_settings') ||
      (hasPermissionByCode?.('system_settings') &&
        hasPermissionByCode?.('system_settings_menu')))
  )
})

const showLanguageButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_LANGUAGE &&
    window.getSettingByKey?.('SHOW_LANGUAGE')
  )
})

// Getters
const versionName = computed(() => store.getters['feature/versionName'])
const appVersion = computed(() => store.state.appVersion)

// Computed properties
const dropdownListComputed = computed(() => {
  return OriginalDropdownList.filter(
    (item) => !item.hidden && (showHomeButton.value || item.name !== 'home'),
  )
})

const logoStyle = computed(() => {
  const width = window._TAPDATA_OPTIONS_?.logoWidth
  const height = window._TAPDATA_OPTIONS_?.logoHeight
  return {
    width: width && (!Number.isNaN(Number(width)) ? `${width}px` : width),
    height: height && (!Number.isNaN(Number(height)) ? `${height}px` : height),
  }
})

const showHomeButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_HOME_MENU &&
    window.getSettingByKey?.('SHOW_HOME_BUTTON')
  )
})

// Methods
const getAppVersion = async () => {
  try {
    const data = await settingsApi.getAppVersion()
    store.commit('SET_APP_VERSION', data.toString())
  } catch (error) {
    console.error('Error fetching app version:', error)
  }
}

const command = (command: string) => {
  switch (command) {
    case 'account':
      router.push({
        name: 'settingCenter',
      })
      break
    case 'setting':
      router.push({
        name: 'notificationSetting',
      })
      break
    case 'help':
      window.open(`${location.origin}/docs/`)
      break
    case 'question':
      isShowCustomerService.value = !isShowCustomerService.value
      break
    case 'version':
      if (window.getSettingByKey?.('SHOW_DK_VERSION')) {
        ElMessage.info({
          dangerouslyUseHTMLString: true,
          message: 'DK_VERSION_1</br>DK_VERSION_2',
        })
      } else {
        ElMessage.info(appVersion.value)
      }
      break
    case 'license':
      router.push({
        name: 'License',
      })
      break
    case 'home':
      window.open(
        window._TAPDATA_OPTIONS_?.homeUrl || `https://tapdata.${domain}/`,
        '_blank',
      )
      break
    case 'signOut':
      ElMessageBox.confirm(i18n.t('app_signOutMsg'), i18n.t('app_signOut'), {
        type: 'warning',
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        signOut()
      })
      break
    case 'settings':
      router.push({
        name: 'settings',
      })
      break
    default:
      break
  }
}

const signOut = () => {
  usersApi.logout().then(() => {
    utilSignOut()
  })
}

const changeLanguage = (lang: string) => {
  setCurrentLanguage(lang, i18n)
  currentLang.value = lang
  location.reload()
}

const getLicense = async () => {
  let stime: any = ''
  try {
    const data = await timeStampApi.get()
    stime = data || Time.now()
  } catch (error) {
    console.error('Error fetching timestamp:', error)
    stime = Time.now()
  }

  licensesApi.expires({}).then((data: any) => {
    const expires_on = data?.data?.expires_on

    if (!expires_on) {
      licenseExpireVisible.value = false
      return
    }

    if (Cookie.get('isAdmin') === '1') {
      let endTime = Number(expires_on) - Number(stime)
      endTime = Math.floor(endTime / 1000 / 60 / 60 / 24) //相差天数
      const showDay = window.getSettingByKey?.('licenseNoticeDays') || 0
      licenseExpireVisible.value = Number(showDay) > endTime
      licenseExpire.value = endTime.toString()
    }
    licenseExpireDate.value = dayjs(expires_on).format('YYYY-MM-DD HH:mm:ss')
  })
}

// Setup the component
onMounted(() => {
  getAppVersion()

  userName.value =
    Cookie.get('username') || Cookie.get('email')?.split('@')?.[0] || ''
  email.value = Cookie.get('email')

  if (
    import.meta.env.VUE_APP_MODE !== 'community' &&
    window.getSettingByKey?.('SHOW_LICENSE')
  ) {
    getLicense()
  }
})

// Expose functions and values for parent component
defineExpose({
  isShowCustomerService,
  dialogVisible,
})
</script>

<template>
  <ElHeader v-if="!IS_IFRAME" class="flex align-center gap-4" height="64px">
    <a
      v-if="isOP"
      class="logo w-auto text-white flex align-center gap-2"
      href="/"
    >
      <img :src="logoImg" style="width: auto; height: 32px" />
      <el-divider direction="vertical" />
      <span class="fw-sub text-lg color-primary">{{ versionName }}</span>
    </a>
    <a v-else class="logo" href="/" :style="logoStyle">
      <img :src="logoUrl" />
    </a>
    <div class="flex gap-3 align-center ml-auto">
      <el-alert
        v-if="licenseExpireVisible"
        type="error"
        show-icon
        class="shadow-sm"
        :closable="false"
        :title="$t('app_license_expire_warning', [licenseExpire])"
      >
        <template #icon>
          <WarningFilled />
        </template>
      </el-alert>
      <ElButton v-if="isCommunity" id="add-jira-issue-btn" type="primary"
        ><VIcon>bug-outlined</VIcon> New Issue
      </ElButton>
      <NotificationPopover v-if="showNotification" class="ml-4" />
      <ElDropdown
        v-if="showQaAndHelp"
        class="btn"
        placement="bottom"
        command="help"
        :show-timeout="0"
        @command="command"
      >
        <el-button text size="large">
          <template #icon>
            <VIcon size="20">wenda</VIcon>
          </template>
        </el-button>

        <template #dropdown>
          <ElDropdownMenu class="no-triangle">
            <ElDropdownItem command="help">{{
              $t('app_document')
            }}</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <ElDropdown
        v-if="showSettingButton"
        class="btn"
        placement="bottom"
        :show-timeout="0"
        @command="command"
      >
        <el-button text size="large">
          <template #icon>
            <VIcon size="18">shezhi</VIcon>
          </template>
        </el-button>
        <template #dropdown>
          <ElDropdownMenu class="no-triangle">
            <ElDropdownItem
              v-if="settingCode && email === 'admin@admin.com'"
              command="settings"
              >{{ $t('page_title_setting') }}
            </ElDropdownItem>
            <ElDropdownItem
              v-readonlybtn="'home_notice_settings'"
              command="setting"
              >{{ $t('notify_setting') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <ElDropdown
        v-if="showLanguageButton"
        class="btn"
        placement="bottom"
        :show-timeout="0"
        @command="changeLanguage"
      >
        <el-button text size="large">
          <template #icon>
            <VIcon size="18">language_icon</VIcon>
          </template>
        </el-button>
        <template #dropdown>
          <ElDropdownMenu class="no-triangle">
            <ElDropdownItem
              v-for="(value, key) in languages"
              :key="key"
              :command="key"
            >
              <span v-if="currentLang === key" class="color-primary">{{
                value
              }}</span>
              <span v-else>{{ value }}</span>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <ElDivider direction="vertical" class="divider mx-0" />
      <ElDropdown
        class="menu-user btn"
        placement="bottom"
        :show-timeout="0"
        @command="command"
      >
        <el-button text size="large" style="line-height: 28px">
          <el-icon size="20"><User /></el-icon>
          <span>{{ userName }}</span>
        </el-button>
        <template #dropdown>
          <ElDropdownMenu class="no-triangle">
            <template v-for="item in dropdownListComputed" :key="item.name">
              <ElDropdownItem v-if="!item.route" :command="item.name">{{
                $t(item.label)
              }}</ElDropdownItem>
              <ElDropdownItem v-else @click="router.push(item.route)">{{
                $t(item.label)
              }}</ElDropdownItem>
            </template>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </ElHeader>
</template>

<style lang="scss" scoped>
.divider {
  height: 1.8em;
  border-color: rgba(60, 60, 67, 0.12);
}

.logo {
  display: block;
  width: 145px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.expire-msg {
  color: #ff4d4f;
}

.gradient-text {
  background: linear-gradient(90deg, #007cf0 0%, #3b47e5 100%);
  background-clip: text;
  color: transparent;
}
</style>
