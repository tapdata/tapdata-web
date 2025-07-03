<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import {
  computed,
  inject,
  onUnmounted,
  ref,
  useTemplateRef,
  type Ref,
} from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { useStore } from 'vuex'
import 'vue-json-pretty/lib/styles.css'

const store = useStore()

const previewData = inject<Ref<Record<string, { data: any }>>>('previewData')
const previewLoading = inject<Ref<boolean>>('previewLoading')
const handlePreview = inject<((id: string) => void) | undefined>(
  'handlePreview',
)

const activeNode = computed(() => store.getters['dataflow/activeNode'])

const data = computed(() => {
  if (!activeNode.value || !previewData?.value) return {}

  return previewData?.value[activeNode.value.id]?.data || {}
})

const jsonRef = useTemplateRef('jsonRef')
const jsonHeight = ref()

const { stop } = useResizeObserver(jsonRef, (entries) => {
  for (const entry of entries) {
    jsonHeight.value = entry.contentRect.height
  }
})

const preview = () => {
  if (!activeNode.value) return

  handlePreview?.(activeNode.value.id)
}

onUnmounted(() => {
  stop()
})
</script>

<template>
  <div v-loading="previewLoading" class="h-100 flex flex-column py-3">
    <div v-show="!!previewData" class="flex-1 json-pretty-wrapper">
      <VueJsonPretty
        ref="jsonRef"
        class="h-100"
        :data="data"
        :height="jsonHeight"
        virtual
        show-icon
        :show-line="false"
        selectable-type="multiple"
        :select-on-click-node="true"
      />
    </div>

    <el-empty v-if="!previewLoading && !previewData">
      <template #description>
        <el-button size="large" @click="preview">
          <VIcon class="mr-2" size="20">action-play</VIcon>
          {{ $t('public_data_preview') }}
        </el-button>
      </template>
    </el-empty>
  </div>
</template>

<style scoped lang="scss">
.json-pretty-wrapper {
  :deep(.vjs-tree-node.vjs-tree-node.vjs-tree-node) {
    border-radius: 4px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
