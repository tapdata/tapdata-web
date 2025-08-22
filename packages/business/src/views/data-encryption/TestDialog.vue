<script setup lang="ts">
import { createEncryption, updateEncryption, type Encryption } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { reactive, ref, useTemplateRef } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  rule?: Encryption
}>()

const { t } = useI18n()

const title = ref('')
const testText = ref('')
const testResult = ref()

const handleOpen = () => {
  title.value = `${t('public_rule_test')} - ${props.rule?.name}`
  testText.value = ''
  testResult.value = undefined
}

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
</script>

<template>
  <el-dialog :title="title" width="600px" @open="handleOpen">
    <div
      v-if="rule"
      class="grid grid-cols-2 gap-4 bg-muted rounded-xl p-3 mb-4"
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
      type="primary"
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
  </el-dialog>
</template>
