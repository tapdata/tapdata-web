<script setup lang="ts">
import { Cookie } from '@tap/shared'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Sidebar from '@/layouts/Sidebar.vue'
import { SettingList } from '@/router/menu'
import Wrapper from './Wrapper.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()

const isMenuEnabled = computed(() => store.getters['feature/isMenuEnabled'])

const settingList = computed(() => {
  const list = []

  if (Cookie.get('isAdmin')) {
    list.push({
      icon: 'setting',
      name: 'account_systemSetting',
      key: 'settings',
      size: 20,
    })
  }

  return list.concat(
    SettingList.filter((item) => !item.hidden && isMenuEnabled.value(item.key)),
  )
})

const handleSelectMenu = (name: string) => {
  router.push({
    name,
  })
}
</script>

<template>
  <Wrapper>
    <template #sidebar>
      <el-aside class="layout-side" width="220px">
        <el-menu
          unique-opened
          class="flex flex-column flex-1 gap-2 border-end-0"
          :default-active="route.name"
          :collapse-transition="false"
          @select="handleSelectMenu"
        >
          <el-menu-item index="dashboard">
            <VIcon size="18">left</VIcon>
            <template #title>
              <span class="ml-2 fs-6 fw-sub">{{
                $t('public_button_back')
              }}</span>
            </template>
          </el-menu-item>
          <div class="px-4"><el-divider class="my-0" /></div>
          <el-menu-item
            v-for="menu in settingList"
            :key="menu.key"
            :index="menu.key"
          >
            <VIcon size="16" class="menu-icon">{{ menu.icon }}</VIcon>
            <template #title>
              <span class="ml-4 title">{{ $t(menu.name) }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
    </template>

    <template #content>
      <RouterView />
    </template>
  </Wrapper>
</template>
