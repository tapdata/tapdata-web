<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const theme = useColorMode({
  emitAuto: true,
})

console.log(theme.value)

const changeTheme = (mode: 'light' | 'dark' | 'auto') => {
  theme.value = mode
}
</script>

<template>
  <ElDropdown
    class="btn"
    placement="bottom"
    :show-timeout="0"
    @command="changeTheme"
  >
    <el-button text size="large">
      <template #icon>
        <el-icon size="20"><i-lucide-sun /></el-icon>
      </template>
    </el-button>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'light' }"
          command="light"
        >
          <el-icon><i-lucide-sun /></el-icon>
          <span>浅色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'dark' }"
          command="dark"
        >
          <el-icon><i-lucide-moon /></el-icon>
          <span>深色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'auto' }"
          command="auto"
        >
          <el-icon><i-lucide-monitor /></el-icon>
          <span>跟随系统</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
