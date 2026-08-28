<script setup lang="ts">
import Cookie from '@tap/shared/src/cookie'
import { useRoute, useRouter } from 'vue-router'
import Wrapper from './Wrapper.vue'

const router = useRouter()
const route = useRoute()

const isAdmin = Cookie.get('isAdmin') === '1'

const menus = [
  {
    icon: 'notice-system-notice',
    name: 'notify_system_notice',
    key: 'systemNotification',
    size: 20,
  },
  {
    icon: 'notice-user',
    name: 'audit_log',
    key: 'userNotification',
    size: 20,
    adminOnly: true,
  },
  {
    icon: 'warning',
    name: 'daas_notification_alarmnotification_gaojingtongzhi',
    key: 'alarmNotification',
    size: 20,
  },
  {
    icon: 'notice-system',
    name: 'daas_notification_center_xitonggaojing',
    key: 'systemAlarm',
    size: 20,
  },
].filter((menu) => !menu.adminOnly || isAdmin)

const handleSelectMenu = (name: string) => {
  router.push({
    name,
  })
}
</script>

<template>
  <Wrapper>
    <template #sidebar>
      <div style="flex: 0 0 220px" />
      <el-aside
        class="layout-side position-fixed"
        width="220px"
        style="margin-top: 64px"
      >
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
          <el-menu-item v-for="menu in menus" :key="menu.key" :index="menu.key">
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
