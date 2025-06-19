<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { computed, inject, onUnmounted, ref, useTemplateRef } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { useStore } from 'vuex'
import 'vue-json-pretty/lib/styles.css'

const store = useStore()

const previewData = inject('previewData')
const previewLoading = inject('previewLoading')

const activeNode = computed(() => store.getters['dataflow/activeNode'])

const data = computed(() => {
  if (!activeNode.value || !previewData.value) return {}

  return previewData.value[activeNode.value.id]?.data || {}
})

const jsonRef = useTemplateRef('jsonRef')
const jsonHeight = ref()

const { stop } = useResizeObserver(jsonRef, (entries) => {
  for (const entry of entries) {
    jsonHeight.value = entry.contentRect.height
  }
})

onUnmounted(() => {
  stop()
})
</script>

<template>
  <div class="h-100 flex flex-column py-3">
    <div v-loading="previewLoading" class="flex-1">
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
  </div>
</template>
