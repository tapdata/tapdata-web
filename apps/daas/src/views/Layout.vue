<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { licensesApi, settingsApi, timeStampApi, usersApi } from '@tap/api'
import { VIcon } from '@tap/component'
import {
  getCurrentLanguage,
  langMenu,
  setCurrentLanguage,
} from '@tap/i18n/src/shared/util'
import Cookie from '@tap/shared/src/cookie'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'

import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, inject, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import logoImg from '@/assets/images/logo.svg'
import CustomerService from '@/components/CustomerService.vue'
import NewDataFlow from '@/components/newDataFlow.vue'
import {
  MENU as menuSetting,
  DropdownList as OriginalDropdownList,
} from '@/router/menu'

import { signOut as utilSignOut } from '../utils/util'

import NotificationPopover from './notification/NotificationPopover.vue'

// Extend the Window interface to add custom properties
declare global {
  interface Window {
    _TAPDATA_OPTIONS_: {
      logoUrl: string
      logoWidth?: string | number
      logoHeight?: string | number
      homeUrl?: string
    }
    $has?: (permission: string) => boolean
    getSettingByKey?: (key: string) => boolean | number
    iframeRouterChange?: (route: string) => void
    stateChange?: (key: string, data: any) => void
    getFormLocal?: (data: string) => any
    $getSettingByKey?: (key: string) => boolean
  }
}

// Types
interface MenuItem {
  name: string
  label: string
  icon?: string
  children?: MenuItem[]
  hidden?: boolean
  group?: boolean
  alias?: string
  code?: string
  parent?: string
  to?: { name: string }
}

interface MenuGroup {
  top: MenuItem[]
  bottom: MenuItem[]
}

// Composition API setup
const i18n = useI18n()
const router = useRouter()
const route = useRoute()
const store = useStore()

// Injected properties
const lockedFeature = inject<Record<string, boolean>>('lockedFeature')
const openLocked = inject<() => void>('openLocked')

// Constants
const isCommunity = import.meta.env.VUE_APP_MODE === 'community'
const isOP = import.meta.env.VUE_APP_MODE === 'OP'
const domain = i18n.locale.value === 'en' ? 'io' : 'net'

// Reactive state
const appVersion = ref('')
const logoUrl = ref(window._TAPDATA_OPTIONS_.logoUrl)
const languages = ref(langMenu)
const currentLang = ref(getCurrentLanguage())
const settingCode = ref(
  Object.prototype.hasOwnProperty.call(window, '$has') &&
    window.$has?.('system_settings') &&
    window.$has?.('system_settings_menu'),
)
const menus = ref<MenuItem[]>([])
const menusGroup = ref<MenuGroup>({
  top: [],
  bottom: [],
})
const userName = ref('')
const email = ref('')
const dialogVisible = ref(false)
const isShowCustomerService = ref(false)
const licenseExpire = ref<string | number>('')
const licenseExpireVisible = ref(false)
const licenseExpireDate = ref('')
const isCollapse = ref(false)
const isNotAside = ref(route?.meta?.isNotAside || false)
const activeMenu = ref('')
const IS_IFRAME = ref(sessionStorage.getItem('IS_IFRAME') === 'true')
const showHelp = ref(
  !import.meta.env.VUE_APP_HIDE_QA_AND_HELP &&
    window.getSettingByKey?.('SHOW_QA_AND_HELP'),
)
const showHome = ref(
  !import.meta.env.VUE_APP_HIDE_HOME_MENU &&
    window.getSettingByKey?.('SHOW_HOME_BUTTON'),
)
const showLanguage = ref(
  !import.meta.env.VUE_APP_HIDE_LANGUAGE &&
    window.getSettingByKey?.('SHOW_LANGUAGE'),
)
const showSetting = ref(
  !import.meta.env.VUE_APP_HIDE_SETTING_BUTTON &&
    window.getSettingByKey?.('SHOW_SETTING_BUTTON') &&
    (window.$has?.('home_notice_settings') ||
      (window.$has?.('system_settings') &&
        window.$has?.('system_settings_menu'))),
)

