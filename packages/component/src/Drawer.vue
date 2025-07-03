<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
  }>(),
  {
    width: '400px',
  },
)

const visible = defineModel<boolean>()
</script>

<template>
  <el-drawer v-model="visible" :size="width" modal-class="bg-transparent">
    <template #header="scope">
      <slot name="header" v-bind="scope" />
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-drawer>
</template>
