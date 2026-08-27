<script setup lang="ts">
defineOptions({ name: 'WorkflowStepTypeIcon' })

defineProps<{
  type: string
  size?: number
}>()
</script>

<template>
  <el-icon :size="size || 16">
    <i-lucide-play v-if="type === 'TASK_START'" />
    <i-lucide-square v-else-if="type === 'TASK_STOP'" />
    <i-lucide-search-check v-else-if="type === 'INSPECT_START'" />
    <i-lucide-git-compare v-else-if="type === 'INSPECT_DIFF'" />
    <i-lucide-wrench v-else-if="type === 'INSPECT_REPAIR'" />
    <i-lucide-clock v-else-if="type === 'WAIT'" />
    <i-lucide-filter v-else-if="type === 'CONDITION'" />
    <i-lucide-git-branch v-else-if="type === 'IF_ELSE'" />
    <i-lucide-bell v-else-if="type === 'ALARM'" />
    <i-lucide-webhook v-else-if="type === 'WEBHOOK'" />
    <i-lucide-code v-else-if="type === 'JAVASCRIPT'" />
    <i-lucide-git-commit-horizontal v-else />
  </el-icon>
</template>
