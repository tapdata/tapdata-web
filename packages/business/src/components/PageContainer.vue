<script setup lang="ts">
import { computed, h, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = inject('activeMenu', {})

const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'table', // full/auto/table/blank
  },
  headerClass: String,
  containerClass: String,
  contentClass: String,
  ui: {
    type: Object,
    default: () => ({
      container: {},
      header: {},
      content: {},
    }),
  },
})

const containerClass = computed(() => {
  if (props.mode === 'blank') return props.containerClass || ''

  const baseClasses = {
    default: 'bg-white rounded-xl shadow-sm',
    plain: 'bg-transparent',
  }
  const base = baseClasses[props.mode] || baseClasses.default
  const paddingClasses = {
    default: 'px-6 py-5 gap-4',
    full: '',
    auto: 'gap-4',
  }
  const paddingClass = paddingClasses[props.mode] ?? paddingClasses.default

  return props.containerClass || `${base} ${paddingClass}`
})

const headerClass = computed(() => {
  const baseClasses = {
    default: '',
    plain: '',
    auto: 'px-6 pt-5',
  }

  return props.headerClass ?? baseClasses[props.mode] ?? baseClasses.default
})

const contentClass = computed(() => {
  const modeClasses = {
    table: 'flex-1 min-h-0',
    full: 'flex-1 min-h-0 overflow-auto',
    blank: 'flex-1 min-h-0 overflow-auto',
    auto: 'flex-1 min-h-0 overflow-auto px-6 pb-5',
  }

  return props.contentClass || modeClasses[props.mode] || modeClasses.table
})

const showBackBtn = computed(() => {
  if (!activeMenu.value) return false

  if (activeMenu.value.startsWith('/')) {
    return route.path !== activeMenu.value
  }

  return route.name !== activeMenu.value
})

const handleBack = () => {
  if (activeMenu.value.startsWith('/')) {
    return router.push(activeMenu.value)
  }

  router.push({
    name: activeMenu.value,
  })
}
</script>

<template>
  <div
    class="flex flex-column h-100 page-container overflow-hidden"
    :class="containerClass"
    :style="ui.container"
  >
    <div
      v-if="!hideHeader"
      class="page-header"
      :class="headerClass"
      :style="ui.header"
    >
      <div class="flex align-items-center bg-white rounded-lg">
        <el-button v-if="showBackBtn" text class="mr-1" @click="handleBack">
          <template #icon>
            <VIcon>left</VIcon>
          </template>
        </el-button>

        <slot name="title">
          <span class="fs-5 font-color-dark lh-8 ellipsis">{{
            $t($route.meta.title)
          }}</span>
        </slot>

        <slot name="left-actions" />
        <template v-if="$route.meta.desc">
          <ElDivider class="mx-4" direction="vertical" />
          <span class="flex align-items-center fs-7 font-color-sslight">
            <template v-if="typeof $route.meta.desc === 'function'">
              <component :is="() => h('span', {}, [$route.meta.desc(h, $t)])" />
            </template>
            <template v-else>
              {{ $t($route.meta.desc) }}
            </template>
          </span>
        </template>

        <div class="flex-1" />
        <slot name="actions" />
      </div>
    </div>

    <div class="page-content" :class="contentClass" :style="ui.content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  &.bg-transparent {
    box-shadow: none;
  }

  &.minimal {
    border-radius: 0;
  }
}

.page-header {
  &.border-bottom {
    border-bottom: 1px solid var(--el-border-color-light);
  }
}
</style>