// Getters
const isMenuEnabled = computed(() => store.getters['feature/isMenuEnabled'])
const versionName = computed(() => store.getters['feature/versionName'])

// Computed properties
const dropdownListComputed = computed(() => {
  return OriginalDropdownList.filter(
    (item) => !item.hidden && (showHome.value || item.name !== 'home'),
  )
})

const logoStyle = computed(() => {
  const width = window._TAPDATA_OPTIONS_.logoWidth
  const height = window._TAPDATA_OPTIONS_.logoHeight
  return {
    width: width && (!Number.isNaN(Number(width)) ? `${width}px` : width),
    height: height && (!Number.isNaN(Number(height)) ? `${height}px` : height),
  }
})

// Add computed properties for window methods used in template
const showNotification = computed(() => {
  return window.getSettingByKey && window.getSettingByKey('SHOW_NOTIFICATION')
})

const showQaAndHelp = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_QA_AND_HELP &&
    window.getSettingByKey?.('SHOW_QA_AND_HELP')
  )
})

const showHomeButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_HOME_MENU &&
    window.getSettingByKey?.('SHOW_HOME_BUTTON')
  )
})

const showLanguageButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_LANGUAGE &&
    window.getSettingByKey?.('SHOW_LANGUAGE')
  )
})

const showSettingButton = computed(() => {
  return (
    !import.meta.env.VUE_APP_HIDE_SETTING_BUTTON &&
    window.getSettingByKey?.('SHOW_SETTING_BUTTON') &&
    (window.$has?.('home_notice_settings') ||
      (window.$has?.('system_settings') &&
        window.$has?.('system_settings_menu')))
  )
})

const showDkVersion = computed(() => {
  return window.getSettingByKey?.('SHOW_DK_VERSION')
})

const showLicense = computed(() => {
  return (
    import.meta.env.VUE_APP_MODE !== 'community' &&
    window.getSettingByKey?.('SHOW_LICENSE')
  )
})

// Methods
const getAppVersion = async () => {
  try {
    const data = await settingsApi.getAppVersion()
    appVersion.value = data.toString()
  } catch (error) {
    console.error('Error fetching app version:', error)
  }
}

const getActiveMenu = () => {
  const activeMap: Record<string, string> = {}
  const getMap = (menus: any[]) => {
    menus.forEach((item) => {
      if (item?.children?.length) {
        getMap(item.children)
      } else {
        // parent 是用来匹配菜单是否激活的，比如函数管理的详情页，也属于函数管理，菜单也应该处于激活状态
        // 之所以使用parent是因为管理的列表页面使用的也是子路由的，比如连接管理使用的是connectionList，而不是connection
        activeMap[item.parent || item.name] = item.name
      }
    })
  }
  getMap(menuSetting as any[])
  const matched = route.matched || []
  const activeRoute = matched.find((r) => activeMap[r.name as string])
  activeMenu.value = activeMap[activeRoute?.name as string] || ''
}

