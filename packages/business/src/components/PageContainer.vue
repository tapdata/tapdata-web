<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const breadcrumbData = ref([])
const isHidden = ref(false)

const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false,
  },
  contentMode: {
    type: String,
    default: 'table', // full/auto/table
  },
})

const containerClass = computed(() => {
  return props.contentMode === 'full' ? '' : 'p-6 gap-4'
})

const contentClass = computed(() => {
  const map = {
    // table: 'pb-6 flex-1 min-h-0',
    table: isDaas ? 'flex-1 min-h-0' : 'flex-1 min-h-0',
    full: 'flex-1 min-h-0 overflow-auto',
  }
  return map[props.contentMode]
  // return props.contentMode === 'full' ? 'overflow-hidden bg-white shadow-card' : ''
})

const headerClass = isDaas ? 'border-bottom' : ''

const getBreadcrumb = () => {
  const matched = isDaas ? route.matched.slice(1) : route.matched
  const data = []
  let _isHidden = false
  if (matched.length) {
    matched.forEach((route) => {
      _isHidden = Boolean(route.meta?.hideTitle)
      if (/^\/.*\/$/.test(route.path)) {
        data.pop()
      }
      let to = {
        name:
          route.name === router.currentRoute.value.name
            ? null
            : ['settingCenter', 'notification'].includes(route.name)
              ? 'layout'
              : route.name,
      }
      if (route.meta?.doNotJump) {
        to = null
      }
      const titleKey = route.meta?.title
      !_isHidden &&
        data.push({
          name: titleKey ? t(titleKey) : '',
          to,
        })
    })
  }
  isHidden.value = Boolean(_isHidden)
  breadcrumbData.value = data
}

watch(() => route.name, getBreadcrumb)

getBreadcrumb()
</script>

<template>
  <div
    class="flex flex-column h-100 page-container bg-white rounded-xl overflow-hidden shadow-sm"
    :class="containerClass"
  >
    <div v-if="!hideHeader" class="page-header" :class="headerClass">
      <!-- <ElBreadcrumb
        v-if="breadcrumbData.length > 1"
        separator-class="el-icon-arrow-right"
      >
        <ElBreadcrumbItem
          v-for="item in breadcrumbData"
          :key="item.name"
          :to="item.to"
        >
          {{ item.name }}
        </ElBreadcrumbItem>
      </ElBreadcrumb> -->
      <div class="flex align-items-center bg-white rounded-lg">
        <slot name="title">
          <span class="fs-5 font-color-dark">{{ $t($route.meta.title) }}</span>
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

    <div class="page-content" :class="contentClass">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb {
  height: 50px;
  line-height: 50px;
  margin-left: 24px;
  .el-breadcrumb__item:last-child .el-breadcrumb__inner,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner a:hover,
  .el-breadcrumb__item:last-child .el-breadcrumb__inner:hover {
    color: map.get($fontColor, normal) !important;
  }
}
</style>
