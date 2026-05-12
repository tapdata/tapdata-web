<script setup lang="ts">
import { computed } from 'vue'
import { MILESTONE_TYPE as STATUS_MAP } from '../shared'

defineOptions({ name: 'SyncStatus' })

const props = defineProps<{
  status?: string
  delayTime?: number
}>()

const item = computed(() =>
  props.status
    ? STATUS_MAP[props.status as keyof typeof STATUS_MAP]
    : undefined,
)
</script>

<template>
  <div>
    <div v-if="item" class="inline-flex align-center gap-1">
      <span>
        {{ $t(item.i18n) }}
      </span>
    </div>
    <span v-else>-</span>
  </div>
</template>

<style lang="scss" scoped>
.status-info {
  color: #86909c;
}
.status-primary {
  color: #3b47e5;
}
.status-success {
  color: #00b42a;
}
</style>