const getMenus = (hideMenuMap: Record<string, boolean> = {}) => {
  let permissions: any[] = []
  const permissionsStr = sessionStorage.getItem('tapdata_permissions')
  if (permissionsStr) {
    try {
      permissions = JSON.parse(permissionsStr)
    } catch (error) {
      console.error('Failed to parse permissions', error)
    }
  }

  const routerMap: Record<string, any> = {}
  const routes = router.options.routes

  const getRoutesMap = (routeList: any[]) => {
    routeList.forEach((r) => {
      routerMap[r.name] = r
      if (r.children) {
        getRoutesMap(r.children)
      }
    })
  }
  getRoutesMap(routes as any[])

  const formatMenu = (items: any[]): MenuItem[] => {
    return items.map((item) => {
      const route = routerMap[item.name]
      const menu = item as MenuItem
      const label = menu.alias ? menu.alias : menu.label

      if (route) {
        menu.to = { name: route.name }
        menu.label = i18n.t(label || route.meta.title)
        menu.code = route.meta.code
      } else {
        menu.label = i18n.t(label)
      }

      menu.hidden =
        menu.hidden ||
        hideMenuMap[menu.name] ||
        (menu.code && !permissions.some((p: any) => p.code === menu.code)) ||
        !isMenuEnabled.value(menu.name) // 添加基于 license features 的菜单控制

      if (!menu.hidden && menu.children) {
        menu.children = formatMenu(menu.children)
        if (menu.children.every((m) => m.hidden)) {
          menu.hidden = true
        }
      }

      return menu
    })
  }

  const menusCopy = JSON.parse(JSON.stringify(menuSetting))
  menus.value = formatMenu(menusCopy)

  menusGroup.value.top = []
  menusGroup.value.bottom = []
  menus.value.forEach((m) => {
    if (m.group) {
      menusGroup.value.bottom.push(m)
    } else {
      menusGroup.value.top.push(m)
    }
  })
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
    case 'newDataFlow':
      dialogVisible.value = true
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
        window._TAPDATA_OPTIONS_.homeUrl || `https://tapdata.${domain}/`,
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

const menuHandler = (name: string) => {
  if (lockedFeature?.[name]) {
    openLocked?.()
    return
  }

  if (route.name === name) {
    return
  }
  router.push({
    name,
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

// Watch for route changes
watch(
  () => route,
  (newRoute) => {
    isNotAside.value = newRoute?.meta?.isNotAside || false
    getActiveMenu()
  },
  { deep: true },
)

// Setup the component
onMounted(() => {
  getMenus()
  getAppVersion()
  getActiveMenu()

  userName.value =
    Cookie.get('username') || Cookie.get('email')?.split('@')?.[0] || ''
  email.value = Cookie.get('email')

  window.iframeRouterChange = (route) => {
    router.push(route)
  }

  window.stateChange = (key, data) => {
    store.commit(key, data)
  }

  window.getFormLocal = (data) => {
    return store.state[data]
  }

  if (
    import.meta.env.VUE_APP_MODE !== 'community' &&
    window.getSettingByKey?.('SHOW_LICENSE')
  ) {
    getLicense()
  }
})

// Provide
provide('activeMenu', activeMenu)
</script>

<template>
  <el-container direction="vertical" class="layout">
    <div class="layout-bg">
      <div class="layout-bg-main" />
      <div
        class="layout-bg-submain"
        style="
          background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);
        "
      />
      <div class="layout-bg-layer layout-bg-tr" />
      <div class="layout-bg-layer layout-bg-bl" />
    </div>
    <ElHeader v-if="!IS_IFRAME" class="flex align-center gap-4" height="60px">
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
        <span v-if="licenseExpireVisible" class="expire-msg">{{
          $t('app_license_expire_warning', [licenseExpire])
        }}</span>
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
    <ElContainer class="layout-content position-relative">
      <el-scrollbar class="layout-side-scrollbar">
        <ElAside
          v-if="!isNotAside && !IS_IFRAME"
          class="layout-side"
          width="220px"
        >
          <ElMenu
            unique-opened
            class="flex flex-column flex-1 gap-2 border-end-0"
            :default-active="activeMenu"
            :collapse="isCollapse"
            :collapse-transition="false"
            @select="menuHandler"
          >
            <template v-for="menu in menusGroup.top" :key="menu.name">
              <ElSubMenu
                v-if="menu.children && !menu.hidden"
                :index="menu.name"
              >
                <template #title>
                  <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
                  <span class="ml-4 title">{{ menu.label }}</span>
                </template>
                <template v-for="cMenu in menu.children" :key="cMenu.name">
                  <ElMenuItem
                    v-if="!cMenu.hidden"
                    :index="cMenu.name"
                    :class="{
                      'is-locked': lockedFeature[cMenu.name],
                    }"
                  >
                    <div class="submenu-item">{{ cMenu.label }}</div>

                    <VIcon
                      v-if="lockedFeature[cMenu.name]"
                      class="ml-2"
                      size="24"
                      >lock-circle</VIcon
                    >
                  </ElMenuItem>
                </template>
              </ElSubMenu>
              <ElMenuItem v-else-if="!menu.hidden" :index="menu.name">
                <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
                <template #title>
                  <span class="ml-4 title">{{ menu.label }}</span>
                </template>
              </ElMenuItem>
            </template>
            <div class="flex-grow-1 border-bottom" />
            <template v-for="menu in menusGroup.bottom" :key="menu.name">
              <ElSubMenu
                v-if="menu.children && !menu.hidden"
                :index="menu.name"
              >
                <template #title>
                  <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
                  <span class="ml-4 title">{{ menu.label }}</span>
                </template>
                <template v-for="cMenu in menu.children" :key="cMenu.name">
                  <ElMenuItem
                    v-if="!cMenu.hidden"
                    :index="cMenu.name"
                    :class="{
                      'is-locked': lockedFeature[cMenu.name],
                    }"
                  >
                    <div class="submenu-item">{{ cMenu.label }}</div>

                    <VIcon
                      v-if="lockedFeature[cMenu.name]"
                      class="ml-2"
                      size="24"
                      >lock-circle</VIcon
                    >
                  </ElMenuItem>
                </template>
              </ElSubMenu>
              <ElMenuItem v-else-if="!menu.hidden" :index="menu.name">
                <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
                <template #title>
                  <span class="ml-4 title">{{ menu.label }}</span>
                </template>
              </ElMenuItem>
            </template>
          </ElMenu>
        </ElAside>
      </el-scrollbar>
      <ElMain class="layout-main">
        <RouterView />
      </ElMain>
    </ElContainer>
    <CustomerService v-model:value="isShowCustomerService" />
    <NewDataFlow v-model:dialog-visible="dialogVisible" />
  </el-container>
</template>

<style lang="scss" scoped>
.layout {
  height: 100%;

  .layout-bg {
    position: fixed;
    inset: 0;
    z-index: -10;

    &-main {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(
        to right bottom,
        rgb(248, 250, 252),
        rgb(241, 245, 249),
        rgb(239, 246, 255)
      );
    }

    &-submain {
      position: absolute;
      inset: 0;
      opacity: 0.03;
    }

    &-layer {
      position: absolute;
      width: 24rem;
      height: 24rem;
      border-radius: 9999px;
      filter: blur(64px);
    }

    &-tr {
      top: -6rem;
      right: -6rem;
      background-image: linear-gradient(
        to right bottom,
        rgba(219, 234, 254, 0.3),
        rgba(199, 210, 254, 0.3)
      );
    }

    &-bl {
      left: -8rem;
      bottom: -8rem;
      background-image: linear-gradient(
        to right top,
        rgba(219, 234, 254, 0.2),
        rgba(243, 232, 255, 0.2)
      );
    }
  }

  .layout-content {
    flex-grow: 1;
    min-height: 0;
  }

  .layout-side-scrollbar {
    flex-shrink: 0;
    :deep(.el-scrollbar__view) {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .layout-main {
    --el-main-padding: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
    min-width: 0;
    overflow: unset; // 避免box-shadow被截断
  }

  .layout-side {
    --el-menu-bg-color: transparent;
    --el-menu-item-height: 40px;
    --el-menu-sub-item-height: 40px;
    --el-menu-hover-bg-color: var(--fill-hover);

    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 16px 82px;

    :deep(.el-menu) {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    :deep(.el-menu-item.is-active) {
      background-color: var(--primary-hover-light);
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      border-radius: 8px;
    }

    :deep(.el-sub-menu__title + .el-menu) {
      margin-top: 8px;
      padding-inline-start: 10px;
    }
  }
}
</style>
