<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { ref } from 'vue'
import type { Encryption } from '@tap/api'

const props = defineProps<{
  rule?: Encryption
  btnType?: 'primary' | undefined
}>()

const { t } = useI18n()

const testText = ref('')
const testResult = ref()

const handleTest = () => {
  const { regex, outputChar } = props.rule || {}
  if (!regex || !testText.value) return

  try {
    const regexIns = new RegExp(regex, 'g')
    const matches = testText.value.match(regexIns) || []
    const result = testText.value.replace(regexIns, outputChar || '')

    testResult.value = {
      matches,
      result,
    }
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('public_regex_invalid'),
    )
  }
}

const reset = () => {
  testText.value = ''
  testResult.value = undefined
}

defineExpose({
  reset,
})
</script>

<template>
  <el-form-item label-position="top" :label="$t('public_test_text')">
    <el-input
      v-model="testText"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 6 }"
      :placeholder="$t('public_test_text_placeholder')"
    />
  </el-form-item>

  <el-button
    class="w-100 mb-4"
    :type="btnType"
    :disabled="!rule || !rule.regex || !testText"
    @click="handleTest"
    >{{ $t('public_execute_test') }}</el-button
  >

  <template v-if="testResult">
    <el-form-item
      label-position="top"
      :label="
        $t('public_matched_items', {
          val: testResult.matches.length,
        })
      "
    >
      <div
        class="w-100 bg-muted rounded-xl p-2 lh-5 overflow-y-auto"
        style="max-height: 200px"
      >
        <div v-if="testResult.matches.length" class="flex flex-column gap-2">
          <div
            v-for="(match, index) in testResult.matches"
            :key="index"
            style="border: 1px solid #f2f4f7"
            class="font-mono text-sm p-1 bg-white rounded-lg px-2"
          >
            {{ match }}
          </div>
        </div>

        <div v-else class="text-caption">
          {{ $t('public_no_matched_items') }}
        </div>
      </div>
    </el-form-item>
    <el-form-item label-position="top" :label="$t('public_replace_result')">
      <div
        class="w-100 bg-muted rounded-xl p-2 lh-5 text-prewrap overflow-auto"
        style="max-height: 200px"
      >
        {{ testResult.result }}
      </div>
    </el-form-item>
  </template>
</template>
