<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ quality?: string }>()
const label = computed(() =>
  ['GA', 'Beta', 'Alpha'].includes(props.quality || '') ? props.quality : '',
)
</script>

<template>
  <span v-if="label" class="connector-quality-badge">{{ label }}</span>
</template>

<style scoped>
.connector-quality-badge {
  position: absolute;
  top: 0;
  right: 0;
  height: 20px;
  line-height: 20px;
  padding: 0 8px 0 0;
  border-radius: 0 12px 0 0;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
}
.connector-quality-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -13px;
  width: 13px;
  height: 20px;
  background: var(--el-fill-color-light);
  --corner: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 20'%3E%3Cpath d='M0 0H13V20C9.98017 20 7.26458 18.1615 6.14305 15.3576L0 0Z' fill='black'/%3E%3C/svg%3E");
  -webkit-mask-image: var(--corner);
  mask-image: var(--corner);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
</style>
