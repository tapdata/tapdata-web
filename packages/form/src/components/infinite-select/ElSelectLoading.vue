<!-- 监听 el-select 的滚动，并提供触底加载数据的回调 -->
<template>
  <el-option ref="el" class="el-select-loading" value="" v-show="hasMore">
    <template v-if="hasMore">
      <el-icon class="el-select-loading__icon"><ElIconLoading /></el-icon>
      <span class="el-select-loading__tips">{{ loadingText || '正在加载' }}</span>
    </template>
    <template v-else>{{ noMoreText || '到底了~' }}</template>
  </el-option>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ElOption } from 'element-plus'

interface Props {
  // 当前页码
  page: number
  // 是否加载中，用来过滤重复的加载
  loading: boolean
  // 加载中的提示文案
  loadingText?: string
  // 是否有更多数据可加载
  hasMore: boolean
  // 没有更多数据的提示文案
  noMoreText?: string
}

const props = defineProps<Props>()

interface Emits {
  (event: 'loadMore', data: number): any
}

const emit = defineEmits<Emits>()

const el = ref<typeof ElOption>()
const observer = ref<IntersectionObserver>()

// 组件加载成功，监听滚动
onMounted(() => {
  if (!el.value) {
    return
  }
  const callback: IntersectionObserverCallback = (entries) => {
    if (props.loading || !props.hasMore || !entries[0].isIntersecting) {
      return
    }
    emit('loadMore', props.page + 1)
  }
  const options: IntersectionObserverInit = {
    root: el.value.$el.parentElement?.parentElement,
    rootMargin: '0px 0px 0px 0px',
  }
  observer.value = new IntersectionObserver(callback, options)
  observer.value.observe(el.value.$el)
})

// 组件卸载成功，取消滚动监听
onUnmounted(() => {
  if (!el.value) {
    return
  }
  observer.value?.unobserve(el.value.$el)
})
</script>

<style lang="scss" scoped>
.el-select-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: initial;
  pointer-events: none;
  color: var(--el-color-info);

  &__icon {
    font-size: 16px;
    animation: rotate 1.5s linear infinite;
  }

  &__tips {
    margin-left: 6px;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
