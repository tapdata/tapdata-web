<script setup lang="ts">
import { STATUS_MAP } from '@tap/business/src/shared/task'
defineProps<{
  status: keyof typeof STATUS_MAP
}>()
</script>

<template>
  <el-tooltip :content="$t(STATUS_MAP[status].i18n)">
    <span
      class="rounded-pill w-2 h-2 flex-shrink-0"
      :class="`task-status-${status}`"
    />
  </el-tooltip>
</template>
