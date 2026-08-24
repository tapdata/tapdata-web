<script setup lang="ts">
import {
  confirmSsoUserImport,
  downloadSsoUserImportTemplate,
  validateSsoUserImport,
  type SsoImportPreviewResult,
  type SsoImportRowResult,
  type SsoUserImportMode,
} from '@tap/api/core/sso'
import { FileAddColorful, FileDocxColorful } from '@tap/component/src/icon'
import { t } from '@tap/i18n'
import { calcUnit, downloadBlob } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

const visible = defineModel<boolean>()
const emit = defineEmits(['success', 'update:modelValue'])

const fileList = ref<any[]>([])
const importMode = ref<SsoUserImportMode>('SKIP')

const downloading = ref(false)
const validating = ref(false)
const importing = ref(false)

// Dry-run preview result; null until the file has been validated.
const preview = ref<SsoImportPreviewResult | null>(null)
const previewFile = ref<File | null>(null)
const previewMode = ref<SsoUserImportMode | null>(null)
let validationRequestId = 0

const currentFile = computed(() => fileList.value[0]?.raw as File | undefined)

const statusType: Record<SsoImportRowResult['status'], string> = {
  CREATE: 'success',
  UPDATE: 'warning',
  SKIP: 'info',
  FAILED: 'danger',
}

const previewIsCurrent = computed(
  () =>
    !!preview.value &&
    previewFile.value === currentFile.value &&
    previewMode.value === importMode.value,
)

const invalidatePreview = () => {
  validationRequestId += 1
  preview.value = null
  previewFile.value = null
  previewMode.value = null
  validating.value = false
}

const handleFileChange = () => {
  invalidatePreview()
  validate()
}

const handleDelete = () => {
  fileList.value = []
  invalidatePreview()
}

const onClosed = () => {
  fileList.value = []
  importMode.value = 'SKIP'
  invalidatePreview()
}

const downloadTemplate = async () => {
  downloading.value = true
  try {
    const res = await downloadSsoUserImportTemplate()
    downloadBlob(res)
  } catch (error) {
    console.error('Download SSO user import template failed:', error)
    ElMessage.error(t('user_import_template_download_failed'))
  } finally {
    downloading.value = false
  }
}

const validate = async () => {
  const file = currentFile.value
  const mode = importMode.value
  const requestId = ++validationRequestId

  if (!file) {
    preview.value = null
    previewFile.value = null
    previewMode.value = null
    return
  }

  validating.value = true
  try {
    const result = await validateSsoUserImport(file, mode)
    if (
      requestId === validationRequestId &&
      file === currentFile.value &&
      mode === importMode.value
    ) {
      preview.value = result
      previewFile.value = file
      previewMode.value = mode
    }
  } catch (error) {
    console.error('Validate SSO user import failed:', error)
  } finally {
    if (requestId === validationRequestId) {
      validating.value = false
    }
  }
}

