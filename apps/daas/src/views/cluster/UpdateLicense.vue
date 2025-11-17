<script lang="ts" setup>
import { updateNieBridgeLicense } from '@tap/api/src/core/cluster'
import { FileAddColorful, FileDocxColorful } from '@tap/component/src/icon'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { ref } from 'vue'

const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()
const visible = defineModel<boolean>()
const fileList = ref<any[]>([])
const loading = ref<boolean>(false)

const handleDelete = () => {
  fileList.value = []
}

const upload = async () => {
  try {
    loading.value = true
    await updateNieBridgeLicense(props.serviceId, fileList.value[0]!.raw)
    visible.value = false
    emit('success')
    ElMessage.success(t('cluster_update_license_success'))
  } catch (error) {
    console.error('Update license failed:', error)
  }
  loading.value = false
}

const onClose = () => {
  handleDelete()
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('license_renew_dialog')"
    width="500px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="mb-4">
      <el-upload
        v-show="!fileList.length"
        v-model:file-list="fileList"
        drag
        accept=".txt"
        :auto-upload="false"
        :show-file-list="false"
      >
        <el-icon size="40"><FileAddColorful /></el-icon>
        <div
          class="el-upload__text mt-6"
          v-html="$t('packages_business_drag_file_here', { type: '.txt' })"
        />
      </el-upload>
      <div
        v-if="fileList.length"
        class="flex align-center gap-3 border rounded-xl p-3 lh-base hover:border-primary"
      >
        <el-icon size="32"><FileDocxColorful /></el-icon>
        <div>
          <div class="font-bold">
            {{ fileList[0].name }}
          </div>
          <div
            class="fs-8"
            :style="{ color: 'var(--el-text-color-placeholder)' }"
          >
            {{ calcUnit(fileList[0].size, 1) }}
          </div>
        </div>

        <el-button class="ml-auto flex-shrink-0" text @click="handleDelete">
          <template #icon>
            <el-icon><i-lucide-trash-2 /></el-icon>
          </template>
        </el-button>
      </div>
    </div>

    <template #footer>
      <ElButton @click="visible = false">{{
        $t('public_button_cancel')
      }}</ElButton>
      <ElButton
        type="primary"
        :loading="loading"
        :disabled="!fileList.length"
        @click="upload"
        >{{ $t('public_event_update') }}</ElButton
      >
    </template>
  </ElDialog>
</template>
