<script setup lang="ts">
import { taskApi } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { ref } from 'vue'

const emit = defineEmits<{
  success: any
}>()

const { t } = useI18n()
const dialogVisible = ref(false)

const form = ref<{
  id: string
  name: string
  desc: string
}>({
  id: '',
  name: '',
  desc: '',
})
const loading = ref(false)

const open = (task: any) => {
  if (!task) return
  form.value = {
    id: task.id,
    name: task.name,
    desc: task.desc,
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  loading.value = true
  await taskApi
    .updateInfo(form.value.id, form.value.name, form.value.desc)
    .finally(() => (loading.value = false))
  dialogVisible.value = false
  ElMessage.success(t('public_message_save_ok'))
  emit('success')
}

defineExpose({
  open,
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('packages_business_edit_task_info')"
    width="448px"
  >
    <el-form :model="form" label-position="top">
      <el-form-item :label="$t('public_task_name')">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item :label="$t('packages_dag_task_stetting_desc')">
        <el-input
          v-model="form.desc"
          type="textarea"
          :autosize="{ minRows: 2 }"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ $t('public_button_cancel') }}
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ $t('public_button_save') }}
      </el-button>
    </template>
  </el-dialog>
</template>
