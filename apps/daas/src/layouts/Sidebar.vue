<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, inject, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { MENU as menuSetting } from '@/router/menu'

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
const activeMenu = inject<Ref<string>>('activeMenu', ref(''))

// Reactive state
const menus = ref<MenuItem[]>([])
const menusGroup = ref<MenuGroup>({
  top: [],
  bottom: [],
})

// Getters
const isMenuEnabled = computed(() => store.getters['feature/isMenuEnabled'])

// Methods
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
        menu.label = i18n.t(label || route.meta?.title || '')
        menu.code = route.meta?.code
      } else {
        menu.label = i18n.t(label || '')
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

// Setup the component
onMounted(() => {
  getMenus()
})
</script>

<template>
  <el-scrollbar class="layout-side-scrollbar">
    <ElAside class="layout-side" width="220px">
      <ElMenu
        unique-opened
        class="flex flex-column flex-1 gap-2 border-end-0"
        :default-active="activeMenu"
        :collapse-transition="false"
        @select="menuHandler"
      >
        <template v-for="menu in menusGroup.top" :key="menu.name">
          <ElSubMenu v-if="menu.children && !menu.hidden" :index="menu.name">
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

                <VIcon v-if="lockedFeature[cMenu.name]" class="ml-2" size="24"
                  >lock-circle</VIcon
                >
              </ElMenuItem>
            </template>
          </ElSubMenu>
          <ElMenuItem v-else-if="!menu.hidden" :index="menu.name">
            <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
            <template #title>
              <span class="ml-4 title">{{ menu.label }}</span>
              <VIcon v-if="lockedFeature[menu.name]" class="ml-2" size="24"
                >lock-circle</VIcon
              >
            </template>
          </ElMenuItem>
        </template>
        <div class="flex-grow-1 border-bottom" />
        <template v-for="menu in menusGroup.bottom" :key="menu.name">
          <ElSubMenu v-if="menu.children && !menu.hidden" :index="menu.name">
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

                <VIcon v-if="lockedFeature[cMenu.name]" class="ml-2" size="24"
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
</template>

<style lang="scss" scoped>
.layout-side-scrollbar {
  flex-shrink: 0;
  :deep(.el-scrollbar__view) {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
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
</style>
