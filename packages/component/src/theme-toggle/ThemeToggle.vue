<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const theme = useColorMode()

const changeTheme = (theme: string) => {
  theme.value = theme
}
</script>

<template>
  <ElDropdown class="btn" placement="bottom" :show-timeout="0">
    <el-button text size="large">
      <template #icon>
        <el-icon size="20"><i-lucide-sun /></el-icon>
      </template>
    </el-button>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="light">
          <el-icon class="mr-2"><i-lucide-sun /></el-icon>
          <span>浅色</span>
        </ElDropdownItem>
        <ElDropdownItem command="dark">
          <el-icon class="mr-2"><i-lucide-moon /></el-icon>
          <span>深色</span>
        </ElDropdownItem>
        <ElDropdownItem command="system">
          <el-icon class="mr-2"><i-lucide-monitor /></el-icon>
          <span>跟随系统</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