const confirmImport = async () => {
  const file = currentFile.value
  const mode = importMode.value
  if (!file || !previewIsCurrent.value || validating.value) {
    return
  }
  importing.value = true
  try {
    const result = await confirmSsoUserImport(file, mode)
    const failedCount = Number(result.failedCount ?? 0)
    preview.value = result
    previewFile.value = file
    previewMode.value = mode
    if (failedCount > 0) {
      ElMessage.warning(
        t('user_import_result_partial', {
          create: result.createCount,
          update: result.updateCount,
          skip: result.skipCount,
          failed: failedCount,
        }),
      )
      emit('success')
    } else {
      ElMessage.success(
        t('user_import_result_summary', {
          create: result.createCount,
          update: result.updateCount,
          skip: result.skipCount,
          failed: failedCount,
        }),
      )
      emit('success')
      importing.value = false
      visible.value = false
      emit('update:modelValue', false)
    }
  } catch (error) {
    console.error('Confirm SSO user import failed:', error)
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="720px"
    :title="$t('user_import_dialog_title')"
    :close-on-click-modal="false"
    :close-on-press-escape="!importing"
    :show-close="!importing"
    @closed="onClosed"
  >
    <div class="flex align-center justify-between mb-4">
      <span class="font-color-sslight fs-8">
        {{ $t('user_import_dialog_tip') }}
      </span>
      <el-button
        text
        type="primary"
        :loading="downloading"
        @click="downloadTemplate"
      >
        <template #icon>
          <el-icon><i-lucide-download /></el-icon>
        </template>
        {{ $t('user_import_download_template') }}
      </el-button>
    </div>

    <!-- File upload area -->
    <el-upload
      v-show="!fileList.length"
      v-model:file-list="fileList"
      drag
      accept=".xlsx"
      :auto-upload="false"
      :show-file-list="false"
      :disabled="importing"
      :on-change="handleFileChange"
    >
      <el-icon size="40"><FileAddColorful /></el-icon>
      <div
        class="el-upload__text mt-6"
        v-html="$t('packages_business_drag_file_here', { type: '.xlsx' })"
      />
    </el-upload>

    <!-- Selected file -->
    <div
      v-if="fileList.length"
      class="flex align-center gap-3 border rounded-xl p-3 lh-base hover:border-primary"
    >
      <el-icon size="32"><FileDocxColorful /></el-icon>
      <div>
        <div class="font-bold">{{ fileList[0].name }}</div>
        <div
          class="fs-8"
          :style="{ color: 'var(--el-text-color-placeholder)' }"
        >
          {{ calcUnit(fileList[0].size, 1) }}
        </div>
      </div>
      <el-button
        class="ml-auto flex-shrink-0"
        text
        :disabled="importing"
        @click="handleDelete"
      >
        <template #icon>
          <el-icon><i-lucide-trash-2 /></el-icon>
        </template>
      </el-button>
    </div>

    <!-- Import mode -->
    <el-form class="mt-4" label-position="top">
      <el-form-item :label="$t('user_import_mode')">
        <el-radio-group
          v-model="importMode"
          :disabled="importing"
          @change="handleFileChange"
        >
          <el-radio value="SKIP">{{ $t('user_import_mode_skip') }}</el-radio>
          <el-radio value="UPDATE">{{
            $t('user_import_mode_update')
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- Dry-run preview -->
    <template v-if="preview">
      <div class="flex align-center gap-2 flex-wrap mb-2">
        <span class="font-bold">{{ $t('user_import_preview_title') }}</span>
        <el-tag type="info">{{
          $t('user_import_count_total', { count: preview.total })
        }}</el-tag>
        <el-tag type="success">{{
          $t('user_import_count_create', { count: preview.createCount })
        }}</el-tag>
        <el-tag type="warning">{{
          $t('user_import_count_update', { count: preview.updateCount })
        }}</el-tag>
        <el-tag type="info">{{
          $t('user_import_count_skip', { count: preview.skipCount })
        }}</el-tag>
        <el-tag type="danger">{{
          $t('user_import_count_failed', { count: preview.failedCount })
        }}</el-tag>
      </div>
      <el-table :data="preview.rows" max-height="280" size="small" border>
        <el-table-column
          :label="$t('user_import_col_row')"
          prop="row"
          width="60"
        />
        <el-table-column
          :label="$t('user_form_email')"
          prop="email"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('user_list_user_name')"
          prop="username"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column :label="$t('user_import_col_status')" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]" size="small">
              {{ $t(`user_import_status_${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('user_import_col_message')"
          prop="message"
          min-width="160"
          show-overflow-tooltip
        />
      </el-table>
    </template>

    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="importing" @click="visible = false">
          {{ $t('public_button_cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="validating || importing"
          :disabled="!previewIsCurrent || validating || importing"
          @click="confirmImport"
        >
          {{
            importing
              ? $t('user_import_importing')
              : validating
                ? $t('user_import_validating')
                : $t('user_import_confirm')
          }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
