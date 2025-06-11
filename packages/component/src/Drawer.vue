<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    width?: string
  }>(),
  {
    width: '400px',
  },
)

const visible = defineModel<boolean>('visible')
</script>

<template>
  <el-drawer v-model="visible" :size="width" modal-class="bg-transparent">
    <template #header>
      <slot name="header" />
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-drawer>
  <!-- <div
    v-show="visible"
    ref="drawer"
    class="drawer-wrapper"
    :style="{ width }"
  /> -->
</template>

<style lang="scss">
.drawer-wrapper {
  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 2001;
  height: 100%;
  background-color: map.get($bgColor, white);
  box-shadow:
    0 8px 10px -5px rgb(0 0 0 / 20%),
    0 16px 24px 2px rgb(0 0 0 / 14%),
    0 6px 30px 5px rgb(0 0 0 / 12%);
  overflow: auto;
  box-sizing: border-box;
}
</style>
