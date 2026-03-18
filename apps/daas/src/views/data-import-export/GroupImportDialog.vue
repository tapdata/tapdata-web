<script setup lang="ts">
import { importGroupInfoBatch, type ImportMode } from '@tap/api/core/group-info'
import { FileAddColorful, FileDocxColorful } from '@tap/component/src/icon'
import { t } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

const visible = defineModel<boolean>()
const emit = defineEmits(['success'])

// 表单数据
const importForm = ref({
  fileList: [] as any[],
  importMode: 'group_import' as ImportMode,
})

// 上传状态
const uploading = ref(false)

// 删除文件
const handleDelete = () => {
  importForm.value.fileList = []
}

// 关闭弹窗
const onClosed = () => {
  importForm.value.fileList = []
  importForm.value.importMode = 'group_import'
}

// 提交上传
const submitUpload = async () => {
  if (importForm.value.fileList?.length === 0) {
    ElMessage.error(t('data_import_export_select_file'))
    return
  }

  uploading.value = true

  try {
    const file = importForm.value.fileList[0].raw
    await importGroupInfoBatch(file, importForm.value.importMode)
    ElMessage.success(t('data_import_export_import_success'))
    emit('success')
    visible.value = false
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error(t('data_import_export_import_failed'))
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="600px"
    class="import-upload-dialog"
    :title="$t('data_import_export_import_group')"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <!-- 文件上传区域 -->
    <el-upload
      v-show="!importForm.fileList.length"
      v-model:file-list="importForm.fileList"
      drag
      accept=".tar"
      :auto-upload="false"
      :show-file-list="false"
    >
      <el-icon size="40"><FileAddColorful /></el-icon>
      <div
        class="el-upload__text mt-6"
        v-html="$t('packages_business_drag_file_here', { type: '.tar' })"
      />
    </el-upload>

    <!-- 已选文件显示 -->
    <div
      v-if="importForm.fileList.length"
      class="flex align-center gap-3 border rounded-xl p-3 lh-base hover:border-primary"
    >
      <el-icon size="32"><FileDocxColorful /></el-icon>
      <div>
        <div class="font-bold">
          {{ importForm.fileList[0].name }}
        </div>
        <div
          class="fs-8"
          :style="{ color: 'var(--el-text-color-placeholder)' }"
        >
          {{ calcUnit(importForm.fileList[0].size, 1) }}
        </div>
      </div>

      <el-button class="ml-auto flex-shrink-0" text @click="handleDelete">
        <template #icon>
          <el-icon><i-lucide-trash-2 /></el-icon>
        </template>
      </el-button>
    </div>

    <!-- 导入模式选择 -->
    <!-- <el-form :model="importForm" class="mt-6" label-position="top">
      <el-form-item prop="importMode" label="导入模式">
        <el-radio-group
          v-model="importForm.importMode"
          class="gap-2 import-mode-radio-group w-100"
        >
          <el-radio
            value="group_import"
            border
            class="h-auto px-3 py-2 rounded-xl bg-card w-100 m-0"
          >
            <div class="lh-5 mb-1">分组导入</div>
            <p class="lh-sm font-color-sslight fs-8 text-wrap">
              导入分组及其包含的所有资源
            </p>
          </el-radio>
          <el-radio
            value="replace"
            border
            class="h-auto px-3 py-2 rounded-xl bg-card w-100 m-0"
          >
            <div class="lh-5 mb-1">替换导入</div>
            <p class="lh-sm font-color-sslight fs-8 text-wrap">
              如果分组已存在，则替换现有分组及其资源
            </p>
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form> -->

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">
          {{ $t('public_button_cancel') }}
        </el-button>
        <el-button :loading="uploading" type="primary" @click="submitUpload">
          {{ $t('public_button_confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.import-upload-dialog {
  :deep(.import-mode-radio-group) {
    .el-radio__input {
      align-self: flex-start;
      margin-top: 3px;
    }
  }
}
</style>
