<script setup lang="ts">
const props = defineProps<{
  tooltip: string
  enableTooltip: boolean
  readonly: boolean
  command: () => void
  isActive: boolean
  icon: string
}>()

const onClick = () => {
  props.command()
}
</script>

<template>
  <el-tooltip
    :content="tooltip"
    :show-after="350"
    :disabled="!enableTooltip || readonly"
    effect="dark"
    placement="top"
  >
    <el-button
      text
      :type="isActive ? 'primary' : undefined"
      :class="[{ 'is-active': isActive }, $attrs.class]"
      :disabled="readonly"
      @click="onClick"
    >
      <template #icon>
        <slot name="icon">
          <VIcon>{{ icon }}</VIcon>
        </slot>
      </template>
    </el-button>
  </el-tooltip>
</template>
