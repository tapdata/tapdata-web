<script setup lang="ts">
import { t } from '@tap/i18n'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import VIcon from '../../base/VIcon.vue'

// Props interface
interface Props {
  value?: string
  readonly?: boolean
  maxWidth?: string | number
  minWidth?: string | number
  placeholder?: string
  hiddenIcon?: boolean
  maxlength?: number
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  value: '',
  readonly: false,
  placeholder: () => t('public_input_placeholder'),
  hiddenIcon: false,
  maxlength: 30,
  minWidth: 32,
})

// Emits
const emit = defineEmits<{
  'update:value': [value: string]
  change: [value: string]
}>()

// Template refs
const input = ref<HTMLInputElement>()
const shadow = ref<HTMLDivElement>()
const container = ref<HTMLDivElement>()

// State
const isVisible = ref(false)
const hasCalculatedWidth = ref(false)

// Computed properties
const style = computed(() => {
  const maxWidth = props.maxWidth
  return {
    maxWidth:
      maxWidth && !Number.isNaN(Number(maxWidth)) ? `${maxWidth}px` : maxWidth,
  }
})

const inputStyle = computed(() => {
  const width = props.minWidth
  return {
    minWidth: width && !Number.isNaN(Number(width)) ? `${width}px` : width,
  }
})

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value.trim()
  emit('update:value', val)
  emit('change', val)
}

const handleFocusInput = () => {
  input.value?.focus()
}

// 检查元素是否可见的轻量级方法
const checkVisibility = () => {
  if (!container.value) return false
  return container.value.offsetParent !== null
}

// 计算输入框宽度
const calculateWidth = () => {
  if (!input.value || !shadow.value) return

  const minWidth = Number(props.minWidth) || 32

  if (isVisible.value) {
    // 可见时：使用 shadow 元素计算的实际宽度
    const shadowWidth = shadow.value.clientWidth
    const finalWidth = Math.max(shadowWidth, minWidth)
    input.value.style.width = `${finalWidth}px`
    hasCalculatedWidth.value = true
  } else {
    // 不可见时：使用最小宽度
    input.value.style.width = `${minWidth}px`
    hasCalculatedWidth.value = false
  }
}

// 优化的样式更新方法
const updateStyle = (forceUpdate = false) => {
  nextTick(() => {
    if (!input.value || !shadow.value || !container.value) return

    const wasVisible = isVisible.value
    isVisible.value = checkVisibility()

    // 强制更新或可见性发生变化时重新计算
    if (
      forceUpdate ||
      wasVisible !== isVisible.value ||
      !hasCalculatedWidth.value
    ) {
      calculateWidth()
    }
  })
}

// 使用 ResizeObserver 替代 IntersectionObserver（更高效）
let resizeObserver: ResizeObserver | null = null

const setupVisibilityObserver = () => {
  if (!container.value) return

  // 使用 ResizeObserver 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    // 当容器尺寸变化时，检查是否变为可见
    const wasVisible = isVisible.value
    isVisible.value = checkVisibility()

    if (!wasVisible && isVisible.value) {
      // 从不可见变为可见时，重新计算宽度
      calculateWidth()
    }
  })

  resizeObserver.observe(container.value)
}

// Watchers
watch(
  () => props.value,
  () => {
    // 内容变化时强制更新宽度
    updateStyle(true)
  },
  {
    deep: true,
    immediate: true,
  },
)

// 组件挂载时设置观察器
onMounted(() => {
  setupVisibilityObserver()
  // 初始检查
  updateStyle()
})

// 组件卸载时清理观察器
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <div
    ref="container"
    class="text-editable-wrap inline-flex position-relative align-center"
    :style="style"
  >
    <div class="text-editable min-w-0">
      <input
        ref="input"
        :value="props.value"
        :readonly="props.readonly"
        :placeholder="props.placeholder"
        :style="inputStyle"
        :maxlength="props.maxlength"
        @input="handleInput"
        @change="handleChange"
      />
      <div ref="shadow" class="text-editable-shadow">
        {{ props.value || props.placeholder }}
      </div>
    </div>
    <VIcon
      v-if="!props.readonly"
      v-show="!props.hiddenIcon"
      class="text-editable-icon ml-2 flex-shrink-0"
      size="14"
      @click="handleFocusInput"
      >edit-outline</VIcon
    >
  </div>
</template>

<style lang="scss" scoped>
.text-editable-wrap {
  .text-editable {
    padding: 2px 4px;
    height: 28px;
    font-size: 14px;
    border: 1px solid transparent;
    border-radius: var(--el-border-radius-base);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    &:hover,
    &:focus-within {
      border-color: var(--color-primary);
    }
    input {
      max-width: 100%;
      outline: none;
      box-shadow: none;
      color: inherit;
      background: 0 0;
      line-height: 22px;
      border: none;
    }
    &-shadow {
      position: absolute;
      height: 0;
      overflow: scroll;
      white-space: pre;
      visibility: hidden;
    }
    &-icon:hover {
      color: var(--color-primary);
    }
  }
}
</style>
