<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { ref, useTemplateRef } from 'vue'
import TestContent from './TestContent.vue'
import type { Encryption } from '@tap/api'

const props = defineProps<{
  rule?: Encryption
}>()

const { t } = useI18n()

const title = ref('')
const testContentRef =
  useTemplateRef<InstanceType<typeof TestContent>>('testContentRef')

const handleOpen = () => {
  title.value = `${t('public_rule_test')} - ${props.rule?.name}`
}

const handleClosed = () => {
  testContentRef.value?.reset()
}
</script>

<template>
  <el-dialog
    :title="title"
    width="600px"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div
      v-if="rule"
      class="grid grid-cols-2 gap-4 bg-muted dark:bg-white/15 rounded-xl p-3 mb-4"
    >
      <div>
        <div class="fw-sub text-caption mb-1">{{ $t('public_regex') }}</div>
        <div>{{ rule.regex }}</div>
      </div>

      <div>
        <div class="fw-sub text-caption mb-1">
          {{ $t('public_replace_char') }}
        </div>
        <div>{{ rule.outputChar }}</div>
      </div>
    </div>

    <TestContent ref="testContentRef" :rule="rule" btn-type="primary" />
  </el-dialog>
</template>
