<script setup lang="ts">
import { onMounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/layouts/Sidebar.vue'
import { MENU as menuSetting } from '@/router/menu'
import Wrapper from './Wrapper.vue'

// Composition API setup
const route = useRoute()

// Reactive state
const isNotAside = ref(route?.meta?.isNotAside || false)
const activeMenu = ref('')
const IS_IFRAME = ref(Boolean(sessionStorage.getItem('IS_IFRAME') === 'true'))

// For getting active menu
const getActiveMenu = () => {
  const activeMap = {}
  const getMap = (menus) => {
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
  getMap(menuSetting)
  const matched = route.matched || []
  const activeRoute = matched.find((r) => activeMap[r.name])
  activeMenu.value = activeMap[activeRoute?.name] || ''
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
  getActiveMenu()
})

// Provide
provide('activeMenu', activeMenu)
</script>

<template>
  <Wrapper>
    <template #sidebar>
      <Sidebar v-if="!isNotAside && !IS_IFRAME" />
    </template>

    <template #content>
      <RouterView />
    </template>
  </Wrapper>
</template>
